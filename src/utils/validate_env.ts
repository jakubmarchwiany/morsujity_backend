import { cleanEnv, num, port, str } from "envalid";

export const ENV = cleanEnv(process.env, {
    PORT: port(),
    NODE_ENV: str({ choices: ["development", "production"] }),

    // frontend url address
    FRONT_URL_ADDRESS: str(),
    USER_APP_DOMAIN: str(),

    // CORS Options
    WHITELISTED_DOMAINS: str(),

    // MongoDB configuration
    MONGO_URL: str(),

    // Authentication configuration
    JWT_SECRET: str(),

    // E-mail bot configuration
    MAIL_HOST: str(),
    MAIL_PORT: port(),
    MAIL_USER: str(),
    MAIL_PASS: str(),
    MAIL_FROM: str(),

    // Variables USER
    USER_EXPIRE_AFTER: num(),
    AUTHENTICATION_TOKEN_EXPIRE_AFTER: num(),

    // ResetPasswordToken
    RESET_PASSWORD_TOKEN_EXPIRE_AFTER: num(),

    // Google console configuration
    PROJECT_ID: str(),
    KEY_FILE_NAME: str(),
    GCLOUD_STORAGE_IMAGE_BUCKET: str(),
    DEF_USER_IMAGE: str(),
    USER_IMAGE_URL: str(),
});
