import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/gameService';

export function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gameService.getAllGames();
      setGames(data);
    } catch (err) {
      console.error('Failed to load games catalog:', err);
      setError(err.message || 'Unable to connect to the game server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    refetch: fetchGames
  };
}
