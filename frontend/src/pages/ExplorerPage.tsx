import React, { useState, Suspense, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CategoryBadge } from '../components/common/Badge';
import { PageLoadingState } from '../components/loading';
import { REPORT_CATEGORIES, ReportCategory } from '../theme/tokens';
import { ATLAS_SIGNALS, ATLAS_CANDIDATE_CLUSTERS, AtlasSignal } from '../components/atlas/types';
import {
  Search,
  X,
  RotateCw,
  Layers,
  MapPin,
  Clock,
  Radio,
  GitFork,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';

const CitySignalAtlas = React.lazy(() =>
  import('../components/atlas/CitySignalAtlas').then((mod) => ({ default: mod.CitySignalAtlas }))
);

export const ExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSignal, setActiveSignal] = useState<AtlasSignal | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Sync url search parameters (?signal=SIG-xxx or ?category=xxx)
  useEffect(() => {
    const signalParam = searchParams.get('signal');
    if (signalParam) {
      const match = ATLAS_SIGNALS.find((s) => s.id === signalParam);
      if (match) setActiveSignal(match);
    }
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Compute live summary statistics using real data
  const summaryStats = useMemo(() => {
    const activeReports = ATLAS_SIGNALS.filter((s) => s.status !== 'resolved').length;
    const candidateClusters = ATLAS_CANDIDATE_CLUSTERS.length;
    const verifiedIncidents = ATLAS_SIGNALS.filter((s) => s.status === 'verified_incident').length;
    const resolvedIssues = ATLAS_SIGNALS.filter((s) => s.status === 'resolved').length;
    return {
      activeReports,
      candidateClusters,
      verifiedIncidents,
      resolvedIssues,
    };
  }, []);

  // Filtered signals computation
  const filteredSignals = useMemo(() => {
    return ATLAS_SIGNALS.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'candidate_clusters') {
          if (s.status !== 'candidate_pattern') return false;
        } else if (selectedStatus === 'verified_incidents') {
          if (s.status !== 'verified_incident') return false;
        } else if (selectedStatus === 'resolved') {
          if (s.status !== 'resolved') return false;
        } else if (selectedStatus === 'active_reports') {
          if (s.status === 'resolved') return false;
        } else if (s.status !== selectedStatus) {
          return false;
        }
      }
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
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Subtle Data Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshToast('Synchronizing civic telemetry...');
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshToast('Civic telemetry up to date');
      setTimeout(() => setRefreshToast(null), 2400);
    }, 700);
  }, []);

  return (
    <div className="w-full text-[#182322] space-y-4 select-none box-border min-w-0">
      {/* 1. MAP HEADER & CONTROLS (Responsive Two-Column Layout) */}
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1 min-w-0">
        {/* Left Column: Section label, Location badge, Heading, Supporting description */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#D99A45] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#727C79]">
                Spatial Intelligence
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#727C79] bg-white border border-[#E6EAE6] px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
              Bangalore East
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#182322] leading-tight">
            Community Map
          </h1>
          <p className="text-xs text-[#727C79] leading-relaxed">
            Explore reported issues and emerging local signals.
          </p>
        </div>

        {/* Right Column: Location Search, Layer Selector, Refresh Button, Map/List Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto min-w-0 shrink-0">
          {/* Location / Signal Search Input */}
          <div className="relative w-full sm:w-56 md:w-64 min-w-0">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727C79] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, issue, ID..."
              className="w-full bg-white text-[#182322] placeholder:text-[#727C79] text-xs rounded-2xl border border-[#E6EAE6] pl-9 pr-8 py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#D99A45]/30 focus:border-[#D99A45] transition-all box-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#727C79] hover:text-[#182322] p-1"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Controls Row: Layer selector, Refresh button, Map/List Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
            {/* Map Layer Selector */}
            <div className="relative flex-1 sm:flex-none min-w-0">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white text-[#182322] text-xs font-semibold rounded-2xl border border-[#D99A45]/40 pl-3.5 pr-8 py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#D99A45]/30 cursor-pointer min-h-[40px] box-border truncate"
                aria-label="Map Layer Selector"
              >
                <option value="all">All Layers</option>
                <option value="active_reports">Active Reports ({summaryStats.activeReports})</option>
                <option value="candidate_clusters">Candidate Clusters ({summaryStats.candidateClusters})</option>
                <option value="verified_incidents">Verified Incidents ({summaryStats.verifiedIncidents})</option>
                <option value="resolved">Resolved ({summaryStats.resolvedIssues})</option>
              </select>
              <Layers size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D99A45] pointer-events-none" />
            </div>

            {/* Subtle Data Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`w-10 h-10 rounded-2xl bg-white border border-[#E6EAE6] flex items-center justify-center text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5] active:scale-95 transition-all shadow-2xs shrink-0 ${
                isRefreshing ? 'text-[#D99A45]' : ''
              }`}
              title="Refresh Civic Telemetry"
              aria-label="Refresh telemetry data"
            >
              <RotateCw size={15} className={isRefreshing ? 'animate-spin text-[#D99A45]' : ''} />
            </button>

            {/* View Mode Toggle: Map vs List */}
            <div className="flex items-center bg-white border border-[#E6EAE6] rounded-2xl p-1 shadow-2xs shrink-0">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-[#182322] text-white shadow-xs'
                    : 'text-[#727C79] hover:text-[#182322]'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#182322] text-white shadow-xs'
                    : 'text-[#727C79] hover:text-[#182322]'
                }`}
              >
                List ({filteredSignals.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Toast Feedback */}
      <AnimatePresence>
        {refreshToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E6EAE6] text-xs font-medium text-[#182322] shadow-2xs w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-[#286B56]" />
            <span>{refreshToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. COMPACT MAP SUMMARY STRIP (4 Columns on Desktop, 2 Columns on Tablet/Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        {/* Active Reports */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'active_reports' ? 'all' : 'active_reports')}
          className={`min-h-[84px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between box-border min-w-0 ${
            selectedStatus === 'active_reports'
              ? 'bg-white border-[#182322] ring-2 ring-[#182322]/10 shadow-xs'
              : 'bg-white border-[#E6EAE6] hover:border-[#CBD5E1] shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#727C79] tracking-wider font-semibold leading-tight flex-1 min-w-0">
              Active Reports
            </span>
            <span className="w-2 h-2 rounded-full bg-[#182322] shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-[#182322] leading-none">{summaryStats.activeReports}</span>
            <span className="text-[10px] text-[#727C79] leading-none">in sector</span>
          </div>
        </div>

        {/* Candidate Signal Clusters */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'candidate_clusters' ? 'all' : 'candidate_clusters')}
          className={`min-h-[84px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between box-border min-w-0 ${
            selectedStatus === 'candidate_clusters'
              ? 'bg-[#FFFBEB] border-[#D99A45] ring-2 ring-[#D99A45]/20 shadow-xs'
              : 'bg-white border-[#E6EAE6] hover:border-[#D99A45]/50 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#D99A45] tracking-wider font-bold leading-tight flex-1 min-w-0 flex items-center gap-1">
              <GitFork size={12} className="shrink-0" />
              <span className="truncate">Candidate Clusters</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#D99A45] animate-pulse shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-[#D99A45] leading-none">{summaryStats.candidateClusters}</span>
            <span className="text-[10px] text-[#727C79] leading-none">AI correlated</span>
          </div>
        </div>

        {/* Coordinator-Verified Incidents */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'verified_incidents' ? 'all' : 'verified_incidents')}
          className={`min-h-[84px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between box-border min-w-0 ${
            selectedStatus === 'verified_incidents'
              ? 'bg-[#FEF2F2] border-[#D9534F] ring-2 ring-[#D9534F]/20 shadow-xs'
              : 'bg-white border-[#E6EAE6] hover:border-[#D9534F]/50 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#D9534F] tracking-wider font-bold leading-tight flex-1 min-w-0 flex items-center gap-1">
              <ShieldCheck size={12} className="shrink-0" />
              <span className="truncate">Verified Incidents</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#D9534F] shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-[#D9534F] leading-none">{summaryStats.verifiedIncidents}</span>
            <span className="text-[10px] text-[#727C79] leading-none">dispatched</span>
          </div>
        </div>

        {/* Resolved Issues */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'resolved' ? 'all' : 'resolved')}
          className={`min-h-[84px] p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between box-border min-w-0 ${
            selectedStatus === 'resolved'
              ? 'bg-[#E1F0E8] border-[#286B56] ring-2 ring-[#286B56]/20 shadow-xs'
              : 'bg-white border-[#E6EAE6] hover:border-[#286B56]/50 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#286B56] tracking-wider font-bold leading-tight flex-1 min-w-0 flex items-center gap-1">
              <CheckCircle2 size={12} className="shrink-0" />
              <span className="truncate">Resolved Issues</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#286B56] shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-bold text-[#286B56] leading-none">{summaryStats.resolvedIssues}</span>
            <span className="text-[10px] text-[#727C79] leading-none">remediated</span>
          </div>
        </div>
      </div>

      {/* 3. MAP AS VISUAL CENTERPIECE (OR LIST VIEW) */}
      {viewMode === 'map' ? (
        <div className="relative w-full h-[500px] sm:h-[560px] lg:h-[calc(100vh-270px)] min-h-[480px] rounded-3xl overflow-hidden border border-[#E6EAE6] bg-[#F0F2EE] shadow-[0_8px_30px_rgba(24,35,34,0.04)] box-border min-w-0">
          <Suspense
            fallback={
              <PageLoadingState
                message="LOADING TERRITORIAL ATLAS..."
                subMessage="Synchronizing GPS nodes and active Signal Threads"
                minHeight="h-[480px] sm:h-[560px]"
              />
            }
          >
            <CitySignalAtlas
              className="w-full h-full"
              selectedSignalId={activeSignal?.id}
              onSignalClick={(sig) => setActiveSignal(sig)}
              externalStatusFilter={selectedStatus}
              externalCategoryFilter={selectedCategory}
            />
          </Suspense>
        </div>
      ) : (
        /* 4. LIST VIEW */
        <div className="space-y-3 min-w-0">
          {filteredSignals.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white border border-[#E6EAE6] text-center space-y-2 box-border">
              <span className="text-sm font-semibold text-[#182322]">No signals match the current filters</span>
              <p className="text-xs text-[#727C79]">Try clearing your search query or switching layer filters.</p>
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-[#182322] text-white text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredSignals.map((sig) => (
              <div
                key={sig.id}
                onClick={() => {
                  setActiveSignal(sig);
                  setViewMode('map');
                }}
                className="p-4 rounded-3xl bg-white border border-[#E6EAE6] shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all space-y-2 cursor-pointer group box-border min-w-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#286B56] bg-[#E1F0E8] px-2 py-0.5 rounded">
                      {sig.id}
                    </span>
                    <CategoryBadge category={sig.category} size="sm" />
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      sig.status === 'verified_incident'
                        ? 'bg-[#FEF2F2] text-[#D9534F] border border-[#D9534F]/20'
                        : sig.status === 'candidate_pattern'
                        ? 'bg-[#FFFBEB] text-[#D99A45] border border-[#D99A45]/20'
                        : sig.status === 'resolved'
                        ? 'bg-[#E1F0E8] text-[#286B56] border border-[#286B56]/20'
                        : 'bg-[#F8F8F5] text-[#727C79]'
                    }`}
                  >
                    {sig.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#182322] leading-snug group-hover:text-[#D99A45] transition-colors">
                  {sig.title}
                </h3>
                <p className="text-xs text-[#727C79] line-clamp-2">
                  {sig.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E6EAE6] text-[10px] text-[#727C79] font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-[#286B56]" />
                    <span>{sig.locationName}</span>
                  </span>
                  <span className="text-[#286B56] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View on Map</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorerPage;
