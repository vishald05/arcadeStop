import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedGames from '../components/FeaturedGames';
import ArcadeCTA from '../components/ArcadeCTA';

export default function Home({ games, loading, error, onRetry, onNotify }) {
  const navigate = useNavigate();

  const handleSelectGame = (game) => {
    if (game.status === 'AVAILABLE') {
      navigate(`/games/${game.slug}`);
    } else if (onNotify) {
      onNotify({
        title: game.name || game.title,
        message: game.comingSoonMessage || 'Game is coming soon!'
      });
    }
  };

  return (
    <main className="main-content">
      <Hero />
      <FeaturedGames 
        games={games}
        loading={loading}
        error={error}
        onRetry={onRetry}
        onSelectGame={handleSelectGame}
      />
      <ArcadeCTA />
    </main>
  );
}
