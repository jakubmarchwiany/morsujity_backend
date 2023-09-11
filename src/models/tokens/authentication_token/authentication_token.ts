import { InferSchemaType, model, Schema } from "mongoose";

const { AUTHENTICATION_TOKEN_EXPIRE_AFTER } = process.env;

const AuthenticationTokenSchema = new Schema({
    token: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expireIn: { type: Date, default: new Date() },
});

AuthenticationTokenSchema.index(
    { expireIn: 1 },
    { expireAfterSeconds: parseInt(AUTHENTICATION_TOKEN_EXPIRE_AFTER), name: "expireIn" }
);

export type AuthenticationToken = InferSchemaType<typeof AuthenticationTokenSchema>;

const AuthenticationTokenModel = model("AuthenticationToken", AuthenticationTokenSchema);
export default AuthenticationTokenModel;
