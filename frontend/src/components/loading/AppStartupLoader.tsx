import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AntahChromaticWordmark } from './AntahChromaticWordmark';
import { useLoading } from '../../context/LoadingContext';
import { Radio, Sparkles } from 'lucide-react';

export const AppStartupLoader: React.FC = () => {
  const { isAppInitialized, setAppInitialized } = useLoading();
  const [phase, setPhase] = useState<'intro' | 'tagline' | 'ready'>('intro');
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Stage 1: Kinetic letters assemble with chromatic convergence (0 - 1.1s)
    const t1 = setTimeout(() => {
      setPhase('tagline');
    }, 1100);

    // Stage 2: Tagline and telemetry glow reveal (1.1s - 2.0s)
    const t2 = setTimeout(() => {
      setPhase('ready');
    }, 2000);

    // Stage 3: Smooth transition into main application (2.35s)
    const t3 = setTimeout(() => {
      setAppInitialized(true);
    }, 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [setAppInitialized]);

  if (isAppInitialized) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isAppInitialized && (
        <motion.div
          key="antah-startup-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 1.015,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#FBFBF9] flex flex-col items-center justify-center overflow-hidden select-none px-4"
          style={{ touchAction: 'none' }}
        >
          {/* 1. Subtle Architectural Grid & Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(13,148,136,0.08),rgba(6,182,212,0.03)_40%,transparent_70%)] pointer-events-none" />

          {/* 2. Top Civic Mesh Watermark Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute top-8 sm:top-12 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 text-antah-teal text-xs font-mono tracking-wider uppercase shadow-soft-xs"
          >
            <Radio size={13} className="text-antah-teal animate-pulse" />
            <span>Civic Intelligence Network • Nexconn 2026</span>
          </motion.div>

          {/* 3. The Core ANTAH Chromatic Kinetic Typography */}
          <div className="relative z-10 max-w-2xl w-full py-8">
            <AntahChromaticWordmark
              size="xl"
              theme="light"
              showSubtitle={true}
              showTagline={phase !== 'intro'}
              statusMessage="INITIALIZING CIVIC TELEMETRY"
            />
          </div>

          {/* 4. Bottom Kinetic Telemetry Loading Line */}
          <div className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5">
            <div className="w-56 sm:w-72 h-[3px] bg-slate-200/80 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.3,
                  ease: 'easeInOut',
                }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-antah-teal to-antah-cyan rounded-full"
              />
            </div>
            <span className="text-[11px] font-mono text-antah-slate/80 tracking-widest uppercase">
              Connecting Signal Twin
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
