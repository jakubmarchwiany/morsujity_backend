import { HttpException } from "./http.exception";

export class UserWithThatEmailAlreadyExistsException extends HttpException {
    constructor(email: string) {
        super(400, `Użytkownik o takim email "${email}" już istnieje`);
    }
}
