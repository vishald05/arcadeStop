import { apiFetch } from './api.js';

/**
 * Retrieve existing record for a browser ID.
 * Returns null (not throws) if no record exists (404).
 */
export async function getRecord(browserId) {
  try {
    return await apiFetch(`/reaction-rush/records/${browserId}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Submit a completed 5-attempt session.
 * @param {string} browserId
 * @param {number[]} reactionTimes - exactly 5 integers in ms
 * @returns {Promise<object>} ReactionRushRecordDto
 */
export async function submitSession(browserId, reactionTimes) {
  return await apiFetch(`/reaction-rush/records/${browserId}`, {
    method: 'POST',
    body: JSON.stringify({ reactionTimes }),
  });
}
