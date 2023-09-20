import { Request, Response, Router } from "express";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import {
    CreateGroupData,
    createGroupSchema,
} from "../../middlewares/schemas/group/create_group.schema";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { GroupModel } from "../../models/group/group";
import { catchError } from "../../utils/catch_error";
import { Controller } from "../controller.type";

export class GroupsController implements Controller {
    public router = Router();
    public path = "/groups";
    private readonly group = GroupModel;

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post(
            "/create",
            validateMiddleware(createGroupSchema),
            authMiddleware,
            catchError(this.createGroup)
        );
    }

    private createGroup = async (
        req: Request<never, never, CreateGroupData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name, description, coordinates } = req.body;

        // const group = new this.group({
        //     name,
        //     description,
        //     coordinates,
        // });
        // group.members.push({ member: req.user.data, permission: GroupPermission.ADMIN });
        // await group.save();

        res.send({ message: "Udało się stworzyć grupę" });
    };
}
