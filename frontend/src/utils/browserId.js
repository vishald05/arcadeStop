const STORAGE_KEY = 'arcadestop_reaction_rush_browser_id';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create a persistent anonymous browser ID for Reaction Rush.
 * Stored in localStorage. Returns a UUID string.
 * Never throws - returns a session-only UUID on localStorage failure.
 */
export function getBrowserId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (id && isValidUUID(id)) {
      return id;
    }
    id = generateUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage unavailable or corrupted
    return generateUUID();
  }
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
