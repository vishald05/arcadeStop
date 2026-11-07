import { apiFetch } from './api.js';

/**
 * Retrieve existing record for a browser ID in Number Ninja.
 * Returns null (not throws) if no record exists (404).
 */
export async function getRecord(browserId) {
  try {
    return await apiFetch(`/number-ninja/records/${browserId}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Submit a completed Number Ninja session.
 * @param {string} browserId
 * @param {{ sessionId: string, won: boolean, guessesUsed: number }} sessionData
 * @returns {Promise<object>} NumberNinjaRecordDto
 */
export async function submitSession(browserId, sessionData) {
  return await apiFetch(`/number-ninja/records/${browserId}`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}
