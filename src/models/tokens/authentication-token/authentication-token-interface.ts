import { ObjectId } from "mongoose";

export interface DataStoredInToken {
    _id: string;
    data: string;
}

export interface TokenData {
    token: string;
    expiresIn: number;
}

export interface IAuthenticationToken {
    _id: string;
    token: string;
    owner: ObjectId;
    expireIn: Date;
}
