import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Controller from "./interfaces/controller-interface";
import errorMiddleware from "./middleware/error-middleware";
import HttpException from "./middleware/exceptions/http-exception";

const { PORT, MONGO_URL, WHITELISTED_DOMAINS } = process.env;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fakeLoading = async function (req: Request, res: Response, next: NextFunction) {
    await sleep(500);
    next();
};

class Server {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        //this.app.use(fakeLoading);
        this.connectToTheDatabase();
        this.initializeCors();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private connectToTheDatabase() {
        mongoose
            .connect(MONGO_URL)
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
                if (WHITELISTED_DOMAINS.split(",").indexOf(origin) !== -1 || !origin) {
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
        this.app.listen(PORT, () => {
            console.log(`Server listening on the port ${PORT}`);
        });
    }
}
export default Server;
