import { Model } from "mongoose";
import { IStatistics } from "./statistic/statistics-interface";

export enum UserStatus {
    ACTIVE = "active",
    BANNED = "banned",
}

export enum UserType {
    ADMIN = "admin",
    USER = "user",
}

export interface IUser {
    _id: string;
    email: string;
    password: string | undefined;
    status: UserStatus;
    type: UserType;
    pseudonym: string;
    image: string;
    statistics: IStatistics;
    createdIn: Date;
}
export type UserModel = Model<IUser, unknown, unknown>;
