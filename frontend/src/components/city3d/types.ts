import { ReportCategory, ReportStatus } from '../../theme/tokens';

export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface District {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  center: [number, number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  activeCount: number;
}

export interface CitySignal {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  severity: SignalSeverity;
  position: [number, number, number]; // [x, y, z] in Three.js units
  locationName: string;
  districtId: string;
  reportedAt: string;
  reporterName: string;
  affectedInfrastructure?: string;
  relatedSignalId?: string; // Links to another candidate report
  candidateReason?: string;
  confidenceScore?: number;
}

export interface CandidateCluster {
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

export type CameraPreset = 'overview' | 'street' | 'focus' | 'patrol';

export const DISTRICTS: District[] = [
  {
    id: 'DIST-NORTH',
    name: 'Sector 3 Hydrologic Quad',
    code: 'SEC-03',
    description: 'High-density arterial with shared subterranean municipal drainage conduits.',
    color: '#0D9488',
    center: [-2.8, 0, 2.8],
    bounds: { minX: -6.5, maxX: -0.5, minZ: 0.5, maxZ: 6.5 },
    activeCount: 3,
  },
  {
    id: 'DIST-METRO',
    name: 'Central Metro Transit Core',
    code: 'MET-01',
    description: 'Multi-modal transit interchanges, high pedestrian footfall, and electrified corridors.',
    color: '#06B6D4',
    center: [2.8, 0, 2.8],
    bounds: { minX: 0.5, maxX: 6.5, minZ: 0.5, maxZ: 6.5 },
    activeCount: 2,
  },
  {
    id: 'DIST-COMMERCIAL',
    name: 'Indiranagar Commercial Arterial',
    code: 'IND-04',
    description: 'Major commercial thoroughfare with heavy transit bus lanes and utility ducts.',
    color: '#3B82F6',
    center: [2.8, 0, -2.8],
    bounds: { minX: 0.5, maxX: 6.5, minZ: -6.5, maxZ: -0.5 },
    activeCount: 1,
  },
  {
    id: 'DIST-OVERPASS',
    name: 'North Overpass Span & Civic Belt',
    code: 'OVP-02',
    description: 'Elevated highway ramps, cycle paths, and retaining infrastructure.',
    color: '#64748B',
    center: [-2.8, 0, -2.8],
    bounds: { minX: -6.5, maxX: -0.5, minZ: -6.5, maxZ: -0.5 },
    activeCount: 1,
  },
];

export const SAMPLE_CITY_SIGNALS: CitySignal[] = [
  {
    id: 'SIG-802',
    category: 'water_leakage',
    title: 'High Pressure Water Main Seepage',
    description: 'Subterranean pipe fracture leaking into road sub-base, causing ponding on 4th Main.',
    status: 'candidate_pattern',
    severity: 'critical',
    position: [-3.8, 1.8, 2.2],
    locationName: '4th Main Road, Sector 3',
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
    position: [-1.4, 1.8, 3.8],
    locationName: 'Crossroad 7, Sector 3',
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
    position: [3.4, 1.8, -2.4],
    locationName: 'Indiranagar Main Arterial',
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
    position: [2.5, 1.8, 3.6],
    locationName: 'Metro Feeder Walkway B',
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
    position: [-3.2, 1.8, -3.4],
    locationName: 'North Overpass Span 2',
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
    position: [4.2, 1.8, 1.8],
    locationName: 'Metro Arcade Service Way',
    districtId: 'DIST-METRO',
    reportedAt: '12 mins ago',
    reporterName: 'Arcade Maintenance Desk',
    affectedInfrastructure: 'Commercial Metering Vault #8',
  },
];

export const SAMPLE_CANDIDATE_CLUSTERS: CandidateCluster[] = [
  {
    id: 'CLUSTER-409',
    title: 'Hydraulic Pressure Fracture & Downstream Stormwater Surcharge',
    primaryCategory: 'water_leakage',
    confidenceScore: 0.94,
    signals: ['SIG-802', 'SIG-805'],
    detectedAt: '14 mins ago',
    rationale: 'Spatial proximity (90m apart), simultaneous timing (<10m delta), and elevation drop along Sector 3 slope indicate an identical main-line fracture rather than independent incidents.',
    status: 'pending_review',
    assignedCrew: 'Rapid Hydraulic Remediation Crew Alpha',
  },
];
