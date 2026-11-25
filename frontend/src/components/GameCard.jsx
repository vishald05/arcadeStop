import React from 'react';
import { 
  Zap, 
  Brain, 
  Hash, 
  Keyboard, 
  Palette, 
  Target, 
  ArrowRight,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';

const ICON_MAP = {
  zap: Zap,
  brain: Brain,
  hash: Hash,
  keyboard: Keyboard,
  palette: Palette,
  target: Target,
  Zap,
  Brain,
  Hash,
  Keyboard,
  Palette,
  Target
};

export default function GameCard({ game, onSelect }) {
  const iconKey = (game.icon || game.iconName || '').toLowerCase();
  const IconComponent = ICON_MAP[iconKey] || ICON_MAP[game.iconName] || Sparkles;

  const isAvailable = game.status === 'AVAILABLE';

  const handleClick = () => {
    if (onSelect) {
      onSelect(game);
    }
  };

  return (
    <article 
      className={`game-card ${isAvailable ? 'card-available' : 'card-disabled'}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${game.name || game.title}: ${isAvailable ? 'Available to Play' : 'Coming Soon'}`}
    >
      <div className="game-card-body">
        {/* Top Header Row with Icon and Category/Status Badges */}
        <div className="card-top-row">
          <div className="game-icon-container">
            <IconComponent size={24} strokeWidth={2.3} />
          </div>

          <div className="card-badges">
            <span className="card-category-badge">
              {game.category || 'Arcade'}
            </span>
            <div className={`status-pill ${isAvailable ? 'status-live' : 'status-soon'}`}>
              <span className="status-dot" />
              <span>{isAvailable ? 'READY' : 'SOON'}</span>
            </div>
          </div>
        </div>

        {/* Title and Short Description */}
        <h3 className="card-title">
          {game.name || game.title}
        </h3>

        <p className="card-description">
          {game.description}
        </p>

        {/* Thematic Meta Row */}
        <div className="card-meta-row">
          <div className="meta-item">
            <Clock size={12} />
            <span>{game.estimatedPlayTime || '1-2 mins'}</span>
          </div>
          <span className="meta-divider">•</span>
          <div className="meta-item">
            <span>{game.vibe || 'Fast Action'}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="game-card-footer">
        <span className="action-text">
          {isAvailable ? 'PLAY GAME' : 'COMING SOON'}
        </span>
        <div className="action-icon-box" aria-hidden="true">
          {isAvailable ? <ArrowRight size={15} /> : <Lock size={13} />}
        </div>
      </div>
    </article>
  );
}
