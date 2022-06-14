import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import AccountController from "./controllers/account.controller";

validateEnv();

const app = new App([new AccountController()]);

app.listen();
