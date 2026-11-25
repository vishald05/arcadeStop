import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ArcadeCTA() {
  return (
    <section className="section arcade-cta-section" aria-labelledby="cta-heading">
      <div className="app-container">
        <div className="arcade-cta-card">
          <div className="cta-corner-bracket top-left" />
          <div className="cta-corner-bracket top-right" />
          <div className="cta-corner-bracket bottom-left" />
          <div className="cta-corner-bracket bottom-right" />

          <div className="cta-content">
            <div className="cta-eyebrow">
              <Sparkles size={13} className="cta-sparkle" />
              <span>ENDLESS RETRIES</span>
            </div>

            <h2 id="cta-heading" className="cta-title">
              THE ARCADE IS WAITING.
            </h2>

            <p className="cta-description">
              One game is never enough. Discover your next obsession.
            </p>

            <div className="cta-action">
              <Link to="/arcade" className="btn btn-primary cta-btn">
                <span>ENTER THE ARCADE</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
