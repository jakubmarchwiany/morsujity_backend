import { NextFunction, Request, RequestHandler, Response } from "express";
import * as yup from "yup";
import HttpException from "./exceptions/HttpException";

function validate(schema: yup.AnySchema): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validate({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (err: any) {
            return next(new HttpException(500, err.message));
        }
    };
}
export default validate;
