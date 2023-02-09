import { model, Schema } from "mongoose";
import statisticsSchema from "./statistic/statistics-interface";
import { IUserData, UserDataModel } from "./user-data-interface";

const { DEF_USER_IMAGE } = process.env;

const userDataSchema = new Schema<IUserData, UserDataModel>({
    pseudonym: { type: String, required: true },
    image: { type: String, default: DEF_USER_IMAGE },
    statistics: { type: statisticsSchema, default: () => ({}) },
    createdIn: { type: Date, default: new Date() },
});

const UserData = model<IUserData, UserDataModel>("UserData", userDataSchema);
export default UserData;
