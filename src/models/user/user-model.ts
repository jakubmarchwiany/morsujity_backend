import { model, Schema } from "mongoose";
import statisticsSchema from "./statistic/statistics-interface";
import { IUser, UserModel, UserStatus, UserType } from "./user-interface";

const { DEF_USER_IMAGE } = process.env;

const userSchema = new Schema<IUser, UserModel>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: UserStatus.ACTIVE },
    type: { type: String, default: UserType.USER },
    pseudonym: { type: String, required: true },
    image: { type: String, default: DEF_USER_IMAGE },
    statistics: { type: statisticsSchema, default: () => ({}) },
    createdIn: { type: Date, default: new Date() },
});

const User = model<IUser, UserModel>("User", userSchema);
export default User;
