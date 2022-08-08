import * as express from "express";
import { Request, Response, NextFunction } from "express";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";

import Controller from "../interfaces/controller.interface";
import userModel from "../models/user/user.model";
import catchError from "../utils/catchError";
import ImageBot from "../utils/ImageBot";

let { ENV, DEF_USER_IMAGE_PATH, DEV_BACKEND_URL_ADDRESS, PRO_FRONT_URL_ADDRESS } = process.env;

let frontUrlAddress: string;
if (ENV == "development") frontUrlAddress = DEV_BACKEND_URL_ADDRESS!;
else frontUrlAddress = PRO_FRONT_URL_ADDRESS!;

class UserController implements Controller {
    public path = "/user";
    public router: any = express.Router();
    private user = userModel;
    private imageBot;

    constructor() {
        this.imageBot = new ImageBot();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/getData`, authMiddleware, catchError(this.getUserData));
        this.router.post(
            `/newImage`,
            authMiddleware,
            this.imageBot.upload.single("userImage"),
            catchError(this.newImage)
        );
    }

    private newImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        let fileName = await this.imageBot.saveNewUserImage(req.file);

        let user = await this.user.findById(req.user.id, { image: 1 });

        if (user!.image !== "def.webp") {
            this.imageBot.deleteUserImage(user!.image);
        }

        await this.user.findByIdAndUpdate(req.user.id, { image: fileName });

        res.send({ status: "success" });
    };

    private getUserData = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        let user = await this.user.findById(req.user.id, { password: 0 });
        user!.image = `${frontUrlAddress}/${DEF_USER_IMAGE_PATH}/${user!.image}`;
        res.send({ user: user });
    };
}

export default UserController;
