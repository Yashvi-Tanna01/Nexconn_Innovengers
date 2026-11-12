import React, { useState, Suspense, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ShieldAlert,
  Layers,
  Users,
  AlertTriangle,
  ThumbsUp,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Radio,
  FileText,
  MapPin,
  Maximize2,
} from 'lucide-react';
import { ATLAS_SIGNALS, ATLAS_CANDIDATE_CLUSTERS, ATLAS_DISTRICTS, AtlasSignal } from '../components/atlas/types';
import { PageLoadingState } from '../components/loading';
import { API_ENDPOINTS, Analytics, apiRequest } from '../config/api';

const CitySignalAtlas = React.lazy(() =>
  import('../components/atlas/CitySignalAtlas').then((mod) => ({ default: mod.CitySignalAtlas }))
);

export const DashboardPage: React.FC = () => {
  const [selectedSignal, setSelectedSignal] = useState<AtlasSignal | null>(ATLAS_SIGNALS[0]);
  const primaryCluster = ATLAS_CANDIDATE_CLUSTERS[0];
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);
    const result = await apiRequest<Analytics>(API_ENDPOINTS.analytics);
    if (result.data) {
      setAnalytics(result.data);
    } else {
      setAnalytics(null);
      setAnalyticsError(result.error || 'Unable to load dashboard telemetry.');
    }
    setIsAnalyticsLoading(false);
  };

  useEffect(() => { void loadAnalytics(); }, []);

  const metrics = [
    { label: 'Reportes', value: analytics ? String(analytics.reports) : isAnalyticsLoading ? '…' : '—', trend: 'Backend', color: 'text-[#286B56]', bg: 'bg-[#E1F0E8]' },
    { label: 'Clusters', value: analytics ? String(analytics.clusters) : isAnalyticsLoading ? '…' : '—', trend: 'Backend', color: 'text-[#E7A65B]', bg: 'bg-amber-50' },
    { label: 'Señales', value: analytics ? String(analytics.reports) : isAnalyticsLoading ? '…' : '—', trend: 'Backend', color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Incidentes', value: analytics ? String(analytics.incidents) : isAnalyticsLoading ? '…' : '—', trend: 'Backend', color: 'text-teal-700', bg: 'bg-teal-50' },
    { label: 'Aprobados', value: analytics ? String(analytics.approved_clusters) : isAnalyticsLoading ? '…' : '—', trend: 'Backend', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Resueltos', value: analytics ? String(analytics.resolved_incidents) : isAnalyticsLoading ? '…' : '—', trend: 'Backend', color: 'text-[#D9534F]', bg: 'bg-red-50' },
  ];

  return (
    <div className="w-full px-4 pt-3 pb-32 sm:pb-40 space-y-5 select-none">
      {/* 1. COMPACT WELCOME HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E4]">
        <div>
          <h1 className="text-xl font-bold text-[#202827] font-sans tracking-tight">
            Observatory Overview
          </h1>
          <p className="text-[11px] text-[#737C78]">
            Región Bangalore Este • Telemetría en Vivo
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#286B56] text-white text-xs font-semibold shadow-xs active:scale-95"
        >
          <span>+ Reportar</span>
        </Link>
      </div>

      {/* 2. HORIZONTALLY SCROLLABLE METRIC CHIPS CAROUSEL */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-[#737C78] uppercase tracking-wider font-semibold">
            TELEMETRÍA TERRITORIAL
          </span>
          <span className="text-[10px] text-emerald-700 font-mono">EN TIEMPO REAL</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="shrink-0 w-28 p-3 rounded-2xl bg-white border border-[#E3E8E4] shadow-xs flex flex-col justify-between"
            >
              <span className="text-[10px] font-medium text-[#737C78] truncate">
                {m.label}
              </span>
              <div className="text-lg font-bold text-[#202827] my-0.5">
                {m.value}
              </div>
              <span className={`text-[10px] font-mono font-bold ${m.color}`}>
                {m.trend}
              </span>
            </div>
          ))}
        </div>
        {analyticsError && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            <span>{analyticsError}</span>
            <button type="button" onClick={() => void loadAnalytics()} className="font-semibold underline">Retry</button>
          </div>
        )}
      </section>

      {/* 3. PRIMARY GEOGRAPHIC MAP PREVIEW */}
      <section className="bg-white rounded-3xl border border-[#E3E8E4] shadow-xs p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#202827]">
                Visor Cartográfico Territorial
              </h2>
              <span className="text-[10px] text-[#737C78]">4 Cuadrantes en Monitoreo</span>
            </div>
          </div>

          <Link
            to="/explorer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#286B56] hover:underline"
          >
            <span>Ver Completo</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Map Canvas Preview */}
        <div className="relative w-full h-[260px] rounded-2xl overflow-hidden border border-[#E3E8E4] bg-stone-100">
          <Suspense fallback={<PageLoadingState message="Cargando mapa territorial..." />}>
            <CitySignalAtlas
              className="w-full h-full"
              selectedSignalId={selectedSignal?.id}
              onSignalClick={(s) => setSelectedSignal(s)}
              onSignalClose={() => setSelectedSignal(null)}
            />
          </Suspense>
        </div>
      </section>

      {/* 4. SIGNAL PATTERNS REQUIRING ATTENTION */}
      <section className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>PATRÓN CANDIDATO PRIORITARIO</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#D9534F] text-white text-[9px] font-mono font-bold">
            94% Confianza
          </span>
        </div>

        <h3 className="text-xs font-bold text-[#202827] leading-snug">
          {primaryCluster.title}
        </h3>

        <p className="text-[11px] text-stone-700 line-clamp-2">
          {primaryCluster.rationale}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-[11px]">
          <span className="text-stone-500 font-mono text-[10px]">
            Sector 3 • 2 Señales
          </span>
          <Link
            to="/patterns"
            className="inline-flex items-center gap-1 text-[#286B56] font-bold text-xs"
          >
            <span>Inspeccionar y Verificar</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </section>

      {/* 5. RECENT INCIDENT ACTIVITY TIMELINE */}
      <section className="bg-white rounded-3xl border border-[#E3E8E4] shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h3 className="text-xs font-bold text-[#202827]">
            Bitácora Reciente de Incidentes
          </h3>
          <span className="text-[10px] font-mono text-emerald-700 font-bold">
            EN VIVO
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-[#202827]">
                Fisura en red potable reportada por vecina
              </div>
              <span className="text-[10px] text-[#737C78]">
                Sector 3 Hydrologic Quad • Hace 18 mins
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-[#202827]">
                IA correlacionó desborde de sumidero downstream
              </div>
              <span className="text-[10px] text-[#737C78]">
                CLUSTER-409 Generado • Hace 25 mins
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-[#202827]">
                Cuadrilla Hidráulica Alfa en camino al sitio
              </div>
              <span className="text-[10px] text-[#737C78]">
                Remediación Municipal • Hace 40 mins
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMPACT CATEGORY SENSITIVITY BREAKDOWN */}
      <section className="bg-white rounded-3xl border border-[#E3E8E4] shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h3 className="text-xs font-bold text-[#202827]">
            Riesgo por Categoría
          </h3>
          <span className="text-[10px] text-[#737C78]">Carga activa</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium text-stone-700">Fugas de Agua</span>
              <span className="font-bold text-red-600">72%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '72%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium text-stone-700">Desbordes y Drenaje</span>
              <span className="font-bold text-amber-600">48%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '48%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium text-stone-700">Calzadas y Asfalto</span>
              <span className="font-bold text-amber-600">45%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
