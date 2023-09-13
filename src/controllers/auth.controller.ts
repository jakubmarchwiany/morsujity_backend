import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import { sign } from "jsonwebtoken";
import { startSession } from "mongoose";
import sha256 from "sha256";
import { v4 as uuidv4 } from "uuid";
import { ReqUser, authMiddleware } from "../middlewares/auth.middleware";
import { EmailVerificationNotFoundOrExpired } from "../middlewares/exceptions/email_verification_not_found_or_expired.exception";
import { HttpException } from "../middlewares/exceptions/http_exception.exception";
import { UserWithThatEmailAlreadyExistsException } from "../middlewares/exceptions/user_with_that_email_already_exists.exception";
import { WrongAuthenticationTokenException } from "../middlewares/exceptions/wrong_authentication_token.exception";
import { WrongCredentialsException } from "../middlewares/exceptions/wrong_credentials.exception";
import {
    ChangePasswordData,
    changePasswordSchema,
} from "../middlewares/schemas/auth/change_password.schema";
import { EmailData, emailSchema } from "../middlewares/schemas/auth/email.schema";
import { EmailTokenData, emailTokenSchema } from "../middlewares/schemas/auth/email_token_schema";
import { LoginUserData, loginUserSchema } from "../middlewares/schemas/auth/login_user.schema";
import {
    RegisterUserData,
    registerUserSchema,
} from "../middlewares/schemas/auth/register_user.schema";
import {
    NewPasswordData,
    resetPasswordSchema,
} from "../middlewares/schemas/auth/reset_password.schema";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { TmpUserModel } from "../models/tmp_user/tmp_user_model";
import { AuthenticationTokenModel } from "../models/tokens/authentication_token/authentication_token";
import { DataStoredInToken } from "../models/tokens/authentication_token/authentication_token_interface";
import { PasswordResetTokenModel } from "../models/tokens/password_reset_token/password_reset_token_model";
import { UserModel } from "../models/user/user";
import { UserDataModel } from "../models/user_data/user_data";
import { catchError } from "../utils/catch_error";
import { ENV } from "../utils/env_validation";
import { MailBot } from "../utils/mail_bot";
import { Controller } from "./controller.interface";

const { JWT_SECRET, AUTHENTICATION_TOKEN_EXPIRE_AFTER, USER_APP_DOMAIN } = ENV;

export class AuthController implements Controller {
    public router = Router();
    public path = "/auth";
    private readonly user = UserModel;
    private readonly userData = UserDataModel;
    private readonly tmpUser = TmpUserModel;
    private readonly authenticationToken = AuthenticationTokenModel;
    private readonly passwordResetToken = PasswordResetTokenModel;
    private readonly mailBot = new MailBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/login`, validateMiddleware(loginUserSchema), catchError(this.loggingIn));
        this.router.get(`/logout`, authMiddleware, this.logOut);
        this.router.post(
            `/register`,
            validateMiddleware(registerUserSchema),
            catchError(this.registerUser)
        );
        this.router.post(
            `/verify-user-email`,
            validateMiddleware(emailTokenSchema),
            catchError(this.verifyUserEmail)
        );
        this.router.post(
            `/reset-password`,
            validateMiddleware(emailSchema),
            catchError(this.resetPassword)
        );
        this.router.post(
            `/new-password`,
            validateMiddleware(resetPasswordSchema),
            catchError(this.newPassword)
        );
        this.router.post(
            `/change-password`,
            authMiddleware,
            validateMiddleware(changePasswordSchema),
            catchError(this.changeUserPassword)
        );
    }

    private readonly registerUser = async (
        req: Request<never, never, RegisterUserData["body"]>,
        res: Response
    ) => {
        const { email, password, pseudonym } = req.body;
        if (await this.user.exists({ email }).lean()) {
            throw new UserWithThatEmailAlreadyExistsException(email);
        } else {
            const session = await startSession();
            try {
                session.startTransaction();

                const hashedPassword = await bcrypt.hash(password, 10);

                const tmpUser = new this.tmpUser({
                    pseudonym,
                    email,
                    password: hashedPassword,
                });

                await this.mailBot.sendMailEmailUserVerification(
                    tmpUser.email,
                    tmpUser._id.toString()
                );
                await tmpUser.save({ session });

                await session.commitTransaction();
                res.status(201).send({
                    message: "Udało się utworzyć konto. Mail z potwierdzeniem wysłany na email",
                });
            } catch (error) {
                await session.abortTransaction();
                throw new HttpException(400, "Nie udało się utworzyć konta");
            } finally {
                await session.endSession();
            }
        }
    };

    private readonly verifyUserEmail = async (
        req: Request<never, never, EmailTokenData["body"]>,
        res: Response
    ) => {
        const { token } = req.body;
        const tmpUser = await this.tmpUser.findById(token).lean();
        if (tmpUser !== null) {
            const { email, password, pseudonym } = tmpUser;

            const session = await startSession();

            try {
                session.startTransaction();

                await this.tmpUser.deleteMany({ email: email }, { session });

                let userData = await this.userData.create({ pseudonym });
                await this.user.create({
                    email,
                    password,
                    pseudonym,
                    data: userData._id,
                });

                await session.commitTransaction();
                res.status(201).send({ message: "Udało się zweryfikować e-mail" });
            } catch (error) {
                await session.abortTransaction();
                throw new HttpException(400, "Nie udało się zweryfikować e-mail");
            } finally {
                await session.endSession();
            }
        } else {
            throw new EmailVerificationNotFoundOrExpired();
        }
    };

    private readonly loggingIn = async (
        req: Request<never, never, LoginUserData["body"]>,
        res: Response
    ) => {
        const { email, password } = req.body;
        const user = await this.user.findOne({ email }).lean();
        if (user !== null) {
            const isPasswordMatching = await bcrypt.compare(password, user.password);

            if (isPasswordMatching) {
                const tokenString = this.createAuthenticationToken(
                    user._id.toString(),
                    user.data.toString()
                );
                await this.authenticationToken.create({ token: tokenString, owner: user._id });

                res.send({
                    data: {
                        expires: AUTHENTICATION_TOKEN_EXPIRE_AFTER,
                        domain: USER_APP_DOMAIN,
                        token: tokenString,
                    },
                    message: "Udało się zalogować",
                });
            } else {
                throw new WrongCredentialsException();
            }
        } else {
            throw new HttpException(
                400,
                `Konto nie istnieje lub jest nieaktywne. Sprawdź mail: ${email}`
            );
        }
    };

    private createAuthenticationToken(userID: string, dataID: string): string {
        const dataStoredInToken: DataStoredInToken = {
            _id: userID,
            data: dataID,
        };

        return sign(dataStoredInToken, JWT_SECRET, {
            expiresIn: AUTHENTICATION_TOKEN_EXPIRE_AFTER,
        });
    }

    private readonly logOut = async (req: Request, res: Response) => {
        const bearerHeader = req.headers["authorization"]!.substring(7);
        const response = await this.authenticationToken.deleteOne({ token: bearerHeader });

        if (response.deletedCount == 0)
            throw new HttpException(400, `Token autoryzacyjny nie istnieje`);

        res.send({ message: "Udało się wylogować" });
    };

    private readonly resetPassword = async (
        req: Request<never, never, EmailData["body"]>,
        res: Response
    ) => {
        const { email } = req.body;
        const user = await this.user.exists({ email });
        if (user !== null) {
            const session = await startSession();

            try {
                session.startTransaction();

                const randomBytes = uuidv4();
                const token = sha256(randomBytes);
                await this.mailBot.sendMailResetUserPassword(email, randomBytes);
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

    private readonly newPassword = async (
        req: Request<never, never, NewPasswordData["body"]>,
        res: Response,
        next: NextFunction
    ) => {
        const { newPassword, token } = req.body;

        const hashedToken = sha256(token);
        const foundToken = await this.passwordResetToken.findOne({
            token: hashedToken,
        });

        if (foundToken == null) {
            next(new WrongAuthenticationTokenException());
        } else {
            const session = await startSession();

            try {
                session.startTransaction();

                await this.passwordResetToken.deleteMany(
                    {
                        userId: foundToken.userId,
                    },
                    { session }
                );
                await this.authenticationToken.deleteMany(
                    { owner: foundToken.userId },
                    { session }
                );
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await this.user.updateOne(
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

    private readonly changeUserPassword = async (
        req: Request<never, never, ChangePasswordData["body"]> & ReqUser,
        res: Response
    ) => {
        const { newPassword, oldPassword } = req.body;

        const user = await this.user.findById(req.user._id, { password: 1 });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
            if (isPasswordMatching) {
                user.password = await bcrypt.hash(newPassword, 10);

                const session = await startSession();

                try {
                    session.startTransaction();

                    await user.save({ session });
                    await this.authenticationToken.deleteMany({ owner: req.user._id }, { session });

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
