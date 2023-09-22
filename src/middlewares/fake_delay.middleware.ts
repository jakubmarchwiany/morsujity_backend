import { NextFunction, Request, Response } from "express";
import { sleep } from "../utils/sleep";

export const fakeDelayMiddleware = async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    await sleep(0);
    next();
};
