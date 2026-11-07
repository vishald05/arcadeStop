export const GAMES = [
  {
    id: 'reaction-rush',
    title: 'Reaction Rush',
    category: 'Reflex',
    description: 'Test your reflexes. Wait for the signal and click as fast as you can.',
    iconName: 'Zap',
    status: 'available_soon',
    statusLabel: 'Available Soon',
    isFirstPlanned: true,
    badgeText: 'First Up',
    accentColor: '#F59E0B', // Amber / Electric lightning
    accentSecondary: '#A78BFA',
    cardGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(167, 139, 250, 0.04) 100%)',
    borderGlow: 'rgba(245, 158, 11, 0.3)',
    comingSoonMessage: 'Reaction Rush is our first planned game! It is currently in active development and will be playable very soon.',
    estimatedPlayTime: '< 1 min',
    vibe: 'Speed & Focus'
  },
  {
    id: 'memory-madness',
    title: 'Memory Madness',
    category: 'Brain',
    description: 'Flip the cards, find matching pairs, and challenge your memory.',
    iconName: 'Brain',
    status: 'coming_soon',
    statusLabel: 'Coming Soon',
    isFirstPlanned: false,
    badgeText: 'Coming Soon',
    accentColor: '#60A5FA', // Sky blue
    accentSecondary: '#818CF8',
    cardGradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(129, 140, 248, 0.04) 100%)',
    borderGlow: 'rgba(96, 165, 250, 0.3)',
    comingSoonMessage: 'Memory Madness is in the works! Get your brain ready for tile-flipping challenges.',
    estimatedPlayTime: '2-3 mins',
    vibe: 'Recall & Logic'
  },
  {
    id: 'number-ninja',
    title: 'Number Ninja',
    category: 'Puzzle',
    description: 'Guess the hidden number using clues before you run out of attempts.',
    iconName: 'Hash',
    status: 'available',
    statusLabel: 'Play Now',
    isFirstPlanned: false,
    badgeText: 'Play Now',
    accentColor: '#34D399', // Emerald
    accentSecondary: '#2DD4BF',
    cardGradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(45, 212, 191, 0.04) 100%)',
    borderGlow: 'rgba(52, 211, 153, 0.3)',
    comingSoonMessage: 'Number Ninja is ready to play!',
    estimatedPlayTime: '1-2 mins',
    vibe: 'Deduction & Math'
  },
  {
    id: 'type-storm',
    title: 'TypeStorm',
    category: 'Skills',
    description: 'Test your typing speed, accuracy, and precision.',
    iconName: 'Keyboard',
    status: 'coming_soon',
    statusLabel: 'Coming Soon',
    isFirstPlanned: false,
    badgeText: 'Coming Soon',
    accentColor: '#F472B6', // Pink
    accentSecondary: '#FB7185',
    cardGradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.12) 0%, rgba(251, 113, 133, 0.04) 100%)',
    borderGlow: 'rgba(244, 114, 182, 0.3)',
    comingSoonMessage: 'TypeStorm is warming up! Prepare your mechanical keyboard for high-speed word storms.',
    estimatedPlayTime: '1-2 mins',
    vibe: 'WPM & Accuracy'
  },
  {
    id: 'sequence-master',
    title: 'Sequence Master',
    category: 'Memory',
    description: 'Watch the sequence, remember the pattern, and repeat it correctly.',
    iconName: 'Palette',
    status: 'coming_soon',
    statusLabel: 'Coming Soon',
    isFirstPlanned: false,
    badgeText: 'Coming Soon',
    accentColor: '#A78BFA', // Violet
    accentSecondary: '#C084FC',
    cardGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(192, 132, 252, 0.04) 100%)',
    borderGlow: 'rgba(167, 139, 250, 0.3)',
    comingSoonMessage: 'Sequence Master is brewing! Keep your eyes on the pattern in this classic rhythm-memory test.',
    estimatedPlayTime: '2-4 mins',
    vibe: 'Patterns & Audio'
  },
  {
    id: 'whack-attack',
    title: 'Whack Attack',
    category: 'Reflex',
    description: 'Targets appear randomly. Hit as many as possible before time runs out.',
    iconName: 'Target',
    status: 'coming_soon',
    statusLabel: 'Coming Soon',
    isFirstPlanned: false,
    badgeText: 'Coming Soon',
    accentColor: '#FB923C', // Orange / Coral
    accentSecondary: '#F87171',
    cardGradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(248, 113, 113, 0.04) 100%)',
    borderGlow: 'rgba(251, 146, 60, 0.3)',
    comingSoonMessage: 'Whack Attack is coming soon! Get your clicking finger ready for rapid-fire whack-a-mole gameplay.',
    estimatedPlayTime: '1 min',
    vibe: 'Rapid Clicking'
  }
];

export const CATEGORIES = ['All', 'Reflex', 'Brain', 'Puzzle', 'Skills', 'Memory'];

export const ARCADE_FEATURES = [
  {
    id: 'no-account',
    title: 'Zero Account Required',
    description: 'No email, no password, no onboarding questionnaires. Just open ArcadeStop and jump right in.'
  },
  {
    id: 'instant-play',
    title: 'Instant In-Browser Play',
    description: 'Lightweight mini-games that load instantly in any modern web browser without downloads or plugins.'
  },
  {
    id: 'device-privacy',
    title: 'Records Stay on Your Device',
    description: 'Your upcoming personal bests and records will be kept private and stored locally on your machine.'
  },
  {
    id: 'bite-sized',
    title: 'Bite-Sized Big Breaks',
    description: 'Designed for quick 2-minute breathers between tasks or endless retries when you want one more round.'
  }
];
