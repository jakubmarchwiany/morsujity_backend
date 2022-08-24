import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import RequestWithUser from "../interfaces/request-with-user-interface";
import DataStoredInToken from "../models/authentication-token/data-stored-in-token-interface";

import AuthenticationTokenMissingException from "./exceptions/authentication-token-missing-exception";
import WrongAuthenticationTokenException from "./exceptions/wrong-authentication-token-exception";

const { JWT_SECRET } = process.env;

function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
    const cookies = request.cookies;
    if (cookies && cookies.Authorization) {
        try {
            const verificationResponse = jwt.verify(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                cookies.Authorization,
                JWT_SECRET,
            ) as DataStoredInToken;

            const user = {
                _id: verificationResponse._id,
                userType: verificationResponse.userType,
            };

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
