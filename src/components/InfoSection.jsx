import React from 'react';
import { UserX, Play, HardDrive, Sparkles, CheckCircle2 } from 'lucide-react';

const INFO_POINTS = [
  {
    icon: UserX,
    title: 'No Account Required',
    desc: 'Jump straight in. No registration forms, passwords, or emails to verify.'
  },
  {
    icon: Play,
    title: 'Zero Setup',
    desc: 'No heavy downloads or installs. Every mini-game runs natively right in your browser.'
  },
  {
    icon: Sparkles,
    title: 'Just Pick and Play',
    desc: 'Bite-sized challenges designed for quick mental breaks or rapid replay streaks.'
  },
  {
    icon: HardDrive,
    title: 'Records Stay on Your Device',
    desc: 'Your upcoming personal bests and high scores will live privately in your own browser.'
  }
];

export default function InfoSection() {
  return (
    <section className="section info-section" aria-labelledby="info-heading">
      <div className="app-container">
        <div className="section-header">
          <div className="section-tag">
            <CheckCircle2 size={14} />
            <span>The Arcade Experience</span>
          </div>
          <h2 id="info-heading" className="section-title">
            Zero setup. Maximum fun.
          </h2>
          <p className="section-description">
            Everything you want from a browser arcade, without any of the friction.
          </p>
        </div>

        <div className="info-grid">
          {INFO_POINTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="info-card">
                <div className="info-icon-box">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="info-card-title">{item.title}</h3>
                <p className="info-card-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
