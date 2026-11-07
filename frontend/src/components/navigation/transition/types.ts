export type NavDestination = 'home' | 'explore' | 'report' | 'patterns' | 'chat' | 'profile' | 'settings';

export interface TransitionMeta {
  id: NavDestination;
  title: string;
  subtitle: string;
  path: string;
  badge?: string;
  primaryColor: string;
  accentColor: string;
  minimumDisplayDuration: number;
}

export const TRANSITION_CONFIGS: Record<NavDestination, TransitionMeta> = {
  home: {
    id: 'home',
    title: 'Initializing ANTAH...',
    subtitle: 'Preparing your intelligence network',
    path: '/home',
    primaryColor: '#087B56',
    accentColor: '#54D8C4',
    minimumDisplayDuration: 2500,
  },
  explore: {
    id: 'explore',
    title: 'Scanning nearby signals...',
    subtitle: 'Discovering connected civic activity',
    path: '/explorer',
    primaryColor: '#087B56',
    accentColor: '#54D8C4',
    minimumDisplayDuration: 3000,
  },
  report: {
    id: 'report',
    title: 'Preparing your report...',
    subtitle: 'Opening civic reporting workspace',
    path: '/report',
    primaryColor: '#087B56',
    accentColor: '#F5C77D',
    minimumDisplayDuration: 2500,
  },
  patterns: {
    id: 'patterns',
    title: 'Connecting signal patterns...',
    subtitle: 'Discovering relationships between reports',
    path: '/patterns',
    primaryColor: '#087B56',
    accentColor: '#F5C77D',
    minimumDisplayDuration: 3500,
  },
  chat: {
    id: 'chat',
    title: 'Connecting community...',
    subtitle: 'Opening your civic conversation space',
    path: '/messages',
    primaryColor: '#087B56',
    accentColor: '#54D8C4',
    minimumDisplayDuration: 2500,
  },
  profile: {
    id: 'profile',
    title: 'Loading Civic Profile...',
    subtitle: 'Accessing municipal credentials & identity',
    path: '/auth',
    primaryColor: '#087B56',
    accentColor: '#54D8C4',
    minimumDisplayDuration: 2500,
  },
  settings: {
    id: 'settings',
    title: 'Loading System Settings...',
    subtitle: 'Configuring telemetry parameters & mesh sync',
    path: '/settings',
    primaryColor: '#087B56',
    accentColor: '#F5C77D',
    minimumDisplayDuration: 2500,
  },
};

export const COLOR_PALETTE = {
  deepEmerald: '#064C3B',
  emerald: '#087B56',
  mint: '#A7E8D3',
  turquoise: '#54D8C4',
  warmIvory: '#F7F5EF',
  goldenAccent: '#F5C77D',
} as const;

