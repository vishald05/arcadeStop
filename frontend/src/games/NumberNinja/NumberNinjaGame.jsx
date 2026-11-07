import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Hash, RefreshCw, Trophy, ArrowUp, ArrowDown, Check, AlertCircle, Sparkles } from 'lucide-react';
import { getBrowserId } from '../../utils/browserId.js';
import { getRecord, submitSession } from '../../services/numberNinjaService.js';
import { MAX_ATTEMPTS, MIN_NUMBER, MAX_NUMBER, STATES, generateSecretNumber } from './constants.js';
import './NumberNinjaGame.css';

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'nn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export default function NumberNinjaGame({ game }) {
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [secretNumber, setSecretNumber] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [minPossible, setMinPossible] = useState(MIN_NUMBER);
  const [maxPossible, setMaxPossible] = useState(MAX_NUMBER);
  const [currentInput, setCurrentInput] = useState('');
  const [validationError, setValidationError] = useState(null);

  // Statistics & persistence state
  const [previousRecord, setPreviousRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [serverRecord, setServerRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Refs
  const inputRef = useRef(null);
  const browserIdRef = useRef(getBrowserId());
  const submittingRef = useRef(false);
  const lastCompletedSessionRef = useRef(null);

  // Load existing record on mount
  useEffect(() => {
    setRecordLoading(true);
    getRecord(browserIdRef.current)
      .then(rec => {
        if (rec) {
          setPreviousRecord(rec);
        }
      })
      .catch(() => {
        // Non-fatal, offline/error gameplay continues
      })
      .finally(() => setRecordLoading(false));
  }, []);

  // Focus input when entering PLAYING state or after feedback
  useEffect(() => {
    if (gameState === STATES.PLAYING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, guesses.length, validationError]);

  // Start new game session
  const handleStartGame = useCallback(() => {
    const secret = generateSecretNumber(MIN_NUMBER, MAX_NUMBER);
    setSecretNumber(secret);
    setGuesses([]);
    setMinPossible(MIN_NUMBER);
    setMaxPossible(MAX_NUMBER);
    setCurrentInput('');
    setValidationError(null);
    setSubmitError(null);
    setServerRecord(null);
    submittingRef.current = false;
    lastCompletedSessionRef.current = null;
    setGameState(STATES.PLAYING);
  }, []);

  // Submit completed session to backend
  const handleSessionComplete = useCallback(async (won, guessesUsed) => {
    if (submittingRef.current) return;
    const sessionId = generateSessionId();
    lastCompletedSessionRef.current = { sessionId, won, guessesUsed };

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const record = await submitSession(browserIdRef.current, {
        sessionId,
        won,
        guessesUsed,
      });
      setServerRecord(record);
      setPreviousRecord(record);
    } catch (err) {
      setSubmitError(err.message || 'Failed to save statistics. You can retry below.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, []);

  // Retry submitting failed session
  const handleRetrySubmit = useCallback(async () => {
    if (!lastCompletedSessionRef.current || submittingRef.current) return;
    const { sessionId, won, guessesUsed } = lastCompletedSessionRef.current;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const record = await submitSession(browserIdRef.current, {
        sessionId,
        won,
        guessesUsed,
      });
      setServerRecord(record);
      setPreviousRecord(record);
    } catch (err) {
      setSubmitError(err.message || 'Failed to save statistics. You can retry below.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, []);

  // Handle a guess submission
  const handleGuessSubmit = (e) => {
    if (e) e.preventDefault();
    if (gameState !== STATES.PLAYING) return;

    const trimmed = currentInput.trim();

    // 1. Check for empty input
    if (!trimmed) {
      setValidationError('Please enter a number between 1 and 100.');
      return;
    }

    // 2. Check for non-integer or decimal
    if (!/^-?\d+$/.test(trimmed)) {
      setValidationError('Please enter a whole integer without decimals or letters.');
      return;
    }

    const num = parseInt(trimmed, 10);

    // 3. Check bounds
    if (num < MIN_NUMBER || num > MAX_NUMBER) {
      setValidationError(`Your guess must be between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
      return;
    }

    // 4. Check duplicate
    if (guesses.some(g => g.number === num)) {
      setValidationError(`You already guessed ${num}! Try a different number.`);
      return;
    }

    // Valid guess: clear validation error and input
    setValidationError(null);
    setCurrentInput('');

    let feedback = '';
    let nextMin = minPossible;
    let nextMax = maxPossible;

    if (num < secretNumber) {
      feedback = 'LOW';
      nextMin = Math.max(minPossible, num + 1);
      setMinPossible(nextMin);
    } else if (num > secretNumber) {
      feedback = 'HIGH';
      nextMax = Math.min(maxPossible, num - 1);
      setMaxPossible(nextMax);
    } else {
      feedback = 'CORRECT';
    }

    const newGuesses = [...guesses, { number: num, feedback }];
    setGuesses(newGuesses);

    // Check game termination
    if (feedback === 'CORRECT') {
      setGameState(STATES.WON);
      handleSessionComplete(true, newGuesses.length);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameState(STATES.LOST);
      handleSessionComplete(false, MAX_ATTEMPTS);
    }
  };

  // Remaining candidates count & range bar percentage calculation
  const remainingCandidatesCount = Math.max(0, maxPossible - minPossible + 1);
  const rangeLeftPercent = ((minPossible - 1) / MAX_NUMBER) * 100;
  const rangeWidthPercent = (remainingCandidatesCount / MAX_NUMBER) * 100;
  const attemptsRemaining = MAX_ATTEMPTS - guesses.length;

  // Personal record comparison
  const isNewPB = serverRecord
    ? (serverRecord.newPersonalBest ?? serverRecord.isNewPersonalBest ?? false)
    : (previousRecord && previousRecord.bestGuesses
        ? guesses.length < previousRecord.bestGuesses
        : true);

  return (
    <main className="main-content nn-game-page">
      {/* Top back bar */}
      <div className="nn-back-bar">
        <div className="app-container">
          <Link to="/arcade" className="nn-back-link">
            <ArrowLeft size={16} />
            <span>Back to Arcade</span>
          </Link>
        </div>
      </div>

      <div className="app-container">
        <div className="nn-game-wrapper">
          {/* Header */}
          <div className="nn-header">
            <div className="nn-game-icon">
              <Hash size={24} />
            </div>
            <div>
              <h1 className="nn-title">Number Ninja</h1>
              <p className="nn-subtitle">Deduce the secret number (1–100) in 7 tries</p>
            </div>

            {gameState === STATES.PLAYING && (
              <div className="nn-attempts-badge">
                <span className="nn-attempts-label">Attempts Remaining</span>
                <span className="nn-attempts-count">
                  {attemptsRemaining}
                  <span className="nn-attempts-total"> / {MAX_ATTEMPTS}</span>
                </span>
              </div>
            )}
          </div>

          {/* Arena */}
          <div className="nn-arena">
            {/* ── 1. IDLE STATE ── */}
            {gameState === STATES.IDLE && (
              <div className="nn-state-idle">
                <div className="nn-idle-icon">
                  <Hash size={48} />
                </div>
                <h2 className="nn-state-title">Sharpen Your Senses</h2>
                <div className="nn-instructions">
                  <p>A secret number between <strong>1 and 100</strong> has been chosen. Can you deduce it within <strong>7 attempts</strong>?</p>
                  <ul className="nn-rules-list">
                    <li><span className="nn-rule-icon">✓</span> Each guess narrows down the possible candidates.</li>
                    <li><span className="nn-rule-icon">✓</span> Receive instant &quot;Too high!&quot; or &quot;Too low!&quot; guidance.</li>
                    <li><span className="nn-rule-icon">✓</span> Invalid guesses do not waste your attempts.</li>
                  </ul>
                </div>

                {previousRecord && !recordLoading && previousRecord.totalGamesPlayed > 0 && (
                  <div className="nn-prev-best">
                    <Trophy size={14} />
                    <span>
                      Best score: <strong>{previousRecord.bestGuesses ? `${previousRecord.bestGuesses} guesses` : 'No wins yet'}</strong> · Win rate: <strong>{previousRecord.winPercentage}%</strong>
                    </span>
                  </div>
                )}

                <button
                  className="btn btn-primary nn-start-btn"
                  onClick={handleStartGame}
                >
                  <Hash size={18} />
                  Start Game
                </button>
              </div>
            )}

            {/* ── 2. PLAYING STATE ── */}
            {gameState === STATES.PLAYING && (
              <div className="nn-state-playing">
                {/* Dynamic Range Visualisation */}
                <div className="nn-range-container">
                  <div className="nn-range-header">
                    <span className="nn-range-title">
                      <Sparkles size={14} /> Candidate Range
                    </span>
                    <span className="nn-range-span">
                      {remainingCandidatesCount} {remainingCandidatesCount === 1 ? 'number' : 'numbers'} left
                    </span>
                  </div>

                  <div className="nn-range-track" aria-hidden="true">
                    <div
                      className="nn-range-fill"
                      style={{
                        left: `${rangeLeftPercent}%`,
                        width: `${rangeWidthPercent}%`,
                      }}
                    />
                  </div>

                  <div className="nn-range-active-bounds">
                    <span className="nn-bound-min">Min: {minPossible}</span>
                    <span className="nn-bound-max">Max: {maxPossible}</span>
                  </div>
                </div>

                {/* Guess input form */}
                <form className="nn-guess-form" onSubmit={handleGuessSubmit}>
                  <div className="nn-input-row">
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="nn-number-input"
                      placeholder={`Enter guess (${minPossible}–${maxPossible})`}
                      value={currentInput}
                      onChange={(e) => {
                        setCurrentInput(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      autoComplete="off"
                      aria-label="Your guess"
                    />
                    <button
                      type="submit"
                      className="nn-guess-btn"
                    >
                      Guess
                    </button>
                  </div>

                  {validationError && (
                    <div className="nn-feedback-banner nn-feedback--error" role="alert">
                      <AlertCircle size={16} />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {!validationError && guesses.length > 0 && (
                    <div
                      className={`nn-feedback-banner nn-feedback--${guesses[guesses.length - 1].feedback.toLowerCase()}`}
                    >
                      {guesses[guesses.length - 1].feedback === 'LOW' && (
                        <>
                          <ArrowUp size={16} />
                          <span><strong>{guesses[guesses.length - 1].number}</strong> is Too low! Aim higher.</span>
                        </>
                      )}
                      {guesses[guesses.length - 1].feedback === 'HIGH' && (
                        <>
                          <ArrowDown size={16} />
                          <span><strong>{guesses[guesses.length - 1].number}</strong> is Too high! Aim lower.</span>
                        </>
                      )}
                    </div>
                  )}
                </form>

                {/* Guess History */}
                {guesses.length > 0 && (
                  <div className="nn-history-section">
                    <span className="nn-history-label">Previous Guesses</span>
                    <div className="nn-history-list">
                      {guesses.map((g, idx) => (
                        <div
                          key={idx}
                          className={`nn-history-pill nn-history-pill--${g.feedback.toLowerCase()}`}
                        >
                          <span>#{idx + 1}: {g.number}</span>
                          {g.feedback === 'LOW' && <ArrowUp size={12} />}
                          {g.feedback === 'HIGH' && <ArrowDown size={12} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 3. WON STATE ── */}
            {gameState === STATES.WON && (
              <div className="nn-state-complete">
                <div className="nn-complete-icon-box nn-complete-icon--won">
                  <Check size={48} strokeWidth={3} />
                </div>

                <div>
                  <h2 className="nn-complete-title nn-complete-title--won">Target Identified!</h2>
                  <p className="nn-subtitle" style={{ marginTop: '0.4rem' }}>
                    Splendid deduction, Ninja. You cracked the secret number!
                  </p>
                </div>

                <div className="nn-secret-reveal">
                  <span>Secret Number:</span>
                  <span className="nn-secret-number">{secretNumber}</span>
                </div>

                {isNewPB && (
                  <div className="nn-new-pb-badge">🏆 New Personal Record!</div>
                )}

                {/* Stats grid */}
                <div className="nn-stats-grid">
                  <div className="nn-stat-card nn-stat-card--highlight">
                    <span className="nn-stat-label">Guesses Used</span>
                    <span className="nn-stat-val">{guesses.length}</span>
                  </div>
                  <div className="nn-stat-card">
                    <span className="nn-stat-label">Attempts Left</span>
                    <span className="nn-stat-val">{MAX_ATTEMPTS - guesses.length}</span>
                  </div>
                  <div className="nn-stat-card">
                    <span className="nn-stat-label">Win Rate</span>
                    <span className="nn-stat-val">
                      {serverRecord ? `${serverRecord.winPercentage}%` : (previousRecord ? `${previousRecord.winPercentage}%` : '100%')}
                    </span>
                  </div>
                  <div className="nn-stat-card">
                    <span className="nn-stat-label">Win Streak</span>
                    <span className="nn-stat-val">
                      {serverRecord ? serverRecord.currentWinStreak : (previousRecord ? previousRecord.currentWinStreak + 1 : 1)}
                    </span>
                  </div>
                </div>

                {/* Record status */}
                <div className="nn-record-status">
                  {submitting && (
                    <span className="nn-saving">Saving record...</span>
                  )}
                  {!submitting && serverRecord && (
                    <span className="nn-saved">
                      ✓ Stats updated · {serverRecord.totalGamesWon} of {serverRecord.totalGamesPlayed} games won
                    </span>
                  )}
                  {!submitting && submitError && (
                    <div className="nn-save-error">
                      <span>{submitError}</span>
                      <button className="nn-retry-save-btn" onClick={handleRetrySubmit}>
                        <RefreshCw size={13} /> Retry Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="nn-actions">
                  <button className="btn btn-primary" onClick={handleStartGame}>
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

            {/* ── 4. LOST STATE ── */}
            {gameState === STATES.LOST && (
              <div className="nn-state-complete">
                <div className="nn-complete-icon-box nn-complete-icon--lost">
                  <AlertCircle size={48} strokeWidth={2.5} />
                </div>

                <div>
                  <h2 className="nn-complete-title nn-complete-title--lost">Attempts Exhausted</h2>
                  <p className="nn-subtitle" style={{ marginTop: '0.4rem' }}>
                    You ran out of guesses this round. Regroup and try again!
                  </p>
                </div>

                <div className="nn-secret-reveal">
                  <span>The secret number was:</span>
                  <span className="nn-secret-number">{secretNumber}</span>
                </div>

                {/* Stats grid */}
                <div className="nn-stats-grid">
                  <div className="nn-stat-card">
                    <span className="nn-stat-label">Guesses Used</span>
                    <span className="nn-stat-val">7 / 7</span>
                  </div>
                  <div className="nn-stat-card">
                    <span className="nn-stat-label">Win Rate</span>
                    <span className="nn-stat-val">
                      {serverRecord ? `${serverRecord.winPercentage}%` : (previousRecord ? `${previousRecord.winPercentage}%` : '0%')}
                    </span>
                  </div>
                  <div className="nn-stat-card">
                    <span className="nn-stat-label">Best Score</span>
                    <span className="nn-stat-val">
                      {serverRecord?.bestGuesses ? `${serverRecord.bestGuesses}` : (previousRecord?.bestGuesses ? `${previousRecord.bestGuesses}` : '--')}
                    </span>
                  </div>
                  <div className="nn-stat-card">
                    <span className="nn-stat-label">Best Streak</span>
                    <span className="nn-stat-val">
                      {serverRecord ? serverRecord.bestWinStreak : (previousRecord ? previousRecord.bestWinStreak : 0)}
                    </span>
                  </div>
                </div>

                {/* Record status */}
                <div className="nn-record-status">
                  {submitting && (
                    <span className="nn-saving">Saving record...</span>
                  )}
                  {!submitting && serverRecord && (
                    <span className="nn-saved">
                      ✓ Stats saved · {serverRecord.totalGamesPlayed} total games played
                    </span>
                  )}
                  {!submitting && submitError && (
                    <div className="nn-save-error">
                      <span>{submitError}</span>
                      <button className="nn-retry-save-btn" onClick={handleRetrySubmit}>
                        <RefreshCw size={13} /> Retry Save
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="nn-actions">
                  <button className="btn btn-primary" onClick={handleStartGame}>
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

          {/* Attempt dots / pips bar during gameplay */}
          {gameState === STATES.PLAYING && (
            <div className="nn-pips" aria-label={`${guesses.length} of ${MAX_ATTEMPTS} attempts used`}>
              {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                <div
                  key={i}
                  className={`nn-pip ${i < guesses.length ? 'nn-pip--used' : ''} ${i === guesses.length ? 'nn-pip--current' : ''}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
