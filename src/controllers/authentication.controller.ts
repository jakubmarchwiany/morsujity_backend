import * as bcrypt from "bcrypt";
import * as express from "express";
import * as jwt from "jsonwebtoken";

import validationMiddleware from "../middleware/validation.middleware";

import UserWithThatEmailAlreadyExistsException from "../middleware/exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../middleware/exceptions/WrongCredentialsException";

import Controller from "../interfaces/controller.interface";

import DataStoredInToken from "../models/token/dataStoredInToken.interface";
import TokenData from "../models/token/tokenData.interface";

import accountModel from "../models/account/account.model";
import Account from "../models/account/account.interface";

class AuthenticationController implements Controller {
    public path = "/auth";
    public router = express.Router();
    private account = accountModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(), this.registration);
        this.router.post(`${this.path}/login`, this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }

    private registration = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const userData: any = request.body; //to Do
        console.log(userData);
        if (await this.account.findOne({ email: userData.email })) {
            next(new UserWithThatEmailAlreadyExistsException(userData.email));
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
          

            const user = await this.account.create({
                ...userData,
                password: hashedPassword,
            });
            console.log(hashedPassword);
            user.password = undefined!;
            console.log(user);
            const tokenData = this.createToken(user);
            response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
            response.send(user);
        }
    };

    private loggingIn = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const logInData: any = request.body; //to Do
        const user = await this.account.findOne({ email: logInData.email });
        if (user) {
            const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);
            if (isPasswordMatching) {
                user.password = undefined!;
                const tokenData = this.createToken(user);
                response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
                response.send(user);
            } else {
                next(new WrongCredentialsException());
            }
        } else {
            next(new WrongCredentialsException());
        }
    };

    private loggingOut = (request: express.Request, response: express.Response) => {
        response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
        response.send(200);
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
