import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  DIFFICULTIES,
  DEFAULT_DIFFICULTY,
  STATES,
  SYMBOL_POOL,
  generateDeck,
  calculateScore,
  calculateAccuracy,
  getPerformanceTier
} from '../src/games/MemoryMadness/constants.js';
import { getOverview, getRecord, submitSession } from '../src/services/memoryMadnessService.js';

// ── 1. Constants & Difficulties ────────────────────────────────────────────────

describe('Memory Madness Constants & Difficulties', () => {
  it('defines exactly three independent difficulties: Easy (4x4), Medium (6x6), Hard (8x8)', () => {
    assert.strictEqual(DIFFICULTIES.length, 3);

    const easy = DIFFICULTIES.find(d => d.id === 'EASY');
    const medium = DIFFICULTIES.find(d => d.id === 'MEDIUM');
    const hard = DIFFICULTIES.find(d => d.id === 'HARD');

    assert.ok(easy && easy.gridSize === 4 && easy.totalCards === 16 && easy.totalPairs === 8);
    assert.ok(medium && medium.gridSize === 6 && medium.totalCards === 36 && medium.totalPairs === 18);
    assert.ok(hard && hard.gridSize === 8 && hard.totalCards === 64 && hard.totalPairs === 32);

    assert.strictEqual(DEFAULT_DIFFICULTY, 'EASY');
  });

  it('defines all required gameplay states', () => {
    assert.strictEqual(STATES.IDLE, 'IDLE');
    assert.strictEqual(STATES.ACTIVE, 'ACTIVE');
    assert.strictEqual(STATES.COMPLETED, 'COMPLETED');
  });

  it('defines at least 32 distinct symbols for Hard mode', () => {
    assert.ok(SYMBOL_POOL.length >= 32);
    const uniqueIds = new Set(SYMBOL_POOL.map(s => s.id));
    assert.strictEqual(uniqueIds.size, SYMBOL_POOL.length);
  });
});

// ── 2. Deck Generation & Fisher-Yates Shuffle ───────────────────────────────────

describe('Memory Madness Deck Generation', () => {
  it('generates 16 cards with 8 matching pairs for Easy mode', () => {
    const deck = generateDeck('EASY');
    assert.strictEqual(deck.length, 16);

    const pairCounts = {};
    for (const card of deck) {
      assert.ok(card.id !== undefined);
      assert.ok(card.pairId !== undefined);
      pairCounts[card.pairId] = (pairCounts[card.pairId] || 0) + 1;
    }

    assert.strictEqual(Object.keys(pairCounts).length, 8);
    for (const pairId of Object.keys(pairCounts)) {
      assert.strictEqual(pairCounts[pairId], 2, `Pair ${pairId} must have exactly 2 cards`);
    }
  });

  it('generates 36 cards with 18 matching pairs for Medium mode', () => {
    const deck = generateDeck('MEDIUM');
    assert.strictEqual(deck.length, 36);

    const pairCounts = {};
    for (const card of deck) {
      pairCounts[card.pairId] = (pairCounts[card.pairId] || 0) + 1;
    }

    assert.strictEqual(Object.keys(pairCounts).length, 18);
    for (const pairId of Object.keys(pairCounts)) {
      assert.strictEqual(pairCounts[pairId], 2);
    }
  });

  it('generates 64 cards with 32 matching pairs for Hard mode', () => {
    const deck = generateDeck('HARD');
    assert.strictEqual(deck.length, 64);

    const pairCounts = {};
    for (const card of deck) {
      pairCounts[card.pairId] = (pairCounts[card.pairId] || 0) + 1;
    }

    assert.strictEqual(Object.keys(pairCounts).length, 32);
    for (const pairId of Object.keys(pairCounts)) {
      assert.strictEqual(pairCounts[pairId], 2);
    }
  });

  it('assigns unique card IDs to every card in the deck', () => {
    const deck = generateDeck('EASY');
    const ids = deck.map(c => c.id);
    const uniqueIds = new Set(ids);
    assert.strictEqual(uniqueIds.size, deck.length);
  });
});

// ── 3. Accuracy & Scoring Calculations ─────────────────────────────────────────

describe('Memory Madness Scoring & Accuracy Calculations', () => {
  it('calculates accuracy safely with 0 moves', () => {
    assert.strictEqual(calculateAccuracy(0, 0), 0.0);
  });

  it('calculates accuracy accurately for realistic games', () => {
    // 8 matches in 8 moves = 100%
    assert.strictEqual(calculateAccuracy(8, 8), 100.0);
    // 8 matches in 16 moves = 50%
    assert.strictEqual(calculateAccuracy(8, 16), 50.0);
    // 8 matches in 12 moves = 66.7%
    assert.strictEqual(calculateAccuracy(8, 12), 66.7);
  });

  it('calculates score with base, efficiency bonus, and time bonus', () => {
    // Easy mode: 8 pairs, target time 60s
    // Optimal game: 8 moves, 20s
    const scoreFast = calculateScore(8, 8, 20.0, 60);
    // Base = 8 * 100 = 800
    // Move diff = (8 * 2 - 8) * 25 = 8 * 25 = 200 bonus
    // Time diff = (60 - 20) * 3 = 40 * 3 = 120 bonus
    // Total = 800 + 200 + 120 = 1120
    assert.strictEqual(scoreFast, 1120);

    // Slower game exceeding par moves and time
    const scoreSlow = calculateScore(8, 25, 90.0, 60);
    // Base = 800, moveBonus = max(0, (16 - 25)*25) = 0, timeBonus = max(0, (60-90)*3) = 0
    assert.strictEqual(scoreSlow, 800);
  });

  it('evaluates performance tiers correctly across accuracy and speed thresholds', () => {
    assert.strictEqual(getPerformanceTier(80.0, 25.0, 'EASY').tier, 'Photographic Prodigy');
    assert.strictEqual(getPerformanceTier(65.0, 50.0, 'EASY').tier, 'Mind Master');
    assert.strictEqual(getPerformanceTier(50.0, 70.0, 'EASY').tier, 'Sharp Memory');
    assert.strictEqual(getPerformanceTier(35.0, 80.0, 'EASY').tier, 'Card Tracker');
    assert.strictEqual(getPerformanceTier(20.0, 100.0, 'EASY').tier, 'Memory Explorer');
  });
});

// ── 4. API Service Client ──────────────────────────────────────────────────────

describe('Memory Madness API Service (memoryMadnessService.js)', () => {
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

    const result = await getOverview('00000000-0000-4000-8000-000000000007');
    assert.strictEqual(result, null);
  });

  it('getOverview returns overview DTO on successful 200 response', async () => {
    const mockOverview = {
      browserId: '00000000-0000-4000-8000-000000000007',
      easy: { difficulty: 'EASY', highestScore: 1250, fewestMoves: 12, fastestTimeSeconds: 24.5, totalGamesPlayed: 3 },
      medium: null,
      hard: null
    };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockOverview,
    });

    const result = await getOverview('00000000-0000-4000-8000-000000000007');
    assert.deepStrictEqual(result, mockOverview);
  });

  it('getRecord returns null on 404 for specific difficulty', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'No record' }),
    });

    const result = await getRecord('test-id', 'HARD');
    assert.strictEqual(result, null);
  });

  it('submitSession sends POST request with required payload and returns DTO', async () => {
    let capturedUrl = null;
    let capturedOptions = null;

    const mockResponseDto = {
      id: 1,
      browserId: '00000000-0000-4000-8000-000000000007',
      difficulty: 'EASY',
      score: 1120,
      moves: 12,
      accuracy: 66.7,
      elapsedSeconds: 28.4,
      highestScore: 1120,
      fewestMoves: 12,
      fastestTimeSeconds: 28.4,
      bestAccuracy: 66.7,
      totalGamesPlayed: 1,
      totalPairsMatched: 8,
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
      sessionId: 'sess-mm-client-1',
      difficulty: 'EASY',
      score: 1120,
      moves: 12,
      matchedPairs: 8,
      accuracy: 66.7,
      elapsedSeconds: 28.4
    };

    const result = await submitSession('00000000-0000-4000-8000-000000000007', sessionPayload);

    assert.ok(capturedUrl.includes('/memory-madness/records/00000000-0000-4000-8000-000000000007'));
    assert.strictEqual(capturedOptions.method, 'POST');
    const parsedBody = JSON.parse(capturedOptions.body);
    assert.strictEqual(parsedBody.sessionId, 'sess-mm-client-1');
    assert.strictEqual(parsedBody.difficulty, 'EASY');
    assert.strictEqual(parsedBody.moves, 12);
    assert.strictEqual(parsedBody.matchedPairs, 8);
    assert.deepStrictEqual(result, mockResponseDto);
  });
});
