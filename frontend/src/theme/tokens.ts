/**
 * ANTAH — The Unheard Signals Network
 * Core Design System Tokens & Brand Configurations
 */

export const BRAND = {
  name: "ANTAH",
  fullName: "The Unheard Signals Network",
  tagline: "Small signals today. Safer communities tomorrow.",
  mission: "Transform scattered community observations into connected intelligence and coordinated responses.",
  version: "1.0.0 (Nexconn 2026)",
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

