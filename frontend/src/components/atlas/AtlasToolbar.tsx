import React from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  GitFork,
  HelpCircle,
  Navigation,
  Layers,
} from 'lucide-react';
import { ReportCategory } from '../../theme/tokens';
import { CATEGORY_PALETTE } from './AtlasSymbols';

interface AtlasToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateUser?: () => void;
  isLocating?: boolean;
  showThreads: boolean;
  onToggleThreads: () => void;
  showLegend: boolean;
  onToggleLegend: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
  totalSignals: number;
}

export const AtlasToolbar: React.FC<AtlasToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateUser,
  isLocating = false,
  showThreads,
  onToggleThreads,
  showLegend,
  onToggleLegend,
  selectedCategory,
  onSelectCategory,
  totalSignals,
}) => {
  const categories = Object.keys(CATEGORY_PALETTE) as ReportCategory[];

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

      {/* 2. BOTTOM FLOATING CATEGORY FILTER RIBBON (Horizontally Scrollable Strip) */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto flex items-center gap-1.5 overflow-x-auto max-w-[calc(100%-24px)] sm:max-w-xl md:max-w-2xl pointer-events-auto z-[500] p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E6EAE6] shadow-[0_4px_16px_rgba(24,35,34,0.06)] scrollbar-none box-border">
        {/* All Signals chip */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-[#182322] text-white shadow-xs'
              : 'text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5]'
          }`}
        >
          All Signals ({totalSignals})
        </button>

        {/* Categories */}
        {categories.map((catKey) => {
          const isCatSelected = selectedCategory === catKey;
          const meta = CATEGORY_PALETTE[catKey];
          return (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
                isCatSelected
                  ? 'bg-[#E1F0E8] text-[#286B56] border border-[#286B56]/30 shadow-xs'
                  : 'text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: meta.color }}
              />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default AtlasToolbar;
