import { HttpException } from "./http_exception.exception";

export class WrongCredentialsException extends HttpException {
    constructor() {
        super(400, "Podano nieprawidłowe dane uwierzytelniające");
    }
}
