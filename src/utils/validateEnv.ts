import { bool, cleanEnv, num, port, str } from "envalid";

function validateEnv() {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ["development", "production"] }),
        PORT: port(),
        DEV_FRONT_URL_ADDRESS: str(),
        DEV_BACKEND_URL_ADDRESS: str(),
        PRO_FRONT_URL_ADDRESS: str(),
        DEV_WHITELISTED_DOMAINS: str(),
        PRO_WHITELISTED_DOMAINS: str(),
        DEV_MONGO_PATH: str(),
        PRO_MONGO_USER: str(),
        PRO_MONGO_PASSWORD: str(),
        PRO_MONGO_PATH: str(),
        JWT_SECRET: str(),
        SERVER_HOST: str(),
        SERVER_MAIL_PORT: port(),
        SERVER_MAIL_SECURE: bool(),
        SERVER_MAIL_USER: str(),
        SERVER_MAIL_PASS: str(),
        DEV_USER_EXPIRE_AFTER: num(),
        PRO_USER_EXPIRE_AFTER: num(),
        DEV_RESET_PASSWORD_TOKEN_EXPIRE_AFTER: str(),
        PRO_RESET_PASSWORD_TOKEN_EXPIRE_AFTER: str(),
        DEF_USER_IMAGE: str(),
        DEF_USER_IMAGE_PATH: str(),
        GCLOUD_STORAGE_IMAGE_BUCKET: str(),
        PROJECT_ID: str(),
    });
}

export default validateEnv;
