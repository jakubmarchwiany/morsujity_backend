export {};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            NODE_ENV: "development" | "production";

            // frontend url address
            FRONT_URL_ADDRESS: string;

            // CORS Options
            WHITELISTED_DOMAINS: string;

            // MongoDB configuration
            MONGO_URL: string;

            // Authentication configuration
            JWT_SECRET: string;

            // E-mail bot configuration
            MAIL_HOST: string;
            MAIL_PORT: string;
            MAIL_USER: string;
            MAIL_PASS: string;
            MAIL_FROM: string;

            // Variables USER
            USER_EXPIRE_AFTER: string;
            AUTHENTICATION_TOKEN_EXPIRE_AFTER: string;

            // ResetPasswordToken
            RESET_PASSWORD_TOKEN_EXPIRE_AFTER: string;

            // Google console configuration
            PROJECT_ID: string;
            KEY_FILE_NAME: string;
            GCLOUD_STORAGE_IMAGE_BUCKET: string;
            DEF_USER_IMAGE: string;
        }
    }
}
