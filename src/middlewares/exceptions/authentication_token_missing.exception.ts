import { HttpException } from "./http.exception";

export class AuthenticationTokenMissingException extends HttpException {
    constructor() {
        super(401, "Brak tokenu autoryzacji");
    }
}
