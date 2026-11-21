import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATIONS,
  DEFAULT_DURATION,
  STATES,
  GRID_SIZE,
  BASE_HIT_SCORE,
  getComboBonus,
  calculateHitScore,
  calculateAccuracy,
  getDifficultyParams,
  getNextTargetPosition,
  getPerformanceTier
} from '../src/games/WhackAttack/constants.js';
import { getRecord, submitSession } from '../src/services/whackAttackService.js';

// ── 1. Constants, Grid & Durations ─────────────────────────────────────────────

describe('Whack Attack Constants & Configuration', () => {
  it('defines the two required game durations: 30s Quick Attack and 60s Survival', () => {
    assert.strictEqual(DURATIONS.length, 2);
    const secondsList = DURATIONS.map(d => d.seconds);
    assert.deepStrictEqual(secondsList, [30, 60]);
    assert.strictEqual(DEFAULT_DURATION, 30);
  });

  it('defines required game states: IDLE, ACTIVE, COMPLETED', () => {
    assert.strictEqual(STATES.IDLE, 'IDLE');
    assert.strictEqual(STATES.ACTIVE, 'ACTIVE');
    assert.strictEqual(STATES.COMPLETED, 'COMPLETED');
  });

  it('defines standard 3x3 grid size of 9 cells', () => {
    assert.strictEqual(GRID_SIZE, 9);
  });
});

// ── 2. Grid Target Selection & RNG ─────────────────────────────────────────────

describe('Whack Attack Target Position Selection', () => {
  it('picks a valid index between 0 and 8 inclusive when no prior target exists', () => {
    for (let i = 0; i < 20; i++) {
      const pos = getNextTargetPosition(null, 9);
      assert.ok(pos >= 0 && pos < 9, `Position ${pos} must be within 0..8`);
    }
  });

  it('never picks the identical position repeatedly on consecutive spawns', () => {
    let currentPos = 4;
    for (let i = 0; i < 50; i++) {
      const nextPos = getNextTargetPosition(currentPos, 9);
      assert.ok(nextPos >= 0 && nextPos < 9);
      assert.notStrictEqual(
        nextPos,
        currentPos,
        `Consecutive position ${nextPos} must not equal previous position ${currentPos}`
      );
      currentPos = nextPos;
    }
  });
});

// ── 3. Difficulty Progression Engine ──────────────────────────────────────────

describe('Whack Attack Controlled Difficulty Progression', () => {
  it('decreases target visibility and spawn delay monotonically over elapsed gameplay time', () => {
    const totalDuration = 30;

    const start = getDifficultyParams(0, totalDuration);
    const mid = getDifficultyParams(15, totalDuration);
    const end = getDifficultyParams(30, totalDuration);

    // Initial comfortable visibility and delay
    assert.strictEqual(start.visibleDurationMs, 1100);
    assert.strictEqual(start.spawnDelayMs, 280);

    // Mid progression decreases
    assert.ok(mid.visibleDurationMs < start.visibleDurationMs);
    assert.ok(mid.spawnDelayMs < start.spawnDelayMs);

    // End reaches sensible playable minimum limits
    assert.strictEqual(end.visibleDurationMs, 500);
    assert.strictEqual(end.spawnDelayMs, 120);
  });

  it('supports 60-second survival mode with tailored endurance progression', () => {
    const totalDuration = 60;

    const start = getDifficultyParams(0, totalDuration);
    const end = getDifficultyParams(60, totalDuration);

    assert.strictEqual(start.visibleDurationMs, 1200);
    assert.strictEqual(start.spawnDelayMs, 300);

    assert.strictEqual(end.visibleDurationMs, 450);
    assert.strictEqual(end.spawnDelayMs, 100);
  });
});

// ── 4. Scoring System & Combo Bonus ───────────────────────────────────────────

describe('Whack Attack Scoring & Combo Mechanics', () => {
  it('scores 10 points for base hits without combo', () => {
    assert.strictEqual(BASE_HIT_SCORE, 10);
    assert.strictEqual(getComboBonus(0), 0);
    assert.strictEqual(getComboBonus(1), 0);
    assert.strictEqual(calculateHitScore(1), 10);
  });

  it('increases score with transparent and balanced combo bonus, capped at +10', () => {
    // Combo 2: +2
    assert.strictEqual(getComboBonus(2), 2);
    assert.strictEqual(calculateHitScore(2), 12);

    // Combo 3: +4
    assert.strictEqual(getComboBonus(3), 4);
    assert.strictEqual(calculateHitScore(3), 14);

    // Combo 4: +6
    assert.strictEqual(getComboBonus(4), 6);
    assert.strictEqual(calculateHitScore(4), 16);

    // Combo 5: +8
    assert.strictEqual(getComboBonus(5), 8);
    assert.strictEqual(calculateHitScore(5), 18);

    // Combo 6+: +10 capped
    assert.strictEqual(getComboBonus(6), 10);
    assert.strictEqual(calculateHitScore(6), 20);
    assert.strictEqual(getComboBonus(15), 10);
    assert.strictEqual(calculateHitScore(15), 20);
  });

  it('calculates accuracy percentage accurately and handles zero attempts safely', () => {
    // 20 hits, 0 misses, 0 empty clicks -> 100.0%
    assert.strictEqual(calculateAccuracy(20, 0, 0), 100.0);

    // 15 hits, 5 misses, 0 empty clicks -> 15/20 * 100 = 75.0%
    assert.strictEqual(calculateAccuracy(15, 5, 0), 75.0);

    // 25 hits, 3 misses, 2 empty clicks -> 25/30 * 100 = 83.3%
    assert.strictEqual(calculateAccuracy(25, 3, 2), 83.3);

    // Zero attempts safely returns 0.0%
    assert.strictEqual(calculateAccuracy(0, 0, 0), 0.0);
  });

  it('determines appropriate performance tiers based on score and accuracy', () => {
    assert.strictEqual(getPerformanceTier(450, 95.0, 35).tier, 'Legendary');
    assert.strictEqual(getPerformanceTier(280, 85.0, 24).tier, 'Master Striker');
    assert.strictEqual(getPerformanceTier(180, 80.0, 16).tier, 'Sharp Whacker');
    assert.strictEqual(getPerformanceTier(100, 70.0, 10).tier, 'Proficient');
    assert.strictEqual(getPerformanceTier(40, 50.0, 4).tier, 'Rookie Whacker');
  });
});

// ── 5. Whack Attack Service API Client ─────────────────────────────────────────

describe('Whack Attack API Service (whackAttackService.js)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('getRecord returns null when backend returns 404 Not Found', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'No record found' }),
    });

    const result = await getRecord('00000000-0000-4000-8000-000000000005');
    assert.strictEqual(result, null);
  });

  it('getRecord returns record DTO on successful 200 response', async () => {
    const mockDto = {
      id: 1,
      browserId: '00000000-0000-4000-8000-000000000005',
      totalGamesPlayed: 4,
      highestScore: 320,
      averageScore: 280.0,
      totalHits: 95,
      bestAccuracy: 92.5,
      averageAccuracy: 88.0,
      bestCombo: 11,
      totalMissedTargets: 8,
      totalEmptyClicks: 4,
      newPersonalBest: false
    };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockDto,
    });

    const result = await getRecord('00000000-0000-4000-8000-000000000005');
    assert.deepStrictEqual(result, mockDto);
  });

  it('getRecord rethrows on 500 server error', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Internal Server Error' }),
    });

    await assert.rejects(
      async () => await getRecord('test-id'),
      (err) => err.status === 500
    );
  });

  it('submitSession sends POST request with required payload and returns DTO', async () => {
    let capturedUrl = null;
    let capturedOptions = null;

    const mockResponseDto = {
      id: 1,
      browserId: '00000000-0000-4000-8000-000000000005',
      totalGamesPlayed: 1,
      highestScore: 260,
      averageScore: 260.0,
      totalHits: 22,
      bestAccuracy: 88.0,
      averageAccuracy: 88.0,
      bestCombo: 8,
      newPersonalBest: true
    };

    global.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponseDto,
      };
    };

    const sessionPayload = {
      sessionId: 'sess-wa-client-1',
      durationSeconds: 30,
      score: 260,
      hits: 22,
      misses: 2,
      emptyClicks: 1,
      bestCombo: 8,
      elapsedSeconds: 30.0
    };

    const result = await submitSession('00000000-0000-4000-8000-000000000005', sessionPayload);

    assert.ok(capturedUrl.includes('/whack-attack/records/00000000-0000-4000-8000-000000000005'));
    assert.strictEqual(capturedOptions.method, 'POST');
    const parsedBody = JSON.parse(capturedOptions.body);
    assert.strictEqual(parsedBody.sessionId, 'sess-wa-client-1');
    assert.strictEqual(parsedBody.durationSeconds, 30);
    assert.strictEqual(parsedBody.score, 260);
    assert.strictEqual(parsedBody.hits, 22);
    assert.strictEqual(parsedBody.bestCombo, 8);
    assert.deepStrictEqual(result, mockResponseDto);
  });
});
