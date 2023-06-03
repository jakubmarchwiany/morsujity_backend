import { model, Schema } from "mongoose";
import { GroupModel, GroupPermission, GroupStatus, IGroup, IGroupMember } from "./group_interface";

const MemberSchema = new Schema({ name: String });

const groupSchema = new Schema<IGroup, GroupModel>({
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

const Group = model<IGroup, GroupModel>("Group", groupSchema);
export default Group;
