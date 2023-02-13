import { IRank } from "../models/user-data/statistic/rank-interface";
import { RANKS as RANKS, SUBRANKS } from "../models/user-data/statistic/ranks-data";

export function rankUp(currentRank: IRank, currentSubRank: IRank, totalTime: number) {
    let newRanks = [];
    for (let i = currentRank.N; i < RANKS.length; i++) {
        if (totalTime < RANKS[i].maxValue) {
            newRanks[0] = RANKS[i];
            break;
        }
    }

    for (let i = currentSubRank.N; i < SUBRANKS.length; i++) {
        if (totalTime < SUBRANKS[i].maxValue) {
            newRanks[1] = SUBRANKS[i];
            break;
        }
    }

    return newRanks;
}

export function rankDown(currentRank: IRank, currentSubRank: IRank, totalTime: number) {
    let newRanks = [];
    console.log(currentRank, currentSubRank, totalTime);

    for (let i = currentRank.N; i >= 0; i--) {
        if (totalTime >= RANKS[i].maxValue || i == 0) {
            newRanks[0] = RANKS[i];
            break;
        }
    }
    for (let i = currentSubRank.N; i >= 0; i--) {
        if (totalTime >= SUBRANKS[i].maxValue || i == 0) {
            newRanks[1] = SUBRANKS[i];
            break;
        }
    }

    return newRanks;
}