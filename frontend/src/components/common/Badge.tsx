import React from 'react';
import {
  ReportCategory,
  ReportStatus,
  REPORT_CATEGORIES,
  STATUS_CONFIG,
} from '../../theme/tokens';
import {
  Droplets,
  Waves,
  Construction,
  LightbulbOff,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: ReportCategory;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const meta = REPORT_CATEGORIES[category] || REPORT_CATEGORIES.public_infrastructure;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (category) {
      case 'water_leakage':
        return <Droplets size={iconSize} className="text-sky-600" />;
      case 'drainage_overflow':
        return <Waves size={iconSize} className="text-teal-600" />;
      case 'damaged_roads':
        return <Construction size={iconSize} className="text-amber-600" />;
      case 'broken_streetlights':
        return <LightbulbOff size={iconSize} className="text-rose-600" />;
      case 'public_infrastructure':
      default:
        return <Building2 size={iconSize} className="text-slate-600" />;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${className}`}
      style={{
        backgroundColor: meta.bgLight,
        borderColor: meta.badgeBorder,
        color: meta.color,
      }}
    >
      {showIcon && renderIcon()}
      <span>{meta.label}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const meta = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${meta.badgeClass} ${sizeClasses} ${className}`}
      title={meta.description}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
      <span>{meta.label}</span>
    </span>
  );
};

interface AiCandidateBadgeProps {
  confidenceScore?: number;
  className?: string;
}

export const AiCandidateBadge: React.FC<AiCandidateBadgeProps> = ({
  confidenceScore,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs font-medium ${className}`}
      title="Proposed AI correlation pattern — requires human coordinator review before confirmation."
    >
      <Sparkles size={12} className="text-amber-600 animate-pulse" />
      <span>AI Candidate Suggestion</span>
      {typeof confidenceScore === 'number' && (
        <span className="font-mono font-semibold text-amber-700 bg-amber-100/70 px-1 py-0.2 rounded text-[11px]">
          {Math.round(confidenceScore * 100)}% Match
        </span>
      )}
    </div>
  );
};

