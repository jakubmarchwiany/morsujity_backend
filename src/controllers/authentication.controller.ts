import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as sha256 from "sha256";

import EmailVerificationNotFoundOrExpired from "../middleware/exceptions/EmailVerificationNotFoundOrExpired";
import HttpException from "../middleware/exceptions/HttpException";
import UserWithThatEmailAlreadyExistsException from "../middleware/exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../middleware/exceptions/WrongCredentialsException";

import Controller from "../interfaces/controller.interface";

import DataStoredInToken from "../models/authenticationToken/dataStoredInToken.interface";

import passwordResetTokenModel from "../models/passwordResetToken/passwordResetToken.model";
import tmpUserModel from "../models/user/tmpUser.model";
import userModel from "../models/user/user.model";

import MailBot from "../utils/mailBot";

import TokenData from "models/authenticationToken/tokenData.interface";
import User from "models/user/user.interface";

import emailTokenSchema from "../middleware/schemas/emailToken";
import loginUserSchema, { loginUserData } from "../middleware/schemas/loginUser";
import registerUserSchema, { registerUserData } from "../middleware/schemas/registerUser";
import validate from "../middleware/validate.middleware";

import catchError from "../utils/catchError";
import newPasswordSchema, { newPasswordData } from "../middleware/schemas/newPassword";

class AuthenticationController implements Controller {
    public path = "/auth";
    public router = express.Router();
    private user = userModel;
    private tmpUser = tmpUserModel;
    private passwordResetToken = passwordResetTokenModel;
    private mailBot;

    constructor() {
        this.initializeRoutes();
        this.mailBot = new MailBot();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/register`,
            validate(registerUserSchema),
            catchError(this.registerUser)
        );
        this.router.get(
            `${this.path}/verifyUserEmail/:token`,
            validate(emailTokenSchema),
            catchError(this.verifyUserEmail)
        );
        this.router.post(
            `${this.path}/login`,
            validate(loginUserSchema),
            catchError(this.loggingIn)
        );
        this.router.post(`${this.path}/logout`, this.loggingOut);
        this.router.post(`${this.path}/reqResetPassword`, catchError(this.reqResetPassword));
        this.router.post(
            `${this.path}/resetPassword`,
            validate(newPasswordSchema),
            catchError(this.resetPassword)
        );
    }

    private registerUser = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const userData: registerUserData = req.body;
        if (await this.user.findOne({ email: userData.email })) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.tmpUser.create({
                ...userData,
                password: hashedPassword,
            });
            await this.mailBot.sendMailEmailUserVerification(user.email, user._id);
            res.send({
                message: "Udało się utworzyć konto. Mail z potwierdzeniem wysłany na email",
            });
        }
    };

    private verifyUserEmail = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        let { token } = req.params;
        let tmpUser = await this.tmpUser.findById(token);
        if (tmpUser) {
            let { email, password, pseudonym } = tmpUser;
            await this.user.create({
                email,
                password,
                pseudonym,
            });

            tmpUser.delete();
            res.send({ message: "Udało się zweryfikować e-mail" });
        } else {
            next(new EmailVerificationNotFoundOrExpired());
        }
    };

    private loggingIn = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: loginUserData = req.body;
        const user = await this.user.findOne({ email: logInData.email }, { status: 0 });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.password = undefined!;
                const tokenData = this.createAuthenticationToken(user);
                res.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
                res.send({ user: user, token: tokenData.token, message: "Udało się zalogować" });
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    };

    private createAuthenticationToken(user: User): TokenData {
        const expiresIn = 60 * 60;
        const secret = process.env.JWT_SECRET;
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
            userType: "user",
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret!, { expiresIn }),
        };
    }

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private loggingOut = (req: express.Request, res: express.Response) => {
        res.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
        res.send({ message: "Udało się wylogować" });
    };

    private reqResetPassword = async (req: express.Request, res: express.Response) => {
        let { email } = req.body;
        let user = await this.user.findOne({ email: email });
        if (user) {
            let randomBytes = crypto.randomBytes(64).toString("hex");
            // let token = await bcrypt.hash(randomBytes, 10);

            let token = sha256(randomBytes);
            await this.passwordResetToken.create({ token, userId: user.id });
            await this.mailBot.sendMailResetUserPassword(email, randomBytes);
        }

        res.send({ message: "Email resetujący hasło został wysłany" });
    };

    private resetPassword = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        let { newPassword, token }: newPasswordData = req.body;

        let hashedToken = sha256(token);

        let foundToken = await this.passwordResetToken.findOne({ token: hashedToken });

        if (foundToken == null) {
            next(new HttpException(400, "Nie poprawny token"));
        }

        await this.passwordResetToken.deleteMany({ userId: foundToken!.userId });

        let hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.user.updateOne(
            { _id: foundToken!.userId },
            { $set: { password: hashedPassword } }
        );
        res.send({ message: "Hasło zostało zresetowane" });
    };
}

export default AuthenticationController;
