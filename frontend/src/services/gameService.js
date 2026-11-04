import { apiFetch } from './api';

// Visual themes mapped by slug or category to preserve the established indie aesthetic
const THEME_DECORATIONS = {
  'reaction-rush': {
    accentColor: '#F59E0B',
    accentSecondary: '#A78BFA',
    cardGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(167, 139, 250, 0.04) 100%)',
    borderGlow: 'rgba(245, 158, 11, 0.3)',
    badgeText: 'First Up',
    estimatedPlayTime: '< 1 min',
    vibe: 'Speed & Focus',
    comingSoonMessage: 'Reaction Rush is our first planned game! It is currently in active development and will be playable very soon.'
  },
  'memory-madness': {
    accentColor: '#60A5FA',
    accentSecondary: '#818CF8',
    cardGradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(129, 140, 248, 0.04) 100%)',
    borderGlow: 'rgba(96, 165, 250, 0.3)',
    badgeText: 'Coming Soon',
    estimatedPlayTime: '2-3 mins',
    vibe: 'Recall & Logic',
    comingSoonMessage: 'Memory Madness is in the works! Get your brain ready for tile-flipping challenges.'
  },
  'number-ninja': {
    accentColor: '#34D399',
    accentSecondary: '#2DD4BF',
    cardGradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(45, 212, 191, 0.04) 100%)',
    borderGlow: 'rgba(52, 211, 153, 0.3)',
    badgeText: 'Coming Soon',
    estimatedPlayTime: '1-2 mins',
    vibe: 'Deduction & Math',
    comingSoonMessage: 'Number Ninja is on the roadmap! Sharpen your deduction tactics for this number puzzle.'
  },
  'type-storm': {
    accentColor: '#F472B6',
    accentSecondary: '#FB7185',
    cardGradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.12) 0%, rgba(251, 113, 133, 0.04) 100%)',
    borderGlow: 'rgba(244, 114, 182, 0.3)',
    badgeText: 'Coming Soon',
    estimatedPlayTime: '1-2 mins',
    vibe: 'WPM & Accuracy',
    comingSoonMessage: 'TypeStorm is warming up! Prepare your mechanical keyboard for high-speed word storms.'
  },
  'sequence-master': {
    accentColor: '#A78BFA',
    accentSecondary: '#C084FC',
    cardGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(192, 132, 252, 0.04) 100%)',
    borderGlow: 'rgba(167, 139, 250, 0.3)',
    badgeText: 'Coming Soon',
    estimatedPlayTime: '2-4 mins',
    vibe: 'Patterns & Audio',
    comingSoonMessage: 'Sequence Master is brewing! Keep your eyes on the pattern in this classic rhythm-memory test.'
  },
  'whack-attack': {
    accentColor: '#FB923C',
    accentSecondary: '#F87171',
    cardGradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(248, 113, 113, 0.04) 100%)',
    borderGlow: 'rgba(251, 146, 60, 0.3)',
    badgeText: 'Coming Soon',
    estimatedPlayTime: '1 min',
    vibe: 'Rapid Clicking',
    comingSoonMessage: 'Whack Attack is coming soon! Get your clicking finger ready for rapid-fire whack-a-mole gameplay.'
  }
};

const DEFAULT_DECORATION = {
  accentColor: '#A78BFA',
  accentSecondary: '#60A5FA',
  cardGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(96, 165, 250, 0.04) 100%)',
  borderGlow: 'rgba(167, 139, 250, 0.3)',
  badgeText: 'Coming Soon',
  estimatedPlayTime: '1-2 mins',
  vibe: 'Indie Arcade',
  comingSoonMessage: 'This game is currently in development! Check back soon.'
};

/**
 * Decorates raw backend Game entity with frontend styling properties
 */
export function formatGame(game) {
  if (!game) return null;
  const theme = THEME_DECORATIONS[game.slug] || DEFAULT_DECORATION;

  return {
    ...game,
    title: game.name,
    isFirstPlanned: game.featured || game.slug === 'reaction-rush',
    statusLabel: game.status === 'AVAILABLE' ? 'Play Now' : 'Coming Soon',
    accentColor: theme.accentColor,
    accentSecondary: theme.accentSecondary,
    cardGradient: theme.cardGradient,
    borderGlow: theme.borderGlow,
    badgeText: game.featured ? 'First Up' : theme.badgeText,
    estimatedPlayTime: theme.estimatedPlayTime,
    vibe: theme.vibe,
    comingSoonMessage: theme.comingSoonMessage,
  };
}

export const gameService = {
  /**
   * Fetch all games from backend
   */
  async getAllGames() {
    const rawGames = await apiFetch('/games');
    return rawGames.map(formatGame);
  },

  /**
   * Fetch a single game by its slug
   */
  async getGameBySlug(slug) {
    const rawGame = await apiFetch(`/games/${slug}`);
    return formatGame(rawGame);
  },

  /**
   * Fetch games filtered by category
   */
  async getGamesByCategory(category) {
    const rawGames = await apiFetch(`/games/category/${category}`);
    return rawGames.map(formatGame);
  },

  /**
   * Backend health check
   */
  async getHealth() {
    return await apiFetch('/health');
  }
};
