import { Types } from "mongoose";

interface TmpHash {
    hash: string;
    accountRef: Types.ObjectId;
}

export default TmpHash;
