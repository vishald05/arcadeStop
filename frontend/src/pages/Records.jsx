import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  AlertTriangle,
  RotateCw,
  Gamepad2,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import { CANONICAL_GAMES } from '../services/recordsService';
import DashboardHeader from '../components/records/DashboardHeader';
import PlatformOverview from '../components/records/PlatformOverview';
import MostPlayedHighlight from '../components/records/MostPlayedHighlight';
import GameRecordCard from '../components/records/GameRecordCard';

export default function Records() {
  const { data, loading, error, refresh } = useRecords();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── 1. Initial Loading State (Skeletons) ──
  if (loading && !data) {
    return (
      <main className="main-content records-page">
        <div className="app-container">
          <div className="records-skeleton-header">
            <div className="skeleton-line skeleton-title pulse" />
            <div className="skeleton-line skeleton-subtitle pulse" />
          </div>

          <div className="records-overview-grid skeleton-overview">
            <div className="overview-card skeleton-card pulse" />
            <div className="overview-card skeleton-card pulse" />
            <div className="overview-card skeleton-card pulse" />
          </div>

          <div className="records-games-grid skeleton-games">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="game-record-card skeleton-card pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ── 2. Complete Failure State ──
  if (error && (!data || !data.games)) {
    return (
      <main className="main-content records-page">
        <div className="app-container">
          <div className="records-error-card" data-testid="complete-failure-state">
            <div className="records-error-icon" aria-hidden="true">
              <ShieldAlert size={48} strokeWidth={2} />
            </div>
            <h2 className="records-error-title">Arcade Vault Unavailable</h2>
            <p className="records-error-message">
              {error || 'Unable to communicate with the game records servers. Your connection may be offline.'}
            </p>
            <div className="records-error-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RotateCw size={16} className={isRefreshing ? 'spin' : ''} />
                <span>{isRefreshing ? 'Retrying...' : 'Retry Connection'}</span>
              </button>
              <Link to="/arcade" className="btn btn-secondary">
                <span>Back to Arcade</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const summary = data?.summary || {};
  const games = data?.games || {};
  const isFreshPlayer = (summary.totalGamesPlayed ?? 0) === 0;

  return (
    <main className="main-content records-page">
      <div className="app-container">
        {/* Header */}
        <DashboardHeader onRefresh={handleRefresh} isRefreshing={isRefreshing || loading} />

        {/* Partial Failure Notice */}
        {summary.hasError && (
          <div className="records-partial-error-banner" role="alert" data-testid="partial-failure-banner">
            <div className="banner-icon-wrap" aria-hidden="true">
              <AlertTriangle size={18} />
            </div>
            <div className="banner-text">
              <strong>Partial Sync Notice:</strong> Records for{' '}
              <span className="failed-games-list">
                {summary.failedGames?.map(g => CANONICAL_GAMES.find(cg => cg.key === g)?.name || g).join(', ')}
              </span>{' '}
              could not be reached. Showing available statistics.
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm banner-retry-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RotateCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Platform Overview 3-Card Summary */}
        <PlatformOverview platform={summary} />

        {/* Most Played Game Highlight */}
        <MostPlayedHighlight
          mostPlayedGame={summary.mostPlayedGame}
          totalGamesPlayed={summary.totalGamesPlayed ?? 0}
        />

        {/* Individual Game Records Section */}
        <section className="records-games-section" aria-label="Individual Game Records">
          <div className="records-section-header">
            <div className="records-section-title-wrap">
              <h2 className="records-section-title">GAME LEDGERS</h2>
              <span className="records-section-count">
                {summary.gamesExplored?.played ?? 0} of {CANONICAL_GAMES.length} Active
              </span>
            </div>
            <p className="records-section-subtitle">
              Detailed breakdown of your high scores, accuracies, and session streaks.
            </p>
          </div>

          <div className="records-games-grid">
            {CANONICAL_GAMES.map(gameInfo => {
              const gameData = games[gameInfo.key] || {
                played: false,
                totalGamesPlayed: 0,
                stats: null,
                error: null
              };

              return (
                <GameRecordCard
                  key={gameInfo.key}
                  gameKey={gameInfo.key}
                  gameData={gameData}
                  gameInfo={gameInfo}
                  onRetry={handleRefresh}
                />
              );
            })}
          </div>
        </section>

        {/* Friendly Fresh Player Banner if zero games played */}
        {isFreshPlayer && (
          <section className="fresh-player-callout">
            <div className="fresh-callout-content">
              <div className="fresh-callout-icon" aria-hidden="true">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="fresh-callout-title">Ready to Set Your First Record?</h3>
                <p className="fresh-callout-text">
                  Choose any arcade game to start building your personal record ledger. Every click, reaction, and word counts!
                </p>
              </div>
            </div>
            <Link to="/arcade" className="btn btn-primary">
              <span>Enter The Arcade</span>
              <ArrowRight size={16} />
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
