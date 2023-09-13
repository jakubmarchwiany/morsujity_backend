import { InferSchemaType, Schema } from "mongoose";

enum ActivityTypes {
    ColdShower,
    WinterSwiming,
}

const activitySchema = new Schema({
    activityType: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
});

type Activity = InferSchemaType<typeof activitySchema>;

export { Activity, ActivityTypes, activitySchema };

