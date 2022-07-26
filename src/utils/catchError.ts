import { Request, Response, NextFunction } from "express";
import HttpException from "../middleware/exceptions/HttpException";

const catchError = (func: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res, next).catch((error: any) => next(error));
    };
};

export default catchError;
