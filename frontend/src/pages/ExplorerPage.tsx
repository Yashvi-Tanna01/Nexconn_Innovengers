import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import { PageLoadingState } from '../components/loading';
import { REPORT_CATEGORIES, ReportCategory } from '../theme/tokens';
import { SAMPLE_CITY_SIGNALS, CitySignal } from '../components/city3d/types';
import {
  Compass,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const CityCanvas = React.lazy(() =>
  import('../components/city3d/CityCanvas').then((mod) => ({ default: mod.CityCanvas }))
);

export const ExplorerPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSignal, setActiveSignal] = useState<CitySignal | null>(SAMPLE_CITY_SIGNALS[0]);
  const shouldReduceMotion = useReducedMotion();

  const filteredSignals = SAMPLE_CITY_SIGNALS.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.title.toLowerCase().includes(q) ||
        s.locationName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-teal mb-1">
              <Compass size={14} className="animate-spin" style={{ animationDuration: '10s' }} />
              <span>SPATIAL CIVIC TWIN & TELEMETRY</span>
            </div>
            <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              City Explorer
            </h1>
            <p className="text-sm text-antah-slate mt-0.5">
              Interactive 3D digital twin of municipal infrastructure signals, district telemetry, and candidate patterns.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <Search size={16} className="absolute left-3.5 top-3 text-antah-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket, road, or symptom..."
              className="w-full bg-white text-antah-navy placeholder:text-antah-subtle text-xs rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-antah-teal/30 focus:border-antah-teal transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-antah-muted hover:text-antah-navy"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 3D Digital Twin Viewport (Centerpiece) */}
        <div className="w-full">
          <Suspense
            fallback={
              <PageLoadingState
                message="SYNTHESIZING 3D SPATIAL CIVIC TELEMETRY..."
                subMessage="ANTAH • Small signals today, safer tomorrow."
                minHeight="h-[580px] sm:h-[660px] lg:h-[720px]"
              />
            }
          >
            <CityCanvas onSignalClick={(sig) => setActiveSignal(sig)} />
          </Suspense>
        </div>

        {/* Filter Controls Row */}
        <div className="space-y-3 pt-2">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-antah-slate flex items-center gap-1 mr-1">
              <Filter size={13} /> Category:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-antah-navy text-white shadow-soft-xs'
                  : 'bg-white border border-slate-200 text-antah-slate hover:bg-slate-50'
              }`}
            >
              All Categories ({SAMPLE_CITY_SIGNALS.length})
            </button>
            {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((catKey) => {
              const count = SAMPLE_CITY_SIGNALS.filter((s) => s.category === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === catKey
                      ? 'bg-antah-teal text-white shadow-soft-xs'
                      : 'bg-white border border-slate-200 text-antah-slate hover:bg-slate-50'
                  }`}
                >
                  {REPORT_CATEGORIES[catKey].label} ({count})
                </button>
              );
            })}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-antah-slate flex items-center gap-1 mr-1">
              <SlidersHorizontal size={13} /> Status:
            </span>
            {['all', 'candidate_pattern', 'verified_incident', 'in_progress', 'submitted'].map((stKey) => (
              <button
                key={stKey}
                onClick={() => setSelectedStatus(stKey)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  selectedStatus === stKey
                    ? 'bg-slate-800 text-white shadow-soft-xs'
                    : 'bg-white border border-slate-200 text-antah-muted hover:text-antah-navy hover:bg-slate-50'
                }`}
              >
                {stKey === 'all'
                  ? 'All Statuses'
                  : stKey === 'candidate_pattern'
                  ? 'Candidate Patterns'
                  : stKey === 'verified_incident'
                  ? 'Verified Incidents'
                  : stKey === 'in_progress'
                  ? 'In Remediation'
                  : 'Recently Submitted'}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Signals Grid with Layout Animation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-antah-muted pb-1">
            <span>FILTERED SIGNALS: {filteredSignals.length}</span>
            <span>CLICK CARD TO FOCUS 3D TWIN</span>
          </div>

          <motion.div
            layout={!shouldReduceMotion}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredSignals.map((signal) => {
                const isSelected = activeSignal?.id === signal.id;
                return (
                  <motion.div
                    key={signal.id}
                    layout={!shouldReduceMotion}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card
                      variant="interactive"
                      tilt={true}
                      onClick={() => setActiveSignal(signal)}
                      className={`p-4 transition-all ${
                        isSelected
                          ? 'ring-2 ring-antah-teal shadow-soft-md bg-white'
                          : 'hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-antah-navy bg-slate-100 px-2 py-0.5 rounded">
                            {signal.id}
                          </span>
                          <CategoryBadge category={signal.category} size="sm" />
                        </div>
                        <StatusBadge status={signal.status} size="sm" />
                      </div>

                      <h4 className="text-sm font-bold text-antah-navy leading-snug">{signal.title}</h4>
                      <p className="text-xs text-antah-slate mt-1.5 line-clamp-2">{signal.description}</p>

                      {signal.candidateReason && (
                        <div className="mt-2.5 p-2 rounded-lg bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Sparkles size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>{signal.candidateReason}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-antah-muted">
                        <span className="flex items-center gap-1 truncate max-w-[170px]">
                          <MapPin size={11} /> {signal.locationName}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={11} /> {signal.reportedAt}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
