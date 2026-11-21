import { apiFetch } from './api.js';

/**
 * Retrieve existing record for a browser ID in Whack Attack.
 * Returns null (does not throw) if no record exists (404).
 */
export async function getRecord(browserId) {
  try {
    return await apiFetch(`/whack-attack/records/${browserId}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Submit a completed Whack Attack session.
 * @param {string} browserId
 * @param {{
 *   sessionId: string,
 *   durationSeconds: number,
 *   score: number,
 *   hits: number,
 *   misses: number,
 *   emptyClicks: number,
 *   bestCombo: number,
 *   elapsedSeconds: number
 * }} sessionData
 * @returns {Promise<object>} WhackAttackRecordDto
 */
export async function submitSession(browserId, sessionData) {
  return await apiFetch(`/whack-attack/records/${browserId}`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}
