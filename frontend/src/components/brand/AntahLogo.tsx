import React from 'react';

interface AntahLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  isMonochrome?: boolean;
}

export const AntahLogo: React.FC<AntahLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  isMonochrome = false,
}) => {
  const sizeMap = {
    sm: {
      svgSize: 28,
      titleClass: 'text-lg tracking-wider font-extrabold',
      subtitleClass: 'text-[9px] tracking-widest',
      gap: 'gap-2.5',
    },
    md: {
      svgSize: 36,
      titleClass: 'text-2xl tracking-widest font-extrabold',
      subtitleClass: 'text-[10px] tracking-wider',
      gap: 'gap-3',
    },
    lg: {
      svgSize: 48,
      titleClass: 'text-3xl tracking-widest font-black',
      subtitleClass: 'text-xs tracking-wider',
      gap: 'gap-3.5',
    },
    xl: {
      svgSize: 64,
      titleClass: 'text-5xl tracking-widest font-black',
      subtitleClass: 'text-sm tracking-widest',
      gap: 'gap-4',
    },
  };

  const { svgSize, titleClass, subtitleClass, gap } = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* Connected Signals SVG Symbol */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Subtle Outer Radius Signal Field */}
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke={isMonochrome ? 'currentColor' : '#0D9488'}
            strokeWidth="1.2"
            strokeDasharray="3 3"
            strokeOpacity="0.45"
          />
          {/* Inner Coordinate Ring */}
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke={isMonochrome ? 'currentColor' : '#06B6D4'}
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* Connected Network Signal Beams */}
          <line
            x1="24"
            y1="24"
            x2="12"
            y2="14"
            stroke={isMonochrome ? 'currentColor' : '#0F766E'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="24"
            y1="24"
            x2="36"
            y2="16"
            stroke={isMonochrome ? 'currentColor' : '#0F766E'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="24"
            y1="24"
            x2="24"
            y2="37"
            stroke={isMonochrome ? 'currentColor' : '#0F766E'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Central Beacon Hub (ANTAH) */}
          <circle
            cx="24"
            cy="24"
            r="5"
            fill={isMonochrome ? 'currentColor' : '#0D9488'}
          />
          <circle cx="24" cy="24" r="2" fill="#FFFFFF" />

          {/* Peripheral Local Nodes (Community Observation Signals) */}
          <circle
            cx="12"
            cy="14"
            r="3.5"
            fill={isMonochrome ? 'currentColor' : '#0B132B'}
            stroke="#0D9488"
            strokeWidth="1.5"
          />
          <circle
            cx="36"
            cy="16"
            r="3.5"
            fill={isMonochrome ? 'currentColor' : '#D97706'}
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
          <circle
            cx="24"
            cy="37"
            r="3.5"
            fill={isMonochrome ? 'currentColor' : '#06B6D4'}
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Brand Wordmark & Tagline Hierarchy */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-sans ${titleClass} text-antah-navy tracking-[0.18em]`}
            style={{ textRendering: 'optimizeLegibility' }}
          >
            ANTAH
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-antah-teal mb-0.5 animate-pulse" />
        </div>
        {showSubtitle && (
          <span
            className={`font-sans ${subtitleClass} text-antah-muted font-medium uppercase tracking-[0.22em] mt-0.5`}
          >
            The Unheard Signals Network
          </span>
        )}
      </div>
    </div>
  );
};

