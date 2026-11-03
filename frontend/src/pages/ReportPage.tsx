import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { CategoryBadge } from '../components/common/Badge';
import { REPORT_CATEGORIES, ReportCategory } from '../theme/tokens';
import {
  PlusCircle,
  MapPin,
  Camera,
  CheckCircle2,
  FileCheck2,
  Radio,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const [category, setCategory] = useState<ReportCategory>('water_leakage');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName) return;

    setIsSubmitting(true);
    // Real submission simulation resolving to valid unique ID
    setTimeout(() => {
      const generatedId = `SIG-${Math.floor(100 + Math.random() * 900)}`;
      setSubmittedId(generatedId);
      setIsSubmitting(false);
    }, 1200);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocationName('');
    setSubmittedId(null);
  };

  return (
    <div className="min-h-screen bg-antah-ivory text-antah-navy py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-antah-teal mb-1">
            <Radio size={14} className="animate-pulse" />
            <span>COMMUNITY SENSOR INGESTION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-antah-navy tracking-tight">
            Report a Civic Observation
          </h1>
          <p className="text-sm text-antah-slate mt-1">
            Submit local infrastructure anomalies. ANTAH’s spatial AI engine will analyze correlations with nearby signals.
          </p>
        </div>

        {submittedId ? (
          <Card variant="panel" className="border-teal-200 bg-teal-50/30 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-antah-teal flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-antah-navy">Observation Logged Successfully</h2>
            <div className="font-mono text-sm font-bold text-antah-teal bg-white border border-teal-200 px-4 py-2 rounded-lg inline-block">
              Report Ticket: {submittedId}
            </div>
            <p className="text-xs text-antah-slate max-w-md mx-auto leading-relaxed">
              Your observation has been indexed into the Sector 3 spatial matrix. The correlation engine is currently evaluating nearby hydrologic and structural dependencies.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Button variant="primary" size="md" onClick={resetForm}>
                Submit Another Observation
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base">1. Select Infrastructure Category</CardTitle>
                <CardDescription>
                  Choose the category that best matches your observation.
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
                            ? 'border-antah-teal bg-antah-teal/5 ring-1 ring-antah-teal'
                            : 'border-antah-border bg-white hover:border-slate-300'
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

                <div className="pt-4 border-t border-antah-border-light space-y-4">
                  <h4 className="text-sm font-bold text-antah-navy">2. Observation Details</h4>
                  
                  <Input
                    label="Observation Title"
                    placeholder="e.g. Broken water pipe leaking near intersection"
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
                      className="w-full bg-white text-antah-navy placeholder:text-antah-subtle text-sm rounded-subtle border border-antah-border p-3 focus:outline-none focus:ring-2 focus:ring-antah-teal/30 focus:border-antah-teal"
                      placeholder="Describe what you see, estimated flow rate, duration, or street hazards..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <Input
                    label="Location Name / Landmark"
                    placeholder="e.g. 4th Main Road, opposite City Hospital"
                    leftIcon={<MapPin size={16} />}
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  icon={<FileCheck2 size={16} />}
                >
                  Submit Observation
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

