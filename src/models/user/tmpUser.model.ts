import * as mongoose from "mongoose";

import TmpUser from "./tmpUser.interface";

let expireIn;
if (process.env.ENV == "development") {
    expireIn = parseInt(process.env.DEV_USER_EXPIRE_AFTER!);
} else expireIn = parseInt(process.env.PRO_USER_EXPIRE_AFTER!);

const tmpUserSchema = new mongoose.Schema<TmpUser>({
    email: String,
    password: String,
    pseudonym: String,
    expireIn: { type: Date, default: new Date() },
});

tmpUserSchema.index({ expireIn: 1 }, { expireAfterSeconds: expireIn, name: "expireIn" });

const tmpUserModel = mongoose.model<TmpUser>("TmpUser", tmpUserSchema);

export default tmpUserModel;
