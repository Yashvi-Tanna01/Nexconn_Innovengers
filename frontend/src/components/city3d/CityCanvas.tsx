import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import { CityEnvironment } from './CityEnvironment';
import { CityCameraRig } from './CityCameraRig';
import { CityFallback } from './CityFallback';
import { CitySignal, SAMPLE_CITY_SIGNALS } from './types';
import { CategoryBadge, StatusBadge, AiCandidateBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { REPORT_CATEGORIES } from '../../theme/tokens';
import {
  Sparkles,
  X,
  Compass,
  ArrowRight,
  RotateCcw,
  Info,
  Layers,
} from 'lucide-react';

interface CityCanvasProps {
  className?: string;
  onSignalClick?: (signal: CitySignal) => void;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  className = '',
  onSignalClick,
}) => {
  const [selectedSignal, setSelectedSignal] = useState<CitySignal | null>(
    SAMPLE_CITY_SIGNALS[0] // Preselect first signal for immediate engaging inspection
  );
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const handleSelectSignal = (signal: CitySignal) => {
    setSelectedSignal(signal);
    if (onSignalClick) onSignalClick(signal);
  };

  const handleReset = () => {
    setSelectedSignal(null);
  };

  return (
    <div
      className={`relative w-full h-[540px] sm:h-[620px] rounded-2xl overflow-hidden border border-antah-border bg-gradient-to-b from-[#FBFBF9] via-[#F4F4F0] to-[#EAEAE5] shadow-soft-lg select-none ${className}`}
    >
      {/* 3D Scene or Graceful 2D Fallback */}
      {hasWebGL ? (
        <Suspense fallback={<CityFallback signals={SAMPLE_CITY_SIGNALS} selectedSignal={selectedSignal} onSelectSignal={handleSelectSignal} />}>
          <Canvas
            shadows
            camera={{ position: [9, 8, 9], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <CityEnvironment
              signals={SAMPLE_CITY_SIGNALS}
              selectedSignal={selectedSignal}
              onSelectSignal={handleSelectSignal}
            />
            <CityCameraRig selectedSignal={selectedSignal} />
          </Canvas>
        </Suspense>
      ) : (
        <CityFallback
          signals={SAMPLE_CITY_SIGNALS}
          selectedSignal={selectedSignal}
          onSelectSignal={handleSelectSignal}
        />
      )}

      {/* Top HUD Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full antah-panel shadow-soft-xs text-xs font-mono text-antah-navy">
          <span className="w-2 h-2 rounded-full bg-antah-teal animate-pulse" />
          <span className="font-semibold">3D CIVIC TWIN</span>
          <span className="hidden sm:inline text-antah-muted">| Drag to orbit • Scroll to zoom</span>
        </div>

        {selectedSignal && (
          <button
            onClick={handleReset}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full antah-panel shadow-soft-xs text-xs font-semibold text-antah-slate hover:text-antah-navy hover:border-slate-300 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset Camera</span>
          </button>
        )}
      </div>

      {/* Bottom Left: Signal Category Indicators */}
      <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-2 p-2 rounded-xl antah-panel text-[11px] font-medium text-antah-slate shadow-soft-sm pointer-events-auto">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-antah-border">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Water</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-antah-border">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>Drainage</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-antah-border">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Roads</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-antah-border">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Lighting</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-antah-border">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <span>Structure</span>
        </div>
      </div>

      {/* Selected Signal Inspection Drawer / Panel */}
      {selectedSignal && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full antah-panel rounded-xl p-5 shadow-soft-lg z-20 pointer-events-auto border border-antah-border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-antah-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {selectedSignal.id}
              </span>
              <CategoryBadge category={selectedSignal.category} size="sm" />
            </div>
            <button
              onClick={() => setSelectedSignal(null)}
              className="p-1 rounded-md text-antah-muted hover:text-antah-navy hover:bg-slate-100 transition-colors"
              aria-label="Close signal inspector"
            >
              <X size={16} />
            </button>
          </div>

          <h4 className="text-sm font-bold text-antah-navy leading-snug">
            {selectedSignal.title}
          </h4>

          <p className="text-xs text-antah-slate mt-1.5 leading-relaxed">
            {selectedSignal.description}
          </p>

          <div className="mt-3 pt-3 border-t border-antah-border-light flex items-center justify-between text-[11px] text-antah-muted">
            <span className="truncate max-w-[170px]" title={selectedSignal.locationName}>
              📍 {selectedSignal.locationName}
            </span>
            <StatusBadge status={selectedSignal.status} size="sm" />
          </div>

          {/* Candidate correlation insight banner */}
          {selectedSignal.status === 'candidate_pattern' && selectedSignal.candidateReason && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50/90 border border-amber-200/90 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                <Sparkles size={13} className="text-amber-600 animate-pulse" />
                <span>AI Candidate Relationship</span>
                {selectedSignal.confidenceScore && (
                  <span className="font-mono text-[10px] bg-amber-200/70 text-amber-800 px-1 py-0.2 rounded ml-auto">
                    {Math.round(selectedSignal.confidenceScore * 100)}% Match
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-900 leading-normal">
                {selectedSignal.candidateReason}
              </p>
              <div className="mt-1 text-[10px] text-amber-700 italic">
                *Requires verification by civic coordinator.
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Link to={`/explorer?signalId=${selectedSignal.id}`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                icon={<Compass size={14} />}
                className="w-full text-xs justify-center"
              >
                Inspect in Network
              </Button>
            </Link>
            <Link to="/report">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs whitespace-nowrap"
              >
                Add Update
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

