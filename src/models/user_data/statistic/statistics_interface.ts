import { InferSchemaType, Schema } from "mongoose";
import { activitySchema } from "./activity_interface";
import { rankSchema } from "./rank_interface";
import { firstRank, firstSubRank } from "./ranks_data";

const statisticsSchema = new Schema(
    {
        rank: { type: rankSchema, default: firstRank, require: true },
        subRank: { type: rankSchema, default: firstSubRank, require: true },
        timeMorses: { type: Number, default: 0, require: true },
        timeColdShowers: { type: Number, default: 0, require: true },
        activity: { type: [activitySchema], default: [], require: true },
    },
    {
        _id: false,
    }
);

export type Statistics = InferSchemaType<typeof statisticsSchema>;
export default statisticsSchema;
