import * as bcrypt from "bcryptjs";
import * as express from "express";
import * as jwt from "jsonwebtoken";

import EmailVerificationNotFoundOrExpired from "../middleware/exceptions/EmailVerificationNotFoundOrExpired";
import UserWithThatEmailAlreadyExistsException from "../middleware/exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../middleware/exceptions/WrongCredentialsException";

import Controller from "../interfaces/controller.interface";

import DataStoredInToken from "../models/token/dataStoredInToken.interface";

import tmpHashModel from "../models/tmpHash/tmpHash.model";
import userModel from "../models/user/user.model";

import tmpUserModel from "../models/user/tmpUser.model";

import MailBot from "../utils/mailBot";

import TokenData from "models/token/tokenData.interface";
import User from "models/user/user.interface";
import HttpException from "../middleware/exceptions/HttpException";
import registerUserSchema from "../middleware/schemas/registerUser";
import validate from "../middleware/validate.middleware";
class AuthenticationController implements Controller {
    public path = "/auth";
    public router = express.Router();
    private user = userModel;
    private tmpUser = tmpUserModel;
    private tmpHash = tmpHashModel;
    private mailBot;

    constructor() {
        this.initializeRoutes();
        this.mailBot = new MailBot();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, validate(registerUserSchema), this.registration);
        this.router.post(`${this.path}/login`, this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
        this.router.get(`${this.path}/verifyEmail/:hash`, this.verifyEmail);
    }

    private registration = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const userData: any = req.body; //to Do
        if (await this.tmpUser.findOne({ email: userData.email })) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.tmpUser.create({
                ...userData,
                password: hashedPassword,
            });

            await this.mailBot.sendVerificationMail(user.email, user._id);
            res.send({ message: "Udało się utworzyć konto" });
            // const tokenData = this.createToken(user);
            // response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
            // response.send({user: user, token: tokenData.token});
        }
    };

    private loggingIn = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: any = req.body; //to Do
        const user = await this.user.findOne({ email: logInData.email });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.password = undefined!;
                const tokenData = this.createToken(user);
                res.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
                res.send({ user: user, token: tokenData.token, message: "Udało się zalogować" });
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    };

    private loggingOut = (req: express.Request, res: express.Response) => {
        res.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
        res.send({ message: "Udało się wylogować" });
    };

    private verifyEmail = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            let { hash } = req.params;
            let tmpHash = await this.tmpHash.findOne({ hash: hash });
            if (tmpHash) {
                let tmpUser = await this.tmpUser.findById(tmpHash.accountRef);
                if (tmpUser) {
                    let { email, password, pseudonym } = tmpUser;
                    await this.user.create({
                        email,
                        password,
                        pseudonym,
                    });
                }

                tmpUser!.delete();
                tmpHash.delete();
                res.send({ message: "Udało się zweryfikować e-mail" });
            } else {
                next(new EmailVerificationNotFoundOrExpired());
            }
        } catch (error: any) {
            next(new HttpException(500, error.message));
        }
    };

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private createToken(user: User): TokenData {
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
}

export default AuthenticationController;
