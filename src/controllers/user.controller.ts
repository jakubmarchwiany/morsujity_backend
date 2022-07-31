import * as express from "express";
import { Request, Response, NextFunction } from "express";

import Controller from "../interfaces/controller.interface";
import ImageBot from "../utils/ImageBot";

class UserController implements Controller {
    public path = "/user";
    private imageBot;

    constructor() {
        this.imageBot = new ImageBot();
        this.initializeRoutes();
    }

    private initializeRoutes() {
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
}

export default UserController;
