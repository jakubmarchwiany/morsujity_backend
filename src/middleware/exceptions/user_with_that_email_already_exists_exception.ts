import HttpException from "./http_exception";

class UserWithThatEmailAlreadyExistsException extends HttpException {
    constructor(email: string) {
        super(400, `Użytkownik o takim email "${email}" już istnieje`);
    }
}
export default UserWithThatEmailAlreadyExistsException;
