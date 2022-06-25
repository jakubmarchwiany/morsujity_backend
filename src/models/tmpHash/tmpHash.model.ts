import * as mongoose from "mongoose";

import TmpHash from "./tmpHash.interface";
const Schema = mongoose.Schema;

const tmpHashSchema = new mongoose.Schema<TmpHash>({
    expireIn: {
        type: Date,
        default: new Date(),
    },
    hash: String,
    accountRef: {
        type: Schema.Types.ObjectId,
        ref: "Account",
    },
});

if (process.env.ENV == "development")
    tmpHashSchema.index(
        { expireIn: 1 },
        { expireAfterSeconds: parseInt(process.env.DEV_ACCOUNT_EXPIRE_AFTER!),name: "expireIn" }
    );

if (process.env.ENV == "production")
    tmpHashSchema.index(
        { expireIn: 1 },
        { expireAfterSeconds: parseInt(process.env.PRO_ACCOUNT_EXPIRE_AFTER!),name: "expireIn" }
    );

const tmpHashModel = mongoose.model<TmpHash>("TmpHash", tmpHashSchema);

export default tmpHashModel;
