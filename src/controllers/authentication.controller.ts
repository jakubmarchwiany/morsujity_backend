import bcrypt from "bcryptjs";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import sha256 from "sha256";
import { v4 as uuidv4 } from "uuid";

import authMiddleware from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";

import catchError from "../utils/catchError";
import MailBot from "../utils/MailBot";

import PasswordResetToken from "../models/passwordResetToken/passwordResetToken.model";
import TmpUser from "../models/user/tmpUser.model";
import User from "../models/user/user.model";

import Controller from "../interfaces/controller.interface";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import DataStoredInToken from "../models/authenticationToken/dataStoredInToken.interface";
import TokenData from "../models/authenticationToken/tokenData.interface";
import { IUser } from "../models/user/user.interface";

import registerUserSchema, { RegisterUserData } from "../middleware/schemas/registerUser";
import emailTokenSchema, { EmailTokenData } from "../middleware/schemas/emailToken";
import loginUserSchema, { LoginUserData } from "../middleware/schemas/loginUser";
import emailSchema, { EmailData } from "../middleware/schemas/email";
import resetPasswordSchema, { NewPasswordData } from "../middleware/schemas/resetPassword";
import changePasswordSchema, { ChangePasswordData } from "../middleware/schemas/changePassword";

import EmailVerificationNotFoundOrExpired from "../middleware/exceptions/EmailVerificationNotFoundOrExpired";
import HttpException from "../middleware/exceptions/HttpException";
import UserWithThatEmailAlreadyExistsException from "../middleware/exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../middleware/exceptions/WrongCredentialsException";
import WrongAuthenticationTokenException from "../middleware/exceptions/WrongAuthenticationTokenException";

const { JWT_SECRET } = process.env;

class AuthenticationController implements Controller {
    public router = Router();
    public path = "/auth";
    private user = User;
    private tmpUser = TmpUser;
    private passwordResetToken = PasswordResetToken;
    private mailBot = new MailBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/register`, validate(registerUserSchema), catchError(this.registerUser));
        this.router.post(
            `/verify-user-email`,
            validate(emailTokenSchema),
            catchError(this.verifyUserEmail)
        );
        this.router.post(`/login`, validate(loginUserSchema), catchError(this.loggingIn));
        this.router.post(`/logout`, this.logOut);
        this.router.post(
            `/request-reset-password`,
            validate(emailSchema),
            catchError(this.requestResetPassword)
        );
        this.router.post(
            `/reset-password`,
            validate(resetPasswordSchema),
            catchError(this.resetPassword)
        );
        this.router.post(
            `/change-password`,
            authMiddleware,
            validate(changePasswordSchema),
            catchError(this.changeUserPassword)
        );
    }

    private registerUser = async (req: Request, res: Response, next: NextFunction) => {
        const userData: RegisterUserData = req.body;
        if (await this.user.findOne({ email: userData.email })) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const tmpUser = new this.tmpUser({ ...userData, password: hashedPassword });
            await this.mailBot.sendMailEmailUserVerification(tmpUser.email, tmpUser._id);
            await tmpUser.save();
            res.status(201).send({
                message: "Udało się utworzyć konto. Mail z potwierdzeniem wysłany na email",
            });
        }
    };

    private verifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
        let { token }: EmailTokenData = req.body;
        let tmpUser = await this.tmpUser.findById(token);
        if (tmpUser) {
            let { email, password, pseudonym } = tmpUser;
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

    private loggingIn = async (req: Request, res: Response, next: NextFunction) => {
        const logInData: LoginUserData = req.body;
        let user = await this.user.findOne({ email: logInData.email }, { status: 0 });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.image = user.imageURL();
                user.password = undefined;
                const tokenData = this.createAuthenticationToken(user);
                res.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
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
                    `Konto nie istnieje lub jest nieaktywne. Sprawdź mail: ${logInData.email}`
                )
            );
        }
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

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; Max-Age=${tokenData.expiresIn}; path=/;`;
    }

    private logOut = (req: Request, res: Response) => {
        res.setHeader("Set-Cookie", ["Authorization=; Max-Age=0; path=/;"]);
        res.send({ message: "Udało się wylogować" });
    };

    private requestResetPassword = async (req: Request, res: Response) => {
        let { email }: EmailData = req.body;
        let user = await this.user.exists({ email });
        if (user) {
            let randomBytes = uuidv4();
            let token = sha256(randomBytes);
            await this.mailBot.sendMailResetUserPassword(email, randomBytes);
            await this.passwordResetToken.create({ token, userId: user });
        }

        res.send({ message: "Email resetujący hasło został wysłany" });
    };

    private resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        let { newPassword, token }: NewPasswordData = req.body;

        let hashedToken = sha256(token);
        let foundToken = await this.passwordResetToken.findOne({ token: hashedToken });

        if (foundToken == null) {
            next(new WrongAuthenticationTokenException());
        } else {
            await this.passwordResetToken.deleteMany({ userId: foundToken.userId });

            let hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.user.updateOne(
                { _id: foundToken.userId },
                { $set: { password: hashedPassword } }
            );
            res.send({ message: "Hasło zostało zresetowane" });
        }
    };

    private changeUserPassword = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ) => {
        let { oldPassword, newPassword }: ChangePasswordData = req.body;

        let user = await this.user.findById(req.user._id, { password: 1 });

        let isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
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
