import { InferSchemaType, model, Schema } from "mongoose";
import { ENV } from "../../../utils/validate_env";

const { TOKEN_RESET_PASSWORD_EXPIRE_AFTER: RESET_PASSWORD_TOKEN_EXPIRE_AFTER } = ENV;

const passwordResetTokenSchema = new Schema({
    expireIn: {
        type: Date,
        default: new Date()
    },
    token: { type: String, required: true },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

passwordResetTokenSchema.index(
    { expireIn: 1 },
    {
        expireAfterSeconds: RESET_PASSWORD_TOKEN_EXPIRE_AFTER,
        name: "expireIn"
    }
);

type PasswordResetToken = InferSchemaType<typeof passwordResetTokenSchema>;
const PasswordResetTokenModel = model("PasswordResetToken", passwordResetTokenSchema);

export { PasswordResetToken, PasswordResetTokenModel };
