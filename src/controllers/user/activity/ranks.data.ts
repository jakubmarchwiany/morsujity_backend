import { Rank } from "../../../models/user_data/statistic/rank";

const RANKS: Rank[] = [
    {
        N: 0,
        name: "Żelazny Mors",
        maxValue: 20 * 60
    },
    {
        N: 1,
        name: "Brązowy Mors",
        maxValue: 50 * 60
    },
    {
        N: 2,
        name: "Srebrny Mors",
        maxValue: 150 * 60
    },
    {
        N: 3,
        name: "Złoty Mors",
        maxValue: 225 * 60
    },
    {
        N: 4,
        name: "Platynowy Mors",
        maxValue: 375 * 60
    },
    {
        N: 5,
        name: "Diamentowy Mors",
        maxValue: 525 * 60
    },
    {
        N: 6,
        name: "Szmaragdowy Mors",
        maxValue: 675 * 60
    },
    {
        N: 7,
        name: "Boski Mors",
        maxValue: 99999 * 60
    }
];

const SUB_RANKS: Rank[] = [
    {
        N: 0,
        name: "Rybka",
        maxValue: 10 * 60
    },
    {
        N: 1,
        name: "Złota rybka",
        maxValue: 20 * 60
    },
    {
        N: 2,
        name: "Rybka Marlin",
        maxValue: 30 * 60
    },
    {
        N: 3,
        name: "Rybka Dory",
        maxValue: 40 * 60
    },
    {
        N: 4,
        name: "Rybka Nemo",
        maxValue: 50 * 60
    },
    {
        N: 5,
        name: "Pingwin Szeregowy",
        maxValue: 75 * 60
    },
    {
        N: 6,
        name: "Pingwin Rico",
        maxValue: 100 * 60
    },
    {
        N: 7,
        name: "Pingwin Kowalski",
        maxValue: 125 * 60
    },
    {
        N: 8,
        name: "Pingwin Skipper",
        maxValue: 150 * 60
    },
    {
        N: 9,
        name: "Młoda foka",
        maxValue: 175 * 60
    },
    {
        N: 10,
        name: "Foka",
        maxValue: 200 * 60
    },
    {
        N: 11,
        name: "Starsza foka",
        maxValue: 225 * 60
    },
    {
        N: 12,
        name: "Młoda foka",
        maxValue: 275 * 60
    },
    {
        N: 13,
        name: "Foka",
        maxValue: 325 * 60
    },
    {
        N: 14,
        name: "Starsza foka",
        maxValue: 375 * 60
    },
    {
        N: 15,
        name: "Młody mors",
        maxValue: 425 * 60
    },
    {
        N: 16,
        name: "Mors",
        maxValue: 475 * 60
    },
    {
        N: 17,
        name: "Starszy mors",
        maxValue: 525 * 60
    },
    {
        N: 18,
        name: "Rekin biały",
        maxValue: 575 * 60
    },
    {
        N: 19,
        name: "Rekin tygrysi",
        maxValue: 625 * 60
    },
    {
        N: 20,
        name: "Rekin błękitny",
        maxValue: 675 * 60
    },
    {
        N: 21,
        name: "Lir",
        maxValue: 800 * 60
    },
    {
        N: 22,
        name: "Ea",
        maxValue: 925 * 60
    },
    {
        N: 23,
        name: "Nammu",
        maxValue: 1050 * 60
    },
    {
        N: 24,
        name: "Neptun",
        maxValue: 1175 * 60
    },
    {
        N: 25,
        name: "Posejdon",
        maxValue: 99999 * 60
    }
];

const firstRank: Rank = {
    N: RANKS[0].N,
    name: RANKS[0].name,
    maxValue: RANKS[0].maxValue
};

const firstSubRank: Rank = {
    N: SUB_RANKS[0].N,
    name: SUB_RANKS[0].name,
    maxValue: SUB_RANKS[0].maxValue
};

export { RANKS, SUB_RANKS, firstRank, firstSubRank };
