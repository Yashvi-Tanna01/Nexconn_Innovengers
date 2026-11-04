import React from 'react';

interface OperationLoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OperationLoadingIndicator: React.FC<OperationLoadingIndicatorProps> = ({
  label = 'Processing...',
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div className={`inline-flex items-center gap-2 font-mono ${textSize} ${className}`}>
      {/* Chromatic RGB Aberration Micro-Indicator mimicking ThreeUI chromatic pulse */}
      <div className={`relative ${iconSize} flex items-center justify-center`}>
        {/* Cyan chromatic channel */}
        <span
          className="absolute inset-0 rounded-full bg-cyan-400/80 animate-ping"
          style={{ animationDuration: '1.2s', animationDelay: '0s' }}
        />
        {/* Red/Magenta chromatic channel */}
        <span
          className="absolute inset-0 rounded-full bg-rose-500/70 animate-ping"
          style={{ animationDuration: '1.2s', animationDelay: '0.25s' }}
        />
        {/* Core crisp focal point */}
        <span className="relative z-10 w-2 h-2 rounded-full bg-antah-teal shadow-[0_0_8px_rgba(13,148,136,0.8)]" />
      </div>

      {label && <span className="font-semibold tracking-tight">{label}</span>}
    </div>
  );
};

