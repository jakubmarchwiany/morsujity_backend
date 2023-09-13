import { AuthController } from "./controllers/auth.controller";
import { GroupController } from "./controllers/group.controller";
import { UserController } from "./controllers/user.controller";
import { Server } from "./server";

new Server([new AuthController(), new UserController(), new GroupController()]).listen();
