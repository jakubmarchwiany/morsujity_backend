import { Request, Response, Router } from "express";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import {
    DeleteActivityData,
    deleteActivitySchema,
} from "../../middlewares/schemas/activity/delete_activity.schema";
import {
    NewActivityData,
    newActivitySchema,
} from "../../middlewares/schemas/activity/new_activity.schema";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { UserModel } from "../../models/user/user";
import { UserDataModel } from "../../models/user_data/user_data";
import { catchError } from "../../utils/catch_error";
import { GoogleBot } from "../../utils/google.bot";
import { Controller } from "../controller.interface";

export class ActivityController implements Controller {
    public router = Router();
    public path = "/user/activity";
    private readonly user = UserModel;
    private readonly userData = UserDataModel;
    private readonly imageBot = new GoogleBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `/create`,
            validateMiddleware(newActivitySchema),
            authMiddleware,
            catchError(this.createActivity)
        );
        this.router.post(
            `/delete`,
            validateMiddleware(deleteActivitySchema),
            authMiddleware,
            catchError(this.deleteActivity)
        );
        this.router.get(`/allActivity`, authMiddleware, catchError(this.getAllActivity));
    }

    private readonly createActivity = async (
        req: Request<never, never, NewActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { activityType, duration, date } = req.body;

        console.log(req.body);

        const resData = await this.userData.findById(req.user.data, {
            "statistics.rank": 1,
            "statistics.subRank": 1,
            "statistics.timeMorses": 1,
            "statistics.timeColdShowers": 1,
            "statistics.activity": { $slice: 0 },
        });

        let statistic = resData?.statistics;

        // const statistics = resData.statistics;
        // const activity: IActivity = { activityType, duration, date };

        // statistics.activity.push(activity);

        // statistics.

        // if (isMors) statistics.timeMorses += duration;
        // else statistics.timeColdShowers += duration;

        // const { timeColdShowers, timeMorses } = statistics;
        // const sumTime = timeColdShowers + timeMorses;

        // [statistics.rank, statistics.subRank] = rankUp(
        //     statistics.rank,
        //     statistics.subRank,
        //     sumTime
        // );

        // await s.save();

        // const data = {
        //     rank: statistics.rank,
        //     subRank: statistics.subRank,
        //     timeColdShowers: s.statistics.timeColdShowers,
        //     timeMorses: s.statistics.timeMorses,
        //     activity: statistics.activity[0],
        // };

        res.send({ message: "Udało się dodać aktywność" });
    };

    private readonly deleteActivity = async (
        req: Request<never, never, DeleteActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { activityID } = req.body;

        // const s = await this.userData.findOne(
        //     { _id: req.user.data, "statistics.activity._id": activityID },
        //     {
        //         "statistics.activity.$": 1,
        //         "statistics.rank": 1,
        //         "statistics.subRank": 1,
        //         "statistics.timeColdShowers": 1,
        //         "statistics.timeMorses": 1,
        //     }
        // );

        // if (s === null) throw new HttpException(400, "Nie znaleziono aktywności o podanym ID");

        // const statistics = s.statistics;
        // const activity = statistics.activity[0];

        // if (activity.isMors) statistics.timeMorses -= activity.duration;
        // else statistics.timeColdShowers -= activity.duration;

        // const { timeColdShowers, timeMorses } = s.statistics;
        // const sumTime = timeColdShowers + timeMorses;

        // [statistics.rank, statistics.subRank] = rankDown(
        //     statistics.rank,
        //     statistics.subRank,
        //     sumTime
        // );

        // if (activity.isMors) {
        //     await this.userData.updateOne(
        //         { _id: req.user.data },
        //         {
        //             $pull: { "statistics.activity": { _id: activityID } },
        //             $set: {
        //                 "statistics.rank": statistics.rank,
        //                 "statistics.subRank": statistics.subRank,
        //                 "statistics.timeMorses": s.statistics.timeMorses,
        //             },
        //         }
        //     );
        // } else {
        //     await this.userData.updateOne(
        //         { _id: req.user.data },
        //         {
        //             $pull: { "statistics.activity": { _id: activityID } },
        //             $set: {
        //                 "statistics.rank": statistics.rank,
        //                 "statistics.subRank": statistics.subRank,
        //                 "statistics.timeColdShowers": s.statistics.timeColdShowers,
        //             },
        //         }
        //     );
        // }
        // console.log(statistics.rank, statistics.subRank);
        // const data = {
        //     rank: statistics.rank,
        //     subRank: statistics.subRank,
        //     timeColdShowers: s.statistics.timeColdShowers,
        //     timeMorses: s.statistics.timeMorses,
        // };

        // res.send({ message: "Udało się usunąć aktywność", data });
    };

    private readonly getAllActivity = async (req: Request & ReqUser, res: Response) => {
        const userData = await this.userData
            .findById(req.user.data, {
                "statistics.activity": 1,
            })
            .lean();

        res.send({
            data: userData!.statistics.activity,
            message: "Udało się pobrać wszystkie aktywności",
        });
    };
}
