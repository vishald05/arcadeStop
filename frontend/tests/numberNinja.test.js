import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ATTEMPTS,
  MIN_NUMBER,
  MAX_NUMBER,
  STATES,
  generateSecretNumber,
} from '../src/games/NumberNinja/constants.js';
import { getRecord, submitSession } from '../src/services/numberNinjaService.js';

// ── 1. Random Number Generation Tests ──────────────────────────────────────────

describe('Number Ninja Constants & RNG', () => {
  it('defines required game states and limits', () => {
    assert.strictEqual(STATES.IDLE, 'IDLE');
    assert.strictEqual(STATES.PLAYING, 'PLAYING');
    assert.strictEqual(STATES.WON, 'WON');
    assert.strictEqual(STATES.LOST, 'LOST');
    assert.strictEqual(MAX_ATTEMPTS, 7);
    assert.strictEqual(MIN_NUMBER, 1);
    assert.strictEqual(MAX_NUMBER, 100);
  });

  it('generates random integers strictly within 1 and 100 inclusive', () => {
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      const num = generateSecretNumber(MIN_NUMBER, MAX_NUMBER);
      assert.ok(Number.isInteger(num), 'Generated number must be an integer');
      assert.ok(num >= 1, `Number ${num} must be >= 1`);
      assert.ok(num <= 100, `Number ${num} must be <= 100`);
      seen.add(num);
    }
    assert.ok(seen.size > 1, 'RNG should produce varied numbers across iterations');
  });
});

// ── 2. Number Ninja API Service Tests ──────────────────────────────────────────

describe('Number Ninja Service (numberNinjaService.js)', () => {
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

    const result = await getRecord('00000000-0000-4000-8000-000000000002');
    assert.strictEqual(result, null, 'Must return null for 404');
  });

  it('getRecord returns record DTO on successful 200 response', async () => {
    const mockDto = {
      id: 2,
      browserId: '00000000-0000-4000-8000-000000000002',
      totalGamesPlayed: 5,
      totalGamesWon: 4,
      totalGuessesInWins: 16,
      bestGuesses: 3,
      currentWinStreak: 2,
      bestWinStreak: 3,
      winPercentage: 80.0,
      averageGuessesPerWin: 4.0,
      isNewPersonalBest: false,
    };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => mockDto,
    });

    const result = await getRecord('00000000-0000-4000-8000-000000000002');
    assert.deepStrictEqual(result, mockDto);
  });

  it('getRecord rethrows on 500 server error', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'DB error' }),
    });

    await assert.rejects(
      async () => await getRecord('test-id'),
      /DB error|API error: 500/
    );
  });

  it('submitSession sends POST request with sessionId, won, and guessesUsed', async () => {
    let capturedUrl = null;
    let capturedOptions = null;

    global.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          browserId: 'test-id',
          totalGamesPlayed: 1,
          totalGamesWon: 1,
          bestGuesses: 4,
          newPersonalBest: true,
        }),
      };
    };

    const payload = {
      sessionId: 'sess-abc-123',
      won: true,
      guessesUsed: 4,
    };

    const result = await submitSession('test-browser-ninja', payload);

    assert.ok(capturedUrl.includes('/number-ninja/records/test-browser-ninja'));
    assert.strictEqual(capturedOptions.method, 'POST');
    assert.deepStrictEqual(JSON.parse(capturedOptions.body), payload);
    assert.strictEqual(result.totalGamesWon, 1);
  });
});

// ── 3. Number Ninja Game Logic & Validation Simulator ──────────────────────────

describe('Number Ninja Game Engine Logic & Range Updates', () => {
  class NumberNinjaEngine {
    constructor(secret = 42) {
      this.secret = secret;
      this.state = STATES.IDLE;
      this.guesses = [];
      this.minPossible = 1;
      this.maxPossible = 100;
      this.attemptsLeft = 7;
    }

    startGame() {
      this.state = STATES.PLAYING;
      this.guesses = [];
      this.minPossible = 1;
      this.maxPossible = 100;
      this.attemptsLeft = MAX_ATTEMPTS;
    }

    validate(rawInput) {
      if (rawInput === null || rawInput === undefined || String(rawInput).trim() === '') {
        return { valid: false, error: 'Please enter a number between 1 and 100.' };
      }
      const trimmed = String(rawInput).trim();
      if (!/^-?\d+$/.test(trimmed)) {
        return { valid: false, error: 'Please enter a whole integer without decimals or letters.' };
      }
      const num = parseInt(trimmed, 10);
      if (num < MIN_NUMBER || num > MAX_NUMBER) {
        return { valid: false, error: 'Your guess must be between 1 and 100.' };
      }
      if (this.guesses.some(g => g.number === num)) {
        return { valid: false, error: `You already guessed ${num}!` };
      }
      return { valid: true, value: num };
    }

    makeGuess(rawInput) {
      if (this.state !== STATES.PLAYING) {
        return { status: 'IGNORED_GAME_NOT_ACTIVE' };
      }

      const check = this.validate(rawInput);
      if (!check.valid) {
        return { status: 'VALIDATION_ERROR', error: check.error };
      }

      const num = check.value;
      this.attemptsLeft -= 1;

      let feedback = '';
      if (num === this.secret) {
        feedback = 'CORRECT';
        this.guesses.push({ number: num, feedback });
        this.state = STATES.WON;
        return { status: 'WON', feedback, guessesUsed: this.guesses.length };
      } else if (num < this.secret) {
        feedback = 'LOW';
        this.minPossible = Math.max(this.minPossible, num + 1);
      } else {
        feedback = 'HIGH';
        this.maxPossible = Math.min(this.maxPossible, num - 1);
      }

      this.guesses.push({ number: num, feedback });

      if (this.guesses.length >= MAX_ATTEMPTS) {
        this.state = STATES.LOST;
        return { status: 'LOST', feedback, guessesUsed: MAX_ATTEMPTS };
      }

      return { status: 'CONTINUE', feedback };
    }
  }

  it('validates invalid inputs without consuming attempts', () => {
    const game = new NumberNinjaEngine(50);
    game.startGame();
    assert.strictEqual(game.attemptsLeft, 7);

    // Empty input
    const emptyRes = game.makeGuess('');
    assert.strictEqual(emptyRes.status, 'VALIDATION_ERROR');
    assert.strictEqual(game.attemptsLeft, 7, 'Attempt count must not decrease on empty input');

    // Decimal input
    const decimalRes = game.makeGuess('50.5');
    assert.strictEqual(decimalRes.status, 'VALIDATION_ERROR');
    assert.strictEqual(game.attemptsLeft, 7, 'Attempt count must not decrease on decimal input');

    // Non-numeric input
    const lettersRes = game.makeGuess('ninja');
    assert.strictEqual(lettersRes.status, 'VALIDATION_ERROR');
    assert.strictEqual(game.attemptsLeft, 7);

    // Out of range (0 and 101)
    const zeroRes = game.makeGuess(0);
    assert.strictEqual(zeroRes.status, 'VALIDATION_ERROR');
    const overRes = game.makeGuess(101);
    assert.strictEqual(overRes.status, 'VALIDATION_ERROR');
    assert.strictEqual(game.attemptsLeft, 7);
  });

  it('updates dynamic range correctly when guessing too low and too high', () => {
    // Secret number is 63
    const game = new NumberNinjaEngine(63);
    game.startGame();

    assert.strictEqual(game.minPossible, 1);
    assert.strictEqual(game.maxPossible, 100);

    // Guess 40: too low -> min should become 41
    const res1 = game.makeGuess(40);
    assert.strictEqual(res1.feedback, 'LOW');
    assert.strictEqual(game.minPossible, 41);
    assert.strictEqual(game.maxPossible, 100);
    assert.strictEqual(game.attemptsLeft, 6);

    // Guess 85: too high -> max should become 84
    const res2 = game.makeGuess(85);
    assert.strictEqual(res2.feedback, 'HIGH');
    assert.strictEqual(game.minPossible, 41);
    assert.strictEqual(game.maxPossible, 84);
    assert.strictEqual(game.attemptsLeft, 5);

    // Duplicate guess (40) -> validation error, attempts preserved
    const dupRes = game.makeGuess(40);
    assert.strictEqual(dupRes.status, 'VALIDATION_ERROR');
    assert.strictEqual(game.attemptsLeft, 5);

    // Guess 60: too low -> min becomes 61
    game.makeGuess(60);
    assert.strictEqual(game.minPossible, 61);
    assert.strictEqual(game.maxPossible, 84);

    // Guess 70: too high -> max becomes 69
    game.makeGuess(70);
    assert.strictEqual(game.minPossible, 61);
    assert.strictEqual(game.maxPossible, 69);
  });

  it('produces immediate win on correct guess and blocks subsequent guesses', () => {
    const game = new NumberNinjaEngine(42);
    game.startGame();

    // Guess 1
    game.makeGuess(30); // LOW
    assert.strictEqual(game.state, STATES.PLAYING);

    // Guess 2: Correct!
    const winRes = game.makeGuess(42);
    assert.strictEqual(winRes.status, 'WON');
    assert.strictEqual(winRes.feedback, 'CORRECT');
    assert.strictEqual(game.state, STATES.WON);
    assert.strictEqual(winRes.guessesUsed, 2);

    // Further guesses must be ignored once game is WON
    const extraGuess = game.makeGuess(42);
    assert.strictEqual(extraGuess.status, 'IGNORED_GAME_NOT_ACTIVE');
  });

  it('produces loss after exactly 7 incorrect guesses and blocks further guesses', () => {
    const game = new NumberNinjaEngine(50);
    game.startGame();

    const guesses = [10, 20, 30, 40, 60, 70, 80];
    for (let i = 0; i < guesses.length - 1; i++) {
      const res = game.makeGuess(guesses[i]);
      assert.strictEqual(res.status, 'CONTINUE');
      assert.strictEqual(game.state, STATES.PLAYING);
    }

    // 7th guess
    const finalRes = game.makeGuess(guesses[6]);
    assert.strictEqual(finalRes.status, 'LOST');
    assert.strictEqual(game.state, STATES.LOST);
    assert.strictEqual(game.guesses.length, 7);

    // 8th guess must be blocked
    const eighth = game.makeGuess(50);
    assert.strictEqual(eighth.status, 'IGNORED_GAME_NOT_ACTIVE');
  });
});
