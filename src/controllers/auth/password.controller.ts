import { compareSync, hashSync } from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import { startSession } from "mongoose";
import sha256 from "sha256";
import { v4 as uuidv4 } from "uuid";
import { ReqUser, authMiddleware } from "../../middlewares/auth.middleware";
import { HttpException } from "../../middlewares/exceptions/http.exception";
import { WrongAuthenticationTokenException } from "../../middlewares/exceptions/wrong_authentication_token.exception";
import { WrongCredentialsException } from "../../middlewares/exceptions/wrong_credentials.exception";
import {
    UpdatePasswordData,
    updatePasswordSchema
} from "../../middlewares/schemas/auth/change_password.schema";
import {
    UpdatePasswordWithTokenData,
    updatePasswordWithTokenSchema
} from "../../middlewares/schemas/auth/new_password.schema";
import {
    ResetPasswordEmailData,
    resetPasswordEmailSchema
} from "../../middlewares/schemas/auth/reset_password_Email.schema";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { AuthenticationTokenModel } from "../../models/tokens/authentication_token/authentication_token";
import { PasswordResetTokenModel } from "../../models/tokens/password_reset_token/password_reset_token_model";
import { UserModel } from "../../models/user/user";
import { catchError } from "../../utils/catch_error";
import { MailBot } from "../../utils/mail.bot";
import { Controller } from "../controller.type";

export class PasswordController implements Controller {
    router = Router();
    path = "/auth/password";
    private readonly userModel = UserModel;
    private readonly authenticationToken = AuthenticationTokenModel;
    private readonly passwordResetToken = PasswordResetTokenModel;
    private readonly mailBot = new MailBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/reset-email",
            validateMiddleware(resetPasswordEmailSchema),
            catchError(this.createPasswordResetTokenAndSendEmail)
        );
        this.router.post(
            "/update-with-token",
            validateMiddleware(updatePasswordWithTokenSchema),
            catchError(this.updatePasswordWithToken)
        );
        this.router.post(
            "/update",
            authMiddleware,
            validateMiddleware(updatePasswordSchema),
            catchError(this.updatePassword)
        );
    }

    private readonly createPasswordResetTokenAndSendEmail = async (
        req: Request<never, never, ResetPasswordEmailData["body"]>,
        res: Response
    ) => {
        const { email } = req.body;
        const user = await this.userModel.exists({ email });
        if (user !== null) {
            const session = await startSession();

            try {
                session.startTransaction();

                const randomBytes = uuidv4();
                const token = sha256(randomBytes);
                await this.mailBot.sendMailResetPassword(email, randomBytes);
                await this.passwordResetToken.create({ token, userId: user }, { session });

                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
            } finally {
                res.send({ message: "Email resetujący hasło został wysłany" });
                await session.endSession();
            }
        }
    };

    private readonly updatePasswordWithToken = async (
        req: Request<never, never, UpdatePasswordWithTokenData["body"]>,
        res: Response,
        next: NextFunction
    ) => {
        const { newPassword, token } = req.body;

        const hashedToken = sha256(token);
        const foundToken = await this.passwordResetToken.findOne({
            token: hashedToken
        });

        if (foundToken == null) {
            next(new WrongAuthenticationTokenException());
        } else {
            const session = await startSession();

            try {
                session.startTransaction();

                await this.passwordResetToken.deleteMany(
                    {
                        userId: foundToken.userId
                    },
                    { session }
                );
                await this.authenticationToken.deleteMany(
                    { owner: foundToken.userId },
                    { session }
                );
                const hashedPassword = hashSync(newPassword, 10);
                await this.userModel.updateOne(
                    { _id: foundToken.userId },
                    { $set: { password: hashedPassword } },
                    { session }
                );

                res.send({ message: "Hasło zostało zresetowane" });
                await session.commitTransaction();
            } catch (error) {
                res.send({ message: "Nie udało się zresetować hasła" });
                await session.abortTransaction();
            } finally {
                await session.endSession();
            }
        }
    };

    private readonly updatePassword = async (
        req: Request<never, never, UpdatePasswordData["body"]> & ReqUser,
        res: Response
    ) => {
        const { newPassword, oldPassword } = req.body;

        const user = await this.userModel.findById(req.user.userId, {
            password: 1
        });
        if (user) {
            const isPasswordMatching = compareSync(oldPassword, user.password);
            if (isPasswordMatching) {
                user.password = hashSync(newPassword, 10);

                const session = await startSession();

                try {
                    session.startTransaction();

                    await user.save({ session });
                    await this.authenticationToken.deleteMany(
                        { owner: req.user.userId },
                        { session }
                    );

                    res.send({ message: "Hasło zostało zmienione" });
                    await session.commitTransaction();
                } catch (error) {
                    res.send({ message: "Nie udało się zmienić hasła" });
                    await session.abortTransaction();
                } finally {
                    await session.endSession();
                }
            } else {
                throw new WrongCredentialsException();
            }
        } else {
            throw new HttpException(400, "Użytkownik nie znaleziony");
        }
    };
}
