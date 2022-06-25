import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import Server from "./server";
import AccountController from "./controllers/account.controller";
import AuthenticationController from "./controllers/authentication.controller";

validateEnv();

const app = new Server([new AuthenticationController(), new AccountController()]);

app.listen();
