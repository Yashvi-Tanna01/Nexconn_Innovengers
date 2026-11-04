import React, { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface AntahChromaticWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showSubtitle?: boolean;
  showTagline?: boolean;
  statusMessage?: string;
  className?: string;
  cycleId?: number | string;
  cadence?: 'startup' | 'standard' | 'fast';
}

export const AntahChromaticWordmark: React.FC<AntahChromaticWordmarkProps> = memo(({
  size = 'lg',
  theme = 'light',
  showSubtitle = true,
  showTagline = true,
  statusMessage,
  className = '',
  cycleId = 0,
  cadence = 'standard',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isLight = theme === 'light';

  // Cadence timings: cinematic deliberate assembly for startup, snappy for localized loaders
  const timings = {
    startup: {
      letterDuration: 0.65,
      letterDelay: 0.16,
      chromaticDuration: 1.8,
      subDelay: 1.2,
      taglineDelay: 1.8,
    },
    standard: {
      letterDuration: 0.45,
      letterDelay: 0.06,
      chromaticDuration: 0.9,
      subDelay: 0.25,
      taglineDelay: 0.45,
    },
    fast: {
      letterDuration: 0.25,
      letterDelay: 0.03,
      chromaticDuration: 0.45,
      subDelay: 0.12,
      taglineDelay: 0.2,
    },
  }[cadence];

  // Sizing tokens optimized for responsive layout stability
  const sizeMap = {
    sm: {
      text: 'text-2xl sm:text-3xl tracking-[0.16em]',
      sub: 'text-[9px] sm:text-[10px] tracking-[0.24em]',
      tagline: 'text-[11px]',
      pulseSize: 'w-24 h-24',
      badge: 'text-[9px] px-2 py-0.5',
    },
    md: {
      text: 'text-3xl sm:text-4xl md:text-5xl tracking-[0.18em]',
      sub: 'text-[10px] sm:text-xs tracking-[0.28em]',
      tagline: 'text-xs sm:text-sm',
      pulseSize: 'w-36 h-36',
      badge: 'text-[10px] px-2.5 py-0.5',
    },
    lg: {
      text: 'text-4xl sm:text-5xl md:text-6xl tracking-[0.2em]',
      sub: 'text-xs sm:text-sm tracking-[0.3em]',
      tagline: 'text-xs sm:text-sm',
      pulseSize: 'w-48 h-48',
      badge: 'text-[11px] px-3 py-1',
    },
    xl: {
      text: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.22em]',
      sub: 'text-xs sm:text-sm md:text-base tracking-[0.32em]',
      tagline: 'text-sm sm:text-base',
      pulseSize: 'w-64 h-64 sm:w-80 sm:h-80',
      badge: 'text-xs px-3.5 py-1',
    },
  };

  const currentSize = sizeMap[size];
  const letters = ['A', 'N', 'T', 'A', 'H'];

  // Smooth letter assembly with cubic-bezier deceleration
  const letterVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 18,
      scale: shouldReduceMotion ? 1 : 0.94,
    },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: timings.letterDuration,
        ease: [0.16, 1, 0.3, 1],
        delay: shouldReduceMotion ? 0 : i * timings.letterDelay,
      },
    }),
  };

  // Optical chromatic convergence: converges into crisp alignment without continuous heavy blur
  const chromaticCyan = {
    initial: { x: -8, opacity: 0 },
    animate: {
      x: 0,
      opacity: [0, 0.75, 0.3],
      transition: { duration: timings.chromaticDuration, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const chromaticAmber = {
    initial: { x: 8, opacity: 0 },
    animate: {
      x: 0,
      opacity: [0, 0.75, 0.3],
      transition: { duration: timings.chromaticDuration, ease: [0.16, 1, 0.3, 1], delay: 0.08 },
    },
  };

  return (
    <div
      key={`wordmark-cycle-${cycleId}`}
      className={`relative flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* 1. Ambient Concentric Radar Pulse (Hardware-accelerated CSS opacity) */}
      <div
        className={`absolute ${currentSize.pulseSize} rounded-full pointer-events-none flex items-center justify-center`}
      >
        <div
          className={`absolute inset-0 rounded-full border ${
            isLight ? 'border-antah-teal/20' : 'border-cyan-400/20'
          } ${shouldReduceMotion ? '' : 'animate-ping'}`}
          style={{ animationDuration: '3s' }}
        />
        <div
          className={`absolute inset-4 rounded-full border border-dashed ${
            isLight ? 'border-antah-cyan/30' : 'border-teal-300/30'
          }`}
        />
      </div>

      {/* 2. Status Badge */}
      {statusMessage && (
        <motion.div
          key={`badge-${cycleId}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className={`inline-flex items-center gap-2 rounded-full font-mono uppercase tracking-widest mb-3 z-10 ${
            currentSize.badge
          } ${
            isLight
              ? 'bg-teal-50 border border-teal-200/80 text-antah-teal shadow-soft-xs'
              : 'bg-white/5 border border-white/10 text-cyan-300 shadow-sm'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* 3. The ANTAH Chromatic Aberration Wordmark Stack */}
      <div className="relative inline-flex items-center justify-center z-10 px-4">
        {/* Layer A: Cyan / Teal Chromatic Channel */}
        {!shouldReduceMotion && (
          <motion.div
            key={`cyan-${cycleId}`}
            variants={chromaticCyan}
            initial="initial"
            animate="animate"
            aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center font-black ${
              currentSize.text
            } ${
              isLight ? 'text-antah-teal/50' : 'text-cyan-400/60'
            } pointer-events-none -translate-x-[1.5px]`}
          >
            {letters.join('')}
          </motion.div>
        )}

        {/* Layer B: Amber / Rose Chromatic Channel */}
        {!shouldReduceMotion && (
          <motion.div
            key={`amber-${cycleId}`}
            variants={chromaticAmber}
            initial="initial"
            animate="animate"
            aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center font-black ${
              currentSize.text
            } ${
              isLight ? 'text-antah-amber/50' : 'text-rose-400/60'
            } pointer-events-none translate-x-[1.5px]`}
          >
            {letters.join('')}
          </motion.div>
        )}

        {/* Layer C: Focal Core Typography (Sharp ANTAH) */}
        <h1
          className={`relative z-10 flex items-center justify-center font-black drop-shadow-sm ${
            currentSize.text
          } ${isLight ? 'text-antah-navy' : 'text-white'}`}
        >
          {letters.map((char, index) => (
            <motion.span
              key={`char-${char}-${index}-${cycleId}`}
              custom={index}
              variants={letterVariants}
              initial="initial"
              animate="animate"
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </h1>
      </div>

      {/* 4. Subtitle: THE UNHEARD SIGNALS NETWORK */}
      {showSubtitle && (
        <motion.p
          key={`sub-${cycleId}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: timings.subDelay, ease: [0.16, 1, 0.3, 1] }}
          className={`font-semibold uppercase font-sans mt-2 z-10 ${currentSize.sub} ${
            isLight ? 'text-antah-slate' : 'text-slate-300'
          }`}
        >
          The Unheard Signals Network
        </motion.p>
      )}

      {/* 5. Official Tagline: "Small signals today, safer tomorrow." */}
      {showTagline && (
        <motion.p
          key={`tagline-${cycleId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: timings.taglineDelay }}
          className={`font-mono italic mt-1.5 z-10 ${currentSize.tagline} ${
            isLight ? 'text-antah-teal font-medium' : 'text-teal-300/90'
          }`}
        >
          &ldquo;Small signals today, safer tomorrow.&rdquo;
        </motion.p>
      )}
    </div>
  );
});

AntahChromaticWordmark.displayName = 'AntahChromaticWordmark';
