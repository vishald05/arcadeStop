import React, { useState } from 'react';
import GameCard from './GameCard';
import { GAMES, CATEGORIES } from '../data/games';
import { Gamepad2 } from 'lucide-react';

export default function GameGrid({ 
  onSelectGame, 
  title = "Pick Your Next Game", 
  subtitle = "Quick games. Endless retries. One more round.",
  showFilter = true,
  sectionId = "games-collection"
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredGames = selectedCategory === 'All'
    ? GAMES
    : GAMES.filter(game => game.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id={sectionId} className="section collection-section" aria-labelledby="collection-title">
      <div className="app-container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Gamepad2 size={14} />
            <span>Game Library</span>
          </div>
          <h2 id="collection-title" className="section-title">
            {title}
          </h2>
          <p className="section-description">
            {subtitle}
          </p>
        </div>

        {/* Category Filters (Optional / Switchable) */}
        {showFilter && (
          <div className="collection-toolbar" role="tablist" aria-label="Game categories">
            {CATEGORIES.map(category => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                className={`filter-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Games Grid */}
        <div className="games-grid">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={onSelectGame}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
