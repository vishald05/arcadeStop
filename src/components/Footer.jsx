import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowUp, Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="arcade-footer">
      <div className="app-container">
        <div className="footer-top">
          {/* Brand & Tagline Column */}
          <div className="footer-brand-col">
            <Link to="/" className="nav-brand" onClick={scrollToTop}>
              <div className="nav-logo-box">
                <Gamepad2 size={20} strokeWidth={2.3} />
              </div>
              <span className="brand-name">Arcade<span>Stop</span></span>
            </Link>
            <p className="footer-tagline">
              Your stop for one more game.
            </p>
            <p className="footer-playful-note">
              "Made for people who always say one more round."
            </p>
          </div>

          {/* Clean Navigation Links */}
          <div className="footer-nav-col">
            <div className="footer-nav-group">
              <span className="footer-nav-heading">Platform</span>
              <Link to="/" className="footer-link" onClick={scrollToTop}>Home</Link>
              <Link to="/arcade" className="footer-link" onClick={scrollToTop}>Arcade Collection</Link>
              <Link to="/records" className="footer-link" onClick={scrollToTop}>Personal Records</Link>
            </div>

            <div className="footer-nav-group">
              <span className="footer-nav-heading">Collection</span>
              <Link to="/arcade" className="footer-link" onClick={scrollToTop}>Reflex Games</Link>
              <Link to="/arcade" className="footer-link" onClick={scrollToTop}>Brain & Logic</Link>
              <Link to="/arcade" className="footer-link" onClick={scrollToTop}>Puzzles & Speed</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copy">
            © {currentYear} ArcadeStop. All rights reserved.
          </div>

          <div className="footer-pill-badge">
            <Sparkles size={12} />
            <span>Modern Indie Web Arcade</span>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={scrollToTop}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
