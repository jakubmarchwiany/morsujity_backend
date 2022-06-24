import * as mongoose from "mongoose";

import TmpHash from "./tmpHash.interface";
const Schema = mongoose.Schema;

const tmpHashSchema = new mongoose.Schema<TmpHash>({
    hash: String,
    accountRef: {
        type: Schema.Types.ObjectId,
        ref: "Account",
    },
});

const tmpHashModel = mongoose.model<TmpHash>("TmpHash", tmpHashSchema);

export default tmpHashModel;
