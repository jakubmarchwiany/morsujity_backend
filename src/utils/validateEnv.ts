import { cleanEnv, port, str } from "envalid";

function validateEnv() {
    cleanEnv(process.env, {
        SERVER_PORT: port(),
        FRONT_ENDPOINT: str(),
        WHITELISTED_DOMAINS: str(),

        MONGO_USER: str(),
        MONGO_PASSWORD: str(),
        MONGO_PATH: str(),
        MONGO_LOCAL_PATH: str(),

        JWT_SECRET: str(),

        SERVER_HOST: str(),
        SERVER_MAIL_PORT: port(),
        SERVER_MAIL_USER: str(),
        SERVER_MAIL_PASS: str(),
    });
}

export default validateEnv;
