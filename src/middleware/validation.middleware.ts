import * as express from "express";

function validationMiddleware(): express.RequestHandler {
    return (req, res, next) => {
        //to do
        next();
    };
}

export default validationMiddleware;
