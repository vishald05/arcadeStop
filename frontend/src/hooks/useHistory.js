import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getHistoryOverview,
  fetchGameSessionPage,
  mergeGameSessionPage,
  resolveGame
} from '../services/historyService.js';
import { getBrowserId } from '../utils/browserId.js';

/**
 * Custom React hook for retrieving, refreshing, and paginating arcade session history.
 *
 * @param {string} [customBrowserId] - Optional override for browser ID.
 * @param {number} [initialPageSize=10] - Number of sessions to fetch per game initially.
 * @returns {{
 *   data: object | null,
 *   loading: boolean,
 *   error: string | null,
 *   isPartiallyLoaded: boolean,
 *   refresh: () => Promise<void>,
 *   loadMore: (gameKeyOrId: string, difficulty?: string) => Promise<void>,
 *   loadingMore: Record<string, boolean>,
 *   gameErrors: Record<string, string>
 * }}
 */
export function useHistory(customBrowserId, initialPageSize = 10) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState({});
  const [gameErrors, setGameErrors] = useState({});

  const isMountedRef = useRef(true);
  const loadingMoreRef = useRef({});

  const targetBrowserId = customBrowserId || getBrowserId();

  // ── Initial Fetch & Refresh ──
  const fetchInitialHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGameErrors({});

    try {
      const result = await getHistoryOverview(targetBrowserId, initialPageSize);
      if (isMountedRef.current) {
        if (result.status === 'COMPLETE_FAILURE') {
          setError('Failed to retrieve gameplay history from all game services.');
        } else {
          setError(null);
        }

        // Populate per-game errors
        const errorsMap = {};
        for (const err of (result.errors || [])) {
          errorsMap[err.game] = err.error;
        }
        setGameErrors(errorsMap);
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to fetch arcade session history:', err);
        setError(err.message || 'Failed to retrieve session history.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [targetBrowserId, initialPageSize]);

  // ── Lifecycle on Mount ──
  useEffect(() => {
    isMountedRef.current = true;
    fetchInitialHistory();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchInitialHistory]);

  // ── Load More Sessions for an Individual Game ──
  const loadMore = useCallback(async (gameKeyOrId, difficulty = null) => {
    const game = resolveGame(gameKeyOrId);
    if (!game) return;

    // Prevent duplicate concurrent requests for the same game
    if (loadingMoreRef.current[game.key]) {
      return;
    }

    if (!data || !data.games || !data.games[game.key]) {
      return;
    }

    const gameData = data.games[game.key];
    const pagination = gameData.pagination;

    // If already on the last page, no need to request further
    if (pagination && !pagination.hasNext) {
      return;
    }

    const nextPage = pagination ? pagination.currentPage + 1 : 1;
    const pageSize = pagination ? pagination.pageSize : initialPageSize;

    loadingMoreRef.current[game.key] = true;
    if (isMountedRef.current) {
      setLoadingMore(prev => ({ ...prev, [game.key]: true }));
    }

    try {
      const pageResult = await fetchGameSessionPage(
        targetBrowserId,
        game.key,
        nextPage,
        pageSize,
        difficulty
      );

      if (isMountedRef.current) {
        setData(prevData => mergeGameSessionPage(prevData, game.key, pageResult));
        setGameErrors(prev => {
          const next = { ...prev };
          delete next[game.key];
          return next;
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error(`Failed to load additional sessions for ${game.name}:`, err);
        const errorMsg = err.message || `Failed to load page ${nextPage}`;
        // Preserve existing data, record error
        setGameErrors(prev => ({ ...prev, [game.key]: errorMsg }));
        setData(prevData => mergeGameSessionPage(prevData, game.key, { error: errorMsg }));
      }
    } finally {
      loadingMoreRef.current[game.key] = false;
      if (isMountedRef.current) {
        setLoadingMore(prev => ({ ...prev, [game.key]: false }));
      }
    }
  }, [data, targetBrowserId, initialPageSize]);

  return {
    data,
    loading,
    error,
    isPartiallyLoaded: Boolean(data?.isPartiallyLoaded),
    refresh: fetchInitialHistory,
    loadMore,
    loadingMore,
    gameErrors
  };
}
