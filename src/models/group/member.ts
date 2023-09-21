import { InferSchemaType, Schema } from "mongoose";
import { firstRank, firstSubRank } from "../../controllers/user/activity/ranks.data";
import { rankSchema } from "../user_data/statistic/rank";
import { GroupPermission } from "./group_permission.enum";

const memberSchema = new Schema(
    {
        member: { type: Schema.Types.ObjectId, ref: "UserData" },
        rank: { type: rankSchema, default: firstRank, require: true },
        subRank: { type: rankSchema, default: firstSubRank, require: true },
        totalActivityTime: { type: Number, default: 0, require: true },
        permission: { type: Number, default: GroupPermission.NORMAL, require: true },
    },
    { _id: false }
);
type Member = InferSchemaType<typeof memberSchema>;
export { Member, memberSchema };
