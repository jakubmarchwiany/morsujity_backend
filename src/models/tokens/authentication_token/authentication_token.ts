import { InferSchemaType, model, Schema } from "mongoose";
import { ENV } from "../../../utils/validate_env";

const { TOKEN_AUTHENTICATION_EXPIRE_AFTER: AUTHENTICATION_TOKEN_EXPIRE_AFTER } = ENV;

const AuthenticationTokenSchema = new Schema({
    token: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expireIn: { type: Date, default: new Date() },
});

AuthenticationTokenSchema.index(
    { expireIn: 1 },
    { expireAfterSeconds: AUTHENTICATION_TOKEN_EXPIRE_AFTER, name: "expireIn" }
);

type AuthenticationToken = InferSchemaType<typeof AuthenticationTokenSchema>;
const AuthenticationTokenModel = model("AuthenticationToken", AuthenticationTokenSchema);

export { AuthenticationToken, AuthenticationTokenModel };
