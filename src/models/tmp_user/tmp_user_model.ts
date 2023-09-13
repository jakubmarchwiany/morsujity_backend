import { InferSchemaType, model, Schema } from "mongoose";
import { ENV } from "../../utils/env_validation";

const { USER_EXPIRE_AFTER } = ENV;

const tmpUserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    pseudonym: { type: String, required: true },
    expireIn: { type: Date, default: new Date(), required: true },
});

tmpUserSchema.index({ expireIn: 1 }, { expireAfterSeconds: USER_EXPIRE_AFTER, name: "expireIn" });

type AuthenticationToken = InferSchemaType<typeof tmpUserSchema>;
const TmpUserModel = model("TmpUser", tmpUserSchema);

export { AuthenticationToken, TmpUserModel };
