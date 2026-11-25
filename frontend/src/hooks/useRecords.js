import { useState, useEffect, useCallback, useRef } from 'react';
import { getRecordsOverview } from '../services/recordsService.js';
import { getBrowserId } from '../utils/browserId.js';

/**
 * Custom React hook for retrieving and refreshing unified arcade records.
 *
 * @param {string} [customBrowserId] - Optional override for browser ID.
 * @returns {{
 *   data: { summary: object, games: object } | null,
 *   loading: boolean,
 *   error: string | null,
 *   refresh: () => Promise<void>
 * }}
 */
export function useRecords(customBrowserId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    const targetBrowserId = customBrowserId || getBrowserId();

    try {
      const result = await getRecordsOverview(targetBrowserId);
      if (isMountedRef.current) {
        if (result.summary.status === 'COMPLETE_FAILURE') {
          setError(result.summary.errorMessage || 'Unable to retrieve game records from the server.');
        } else {
          setError(null);
        }
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to fetch arcade records:', err);
        setError(err.message || 'Failed to retrieve arcade records.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [customBrowserId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRecords();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchRecords]);

  return {
    data,
    loading,
    error,
    refresh: fetchRecords
  };
}
