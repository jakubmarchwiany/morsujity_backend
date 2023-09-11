import { InferSchemaType, Schema } from "mongoose";

export const rankSchema = new Schema(
    {
        N: { type: Number, required: true },
        name: { type: String, required: true },
        maxValue: { type: Number, required: true },
    },
    { _id: false }
);

export type Rank = InferSchemaType<typeof rankSchema>;
