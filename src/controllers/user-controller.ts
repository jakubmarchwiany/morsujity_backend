import { Response, Router } from "express";
import Controller from "../interfaces/controller-interface";
import RequestWithUser from "../interfaces/request-with-user-interface";
import authMiddleware from "../middleware/auth-middleware";
import HttpException from "../middleware/exceptions/http-exception";
import changePseudonymSchema, {
    ChangePseudonymData,
} from "../middleware/schemas/change-pseudonym-schema";
import deleteActivitySchema, {
    DeleteActivityData,
} from "../middleware/schemas/delete-activity-schema";
import newActivitySchema, { NewActivityData } from "../middleware/schemas/new-activity-schema";
import validate from "../middleware/validate-middleware";
import { IActivity } from "../models/user/statistic/activity-interface";
import User from "../models/user/user-model";
import catchError from "../utils/catch-error";
import GoogleBot from "../utils/google-bot";
import { rankDown, rankUp } from "../utils/rank-logic";

class UserController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly user = User;
    private readonly imageBot = new GoogleBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/data`, authMiddleware, catchError(this.getUserData));
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

    private readonly getUserData = async (req: RequestWithUser<never>, res: Response) => {
        const user = await this.user.findById(req.user._id, { password: 0 });
        res.send({ user, message: "Udało się autoryzować użytkownika" });
    };

    private readonly changeUserPseudonym = async (
        req: RequestWithUser<ChangePseudonymData>,
        res: Response
    ) => {
        const { pseudonym }: ChangePseudonymData = req.body;
        await this.user.findByIdAndUpdate(req.user._id, { pseudonym });
        res.send({ message: "Udało się zaktualizować ksywkę" });
    };

    private readonly changeUserImage = async (req: RequestWithUser<never>, res: Response) => {
        const fileName = await this.imageBot.saveNewUserImage(req.file);
        const user = await this.user.findById(req.user._id, { image: 1 });

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

    private readonly changeUserImageToDef = async (req: RequestWithUser<never>, res: Response) => {
        const user = await this.user.findById(req.user._id, { image: 1 });

        await this.imageBot.deleteUserImage(user.image);

        user.image = "def";
        await user.save();
        res.send({
            message: "Udało ustawić domyślne zdjęcie",
            image: user.image,
        });
    };

    private readonly newActivity = async (req: RequestWithUser<NewActivityData>, res: Response) => {
        const { isMors, duration, date } = req.body;
        const activity: IActivity = { isMors, duration, date };

        const user = await this.user.findById(req.user._id, { statistics: 1 });

        user.statistics.activity.push(activity);
        if (isMors) user.statistics.timeMorses += duration;
        else user.statistics.timeColdShowers += duration;

        const userRank = user.statistics.rank;
        const { timeColdShowers, timeMorses } = user.statistics;
        const sumTime = timeColdShowers + timeMorses;

        user.statistics.rank = rankUp(userRank, sumTime);
        await user.save();

        res.send({ message: "Udało się dodać aktywność", statistics: user.statistics });
    };

    private readonly deleteActivity = async (
        req: RequestWithUser<DeleteActivityData>,
        res: Response
    ) => {
        const { activityID } = req.body;

        const user = await this.user.findOne(
            { _id: req.user._id, "statistics.activity._id": activityID },
            {
                "statistics.activity.$": 1,
                "statistics.rank": 1,
                "statistics.timeColdShowers": 1,
                "statistics.timeMorses": 1,
            }
        );

        if (user === null) throw new HttpException(400, "Nie znaleziono aktywności o podanym ID");

        const { timeColdShowers, timeMorses } = user.statistics;
        const activity = user.statistics.activity[0];

        const sumTime = timeColdShowers + timeMorses;
        const userRank = rankDown(user.statistics.rank, sumTime - activity.duration);

        if (activity.isMors) {
            await this.user.updateOne(
                { _id: req.user._id },
                {
                    $pull: { "statistics.activity": { _id: activityID } },
                    $set: { "statistics.rank": userRank },
                    $inc: { "statistics.timeMorses": -activity.duration },
                }
            );
        } else {
            await this.user.updateOne(
                { _id: req.user._id },
                {
                    $pull: { "statistics.activity": { _id: activityID } },
                    $set: { "statistics.rank": userRank },
                    $inc: { "statistics.timeColdShowers": -activity.duration },
                }
            );
        }

        res.send({ message: "Udało się usunąć aktywność" });
    };
}
export default UserController;
