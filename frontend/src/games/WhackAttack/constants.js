export const DURATIONS = [
  {
    seconds: 30,
    label: '30s — Quick Attack',
    title: 'Quick Attack',
    description: 'High intensity 30-second reflex sprint. Test rapid target acquisition.'
  },
  {
    seconds: 60,
    label: '60s — Survival',
    title: 'Survival',
    description: 'Extended 60-second endurance challenge with escalating tempo.'
  }
];

export const DEFAULT_DURATION = 30;

export const STATES = {
  IDLE: 'IDLE',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

export const GRID_SIZE = 9; // 3x3 positions (indices 0..8)

export const BASE_HIT_SCORE = 10;

/**
 * Calculate combo bonus for a given combo streak.
 * Transparent and balanced:
 * Combo 1: 0 bonus
 * Combo 2: +2 bonus
 * Combo 3: +4 bonus
 * Combo 4: +6 bonus
 * Combo 5: +8 bonus
 * Combo 6+: +10 bonus (capped)
 */
export function getComboBonus(combo) {
  if (!combo || combo < 2) return 0;
  return Math.min((combo - 1) * 2, 10);
}

/**
 * Calculate score for a hit at current combo.
 */
export function calculateHitScore(combo) {
  return BASE_HIT_SCORE + getComboBonus(combo);
}

/**
 * Calculate accuracy percentage based on successful hits, missed targets, and empty clicks.
 * Handle zero attempts safely.
 */
export function calculateAccuracy(hits, misses, emptyClicks) {
  const safeHits = Math.max(0, Number(hits) || 0);
  const safeMisses = Math.max(0, Number(misses) || 0);
  const safeEmptyClicks = Math.max(0, Number(emptyClicks) || 0);
  const total = safeHits + safeMisses + safeEmptyClicks;
  if (total === 0) return 0.0;
  return Math.round(((safeHits / total) * 100.0) * 10) / 10;
}

/**
 * Difficulty Progression:
 * Computes target visible duration and spawn delay based on elapsed gameplay time.
 * Controlled difficulty with sensible minimum limits so the game remains playable.
 */
export function getDifficultyParams(elapsedSeconds, totalDuration = 30) {
  const safeTotal = totalDuration > 0 ? totalDuration : 30;
  const progress = Math.min(1.0, Math.max(0.0, elapsedSeconds / safeTotal));

  // Determine starting and ending thresholds based on mode
  const initialVisibleMs = totalDuration >= 60 ? 1200 : 1100;
  const minVisibleMs = totalDuration >= 60 ? 450 : 500;
  const initialDelayMs = totalDuration >= 60 ? 300 : 280;
  const minDelayMs = totalDuration >= 60 ? 100 : 120;

  const visibleDurationMs = Math.round(initialVisibleMs - progress * (initialVisibleMs - minVisibleMs));
  const spawnDelayMs = Math.round(initialDelayMs - progress * (initialDelayMs - minDelayMs));

  return {
    visibleDurationMs,
    spawnDelayMs,
    progress
  };
}

/**
 * Pick next target position (0..8) avoiding immediate repeat of current position.
 */
export function getNextTargetPosition(currentPosition, totalPositions = GRID_SIZE) {
  const positions = [];
  for (let i = 0; i < totalPositions; i++) {
    if (i !== currentPosition) {
      positions.push(i);
    }
  }
  if (positions.length === 0) return 0;
  const randomIndex = Math.floor(Math.random() * positions.length);
  return positions[randomIndex];
}

/**
 * Performance evaluation tiers
 */
export function getPerformanceTier(score, accuracy, hits) {
  if (score >= 400 || (score >= 320 && accuracy >= 90)) {
    return {
      tier: 'Legendary',
      badge: 'S Rank',
      color: '#F59E0B',
      message: 'Lightning-fast instincts! You dominated the grid with pinpoint accuracy and massive combos.'
    };
  }
  if (score >= 260 || (score >= 200 && accuracy >= 85)) {
    return {
      tier: 'Master Striker',
      badge: 'A Rank',
      color: '#FB923C',
      message: 'Impressive reflexes! Your reaction timing and rhythm kept the board completely under control.'
    };
  }
  if (score >= 160) {
    return {
      tier: 'Sharp Whacker',
      badge: 'B Rank',
      color: '#34D399',
      message: 'Solid arcade performance! Good timing with strong accuracy across the session.'
    };
  }
  if (score >= 80) {
    return {
      tier: 'Proficient',
      badge: 'C Rank',
      color: '#60A5FA',
      message: 'Good effort! Keep practicing to build longer streaks and minimize missed targets.'
    };
  }
  return {
    tier: 'Rookie Whacker',
    badge: 'D Rank',
    color: '#A78BFA',
    message: 'Warm-up complete! Focus on the center of the board and strike as soon as targets light up.'
  };
}
