import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import errorMiddleware from "./middleware/error.middleware";
import Controller from "./interfaces/controller.interface";
import HttpException from "./middleware/exceptions/HttpException";

const {
    NODE_ENV,
    DEV_MONGO_PATH,
    PRO_MONGO_USER,
    PRO_MONGO_PASSWORD,
    PRO_MONGO_PATH,
    DEV_WHITELISTED_DOMAINS,
    PRO_WHITELISTED_DOMAINS,
} = process.env;

let whitelist: any;
if (NODE_ENV == "development")
    whitelist = DEV_WHITELISTED_DOMAINS ? DEV_WHITELISTED_DOMAINS.split(",") : [];
if (NODE_ENV == "production")
    whitelist = PRO_WHITELISTED_DOMAINS ? PRO_WHITELISTED_DOMAINS.split(",") : [];

class Server {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeCors();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private connectToTheDatabase() {
        if (NODE_ENV == "development") mongoose.connect(`${DEV_MONGO_PATH}`);

        if (NODE_ENV == "production")
            mongoose.connect(
                `mongodb+srv://${PRO_MONGO_USER}:${PRO_MONGO_PASSWORD}@${PRO_MONGO_PATH}`
            );

        const db = mongoose.connection;
        db.on("error", () => {
            console.log("Database error connecting");
        });
        db.once("open", () => {
            console.log("Database connected");
        });
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
    }

    private initializeCors() {
        const corsOptions = {
            origin: function (origin: any, callback: any) {
                if (!origin || whitelist.indexOf(origin) !== -1) {
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
            this.app.use("/api" + controller.path, controller.router);
        });
        this.app.use("*", (req: Request, res: Response, next: NextFunction) => {
            next(new HttpException(404, "Not found"));
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    public listen() {
        this.app.listen(process.env.PORT || 8080, () => {
            console.log(`Server listening on the port ${process.env.PORT || 8080}`);
        });
    }
}

export default Server;
