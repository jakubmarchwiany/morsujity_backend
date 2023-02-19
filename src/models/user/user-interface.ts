import { Model, ObjectId, Schema } from "mongoose";

export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
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
    data: ObjectId;
}
export type UserModel = Model<IUser, unknown, unknown>;
