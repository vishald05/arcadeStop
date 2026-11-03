import React from 'react';
import { ArrowDown, Shuffle, Zap, Sparkles, Terminal } from 'lucide-react';
import { GAMES } from '../data/games';

export default function Hero({ onNotify }) {
  const handleScrollToGames = (e) => {
    e.preventDefault();
    const element = document.getElementById('games-collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSurpriseMe = () => {
    // Pick a random game from the collection
    const randomIndex = Math.floor(Math.random() * GAMES.length);
    const selected = GAMES[randomIndex];
    
    if (onNotify) {
      onNotify({
        title: `Surprise Pick: ${selected.title}!`,
        message: selected.comingSoonMessage,
        icon: Zap
      });
    }
  };

  // The first planned game is Reaction Rush
  const firstGame = GAMES.find(g => g.isFirstPlanned) || GAMES[0];

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="app-container">
        <div className="hero-layout">
          {/* Left Column: Hero Content */}
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-badge">Phase 1</span>
              <span>The Arcade Foundation</span>
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
                <div className="screen-status-label">SYS_01 // READY</div>
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
                  <h3 className="spotlight-title">{firstGame.title}</h3>
                  <p className="spotlight-tagline">First game arriving to the arcade</p>
                </div>

                <div className="screen-micro-ticker">
                  <div className="ticker-item">
                    <Sparkles size={13} />
                    <span>Instant In-Browser</span>
                  </div>
                  <div className="ticker-item">
                    <Terminal size={13} />
                    <span>Local Records</span>
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
