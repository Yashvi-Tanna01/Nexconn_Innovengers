import React from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  GitFork,
  HelpCircle,
  Navigation,
  Radio,
} from 'lucide-react';

interface AtlasToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateUser?: () => void;
  isLocating?: boolean;
  onTriggerRadar?: () => void;
  isScanningRadar?: boolean;
  showThreads: boolean;
  onToggleThreads: () => void;
  showLegend: boolean;
  onToggleLegend: () => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
  totalSignals?: number;
}

export const AtlasToolbar: React.FC<AtlasToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateUser,
  isLocating = false,
  onTriggerRadar,
  isScanningRadar = false,
  showThreads,
  onToggleThreads,
  showLegend,
  onToggleLegend,
}) => {
  return (
    <>
      {/* 1. TOP-RIGHT FLOATING MAP CONTROL STACK */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col items-center gap-1.5 pointer-events-none z-[500]">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E6EAE6] rounded-2xl shadow-[0_4px_20px_rgba(24,35,34,0.08)] p-1 flex flex-col gap-1">
          {/* Zoom In */}
          <button
            onClick={onZoomIn}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[#182322] hover:bg-[#F8F8F5] active:scale-95 transition-all"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus size={16} />
          </button>

          {/* Zoom Out */}
          <button
            onClick={onZoomOut}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[#182322] hover:bg-[#F8F8F5] active:scale-95 transition-all"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus size={16} />
          </button>

          <div className="w-6 h-px bg-[#E6EAE6] mx-auto my-0.5" />

          {/* Recenter */}
          <button
            onClick={onRecenter}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5] active:scale-95 transition-all"
            title="Recenter Map View"
            aria-label="Recenter Map View"
          >
            <Crosshair size={16} />
          </button>

          {/* Locate User (GPS) */}
          {onLocateUser && (
            <button
              onClick={onLocateUser}
              disabled={isLocating}
              className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
                isLocating
                  ? 'text-[#D99A45] bg-[#FFF7ED] animate-spin'
                  : 'text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5]'
              }`}
              title="Locate My Position (GPS)"
              aria-label="Locate My Position"
            >
              <Navigation size={15} className={isLocating ? 'rotate-45' : ''} />
            </button>
          )}

          {/* Tactical Radar Scan */}
          {onTriggerRadar && (
            <button
              onClick={onTriggerRadar}
              disabled={isScanningRadar}
              className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
                isScanningRadar
                  ? 'text-[#087B56] bg-emerald-50 ring-2 ring-[#087B56]/30'
                  : 'text-[#727C79] hover:text-[#087B56] hover:bg-[#F8F8F5]'
              }`}
              title="Initiate Tactical Radar Grid Scan"
              aria-label="Initiate Tactical Radar Scan"
            >
              <Radio size={15} className={isScanningRadar ? 'animate-pulse text-[#087B56]' : ''} />
            </button>
          )}

          <div className="w-6 h-px bg-[#E6EAE6] mx-auto my-0.5" />

          {/* Toggle Threads */}
          <button
            onClick={onToggleThreads}
            className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
              showThreads
                ? 'bg-[#FFF7ED] text-[#D99A45] shadow-2xs'
                : 'text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5]'
            }`}
            title={showThreads ? 'Hide Signal Threads' : 'Show Signal Threads'}
            aria-label="Toggle Signal Correlation Threads"
          >
            <GitFork size={15} />
          </button>

          {/* Toggle Cartographic Legend */}
          <button
            onClick={onToggleLegend}
            className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
              showLegend
                ? 'bg-[#E1F0E8] text-[#286B56]'
                : 'text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5]'
            }`}
            title="Map Symbols & Legend"
            aria-label="Cartographic Legend"
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AtlasToolbar;
