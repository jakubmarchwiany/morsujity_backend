import { Request } from "express";
import User from "../models/user/user.interface";

interface RequestWithUser extends Request {
    user: {
        id: string;
        type: string;
    };
}

export default RequestWithUser;
