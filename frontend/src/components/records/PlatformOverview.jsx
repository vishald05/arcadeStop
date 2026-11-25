import React from 'react';
import { Gamepad2, Flame, Compass, AlertCircle } from 'lucide-react';
import { formatScore } from './formatters';

export default function PlatformOverview({ platform }) {
  if (!platform) return null;

  const totalPlayed = platform.totalGamesPlayed ?? 0;
  const combinedPoints = platform.combinedPoints ?? platform.combinedArcadePoints ?? 0;
  const exploredPlayed = platform.gamesExplored?.played ?? (typeof platform.gamesExplored === 'number' ? platform.gamesExplored : 0);
  const exploredTotal = platform.gamesExplored?.total ?? 6;

  const hasFailedGames = platform.failedGames && platform.failedGames.length > 0;

  return (
    <section className="records-overview-section" aria-label="Platform Statistics Overview">
      <div className="records-overview-grid">
        {/* Card 1: Total Games Played */}
        <article className="overview-card" data-testid="overview-total-played">
          <div className="overview-card-header">
            <div className="overview-icon-box" aria-hidden="true">
              <Gamepad2 size={22} strokeWidth={2.2} />
            </div>
            <span className="overview-label">TOTAL GAMES PLAYED</span>
          </div>
          <div className="overview-value-row">
            <div className="overview-value">{totalPlayed.toLocaleString()}</div>
            {hasFailedGames && (
              <span className="overview-warning-badge" title="Some game services failed to respond">
                <AlertCircle size={13} />
                <span>Partial</span>
              </span>
            )}
          </div>
          <p className="overview-subtext">Completed sessions across all games</p>
        </article>

        {/* Card 2: Combined Arcade Points */}
        <article className="overview-card" data-testid="overview-combined-points">
          <div className="overview-card-header">
            <div className="overview-icon-box" aria-hidden="true">
              <Flame size={22} strokeWidth={2.2} />
            </div>
            <span className="overview-label">COMBINED ARCADE POINTS</span>
          </div>
          <div className="overview-value-row">
            <div className="overview-value">{formatScore(combinedPoints)}</div>
          </div>
          <p className="overview-subtext">
            Points earned in points-based games (Whack Attack, Sequence Master, Memory Madness)
          </p>
        </article>

        {/* Card 3: Games Explored */}
        <article className="overview-card" data-testid="overview-games-explored">
          <div className="overview-card-header">
            <div className="overview-icon-box" aria-hidden="true">
              <Compass size={22} strokeWidth={2.2} />
            </div>
            <span className="overview-label">GAMES EXPLORED</span>
          </div>
          <div className="overview-value-row">
            <div className="overview-value">
              <span>{exploredPlayed}</span>
              <span className="overview-total"> / {exploredTotal}</span>
            </div>
          </div>
          <p className="overview-subtext">Arcade catalogue discovery rate</p>
        </article>
      </div>
    </section>
  );
}
