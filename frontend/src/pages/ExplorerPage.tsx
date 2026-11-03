import React, { useState, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import { REPORT_CATEGORIES, ReportCategory } from '../theme/tokens';
import { SAMPLE_CITY_SIGNALS, CitySignal } from '../components/city3d/types';
import {
  Compass,
  Filter,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

const CityCanvas = React.lazy(() =>
  import('../components/city3d/CityCanvas').then((mod) => ({ default: mod.CityCanvas }))
);

export const ExplorerPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSignal, setActiveSignal] = useState<CitySignal | null>(SAMPLE_CITY_SIGNALS[0]);

  const filteredSignals = SAMPLE_CITY_SIGNALS.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-teal mb-1">
              <Compass size={14} />
              <span>GEOSPATIAL INTELLIGENCE MATRIX</span>
            </div>
            <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              Network Explorer
            </h1>
            <p className="text-sm text-antah-slate mt-1">
              Inspect active civic observations, spatial clusters, and AI candidate pattern hypotheses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-antah-muted">Filtered Signals: {filteredSignals.length}</span>
          </div>
        </div>

        {/* 3D Geospatial Twin Canvas */}
        <div>
          <Suspense
            fallback={
              <div className="w-full h-[540px] sm:h-[620px] rounded-2xl bg-slate-100 border border-antah-border flex flex-col items-center justify-center gap-3 text-xs font-mono text-antah-slate">
                <div className="w-6 h-6 border-2 border-antah-teal border-t-transparent rounded-full animate-spin" />
                <span>LOADING NETWORK EXPLORER MATRIX...</span>
              </div>
            }
          >
            <CityCanvas onSignalClick={(sig) => setActiveSignal(sig)} />
          </Suspense>
        </div>

        {/* Filter Controls & List Grid */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-antah-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-antah-slate flex items-center gap-1 mr-1">
                <Filter size={13} /> Filter:
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-antah-navy text-white'
                    : 'bg-white border border-antah-border text-antah-slate hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === catKey
                      ? 'bg-antah-teal text-white'
                      : 'bg-white border border-antah-border text-antah-slate hover:bg-slate-50'
                  }`}
                >
                  {REPORT_CATEGORIES[catKey].label}
                </button>
              ))}
            </div>
          </div>

          {/* Observations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSignals.map((signal) => (
              <Card
                key={signal.id}
                variant="interactive"
                onClick={() => setActiveSignal(signal)}
                className={activeSignal?.id === signal.id ? 'ring-2 ring-antah-teal' : ''}
              >
                <CardHeader className="py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-antah-navy bg-slate-100 px-2 py-0.5 rounded">
                        {signal.id}
                      </span>
                      <CategoryBadge category={signal.category} size="sm" />
                    </div>
                    <StatusBadge status={signal.status} size="sm" />
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <h4 className="text-sm font-bold text-antah-navy">{signal.title}</h4>
                  <p className="text-xs text-antah-slate mt-1 line-clamp-2">{signal.description}</p>
                  <div className="mt-3 pt-3 border-t border-antah-border-light flex items-center justify-between text-[11px] text-antah-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {signal.locationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {signal.reportedAt}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
