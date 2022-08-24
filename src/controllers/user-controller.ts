import { Response, Router } from "express";
import Controller from "../interfaces/controller-interface";
import RequestWithUser from "../interfaces/request-with-user-interface";
import authMiddleware from "../middleware/auth-middleware";
import changePseudonymSchema, {
    ChangePseudonymData,
} from "../middleware/schemas/change-pseudonym-schema";
import validate from "../middleware/validate-middleware";
import User from "../models/user/user-model";
import catchError from "../utils/catch-error";
import ImageBot from "../utils/image-bot";

class UserController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly user = User;
    private readonly imageBot = new ImageBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/get-data`, authMiddleware, catchError(this.getUserData));
        this.router.post(
            `/change-pseudonym`,
            validate(changePseudonymSchema),
            authMiddleware,
            catchError(this.changeUserPseudonym),
        );
        this.router.post(
            `/change-image`,
            authMiddleware,
            this.imageBot.multer.single("userImage"),
            catchError(this.changeUserImage),
        );
        this.router.get(
            `/change-user-image-to-def`,
            authMiddleware,
            catchError(this.changeUserImageToDef),
        );
    }

    private readonly getUserData = async (req: RequestWithUser, res: Response) => {
        const user = await this.user.findById(req.user._id, { password: 0 });
        user.image = user.imageURL();
        res.send({ user, message: "Udało się autoryzować użytkownika" });
    };

    private readonly changeUserPseudonym = async (req: RequestWithUser, res: Response) => {
        const { pseudonym }: ChangePseudonymData = req.body;
        await this.user.findByIdAndUpdate(req.user._id, { pseudonym });
        res.send({ message: "Udało się zaktualizować ksywkę" });
    };

    private readonly changeUserImage = async (req: RequestWithUser, res: Response) => {
        const fileName = await this.imageBot.saveNewUserImage(req.file);
        const user = await this.user.findById(req.user._id, { image: 1 });
        if (user.image !== "def") {
            await this.imageBot.deleteUserImage(user.image + ".webp");
        }
        user.image = fileName;
        await user.save();
        res.send({
            message: "Udało się zaktualizować zdjęcie",
            image: user.imageURL(),
        });
    };

    private readonly changeUserImageToDef = async (req: RequestWithUser, res: Response) => {
        const user = await this.user.findById(req.user._id, { image: 1 });

        await this.imageBot.deleteUserImage(user.image + ".webp");

        user.image = "def";
        await user.save();
        res.send({
            message: "Udało ustawić domyślne zdjęcie",
            image: user.imageURL(),
        });
    };
}
export default UserController;
