import { Request, Response, Router } from "express";
import { startSession } from "mongoose";
import { ReqUser, authMiddleware } from "../../../middlewares/auth.middleware";
import { HttpException } from "../../../middlewares/exceptions/http.exception";
import {
    DeleteActivityData,
    deleteActivitySchema,
} from "../../../middlewares/schemas/activity/delete_activity.schema";
import {
    CreateActivityData,
    createActivitySchema,
} from "../../../middlewares/schemas/activity/new_activity.schema";
import { validateMiddleware } from "../../../middlewares/validate.middleware";
import { ActivityModel } from "../../../models/user_data/activity";
import { Rank } from "../../../models/user_data/statistic/rank";
import { UserDataModel } from "../../../models/user_data/user_data";
import { catchError } from "../../../utils/catch_error";
import { Controller } from "../../controller.interface";
import { RANKS, SUB_RANKS } from "./ranks.data";

export class ActivityController implements Controller {
    public router = Router();
    public path = "/user/activity";

    private readonly userData = UserDataModel;
    private readonly activity = ActivityModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `/create`,
            validateMiddleware(createActivitySchema),
            authMiddleware,
            catchError(this.createActivityAndUpdateRank)
        );
        this.router.post(
            `/delete`,
            validateMiddleware(deleteActivitySchema),
            authMiddleware,
            catchError(this.deleteActivity)
        );
        this.router.get(`/allActivity`, authMiddleware, catchError(this.getAllActivity));
    }

    private readonly createActivityAndUpdateRank = async (
        req: Request<never, never, CreateActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { activityType, duration, date } = req.body;

        const resData = await this.userData.findById(req.user.dataId, {
            "statistics.totalActivityTime": 1,
        });

        const statistics = resData!.statistics;

        const { totalActivityTime } = statistics;

        totalActivityTime[activityType] += duration;

        const { rank, subRank } = this.calculateRankandSubRank(totalActivityTime);

        const session = await startSession();
        try {
            session.startTransaction();
            const activity = new this.activity({
                owner: req.user.userId,
                activityType,
                date,
                duration,
            });
            activity.save({ session });

            await this.userData.updateOne(
                { _id: req.user.dataId },
                {
                    $set: {
                        "statistics.rank": rank,
                        "statistics.subRank": subRank,
                        "statistics.totalActivityTime": totalActivityTime,
                    },
                },
                { session }
            );

            res.send({
                message: "Udało się dodać aktywności",
                data: { rank, subRank, activityId: activity._id },
            });
            await session.commitTransaction();
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            throw new HttpException(400, "Nie udało się dodać aktywności");
        } finally {
            await session.endSession();
        }
    };

    private readonly deleteActivity = async (
        req: Request<never, never, DeleteActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { activityID } = req.body;

        const activity = await this.activity.findById(activityID);

        if (activity) {
            const resData = await this.userData.findById(req.user.dataId, {
                "statistics.totalActivityTime": 1,
            });

            const statistics = resData!.statistics;

            const { totalActivityTime } = statistics;

            totalActivityTime[activity.activityType] -= activity.duration;

            const { rank, subRank } = this.calculateRankandSubRank(totalActivityTime);

            const session = await startSession();
            try {
                session.startTransaction();
                await this.activity.deleteOne({ _id: activityID }, { session });

                await this.userData.updateOne(
                    { _id: req.user.dataId },
                    {
                        $set: {
                            "statistics.rank": rank,
                            "statistics.subRank": subRank,
                            "statistics.totalActivityTime": totalActivityTime,
                        },
                    },
                    { session }
                );

                res.send({
                    message: "Udało się usunąć aktywności",
                    data: { rank, subRank },
                });
                await session.commitTransaction();
            } catch (error) {
                console.log(error);
                await session.abortTransaction();
                throw new HttpException(400, "Nie udało się dodać aktywności");
            } finally {
                await session.endSession();
            }
        } else {
            throw new HttpException(400, "Aktywność nie istnieje");
        }
    };

    private readonly calculateRankandSubRank = (
        totalTime: number[]
    ): { rank: Rank; subRank: Rank } => {
        const sumTime = totalTime[0] + totalTime[1];

        let rank = RANKS[0],
            subRank = SUB_RANKS[0];

        for (let i = 0; i < RANKS.length; i++) {
            if (sumTime < RANKS[i].maxValue) {
                rank = RANKS[i];
                break;
            }
        }

        for (let i = 0; i < SUB_RANKS.length; i++) {
            if (sumTime < SUB_RANKS[i].maxValue) {
                subRank = SUB_RANKS[i];
                break;
            }
        }

        return { rank, subRank };
    };

    private readonly getAllActivity = async (req: Request & ReqUser, res: Response) => {
        const userData = await this.userData
            .findById(req.user.dataId, {
                "statistics.activity": 1,
            })
            .lean();

        res.send({
            // data: userData!.statistics.activity,
            message: "Udało się pobrać wszystkie aktywności",
        });
    };
}
