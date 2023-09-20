import { AuthController } from "./controllers/auth/auth.controller";
import { PasswordController } from "./controllers/auth/password.controller";
import { GroupsController } from "./controllers/groups/groups.controller";
import { ActivityController } from "./controllers/user/activity/activity.controller";
import { SettingsController } from "./controllers/user/settings.controller";
import { UserController } from "./controllers/user/user.controller";
import { Server } from "./server";

const server = new Server([
    new AuthController(),
    new PasswordController(),
    new UserController(),
    new ActivityController(),
    new SettingsController(),
    new GroupsController(),
]);

server.listen();
