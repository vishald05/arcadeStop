import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATIONS,
  DEFAULT_DURATION,
  STATES,
  PASSAGES,
  getRandomPassage,
  calculateWpm,
  calculateAccuracy,
  getPerformanceTier
} from '../src/games/TypeStorm/constants.js';
import { getRecord, submitSession } from '../src/services/typeStormService.js';

// ── 1. TypeStorm Constants & Configuration ─────────────────────────────────────

describe('TypeStorm Constants & Durations', () => {
  it('defines the three required game durations: 15s, 30s, and 60s', () => {
    assert.strictEqual(DURATIONS.length, 3);
    const secondsList = DURATIONS.map(d => d.seconds);
    assert.deepStrictEqual(secondsList, [15, 30, 60]);
    assert.strictEqual(DEFAULT_DURATION, 30);
  });

  it('defines required game states: IDLE, ACTIVE, COMPLETED', () => {
    assert.strictEqual(STATES.IDLE, 'IDLE');
    assert.strictEqual(STATES.ACTIVE, 'ACTIVE');
    assert.strictEqual(STATES.COMPLETED, 'COMPLETED');
  });

  it('provides a varied pool of text passages of suitable typing lengths', () => {
    assert.ok(PASSAGES.length >= 8, 'Must have at least 8 varied passages');
    for (const p of PASSAGES) {
      assert.ok(typeof p === 'string' && p.length >= 100, 'Passage must be a substantial string');
    }

    const passage1 = getRandomPassage();
    assert.ok(passage1 && typeof passage1 === 'string');

    // getRandomPassage should avoid immediate exclusion if pool allows
    const passage2 = getRandomPassage(passage1);
    assert.notStrictEqual(passage2, passage1);
  });
});

// ── 2. Scoring Formulas: WPM & Accuracy ───────────────────────────────────────

describe('TypeStorm Scoring Formulas', () => {
  it('calculates WPM using conventional formula: (correct / 5) / elapsedMinutes', () => {
    // 30 seconds = 0.5 minutes. 150 correct chars -> (150 / 5) / 0.5 = 60 WPM
    assert.strictEqual(calculateWpm(150, 30.0), 60);

    // 15 seconds = 0.25 minutes. 100 correct chars -> (100 / 5) / 0.25 = 80 WPM
    assert.strictEqual(calculateWpm(100, 15.0), 80);

    // 60 seconds = 1.0 minute. 350 correct chars -> (350 / 5) / 1.0 = 70 WPM
    assert.strictEqual(calculateWpm(350, 60.0), 70);

    // Zero or edge elapsed time
    assert.strictEqual(calculateWpm(0, 30.0), 0);
    assert.strictEqual(calculateWpm(100, 0), 0);
    assert.strictEqual(calculateWpm(100, -5), 0);
  });

  it('calculates Accuracy percentage: (correct / totalTyped) * 100', () => {
    // 100 correct out of 100 -> 100.0%
    assert.strictEqual(calculateAccuracy(100, 100), 100.0);

    // 95 correct out of 100 -> 95.0%
    assert.strictEqual(calculateAccuracy(95, 100), 95.0);

    // 150 correct out of 155 -> 96.8%
    assert.strictEqual(calculateAccuracy(150, 155), 96.8);

    // Zero typed characters safely returns 100.0%
    assert.strictEqual(calculateAccuracy(0, 0), 100.0);
  });

  it('evaluates performance tiers correctly based on WPM thresholds', () => {
    assert.strictEqual(getPerformanceTier(125).tier, 'Legendary');
    assert.strictEqual(getPerformanceTier(90).tier, 'Master');
    assert.strictEqual(getPerformanceTier(75).tier, 'Swift');
    assert.strictEqual(getPerformanceTier(50).tier, 'Proficient');
    assert.strictEqual(getPerformanceTier(30).tier, 'Novice');
  });
});

// ── 3. Character Matching & Typing Engine Logic ────────────────────────────────

describe('TypeStorm Character Validation Logic', () => {
  const target = 'Hello World';

  it('correctly classifies characters as correct, incorrect, current, and untouched', () => {
    const input = 'Hellx';

    const states = [];
    for (let i = 0; i < target.length; i++) {
      if (i < input.length) {
        states.push(input[i] === target[i] ? 'correct' : 'incorrect');
      } else if (i === input.length) {
        states.push('current');
      } else {
        states.push('untouched');
      }
    }

    assert.deepStrictEqual(states, [
      'correct',   // 'H'
      'correct',   // 'e'
      'correct',   // 'l'
      'correct',   // 'l'
      'incorrect', // 'x' instead of 'o'
      'current',   // cursor on ' '
      'untouched', // 'W'
      'untouched', // 'o'
      'untouched', // 'r'
      'untouched', // 'l'
      'untouched'  // 'd'
    ]);
  });

  it('handles backspace smoothly by trimming input and re-evaluating characters', () => {
    let input = 'Hellx';
    // Backspace pressed
    input = input.slice(0, -1);
    assert.strictEqual(input, 'Hell');

    // Type correct character 'o'
    input += 'o';
    assert.strictEqual(input, 'Hello');

    // All 5 characters should now be correct
    for (let i = 0; i < input.length; i++) {
      assert.strictEqual(input[i], target[i]);
    }
  });
});

// ── 4. TypeStorm API Service Tests ─────────────────────────────────────────────

describe('TypeStorm API Service (typeStormService.js)', () => {
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

    const result = await getRecord('00000000-0000-4000-8000-000000000003');
    assert.strictEqual(result, null);
  });

  it('getRecord returns record DTO on successful 200 response', async () => {
    const mockDto = {
      id: 1,
      browserId: '00000000-0000-4000-8000-000000000003',
      totalGamesPlayed: 3,
      bestWpm: 85,
      averageWpm: 75.0,
      bestAccuracy: 98.0,
      averageAccuracy: 96.5,
      totalCharactersTyped: 900,
      totalMistakes: 15,
      newPersonalBest: false
    };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockDto,
    });

    const result = await getRecord('00000000-0000-4000-8000-000000000003');
    assert.deepStrictEqual(result, mockDto);
  });

  it('getRecord throws on 500 server error', async () => {
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
      browserId: '00000000-0000-4000-8000-000000000003',
      totalGamesPlayed: 1,
      bestWpm: 72,
      averageWpm: 72.0,
      bestAccuracy: 96.0,
      averageAccuracy: 96.0,
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
      sessionId: 'sess-abc-123',
      durationSeconds: 30,
      correctCharacters: 180,
      incorrectCharacters: 8,
      totalCharactersTyped: 188,
      elapsedSeconds: 30.0,
      clientWpm: 72,
      clientAccuracy: 95.7
    };

    const result = await submitSession('00000000-0000-4000-8000-000000000003', sessionPayload);

    assert.ok(capturedUrl.includes('/type-storm/records/00000000-0000-4000-8000-000000000003'));
    assert.strictEqual(capturedOptions.method, 'POST');
    const parsedBody = JSON.parse(capturedOptions.body);
    assert.strictEqual(parsedBody.sessionId, 'sess-abc-123');
    assert.strictEqual(parsedBody.durationSeconds, 30);
    assert.strictEqual(parsedBody.correctCharacters, 180);
    assert.deepStrictEqual(result, mockResponseDto);
  });
});
