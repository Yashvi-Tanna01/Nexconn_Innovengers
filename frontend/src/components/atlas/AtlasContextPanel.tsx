import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  GitFork,
  ShieldCheck,
  Radio,
  User,
  Wrench,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { AtlasSignal, AtlasCandidateCluster } from './types';
import { CATEGORY_PALETTE } from './AtlasSymbols';

interface AtlasContextPanelProps {
  selectedSignal: AtlasSignal | null;
  selectedCluster: AtlasCandidateCluster | null;
  onClose: () => void;
  onSelectSignalById: (id: string) => void;
  onOpenChat?: (incidentId: string, title: string) => void;
}

export const AtlasContextPanel: React.FC<AtlasContextPanelProps> = ({
  selectedSignal,
  selectedCluster,
  onClose,
  onSelectSignalById,
  onOpenChat,
}) => {
  if (!selectedSignal && !selectedCluster) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="atlas-context-panel pointer-events-auto absolute top-16 right-3 bottom-16 sm:right-4 sm:top-16 sm:bottom-4 w-full max-w-[360px] sm:max-w-[400px] bg-white/95 border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col z-[500] backdrop-blur-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedCluster ? 'bg-amber-500' : 'bg-antah-teal'
              }`}
            />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-antah-slate">
              {selectedCluster ? 'Candidate Signal Thread' : 'Observed Civic Signal'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-antah-navy hover:bg-slate-100 transition-colors"
            title="Close Panel"
            aria-label="Close Panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-antah-navy">
          {/* A. If a Candidate Cluster / Thread is Selected */}
          {selectedCluster && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                    <GitFork size={13} className="text-amber-600" />
                    AI Candidate Correlation
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                    {Math.round(selectedCluster.confidenceScore * 100)}% Match
                  </span>
                </div>
                <h4 className="text-sm font-bold tracking-tight text-amber-950 leading-snug">
                  {selectedCluster.title}
                </h4>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  {selectedCluster.rationale}
                </p>
              </div>

              {/* Connected Signals List */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
                  Linked Incident Observations ({selectedCluster.signals.length})
                </span>
                <div className="space-y-2">
                  {selectedCluster.signals.map((sigId) => (
                    <button
                      key={sigId}
                      onClick={() => onSelectSignalById(sigId)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200/80 hover:border-antah-teal hover:bg-teal-50/30 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-mono font-bold text-antah-teal block">
                          {sigId}
                        </span>
                        <span className="text-xs font-semibold text-antah-navy group-hover:text-antah-teal transition-colors">
                          {sigId === 'SIG-802' ? 'High Pressure Pipe Seepage' : 'Stormwater Culvert Backflow'}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-antah-teal transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Coordinator Action Status */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Verification Status:</span>
                  <span className="font-mono font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                    {selectedCluster.status === 'verified_incident' ? 'Verified Incident' : 'Awaiting Review'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Designated Response:</span>
                  <span className="font-semibold text-antah-navy">Crew Alpha (Hydraulics)</span>
                </div>
              </div>

              {onOpenChat && (
                <button
                  onClick={() => onOpenChat(selectedCluster.id, selectedCluster.title)}
                  className="w-full py-2.5 px-4 rounded-xl bg-antah-teal text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-antah-teal-hover transition-colors shadow-soft-xs"
                >
                  <MessageSquare size={14} />
                  <span>Open Responder Nexconn Chat</span>
                </button>
              )}
            </div>
          )}

          {/* B. If a Single Signal is Selected */}
          {selectedSignal && !selectedCluster && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: CATEGORY_PALETTE[selectedSignal.category].bg,
                      color: CATEGORY_PALETTE[selectedSignal.category].color,
                    }}
                  >
                    {CATEGORY_PALETTE[selectedSignal.category].label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedSignal.id}
                  </span>
                </div>
                <h3 className="text-base font-bold tracking-tight text-antah-navy leading-snug">
                  {selectedSignal.title}
                </h3>
              </div>

              <p className="text-xs text-antah-slate leading-relaxed">
                {selectedSignal.description}
              </p>

              {/* Geography & Location Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-antah-teal shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-antah-navy block">{selectedSignal.locationName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {selectedSignal.coordinates[0].toFixed(4)}° N, {selectedSignal.coordinates[1].toFixed(4)}° E
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Reported:</span>
                  <span className="font-mono text-slate-700">{selectedSignal.reportedAt}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Reporter:</span>
                  <span className="font-medium text-slate-700">{selectedSignal.reporterName}</span>
                </div>
              </div>

              {/* Candidate Thread Connection Notice (if linked) */}
              {selectedSignal.relatedSignalId && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                    <GitFork size={13} className="text-amber-600" />
                    <span>Candidate Thread Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    {selectedSignal.candidateReason}
                  </p>
                  <button
                    onClick={() => onSelectSignalById(selectedSignal.relatedSignalId!)}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 pt-1"
                  >
                    <span>Inspect downstream partner ({selectedSignal.relatedSignalId})</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {/* Verified Status Banner */}
              {selectedSignal.status === 'verified_incident' && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-start gap-2">
                  <ShieldCheck size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Verified Civic Incident</span>
                    <span className="text-[11px] text-teal-800">
                      Remediation work order active. Coordinated field crew deployed.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

