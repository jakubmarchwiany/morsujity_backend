import * as mongoose from "mongoose";

import User, { status, type } from "./user.interface";

let { DEF_USER_IMAGE } = process.env;

const userSchema = new mongoose.Schema<User>({
    email: String,
    password: String,
    status: { type: String, default: status.ACTIVE },
    type: { type: String, default: type.USER },
    pseudonym: String,
    image: { type: String, default: DEF_USER_IMAGE },
    createdIn: { type: Date, default: new Date() },
});

const userModel = mongoose.model<User>("User", userSchema);

export default userModel;
