import { Request } from "express";
import DataStoredInToken from "../models/authenticationToken/dataStoredInToken.interface";

interface RequestWithUser extends Request {
    user?: DataStoredInToken;
}
export default RequestWithUser;
