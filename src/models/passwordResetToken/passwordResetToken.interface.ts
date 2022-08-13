import { Types } from "mongoose";

interface IPasswordResetToken {
    expireIn?: Date;
    token: string;
    userId: Types.ObjectId;
}

export default IPasswordResetToken;
