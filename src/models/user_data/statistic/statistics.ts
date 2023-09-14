import { InferSchemaType, Schema } from "mongoose";
import { firstRank, firstSubRank } from "../../../controllers/user/activity/ranks.data";
import { rankSchema } from "./rank";

const statisticsSchema = new Schema(
    {
        rank: { type: rankSchema, default: firstRank, require: true },
        subRank: { type: rankSchema, default: firstSubRank, require: true },
        totalActivityTime: { type: [Number], default: [0, 0], require: true },
    },
    {
        _id: false,
    }
);
type Statistics = InferSchemaType<typeof statisticsSchema>;

export { Statistics, statisticsSchema };
