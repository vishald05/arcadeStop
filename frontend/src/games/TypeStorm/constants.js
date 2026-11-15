export const DURATIONS = [
  {
    seconds: 15,
    label: '15s',
    name: 'Quick Burst',
    tag: 'Sprint',
    description: 'Fast-paced lightning reflex sprint.'
  },
  {
    seconds: 30,
    label: '30s',
    name: 'Standard',
    tag: 'Default',
    description: 'The classic balance of speed and precision.'
  },
  {
    seconds: 60,
    label: '60s',
    name: 'Endurance',
    tag: 'Marathon',
    description: 'A deep test of focus, stamina, and consistency.'
  }
];

export const DEFAULT_DURATION = 30;

export const STATES = {
  IDLE: 'IDLE',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

export const PASSAGES = [
  "In the golden age of coin-operated arcades, dimly lit halls echoed with the sounds of synthesizers, mechanical clicks, and triumphant cheers. Players stood shoulder to shoulder, pumping quarters into towering wooden cabinets while chasing digital high scores.",
  "Neon glow illuminated the rain-slicked city streets as rogue hackers tapped frantically into mainframe terminals. Every keystroke was a calculated risk against the ticking security clocks of corporate cyberspace, searching for hidden keys buried deep in the network.",
  "Lightning danced across the storm-tossed horizon, casting stark shadows against the weathered stone tower. High above the roaring waves, an old lighthouse keeper kept watch over the perilous strait, guided only by the rhythmic pulse of a solitary revolving beam.",
  "Deep within the labyrinth of space station corridors, silent automated drones patrolled gleaming titanium tunnels. Star clusters burned brightly through heavy observation ports, cold reminders of the vast distances separating travelers from their home world.",
  "The hum of cooling fans signaled another compiler run as the terminal window flashed with anticipation. Clean syntax and elegant algorithms transformed abstract logic into executable art, turning raw ideas into interactive worlds that defied imagination.",
  "Through dense digital circuits and microscopic pathways, pulses of energy raced faster than thought itself. Memory registers held fleeting secrets while processors executed billions of instructions in the blink of a human eye.",
  "Every champion typist understands that speed without precision is merely noise. True mastery comes from steady rhythm, relaxed hands, and a mind that reads entire sentences ahead while fingers glide effortlessly across mechanical switches.",
  "Retro computers greeted their pilots with warm amber phosphor screens and loud tactile keyboards that demanded decisive inputs. There was no auto-complete or AI assistance, just raw typing prowess and the satisfying clatter of keyed switches.",
  "A quiet hush fell over the gaming arena as the championship timer began its relentless countdown. Fingers hovered motionless above custom mechanical keycaps, waiting for the starting green signal before bursting into rapid rhythmic motion.",
  "Beneath the ocean surface, ancient hydrothermal vents whispered secrets of forgotten geological eras. Robotic submersibles navigated through crystal-clear abyssal depths, logging telemetric data back to scientists observing safely from research vessels above."
];

/**
 * Returns a random passage, avoiding the immediate previous passage if possible.
 */
export function getRandomPassage(exclude = null) {
  const filtered = PASSAGES.filter(p => p !== exclude);
  const pool = filtered.length > 0 ? filtered : PASSAGES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/**
 * Conventional WPM formula: (correct characters / 5) / elapsed minutes
 * Returns rounded integer.
 */
export function calculateWpm(correctChars, elapsedSeconds) {
  if (!elapsedSeconds || elapsedSeconds <= 0.1 || !correctChars || correctChars <= 0) {
    return 0;
  }
  const elapsedMinutes = elapsedSeconds / 60.0;
  return Math.round((correctChars / 5.0) / elapsedMinutes);
}

/**
 * Accuracy formula: (correct characters / total characters typed) * 100
 * Returns number with 1 decimal place.
 */
export function calculateAccuracy(correctChars, totalTyped) {
  if (!totalTyped || totalTyped <= 0) {
    return 100.0;
  }
  const acc = (correctChars / totalTyped) * 100.0;
  return Math.round(acc * 10.0) / 10.0;
}

/**
 * Returns performance evaluation message and tier based on WPM.
 */
export function getPerformanceTier(wpm) {
  if (wpm >= 110) {
    return {
      tier: 'Legendary',
      color: '#EC4899', // Pink / Rose
      badge: 'Lightning Storm',
      message: 'Unbelievable speed! You sliced through the passage like an arcade legend.'
    };
  }
  if (wpm >= 85) {
    return {
      tier: 'Master',
      color: '#8B5CF6', // Purple
      badge: 'Typing Wizard',
      message: 'Sensational pace! Outstanding keyboard dexterity and fluid flow.'
    };
  }
  if (wpm >= 65) {
    return {
      tier: 'Swift',
      color: '#3B82F6', // Blue
      badge: 'Speed Demon',
      message: 'Above average typing speed! Sharp rhythm and solid accuracy.'
    };
  }
  if (wpm >= 45) {
    return {
      tier: 'Proficient',
      color: '#10B981', // Emerald
      badge: 'Steady Cruiser',
      message: 'Solid and steady! Great control and respectable typing cadence.'
    };
  }
  return {
    tier: 'Novice',
    color: '#F59E0B', // Amber
    badge: 'Booting Up',
    message: 'Good foundation! Keep practicing to build muscle memory and rhythm.'
  };
}
