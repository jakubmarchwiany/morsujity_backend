import { Schema } from "mongoose";

export interface IActivity {
    isMors: boolean;
    duration: number;
    date: Date;
}

export const activitySchema = new Schema<IActivity>({
    isMors: Boolean,
    date: Date,
    duration: Number,
});
