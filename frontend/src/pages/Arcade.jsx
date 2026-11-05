import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameGrid from '../components/GameGrid';

export default function Arcade({ games, loading, error, onRetry, onNotify }) {
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
    <main className="main-content" style={{ paddingTop: '2.5rem' }}>
      <GameGrid 
        games={games}
        loading={loading}
        error={error}
        onRetry={onRetry}
        onSelectGame={handleSelectGame}
        title="Arcade Collection"
        subtitle="Browse all mini-games, filter by your favorite genre, and get ready to challenge yourself."
        showFilter={true}
        sectionId="arcade-page-collection"
      />
    </main>
  );
}
