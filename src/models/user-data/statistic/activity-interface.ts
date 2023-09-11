import { InferSchemaType, Schema } from "mongoose";

export enum ActivityTypes {
    ColdShower,
    WinterSwiming,
}

export const activitySchema = new Schema({
    activityType: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
});

export type Activity = InferSchemaType<typeof activitySchema>;
