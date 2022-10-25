export {};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";

            PORT: string;
            PROJECT_ID: string;
            KEY_FILE_NAME: string;

            DEV_FRONT_URL_ADDRESS: string;
            PRO_FRONT_URL_ADDRESS: string;

            DEV_WHITELISTED_DOMAINS: string;
            PRO_WHITELISTED_DOMAINS: string;

            DEV_MONGO_PATH: string;
            PRO_MONGO_PATH: string;

            JWT_SECRET: string;

            SERVER_MAIL_HOST: string;
            SERVER_MAIL_USER: string;
            SERVER_MAIL_PASS: string;

            AWS_SENDER_ADDRESS: string;
            AWS_ACCESS_KEY_ID: string;
            AWS_ACCESS_KEY: string;

            DEV_USER_EXPIRE_AFTER: string;
            PRO_USER_EXPIRE_AFTER: string;

            GCLOUD_STORAGE_IMAGE_BUCKET: string;
            DEF_USER_IMAGE: string;
            DEF_USER_IMAGE_PATH: string;

            DEV_RESET_PASSWORD_TOKEN_EXPIRE_AFTER: string;
            PRO_RESET_PASSWORD_TOKEN_EXPIRE_AFTER: string;
        }
    }
}
