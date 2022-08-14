import { Request } from "express";
import DataStoredInToken from "../models/authentication-token/data-stored-in-token-interface";

interface RequestWithUser extends Request {
    user?: DataStoredInToken;
}
export default RequestWithUser;
