import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { CategoryBadge } from '../components/common/Badge';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { PageLoadingState } from '../components/loading';
import { BRAND, REPORT_CATEGORIES, ReportCategory } from '../theme/tokens';
import {
  staggerContainerVariants,
  revealItemVariants,
  EASINGS,
} from '../theme/motion';
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
  FileText,
  Share2,
} from 'lucide-react';

const CityCanvas = React.lazy(() =>
  import('../components/city3d/CityCanvas').then((mod) => ({ default: mod.CityCanvas }))
);

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy pb-16">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative pt-4 pb-16 lg:pt-6 lg:pb-20 overflow-hidden border-b border-slate-200/70">
        {/* Subtle decorative futuristic grid watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Billboard with Staged Motion */}
          <motion.div
            variants={shouldReduceMotion ? undefined : staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="max-w-3xl mb-6"
          >
            <motion.div
              variants={shouldReduceMotion ? undefined : revealItemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-antah-teal text-xs font-semibold tracking-wide uppercase mb-3"
            >
              <Radio size={13} className="text-antah-teal animate-pulse" />
              <span>Civic Intelligence Network • Nexconn 2026</span>
            </motion.div>

            <motion.h1
              variants={shouldReduceMotion ? undefined : revealItemVariants}
              className="text-4xl sm:text-6xl font-black text-antah-navy tracking-tight leading-[1.08]"
            >
              Every Signal Matters.
            </motion.h1>

            <motion.p
              variants={shouldReduceMotion ? undefined : revealItemVariants}
              className="mt-3 text-lg sm:text-xl text-antah-slate leading-relaxed font-normal"
            >
              Small local reports. Connected intelligence. Safer communities. ANTAH transforms scattered citizen observations into verified civic responses before small failures cascade.
            </motion.p>

            <motion.div
              variants={shouldReduceMotion ? undefined : revealItemVariants}
              className="mt-6 flex flex-wrap items-center gap-3.5"
            >
              <Link to="/explorer">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Compass size={18} />}
                  className="shadow-soft-md font-bold"
                >
                  Explore the City
                </Button>
              </Link>

              <Link to="/report">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<PlusCircle size={18} />}
                  className="shadow-soft-sm font-semibold"
                >
                  Report an Issue
                </Button>
              </Link>

              <div className="hidden sm:flex items-center gap-2 ml-2 text-xs font-mono text-antah-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>3D Digital Twin Active</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive 3D City Twin Visual Centerpiece */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99, y: 12 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASINGS.easeOutCubic, delay: 0.15 }}
            className="mt-3"
          >
            <Suspense
              fallback={
                <PageLoadingState
                  message="INITIALIZING 3D SPATIAL DIGITAL TWIN..."
                  subMessage="ANTAH • Small signals today, safer tomorrow."
                  minHeight="h-[580px] sm:h-[660px] lg:h-[720px]"
                />
              }
            >
              <CityCanvas />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* 2. THE 4-STEP CIVIC INTELLIGENCE PROCESS */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-antah-teal mb-2">
              System Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              How Small Whispers Become Coordinated Action
            </h3>
            <p className="mt-2 text-base text-antah-slate leading-relaxed">
              Traditional 311 systems log complaints in silos. ANTAH correlates observations across infrastructure networks to uncover root causes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 01: REPORT */}
            <Card tilt={true} className="p-6 space-y-3 group bg-slate-50/70 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-antah-teal">01</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-antah-teal flex items-center justify-center">
                  <FileText size={16} />
                </div>
              </div>
              <h4 className="text-base font-bold text-antah-navy group-hover:text-antah-teal transition-colors">
                REPORT
              </h4>
              <p className="text-xs text-antah-slate leading-relaxed">
                A resident logs a local observation (pipe leak, drain backflow, or road depression) with geographic coordinates and photos.
              </p>
            </Card>

            {/* Step 02: CONNECT */}
            <Card tilt={true} className="p-6 space-y-3 group bg-slate-50/70 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-cyan-600">02</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Share2 size={16} />
                </div>
              </div>
              <h4 className="text-base font-bold text-antah-navy group-hover:text-cyan-600 transition-colors">
                CONNECT
              </h4>
              <p className="text-xs text-antah-slate leading-relaxed">
                Spatial-temporal algorithms detect candidate relationships between nearby reports along shared municipal infrastructure conduits.
              </p>
            </Card>

            {/* Step 03: VERIFY */}
            <Card tilt={true} className="p-6 space-y-3 group bg-amber-50/50 border-amber-200/80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-amber-600">03</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <h4 className="text-base font-bold text-amber-950">
                VERIFY
              </h4>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Human civic coordinators inspect supporting evidence, hydrologic slope, and telemetry to officially validate candidate patterns.
              </p>
            </Card>

            {/* Step 04: RESPOND */}
            <Card tilt={true} className="p-6 space-y-3 group bg-slate-50/70 border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-blue-600">04</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
              </div>
              <h4 className="text-base font-bold text-antah-navy group-hover:text-blue-600 transition-colors">
                RESPOND
              </h4>
              <p className="text-xs text-antah-slate leading-relaxed">
                An incident-specific collaboration space is provisioned using Nexconn Chat SDK, coordinating remediation crews, dispatchers, and residents in real time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. FIVE PRIMARY CIVIC SIGNAL CATEGORIES */}
      <section className="py-20 bg-antah-ivory border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-antah-teal mb-2">
              Civic Taxonomy
            </h2>
            <h3 className="text-3xl font-extrabold text-antah-navy tracking-tight">
              Five Infrastructure Anomaly Domains
            </h3>
            <p className="mt-2 text-base text-antah-slate leading-relaxed">
              Every community signal belongs to a distinct municipal infrastructure layer, each monitored for spatial correlation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((catKey) => {
              const cat = REPORT_CATEGORIES[catKey];
              return (
                <Card key={catKey} variant="default" tilt={true} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CategoryBadge category={catKey} size="md" />
                      <span className="text-[11px] font-mono text-antah-muted uppercase">Active Domain</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <h4 className="text-base font-bold text-antah-navy group-hover:text-antah-teal transition-colors">
                      {cat.label}
                    </h4>
                    <p className="text-xs text-antah-slate mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-antah-muted">
                      <span>Proximity Radius: 150m</span>
                      <Link
                        to={`/explorer?category=${catKey}`}
                        className="font-semibold text-antah-teal flex items-center gap-1 hover:underline"
                      >
                        Inspect Domain <ArrowRight size={12} />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Neural Cluster Callout Card */}
            <Card variant="panel" tilt={true} className="bg-amber-50/40 border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                    <Sparkles size={13} className="text-amber-600 animate-pulse" />
                    <span>Cross-Domain Correlation</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-800 font-semibold">CANDIDATE</span>
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <h4 className="text-base font-bold text-amber-950">
                  Pattern Hypothesis Engine
                </h4>
                <p className="text-xs text-amber-900 mt-2 leading-relaxed">
                  Identifies structural links between separate categories, such as subterranean pipe bursts undermining adjacent road sub-base and flooding downstream storm grates.
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

      {/* 4. PLATFORM METRICS WITH ANIMATED COUNTERS */}
      <section className="py-16 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <Card variant="default" tilt={true} className="p-6 bg-slate-50/80 border-slate-200/80">
              <div className="text-3xl sm:text-4xl font-black text-antah-navy font-mono">
                <AnimatedCounter value={184} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Active Community Signals
              </div>
            </Card>

            <Card variant="default" tilt={true} className="p-6 bg-slate-50/80 border-slate-200/80">
              <div className="text-3xl sm:text-4xl font-black text-antah-teal font-mono">
                <AnimatedCounter value={12} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Candidate Patterns Flagged
              </div>
            </Card>

            <Card variant="default" tilt={true} className="p-6 bg-slate-50/80 border-slate-200/80">
              <div className="text-3xl sm:text-4xl font-black text-antah-amber font-mono">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Human-Verified Incidents
              </div>
            </Card>

            <Card variant="default" tilt={true} className="p-6 bg-slate-50/80 border-slate-200/80">
              <div className="text-3xl sm:text-4xl font-black text-antah-navy font-mono">
                <AnimatedCounter value={25} prefix="< " suffix="m" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-antah-slate mt-2">
                Dispatch Response Velocity
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-br from-antah-ivory via-white to-teal-50/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-antah-navy tracking-tight">
            Small signals today, safer tomorrow.
          </h2>
          <p className="text-base text-antah-slate max-w-2xl mx-auto leading-relaxed">
            Report a leak, broken light, or road hazard in seconds. Help ANTAH's civic intelligence grid empower municipal coordinators to respond with precision.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/report">
              <Button variant="primary" size="lg" icon={<PlusCircle size={18} />} className="font-bold">
                Report an Issue
              </Button>
            </Link>
            <Link to="/explorer">
              <Button variant="secondary" size="lg" icon={<Compass size={18} />} className="font-semibold">
                Launch City Explorer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
