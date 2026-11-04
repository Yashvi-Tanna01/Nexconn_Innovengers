import React, { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AntahChromaticWordmark } from './AntahChromaticWordmark';
import { useLoading } from '../../context/LoadingContext';
import { useAnimationLifecycle, AnimationStage } from '../../hooks/useAnimationLifecycle';
import { Radio, ChevronRight, Sparkles } from 'lucide-react';

export type StartupPhase =
  | 'opening_atmosphere'
  | 'brand_formation'
  | 'identity_reveal'
  | 'final_visual_moment'
  | 'transition';

export const AppStartupLoader: React.FC = () => {
  const { isAppInitialized, setAppInitialized } = useLoading();
  const shouldReduceMotion = useReducedMotion();

  // Multi-phase 7–9s cinematic stages as specified in requirements
  const stages: AnimationStage<StartupPhase>[] = useMemo(() => {
    if (shouldReduceMotion) {
      // Faster, motion-reduced sequence for accessibility
      return [
        { phase: 'opening_atmosphere', durationMs: 800, statusMessage: 'ESTABLISHING CIVIC TELEMETRY' },
        { phase: 'brand_formation', durationMs: 1400, statusMessage: 'SYNTHESIZING ANTAH CORE' },
        { phase: 'identity_reveal', durationMs: 1200, statusMessage: 'DECRYPTING CIVIC SIGNALS' },
        { phase: 'final_visual_moment', durationMs: 800, statusMessage: 'CIVIC NETWORK ONLINE' },
        { phase: 'transition', durationMs: 600, statusMessage: 'LAUNCHING INTERFACE' },
      ];
    }

    return [
      // Phase 1 — Opening atmosphere (0–1.5 seconds)
      {
        phase: 'opening_atmosphere',
        durationMs: 1500,
        statusMessage: 'ESTABLISHING CIVIC TELEMETRY',
        label: 'Ambient Atmosphere',
      },
      // Phase 2 — Brand formation (1.5–4.0 seconds)
      {
        phase: 'brand_formation',
        durationMs: 2500,
        statusMessage: 'SYNTHESIZING ANTAH CORE',
        label: 'Kinetic Wordmark Assembly',
      },
      // Phase 3 — Identity reveal (4.0–6.0 seconds)
      {
        phase: 'identity_reveal',
        durationMs: 2000,
        statusMessage: 'DECRYPTING CIVIC SIGNALS',
        label: 'Identity & Tagline Unveil',
      },
      // Phase 4 — Final visual moment (6.0–7.6 seconds)
      {
        phase: 'final_visual_moment',
        durationMs: 1600,
        statusMessage: 'CIVIC NETWORK ONLINE',
        label: 'Composition Appreciation',
      },
      // Phase 5 — Transition (7.6–8.8 seconds)
      {
        phase: 'transition',
        durationMs: 1200,
        statusMessage: 'CONNECTING SIGNAL TWIN',
        label: 'Smooth System Transition',
      },
    ];
  }, [shouldReduceMotion]);

  const handleSequenceComplete = useCallback(() => {
    setAppInitialized(true);
  }, [setAppInitialized]);

  const {
    phase,
    progress,
    currentStage,
    cycleId,
    skip,
  } = useAnimationLifecycle<StartupPhase>({
    stages,
    autoStart: !isAppInitialized,
    onComplete: handleSequenceComplete,
  });

  // Keyboard shortcut: Press Escape to skip intro immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isAppInitialized) {
        skip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAppInitialized, skip]);

  const showWordmark = phase !== 'opening_atmosphere';
  const showSubtitle = phase === 'identity_reveal' || phase === 'final_visual_moment' || phase === 'transition';
  const showTagline = showSubtitle;

  return (
    <AnimatePresence mode="wait">
      {!isAppInitialized && (
        <motion.div
          key={`antah-startup-loader-${cycleId}`}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 1.025,
            transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#FBFBF9] flex flex-col items-center justify-center overflow-hidden select-none px-4"
          style={{ touchAction: 'none' }}
        >
          {/* 1. Ambient Architectural Grid & Subtle Radial Aura */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.038] pointer-events-none"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: phase === 'final_visual_moment' ? 0.18 : 0.1,
              scale: phase === 'final_visual_moment' ? 1.05 : 1,
            }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(13,148,136,0.14),rgba(6,182,212,0.05)_40%,transparent_72%)] pointer-events-none"
          />

          {/* 2. Top Watermark Badge: Established Civic Network */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-8 sm:top-12 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200/90 text-antah-teal text-xs font-mono tracking-wider uppercase shadow-soft-xs z-20"
          >
            <Radio size={13} className="text-antah-teal animate-pulse" />
            <span>Civic Intelligence Network • Nexconn 2026</span>
          </motion.div>

          {/* 3. Central Brand Stage: 5-Phase Fluid Unfolding */}
          <div className="relative z-10 max-w-2xl w-full py-8 flex flex-col items-center">
            {/* Opening atmosphere calm radar ring */}
            {phase === 'opening_atmosphere' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="w-28 h-28 rounded-full border border-antah-teal/30 flex items-center justify-center relative mb-4"
              >
                <span className="w-3 h-3 rounded-full bg-antah-teal shadow-[0_0_12px_rgba(13,148,136,0.8)] animate-ping" />
                <span className="text-[11px] font-mono text-antah-teal font-bold absolute -bottom-7 tracking-widest uppercase">
                  INITIALIZING
                </span>
              </motion.div>
            )}

            {/* The Core ANTAH Chromatic Kinetic Typography */}
            {showWordmark && (
              <AntahChromaticWordmark
                size="xl"
                theme="light"
                showSubtitle={showSubtitle}
                showTagline={showTagline}
                cycleId={cycleId}
                cadence={shouldReduceMotion ? 'standard' : 'startup'}
                statusMessage={currentStage.statusMessage}
              />
            )}
          </div>

          {/* 4. Bottom Telemetry Loading Line with Smooth Progress */}
          <div className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 w-full max-w-xs px-4">
            <div className="w-full h-[3.5px] bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-antah-teal via-cyan-500 to-antah-teal rounded-full"
                style={{ width: `${Math.round(progress * 100)}%` }}
                transition={{ ease: 'linear', duration: 0.1 }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-[10px] font-mono text-antah-slate/90 tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{currentStage.statusMessage || 'PROCESSING TELEMETRY'}</span>
              </span>
              <span className="font-bold text-antah-navy">{Math.round(progress * 100)}%</span>
            </div>
          </div>

          {/* 5. Elegant Skip Option (Keyboard ESC / Click) */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1, scale: 1.03 }}
            onClick={skip}
            title="Skip cinematic startup sequence (Esc)"
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 inline-flex items-center gap-1 text-[11px] font-mono text-antah-slate hover:text-antah-navy bg-white/80 hover:bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-soft-xs transition-all z-30"
          >
            <span>Skip Intro</span>
            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold">ESC</span>
            <ChevronRight size={12} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
