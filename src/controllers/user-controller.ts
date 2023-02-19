import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller-interface";
import authMiddleware, { ReqUser } from "../middleware/auth-middleware";
import HttpException from "../middleware/exceptions/http-exception";
import changePseudonymSchema, {
    ChangePseudonymData,
} from "../middleware/schemas/change-pseudonym-schema";
import deleteActivitySchema, {
    DeleteActivityData,
} from "../middleware/schemas/delete-activity-schema";
import newActivitySchema, { NewActivityData } from "../middleware/schemas/new-activity-schema";
import validate from "../middleware/validate-middleware";
import { IActivity } from "../models/user-data/statistic/activity-interface";
import UserData from "../models/user-data/user-data-model";
import User from "../models/user/user-model";
import catchError from "../utils/catch-error";
import GoogleBot from "../utils/google-bot";
import { rankDown, rankUp } from "../utils/rank-logic";

class UserController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly user = User;
    private readonly userData = UserData;
    private readonly imageBot = new GoogleBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/data`, authMiddleware, catchError(this.getUserData));
        this.router.get(`/allActivity`, authMiddleware, catchError(this.getAllActivity));
        this.router.post(
            `/change-pseudonym`,
            validate(changePseudonymSchema),
            authMiddleware,
            catchError(this.changeUserPseudonym)
        );
        this.router.post(
            `/change-image`,
            authMiddleware,
            this.imageBot.multer.single("userImage"),
            catchError(this.changeUserImage)
        );
        this.router.get(
            `/change-user-image-to-def`,
            authMiddleware,
            catchError(this.changeUserImageToDef)
        );
        this.router.post(
            `/new-activity`,
            validate(newActivitySchema),
            authMiddleware,
            catchError(this.newActivity)
        );
        this.router.post(
            `/delete-activity`,
            validate(deleteActivitySchema),
            authMiddleware,
            catchError(this.deleteActivity)
        );
    }

    private readonly getUserData = async (req: Request & ReqUser, res: Response) => {
        const userData = await this.userData
            .findById(req.user.data, {
                "statistics.activity": { $slice: -5 },
            })
            .lean();
        res.send({ user: userData, message: "Udało się autoryzować użytkownika" });
    };
    private readonly getAllActivity = async (req: Request & ReqUser, res: Response) => {
        const userData = await this.userData
            .findById(req.user.data, {
                "statistics.activity": 1,
            })
            .lean();
        res.send({
            activity: userData.statistics.activity,
            message: "Udało się pobrać wszystkie aktywności",
        });
    };

    private readonly changeUserPseudonym = async (
        req: Request<never, never, ChangePseudonymData["body"]> & ReqUser,
        res: Response
    ) => {
        const { pseudonym } = req.body;
        await this.userData.findByIdAndUpdate(req.user.data, { pseudonym });
        res.send({ message: "Udało się zaktualizować ksywkę" });
    };

    private readonly changeUserImage = async (req: Request & ReqUser, res: Response) => {
        const fileName = await this.imageBot.saveNewUserImage(req.file);
        const user = await this.userData.findById(req.user.data, { image: 1 });

        if (user.image !== "def") {
            await this.imageBot.deleteUserImage(user.image);
        }
        user.image = fileName;
        await user.save();
        res.send({
            message: "Udało się zaktualizować zdjęcie",
            image: user.image,
        });
    };

    private readonly changeUserImageToDef = async (req: Request & ReqUser, res: Response) => {
        const user = await this.userData.findById(req.user.data, { image: 1 });

        if (user.image === "def")
            return res.send({ message: "Użytkownik ma już domyślne zdjęcie" });

        await this.imageBot.deleteUserImage(user.image);

        user.image = "def";
        await user.save();
        res.send({
            message: "Udało ustawić domyślne zdjęcie",
            image: user.image,
        });
    };

    private readonly newActivity = async (
        req: Request<never, never, NewActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { isMors, duration, date } = req.body;

        const s = await this.userData.findById(req.user.data, {
            "statistics.rank": 1,
            "statistics.subRank": 1,
            "statistics.timeMorses": 1,
            "statistics.timeColdShowers": 1,
            "statistics.activity": { $slice: 0 },
        });

        const statistics = s.statistics;
        const activity: IActivity = { isMors, duration, date };

        statistics.activity.push(activity);

        if (isMors) statistics.timeMorses += duration;
        else statistics.timeColdShowers += duration;

        const { timeColdShowers, timeMorses } = statistics;
        const sumTime = timeColdShowers + timeMorses;

        [statistics.rank, statistics.subRank] = rankUp(
            statistics.rank,
            statistics.subRank,
            sumTime
        );

        await s.save();

        const data = {
            rank: statistics.rank,
            subRank: statistics.subRank,
            timeColdShowers: s.statistics.timeColdShowers,
            timeMorses: s.statistics.timeMorses,
            activity: statistics.activity[0],
        };

        res.send({ message: "Udało się dodać aktywność", data });
    };

    private readonly deleteActivity = async (
        req: Request<never, never, DeleteActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { activityID } = req.body;

        const s = await this.userData.findOne(
            { _id: req.user.data, "statistics.activity._id": activityID },
            {
                "statistics.activity.$": 1,
                "statistics.rank": 1,
                "statistics.subRank": 1,
                "statistics.timeColdShowers": 1,
                "statistics.timeMorses": 1,
            }
        );

        if (s === null) throw new HttpException(400, "Nie znaleziono aktywności o podanym ID");

        const statistics = s.statistics;
        const activity = statistics.activity[0];

        if (activity.isMors) statistics.timeMorses -= activity.duration;
        else statistics.timeColdShowers -= activity.duration;

        const { timeColdShowers, timeMorses } = s.statistics;
        const sumTime = timeColdShowers + timeMorses;

        [statistics.rank, statistics.subRank] = rankDown(
            statistics.rank,
            statistics.subRank,
            sumTime
        );

        if (activity.isMors) {
            await this.userData.updateOne(
                { _id: req.user.data },
                {
                    $pull: { "statistics.activity": { _id: activityID } },
                    $set: {
                        "statistics.rank": statistics.rank,
                        "statistics.subRank": statistics.subRank,
                        "statistics.timeMorses": s.statistics.timeMorses,
                    },
                }
            );
        } else {
            await this.userData.updateOne(
                { _id: req.user.data },
                {
                    $pull: { "statistics.activity": { _id: activityID } },
                    $set: {
                        "statistics.rank": statistics.rank,
                        "statistics.subRank": statistics.subRank,
                        "statistics.timeColdShowers": s.statistics.timeColdShowers,
                    },
                }
            );
        }
        console.log(statistics.rank, statistics.subRank);
        const data = {
            rank: statistics.rank,
            subRank: statistics.subRank,
            timeColdShowers: s.statistics.timeColdShowers,
            timeMorses: s.statistics.timeMorses,
        };

        res.send({ message: "Udało się usunąć aktywność", data });
    };
}
export default UserController;
