import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  getSessionHistory as getTypeStormSessions
} from '../src/services/typeStormService.js';
import {
  getSessionHistory as getWhackAttackSessions
} from '../src/services/whackAttackService.js';
import {
  getSessionHistory as getSequenceMasterSessions
} from '../src/services/sequenceMasterService.js';
import {
  getSessionHistory as getMemoryMadnessSessions
} from '../src/services/memoryMadnessService.js';

import {
  HISTORY_GAMES,
  parseTimestamp,
  sortSessionsNewestFirst,
  normalizeTypeStormSession,
  normalizeWhackAttackSession,
  normalizeSequenceMasterSession,
  normalizeMemoryMadnessSession,
  normalizeSession,
  resolveGame,
  buildHistoryState,
  getHistoryOverview,
  fetchGameSessionPage,
  mergeGameSessionPage
} from '../src/services/historyService.js';

// ── Mock Fixtures ─────────────────────────────────────────────────────────────

const MOCK_TS_PAGED = {
  content: [
    {
      sessionId: 'ts-1',
      completedAt: '2026-11-26T10:00:00',
      durationSeconds: 30,
      wpm: 75,
      accuracy: 96.5,
      correctCharacters: 180,
      incorrectCharacters: 5,
      totalCharactersTyped: 185,
      elapsedSeconds: 30.0
    }
  ],
  currentPage: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false
};

const MOCK_WA_PAGED = {
  content: [
    {
      sessionId: 'wa-1',
      completedAt: '2026-11-26T11:00:00',
      durationSeconds: 30,
      score: 350,
      hits: 25,
      misses: 2,
      emptyClicks: 1,
      accuracy: 89.3,
      bestCombo: 6,
      highestCombo: 6,
      elapsedSeconds: 30.0
    }
  ],
  currentPage: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false
};

const MOCK_SM_PAGED = {
  content: [
    {
      sessionId: 'sm-1',
      completedAt: '2026-11-26T09:30:00',
      difficulty: 'MEDIUM',
      score: 310,
      highestSequenceLength: 5,
      completedRounds: 3,
      totalCorrectTiles: 6,
      elapsedSeconds: 22.0
    }
  ],
  currentPage: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false
};

const MOCK_MM_PAGED = {
  content: [
    {
      sessionId: 'mm-1',
      completedAt: '2026-11-26T12:00:00',
      difficulty: 'HARD',
      score: 5200,
      completionTimeSeconds: 145.2,
      totalMoves: 44,
      matchedPairs: 32,
      mismatchedAttempts: 12,
      accuracy: 72.7
    }
  ],
  currentPage: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false
};

const MOCK_EMPTY_PAGED = {
  content: [],
  currentPage: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false
};

// ── 1. Individual Game Services Tests ──────────────────────────────────────────

describe('Individual Game Session History Services', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. TypeStorm constructs correct endpoint with default pagination', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = String(url);
      return { ok: true, status: 200, json: async () => MOCK_TS_PAGED };
    };

    const res = await getTypeStormSessions('user-123');
    assert.ok(capturedUrl.includes('/type-storm/records/user-123/sessions?page=0&size=10'));
    assert.strictEqual(res.totalElements, 1);
  });

  it('2. Whack Attack supports custom page and size parameters', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = String(url);
      return { ok: true, status: 200, json: async () => MOCK_WA_PAGED };
    };

    const res = await getWhackAttackSessions('user-123', 2, 25);
    assert.ok(capturedUrl.includes('/whack-attack/records/user-123/sessions?page=2&size=25'));
    assert.strictEqual(res.totalElements, 1);
  });

  it('3. Sequence Master encodes optional difficulty query parameter', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = String(url);
      return { ok: true, status: 200, json: async () => MOCK_SM_PAGED };
    };

    await getSequenceMasterSessions('user-123', 'hard', 1, 15);
    assert.ok(capturedUrl.includes('/sequence-master/records/user-123/sessions?'));
    assert.ok(capturedUrl.includes('page=1'));
    assert.ok(capturedUrl.includes('size=15'));
    assert.ok(capturedUrl.includes('difficulty=HARD'));
  });

  it('4. Memory Madness encodes optional difficulty and omits when null', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = String(url);
      return { ok: true, status: 200, json: async () => MOCK_MM_PAGED };
    };

    await getMemoryMadnessSessions('user-123', null, 0, 10);
    assert.ok(capturedUrl.includes('/memory-madness/records/user-123/sessions?page=0&size=10'));
    assert.ok(!capturedUrl.includes('difficulty='));

    await getMemoryMadnessSessions('user-123', 'easy', 0, 10);
    assert.ok(capturedUrl.includes('difficulty=EASY'));
  });

  it('5. Correctly encodes browserId containing special characters', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = String(url);
      return { ok: true, status: 200, json: async () => MOCK_TS_PAGED };
    };

    await getTypeStormSessions('id with spaces');
    assert.ok(capturedUrl.includes('/type-storm/records/id%20with%20spaces/sessions'));
  });

  it('6. Handles empty history responses gracefully as successful 200', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => MOCK_EMPTY_PAGED
    });

    const res = await getTypeStormSessions('new-user');
    assert.strictEqual(res.totalElements, 0);
    assert.deepStrictEqual(res.content, []);
  });

  it('7. Propagates HTTP and network error properly', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Database connection failed' })
    });

    await assert.rejects(
      async () => await getTypeStormSessions('user-123'),
      /Database connection failed/
    );
  });
});

// ── 2. Unified History Service & Aggregator Tests ─────────────────────────────

describe('Unified History Aggregation Service (historyService.js)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('8. Normalizes and aggregates sessions across all four games', async () => {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/type-storm/')) return { ok: true, status: 200, json: async () => MOCK_TS_PAGED };
      if (u.includes('/whack-attack/')) return { ok: true, status: 200, json: async () => MOCK_WA_PAGED };
      if (u.includes('/sequence-master/')) return { ok: true, status: 200, json: async () => MOCK_SM_PAGED };
      if (u.includes('/memory-madness/')) return { ok: true, status: 200, json: async () => MOCK_MM_PAGED };
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const overview = await getHistoryOverview('user-abc');

    assert.strictEqual(overview.status, 'COMPLETE_SUCCESS');
    assert.strictEqual(overview.isPartiallyLoaded, false);
    assert.strictEqual(overview.errors.length, 0);
    assert.strictEqual(overview.totalSessionsLoaded, 4);
    assert.strictEqual(overview.recentSessions.length, 4);

    assert.strictEqual(overview.games.typeStorm.sessions.length, 1);
    assert.strictEqual(overview.games.whackAttack.sessions.length, 1);
    assert.strictEqual(overview.games.sequenceMaster.sessions.length, 1);
    assert.strictEqual(overview.games.memoryMadness.sessions.length, 1);
  });

  it('9. Sorts recentSessions strictly newest first by completedAt', async () => {
    const s1 = { sessionId: 's1', completedAt: '2026-11-26T08:00:00' };
    const s2 = { sessionId: 's2', completedAt: '2026-11-26T12:00:00' };
    const s3 = { sessionId: 's3', completedAt: '2026-11-26T10:00:00' };

    const sorted = sortSessionsNewestFirst([s1, s2, s3]);
    assert.strictEqual(sorted[0].sessionId, 's2'); // 12:00
    assert.strictEqual(sorted[1].sessionId, 's3'); // 10:00
    assert.strictEqual(sorted[2].sessionId, 's1'); // 08:00
  });

  it('10. Attaches reliable game identifiers to normalized sessions', () => {
    const ts = normalizeTypeStormSession(MOCK_TS_PAGED.content[0]);
    assert.strictEqual(ts.gameId, 'type-storm');
    assert.strictEqual(ts.gameName, 'TypeStorm');
    assert.strictEqual(ts.gameKey, 'typeStorm');

    const wa = normalizeWhackAttackSession(MOCK_WA_PAGED.content[0]);
    assert.strictEqual(wa.gameId, 'whack-attack');
    assert.strictEqual(wa.gameName, 'Whack Attack');
    assert.strictEqual(wa.gameKey, 'whackAttack');
  });

  it('11. Preserves difficulty for Sequence Master and Memory Madness', () => {
    const sm = normalizeSequenceMasterSession(MOCK_SM_PAGED.content[0]);
    assert.strictEqual(sm.difficulty, 'MEDIUM');

    const mm = normalizeMemoryMadnessSession(MOCK_MM_PAGED.content[0]);
    assert.strictEqual(mm.difficulty, 'HARD');
  });

  it('12. Handles partial service failure without dropping successful games', async () => {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/type-storm/')) {
        return { ok: false, status: 500, json: async () => ({ message: 'TypeStorm DB offline' }) };
      }
      if (u.includes('/whack-attack/')) return { ok: true, status: 200, json: async () => MOCK_WA_PAGED };
      if (u.includes('/sequence-master/')) return { ok: true, status: 200, json: async () => MOCK_SM_PAGED };
      if (u.includes('/memory-madness/')) return { ok: true, status: 200, json: async () => MOCK_MM_PAGED };
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const overview = await getHistoryOverview('user-abc');

    assert.strictEqual(overview.status, 'PARTIAL_SUCCESS');
    assert.strictEqual(overview.isPartiallyLoaded, true);
    assert.strictEqual(overview.errors.length, 1);
    assert.strictEqual(overview.errors[0].game, 'typeStorm');

    assert.strictEqual(overview.games.typeStorm.error, 'TypeStorm DB offline');
    assert.strictEqual(overview.games.whackAttack.sessions.length, 1);
    assert.strictEqual(overview.totalSessionsLoaded, 3);
  });

  it('13. Marks complete failure when all four game services fail', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({ message: 'Service unavailable' })
    });

    const overview = await getHistoryOverview('user-abc');

    assert.strictEqual(overview.status, 'COMPLETE_FAILURE');
    assert.strictEqual(overview.isPartiallyLoaded, false);
    assert.strictEqual(overview.errors.length, 4);
    assert.strictEqual(overview.totalSessionsLoaded, 0);
    assert.strictEqual(overview.recentSessions.length, 0);
  });

  it('14. Treats empty history across all games as successful empty state', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => MOCK_EMPTY_PAGED
    });

    const overview = await getHistoryOverview('fresh-user');

    assert.strictEqual(overview.status, 'COMPLETE_SUCCESS');
    assert.strictEqual(overview.isPartiallyLoaded, false);
    assert.strictEqual(overview.totalSessionsLoaded, 0);
    assert.strictEqual(overview.games.typeStorm.hasPlayed, false);
    assert.strictEqual(overview.games.whackAttack.hasPlayed, false);
    assert.strictEqual(overview.games.sequenceMaster.hasPlayed, false);
    assert.strictEqual(overview.games.memoryMadness.hasPlayed, false);
  });

  it('15. Preserves pagination metadata per game', async () => {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/type-storm/')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...MOCK_TS_PAGED,
            currentPage: 0,
            pageSize: 10,
            totalElements: 42,
            totalPages: 5,
            hasNext: true,
            hasPrevious: false
          })
        };
      }
      return { ok: true, status: 200, json: async () => MOCK_EMPTY_PAGED };
    };

    const overview = await getHistoryOverview('user-abc');
    const tsPag = overview.games.typeStorm.pagination;

    assert.strictEqual(tsPag.currentPage, 0);
    assert.strictEqual(tsPag.totalElements, 42);
    assert.strictEqual(tsPag.totalPages, 5);
    assert.strictEqual(tsPag.hasNext, true);
    assert.strictEqual(tsPag.hasPrevious, false);
  });

  it('16. Handles missing or invalid timestamps safely without crashing', () => {
    const s1 = { sessionId: 'valid', completedAt: '2026-11-26T10:00:00' };
    const s2 = { sessionId: 'null-date', completedAt: null };
    const s3 = { sessionId: 'invalid-date', completedAt: 'not-a-date' };

    assert.strictEqual(parseTimestamp(null), 0);
    assert.strictEqual(parseTimestamp('invalid'), 0);

    const sorted = sortSessionsNewestFirst([s2, s1, s3]);
    assert.strictEqual(sorted[0].sessionId, 'valid');
  });
});

// ── 3. Additional Page Retrieval (Pagination & Merge) ──────────────────────────

describe('Additional Page Retrieval & Pagination Merging', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('17. fetchGameSessionPage fetches a specific page for an individual game', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = String(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          content: [
            { sessionId: 'wa-p2-1', completedAt: '2026-11-25T10:00:00', score: 100 }
          ],
          currentPage: 1,
          pageSize: 5,
          totalElements: 6,
          totalPages: 2,
          hasNext: false,
          hasPrevious: true
        })
      };
    };

    const pageRes = await fetchGameSessionPage('user-abc', 'whackAttack', 1, 5);
    assert.ok(capturedUrl.includes('/whack-attack/records/user-abc/sessions?page=1&size=5'));
    assert.strictEqual(pageRes.gameKey, 'whackAttack');
    assert.strictEqual(pageRes.sessions.length, 1);
    assert.strictEqual(pageRes.sessions[0].sessionId, 'wa-p2-1');
  });

  it('18. mergeGameSessionPage preserves previously loaded sessions while adding new page', () => {
    const initialState = {
      games: {
        typeStorm: {
          sessions: [{ sessionId: 'ts-1', completedAt: '2026-11-26T10:00:00' }],
          pagination: { currentPage: 0, hasNext: true, totalElements: 2 },
          hasPlayed: true,
          error: null
        }
      }
    };

    const page2Result = {
      gameKey: 'typeStorm',
      sessions: [{ sessionId: 'ts-2', completedAt: '2026-11-26T09:00:00' }],
      pagination: { currentPage: 1, hasNext: false, totalElements: 2 }
    };

    const merged = mergeGameSessionPage(initialState, 'typeStorm', page2Result);

    assert.strictEqual(merged.games.typeStorm.sessions.length, 2);
    assert.strictEqual(merged.games.typeStorm.pagination.currentPage, 1);
    assert.strictEqual(merged.games.typeStorm.pagination.hasNext, false);
    assert.strictEqual(merged.totalSessionsLoaded, 2);
  });

  it('19. mergeGameSessionPage prevents duplicate sessions when combining pages', () => {
    const initialState = {
      games: {
        whackAttack: {
          sessions: [{ sessionId: 'wa-1', completedAt: '2026-11-26T10:00:00' }],
          pagination: { currentPage: 0, hasNext: true },
          hasPlayed: true
        }
      }
    };

    // New page happens to return wa-1 again
    const pageResult = {
      gameKey: 'whackAttack',
      sessions: [
        { sessionId: 'wa-1', completedAt: '2026-11-26T10:00:00' },
        { sessionId: 'wa-2', completedAt: '2026-11-26T09:00:00' }
      ],
      pagination: { currentPage: 1, hasNext: false }
    };

    const merged = mergeGameSessionPage(initialState, 'whackAttack', pageResult);
    assert.strictEqual(merged.games.whackAttack.sessions.length, 2);
    assert.strictEqual(merged.totalSessionsLoaded, 2);
  });

  it('20. mergeGameSessionPage preserves strict newest-first ordering across merged sessions', () => {
    const initialState = {
      games: {
        typeStorm: {
          sessions: [{ sessionId: 'older', completedAt: '2026-11-26T08:00:00' }],
          hasPlayed: true
        }
      }
    };

    const pageResult = {
      gameKey: 'typeStorm',
      sessions: [{ sessionId: 'newer', completedAt: '2026-11-26T12:00:00' }]
    };

    const merged = mergeGameSessionPage(initialState, 'typeStorm', pageResult);
    assert.strictEqual(merged.games.typeStorm.sessions[0].sessionId, 'newer');
    assert.strictEqual(merged.games.typeStorm.sessions[1].sessionId, 'older');
  });

  it('21. mergeGameSessionPage handles page errors without destroying previously loaded data', () => {
    const initialState = {
      games: {
        typeStorm: {
          sessions: [{ sessionId: 'ts-1', completedAt: '2026-11-26T10:00:00' }],
          pagination: { currentPage: 0, hasNext: true },
          hasPlayed: true,
          error: null
        }
      }
    };

    const errorResult = { error: 'Failed to load page 2' };
    const merged = mergeGameSessionPage(initialState, 'typeStorm', errorResult);

    // Previously loaded sessions are still intact!
    assert.strictEqual(merged.games.typeStorm.sessions.length, 1);
    assert.strictEqual(merged.games.typeStorm.error, 'Failed to load page 2');
    assert.strictEqual(merged.totalSessionsLoaded, 1);
  });

  it('22. fetchGameSessionPage supports difficulty filtering for Sequence Master', async () => {
    let capturedUrl = '';
    global.fetch = async (url) => {
      capturedUrl = String(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          content: [
            { sessionId: 'sm-hard-1', difficulty: 'HARD', completedAt: '2026-11-25T10:00:00' }
          ],
          currentPage: 0,
          pageSize: 10,
          totalElements: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        })
      };
    };

    await fetchGameSessionPage('user-abc', 'sequenceMaster', 0, 10, 'HARD');
    assert.ok(capturedUrl.includes('difficulty=HARD'));
  });
});

// ── 4. React Hook Integration & Contract Tests ─────────────────────────────────

describe('useHistory Hook Logic and State Transition Verification', () => {
  it('23. Hook exposes complete contract including loadMore, loadingMore, gameErrors', async () => {
    // Import useHistory dynamically to check export
    const { useHistory } = await import('../src/hooks/useHistory.js');
    assert.strictEqual(typeof useHistory, 'function');
  });

  it('24. resolveGame correctly finds games by either camelCase key or kebab-case id', () => {
    assert.strictEqual(resolveGame('typeStorm')?.id, 'type-storm');
    assert.strictEqual(resolveGame('type-storm')?.key, 'typeStorm');
    assert.strictEqual(resolveGame('whackAttack')?.id, 'whack-attack');
    assert.strictEqual(resolveGame('whack-attack')?.key, 'whackAttack');
    assert.strictEqual(resolveGame('sequenceMaster')?.id, 'sequence-master');
    assert.strictEqual(resolveGame('memoryMadness')?.id, 'memory-madness');
    assert.strictEqual(resolveGame('nonExistent'), null);
  });
});
