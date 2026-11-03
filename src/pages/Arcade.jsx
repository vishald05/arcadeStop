import React from 'react';
import GameGrid from '../components/GameGrid';
import { Sparkles, Gamepad2 } from 'lucide-react';

export default function Arcade({ onNotify }) {
  const handleSelectGame = (game) => {
    if (onNotify) {
      onNotify({
        title: game.title,
        message: game.comingSoonMessage
      });
    }
  };

  return (
    <main className="main-content" style={{ paddingTop: '2.5rem' }}>
      <GameGrid 
        onSelectGame={handleSelectGame}
        title="Arcade Collection"
        subtitle="Browse all mini-games, filter by your favorite genre, and get ready to challenge yourself."
        showFilter={true}
        sectionId="arcade-page-collection"
      />
    </main>
  );
}
