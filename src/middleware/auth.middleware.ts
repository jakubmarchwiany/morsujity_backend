import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import AuthenticationTokenMissingException from "../middleware/exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../middleware/exceptions/WrongAuthenticationTokenException";
import DataStoredInToken from "../models/authenticationToken/dataStoredInToken.interface";

async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        const secret = process.env.JWT_SECRET;
        try {
            const verificationResponse = jwt.verify(
                cookies.Authorization,
                secret!
            ) as DataStoredInToken;

            const user = { id: verificationResponse._id, type: verificationResponse.userType };

            if (user) {
                request.user = user;
                next();
            } else {
                next(new WrongAuthenticationTokenException());
            }
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new AuthenticationTokenMissingException());
    }
}

export default authMiddleware;
