import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowUp } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="arcade-footer">
      <div className="app-container">
        <div className="footer-content">
          {/* Brand & Wordmark */}
          <div className="footer-brand">
            <Link to="/" className="nav-brand" onClick={scrollToTop}>
              <div className="nav-logo-box">
                <Gamepad2 size={18} strokeWidth={2.4} />
              </div>
              <span className="brand-name">
                ARCADE<span className="brand-accent">STOP</span>
              </span>
            </Link>
            <p className="footer-description">
              A little arcade for your competitive side.
            </p>
          </div>

          {/* Clean Navigation Links */}
          <nav className="footer-nav" aria-label="Footer Navigation">
            <Link to="/" className="footer-nav-link" onClick={scrollToTop}>Home</Link>
            <Link to="/arcade" className="footer-nav-link" onClick={scrollToTop}>Arcade</Link>
            <Link to="/records" className="footer-nav-link" onClick={scrollToTop}>Records</Link>
          </nav>

          {/* Back to Top */}
          <div className="footer-actions">
            <button
              type="button"
              className="btn btn-secondary back-to-top-btn"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <span>TOP</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Copyright */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} ArcadeStop. All rights reserved.
          </p>
          <p className="footer-tagline">
            Built for quick breaks & high scores.
          </p>
        </div>
      </div>
    </footer>
  );
}
