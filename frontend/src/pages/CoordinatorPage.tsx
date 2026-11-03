import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CategoryBadge, StatusBadge, AiCandidateBadge } from '../components/common/Badge';
import { ShieldAlert, Sparkles, CheckCircle2, XCircle, HelpCircle, MessageSquare } from 'lucide-react';

export const CoordinatorPage: React.FC = () => {
  const [clusterApproved, setClusterApproved] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApprove = () => {
    setClusterApproved(true);
    setActionSuccess('Candidate Pattern #409 approved as Verified Incident INC-2026-088. Dispatch channel initialized on Nexconn Chat.');
  };

  const handleReject = () => {
    setActionSuccess('Candidate Pattern #409 marked as non-correlated. Individual reports preserved.');
  };

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-amber mb-1">
            <ShieldAlert size={14} />
            <span>COORDINATOR COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
            Coordinator Verification Hub
          </h1>
          <p className="text-sm text-antah-slate mt-1">
            Human-in-the-loop review of algorithmic candidate relationships. Verify or dismiss suggested incident clusters.
          </p>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs font-medium text-teal-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-teal-600" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-teal-700 hover:text-teal-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Candidate Cluster Card */}
        <Card variant="panel" className="border-amber-200/90 bg-amber-50/20">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <AiCandidateBadge confidenceScore={0.91} />
                <span className="font-mono text-xs font-bold text-antah-navy">CLUSTER #409</span>
              </div>
              <span className="text-xs font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                Status: Pending Human Review
              </span>
            </div>
            <CardTitle className="text-lg mt-2">
              Hydraulic Pressure Fracture & Downstream Stormwater Surcharge
            </CardTitle>
            <CardDescription>
              AI detected 2 correlated signals in Sector 3 with 91% structural dependency probability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contributing reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-antah-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-antah-navy">SIG-802</span>
                  <CategoryBadge category="water_leakage" size="sm" />
                </div>
                <h5 className="text-xs font-bold text-antah-navy">High Pressure Water Main Seepage</h5>
                <p className="text-xs text-antah-slate">4th Main Road, Sector 3 (Reported 18m ago)</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-antah-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-antah-navy">SIG-805</span>
                  <CategoryBadge category="drainage_overflow" size="sm" />
                </div>
                <h5 className="text-xs font-bold text-antah-navy">Stormwater Culvert Backflow</h5>
                <p className="text-xs text-antah-slate">Crossroad 7, Sector 3 (Reported 25m ago)</p>
              </div>
            </div>

            {/* AI Correlation Rationale */}
            <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-antah-slate space-y-1.5">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-600" /> Algorithmic Suggestion Rationale:
              </span>
              <p className="leading-relaxed">
                Geographic distance between pins is 90 meters. Both reports logged during dry weather within 7 minutes.
                Municipal GIS shows main water line running directly parallel to drainage collector conduit.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-wrap gap-2">
            {!clusterApproved ? (
              <>
                <Button
                  variant="amber"
                  size="sm"
                  icon={<CheckCircle2 size={15} />}
                  onClick={handleApprove}
                >
                  Approve as Verified Incident
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<HelpCircle size={15} />}
                  onClick={() => setActionSuccess('Requested ground inspection crew photograph for Cluster #409.')}
                >
                  Request More Information
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<XCircle size={15} />}
                  onClick={handleReject}
                >
                  Dismiss Candidate
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>Verified Incident INC-2026-088 Active</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

