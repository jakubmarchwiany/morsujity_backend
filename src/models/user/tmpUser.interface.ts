interface ITmpUser {
    _id: string;
    email: string;
    password: string;
    pseudonym: string;
    expireIn: Date;
}

export default ITmpUser;
