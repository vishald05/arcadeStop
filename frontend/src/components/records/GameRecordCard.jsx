import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Play,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  formatTime,
  formatMs,
  formatPercent,
  formatScore,
  getGameMeta
} from './formatters';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' }
];

export default function GameRecordCard({ gameKey, gameData, gameInfo, onRetry }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const meta = getGameMeta(gameInfo.id);
  const IconComponent = meta.icon;

  const isMultiDifficulty = gameKey === 'sequenceMaster' || gameKey === 'memoryMadness';

  // ── Render Error State ──
  if (gameData?.error) {
    return (
      <article className="game-record-card card-error-state" data-testid={`card-${gameInfo.id}`}>
        <div className="record-card-top">
          <div className="record-icon-box" aria-hidden="true">
            <IconComponent size={22} strokeWidth={2.2} />
          </div>
          <div className="record-header-meta">
            <span className="record-category-badge">{meta.category}</span>
            <span className="record-status-pill status-error">
              <AlertTriangle size={12} />
              <span>Offline</span>
            </span>
          </div>
        </div>

        <h3 className="record-game-name">{gameInfo.name}</h3>
        <p className="record-game-vibe">{meta.vibe}</p>

        <div className="record-error-body">
          <p className="record-error-msg">
            Could not retrieve statistics from game service.
          </p>
          <span className="record-error-detail">{gameData.error}</span>
          {onRetry && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRetry}
              style={{ marginTop: '0.75rem' }}
            >
              <RotateCw size={14} />
              <span>Retry Service</span>
            </button>
          )}
        </div>
      </article>
    );
  }

  // ── Render Unplayed State for entire game ──
  const isGameUnplayed = !gameData || !gameData.played || gameData.totalGamesPlayed === 0;

  if (isGameUnplayed) {
    return (
      <article className="game-record-card card-unplayed-state" data-testid={`card-${gameInfo.id}`}>
        <div className="record-card-top">
          <div className="record-icon-box" aria-hidden="true">
            <IconComponent size={22} strokeWidth={2.2} />
          </div>
          <div className="record-header-meta">
            <span className="record-category-badge">{meta.category}</span>
            <span className="record-status-pill status-unplayed">
              <Sparkles size={12} />
              <span>Unplayed</span>
            </span>
          </div>
        </div>

        <h3 className="record-game-name">{gameInfo.name}</h3>
        <p className="record-game-vibe">{meta.vibe}</p>

        <div className="record-unplayed-body">
          <p className="record-unplayed-message">
            No records yet. Your first high score is waiting.
          </p>
          <p className="record-unplayed-sub">{meta.description}</p>
        </div>

        <div className="record-card-footer">
          <Link to={`/games/${gameInfo.id}`} className="btn btn-primary btn-sm full-width">
            <span>Play Now</span>
            <Play size={14} />
          </Link>
        </div>
      </article>
    );
  }

  // ── Render Multi-Difficulty Game Cards ──
  if (isMultiDifficulty) {
    const diffData = gameData.difficulties?.[selectedDifficulty] || {};
    const diffStats = diffData.stats || {};
    const isDifficultyUnplayed = !diffData.played || diffData.totalGamesPlayed === 0;

    return (
      <article className="game-record-card card-active-records" data-testid={`card-${gameInfo.id}`}>
        <div className="record-card-top">
          <div className="record-icon-box" aria-hidden="true">
            <IconComponent size={22} strokeWidth={2.2} />
          </div>
          <div className="record-header-meta">
            <span className="record-category-badge">{meta.category}</span>
            <span className="record-total-pill">
              {gameData.totalGamesPlayed} {gameData.totalGamesPlayed === 1 ? 'round' : 'rounds'}
            </span>
          </div>
        </div>

        <h3 className="record-game-name">{gameInfo.name}</h3>
        <p className="record-game-vibe">{meta.vibe}</p>

        {/* Difficulty Selector */}
        <div className="diff-selector-row" role="tablist" aria-label={`${gameInfo.name} difficulty selection`}>
          {DIFFICULTIES.map(diff => (
            <button
              key={diff.key}
              type="button"
              role="tab"
              aria-selected={selectedDifficulty === diff.key}
              className={`diff-tab-btn ${selectedDifficulty === diff.key ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(diff.key)}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* Multi-diff Metrics */}
        {isDifficultyUnplayed ? (
          <div className="record-diff-unplayed">
            <p className="record-diff-unplayed-text">
              No {DIFFICULTIES.find(d => d.key === selectedDifficulty)?.label} records yet.
            </p>
            <Link to={`/games/${gameInfo.id}`} className="btn btn-secondary btn-sm">
              <span>Play {DIFFICULTIES.find(d => d.key === selectedDifficulty)?.label}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="record-metrics-grid">
            {gameKey === 'sequenceMaster' && (
              <>
                <div className="metric-box">
                  <span className="metric-label">HIGHEST SCORE</span>
                  <span className="metric-value highlight">{formatScore(diffStats.highestScore)}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">MAX SEQUENCE</span>
                  <span className="metric-value">{diffStats.highestSequenceLength || '--'}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">AVERAGE SCORE</span>
                  <span className="metric-value">{formatScore(Math.round(diffStats.averageScore || 0))}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">MODE SESSIONS</span>
                  <span className="metric-value">{diffData.totalGamesPlayed}</span>
                </div>
              </>
            )}

            {gameKey === 'memoryMadness' && (
              <>
                <div className="metric-box">
                  <span className="metric-label">BEST SCORE</span>
                  <span className="metric-value highlight">{formatScore(diffStats.bestScore)}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">FEWEST MOVES</span>
                  <span className="metric-value">{diffStats.bestMoveCount ?? '--'}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">FASTEST TIME</span>
                  <span className="metric-value">{formatTime(diffStats.bestCompletionTime)}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">BEST ACCURACY</span>
                  <span className="metric-value">{formatPercent(diffStats.bestAccuracy)}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="record-card-footer">
          <Link to={`/games/${gameInfo.id}`} className="btn btn-secondary btn-sm full-width">
            <span>Play Game</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </article>
    );
  }

  // ── Render Single-Difficulty Game Cards ──
  const stats = gameData.stats || {};

  return (
    <article className="game-record-card card-active-records" data-testid={`card-${gameInfo.id}`}>
      <div className="record-card-top">
        <div className="record-icon-box" aria-hidden="true">
          <IconComponent size={22} strokeWidth={2.2} />
        </div>
        <div className="record-header-meta">
          <span className="record-category-badge">{meta.category}</span>
          <span className="record-total-pill">
            {gameData.totalGamesPlayed} {gameData.totalGamesPlayed === 1 ? 'round' : 'rounds'}
          </span>
        </div>
      </div>

      <h3 className="record-game-name">{gameInfo.name}</h3>
      <p className="record-game-vibe">{meta.vibe}</p>

      <div className="record-metrics-grid">
        {gameKey === 'reactionRush' && (
          <>
            <div className="metric-box">
              <span className="metric-label">FASTEST REACTION</span>
              <span className="metric-value highlight">{formatMs(stats.bestReactionMs)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">AVERAGE REACTION</span>
              <span className="metric-value">{formatMs(stats.averageReactionMs)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">TOTAL SESSIONS</span>
              <span className="metric-value">{stats.totalSessions ?? gameData.totalGamesPlayed}</span>
            </div>
          </>
        )}

        {gameKey === 'numberNinja' && (
          <>
            <div className="metric-box">
              <span className="metric-label">FEWEST GUESSES</span>
              <span className="metric-value highlight">{stats.bestGuesses ?? '--'}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">HIGHEST WIN STREAK</span>
              <span className="metric-value">{stats.bestWinStreak ?? '--'}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">WIN PERCENTAGE</span>
              <span className="metric-value">{formatPercent(stats.winPercentage)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">TOTAL GAMES</span>
              <span className="metric-value">{gameData.totalGamesPlayed}</span>
            </div>
          </>
        )}

        {gameKey === 'typeStorm' && (
          <>
            <div className="metric-box">
              <span className="metric-label">HIGHEST WPM</span>
              <span className="metric-value highlight">{stats.bestWpm != null ? `${stats.bestWpm} WPM` : '--'}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">BEST ACCURACY</span>
              <span className="metric-value">{formatPercent(stats.bestAccuracy)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">AVERAGE WPM</span>
              <span className="metric-value">{stats.averageWpm != null ? `${Number(stats.averageWpm).toFixed(1)} WPM` : '--'}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">TOTAL GAMES</span>
              <span className="metric-value">{gameData.totalGamesPlayed}</span>
            </div>
          </>
        )}

        {gameKey === 'whackAttack' && (
          <>
            <div className="metric-box">
              <span className="metric-label">HIGHEST SCORE</span>
              <span className="metric-value highlight">{formatScore(stats.highestScore)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">BEST ACCURACY</span>
              <span className="metric-value">{formatPercent(stats.bestAccuracy)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">HIGHEST COMBO</span>
              <span className="metric-value">{stats.bestCombo != null ? `${stats.bestCombo}x` : '--'}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">AVERAGE SCORE</span>
              <span className="metric-value">{formatScore(Math.round(stats.averageScore || 0))}</span>
            </div>
          </>
        )}
      </div>

      <div className="record-card-footer">
        <Link to={`/games/${gameInfo.id}`} className="btn btn-secondary btn-sm full-width">
          <span>Play Game</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
