import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  formatMs,
  formatPercent,
  formatScore,
  getGameMeta,
  GAME_METADATA
} from '../src/components/records/formatters.js';
import {
  CANONICAL_GAMES,
  calculatePlatformStatistics,
  normalizeReactionRush,
  normalizeNumberNinja,
  normalizeTypeStorm,
  normalizeWhackAttack,
  normalizeSequenceMaster,
  normalizeMemoryMadness
} from '../src/services/recordsService.js';

describe('Records Dashboard UI & Component Logic', () => {

  // ── 1. Formatters and Utility Functions ──
  describe('Formatters and Presentation Helpers', () => {
    it('formats seconds safely as MM:SS', () => {
      assert.strictEqual(formatTime(0), '00:00');
      assert.strictEqual(formatTime(65), '01:05');
      assert.strictEqual(formatTime(124.8), '02:04');
      assert.strictEqual(formatTime(null), '--');
      assert.strictEqual(formatTime(undefined), '--');
      assert.strictEqual(formatTime(-10), '--');
    });

    it('formats milliseconds safely', () => {
      assert.strictEqual(formatMs(215), '215 ms');
      assert.strictEqual(formatMs(215.4), '215 ms');
      assert.strictEqual(formatMs(null), '--');
      assert.strictEqual(formatMs(undefined), '--');
    });

    it('formats percentage with 1 decimal place', () => {
      assert.strictEqual(formatPercent(98.24), '98.2%');
      assert.strictEqual(formatPercent(100), '100.0%');
      assert.strictEqual(formatPercent(0), '0.0%');
      assert.strictEqual(formatPercent(null), '--');
    });

    it('formats numeric scores with commas', () => {
      assert.strictEqual(formatScore(1250), '1,250');
      assert.strictEqual(formatScore(8620), '8,620');
      assert.strictEqual(formatScore(0), '0');
      assert.strictEqual(formatScore(null), '--');
    });

    it('provides metadata and icons for all six canonical games', () => {
      for (const game of CANONICAL_GAMES) {
        const meta = getGameMeta(game.id);
        assert.ok(meta, `Metadata missing for ${game.id}`);
        assert.ok(meta.category, `Category missing for ${game.id}`);
        assert.ok(meta.vibe, `Vibe missing for ${game.id}`);
        assert.ok(meta.icon, `Icon missing for ${game.id}`);
        assert.ok(meta.description, `Description missing for ${game.id}`);
      }
    });
  });

  // ── 2. Platform Overview Values (Requirement 2 & 3) ──
  describe('Platform Overview Card Calculations', () => {
    it('displays authentic platform overview metrics with played games', () => {
      const mockGames = {
        reactionRush: normalizeReactionRush({ status: 'fulfilled', value: { totalSessions: 10, bestReactionMs: 200, averageReactionMs: 220 } }),
        numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: { totalGamesPlayed: 5, bestGuesses: 3, bestWinStreak: 2, winPercentage: 60, averageGuessesPerWin: 4 } }),
        typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: { totalGamesPlayed: 8, bestWpm: 75, averageWpm: 70, bestAccuracy: 97, averageAccuracy: 95 } }),
        whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: { totalGamesPlayed: 12, highestScore: 350, bestAccuracy: 95, bestCombo: 5, averageScore: 300 } }),
        sequenceMaster: normalizeSequenceMaster({
          status: 'fulfilled',
          value: {
            easy: { totalGamesPlayed: 6, highestScore: 400, averageScore: 350, highestSequenceLength: 8, averageSequenceLength: 6 },
            medium: { totalGamesPlayed: 4, highestScore: 600, averageScore: 500, highestSequenceLength: 10, averageSequenceLength: 8 },
            hard: null
          }
        }),
        memoryMadness: normalizeMemoryMadness({
          status: 'fulfilled',
          value: {
            easy: { totalGamesPlayed: 5, bestScore: 2000, averageScore: 1800, bestMoveCount: 12, bestCompletionTime: 45, bestAccuracy: 90 },
            medium: null,
            hard: null
          }
        })
      };

      const summary = calculatePlatformStatistics(mockGames);

      // Total games played: 10 + 5 + 8 + 12 + (6 + 4 + 0) + (5 + 0 + 0) = 50
      assert.strictEqual(summary.totalGamesPlayed, 50);

      // Combined points (points-based only: Whack Attack 350 + Sequence Master 400+600=1000 + Memory Madness 2000 = 3350)
      assert.strictEqual(summary.combinedArcadePoints, 3350);

      // Games explored: 6 of 6
      assert.strictEqual(summary.gamesExplored.played, 6);
      assert.strictEqual(summary.gamesExplored.total, 6);

      // Most played: whackAttack (12 sessions)
      assert.ok(summary.mostPlayedGame);
      assert.strictEqual(summary.mostPlayedGame.id, 'whack-attack');
      assert.strictEqual(summary.mostPlayedGame.totalGamesPlayed, 12);
      assert.strictEqual(summary.mostPlayedGame.isTied, false);
    });

    it('calculates zeroed values for fresh player without errors', () => {
      const mockGames = {
        reactionRush: normalizeReactionRush({ status: 'fulfilled', value: null }),
        numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: null }),
        typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: null }),
        whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: null }),
        sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
        memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })
      };

      const summary = calculatePlatformStatistics(mockGames);

      assert.strictEqual(summary.totalGamesPlayed, 0);
      assert.strictEqual(summary.combinedArcadePoints, 0);
      assert.strictEqual(summary.gamesExplored.played, 0);
      assert.strictEqual(summary.mostPlayedGame, null);
      assert.strictEqual(summary.status, 'COMPLETE_SUCCESS');
      assert.strictEqual(summary.hasError, false);
    });
  });

  // ── 3. Most Played Highlight Section (Requirement 4) ──
  describe('Most Played Game Highlight Behavior', () => {
    it('accurately identifies most played game and session count', () => {
      const mockGames = {
        reactionRush: normalizeReactionRush({ status: 'fulfilled', value: { totalSessions: 4 } }),
        numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: { totalGamesPlayed: 25 } }),
        typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: null }),
        whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: null }),
        sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
        memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })
      };

      const summary = calculatePlatformStatistics(mockGames);
      assert.ok(summary.mostPlayedGame);
      assert.strictEqual(summary.mostPlayedGame.id, 'number-ninja');
      assert.strictEqual(summary.mostPlayedGame.name, 'Number Ninja');
      assert.strictEqual(summary.mostPlayedGame.totalGamesPlayed, 25);
      assert.strictEqual(summary.mostPlayedGame.isTied, false);
    });

    it('identifies tie conditions gracefully with canonical tie-breaking', () => {
      const mockGames = {
        reactionRush: normalizeReactionRush({ status: 'fulfilled', value: { totalSessions: 15 } }),
        numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: { totalGamesPlayed: 15 } }),
        typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: null }),
        whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: null }),
        sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
        memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })
      };

      const summary = calculatePlatformStatistics(mockGames);
      assert.ok(summary.mostPlayedGame);
      assert.strictEqual(summary.mostPlayedGame.id, 'reaction-rush');
      assert.strictEqual(summary.mostPlayedGame.isTied, true);
      assert.deepStrictEqual(summary.mostPlayedGame.tiedGameIds, ['reaction-rush', 'number-ninja']);
    });
  });

  // ── 4. All Six Game Cards & Authentic Metrics (Requirement 5) ──
  describe('Individual Game Cards Data Mapping', () => {
    it('Reaction Rush exposes fastest reaction, average reaction, and total sessions', () => {
      const norm = normalizeReactionRush({
        status: 'fulfilled',
        value: { bestReactionMs: 198, averageReactionMs: 224.5, totalSessions: 18 }
      });

      assert.strictEqual(norm.played, true);
      assert.strictEqual(norm.stats.bestReactionMs, 198);
      assert.strictEqual(Math.round(norm.stats.averageReactionMs), 225);
      assert.strictEqual(norm.stats.totalSessions, 18);
    });

    it('Number Ninja exposes fewest guesses, highest win streak, win rate, and total games', () => {
      const norm = normalizeNumberNinja({
        status: 'fulfilled',
        value: { bestGuesses: 2, bestWinStreak: 7, winPercentage: 80.0, totalGamesPlayed: 10 }
      });

      assert.strictEqual(norm.played, true);
      assert.strictEqual(norm.stats.bestGuesses, 2);
      assert.strictEqual(norm.stats.bestWinStreak, 7);
      assert.strictEqual(norm.stats.winPercentage, 80.0);
      assert.strictEqual(norm.totalGamesPlayed, 10);
    });

    it('TypeStorm exposes highest WPM, best accuracy, average WPM, and total games', () => {
      const norm = normalizeTypeStorm({
        status: 'fulfilled',
        value: { bestWpm: 92, bestAccuracy: 98.5, averageWpm: 84.2, totalGamesPlayed: 20 }
      });

      assert.strictEqual(norm.played, true);
      assert.strictEqual(norm.stats.bestWpm, 92);
      assert.strictEqual(norm.stats.bestAccuracy, 98.5);
      assert.strictEqual(norm.stats.averageWpm, 84.2);
      assert.strictEqual(norm.totalGamesPlayed, 20);
    });

    it('Whack Attack exposes highest score, best accuracy, highest combo, average score, and total games', () => {
      const norm = normalizeWhackAttack({
        status: 'fulfilled',
        value: { highestScore: 480, bestAccuracy: 96.0, bestCombo: 8, averageScore: 410.5, totalGamesPlayed: 14 }
      });

      assert.strictEqual(norm.played, true);
      assert.strictEqual(norm.stats.highestScore, 480);
      assert.strictEqual(norm.stats.bestAccuracy, 96.0);
      assert.strictEqual(norm.stats.bestCombo, 8);
      assert.strictEqual(Math.round(norm.stats.averageScore), 411);
      assert.strictEqual(norm.totalGamesPlayed, 14);
    });

    it('Sequence Master exposes highest score, max sequence length, average score per difficulty', () => {
      const norm = normalizeSequenceMaster({
        status: 'fulfilled',
        value: {
          easy: { highestScore: 500, highestSequenceLength: 9, averageScore: 420, totalGamesPlayed: 5 },
          medium: { highestScore: 850, highestSequenceLength: 12, averageScore: 700, totalGamesPlayed: 7 },
          hard: { highestScore: 1200, highestSequenceLength: 15, averageScore: 980, totalGamesPlayed: 3 }
        }
      });

      assert.strictEqual(norm.played, true);
      assert.strictEqual(norm.totalGamesPlayed, 15);
      assert.strictEqual(norm.difficulties.easy.stats.highestScore, 500);
      assert.strictEqual(norm.difficulties.medium.stats.highestSequenceLength, 12);
      assert.strictEqual(norm.difficulties.hard.stats.averageScore, 980);
    });

    it('Memory Madness exposes best score, fewest moves, fastest time, and best accuracy per difficulty', () => {
      const norm = normalizeMemoryMadness({
        status: 'fulfilled',
        value: {
          easy: { bestScore: 2400, bestMoveCount: 10, bestCompletionTime: 38.2, bestAccuracy: 95.0, totalGamesPlayed: 4 },
          medium: { bestScore: 3600, bestMoveCount: 22, bestCompletionTime: 85.0, bestAccuracy: 88.0, totalGamesPlayed: 6 },
          hard: { bestScore: 5100, bestMoveCount: 42, bestCompletionTime: 165.0, bestAccuracy: 82.5, totalGamesPlayed: 2 }
        }
      });

      assert.strictEqual(norm.played, true);
      assert.strictEqual(norm.totalGamesPlayed, 12);
      assert.strictEqual(norm.difficulties.easy.stats.bestScore, 2400);
      assert.strictEqual(norm.difficulties.easy.stats.bestMoveCount, 10);
      assert.strictEqual(formatTime(norm.difficulties.easy.stats.bestCompletionTime), '00:38');
      assert.strictEqual(norm.difficulties.medium.stats.bestAccuracy, 88.0);
      assert.strictEqual(formatTime(norm.difficulties.hard.stats.bestCompletionTime), '02:45');
    });
  });

  // ── 5. Multi-Difficulty Switching and State Preservation (Requirement 6) ──
  describe('Multi-Difficulty State Management', () => {
    it('preserves all difficulties independently without data loss or mutation', () => {
      const norm = normalizeSequenceMaster({
        status: 'fulfilled',
        value: {
          easy: { highestScore: 400, totalGamesPlayed: 5 },
          medium: { highestScore: 700, totalGamesPlayed: 3 },
          hard: null
        }
      });

      // Easy is played
      assert.strictEqual(norm.difficulties.easy.played, true);
      assert.strictEqual(norm.difficulties.easy.stats.highestScore, 400);

      // Medium is played
      assert.strictEqual(norm.difficulties.medium.played, true);
      assert.strictEqual(norm.difficulties.medium.stats.highestScore, 700);

      // Hard is unplayed
      assert.strictEqual(norm.difficulties.hard.played, false);
      assert.strictEqual(norm.difficulties.hard.stats.highestScore, 0);

      // Total played is sum of difficulties
      assert.strictEqual(norm.totalGamesPlayed, 8);
    });
  });

  // ── 6. Unplayed Game State (Requirement 7) ──
  describe('Unplayed Game Handling', () => {
    it('distinguishes between unplayed and error states', () => {
      const unplayedRR = normalizeReactionRush({ status: 'fulfilled', value: null });
      assert.strictEqual(unplayedRR.played, false);
      assert.strictEqual(unplayedRR.error, null);
      assert.strictEqual(unplayedRR.totalGamesPlayed, 0);

      const failedRR = normalizeReactionRush({ status: 'rejected', reason: new Error('Network timeout') });
      assert.strictEqual(failedRR.played, false);
      assert.strictEqual(failedRR.error, 'Network timeout');
      assert.strictEqual(failedRR.stats, null);
    });

    it('handles partially unplayed multi-difficulty game where one difficulty is unplayed', () => {
      const memoryOverview = normalizeMemoryMadness({
        status: 'fulfilled',
        value: {
          easy: { bestScore: 2500, totalGamesPlayed: 3 },
          medium: null,
          hard: null
        }
      });

      // Overall game has been played
      assert.strictEqual(memoryOverview.played, true);
      assert.strictEqual(memoryOverview.totalGamesPlayed, 3);

      // But medium and hard are unplayed
      assert.strictEqual(memoryOverview.difficulties.medium.played, false);
      assert.strictEqual(memoryOverview.difficulties.hard.played, false);
    });
  });

  // ── 7. Partial Service Failure (Requirement 8) ──
  describe('Partial Service Outage Handling', () => {
    it('captures failed game errors while successfully calculating statistics for online games', () => {
      const mockGames = {
        reactionRush: normalizeReactionRush({ status: 'fulfilled', value: { totalSessions: 10, bestReactionMs: 210 } }),
        numberNinja: normalizeNumberNinja({ status: 'rejected', reason: new Error('Database 500 error') }),
        typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: { totalGamesPlayed: 5, bestWpm: 80 } }),
        whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: { totalGamesPlayed: 8, highestScore: 300 } }),
        sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
        memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: null })
      };

      const summary = calculatePlatformStatistics(mockGames);

      assert.strictEqual(summary.status, 'PARTIAL_SUCCESS');
      assert.strictEqual(summary.hasError, true);
      assert.deepStrictEqual(summary.failedGames, ['numberNinja']);
      // Should sum sessions of available games (10 + 5 + 8 = 23)
      assert.strictEqual(summary.totalGamesPlayed, 23);
      // Whack Attack points (300) included
      assert.strictEqual(summary.combinedArcadePoints, 300);
    });
  });

  // ── 8. Complete Service Failure (Requirement 8) ──
  describe('Complete Service Outage Handling', () => {
    it('marks platform status as COMPLETE_FAILURE when all game services fail', () => {
      const mockGames = {
        reactionRush: normalizeReactionRush({ status: 'rejected', reason: new Error('Conn refused') }),
        numberNinja: normalizeNumberNinja({ status: 'rejected', reason: new Error('Conn refused') }),
        typeStorm: normalizeTypeStorm({ status: 'rejected', reason: new Error('Conn refused') }),
        whackAttack: normalizeWhackAttack({ status: 'rejected', reason: new Error('Conn refused') }),
        sequenceMaster: normalizeSequenceMaster({ status: 'rejected', reason: new Error('Conn refused') }),
        memoryMadness: normalizeMemoryMadness({ status: 'rejected', reason: new Error('Conn refused') })
      };

      const summary = calculatePlatformStatistics(mockGames);

      assert.strictEqual(summary.status, 'COMPLETE_FAILURE');
      assert.strictEqual(summary.hasError, true);
      assert.strictEqual(summary.failedGames.length, 6);
      assert.strictEqual(summary.totalGamesPlayed, 0);
      assert.strictEqual(summary.combinedArcadePoints, 0);
    });
  });

  // ── 9. Game Navigation Links (Requirement 12.9) ──
  describe('Route Navigation Consistency', () => {
    it('verifies all canonical game ids correspond to valid game slugs', () => {
      const expectedSlugs = [
        'reaction-rush',
        'number-ninja',
        'type-storm',
        'whack-attack',
        'sequence-master',
        'memory-madness'
      ];

      const actualSlugs = CANONICAL_GAMES.map(g => g.id);
      assert.deepStrictEqual(actualSlugs, expectedSlugs);

      for (const slug of actualSlugs) {
        assert.ok(slug.length > 0);
        // Path should match `/games/${slug}`
        const gameRoute = `/games/${slug}`;
        assert.ok(gameRoute.startsWith('/games/'));
      }
    });
  });

  // ── 10. Games Explored Calculation (Requirement 12.2) ──
  describe('Games Explored Metric', () => {
    it('accurately counts played games ratio out of 6', () => {
      const mockGames = {
        reactionRush: normalizeReactionRush({ status: 'fulfilled', value: { totalSessions: 5 } }),
        numberNinja: normalizeNumberNinja({ status: 'fulfilled', value: null }),
        typeStorm: normalizeTypeStorm({ status: 'fulfilled', value: { totalGamesPlayed: 3 } }),
        whackAttack: normalizeWhackAttack({ status: 'fulfilled', value: null }),
        sequenceMaster: normalizeSequenceMaster({ status: 'fulfilled', value: null }),
        memoryMadness: normalizeMemoryMadness({ status: 'fulfilled', value: { easy: { totalGamesPlayed: 2 } } })
      };

      const summary = calculatePlatformStatistics(mockGames);
      assert.strictEqual(summary.gamesExplored.played, 3);
      assert.strictEqual(summary.gamesExplored.total, 6);
      assert.strictEqual(summary.gamesExplored.percentage, 50.0);
    });
  });
});
