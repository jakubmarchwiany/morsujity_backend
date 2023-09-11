/* eslint-disable @typescript-eslint/ban-types */
import { NextFunction, Request, Response } from "express";

const catchError = (func: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res, next).catch((error: Error) => {
            next(error);
        });
    };
};
export default catchError;
