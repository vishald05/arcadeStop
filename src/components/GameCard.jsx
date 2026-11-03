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
  Flame
} from 'lucide-react';

const ICON_MAP = {
  Zap,
  Brain,
  Hash,
  Keyboard,
  Palette,
  Target
};

export default function GameCard({ game, onSelect }) {
  const IconComponent = ICON_MAP[game.iconName] || Sparkles;

  const handleClick = () => {
    if (onSelect) {
      onSelect(game);
    }
  };

  return (
    <article 
      className={`game-card game-card-${game.id}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${game.title}: ${game.statusLabel}`}
      style={{
        '--card-accent': game.accentColor,
        '--card-glow': game.borderGlow
      }}
    >
      {/* Dynamic ambient backdrop specific to each game's visual identity */}
      <div 
        className="card-ambient-backdrop" 
        style={{ background: game.cardGradient }}
        aria-hidden="true"
      />

      <div className="game-card-body">
        {/* Top Header Row with Icon and Badges */}
        <div className="card-top-row">
          <div 
            className="game-icon-container"
            style={{
              color: game.accentColor,
              borderColor: `${game.accentColor}33`,
              boxShadow: `0 4px 16px ${game.accentColor}18`
            }}
          >
            <IconComponent size={26} strokeWidth={2.2} />
          </div>

          <div className="card-badges">
            {game.isFirstPlanned ? (
              <span className="badge badge-first">
                <Flame size={12} />
                <span>{game.badgeText}</span>
              </span>
            ) : (
              <span className="badge badge-coming">
                <span>{game.badgeText}</span>
              </span>
            )}
            <span 
              className="card-category-badge"
              style={{
                color: game.accentColor,
                backgroundColor: `${game.accentColor}14`
              }}
            >
              {game.category}
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="card-title">
          {game.title}
        </h3>

        <p className="card-description">
          {game.description}
        </p>

        {/* Thematic Meta Row */}
        <div className="card-meta-chips">
          <div className="meta-chip">
            <Clock size={12} />
            <span>{game.estimatedPlayTime}</span>
          </div>
          <span>•</span>
          <div className="meta-chip">
            <span>{game.vibe}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="game-card-footer">
        <span className="action-label">
          {game.isFirstPlanned ? 'Available Soon' : 'Coming Soon'}
        </span>
        <div className="action-arrow-btn" aria-hidden="true">
          <ArrowRight size={15} />
        </div>
      </div>
    </article>
  );
}
