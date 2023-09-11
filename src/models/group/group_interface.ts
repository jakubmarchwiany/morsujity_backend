import { Model, ObjectId, Schema, Types } from "mongoose";

export enum GroupStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export enum GroupPermission {
    ADMIN = "Admin",
    PRO = "Pro",
    CASUAL = "Casual",
}

export type IGroupMember = {
    _id: false;
    member: Types.ObjectId;
    permission: GroupPermission;
    // rank: {
    //     type: Schema.Types.ObjectId;
    //     ref: "Rank";
    // };
    // subRank: {
    //     _id: false;
    //     number: String;
    //     name: String;
    //     minValue: Number;
    //     maxValue: Number;
    // };
    // minutesOfMors: { type: Number; default: 0 };
    // allMors: [Schema.Types.ObjectId];
};
