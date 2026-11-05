import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { SignalOrbCanvas } from './SignalOrbCanvas';
import { HowItWorksModal } from './HowItWorksModal';
import {
  ArrowUpRight,
  Compass,
  LayoutDashboard,
  ShieldAlert,
  Radio,
  Layers,
  PlusCircle,
  MessageSquare,
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ATLAS_SIGNALS, ATLAS_CANDIDATE_CLUSTERS } from '../atlas/types';

export const HomePage: React.FC = () => {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Real recent signals
  const recentSignals = ATLAS_SIGNALS.slice(0, 3);
  const primaryCluster = ATLAS_CANDIDATE_CLUSTERS[0];

  return (
    <div className="w-full px-4 pt-3 pb-8 space-y-6 select-none">
      {/* 1. HERO 3D SIGNAL ORB STAGE */}
      <section className="relative rounded-3xl bg-white border border-[#E3E8E4] shadow-xs p-4 sm:p-6 overflow-hidden flex flex-col items-center text-center">
        {/* Subtle radial ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-80 h-72 sm:h-80 bg-gradient-to-tr from-amber-100/60 via-teal-50/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Live Grid Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1F0E8] border border-[#286B56]/20 text-[10px] font-mono text-[#286B56] font-semibold uppercase tracking-wider mb-2">
          <Radio size={11} className="text-[#286B56] animate-pulse" />
          <span>CIVIC INTELLIGENCE MESH • ONLINE</span>
        </div>

        {/* 3D Civic Intelligence Globe Canvas (Responsive cinematic viewport) */}
        <div className="relative w-full h-[290px] sm:h-[350px] md:h-[390px] max-w-[340px] sm:max-w-[400px] md:max-w-[450px] mx-auto my-1 sm:my-2 flex items-center justify-center">
          <SignalOrbCanvas />
        </div>

        {/* Editorial Headline & Tagline */}
        <div className="space-y-2 mt-2 max-w-sm">
          <h1 className="text-2xl sm:text-3xl font-light text-[#202827] tracking-tight font-sans leading-tight">
            Small Signals.<br />
            <span className="font-semibold text-[#202827]">A Safer Tomorrow.</span>
          </h1>

          <p className="text-xs text-[#737C78] leading-relaxed font-sans px-2">
            ANTAH correlates scattered civic observations and subtle infrastructure changes into verified municipal actions before hazards escalate.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs mt-4">
          <Link
            to="/explorer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold bg-[#286B56] hover:bg-[#1f5645] active:scale-98 text-white shadow-md transition-all min-h-[48px]"
          >
            <span>Explore Signals</span>
            <ArrowUpRight size={14} />
          </Link>

          <button
            onClick={() => setIsHowItWorksOpen(true)}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#202827] bg-[#F5F6F4] hover:bg-stone-200/80 active:scale-98 transition-colors border border-[#E3E8E4] min-h-[44px]"
          >
            <span>How It Works</span>
          </button>
        </div>
      </section>

      {/* 2. TOUCH-FRIENDLY QUICK ACTIONS GRID (2x2) */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#737C78] uppercase tracking-wider px-1">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Action 1: Report Anomaly */}
          <Link
            to="/report"
            className="p-4 rounded-2xl bg-white border border-[#E3E8E4] shadow-xs hover:border-[#286B56]/40 active:scale-98 transition-all flex flex-col justify-between min-h-[104px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#E1F0E8] text-[#286B56] flex items-center justify-center">
              <PlusCircle size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202827]">Report Issue</div>
              <div className="text-[10px] text-[#737C78]">Log local anomaly</div>
            </div>
          </Link>

          {/* Action 2: Territorial Map */}
          <Link
            to="/explorer"
            className="p-4 rounded-2xl bg-white border border-[#E3E8E4] shadow-xs hover:border-[#286B56]/40 active:scale-98 transition-all flex flex-col justify-between min-h-[104px]"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Compass size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202827]">Live Map</div>
              <div className="text-[10px] text-[#737C78]">Bangalore East grid</div>
            </div>
          </Link>

          {/* Action 3: Candidate Patterns */}
          <Link
            to="/patterns"
            className="p-4 rounded-2xl bg-white border border-[#E3E8E4] shadow-xs hover:border-[#E7A65B]/40 active:scale-98 transition-all flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E7A65B] flex items-center justify-center">
                <Layers size={20} />
              </div>
              <span className="w-2 h-2 rounded-full bg-[#D9534F] animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202827]">AI Patterns</div>
              <div className="text-[10px] text-[#737C78]">1 Cluster pending</div>
            </div>
          </Link>

          {/* Action 4: Incident Chat */}
          <Link
            to="/messages"
            className="p-4 rounded-2xl bg-white border border-[#E3E8E4] shadow-xs hover:border-blue-300 active:scale-98 transition-all flex flex-col justify-between min-h-[104px]"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202827]">Incident Rooms</div>
              <div className="text-[10px] text-[#737C78]">Nexconn chat SDK</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. HIGHLIGHTED AI CLUSTER ALERT (Compact Mobile Card) */}
      <section className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-800 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>AI PATTERN ALERT • 94% CONFIDENCE</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#D9534F] text-white text-[9px] font-mono font-bold uppercase">
            Critical
          </span>
        </div>

        <h3 className="text-xs font-bold text-[#202827] leading-snug">
          {primaryCluster.title}
        </h3>

        <p className="text-[11px] text-stone-700 leading-relaxed line-clamp-2">
          {primaryCluster.rationale}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-[11px]">
          <span className="text-stone-500 font-mono text-[10px]">
            SIG-802 + SIG-805
          </span>
          <Link
            to="/patterns"
            className="inline-flex items-center gap-1 text-[#286B56] font-bold text-xs"
          >
            <span>Review Pattern</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </section>

      {/* 4. RECENT VERIFIED CIVIC SIGNALS */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-[#737C78] uppercase tracking-wider">
            Recent Telemetry Signals
          </h2>
          <Link
            to="/explorer"
            className="text-xs font-semibold text-[#286B56] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentSignals.map((signal) => (
            <Link
              key={signal.id}
              to={`/explorer?signal=${signal.id}`}
              className="p-3.5 rounded-2xl bg-white border border-[#E3E8E4] shadow-xs hover:border-[#286B56]/30 active:scale-99 transition-all flex items-start justify-between gap-3 block"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#286B56] bg-[#E1F0E8] px-1.5 py-0.5 rounded">
                    {signal.id}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      signal.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : signal.severity === 'high'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {signal.severity}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#202827] line-clamp-1">
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

              <ChevronRight size={16} className="text-stone-300 self-center shrink-0" />
            </Link>
          ))}
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
