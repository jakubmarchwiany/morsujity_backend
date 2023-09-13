import { HttpException } from "./http_exception.exception";

export class AuthenticationTokenMissingException extends HttpException {
    constructor() {
        super(401, "Brak tokenu autoryzacji");
    }
}

