import * as express from "express";
import { Request, Response, NextFunction } from "express";

import Controller from "../interfaces/controller.interface";

class UserController implements Controller {
    public path = "/user";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.test);
    }

    private test = async (req: Request, res: Response, next: NextFunction) => {
        res.send({ status: "success" });
    };
}

export default UserController;
