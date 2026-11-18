import React, { useState, useRef } from 'react';
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
  X,
  Maximize2,
} from 'lucide-react';
import { API_ENDPOINTS, apiRequest, Report, uploadReportAttachment, getMediaUrl } from '../config/api';

export const ReportPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<ReportCategory>('water_leakage');
  const [severity, setSeverity] = useState<SignalSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [locationName, setLocationName] = useState('');

  // Real photo upload & preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [enlargedPreview, setEnlargedPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { startLoading, stopLoading } = useLoading();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // 1. Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError(`Photograph size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate MIME type and file extension
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const mimeValid = file.type ? allowedTypes.includes(file.type.toLowerCase()) : false;
    const extValid = ext ? allowedExts.includes(ext) : false;

    if (!mimeValid && !extValid) {
      setFileError(`Unsupported format (.${ext || 'unknown'}). Please attach a JPG, PNG, or WEBP image.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemovePhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName || isSubmitting) return;

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setSubmitError('Attached photograph exceeds the 10MB size limit.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    startLoading(
      'report-submission',
      'Transmitting observation to municipal signal twin & analyzing spatial correlation...',
      'reporting'
    );

    // Extract geographic coordinates if present
    let latitude: number | null = null;
    let longitude: number | null = null;
    const gpsMatch = locationName.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
    if (gpsMatch) {
      latitude = parseFloat(gpsMatch[1]);
      longitude = parseFloat(gpsMatch[2]);
    }

    // 1. Create Report in PostgreSQL (with 30s timeout for cloud database transactions)
    const result = await apiRequest<Report>(
      API_ENDPOINTS.reports,
      {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          location: locationName.trim(),
          latitude,
          longitude,
          urgency: severity === 'critical' ? 5 : severity === 'high' ? 4 : severity === 'medium' ? 3 : 1,
        }),
      },
      30000
    );

    if (!result.data) {
      setSubmitError(result.error || 'Unable to submit this report.');
      setIsSubmitting(false);
      stopLoading('report-submission');
      return;
    }

    let createdReport = result.data;

    // 2. Upload attached photograph if selected
    if (selectedFile) {
      startLoading(
        'report-submission',
        'Persisting photographic evidence to secure municipal telemetry vault...',
        'reporting'
      );

      const uploadResult = await uploadReportAttachment(createdReport.id, selectedFile);
      if (!uploadResult.data) {
        setSubmitError(
          `Observation recorded (ID: ${createdReport.id}), but photographic evidence upload failed: ${
            uploadResult.error || 'Server error'
          }. Please retry attaching photo.`
        );
        setIsSubmitting(false);
        stopLoading('report-submission');
        return;
      }

      createdReport = {
        ...createdReport,
        attachments: [uploadResult.data],
      };
    }

    setSubmittedReport(createdReport);
    setSubmittedId(String(createdReport.id));
    setIsSubmitting(false);
    stopLoading('report-submission');
  };

  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setStep(1);
    setTitle('');
    setDescription('');
    setLocationName('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setSubmittedReport(null);
    setSubmittedId(null);
    setSubmitError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stepSlideVariants = {
    initial: { opacity: 0, x: shouldReduceMotion ? 0 : 16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: shouldReduceMotion ? 0 : -16, transition: { duration: 0.18 } },
  };

  return (
    <div className="w-full px-4 pt-3 pb-8 space-y-4 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E4]">
        <div>
          <h1 className="text-xl font-bold text-[#202827] font-sans tracking-tight">
            Report Civic Issue
          </h1>
          <p className="text-[11px] text-[#737C78]">
            Ingreso de telemetría ciudadana a la red ANTAH
          </p>
        </div>
        <div className="text-[10px] font-mono text-[#286B56] font-bold px-2.5 py-1 rounded-full bg-[#E1F0E8]">
          PASO {step}/3
        </div>
      </div>

      <div className="w-full space-y-4">

        {/* Step Progress Pills with Gliding Highlight */}
        <div className="grid grid-cols-3 gap-2 relative">
          {[
            { num: 1, label: '01. Category & Severity' },
            { num: 2, label: '02. Details & Location' },
            { num: 3, label: '03. Verification & Submit' },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                className={`relative p-2.5 rounded-xl border text-center transition-all duration-200 ${
                  isActive
                    ? 'bg-white border-[#087B56] text-[#087B56] shadow-sm font-bold ring-1 ring-[#087B56]/30'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-[#087B56] font-semibold'
                    : 'bg-slate-50/80 border-slate-200 text-antah-muted'
                }`}
              >
                <span className="text-xs font-mono">{isCompleted ? '✓ ' : ''}{s.label}</span>
              </div>
            );
          })}
        </div>

        {submittedId ? (
          <motion.div
            key={`submitted-${submittedId}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card variant="panel" className="relative overflow-hidden border-teal-200/90 bg-white/95 p-8 text-center space-y-5 shadow-xl">
              {/* Expanding Emerald Aura & Golden Synaptic Halo */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {!shouldReduceMotion && (
                  <>
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0.9 }}
                      animate={{ scale: [0.7, 1.8], opacity: [0.8, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border-2 border-[#087B56]"
                    />
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0.9 }}
                      animate={{ scale: [0.5, 2.2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.25 }}
                      className="absolute inset-0 rounded-full border border-[#3DD6A5]"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D99A45]/25 via-[#3DD6A5]/20 to-[#087B56]/25 blur-lg" />
                  </>
                )}
                {/* Central Verified Emerald Badge */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#087B56] to-[#064C3B] text-white flex items-center justify-center shadow-lg shadow-[#087B56]/30">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 stroke-white"
                    fill="none"
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
                    />
                  </svg>
                </div>
              </div>

              {/* Exact Choreographed Success Messaging */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-1.5"
              >
                <h2 className="text-2xl font-bold text-antah-navy tracking-tight">
                  Signal successfully submitted.
                </h2>
                <p className="text-sm font-semibold text-[#087B56]">
                  Your observation is now part of the civic intelligence network.
                </p>
              </motion.div>

              <div className="font-mono text-sm font-bold text-[#087B56] bg-teal-50/70 border border-teal-200/90 px-4 py-2 rounded-xl inline-block shadow-soft-xs">
                Report Ticket ID: {submittedId}
              </div>

              <p className="text-xs text-antah-slate max-w-md mx-auto leading-relaxed">
                Your observation has been geo-indexed in <span className="font-bold text-antah-navy">{selectedDistrict.name}</span>. The correlation engine is actively evaluating nearby infrastructure dependencies.
              </p>

              {/* Attached Evidence Preview on Success */}
              {submittedReport?.attachments && submittedReport.attachments.length > 0 && (
                <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/80 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-[#087B56] tracking-wider flex items-center gap-1.5">
                      <Camera size={13} />
                      <span>Photographic Evidence Attached</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white text-[#087B56] px-2 py-0.5 rounded border border-teal-200 font-bold">
                      Stored in PostgreSQL
                    </span>
                  </div>
                  <div
                    className="relative rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200 cursor-pointer group"
                    onClick={() => setEnlargedPreview(true)}
                  >
                    <img
                      src={getMediaUrl(submittedReport.attachments[0].file_url)}
                      alt={submittedReport.attachments[0].file_name}
                      className="w-full max-h-48 object-contain rounded-xl mx-auto transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Maximize2 size={14} />
                      <span>Click to enlarge</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#737C78]">
                    <span className="font-mono truncate max-w-[220px]" title={submittedReport.attachments[0].file_name}>
                      {submittedReport.attachments[0].file_name}
                    </span>
                    <span className="text-[#087B56] font-semibold">
                      ✓ Verified & Linked
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <Button variant="primary" size="md" onClick={resetForm} className="font-bold shadow-soft-xs">
                  Submit Another Observation
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                {submitError}
              </div>
            )}
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

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-antah-navy tracking-wide uppercase">
                            Street Name or Landmark
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLocationName('4th Main Road, Sector 3 Quad (GPS: 12.9782, 77.6398)');
                            }}
                            className="text-[10px] text-[#286B56] font-mono font-bold flex items-center gap-1 hover:underline active:scale-95"
                          >
                            <MapPin size={11} />
                            <span>GPS Auto-Fill</span>
                          </button>
                        </div>
                        <Input
                          placeholder="e.g. Crossroad 7, opposite Sector 3 water tank"
                          leftIcon={<MapPin size={16} />}
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          required
                        />
                      </div>
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

                      {/* Hidden Native File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="evidence-photo-input"
                      />

                      {/* File Validation Error Banner */}
                      {fileError && (
                        <div
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 flex items-center justify-between"
                          role="alert"
                        >
                          <span>{fileError}</span>
                          <button
                            type="button"
                            onClick={() => setFileError(null)}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-2 text-sm"
                            aria-label="Dismiss error"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Photo Upload Box or Real Preview */}
                      {!previewUrl ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="relative overflow-hidden p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#087B56]/60 hover:bg-[#FBFBF9] hover:shadow-sm bg-white text-center cursor-pointer transition-all duration-300 transform active:scale-[0.99]"
                        >
                          <Camera size={26} className="mx-auto mb-2 text-slate-400 transition-transform duration-200" />
                          <span className="text-xs font-semibold text-antah-navy block">
                            Attach Optional Site Photo
                          </span>
                          <span className="text-[11px] font-mono text-[#087B56] block mt-0.5">
                            Click to select from device gallery or camera (JPG, PNG, WEBP up to 10MB)
                          </span>
                        </div>
                      ) : (
                        <div className="relative overflow-hidden p-4 rounded-2xl border-2 border-[#087B56] bg-teal-50/40 shadow-[0_0_20px_rgba(8,123,86,0.18)] ring-1 ring-[#3DD6A5]/40 transition-all">
                          {!shouldReduceMotion && (
                            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#3DD6A5] to-transparent shadow-[0_0_8px_#3DD6A5] animate-pulse" />
                            </div>
                          )}

                          {/* Preview Image with natural aspect ratio, no stretching */}
                          <div className="relative rounded-xl overflow-hidden bg-black/5 flex items-center justify-center max-h-60 mb-3 border border-slate-200">
                            <img
                              src={previewUrl}
                              alt="Selected evidence preview"
                              className="w-full max-h-60 object-contain rounded-xl mx-auto"
                            />
                            <button
                              type="button"
                              onClick={() => setEnlargedPreview(true)}
                              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors shadow-xs"
                              title="Enlarge preview"
                            >
                              <Maximize2 size={14} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="text-left min-w-0 flex-1">
                              <span className="text-xs font-semibold text-antah-navy block truncate" title={selectedFile?.name}>
                                {selectedFile?.name}
                              </span>
                              <span className="text-[11px] font-mono text-[#087B56] block">
                                ✓ Ready for upload • {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#087B56] bg-white border border-[#087B56]/30 rounded-lg hover:bg-teal-50 transition-colors"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="p-1.5 text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Remove photo"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
                        disabled={isSubmitting}
                        icon={<FileCheck2 size={16} />}
                        className="font-bold shadow-soft-sm"
                      >
                        {isSubmitting ? 'Transmitting to Civic Network...' : 'Submit to Civic Network'}
                      </Button>
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </form>
        )}
      </div>

      {/* Enlarged Photo Lightbox Modal */}
      {enlargedPreview && (previewUrl || (submittedReport?.attachments && submittedReport.attachments.length > 0)) && (
        <div
          role="dialog"
          aria-label="Enlarged Photographic Evidence"
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setEnlargedPreview(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEnlargedPreview(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              aria-label="Close enlarged preview"
            >
              <X size={18} />
            </button>
            <img
              src={previewUrl || getMediaUrl(submittedReport?.attachments?.[0]?.file_url)}
              alt="Enlarged Evidence"
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
