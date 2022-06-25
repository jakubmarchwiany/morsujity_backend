import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as mongoose from "mongoose";
import * as cors from "cors";
import * as path from "path";

import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";

class Server {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(process.env.SERVER_PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.use(cors(corsOptions));
        this.app.use(express.static(path.join(__dirname, "build")));
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });

        this.app.get("*", function (req, res) {
            res.sendFile(path.join(__dirname, "build", "index.html"));
        });
    }

    private connectToTheDatabase() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH,MONGO_LOCAL_PATH } = process.env;

        // mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_PATH}`);
        mongoose.connect(`${MONGO_LOCAL_PATH}`);


        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", () => {
            console.log("Database connected");
        });
    }
}

const whitelist = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(",") : [];

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

export default Server;
