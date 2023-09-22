import { InferSchemaType, model, Schema } from "mongoose";
import { GroupStatus } from "./group_status.enum";
import { memberSchema } from "./member";

const groupSchema = new Schema({
    status: { type: Number, default: GroupStatus.ACTIVE, require: true },
    type: { type: Number, require: true },
    name: { type: String, require: true },
    description: { type: String, require: true },
    coordinates: { type: [Number, Number], require: true },
    requestsToJoin: [{ type: Schema.Types.ObjectId, ref: "UserData" }],
    members: [memberSchema]
});

type Group = InferSchemaType<typeof groupSchema>;
const GroupModel = model("Group", groupSchema);

export { Group, GroupModel };
