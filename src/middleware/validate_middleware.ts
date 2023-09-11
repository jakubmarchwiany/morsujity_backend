import { NextFunction, Request, Response } from "express";
import { Schema } from "yup";

import HttpException from "./exceptions/http_exception";

function validate(schema: Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
        schema
            .validate({
                body: req.body,
                query: req.query,
                params: req.params,
            })
            .then(() => {
                next();
            })
            .catch((error: Error) => {
                next(new HttpException(400, error.message));
            });
    };
}
export default validate;
