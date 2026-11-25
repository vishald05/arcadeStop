import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, Sparkles, Gamepad2 } from 'lucide-react';
import { getGameMeta } from './formatters';

export default function MostPlayedHighlight({ mostPlayedGame, totalGamesPlayed }) {
  if (!mostPlayedGame || totalGamesPlayed === 0) {
    return (
      <aside className="most-played-section empty-highlight" aria-label="Most Played Game Highlight">
        <div className="most-played-card empty-state">
          <div className="most-played-icon-wrap" aria-hidden="true">
            <Gamepad2 size={22} />
          </div>
          <div className="most-played-info">
            <span className="most-played-tag">MOST PLAYED CHALLENGE</span>
            <h3 className="most-played-title">No Games Played Yet</h3>
            <p className="most-played-desc">
              Your personal arcade vault is waiting. Jump into any game to set your first record!
            </p>
          </div>
          <div className="most-played-action">
            <Link to="/arcade" className="btn btn-primary btn-sm">
              <span>Explore Arcade</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  const meta = getGameMeta(mostPlayedGame.id);
  const IconComponent = meta.icon;

  return (
    <aside className="most-played-section" aria-label="Most Played Game Highlight">
      <div className="most-played-card">
        <div className="most-played-icon-wrap" aria-hidden="true">
          <IconComponent size={24} strokeWidth={2.2} />
        </div>
        <div className="most-played-info">
          <div className="most-played-badges">
            <span className="most-played-tag">
              <Award size={12} strokeWidth={2.5} />
              <span>MOST PLAYED GAME</span>
            </span>
            {mostPlayedGame.isTied && (
              <span className="tied-badge" title="Tied with another game in total sessions">
                Joint Leader
              </span>
            )}
          </div>
          <h3 className="most-played-title">{mostPlayedGame.name}</h3>
          <p className="most-played-desc">
            You have completed <strong>{mostPlayedGame.totalGamesPlayed.toLocaleString()}</strong> {mostPlayedGame.totalGamesPlayed === 1 ? 'round' : 'rounds'} of {mostPlayedGame.name}.
          </p>
        </div>
        <div className="most-played-action">
          <Link to={`/games/${mostPlayedGame.id}`} className="btn btn-primary btn-sm">
            <span>Play Again</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
