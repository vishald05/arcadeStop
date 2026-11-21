import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  DIFFICULTIES,
  DEFAULT_DIFFICULTY,
  STATES,
  calculateRoundScore,
  calculateTotalScore,
  getPlaybackTimings,
  getTileStyle,
  getPerformanceTier
} from '../src/games/SequenceMaster/constants.js';
import { getOverview, getRecord, submitSession } from '../src/services/sequenceMasterService.js';

// ── 1. Constants & Difficulties ────────────────────────────────────────────────

describe('Sequence Master Constants & Difficulties', () => {
  it('defines exactly three independent difficulties: Easy (2×2), Medium (4×4), Hard (6×6)', () => {
    assert.strictEqual(DIFFICULTIES.length, 3);

    const easy = DIFFICULTIES.find(d => d.id === 'EASY');
    const medium = DIFFICULTIES.find(d => d.id === 'MEDIUM');
    const hard = DIFFICULTIES.find(d => d.id === 'HARD');

    assert.ok(easy && easy.gridSize === 2 && easy.totalTiles === 4);
    assert.ok(medium && medium.gridSize === 4 && medium.totalTiles === 16);
    assert.ok(hard && hard.gridSize === 6 && hard.totalTiles === 36);

    assert.strictEqual(DEFAULT_DIFFICULTY, 'EASY');
  });

  it('defines all required gameplay states', () => {
    assert.strictEqual(STATES.IDLE, 'IDLE');
    assert.strictEqual(STATES.PLAYING_SEQUENCE, 'PLAYING_SEQUENCE');
    assert.strictEqual(STATES.PLAYER_INPUT, 'PLAYER_INPUT');
    assert.strictEqual(STATES.ROUND_SUCCESS, 'ROUND_SUCCESS');
    assert.strictEqual(STATES.GAME_OVER, 'GAME_OVER');
  });
});

// ── 2. Playback Speed Progression ──────────────────────────────────────────────

describe('Sequence Master Playback Timing Progression', () => {
  it('starts at specified initial targets for each difficulty mode', () => {
    const easyStart = getPlaybackTimings('EASY', 1);
    assert.strictEqual(easyStart.illuminationMs, 450);
    assert.strictEqual(easyStart.gapMs, 250);

    const medStart = getPlaybackTimings('MEDIUM', 1);
    assert.strictEqual(medStart.illuminationMs, 350);
    assert.strictEqual(medStart.gapMs, 200);

    const hardStart = getPlaybackTimings('HARD', 1);
    assert.strictEqual(hardStart.illuminationMs, 280);
    assert.strictEqual(hardStart.gapMs, 150);
  });

  it('accelerates playback monotonically with sequence length and stops at sensible minimums', () => {
    const easy1 = getPlaybackTimings('EASY', 1);
    const easy5 = getPlaybackTimings('EASY', 5);
    const easy20 = getPlaybackTimings('EASY', 20);

    assert.ok(easy5.illuminationMs < easy1.illuminationMs);
    assert.ok(easy5.gapMs < easy1.gapMs);

    // Sensible minimum limits reached
    assert.strictEqual(easy20.illuminationMs, 250);
    assert.strictEqual(easy20.gapMs, 120);

    const hard20 = getPlaybackTimings('HARD', 20);
    assert.strictEqual(hard20.illuminationMs, 140);
    assert.strictEqual(hard20.gapMs, 70);
  });
});

// ── 3. Scoring Formulas ────────────────────────────────────────────────────────

describe('Sequence Master Scoring Calculations', () => {
  it('calculates round scores: 100 for round 1, plus 10 bonus per step beyond the first', () => {
    assert.strictEqual(calculateRoundScore(1), 100);
    assert.strictEqual(calculateRoundScore(2), 110);
    assert.strictEqual(calculateRoundScore(3), 120);
    assert.strictEqual(calculateRoundScore(4), 130);
    assert.strictEqual(calculateRoundScore(5), 140);
  });

  it('calculates cumulative score accurately', () => {
    assert.strictEqual(calculateTotalScore(0), 0);
    assert.strictEqual(calculateTotalScore(1), 100);
    assert.strictEqual(calculateTotalScore(2), 210); // 100 + 110
    assert.strictEqual(calculateTotalScore(3), 330); // 100 + 110 + 120
    assert.strictEqual(calculateTotalScore(4), 460); // 100 + 110 + 120 + 130
    assert.strictEqual(calculateTotalScore(5), 600); // 100 + 110 + 120 + 130 + 140
  });

  it('evaluates performance tiers correctly across difficulty thresholds', () => {
    assert.strictEqual(getPerformanceTier(12, 'EASY').tier, 'Sequence Virtuoso');
    assert.strictEqual(getPerformanceTier(9, 'EASY').tier, 'Memory Master');
    assert.strictEqual(getPerformanceTier(6, 'EASY').tier, 'Pattern Adept');
    assert.strictEqual(getPerformanceTier(3, 'EASY').tier, 'Memory Explorer');
    assert.strictEqual(getPerformanceTier(1, 'EASY').tier, 'Novice Recall');

    // Hard thresholds are tighter
    assert.strictEqual(getPerformanceTier(8, 'HARD').tier, 'Sequence Virtuoso');
    assert.strictEqual(getPerformanceTier(6, 'HARD').tier, 'Memory Master');
  });
});

// ── 4. Grid Styles & Palettes ──────────────────────────────────────────────────

describe('Sequence Master Dynamic Grid Styling', () => {
  it('generates distinctive styles for 2x2, 4x4, and 6x6 tiles', () => {
    const tile0_easy = getTileStyle(0, 2, false, false);
    const tile1_easy = getTileStyle(1, 2, false, false);
    assert.notStrictEqual(tile0_easy['--tile-base'], tile1_easy['--tile-base']);

    const tileFailed = getTileStyle(0, 2, false, true);
    assert.strictEqual(tileFailed['--tile-base'], '#EF4444');

    const tile0_hard = getTileStyle(0, 6, false, false);
    const tile18_hard = getTileStyle(18, 6, false, false);
    assert.notStrictEqual(tile0_hard['--tile-base'], tile18_hard['--tile-base']);
  });
});

// ── 5. Sequence Master Service API Client ───────────────────────────────────────

describe('Sequence Master API Service (sequenceMasterService.js)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('getOverview returns null when backend returns 404', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Not found' }),
    });

    const result = await getOverview('00000000-0000-4000-8000-000000000006');
    assert.strictEqual(result, null);
  });

  it('getOverview returns overview DTO on successful 200 response', async () => {
    const mockOverview = {
      browserId: '00000000-0000-4000-8000-000000000006',
      easy: { difficulty: 'EASY', highestScore: 330, totalGamesPlayed: 2 },
      medium: null,
      hard: { difficulty: 'HARD', highestScore: 100, totalGamesPlayed: 1 }
    };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockOverview,
    });

    const result = await getOverview('00000000-0000-4000-8000-000000000006');
    assert.deepStrictEqual(result, mockOverview);
  });

  it('getRecord returns null on 404 for specific difficulty', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'No record' }),
    });

    const result = await getRecord('test-id', 'MEDIUM');
    assert.strictEqual(result, null);
  });

  it('submitSession sends POST request with required payload and returns DTO', async () => {
    let capturedUrl = null;
    let capturedOptions = null;

    const mockResponseDto = {
      id: 1,
      browserId: '00000000-0000-4000-8000-000000000006',
      difficulty: 'MEDIUM',
      score: 210,
      highestScore: 210,
      highestSequenceLength: 3,
      totalCompletedRounds: 2,
      totalCorrectTileInputs: 3,
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
      sessionId: 'sess-sm-client-1',
      difficulty: 'MEDIUM',
      score: 210,
      highestSequenceLength: 3,
      completedRounds: 2,
      totalCorrectTiles: 3,
      elapsedSeconds: 15.0
    };

    const result = await submitSession('00000000-0000-4000-8000-000000000006', sessionPayload);

    assert.ok(capturedUrl.includes('/sequence-master/records/00000000-0000-4000-8000-000000000006'));
    assert.strictEqual(capturedOptions.method, 'POST');
    const parsedBody = JSON.parse(capturedOptions.body);
    assert.strictEqual(parsedBody.sessionId, 'sess-sm-client-1');
    assert.strictEqual(parsedBody.difficulty, 'MEDIUM');
    assert.strictEqual(parsedBody.score, 210);
    assert.strictEqual(parsedBody.completedRounds, 2);
    assert.deepStrictEqual(result, mockResponseDto);
  });
});
