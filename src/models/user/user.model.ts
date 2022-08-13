import { model, Schema } from "mongoose";

import { IUser, IUserMethods, UserModel, UserStatus, UserType } from "./user.interface";

const { DEF_USER_IMAGE, DEF_USER_IMAGE_PATH } = process.env;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: UserStatus.ACTIVE },
    type: { type: String, default: UserType.USER },
    pseudonym: { type: String, required: true },
    image: { type: String, default: DEF_USER_IMAGE },
    createdIn: { type: Date, default: new Date() },
});

userSchema.method("imageURL", function imageURL(this: IUser) {
    return `${DEF_USER_IMAGE_PATH}/${this.image}.webp`;
});

const User = model<IUser, UserModel>("User", userSchema);
export default User;
