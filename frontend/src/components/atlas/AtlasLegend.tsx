import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitFork, ShieldCheck, CheckCircle2, Radio } from 'lucide-react';
import { CATEGORY_PALETTE, getCategoryGlyph } from './AtlasSymbols';
import { ReportCategory } from '../../theme/tokens';

interface AtlasLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtlasLegend: React.FC<AtlasLegendProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = Object.keys(CATEGORY_PALETTE) as ReportCategory[];

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-label="Cartographic Visual Guide"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto absolute bottom-14 sm:bottom-16 left-2 right-2 sm:left-auto sm:right-16 w-auto sm:w-88 max-w-[calc(100%-16px)] sm:max-w-none max-h-[calc(100%-72px)] overflow-y-auto bg-white/98 backdrop-blur-md border border-[#E6EAE6] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 z-[510] space-y-3 sm:space-y-4 text-[#182322] shadow-[0_12px_40px_rgba(24,35,34,0.12)] text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6EAE6] pb-2.5">
          <div>
            <span className="font-mono font-bold tracking-wider uppercase text-[#727C79] text-[10px] block">
              Cartographic Visual Guide
            </span>
            <span className="font-bold text-[#182322] text-xs">Map Symbols & Layers</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5] transition-colors"
            title="Close Legend (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        {/* 1. Four Signal Statuses */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-[#727C79] tracking-wider block font-bold">
            Signal & Incident States
          </span>
          <div className="space-y-2">
            {/* Reported Community Issue */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xl border border-[#E6EAE6] bg-white flex items-center justify-center shrink-0 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#182322]" />
              </span>
              <div>
                <span className="font-semibold text-[#182322] block leading-tight">Reported Issue</span>
                <span className="text-[10px] text-[#727C79]">Citizen report awaiting coordinator review</span>
              </div>
            </div>

            {/* Candidate Signal Cluster */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xl border-2 border-dashed border-[#D99A45] bg-[#FFFBEB] flex items-center justify-center text-[10px] text-[#D99A45] font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D99A45] animate-pulse" />
              </span>
              <div>
                <span className="font-semibold text-[#D99A45] block leading-tight">Candidate Cluster</span>
                <span className="text-[10px] text-[#727C79]">AI-detected spatial / hydraulic pattern</span>
              </div>
            </div>

            {/* Coordinator-Verified Incident */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xl border-2 border-[#D9534F] bg-[#FEF2F2] flex items-center justify-center text-[10px] font-bold text-[#D9534F] shrink-0">
                ✓
              </span>
              <div>
                <span className="font-semibold text-[#D9534F] block leading-tight">Verified Incident</span>
                <span className="text-[10px] text-[#727C79]">Confirmed by coordinator; crew dispatched</span>
              </div>
            </div>

            {/* Resolved Ticket */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-xl border-2 border-[#286B56] bg-[#E1F0E8] flex items-center justify-center text-[10px] font-bold text-[#286B56] shrink-0">
                ✓
              </span>
              <div>
                <span className="font-semibold text-[#286B56] block leading-tight">Resolved Incident</span>
                <span className="text-[10px] text-[#727C79]">Remediation completed and field-verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Signal Threads */}
        <div className="space-y-1.5 pt-2.5 border-t border-[#E6EAE6]">
          <span className="text-[10px] font-mono uppercase text-[#727C79] tracking-wider block font-bold">
            Network Relationship Threads
          </span>
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-2 rounded-full border-b-2 border-dashed border-[#D99A45] shrink-0" />
            <div className="text-[11px]">
              <span className="font-semibold text-[#D99A45] block leading-tight">Candidate Thread</span>
              <span className="text-[10px] text-[#727C79]">Quadratic Bézier curve linking correlated signals</span>
            </div>
          </div>
        </div>

        {/* 3. Category Symbols */}
        <div className="space-y-1.5 pt-2.5 border-t border-[#E6EAE6]">
          <span className="text-[10px] font-mono uppercase text-[#727C79] tracking-wider block font-bold">
            Civic Infrastructure Categories
          </span>
          <div className="grid grid-cols-1 gap-1">
            {categories.map((catKey) => {
              const meta = CATEGORY_PALETTE[catKey];
              const glyph = getCategoryGlyph(catKey, meta.color);
              return (
                <div key={catKey} className="flex items-center gap-2 py-0.5">
                  <div
                    className="w-5 h-5 rounded-lg flex items-center justify-center border border-[#E6EAE6] bg-[#F8F8F5] shrink-0"
                    dangerouslySetInnerHTML={{ __html: glyph }}
                  />
                  <span className="text-[11px] text-[#182322] font-medium">{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
