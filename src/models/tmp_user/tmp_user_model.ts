import { InferSchemaType, model, Schema } from "mongoose";

const { USER_EXPIRE_AFTER } = process.env;

const tmpUserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    pseudonym: { type: String, required: true },
    expireIn: { type: Date, default: new Date(), required: true },
});

tmpUserSchema.index(
    { expireIn: 1 },
    { expireAfterSeconds: parseInt(USER_EXPIRE_AFTER), name: "expireIn" }
);

export type AuthenticationToken = InferSchemaType<typeof tmpUserSchema>;

const TmpUserModel = model("TmpUser", tmpUserSchema);
export default TmpUserModel;
