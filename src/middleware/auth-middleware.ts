import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import RequestWithUser from "../interfaces/request-with-user-interface";
import AuthenticationToken from "../models/tokens/authentication-token/authentication-token";
import { DataStoredInToken } from "../models/tokens/authentication-token/authentication-token-interface";

import AuthenticationTokenMissingException from "./exceptions/authentication-token-missing-exception";
import WrongAuthenticationTokenException from "./exceptions/wrong-authentication-token-exception";

const { JWT_SECRET } = process.env;

function authMiddleware(request: RequestWithUser<never>, response: Response, next: NextFunction) {
    const bearerHeader = request.headers["authorization"];

    if (bearerHeader) {
        const bearer = bearerHeader.substring(7);
        try {
            jwt.verify(bearer, JWT_SECRET, async function (err, decoded) {
                if (err) {
                    next(new WrongAuthenticationTokenException());
                } else {
                    const isExist = await AuthenticationToken.exists({ token: bearer });

                    if (isExist) {
                        request.user = decoded as DataStoredInToken;
                        next();
                        return;
                    }

                    next(new WrongAuthenticationTokenException());
                }
            });
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new AuthenticationTokenMissingException());
    }
}
export default authMiddleware;
