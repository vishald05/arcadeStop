import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Trophy,
  Sparkles,
  Timer,
  CheckCircle2,
  Sliders,
  Target,
  Hash,
  Award
} from 'lucide-react';
import { getBrowserId } from '../../utils/browserId.js';
import { getOverview, submitSession } from '../../services/memoryMadnessService.js';
import {
  DIFFICULTIES,
  DEFAULT_DIFFICULTY,
  STATES,
  generateDeck,
  calculateScore,
  calculateAccuracy,
  getPerformanceTier
} from './constants.js';
import { sound } from './audio.js';
import MemoryCard from './MemoryCard.jsx';
import NotificationToast from '../../components/NotificationToast.jsx';
import './MemoryMadnessGame.css';

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'mm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function MemoryMadnessGame({ game }) {
  // Configuration State
  const [selectedDifficultyId, setSelectedDifficultyId] = useState(DEFAULT_DIFFICULTY);
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Deck & Card State
  const [deck, setDeck] = useState([]);
  const [flippedCardIds, setFlippedCardIds] = useState([]); // Currently active un-matched cards [id1, id2]
  const [matchedCardIds, setMatchedCardIds] = useState(new Set());
  const [mismatchCardIds, setMismatchCardIds] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  // Live Gameplay Statistics
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Results & Records State
  const [finalResult, setFinalResult] = useState(null);
  const [overviewRecords, setOverviewRecords] = useState(null);
  const [currentPB, setCurrentPB] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Refs for timing, closure safety, and cleanup
  const browserIdRef = useRef(getBrowserId());
  const selectedDifficultyRef = useRef(DEFAULT_DIFFICULTY);
  const gameStateRef = useRef(STATES.IDLE);
  const timerIntervalRef = useRef(null);
  const mismatchTimeoutRef = useRef(null);
  const hasStartedTimerRef = useRef(false);
  const startTimeRef = useRef(null);
  const submittingRef = useRef(false);

  // Active difficulty configuration
  const currentDifficulty = DIFFICULTIES.find(d => d.id === selectedDifficultyId) || DIFFICULTIES[0];
  const gridSize = currentDifficulty.gridSize;
  const totalPairs = currentDifficulty.totalPairs;

  // Sync difficulty ref and PB
  useEffect(() => {
    selectedDifficultyRef.current = selectedDifficultyId;
    updatePBForDifficulty(selectedDifficultyId, overviewRecords);
  }, [selectedDifficultyId, overviewRecords]);

  // Sync gameState ref
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Sync sound manager enabled state
  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const updatePBForDifficulty = (diffId, overview) => {
    if (!overview) return;
    const key = diffId.toLowerCase();
    setCurrentPB(overview[key] || null);
  };

  const clearAllTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  // Load existing player records on mount
  useEffect(() => {
    getOverview(browserIdRef.current)
      .then(overview => {
        if (overview) {
          setOverviewRecords(overview);
          updatePBForDifficulty(selectedDifficultyRef.current, overview);
        }
      })
      .catch(() => {
        // Non-blocking
      });

    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Submit completed session to backend
  const handleSaveSession = useCallback(async (sessionPayload) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const responseDto = await submitSession(browserIdRef.current, sessionPayload);
      if (responseDto) {
        setOverviewRecords(prev => ({
          ...prev,
          [responseDto.difficulty.toLowerCase()]: responseDto
        }));
        setCurrentPB(responseDto);

        if (responseDto.newPersonalBest) {
          setToastMessage({
            title: `New ${responseDto.difficulty} Best Score!`,
            message: `Magnificent! You scored a new personal best: ${responseDto.bestScore} points!`
          });
        }
      }
    } catch (err) {
      console.warn('Could not persist Memory Madness session to backend:', err);
    }
  }, []);

  // Start fresh game
  const handleStartGame = () => {
    clearAllTimers();
    submittingRef.current = false;
    hasStartedTimerRef.current = false;

    const newDeck = generateDeck(selectedDifficultyRef.current);
    setDeck(newDeck);
    setFlippedCardIds([]);
    setMatchedCardIds(new Set());
    setMismatchCardIds([]);
    setIsLocked(false);

    setMoves(0);
    setMatchedPairs(0);
    setElapsedSeconds(0);
    setFinalResult(null);
    setGameState(STATES.ACTIVE);
  };

  // Start count-up timer on first card click
  const ensureTimerStarted = () => {
    if (!hasStartedTimerRef.current) {
      hasStartedTimerRef.current = true;
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedSeconds(Math.round(elapsed * 10) / 10);
      }, 100);
    }
  };

  // Finalize completed game
  const handleGameComplete = useCallback((finalMoves, finalMatchedPairs) => {
    clearAllTimers();
    setGameState(STATES.COMPLETED);
    sound.playVictory();

    const finalElapsed = (Date.now() - startTimeRef.current) / 1000;
    const cleanElapsed = Math.max(1.0, Math.round(finalElapsed * 10) / 10);
    const finalAccuracy = calculateAccuracy(finalMatchedPairs, finalMoves);
    const finalScore = calculateScore(
      totalPairs,
      finalMoves,
      cleanElapsed,
      currentDifficulty.targetSeconds
    );
    const mismatchedAttempts = Math.max(0, finalMoves - finalMatchedPairs);

    const result = {
      difficulty: selectedDifficultyRef.current,
      gridSize: currentDifficulty.gridSize,
      score: finalScore,
      completionTimeSeconds: cleanElapsed,
      totalMoves: finalMoves,
      matchedPairs: finalMatchedPairs,
      mismatchedAttempts,
      accuracy: finalAccuracy,
      timestamp: Date.now()
    };

    setFinalResult(result);

    const sessionPayload = {
      sessionId: generateSessionId(),
      difficulty: selectedDifficultyRef.current,
      score: finalScore,
      completionTimeSeconds: cleanElapsed,
      totalMoves: finalMoves,
      matchedPairs: finalMatchedPairs,
      mismatchedAttempts,
      accuracy: finalAccuracy
    };

    handleSaveSession(sessionPayload);
  }, [clearAllTimers, currentDifficulty.gridSize, currentDifficulty.targetSeconds, handleSaveSession, totalPairs]);

  // Handle card selection
  const handleCardClick = (clickedCard) => {
    if (gameState !== STATES.ACTIVE || isLocked) return;
    if (matchedCardIds.has(clickedCard.id)) return;
    if (flippedCardIds.includes(clickedCard.id)) return;

    // Start timer on the first card click
    ensureTimerStarted();

    // Flip card & play sound
    sound.playFlip();

    if (flippedCardIds.length === 0) {
      // First card of a pair attempt
      setFlippedCardIds([clickedCard.id]);
    } else if (flippedCardIds.length === 1) {
      // Second card of a pair attempt
      const firstCardId = flippedCardIds[0];
      const firstCard = deck.find(c => c.id === firstCardId);
      const newFlipped = [firstCardId, clickedCard.id];
      setFlippedCardIds(newFlipped);

      // Move is completed
      const newMoves = moves + 1;
      setMoves(newMoves);
      setIsLocked(true);

      if (firstCard && firstCard.pairId === clickedCard.pairId) {
        // MATCH!
        sound.playMatch();
        setMatchedCardIds(prev => {
          const nextSet = new Set(prev);
          nextSet.add(firstCardId);
          nextSet.add(clickedCard.id);
          return nextSet;
        });

        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        setFlippedCardIds([]);
        setIsLocked(false);

        // Check if all pairs are completed
        if (newMatchedPairs === totalPairs) {
          handleGameComplete(newMoves, newMatchedPairs);
        }
      } else {
        // MISMATCH!
        sound.playMismatch();
        setMismatchCardIds(newFlipped);

        mismatchTimeoutRef.current = setTimeout(() => {
          if (gameStateRef.current !== STATES.ACTIVE) return;
          setFlippedCardIds([]);
          setMismatchCardIds([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleChangeDifficulty = () => {
    clearAllTimers();
    setGameState(STATES.IDLE);
    setFlippedCardIds([]);
    setMatchedCardIds(new Set());
    setMismatchCardIds([]);
    setIsLocked(false);
    setFinalResult(null);
  };

  const remainingPairs = Math.max(0, totalPairs - matchedPairs);
  const liveAccuracy = calculateAccuracy(matchedPairs, moves);
  const liveScore = calculateScore(matchedPairs, moves, elapsedSeconds, currentDifficulty.targetSeconds);
  const isNewPB = finalResult && currentPB && finalResult.score > (currentPB.bestScore || 0);

  return (
    <main className="main-content">
      <div className="memmadness-container">

        {/* Navigation & Audio Controls */}
        <nav className="memmadness-nav">
          <Link to="/arcade" className="memmadness-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Arcade</span>
          </Link>

          <div className="memmadness-nav-actions">
            <button
              type="button"
              className="memmadness-sound-btn"
              onClick={() => setSoundEnabled(prev => !prev)}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>
            <div className="memmadness-badge-tag">
              <Brain size={14} />
              <span>Memory Arena</span>
            </div>
          </div>
        </nav>

        {/* ── Screen 1: IDLE / DIFFICULTY SETUP ─────────────────────────────── */}
        {gameState === STATES.IDLE && (
          <section className="memmadness-idle-card" aria-label="Game Setup">
            <div className="memmadness-hero-icon">
              <Brain size={44} strokeWidth={2.2} />
            </div>

            <h1 className="memmadness-title">Memory Madness</h1>
            <p className="memmadness-subtitle">
              Flip cards, memorize symbol locations, and uncover all matching pairs in the fewest moves and shortest time.
            </p>

            {/* Mode / Difficulty Selector */}
            <div className="memmadness-mode-selector">
              <label className="memmadness-selector-label">Choose Grid Difficulty:</label>
              <div className="memmadness-difficulty-grid">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficultyId === diff.id;
                  const diffKey = diff.id.toLowerCase();
                  const diffRecord = overviewRecords?.[diffKey];

                  return (
                    <button
                      key={diff.id}
                      type="button"
                      className={`memmadness-diff-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedDifficultyId(diff.id)}
                    >
                      <div className="memmadness-diff-header">
                        <span className="memmadness-diff-name">{diff.label}</span>
                        <span className="memmadness-diff-badge">{diff.badgeText}</span>
                      </div>
                      <p className="memmadness-diff-desc">{diff.description}</p>
                      <div className="memmadness-diff-pb">
                        <Trophy size={13} />
                        <span>Best: <strong>{diffRecord?.bestScore || 0} pts</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Records Summary Strip */}
            <div className="memmadness-pb-strip">
              <div className="memmadness-pb-item">
                <Trophy size={16} style={{ color: '#F59E0B' }} />
                <span>{currentDifficulty.label} High Score: <strong>{currentPB?.bestScore || 0} pts</strong></span>
              </div>
              {currentPB?.bestCompletionTime != null && (
                <div className="memmadness-pb-item">
                  <Timer size={14} />
                  <span>Best Time: <strong>{formatTime(currentPB.bestCompletionTime)}</strong></span>
                </div>
              )}
              {currentPB?.bestMoveCount != null && (
                <div className="memmadness-pb-item">
                  <Hash size={14} />
                  <span>Best Moves: <strong>{currentPB.bestMoveCount}</strong></span>
                </div>
              )}
            </div>

            {/* Start Game Button */}
            <button
              type="button"
              className="btn btn-primary memmadness-start-btn"
              onClick={handleStartGame}
              aria-label="Start Memory Madness"
            >
              <Play size={20} fill="currentColor" />
              <span>Start Game — {currentDifficulty.label} ({currentDifficulty.totalPairs} Pairs)</span>
            </button>

            {/* Rules Panel */}
            <div className="memmadness-rules-panel">
              <div className="memmadness-rule-item">
                <Brain size={18} className="memmadness-rule-icon" />
                <div>
                  <strong>Flip & Recall:</strong> Click any two cards to reveal their hidden symbols.
                </div>
              </div>
              <div className="memmadness-rule-item">
                <Target size={18} className="memmadness-rule-icon" style={{ color: '#60A5FA' }} />
                <div>
                  <strong>Match Pairs:</strong> Matching cards stay face up; mismatches flip back.
                </div>
              </div>
              <div className="memmadness-rule-item">
                <Trophy size={18} className="memmadness-rule-icon" style={{ color: '#F59E0B' }} />
                <div>
                  <strong>Efficiency Wins:</strong> Finish in fewer moves and faster time for higher scores.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Screen 2: ACTIVE GAMEPLAY / CARD BOARD ────────────────────────── */}
        {gameState === STATES.ACTIVE && (
          <section className="memmadness-play-card" aria-label="Memory Madness Board">
            {/* Top HUD */}
            <div className="memmadness-hud">
              <div className="memmadness-hud-cell">
                <span className="memmadness-hud-label">Difficulty</span>
                <span className="memmadness-hud-val" style={{ color: '#A78BFA' }}>
                  {currentDifficulty.label}
                </span>
              </div>

              <div className="memmadness-hud-cell">
                <span className="memmadness-hud-label">Time</span>
                <span className="memmadness-hud-val memmadness-timer-val">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>

              <div className="memmadness-hud-cell">
                <span className="memmadness-hud-label">Score</span>
                <span className="memmadness-hud-val memmadness-score-val">
                  {liveScore}
                </span>
              </div>

              <div className="memmadness-hud-cell">
                <span className="memmadness-hud-label">Moves</span>
                <span className="memmadness-hud-val">
                  {moves}
                </span>
              </div>

              <div className="memmadness-hud-cell">
                <span className="memmadness-hud-label">Pairs</span>
                <span className="memmadness-hud-val" style={{ color: '#34D399' }}>
                  {matchedPairs} / {totalPairs}
                </span>
              </div>
            </div>

            {/* Card Grid */}
            <div className="memmadness-board-wrapper">
              <div
                className={`memmadness-grid memmadness-grid-${gridSize}`}
                role="grid"
                aria-label={`${gridSize} by ${gridSize} Memory Card Board`}
                style={{
                  '--grid-size': gridSize
                }}
              >
                {deck.map((card) => {
                  const isFlipped = flippedCardIds.includes(card.id);
                  const isMatched = matchedCardIds.has(card.id);
                  const isMismatch = mismatchCardIds.includes(card.id);

                  return (
                    <MemoryCard
                      key={card.id}
                      card={card}
                      isFlipped={isFlipped}
                      isMatched={isMatched}
                      isMismatch={isMismatch}
                      isDisabled={isLocked}
                      onCardClick={handleCardClick}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom HUD Hint & Action Controls */}
            <div className="memmadness-play-footer">
              <div className="memmadness-footer-stats">
                <span>Remaining: <strong>{remainingPairs}</strong></span>
                <span>•</span>
                <span>Accuracy: <strong>{liveAccuracy}%</strong></span>
              </div>

              <div className="memmadness-play-actions">
                <button
                  type="button"
                  className="btn btn-secondary memmadness-small-btn"
                  onClick={handleStartGame}
                >
                  <RotateCcw size={15} />
                  <span>Restart</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary memmadness-small-btn"
                  onClick={handleChangeDifficulty}
                >
                  <Sliders size={15} />
                  <span>Change Mode</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Screen 3: COMPLETION / RESULTS SCREEN ─────────────────────────── */}
        {gameState === STATES.COMPLETED && finalResult && (
          <section className="memmadness-results-card" aria-label="Game Completion Results">
            {/* New High Score Celebratory Banner */}
            {isNewPB && (
              <div className="memmadness-pb-congrats">
                <Trophy size={18} />
                <span>New Personal Best for {finalResult.difficulty}!</span>
              </div>
            )}

            {/* Results Hero Header */}
            <div className="memmadness-results-hero">
              <span className="memmadness-results-hero-label">Final Score</span>
              <span className="memmadness-results-hero-val">{finalResult.score}</span>
              <span className="memmadness-results-hero-mode">
                {currentDifficulty.label} Mode ({currentDifficulty.badgeText})
              </span>

              {/* Performance Tier Evaluation */}
              {(() => {
                const tierInfo = getPerformanceTier(
                  finalResult.accuracy,
                  finalResult.completionTimeSeconds,
                  finalResult.difficulty
                );
                return (
                  <>
                    <div
                      className="memmadness-tier-pill"
                      style={{
                        borderColor: tierInfo.color,
                        color: tierInfo.color,
                        backgroundColor: `${tierInfo.color}15`
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{tierInfo.badge} — {tierInfo.tier}</span>
                    </div>
                    <p className="memmadness-eval-message">{tierInfo.message}</p>
                  </>
                );
              })()}
            </div>

            {/* Detailed Statistics Grid */}
            <div className="memmadness-stats-grid">
              <div className="memmadness-stat-cell">
                <span className="memmadness-stat-cell-label">Completion Time</span>
                <span className="memmadness-stat-cell-value" style={{ color: '#60A5FA' }}>
                  {formatTime(finalResult.completionTimeSeconds)}
                </span>
              </div>

              <div className="memmadness-stat-cell">
                <span className="memmadness-stat-cell-label">Total Moves</span>
                <span className="memmadness-stat-cell-value" style={{ color: '#F59E0B' }}>
                  {finalResult.totalMoves}
                </span>
              </div>

              <div className="memmadness-stat-cell">
                <span className="memmadness-stat-cell-label">Accuracy</span>
                <span className="memmadness-stat-cell-value" style={{ color: '#34D399' }}>
                  {finalResult.accuracy}%
                </span>
              </div>

              <div className="memmadness-stat-cell">
                <span className="memmadness-stat-cell-label">Mismatches</span>
                <span className="memmadness-stat-cell-value" style={{ color: '#F87171' }}>
                  {finalResult.mismatchedAttempts}
                </span>
              </div>

              <div className="memmadness-stat-cell">
                <span className="memmadness-stat-cell-label">Matched Pairs</span>
                <span className="memmadness-stat-cell-value" style={{ color: '#A78BFA' }}>
                  {finalResult.matchedPairs}
                </span>
              </div>

              <div className="memmadness-stat-cell">
                <span className="memmadness-stat-cell-label">Personal Best</span>
                <span className="memmadness-stat-cell-value" style={{ color: '#F59E0B' }}>
                  {Math.max(currentPB?.bestScore || 0, finalResult.score)} pts
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="memmadness-actions-row">
              <button
                type="button"
                className="btn btn-primary memmadness-action-btn"
                onClick={handleStartGame}
              >
                <RotateCcw size={17} />
                <span>Play Again ({currentDifficulty.label})</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary memmadness-action-btn"
                onClick={handleChangeDifficulty}
              >
                <Sliders size={17} />
                <span>Change Difficulty</span>
              </button>

              <Link to="/arcade" className="btn btn-secondary memmadness-action-btn">
                <span>Return to Arcade</span>
              </Link>
            </div>
          </section>
        )}

        {/* Global Notification Toast */}
        <NotificationToast toast={toastMessage} onClose={() => setToastMessage(null)} />
      </div>
    </main>
  );
}
