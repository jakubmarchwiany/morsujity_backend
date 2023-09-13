interface DataStoredInToken {
    _id: string;
    data: string;
}
interface TokenData {
    token: string;
    expiresIn: number;
}

export { DataStoredInToken, TokenData };

