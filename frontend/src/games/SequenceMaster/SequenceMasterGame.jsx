import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Palette,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Trophy,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { getBrowserId } from '../../utils/browserId.js';
import { getOverview, submitSession } from '../../services/sequenceMasterService.js';
import {
  DIFFICULTIES,
  DEFAULT_DIFFICULTY,
  STATES,
  calculateRoundScore,
  calculateTotalScore,
  getPlaybackTimings,
  getPerformanceTier
} from './constants.js';
import { sound } from './audio.js';
import SequenceMasterGrid from './SequenceMasterGrid.jsx';
import NotificationToast from '../../components/NotificationToast.jsx';
import './SequenceMasterGame.css';

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export default function SequenceMasterGame({ game }) {
  // Configuration State
  const [selectedDifficultyId, setSelectedDifficultyId] = useState(DEFAULT_DIFFICULTY);
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Game State
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [sequenceLength, setSequenceLength] = useState(1);

  // Grid Tile Illumination & Interaction State
  const [activeTileIndex, setActiveTileIndex] = useState(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);
  const [failedTileIndex, setFailedTileIndex] = useState(null);

  // Results & Records
  const [finalResult, setFinalResult] = useState(null);
  const [overviewRecords, setOverviewRecords] = useState(null);
  const [currentPB, setCurrentPB] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Refs for rock-solid timing, closure safety, and cleanup
  const browserIdRef = useRef(getBrowserId());
  const selectedDifficultyRef = useRef(DEFAULT_DIFFICULTY);
  const gameStateRef = useRef(STATES.IDLE);
  const sequenceRef = useRef([]);
  const stepIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const completedRoundsRef = useRef(0);
  const totalCorrectTilesRef = useRef(0);
  const startTimeRef = useRef(null);
  const timeoutsRef = useRef([]);
  const submittingRef = useRef(false);

  // Get active difficulty object
  const currentDifficulty = DIFFICULTIES.find(d => d.id === selectedDifficultyId) || DIFFICULTIES[0];
  const gridSize = currentDifficulty.gridSize;
  const totalTiles = currentDifficulty.totalTiles;

  // Sync difficulty ref
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

  // Helper to extract PB for currently selected difficulty
  const updatePBForDifficulty = (diffId, overview) => {
    if (!overview) return;
    const key = diffId.toLowerCase();
    const rec = overview[key];
    setCurrentPB(rec?.highestScore || 0);
  };

  // Clear all pending playback timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  // Safe timeout scheduler that registers to timeoutsRef
  const scheduleTimeout = useCallback((fn, delayMs) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(tId => tId !== id);
      fn();
    }, delayMs);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Load existing records on mount
  useEffect(() => {
    getOverview(browserIdRef.current)
      .then(overview => {
        if (overview) {
          setOverviewRecords(overview);
          updatePBForDifficulty(selectedDifficultyRef.current, overview);
        }
      })
      .catch(() => {
        // Non-blocking: continue offline gracefully
      });

    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

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
        setCurrentPB(responseDto.highestScore || 0);

        if (responseDto.newPersonalBest) {
          setToastMessage({
            title: `New ${responseDto.difficulty} High Score!`,
            message: `Brilliant! You achieved a new personal best: ${responseDto.highestScore} points!`
          });
        }
      }
    } catch (err) {
      console.warn('Could not persist Sequence Master session to backend:', err);
    }
  }, []);

  // Trigger Sequence Playback
  const playSequence = useCallback(() => {
    clearAllTimeouts();
    setActiveTileIndex(null);
    setSelectedTileIndex(null);
    setFailedTileIndex(null);
    setGameState(STATES.PLAYING_SEQUENCE);

    const seq = sequenceRef.current;
    const diffId = selectedDifficultyRef.current;
    const { illuminationMs, gapMs } = getPlaybackTimings(diffId, seq.length);

    let currentDelay = 400; // Small initial pause before first tile illuminates

    seq.forEach((tileIdx, index) => {
      // Step A: Illuminate Tile and Play Tone
      scheduleTimeout(() => {
        if (gameStateRef.current === STATES.GAME_OVER) return;
        setActiveTileIndex(tileIdx);
        sound.playTileTone(tileIdx, totalTiles);
      }, currentDelay);

      currentDelay += illuminationMs;

      // Step B: Turn off illumination
      scheduleTimeout(() => {
        if (gameStateRef.current === STATES.GAME_OVER) return;
        setActiveTileIndex(null);
      }, currentDelay);

      currentDelay += gapMs;
    });

    // Step C: Transition to Player Input Mode
    scheduleTimeout(() => {
      if (gameStateRef.current === STATES.GAME_OVER) return;
      setActiveTileIndex(null);
      stepIndexRef.current = 0;
      setStepIndex(0);
      setGameState(STATES.PLAYER_INPUT);
    }, currentDelay + 100);
  }, [clearAllTimeouts, scheduleTimeout, totalTiles]);

  // Start fresh game session
  const handleStartGame = () => {
    clearAllTimeouts();
    submittingRef.current = false;

    // Pick 1 initial random tile (0 .. totalTiles - 1)
    const initialTile = Math.floor(Math.random() * totalTiles);
    sequenceRef.current = [initialTile];
    stepIndexRef.current = 0;
    scoreRef.current = 0;
    completedRoundsRef.current = 0;
    totalCorrectTilesRef.current = 0;
    startTimeRef.current = Date.now();

    setLevel(1);
    setScore(0);
    setCompletedRounds(0);
    setStepIndex(0);
    setSequenceLength(1);
    setActiveTileIndex(null);
    setSelectedTileIndex(null);
    setFailedTileIndex(null);
    setFinalResult(null);

    playSequence();
  };

  // End gameplay on incorrect selection
  const handleGameOver = (incorrectTileIndex) => {
    clearAllTimeouts();
    setActiveTileIndex(null);
    setSelectedTileIndex(null);
    setFailedTileIndex(incorrectTileIndex);
    setGameState(STATES.GAME_OVER);
    sound.playError();

    const elapsedSeconds = Math.max(1.0, Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10);
    const finalScore = scoreRef.current;
    const highestSeqLength = sequenceRef.current.length;
    const finalCompletedRounds = completedRoundsRef.current;
    const finalCorrectTiles = totalCorrectTilesRef.current;
    const diffId = selectedDifficultyRef.current;

    const result = {
      difficulty: diffId,
      gridSize: currentDifficulty.gridSize,
      score: finalScore,
      highestSequenceLength: highestSeqLength,
      completedRounds: finalCompletedRounds,
      totalCorrectTiles: finalCorrectTiles,
      elapsedSeconds,
      timestamp: Date.now()
    };

    setFinalResult(result);

    const sessionPayload = {
      sessionId: generateSessionId(),
      difficulty: diffId,
      score: finalScore,
      highestSequenceLength: highestSeqLength,
      completedRounds: finalCompletedRounds,
      totalCorrectTiles: finalCorrectTiles,
      elapsedSeconds
    };

    handleSaveSession(sessionPayload);
  };

  // Handle player tile selection
  const handleTileClick = (clickedTileIndex) => {
    if (gameState !== STATES.PLAYER_INPUT) return;

    // Flash tile and play sound
    setSelectedTileIndex(clickedTileIndex);
    sound.playTileTone(clickedTileIndex, totalTiles);
    scheduleTimeout(() => {
      setSelectedTileIndex(null);
    }, 180);

    const currentExpectedTile = sequenceRef.current[stepIndexRef.current];

    if (clickedTileIndex === currentExpectedTile) {
      // CORRECT TILE!
      totalCorrectTilesRef.current += 1;
      const nextStep = stepIndexRef.current + 1;
      stepIndexRef.current = nextStep;
      setStepIndex(nextStep);

      // Check if full sequence was successfully repeated
      if (nextStep === sequenceRef.current.length) {
        // ROUND COMPLETE!
        completedRoundsRef.current += 1;
        setCompletedRounds(completedRoundsRef.current);

        const newScore = calculateTotalScore(completedRoundsRef.current);
        scoreRef.current = newScore;
        setScore(newScore);

        setGameState(STATES.ROUND_SUCCESS);
        sound.playSuccess();

        // Pause briefly, then add 1 new tile and advance to next round
        scheduleTimeout(() => {
          if (gameStateRef.current === STATES.GAME_OVER) return;

          // Append 1 new random tile (can repeat consecutive positions per specs)
          const newTile = Math.floor(Math.random() * totalTiles);
          sequenceRef.current.push(newTile);

          const newLen = sequenceRef.current.length;
          setSequenceLength(newLen);
          setLevel(newLen);
          stepIndexRef.current = 0;
          setStepIndex(0);

          playSequence();
        }, 800);
      }
    } else {
      // INCORRECT TILE -> GAME OVER
      handleGameOver(clickedTileIndex);
    }
  };

  // Change Difficulty (returns to idle/selection screen)
  const handleChangeDifficulty = () => {
    clearAllTimeouts();
    setGameState(STATES.IDLE);
    setActiveTileIndex(null);
    setSelectedTileIndex(null);
    setFailedTileIndex(null);
    setFinalResult(null);
  };

  const isLocked = gameState !== STATES.PLAYER_INPUT;
  const isNewPB = finalResult && finalResult.score > currentPB;

  return (
    <main className="main-content">
      <div className="seqmaster-container">

        {/* Navigation & Audio Controls */}
        <nav className="seqmaster-nav">
          <Link to="/arcade" className="seqmaster-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Arcade</span>
          </Link>

          <div className="seqmaster-nav-actions">
            <button
              type="button"
              className="seqmaster-sound-btn"
              onClick={() => setSoundEnabled(prev => !prev)}
              aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>
            <div className="seqmaster-badge-tag">
              <Brain size={14} />
              <span>Memory Arena</span>
            </div>
          </div>
        </nav>

        {/* ── Screen 1: IDLE / DIFFICULTY SELECTION ─────────────────────────── */}
        {gameState === STATES.IDLE && (
          <section className="seqmaster-idle-card" aria-label="Game Setup">
            <div className="seqmaster-hero-icon">
              <Palette size={44} strokeWidth={2.2} />
            </div>

            <h1 className="seqmaster-title">Sequence Master</h1>
            <p className="seqmaster-subtitle">
              Memorize the sequence of illuminating tiles and repeat the pattern in exact order.
              Every victory adds one more step to the chain!
            </p>

            {/* Mode / Difficulty Selector */}
            <div className="seqmaster-mode-selector">
              <label className="seqmaster-selector-label">Choose Difficulty:</label>
              <div className="seqmaster-difficulty-grid">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = selectedDifficultyId === diff.id;
                  const diffKey = diff.id.toLowerCase();
                  const diffPB = overviewRecords?.[diffKey]?.highestScore || 0;

                  return (
                    <button
                      key={diff.id}
                      type="button"
                      className={`seqmaster-diff-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedDifficultyId(diff.id)}
                    >
                      <div className="seqmaster-diff-header">
                        <span className="seqmaster-diff-name">{diff.label}</span>
                        <span className="seqmaster-diff-badge">{diff.badgeText}</span>
                      </div>
                      <p className="seqmaster-diff-desc">{diff.description}</p>
                      <div className="seqmaster-diff-pb">
                        <Trophy size={13} />
                        <span>Best: <strong>{diffPB} pts</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Records Strip */}
            <div className="seqmaster-pb-strip">
              <div className="seqmaster-pb-item">
                <Trophy size={16} style={{ color: '#F59E0B' }} />
                <span>{currentDifficulty.label} High Score: <strong>{currentPB} pts</strong></span>
              </div>
              {overviewRecords?.[selectedDifficultyId.toLowerCase()]?.totalGamesPlayed > 0 && (
                <>
                  <div className="seqmaster-pb-item">
                    <span>Games: <strong>{overviewRecords[selectedDifficultyId.toLowerCase()].totalGamesPlayed}</strong></span>
                  </div>
                  <div className="seqmaster-pb-item">
                    <span>Max Sequence: <strong>{overviewRecords[selectedDifficultyId.toLowerCase()].highestSequenceLength} tiles</strong></span>
                  </div>
                </>
              )}
            </div>

            {/* Start Game Button */}
            <button
              type="button"
              className="btn btn-primary seqmaster-start-btn"
              onClick={handleStartGame}
              aria-label="Start Sequence Master"
            >
              <Play size={20} fill="currentColor" />
              <span>Start Game — {currentDifficulty.label} ({currentDifficulty.badgeText})</span>
            </button>

            {/* Quick Rules */}
            <div className="seqmaster-rules-panel">
              <div className="seqmaster-rule-item">
                <Brain size={18} className="seqmaster-rule-icon" />
                <div>
                  <strong>Watch:</strong> Observe the tile illumination order carefully.
                </div>
              </div>
              <div className="seqmaster-rule-item">
                <Layers size={18} className="seqmaster-rule-icon" style={{ color: '#A78BFA' }} />
                <div>
                  <strong>Repeat:</strong> Click the exact same tiles in identical sequence.
                </div>
              </div>
              <div className="seqmaster-rule-item">
                <Sparkles size={18} className="seqmaster-rule-icon" style={{ color: '#F59E0B' }} />
                <div>
                  <strong>Escalate:</strong> Each round appends a new tile to the sequence.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Screen 2: ACTIVE GAMEPLAY / BOARD SCREEN ──────────────────────── */}
        {(gameState === STATES.PLAYING_SEQUENCE ||
          gameState === STATES.PLAYER_INPUT ||
          gameState === STATES.ROUND_SUCCESS) && (
          <section className="seqmaster-play-card" aria-label="Sequence Master Board">
            {/* Top HUD */}
            <div className="seqmaster-hud">
              <div className="seqmaster-hud-cell">
                <span className="seqmaster-hud-label">Difficulty</span>
                <span className="seqmaster-hud-val" style={{ color: '#A78BFA' }}>
                  {currentDifficulty.label}
                </span>
              </div>

              <div className="seqmaster-hud-cell">
                <span className="seqmaster-hud-label">Score</span>
                <span className="seqmaster-hud-val seqmaster-score-val">
                  {score}
                </span>
              </div>

              <div className="seqmaster-hud-cell">
                <span className="seqmaster-hud-label">Level</span>
                <span className="seqmaster-hud-val">
                  {level}
                </span>
              </div>

              <div className="seqmaster-hud-cell">
                <span className="seqmaster-hud-label">Sequence</span>
                <span className="seqmaster-hud-val" style={{ color: '#60A5FA' }}>
                  {sequenceLength}
                </span>
              </div>

              <div className="seqmaster-hud-cell">
                <span className="seqmaster-hud-label">Personal Best</span>
                <span className="seqmaster-hud-val" style={{ color: '#F59E0B' }}>
                  {Math.max(currentPB, score)}
                </span>
              </div>
            </div>

            {/* Contextual Status Banner */}
            <div className={`seqmaster-status-banner status-${gameState.toLowerCase()}`}>
              {gameState === STATES.PLAYING_SEQUENCE && (
                <>
                  <span className="seqmaster-status-pulse" />
                  <span>Watch the sequence...</span>
                </>
              )}
              {gameState === STATES.PLAYER_INPUT && (
                <>
                  <CheckCircle2 size={16} />
                  <span>Your turn! Repeat sequence ({stepIndex} / {sequenceLength})</span>
                </>
              )}
              {gameState === STATES.ROUND_SUCCESS && (
                <>
                  <Sparkles size={16} />
                  <span>Correct! Round completed (+{calculateRoundScore(completedRounds)} pts)</span>
                </>
              )}
            </div>

            {/* Dynamic Interactive Grid Component */}
            <div className="seqmaster-board-wrapper">
              <SequenceMasterGrid
                gridSize={gridSize}
                activeTileIndex={activeTileIndex}
                selectedTileIndex={selectedTileIndex}
                failedTileIndex={failedTileIndex}
                isLocked={isLocked}
                onTileClick={handleTileClick}
              />
            </div>

            {/* In-game action footer */}
            <div className="seqmaster-play-actions">
              <button
                type="button"
                className="btn btn-secondary seqmaster-small-btn"
                onClick={handleStartGame}
              >
                <RotateCcw size={15} />
                <span>Restart</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary seqmaster-small-btn"
                onClick={handleChangeDifficulty}
              >
                <Sliders size={15} />
                <span>Change Mode</span>
              </button>
            </div>
          </section>
        )}

        {/* ── Screen 3: GAME OVER / RESULTS SCREEN ───────────────────────────── */}
        {gameState === STATES.GAME_OVER && finalResult && (
          <section className="seqmaster-results-card" aria-label="Game Over Results">
            {/* Celebratory PB banner */}
            {isNewPB && (
              <div className="seqmaster-pb-congrats">
                <Trophy size={18} />
                <span>New Personal Best for {finalResult.difficulty}!</span>
              </div>
            )}

            {/* Results Hero Header */}
            <div className="seqmaster-results-hero">
              <span className="seqmaster-results-hero-label">Final Score</span>
              <span className="seqmaster-results-hero-val">{finalResult.score}</span>
              <span className="seqmaster-results-hero-mode">
                {currentDifficulty.label} Mode ({currentDifficulty.badgeText})
              </span>

              {/* Performance Tier Evaluation */}
              {(() => {
                const tierInfo = getPerformanceTier(
                  finalResult.completedRounds,
                  finalResult.difficulty
                );
                return (
                  <>
                    <div
                      className="seqmaster-tier-pill"
                      style={{
                        borderColor: tierInfo.color,
                        color: tierInfo.color,
                        backgroundColor: `${tierInfo.color}15`
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{tierInfo.badge} — {tierInfo.tier}</span>
                    </div>
                    <p className="seqmaster-eval-message">{tierInfo.message}</p>
                  </>
                );
              })()}
            </div>

            {/* Detailed Statistics Grid */}
            <div className="seqmaster-stats-grid">
              <div className="seqmaster-stat-cell">
                <span className="seqmaster-stat-cell-label">Completed Rounds</span>
                <span className="seqmaster-stat-cell-value" style={{ color: '#34D399' }}>
                  {finalResult.completedRounds}
                </span>
              </div>

              <div className="seqmaster-stat-cell">
                <span className="seqmaster-stat-cell-label">Max Sequence Length</span>
                <span className="seqmaster-stat-cell-value" style={{ color: '#60A5FA' }}>
                  {finalResult.highestSequenceLength} tiles
                </span>
              </div>

              <div className="seqmaster-stat-cell">
                <span className="seqmaster-stat-cell-label">Correct Tile Inputs</span>
                <span className="seqmaster-stat-cell-value" style={{ color: '#A78BFA' }}>
                  {finalResult.totalCorrectTiles}
                </span>
              </div>

              <div className="seqmaster-stat-cell">
                <span className="seqmaster-stat-cell-label">Personal Best ({finalResult.difficulty})</span>
                <span className="seqmaster-stat-cell-value" style={{ color: '#F59E0B' }}>
                  {Math.max(currentPB, finalResult.score)} pts
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="seqmaster-actions-row">
              <button
                type="button"
                className="btn btn-primary seqmaster-action-btn"
                onClick={handleStartGame}
              >
                <RotateCcw size={17} />
                <span>Play Again ({currentDifficulty.label})</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary seqmaster-action-btn"
                onClick={handleChangeDifficulty}
              >
                <Sliders size={17} />
                <span>Change Difficulty</span>
              </button>

              <Link to="/arcade" className="btn btn-secondary seqmaster-action-btn">
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
