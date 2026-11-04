import React from 'react';
import { DISTRICTS, District, CitySignal } from '../city3d/types';
import { REPORT_CATEGORIES } from '../../theme/tokens';
import { Compass } from 'lucide-react';

interface MiniRadarProps {
  signals: CitySignal[];
  selectedSignal: CitySignal | null;
  selectedDistrict: District | null;
  onSelectDistrict: (district: District) => void;
  onSelectSignal: (signal: CitySignal) => void;
  className?: string;
}

export const MiniRadar: React.FC<MiniRadarProps> = ({
  signals,
  selectedSignal,
  selectedDistrict,
  onSelectDistrict,
  onSelectSignal,
  className = '',
}) => {
  const radarSize = 130;
  const center = radarSize / 2;
  const radius = center - 8;

  // Map 3D coordinate [-7..7] to radar bounds
  const mapCoord = (x: number, z: number) => {
    const rx = center + (x / 7.5) * radius;
    const ry = center + (z / 7.5) * radius;
    return { rx, ry };
  };

  return (
    <div
      className={`relative w-[150px] p-2.5 antah-panel rounded-2xl border border-white/80 shadow-soft-md select-none ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[10px] font-mono font-bold tracking-wider text-antah-navy flex items-center gap-1">
          <Compass size={11} className="text-antah-teal animate-spin" style={{ animationDuration: '8s' }} />
          <span>CIVIC RADAR</span>
        </span>
        <span className="text-[9px] font-mono text-antah-teal font-semibold">N 0°</span>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
          {/* Radar background disk */}
          <circle cx={center} cy={center} r={radius} fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

          {/* Concentric distance rings */}
          <circle cx={center} cy={center} r={radius * 0.66} fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx={center} cy={center} r={radius * 0.33} fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 3" />

          {/* Crosshairs */}
          <line x1={center} y1={8} x2={center} y2={radarSize - 8} stroke="#CBD5E1" strokeWidth="0.8" />
          <line x1={8} y1={center} x2={radarSize - 8} y2={center} stroke="#CBD5E1" strokeWidth="0.8" />

          {/* District Quadrant Fill Highlights */}
          {DISTRICTS.map((d) => {
            const isSelected = selectedDistrict?.id === d.id;
            const { rx, ry } = mapCoord(d.center[0], d.center[2]);
            return (
              <g
                key={d.id}
                onClick={() => onSelectDistrict(d)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <circle
                  cx={rx}
                  cy={ry}
                  r={16}
                  fill={d.color}
                  fillOpacity={isSelected ? 0.3 : 0.12}
                />
                <text
                  x={rx}
                  y={ry + 3}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#0F172A"
                >
                  {d.code}
                </text>
              </g>
            );
          })}

          {/* Signal Blips */}
          {signals.map((sig) => {
            const { rx, ry } = mapCoord(sig.position[0], sig.position[2]);
            const isSelected = selectedSignal?.id === sig.id;
            const cat = REPORT_CATEGORIES[sig.category];

            return (
              <g
                key={sig.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSignal(sig);
                }}
                className="cursor-pointer transition-transform duration-150 hover:scale-125"
              >
                {isSelected && (
                  <circle cx={rx} cy={ry} r={6} fill={cat.color} fillOpacity={0.4} className="animate-ping" />
                )}
                <circle
                  cx={rx}
                  cy={ry}
                  r={isSelected ? 3.5 : 2.5}
                  fill={cat.color}
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-antah-muted px-1">
        <span>ACTIVE: {signals.length}</span>
        <span className="text-antah-teal">SEC-3 HIGH</span>
      </div>
    </div>
  );
};

