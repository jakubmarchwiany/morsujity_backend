import { model, Schema } from "mongoose";
import IPasswordResetToken from "./password-reset-token-interface";

const { NODE_ENV, DEV_RESET_PASSWORD_TOKEN_EXPIRE_AFTER, PRO_RESET_PASSWORD_TOKEN_EXPIRE_AFTER } =
    process.env;

const expireIn =
    NODE_ENV === "development"
        ? parseInt(DEV_RESET_PASSWORD_TOKEN_EXPIRE_AFTER)
        : parseInt(PRO_RESET_PASSWORD_TOKEN_EXPIRE_AFTER);

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
    expireIn: {
        type: Date,
        default: new Date(),
    },
    token: { type: String, required: true },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

passwordResetTokenSchema.index({ expireIn: 1 }, { expireAfterSeconds: expireIn, name: "expireIn" });

const PasswordResetToken = model<IPasswordResetToken>(
    "PasswordResetToken",
    passwordResetTokenSchema,
);
export default PasswordResetToken;
