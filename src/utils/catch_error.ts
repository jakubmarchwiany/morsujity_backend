/* eslint-disable @typescript-eslint/ban-types */
import { NextFunction, Request, Response } from "express";

export const catchError = (func: Function) => (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch((error: Error) => {
        next(error);
    });
};
