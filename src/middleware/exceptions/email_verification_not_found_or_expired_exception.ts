import HttpException from "./http_exception";

class EmailVerificationNotFoundOrExpired extends HttpException {
    constructor() {
        super(400, `Nie istnieje token weryfikacji lub wygasł`);
    }
}
export default EmailVerificationNotFoundOrExpired;
