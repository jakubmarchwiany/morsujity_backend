import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller-interface";
import createGroupSchema, {
    CreateGroupData,
} from "../middleware/schemas/group/create_group_schema";
import authMiddleware, { ReqUser } from "../middleware/auth-middleware";
import catchError from "../utils/catch-error";
import Group from "../models/group/group";
import validate from "../middleware/validate-middleware";
import { GroupPermission } from "../models/group/group_interface";

class GroupController implements Controller {
    public router = Router();
    public path = "/group";
    private readonly group = Group;

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post(
            "/create",
            validate(createGroupSchema),
            authMiddleware,
            catchError(this.createGroup)
        );
    }

    private createGroup = async (
        req: Request<never, never, CreateGroupData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name, description, coordinates } = req.body;

        const group = new this.group({
            name,
            description,
            coordinates,
        });
        group.members.push({ member: req.user.data, permission: GroupPermission.ADMIN });
        await group.save();

        

        res.send({message: "Udało się stworzyć grupę"});
    };
}
export default GroupController;
