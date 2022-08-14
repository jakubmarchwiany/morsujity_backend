import { NextFunction, Request, RequestHandler, Response } from "express";
import yup from "yup";

import HttpException from "./exceptions/http-exception";

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
            return next(new HttpException(400, err.message));
        }
    };
}
export default validate;
