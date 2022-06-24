import * as bcrypt from "bcrypt";
import * as express from "express";
import * as jwt from "jsonwebtoken";

import validationMiddleware from "../middleware/validation.middleware";

import UserWithThatEmailAlreadyExistsException from "../middleware/exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../middleware/exceptions/WrongCredentialsException";

import Controller from "../interfaces/controller.interface";

import DataStoredInToken from "../models/token/dataStoredInToken.interface";
import TokenData from "../models/token/tokenData.interface";

import Account from "../models/account/account.interface";
import accountModel from "../models/account/account.model";

import MailBot from "../utils/mailBot";

class AuthenticationController implements Controller {
    public path = "/auth";
    public router = express.Router();
    private account = accountModel;
    private mailBot;

    constructor() {
        this.initializeRoutes();
        this.mailBot = new MailBot();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(), this.registration);
        this.router.post(`${this.path}/login`, this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }

    private registration = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const userData: any = req.body; //to Do
        console.log(userData);
        if (await this.account.findOne({ email: userData.email })) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await this.account.create({
                ...userData,
                password: hashedPassword,
            });
            user.password = undefined!;

            this.mailBot.sendVerificationMail(user.email, user._id);
            // const tokenData = this.createToken(user);
            // response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
            // response.send({user: user, token: tokenData.token});
            res.send({ message: "Udało się utworzyć konto" });
        }
    };

    private loggingIn = async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: any = req.body; //to Do
        const user = await this.account.findOne({ email: logInData.email });
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

    private createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }

    private createToken(user: Account): TokenData {
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
