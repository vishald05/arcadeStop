import { apiFetch } from './api.js';

/**
 * Retrieve personal statistics overview for all difficulties in Memory Madness.
 */
export async function getOverview(browserId) {
  try {
    return await apiFetch(`/memory-madness/records/${browserId}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Retrieve personal statistics for a specific difficulty (EASY, MEDIUM, HARD).
 */
export async function getRecord(browserId, difficulty) {
  try {
    return await apiFetch(`/memory-madness/records/${browserId}/${difficulty.toUpperCase()}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Submit a completed Memory Madness session.
 * @param {string} browserId
 * @param {{
 *   sessionId: string,
 *   difficulty: string,
 *   score: number,
 *   completionTimeSeconds: number,
 *   totalMoves: number,
 *   matchedPairs: number,
 *   mismatchedAttempts: number,
 *   accuracy: number
 * }} sessionData
 * @returns {Promise<object>} MemoryMadnessRecordDto
 */
export async function submitSession(browserId, sessionData) {
  return await apiFetch(`/memory-madness/records/${browserId}`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}

/**
 * Retrieve paginated session history for a browser ID in Memory Madness.
 * @param {string} browserId
 * @param {string} [difficulty] - Optional difficulty filter ('EASY', 'MEDIUM', 'HARD')
 * @param {number} [page=0]
 * @param {number} [size=10]
 * @returns {Promise<object>} PagedResponseDto<MemoryMadnessSessionDto>
 */
export async function getSessionHistory(browserId, difficulty, page = 0, size = 10) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size)
  });
  if (difficulty && typeof difficulty === 'string' && difficulty.trim()) {
    params.set('difficulty', difficulty.trim().toUpperCase());
  }
  return await apiFetch(`/memory-madness/records/${encodeURIComponent(browserId)}/sessions?${params.toString()}`);
}
