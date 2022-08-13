import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import RequestWithUser from "../interfaces/requestWithUser.interface";
import DataStoredInToken from "../models/authenticationToken/dataStoredInToken.interface";

import AuthenticationTokenMissingException from "../middleware/exceptions/AuthenticationTokenMissingException";
import WrongAuthenticationTokenException from "../middleware/exceptions/WrongAuthenticationTokenException";

const { JWT_SECRET } = process.env;

function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        try {
            const verificationResponse = jwt.verify(
                cookies.Authorization,
                JWT_SECRET
            ) as DataStoredInToken;

            const user = { _id: verificationResponse._id, userType: verificationResponse.userType };

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
