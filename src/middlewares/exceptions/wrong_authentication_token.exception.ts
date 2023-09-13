import { HttpException } from "./http_exception.exception";

export class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, "Token autoryzacji jest nieprawidłowy");
    }
}
