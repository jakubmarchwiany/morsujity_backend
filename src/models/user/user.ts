import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";
import { UserStatus } from "./user_status.enum";
import { UserType } from "./user_type.enum";

const userSchema = new Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        status: { type: String, default: UserStatus.ACTIVE, required: true },
        type: { type: String, default: UserType.USER, required: true },
        data: { type: Schema.Types.ObjectId, ref: "UserData", required: true }
    },
    { _id: true }
);

type User = HydratedDocument<InferSchemaType<typeof userSchema>>;
const UserModel = model("User", userSchema);

export { User, UserModel };
