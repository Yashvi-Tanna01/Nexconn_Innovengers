import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CityEnvironment } from './CityEnvironment';
import { CityCameraRig } from './CityCameraRig';
import { CityFallback } from './CityFallback';
import { CitySignal, District, CameraPreset, DISTRICTS, SAMPLE_CITY_SIGNALS } from './types';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { MiniRadar } from '../spatial/MiniRadar';
import { NexconnChatPanel } from '../chat/NexconnChatPanel';
import { panelVariants } from '../../theme/motion';
import { usePerformanceSettings } from '../../utils/performance';
import { detectDeviceTier } from '../../utils/device';
import {
  Sparkles,
  X,
  Compass,
  RotateCcw,
  MessageSquare,
  Sliders,
  ChevronDown,
} from 'lucide-react';

interface CityCanvasProps {
  className?: string;
  onSignalClick?: (signal: CitySignal) => void;
  showFullHUD?: boolean;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  className = '',
  onSignalClick,
  showFullHUD = true,
}) => {
  const [selectedSignal, setSelectedSignal] = useState<CitySignal | null>(
    SAMPLE_CITY_SIGNALS[0]
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<District | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [activeChatIncident, setActiveChatIncident] = useState<{ id: string; title: string } | null>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isInViewport, setIsInViewport] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Performance engine monitoring
  const perfSettings = usePerformanceSettings();
  const deviceTier = useMemo(() => detectDeviceTier(), []);

  // Viewport IntersectionObserver to pause rendering when scrolled offscreen
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
    setSelectedDistrict(null);
    if (onSignalClick) onSignalClick(signal);
  };

  const handleSelectDistrict = (district: District) => {
    setSelectedDistrict(district);
    setSelectedSignal(null);
  };

  const handleReset = () => {
    setSelectedSignal(null);
    setSelectedDistrict(null);
    setCameraPreset('overview');
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[520px] sm:h-[620px] lg:h-[720px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/80 bg-gradient-to-b from-[#FBFBF9] via-[#F4F4F0] to-[#E8E8E2] shadow-[0_16px_45px_rgba(11,19,43,0.08)] select-none ${className}`}
    >
      {/* 3D Scene or Graceful 2D Fallback */}
      {hasWebGL ? (
        <Suspense
          fallback={
            <CityFallback
              signals={SAMPLE_CITY_SIGNALS}
              selectedSignal={selectedSignal}
              onSelectSignal={handleSelectSignal}
            />
          }
        >
          <Canvas
            frameloop={!isInViewport || !perfSettings.isTabVisible ? 'never' : 'always'}
            shadows={perfSettings.enableShadows}
            camera={{ position: [10.5, 9.5, 10.5], fov: deviceTier.isMobile ? 46 : 40 }}
            gl={{
              antialias: perfSettings.tier !== 'performance',
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
            dpr={perfSettings.dpr}
            style={{ touchAction: 'none' }} // Prevents mobile touch pull-to-refresh
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <CityEnvironment
              signals={SAMPLE_CITY_SIGNALS}
              selectedSignal={selectedSignal}
              selectedDistrict={selectedDistrict}
              hoveredDistrict={hoveredDistrict}
              onSelectSignal={handleSelectSignal}
              onSelectDistrict={handleSelectDistrict}
              onHoverDistrict={setHoveredDistrict}
            />
            <CityCameraRig
              selectedSignal={selectedSignal}
              selectedDistrict={selectedDistrict}
              preset={cameraPreset}
            />
          </Canvas>
        </Suspense>
      ) : (
        <CityFallback
          signals={SAMPLE_CITY_SIGNALS}
          selectedSignal={selectedSignal}
          onSelectSignal={handleSelectSignal}
        />
      )}

      {/* TOP HUD: Cinematic Mode & Camera Perspective Switcher */}
      {showFullHUD && (
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
          {/* Left: Platform Telemetry Pill */}
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full antah-panel shadow-soft-xs text-xs font-mono text-antah-navy border border-white/80">
            <span className="w-2 h-2 rounded-full bg-antah-teal animate-pulse" />
            <span className="font-extrabold tracking-wider">ANTAH 3D TWIN</span>
            <span className="hidden md:inline text-antah-muted">| {deviceTier.isMobile ? 'Mobile' : 'Desktop'} Tier</span>
          </div>

          {/* Right: Camera Presets */}
          <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-full antah-panel shadow-soft-xs border border-white/80 text-xs">
            <button
              onClick={() => {
                setCameraPreset('overview');
                setSelectedSignal(null);
                setSelectedDistrict(null);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-semibold transition-all min-h-[32px] ${
                cameraPreset === 'overview' && !selectedSignal && !selectedDistrict
                  ? 'bg-antah-navy text-white shadow-soft-xs'
                  : 'text-antah-slate hover:text-antah-navy'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setCameraPreset('street');
                setSelectedSignal(null);
                setSelectedDistrict(null);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-semibold transition-all min-h-[32px] ${
                cameraPreset === 'street'
                  ? 'bg-antah-navy text-white shadow-soft-xs'
                  : 'text-antah-slate hover:text-antah-navy'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => {
                setCameraPreset('patrol');
                setSelectedSignal(null);
                setSelectedDistrict(null);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-semibold transition-all min-h-[32px] ${
                cameraPreset === 'patrol'
                  ? 'bg-antah-teal text-white shadow-soft-xs'
                  : 'text-antah-slate hover:text-antah-navy'
              }`}
            >
              Patrol
            </button>

            {(selectedSignal || selectedDistrict || cameraPreset !== 'overview') && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded-full text-antah-muted hover:text-antah-navy hover:bg-slate-100 transition-colors ml-0.5 focus:outline-none min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Reset Camera View"
                aria-label="Reset Camera View"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TOP-LEFT DISTRICT SELECTOR (Desktop/Tablet) */}
      {showFullHUD && (
        <div className="absolute top-16 left-4 hidden sm:flex flex-col gap-1.5 pointer-events-auto z-10">
          <span className="text-[10px] font-mono uppercase font-bold text-antah-muted tracking-wider px-1">
            Districts
          </span>
          <div className="flex flex-col gap-1 p-1.5 rounded-xl antah-panel shadow-soft-xs border border-white/80">
            {DISTRICTS.map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelectDistrict(d)}
                className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDistrict?.id === d.id
                    ? 'bg-white text-antah-navy shadow-soft-xs border border-slate-200'
                    : 'text-antah-slate hover:text-antah-navy hover:bg-white/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="truncate max-w-[120px]">{d.name}</span>
                </span>
                <span className="font-mono text-[10px] text-antah-muted">{d.activeCount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM-LEFT: MINI-RADAR (Hidden on small mobile to maximize touch canvas) */}
      <div className="absolute bottom-4 left-4 hidden lg:flex flex-col gap-2.5 pointer-events-auto z-10">
        <MiniRadar
          signals={SAMPLE_CITY_SIGNALS}
          selectedSignal={selectedSignal}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrict}
          onSelectSignal={handleSelectSignal}
        />
      </div>

      {/* MOBILE & DESKTOP RESPONSIVE SIGNAL INSPECTION DRAWER */}
      <AnimatePresence>
        {selectedSignal && !activeChatIncident && (
          <motion.div
            variants={shouldReduceMotion ? undefined : panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute bottom-0 left-0 right-0 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm w-full antah-panel rounded-t-3xl sm:rounded-2xl p-5 shadow-soft-xl z-20 pointer-events-auto border-t sm:border border-white/90 max-h-[82vh] overflow-y-auto"
          >
            {/* Mobile Drag/Grab Bar Indicator */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-antah-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {selectedSignal.id}
                </span>
                <CategoryBadge category={selectedSignal.category} size="sm" />
              </div>
              <button
                onClick={() => setSelectedSignal(null)}
                className="p-1.5 rounded-lg text-antah-muted hover:text-antah-navy hover:bg-slate-100 transition-colors"
                aria-label="Close inspector"
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

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-antah-muted">
              <div className="flex items-center justify-between">
                <span className="truncate max-w-[180px]">📍 {selectedSignal.locationName}</span>
                <StatusBadge status={selectedSignal.status} size="sm" />
              </div>
              {selectedSignal.affectedInfrastructure && (
                <div className="text-[10px] font-mono text-antah-teal truncate">
                  Asset: {selectedSignal.affectedInfrastructure}
                </div>
              )}
            </div>

            {/* AI Candidate Pattern Banner */}
            {selectedSignal.status === 'candidate_pattern' && selectedSignal.candidateReason && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <Sparkles size={13} className="text-amber-600 animate-pulse" />
                  <span>AI Candidate Relationship</span>
                  {selectedSignal.confidenceScore && (
                    <span className="font-mono text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded ml-auto">
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

            {/* Touch-Friendly Action Buttons (min height 42px on touch screens) */}
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<MessageSquare size={14} />}
                onClick={() =>
                  setActiveChatIncident({ id: selectedSignal.id, title: selectedSignal.title })
                }
                className="flex-1 text-xs justify-center font-bold min-h-[42px]"
              >
                Nexconn Chat
              </Button>
              <Link to={`/explorer?signalId=${selectedSignal.id}`}>
                <Button variant="secondary" size="sm" icon={<Compass size={14} />} className="text-xs min-h-[42px]">
                  Inspect
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEXCONN CHAT MODAL (Responsive for Android & Desktop) */}
      <AnimatePresence>
        {activeChatIncident && (
          <motion.div
            variants={shouldReduceMotion ? undefined : panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[420px] z-50 sm:z-30 pointer-events-auto bg-black/25 sm:bg-transparent flex flex-col justify-end sm:justify-auto"
          >
            <NexconnChatPanel
              incidentId={activeChatIncident.id}
              incidentTitle={activeChatIncident.title}
              onClose={() => setActiveChatIncident(null)}
              className="h-[80vh] sm:h-[520px] rounded-t-3xl sm:rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
