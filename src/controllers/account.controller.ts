import * as express from "express";
import { Request, Response, NextFunction } from "express";

import Controller from "../interfaces/controller.interface";

import accountModel from "../models/account/account.model";

class PostsController implements Controller {
    public path = "/account";
    public router = express.Router();
    private account = accountModel;

    constructor() {
        this.initializeRoutes();
    }

    // .all(`${this.path}/*`, authMiddleware)
    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.registerAccount);
        this.router.get(`${this.path}/login`, this.loginAccount);
    }

    private registerAccount = async (req: Request, res: Response) => {
        res.send({ status: "success" });
    };

    private loginAccount = async (req: Request, res: Response, next: NextFunction) => {
        res.send({ status: "success" });
    };
}

export default PostsController;
