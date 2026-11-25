import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import GameCard from './GameCard';
import { Gamepad2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export default function FeaturedGames({ 
  games = [], 
  loading = false, 
  error = null, 
  onRetry = null, 
  onSelectGame 
}) {
  // Display only games that should appear in the featured section according to the existing data
  const featuredGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    const featured = games.filter(g => Boolean(g.featured));
    return featured.length > 0 ? featured : games.slice(0, 3);
  }, [games]);

  return (
    <section className="section featured-games-section" aria-labelledby="featured-games-title">
      <div className="app-container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Gamepad2 size={13} />
            <span>FEATURED SELECTION</span>
          </div>
          <h2 id="featured-games-title" className="section-title">
            PICK YOUR NEXT CHALLENGE
          </h2>
          <p className="section-description">
            Small games. Big competition.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="featured-grid" aria-label="Loading featured games">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
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
                <RefreshCw size={15} />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        )}

        {/* Featured Games Grid */}
        {!loading && !error && featuredGames.length > 0 && (
          <>
            <div className="featured-grid">
              {featuredGames.map(game => (
                <GameCard
                  key={game.slug || game.id}
                  game={game}
                  onSelect={onSelectGame}
                />
              ))}
            </div>

            <div className="featured-footer-action">
              <Link to="/arcade" className="view-all-link">
                <span>View Full Arcade Collection</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
