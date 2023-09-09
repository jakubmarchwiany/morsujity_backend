import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { startSession } from "mongoose";
import sha256 from "sha256";
import { v4 as uuidv4 } from "uuid";
import Controller from "../interfaces/controller-interface";
import authMiddleware, { ReqUser } from "../middleware/auth-middleware";
import EmailVerificationNotFoundOrExpired from "../middleware/exceptions/email-verification-not-found-or-expired-exception";
import HttpException from "../middleware/exceptions/http-exception";
import UserWithThatEmailAlreadyExistsException from "../middleware/exceptions/user-with-that-email-already-exists-exception";
import WrongAuthenticationTokenException from "../middleware/exceptions/wrong-authentication-token-exception";
import WrongCredentialsException from "../middleware/exceptions/wrong-credentials-exception";
import changePasswordSchema, {
    ChangePasswordData,
} from "../middleware/schemas/auth/change-password-schema";
import emailSchema, { EmailData } from "../middleware/schemas/auth/email-schema";
import emailTokenSchema, { EmailTokenData } from "../middleware/schemas/auth/email-token-schema";
import loginUserSchema, { LoginUserData } from "../middleware/schemas/auth/login-user-schema";
import registerUserSchema, {
    RegisterUserData,
} from "../middleware/schemas/auth/register-user-schema";
import resetPasswordSchema, {
    NewPasswordData,
} from "../middleware/schemas/auth/reset-password-schema";
import validate from "../middleware/validate-middleware";
import TmpUser from "../models/tmp-user/tmp-user-model";
import AuthenticationToken from "../models/tokens/authentication-token/authentication-token";
import { DataStoredInToken } from "../models/tokens/authentication-token/authentication-token-interface";
import PasswordResetToken from "../models/tokens/password-reset-token/password-reset-token-model";
import UserData from "../models/user-data/user-data-model";
import { IUser } from "../models/user/user-interface";
import User from "../models/user/user-model";
import catchError from "../utils/catch-error";
import MailBot from "../utils/mail-bot";

const { JWT_SECRET, AUTHENTICATION_TOKEN_EXPIRE_AFTER, USER_APP_DOMAIN } = process.env;

class AuthenticationController implements Controller {
    public router = Router();
    public path = "/auth";
    private readonly user = User;
    private readonly userData = UserData;
    private readonly tmpUser = TmpUser;
    private readonly authenticationToken = AuthenticationToken;
    private readonly passwordResetToken = PasswordResetToken;
    private readonly mailBot = new MailBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/login`, validate(loginUserSchema), catchError(this.loggingIn));
        this.router.get(`/logout`, authMiddleware, this.logOut);
        this.router.post(`/register`, validate(registerUserSchema), catchError(this.registerUser));
        this.router.post(
            `/verify-user-email`,
            validate(emailTokenSchema),
            catchError(this.verifyUserEmail)
        );
        this.router.post(`/reset-password`, validate(emailSchema), catchError(this.resetPassword));
        this.router.post(
            `/new-password`,
            validate(resetPasswordSchema),
            catchError(this.newPassword)
        );
        this.router.post(
            `/change-password`,
            authMiddleware,
            validate(changePasswordSchema),
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

                await this.mailBot.sendMailEmailUserVerification(tmpUser.email, tmpUser._id);
                await tmpUser.save({ session });

                await session.commitTransaction();
                res.status(201).send({
                    message: "Udało się utworzyć konto. Mail z potwierdzeniem wysłany na email",
                });
            } catch (error) {
                await session.abortTransaction();
                throw new HttpException(400, "Nie udało się utworzyć konta");
            } finally {
                session.endSession();
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
                session.endSession();
            }
        } else {
            throw new EmailVerificationNotFoundOrExpired();
        }
    };

    private readonly loggingIn = async (
        req: Request<never, never, LoginUserData["body"]>,
        res: Response,
        next: NextFunction
    ) => {
        const { email, password } = req.body;
        const user = await this.user.findOne({ email }).lean();
        if (user !== null) {
            const isPasswordMatching = await bcrypt.compare(password, user.password);

            if (isPasswordMatching) {
                const tokenString = this.createAuthenticationToken(user);
                await this.authenticationToken.create({ token: tokenString, owner: user._id });

                const expiresIn = parseInt(AUTHENTICATION_TOKEN_EXPIRE_AFTER);

                res.send({
                    data: { expires: expiresIn, domain: USER_APP_DOMAIN, token: tokenString },
                    message: "Udało się zalogować",
                });
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(
                new HttpException(
                    400,
                    `Konto nie istnieje lub jest nieaktywne. Sprawdź mail: ${email}`
                )
            );
        }
    };

    private createAuthenticationToken(user: IUser): string {
        const expiresIn = parseInt(AUTHENTICATION_TOKEN_EXPIRE_AFTER);

        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
            data: `${user.data}`,
        };

        return jwt.sign(dataStoredInToken, JWT_SECRET, { expiresIn });
    }

    private readonly logOut = async (req: Request, res: Response) => {
        const bearerHeader = req.headers["authorization"].substring(7);
        await this.authenticationToken.deleteOne({ token: bearerHeader });
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
                session.endSession();
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
                session.endSession();
            }
        }
    };

    private readonly changeUserPassword = async (
        req: Request<never, never, ChangePasswordData["body"]> & ReqUser,
        res: Response
    ) => {
        const { newPassword, oldPassword } = req.body;

        const user = await this.user.findById(req.user._id, { password: 1 });

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
                session.endSession();
            }
        } else {
            throw new WrongCredentialsException();
        }
    };
}
export default AuthenticationController;
