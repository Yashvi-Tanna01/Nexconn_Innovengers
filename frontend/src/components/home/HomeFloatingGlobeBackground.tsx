import React from 'react';
import { createPortal } from 'react-dom';
import { AtmosphericLandscapeBackground } from './AtmosphericLandscapeBackground';
import { SignalOrbCanvas } from './SignalOrbCanvas';

/**
 * HomeFloatingGlobeBackground
 *
 * Permanent, fixed 3D glowing Earth and atmospheric landscape background
 * for the ANTAH Home page ONLY.
 *
 * Anchors the 3D Living Digital Earth to the viewport so the user can scroll
 * normally while the globe stays in place, gently rotating and levitating.
 *
 * Renders via React Portal directly into the document root to ensure no parent
 * CSS transforms (e.g. Framer Motion page transitions) can hijack its fixed
 * viewport positioning.
 *
 * When the user navigates away from Home, this component automatically unmounts,
 * terminating the WebGL animation loop and freeing GPU resources.
 */
export const HomeFloatingGlobeBackground: React.FC = React.memo(() => {
  if (typeof document === 'undefined') return null;

  const targetNode =
    document.getElementById('home-fixed-globe-portal-root') || document.body;

  return createPortal(
    <div
      id="antah-home-fixed-globe-portal"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden w-full h-full"
      style={{
        zIndex: 0,
        backgroundColor: '#FAF8F3', // Warm ivory base matching definitive reference
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      {/* 1. LAYER 1: PERMANENT IVORY, MINT & EMERALD FLOWING LANDSCAPE */}
      <AtmosphericLandscapeBackground />

      {/* 2. LAYER 2: PERMANENT FIXED FLOATING 3D DIGITAL EARTH SUSPENDED STAGE */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[50px] sm:top-[56px] md:top-[62px] lg:top-[66px] w-full max-w-[380px] sm:max-w-[460px] md:max-w-[530px] lg:max-w-[580px] h-[360px] sm:h-[420px] md:h-[470px] lg:h-[510px] flex items-center justify-center pointer-events-auto"
        style={{
          transform: 'translate3d(-50%, 0, 0)',
          willChange: 'transform',
        }}
      >
        <SignalOrbCanvas />
      </div>
    </div>,
    targetNode
  );
});

export default HomeFloatingGlobeBackground;

