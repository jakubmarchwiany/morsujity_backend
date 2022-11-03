import { IRank } from "./rank-interface";

export interface FullRank {
    N: number;
    name: string;
    image: string;
    maxValue: number;
    subRanks: {
        N: number;
        name: string;
        maxValue: number;
    }[];
}

export const ranks: FullRank[] = [
    {
        N: 0,
        name: "Żelazny Mors",
        image: "",
        maxValue: 20 * 60,
        subRanks: [
            {
                N: 0,
                name: "rybka",
                maxValue: 10 * 60,
            },
            {
                N: 1,
                name: "złota rybka",
                maxValue: 20 * 60,
            },
        ],
    },
    {
        N: 1,
        name: "Brązowy Mors",
        image: "",
        maxValue: 50 * 60,
        subRanks: [
            {
                N: 0,
                name: "rybka Marlin",
                maxValue: 30 * 60,
            },
            {
                N: 1,
                name: "rybka Dory",
                maxValue: 40 * 60,
            },
            {
                N: 2,
                name: "rybka Nemo",
                maxValue: 50 * 60,
            },
        ],
    },
    {
        N: 2,
        name: "Srebrny Mors",
        image: "",
        maxValue: 150 * 60,
        subRanks: [
            {
                N: 0,
                name: "pingwin Szeregowy",
                maxValue: 75 * 60,
            },
            {
                N: 1,
                name: "pingwin Rico",
                maxValue: 100 * 60,
            },
            {
                N: 2,
                name: "pingwin Kowalski",
                maxValue: 125 * 60,
            },
            {
                N: 3,
                name: "pingwin Skipper",
                maxValue: 150 * 60,
            },
        ],
    },
    {
        N: 3,
        name: "Złoty Mors",
        image: "",
        maxValue: 225 * 60,
        subRanks: [
            {
                N: 0,
                name: "młoda foka",
                maxValue: 175 * 60,
            },
            {
                N: 1,
                name: "foka",
                maxValue: 200 * 60,
            },
            {
                N: 2,
                name: "starsza foka",
                maxValue: 225 * 60,
            },
        ],
    },
    {
        N: 4,
        name: "Platynowy Mors",
        image: "",
        maxValue: 375 * 60,
        subRanks: [
            {
                N: 0,
                name: "młoda foka",
                maxValue: 275 * 60,
            },
            {
                N: 1,
                name: "foka",
                maxValue: 325 * 60,
            },
            {
                N: 2,
                name: "starsza foka",
                maxValue: 375 * 60,
            },
        ],
    },
    {
        N: 5,
        name: "Diamentowy Mors",
        image: "",
        maxValue: 525 * 60,
        subRanks: [
            {
                N: 0,
                name: "młody mors",
                maxValue: 425 * 60,
            },
            {
                N: 1,
                name: "mors",
                maxValue: 475 * 60,
            },
            {
                N: 2,
                name: "starszy mors",
                maxValue: 525 * 60,
            },
        ],
    },
    {
        N: 6,
        name: "Szmaragdowy Mors",
        image: "",
        maxValue: 675 * 60,
        subRanks: [
            {
                N: 0,
                name: "rekin biały",
                maxValue: 575 * 60,
            },
            {
                N: 1,
                name: "rekin tygrysi",
                maxValue: 625 * 60,
            },
            {
                N: 2,
                name: "rekin błękitny",
                maxValue: 675 * 60,
            },
        ],
    },
    {
        N: 7,
        name: "Boski Mors",
        image: "",
        maxValue: 1300 * 60,
        subRanks: [
            {
                N: 0,
                name: "Lir",
                maxValue: 800 * 60,
            },
            {
                N: 1,
                name: "Ea",
                maxValue: 925 * 60,
            },
            {
                N: 2,
                name: "Nammu",
                maxValue: 1050 * 60,
            },
            {
                N: 3,
                name: "Neptun",
                maxValue: 1175 * 60,
            },
            {
                N: 4,
                name: "Posejdon",
                maxValue: 1300 * 60,
            },
        ],
    },
];

export const firstRank: IRank = {
    N: ranks[0].N,
    name: ranks[0].name,
    image: ranks[0].image,
    subRank: {
        N: ranks[0].subRanks[0].N,
        name: ranks[0].subRanks[0].name,
    },
};
