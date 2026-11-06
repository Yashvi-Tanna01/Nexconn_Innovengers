import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { SignalOrbCanvas } from './SignalOrbCanvas';
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

export const HomePage: React.FC = () => {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Real recent signals and cluster for data integrity
  const recentSignals = ATLAS_SIGNALS.slice(0, 3);
  const primaryCluster = ATLAS_CANDIDATE_CLUSTERS[0];

  return (
    <div className="relative w-full min-h-screen px-3 sm:px-6 pt-3 pb-36 sm:pb-44 space-y-6 select-none overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND ATMOSPHERIC SILK WAVES & ORBITAL TELEMETRY GRAPHICS */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Left Organic Silk / Dune Wave (Mint-Emerald Ambient Gradient) */}
        <svg
          className="absolute -top-12 -left-16 w-[460px] sm:w-[680px] lg:w-[820px] h-[450px] sm:h-[600px] lg:h-[720px] opacity-80"
          viewBox="0 0 700 600"
          fill="none"
        >
          <path
            d="M-80,600 C100,510 220,360 180,240 C140,120 280,60 440,140 C560,200 630,360 700,600 Z"
            fill="url(#leftSilkGrad)"
          />
          <path
            d="M-50,560 C120,480 230,330 195,220 C155,100 290,50 450,130 C570,190 640,350 700,560"
            stroke="rgba(23, 83, 62, 0.4)"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M-30,520 C140,440 240,300 215,200 C175,90 300,40 460,115"
            stroke="rgba(245, 158, 11, 0.45)"
            strokeWidth="1.2"
            strokeDasharray="5 7"
            fill="none"
          />
          <defs>
            <linearGradient id="leftSilkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C0DFD4" stopOpacity="0.65" />
              <stop offset="45%" stopColor="#DDF0E9" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#FAF9F5" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Right Organic Silk / Dune Wave (Warm Champagne-Gold Ambient Gradient) */}
        <svg
          className="absolute -top-12 -right-16 w-[460px] sm:w-[680px] lg:w-[820px] h-[450px] sm:h-[600px] lg:h-[720px] opacity-80"
          viewBox="0 0 700 600"
          fill="none"
        >
          <path
            d="M780,600 C580,510 470,360 510,240 C550,120 410,60 250,140 C130,200 60,360 0,600 Z"
            fill="url(#rightSilkGrad)"
          />
          <path
            d="M750,560 C560,480 460,330 495,220 C535,100 400,50 240,130 C120,190 50,350 0,560"
            stroke="rgba(245, 158, 11, 0.5)"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M730,520 C540,440 440,300 475,200 C515,90 390,40 220,115"
            stroke="rgba(45, 212, 191, 0.35)"
            strokeWidth="1.2"
            strokeDasharray="5 7"
            fill="none"
          />
          <defs>
            <linearGradient id="rightSilkGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBEFE3" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#FDF6EE" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FAF9F5" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Concentric Telemetry Orbital Rings & Warm Radial Halo behind Globe */}
        <div className="absolute top-[240px] sm:top-[280px] md:top-[310px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] sm:w-[760px] md:w-[860px] h-[560px] sm:h-[760px] md:h-[860px] pointer-events-none">
          {/* Luminous Warm Golden & Cyan Bloom */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-amber-300/35 via-teal-200/30 to-transparent blur-3xl scale-80" />
          {/* Outer Orbital Telemetry Circle */}
          <div className="absolute inset-0 rounded-full border border-teal-500/25" />
          {/* Mid Orbital Circle with dashed telemetry marks */}
          <div className="absolute inset-12 rounded-full border border-amber-400/30 border-dashed" />
          {/* Inner Horizon Circle */}
          <div className="absolute inset-24 rounded-full border border-teal-400/30" />
          {/* Sparkle flares on rings */}
          <div className="absolute top-12 left-1/4 w-2 h-2 rounded-full bg-amber-400/70 blur-[1px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-2.5 h-2.5 rounded-full bg-teal-400/80 blur-[1px] animate-pulse" />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. HERO 3D DIGITAL EARTH SUSPENDED STAGE */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full flex flex-col items-center text-center pt-1 sm:pt-3">
        {/* Top Status Pill: CIVIC INTELLIGENCE MESH  ●  ONLINE */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1F2EB]/90 backdrop-blur-md border border-[#17533E]/20 text-[11px] font-mono font-semibold tracking-wider text-[#17533E] shadow-[0_2px_14px_rgba(23,83,62,0.10)] mb-1 sm:mb-2">
          <Radio size={13} className="text-[#17533E] animate-pulse" />
          <span>CIVIC INTELLIGENCE MESH</span>
          <span className="text-[#17533E]/50">●</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17533E] animate-ping" />
            <span>ONLINE</span>
          </span>
        </div>

        {/* 3D Living Digital Earth Canvas (Centered & Dominant) */}
        <div className="relative w-full h-[360px] sm:h-[420px] md:h-[470px] lg:h-[510px] max-w-[380px] sm:max-w-[460px] md:max-w-[530px] lg:max-w-[580px] mx-auto flex items-center justify-center my-0.5">
          <SignalOrbCanvas />
        </div>

        {/* Editorial Headline & Supporting Description */}
        <div className="space-y-2 max-w-xl mx-auto mt-1 sm:mt-2">
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
        <div className="flex flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto mt-4 sm:mt-5">
          {/* Primary Action Button: Explore Signals */}
          <Link
            to="/explorer"
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
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_8px_25px_rgba(23,83,62,0.12)] hover:border-[#17533E]/30 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-emerald-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E1F2EB] text-[#17533E] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
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
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#17533E] group-hover:bg-[#E1F2EB] group-hover:border-[#17533E]/20 flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight size={14} strokeWidth={2} />
            </div>
          </Link>

          {/* Card 2: Live Map */}
          <Link
            to="/explorer"
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_8px_25px_rgba(217,119,6,0.12)] hover:border-amber-400/40 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-amber-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3E2] text-[#D97706] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
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
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#D97706] group-hover:bg-[#FEF3E2] group-hover:border-amber-400/20 flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight size={14} strokeWidth={2} />
            </div>
          </Link>

          {/* Card 3: Signal Patterns */}
          <Link
            to="/patterns"
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)] hover:border-blue-400/40 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-blue-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F1FC] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
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
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#2563EB] group-hover:bg-[#E8F1FC] group-hover:border-blue-400/20 flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight size={14} strokeWidth={2} />
            </div>
          </Link>

          {/* Card 4: Community Chat */}
          <Link
            to="/messages"
            className="group relative p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EBE7DF] shadow-[0_4px_20px_rgba(30,40,35,0.03)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.12)] hover:border-orange-400/40 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between gap-3.5 overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-orange-100/40 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FEECE8] text-[#EA580C] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
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
            <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EBE7DF] text-[#7B8B84] group-hover:text-[#EA580C] group-hover:bg-[#FEECE8] group-hover:border-orange-400/20 flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight size={14} strokeWidth={2} />
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

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};

export default HomePage;
