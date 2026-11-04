import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Flame, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';

export default function Records() {
  return (
    <main className="main-content">
      <div className="app-container">
        <section className="records-hero">
          <div className="records-empty-card">
            {/* Themed Icon */}
            <div className="records-icon-box">
              <Trophy size={42} strokeWidth={2} />
            </div>

            <div className="section-tag" style={{ marginBottom: '1rem' }}>
              <Gamepad2 size={13} />
              <span>Personal Vault</span>
            </div>

            <h1 className="records-title">
              Personal Records Arriving Soon
            </h1>

            <p className="records-description">
              ArcadeStop keeps your personal bests, reaction times, and score histories stored locally on your device. Once games go live starting with <strong>Reaction Rush</strong>, your stats will automatically populate here.
            </p>

            {/* Preview of future stats cards (Empty State mockup) */}
            <div className="records-preview-grid">
              <div className="record-preview-item">
                <div className="preview-label">Reaction Rush</div>
                <div className="preview-val">-- ms</div>
                <div className="preview-sub">Fastest reflex click</div>
              </div>

              <div className="record-preview-item">
                <div className="preview-label">Games Played</div>
                <div className="preview-val">0</div>
                <div className="preview-sub">Total arcade rounds</div>
              </div>

              <div className="record-preview-item">
                <div className="preview-label">Top Streak</div>
                <div className="preview-val">--</div>
                <div className="preview-sub">Consecutive wins</div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/arcade" className="btn btn-primary">
                <span>Explore Upcoming Games</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
