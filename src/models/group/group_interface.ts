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

export type IGroup = {
    _id: Types.ObjectId;
    status: GroupStatus;
    name: String;
    description: String;
    coordinates: Types.Array<[Number, Number]>;
    requestsToJoin: Types.Array<Types.ObjectId>;
    // activeMors: [
    //     {
    //         type: Schema.Types.ObjectId;
    //         ref: "PublicMors";
    //     }
    // ];
    // archiveMors: [
    //     {
    //         type: Schema.Types.ObjectId;
    //         ref: "ArchiveMors";
    //     }
    // ];
    members: Types.DocumentArray<IGroupMember>;
};

export type GroupModel = Model<IGroup, unknown, unknown>;
