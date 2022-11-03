import { model, Schema } from "mongoose";
import IPasswordResetToken from "./password-reset-token-interface";

const { RESET_PASSWORD_TOKEN_EXPIRE_AFTER } = process.env;

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

passwordResetTokenSchema.index(
    { expireIn: 1 },
    {
        expireAfterSeconds: parseInt(RESET_PASSWORD_TOKEN_EXPIRE_AFTER),
        name: "expireIn",
    }
);

const PasswordResetToken = model<IPasswordResetToken>(
    "PasswordResetToken",
    passwordResetTokenSchema
);
export default PasswordResetToken;
