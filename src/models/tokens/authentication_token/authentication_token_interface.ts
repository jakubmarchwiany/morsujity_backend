
export interface DataStoredInToken {
    _id: string;
    data: string;
}

export interface TokenData {
    token: string;
    expiresIn: number;
}
