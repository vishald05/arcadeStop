import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Timer,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  Zap,
  Play,
  Crosshair,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  MousePointerClick
} from 'lucide-react';
import { getBrowserId } from '../../utils/browserId.js';
import { getRecord, submitSession } from '../../services/whackAttackService.js';
import {
  DURATIONS,
  DEFAULT_DURATION,
  STATES,
  GRID_SIZE,
  BASE_HIT_SCORE,
  getComboBonus,
  calculateHitScore,
  calculateAccuracy,
  getDifficultyParams,
  getNextTargetPosition,
  getPerformanceTier
} from './constants.js';
import NotificationToast from '../../components/NotificationToast.jsx';
import './WhackAttackGame.css';

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'wa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export default function WhackAttackGame({ game }) {
  // Game Configuration & State
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_DURATION);

  // Live Gameplay Statistics
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [emptyClicks, setEmptyClicks] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  // Active Target State
  const [activeCell, setActiveCell] = useState(null); // index 0..8 or null
  const [cellEffects, setCellEffects] = useState({}); // { [index]: { type: 'hit'|'miss'|'empty', id: number, text?: string } }

  // Completed Session Result
  const [finalResult, setFinalResult] = useState(null);

  // Persistence & Browser Record State
  const [previousRecord, setPreviousRecord] = useState(null);
  const [serverRecord, setServerRecord] = useState(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Refs for rock-solid timing, closure-safe access, and cleanup
  const browserIdRef = useRef(getBrowserId());
  const gameStateRef = useRef(STATES.IDLE);
  const durationRef = useRef(selectedDuration);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const targetTimeoutRef = useRef(null);
  const spawnTimeoutRef = useRef(null);
  const activeCellRef = useRef(null);
  const submittingRef = useRef(false);

  // Metrics refs for atomic updates
  const scoreRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const emptyClicksRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);

  // Synchronize durationRef
  useEffect(() => {
    durationRef.current = selectedDuration;
  }, [selectedDuration]);

  // Synchronize gameStateRef
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Load existing personal statistics on mount
  useEffect(() => {
    setRecordLoading(true);
    getRecord(browserIdRef.current)
      .then(rec => {
        if (rec) {
          setPreviousRecord(rec);
        }
      })
      .catch(() => {
        // Non-blocking: continue offline gracefully
      })
      .finally(() => setRecordLoading(false));

    return () => {
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
      targetTimeoutRef.current = null;
    }
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
  };

  // Add temporary floating visual effect on a cell
  const triggerCellEffect = (cellIndex, type, text) => {
    const effectId = Date.now() + Math.random();
    setCellEffects(prev => ({
      ...prev,
      [cellIndex]: { type, id: effectId, text }
    }));

    setTimeout(() => {
      setCellEffects(prev => {
        if (prev[cellIndex]?.id === effectId) {
          const updated = { ...prev };
          delete updated[cellIndex];
          return updated;
        }
        return prev;
      });
    }, 600);
  };

  // Submit session to backend with idempotency protection
  const handleSaveSession = useCallback(async (sessionPayload) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const responseDto = await submitSession(browserIdRef.current, sessionPayload);
      if (responseDto) {
        setServerRecord(responseDto);
        setPreviousRecord(responseDto);
        if (responseDto.newPersonalBest) {
          setToastMessage({
            title: 'New High Score!',
            message: `Incredible! You set a new personal record: ${responseDto.highestScore} points!`
          });
        }
      }
    } catch (err) {
      console.warn('Could not persist Whack Attack session to backend:', err);
      // Gameplay remains functional; personal stats keep local session result
    }
  }, []);

  // End gameplay cleanly and finalize statistics
  const handleGameOver = useCallback(() => {
    clearAllTimers();
    setActiveCell(null);
    activeCellRef.current = null;
    setGameState(STATES.COMPLETED);

    const elapsedSeconds = Number(durationRef.current);
    const finalScore = scoreRef.current;
    const finalHits = hitsRef.current;
    const finalMisses = missesRef.current;
    const finalEmpty = emptyClicksRef.current;
    const finalBestCombo = bestComboRef.current;
    const finalAccuracy = calculateAccuracy(finalHits, finalMisses, finalEmpty);

    const result = {
      score: finalScore,
      hits: finalHits,
      misses: finalMisses,
      emptyClicks: finalEmpty,
      accuracy: finalAccuracy,
      bestCombo: finalBestCombo,
      durationSeconds: elapsedSeconds,
      timestamp: Date.now()
    };

    setFinalResult(result);

    // Idempotent submit payload
    const sessionPayload = {
      sessionId: generateSessionId(),
      durationSeconds: elapsedSeconds,
      score: finalScore,
      hits: finalHits,
      misses: finalMisses,
      emptyClicks: finalEmpty,
      bestCombo: finalBestCombo,
      elapsedSeconds
    };

    handleSaveSession(sessionPayload);
  }, [handleSaveSession]);

  // Spawn next target
  const spawnTarget = useCallback(() => {
    if (gameStateRef.current !== STATES.ACTIVE) return;

    // Pick new position avoiding consecutive duplicate
    const nextPos = getNextTargetPosition(activeCellRef.current, GRID_SIZE);
    activeCellRef.current = nextPos;
    setActiveCell(nextPos);

    // Calculate dynamic difficulty based strictly on elapsed time
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    const { visibleDurationMs, spawnDelayMs } = getDifficultyParams(elapsedSec, durationRef.current);

    // Set expiration timer for this target
    targetTimeoutRef.current = setTimeout(() => {
      if (gameStateRef.current !== STATES.ACTIVE) return;
      if (activeCellRef.current === nextPos) {
        // Target expired without being hit -> Missed Target
        missesRef.current += 1;
        setMisses(missesRef.current);

        // Miss resets combo
        comboRef.current = 0;
        setCombo(0);

        triggerCellEffect(nextPos, 'miss', 'MISS');

        // Clear active target
        activeCellRef.current = null;
        setActiveCell(null);

        // Schedule next spawn after spawnDelay
        spawnTimeoutRef.current = setTimeout(() => {
          spawnTarget();
        }, spawnDelayMs);
      }
    }, visibleDurationMs);
  }, []);

  // Start new game session
  const handleStartGame = () => {
    clearAllTimers();
    submittingRef.current = false;

    // Reset live statistics
    scoreRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    emptyClicksRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    activeCellRef.current = null;

    setScore(0);
    setHits(0);
    setMisses(0);
    setEmptyClicks(0);
    setCombo(0);
    setBestCombo(0);
    setActiveCell(null);
    setCellEffects({});
    setFinalResult(null);

    const totalSeconds = durationRef.current;
    setTimeRemaining(totalSeconds);
    setGameState(STATES.ACTIVE);
    startTimeRef.current = Date.now();

    // Start high-precision countdown timer
    timerIntervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsedSec);
      setTimeRemaining(Math.ceil(remaining));

      if (remaining <= 0) {
        handleGameOver();
      }
    }, 100);

    // Initial slight delay before first target appears
    spawnTimeoutRef.current = setTimeout(() => {
      spawnTarget();
    }, 400);
  };

  // Handle cell click / tap
  const handleCellClick = (cellIndex) => {
    if (gameState !== STATES.ACTIVE) return;

    if (activeCell === cellIndex) {
      // SUCCESSFUL HIT
      if (targetTimeoutRef.current) {
        clearTimeout(targetTimeoutRef.current);
        targetTimeoutRef.current = null;
      }

      // Increment combo & track best combo
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      setCombo(newCombo);
      if (newCombo > bestComboRef.current) {
        bestComboRef.current = newCombo;
        setBestCombo(newCombo);
      }

      // Calculate score with combo bonus
      const hitPoints = calculateHitScore(newCombo);
      scoreRef.current += hitPoints;
      setScore(scoreRef.current);

      hitsRef.current += 1;
      setHits(hitsRef.current);

      // Trigger hit visual popup
      const bonus = getComboBonus(newCombo);
      const popupText = bonus > 0 ? `+${hitPoints} (Combo!)` : `+${hitPoints}`;
      triggerCellEffect(cellIndex, 'hit', popupText);

      // Disappear immediately
      activeCellRef.current = null;
      setActiveCell(null);

      // Schedule next target spawn
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      const { spawnDelayMs } = getDifficultyParams(elapsedSec, durationRef.current);
      spawnTimeoutRef.current = setTimeout(() => {
        spawnTarget();
      }, spawnDelayMs);

    } else {
      // EMPTY CLICK (clicked an empty cell)
      emptyClicksRef.current += 1;
      setEmptyClicks(emptyClicksRef.current);
      triggerCellEffect(cellIndex, 'empty', 'Whiff!');
    }
  };

  // Play Again: clean reset and re-initialization
  const handlePlayAgain = () => {
    clearAllTimers();
    setGameState(STATES.IDLE);
    setTimeRemaining(selectedDuration);
    setScore(0);
    setHits(0);
    setMisses(0);
    setEmptyClicks(0);
    setCombo(0);
    setBestCombo(0);
    setActiveCell(null);
    setCellEffects({});
    setFinalResult(null);
  };

  // Formatting helpers
  const currentPB = serverRecord?.highestScore || previousRecord?.highestScore || 0;
  const isUrgent = gameState === STATES.ACTIVE && timeRemaining <= 5;
  const isNewPB = finalResult && serverRecord?.newPersonalBest;

  return (
    <main className="main-content">
      <div className="whackattack-container">

        {/* Breadcrumb Navigation */}
        <nav className="whackattack-nav">
          <Link to="/arcade" className="whackattack-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Arcade</span>
          </Link>
          <div className="whackattack-badge-tag">
            <Target size={14} />
            <span>Reflex Arena</span>
          </div>
        </nav>

        {/* ── Screen 1: IDLE / CONFIGURATION SCREEN ───────────────────────────── */}
        {gameState === STATES.IDLE && (
          <section className="whackattack-idle-card" aria-label="Game Setup">
            <div className="whackattack-hero-icon">
              <Crosshair size={42} strokeWidth={2.2} />
            </div>

            <h1 className="whackattack-title">Whack Attack</h1>
            <p className="whackattack-subtitle">
              Targets ignite across the 3×3 grid. Strike as fast as possible before they vanish.
              Chain hits to build massive combo multipliers!
            </p>

            {/* Mode / Duration Selector */}
            <div className="whackattack-duration-selector">
              <label className="whackattack-selector-label">Choose Game Mode:</label>
              <div className="whackattack-duration-buttons">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.seconds}
                    type="button"
                    className={`whackattack-dur-btn ${selectedDuration === dur.seconds ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDuration(dur.seconds);
                      setTimeRemaining(dur.seconds);
                    }}
                  >
                    <span className="whackattack-dur-seconds">{dur.seconds}s</span>
                    <span className="whackattack-dur-title">{dur.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Records Summary Strip */}
            <div className="whackattack-pb-strip">
              <div className="whackattack-pb-item">
                <Trophy size={16} style={{ color: '#F59E0B' }} />
                <span>High Score: <strong>{currentPB} pts</strong></span>
              </div>
              {previousRecord?.totalGamesPlayed > 0 && (
                <>
                  <div className="whackattack-pb-item">
                    <span>Games: <strong>{previousRecord.totalGamesPlayed}</strong></span>
                  </div>
                  <div className="whackattack-pb-item">
                    <span>Best Combo: <strong>{previousRecord.bestCombo}x</strong></span>
                  </div>
                  <div className="whackattack-pb-item">
                    <span>Top Accuracy: <strong>{previousRecord.bestAccuracy}%</strong></span>
                  </div>
                </>
              )}
            </div>

            {/* Start Button */}
            <button
              type="button"
              className="btn btn-primary whackattack-start-btn"
              onClick={handleStartGame}
              aria-label="Start Whack Attack"
            >
              <Play size={20} fill="currentColor" />
              <span>Start Whack Attack ({selectedDuration}s)</span>
            </button>

            {/* Quick Rules */}
            <div className="whackattack-rules-panel">
              <div className="whackattack-rule-item">
                <Target size={18} className="whackattack-rule-icon" />
                <div>
                  <strong>Hit Targets:</strong> Click active targets to score 10+ points.
                </div>
              </div>
              <div className="whackattack-rule-item">
                <Flame size={18} className="whackattack-rule-icon" style={{ color: '#FB923C' }} />
                <div>
                  <strong>Combos:</strong> Consecutive hits grant bonus points per target.
                </div>
              </div>
              <div className="whackattack-rule-item">
                <AlertCircle size={18} className="whackattack-rule-icon" style={{ color: '#F87171' }} />
                <div>
                  <strong>Speed Escalation:</strong> Targets appear faster as the clock ticks down.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Screen 2: ACTIVE GAMEPLAY SCREEN ───────────────────────────────── */}
        {gameState === STATES.ACTIVE && (
          <section className="whackattack-play-card" aria-label="Active Game Board">
            {/* Top Statistics HUD */}
            <div className="whackattack-hud">
              {/* Timer Cell */}
              <div className={`whackattack-hud-cell ${isUrgent ? 'urgent' : ''}`}>
                <div className="whackattack-hud-label">
                  <Timer size={14} />
                  <span>Time</span>
                </div>
                <div className="whackattack-hud-val whackattack-timer-val">
                  {timeRemaining}s
                </div>
              </div>

              {/* Current Score */}
              <div className="whackattack-hud-cell">
                <div className="whackattack-hud-label">
                  <Trophy size={14} />
                  <span>Score</span>
                </div>
                <div className="whackattack-hud-val whackattack-score-val">
                  {score}
                </div>
              </div>

              {/* Combo Meter */}
              <div className={`whackattack-hud-cell ${combo >= 2 ? 'combo-active' : ''}`}>
                <div className="whackattack-hud-label">
                  <Flame size={14} className={combo >= 3 ? 'flame-pulsing' : ''} />
                  <span>Combo</span>
                </div>
                <div className="whackattack-hud-val whackattack-combo-val">
                  {combo > 0 ? `${combo}x` : '0'}
                  {combo >= 2 && (
                    <span className="whackattack-combo-tag">+{getComboBonus(combo)}</span>
                  )}
                </div>
              </div>

              {/* Hits Count */}
              <div className="whackattack-hud-cell">
                <div className="whackattack-hud-label">
                  <Target size={14} />
                  <span>Hits</span>
                </div>
                <div className="whackattack-hud-val">
                  {hits}
                </div>
              </div>
            </div>

            {/* 3×3 Playing Grid */}
            <div className="whackattack-board-wrapper">
              <div
                className="whackattack-grid"
                role="grid"
                aria-label="3 by 3 Whack Attack Target Board"
              >
                {Array.from({ length: GRID_SIZE }).map((_, index) => {
                  const isActive = activeCell === index;
                  const effect = cellEffects[index];

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`whackattack-cell ${isActive ? 'has-target' : ''} ${effect ? `effect-${effect.type}` : ''}`}
                      onClick={() => handleCellClick(index)}
                      aria-label={`Target position ${index + 1}${isActive ? ' - Active Target!' : ''}`}
                    >
                      {/* Hole Socket Shadow / Bezel */}
                      <div className="whackattack-hole-inner">
                        {/* Target Orb / Creature */}
                        {isActive && (
                          <div className="whackattack-target" aria-hidden="true">
                            <div className="whackattack-target-ring" />
                            <div className="whackattack-target-center">
                              <Crosshair size={32} strokeWidth={2.4} />
                            </div>
                          </div>
                        )}

                        {/* Floating Popup Feedback */}
                        {effect && (
                          <div className={`whackattack-cell-popup popup-${effect.type}`}>
                            {effect.text}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Subtle Footer HUD */}
            <div className="whackattack-footer-hint">
              <span>Missed: <strong>{misses}</strong></span>
              <span>•</span>
              <span>Whiffs: <strong>{emptyClicks}</strong></span>
              <span>•</span>
              <span>Accuracy: <strong>{calculateAccuracy(hits, misses, emptyClicks)}%</strong></span>
            </div>
          </section>
        )}

        {/* ── Screen 3: COMPLETED RESULTS SCREEN ──────────────────────────────── */}
        {gameState === STATES.COMPLETED && finalResult && (
          <section className="whackattack-results-card" aria-label="Game Results">
            {/* New High Score Celebratory Banner */}
            {isNewPB && (
              <div className="whackattack-pb-congrats">
                <Trophy size={18} />
                <span>New Personal Best High Score!</span>
              </div>
            )}

            {/* Results Hero Header */}
            <div className="whackattack-results-hero">
              <span className="whackattack-results-hero-label">Final Score</span>
              <span className="whackattack-results-hero-val">{finalResult.score}</span>
              <span className="whackattack-results-hero-mode">
                {finalResult.durationSeconds}s Mode
              </span>

              {/* Performance Tier Evaluation */}
              {(() => {
                const tierInfo = getPerformanceTier(
                  finalResult.score,
                  finalResult.accuracy,
                  finalResult.hits
                );
                return (
                  <>
                    <div
                      className="whackattack-tier-pill"
                      style={{
                        borderColor: tierInfo.color,
                        color: tierInfo.color,
                        backgroundColor: `${tierInfo.color}15`
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{tierInfo.badge} — {tierInfo.tier}</span>
                    </div>
                    <p className="whackattack-eval-message">{tierInfo.message}</p>
                  </>
                );
              })()}
            </div>

            {/* Detailed Statistics Grid */}
            <div className="whackattack-stats-grid">
              <div className="whackattack-stat-cell">
                <span className="whackattack-stat-cell-label">Successful Hits</span>
                <span className="whackattack-stat-cell-value" style={{ color: '#34D399' }}>
                  {finalResult.hits}
                </span>
              </div>

              <div className="whackattack-stat-cell">
                <span className="whackattack-stat-cell-label">Accuracy</span>
                <span className="whackattack-stat-cell-value" style={{ color: '#60A5FA' }}>
                  {finalResult.accuracy}%
                </span>
              </div>

              <div className="whackattack-stat-cell">
                <span className="whackattack-stat-cell-label">Best Combo</span>
                <span className="whackattack-stat-cell-value" style={{ color: '#FB923C' }}>
                  {finalResult.bestCombo}x
                </span>
              </div>

              <div className="whackattack-stat-cell">
                <span className="whackattack-stat-cell-label">Missed Targets</span>
                <span className="whackattack-stat-cell-value" style={{ color: '#F87171' }}>
                  {finalResult.misses}
                </span>
              </div>

              <div className="whackattack-stat-cell">
                <span className="whackattack-stat-cell-label">Empty Clicks</span>
                <span className="whackattack-stat-cell-value" style={{ color: 'var(--text-secondary)' }}>
                  {finalResult.emptyClicks}
                </span>
              </div>

              <div className="whackattack-stat-cell">
                <span className="whackattack-stat-cell-label">Personal Best</span>
                <span className="whackattack-stat-cell-value" style={{ color: '#F59E0B' }}>
                  {Math.max(currentPB, finalResult.score)} pts
                </span>
              </div>
            </div>

            {/* Results Action Buttons */}
            <div className="whackattack-actions-row">
              <button
                type="button"
                className="btn btn-primary whackattack-action-btn"
                onClick={handleStartGame}
              >
                <RotateCcw size={17} />
                <span>Play Again ({selectedDuration}s)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary whackattack-action-btn"
                onClick={handlePlayAgain}
              >
                <span>Change Mode</span>
              </button>

              <Link to="/arcade" className="btn btn-secondary whackattack-action-btn">
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
