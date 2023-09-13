import { NextFunction, Request, Response } from "express";
import { ENV } from "../utils/env_validation";
import { HttpException } from "./exceptions/http.exception";

const { isDev } = ENV;

export function errorMiddleware(
    error: HttpException,
    _request: Request,
    response: Response,
    _next: NextFunction
) {
    let status: number, message: string;

    if (isDev) {
        status = error.status || 500;
        message = error.message || "Coś poszło nie tak";
    } else {
        status = error.status || 500;
        message = "Coś poszło nie tak";
    }

    response.status(status).send({
        message,
        status,
    });
}
