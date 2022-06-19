import * as mongoose from "mongoose";

import Account from "./account.interface";

const accountSchema = new mongoose.Schema({
    status: { type: String, default: "inactive" },
    userType: { type: String, default: "user" },
    email: String,
    password: String,
    pseudonym: String,
});

const accountModel = mongoose.model<Account & mongoose.Document>("Account", accountSchema);

export default accountModel;
