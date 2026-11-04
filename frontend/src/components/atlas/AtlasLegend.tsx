import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitFork, ShieldCheck, Radio } from 'lucide-react';
import { CATEGORY_PALETTE, getCategoryGlyph } from './AtlasSymbols';
import { ReportCategory } from '../../theme/tokens';

interface AtlasLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtlasLegend: React.FC<AtlasLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = Object.keys(CATEGORY_PALETTE) as ReportCategory[];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-auto absolute bottom-16 right-3 sm:right-4 w-72 sm:w-80 bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl p-4 z-[500] backdrop-blur-md space-y-3.5 text-antah-navy text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-mono font-bold tracking-wider uppercase text-slate-500 text-[11px]">
            Cartographic Visual Guide
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-antah-navy hover:bg-slate-100"
            title="Close Legend"
          >
            <X size={14} />
          </button>
        </div>

        {/* 1. Category Symbols */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
            Civic Report Categories
          </span>
          <div className="grid grid-cols-1 gap-1">
            {categories.map((catKey) => {
              const meta = CATEGORY_PALETTE[catKey];
              const glyph = getCategoryGlyph(catKey, meta.color);
              return (
                <div key={catKey} className="flex items-center gap-2.5 py-0.5">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center border border-slate-200 shrink-0"
                    dangerouslySetInnerHTML={{ __html: glyph }}
                  />
                  <span className="text-[11px] text-slate-700 font-medium">{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Relationship States */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
            Network Relationship States
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-2 rounded-full border-b-2 border-dashed border-amber-500 shrink-0" />
              <div className="text-[11px]">
                <span className="font-semibold text-amber-900 block">Candidate Signal Thread</span>
                <span className="text-[10px] text-slate-400">AI-inferred spatial or hydraulic pattern</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md border-2 border-teal-600 bg-teal-50 flex items-center justify-center text-[9px] font-bold text-teal-700 shrink-0">
                ✓
              </span>
              <div className="text-[11px]">
                <span className="font-semibold text-teal-900 block">Verified Incident</span>
                <span className="text-[10px] text-slate-400">Coordinator-confirmed dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

