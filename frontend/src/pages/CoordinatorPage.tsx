import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AiCandidateBadge } from '../components/common/Badge';
import { NexconnChatPanel } from '../components/chat/NexconnChatPanel';
import { useLoading } from '../context/LoadingContext';
import { API_ENDPOINTS, apiRequest, Cluster } from '../config/api';
import { panelVariants } from '../theme/motion';
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Activity,
} from 'lucide-react';

export const CoordinatorPage: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [activeChat, setActiveChat] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { startLoading, stopLoading } = useLoading();

  const cluster = clusters.find((item) => item.id === selectedClusterId) || clusters[0];
  const clusterState = cluster?.status === 'approved' ? 'verified' : cluster?.status === 'rejected' ? 'dismissed' : 'pending';

  const loadClusters = async () => {
    setIsLoading(true);
    const result = await apiRequest<Cluster[]>(API_ENDPOINTS.clusters);
    if (result.data) {
      setClusters(result.data);
      setSelectedClusterId((current) => current ?? result.data?.[0]?.id ?? null);
    } else {
      setErrorNotice(result.error || 'Unable to load candidate clusters.');
    }
    setIsLoading(false);
  };

  useEffect(() => { void loadClusters(); }, []);

  const reviewCluster = async (decision: 'approved' | 'rejected' | 'needs_info') => {
    if (!cluster) return;
    startLoading(
      `coord-${decision}`,
      'Saving coordinator review to the audit trail...',
      'coordinator'
    );
    setIsReviewing(true);
    const result = await apiRequest<Cluster>(`/clusters/${cluster.id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
    if (result.data) {
      setClusters((previous) => previous.map((item) => item.id === result.data?.id ? result.data : item));
      setActionNotice(decision === 'approved' ? 'Candidate cluster approved as a verified incident.' :
        decision === 'rejected' ? 'Candidate cluster dismissed and preserved in the audit trail.' :
          'Additional information requested for this candidate cluster.');
    } else {
      setErrorNotice(result.error || 'Unable to save coordinator review.');
    }
    setIsReviewing(false);
    stopLoading(`coord-${decision}`);
  };

  if (!cluster) {
    return (
      <div className="min-h-screen bg-antah-ivory text-antah-navy py-8 pb-24 px-4 text-sm">
        {isLoading ? 'Loading candidate clusters…' : errorNotice || 'No candidate clusters are available.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-amber mb-1">
              <ShieldAlert size={14} />
              <span>COORDINATOR COMMAND TERMINAL</span>
            </div>
            <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              Coordinator Verification Hub
            </h1>
            <p className="text-sm text-antah-slate mt-0.5">
              Review spatial-temporal pattern suggestions before declaring verified civic incidents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-antah-slate font-semibold">
              REVIEW QUEUE: 1 CANDIDATE
            </span>
          </div>
        </div>

        {/* Action Notice Banner */}
        <AnimatePresence mode="wait">
          {actionNotice && (
            <motion.div
              key={`notice-${actionNotice}`}
              variants={shouldReduceMotion ? undefined : panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs font-medium text-teal-900 flex items-center justify-between shadow-soft-xs"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                <span>{actionNotice}</span>
              </div>
              <button
                onClick={() => setActionNotice(null)}
                className="text-teal-700 hover:text-teal-900 font-bold ml-4"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
            <span>{errorNotice}</span>
            <button onClick={() => setErrorNotice(null)} className="font-bold ml-4">Dismiss</button>
          </div>
        )}

        {/* Main Grid: Candidate Cluster Review & Incident List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: The Candidate Pattern Review Space */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="panel" tilt={true} className="border-amber-200/90 bg-amber-50/25">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <AiCandidateBadge confidenceScore={cluster.score} />
                    <span className="font-mono text-xs font-bold text-antah-navy">CLUSTER-{cluster.id}</span>
                  </div>
                  <span
                    className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-semibold ${
                      clusterState === 'verified'
                        ? 'bg-teal-100 text-teal-900'
                        : clusterState === 'dismissed'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {clusterState === 'verified'
                      ? 'INCIDENT VERIFIED & ACTIVE'
                      : clusterState === 'dismissed'
                      ? 'DISMISSED AS UNRELATED'
                      : 'STATUS: PENDING HUMAN REVIEW'}
                  </span>
                </div>

                <CardTitle className="text-lg mt-3">{cluster.title}</CardTitle>
                <CardDescription>
                  Spatial-temporal correlation engine flagged 2 interrelated infrastructure anomalies in Sector 3.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Algorithmic Evidence telemetry card */}
                <div className="p-4 rounded-xl bg-white border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-600 animate-pulse" />
                      Algorithmic Candidate Rationale:
                    </span>
                    <span className="font-mono text-amber-800">Telemetry Metric: 94% Dependency</span>
                  </div>
                  <p className="text-xs text-antah-slate leading-relaxed">
                    {cluster.explanation}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-antah-muted border-t border-slate-100">
                    <span>Geographic Distance: 90 meters</span>
                    <span>Elevation Gradient: -2.4m</span>
                    <span>Conduit: Potable Feeder Trunk #14</span>
                  </div>
                </div>

                {/* Individual contributing reports */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-antah-navy">
                    Cluster Evidence
                  </h4>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs text-antah-slate">
                    The current cluster endpoint provides the explanation and confidence score. Linked report details are not included.
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-wrap gap-2 justify-between">
                {clusterState === 'pending' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="amber"
                      size="sm"
                      icon={<CheckCircle2 size={15} />}
                      onClick={() => reviewCluster('approved')}
                      disabled={isReviewing}
                      className="font-bold shadow-soft-xs"
                    >
                      Approve as Verified Incident
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<HelpCircle size={15} />}
                      onClick={() => reviewCluster('needs_info')}
                      disabled={isReviewing}
                    >
                      Request Sensor Telemetry
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<XCircle size={15} />}
                      onClick={() => reviewCluster('rejected')}
                      disabled={isReviewing}
                    >
                      Dismiss Hypothesis
                    </Button>
                  </div>
                ) : clusterState === 'verified' ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                      <CheckCircle2 size={16} className="text-teal-600" />
                      <span>Cluster approved. Incident creation is handled by the backend.</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<MessageSquare size={14} />}
                      onClick={() => setActiveChat(!activeChat)}
                      className="font-bold"
                    >
                      {activeChat ? 'Hide Incident Chat' : 'Open Nexconn Collaboration'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-antah-muted">Cluster was dismissed as independent issues.</div>
                )}
              </CardFooter>
            </Card>

            {/* Embedded Real-Time Nexconn Chat Workspace with AnimatePresence */}
            <AnimatePresence>
              {activeChat && (
                <motion.div
                  variants={shouldReduceMotion ? undefined : panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <NexconnChatPanel
                    incidentId="INC-2026-088"
                    incidentTitle="Hydraulic Main Rupture & Street Ponding"
                    onClose={() => setActiveChat(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Col: Active Verified Incidents Roster */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-antah-navy flex items-center gap-2">
              <Activity size={15} className="text-antah-teal" />
              <span>Verified Civic Incidents (3)</span>
            </h3>

            <Card variant="default" tilt={true} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-antah-navy">INC-2026-081</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                  DISPATCHED
                </span>
              </div>
              <h4 className="text-xs font-bold text-antah-navy leading-snug">
                Asphalt Depressional Sinkhole on Express Busway
              </h4>
              <p className="text-[11px] text-antah-slate">
                Road barrier deployed. Asphalt cold-patch crew arriving at 15:30.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-antah-muted">
                <span>District: IND-04</span>
                <span className="text-antah-teal font-semibold">Crew Beta (3 Staff)</span>
              </div>
            </Card>

            <Card variant="default" tilt={true} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-antah-navy">INC-2026-076</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                  IN REMEDIATION
                </span>
              </div>
              <h4 className="text-xs font-bold text-antah-navy leading-snug">
                Transit Corridor Pedestrian Blackout
              </h4>
              <p className="text-[11px] text-antah-slate">
                Phase breaker line isolated. Cable splicers currently repairing underground fault.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-antah-muted">
                <span>District: MET-01</span>
                <span className="text-antah-teal font-semibold">Electrical Crew Gamma</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
