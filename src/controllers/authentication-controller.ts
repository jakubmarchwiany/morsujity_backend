import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import sha256 from "sha256";
import { v4 as uuidv4 } from "uuid";
import Controller from "../interfaces/controller-interface";
import RequestWithUser from "../interfaces/request-with-user-interface";
import authMiddleware from "../middleware/auth-middleware";
import EmailVerificationNotFoundOrExpired from "../middleware/exceptions/email-verification-not-found-or-expired-exception";
import HttpException from "../middleware/exceptions/http-exception";
import UserWithThatEmailAlreadyExistsException from "../middleware/exceptions/user-with-that-email-already-exists-exception";
import WrongAuthenticationTokenException from "../middleware/exceptions/wrong-authentication-token-exception";
import WrongCredentialsException from "../middleware/exceptions/wrong-credentials-exception";
import changePasswordSchema, {
    ChangePasswordData,
} from "../middleware/schemas/change-password-schema";
import emailSchema, { EmailData } from "../middleware/schemas/email-schema";
import emailTokenSchema, { EmailTokenData } from "../middleware/schemas/email-token-schema";
import loginUserSchema, { LoginUserData } from "../middleware/schemas/login-user-schema";
import registerUserSchema, { RegisterUserData } from "../middleware/schemas/register-user-schema";
import resetPasswordSchema, { NewPasswordData } from "../middleware/schemas/reset-password-schema";
import validate from "../middleware/validate-middleware";
import DataStoredInToken from "../models/authentication-token/data-stored-in-token-interface";
import TokenData from "../models/authentication-token/token-data-interface";
import PasswordResetToken from "../models/password-reset-token/password-reset-token-model";
import TmpUser from "../models/tmp-user/tmp-user-model";
import { IUser } from "../models/user/user-interface";
import User from "../models/user/user-model";
import catchError from "../utils/catch-error";
import MailBot from "../utils/mail-bot";

const { JWT_SECRET } = process.env;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class AuthenticationController implements Controller {
    public router = Router();
    public path = "/auth";
    private readonly user = User;
    private readonly tmpUser = TmpUser;
    private readonly passwordResetToken = PasswordResetToken;
    private readonly mailBot = new MailBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/auto-login`, authMiddleware, catchError(this.autoLogin));
        this.router.post(`/login`, validate(loginUserSchema), catchError(this.loggingIn));
        this.router.post(`/register`, validate(registerUserSchema), catchError(this.registerUser));
        this.router.post(
            `/verify-user-email`,
            validate(emailTokenSchema),
            catchError(this.verifyUserEmail),
        );
        this.router.post(`/logout`, this.logOut);
        this.router.post(`/reset-password`, validate(emailSchema), catchError(this.resetPassword));
        this.router.post(
            `/new-password`,
            validate(resetPasswordSchema),
            catchError(this.newPassword),
        );
        this.router.post(
            `/change-password`,
            authMiddleware,
            validate(changePasswordSchema),
            catchError(this.changeUserPassword),
        );
    }

    private readonly registerUser = async (
        req: Request<never, never, RegisterUserData>,
        res: Response,
        next: NextFunction,
    ) => {
        const userData = req.body;
        await sleep(1500);
        if (await this.user.findOne({ email: userData.email })) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const tmpUser = new this.tmpUser({
                ...userData,
                password: hashedPassword,
            });
            await this.mailBot.sendMailEmailUserVerification(tmpUser.email, tmpUser._id);
            await tmpUser.save();
            res.status(201).send({
                message: "Udało się utworzyć konto. Mail z potwierdzeniem wysłany na email",
            });
        }
    };

    private readonly verifyUserEmail = async (
        req: Request<never, never, EmailTokenData>,
        res: Response,
        next: NextFunction,
    ) => {
        const { token } = req.body;
        const tmpUser = await this.tmpUser.findById(token);
        if (tmpUser !== null) {
            const { email, password, pseudonym } = tmpUser;
            await this.tmpUser.deleteMany({ email: email });
            await this.user.create({
                email,
                password,
                pseudonym,
            });

            res.status(201).send({ message: "Udało się zweryfikować e-mail" });
        } else {
            next(new EmailVerificationNotFoundOrExpired());
        }
    };

    private readonly loggingIn = async (
        req: Request<never, never, LoginUserData>,
        res: Response,
        next: NextFunction,
    ) => {
        const logInData = req.body;
        const user = await this.user.findOne({ email: logInData.email }, { status: 0 });
        await sleep(1500);
        if (user !== null) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                if (user.image !== "def") user.image = user.imageURL();
                user.password = undefined;
                const tokenData = this.createAuthenticationToken(user);
                // res.cookie("Authorization", tokenData.token, {
                //     maxAge: tokenData.expiresIn * 1000,
                //     path: "/",
                // });

                res.send({
                    user: user,
                    token: tokenData.token,
                    message: "Udało się zalogować",
                });
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(
                new HttpException(
                    400,
                    `Konto nie istnieje lub jest nieaktywne. Sprawdź mail: ${logInData.email}`,
                ),
            );
        }
    };

    private autoLogin = async (req: Request, res: Response) => {
        res.send({
            message: "Autoryzacja przebiegła pomyślnie",
        });
    };

    private createAuthenticationToken(user: IUser): TokenData {
        const expiresIn = 60 * 60;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
            userType: user.type,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, JWT_SECRET, { expiresIn }),
        };
    }

    // private createCookie(tokenData: TokenData) {
    //     return `Authorization=${tokenData.token}; Max-Age=${tokenData.expiresIn}; path=/;`;
    // }

    private readonly logOut = (req: Request, res: Response) => {
        res.setHeader("Set-Cookie", ["Authorization=; Max-Age=0; path=/;"]);
        res.send({ message: "Udało się wylogować" });
    };

    private readonly resetPassword = async (
        req: Request<never, never, EmailData>,
        res: Response,
    ) => {
        const { email } = req.body;
        const user = await this.user.exists({ email });
        if (user !== null) {
            const randomBytes = uuidv4();
            const token = sha256(randomBytes);
            await this.mailBot.sendMailResetUserPassword(email, randomBytes);
            await this.passwordResetToken.create({ token, userId: user });
        }

        res.send({ message: "Email resetujący hasło został wysłany" });
    };

    private readonly newPassword = async (
        req: Request<never, never, NewPasswordData>,
        res: Response,
        next: NextFunction,
    ) => {
        const { newPassword, token } = req.body;

        const hashedToken = sha256(token);
        const foundToken = await this.passwordResetToken.findOne({
            token: hashedToken,
        });

        if (foundToken == null) {
            next(new WrongAuthenticationTokenException());
        } else {
            await this.passwordResetToken.deleteMany({ userId: foundToken.userId });
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.user.updateOne(
                { _id: foundToken.userId },
                { $set: { password: hashedPassword } },
            );
            res.send({ message: "Hasło zostało zresetowane" });
        }
    };

    private readonly changeUserPassword = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction,
    ) => {
        const { oldPassword, newPassword }: ChangePasswordData = req.body;

        const user = await this.user.findById(req.user._id, { password: 1 });

        const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
        if (isPasswordMatching) {
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            res.send({ message: "Hasło zostało zmienione" });
        } else {
            next(new WrongCredentialsException());
        }
    };
}
export default AuthenticationController;
