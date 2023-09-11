import { InferSchemaType, model, Schema } from "mongoose";

const { RESET_PASSWORD_TOKEN_EXPIRE_AFTER } = process.env;

const passwordResetTokenSchema = new Schema({
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

export type PasswordResetToken = InferSchemaType<typeof passwordResetTokenSchema>;

const PasswordResetTokenModel = model("PasswordResetToken", passwordResetTokenSchema);
export default PasswordResetTokenModel;
