import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import AccountController from "./controllers/account.controller";
import AuthenticationController from "./controllers/authentication.controller";

validateEnv();

const app = new App([new AuthenticationController(),new AccountController()]);

app.listen();
