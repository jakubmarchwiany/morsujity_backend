import { InferSchemaType, model, Schema } from "mongoose";
import statisticsSchema from "./statistic/statistics_interface";

const { DEF_USER_IMAGE } = process.env;

const userDataSchema = new Schema({
    pseudonym: { type: String, required: true },
    image: { type: String, default: DEF_USER_IMAGE, required: true },
    statistics: { type: statisticsSchema, default: () => ({}), required: true },
    createdIn: { type: Date, default: new Date(), required: true },
});

export type UserData = InferSchemaType<typeof userDataSchema>;
const UserDataModel = model("UserData", userDataSchema);

export default UserDataModel;
