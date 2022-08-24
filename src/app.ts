import "dotenv/config";
import AuthenticationController from "./controllers/authentication-controller";
import UserController from "./controllers/user-controller";
import Server from "./server";
import validateEnv from "./utils/validate-env";

validateEnv();

const app = new Server([new AuthenticationController(), new UserController()]);

app.listen();
