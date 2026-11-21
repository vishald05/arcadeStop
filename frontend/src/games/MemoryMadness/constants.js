import {
  Zap,
  Target,
  Brain,
  Flame,
  Trophy,
  Sparkles,
  Star,
  Heart,
  Crown,
  Moon,
  Sun,
  Compass,
  Anchor,
  Key,
  Bell,
  Gift,
  Music,
  Feather,
  Gem,
  Rocket,
  Ghost,
  Coffee,
  Globe,
  Cloud,
  Umbrella,
  Shield,
  Flag,
  Eye,
  Smile,
  Gamepad2,
  Camera,
  Dice5
} from 'lucide-react';

export const DIFFICULTIES = [
  {
    id: 'EASY',
    label: 'Easy',
    gridSize: 4,
    totalCards: 16,
    totalPairs: 8,
    badgeText: '4×4 Grid',
    targetSeconds: 60,
    description: '16 cards (8 pairs). Spacious layout and rapid matching, ideal for a quick warmup.'
  },
  {
    id: 'MEDIUM',
    label: 'Medium',
    gridSize: 6,
    totalCards: 36,
    totalPairs: 18,
    badgeText: '6×6 Grid',
    targetSeconds: 180,
    description: '36 cards (18 pairs). Balanced density requiring sharper visual retention.'
  },
  {
    id: 'HARD',
    label: 'Hard',
    gridSize: 8,
    totalCards: 64,
    totalPairs: 32,
    badgeText: '8×8 Grid',
    targetSeconds: 360,
    description: '64 cards (32 pairs). Master-level grid demanding peak spatial memory.'
  }
];

export const DEFAULT_DIFFICULTY = 'EASY';

export const STATES = {
  IDLE: 'IDLE',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

// 32 Distinct symbols with icons and vibrant color signatures
export const SYMBOL_POOL = [
  { id: 0, name: 'Lightning', icon: Zap, color: '#F59E0B' },
  { id: 1, name: 'Target', icon: Target, color: '#EF4444' },
  { id: 2, name: 'Brain', icon: Brain, color: '#60A5FA' },
  { id: 3, name: 'Flame', icon: Flame, color: '#F97316' },
  { id: 4, name: 'Trophy', icon: Trophy, color: '#EAB308' },
  { id: 5, name: 'Sparkles', icon: Sparkles, color: '#A855F7' },
  { id: 6, name: 'Star', icon: Star, color: '#FBBF24' },
  { id: 7, name: 'Heart', icon: Heart, color: '#EC4899' },
  { id: 8, name: 'Crown', icon: Crown, color: '#FCD34D' },
  { id: 9, name: 'Moon', icon: Moon, color: '#818CF8' },
  { id: 10, name: 'Sun', icon: Sun, color: '#F59E0B' },
  { id: 11, name: 'Compass', icon: Compass, color: '#14B8A6' },
  { id: 12, name: 'Anchor', icon: Anchor, color: '#06B6D4' },
  { id: 13, name: 'Key', icon: Key, color: '#D97706' },
  { id: 14, name: 'Bell', icon: Bell, color: '#E11D48' },
  { id: 15, name: 'Gift', icon: Gift, color: '#8B5CF6' },
  { id: 16, name: 'Music', icon: Music, color: '#10B981' },
  { id: 17, name: 'Feather', icon: Feather, color: '#38BDF8' },
  { id: 18, name: 'Gem', icon: Gem, color: '#C084FC' },
  { id: 19, name: 'Rocket', icon: Rocket, color: '#F43F5E' },
  { id: 20, name: 'Ghost', icon: Ghost, color: '#94A3B8' },
  { id: 21, name: 'Coffee', icon: Coffee, color: '#B45309' },
  { id: 22, name: 'Globe', icon: Globe, color: '#3B82F6' },
  { id: 23, name: 'Cloud', icon: Cloud, color: '#64748B' },
  { id: 24, name: 'Umbrella', icon: Umbrella, color: '#0284C7' },
  { id: 25, name: 'Shield', icon: Shield, color: '#4ADE80' },
  { id: 26, name: 'Flag', icon: Flag, color: '#FB7185' },
  { id: 27, name: 'Eye', icon: Eye, color: '#2DD4BF' },
  { id: 28, name: 'Smile', icon: Smile, color: '#FACC15' },
  { id: 29, name: 'Gamepad', icon: Gamepad2, color: '#A78BFA' },
  { id: 30, name: 'Camera', icon: Camera, color: '#FB923C' },
  { id: 31, name: 'Dice', icon: Dice5, color: '#34D399' }
];

/**
 * Generate and shuffle a fresh deck for the specified difficulty.
 */
export function generateDeck(difficultyId) {
  const diff = DIFFICULTIES.find(d => d.id === difficultyId) || DIFFICULTIES[0];
  const pairCount = diff.totalPairs;

  // Take the required unique symbol pairs
  const selectedSymbols = SYMBOL_POOL.slice(0, pairCount);

  // Clone each symbol into exactly two matching cards
  const deck = [];
  selectedSymbols.forEach((sym, pairIdx) => {
    deck.push({
      id: `${pairIdx}-a`,
      pairId: sym.id,
      name: sym.name,
      icon: sym.icon,
      color: sym.color
    });
    deck.push({
      id: `${pairIdx}-b`,
      pairId: sym.id,
      name: sym.name,
      icon: sym.icon,
      color: sym.color
    });
  });

  // Fisher-Yates random shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Calculate transparent and balanced score:
 * Base: 100 points per pair.
 * Move efficiency bonus: rewards completing in fewer moves.
 * Time bonus: rewards faster completion against target time.
 */
export function calculateScore(totalPairs, moves, elapsedSeconds, targetSeconds = 60) {
  const safePairs = Math.max(0, Number(totalPairs) || 0);
  const safeMoves = Math.max(0, Number(moves) || 0);
  const safeElapsed = Math.max(0, Number(elapsedSeconds) || 0);

  const baseScore = safePairs * 100;

  // Move bonus: maximum when moves == totalPairs
  const moveBonus = Math.max(0, (safePairs * 2 - safeMoves) * 25);

  // Time bonus: points for finishing under target time
  const timeBonus = Math.max(0, Math.round((targetSeconds - safeElapsed) * 3));

  return baseScore + moveBonus + timeBonus;
}

/**
 * Accuracy formula: successful matches / total completed moves * 100.
 */
export function calculateAccuracy(matchedPairs, totalMoves) {
  const matches = Math.max(0, Number(matchedPairs) || 0);
  const moves = Math.max(0, Number(totalMoves) || 0);
  if (moves === 0) return 0.0;
  return Math.round(((matches / moves) * 100.0) * 10) / 10;
}

/**
 * Performance evaluation tier based on score, accuracy, and difficulty.
 */
export function getPerformanceTier(accuracy, completionTime, difficultyId) {
  const diff = (difficultyId || 'EASY').toUpperCase();
  const acc = Number(accuracy) || 0;
  const time = Number(completionTime) || 0;

  const targetTime = diff === 'HARD' ? 360 : diff === 'MEDIUM' ? 180 : 60;

  if (acc >= 75 && time <= targetTime * 0.75) {
    return {
      tier: 'Photographic Prodigy',
      badge: 'S Rank',
      color: '#F59E0B',
      message: 'Astonishing visual memory! You cleared the entire board with surgical precision and lightning speed.'
    };
  }
  if (acc >= 60 || time <= targetTime) {
    return {
      tier: 'Mind Master',
      badge: 'A Rank',
      color: '#A78BFA',
      message: 'Brilliant pattern recall! Your visual mapping kept mismatches to an absolute minimum.'
    };
  }
  if (acc >= 45) {
    return {
      tier: 'Sharp Memory',
      badge: 'B Rank',
      color: '#34D399',
      message: 'Great mental endurance! You stayed calm and locked down every single matching pair.'
    };
  }
  if (acc >= 30) {
    return {
      tier: 'Card Tracker',
      badge: 'C Rank',
      color: '#60A5FA',
      message: 'Solid effort! Focus on anchoring key corners to build your mental map even faster.'
    };
  }
  return {
    tier: 'Memory Explorer',
    badge: 'D Rank',
    color: '#9CA3AF',
    message: 'Good workout for the brain! Take your time, memorize card clusters, and challenge the board again.'
  };
}
