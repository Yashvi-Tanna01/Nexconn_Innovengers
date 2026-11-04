import { Transition, Variants } from 'framer-motion';

/**
 * ANTAH Cinematic Motion Design System
 * Engineered for purposeful, non-distracting, high-performance interactions.
 */

// Premium easing curves
export const EASINGS = {
  // Ultra-refined Apple/Linear-style deceleration
  easeOutCubic: [0.16, 1, 0.3, 1] as const,
  // Gentle ease in out for camera and spatial elements
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  // Snappy spring for tactile feedback
  springTactile: { type: 'spring', stiffness: 400, damping: 28 },
  // Smooth spring for spatial navigation and floating panels
  springSpatial: { type: 'spring', stiffness: 260, damping: 24 },
  // Gentle spring for card tilt and sheen
  springGentle: { type: 'spring', stiffness: 180, damping: 22 },
};

// Standard transition timings
export const TRANSITIONS = {
  fast: { duration: 0.18, ease: EASINGS.easeOutCubic } as Transition,
  normal: { duration: 0.32, ease: EASINGS.easeOutCubic } as Transition,
  slow: { duration: 0.55, ease: EASINGS.easeOutCubic } as Transition,
  spatial: { duration: 0.45, ease: EASINGS.easeInOutCubic } as Transition,
};

// Coordinated Page Transitions (Engineered for 60 FPS GPU-composited transform/opacity)
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

// Reduced Motion Page Variant (fade only)
export const reducedPageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

// Staggered Container Variants
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

// Staged Item Reveal
export const revealItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 14,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: EASINGS.easeOutCubic,
    },
  },
};

// Contextual Floating Panel Variants
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

