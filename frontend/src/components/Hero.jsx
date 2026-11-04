import React from 'react';
import { ArrowDown, Shuffle, Zap, Sparkles, Terminal } from 'lucide-react';

export default function Hero({ onNotify, games = [] }) {
  const handleScrollToGames = (e) => {
    e.preventDefault();
    const element = document.getElementById('games-collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSurpriseMe = () => {
    if (!games || games.length === 0) {
      if (onNotify) {
        onNotify({
          title: 'Catalog Syncing...',
          message: 'The arcade catalog is currently syncing with the backend. Please check back in a moment!',
          icon: Zap
        });
      }
      return;
    }

    // Pick a random game from the collection
    const randomIndex = Math.floor(Math.random() * games.length);
    const selected = games[randomIndex];
    
    if (onNotify) {
      onNotify({
        title: `Surprise Pick: ${selected.name || selected.title}!`,
        message: selected.comingSoonMessage || 'Get ready for one more game!',
        icon: Zap
      });
    }
  };

  // Find the featured or first planned game
  const spotlightGame = games.find(g => g.featured || g.isFirstPlanned) || games[0] || {
    name: 'Reaction Rush',
    title: 'Reaction Rush'
  };

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="app-container">
        <div className="hero-layout">
          {/* Left Column: Hero Content */}
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-badge">Phase 1.5</span>
              <span>Spring Boot Integration</span>
            </div>

            <h1 id="hero-heading" className="hero-title">
              Welcome to <span className="hero-title-highlight">ArcadeStop.</span>
            </h1>

            <p className="hero-subheading">
              Take a break. Challenge yourself. Play something fun.
            </p>

            <p className="hero-supporting">
              A collection of little games for your big breaks.
            </p>

            <div className="hero-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleScrollToGames}
              >
                <span>Explore Games</span>
                <ArrowDown size={18} />
              </button>

              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleSurpriseMe}
                title="Pick a random game"
              >
                <Shuffle size={17} />
                <span>Surprise Me</span>
              </button>
            </div>
          </div>

          {/* Right Column: Arcade Graphic */}
          <div className="hero-visual" aria-hidden="true">
            <div className="arcade-screen-frame">
              <div className="screen-header-bar">
                <div className="screen-dots">
                  <span className="screen-dot red"></span>
                  <span className="screen-dot yellow"></span>
                  <span className="screen-dot green"></span>
                </div>
                <div className="screen-status-label">SYS_01 // ONLINE</div>
              </div>

              <div className="screen-core-card">
                <div className="screen-badge-row">
                  <div className="token-badge">
                    <span>COINS: ∞ FREE PLAY</span>
                  </div>
                  <span className="badge badge-first">⚡ Up Next</span>
                </div>

                <div className="screen-game-spotlight">
                  <div className="spotlight-icon-wrap">
                    <Zap size={32} />
                  </div>
                  <h3 className="spotlight-title">{spotlightGame.name || spotlightGame.title}</h3>
                  <p className="spotlight-tagline">First game arriving to the arcade</p>
                </div>

                <div className="screen-micro-ticker">
                  <div className="ticker-item">
                    <Sparkles size={13} />
                    <span>Instant In-Browser</span>
                  </div>
                  <div className="ticker-item">
                    <Terminal size={13} />
                    <span>Spring Boot API</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
