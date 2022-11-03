import { model, Schema } from "mongoose";
import ITmpUser from "./tmp-user-interface";

const { USER_EXPIRE_AFTER } = process.env;

const tmpUserSchema = new Schema<ITmpUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    pseudonym: { type: String, required: true },
    expireIn: { type: Date, default: new Date() },
});

tmpUserSchema.index(
    { expireIn: 1 },
    { expireAfterSeconds: parseInt(USER_EXPIRE_AFTER), name: "expireIn" }
);

const TmpUser = model<ITmpUser>("TmpUser", tmpUserSchema);
export default TmpUser;
