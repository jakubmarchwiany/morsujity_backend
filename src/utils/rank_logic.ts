import { Rank } from "../models/user_data/statistic/rank";
import { RANKS, SUBRANKS } from "../models/user_data/statistic/ranks_data";

function rankUp(currentRank: Rank, currentSubRank: Rank, totalTime: number) {
    let newRanks: [Rank, Rank] = [currentRank, currentSubRank];
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

function rankDown(currentRank: Rank, currentSubRank: Rank, totalTime: number) {
    let newRanks: [Rank, Rank] = [currentRank, currentSubRank];

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

export { rankDown, rankUp };
