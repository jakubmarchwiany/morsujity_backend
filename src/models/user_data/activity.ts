import { InferSchemaType, Schema, model } from "mongoose";

enum ActivityTypes {
    ColdShower,
    WinterSwiming,
}

const activitySchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    type: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    duration: { type: Number, required: true },
});

type Activity = InferSchemaType<typeof activitySchema>;
const ActivityModel = model("Activity", activitySchema);

export { Activity, ActivityModel, ActivityTypes, activitySchema };
