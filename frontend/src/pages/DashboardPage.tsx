import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { useLoading } from '../context/LoadingContext';
import { SAMPLE_CITY_SIGNALS, CitySignal } from '../components/city3d/types';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'resolved'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { startLoading, stopLoading } = useLoading();

  const handleRefresh = () => {
    setIsRefreshing(true);
    startLoading(
      'dashboard-refresh',
      'Synthesizing real-time district telemetry from civic intelligence mesh...',
      'network'
    );
    setTimeout(() => {
      setIsRefreshing(false);
      stopLoading('dashboard-refresh');
    }, 1400);
  };

  const myReports = SAMPLE_CITY_SIGNALS;

  const filtered = myReports.filter((r) => {
    if (filterTab === 'active') return r.status !== 'resolved';
    if (filterTab === 'resolved') return r.status === 'resolved';
    return true;
  });

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-teal mb-1">
              <LayoutDashboard size={14} />
              <span>RESIDENT CIVIC OBSERVATORY</span>
            </div>
            <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              Resident Dashboard
            </h1>
            <p className="text-sm text-antah-slate mt-0.5">
              Monitor your submitted observations, AI pattern correlation progress, and verified municipal resolutions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="md"
              isLoading={isRefreshing}
              onClick={handleRefresh}
              icon={<RefreshCw size={15} />}
              className="font-medium"
            >
              Refresh Telemetry
            </Button>
            <Link to="/report">
              <Button variant="primary" size="md" icon={<PlusCircle size={16} />} className="font-bold shadow-soft-xs">
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Civic Safety Pulse Metrics Cards with Subtle 3D Tilt */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default" tilt={true} className="p-5">
            <span className="text-[11px] font-mono font-bold uppercase text-antah-muted">My Observations</span>
            <div className="text-3xl font-black text-antah-navy font-mono mt-1">
              <AnimatedCounter value={6} />
            </div>
            <span className="text-[11px] text-antah-slate mt-0.5 block">Across 4 City Quadrants</span>
          </Card>

          <Card variant="default" tilt={true} className="p-5">
            <span className="text-[11px] font-mono font-bold uppercase text-amber-800">AI Pattern Matches</span>
            <div className="text-3xl font-black text-antah-amber font-mono mt-1">
              <AnimatedCounter value={2} />
            </div>
            <span className="text-[11px] text-amber-900 mt-0.5 block">Flagged for Coordinator Review</span>
          </Card>

          <Card variant="default" tilt={true} className="p-5">
            <span className="text-[11px] font-mono font-bold uppercase text-teal-800">Verified Incidents</span>
            <div className="text-3xl font-black text-antah-teal font-mono mt-1">
              <AnimatedCounter value={3} />
            </div>
            <span className="text-[11px] text-teal-900 mt-0.5 block">Dispatched to Civic Crews</span>
          </Card>

          <Card variant="default" tilt={true} className="p-5">
            <span className="text-[11px] font-mono font-bold uppercase text-indigo-800">Neighborhood Pulse</span>
            <div className="text-3xl font-black text-indigo-600 font-mono mt-1">
              <AnimatedCounter value={98} suffix="%" />
            </div>
            <span className="text-[11px] text-indigo-900 mt-0.5 block">Grid Stability Score</span>
          </Card>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-antah-navy text-white shadow-soft-xs'
                : 'text-antah-slate hover:bg-slate-100'
            }`}
          >
            All Observations ({myReports.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'active'
                ? 'bg-antah-teal text-white shadow-soft-xs'
                : 'text-antah-slate hover:bg-slate-100'
            }`}
          >
            Active / Investigating ({myReports.length})
          </button>
        </div>

        {/* Reports Timeline Feed */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base">Synchronized Community Observation Log</CardTitle>
            <CardDescription>
              Real-time synchronization with ANTAH municipal core telemetry.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {filtered.map((sig) => (
              <div
                key={sig.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-antah-navy bg-slate-100 px-2 py-0.5 rounded">
                      {sig.id}
                    </span>
                    <CategoryBadge category={sig.category} size="sm" />
                    <StatusBadge status={sig.status} size="sm" />
                  </div>

                  <h4 className="text-sm font-bold text-antah-navy">{sig.title}</h4>
                  <p className="text-xs text-antah-slate leading-relaxed">{sig.description}</p>

                  {sig.candidateReason && (
                    <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-600 flex-shrink-0" />
                      <span>{sig.candidateReason}</span>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col md:items-end justify-between items-center gap-2 text-xs text-antah-muted whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {sig.locationName}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock size={12} /> {sig.reportedAt}
                  </span>
                  <Link
                    to={`/explorer?signalId=${sig.id}`}
                    className="font-semibold text-antah-teal hover:underline flex items-center gap-1 text-[11px] pt-1"
                  >
                    View in 3D City <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
