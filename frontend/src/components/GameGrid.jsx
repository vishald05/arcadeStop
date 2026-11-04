import React, { useState, useMemo } from 'react';
import GameCard from './GameCard';
import { Gamepad2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function GameGrid({ 
  games = [],
  loading = false,
  error = null,
  onRetry = null,
  onSelectGame, 
  title = "Pick Your Next Game", 
  subtitle = "Quick games. Endless retries. One more round.",
  showFilter = true,
  sectionId = "games-collection"
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Compute category pills dynamically based on available games (with fallback)
  const categories = useMemo(() => {
    const defaultCategories = ['All', 'Reflex', 'Brain', 'Puzzle', 'Skills', 'Memory'];
    if (!games || games.length === 0) return defaultCategories;
    
    const uniqueFromGames = Array.from(new Set(games.map(g => g.category).filter(Boolean)));
    const merged = ['All', ...uniqueFromGames];
    return Array.from(new Set(merged));
  }, [games]);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    if (selectedCategory === 'All') return games;
    return games.filter(
      game => (game.category || '').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [games, selectedCategory]);

  return (
    <section id={sectionId} className="section collection-section" aria-labelledby="collection-title">
      <div className="app-container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Gamepad2 size={14} />
            <span>Dynamic Catalog</span>
          </div>
          <h2 id="collection-title" className="section-title">
            {title}
          </h2>
          <p className="section-description">
            {subtitle}
          </p>
        </div>

        {/* Category Filters */}
        {showFilter && !error && (
          <div className="collection-toolbar" role="tablist" aria-label="Game categories">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                className={`filter-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="games-grid" aria-label="Loading game library">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-shimmer" />
                <div className="skeleton-top">
                  <div className="skeleton-box skeleton-icon" />
                  <div className="skeleton-box skeleton-badge" />
                </div>
                <div className="skeleton-box skeleton-title" />
                <div className="skeleton-box skeleton-desc-line1" />
                <div className="skeleton-box skeleton-desc-line2" />
                <div className="skeleton-footer-bar">
                  <div className="skeleton-box skeleton-meta" />
                  <div className="skeleton-box skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="catalog-error-state" role="alert">
            <div className="error-icon-wrap">
              <AlertCircle size={28} />
            </div>
            <h3 className="error-title">Unable to Connect to ArcadeStop Server</h3>
            <p className="error-desc">
              {error}. Make sure the Spring Boot backend is running on <code>http://localhost:8080</code>.
            </p>
            {onRetry && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={onRetry}
              >
                <RefreshCw size={16} />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        )}

        {/* Empty Catalog State */}
        {!loading && !error && filteredGames.length === 0 && (
          <div className="catalog-empty-state">
            <div className="empty-state-title">No games found</div>
            <p className="empty-state-desc">
              No games currently match the "{selectedCategory}" category. Try selecting another filter!
            </p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && filteredGames.length > 0 && (
          <div className="games-grid">
            {filteredGames.map(game => (
              <GameCard
                key={game.slug || game.id}
                game={game}
                onSelect={onSelectGame}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
