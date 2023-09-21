import { Request, Response, Router } from "express";
import { startSession } from "mongoose";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import { HttpException } from "../../middlewares/exceptions/http.exception";
import {
    CreateGroupData,
    createGroupSchema,
} from "../../middlewares/schemas/group/create_group.schema";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { GroupModel } from "../../models/group/group";
import { GroupPermission } from "../../models/group/group_permission.enum";
import { UserDataModel } from "../../models/user_data/user_data";
import { catchError } from "../../utils/catch_error";
import { Controller } from "../controller.type";

export class GroupsController implements Controller {
    public router = Router();
    public path = "/groups";
    private readonly group = GroupModel;
    private readonly userData = UserDataModel;

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
        const { type, name, description, coordinates } = req.body;

        console.log(type, name, description, coordinates);

        const session = await startSession();
        try {
            session.startTransaction();

            const group = new this.group({
                type,
                name,
                description,
                coordinates,
                members: [{ member: req.user.dataId, permission: GroupPermission.ADMIN }],
            });

            await this.userData.updateOne(
                { _id: req.user.dataId },
                { $push: { groups: group._id } },
                { session }
            );

            await group.save({ session });

            res.send({ message: "Udało się stworzyć grupę" });
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw new HttpException(400, "Nie udało się stworzyć grupę");
        } finally {
            await session.endSession();
        }
    };
}
