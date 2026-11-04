import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Split,
  FileText,
  User,
  ChevronRight,
} from 'lucide-react';
import { ATLAS_CANDIDATE_CLUSTERS, ATLAS_SIGNALS, AtlasCandidateCluster } from '../components/atlas/types';
import { Link } from 'react-router-dom';

export const SignalPatternsPage: React.FC = () => {
  const [clusters, setClusters] = useState<AtlasCandidateCluster[]>(ATLAS_CANDIDATE_CLUSTERS);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(ATLAS_CANDIDATE_CLUSTERS[0].id);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];
  const linkedSignals = ATLAS_SIGNALS.filter((s) => selectedCluster.signals.includes(s.id));

  const handleVerifyPattern = () => {
    setClusters((prev) =>
      prev.map((c) =>
        c.id === selectedCluster.id ? { ...c, status: 'verified_incident' as const } : c
      )
    );
    setActionSuccessMessage(
      `Patrón ${selectedCluster.id} verificado oficialmente. Cuadrilla Hidráulica Alfa notificada.`
    );
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleDismissPattern = () => {
    setClusters((prev) =>
      prev.map((c) =>
        c.id === selectedCluster.id ? { ...c, status: 'dismissed' as const } : c
      )
    );
    setActionSuccessMessage(`Patrón ${selectedCluster.id} desvinculado.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="w-full px-4 pt-3 pb-8 space-y-5 select-none">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E4]">
        <div>
          <h1 className="text-xl font-bold text-[#202827] font-sans tracking-tight">
            Candidate Patterns
          </h1>
          <p className="text-[11px] text-[#737C78]">
            Clustering y correlación autónoma de anomalías
          </p>
        </div>

        <Link
          to="/explorer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E3E8E4] text-[#202827] text-xs font-semibold shadow-xs active:scale-95"
        >
          <Compass size={13} className="text-[#286B56]" />
          <span>Ver Mapa</span>
        </Link>
      </div>

      {/* 2. SUCCESS FEEDBACK BANNER */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-700 font-bold ml-2"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CLUSTERS LIST (Mobile Cards) */}
      <div className="space-y-3">
        {clusters.map((cluster) => {
          const isSelected = cluster.id === selectedCluster.id;
          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#286B56] shadow-sm ring-2 ring-[#286B56]/15'
                  : 'bg-white/80 border-[#E3E8E4] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {cluster.id}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                    cluster.status === 'verified_incident'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {cluster.status === 'verified_incident' ? 'Verificado' : 'Pendiente'}
                </span>
              </div>

              <h2 className="text-xs font-bold text-[#202827] leading-snug">
                {cluster.title}
              </h2>

              <p className="text-[11px] text-[#737C78] line-clamp-2 mt-1">
                {cluster.rationale}
              </p>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-stone-100 text-[10px]">
                <span className="text-[#737C78] font-mono">
                  {cluster.signals.length} señales conectadas
                </span>
                <span className="font-bold text-[#286B56] font-mono">
                  {Math.round(cluster.confidenceScore * 100)}% Confianza IA
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. DEEP CLUSTER INSPECTION PANEL */}
      <div className="bg-white rounded-3xl border border-[#E3E8E4] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {selectedCluster.id}
            </span>
            <span className="text-xs font-bold text-[#286B56] bg-[#E1F0E8] px-2 py-0.5 rounded-md font-mono">
              {Math.round(selectedCluster.confidenceScore * 100)}% CONFIANZA
            </span>
          </div>

          <h3 className="text-sm font-bold text-[#202827] pt-1">
            {selectedCluster.title}
          </h3>

          <div className="text-[10px] text-[#737C78] flex items-center gap-2 font-mono">
            <span>Detectado {selectedCluster.detectedAt}</span>
            <span>•</span>
            <span>Cuadrilla: {selectedCluster.assignedCrew?.split(' ')[0] || 'Alpha'}</span>
          </div>
        </div>

        {/* Rationale Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <span className="text-[9px] font-mono tracking-wider uppercase text-amber-800 font-bold block mb-1">
            EVIDENCIA DE CORRELACIÓN ESPACIAL
          </span>
          <p className="text-xs text-stone-800 leading-relaxed">
            {selectedCluster.rationale}
          </p>
        </div>

        {/* 2x2 Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-2xl bg-[#F5F6F4] border border-[#E3E8E4]">
            <span className="text-[9px] text-[#737C78] font-mono uppercase block">Distancia</span>
            <span className="text-sm font-bold text-[#202827]">~160 m</span>
            <span className="text-[9px] text-emerald-700 block">Mismo sector</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#F5F6F4] border border-[#E3E8E4]">
            <span className="text-[9px] text-[#737C78] font-mono uppercase block">Delta Tiempo</span>
            <span className="text-sm font-bold text-[#202827]">7 min</span>
            <span className="text-[9px] text-stone-500 block">Simultáneo</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#F5F6F4] border border-[#E3E8E4]">
            <span className="text-[9px] text-[#737C78] font-mono uppercase block">Desnivel</span>
            <span className="text-sm font-bold text-[#202827]">-4.2 m</span>
            <span className="text-[9px] text-amber-600 block">Pendiente</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#F5F6F4] border border-[#E3E8E4]">
            <span className="text-[9px] text-[#737C78] font-mono uppercase block">Conducto</span>
            <span className="text-sm font-bold text-[#202827]">Trunk #14</span>
            <span className="text-[9px] text-stone-500 block">Red 600mm</span>
          </div>
        </div>

        {/* Linked Signals List */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[10px] font-bold text-[#737C78] uppercase tracking-wider font-mono">
            Señales Conectadas ({linkedSignals.length})
          </h4>

          {linkedSignals.map((signal, idx) => (
            <div
              key={signal.id}
              className="p-3 rounded-2xl bg-[#F5F6F4] border border-[#E3E8E4] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#286B56]">
                  SEÑAL #{idx + 1}: {signal.id}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                  {signal.severity}
                </span>
              </div>
              <div className="text-xs font-bold text-[#202827]">
                {signal.title}
              </div>
              <div className="text-[10px] text-[#737C78]">
                {signal.locationName} • {signal.reporterName}
              </div>
            </div>
          ))}
        </div>

        {/* Primary Touch Verification Action */}
        <div className="pt-2">
          {selectedCluster.status !== 'verified_incident' ? (
            <button
              onClick={handleVerifyPattern}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-semibold bg-[#286B56] hover:bg-[#1f5645] active:scale-98 text-white shadow-sm min-h-[48px] transition-all"
            >
              <ShieldCheck size={16} />
              <span>Verificar como Incidente Municipal</span>
            </button>
          ) : (
            <div className="w-full py-3 rounded-2xl bg-[#E1F0E8] text-[#286B56] text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>Incidente Verificado y Despachado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalPatternsPage;
