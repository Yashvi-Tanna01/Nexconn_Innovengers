/**
 * ANTAH — The Unheard Signals Network
 * Core Design System Tokens & Brand Configurations
 */

export const BRAND = {
  name: "ANTAH",
  fullName: "The Unheard Signals Network",
  tagline: "Small signals today. A safer tomorrow.",
  mission: "Transform scattered community observations into connected intelligence and coordinated responses.",
  version: "2.0.0 (Nexconn 2026)",
} as const;

/**
 * Editorial 3D Home Page Color System (Reference 1: Minimalist Glowing Orb)
 */
export const HOME_TOKENS = {
  bg: "#F4F3EF",
  textPrimary: "#202827",
  textSecondary: "#7D8580",
  forestGreen: "#286B56",
  softAmber: "#E7A65B",
  surfaceWhite: "#FFFFFF",
  frameBorder: "rgba(255, 255, 255, 0.75)",
  frameShadow: "0 30px 90px -20px rgba(32, 40, 39, 0.12)",
} as const;

/**
 * Territorial Intelligence Internal Color System (Reference 2: VITA Dashboard)
 */
export const TERRITORIAL_TOKENS = {
  mainBg: "#F5F6F4",
  primaryPanel: "#FFFFFF",
  secondaryPanel: "#F0F3F0",
  sidebar: "#102B32",
  sidebarSecondary: "#173941",
  primaryText: "#1D2A2A",
  secondaryText: "#6F7B78",
  border: "#E2E8E4",
  primaryGreen: "#23765D",
  softGreen: "#E1F1E9",
  blue: "#477DA8",
  amber: "#E5A13B",
  orange: "#E77C3C",
  criticalRed: "#D64D4D",
} as const;

/**
 * Android APK Mobile-First Native Color System
 */
export const ANDROID_TOKENS = {
  background: "#F5F6F4",
  surface: "#FFFFFF",
  primaryText: "#202827",
  secondaryText: "#737C78",
  forestGreen: "#286B56",
  softGreen: "#E1F0E8",
  amber: "#E7A65B",
  border: "#E3E8E4",
  criticalRed: "#D9534F",
} as const;

/**
 * Premium Territorial Intelligence Map Design System (ANTAH Spatial View)
 */
export const MAP_INTELLIGENCE_TOKENS = {
  background: "#F8F8F5",      // Warm ivory main background
  mapSurface: "#F0F2EE",      // Basemap canvas background
  card: "#FFFFFF",            // White floating cards & panels
  primaryText: "#182322",     // Dark green-charcoal primary text
  secondaryText: "#727C79",   // Muted refined secondary text
  brandAccent: "#D99A45",     // Signature warm amber
  verifiedRed: "#D9534F",     // Muted red for verified incidents
  candidateAmber: "#E5A13B",  // Amber for AI candidate clusters
  resolvedGreen: "#286B56",   // Muted deep green for resolved incidents
  border: "#E6EAE6",          // Subtle border token
} as const;

export const COLOR_TOKENS = {
  background: {
    ivory: "#FBFBF9",
    canvas: "#F8F9FA",
    white: "#FFFFFF",
    panel: "rgba(255, 255, 255, 0.88)",
  },
  typography: {
    primary: "#0B132B", // Deep midnight navy
    secondary: "#475569", // Muted slate
    muted: "#64748B",
    subtle: "#94A3B8",
  },
  accents: {
    teal: {
      primary: "#0D9488",
      hover: "#0F766E",
      light: "#14B8A6",
      soft: "#CCFBF1",
      glow: "rgba(13, 148, 136, 0.15)",
    },
    cyan: {
      primary: "#06B6D4",
      hover: "#0891B2",
      light: "#38BDF8",
      soft: "#E0F2FE",
      glow: "rgba(6, 182, 212, 0.15)",
    },
    amber: {
      primary: "#D97706",
      hover: "#B45309",
      light: "#F59E0B",
      champagne: "#D4AF37",
      soft: "#FEF3C7",
      glow: "rgba(217, 119, 6, 0.15)",
    },
  },
  borders: {
    default: "#E2E8F0",
    light: "#F1F5F9",
    active: "#CBD5E1",
  },
} as const;

/**
 * Editorial Spatial Intelligence — Three-Level Depth & Spatial Elevation System
 */
export const SPATIAL_ELEVATION = {
  // Level 1: Foundation (Canvas, base geographic surface, primary document structure)
  level1: {
    bg: '#FBFBF9',
    border: 'rgba(226, 232, 240, 0.7)',
    shadow: 'none',
    zIndex: 0,
    className: 'bg-antah-ivory border-slate-200/70',
  },
  // Level 2: Interactive Surfaces (Cards, toolbars, navigation, list items)
  level2: {
    bg: '#FFFFFF',
    border: 'rgba(226, 232, 240, 0.9)',
    shadow: '0 2px 8px -2px rgba(11, 19, 43, 0.04), 0 1px 2px rgba(11, 19, 43, 0.02)',
    hoverShadow: '0 8px 24px -4px rgba(11, 19, 43, 0.08), 0 2px 6px rgba(11, 19, 43, 0.03)',
    activeShadow: '0 1px 3px rgba(11, 19, 43, 0.05)',
    zIndex: 10,
    className: 'bg-white border border-slate-200/90 shadow-soft-xs hover:border-slate-300 hover:shadow-soft-md transition-all',
  },
  // Level 3: Focused Overlays (Inspectors, context panels, modals, dialogs)
  level3: {
    bg: 'rgba(255, 255, 255, 0.96)',
    border: 'rgba(226, 232, 240, 0.95)',
    shadow: '0 16px 40px -8px rgba(11, 19, 43, 0.12), 0 4px 12px rgba(11, 19, 43, 0.04)',
    zIndex: 50,
    className: 'bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl',
  },
} as const;

export const SPATIAL_TIMINGS = {
  micro: 180, // Micro-interactions (hover, click, icon toggles)
  component: 280, // Component transitions (drawer slide, panel reveal)
  page: 250, // Page route transitions
  springTactile: { type: 'spring', stiffness: 420, damping: 28 },
  springSpatial: { type: 'spring', stiffness: 300, damping: 26 },
} as const;

export type ReportCategory =
  | "water_leakage"
  | "drainage_overflow"
  | "damaged_roads"
  | "broken_streetlights"
  | "public_infrastructure";

export interface CategoryMeta {
  id: ReportCategory;
  label: string;
  description: string;
  iconName: string;
  color: string;
  bgLight: string;
  badgeBorder: string;
}

export const REPORT_CATEGORIES: Record<ReportCategory, CategoryMeta> = {
  water_leakage: {
    id: "water_leakage",
    label: "Water Leakage",
    description: "Main line bursts, pipe seepages, fire hydrant drips, or surface water pooling",
    iconName: "Droplets",
    color: "#0284C7", // Sky blue
    bgLight: "#F0F9FF",
    badgeBorder: "#BAE6FD",
  },
  drainage_overflow: {
    id: "drainage_overflow",
    label: "Drainage Overflow",
    description: "Blocked storm drains, sewer backflow, or stagnant street runoff hazards",
    iconName: "Waves",
    color: "#0D9488", // Teal
    bgLight: "#F0FDFA",
    badgeBorder: "#99F6E4",
  },
  damaged_roads: {
    id: "damaged_roads",
    label: "Damaged Roads",
    description: "Potholes, asphalt collapse, uneven lane surfaces, or structural sinkholes",
    iconName: "Construction",
    color: "#D97706", // Amber
    bgLight: "#FFFBEB",
    badgeBorder: "#FDE68A",
  },
  broken_streetlights: {
    id: "broken_streetlights",
    label: "Broken Streetlights",
    description: "Unlit public corridors, flickering bulbs, damaged poles, or dark transit stops",
    iconName: "LightbulbOff",
    color: "#E11D48", // Rose / Crimson
    bgLight: "#FFF1F2",
    badgeBorder: "#FECDD3",
  },
  public_infrastructure: {
    id: "public_infrastructure",
    label: "Public Infrastructure",
    description: "Damaged guardrails, leaning utility poles, broken footbridges, or hazardous sidewalks",
    iconName: "Building2",
    color: "#475569", // Slate
    bgLight: "#F8FAFC",
    badgeBorder: "#E2E8F0",
  },
};

export type ReportStatus =
  | "submitted"
  | "ai_analyzing"
  | "candidate_pattern"
  | "verified_incident"
  | "responder_assigned"
  | "in_progress"
  | "resolved";

export interface StatusMeta {
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}

export const STATUS_CONFIG: Record<ReportStatus, StatusMeta> = {
  submitted: {
    label: "Report Received",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
    description: "Observation logged; awaiting AI ingestion and geographic indexing.",
  },
  ai_analyzing: {
    label: "Pattern Analyzing",
    badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
    dotColor: "bg-cyan-500",
    description: "AI evaluating spatial-temporal proximity and shared keyword clusters.",
  },
  candidate_pattern: {
    label: "Candidate Suggestion",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotColor: "bg-amber-500",
    description: "Proposed relationship flagged for coordinator validation (unverified).",
  },
  verified_incident: {
    label: "Verified Incident",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    dotColor: "bg-teal-600",
    description: "Confirmed incident validated by human civic coordinator.",
  },
  responder_assigned: {
    label: "Responder Assigned",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    dotColor: "bg-blue-600",
    description: "Dispatched to civic crew with live Nexconn Chat channel initialized.",
  },
  in_progress: {
    label: "Action In Progress",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dotColor: "bg-indigo-600",
    description: "Remediation crews on-site deploying physical repairs.",
  },
  resolved: {
    label: "Resolved & Closed",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-600",
    description: "Issue resolved and validated with community verification.",
  },
};

