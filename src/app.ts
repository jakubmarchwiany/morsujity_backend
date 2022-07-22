import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import Server from "./server";
import UserController from "./controllers/user.controller";
import AuthenticationController from "./controllers/authentication.controller";

validateEnv();

const app = new Server([new AuthenticationController(), new UserController()]);

app.listen();
