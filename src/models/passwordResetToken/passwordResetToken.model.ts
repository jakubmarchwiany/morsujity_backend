import * as mongoose from "mongoose";

import PasswordResetToken from "./passwordResetToken.interface";
const Schema = mongoose.Schema;

let expireIn;
if (process.env.ENV == "development") {
    expireIn = parseInt(process.env.DEV_ResetPasswordToken_EXPIRE_AFTER!);
} else expireIn = parseInt(process.env.PRO_ResetPasswordToken_EXPIRE_AFTER!);

const passwordResetTokenSchema = new mongoose.Schema<PasswordResetToken>({
    expireIn: {
        type: Date,
        default: new Date(),
    },
    token: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

passwordResetTokenSchema.index({ expireIn: 1 }, { expireAfterSeconds: expireIn, name: "expireIn" });

const passwordResetTokenModel = mongoose.model<PasswordResetToken>(
    "passwordResetToken",
    passwordResetTokenSchema
);

export default passwordResetTokenModel;
