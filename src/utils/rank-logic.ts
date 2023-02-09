import { IRank } from "../models/user-data/statistic/rank-interface";
import { ranks } from "../models/user-data/statistic/ranks-data";

export function rankUp(userRank: IRank, totalTime: number): IRank {
    for (let i = userRank.N; i < ranks.length; i++) {
        if (totalTime < ranks[i].maxValue) {
            for (let j = userRank.subRank.N; j < ranks[i].subRanks.length; j++) {
                if (totalTime < ranks[i].subRanks[j].maxValue) {
                    return {
                        N: i,
                        name: ranks[i].name,
                        image: ranks[i].image,
                        subRank: { N: j, name: ranks[i].subRanks[j].name },
                    };
                }
            }
            break;
        }
    }
}

export function rankDown(userRank: IRank, totalTime: number): IRank {
    for (let i = userRank.N; i >= 0; i--) {
        if (i == 0 || totalTime > ranks[i - 1].maxValue) {
            for (let j = userRank.subRank.N; j >= 0; j--) {
                if (j == 0 || totalTime > ranks[i].subRanks[j - 1].maxValue) {
                    return {
                        N: i,
                        name: ranks[i].name,
                        image: ranks[i].image,
                        subRank: { N: j, name: ranks[i].subRanks[j].name },
                    };
                }
            }
            break;
        }
    }
}
