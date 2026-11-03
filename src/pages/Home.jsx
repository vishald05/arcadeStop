import React from 'react';
import Hero from '../components/Hero';
import GameGrid from '../components/GameGrid';
import InfoSection from '../components/InfoSection';

export default function Home({ onNotify }) {
  const handleSelectGame = (game) => {
    if (onNotify) {
      onNotify({
        title: game.title,
        message: game.comingSoonMessage
      });
    }
  };

  return (
    <main className="main-content">
      <Hero onNotify={onNotify} />
      <GameGrid onSelectGame={handleSelectGame} />
      <InfoSection />
    </main>
  );
}
