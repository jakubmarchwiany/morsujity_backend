import { HttpException } from "./http_exception.exception";

export class EmailVerificationNotFoundOrExpired extends HttpException {
    constructor() {
        super(400, `Nie istnieje token weryfikacji lub wygasł`);
    }
}
