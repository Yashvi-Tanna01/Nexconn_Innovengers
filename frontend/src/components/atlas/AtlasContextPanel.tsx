import React, { useEffect } from 'react';
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
  Activity,
  Layers,
  CheckCircle2,
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
  // Accessible Escape key to dismiss context inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedSignal && !selectedCluster) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-label="Civic Signal Context Inspector"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto absolute bottom-0 left-0 right-0 max-h-[85%] sm:max-h-none sm:top-4 sm:bottom-4 sm:left-auto sm:right-16 w-full sm:w-[380px] lg:w-[420px] bg-white rounded-t-3xl sm:rounded-3xl border border-[#E6EAE6] shadow-[0_20px_50px_rgba(24,35,34,0.14)] flex flex-col z-[510] overflow-hidden"
      >
        {/* Mobile touch-drag handle indicator */}
        <div className="sm:hidden w-12 h-1 bg-[#E6EAE6] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* 1. EDITORIAL HEADER */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[#E6EAE6] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedCluster
                  ? 'bg-[#D99A45] animate-pulse'
                  : selectedSignal?.status === 'verified_incident'
                  ? 'bg-[#D9534F]'
                  : selectedSignal?.status === 'resolved'
                  ? 'bg-[#286B56]'
                  : 'bg-[#182322]'
              }`}
            />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#727C79]">
              {selectedCluster
                ? 'Candidate Signal Cluster'
                : selectedSignal?.status === 'verified_incident'
                ? 'Verified Civic Incident'
                : selectedSignal?.status === 'resolved'
                ? 'Resolved Municipal Ticket'
                : 'Reported Community Issue'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#727C79] hover:text-[#182322] hover:bg-[#F8F8F5] transition-colors"
            title="Close Panel (Esc)"
            aria-label="Close Inspector"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. SCROLLABLE CONTENT BODY */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-[#182322] scrollbar-none">
          {/* A. CLUSTER / THREAD INSPECTION */}
          {selectedCluster && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#D99A45]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#D99A45] uppercase tracking-wide flex items-center gap-1.5">
                    <GitFork size={13} />
                    AI Correlation Hypothesis
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full border border-[#D99A45]/20">
                    {Math.round(selectedCluster.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <h4 className="text-sm font-bold tracking-tight text-[#182322] leading-snug">
                  {selectedCluster.title}
                </h4>
                <p className="text-xs text-[#727C79] leading-relaxed">
                  {selectedCluster.rationale}
                </p>

                <div className="pt-2 border-t border-[#D99A45]/20 text-[10px] font-mono text-[#727C79] flex items-center gap-1.5">
                  <AlertCircle size={12} className="shrink-0 text-[#D99A45]" />
                  <span>Hypothesis awaiting coordinator verification before dispatch.</span>
                </div>
              </div>

              {/* Linked Incident Observations */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase text-[#727C79] tracking-wider flex items-center justify-between">
                  <span>Linked Community Observations</span>
                  <span>{selectedCluster.signals.length} Reports</span>
                </span>
                <div className="space-y-2">
                  {selectedCluster.signals.map((sigId) => (
                    <button
                      key={sigId}
                      onClick={() => onSelectSignalById(sigId)}
                      className="w-full text-left p-3.5 rounded-2xl border border-[#E6EAE6] hover:border-[#D99A45] hover:bg-[#FFFBEB]/40 active:scale-[0.99] transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-[#286B56] bg-[#E1F0E8] px-2 py-0.5 rounded">
                            {sigId}
                          </span>
                          <span className="text-[11px] text-[#727C79] font-mono">Bangalore East</span>
                        </div>
                        <span className="text-xs font-semibold text-[#182322] group-hover:text-[#D99A45] transition-colors block">
                          {sigId === 'SIG-802' ? 'High Pressure Pipe Seepage' : 'Stormwater Culvert Backflow'}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-[#727C79] group-hover:text-[#D99A45] transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification & Coordination Telemetry */}
              <div className="p-3.5 rounded-2xl bg-[#F8F8F5] border border-[#E6EAE6] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#727C79] font-medium">Verification Status:</span>
                  <span className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    selectedCluster.status === 'verified_incident'
                      ? 'bg-[#FEF2F2] text-[#D9534F] border border-[#D9534F]/30'
                      : 'bg-[#FFFBEB] text-[#D99A45] border border-[#D99A45]/30'
                  }`}>
                    {selectedCluster.status === 'verified_incident' ? 'Verified Incident' : 'Awaiting Coordinator'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#727C79] font-medium">Designated Response:</span>
                  <span className="font-semibold text-[#182322]">{selectedCluster.assignedCrew || 'Rapid Crew Alpha'}</span>
                </div>
              </div>

              {/* Actions */}
              {onOpenChat && (
                <button
                  onClick={() => onOpenChat(selectedCluster.id, selectedCluster.title)}
                  className="w-full py-3 px-4 rounded-2xl bg-[#286B56] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#205545] active:scale-[0.98] transition-all shadow-xs"
                >
                  <MessageSquare size={14} />
                  <span>Open Responder Incident Room</span>
                </button>
              )}
            </div>
          )}

          {/* B. SINGLE SIGNAL INSPECTION */}
          {selectedSignal && !selectedCluster && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-current/20"
                    style={{
                      backgroundColor: CATEGORY_PALETTE[selectedSignal.category].bg,
                      color: CATEGORY_PALETTE[selectedSignal.category].color,
                    }}
                  >
                    {CATEGORY_PALETTE[selectedSignal.category].label}
                  </span>
                  <span className="text-[10px] font-mono text-[#727C79] font-bold bg-[#F8F8F5] px-2 py-0.5 rounded">
                    {selectedSignal.id}
                  </span>
                  {selectedSignal.status === 'verified_incident' && (
                    <span className="text-[10px] font-mono font-bold text-[#D9534F] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#D9534F]/20">
                      VERIFIED INCIDENT
                    </span>
                  )}
                  {selectedSignal.status === 'resolved' && (
                    <span className="text-[10px] font-mono font-bold text-[#286B56] bg-[#E1F0E8] px-2 py-0.5 rounded border border-[#286B56]/20">
                      RESOLVED
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#182322] leading-snug">
                  {selectedSignal.title}
                </h3>
              </div>

              <p className="text-xs text-[#727C79] leading-relaxed">
                {selectedSignal.description}
              </p>

              {/* Geographic Telemetry Card */}
              <div className="p-3.5 rounded-2xl bg-[#F8F8F5] border border-[#E6EAE6] space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#286B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#182322] block">{selectedSignal.locationName}</span>
                    <span className="text-[11px] text-[#727C79] font-mono">
                      {selectedSignal.coordinates[0].toFixed(4)}° N, {selectedSignal.coordinates[1].toFixed(4)}° E • {selectedSignal.neighborhood}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6EAE6] flex items-center justify-between text-[11px]">
                  <span className="text-[#727C79]">Reported:</span>
                  <span className="font-mono text-[#182322] font-medium">{selectedSignal.reportedAt}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#727C79]">Reporter:</span>
                  <span className="font-medium text-[#182322]">{selectedSignal.reporterName}</span>
                </div>
                {selectedSignal.affectedInfrastructure && (
                  <div className="pt-2 border-t border-[#E6EAE6] flex items-center justify-between text-[11px]">
                    <span className="text-[#727C79]">Infrastructure Conduit:</span>
                    <span className="font-mono text-[#286B56] font-semibold text-[10px]">{selectedSignal.affectedInfrastructure}</span>
                  </div>
                )}
              </div>

              {/* Connected Signal Thread (Candidate Correlation) */}
              {selectedSignal.relatedSignalId && (
                <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#D99A45]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#D99A45] text-xs font-bold">
                      <GitFork size={13} />
                      <span>Candidate Signal Thread</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full uppercase border border-[#D99A45]/20">
                      Inferred Link
                    </span>
                  </div>

                  <p className="text-[11px] text-[#727C79] leading-relaxed">
                    {selectedSignal.candidateReason}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#727C79] pt-1 border-t border-[#D99A45]/20">
                    <div>
                      <span className="text-[#727C79] block">Proximity:</span>
                      <span className="font-bold text-[#182322]">~160m along gradient</span>
                    </div>
                    <div>
                      <span className="text-[#727C79] block">Confidence:</span>
                      <span className="font-bold text-[#D99A45]">
                        {Math.round((selectedSignal.confidenceScore || 0.94) * 100)}% Correlation
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSignalById(selectedSignal.relatedSignalId!)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white hover:bg-[#FEF3C7] text-[#182322] font-semibold text-[11px] border border-[#D99A45]/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect downstream partner ({selectedSignal.relatedSignalId})</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {/* Verified Incident Banner */}
              {selectedSignal.status === 'verified_incident' && (
                <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#D9534F]/30 text-xs flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-[#D9534F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#D9534F] block">Verified Civic Incident</span>
                    <span className="text-[11px] text-[#727C79] leading-snug block mt-0.5">
                      Remediation work order dispatched. Municipal crew assigned to site.
                    </span>
                  </div>
                </div>
              )}

              {/* Resolved Incident Banner */}
              {selectedSignal.status === 'resolved' && (
                <div className="p-3.5 rounded-2xl bg-[#E1F0E8] border border-[#286B56]/30 text-xs flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#286B56] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#286B56] block">Remediation Completed</span>
                    <span className="text-[11px] text-[#727C79] leading-snug block mt-0.5">
                      Incident inspected and confirmed resolved by field marshals.
                    </span>
                  </div>
                </div>
              )}

              {/* Primary Actions */}
              <div className="space-y-2 pt-1">
                {onOpenChat && (
                  <button
                    onClick={() => onOpenChat(selectedSignal.id, selectedSignal.title)}
                    className="w-full py-3 px-4 rounded-2xl bg-[#286B56] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#205545] active:scale-[0.98] transition-all shadow-xs"
                  >
                    <MessageSquare size={14} />
                    <span>Open Incident Room</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
