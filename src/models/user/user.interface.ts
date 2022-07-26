export enum status {
    ACTIVE = "active",
    BANNED = "banned",
}

export enum type {
    ADMIN = "admin",
    USER = "user",
}

interface User {
    _id: string;
    email: string;
    password: string;
    status: status;
    type: type;
    pseudonym: string;
    createdIn: Date;
}

export default User;
