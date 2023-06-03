import AuthenticationController from "./controllers/authentication-controller";
import GroupController from "./controllers/group_controller";
import UserController from "./controllers/user-controller";
import Server from "./server";
import validateEnv from "./utils/validate-env";

validateEnv();

const app = new Server([
    new AuthenticationController(),
    new UserController(),
    new GroupController(),
]);

app.listen();
