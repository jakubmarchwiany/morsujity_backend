import { Schema } from "mongoose";

export interface IRank {
    N: number;
    name: string;
    maxValue: number;
}

export const rankSchema = new Schema<IRank>(
    {
        N: Number,
        name: String,
        maxValue: Number,
    },
    { _id: false }
);
