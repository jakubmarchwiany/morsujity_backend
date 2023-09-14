import bcrypt, { hashSync } from "bcryptjs";
import { Request, Response, Router } from "express";
import { sign } from "jsonwebtoken";
import { startSession } from "mongoose";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { EmailVerificationNotFoundOrExpired } from "../../middlewares/exceptions/email_verification_not_found_or_expired.exception";
import { HttpException } from "../../middlewares/exceptions/http.exception";
import { UserWithThatEmailAlreadyExistsException } from "../../middlewares/exceptions/user_with_that_email_already_exists.exception";
import { WrongCredentialsException } from "../../middlewares/exceptions/wrong_credentials.exception";
import { LoginUserData, loginUserSchema } from "../../middlewares/schemas/auth/login_user.schema";
import {
    RegisterUserData,
    registerUserSchema,
} from "../../middlewares/schemas/auth/register_user.schema";
import {
    EmailTokenData,
    verifyUserEmailSchema,
} from "../../middlewares/schemas/auth/verify_user_email.schema";
import { validateMiddleware } from "../../middlewares/validate.middleware";
import { TmpUserModel } from "../../models/tmp_user/tmp_user_model";
import { AuthenticationTokenModel } from "../../models/tokens/authentication_token/authentication_token";
import { DataStoredInToken } from "../../models/tokens/authentication_token/authentication_token_interface";
import { UserModel } from "../../models/user/user";
import { UserDataModel } from "../../models/user_data/user_data";
import { catchError } from "../../utils/catch_error";
import { MailBot } from "../../utils/mail.bot";
import { ENV } from "../../utils/validate_env";
import { Controller } from "../controller.interface";

const { JWT_SECRET, AUTHENTICATION_TOKEN_EXPIRE_AFTER, USER_APP_DOMAIN } = ENV;

export class AuthController implements Controller {
    public router = Router();
    public path = "/auth";
    private readonly user = UserModel;
    private readonly userData = UserDataModel;
    private readonly tmpUser = TmpUserModel;
    private readonly authenticationToken = AuthenticationTokenModel;
    private readonly mailBot = new MailBot();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `/login`,
            validateMiddleware(loginUserSchema),
            catchError(this.createAuthToken)
        );
        this.router.get(`/logout`, authMiddleware, catchError(this.deleteAuthToken));
        this.router.post(
            `/register`,
            validateMiddleware(registerUserSchema),
            catchError(this.createTmpUserAndSendEmail)
        );
        this.router.post(
            `/verify-user-email`,
            validateMiddleware(verifyUserEmailSchema),
            catchError(this.verifyEmailAndCreateUser)
        );
    }

    private readonly createAuthToken = async (
        req: Request<never, never, LoginUserData["body"]>,
        res: Response
    ) => {
        const { email, password } = req.body;
        const user = await this.user.findOne({ email }).lean();
        if (user !== null) {
            const isPasswordMatching = await bcrypt.compare(password, user.password);

            if (isPasswordMatching) {
                const tokenString = this.createAuthJwtToken(
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

    private createAuthJwtToken(userID: string, dataID: string): string {
        const dataStoredInToken: DataStoredInToken = {
            _id: userID,
            data: dataID,
        };

        return sign(dataStoredInToken, JWT_SECRET, {
            expiresIn: AUTHENTICATION_TOKEN_EXPIRE_AFTER,
        });
    }

    private readonly deleteAuthToken = async (req: Request, res: Response) => {
        const bearerHeader = req.headers["authorization"]!.substring(7);
        const response = await this.authenticationToken.deleteOne({ token: bearerHeader });

        if (response.deletedCount == 0)
            throw new HttpException(400, `Token autoryzacyjny nie istnieje`);

        res.send({ message: "Udało się wylogować" });
    };

    private readonly createTmpUserAndSendEmail = async (
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

                const hashedPassword = hashSync(password, 10);

                const tmpUser = new this.tmpUser({
                    pseudonym,
                    email,
                    password: hashedPassword,
                });
                await this.mailBot.sendMailVerificationEmail(tmpUser.email, tmpUser._id.toString());
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

    private readonly verifyEmailAndCreateUser = async (
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
}
