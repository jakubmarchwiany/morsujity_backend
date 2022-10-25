import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Controller from "./interfaces/controller-interface";
import errorMiddleware from "./middleware/error-middleware";
import HttpException from "./middleware/exceptions/http-exception";

const {
    NODE_ENV,
    DEV_MONGO_PATH,
    PRO_MONGO_PATH,
    DEV_WHITELISTED_DOMAINS,
    PRO_WHITELISTED_DOMAINS,
} = process.env;

const MONGO_PATH = NODE_ENV === "development" ? DEV_MONGO_PATH : PRO_MONGO_PATH;

import fs from "fs";
import http from "http";
import https from "https";

const WHITELIST = (() => {
    if (NODE_ENV === "development") {
        return DEV_WHITELISTED_DOMAINS ? DEV_WHITELISTED_DOMAINS.split(",") : [];
    } else {
        return PRO_WHITELISTED_DOMAINS ? PRO_WHITELISTED_DOMAINS.split(",") : [];
    }
})();

class Server {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.connectToTheDatabase();
        this.initializeCors();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private connectToTheDatabase() {
        mongoose
            .connect(MONGO_PATH)
            .then(() => {
                console.log("Connected to the database");
            })
            .catch(() => {
                console.log("Error connecting to the database");
            });
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json({ limit: "10mb" }));
        this.app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
        this.app.use(cookieParser());
    }

    private initializeCors() {
        const corsOptions: CorsOptions = {
            origin: function (origin, callback) {
                if (WHITELIST.indexOf(origin) !== -1 || !origin) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
        };
        this.app.use(cors(corsOptions));
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use(controller.path, controller.router);
        });
        this.app.use("*", (req: Request, res: Response, next: NextFunction) => {
            next(new HttpException(404, "Not found"));
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    public listen() {
        if (NODE_ENV === "development") {
            http.createServer(this.app).listen(8080, function () {
                console.log("Example app listening on port 8000!");
            });
        } else {
            http.createServer(this.app).listen(8000, function () {
                console.log("Example app listening on port 8000!");
            });
            https
                .createServer(
                    {
                        ca: fs.readFileSync("ca_bundle.crt"),
                        key: fs.readFileSync("private.key"),
                        cert: fs.readFileSync("certificate.crt"),
                    },
                    this.app,
                )
                .listen(8443, function () {
                    console.log("Example app listening on port 8443!");
                });
        }
    }
}
export default Server;
