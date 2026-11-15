import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Keyboard,
  Timer,
  Gauge,
  Target,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  Zap,
  Play
} from 'lucide-react';
import { getBrowserId } from '../../utils/browserId.js';
import { getRecord, submitSession } from '../../services/typeStormService.js';
import {
  DURATIONS,
  DEFAULT_DURATION,
  STATES,
  getRandomPassage,
  calculateWpm,
  calculateAccuracy,
  getPerformanceTier
} from './constants.js';
import NotificationToast from '../../components/NotificationToast.jsx';
import './TypeStormGame.css';

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'ts-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export default function TypeStormGame({ game }) {
  // Game Configuration & State
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION);
  const [passage, setPassage] = useState('');
  const [input, setInput] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_DURATION);

  // Live Stats during Active state
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [correctCharsCount, setCorrectCharsCount] = useState(0);
  const [incorrectCharsCount, setIncorrectCharsCount] = useState(0);

  // Completed Results State
  const [finalResult, setFinalResult] = useState(null);

  // Persistence & Browser Record State
  const [previousRecord, setPreviousRecord] = useState(null);
  const [serverRecord, setServerRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Refs for reliable timing and event cleanup
  const browserIdRef = useRef(getBrowserId());
  const inputRef = useRef(null);
  const currentCharRef = useRef(null);
  const passageContainerRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const hasStartedTypingRef = useRef(false);
  const totalMistakesRef = useRef(0);
  const submittingRef = useRef(false);
  const durationRef = useRef(selectedDuration);

  // Keep durationRef in sync
  useEffect(() => {
    durationRef.current = selectedDuration;
  }, [selectedDuration]);

  // Load player's existing records on mount
  useEffect(() => {
    setRecordLoading(true);
    getRecord(browserIdRef.current)
      .then(rec => {
        if (rec) {
          setPreviousRecord(rec);
        }
      })
      .catch(() => {
        // Non-blocking: continue offline or unpersisted
      })
      .finally(() => setRecordLoading(false));

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Auto-focus input when game becomes ACTIVE
  useEffect(() => {
    if (gameState === STATES.ACTIVE && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Auto-scroll passage to keep cursor in view
  useEffect(() => {
    if (currentCharRef.current && passageContainerRef.current) {
      currentCharRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [input.length]);

  // Submit session to backend
  const handleSaveSession = useCallback(async (sessionPayload) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const record = await submitSession(browserIdRef.current, sessionPayload);
      setServerRecord(record);
      setPreviousRecord(record);
    } catch (err) {
      console.warn('TypeStorm: unable to save session to backend:', err);
      setToastMessage('Could not save your stats to server. Results are shown locally.');
    } finally {
      submittingRef.current = false;
    }
  }, []);

  // Complete the game session
  const completeGame = useCallback((finalInputText, isEarlyFinish = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const duration = durationRef.current;
    const now = performance.now();
    const actualElapsed = startTimeRef.current
      ? (now - startTimeRef.current) / 1000
      : duration;

    const elapsedSeconds = isEarlyFinish
      ? Math.max(1.0, actualElapsed)
      : Math.max(1.0, duration);

    // Calculate characters
    const targetText = passage;
    let correct = 0;
    let incorrect = 0;
    const totalTyped = finalInputText.length;

    for (let i = 0; i < totalTyped; i++) {
      if (i < targetText.length && finalInputText[i] === targetText[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const officialWpm = calculateWpm(correct, elapsedSeconds);
    const officialAccuracy = calculateAccuracy(correct, totalTyped);

    const result = {
      wpm: officialWpm,
      accuracy: officialAccuracy,
      correctCharacters: correct,
      incorrectCharacters: incorrect,
      totalCharactersTyped: totalTyped,
      totalMistakes: totalMistakesRef.current,
      durationSeconds: duration,
      elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
      completedPassage: isEarlyFinish
    };

    setFinalResult(result);
    setGameState(STATES.COMPLETED);

    // Persist to backend with idempotency session ID
    const sessionId = generateSessionId();
    handleSaveSession({
      sessionId,
      durationSeconds: duration,
      correctCharacters: correct,
      incorrectCharacters: incorrect,
      totalCharactersTyped: totalTyped,
      elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
      clientWpm: officialWpm,
      clientAccuracy: officialAccuracy
    });
  }, [passage, handleSaveSession]);

  // Start countdown timer on first typed character
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    startTimeRef.current = performance.now();
    const duration = durationRef.current;

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, Math.ceil(duration - elapsed));
      setTimeRemaining(remaining);

      // Live metrics calculation
      if (inputRef.current) {
        const currentVal = inputRef.current.value;
        let c = 0;
        let inc = 0;
        for (let i = 0; i < currentVal.length; i++) {
          if (i < passage.length && currentVal[i] === passage[i]) {
            c++;
          } else {
            inc++;
          }
        }
        setCorrectCharsCount(c);
        setIncorrectCharsCount(inc);
        setLiveWpm(calculateWpm(c, elapsed));
        setLiveAccuracy(calculateAccuracy(c, currentVal.length));
      }

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        if (inputRef.current) {
          completeGame(inputRef.current.value, false);
        }
      }
    }, 100);
  }, [passage, completeGame]);

  // Start new game session (moves from IDLE to ACTIVE)
  const handleStart = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const nextPassage = getRandomPassage(passage);
    setPassage(nextPassage);
    setInput('');
    setTimeRemaining(selectedDuration);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setCorrectCharsCount(0);
    setIncorrectCharsCount(0);
    setFinalResult(null);
    setServerRecord(null);

    hasStartedTypingRef.current = false;
    startTimeRef.current = null;
    totalMistakesRef.current = 0;
    submittingRef.current = false;

    setGameState(STATES.ACTIVE);
  }, [passage, selectedDuration]);

  // Input change handler
  const handleInputChange = (e) => {
    if (gameState !== STATES.ACTIVE) return;

    const val = e.target.value;
    if (val.length > passage.length) return; // Prevent typing beyond passage

    // Start timer on first keystroke
    if (!hasStartedTypingRef.current && val.length > 0) {
      hasStartedTypingRef.current = true;
      startTimer();
    }

    // Track mistakes on new keystrokes
    if (val.length > input.length) {
      const lastIndex = val.length - 1;
      if (val[lastIndex] !== passage[lastIndex]) {
        totalMistakesRef.current += 1;
      }
    }

    setInput(val);

    // Update live character counts immediately
    let c = 0;
    let inc = 0;
    for (let i = 0; i < val.length; i++) {
      if (i < passage.length && val[i] === passage[i]) {
        c++;
      } else {
        inc++;
      }
    }
    setCorrectCharsCount(c);
    setIncorrectCharsCount(inc);

    if (startTimeRef.current) {
      const elapsed = Math.max(0.1, (performance.now() - startTimeRef.current) / 1000);
      setLiveWpm(calculateWpm(c, elapsed));
      setLiveAccuracy(calculateAccuracy(c, val.length));
    }

    // If passage completed early
    if (val.length === passage.length) {
      completeGame(val, true);
    }
  };

  // Re-focus input on clicking anywhere in board
  const handleBoardClick = () => {
    if (gameState === STATES.ACTIVE && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Duration selection handler
  const handleSelectDuration = (seconds) => {
    if (gameState === STATES.ACTIVE) return;
    setSelectedDuration(seconds);
    setTimeRemaining(seconds);
  };

  // Play Again: returns to IDLE state with duration selector
  const handlePlayAgain = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setGameState(STATES.IDLE);
    setInput('');
    setTimeRemaining(selectedDuration);
    setFinalResult(null);
  };

  const isUrgent = gameState === STATES.ACTIVE && timeRemaining <= 5 && hasStartedTypingRef.current;
  const currentPB = serverRecord?.bestWpm || previousRecord?.bestWpm || 0;
  const isNewPB = finalResult && serverRecord?.newPersonalBest;

  return (
    <main className="main-content">
      <div className="typestorm-container">
        {/* Navigation & Header */}
        <header className="typestorm-header">
          <Link to="/arcade" className="typestorm-back-btn">
            <ArrowLeft size={16} />
            <span>Return to Arcade</span>
          </Link>

          {/* Mode Selector Chips */}
          <div className="typestorm-modes" role="group" aria-label="Game duration selection">
            {DURATIONS.map(dur => (
              <button
                key={dur.seconds}
                type="button"
                className={`typestorm-mode-btn ${selectedDuration === dur.seconds ? 'active' : ''}`}
                onClick={() => handleSelectDuration(dur.seconds)}
                disabled={gameState === STATES.ACTIVE}
              >
                <Timer size={14} />
                <span>{dur.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Title Bar */}
        <div className="typestorm-title-row">
          <div className="typestorm-icon-badge">
            <Keyboard size={20} />
          </div>
          <div>
            <h1 className="typestorm-heading">TypeStorm</h1>
          </div>
        </div>

        {/* Screen 1: IDLE / START SCREEN */}
        {gameState === STATES.IDLE && (
          <section className="typestorm-idle-card" aria-label="TypeStorm Introduction">
            <div className="typestorm-hero-icon">
              <Zap size={36} />
            </div>

            <h2>Speed & Accuracy Challenge</h2>

            <p className="typestorm-intro-text">
              Type the presented passage as fast and accurately as you can.
              The countdown timer will start automatically on your very first keystroke.
            </p>

            {/* Personal Best banner if previously recorded */}
            {currentPB > 0 && (
              <div className="typestorm-pb-strip">
                <span className="typestorm-pb-item">
                  <Trophy size={16} style={{ color: '#F59E0B', display: 'inline', marginRight: 4 }} />
                  Best WPM: <strong>{currentPB} WPM</strong>
                </span>
                {previousRecord?.totalGamesPlayed > 0 && (
                  <span className="typestorm-pb-item">
                    Rounds Played: <strong>{previousRecord.totalGamesPlayed}</strong>
                  </span>
                )}
                {previousRecord?.bestAccuracy > 0 && (
                  <span className="typestorm-pb-item">
                    Top Accuracy: <strong>{previousRecord.bestAccuracy}%</strong>
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              className="typestorm-start-btn"
              onClick={handleStart}
            >
              <Play size={18} />
              <span>Start {selectedDuration}s Challenge</span>
            </button>
          </section>
        )}

        {/* Screen 2: ACTIVE GAMEPLAY SCREEN */}
        {gameState === STATES.ACTIVE && (
          <>
            {/* Live HUD Statistics */}
            <div className="typestorm-hud" role="region" aria-label="Live typing statistics">
              <div className={`typestorm-hud-card ${isUrgent ? 'urgent' : ''}`}>
                <span className="typestorm-hud-label">
                  <Timer size={14} />
                  Time Left
                </span>
                <span className={`typestorm-hud-value highlight-timer ${isUrgent ? 'urgent' : ''}`}>
                  {timeRemaining}s
                </span>
              </div>

              <div className="typestorm-hud-card">
                <span className="typestorm-hud-label">
                  <Gauge size={14} />
                  Speed
                </span>
                <span className="typestorm-hud-value highlight-wpm">
                  {liveWpm} <small style={{ fontSize: '0.875rem', fontWeight: 500 }}>WPM</small>
                </span>
              </div>

              <div className="typestorm-hud-card">
                <span className="typestorm-hud-label">
                  <Target size={14} />
                  Accuracy
                </span>
                <span className="typestorm-hud-value highlight-accuracy">
                  {liveAccuracy}%
                </span>
              </div>

              <div className="typestorm-hud-card">
                <span className="typestorm-hud-label">
                  <CheckCircle2 size={14} />
                  Chars
                </span>
                <span className="typestorm-hud-value" style={{ fontSize: '1.25rem' }}>
                  <span style={{ color: '#34D399' }}>{correctCharsCount}</span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                  <span style={{ color: '#FB7185' }}>{incorrectCharsCount}</span>
                </span>
              </div>
            </div>

            {/* Interactive Typing Arena */}
            <div
              className="typestorm-board"
              onClick={handleBoardClick}
              role="region"
              aria-label="Typing passage arena"
            >
              {/* Hidden controlled textarea that captures keyboard inputs */}
              <textarea
                ref={inputRef}
                className="typestorm-hidden-input"
                value={input}
                onChange={handleInputChange}
                autoFocus
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                aria-label="Type the passage here"
              />

              {/* Styled passage display with character highlighting */}
              <div className="typestorm-passage" ref={passageContainerRef}>
                {passage.split('').map((char, index) => {
                  let charClass = 'char-untouched';
                  const isCurrent = index === input.length;

                  if (index < input.length) {
                    if (input[index] === char) {
                      charClass = 'char-correct';
                    } else {
                      charClass = char === ' ' ? 'char-incorrect char-space-incorrect' : 'char-incorrect';
                    }
                  } else if (isCurrent) {
                    charClass = 'char-current';
                  }

                  return (
                    <span
                      key={index}
                      ref={isCurrent ? currentCharRef : null}
                      className={charClass}
                    >
                      {char === ' ' && charClass.includes('char-space-incorrect') ? '·' : char}
                    </span>
                  );
                })}
              </div>

              {/* Board Footer Hint */}
              <div className="typestorm-board-hint">
                <span className="typestorm-prompt-bubble">
                  <Sparkles size={14} />
                  {!hasStartedTypingRef.current
                    ? 'Start typing to begin countdown...'
                    : 'Keep going! Steady rhythm wins.'}
                </span>
                <span>Click box anytime to refocus</span>
              </div>
            </div>
          </>
        )}

        {/* Screen 3: RESULTS SCREEN */}
        {gameState === STATES.COMPLETED && finalResult && (
          <section className="typestorm-results-card" aria-label="Game Results">
            {/* Personal Best Celebration Badge */}
            {isNewPB && (
              <div className="typestorm-pb-congrats">
                <Trophy size={18} />
                <span>New Personal Best WPM!</span>
              </div>
            )}

            {/* Main WPM Hero Display */}
            <div className="typestorm-results-hero">
              <span className="typestorm-wpm-hero-label">Final Typing Speed</span>
              <span className="typestorm-wpm-hero-val">{finalResult.wpm}</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Words Per Minute
              </span>

              {/* Performance Tier Pill */}
              {(() => {
                const tierInfo = getPerformanceTier(finalResult.wpm);
                return (
                  <>
                    <div
                      className="typestorm-tier-pill"
                      style={{
                        borderColor: tierInfo.color,
                        color: tierInfo.color,
                        backgroundColor: `${tierInfo.color}15`
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{tierInfo.badge} ({tierInfo.tier})</span>
                    </div>
                    <p className="typestorm-eval-message">{tierInfo.message}</p>
                  </>
                );
              })()}
            </div>

            {/* Detailed Statistics Grid */}
            <div className="typestorm-stats-grid">
              <div className="typestorm-stat-cell">
                <span className="typestorm-stat-cell-label">Accuracy</span>
                <span className="typestorm-stat-cell-value" style={{ color: '#34D399' }}>
                  {finalResult.accuracy}%
                </span>
              </div>

              <div className="typestorm-stat-cell">
                <span className="typestorm-stat-cell-label">Correct Chars</span>
                <span className="typestorm-stat-cell-value" style={{ color: '#60A5FA' }}>
                  {finalResult.correctCharacters}
                </span>
              </div>

              <div className="typestorm-stat-cell">
                <span className="typestorm-stat-cell-label">Mistakes</span>
                <span className="typestorm-stat-cell-value" style={{ color: '#FB7185' }}>
                  {finalResult.incorrectCharacters}
                </span>
              </div>

              <div className="typestorm-stat-cell">
                <span className="typestorm-stat-cell-label">Duration</span>
                <span className="typestorm-stat-cell-value">
                  {finalResult.durationSeconds}s
                </span>
              </div>
            </div>

            {/* Historical Personal Stats if available */}
            {serverRecord && (
              <div className="typestorm-pb-strip" style={{ marginTop: '0.5rem' }}>
                <span className="typestorm-pb-item">
                  Total Games: <strong>{serverRecord.totalGamesPlayed}</strong>
                </span>
                <span className="typestorm-pb-item">
                  Avg WPM: <strong>{serverRecord.averageWpm}</strong>
                </span>
                <span className="typestorm-pb-item">
                  Avg Accuracy: <strong>{serverRecord.averageAccuracy}%</strong>
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="typestorm-actions">
              <button
                type="button"
                className="typestorm-play-again-btn"
                onClick={handlePlayAgain}
              >
                <RotateCcw size={16} />
                <span>Play Again</span>
              </button>

              <Link to="/arcade" className="typestorm-arcade-btn">
                <ArrowLeft size={16} />
                <span>Back to Arcade</span>
              </Link>
            </div>
          </section>
        )}

        {/* Optional Notification Toast */}
        {toastMessage && (
          <NotificationToast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </main>
  );
}
