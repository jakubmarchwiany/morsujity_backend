import { model, Schema } from "mongoose";
import { IUser, UserModel, UserStatus, UserType } from "./user-interface";

const userSchema = new Schema<IUser, UserModel>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: UserStatus.ACTIVE },
    type: { type: String, default: UserType.USER },
    data: { type: Schema.Types.ObjectId, ref: "UserData" },
});

const User = model<IUser, UserModel>("User", userSchema);
export default User;
