export const MAX_ATTEMPTS = 7;
export const MIN_NUMBER = 1;
export const MAX_NUMBER = 100;

export const STATES = {
  IDLE: 'IDLE',
  PLAYING: 'PLAYING',
  WON: 'WON',
  LOST: 'LOST',
};

/**
 * Generate a cryptographically secure (or pseudo-random fallback) integer between min and max inclusive.
 */
export function generateSecretNumber(min = MIN_NUMBER, max = MAX_NUMBER) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const range = max - min + 1;
    return min + (array[0] % range);
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
