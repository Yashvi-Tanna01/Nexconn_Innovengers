import React, { useState } from 'react';
import { AntahLogo } from '../brand/AntahLogo';
import { Button } from '../common/Button';
import { CategoryBadge, StatusBadge, AiCandidateBadge } from '../common/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../common/Card';
import { Input } from '../common/Input';
import { Tabs } from '../common/Tabs';
import {
  BRAND,
  REPORT_CATEGORIES,
  STATUS_CONFIG,
  ReportCategory,
  ReportStatus,
} from '../../theme/tokens';
import {
  Layers,
  Palette,
  Type,
  Component,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Radio,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const toggleLoading = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy pb-24">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-antah-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <AntahLogo size="md" showSubtitle={true} />

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              PHASE 1: DESIGN SYSTEM VERIFIED
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<ShieldCheck size={14} className="text-antah-teal" />}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Design Tokens
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-antah-teal/10 border border-antah-teal/20 text-antah-teal text-xs font-semibold uppercase tracking-wider mb-4">
            <Radio size={13} className="text-antah-teal animate-pulse" />
            Nexconn Build Challenge 2026 Foundation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-antah-navy tracking-tight leading-tight">
            ANTAH Design System & Visual Art Direction
          </h1>
          <p className="mt-3 text-lg text-antah-slate leading-relaxed font-normal">
            {BRAND.tagline} A premium light-theme aesthetic engineered for civic intelligence,
            spatial signal clustering, human-in-the-loop coordinator verification, and real-time Nexconn collaboration.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-antah-border pb-4">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Art Direction & Colors', icon: <Palette size={14} /> },
              { id: 'typography', label: 'Typography & Brand', icon: <Type size={14} /> },
              { id: 'components', label: 'UI Components & States', icon: <Component size={14} /> },
              { id: 'signals', label: 'Civic Signal Metadata', icon: <Layers size={14} /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* TAB 1: ART DIRECTION & COLORS */}
        {(activeTab === 'overview' || activeTab === 'all') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-antah-navy">
                  1. Color Palette & Surface Philosophy
                </h2>
                <p className="text-sm text-antah-slate mt-1">
                  Controlled light-theme contrast using warm ivory, soft white, deep midnight navy, sophisticated teal, and restrained champagne.
                </p>
              </div>
            </div>

            {/* Color Swatch Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Warm Ivory */}
              <div className="p-4 rounded-panel bg-white border border-antah-border shadow-soft-xs">
                <div className="h-16 rounded-subtle bg-[#FBFBF9] border border-antah-border mb-3 shadow-inner" />
                <div className="font-bold text-xs text-antah-navy">Warm Ivory</div>
                <div className="font-mono text-[11px] text-antah-muted">#FBFBF9</div>
                <p className="text-[10px] text-antah-slate mt-1">Base background</p>
              </div>

              {/* Soft White */}
              <div className="p-4 rounded-panel bg-white border border-antah-border shadow-soft-xs">
                <div className="h-16 rounded-subtle bg-[#F8F9FA] border border-antah-border mb-3" />
                <div className="font-bold text-xs text-antah-navy">Soft White</div>
                <div className="font-mono text-[11px] text-antah-muted">#F8F9FA</div>
                <p className="text-[10px] text-antah-slate mt-1">Secondary canvas</p>
              </div>

              {/* Deep Midnight Navy */}
              <div className="p-4 rounded-panel bg-white border border-antah-border shadow-soft-xs">
                <div className="h-16 rounded-subtle bg-[#0B132B] mb-3 flex items-center justify-center text-white font-mono text-xs">
                  Aa
                </div>
                <div className="font-bold text-xs text-antah-navy">Midnight Navy</div>
                <div className="font-mono text-[11px] text-antah-muted">#0B132B</div>
                <p className="text-[10px] text-antah-slate mt-1">Primary typography</p>
              </div>

              {/* Sophisticated Teal */}
              <div className="p-4 rounded-panel bg-white border border-antah-border shadow-soft-xs">
                <div className="h-16 rounded-subtle bg-[#0D9488] mb-3 shadow-teal-glow flex items-center justify-center text-white font-mono text-xs">
                  Teal
                </div>
                <div className="font-bold text-xs text-antah-navy">Primary Teal</div>
                <div className="font-mono text-[11px] text-antah-muted">#0D9488</div>
                <p className="text-[10px] text-antah-slate mt-1">Action & network primary</p>
              </div>

              {/* Soft Cyan */}
              <div className="p-4 rounded-panel bg-white border border-antah-border shadow-soft-xs">
                <div className="h-16 rounded-subtle bg-[#06B6D4] mb-3 flex items-center justify-center text-white font-mono text-xs">
                  Cyan
                </div>
                <div className="font-bold text-xs text-antah-navy">Soft Cyan</div>
                <div className="font-mono text-[11px] text-antah-muted">#06B6D4</div>
                <p className="text-[10px] text-antah-slate mt-1">Secondary signal accent</p>
              </div>

              {/* Restrained Champagne / Amber */}
              <div className="p-4 rounded-panel bg-white border border-antah-border shadow-soft-xs">
                <div className="h-16 rounded-subtle bg-[#D97706] mb-3 shadow-amber-glow flex items-center justify-center text-white font-mono text-xs">
                  Amber
                </div>
                <div className="font-bold text-xs text-antah-navy">Restrained Amber</div>
                <div className="font-mono text-[11px] text-antah-muted">#D97706</div>
                <p className="text-[10px] text-antah-slate mt-1">AI candidate review</p>
              </div>
            </div>

            {/* Surfaces & Contrast Principles Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <Card variant="panel">
                <CardHeader>
                  <CardTitle className="text-base">Translucent Light Panels</CardTitle>
                  <CardDescription>
                    Layered surfaces with 16px backdrop blur for high-tech HUD clarity over 3D scenes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-white/70 border border-antah-border text-xs text-antah-slate leading-relaxed">
                    Maintains strict readability even over rotating 3D city buildings, street meshes, and glowing markers.
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-base">Anti-Dark-Cyberpunk Rule</CardTitle>
                  <CardDescription>
                    Strict avoidance of over-saturated neon, heavy purples, and game-like dark UI tropes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-slate-50 border border-antah-border text-xs text-antah-slate leading-relaxed">
                    Designed for municipal operators, civic coordinators, and everyday citizens seeking trusted intelligence.
                  </div>
                </CardContent>
              </Card>

              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-base">AI Ethical Clarification</CardTitle>
                  <CardDescription>
                    Suggestions clearly distinguished from confirmed public emergencies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    Algorithmic pattern detections are always marked as candidate hypotheses requiring human review.
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* TAB 2: TYPOGRAPHY & BRAND */}
        {(activeTab === 'typography' || activeTab === 'all') && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-antah-navy">
                2. Brand Wordmark & Typographic Scale
              </h2>
              <p className="text-sm text-antah-slate mt-1">
                Distinctive ANTAH typography with geometric signal nexus glyph and clear typographic weights.
              </p>
            </div>

            {/* Brand Variations Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base">ANTAH Wordmark & Connected Signals Symbol</CardTitle>
                <CardDescription>
                  Scalable brand representation preserving visual presence across navigation, modals, and landing hero.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="p-6 bg-antah-ivory rounded-panel border border-antah-border flex flex-wrap items-center justify-around gap-8">
                  <div className="text-center">
                    <span className="block text-xs font-mono text-antah-muted mb-2">Size: XL (Hero)</span>
                    <AntahLogo size="xl" showSubtitle={true} />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-mono text-antah-muted mb-2">Size: LG (Headers)</span>
                    <AntahLogo size="lg" showSubtitle={true} />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-mono text-antah-muted mb-2">Size: MD (App Shell)</span>
                    <AntahLogo size="md" showSubtitle={true} />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-mono text-antah-muted mb-2">Size: SM (Compact)</span>
                    <AntahLogo size="sm" showSubtitle={false} />
                  </div>
                </div>

                {/* Typography Hierarchy Table */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-antah-navy">
                    Typographic Scale & Roles
                  </h4>
                  <div className="border border-antah-border rounded-lg overflow-hidden divide-y divide-antah-border">
                    <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <span className="text-3xl font-extrabold text-antah-navy tracking-tight">
                        Hero Display — "Every Small Signal Matters."
                      </span>
                      <span className="text-xs font-mono text-antah-muted">36px / 44px • Bold 800</span>
                    </div>
                    <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <span className="text-2xl font-bold text-antah-navy tracking-tight">
                        H1 Section Header — "Network Intelligence Overview"
                      </span>
                      <span className="text-xs font-mono text-antah-muted">24px / 32px • Bold 700</span>
                    </div>
                    <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <span className="text-lg font-semibold text-antah-navy">
                        H2 Card Title — "Candidate Pattern #824 (Water Infrastructure)"
                      </span>
                      <span className="text-xs font-mono text-antah-muted">18px / 26px • SemiBold 600</span>
                    </div>
                    <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <span className="text-sm text-antah-slate font-normal leading-relaxed">
                        Body Text — "Scattered observations from Sector 4 indicate concurrent pressure drop and roadside ponding."
                      </span>
                      <span className="text-xs font-mono text-antah-muted">14px / 20px • Regular 400</span>
                    </div>
                    <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <span className="text-xs font-mono text-antah-teal font-medium">
                        Telemetry / Coordinates — LAT 12.9716° N • LNG 77.5946° E • TS 2026-11-03T17:42:00Z
                      </span>
                      <span className="text-xs font-mono text-antah-muted">12px • JetBrains Mono 500</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* TAB 3: COMPONENTS & STATES */}
        {(activeTab === 'components' || activeTab === 'all') && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-antah-navy">
                3. UI Components, Form Controls & Interactive States
              </h2>
              <p className="text-sm text-antah-slate mt-1">
                Precision light-theme buttons, search inputs, badges, and interactive feedback mechanisms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button Variants Card */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-base">Button System</CardTitle>
                  <CardDescription>
                    Primary teal, secondary neutral, amber verification action, outline, and states.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <span className="text-xs font-mono text-antah-muted block">Variants:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="primary" icon={<Sparkles size={15} />}>
                        Explore Network
                      </Button>
                      <Button variant="secondary">
                        View List
                      </Button>
                      <Button variant="amber" icon={<FileCheck2 size={15} />}>
                        Approve Incident
                      </Button>
                      <Button variant="outline">
                        Cancel
                      </Button>
                      <Button variant="danger">
                        Reject
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-mono text-antah-muted block">Sizes:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm">Small Action</Button>
                      <Button size="md">Default Medium</Button>
                      <Button size="lg" icon={<ArrowRight size={16} />} iconPosition="right">
                        Primary CTA
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-mono text-antah-muted block">Interactive States:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="primary"
                        isLoading={buttonLoading}
                        onClick={toggleLoading}
                      >
                        {buttonLoading ? 'Synchronizing...' : 'Click to Test Loading State'}
                      </Button>
                      <Button variant="secondary" disabled>
                        Disabled State
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Controls Card */}
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-base">Form & Input System</CardTitle>
                  <CardDescription>
                    Structured inputs with icons, validation, and accessibility focus rings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Search Community Reports"
                    placeholder="Search by keyword, street name, or ticket ID..."
                    leftIcon={<Search size={16} />}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    helperText="Try typing 'pipe burst' or 'MG Road'"
                  />

                  <Input
                    label="Coordinates Latitude / Longitude"
                    placeholder="e.g. 12.9716, 77.5946"
                    defaultValue="12.971598, 77.594562"
                    disabled
                    helperText="Geographic position locked from client GPS or map pin."
                  />

                  <Input
                    label="Report Verification Note (Validation Test)"
                    placeholder="Enter coordinator inspection rationale..."
                    error={inputValue.length > 0 && inputValue.length < 5 ? "Rationale must be at least 5 characters." : undefined}
                    helperText="Required before promoting candidate cluster into confirmed incident."
                  />
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* TAB 4: CIVIC SIGNAL METADATA */}
        {(activeTab === 'signals' || activeTab === 'all') && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-antah-navy">
                4. Primary Report Categories & Civic Status Life Cycle
              </h2>
              <p className="text-sm text-antah-slate mt-1">
                The five primary infrastructure categories and rigorous lifecycle statuses defined for ANTAH.
              </p>
            </div>

            {/* Five Primary Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((catKey) => {
                const cat = REPORT_CATEGORIES[catKey];
                return (
                  <Card key={catKey} variant="default" className="hover:border-slate-300">
                    <CardHeader className="py-4">
                      <div className="flex items-center justify-between">
                        <CategoryBadge category={catKey} size="md" />
                        <span className="font-mono text-xs text-antah-muted">{cat.id}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-antah-slate leading-relaxed">
                        {cat.description}
                      </p>
                    </CardContent>
                    <CardFooter className="py-2.5 text-[11px] text-antah-muted flex items-center justify-between">
                      <span>Priority: Normal / High</span>
                      <span className="font-mono font-medium text-antah-navy">3D Marker: Active</span>
                    </CardFooter>
                  </Card>
                );
              })}

              {/* AI Suggestion Card */}
              <Card variant="panel" className="border-amber-200/80 bg-amber-50/30">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <AiCandidateBadge confidenceScore={0.92} />
                    <span className="font-mono text-xs text-amber-700">Cluster #409</span>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-xs text-amber-900 leading-relaxed font-normal">
                    AI identified 3 independent reports within 150m logged within 45 minutes suggesting a joint main drainage rupture.
                  </p>
                </CardContent>
                <CardFooter className="py-2.5 text-[11px] text-amber-800 bg-amber-100/40 flex items-center justify-between">
                  <span>Status: Awaiting Coordinator</span>
                  <span className="font-semibold text-antah-amber">Requires Human Signoff</span>
                </CardFooter>
              </Card>
            </div>

            {/* Lifecycle Status Badges */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base">Civic Intelligence Lifecycle Statuses</CardTitle>
                <CardDescription>
                  Complete report state progression from initial submission to AI pattern suggestion, human coordinator approval, and resolution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(STATUS_CONFIG) as ReportStatus[]).map((statusKey) => {
                    const st = STATUS_CONFIG[statusKey];
                    return (
                      <div
                        key={statusKey}
                        className="p-3 rounded-lg bg-slate-50/70 border border-antah-border flex items-start gap-3"
                      >
                        <div className="mt-0.5">
                          <StatusBadge status={statusKey} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-antah-slate leading-normal">
                            {st.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-antah-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-antah-muted">
        <div>
          <span className="font-bold text-antah-navy">{BRAND.name}</span> — {BRAND.fullName} ({BRAND.version})
        </div>
        <div className="flex items-center gap-6">
          <span>Nexconn Build Challenge 2026</span>
          <span className="text-antah-teal font-medium">Phase 1 Complete</span>
        </div>
      </footer>
    </div>
  );
};

