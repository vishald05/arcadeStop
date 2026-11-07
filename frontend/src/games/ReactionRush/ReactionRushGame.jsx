import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, RefreshCw, Trophy } from 'lucide-react';
import { getBrowserId } from '../../utils/browserId';
import { getRecord, submitSession } from '../../services/reactionRushService';
import { TOTAL_ATTEMPTS, MIN_DELAY, MAX_DELAY, STATES } from './constants';
import './ReactionRushGame.css';

export { STATES };

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

export default function ReactionRushGame({ game }) {
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [successCount, setSuccessCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [lastReactionTime, setLastReactionTime] = useState(null);

  // Record state
  const [previousBest, setPreviousBest] = useState(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [serverRecord, setServerRecord] = useState(null);

  // Refs for timing and state management
  const stateRef = useRef(STATES.IDLE);
  const timerRef = useRef(null);
  const goTimestampRef = useRef(null);
  const inputHandledRef = useRef(false);
  const submittingRef = useRef(false);
  const browserIdRef = useRef(getBrowserId());
  const reactionTimesRef = useRef([]); // mirror reactionTimes for use in callbacks

  // Sync stateRef when state changes
  const transitionTo = useCallback((newState) => {
    stateRef.current = newState;
    setGameState(newState);
  }, []);

  // Load existing record on mount
  useEffect(() => {
    setRecordLoading(true);
    getRecord(browserIdRef.current)
      .then(record => {
        if (record) {
          setPreviousBest(record.bestReactionMs);
        }
      })
      .catch(() => {
        // non-fatal, gameplay continues
      })
      .finally(() => setRecordLoading(false));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    inputHandledRef.current = false;
    transitionTo(STATES.COUNTDOWN);

    const delay = getRandomDelay();
    // Phase 1: COUNTDOWN (~500ms initial prep)
    // Phase 2: READY (waiting for signal; screen communicates player must wait)
    const countdownDuration = Math.min(500, Math.floor(delay / 4));

    timerRef.current = setTimeout(() => {
      if (stateRef.current !== STATES.COUNTDOWN) return;
      transitionTo(STATES.READY);

      timerRef.current = setTimeout(() => {
        if (stateRef.current !== STATES.READY && stateRef.current !== STATES.COUNTDOWN) return;
        goTimestampRef.current = (typeof performance !== 'undefined' && performance.now)
          ? performance.now()
          : Date.now();
        inputHandledRef.current = false;
        transitionTo(STATES.GO);
      }, delay - countdownDuration);
    }, countdownDuration);
  }, [transitionTo]);

  const handleInput = useCallback(() => {
    const currentState = stateRef.current;

    if (currentState === STATES.COUNTDOWN || currentState === STATES.READY) {
      // False start
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      inputHandledRef.current = true;
      transitionTo(STATES.FALSE_START);
      return;
    }

    if (currentState === STATES.GO) {
      if (inputHandledRef.current) return; // prevent double input
      inputHandledRef.current = true;

      const now = (typeof performance !== 'undefined' && performance.now)
        ? performance.now()
        : Date.now();
      const reactionMs = Math.round(now - goTimestampRef.current);
      setLastReactionTime(reactionMs);

      // Update refs and state atomically — ref must be updated before state
      const newTimes = [...reactionTimesRef.current, reactionMs];
      reactionTimesRef.current = newTimes;
      setReactionTimes(newTimes);

      const newCount = newTimes.length;
      setSuccessCount(newCount);

      if (newCount >= TOTAL_ATTEMPTS) {
        transitionTo(STATES.SESSION_RESULT);
      } else {
        transitionTo(STATES.ATTEMPT_RESULT);
      }
      return;
    }

    // For IDLE, ATTEMPT_RESULT, FALSE_START, SESSION_RESULT — clicks are handled by explicit buttons
  }, [transitionTo]);

  // Keyboard handler
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignore if focused on interactive element
      const target = e.target;
      const tag = target?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || target?.isContentEditable) {
        return;
      }

      const state = stateRef.current;
      const isGameInputState = (
        state === STATES.COUNTDOWN ||
        state === STATES.READY ||
        state === STATES.GO
      );

      if (e.key === ' ' && isGameInputState) {
        e.preventDefault(); // prevent scroll only when used as game input
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (isGameInputState) {
          handleInput();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleInput]);

  const handleStartSession = () => {
    // Reset all session state
    reactionTimesRef.current = [];
    setReactionTimes([]);
    setSuccessCount(0);
    setLastReactionTime(null);
    setSubmitError(null);
    setServerRecord(null);
    submittingRef.current = false;
    setSubmitting(false);
    startCountdown(0, []);
  };

  const handleNextAttempt = () => {
    startCountdown(successCount, reactionTimes);
  };

  const handleRetryAfterFalseStart = () => {
    startCountdown(successCount, reactionTimes);
  };

  // Submit session to backend
  const handleSubmitResults = useCallback(async (times) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const record = await submitSession(browserIdRef.current, times);
      setServerRecord(record);
      if (record.bestReactionMs) {
        setPreviousBest(record.bestReactionMs);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to save record. Please try again.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, []);

  // Auto-submit when reaching SESSION_RESULT
  // Use reactionTimesRef.current (not stale reactionTimes state) to avoid stale closures
  useEffect(() => {
    if (gameState === STATES.SESSION_RESULT && reactionTimesRef.current.length === TOTAL_ATTEMPTS) {
      handleSubmitResults(reactionTimesRef.current);
    }
  }, [gameState]); // only trigger on state change

  const handleRetrySubmit = () => {
    submittingRef.current = false;
    handleSubmitResults(reactionTimesRef.current);
  };

  const handlePlayAgain = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    reactionTimesRef.current = [];
    setReactionTimes([]);
    setSuccessCount(0);
    setLastReactionTime(null);
    setSubmitError(null);
    setServerRecord(null);
    submittingRef.current = false;
    setSubmitting(false);
    transitionTo(STATES.IDLE);
  };

  // Computed values for display
  const avg = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : null;
  const best = reactionTimes.length > 0 ? Math.min(...reactionTimes) : null;
  const isNewPB = serverRecord ? (serverRecord.newPersonalBest ?? serverRecord.isNewPersonalBest ?? false) : false;

  // Render based on game state
  return (
    <main className="main-content rr-game-page">
      {/* Back link */}
      <div className="rr-back-bar">
        <div className="app-container">
          <Link to="/arcade" className="rr-back-link">
            <ArrowLeft size={16} />
            <span>Back to Arcade</span>
          </Link>
        </div>
      </div>

      <div className="app-container">
        <div className="rr-game-wrapper">
          {/* Header */}
          <div className="rr-header">
            <div className="rr-game-icon">
              <Zap size={22} />
            </div>
            <div>
              <h1 className="rr-title">Reaction Rush</h1>
              <p className="rr-subtitle">Test your reflexes</p>
            </div>
            {/* Progress */}
            {(gameState !== STATES.IDLE && gameState !== STATES.SESSION_RESULT) && (
              <div className="rr-progress">
                <span className="rr-progress-label">Attempt</span>
                <span className="rr-progress-count">
                  {Math.min(successCount + 1, TOTAL_ATTEMPTS)}
                  <span className="rr-progress-total">/ {TOTAL_ATTEMPTS}</span>
                </span>
              </div>
            )}
          </div>

          {/* Game area */}
          <div
            className={`rr-arena rr-arena--${gameState.toLowerCase()}`}
            onClick={() => {
              if (
                gameState === STATES.COUNTDOWN ||
                gameState === STATES.READY ||
                gameState === STATES.GO
              ) {
                handleInput();
              }
            }}
            role="button"
            tabIndex={
              gameState === STATES.COUNTDOWN ||
              gameState === STATES.READY ||
              gameState === STATES.GO
                ? 0
                : -1
            }
            aria-label={gameState === STATES.GO ? 'Click to register reaction' : undefined}
          >
            {/* IDLE */}
            {gameState === STATES.IDLE && (
              <div className="rr-state-idle">
                <div className="rr-idle-icon"><Zap size={48} /></div>
                <h2 className="rr-state-title">Ready to Rush?</h2>
                <div className="rr-instructions">
                  <p>Wait for the <strong>green signal</strong>, then click or press <kbd>Space</kbd> / <kbd>Enter</kbd> as fast as you can.</p>
                  <ul className="rr-rules-list">
                    <li><span className="rr-rule-icon rr-rule-warn">⚠</span> Clicking before the signal = false start</li>
                    <li><span className="rr-rule-icon rr-rule-ok">✓</span> 5 successful attempts = one session</li>
                    <li><span className="rr-rule-icon rr-rule-ok">✓</span> False starts don&apos;t count — just retry</li>
                  </ul>
                </div>
                {previousBest !== null && !recordLoading && (
                  <div className="rr-prev-best">
                    <Trophy size={14} />
                    <span>Your personal best: <strong>{previousBest} ms</strong></span>
                  </div>
                )}
                <button
                  className="btn btn-primary rr-start-btn"
                  onClick={(e) => { e.stopPropagation(); handleStartSession(); }}
                >
                  <Zap size={18} />
                  Start Session
                </button>
              </div>
            )}

            {/* COUNTDOWN */}
            {gameState === STATES.COUNTDOWN && (
              <div className="rr-state-countdown">
                <div className="rr-countdown-pulse" aria-hidden="true" />
                <p className="rr-countdown-label">Get ready...</p>
                <p className="rr-countdown-hint">Wait for green — don&apos;t click yet!</p>
              </div>
            )}

            {/* READY */}
            {gameState === STATES.READY && (
              <div className="rr-state-countdown rr-state-ready">
                <div className="rr-countdown-pulse" aria-hidden="true" />
                <p className="rr-countdown-label">Waiting for signal...</p>
                <p className="rr-countdown-hint">Wait for green — don&apos;t click yet!</p>
              </div>
            )}

            {/* GO */}
            {gameState === STATES.GO && (
              <div className="rr-state-go">
                <div className="rr-go-signal" aria-label="GO signal — click now!">
                  <span className="rr-go-text">GO!</span>
                </div>
                <p className="rr-go-hint">Click now!</p>
              </div>
            )}

            {/* FALSE_START */}
            {gameState === STATES.FALSE_START && (
              <div className="rr-state-false-start" onClick={(e) => e.stopPropagation()}>
                <div className="rr-false-icon">✕</div>
                <h2 className="rr-state-title">False Start!</h2>
                <p className="rr-false-desc">You clicked before the signal appeared. That attempt doesn&apos;t count.</p>
                <p className="rr-false-desc">Wait for the green signal next time.</p>
                <button
                  className="btn btn-secondary rr-retry-btn"
                  onClick={(e) => { e.stopPropagation(); handleRetryAfterFalseStart(); }}
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            )}

            {/* ATTEMPT_RESULT */}
            {gameState === STATES.ATTEMPT_RESULT && (
              <div className="rr-state-result" onClick={(e) => e.stopPropagation()}>
                <div className="rr-result-time">
                  <span className="rr-result-ms">{lastReactionTime}</span>
                  <span className="rr-result-unit">ms</span>
                </div>
                <p className="rr-result-label">
                  {lastReactionTime < 200 ? '⚡ Lightning fast!' :
                   lastReactionTime < 300 ? '🎯 Great reaction!' :
                   lastReactionTime < 400 ? '👍 Solid reaction.' :
                   lastReactionTime < 600 ? '😊 Not bad, keep going.' :
                   '🐢 Take your time — focus!'}
                </p>
                <div className="rr-attempts-so-far">
                  {reactionTimes.map((t, i) => (
                    <span key={i} className="rr-attempt-pip" title={`Attempt ${i + 1}: ${t}ms`}>
                      {t}ms
                    </span>
                  ))}
                </div>
                <button
                  className="btn btn-primary rr-next-btn"
                  onClick={(e) => { e.stopPropagation(); handleNextAttempt(); }}
                >
                  Next Attempt ({successCount}/{TOTAL_ATTEMPTS})
                </button>
              </div>
            )}

            {/* SESSION_RESULT */}
            {gameState === STATES.SESSION_RESULT && (
              <div className="rr-state-session-result" onClick={(e) => e.stopPropagation()}>
                <div className="rr-session-header">
                  <Trophy size={32} className="rr-trophy" />
                  <h2 className="rr-state-title">Session Complete!</h2>
                  {isNewPB && (
                    <div className="rr-new-pb-badge">🏆 New Personal Best!</div>
                  )}
                </div>

                {/* Stats grid */}
                <div className="rr-stats-grid">
                  <div className="rr-stat-card rr-stat-best">
                    <span className="rr-stat-label">Session Best</span>
                    <span className="rr-stat-value">{best}ms</span>
                  </div>
                  <div className="rr-stat-card rr-stat-avg">
                    <span className="rr-stat-label">Average</span>
                    <span className="rr-stat-value">{avg}ms</span>
                  </div>
                  <div className="rr-stat-card rr-stat-pb">
                    <span className="rr-stat-label">Personal Best</span>
                    <span className="rr-stat-value">
                      {serverRecord ? serverRecord.bestReactionMs : (previousBest ?? '--')}ms
                    </span>
                  </div>
                </div>

                {/* Individual attempts */}
                <div className="rr-attempts-list">
                  <h3 className="rr-attempts-heading">Your Attempts</h3>
                  <div className="rr-attempts-row">
                    {reactionTimes.map((t, i) => (
                      <div
                        key={i}
                        className={`rr-attempt-item ${t === best ? 'rr-attempt-item--best' : ''}`}
                      >
                        <span className="rr-attempt-num">#{i + 1}</span>
                        <span className="rr-attempt-ms">{t}ms</span>
                        {t === best && <span className="rr-attempt-best-tag">best</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Record save status */}
                <div className="rr-record-status">
                  {submitting && (
                    <span className="rr-saving">Saving record...</span>
                  )}
                  {!submitting && serverRecord && (
                    <span className="rr-saved">
                      ✓ Record saved · {serverRecord.totalSessions} session{serverRecord.totalSessions !== 1 ? 's' : ''} played
                    </span>
                  )}
                  {!submitting && submitError && (
                    <div className="rr-save-error">
                      <span>{submitError}</span>
                      <button className="btn btn-outline rr-retry-save-btn" onClick={handleRetrySubmit}>
                        <RefreshCw size={14} /> Retry Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="rr-session-actions">
                  <button className="btn btn-primary" onClick={handlePlayAgain}>
                    <RefreshCw size={16} />
                    Play Again
                  </button>
                  <Link to="/arcade" className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    Return to Arcade
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Dot progress bar */}
          {gameState !== STATES.IDLE && gameState !== STATES.SESSION_RESULT && (
            <div className="rr-dots-progress" aria-label={`${successCount} of ${TOTAL_ATTEMPTS} attempts completed`}>
              {Array.from({ length: TOTAL_ATTEMPTS }, (_, i) => (
                <div
                  key={i}
                  className={`rr-dot ${i < successCount ? 'rr-dot--done' : ''} ${i === successCount ? 'rr-dot--active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
