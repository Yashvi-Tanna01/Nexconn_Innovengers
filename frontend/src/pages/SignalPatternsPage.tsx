import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { API_ENDPOINTS, apiRequest, Cluster } from '../config/api';
import { Link } from 'react-router-dom';
import { PatternNeuralGraph } from '../components/patterns/PatternNeuralGraph';

export const SignalPatternsPage: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  const loadClusters = async () => {
    setIsLoading(true);
    const result = await apiRequest<Cluster[]>(API_ENDPOINTS.clusters);
    if (result.data) {
      setClusters(result.data);
      setSelectedClusterId((current) => current ?? result.data?.[0]?.id ?? null);
    } else {
      setErrorMessage(result.error || 'No se pudieron cargar los patrones.');
    }
    setIsLoading(false);
  };

  useEffect(() => { void loadClusters(); }, []);

  const reviewCluster = async (decision: 'approved' | 'rejected' | 'needs_info') => {
    if (!selectedCluster) return;
    setIsReviewing(true);
    setErrorMessage(null);
    const result = await apiRequest<Cluster>(`/clusters/${selectedCluster.id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
    if (result.data) {
      setClusters((previous) => previous.map((cluster) =>
        cluster.id === result.data?.id ? result.data : cluster
      ));
      if (decision === 'approved') {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1900);
      }
      setActionSuccessMessage(
        decision === 'approved' ? 'Patrón verificado oficialmente.' :
          decision === 'rejected' ? 'Patrón descartado y registrado.' :
            'Se solicitó información adicional para este patrón.'
      );
    } else {
      setErrorMessage(result.error || 'No se pudo registrar la revisión.');
    }
    setIsReviewing(false);
  };

  if (!selectedCluster) {
    return (
      <div className="w-full px-4 pt-3 pb-8 text-xs text-[#737C78]">
        {isLoading ? 'Cargando patrones…' : errorMessage || 'No hay patrones para revisar.'}
      </div>
    );
  }

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
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* 3. CLUSTERS LIST (Mobile Cards) */}
      <div className="space-y-3">
        {isLoading && <div className="text-xs text-[#737C78] py-4 text-center">Cargando patrones…</div>}
        {!isLoading && !clusters.length && <div className="text-xs text-[#737C78] py-4 text-center">No hay patrones para revisar.</div>}
        {clusters.map((cluster) => {
          const isSelected = cluster.id === selectedCluster.id;
          return (
            <motion.div
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.18 }}
              className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#286B56] shadow-sm ring-2 ring-[#286B56]/15'
                  : 'bg-white/80 border-[#E3E8E4] hover:bg-white hover:border-[#286B56]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {cluster.id}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                    cluster.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {cluster.status === 'approved' ? 'Verificado' : cluster.status === 'rejected' ? 'Descartado' : cluster.status === 'needs_info' ? 'Info solicitada' : 'Pendiente'}
                </span>
              </div>

              <h2 className="text-xs font-bold text-[#202827] leading-snug">
                {cluster.title}
              </h2>

              <p className="text-[11px] text-[#737C78] line-clamp-2 mt-1">
                {cluster.explanation}
              </p>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-stone-100 text-[10px]">
                <span className="text-[#737C78] font-mono">
                  Revisión humana
                </span>
                <span className="font-bold text-[#286B56] font-mono">
                  {Math.round(cluster.score * 100)}% Confianza IA
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. DEEP CLUSTER INSPECTION PANEL */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-[#E3E8E4] p-4 sm:p-5 shadow-xs space-y-4">
        {/* CONFIRM: Golden Laser Scan Sweep */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
            <div className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-[#F5C77D]/50 to-[#087B56]/30 blur-sm animate-golden-scan" />
            <div className="absolute inset-y-0 w-1.5 bg-white shadow-[0_0_12px_#F5C77D] animate-golden-scan" />
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {selectedCluster.id}
            </span>
            <span className="text-xs font-bold text-[#286B56] bg-[#E1F0E8] px-2 py-0.5 rounded-md font-mono">
              {Math.round(selectedCluster.score * 100)}% CONFIANZA
            </span>
          </div>

          <h3 className="text-sm font-bold text-[#202827] pt-1">
            {selectedCluster.title}
          </h3>

          <div className="text-[10px] text-[#737C78] flex items-center gap-2 font-mono">
            <span>Cluster #{selectedCluster.id}</span>
            <span>•</span>
            <span>Estado: {selectedCluster.status}</span>
          </div>
        </div>

        {/* CONNECT: Neural Network Correlation Graph */}
        <PatternNeuralGraph
          clusterId={selectedCluster.id}
          clusterTitle={selectedCluster.title}
          confidenceScore={selectedCluster.score}
        />

        {/* Rationale Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <span className="text-[9px] font-mono tracking-wider uppercase text-amber-800 font-bold block mb-1">
            EVIDENCIA DE CORRELACIÓN ESPACIAL
          </span>
          <p className="text-xs text-stone-800 leading-relaxed">
            {selectedCluster.explanation}
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

        <div className="p-3 rounded-2xl bg-[#F5F6F4] border border-[#E3E8E4] text-[10px] text-[#737C78]">
          Linked report details are not included by the current cluster API.
        </div>

        {/* Primary Touch Verification Action */}
        <div className="pt-2">
          {selectedCluster.status === 'approved' ? (
            <div className="w-full py-3 rounded-2xl bg-[#E1F0E8] text-[#286B56] text-xs font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>Incidente Verificado</span>
            </div>
          ) : (
            <button
              onClick={() => reviewCluster('approved')}
              disabled={isReviewing}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-semibold bg-[#286B56] hover:bg-[#1f5645] active:scale-98 text-white shadow-sm min-h-[48px] transition-all"
            >
              <ShieldCheck size={16} />
              <span>{isReviewing ? 'Guardando revisión…' : 'Verificar como Incidente Municipal'}</span>
            </button>
          )}
          {selectedCluster.status !== 'approved' && (
            <div className="flex gap-2 mt-2">
              <button disabled={isReviewing} onClick={() => reviewCluster('needs_info')} className="flex-1 py-2 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-semibold">Solicitar información</button>
              <button disabled={isReviewing} onClick={() => reviewCluster('rejected')} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-[11px] font-semibold">Descartar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalPatternsPage;
