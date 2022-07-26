import * as mongoose from "mongoose";

import User, { status, type } from "./user.interface";

const userSchema = new mongoose.Schema<User>({
    email: String,
    password: String,
    status: { type: String, default: status.ACTIVE },
    type: { type: String, default: type.USER },
    pseudonym: String,
    createdIn: { type: Date, default: new Date() },
});

const userModel = mongoose.model<User>("User", userSchema);

export default userModel;
