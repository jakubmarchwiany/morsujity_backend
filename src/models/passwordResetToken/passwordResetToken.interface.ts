import { Types } from "mongoose";

interface PasswordResetToken {
    expireIn?: Date;
    token: string;
    userId: Types.ObjectId;
}

export default PasswordResetToken;
