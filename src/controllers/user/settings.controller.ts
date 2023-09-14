import { Request, Response, Router } from "express";
import { startSession } from "mongoose";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import { HttpException } from "../../middlewares/exceptions/http.exception";
import {
    ChangePseudonymData,
    changePseudonymSchema,
} from "../../middlewares/schemas/user/change_pseudonym.schema";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { UserDataModel } from "../../models/user_data/user_data";
import { catchError } from "../../utils/catch_error";
import { GoogleBot } from "../../utils/google.bot";
import { ENV } from "../../utils/validate_env";
import { Controller } from "../controller.interface";

const { USER_IMAGE_URL, DEF_USER_IMAGE } = ENV;

export class SettingsController implements Controller {
    public router = Router();
    public path = "/user/settings";
    private readonly userData = UserDataModel;
    private readonly imageBot = new GoogleBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `/update-pseudonym`,
            validateMiddleware(changePseudonymSchema),
            authMiddleware,
            catchError(this.updateUserPseudonym)
        );
        this.router.post(
            `/update-image`,
            authMiddleware,
            this.imageBot.multer.single("userImage"),
            catchError(this.updateUserImage)
        );
        this.router.get(`/set-image-to-def`, authMiddleware, catchError(this.setUserImageToDef));
    }

    private readonly updateUserPseudonym = async (
        req: Request<never, never, ChangePseudonymData["body"]> & ReqUser,
        res: Response
    ) => {
        const { pseudonym } = req.body;

        const result = await this.userData.updateOne(
            { _id: req.user.data },
            { $set: { pseudonym: pseudonym } }
        );

        if (result.modifiedCount == 0) throw new HttpException(400, "Ta sama nazwa użytkownika");

        res.send({ message: "Udało się zaktualizować ksywkę" });
    };

    private readonly updateUserImage = async (
        req: Request & ReqUser & { file: Express.Multer.File },
        res: Response
    ) => {
        const session = await startSession();
        try {
            session.startTransaction();

            const fileName = await this.imageBot.saveNewUserImage(req.file);
            const userData = await this.userData.findById(req.user.data, { image: 1 });

            if (userData!.image !== DEF_USER_IMAGE) {
                await this.imageBot.deleteUserImage(userData!.image);
            }

            userData!.image = fileName;
            await userData!.save({ session });

            const imageUrl = USER_IMAGE_URL + userData?.image + ".webp";

            await session.commitTransaction();
            res.send({
                message: "Udało się zaktualizować zdjęcie",
                image: imageUrl,
            });
        } catch (error) {
            await session.abortTransaction();
            throw new HttpException(500, "Nie udało się zaktualizować zdjęcie");
        } finally {
            await session.endSession();
        }
    };

    private readonly setUserImageToDef = async (req: Request & ReqUser, res: Response) => {
        const session = await startSession();
        try {
            session.startTransaction();

            const userData = await this.userData.findById(req.user.data, { image: 1 });
            if (userData!.image === DEF_USER_IMAGE)
                return res.send({ message: "Użytkownik ma już domyślne zdjęcie" });

            await this.imageBot.deleteUserImage(userData!.image);

            userData!.image = DEF_USER_IMAGE;
            await userData!.save({ session });

            const imageUrl = USER_IMAGE_URL + userData?.image + ".webp";

            await session.commitTransaction();
            res.send({
                message: "Udało ustawić domyślne zdjęcie",
                image: imageUrl,
            });
        } catch (error) {
            await session.abortTransaction();
            throw new HttpException(400, "Nie udało się ustawić domyślnego zdjęcia");
        } finally {
            await session.endSession();
        }
    };
}
