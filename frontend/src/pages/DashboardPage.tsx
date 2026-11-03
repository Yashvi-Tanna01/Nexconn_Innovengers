import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import { SAMPLE_CITY_SIGNALS } from '../components/city3d/types';
import { LayoutDashboard, PlusCircle, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-teal mb-1">
              <LayoutDashboard size={14} />
              <span>CITIZEN INTELLIGENCE PORTAL</span>
            </div>
            <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              Resident Dashboard
            </h1>
            <p className="text-sm text-antah-slate mt-1">
              Track your reported community observations, verification milestones, and municipal resolutions.
            </p>
          </div>

          <Link to="/report">
            <Button variant="primary" size="md" icon={<PlusCircle size={16} />}>
              Report an Observation
            </Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="default" className="p-5">
            <div className="text-2xl font-black text-antah-navy font-mono">5</div>
            <div className="text-xs font-semibold text-antah-slate mt-1">Observations Logged</div>
          </Card>
          <Card variant="default" className="p-5">
            <div className="text-2xl font-black text-antah-amber font-mono">2</div>
            <div className="text-xs font-semibold text-antah-slate mt-1">Under AI Correlation Review</div>
          </Card>
          <Card variant="default" className="p-5">
            <div className="text-2xl font-black text-antah-teal font-mono">3</div>
            <div className="text-xs font-semibold text-antah-slate mt-1">Verified & Dispatched</div>
          </Card>
        </div>

        {/* My Reports Table / Cards */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-base">Recent Community Observations</CardTitle>
            <CardDescription>
              Real-time synchronization with ANTAH municipal database.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-antah-border-light p-0">
            {SAMPLE_CITY_SIGNALS.map((sig) => (
              <div key={sig.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-antah-navy">{sig.id}</span>
                    <CategoryBadge category={sig.category} size="sm" />
                    <StatusBadge status={sig.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-antah-navy">{sig.title}</h4>
                  <p className="text-xs text-antah-slate">{sig.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-antah-muted whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {sig.locationName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={12} /> {sig.reportedAt}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

