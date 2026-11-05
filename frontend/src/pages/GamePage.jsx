import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactionRushGame from '../games/ReactionRush/ReactionRushGame';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function GamePage({ games, loading, error }) {
  const { slug } = useParams();

  if (loading) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading game...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Could not load game data.</p>
          <Link to="/arcade" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Back to Arcade</Link>
        </div>
      </main>
    );
  }

  const game = games.find(g => g.slug === slug);

  if (!game || game.status !== 'AVAILABLE') {
    return (
      <main className="main-content">
        <div className="app-container" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '0.75rem' }}>Game Not Available</h2>
            <p style={{ marginBottom: '2rem' }}>{game ? `${game.name} is coming soon!` : 'That game does not exist.'}</p>
            <Link to="/arcade" className="btn btn-primary">
              <ArrowLeft size={16} />
              Back to Arcade
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (slug === 'reaction-rush') {
    return <ReactionRushGame game={game} />;
  }

  return (
    <main className="main-content">
      <div className="app-container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <p>{game.name} gameplay coming soon.</p>
        <Link to="/arcade" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Back to Arcade</Link>
      </div>
    </main>
  );
}
