import { Types } from "mongoose";

interface TmpHash {
    expireIn?: Date;
    hash: string;
    accountRef: Types.ObjectId;
}

export default TmpHash;
