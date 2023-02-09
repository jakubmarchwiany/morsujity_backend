import { Schema } from "mongoose";

export interface IRank {
    N: number;
    name: string;
    image: string;
    subRank: {
        N: number;
        name: string;
    };
}

export const rankSchema = new Schema<IRank>(
    {
        N: Number,
        name: String,
        image: String,
        subRank: {
            _id: false,
            N: Number,
            name: String,
        },
    },
    { _id: false },
);
