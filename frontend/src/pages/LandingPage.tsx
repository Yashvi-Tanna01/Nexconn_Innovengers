import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { CategoryBadge } from '../components/common/Badge';
import { BRAND, REPORT_CATEGORIES, ReportCategory } from '../theme/tokens';
import {
  Compass,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
  Network,
  Users,
  MessageSquare,
  CheckCircle2,
  Workflow,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

const CityCanvas = React.lazy(() =>
  import('../components/city3d/CityCanvas').then((mod) => ({ default: mod.CityCanvas }))
);

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-16 lg:pt-10 lg:pb-24 overflow-hidden border-b border-antah-border">
        {/* Subtle decorative geometric background lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Hero Header Content */}
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-antah-teal/10 border border-antah-teal/20 text-antah-teal text-xs font-semibold tracking-wide uppercase mb-4">
              <Radio size={13} className="text-antah-teal animate-pulse" />
              <span>Civic Intelligence Platform • Nexconn 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-antah-navy tracking-tight leading-[1.1]">
              Every Small Signal Matters.
            </h1>

            <p className="mt-4 text-lg sm:text-xl text-antah-slate leading-relaxed font-normal">
              ANTAH connects scattered community observations to uncover hidden patterns,
              coordinate rapid human action, and help municipal crews respond before minor hazards escalate.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <Link to="/explorer">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Compass size={18} />}
                  className="shadow-soft-md"
                >
                  Explore the Network
                </Button>
              </Link>

              <Link to="/report">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<PlusCircle size={18} />}
                  className="shadow-soft-sm"
                >
                  Report an Observation
                </Button>
              </Link>

              <div className="hidden sm:flex items-center gap-2 ml-2 text-xs font-mono text-antah-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>3D Twin Live</span>
              </div>
            </div>
          </div>

          {/* Interactive 3D City Twin Experience */}
          <div className="mt-4">
            <Suspense
              fallback={
                <div className="w-full h-[540px] sm:h-[620px] rounded-2xl bg-slate-100 border border-antah-border flex flex-col items-center justify-center gap-3 text-xs font-mono text-antah-slate">
                  <div className="w-6 h-6 border-2 border-antah-teal border-t-transparent rounded-full animate-spin" />
                  <span>INITIALIZING 3D CIVIC TWIN...</span>
                </div>
              }
            >
              <CityCanvas />
            </Suspense>
          </div>
        </div>
      </section>

      {/* 2. FIVE PRIMARY CIVIC SIGNAL CATEGORIES */}
      <section className="py-20 bg-white border-b border-antah-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-antah-teal mb-2">
              Civic Taxonomy
            </h2>
            <h3 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              Five Critical Infrastructure Signals
            </h3>
            <p className="mt-2 text-base text-antah-slate leading-relaxed">
              Every citizen observation is classified, geo-tagged, and indexed into spatial-temporal grids to detect systemic infrastructure degradation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((catKey) => {
              const cat = REPORT_CATEGORIES[catKey];
              return (
                <Card key={catKey} variant="default" className="group hover:border-slate-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CategoryBadge category={catKey} size="md" />
                      <span className="text-[11px] font-mono text-antah-muted uppercase">Active Sensor</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <h4 className="text-base font-bold text-antah-navy group-hover:text-antah-teal transition-colors">
                      {cat.label}
                    </h4>
                    <p className="text-xs text-antah-slate mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-antah-border-light flex items-center justify-between text-xs text-antah-muted">
                      <span>Proximity Radius: 150m</span>
                      <Link
                        to={`/explorer?category=${catKey}`}
                        className="font-semibold text-antah-teal flex items-center gap-1 hover:underline"
                      >
                        View Markers <ArrowRight size={12} />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Candidate Correlation Special Card */}
            <Card variant="panel" className="bg-amber-50/40 border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                    <Sparkles size={13} className="text-amber-600 animate-pulse" />
                    <span>Cross-Category AI Link</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-800 font-semibold">HYPOTHESIS</span>
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <h4 className="text-base font-bold text-amber-950">
                  Pattern Suggestion Engine
                </h4>
                <p className="text-xs text-amber-900 mt-2 leading-relaxed">
                  Identifies when a roadside water puddle and a culvert overflow 90m away stem from the exact same pressurized subterranean fracture.
                </p>
                <div className="mt-4 pt-4 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800 font-medium">
                  <span>Coordinator Decision Required</span>
                  <Link to="/coordinator" className="text-antah-amber font-bold hover:underline flex items-center gap-1">
                    Review Hub <ArrowRight size={12} />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. AI CORRELATION & ETHICAL ARCHITECTURE */}
      <section className="py-20 bg-antah-ivory border-b border-antah-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-antah-teal/10 text-antah-teal text-xs font-bold uppercase tracking-wider mb-3">
                <Network size={14} />
                <span>Explainable Spatial Intelligence</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-antah-navy tracking-tight leading-tight">
                Turning Isolated Whispers Into Verified Incidents
              </h2>
              <p className="mt-4 text-base text-antah-slate leading-relaxed">
                Traditional civic portals treat each complaint as an isolated ticket. ANTAH introduces
                a continuous spatial-temporal correlation layer that evaluates proximity, timeline concurrence,
                and infrastructural dependencies.
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-white border border-antah-border shadow-soft-xs flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-antah-teal flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-antah-navy">Spatial-Temporal Closeness</h4>
                    <p className="text-xs text-antah-slate mt-1 leading-relaxed">
                      Evaluates reports filed within 150 meters and 60 minutes of each other across compatible infrastructure grids.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-antah-border shadow-soft-xs flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-antah-amber flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-antah-navy">Human-in-the-Loop Safeguard</h4>
                    <p className="text-xs text-antah-slate mt-1 leading-relaxed">
                      AI correlations are framed strictly as candidate proposals. Authorized civic coordinators review supporting evidence before elevating clusters to confirmed incidents.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-antah-border shadow-soft-xs flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-antah-navy">Nexconn Incident Chat Channels</h4>
                    <p className="text-xs text-antah-slate mt-1 leading-relaxed">
                      Once verified, authorized emergency dispatchers and on-site repair crews communicate instantly through dedicated Nexconn real-time channels.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Workflow Mockup / Architecture Panel */}
            <div className="antah-panel rounded-2xl p-6 sm:p-8 border border-antah-border shadow-soft-md">
              <div className="flex items-center justify-between pb-4 border-b border-antah-border-light mb-6">
                <span className="font-mono text-xs font-bold text-antah-navy uppercase">
                  Candidate Cluster #409 Pipeline
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                  Awaiting Coordinator Verification
                </span>
              </div>

              {/* Step 1: Input reports */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white border border-antah-border text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="font-mono font-bold text-antah-navy">SIG-802:</span>
                    <span className="text-antah-slate">Water Main Seepage (Sector 3)</span>
                  </div>
                  <span className="text-[10px] font-mono text-antah-muted">18m ago</span>
                </div>

                <div className="p-3 rounded-lg bg-white border border-antah-border text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span className="font-mono font-bold text-antah-navy">SIG-805:</span>
                    <span className="text-antah-slate">Culvert Overflow (Crossroad 7)</span>
                  </div>
                  <span className="text-[10px] font-mono text-antah-muted">25m ago</span>
                </div>
              </div>

              {/* Connecting Logic */}
              <div className="my-4 px-4 py-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs">
                <div className="flex items-center justify-between text-amber-900 font-bold mb-1">
                  <span>Candidate Hypothesis</span>
                  <span className="font-mono text-[11px] bg-amber-200/80 px-1.5 py-0.2 rounded">91% Match</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Both points share hydraulic gravity drain path. High probability of underground main break causing downstream surcharge.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <Link to="/coordinator" className="flex-1">
                  <Button variant="amber" size="sm" className="w-full text-xs justify-center font-bold">
                    Coordinator Hub: Verify Candidate
                  </Button>
                </Link>
                <Link to="/explorer?cluster=409">
                  <Button variant="outline" size="sm" className="text-xs">
                    Inspect 3D Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM METRICS / CIVIC PULSE */}
      <section className="py-16 bg-white border-b border-antah-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl bg-slate-50/80 border border-antah-border">
              <div className="text-3xl sm:text-4xl font-black text-antah-navy font-mono">
                184
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Active Community Signals
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-50/80 border border-antah-border">
              <div className="text-3xl sm:text-4xl font-black text-antah-teal font-mono">
                12
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Candidate Patterns Flagged
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-50/80 border border-antah-border">
              <div className="text-3xl sm:text-4xl font-black text-antah-amber font-mono">
                100%
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Human-Verified Incidents
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-50/80 border border-antah-border">
              <div className="text-3xl sm:text-4xl font-black text-antah-navy font-mono">
                &lt; 25m
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Dispatch Response Velocity
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-br from-antah-ivory via-white to-teal-50/30">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-antah-navy tracking-tight">
            Protect Your Neighborhood Before Problems Escalate.
          </h2>
          <p className="text-base text-antah-slate max-w-2xl mx-auto leading-relaxed">
            Report a pothole, leak, or dark corridor in seconds. Join ANTAH's civic intelligence grid
            and empower coordinators to respond with precision.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/report">
              <Button variant="primary" size="lg" icon={<PlusCircle size={18} />}>
                Submit an Observation
              </Button>
            </Link>
            <Link to="/explorer">
              <Button variant="secondary" size="lg" icon={<Compass size={18} />}>
                Launch Network Explorer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
