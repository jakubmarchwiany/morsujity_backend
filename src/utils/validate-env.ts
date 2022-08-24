import { cleanEnv, num, port, str } from "envalid";

function validateEnv() {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ["development", "production"] }),

        PORT: port(),
        PROJECT_ID: str(),
        KEY_FILE_NAME: str(),

        DEV_FRONT_URL_ADDRESS: str(),
        PRO_FRONT_URL_ADDRESS: str(),

        DEV_WHITELISTED_DOMAINS: str(),
        PRO_WHITELISTED_DOMAINS: str(),

        DEV_MONGO_PATH: str(),
        PRO_MONGO_PATH: str(),

        JWT_SECRET: str(),

        SERVER_MAIL_HOST: str(),
        SERVER_MAIL_USER: str(),
        SERVER_MAIL_PASS: str(),

        DEV_USER_EXPIRE_AFTER: num(),
        PRO_USER_EXPIRE_AFTER: num(),

        GCLOUD_STORAGE_IMAGE_BUCKET: str(),
        DEF_USER_IMAGE: str(),
        DEF_USER_IMAGE_PATH: str(),

        DEV_RESET_PASSWORD_TOKEN_EXPIRE_AFTER: str(),
        PRO_RESET_PASSWORD_TOKEN_EXPIRE_AFTER: str(),
    });
}
export default validateEnv;
