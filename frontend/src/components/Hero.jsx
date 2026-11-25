import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Zap, Terminal, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="app-container">
        <div className="hero-layout">
          {/* Left Column: Hero Content */}
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              <span>YOUR NEXT ROUND STARTS HERE</span>
            </div>

            <h1 id="hero-heading" className="hero-title">
              PLAY. <span className="hero-title-accent">COMPETE.</span> REPEAT.
            </h1>

            <p className="hero-supporting">
              A collection of quick, addictive mini-games. Challenge your reflexes, test your memory, and beat your personal best.
            </p>

            <div className="hero-actions">
              <Link to="/arcade" className="btn btn-primary">
                <span>EXPLORE GAMES</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/records" className="btn btn-secondary">
                <Trophy size={16} />
                <span>VIEW RECORDS</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Sleek Arcade HUD Motif (No heavy illustrations or stock photos) */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-hud-frame">
              <div className="hud-header">
                <div className="hud-status">
                  <span className="hud-status-indicator" />
                  <span className="hud-system-title">SYS // ARCADE LIVE</span>
                </div>
                <div className="hud-code-tag">READY</div>
              </div>

              <div className="hud-body">
                <div className="hud-icon-block">
                  <div className="hud-pixel-grid">
                    <Zap size={32} className="hud-pixel-icon" />
                  </div>
                </div>

                <div className="hud-metrics">
                  <div className="hud-metric-row">
                    <span className="metric-label">CATALOGUE</span>
                    <span className="metric-val text-neon">6 MINI-GAMES</span>
                  </div>
                  <div className="hud-metric-row">
                    <span className="metric-label">IDENTITY</span>
                    <span className="metric-val">ANONYMOUS</span>
                  </div>
                  <div className="hud-metric-row">
                    <span className="metric-label">SETUP</span>
                    <span className="metric-val">ZERO INSTALL</span>
                  </div>
                </div>
              </div>

              <div className="hud-footer">
                <div className="hud-footer-chip">
                  <Terminal size={12} />
                  <span>SPRING BOOT REST API</span>
                </div>
                <div className="hud-footer-chip">
                  <ShieldCheck size={12} />
                  <span>POSTGRESQL SYNC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
