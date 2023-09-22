import { Request, Response, Router } from "express";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import { GroupModel } from "../../models/group/group";
import { ActivityModel } from "../../models/user_data/activity";
import { UserDataModel } from "../../models/user_data/user_data";
import { catchError } from "../../utils/catch_error";
import { ENV } from "../../utils/validate_env";
import { Controller } from "../controller.type";

const { USER_IMAGE_URL } = ENV;

export class UserController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly userData = UserDataModel;
    private readonly activity = ActivityModel;
    private readonly group = GroupModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/data", authMiddleware, catchError(this.getUserData));
    }

    private readonly getUserData = async (req: Request & ReqUser, res: Response) => {
        const userData = await this.userData
            .findById(req.user.dataId)
            .populate("groups", { name: 1 })
            .lean();

        const activities = await this.activity
            .find({ owner: req.user.userId }, null, { sort: { date: -1 } })
            .limit(10)
            .lean();

        userData!.image = USER_IMAGE_URL + userData?.image + ".webp";

        console.log(userData);

        const statistics = { ...userData?.statistics, activities };

        res.send({
            data: { ...userData, statistics },
            message: "Udało się autoryzować użytkownika"
        });
    };
}
