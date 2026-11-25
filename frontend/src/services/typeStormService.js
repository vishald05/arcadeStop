import { apiFetch } from './api.js';

/**
 * Retrieve existing record for a browser ID in TypeStorm.
 * Returns null (does not throw) if no record exists (404).
 */
export async function getRecord(browserId) {
  try {
    return await apiFetch(`/type-storm/records/${browserId}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Submit a completed TypeStorm session.
 * @param {string} browserId
 * @param {{
 *   sessionId: string,
 *   durationSeconds: number,
 *   correctCharacters: number,
 *   incorrectCharacters: number,
 *   totalCharactersTyped: number,
 *   elapsedSeconds: number,
 *   clientWpm?: number,
 *   clientAccuracy?: number
 * }} sessionData
 * @returns {Promise<object>} TypeStormRecordDto
 */
export async function submitSession(browserId, sessionData) {
  return await apiFetch(`/type-storm/records/${browserId}`, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}

/**
 * Retrieve paginated session history for a browser ID in TypeStorm.
 * @param {string} browserId
 * @param {number} [page=0]
 * @param {number} [size=10]
 * @returns {Promise<object>} PagedResponseDto<TypeStormSessionDto>
 */
export async function getSessionHistory(browserId, page = 0, size = 10) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size)
  });
  return await apiFetch(`/type-storm/records/${encodeURIComponent(browserId)}/sessions?${params.toString()}`);
}
