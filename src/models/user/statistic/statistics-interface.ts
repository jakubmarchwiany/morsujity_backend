import { Schema } from "mongoose";
import { activitySchema, IActivity } from "./activity-interface";
import { IRank, rankSchema } from "./rank-interface";
import { firstRank } from "./ranks-data";

export interface IStatisticsMethods {
    newActivity: () => void;
    deleteActivity: () => void;
}

export interface IStatistics {
    rank: IRank;
    timeMorses: number;
    timeColdShowers: number;
    activity: [IActivity];
}

const statisticsSchema = new Schema<IStatistics, IStatisticsMethods>(
    {
        rank: { type: rankSchema, default: firstRank },
        timeMorses: { type: Number, default: 0 },
        timeColdShowers: { type: Number, default: 0 },
        activity: [activitySchema],
    },
    { _id: false },
);

statisticsSchema.methods.newActivity = function (activity: IActivity, isMors: boolean) {
    if (isMors) {
        this.morses.push(activity);
        this.totalTimeOfMorses += activity.duration;
    } else {
        this.coldShowers.push(activity);
        this.totalTimeOfColdShowers += activity.duration;
    }
};

statisticsSchema.methods.deleteActivity = function (
    activityID: string,
    activity: IActivity,
    isMors: boolean,
) {
    if (isMors) {
        if (this.morses.id(activityID)) {
            this.morses.pull({ _id: activityID });
            this.totalTimeOfMorses += activity.duration;
        }
    } else {
        if (this.coldShowers.id(activityID)) {
            this.coldShowers.push(activity);
            this.totalTimeOfColdShowers += activity.duration;
        }
    }
};

export default statisticsSchema;
