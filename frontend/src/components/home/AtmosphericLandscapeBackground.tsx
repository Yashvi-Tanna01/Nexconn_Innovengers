import React from 'react';

/**
 * AtmosphericLandscapeBackground
 * 
 * Permanent, responsive, high-fidelity SVG & CSS background system for ANTAH.
 * Faithfully recreates the flowing emerald-mint and champagne-gold landscape dunes,
 * radial golden-cyan core atmosphere, and concentric telemetry track rings
 * from the definitive reference design (IMAGE 1).
 *
 * 100% lightweight procedural SVG + CSS gradients — 0 external image dependencies.
 */
export const AtmosphericLandscapeBackground: React.FC = React.memo(() => {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden w-full h-full"
      aria-hidden="true"
      style={{
        backgroundColor: '#FAF8F3', // Warm ivory and pearl-white base
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. LAYER 1: AMBIENT RADIAL ATMOSPHERIC GLOW BEHIND THE GLOBE */}
      {/* ------------------------------------------------------------- */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[12%] sm:top-[14%] md:top-[16%] w-[680px] sm:w-[940px] md:w-[1140px] lg:w-[1340px] h-[680px] sm:h-[940px] md:h-[1140px] lg:h-[1340px] rounded-full pointer-events-none opacity-80"
        style={{
          background:
            'radial-gradient(circle at center, rgba(254, 243, 199, 0.50) 0%, rgba(204, 251, 241, 0.30) 36%, rgba(224, 242, 254, 0.12) 60%, transparent 75%)',
          filter: 'blur(50px)',
          transform: 'translate3d(-50%, 0, 0)',
          contain: 'strict',
          willChange: 'transform',
        }}
      />

      {/* Secondary Soft Warm Glow at Center-Bottom */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[58%] w-[800px] sm:w-[1100px] h-[480px] rounded-[100%] pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(254, 243, 199, 0.45) 0%, rgba(204, 251, 241, 0.25) 50%, transparent 80%)',
          filter: 'blur(60px)',
          transform: 'translate3d(-50%, 0, 0)',
          contain: 'strict',
          willChange: 'transform',
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. LAYER 2: PROCEDURAL FLOWING LANDSCAPE SVG (FULL VIEWPORT)  */}
      {/* ------------------------------------------------------------- */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1536 1024"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Left Landscape Primary Gradient (Lush Soft Mint -> Seafoam -> Transparent) */}
          <linearGradient id="leftDuneGrad1" x1="0%" y1="0%" x2="70%" y2="80%">
            <stop offset="0%" stopColor="#7CC7B2" stopOpacity="0.88" />
            <stop offset="40%" stopColor="#9FD8C8" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#C9ECE2" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0.0" />
          </linearGradient>

          {/* Left Landscape Secondary Ridge Gradient (Emerald-Mint Soft Shadow) */}
          <linearGradient id="leftDuneGrad2" x1="0%" y1="20%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#62B59F" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#8ED2BF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0.0" />
          </linearGradient>

          {/* Left Foreground Wave Gradient (Soft Translucent Mint-Sage) */}
          <linearGradient id="leftDuneGrad3" x1="0%" y1="0%" x2="60%" y2="70%">
            <stop offset="0%" stopColor="#A8DEC0" stopOpacity="0.70" />
            <stop offset="60%" stopColor="#D4F0E6" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0.0" />
          </linearGradient>

          {/* Right Landscape Primary Gradient (Warm Champagne-Gold -> Peach -> Transparent) */}
          <linearGradient id="rightDuneGrad1" x1="100%" y1="0%" x2="30%" y2="80%">
            <stop offset="0%" stopColor="#F7DFCA" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#FAEBDD" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#FCF4EB" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0.0" />
          </linearGradient>

          {/* Right Landscape Secondary Wave Gradient (Warm Golden-Ivory Transition) */}
          <linearGradient id="rightDuneGrad2" x1="100%" y1="20%" x2="20%" y2="100%">
            <stop offset="0%" stopColor="#EED2B8" stopOpacity="0.70" />
            <stop offset="50%" stopColor="#F8E5D4" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0.0" />
          </linearGradient>

          {/* Bottom Horizon Wave Gradient */}
          <linearGradient id="bottomWaveGrad" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#D8EFE8" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#EDF8F4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0.0" />
          </linearGradient>

          {/* Luminous Ridge Highlight Stroke Filters */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ----------------------------------------------------------- */}
        {/* A. CONCENTRIC TELEMETRY ORBITAL ARCS (BEHIND THE GLOBE)     */}
        {/* ----------------------------------------------------------- */}
        <g opacity="0.85">
          {/* Outer Telemetry Ring with Coordinates & Sparkles */}
          <circle
            cx="768"
            cy="340"
            r="440"
            stroke="rgba(45, 212, 191, 0.32)"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Mid Telemetry Ring with Dashed Styling */}
          <circle
            cx="768"
            cy="340"
            r="385"
            stroke="rgba(245, 158, 11, 0.38)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            fill="none"
          />
          {/* Inner Horizon Ring */}
          <circle
            cx="768"
            cy="340"
            r="315"
            stroke="rgba(45, 212, 191, 0.42)"
            strokeWidth="1.4"
            fill="none"
          />
          {/* Core Horizon Guide */}
          <circle
            cx="768"
            cy="340"
            r="255"
            stroke="rgba(20, 184, 166, 0.22)"
            strokeWidth="1.0"
            fill="none"
          />

          {/* Telemetry Accent Sparkles on Rings */}
          <circle cx="510" cy="180" r="3.5" fill="#FBBF24" filter="url(#softGlow)" />
          <circle cx="1060" cy="190" r="3.0" fill="#2DD4BF" filter="url(#softGlow)" />
          <circle cx="1180" cy="390" r="3.5" fill="#FBBF24" filter="url(#softGlow)" />
          <circle cx="360" cy="420" r="2.5" fill="#2DD4BF" filter="url(#softGlow)" />
          <circle cx="680" cy="80" r="2.5" fill="#F59E0B" />
          <circle cx="890" cy="740" r="3.0" fill="#2DD4BF" filter="url(#softGlow)" />
        </g>

        {/* ----------------------------------------------------------- */}
        {/* B. LEFT SIDE FLOWING SILK DUNES / MOUNTAIN SILHOUETTE       */}
        {/* ----------------------------------------------------------- */}
        {/* 1. Left Back Ridge (Deeper Mountain Swell) */}
        <path
          d="M -60,680
             C 80,580 180,480 260,490
             C 360,500 420,620 540,680
             C 660,740 760,780 820,840
             L 820,1050 L -60,1050 Z"
          fill="url(#leftDuneGrad2)"
        />

        {/* 2. Left Primary Mountain / Silk Dune Wave (Bold Organic Silhouette) */}
        <path
          d="M -80,560
             C 60,460 160,390 240,420
             C 340,460 380,590 490,660
             C 600,730 720,780 840,810
             C 960,840 980,940 940,1050
             L -80,1050 Z"
          fill="url(#leftDuneGrad1)"
        />

        {/* 3. Left Ridge Glowing Highlight Stroke */}
        <path
          d="M -80,560
             C 60,460 160,390 240,420
             C 340,460 380,590 490,660
             C 600,730 720,780 840,810"
          stroke="rgba(23, 83, 62, 0.45)"
          strokeWidth="2.2"
          fill="none"
          filter="url(#softGlow)"
        />

        {/* 4. Left Sweeping Golden Trajectory Filament */}
        <path
          d="M -40,520
             C 100,430 200,370 280,400
             C 380,440 430,570 540,640
             C 660,720 780,760 920,780
             C 1040,800 1120,860 1180,940"
          stroke="rgba(245, 158, 11, 0.65)"
          strokeWidth="1.8"
          fill="none"
        />

        {/* 5. Left Secondary Dashed Telemetry Filament */}
        <path
          d="M -20,490
             C 120,410 220,350 300,380
             C 400,420 450,550 560,620
             C 680,700 800,740 940,760"
          stroke="rgba(251, 191, 36, 0.45)"
          strokeWidth="1.2"
          strokeDasharray="6 8"
          fill="none"
        />

        {/* 6. Left Foreground Dune Swell (Soft Mint) */}
        <path
          d="M -60,780
             C 60,720 180,740 280,800
             C 390,870 520,930 680,950
             L 680,1050 L -60,1050 Z"
          fill="url(#leftDuneGrad3)"
        />

        {/* ----------------------------------------------------------- */}
        {/* C. RIGHT SIDE FLOWING SILK DUNES / WARM GOLDEN SILHOUETTE   */}
        {/* ----------------------------------------------------------- */}
        {/* 1. Right Back Ridge (Champagne-Gold Mountain Swell) */}
        <path
          d="M 1600,680
             C 1460,580 1360,480 1280,490
             C 1180,500 1120,620 1000,680
             C 880,740 780,780 720,840
             L 720,1050 L 1600,1050 Z"
          fill="url(#rightDuneGrad2)"
        />

        {/* 2. Right Primary Mountain / Silk Dune Wave (Bold Organic Silhouette) */}
        <path
          d="M 1620,560
             C 1480,460 1380,390 1300,420
             C 1200,460 1160,590 1050,660
             C 940,730 820,780 700,810
             C 580,840 560,940 600,1050
             L 1620,1050 Z"
          fill="url(#rightDuneGrad1)"
        />

        {/* 3. Right Ridge Glowing Highlight Stroke */}
        <path
          d="M 1620,560
             C 1480,460 1380,390 1300,420
             C 1200,460 1160,590 1050,660
             C 940,730 820,780 700,810"
          stroke="rgba(245, 158, 11, 0.55)"
          strokeWidth="2.2"
          fill="none"
          filter="url(#softGlow)"
        />

        {/* 4. Right Sweeping Golden Trajectory Filament */}
        <path
          d="M 1580,520
             C 1440,430 1340,370 1260,400
             C 1160,440 1110,570 1000,640
             C 880,720 760,760 620,780
             C 500,800 420,860 360,940"
          stroke="rgba(245, 158, 11, 0.70)"
          strokeWidth="1.8"
          fill="none"
        />

        {/* 5. Right Secondary Turquoise Trajectory Filament */}
        <path
          d="M 1560,490
             C 1420,410 1320,350 1240,380
             C 1140,420 1090,550 980,620
             C 860,700 740,740 600,760"
          stroke="rgba(45, 212, 191, 0.45)"
          strokeWidth="1.2"
          strokeDasharray="6 8"
          fill="none"
        />

        {/* ----------------------------------------------------------- */}
        {/* D. BOTTOM LANDSCAPE HORIZON WAVES (SMOOTH BASE TRANSITION)  */}
        {/* ----------------------------------------------------------- */}
        <path
          d="M -40,940
             C 240,860 480,880 768,910
             C 1060,940 1320,880 1580,940
             L 1580,1050 L -40,1050 Z"
          fill="url(#bottomWaveGrad)"
        />
      </svg>
    </div>
  );
});

export default AtmosphericLandscapeBackground;
