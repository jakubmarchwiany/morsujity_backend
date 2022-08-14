import { NextFunction, Response, Router } from "express";

import authMiddleware from "../middleware/auth-middleware";
import validate from "../middleware/validate-middleware";

import catchError from "../utils/catch-error";
import ImageBot from "../utils/image-bot";

import User from "../models/user/user-model";

import RequestWithUser from "../interfaces/request-with-user-interface";
import Controller from "../interfaces/controller-interface";

import changePseudonymSchema, {
    ChangePseudonymData,
} from "../middleware/schemas/change-pseudonym-schema";

import HttpException from "../middleware/exceptions/http-exception";

class UserController implements Controller {
    public router = Router();
    public path = "/user";
    private user = User;
    private imageBot = new ImageBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/get-data`, authMiddleware, catchError(this.getUserData));
        this.router.post(
            `/change-pseudonym`,
            validate(changePseudonymSchema),
            authMiddleware,
            catchError(this.changeUserPseudonym)
        );
        this.router.post(
            `/change-image`,
            authMiddleware,
            this.imageBot.multer.single("userImage"),
            catchError(this.changeImage)
        );
    }

    private getUserData = async (req: RequestWithUser, res: Response) => {
        let user = await this.user.findById(req.user._id, { password: 0 });
        user.image = user.imageURL();
        res.send({ user });
    };

    private changeUserPseudonym = async (req: RequestWithUser, res: Response) => {
        const { pseudonym }: ChangePseudonymData = req.body;
        await this.user.findByIdAndUpdate(req.user._id, { pseudonym });
        res.send({ message: "Udało się zaktualizować ksywkę" });
    };

    private changeImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const fileName = await this.imageBot.saveNewUserImage(req.file);
            let user = await this.user.findById(req.user._id, { image: 1 });
            if (user.image !== "def") {
                await this.imageBot.deleteUserImage(user.image + ".webp");
            }
            user.image = fileName;
            await user.save();
            res.send({ message: "Udało się zaktualizować zdjęcie" });
        } catch (error: any) {
            next(new HttpException(500, error.message));
        }
    };
}
export default UserController;
