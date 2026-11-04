import React from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  GitFork,
  HelpCircle,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { ReportCategory } from '../../theme/tokens';
import { CATEGORY_PALETTE } from './AtlasSymbols';

interface AtlasToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  showThreads: boolean;
  onToggleThreads: () => void;
  showLegend: boolean;
  onToggleLegend: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  totalSignals: number;
}

export const AtlasToolbar: React.FC<AtlasToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  showThreads,
  onToggleThreads,
  showLegend,
  onToggleLegend,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  totalSignals,
}) => {
  const categories = Object.keys(CATEGORY_PALETTE) as ReportCategory[];

  return (
    <>
      {/* Top Header Pill Bar (Desktop & Mobile) */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-[500]">
        {/* Left Editorial Title Badge */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200/90 shadow-soft-xs text-xs font-mono text-antah-navy backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-antah-teal animate-pulse" />
          <span className="font-extrabold tracking-wider uppercase">City Signal Atlas</span>
          <span className="text-slate-400">|</span>
          <span className="text-antah-slate font-medium text-[11px]">Bangalore East • {totalSignals} Active Signals</span>
        </div>

        {/* Right Floating Actions */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-full bg-white/95 border border-slate-200/90 shadow-soft-xs backdrop-blur-sm">
          {/* Signal Threads Toggle */}
          <button
            onClick={onToggleThreads}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[32px] ${
              showThreads
                ? 'bg-amber-50 border border-amber-300/80 text-amber-800 shadow-sm'
                : 'text-antah-slate hover:text-antah-navy'
            }`}
            title="Toggle Candidate Relationship Threads"
          >
            <GitFork size={13} className={showThreads ? 'text-amber-600' : 'text-slate-400'} />
            <span className="hidden sm:inline">Signal Threads</span>
          </button>

          {/* Legend Toggle */}
          <button
            onClick={onToggleLegend}
            className={`p-1.5 rounded-full transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
              showLegend ? 'bg-slate-100 text-antah-navy' : 'text-antah-slate hover:text-antah-navy'
            }`}
            title="Cartographic Legend"
            aria-label="Cartographic Legend"
          >
            <HelpCircle size={15} />
          </button>

          {/* Recenter Map */}
          <button
            onClick={onRecenter}
            className="p-1.5 rounded-full text-antah-slate hover:text-antah-navy hover:bg-slate-100 transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Recenter City Extent"
            aria-label="Recenter City Extent"
          >
            <Crosshair size={14} />
          </button>

          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-0.5 border-l border-slate-200/80 pl-1">
            <button
              onClick={onZoomIn}
              className="p-1.5 rounded-full text-antah-slate hover:text-antah-navy hover:bg-slate-100 transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={onZoomOut}
              className="p-1.5 rounded-full text-antah-slate hover:text-antah-navy hover:bg-slate-100 transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <Minus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Category Filter Ribbon */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto flex items-center gap-1.5 overflow-x-auto max-w-full pointer-events-auto z-[500] p-1.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-soft-xs backdrop-blur-sm">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[32px] ${
            selectedCategory === 'all'
              ? 'bg-antah-navy text-white shadow-soft-xs'
              : 'text-antah-slate hover:text-antah-navy hover:bg-slate-50'
          }`}
        >
          All Signals ({totalSignals})
        </button>

        {categories.map((catKey) => {
          const isCatSelected = selectedCategory === catKey;
          const meta = CATEGORY_PALETTE[catKey];
          return (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[32px] ${
                isCatSelected
                  ? 'bg-antah-teal text-white shadow-soft-xs'
                  : 'text-antah-slate hover:text-antah-navy hover:bg-slate-50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
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

