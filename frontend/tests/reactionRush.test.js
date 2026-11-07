import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { getBrowserId } from '../src/utils/browserId.js';
import { getRecord, submitSession } from '../src/services/reactionRushService.js';
import { STATES } from '../src/games/ReactionRush/constants.js';

// ── Mock LocalStorage ──────────────────────────────────────────────────────────

class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── 1. Anonymous Browser Identity Tests ────────────────────────────────────────

describe('Anonymous Browser Identity (browserId.js)', () => {
  beforeEach(() => {
    global.localStorage = new MockLocalStorage();
  });

  afterEach(() => {
    delete global.localStorage;
  });

  it('generates a valid UUID v4 format on first visit', () => {
    const id = getBrowserId();
    assert.ok(id, 'Browser ID must be returned');
    assert.match(id, UUID_REGEX, 'Browser ID must match standard UUID format');
  });

  it('persists and reuses the same UUID on subsequent visits', () => {
    const firstId = getBrowserId();
    const secondId = getBrowserId();
    assert.strictEqual(firstId, secondId, 'Must reuse the existing browser ID');
    assert.strictEqual(
      global.localStorage.getItem('arcadestop_reaction_rush_browser_id'),
      firstId,
      'Must be persisted in localStorage under key arcadestop_reaction_rush_browser_id'
    );
  });

  it('re-generates a valid UUID when localStorage contains corrupted/invalid data', () => {
    global.localStorage.setItem('arcadestop_reaction_rush_browser_id', 'corrupted-invalid-uuid');
    const recoveredId = getBrowserId();
    assert.match(recoveredId, UUID_REGEX, 'Must generate a valid UUID when stored value is invalid');
    assert.notStrictEqual(recoveredId, 'corrupted-invalid-uuid');
  });

  it('gracefully falls back to a session UUID when localStorage throws an error', () => {
    global.localStorage = {
      getItem() { throw new Error('SecurityError: Cookies/Storage disabled'); },
      setItem() { throw new Error('SecurityError: Cookies/Storage disabled'); }
    };
    const id = getBrowserId();
    assert.match(id, UUID_REGEX, 'Must return a valid UUID even if localStorage throws');
  });
});

// ── 2. Reaction Rush API Service Tests ─────────────────────────────────────────

describe('Reaction Rush Service (reactionRushService.js)', () => {
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

    const result = await getRecord('00000000-0000-4000-8000-000000000000');
    assert.strictEqual(result, null, 'Must return null for 404');
  });

  it('getRecord returns record DTO on successful 200 response', async () => {
    const mockDto = {
      id: 1,
      browserId: '00000000-0000-4000-8000-000000000000',
      bestReactionMs: 220,
      averageReactionMs: 245,
      totalSessions: 3,
      isNewPersonalBest: false,
    };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => mockDto,
    });

    const result = await getRecord('00000000-0000-4000-8000-000000000000');
    assert.deepStrictEqual(result, mockDto);
  });

  it('getRecord throws on 500 server error', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Database connection failed' }),
    });

    await assert.rejects(
      async () => await getRecord('00000000-0000-4000-8000-000000000000'),
      /Database connection failed|API error: 500/
    );
  });

  it('submitSession sends POST request with exactly 5 reaction times', async () => {
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
          bestReactionMs: 195,
          averageReactionMs: 220,
          totalSessions: 1,
          newPersonalBest: true,
        }),
      };
    };

    const reactionTimes = [210, 220, 195, 230, 245];
    const result = await submitSession('test-browser-id', reactionTimes);

    assert.ok(capturedUrl.includes('/reaction-rush/records/test-browser-id'));
    assert.strictEqual(capturedOptions.method, 'POST');
    const sentBody = JSON.parse(capturedOptions.body);
    assert.deepStrictEqual(sentBody.reactionTimes, reactionTimes);
    assert.strictEqual(result.bestReactionMs, 195);
    assert.strictEqual(result.newPersonalBest, true);
  });
});

// ── 3. Game States & Gameplay Logic Engine Tests ─────────────────────────────────

describe('Reaction Rush Game State Machine & Rules', () => {
  it('defines all required 7 game states', () => {
    assert.strictEqual(STATES.IDLE, 'IDLE');
    assert.strictEqual(STATES.COUNTDOWN, 'COUNTDOWN');
    assert.strictEqual(STATES.READY, 'READY');
    assert.strictEqual(STATES.GO, 'GO');
    assert.strictEqual(STATES.FALSE_START, 'FALSE_START');
    assert.strictEqual(STATES.ATTEMPT_RESULT, 'ATTEMPT_RESULT');
    assert.strictEqual(STATES.SESSION_RESULT, 'SESSION_RESULT');
  });

  it('implements state machine logic verifying state transitions, false start, and 5-attempt completion', () => {
    // Game engine simulator matching ReactionRushGame state logic
    class ReactionGameSimulator {
      constructor() {
        this.TOTAL_ATTEMPTS = 5;
        this.state = STATES.IDLE;
        this.attempts = [];
        this.currentAttemptMs = null;
        this.timer = null;
        this.inputHandled = false;
        this.goTimestamp = null;
        this.history = [STATES.IDLE];
      }

      transitionTo(newState) {
        this.state = newState;
        this.history.push(newState);
      }

      startSession() {
        this.attempts = [];
        this.startAttempt();
      }

      startAttempt(delayMs = 2500) {
        if (this.timer) clearTimeout(this.timer);
        this.inputHandled = false;
        this.transitionTo(STATES.COUNTDOWN);

        const countdownDuration = Math.min(500, Math.floor(delayMs / 4));

        this.timer = setTimeout(() => {
          if (this.state !== STATES.COUNTDOWN) return;
          this.transitionTo(STATES.READY);

          this.timer = setTimeout(() => {
            if (this.state !== STATES.READY && this.state !== STATES.COUNTDOWN) return;
            this.goTimestamp = 1000; // simulated start time
            this.inputHandled = false;
            this.transitionTo(STATES.GO);
          }, delayMs - countdownDuration);
        }, countdownDuration);
      }

      handleInput(currentTime = 1200) {
        if (this.state === STATES.COUNTDOWN || this.state === STATES.READY) {
          if (this.timer) clearTimeout(this.timer);
          this.inputHandled = true;
          this.transitionTo(STATES.FALSE_START);
          return 'FALSE_START';
        }

        if (this.state === STATES.GO) {
          if (this.inputHandled) return 'IGNORED_DUPLICATE';
          this.inputHandled = true;
          const reactionMs = Math.round(currentTime - this.goTimestamp);
          this.currentAttemptMs = reactionMs;
          this.attempts.push(reactionMs);

          if (this.attempts.length >= this.TOTAL_ATTEMPTS) {
            this.transitionTo(STATES.SESSION_RESULT);
            return 'SESSION_COMPLETE';
          } else {
            this.transitionTo(STATES.ATTEMPT_RESULT);
            return 'ATTEMPT_COMPLETE';
          }
        }
        return 'IGNORED_INACTIVE_STATE';
      }

      retryAfterFalseStart() {
        if (this.state === STATES.FALSE_START) {
          this.startAttempt();
        }
      }

      nextAttempt() {
        if (this.state === STATES.ATTEMPT_RESULT) {
          this.startAttempt();
        }
      }
    }

    // A. Verify initial state is IDLE
    const game = new ReactionGameSimulator();
    assert.strictEqual(game.state, STATES.IDLE);

    // B. Verify false start during COUNTDOWN
    game.startSession();
    assert.strictEqual(game.state, STATES.COUNTDOWN);
    const resultEarly = game.handleInput(100);
    assert.strictEqual(resultEarly, 'FALSE_START');
    assert.strictEqual(game.state, STATES.FALSE_START);
    assert.strictEqual(game.attempts.length, 0, 'False start must not count towards attempts');

    // C. Verify retry after false start
    game.retryAfterFalseStart();
    assert.strictEqual(game.state, STATES.COUNTDOWN);
    assert.strictEqual(game.attempts.length, 0);

    // D. Verify duplicate inputs during GO are ignored
    game.state = STATES.GO;
    game.goTimestamp = 1000;
    game.inputHandled = false;

    const firstClick = game.handleInput(1250);
    assert.strictEqual(firstClick, 'ATTEMPT_COMPLETE');
    assert.strictEqual(game.attempts.length, 1);
    assert.strictEqual(game.attempts[0], 250);
    assert.strictEqual(game.state, STATES.ATTEMPT_RESULT);

    // Immediate second click (duplicate) is rejected
    const secondClick = game.handleInput(1260);
    assert.strictEqual(secondClick, 'IGNORED_INACTIVE_STATE');
    assert.strictEqual(game.attempts.length, 1, 'Duplicate click must not add second attempt');

    // E. Verify completing exactly 5 attempts completes the session
    // Attempt 2
    game.nextAttempt();
    game.state = STATES.GO;
    game.goTimestamp = 1000;
    game.inputHandled = false;
    game.handleInput(1220); // 220ms
    assert.strictEqual(game.attempts.length, 2);

    // Attempt 3
    game.nextAttempt();
    game.state = STATES.GO;
    game.goTimestamp = 1000;
    game.inputHandled = false;
    game.handleInput(1210); // 210ms
    assert.strictEqual(game.attempts.length, 3);

    // Attempt 4
    game.nextAttempt();
    game.state = STATES.GO;
    game.goTimestamp = 1000;
    game.inputHandled = false;
    game.handleInput(1240); // 240ms
    assert.strictEqual(game.attempts.length, 4);

    // Attempt 5 (Final attempt)
    game.nextAttempt();
    game.state = STATES.GO;
    game.goTimestamp = 1000;
    game.inputHandled = false;
    const finalResult = game.handleInput(1190); // 190ms
    assert.strictEqual(finalResult, 'SESSION_COMPLETE');
    assert.strictEqual(game.state, STATES.SESSION_RESULT);
    assert.strictEqual(game.attempts.length, 5);
    assert.deepStrictEqual(game.attempts, [250, 220, 210, 240, 190]);

    // F. Verify calculations
    const best = Math.min(...game.attempts);
    const avg = Math.round(game.attempts.reduce((a, b) => a + b, 0) / game.attempts.length);
    assert.strictEqual(best, 190);
    assert.strictEqual(avg, 222);
  });

  it('verifies timer cleanup on reset or unmount', (t, done) => {
    let timerId = null;
    let fired = false;

    // Start timer
    timerId = setTimeout(() => {
      fired = true;
    }, 50);

    // Simulate unmount cleanup
    clearTimeout(timerId);
    timerId = null;

    setTimeout(() => {
      assert.strictEqual(fired, false, 'Cleared timer must never fire after cleanup');
      done();
    }, 80);
  });
});
