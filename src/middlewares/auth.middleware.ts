import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { AuthenticationTokenModel } from "../models/tokens/authentication_token/authentication_token";
import { DataStoredInToken } from "../models/tokens/authentication_token/authentication_token_interface";
import { ENV } from "../utils/validate_env";
import { AuthenticationTokenMissingException } from "./exceptions/authentication_token_missing.exception";
import { WrongAuthenticationTokenException } from "./exceptions/wrong_authentication_token.exception";

const { JWT_SECRET } = ENV;

export type ReqUser = { user: DataStoredInToken };

export function authMiddleware(
    request: Request & { user?: DataStoredInToken },
    response: Response,
    next: NextFunction
) {
    const bearerHeader = request.headers["authorization"];

    if (bearerHeader) {
        const bearer = bearerHeader.substring(7);
        try {
            verify(bearer, JWT_SECRET, async function (err, decoded) {
                if (err) {
                    next(new WrongAuthenticationTokenException());
                } else {
                    const isExist = await AuthenticationTokenModel.exists({ token: bearer });

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
