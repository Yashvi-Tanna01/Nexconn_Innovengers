import { ReportCategory, ReportStatus } from '../../theme/tokens';
import { ReportAttachment } from '../../config/api';

export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AtlasDistrict {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  center: [number, number]; // [lat, lng]
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  activeCount: number;
}

export interface AtlasSignal {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  severity: SignalSeverity;
  coordinates: [number, number]; // [lat, lng]
  locationName: string;
  neighborhood: string;
  districtId: string;
  reportedAt: string;
  reporterName: string;
  affectedInfrastructure?: string;
  relatedSignalId?: string; // Links to candidate report
  candidateReason?: string;
  confidenceScore?: number;
  attachments?: ReportAttachment[];
}

export interface AtlasCandidateCluster {
  id: string;
  title: string;
  primaryCategory: ReportCategory;
  confidenceScore: number;
  signals: string[]; // Signal IDs
  detectedAt: string;
  rationale: string;
  status: 'pending_review' | 'verified_incident' | 'dismissed';
  assignedCrew?: string;
}

// Real Metropolitan Civic Landscape: Bangalore East Urban Infrastructure Core
export const ATLAS_DISTRICTS: AtlasDistrict[] = [
  {
    id: 'DIST-NORTH',
    name: 'Sector 3 Hydrologic Quad',
    code: 'SEC-03',
    description: 'High-density arterial with shared subterranean municipal drainage conduits and feeder trunks.',
    color: '#0D9488', // Deep teal
    center: [12.9786, 77.6405],
    bounds: { north: 12.983, south: 12.976, east: 77.644, west: 77.636 },
    activeCount: 2,
  },
  {
    id: 'DIST-METRO',
    name: 'Central Metro Transit Core',
    code: 'MET-01',
    description: 'Multi-modal transit interchanges, high pedestrian footfall, and electrified utility corridors.',
    color: '#0284C7', // Soft blue
    center: [12.9750, 77.6385],
    bounds: { north: 12.977, south: 12.972, east: 77.641, west: 77.635 },
    activeCount: 2,
  },
  {
    id: 'DIST-COMMERCIAL',
    name: 'Indiranagar Commercial Corridor',
    code: 'IND-04',
    description: 'Major commercial thoroughfare with heavy transit bus lanes and utility ducts.',
    color: '#D97706', // Muted amber
    center: [12.9715, 77.6445],
    bounds: { north: 12.974, south: 12.968, east: 77.648, west: 77.641 },
    activeCount: 1,
  },
  {
    id: 'DIST-OVERPASS',
    name: 'North Overpass Span & Civic Belt',
    code: 'OVP-02',
    description: 'Elevated highway ramps, cycle paths, and retaining infrastructure.',
    color: '#64748B', // Graphite slate
    center: [12.9830, 77.6350],
    bounds: { north: 12.986, south: 12.980, east: 77.638, west: 77.632 },
    activeCount: 1,
  },
];

export const ATLAS_SIGNALS: AtlasSignal[] = [
  {
    id: 'SIG-802',
    category: 'water_leakage',
    title: 'High Pressure Water Main Seepage',
    description: 'Subterranean pipe fracture leaking into road sub-base, causing ponding on 4th Main.',
    status: 'candidate_pattern',
    severity: 'critical',
    coordinates: [12.9782, 77.6398],
    locationName: '4th Main Road, Sector 3',
    neighborhood: 'Defence Colony, Sector 3',
    districtId: 'DIST-NORTH',
    reportedAt: '18 mins ago',
    reporterName: 'Ananya S. (Verified Citizen)',
    affectedInfrastructure: '600mm Potable Feeder Trunk #14',
    relatedSignalId: 'SIG-805',
    candidateReason: 'Co-located with culvert overflow 90m downstream; hydro-gradient matches pipe course.',
    confidenceScore: 0.94,
  },
  {
    id: 'SIG-805',
    category: 'drainage_overflow',
    title: 'Stormwater Culvert Backflow',
    description: 'Culvert grate overflowing with high velocity clear runoff despite zero rain today.',
    status: 'candidate_pattern',
    severity: 'high',
    coordinates: [12.9791, 77.6414],
    locationName: 'Crossroad 7, Sector 3',
    neighborhood: 'Defence Colony, Sector 3',
    districtId: 'DIST-NORTH',
    reportedAt: '25 mins ago',
    reporterName: 'Karthik R. (Transit Marshal)',
    affectedInfrastructure: 'Storm Drain Collector Trunk 3B',
    relatedSignalId: 'SIG-802',
    candidateReason: 'Shared water grid quadrant with upstream potable main seepage.',
    confidenceScore: 0.94,
  },
  {
    id: 'SIG-811',
    category: 'damaged_roads',
    title: 'Asphalt Depressional Sinkhole',
    description: 'Expanding 0.8m depression in central bus corridor; structural road sub-base destabilized.',
    status: 'verified_incident',
    severity: 'critical',
    coordinates: [12.9712, 77.6450],
    locationName: 'Indiranagar Main Arterial (100 Feet Rd)',
    neighborhood: 'Indiranagar Commercial Corridor',
    districtId: 'DIST-COMMERCIAL',
    reportedAt: '1 hour ago',
    reporterName: 'Transit Operations Desk',
    affectedInfrastructure: 'Express Bus Rapid Transit Lane 2',
  },
  {
    id: 'SIG-819',
    category: 'broken_streetlights',
    title: 'Transit Corridor Blackout (3 Lamps)',
    description: 'Underground feeder cable trip caused complete blackout across 120m pedestrian corridor near metro.',
    status: 'in_progress',
    severity: 'medium',
    coordinates: [12.9754, 77.6382],
    locationName: 'Metro Feeder Walkway B',
    neighborhood: 'Central Metro Transit Core',
    districtId: 'DIST-METRO',
    reportedAt: '2 hours ago',
    reporterName: 'Priya M. (Community Lead)',
    affectedInfrastructure: 'Pedestrian Illuminance Sector Line 9',
  },
  {
    id: 'SIG-823',
    category: 'public_infrastructure',
    title: 'Compromised Guardrail on Overpass',
    description: 'Heavy vehicle impact damaged 4m of steel barrier overlooking cycle track below.',
    status: 'submitted',
    severity: 'high',
    coordinates: [12.9835, 77.6355],
    locationName: 'North Overpass Span 2',
    neighborhood: 'North Overpass Span',
    districtId: 'DIST-OVERPASS',
    reportedAt: '40 mins ago',
    reporterName: 'Sanjay V. (Commuter)',
    affectedInfrastructure: 'Elevated Span Structural Crash Barrier',
  },
  {
    id: 'SIG-830',
    category: 'water_leakage',
    title: 'Commercial Valve Chamber Overflow',
    description: 'Sump overflow valve jammed open in commercial arcade service trench.',
    status: 'submitted',
    severity: 'medium',
    coordinates: [12.9738, 77.6425],
    locationName: 'Metro Arcade Service Way',
    neighborhood: 'Central Metro Transit Core',
    districtId: 'DIST-METRO',
    reportedAt: '12 mins ago',
    reporterName: 'Arcade Maintenance Desk',
    affectedInfrastructure: 'Commercial Metering Vault #8',
  },
  {
    id: 'SIG-798',
    category: 'drainage_overflow',
    title: 'Culvert Desilting & Sump Clearance',
    description: 'Debris clear-out completed. Water transit restored to baseline velocity.',
    status: 'resolved',
    severity: 'low',
    coordinates: [12.9760, 77.6470],
    locationName: 'Indiranagar 12th Main Sump',
    neighborhood: 'Indiranagar Commercial Corridor',
    districtId: 'DIST-COMMERCIAL',
    reportedAt: '3 hours ago',
    reporterName: 'Civic Maintenance Log',
    affectedInfrastructure: 'Storm Drain Sump 12',
  },
];

export const ATLAS_CANDIDATE_CLUSTERS: AtlasCandidateCluster[] = [
  {
    id: 'CLUSTER-409',
    title: 'Hydraulic Pressure Fracture & Downstream Stormwater Surcharge',
    primaryCategory: 'water_leakage',
    confidenceScore: 0.94,
    signals: ['SIG-802', 'SIG-805'],
    detectedAt: '14 mins ago',
    rationale: 'Spatial proximity (~160m apart), simultaneous timing (<10m delta), and elevation drop along Sector 3 slope indicate an identical main-line fracture rather than independent incidents.',
    status: 'pending_review',
    assignedCrew: 'Rapid Hydraulic Remediation Crew Alpha',
  },
];

