import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeReactionRush,
  normalizeNumberNinja,
  normalizeTypeStorm,
  normalizeWhackAttack,
  normalizeSequenceMaster,
  normalizeMemoryMadness,
  calculatePlatformStatistics,
  getRecordsOverview,
  CANONICAL_GAMES
} from '../src/services/recordsService.js';

// ── Mock Data Fixtures ──────────────────────────────────────────────────────────

const MOCK_RR_RECORD = {
  id: 1,
  browserId: 'test-browser-id',
  bestReactionMs: 215,
  averageReactionMs: 250,
  totalSessions: 12,
  updatedAt: '2026-11-20T10:00:00',
  isNewPersonalBest: false
};

const MOCK_NN_RECORD = {
  id: 2,
  browserId: 'test-browser-id',
  totalGamesPlayed: 8,
  totalGamesWon: 6,
  totalGuessesInWins: 24,
  bestGuesses: 2,
  currentWinStreak: 3,
  bestWinStreak: 5,
  winPercentage: 75.0,
  averageGuessesPerWin: 4.0,
  updatedAt: '2026-11-20T10:00:00',
  isNewPersonalBest: false
};

const MOCK_TS_RECORD = {
  id: 3,
  browserId: 'test-browser-id',
  totalGamesPlayed: 15,
  bestWpm: 82,
  averageWpm: 71.4,
  bestAccuracy: 98.2,
  averageAccuracy: 94.6,
  totalCharactersTyped: 4500,
  totalMistakes: 110,
  updatedAt: '2026-11-20T10:00:00',
  newPersonalBest: false
};

const MOCK_WA_RECORD = {
  id: 4,
  browserId: 'test-browser-id',
  totalGamesPlayed: 20,
  highestScore: 450,
  averageScore: 380.0,
  totalHits: 600,
  bestAccuracy: 95.0,
  averageAccuracy: 89.5,
  bestCombo: 24,
  totalMissedTargets: 30,
  totalEmptyClicks: 12,
  updatedAt: '2026-11-20T10:00:00',
  newPersonalBest: false
};

const MOCK_SM_OVERVIEW = {
  browserId: 'test-browser-id',
  easy: {
    difficulty: 'EASY',
    totalGamesPlayed: 10,
    highestScore: 600,
    averageScore: 420.0,
    highestSequenceLength: 5,
    averageSequenceLength: 3.8,
    totalCompletedRounds: 25,
    totalCorrectTileInputs: 75,
    updatedAt: '2026-11-20T10:00:00'
  },
  medium: {
    difficulty: 'MEDIUM',
    totalGamesPlayed: 5,
    highestScore: 460,
    averageScore: 310.0,
    highestSequenceLength: 4,
    averageSequenceLength: 3.2,
    totalCompletedRounds: 11,
    totalCorrectTileInputs: 32,
    updatedAt: '2026-11-20T10:00:00'
  },
  hard: {
    difficulty: 'HARD',
    totalGamesPlayed: 2,
    highestScore: 210,
    averageScore: 155.0,
    highestSequenceLength: 2,
    averageSequenceLength: 1.5,
    totalCompletedRounds: 3,
    totalCorrectTileInputs: 6,
    updatedAt: '2026-11-20T10:00:00'
  }
};

const MOCK_MM_OVERVIEW = {
  browserId: 'test-browser-id',
  easy: {
    difficulty: 'EASY',
    totalGamesPlayed: 6,
    bestScore: 1200,
    averageScore: 1080.0,
    bestCompletionTime: 22.4,
    averageCompletionTime: 28.1,
    bestMoveCount: 10,
    averageMoveCount: 14.2,
    bestAccuracy: 80.0,
    averageAccuracy: 65.5,
    totalPairsMatched: 48,
    updatedAt: '2026-11-20T10:00:00'
  },
  medium: {
    difficulty: 'MEDIUM',
    totalGamesPlayed: 4,
    bestScore: 2200,
    averageScore: 1950.0,
    bestCompletionTime: 75.0,
    averageCompletionTime: 92.4,
    bestMoveCount: 28,
    averageMoveCount: 34.0,
    bestAccuracy: 64.3,
    averageAccuracy: 54.0,
    totalPairsMatched: 72,
    updatedAt: '2026-11-20T10:00:00'
  },
  hard: {
    difficulty: 'HARD',
    totalGamesPlayed: 1,
    bestScore: 3500,
    averageScore: 3500.0,
    bestCompletionTime: 180.0,
    averageCompletionTime: 180.0,
    bestMoveCount: 52,
    averageMoveCount: 52.0,
    bestAccuracy: 61.5,
    averageAccuracy: 61.5,
    totalPairsMatched: 32,
    updatedAt: '2026-11-20T10:00:00'
  }
};

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('Milestone 4.2: Unified Records Aggregator', () => {

  // Test 1: All six games have records
  it('1. correctly normalizes and aggregates when all six games have records', () => {
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: MOCK_RR_RECORD }),
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: MOCK_NN_RECORD }),
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: MOCK_TS_RECORD }),
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: MOCK_WA_RECORD }),
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: MOCK_SM_OVERVIEW }),
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: MOCK_MM_OVERVIEW })
    };

    assert.strictEqual(games.reactionRush.played, true);
    assert.strictEqual(games.numberNinja.played, true);
    assert.strictEqual(games.typeStorm.played, true);
    assert.strictEqual(games.whackAttack.played, true);
    assert.strictEqual(games.sequenceMaster.played, true);
    assert.strictEqual(games.memoryMadness.played, true);

    const summary = calculatePlatformStatistics(games);
    assert.strictEqual(summary.status, 'COMPLETE_SUCCESS');
    assert.strictEqual(summary.hasError, false);
    assert.strictEqual(summary.failedGames.length, 0);
  });

  // Test 2: No games have been played
  it('2. handles when no games have been played (all 404 / null)', () => {
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: null }),
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: null }),
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: null }),
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: null }),
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })
    };

    assert.strictEqual(games.reactionRush.played, false);
    assert.strictEqual(games.numberNinja.played, false);
    assert.strictEqual(games.typeStorm.played, false);
    assert.strictEqual(games.whackAttack.played, false);
    assert.strictEqual(games.sequenceMaster.played, false);
    assert.strictEqual(games.memoryMadness.played, false);

    const summary = calculatePlatformStatistics(games);
    assert.strictEqual(summary.totalGamesPlayed, 0);
    assert.strictEqual(summary.gamesExplored.played, 0);
    assert.strictEqual(summary.gamesExplored.total, 6);
    assert.strictEqual(summary.mostPlayedGame, null);
    assert.strictEqual(summary.combinedArcadePoints, 0);
    assert.strictEqual(summary.status, 'COMPLETE_SUCCESS');
    assert.strictEqual(summary.hasError, false);
  });

  // Test 3: Only one game has records
  it('3. aggregates correctly when only one game has records', () => {
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: null }),
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: null }),
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: MOCK_TS_RECORD }), // 15 games
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: null }),
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })
    };

    const summary = calculatePlatformStatistics(games);
    assert.strictEqual(summary.totalGamesPlayed, 15);
    assert.strictEqual(summary.gamesExplored.played, 1);
    assert.strictEqual(summary.mostPlayedGame?.id, 'type-storm');
    assert.strictEqual(summary.mostPlayedGame?.totalGamesPlayed, 15);
    // TypeStorm is not points-based
    assert.strictEqual(summary.combinedArcadePoints, 0);
  });

  // Test 4: Sequence Master and Memory Madness difficulty aggregation
  it('4. aggregates Sequence Master and Memory Madness difficulties without flattening', () => {
    const sm = normalizeSequenceMaster({ status: 'fulfilled', value: MOCK_SM_OVERVIEW });
    assert.strictEqual(sm.totalGamesPlayed, 10 + 5 + 2); // 17
    assert.strictEqual(sm.difficulties.easy.totalGamesPlayed, 10);
    assert.strictEqual(sm.difficulties.easy.stats.highestScore, 600);
    assert.strictEqual(sm.difficulties.medium.totalGamesPlayed, 5);
    assert.strictEqual(sm.difficulties.medium.stats.highestScore, 460);
    assert.strictEqual(sm.difficulties.hard.totalGamesPlayed, 2);
    assert.strictEqual(sm.difficulties.hard.stats.highestScore, 210);

    const mm = normalizeMemoryMadness({ status: 'fulfilled', value: MOCK_MM_OVERVIEW });
    assert.strictEqual(mm.totalGamesPlayed, 6 + 4 + 1); // 11
    assert.strictEqual(mm.difficulties.easy.stats.bestScore, 1200);
    assert.strictEqual(mm.difficulties.easy.stats.bestCompletionTime, 22.4);
    assert.strictEqual(mm.difficulties.medium.stats.bestScore, 2200);
    assert.strictEqual(mm.difficulties.hard.stats.bestScore, 3500);
  });

  // Test 5: Total games played calculation
  it('5. accurately calculates total games played summing all 6 games and sub-difficulties', () => {
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: MOCK_RR_RECORD }), // 12
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: MOCK_NN_RECORD }),   // 8
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: MOCK_TS_RECORD }),       // 15
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: MOCK_WA_RECORD }),   // 20
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: MOCK_SM_OVERVIEW }), // 10 + 5 + 2 = 17
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: MOCK_MM_OVERVIEW })    // 6 + 4 + 1 = 11
    };

    const summary = calculatePlatformStatistics(games);
    // 12 + 8 + 15 + 20 + 17 + 11 = 83
    assert.strictEqual(summary.totalGamesPlayed, 83);
  });

  // Test 6: Games explored calculation
  it('6. calculates games explored as a count out of 6', () => {
    // 3 games played, 3 unplayed
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: MOCK_RR_RECORD }), // played
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: null }),             // unplayed
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: MOCK_TS_RECORD }),       // played
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: null }),             // unplayed
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: MOCK_SM_OVERVIEW }), // played
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })          // unplayed
    };

    const summary = calculatePlatformStatistics(games);
    assert.strictEqual(summary.gamesExplored.played, 3);
    assert.strictEqual(summary.gamesExplored.total, 6);
    assert.strictEqual(summary.gamesExplored.percentage, 50.0);
  });

  // Test 7: Most played game calculation
  it('7. accurately identifies the most played game', () => {
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: MOCK_RR_RECORD }), // 12
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: MOCK_NN_RECORD }),   // 8
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: MOCK_TS_RECORD }),       // 15
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: MOCK_WA_RECORD }),   // 20 (MAX)
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: MOCK_SM_OVERVIEW }), // 17
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: MOCK_MM_OVERVIEW })    // 11
    };

    const summary = calculatePlatformStatistics(games);
    assert.strictEqual(summary.mostPlayedGame?.id, 'whack-attack');
    assert.strictEqual(summary.mostPlayedGame?.name, 'Whack Attack');
    assert.strictEqual(summary.mostPlayedGame?.totalGamesPlayed, 20);
    assert.strictEqual(summary.mostPlayedGame?.isTied, false);
  });

  // Test 8: Combined points calculation (points-based games only)
  it('8. calculates combined arcade points from points-based games only across all difficulties', () => {
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: MOCK_RR_RECORD }),
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: MOCK_NN_RECORD }),
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: MOCK_TS_RECORD }),
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: MOCK_WA_RECORD }), // 450
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: MOCK_SM_OVERVIEW }), // 600 + 460 + 210 = 1270
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: MOCK_MM_OVERVIEW })    // 1200 + 2200 + 3500 = 6900
    };

    const summary = calculatePlatformStatistics(games);
    // Whack Attack: 450
    // Sequence Master: 600 + 460 + 210 = 1270
    // Memory Madness: 1200 + 2200 + 3500 = 6900
    // Total = 450 + 1270 + 6900 = 8620
    assert.strictEqual(summary.combinedArcadePoints, 8620);
    assert.strictEqual(summary.combinedArcadePointsBreakdown.whackAttack, 450);
    assert.strictEqual(summary.combinedArcadePointsBreakdown.sequenceMaster.total, 1270);
    assert.strictEqual(summary.combinedArcadePointsBreakdown.memoryMadness.total, 6900);
  });

  // Test 9: One API request fails while others succeed (Partial Failure)
  it('9. handles partial failure gracefully preserving successful games and isolating failed game', () => {
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: MOCK_RR_RECORD }),
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: MOCK_NN_RECORD }),
      typeStorm: normalizeTypeStorm({ status: 'rejected', reason: new Error('Network timeout') }), // FAILED
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: MOCK_WA_RECORD }),
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: MOCK_SM_OVERVIEW }),
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: MOCK_MM_OVERVIEW })
    };

    // Failed game has error recorded and stats null (NOT zeroed out as fake stats)
    assert.strictEqual(games.typeStorm.stats, null);
    assert.strictEqual(games.typeStorm.played, false);
    assert.strictEqual(games.typeStorm.error, 'Network timeout');

    // Other games are intact
    assert.strictEqual(games.whackAttack.played, true);
    assert.strictEqual(games.whackAttack.stats.highestScore, 450);

    const summary = calculatePlatformStatistics(games);
    assert.strictEqual(summary.status, 'PARTIAL_SUCCESS');
    assert.strictEqual(summary.hasError, true);
    assert.deepStrictEqual(summary.failedGames, ['typeStorm']);
    assert.ok(summary.errorMessage.includes('typeStorm'));
  });

  // Test 10: All API requests fail (Complete Failure)
  it('10. handles complete failure when all six game requests reject', () => {
    const err = new Error('Database connection refused');
    const games = {
      reactionRush: normalizeReactionRush({ status: 'rejected', reason: err }),
      numberNinja: normalizeNumberNinja({ status: 'rejected', reason: err }),
      typeStorm: normalizeTypeStorm({ status: 'rejected', reason: err }),
      whackAttack: normalizeWhackAttack({ status: 'rejected', reason: err }),
      sequenceMaster: normalizeSequenceMaster({ status: 'rejected', reason: err }),
      memoryMadness: normalizeMemoryMadness({ status: 'rejected', reason: err })
    };

    const summary = calculatePlatformStatistics(games);
    assert.strictEqual(summary.status, 'COMPLETE_FAILURE');
    assert.strictEqual(summary.hasError, true);
    assert.strictEqual(summary.failedGames.length, 6);
    assert.strictEqual(summary.totalGamesPlayed, 0);
    assert.strictEqual(summary.gamesExplored.played, 0);
    assert.strictEqual(summary.mostPlayedGame, null);
  });

  // Test 11: Unplayed games returning null
  it('11. distinguishes unplayed game returning null from failed game', () => {
    const unplayedRR = normalizeReactionRush({ status: 'fulfilled', value: null });
    assert.strictEqual(unplayedRR.played, false);
    assert.strictEqual(unplayedRR.error, null); // Normal state, not an error!
    assert.strictEqual(unplayedRR.totalGamesPlayed, 0);
    assert.strictEqual(unplayedRR.stats.bestReactionMs, null);

    const failedRR = normalizeReactionRush({ status: 'rejected', reason: new Error('Server 500') });
    assert.strictEqual(failedRR.played, false);
    assert.strictEqual(failedRR.error, 'Server 500');
    assert.strictEqual(failedRR.stats, null); // stats are null, not a fake zero record
  });

  // Test 12: Tied most-played games
  it('12. handles tied most-played games deterministically and flags the tie', () => {
    // Both Number Ninja and Whack Attack have exactly 10 games
    const games = {
      reactionRush: normalizeReactionRush({ status: 'fulfilled', value: null }),
      numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: { ...MOCK_NN_RECORD, totalGamesPlayed: 10 } }),
      typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: null }),
      whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: { ...MOCK_WA_RECORD, totalGamesPlayed: 10 } }),
      sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
      memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })
    };

    const summary = calculatePlatformStatistics(games);
    // Canonical order puts Number Ninja before Whack Attack
    assert.strictEqual(summary.mostPlayedGame?.id, 'number-ninja');
    assert.strictEqual(summary.mostPlayedGame?.totalGamesPlayed, 10);
    assert.strictEqual(summary.mostPlayedGame?.isTied, true);
    assert.deepStrictEqual(summary.mostPlayedGame?.tiedGameIds, ['number-ninja', 'whack-attack']);
  });

});

// ── Integration Test for getRecordsOverview with fetch mocks ────────────────────

describe('getRecordsOverview full orchestrator integration', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('orchestrates all six service calls in parallel and returns normalized overview', async () => {
    global.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/reaction-rush/records/')) {
        return { ok: true, status: 200, json: async () => MOCK_RR_RECORD };
      }
      if (urlStr.includes('/number-ninja/records/')) {
        return { ok: true, status: 200, json: async () => MOCK_NN_RECORD };
      }
      if (urlStr.includes('/type-storm/records/')) {
        return { ok: true, status: 200, json: async () => MOCK_TS_RECORD };
      }
      if (urlStr.includes('/whack-attack/records/')) {
        return { ok: true, status: 200, json: async () => MOCK_WA_RECORD };
      }
      if (urlStr.includes('/sequence-master/records/')) {
        return { ok: true, status: 200, json: async () => MOCK_SM_OVERVIEW };
      }
      if (urlStr.includes('/memory-madness/records/')) {
        return { ok: true, status: 200, json: async () => MOCK_MM_OVERVIEW };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const overview = await getRecordsOverview('00000000-0000-4000-8000-000000000001');

    assert.ok(overview.summary);
    assert.ok(overview.games);
    assert.strictEqual(overview.summary.status, 'COMPLETE_SUCCESS');
    assert.strictEqual(overview.summary.totalGamesPlayed, 83);
    assert.strictEqual(overview.summary.gamesExplored.played, 6);
    assert.strictEqual(overview.summary.combinedArcadePoints, 8620);
    assert.strictEqual(overview.games.reactionRush.stats.bestReactionMs, 215);
    assert.strictEqual(overview.games.typeStorm.stats.bestWpm, 82);
  });
});
