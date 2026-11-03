import React from 'react';
import { CitySignal } from './types';
import { REPORT_CATEGORIES } from '../../theme/tokens';
import { Sparkles, MapPin, AlertTriangle } from 'lucide-react';

interface CityFallbackProps {
  signals: CitySignal[];
  selectedSignal: CitySignal | null;
  onSelectSignal: (signal: CitySignal) => void;
}

export const CityFallback: React.FC<CityFallbackProps> = ({
  signals,
  selectedSignal,
  onSelectSignal,
}) => {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100/80 rounded-panel border border-antah-border p-6 flex flex-col justify-between overflow-hidden">
      {/* Fallback Notice Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-antah-border-light z-10">
        <div className="flex items-center gap-2 text-xs font-mono text-antah-slate">
          <span className="w-2.5 h-2.5 rounded-full bg-antah-teal animate-pulse" />
          <span>2D ISOMETRIC CIVIC MATRIX MODE (HARDWARE ACCELERATION FALLBACK)</span>
        </div>
        <span className="text-[11px] text-antah-muted">Interactive pins active</span>
      </div>

      {/* Isometric Vector Simulation */}
      <div className="relative flex-1 flex items-center justify-center my-4">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full max-h-[460px] filter drop-shadow-sm select-none"
        >
          {/* Street Blocks */}
          <rect x="120" y="80" width="240" height="140" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <rect x="440" y="80" width="240" height="140" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <rect x="120" y="280" width="240" height="140" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <rect x="440" y="280" width="240" height="140" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

          {/* Park Area */}
          <rect x="260" y="180" width="100" height="80" rx="6" fill="#D1FAE5" opacity="0.6" />
          <circle cx="310" cy="220" r="16" fill="#059669" opacity="0.8" />

          {/* Central Avenues */}
          <line x1="60" y1="250" x2="740" y2="250" stroke="#CBD5E1" strokeWidth="24" strokeLinecap="round" />
          <line x1="60" y1="250" x2="740" y2="250" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="12 12" />
          <line x1="400" y1="40" x2="400" y2="460" stroke="#CBD5E1" strokeWidth="24" strokeLinecap="round" />
          <line x1="400" y1="40" x2="400" y2="460" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="12 12" />

          {/* Candidate Correlation Connecting Line between 2 reports */}
          <path
            d="M 230 190 Q 300 130 370 210"
            fill="none"
            stroke="#D97706"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Interactive Signal Pins */}
          {signals.map((sig, idx) => {
            // Map 3D coords [-6..6] to SVG [150..650, 100..400]
            const svgX = 400 + sig.position[0] * 38;
            const svgY = 250 + sig.position[2] * 32;
            const isSelected = selectedSignal?.id === sig.id;
            const cat = REPORT_CATEGORIES[sig.category];

            return (
              <g
                key={sig.id}
                transform={`translate(${svgX}, ${svgY})`}
                onClick={() => onSelectSignal(sig)}
                className="cursor-pointer transition-transform duration-150 hover:scale-125"
              >
                {/* Pulse Ring */}
                <circle
                  r={isSelected ? 22 : 14}
                  fill={cat.color}
                  fillOpacity={isSelected ? 0.3 : 0.15}
                  className="animate-ping"
                />
                {/* Pin Circle */}
                <circle
                  r={isSelected ? 14 : 10}
                  fill={cat.color}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                {/* Center dot */}
                <circle r="3.5" fill="#FFFFFF" />

                {/* Pin Label */}
                <text
                  y="-16"
                  textAnchor="middle"
                  fill="#0B132B"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {sig.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-[11px] text-antah-muted text-center pt-2 border-t border-antah-border-light">
        Tip: Click any signal pin above to inspect observation telemetry and proposed AI candidate patterns.
      </div>
    </div>
  );
};

