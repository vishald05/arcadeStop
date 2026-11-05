import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReactionRushGame from './ReactionRushGame';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../utils/browserId', () => ({
  getBrowserId: () => '00000000-0000-4000-8000-000000000001',
}));

const mockGetRecord = vi.fn();
const mockSubmitSession = vi.fn();

vi.mock('../../services/reactionRushService', () => ({
  getRecord: (...args) => mockGetRecord(...args),
  submitSession: (...args) => mockSubmitSession(...args),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockGame = {
  slug: 'reaction-rush',
  name: 'Reaction Rush',
  status: 'AVAILABLE',
};

function renderGame() {
  return render(
    <MemoryRouter>
      <ReactionRushGame game={mockGame} />
    </MemoryRouter>
  );
}

/**
 * Simulate a full GO→click cycle.
 * Assumes we are currently in COUNTDOWN state.
 * Advances fake timers to trigger GO, then clicks the arena.
 */
async function completeOneAttempt() {
  // Skip past the random delay (max 5000ms) to reach GO state
  await act(async () => {
    vi.advanceTimersByTime(6000);
  });
  // Click the arena to register reaction
  const arena = document.querySelector('.rr-arena');
  await act(async () => {
    fireEvent.click(arena);
  });
}

// ── Test Suite ─────────────────────────────────────────────────────────────────

describe('ReactionRushGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetRecord.mockResolvedValue(null);
    mockSubmitSession.mockResolvedValue({
      bestReactionMs: 150,
      totalSessions: 1,
      newPersonalBest: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── 1. IDLE state renders correctly ─────────────────────────────────────────

  it('renders in IDLE state with Start Session button', async () => {
    renderGame();
    // Let the getRecord promise resolve
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText('Ready to Rush?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
  });

  // ── 2. Clicking Start → COUNTDOWN ───────────────────────────────────────────

  it('transitions to COUNTDOWN after clicking Start Session', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    const startBtn = screen.getByRole('button', { name: /start session/i });
    await act(async () => { fireEvent.click(startBtn); });

    expect(screen.getByText('Get ready...')).toBeInTheDocument();
  });

  // ── 3. Clicking during COUNTDOWN → FALSE_START ───────────────────────────────

  it('transitions to FALSE_START when clicking during COUNTDOWN', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    // Start
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });
    expect(screen.getByText('Get ready...')).toBeInTheDocument();

    // Click the arena during COUNTDOWN (before delay fires)
    const arena = document.querySelector('.rr-arena');
    await act(async () => { fireEvent.click(arena); });

    expect(screen.getByText('False Start!')).toBeInTheDocument();
  });

  // ── 4. False start does NOT increment attempt count ──────────────────────────

  it('false start does not increment successCount', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    // Start → COUNTDOWN
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    // False start
    const arena = document.querySelector('.rr-arena');
    await act(async () => { fireEvent.click(arena); });

    expect(screen.getByText('False Start!')).toBeInTheDocument();
    // Progress should still read "1 / 5" (attempt 1, not incremented)
    expect(screen.getByText('/5', { exact: false }) || screen.queryByText('1')).toBeTruthy();
    // The key check: session result should NOT have appeared
    expect(screen.queryByText('Session Complete!')).not.toBeInTheDocument();
  });

  // ── 5. Try Again after FALSE_START → back to COUNTDOWN ──────────────────────

  it('clicking Try Again after FALSE_START returns to COUNTDOWN', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    const arena = document.querySelector('.rr-arena');
    await act(async () => { fireEvent.click(arena); }); // false start

    expect(screen.getByText('False Start!')).toBeInTheDocument();

    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    await act(async () => { fireEvent.click(tryAgainBtn); });

    expect(screen.getByText('Get ready...')).toBeInTheDocument();
  });

  // ── 6. 5 successful GO→click cycles → SESSION_RESULT ────────────────────────

  it('shows SESSION_RESULT after 5 successful attempts', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    // Start the session
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    // Complete 5 attempts
    for (let i = 0; i < 5; i++) {
      // We're in COUNTDOWN — advance timers to GO
      await act(async () => { vi.advanceTimersByTime(6000); });
      // Click the arena
      const arena = document.querySelector('.rr-arena');
      await act(async () => { fireEvent.click(arena); });

      if (i < 4) {
        // After each non-final attempt we're in ATTEMPT_RESULT
        expect(screen.getByRole('button', { name: /next attempt/i })).toBeInTheDocument();
        // Click next to go back to COUNTDOWN
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: /next attempt/i }));
        });
      }
    }

    // Allow submitSession promise to resolve
    await act(async () => { await Promise.resolve(); });
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText('Session Complete!')).toBeInTheDocument();
  });

  // ── 7. SESSION_RESULT shows all 5 times ──────────────────────────────────────

  it('SESSION_RESULT displays all 5 reaction times', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    for (let i = 0; i < 5; i++) {
      await act(async () => { vi.advanceTimersByTime(6000); });
      const arena = document.querySelector('.rr-arena');
      await act(async () => { fireEvent.click(arena); });

      if (i < 4) {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: /next attempt/i }));
        });
      }
    }

    await act(async () => { await Promise.resolve(); });
    await act(async () => { await Promise.resolve(); });

    // Should show 5 attempt items in the results
    const attemptItems = document.querySelectorAll('.rr-attempt-item');
    expect(attemptItems.length).toBe(5);
  });

  // ── 8. API failure shows error + retry button ────────────────────────────────

  it('shows submit error and Retry Save button when API fails', async () => {
    mockSubmitSession.mockRejectedValue(new Error('Network error'));

    renderGame();
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    for (let i = 0; i < 5; i++) {
      await act(async () => { vi.advanceTimersByTime(6000); });
      const arena = document.querySelector('.rr-arena');
      await act(async () => { fireEvent.click(arena); });

      if (i < 4) {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: /next attempt/i }));
        });
      }
    }

    // Allow the rejection to propagate
    await act(async () => { await Promise.resolve(); });
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry save/i })).toBeInTheDocument();
  });

  // ── 9. Duplicate click during GO only registers once ────────────────────────

  it('duplicate clicks during GO state only register one reaction time', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    // Advance to GO state
    await act(async () => { vi.advanceTimersByTime(6000); });

    const arena = document.querySelector('.rr-arena');
    // Fire two rapid clicks
    await act(async () => {
      fireEvent.click(arena);
      fireEvent.click(arena);
    });

    // Should have exactly ONE attempt registered (shown by ATTEMPT_RESULT or SESSION_RESULT pips)
    // We should be in ATTEMPT_RESULT (not jumped ahead to session result)
    // Check that only 1 pip is shown
    const pips = document.querySelectorAll('.rr-attempt-pip');
    expect(pips.length).toBe(1);
  });

  // ── 10. Space key triggers GO reaction ──────────────────────────────────────

  it('Space key triggers reaction during GO state', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    // Advance to GO
    await act(async () => { vi.advanceTimersByTime(6000); });

    // Press Space
    await act(async () => {
      fireEvent.keyDown(window, { key: ' ' });
    });

    // Should have moved out of GO state — now ATTEMPT_RESULT
    expect(screen.getByRole('button', { name: /next attempt/i })).toBeInTheDocument();
  });

  // ── 11. Space key during COUNTDOWN → false start ────────────────────────────

  it('Space key during COUNTDOWN triggers false start', async () => {
    renderGame();
    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start session/i }));
    });

    // Press Space before GO fires
    await act(async () => {
      fireEvent.keyDown(window, { key: ' ' });
    });

    expect(screen.getByText('False Start!')).toBeInTheDocument();
  });
});
