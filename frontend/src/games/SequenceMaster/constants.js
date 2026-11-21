export const DIFFICULTIES = [
  {
    id: 'EASY',
    label: 'Easy',
    gridSize: 2,
    totalTiles: 4,
    badgeText: '2×2 Grid',
    description: '4 interactive tiles. Relaxed sequence playback pace, ideal for beginners.'
  },
  {
    id: 'MEDIUM',
    label: 'Medium',
    gridSize: 4,
    totalTiles: 16,
    badgeText: '4×4 Grid',
    description: '16 interactive tiles. Moderately faster playback and deeper spatial recall.'
  },
  {
    id: 'HARD',
    label: 'Hard',
    gridSize: 6,
    totalTiles: 36,
    badgeText: '6×6 Grid',
    description: '36 interactive tiles. Fast playback across a dense grid for true memory masters.'
  }
];

export const DEFAULT_DIFFICULTY = 'EASY';

export const STATES = {
  IDLE: 'IDLE',
  PLAYING_SEQUENCE: 'PLAYING_SEQUENCE',
  PLAYER_INPUT: 'PLAYER_INPUT',
  ROUND_SUCCESS: 'ROUND_SUCCESS',
  GAME_OVER: 'GAME_OVER'
};

/**
 * Calculate score awarded for completing round `roundNumber` (1-indexed).
 * Round 1: 100 points
 * Round 2: 110 points (+10 bonus per additional step beyond first)
 * Round 3: 120 points
 * ...
 */
export function calculateRoundScore(roundNumber) {
  if (!roundNumber || roundNumber < 1) return 0;
  return 100 + (roundNumber - 1) * 10;
}

/**
 * Calculate total cumulative score for completing `completedRounds` rounds.
 * Sum_{i=1..N} (100 + 10*(i-1)) = 100*N + 5*N*(N-1)
 */
export function calculateTotalScore(completedRounds) {
  const n = Math.max(0, Number(completedRounds) || 0);
  if (n === 0) return 0;
  return (100 * n) + (5 * n * (n - 1));
}

/**
 * Controlled Sequence Playback Timings:
 * Gradually decreases illumination time and gap as sequence length increases.
 * Adheres strictly to difficulty targets and sensible minimum limits.
 */
export function getPlaybackTimings(difficultyId, sequenceLength = 1) {
  const diff = (difficultyId || 'EASY').toUpperCase();
  const step = Math.max(0, sequenceLength - 1);

  if (diff === 'HARD') {
    // Hard: starts ~280ms illumination, 150ms gap. Min: 140ms, 70ms.
    const illuminationMs = Math.max(140, Math.round(280 - step * 14));
    const gapMs = Math.max(70, Math.round(150 - step * 8));
    return { illuminationMs, gapMs };
  }

  if (diff === 'MEDIUM') {
    // Medium: starts ~350ms illumination, 200ms gap. Min: 180ms, 90ms.
    const illuminationMs = Math.max(180, Math.round(350 - step * 18));
    const gapMs = Math.max(90, Math.round(200 - step * 10));
    return { illuminationMs, gapMs };
  }

  // Easy: starts ~450ms illumination, 250ms gap. Min: 250ms, 120ms.
  const illuminationMs = Math.max(250, Math.round(450 - step * 20));
  const gapMs = Math.max(120, Math.round(250 - step * 12));
  return { illuminationMs, gapMs };
}

/**
 * Get distinct tile color and glow properties based on grid size and tile index.
 */
export function getTileStyle(tileIndex, gridSize, isActive, isFailed) {
  if (isFailed) {
    return {
      '--tile-base': '#EF4444',
      '--tile-active': '#F87171',
      '--tile-glow': 'rgba(239, 68, 68, 0.85)'
    };
  }

  if (gridSize === 2) {
    // Iconic 4-quadrant arcade palette
    const colors = [
      { base: '#10B981', active: '#34D399', glow: 'rgba(52, 211, 153, 0.8)' }, // Emerald Green
      { base: '#EF4444', active: '#F87171', glow: 'rgba(248, 113, 113, 0.8)' }, // Coral Red
      { base: '#F59E0B', active: '#FCD34D', glow: 'rgba(245, 158, 11, 0.8)' }, // Amber Yellow
      { base: '#3B82F6', active: '#60A5FA', glow: 'rgba(59, 130, 246, 0.8)' }  // Royal Blue
    ];
    const c = colors[tileIndex % colors.length];
    return {
      '--tile-base': c.base,
      '--tile-active': c.active,
      '--tile-glow': c.glow
    };
  }

  // 4x4 and 6x6: Mathematically generated cohesive rainbow spectrum
  const totalTiles = gridSize * gridSize;
  const hue = Math.round((tileIndex * 360) / totalTiles);
  const baseColor = `hsl(${hue}, 70%, 46%)`;
  const activeColor = `hsl(${hue}, 90%, 68%)`;
  const glowColor = `hsla(${hue}, 90%, 65%, 0.85)`;

  return {
    '--tile-base': baseColor,
    '--tile-active': activeColor,
    '--tile-glow': glowColor
  };
}

/**
 * Performance evaluation tier based on completed rounds and difficulty.
 */
export function getPerformanceTier(completedRounds, difficultyId) {
  const diff = (difficultyId || 'EASY').toUpperCase();
  const rounds = Number(completedRounds) || 0;

  // Thresholds adjusted by difficulty
  const sThresh = diff === 'HARD' ? 8 : diff === 'MEDIUM' ? 10 : 12;
  const aThresh = diff === 'HARD' ? 6 : diff === 'MEDIUM' ? 7 : 9;
  const bThresh = diff === 'HARD' ? 4 : diff === 'MEDIUM' ? 5 : 6;
  const cThresh = diff === 'HARD' ? 2 : diff === 'MEDIUM' ? 3 : 3;

  if (rounds >= sThresh) {
    return {
      tier: 'Sequence Virtuoso',
      badge: 'S Rank',
      color: '#F59E0B',
      message: 'Phenomenal photographic memory! You conquered deep sequences with flawless precision.'
    };
  }
  if (rounds >= aThresh) {
    return {
      tier: 'Memory Master',
      badge: 'A Rank',
      color: '#A78BFA',
      message: 'Outstanding recall ability! Your visual retention and pattern tracking were top tier.'
    };
  }
  if (rounds >= bThresh) {
    return {
      tier: 'Pattern Adept',
      badge: 'B Rank',
      color: '#34D399',
      message: 'Great mental focus! You navigated tricky transitions and maintained a solid rhythm.'
    };
  }
  if (rounds >= cThresh) {
    return {
      tier: 'Memory Explorer',
      badge: 'C Rank',
      color: '#60A5FA',
      message: 'Solid effort! Warm up your visual memory and aim for a double-digit sequence next.'
    };
  }
  return {
    tier: 'Novice Recall',
    badge: 'D Rank',
    color: '#9CA3AF',
    message: 'Good practice round! Take a deep breath, watch the sequence rhythm, and try again.'
  };
}
