import { HttpException } from "./http.exception";

export class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, "Token autoryzacji jest nieprawidłowy");
    }
}
