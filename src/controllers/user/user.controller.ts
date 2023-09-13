import { Request, Response, Router } from "express";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import { UserDataModel } from "../../models/user_data/user_data";
import { catchError } from "../../utils/catch_error";
import { Controller } from "../controller.interface";

export class UserController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly userData = UserDataModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/data`, authMiddleware, catchError(this.getUserData));
        this.router.get(`/allActivity`, authMiddleware, catchError(this.getAllActivity));
    }

    private readonly getUserData = async (req: Request & ReqUser, res: Response) => {
        const userData = await this.userData
            .findById(req.user.data, {
                "statistics.activity": { $slice: -5 },
            })
            .lean();

        res.send({ user: userData, message: "Udało się autoryzować użytkownika" });
    };
    private readonly getAllActivity = async (req: Request & ReqUser, res: Response) => {
        const userData = await this.userData
            .findById(req.user.data, {
                "statistics.activity": 1,
            })
            .lean();

        res.send({
            activity: userData!.statistics.activity,
            message: "Udało się pobrać wszystkie aktywności",
        });
    };
}
