import { Model } from "mongoose";

export enum UserStatus {
    ACTIVE = "active",
    BANNED = "banned",
}

export enum UserType {
    ADMIN = "admin",
    USER = "user",
}

export interface IUserMethods {
    imageURL(): string;
}

export interface IUser {
    _id: string;
    email: string;
    password: string;
    status: UserStatus;
    type: UserType;
    pseudonym: string;
    image: string;
    createdIn: Date;
}

export type UserModel = Model<IUser, {}, IUserMethods>;
