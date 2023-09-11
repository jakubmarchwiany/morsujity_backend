import { InferSchemaType, model, Schema } from "mongoose";
import { GroupPermission, GroupStatus } from "./group_interface";

const MemberSchema = new Schema({ name: String });

const groupSchema = new Schema({
    status: { type: String, default: GroupStatus.ACTIVE },
    name: { type: String },
    description: { type: String },
    coordinates: { type: [Number, Number] },
    requestsToJoin: [{ type: Schema.Types.ObjectId, ref: "UserData" }],
    members: [
        {
            _id: false,
            member: { type: Schema.Types.ObjectId, ref: "UserData" },
            permission: { type: String, default: GroupPermission.CASUAL },
        },
    ],
});

export type Group = InferSchemaType<typeof groupSchema>;

const GroupModel = model("Group", groupSchema);
export default GroupModel;
