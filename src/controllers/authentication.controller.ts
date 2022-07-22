import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as express from "express";
import * as jwt from "jsonwebtoken";

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
        this.router.post(
            `${this.path}/resetPassword`,
            catchError(this.createResetUserPasswordToken)
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

    private createResetUserPasswordToken = async (req: express.Request, res: express.Response) => {
        let { email } = req.body;
        let user = await this.user.findOne({ email: email });
        if (user) {
            let randomBytes = crypto.randomBytes(64).toString("hex");
            let token = await bcrypt.hash(randomBytes, 10);
            await this.passwordResetToken.create({ token, userId: user.id });
            await this.mailBot.sendMailResetUserPassword(email, token);
        }

        res.send({ message: "Email resetujący hasło został wysłany" });
    };
}

export default AuthenticationController;
