import HttpException from "./HttpException";

class WrongAuthenticationTokenException extends HttpException {
    constructor() {
        super(401, "Token autoryzacji jest nieprawidłowy");
    }
}

export default WrongAuthenticationTokenException;
