import { HttpException } from "./http.exception";

export class EmailVerificationNotFoundOrExpired extends HttpException {
    constructor() {
        super(400, `Nie istnieje token weryfikacji lub wygasł`);
    }
}
