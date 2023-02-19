import HttpException from "./http-exception";

class WrongCredentialsException extends HttpException {
    constructor() {
        super(400, "Podano nieprawidłowe dane uwierzytelniające");
    }
}
export default WrongCredentialsException;
