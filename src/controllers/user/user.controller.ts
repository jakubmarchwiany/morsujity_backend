import { Request, Response, Router } from "express";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import { UserDataModel } from "../../models/user_data/user_data";
import { catchError } from "../../utils/catch_error";
import { ENV } from "../../utils/validate_env";
import { Controller } from "../controller.interface";

const { USER_IMAGE_URL } = ENV;

export class UserController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly userData = UserDataModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/data`, authMiddleware, catchError(this.getUserData));
    }

    private readonly getUserData = async (req: Request & ReqUser, res: Response) => {
        let userData = await this.userData
            .findById(req.user.data, {
                "statistics.activity": { $slice: -5 },
            })
            .lean();

        userData!.image = USER_IMAGE_URL + userData?.image + ".webp";

        res.send({ data: userData, message: "Udało się autoryzować użytkownika" });
    };
}
