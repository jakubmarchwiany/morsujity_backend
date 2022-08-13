import { model, Schema } from "mongoose";

import ITmpUser from "./tmpUser.interface";

const { NODE_ENV, DEV_USER_EXPIRE_AFTER, PRO_USER_EXPIRE_AFTER } = process.env;

let expireIn;
if (NODE_ENV == "development") expireIn = parseInt(DEV_USER_EXPIRE_AFTER);
if (NODE_ENV == "production") expireIn = parseInt(PRO_USER_EXPIRE_AFTER);

const tmpUserSchema = new Schema<ITmpUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    pseudonym: { type: String, required: true },
    expireIn: { type: Date, default: new Date() },
});

tmpUserSchema.index({ expireIn: 1 }, { expireAfterSeconds: expireIn, name: "expireIn" });

const TmpUser = model<ITmpUser>("TmpUser", tmpUserSchema);
export default TmpUser;
