import { getSessionHistory as getTypeStormSessions } from './typeStormService.js';
import { getSessionHistory as getWhackAttackSessions } from './whackAttackService.js';
import { getSessionHistory as getSequenceMasterSessions } from './sequenceMasterService.js';
import { getSessionHistory as getMemoryMadnessSessions } from './memoryMadnessService.js';
import { getBrowserId } from '../utils/browserId.js';

export const HISTORY_GAMES = [
  { key: 'typeStorm', id: 'type-storm', name: 'TypeStorm' },
  { key: 'whackAttack', id: 'whack-attack', name: 'Whack Attack' },
  { key: 'sequenceMaster', id: 'sequence-master', name: 'Sequence Master' },
  { key: 'memoryMadness', id: 'memory-madness', name: 'Memory Madness' }
];

/**
 * Safely parse ISO timestamp into epoch milliseconds.
 * Returns 0 if missing, invalid, or unparseable.
 */
export function parseTimestamp(dateStr) {
  if (!dateStr) return 0;
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? 0 : time;
}

/**
 * Normalizes a TypeStorm session into a uniform schema.
 */
export function normalizeTypeStormSession(raw) {
  if (!raw) return null;
  return {
    gameId: 'type-storm',
    gameName: 'TypeStorm',
    gameKey: 'typeStorm',
    sessionId: raw.sessionId,
    completedAt: raw.completedAt || raw.createdAt || null,
    createdAt: raw.createdAt || raw.completedAt || null,
    durationSeconds: raw.durationSeconds,
    wpm: raw.wpm,
    accuracy: raw.accuracy,
    correctCharacters: raw.correctCharacters,
    incorrectCharacters: raw.incorrectCharacters,
    totalCharactersTyped: raw.totalCharactersTyped,
    elapsedSeconds: raw.elapsedSeconds
  };
}

/**
 * Normalizes a Whack Attack session into a uniform schema.
 */
export function normalizeWhackAttackSession(raw) {
  if (!raw) return null;
  return {
    gameId: 'whack-attack',
    gameName: 'Whack Attack',
    gameKey: 'whackAttack',
    sessionId: raw.sessionId,
    completedAt: raw.completedAt || raw.createdAt || null,
    createdAt: raw.createdAt || raw.completedAt || null,
    durationSeconds: raw.durationSeconds,
    score: raw.score,
    hits: raw.hits,
    misses: raw.misses,
    emptyClicks: raw.emptyClicks,
    accuracy: raw.accuracy,
    bestCombo: raw.bestCombo,
    highestCombo: raw.highestCombo ?? raw.bestCombo,
    elapsedSeconds: raw.elapsedSeconds
  };
}

/**
 * Normalizes a Sequence Master session into a uniform schema.
 */
export function normalizeSequenceMasterSession(raw) {
  if (!raw) return null;
  return {
    gameId: 'sequence-master',
    gameName: 'Sequence Master',
    gameKey: 'sequenceMaster',
    sessionId: raw.sessionId,
    completedAt: raw.completedAt || raw.createdAt || null,
    createdAt: raw.createdAt || raw.completedAt || null,
    difficulty: raw.difficulty,
    score: raw.score,
    highestSequenceLength: raw.highestSequenceLength,
    sequenceLength: raw.sequenceLength ?? raw.highestSequenceLength,
    completedRounds: raw.completedRounds,
    totalCorrectTiles: raw.totalCorrectTiles,
    elapsedSeconds: raw.elapsedSeconds
  };
}

/**
 * Normalizes a Memory Madness session into a uniform schema.
 */
export function normalizeMemoryMadnessSession(raw) {
  if (!raw) return null;
  return {
    gameId: 'memory-madness',
    gameName: 'Memory Madness',
    gameKey: 'memoryMadness',
    sessionId: raw.sessionId,
    completedAt: raw.completedAt || raw.createdAt || null,
    createdAt: raw.createdAt || raw.completedAt || null,
    difficulty: raw.difficulty,
    score: raw.score,
    completionTimeSeconds: raw.completionTimeSeconds,
    completionTime: raw.completionTime ?? raw.completionTimeSeconds,
    totalMoves: raw.totalMoves,
    moves: raw.moves ?? raw.totalMoves,
    matchedPairs: raw.matchedPairs,
    mismatchedAttempts: raw.mismatchedAttempts,
    mismatches: raw.mismatches ?? raw.mismatchedAttempts,
    accuracy: raw.accuracy
  };
}

/**
 * Map raw session to normalized session based on gameKey.
 */
export function normalizeSession(raw, gameKey) {
  switch (gameKey) {
    case 'typeStorm':
      return normalizeTypeStormSession(raw);
    case 'whackAttack':
      return normalizeWhackAttackSession(raw);
    case 'sequenceMaster':
      return normalizeSequenceMasterSession(raw);
    case 'memoryMadness':
      return normalizeMemoryMadnessSession(raw);
    default:
      return raw;
  }
}

/**
 * Sorts sessions newest first by completedAt / createdAt.
 */
export function sortSessionsNewestFirst(sessions) {
  return [...sessions].sort((a, b) => {
    const timeA = parseTimestamp(a.completedAt || a.createdAt);
    const timeB = parseTimestamp(b.completedAt || b.createdAt);
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return String(b.sessionId || '').localeCompare(String(a.sessionId || ''));
  });
}

/**
 * Resolve game metadata by key or id.
 */
export function resolveGame(gameKeyOrId) {
  return HISTORY_GAMES.find(g => g.key === gameKeyOrId || g.id === gameKeyOrId) || null;
}

/**
 * Normalize settled result for a single game.
 */
function normalizeSettledGameResult(settled, gameKey) {
  if (settled.status === 'rejected') {
    return {
      sessions: [],
      pagination: null,
      hasPlayed: false,
      loading: false,
      error: settled.reason?.message || 'Failed to fetch session history'
    };
  }

  const paged = settled.value;
  if (!paged || !Array.isArray(paged.content)) {
    return {
      sessions: [],
      pagination: null,
      hasPlayed: false,
      loading: false,
      error: null
    };
  }

  const normalized = paged.content.map(s => normalizeSession(s, gameKey)).filter(Boolean);
  const totalElements = Number(paged.totalElements) || 0;

  return {
    sessions: normalized,
    pagination: {
      currentPage: paged.currentPage ?? 0,
      pageSize: paged.pageSize ?? 10,
      totalElements,
      totalPages: paged.totalPages ?? 0,
      hasNext: Boolean(paged.hasNext),
      hasPrevious: Boolean(paged.hasPrevious)
    },
    hasPlayed: totalElements > 0 || normalized.length > 0,
    loading: false,
    error: null
  };
}

/**
 * Build aggregated history state across all four games.
 */
export function buildHistoryState(games) {
  const allSessions = [];
  const errors = [];
  let failedCount = 0;

  for (const gameInfo of HISTORY_GAMES) {
    const game = games[gameInfo.key];
    if (!game) continue;

    if (game.error) {
      errors.push({ game: gameInfo.key, id: gameInfo.id, error: game.error });
      if (!game.sessions || game.sessions.length === 0) {
        failedCount++;
      }
    }
    if (Array.isArray(game.sessions)) {
      allSessions.push(...game.sessions);
    }
  }

  // Deduplicate sessions across games by sessionId just in case
  const seenIds = new Set();
  const dedupedSessions = [];
  for (const sess of allSessions) {
    if (sess.sessionId && seenIds.has(sess.sessionId)) {
      continue;
    }
    if (sess.sessionId) {
      seenIds.add(sess.sessionId);
    }
    dedupedSessions.push(sess);
  }

  const recentSessions = sortSessionsNewestFirst(dedupedSessions);
  const totalSessionsLoaded = recentSessions.length;

  let status = 'COMPLETE_SUCCESS';
  if (failedCount === HISTORY_GAMES.length) {
    status = 'COMPLETE_FAILURE';
  } else if (failedCount > 0) {
    status = 'PARTIAL_SUCCESS';
  }

  return {
    games,
    recentSessions,
    totalSessionsLoaded,
    isPartiallyLoaded: failedCount > 0 && failedCount < HISTORY_GAMES.length,
    status,
    errors
  };
}

/**
 * Retrieve the first page of history for all four supported games concurrently.
 * @param {string} [browserId] - Optional browser ID, defaults to getBrowserId()
 * @param {number} [size=10] - Number of items per game
 * @returns {Promise<object>} Unified history overview
 */
export async function getHistoryOverview(browserId, size = 10) {
  const targetBrowserId = browserId || getBrowserId();

  const [tsSettled, waSettled, smSettled, mmSettled] = await Promise.allSettled([
    getTypeStormSessions(targetBrowserId, 0, size),
    getWhackAttackSessions(targetBrowserId, 0, size),
    getSequenceMasterSessions(targetBrowserId, null, 0, size),
    getMemoryMadnessSessions(targetBrowserId, null, 0, size)
  ]);

  const games = {
    typeStorm: normalizeSettledGameResult(tsSettled, 'typeStorm'),
    whackAttack: normalizeSettledGameResult(waSettled, 'whackAttack'),
    sequenceMaster: normalizeSettledGameResult(smSettled, 'sequenceMaster'),
    memoryMadness: normalizeSettledGameResult(mmSettled, 'memoryMadness')
  };

  return buildHistoryState(games);
}

/**
 * Fetch a specific page of history for a single game.
 * @param {string} browserId
 * @param {string} gameKeyOrId - e.g. 'typeStorm' or 'type-storm'
 * @param {number} [page=0]
 * @param {number} [size=10]
 * @param {string} [difficulty=null] - Optional difficulty filter
 * @returns {Promise<{ gameKey: string, sessions: Array, pagination: object }>}
 */
export async function fetchGameSessionPage(browserId, gameKeyOrId, page = 0, size = 10, difficulty = null) {
  const game = resolveGame(gameKeyOrId);
  if (!game) {
    throw new IllegalArgumentException(`Unknown game identifier: ${gameKeyOrId}`);
  }

  const targetBrowserId = browserId || getBrowserId();
  let pagedResponse;

  switch (game.key) {
    case 'typeStorm':
      pagedResponse = await getTypeStormSessions(targetBrowserId, page, size);
      break;
    case 'whackAttack':
      pagedResponse = await getWhackAttackSessions(targetBrowserId, page, size);
      break;
    case 'sequenceMaster':
      pagedResponse = await getSequenceMasterSessions(targetBrowserId, difficulty, page, size);
      break;
    case 'memoryMadness':
      pagedResponse = await getMemoryMadnessSessions(targetBrowserId, difficulty, page, size);
      break;
  }

  const rawList = Array.isArray(pagedResponse?.content) ? pagedResponse.content : [];
  const normalized = rawList.map(s => normalizeSession(s, game.key)).filter(Boolean);

  return {
    gameKey: game.key,
    gameId: game.id,
    sessions: normalized,
    pagination: {
      currentPage: pagedResponse?.currentPage ?? page,
      pageSize: pagedResponse?.pageSize ?? size,
      totalElements: pagedResponse?.totalElements ?? normalized.length,
      totalPages: pagedResponse?.totalPages ?? 0,
      hasNext: Boolean(pagedResponse?.hasNext),
      hasPrevious: Boolean(pagedResponse?.hasPrevious)
    }
  };
}

/**
 * Merges a newly fetched page into the existing history state immutably.
 * Avoids duplicate sessions by sessionId and preserves newest-first ordering.
 */
export function mergeGameSessionPage(currentState, gameKeyOrId, pageResult) {
  const game = resolveGame(gameKeyOrId);
  if (!game || !currentState || !currentState.games) {
    return currentState;
  }

  const existingGame = currentState.games[game.key] || {
    sessions: [],
    pagination: null,
    hasPlayed: false,
    loading: false,
    error: null
  };

  // If page retrieval produced an error, preserve existing sessions but attach error
  if (pageResult.error) {
    const updatedGames = {
      ...currentState.games,
      [game.key]: {
        ...existingGame,
        error: pageResult.error
      }
    };
    return buildHistoryState(updatedGames);
  }

  // Deduplicate sessions
  const seenSessionIds = new Set();
  const mergedSessions = [];

  // Add existing sessions
  for (const sess of (existingGame.sessions || [])) {
    if (sess.sessionId) {
      seenSessionIds.add(sess.sessionId);
    }
    mergedSessions.push(sess);
  }

  // Add new page sessions
  for (const sess of (pageResult.sessions || [])) {
    if (sess.sessionId && seenSessionIds.has(sess.sessionId)) {
      continue;
    }
    if (sess.sessionId) {
      seenSessionIds.add(sess.sessionId);
    }
    mergedSessions.push(sess);
  }

  const sortedGameSessions = sortSessionsNewestFirst(mergedSessions);
  const totalElements = pageResult.pagination?.totalElements ?? sortedGameSessions.length;

  const updatedGames = {
    ...currentState.games,
    [game.key]: {
      ...existingGame,
      sessions: sortedGameSessions,
      pagination: pageResult.pagination || existingGame.pagination,
      hasPlayed: totalElements > 0 || sortedGameSessions.length > 0,
      error: null
    }
  };

  return buildHistoryState(updatedGames);
}
