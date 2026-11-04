import L from 'leaflet';
import { AtlasSignal } from './types';
import { ReportCategory } from '../../theme/tokens';

// Category color assignments adhering to the cartographic light-first palette
export const CATEGORY_PALETTE: Record<ReportCategory, { color: string; bg: string; label: string; stroke: string }> = {
  water_leakage: {
    color: '#0284C7', // Soft cyan / deep blue
    bg: '#F0F9FF',
    stroke: '#0284C7',
    label: 'Water Leakage',
  },
  drainage_overflow: {
    color: '#0D9488', // Deep teal
    bg: '#F0FDFA',
    stroke: '#0D9488',
    label: 'Drainage & Overflow',
  },
  damaged_roads: {
    color: '#DC2626', // Restrained vermilion
    bg: '#FEF2F2',
    stroke: '#DC2626',
    label: 'Damaged Roads',
  },
  broken_streetlights: {
    color: '#D97706', // Muted amber
    bg: '#FFFBEB',
    stroke: '#D97706',
    label: 'Broken Streetlights',
  },
  public_infrastructure: {
    color: '#475569', // Graphite slate
    bg: '#F8FAFC',
    stroke: '#475569',
    label: 'Public Infrastructure',
  },
};

// Distinct SVG pictograms by category ensuring color-vision deficiency accessibility
export const getCategoryGlyph = (category: ReportCategory, color: string): string => {
  switch (category) {
    case 'water_leakage':
      // Teardrop shield with horizontal hydro-wave
      return `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          <path d="M8.5 14c1 1.2 2 1.2 3.5 0s2.5-1.2 3.5 0" stroke-width="1.6"></path>
        </svg>
      `;
    case 'drainage_overflow':
      // Subterranean culvert intake grate
      return `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3"></rect>
          <line x1="8" y1="8" x2="8" y2="16"></line>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="16" y1="8" x2="16" y2="16"></line>
        </svg>
      `;
    case 'damaged_roads':
      // Geometric fault-line fracture diamond
      return `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 22 12 12 22 2 12"></polygon>
          <path d="M12 6l-2 4 4 4-2 4"></path>
        </svg>
      `;
    case 'broken_streetlights':
      // Octagonal luminaire with downward beam projection
      return `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
          <path d="M12 2v2"></path>
          <path d="M12 4a6 6 0 0 0-6 6c0 3 2 4.5 2 6h8c0-1.5 2-3 2-6a6 6 0 0 0-6-6z"></path>
        </svg>
      `;
    case 'public_infrastructure':
    default:
      // Structural keystone arch / civic span
      return `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 21V7l8-4 8 4v14"></path>
          <path d="M9 21v-7a3 3 0 0 1 6 0v7"></path>
        </svg>
      `;
  }
};

/**
 * Creates an exquisite, lightweight L.divIcon marker for the City Signal Atlas.
 * Pure SVG/HTML - zero image asset overhead, retina-sharp at any zoom.
 */
export const createAtlasMarkerIcon = (
  signal: AtlasSignal,
  isSelected: boolean,
  isRelatedToSelected: boolean
): L.DivIcon => {
  const meta = CATEGORY_PALETTE[signal.category] || CATEGORY_PALETTE.public_infrastructure;
  const isCandidate = signal.status === 'candidate_pattern';
  const isVerified = signal.status === 'verified_incident';
  const glyph = getCategoryGlyph(signal.category, meta.color);

  const active = isSelected || isRelatedToSelected;
  const size = active ? 40 : 34;

  // Visual status indicators
  const haloBorder = isCandidate
    ? 'border-2 border-dashed border-amber-500 shadow-[0_0_0_2px_rgba(217,119,6,0.2)]'
    : isVerified
    ? 'border-2 border-solid border-teal-600 shadow-[0_0_0_2px_rgba(13,148,136,0.2)]'
    : 'border border-slate-300/90 shadow-sm';

  const badgeIcon = isCandidate
    ? `<span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></span>`
    : isVerified
    ? `<span class="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-bold">✓</span>`
    : '';

  // Signal Pulse: precise expanding circular wave when active
  const pulseHtml = active
    ? `<span class="atlas-signal-pulse" style="border-color: ${isCandidate ? '#D97706' : meta.color};"></span>`
    : '';

  const html = `
    <div class="atlas-symbol-wrapper relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
      ${pulseHtml}
      <div 
        class="atlas-symbol-badge relative flex items-center justify-center rounded-xl bg-white ${haloBorder} transition-transform duration-200"
        style="width: ${size}px; height: ${size}px; ${active ? 'transform: scale(1.1);' : ''}"
        title="${signal.title} (${signal.id})"
      >
        <div class="flex items-center justify-center" style="color: ${meta.color};">
          ${glyph}
        </div>
        ${badgeIcon}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'atlas-marker-container',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

