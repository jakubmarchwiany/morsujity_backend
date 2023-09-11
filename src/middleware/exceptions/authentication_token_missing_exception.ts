import HttpException from "./http_exception";

class AuthenticationTokenMissingException extends HttpException {
    constructor() {
        super(401, "Brak tokenu autoryzacji");
    }
}
export default AuthenticationTokenMissingException;
