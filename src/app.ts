import AuthenticationController from "./controllers/authentication_controller";
import GroupController from "./controllers/group_controller";
import UserController from "./controllers/user_controller";
import Server from "./server";
import validateEnv from "./utils/validate_env";

validateEnv();

const app = new Server([
    new AuthenticationController(),
    new UserController(),
    new GroupController(),
]);

app.listen();
