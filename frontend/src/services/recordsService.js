import { getRecord as getReactionRushRecord } from './reactionRushService.js';
import { getRecord as getNumberNinjaRecord } from './numberNinjaService.js';
import { getRecord as getTypeStormRecord } from './typeStormService.js';
import { getRecord as getWhackAttackRecord } from './whackAttackService.js';
import { getOverview as getSequenceMasterOverview } from './sequenceMasterService.js';
import { getOverview as getMemoryMadnessOverview } from './memoryMadnessService.js';
import { getBrowserId } from '../utils/browserId.js';

export const CANONICAL_GAMES = [
  { key: 'reactionRush', id: 'reaction-rush', name: 'Reaction Rush', isPointsBased: false },
  { key: 'numberNinja', id: 'number-ninja', name: 'Number Ninja', isPointsBased: false },
  { key: 'typeStorm', id: 'type-storm', name: 'TypeStorm', isPointsBased: false },
  { key: 'whackAttack', id: 'whack-attack', name: 'Whack Attack', isPointsBased: true },
  { key: 'sequenceMaster', id: 'sequence-master', name: 'Sequence Master', isPointsBased: true },
  { key: 'memoryMadness', id: 'memory-madness', name: 'Memory Madness', isPointsBased: true },
];

/**
 * Normalizes Reaction Rush response.
 */
export function normalizeReactionRush(settledResult) {
  if (settledResult.status === 'rejected') {
    return {
      id: 'reaction-rush',
      name: 'Reaction Rush',
      played: false,
      totalGamesPlayed: 0,
      stats: null,
      updatedAt: null,
      raw: null,
      error: settledResult.reason?.message || 'Failed to retrieve Reaction Rush record'
    };
  }

  const dto = settledResult.value;
  if (!dto) {
    return {
      id: 'reaction-rush',
      name: 'Reaction Rush',
      played: false,
      totalGamesPlayed: 0,
      stats: {
        bestReactionMs: null,
        averageReactionMs: null,
        totalSessions: 0
      },
      updatedAt: null,
      raw: null,
      error: null
    };
  }

  const sessions = Number(dto.totalSessions) || 0;
  return {
    id: 'reaction-rush',
    name: 'Reaction Rush',
    played: sessions > 0,
    totalGamesPlayed: sessions,
    stats: {
      bestReactionMs: dto.bestReactionMs ?? null,
      averageReactionMs: dto.averageReactionMs ?? null,
      totalSessions: sessions
    },
    updatedAt: dto.updatedAt || null,
    raw: dto,
    error: null
  };
}

/**
 * Normalizes Number Ninja response.
 */
export function normalizeNumberNinja(settledResult) {
  if (settledResult.status === 'rejected') {
    return {
      id: 'number-ninja',
      name: 'Number Ninja',
      played: false,
      totalGamesPlayed: 0,
      stats: null,
      updatedAt: null,
      raw: null,
      error: settledResult.reason?.message || 'Failed to retrieve Number Ninja record'
    };
  }

  const dto = settledResult.value;
  if (!dto) {
    return {
      id: 'number-ninja',
      name: 'Number Ninja',
      played: false,
      totalGamesPlayed: 0,
      stats: {
        bestGuesses: null,
        bestWinStreak: 0,
        currentWinStreak: 0,
        totalGamesWon: 0,
        winPercentage: 0.0,
        averageGuessesPerWin: 0.0
      },
      updatedAt: null,
      raw: null,
      error: null
    };
  }

  const played = Number(dto.totalGamesPlayed) || 0;
  return {
    id: 'number-ninja',
    name: 'Number Ninja',
    played: played > 0,
    totalGamesPlayed: played,
    stats: {
      bestGuesses: dto.bestGuesses ?? null,
      bestWinStreak: Number(dto.bestWinStreak) || 0,
      currentWinStreak: Number(dto.currentWinStreak) || 0,
      totalGamesWon: Number(dto.totalGamesWon) || 0,
      winPercentage: Number(dto.winPercentage) || 0.0,
      averageGuessesPerWin: Number(dto.averageGuessesPerWin) || 0.0
    },
    updatedAt: dto.updatedAt || null,
    raw: dto,
    error: null
  };
}

/**
 * Normalizes TypeStorm response.
 */
export function normalizeTypeStorm(settledResult) {
  if (settledResult.status === 'rejected') {
    return {
      id: 'type-storm',
      name: 'TypeStorm',
      played: false,
      totalGamesPlayed: 0,
      stats: null,
      updatedAt: null,
      raw: null,
      error: settledResult.reason?.message || 'Failed to retrieve TypeStorm record'
    };
  }

  const dto = settledResult.value;
  if (!dto) {
    return {
      id: 'type-storm',
      name: 'TypeStorm',
      played: false,
      totalGamesPlayed: 0,
      stats: {
        bestWpm: null,
        averageWpm: 0.0,
        bestAccuracy: null,
        averageAccuracy: 0.0,
        totalCharactersTyped: 0,
        totalMistakes: 0
      },
      updatedAt: null,
      raw: null,
      error: null
    };
  }

  const played = Number(dto.totalGamesPlayed) || 0;
  return {
    id: 'type-storm',
    name: 'TypeStorm',
    played: played > 0,
    totalGamesPlayed: played,
    stats: {
      bestWpm: dto.bestWpm ?? null,
      averageWpm: Number(dto.averageWpm) || 0.0,
      bestAccuracy: dto.bestAccuracy ?? null,
      averageAccuracy: Number(dto.averageAccuracy) || 0.0,
      totalCharactersTyped: Number(dto.totalCharactersTyped) || 0,
      totalMistakes: Number(dto.totalMistakes) || 0
    },
    updatedAt: dto.updatedAt || null,
    raw: dto,
    error: null
  };
}

/**
 * Normalizes Whack Attack response.
 */
export function normalizeWhackAttack(settledResult) {
  if (settledResult.status === 'rejected') {
    return {
      id: 'whack-attack',
      name: 'Whack Attack',
      played: false,
      totalGamesPlayed: 0,
      stats: null,
      updatedAt: null,
      raw: null,
      error: settledResult.reason?.message || 'Failed to retrieve Whack Attack record'
    };
  }

  const dto = settledResult.value;
  if (!dto) {
    return {
      id: 'whack-attack',
      name: 'Whack Attack',
      played: false,
      totalGamesPlayed: 0,
      stats: {
        highestScore: 0,
        averageScore: 0.0,
        bestAccuracy: null,
        averageAccuracy: 0.0,
        bestCombo: 0,
        totalHits: 0,
        totalMissedTargets: 0,
        totalEmptyClicks: 0
      },
      updatedAt: null,
      raw: null,
      error: null
    };
  }

  const played = Number(dto.totalGamesPlayed) || 0;
  return {
    id: 'whack-attack',
    name: 'Whack Attack',
    played: played > 0,
    totalGamesPlayed: played,
    stats: {
      highestScore: Number(dto.highestScore) || 0,
      averageScore: Number(dto.averageScore) || 0.0,
      bestAccuracy: dto.bestAccuracy ?? null,
      averageAccuracy: Number(dto.averageAccuracy) || 0.0,
      bestCombo: Number(dto.bestCombo) || 0,
      totalHits: Number(dto.totalHits) || 0,
      totalMissedTargets: Number(dto.totalMissedTargets) || 0,
      totalEmptyClicks: Number(dto.totalEmptyClicks) || 0
    },
    updatedAt: dto.updatedAt || null,
    raw: dto,
    error: null
  };
}

/**
 * Helper to normalize a single difficulty record for Sequence Master.
 */
function normalizeSequenceDifficulty(diffDto) {
  if (!diffDto) {
    return {
      played: false,
      totalGamesPlayed: 0,
      stats: {
        highestScore: 0,
        averageScore: 0.0,
        highestSequenceLength: 0,
        averageSequenceLength: 0.0,
        totalCompletedRounds: 0,
        totalCorrectTileInputs: 0
      },
      updatedAt: null,
      raw: null
    };
  }

  const played = Number(diffDto.totalGamesPlayed) || 0;
  return {
    played: played > 0,
    totalGamesPlayed: played,
    stats: {
      highestScore: Number(diffDto.highestScore) || 0,
      averageScore: Number(diffDto.averageScore) || 0.0,
      highestSequenceLength: Number(diffDto.highestSequenceLength) || 0,
      averageSequenceLength: Number(diffDto.averageSequenceLength) || 0.0,
      totalCompletedRounds: Number(diffDto.totalCompletedRounds) || 0,
      totalCorrectTileInputs: Number(diffDto.totalCorrectTileInputs) || 0
    },
    updatedAt: diffDto.updatedAt || null,
    raw: diffDto
  };
}

/**
 * Normalizes Sequence Master response (with Easy, Medium, Hard).
 */
export function normalizeSequenceMaster(settledResult) {
  if (settledResult.status === 'rejected') {
    return {
      id: 'sequence-master',
      name: 'Sequence Master',
      played: false,
      totalGamesPlayed: 0,
      difficulties: {
        easy: normalizeSequenceDifficulty(null),
        medium: normalizeSequenceDifficulty(null),
        hard: normalizeSequenceDifficulty(null)
      },
      raw: null,
      error: settledResult.reason?.message || 'Failed to retrieve Sequence Master records'
    };
  }

  const overview = settledResult.value;
  const easy = normalizeSequenceDifficulty(overview?.easy);
  const medium = normalizeSequenceDifficulty(overview?.medium);
  const hard = normalizeSequenceDifficulty(overview?.hard);

  const totalGamesPlayed = easy.totalGamesPlayed + medium.totalGamesPlayed + hard.totalGamesPlayed;

  return {
    id: 'sequence-master',
    name: 'Sequence Master',
    played: totalGamesPlayed > 0,
    totalGamesPlayed,
    difficulties: {
      easy,
      medium,
      hard
    },
    raw: overview || null,
    error: null
  };
}

/**
 * Helper to normalize a single difficulty record for Memory Madness.
 */
function normalizeMemoryDifficulty(diffDto) {
  if (!diffDto) {
    return {
      played: false,
      totalGamesPlayed: 0,
      stats: {
        bestScore: 0,
        averageScore: 0.0,
        bestCompletionTime: null,
        averageCompletionTime: null,
        bestMoveCount: null,
        averageMoveCount: null,
        bestAccuracy: null,
        averageAccuracy: 0.0,
        totalPairsMatched: 0
      },
      updatedAt: null,
      raw: null
    };
  }

  const played = Number(diffDto.totalGamesPlayed) || 0;
  return {
    played: played > 0,
    totalGamesPlayed: played,
    stats: {
      bestScore: Number(diffDto.bestScore) || 0,
      averageScore: Number(diffDto.averageScore) || 0.0,
      bestCompletionTime: diffDto.bestCompletionTime ?? null,
      averageCompletionTime: diffDto.averageCompletionTime ?? null,
      bestMoveCount: diffDto.bestMoveCount ?? null,
      averageMoveCount: diffDto.averageMoveCount ?? null,
      bestAccuracy: diffDto.bestAccuracy ?? null,
      averageAccuracy: Number(diffDto.averageAccuracy) || 0.0,
      totalPairsMatched: Number(diffDto.totalPairsMatched) || 0
    },
    updatedAt: diffDto.updatedAt || null,
    raw: diffDto
  };
}

/**
 * Normalizes Memory Madness response (with Easy, Medium, Hard).
 */
export function normalizeMemoryMadness(settledResult) {
  if (settledResult.status === 'rejected') {
    return {
      id: 'memory-madness',
      name: 'Memory Madness',
      played: false,
      totalGamesPlayed: 0,
      difficulties: {
        easy: normalizeMemoryDifficulty(null),
        medium: normalizeMemoryDifficulty(null),
        hard: normalizeMemoryDifficulty(null)
      },
      raw: null,
      error: settledResult.reason?.message || 'Failed to retrieve Memory Madness records'
    };
  }

  const overview = settledResult.value;
  const easy = normalizeMemoryDifficulty(overview?.easy);
  const medium = normalizeMemoryDifficulty(overview?.medium);
  const hard = normalizeMemoryDifficulty(overview?.hard);

  const totalGamesPlayed = easy.totalGamesPlayed + medium.totalGamesPlayed + hard.totalGamesPlayed;

  return {
    id: 'memory-madness',
    name: 'Memory Madness',
    played: totalGamesPlayed > 0,
    totalGamesPlayed,
    difficulties: {
      easy,
      medium,
      hard
    },
    raw: overview || null,
    error: null
  };
}

/**
 * Calculates platform-level metrics across all normalized games.
 */
export function calculatePlatformStatistics(games) {
  let totalGamesPlayed = 0;
  let gamesExploredCount = 0;
  const failedGames = [];

  let mostPlayedGame = null;
  let maxPlayedCount = 0;
  const tiedGames = [];

  for (const item of CANONICAL_GAMES) {
    const game = games[item.key];
    if (!game) continue;

    if (game.error) {
      failedGames.push(item.key);
      continue;
    }

    const count = Number(game.totalGamesPlayed) || 0;
    totalGamesPlayed += count;

    if (game.played && count > 0) {
      gamesExploredCount++;
    }

    if (count > maxPlayedCount) {
      maxPlayedCount = count;
      mostPlayedGame = {
        id: item.id,
        name: item.name,
        totalGamesPlayed: count
      };
      tiedGames.length = 0;
      tiedGames.push(item.id);
    } else if (count === maxPlayedCount && count > 0) {
      tiedGames.push(item.id);
    }
  }

  // Combined arcade points from points-based games:
  // Whack Attack (highestScore) + Sequence Master (highestScore per diff) + Memory Madness (bestScore per diff)
  const whackPts = games.whackAttack?.stats?.highestScore || 0;

  const seqEasy = games.sequenceMaster?.difficulties?.easy?.stats?.highestScore || 0;
  const seqMed = games.sequenceMaster?.difficulties?.medium?.stats?.highestScore || 0;
  const seqHard = games.sequenceMaster?.difficulties?.hard?.stats?.highestScore || 0;
  const seqTotal = seqEasy + seqMed + seqHard;

  const memEasy = games.memoryMadness?.difficulties?.easy?.stats?.bestScore || 0;
  const memMed = games.memoryMadness?.difficulties?.medium?.stats?.bestScore || 0;
  const memHard = games.memoryMadness?.difficulties?.hard?.stats?.bestScore || 0;
  const memTotal = memEasy + memMed + memHard;

  const combinedArcadePoints = whackPts + seqTotal + memTotal;

  // Determine overall status
  let status = 'COMPLETE_SUCCESS';
  let errorMessage = null;

  if (failedGames.length === CANONICAL_GAMES.length) {
    status = 'COMPLETE_FAILURE';
    errorMessage = 'Failed to load records for all games. Please check your connection.';
  } else if (failedGames.length > 0) {
    status = 'PARTIAL_SUCCESS';
    errorMessage = `Records could not be loaded for: ${failedGames.join(', ')}`;
  }

  return {
    totalGamesPlayed,
    gamesExplored: {
      played: gamesExploredCount,
      total: CANONICAL_GAMES.length,
      percentage: Math.round((gamesExploredCount / CANONICAL_GAMES.length) * 1000) / 10
    },
    mostPlayedGame: mostPlayedGame ? {
      ...mostPlayedGame,
      isTied: tiedGames.length > 1,
      tiedGameIds: tiedGames.length > 1 ? [...tiedGames] : []
    } : null,
    combinedArcadePoints,
    combinedArcadePointsBreakdown: {
      whackAttack: whackPts,
      sequenceMaster: {
        easy: seqEasy,
        medium: seqMed,
        hard: seqHard,
        total: seqTotal
      },
      memoryMadness: {
        easy: memEasy,
        medium: memMed,
        hard: memHard,
        total: memTotal
      }
    },
    status,
    failedGames,
    hasError: failedGames.length > 0,
    errorMessage
  };
}

/**
 * Fetch and aggregate records for all six games for a given browserId.
 * @param {string} [browserId] - Optional browser ID, defaults to getBrowserId()
 * @returns {Promise<{ summary: object, games: object }>}
 */
export async function getRecordsOverview(browserId) {
  const targetBrowserId = browserId || getBrowserId();

  const [
    rrSettled,
    nnSettled,
    tsSettled,
    waSettled,
    smSettled,
    mmSettled
  ] = await Promise.allSettled([
    getReactionRushRecord(targetBrowserId),
    getNumberNinjaRecord(targetBrowserId),
    getTypeStormRecord(targetBrowserId),
    getWhackAttackRecord(targetBrowserId),
    getSequenceMasterOverview(targetBrowserId),
    getMemoryMadnessOverview(targetBrowserId)
  ]);

  const games = {
    reactionRush: normalizeReactionRush(rrSettled),
    numberNinja: normalizeNumberNinja(nnSettled),
    typeStorm: normalizeTypeStorm(tsSettled),
    whackAttack: normalizeWhackAttack(waSettled),
    sequenceMaster: normalizeSequenceMaster(smSettled),
    memoryMadness: normalizeMemoryMadness(mmSettled)
  };

  const summary = calculatePlatformStatistics(games);

  return {
    summary,
    games
  };
}
