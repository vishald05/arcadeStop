import {
  Zap,
  Hash,
  Keyboard,
  Target,
  Brain,
  Sparkles,
  Gamepad2
} from 'lucide-react';

/**
 * Format elapsed seconds as MM:SS (e.g. 01:24).
 * Returns '--' if value is null, undefined, or negative.
 */
export function formatTime(seconds) {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '--';
  }
  const safe = Math.floor(seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Format reaction time in milliseconds.
 * Returns '--' if null or undefined.
 */
export function formatMs(ms) {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return '--';
  }
  return `${Math.round(ms)} ms`;
}

/**
 * Format percentage to 1 decimal place.
 * Returns '--' if null or undefined.
 */
export function formatPercent(percent) {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '--';
  }
  return `${Number(percent).toFixed(1)}%`;
}

/**
 * Format numeric score with locale commas.
 * Returns '--' if null or undefined.
 */
export function formatScore(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '--';
  }
  return Number(num).toLocaleString();
}

/**
 * Game metadata mapping by slug/id.
 */
export const GAME_METADATA = {
  'reaction-rush': {
    category: 'Reflex',
    vibe: 'Speed & Focus',
    icon: Zap,
    description: 'Test your raw human reflex speed against visual stimuli.'
  },
  'number-ninja': {
    category: 'Logic',
    vibe: 'Deduction & Math',
    icon: Hash,
    description: 'Deduce secret numbers within 7 strategic attempts.'
  },
  'type-storm': {
    category: 'Skill',
    vibe: 'WPM & Accuracy',
    icon: Keyboard,
    description: 'Measure typing speed, accuracy, and burst velocity.'
  },
  'whack-attack': {
    category: 'Arcade',
    vibe: 'Speed & Precision',
    icon: Target,
    description: 'Hit fleeting grid targets before they vanish into thin air.'
  },
  'sequence-master': {
    category: 'Memory',
    vibe: 'Sequence Recall',
    icon: Brain,
    description: 'Memorize and reproduce progressively expanding light sequences.'
  },
  'memory-madness': {
    category: 'Memory',
    vibe: 'Card Matching',
    icon: Sparkles,
    description: 'Flip, match pairs, and conquer multi-difficulty card grids.'
  }
};

export function getGameMeta(id) {
  return GAME_METADATA[id] || {
    category: 'Arcade',
    vibe: 'Quick Challenge',
    icon: Gamepad2,
    description: 'Challenge your mind and reflexes in the arcade.'
  };
}
