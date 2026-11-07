import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigationTransition } from '../navigation/transition';
import { HomeFloatingGlobeBackground } from './HomeFloatingGlobeBackground';
import { HowItWorksModal } from './HowItWorksModal';
import {
  ArrowUpRight,
  Play,
  Plus,
  MapPin,
  BarChart2,
  MessageSquare,
  Radio,
  ChevronRight,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ATLAS_SIGNALS, ATLAS_CANDIDATE_CLUSTERS } from '../atlas/types';

export const HomePage: React.FC = React.memo(() => {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { navigateWithTransition } = useNavigationTransition();

  // Real recent signals and cluster for data integrity
  const recentSignals = ATLAS_SIGNALS.slice(0, 3);
  const primaryCluster = ATLAS_CANDIDATE_CLUSTERS[0];

  return (
    <div className="relative w-full min-h-screen px-3 sm:px-6 pt-3 pb-36 sm:pb-44 select-none overflow-x-hidden bg-transparent">
      {/* ------------------------------------------------------------- */}
      {/* 1. PERMANENT FIXED FLOATING 3D GLOBE & LANDSCAPE BACKGROUND   */}
      {/* ------------------------------------------------------------- */}
      <HomeFloatingGlobeBackground />

      <div className="relative z-10 space-y-6">
        {/* ------------------------------------------------------------- */}
        {/* 2. HERO 3D DIGITAL EARTH SUSPENDED STAGE (TRANSPARENT SPACER) */}
        {/* ------------------------------------------------------------- */}
        <section className="relative w-full flex flex-col items-center text-center pt-1 sm:pt-3 bg-transparent pointer-events-none">
        {/* Top Status Pill: CIVIC INTELLIGENCE MESH  ●  ONLINE */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F2EB]/90 backdrop-blur-md border border-[#17533E]/20 text-[11px] font-mono font-semibold tracking-wider text-[#17533E] shadow-[0_2px_14px_rgba(23,83,62,0.10)] mb-1 sm:mb-2 pointer-events-auto">
          <Radio size={13} className="text-[#17533E] animate-pulse" />
          <span>CIVIC INTELLIGENCE MESH</span>
          <span className="text-[#17533E]/50">●</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17533E] animate-ping" />
            <span>ONLINE</span>
          </span>
        </div>

        {/* Transparent Spacer reserving the Stage for the Fixed Floating Earth */}
        <div
          className="relative w-full h-[360px] sm:h-[420px] md:h-[470px] lg:h-[510px] max-w-[380px] sm:max-w-[460px] md:max-w-[530px] lg:max-w-[580px] mx-auto flex items-center justify-center my-0.5 bg-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Editorial Headline & Supporting Description */}
        <div className="space-y-2 max-w-xl mx-auto mt-1 sm:mt-2 pointer-events-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-light text-[#1E2925] tracking-tight font-sans leading-tight">
            Small Signals.<br />
            <span className="font-extrabold text-[#1E2925]">
              A Safer <span className="text-[#17533E]">Tomorrow.</span>
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-sm text-[#737C78] leading-relaxed font-sans px-3 max-w-md mx-auto">
            ANTAH correlates scattered civic observations and subtle infrastructure changes into verified municipal actions before hazards escalate.
          </p>
        </div>

        {/* Primary and Secondary Action Buttons */}
        <div className="flex flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto mt-4 sm:mt-5 pointer-events-auto">
          {/* Primary Action Button: Explore Signals */}
          <Link
            to="/explorer"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition('/explorer', 'explore');
            }}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-[#17533E] hover:bg-[#124231] active:scale-98 text-white shadow-[0_4px_18px_rgba(23,83,62,0.32)] transition-all min-h-[44px]"
          >
            <span>Explore Signals</span>
            <ArrowUpRight size={15} strokeWidth={2.4} />
          </Link>

          {/* Secondary Action Button: How It Works */}
          <button
            onClick={() => setIsHowItWorksOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold text-[#1E2925] bg-[#FBF9F5] hover:bg-[#F3EFE6] active:scale-98 transition-all border border-[#E7DDCF] shadow-xs min-h-[44px]"
          >
            <span>How It Works</span>
            <Play size={11} className="fill-[#1E2925] text-[#1E2925] ml-0.5" />
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. QUICK ACTIONS SECTION (FOUR HORIZONTAL CARDS) */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-3 pt-3">
        {/* Section Header: — QUICK ACTIONS */}
        <div className="flex items-center gap-2 px-1">
          <span className="w-5 h-[2px] bg-[#8A9590]" />
          <h2 className="text-xs font-bold text-[#8A9590] uppercase tracking-wider font-mono">
            QUICK ACTIONS
          </h2>
        </div>

        {/* 4 Horizontally Arranged Cards (Single Row on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          {/* Card 1: Report Issue */}
          <Link
            to="/report"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition('/report', 'report');
            }}
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_12px_32px_rgba(8,123,86,0.14)] hover:border-[#087B56]/50 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-emerald-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E1F2EB] text-[#17533E] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1E2925] truncate font-sans">
                  Report Issue
                </div>
                <div className="text-xs text-[#7B8B84] truncate font-sans">
                  Log local anomaly
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#17533E] group-hover:bg-[#E1F2EB] group-hover:border-[#17533E]/20 flex items-center justify-center shrink-0 transition-all duration-200">
              <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform duration-250" />
            </div>
          </Link>

          {/* Card 2: Live Map */}
          <Link
            to="/explorer"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition('/explorer', 'explore');
            }}
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_12px_32px_rgba(217,119,6,0.14)] hover:border-amber-400/50 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-amber-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3E2] text-[#D97706] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <MapPin size={22} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1E2925] truncate font-sans">
                  Live Map
                </div>
                <div className="text-xs text-[#7B8B84] truncate font-sans">
                  Bangalore East grid
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#D97706] group-hover:bg-[#FEF3E2] group-hover:border-amber-400/20 flex items-center justify-center shrink-0 transition-all duration-200">
              <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform duration-250" />
            </div>
          </Link>

          {/* Card 3: Signal Patterns */}
          <Link
            to="/patterns"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition('/patterns', 'patterns');
            }}
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.14)] hover:border-blue-400/50 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-blue-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F1FC] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BarChart2 size={22} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1E2925] truncate font-sans">
                  Signal Patterns
                </div>
                <div className="text-xs text-[#7B8B84] truncate font-sans">
                  View insights
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#2563EB] group-hover:bg-[#E8F1FC] group-hover:border-blue-400/20 flex items-center justify-center shrink-0 transition-all duration-200">
              <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform duration-250" />
            </div>
          </Link>

          {/* Card 4: Community Chat */}
          <Link
            to="/messages"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition('/messages', 'chat');
            }}
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_12px_32px_rgba(234,88,12,0.14)] hover:border-orange-400/50 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-orange-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FEECE8] text-[#EA580C] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <MessageSquare size={22} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1E2925] truncate font-sans">
                  Community Chat
                </div>
                <div className="text-xs text-[#7B8B84] truncate font-sans">
                  Connect & discuss
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#EA580C] group-hover:bg-[#FEECE8] group-hover:border-orange-400/20 flex items-center justify-center shrink-0 transition-all duration-200">
              <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform duration-250" />
            </div>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. SUPPLEMENTARY REAL DATA FEEDS (PRESERVED SYSTEM INTEGRITY) */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-4 pt-2">
        {/* Highlighted AI Pattern Cluster */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/75 backdrop-blur-md border border-amber-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>AI PATTERN ALERT • 94% CORRELATION</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-mono font-bold uppercase">
              Action Required
            </span>
          </div>

          <h3 className="text-sm font-bold text-[#1E2925]">
            {primaryCluster.title}
          </h3>

          <p className="text-xs text-[#737C78] leading-relaxed line-clamp-2">
            {primaryCluster.rationale}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-xs">
            <span className="text-[#8A9590] font-mono text-[10px]">
              Active Nodes: SIG-802 + SIG-805
            </span>
            <Link
              to="/patterns"
              className="inline-flex items-center gap-1 text-[#17533E] font-bold hover:underline"
            >
              <span>Review Cluster</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Recent Verified Signals Stream */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-[#8A9590] uppercase tracking-wider font-mono">
              LIVE TELEMETRY STREAM
            </h3>
            <Link
              to="/explorer"
              className="text-xs font-semibold text-[#17533E] hover:underline"
            >
              Open Atlas Map →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentSignals.map((signal) => (
              <Link
                key={signal.id}
                to={`/explorer?signal=${signal.id}`}
                className="p-3.5 rounded-2xl bg-white/75 backdrop-blur-md border border-[#EBE7DF] shadow-xs hover:border-[#17533E]/30 hover:shadow-xs active:scale-99 transition-all flex items-start justify-between gap-3 block"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#17533E] bg-[#E1F2EB] px-1.5 py-0.5 rounded">
                      {signal.id}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        signal.severity === 'critical'
                          ? 'bg-rose-100 text-rose-700'
                          : signal.severity === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {signal.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#1E2925] line-clamp-1">
                    {signal.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[10px] text-[#737C78] font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      <span>{signal.locationName.split(',')[0]}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{signal.reportedAt}</span>
                    </span>
                  </div>
                </div>

                <ChevronRight size={15} className="text-stone-300 self-center shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      </div>

      {/* How It Works Modal (Rendered on demand) */}
      {isHowItWorksOpen && (
        <HowItWorksModal
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
        />
      )}
    </div>
  );
});

export default HomePage;
