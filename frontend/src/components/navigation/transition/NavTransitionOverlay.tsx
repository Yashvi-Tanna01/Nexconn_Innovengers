import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { NavDestination, TRANSITION_CONFIGS } from './types';
import { LivingEarthPortal } from './LivingEarthPortal';
import { HolographicRadarPortal } from './HolographicRadarPortal';
import { EnergyFormationPortal } from './EnergyFormationPortal';
import { NeuralConnectionsPortal } from './NeuralConnectionsPortal';
import { CommunicationPortal } from './CommunicationPortal';

interface NavTransitionOverlayProps {
  isVisible: boolean;
  destination: NavDestination | null;
}

export const NavTransitionOverlay: React.FC<NavTransitionOverlayProps> = ({
  isVisible,
  destination,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!destination) return null;
  const config = TRANSITION_CONFIGS[destination];

  const renderPortalAnimation = () => {
    switch (destination) {
      case 'home':
        return <LivingEarthPortal />;
      case 'explore':
        return <HolographicRadarPortal />;
      case 'report':
        return <EnergyFormationPortal />;
      case 'patterns':
        return <NeuralConnectionsPortal />;
      case 'chat':
        return <CommunicationPortal />;
      default:
        return <LivingEarthPortal />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`nav-transition-${destination}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
          className="fixed inset-0 z-[9990] bg-[#064C3B]/15 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto select-none"
          role="status"
          aria-live="polite"
          aria-label={config.title}
        >
          {/* Floating Premium Glassmorphism Card */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { scale: 0.95, opacity: 0, y: -8, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
            }
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[340px] sm:max-w-[370px] p-6 sm:p-7 rounded-3xl bg-[#F7F5EF]/90 backdrop-blur-2xl border border-[#087B56]/20 shadow-[0_24px_60px_-12px_rgba(6,76,59,0.22),0_0_0_1px_rgba(255,255,255,0.8)_inset] flex flex-col items-center text-center overflow-hidden"
          >
            {/* Top Atmospheric Ambient Light Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-28 bg-[#54D8C4]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Micro Portal Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1F2EB]/90 border border-[#087B56]/20 text-[10px] font-mono font-semibold tracking-wider text-[#087B56] shadow-xs mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087B56] animate-pulse" />
              <span>ANTAH PORTAL ACTIVE</span>
            </div>

            {/* Central 3D Illustration Canvas */}
            <div className="w-full flex items-center justify-center my-1 relative">
              {renderPortalAnimation()}
            </div>

            {/* Elegant Loading Typography */}
            <div className="space-y-1 mt-1 max-w-[280px]">
              <h2 className="text-base sm:text-lg font-bold text-[#1E2925] tracking-tight font-sans">
                {config.title}
              </h2>
              <p className="text-xs text-[#7B8B84] font-sans leading-relaxed">
                {config.subtitle}
              </p>
            </div>

            {/* Small Animated Progress Indicator Bar */}
            <div className="w-32 h-1 bg-[#087B56]/15 rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.05,
                  ease: 'easeInOut',
                }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#087B56] to-transparent rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavTransitionOverlay;

