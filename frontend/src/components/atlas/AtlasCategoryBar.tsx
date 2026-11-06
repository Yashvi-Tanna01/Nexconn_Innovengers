import React from 'react';
import { ReportCategory } from '../../theme/tokens';
import { CATEGORY_PALETTE } from './AtlasSymbols';

interface AtlasCategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalSignals: number;
  className?: string;
}

export const AtlasCategoryBar: React.FC<AtlasCategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  totalSignals,
  className = '',
}) => {
  const categories = Object.keys(CATEGORY_PALETTE) as ReportCategory[];

  return (
    <nav
      aria-label="Category filters"
      className={`w-full bg-white/95 backdrop-blur-md border border-[#E6EAE6] rounded-2xl p-1.5 sm:p-2 shadow-2xs select-none box-border ${className}`}
    >
      <div className="w-full flex items-center">
        <div
          tabIndex={0}
          aria-label="Filter by category"
          className="flex items-center gap-1.5 overflow-x-auto w-full scrollbar-none py-0.5 overscroll-x-contain touch-pan-x"
        >
          {/* All Signals chip */}
          <button
            type="button"
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
                type="button"
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
      </div>
    </nav>
  );
};

export default AtlasCategoryBar;

