import { ReportCategory, ReportStatus } from '../../theme/tokens';

export interface CitySignal {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  position: [number, number, number]; // [x, y, z] in Three.js units
  locationName: string;
  reportedAt: string;
  relatedSignalId?: string; // Links to another candidate report
  candidateReason?: string;
  confidenceScore?: number;
}

export const SAMPLE_CITY_SIGNALS: CitySignal[] = [
  {
    id: 'SIG-802',
    category: 'water_leakage',
    title: 'High Pressure Water Main Seepage',
    description: 'Subterranean pipe fracture leaking into road sub-base, causing pooling on 4th Main.',
    status: 'candidate_pattern',
    position: [-4, 1.8, 2],
    locationName: '4th Main Road, Sector 3',
    reportedAt: '18 mins ago',
    relatedSignalId: 'SIG-805',
    candidateReason: 'Shared water grid quadrant with downstream drain overflow 90m away.',
    confidenceScore: 0.91,
  },
  {
    id: 'SIG-805',
    category: 'drainage_overflow',
    title: 'Stormwater Culvert Backflow',
    description: 'Culvert grate overflowing with clear water runoff despite zero precipitation today.',
    status: 'candidate_pattern',
    position: [-1, 1.8, 3.5],
    locationName: 'Crossroad 7, Sector 3',
    reportedAt: '25 mins ago',
    relatedSignalId: 'SIG-802',
    candidateReason: 'Downstream flow directly connected to 4th Main pipe fracture.',
    confidenceScore: 0.91,
  },
  {
    id: 'SIG-811',
    category: 'damaged_roads',
    title: 'Asphalt Depressional Sinkhole',
    description: 'Expanding 0.8m depression in central bus corridor; structural base destabilized.',
    status: 'verified_incident',
    position: [3.5, 1.8, -2],
    locationName: 'Indiranagar Main Arterial',
    reportedAt: '1 hour ago',
  },
  {
    id: 'SIG-819',
    category: 'broken_streetlights',
    title: 'Transit Corridor Blackout (3 Lamps)',
    description: 'Phase line tripping caused blackout across 120m pedestrian corridor near metro.',
    status: 'in_progress',
    position: [2, 1.8, 4],
    locationName: 'Metro Feeder Walkway B',
    reportedAt: '2 hours ago',
  },
  {
    id: 'SIG-823',
    category: 'public_infrastructure',
    title: 'Compromised Guardrail on Overpass',
    description: 'Heavy vehicle impact damaged 4m of steel barrier overlooking cycle track.',
    status: 'submitted',
    position: [-3.5, 1.8, -3.5],
    locationName: 'North Overpass Span 2',
    reportedAt: '40 mins ago',
  },
];

