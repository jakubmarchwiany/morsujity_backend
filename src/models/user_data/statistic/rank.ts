import { InferSchemaType, Schema } from "mongoose";

const rankSchema = new Schema(
    {
        N: { type: Number, required: true },
        name: { type: String, required: true },
        maxValue: { type: Number, required: true }
    },
    { _id: false }
);

type Rank = InferSchemaType<typeof rankSchema>;

export { Rank, rankSchema };
