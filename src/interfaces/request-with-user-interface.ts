import { Request } from "express";
import { DataStoredInToken } from "models/tokens/authentication-token/authentication-token-interface";

interface RequestWithUser<T> extends Request {
    user?: DataStoredInToken;
    body: T;
}
export default RequestWithUser;
