import HttpException from "./http-exception";

class AuthenticationTokenMissingException extends HttpException {
    constructor() {
        super(401, "Brak tokenu autoryzacji");
    }
}
export default AuthenticationTokenMissingException;
