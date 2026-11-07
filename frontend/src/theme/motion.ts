import { Transition, Variants } from 'framer-motion';

/**
 * ANTAH Cinematic Motion Design System
 * Unified animation language spanning:
 * 1. DISCOVER — Radar, scanning & signal pulses
 * 2. CONNECT — Neural nodes & energy connections
 * 3. COMMUNICATE — Waveforms & message transitions
 * 4. CONFIRM — Success & verification animations
 * 5. NAVIGATE — Cinematic portal transitions
 */

// Core Palette Tokens
export const MOTION_PALETTE = {
  deepEmerald: '#064C3B',
  emerald: '#087B56',
  mint: '#A7E8D3',
  turquoise: '#54D8C4',
  warmIvory: '#F7F5EF',
  goldenAccent: '#F5C77D',
} as const;

// Interaction Durations (milliseconds)
export const MOTION_DURATIONS = {
  buttonFeedback: 0.18,
  cardHover: 0.25,
  dropdown: 0.24,
  modalEntrance: 0.32,
  pageTransition: 0.35,
  signalDiscovery: 0.95,
  successAnimation: 1.35,
  networkFormation: 1.6,
} as const;

// Premium Easing Curves
export const EASINGS = {
  // Ultra-refined Apple/Linear-style deceleration
  easeOutCubic: [0.16, 1, 0.3, 1] as const,
  // Gentle ease in-out for spatial & floating elements
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  // Snappy spring for tactile feedback
  springTactile: { type: 'spring', stiffness: 420, damping: 28 },
  // Smooth spring for spatial navigation and floating panels
  springSpatial: { type: 'spring', stiffness: 260, damping: 24 },
  // Gentle spring for card tilt and sheen
  springGentle: { type: 'spring', stiffness: 180, damping: 22 },
};

// Standard Transitions
export const TRANSITIONS = {
  fast: { duration: MOTION_DURATIONS.buttonFeedback, ease: EASINGS.easeOutCubic } as Transition,
  normal: { duration: MOTION_DURATIONS.modalEntrance, ease: EASINGS.easeOutCubic } as Transition,
  slow: { duration: MOTION_DURATIONS.signalDiscovery, ease: EASINGS.easeOutCubic } as Transition,
  spatial: { duration: 0.45, ease: EASINGS.easeInOutCubic } as Transition,
};

// -------------------------------------------------------------
// 1. DISCOVER: Radar, scanning & signal pulse variants
// -------------------------------------------------------------
export const radarSweepVariants: Variants = {
  initial: { opacity: 0, rotate: 0, scale: 0.8 },
  animate: {
    opacity: [0, 0.75, 0.75, 0],
    rotate: 360,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.signalDiscovery,
      ease: 'easeOut',
    },
  },
};

export const signalPulseVariants: Variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: {
    scale: [0.6, 1.4, 2.2],
    opacity: [0.85, 0.4, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
};

// -------------------------------------------------------------
// 2. CONNECT: Neural network & energy connection variants
// -------------------------------------------------------------
export const neuralNodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: EASINGS.easeOutCubic,
    },
  }),
};

export const connectionLineVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    pathLength: 1,
    opacity: 0.65,
    transition: {
      delay: 0.2 + i * 0.06,
      duration: 0.65,
      ease: EASINGS.easeOutCubic,
    },
  }),
};

// -------------------------------------------------------------
// 3. COMMUNICATE: Waveforms & message transitions
// -------------------------------------------------------------
export const messageSlideVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: EASINGS.easeOutCubic,
    },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.16 } },
};

// -------------------------------------------------------------
// 4. CONFIRM: Success & verification check variants
// -------------------------------------------------------------
export const successCheckVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      delay: 0.35,
      duration: 0.55,
      ease: EASINGS.easeOutCubic,
    },
  },
};

export const verificationScanVariants: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: {
    x: '100%',
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 0.95,
      ease: EASINGS.easeInOutCubic,
    },
  },
};

// -------------------------------------------------------------
// 5. NAVIGATE: Page & Container Variants
// -------------------------------------------------------------
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASINGS.easeOutCubic,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: EASINGS.easeOutCubic,
    },
  },
};

export const reducedPageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const revealItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.34,
      ease: EASINGS.easeOutCubic,
    },
  },
};

export const panelVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.97,
    transition: {
      duration: 0.18,
      ease: EASINGS.easeOutCubic,
    },
  },
};
