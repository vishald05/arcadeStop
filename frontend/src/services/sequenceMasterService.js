import { apiFetch } from './api.js';

/**
 * Retrieve personal statistics overview for all difficulties in Sequence Master.
 */
export async function getOverview(browserId) {
  try {
    return await apiFetch(`/sequence-master/records/${browserId}`);
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
    return await apiFetch(`/sequence-master/records/${browserId}/${difficulty.toUpperCase()}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Submit a completed Sequence Master session.
 * @param {string} browserId
 * @param {{
 *   sessionId: string,
 *   difficulty: string,
 *   score: number,
 *   highestSequenceLength: number,
 *   completedRounds: number,
 *   totalCorrectTiles: number,
 *   elapsedSeconds: number
 * }} sessionData
 * @returns {Promise<object>} SequenceMasterRecordDto
 */
export async function submitSession(browserId, sessionData) {
  return await apiFetch(`/sequence-master/records/${browserId}`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}
