import { model, Schema } from "mongoose";
import { IAuthenticationToken } from "./authentication-token-interface";

const { AUTHENTICATION_TOKEN_EXPIRE_AFTER } = process.env;

const AuthenticationTokenSchema = new Schema<IAuthenticationToken>({
    token: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expireIn: { type: Date, default: new Date() },
});

AuthenticationTokenSchema.index(
    { expireIn: 1 },
    { expireAfterSeconds: parseInt(AUTHENTICATION_TOKEN_EXPIRE_AFTER), name: "expireIn" }
);

const AuthenticationToken = model<IAuthenticationToken>(
    "AuthenticationToken",
    AuthenticationTokenSchema
);
export default AuthenticationToken;
