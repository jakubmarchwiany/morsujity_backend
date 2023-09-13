import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { Controller } from "./controllers/controller.interface";
import { errorMiddleware } from "./middlewares/error.middleware";
import { HttpException } from "./middlewares/exceptions/http.exception";
import { fakeDelayMiddleware } from "./middlewares/fake_delay.middleware";
import { rateLimitMiddleware } from "./middlewares/rate_limit.middleware";
import { ENV } from "./utils/env_validation";

const { isDev, PORT, MONGO_URL, WHITELISTED_DOMAINS } = ENV;

export class Server {
    private app = express();

    constructor(controllers: Controller[]) {
        this.initMiddlewares();
        this.connectToTheDatabase();
        this.initControllers(controllers);
        this.initErrorMiddleware();
    }

    private connectToTheDatabase() {
        mongoose
            .connect(MONGO_URL)
            .then(() => {
                console.log("Connected to the database");
            })
            .catch((error) => {
                console.log("Error connecting to the database");
                console.log(error);
            });
    }

    private initializeCors() {
        const corsOptions: CorsOptions = {
            origin: function (origin, callback) {
                if (WHITELISTED_DOMAINS.split(",").indexOf(origin!) !== -1 || !origin) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
        };
        this.app.use(cors(corsOptions));
    }

    private initMiddlewares() {
        this.initializeCors();
        isDev && this.app.use(fakeDelayMiddleware);
        this.app.use(rateLimitMiddleware);
        this.app.use(bodyParser.json({ limit: "10mb" }));
        this.app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
        this.app.use(
            compression({
                threshold: 0,
            })
        );
        this.app.use(cookieParser());
    }

    private initErrorMiddleware() {
        this.app.use(errorMiddleware);
    }

    private initControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use(controller.path, controller.router);
        });
        this.app.use("*", (req: Request, res: Response) => {
            throw new HttpException(404, "Not found");
        });
    }

    public listen() {
        this.app.listen(PORT, () => {
            console.log(`Server listening on the port ${PORT}`);
        });
    }
}
