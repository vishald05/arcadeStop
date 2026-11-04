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

  const handleClick = () => {
    if (onSelect) {
      onSelect(game);
    }
  };

  return (
    <article 
      className={`game-card game-card-${game.slug || game.id}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${game.name || game.title}: ${game.statusLabel || game.status}`}
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
            {game.isFirstPlanned || game.featured ? (
              <span className="badge badge-first">
                <Flame size={12} />
                <span>{game.badgeText || 'First Up'}</span>
              </span>
            ) : (
              <span className="badge badge-coming">
                <span>{game.badgeText || 'Coming Soon'}</span>
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
          {game.name || game.title}
        </h3>

        <p className="card-description">
          {game.description}
        </p>

        {/* Thematic Meta Row */}
        <div className="card-meta-chips">
          <div className="meta-chip">
            <Clock size={12} />
            <span>{game.estimatedPlayTime || '1-2 mins'}</span>
          </div>
          <span>•</span>
          <div className="meta-chip">
            <span>{game.vibe || 'Indie Arcade'}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="game-card-footer">
        <span className="action-label">
          {game.status === 'AVAILABLE' ? 'Play Game' : (game.isFirstPlanned || game.featured ? 'Available Soon' : 'Coming Soon')}
        </span>
        <div className="action-arrow-btn" aria-hidden="true">
          <ArrowRight size={15} />
        </div>
      </div>
    </article>
  );
}
