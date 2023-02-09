import { Model } from "mongoose";
import { IStatistics } from "./statistic/statistics-interface";

export interface IUserData {
    _id: string;
    pseudonym: string;
    image: string;
    statistics: IStatistics;
    createdIn: Date;
}
export type UserDataModel = Model<IUserData, unknown, unknown>;
