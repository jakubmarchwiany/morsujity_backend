import * as mongoose from "mongoose";

import TmpUser from "./tmpUser.interface";

const tmpUserSchema = new mongoose.Schema<TmpUser>({
    email: String,
    password: String,
    pseudonym: String,
    expireIn: { type: Date, default: new Date() },
});

if (process.env.ENV == "development")
    tmpUserSchema.index(
        { expireIn: 1 },
        { expireAfterSeconds: parseInt(process.env.DEV_ACCOUNT_EXPIRE_AFTER!), name: "expireIn" }
    );

if (process.env.ENV == "production")
    tmpUserSchema.index(
        { expireIn: 1 },
        { expireAfterSeconds: parseInt(process.env.PRO_ACCOUNT_EXPIRE_AFTER!), name: "expireIn" }
    );

const tmpUserModel = mongoose.model<TmpUser>("TmpUser", tmpUserSchema);

export default tmpUserModel;
