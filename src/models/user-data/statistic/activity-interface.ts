import { Schema } from "mongoose";

export interface IActivity {
    _id?: string;
    isMors: boolean;
    duration: number;
    date: Date;
}

export const activitySchema = new Schema<IActivity>({
    isMors: Boolean,
    date: Date,
    duration: Number,
});
