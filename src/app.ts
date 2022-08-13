import "dotenv/config";
import validateEnv from "./utils/validateEnv";

import Server from "./server";
import AuthenticationController from "./controllers/authentication.controller";
import UserController from "./controllers/user.controller";

validateEnv();

const app = new Server([new AuthenticationController(), new UserController()]);

app.listen();
