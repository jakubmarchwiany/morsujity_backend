interface DataStoredInToken {
    userId: string;
    dataId: string;
}
interface TokenData {
    token: string;
    expiresIn: number;
}

export { DataStoredInToken, TokenData };
