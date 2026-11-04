import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Layers, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Detect Small Signals',
      tag: 'COMMUNITY TELEMETRY',
      icon: <Radio className="text-antah-teal" size={20} />,
      description:
        'Citizens and IoT sensors record subtle urban anomalies — a minor water seepage, road depression, or streetlight flicker — before they trigger catastrophic failure.',
    },
    {
      step: '02',
      title: 'Autonomous Spatial Clustering',
      tag: 'AI CORRELATION MESH',
      icon: <Layers className="text-amber-500" size={20} />,
      description:
        'The ANTAH correlation engine analyzes spatial proximity, municipal utility networks, and temporal deltas to reveal hidden connections between isolated reports.',
    },
    {
      step: '03',
      title: 'Coordinator Verification',
      tag: 'HUMAN-IN-THE-LOOP',
      icon: <ShieldCheck className="text-emerald-600" size={20} />,
      description:
        'District coordinators review candidate clusters with confidence scoring, evidence rationales, and municipal utility blueprints, verifying actionable incidents.',
    },
    {
      step: '04',
      title: 'Coordinated Remediation',
      tag: 'RAPID WORK ORDER',
      icon: <CheckCircle2 className="text-sky-600" size={20} />,
      description:
        'Remediation crews receive precise geospatial work orders while residents track live status updates through the Nexconn civic communications channel.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#102B32]/40 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_25px_70px_rgba(16,43,50,0.2)] p-6 sm:p-8 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-5 border-b border-stone-200/60">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 font-semibold">
                ANTAH INTELLIGENCE CYCLE
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#202827] mt-2 font-sans tracking-tight">
                How ANTAH Connects the Dots
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700/40"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            {steps.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/60 hover:border-emerald-700/30 transition-all hover:bg-white"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-mono font-bold text-stone-400">
                    PHASE {item.step}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white border border-stone-200/80 shadow-xs">
                    {item.icon}
                  </div>
                </div>
                <div className="text-[10px] font-mono tracking-wider uppercase text-emerald-700 font-semibold mb-1">
                  {item.tag}
                </div>
                <h3 className="text-base font-semibold text-[#202827] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Modal Footer CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200/60">
            <p className="text-xs text-stone-500 font-serif italic text-center sm:text-left">
              "Small signals today, safer tomorrow."
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100 transition-colors"
              >
                Close
              </button>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-medium bg-[#102B32] text-white hover:bg-[#23765D] transition-colors shadow-sm"
              >
                <span>Enter Operations Desk</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HowItWorksModal;

