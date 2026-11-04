import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { CategoryBadge } from '../components/common/Badge';
import { useLoading } from '../context/LoadingContext';
import { REPORT_CATEGORIES, ReportCategory } from '../theme/tokens';
import { DISTRICTS, District, SignalSeverity } from '../components/city3d/types';
import {
  PlusCircle,
  MapPin,
  Camera,
  CheckCircle2,
  FileCheck2,
  Radio,
  ArrowRight,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<ReportCategory>('water_leakage');
  const [severity, setSeverity] = useState<SignalSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [locationName, setLocationName] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { startLoading, stopLoading } = useLoading();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName) return;

    setIsSubmitting(true);
    startLoading(
      'report-submission',
      'Transmitting observation to municipal signal twin & analyzing spatial correlation...',
      'reporting'
    );
    setTimeout(() => {
      const generatedId = `SIG-${Math.floor(830 + Math.random() * 90)}`;
      setSubmittedId(generatedId);
      setIsSubmitting(false);
      stopLoading('report-submission');
    }, 1800);
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setLocationName('');
    setHasPhoto(false);
    setSubmittedId(null);
  };

  const stepSlideVariants = {
    initial: { opacity: 0, x: shouldReduceMotion ? 0 : 16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: shouldReduceMotion ? 0 : -16, transition: { duration: 0.18 } },
  };

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-10 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-teal mb-1">
            <Radio size={14} className="animate-pulse" />
            <span>COMMUNITY TELEMETRY INGESTION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
            Report a Civic Issue
          </h1>
          <p className="text-sm text-antah-slate mt-1">
            Log an infrastructure anomaly. ANTAH’s spatial AI engine will correlate your observation with nearby signals across the municipal grid.
          </p>
        </div>

        {/* Step Progress Pills with Gliding Highlight */}
        <div className="grid grid-cols-3 gap-2 relative">
          {[
            { num: 1, label: '01. Category & Severity' },
            { num: 2, label: '02. Details & Location' },
            { num: 3, label: '03. Verification & Submit' },
          ].map((s) => {
            const isActive = step === s.num;
            return (
              <div
                key={s.num}
                className={`relative p-2.5 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-white border-antah-teal text-antah-teal shadow-soft-xs font-bold'
                    : 'bg-slate-50/80 border-slate-200 text-antah-muted'
                }`}
              >
                <span className="text-xs font-mono">{s.label}</span>
              </div>
            );
          })}
        </div>

        {submittedId ? (
          <motion.div
            key={`submitted-${submittedId}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card variant="panel" className="border-teal-200 bg-teal-50/30 p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-antah-teal flex items-center justify-center mx-auto shadow-teal-glow">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-antah-navy">Observation Logged Successfully</h2>
              <div className="font-mono text-sm font-bold text-antah-teal bg-white border border-teal-200 px-4 py-2 rounded-xl inline-block shadow-soft-xs">
                Report Ticket ID: {submittedId}
              </div>
              <p className="text-xs text-antah-slate max-w-md mx-auto leading-relaxed">
                Your observation has been geo-indexed in <span className="font-bold text-antah-navy">{selectedDistrict.name}</span>. The correlation engine is actively evaluating nearby infrastructure dependencies.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <Button variant="primary" size="md" onClick={resetForm} className="font-bold">
                  Submit Another Observation
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card variant="default">
              <AnimatePresence mode="wait">
                {/* STEP 1: CATEGORY & SEVERITY */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    variants={stepSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">1. Select Infrastructure Category</CardTitle>
                      <CardDescription>
                        Choose the municipal anomaly domain matching your observation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((catKey) => {
                          const isSelected = category === catKey;
                          const cat = REPORT_CATEGORIES[catKey];
                          return (
                            <button
                              type="button"
                              key={catKey}
                              onClick={() => setCategory(catKey)}
                              className={`p-3.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-antah-teal bg-antah-teal/5 ring-1 ring-antah-teal shadow-soft-xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <CategoryBadge category={catKey} size="sm" />
                              <p className="text-[11px] text-antah-slate mt-2 line-clamp-2">
                                {cat.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <label className="block text-xs font-semibold text-antah-navy tracking-wide uppercase">
                          Observed Severity Level
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['low', 'medium', 'high', 'critical'] as SignalSeverity[]).map((sev) => (
                            <button
                              type="button"
                              key={sev}
                              onClick={() => setSeverity(sev)}
                              className={`p-2.5 rounded-lg border text-center text-xs font-semibold uppercase tracking-wider transition-all ${
                                severity === sev
                                  ? sev === 'critical'
                                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                                    : 'bg-teal-50 border-antah-teal text-antah-teal ring-1 ring-antah-teal'
                                  : 'bg-white border-slate-200 text-antah-muted hover:border-slate-300'
                              }`}
                            >
                              {sev}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={() => setStep(2)}
                        icon={<ArrowRight size={16} />}
                        iconPosition="right"
                        className="font-bold"
                      >
                        Continue to Details
                      </Button>
                    </CardFooter>
                  </motion.div>
                )}

                {/* STEP 2: DETAILS & LOCATION */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    variants={stepSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">2. Observation Details & Location</CardTitle>
                      <CardDescription>
                        Provide descriptive details and pin the relevant district.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <Input
                        label="Observation Title"
                        placeholder="e.g. Subterranean pipe leak bubbling onto road"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-antah-navy tracking-wide uppercase">
                          Detailed Description
                        </label>
                        <textarea
                          rows={3}
                          className="w-full bg-white text-antah-navy placeholder:text-antah-subtle text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-antah-teal/30 focus:border-antah-teal transition-all"
                          placeholder="Detail the approximate leak flow rate, street hazard, or structural signs..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-antah-navy tracking-wide uppercase">
                          Select District Quadrant
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {DISTRICTS.map((d) => (
                            <button
                              type="button"
                              key={d.id}
                              onClick={() => setSelectedDistrict(d)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                                selectedDistrict.id === d.id
                                  ? 'bg-teal-50/50 border-antah-teal ring-1 ring-antah-teal'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span className="font-bold block text-antah-navy">{d.name}</span>
                              <span className="font-mono text-[10px] text-antah-muted">{d.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Input
                        label="Specific Street Name or Landmark"
                        placeholder="e.g. Crossroad 7, opposite Sector 3 water tank"
                        leftIcon={<MapPin size={16} />}
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        required
                      />
                    </CardContent>
                    <CardFooter className="justify-between">
                      <Button type="button" variant="outline" size="md" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        disabled={!title || !description || !locationName}
                        onClick={() => setStep(3)}
                        icon={<ArrowRight size={16} />}
                        iconPosition="right"
                        className="font-bold"
                      >
                        Review & Upload Evidence
                      </Button>
                    </CardFooter>
                  </motion.div>
                )}

                {/* STEP 3: REVIEW & SUBMIT */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    variants={stepSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">3. Review & Optional Attachment</CardTitle>
                      <CardDescription>
                        Confirm observation parameters before logging to the ANTAH civic matrix.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Summary Card */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <CategoryBadge category={category} size="sm" />
                          <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-white border border-slate-200">
                            Severity: {severity}
                          </span>
                        </div>
                        <h4 className="font-bold text-antah-navy text-sm pt-1">{title}</h4>
                        <p className="text-antah-slate">{description}</p>
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-antah-muted">
                          <span>District: {selectedDistrict.name}</span>
                          <span>📍 {locationName}</span>
                        </div>
                      </div>

                      {/* Photo Upload Simulation Box */}
                      <div
                        onClick={() => setHasPhoto(!hasPhoto)}
                        className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                          hasPhoto
                            ? 'border-antah-teal bg-teal-50/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <Camera size={24} className={`mx-auto mb-2 ${hasPhoto ? 'text-antah-teal' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold text-antah-navy block">
                          {hasPhoto ? 'Photograph Attached: site_inspection.jpg' : 'Attach Optional Site Photo'}
                        </span>
                        <span className="text-[11px] text-antah-muted block mt-0.5">
                          {hasPhoto ? 'Click to detach' : 'Click to simulate camera capture or gallery upload'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <Button type="button" variant="outline" size="md" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSubmitting}
                        icon={<FileCheck2 size={16} />}
                        className="font-bold shadow-soft-sm"
                      >
                        Submit to Civic Network
                      </Button>
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};
