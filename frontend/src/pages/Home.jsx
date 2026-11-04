import React from 'react';
import Hero from '../components/Hero';
import GameGrid from '../components/GameGrid';
import InfoSection from '../components/InfoSection';

export default function Home({ games, loading, error, onRetry, onNotify }) {
  const handleSelectGame = (game) => {
    if (onNotify) {
      onNotify({
        title: game.name || game.title,
        message: game.comingSoonMessage || 'Game is coming soon!'
      });
    }
  };

  return (
    <main className="main-content">
      <Hero onNotify={onNotify} games={games} />
      <GameGrid 
        games={games}
        loading={loading}
        error={error}
        onRetry={onRetry}
        onSelectGame={handleSelectGame}
      />
      <InfoSection />
    </main>
  );
}
