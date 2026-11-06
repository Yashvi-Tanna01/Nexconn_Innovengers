import * as THREE from 'three';

/**
 * Procedural Earth Texture Generator for ANTAH Living Digital Earth
 * Generates ultra-high-resolution diffuse, emissive, and bump canvas textures
 * with detailed geographical continents, electric cyan coastlines, and thousands
 * of illuminated golden city lights across Eurasia, India, Africa, and the Americas.
 * 100% procedural, offline-ready, 0 HTTP dependencies.
 */

interface Point {
  x: number;
  y: number;
}

// Detailed Continental Coastline Polygons [lon, lat]
const CONTINENT_POLYGONS: [number, number][][] = [
  // 1. Eurasia (Europe, Scandinavia, Mediterranean, Russia, Middle East, India, China, SE Asia)
  [
    [-9.5, 36.5], [-9.0, 43.5], [-2.0, 43.5], [-4.5, 48.5], [2.0, 51.0],
    [5.0, 53.0], [8.5, 55.0], [8.5, 57.5], [12.0, 55.5], [18.0, 54.5],
    [21.0, 59.5], [28.0, 60.0], [25.0, 68.0], [18.0, 70.0], [28.0, 71.0],
    [32.0, 70.0], [40.0, 68.0], [50.0, 69.0], [60.0, 70.0], [75.0, 73.0],
    [100.0, 76.0], [140.0, 72.0], [170.0, 66.0], [180.0, 65.0], [160.0, 55.0],
    [142.0, 48.0], [132.0, 43.0], [128.0, 38.0], [122.0, 32.0], [118.0, 25.0],
    [108.0, 20.0], [104.0, 10.0], [101.0, 3.0], [98.0, 8.0], [95.0, 18.0],
    [90.0, 22.0], [88.0, 22.0], [82.0, 16.0],
    // Indian Subcontinent (Detailed Peninsular Coastline)
    [80.2, 13.0], [79.8, 10.5], [78.2, 9.0], [77.5, 8.1], [76.5, 9.5],
    [75.0, 12.0], [73.5, 15.5], [72.8, 19.0], [70.0, 21.0], [68.5, 23.5],
    [65.0, 25.0], [62.0, 25.5], [56.5, 26.5], [50.0, 29.5], [48.0, 30.5],
    // Red Sea, Arabian Peninsula & Mediterranean
    [44.0, 30.0], [38.0, 28.0], [35.0, 29.5], [34.0, 31.5], [36.0, 34.0],
    [30.0, 36.5], [26.0, 40.0], [23.0, 38.0], [20.0, 40.0], [15.0, 41.0],
    [12.0, 44.0], [3.0, 43.0], [-1.0, 38.0], [-5.5, 36.0], [-9.5, 36.5]
  ],
  // 2. Africa (North Africa, West Africa, Central, South, Horn of Africa)
  [
    [-5.5, 36.0], [10.0, 37.0], [11.0, 33.0], [25.0, 31.5], [32.0, 31.5],
    [35.0, 29.5], [34.0, 27.5], [38.5, 22.0], [38.0, 18.0], [43.0, 12.5],
    [51.0, 11.5], [49.0, 8.0], [42.0, -1.0], [40.0, -5.0], [36.0, -11.0],
    [35.0, -18.0], [32.5, -26.0], [28.0, -32.5], [19.0, -34.8], [18.0, -34.0],
    [15.0, -29.0], [12.0, -17.0], [13.5, -9.0], [9.0, 2.0], [5.0, 4.5],
    [2.0, 6.0], [-4.0, 5.0], [-12.0, 8.0], [-16.5, 12.0], [-17.5, 14.8],
    [-16.0, 19.0], [-13.0, 28.0], [-10.0, 30.0], [-5.5, 36.0]
  ],
  // 3. North America
  [
    [-168.0, 65.5], [-162.0, 70.0], [-140.0, 70.0], [-120.0, 70.0], [-90.0, 70.0],
    [-80.0, 62.0], [-75.0, 62.0], [-65.0, 58.0], [-55.0, 52.0], [-60.0, 46.0],
    [-70.0, 43.0], [-75.0, 38.0], [-80.0, 30.0], [-81.0, 25.0], [-83.0, 29.0],
    [-90.0, 30.0], [-97.0, 26.0], [-97.0, 20.0], [-90.0, 16.0], [-85.0, 13.0],
    [-78.0, 8.0], [-84.0, 9.0], [-88.0, 14.0], [-94.0, 16.0], [-105.0, 22.0],
    [-110.0, 30.0], [-117.0, 32.5], [-123.0, 38.0], [-124.0, 48.0], [-130.0, 54.0],
    [-145.0, 60.0], [-165.0, 60.0], [-168.0, 65.5]
  ],
  // 4. South America
  [
    [-75.0, 11.0], [-65.0, 11.0], [-52.0, 4.0], [-35.0, -5.0], [-38.0, -13.0],
    [-42.0, -23.0], [-48.0, -28.0], [-55.0, -35.0], [-65.0, -42.0], [-68.0, -54.0],
    [-74.0, -52.0], [-73.0, -42.0], [-72.0, -30.0], [-70.0, -18.0], [-80.0, -5.0],
    [-78.0, 2.0], [-75.0, 11.0]
  ],
  // 5. Australia
  [
    [114.0, -22.0], [122.0, -17.0], [130.0, -12.0], [136.0, -12.0], [142.0, -11.0],
    [145.0, -15.0], [150.0, -22.0], [153.0, -28.0], [150.0, -37.0], [140.0, -38.0],
    [135.0, -34.0], [130.0, -32.0], [116.0, -34.0], [114.0, -26.0], [114.0, -22.0]
  ],
  // 6. British Isles
  [
    [-5.0, 50.0], [1.5, 51.0], [0.0, 53.0], [-1.0, 55.0], [-2.0, 58.5],
    [-5.0, 58.0], [-5.0, 55.0], [-3.0, 51.5], [-5.0, 50.0]
  ],
  // 7. Japan Archipelago
  [
    [131.0, 31.0], [135.0, 34.0], [139.0, 35.5], [141.0, 38.5], [141.5, 43.0],
    [140.0, 45.0], [138.0, 37.0], [133.0, 34.0], [131.0, 31.0]
  ],
  // 8. Sri Lanka
  [
    [80.0, 9.8], [81.8, 8.5], [81.8, 6.9], [80.5, 5.9], [79.7, 7.0], [80.0, 9.8]
  ],
  // 9. Madagascar
  [
    [49.5, -12.2], [50.5, -15.5], [49.0, -22.0], [47.0, -25.5], [44.0, -25.0],
    [43.5, -21.0], [46.0, -16.0], [49.5, -12.2]
  ],
  // 10. Scandinavian Peninsula (Norway/Sweden/Finland)
  [
    [5.0, 60.0], [10.0, 58.0], [12.0, 56.0], [16.0, 56.0], [18.5, 59.5],
    [21.5, 63.5], [25.0, 65.5], [30.0, 70.0], [26.0, 71.0], [18.0, 69.5],
    [12.0, 66.0], [5.0, 62.0], [5.0, 60.0]
  ],
  // 11. Italy & Greece Mediterranean Peninsula
  [
    [8.5, 44.5], [10.0, 44.0], [12.5, 42.0], [16.0, 41.0], [18.5, 40.0],
    [16.0, 38.0], [15.5, 38.2], [14.0, 41.0], [12.0, 43.0], [9.0, 44.0], [8.5, 44.5]
  ]
];

// Major Metropolitan Coordinates [lon, lat, intensity, radius, name]
export const METROPOLITAN_HUBS: [number, number, number, number, string][] = [
  // Primary Hub: Bangalore East Infrastructure Core (India Focus)
  [77.6, 13.0, 1.0, 22, 'Bangalore East Infrastructure Core'],
  [72.8, 19.0, 0.95, 18, 'Mumbai'],
  [77.2, 28.6, 0.95, 19, 'Delhi-NCR'],
  [88.3, 22.5, 0.85, 15, 'Kolkata'],
  [80.2, 13.0, 0.9, 16, 'Chennai'],
  [78.4, 17.4, 0.9, 16, 'Hyderabad'],
  [73.8, 18.5, 0.8, 13, 'Pune'],
  [72.5, 23.0, 0.85, 14, 'Ahmedabad'],
  // East & Southeast Asia
  [139.7, 35.7, 1.0, 22, 'Tokyo Metropolis'],
  [121.5, 31.2, 0.95, 20, 'Shanghai'],
  [116.4, 39.9, 0.9, 18, 'Beijing'],
  [114.1, 22.3, 0.95, 17, 'Hong Kong / Shenzhen'],
  [103.8, 1.35, 0.95, 16, 'Singapore Hub'],
  [100.5, 13.7, 0.85, 15, 'Bangkok'],
  [106.8, -6.2, 0.85, 15, 'Jakarta'],
  [127.0, 37.5, 0.95, 18, 'Seoul'],
  [121.5, 25.0, 0.85, 14, 'Taipei'],
  // Middle East & Africa
  [55.3, 25.2, 1.0, 18, 'Dubai Civic Gateway'],
  [46.7, 24.7, 0.85, 15, 'Riyadh'],
  [31.2, 30.0, 0.95, 18, 'Cairo & Nile Valley'],
  [35.2, 31.8, 0.8, 13, 'Jerusalem'],
  [51.5, 25.3, 0.85, 13, 'Doha'],
  [36.8, -1.3, 0.8, 13, 'Nairobi'],
  [28.0, -26.2, 0.85, 14, 'Johannesburg'],
  [3.4, 6.5, 0.8, 13, 'Lagos'],
  // Europe (Dense Golden Web)
  [-0.1, 51.5, 1.0, 22, 'London Telemetry'],
  [2.35, 48.8, 0.95, 20, 'Paris'],
  [13.4, 52.5, 0.9, 17, 'Berlin'],
  [12.5, 41.9, 0.85, 16, 'Rome'],
  [-3.7, 40.4, 0.85, 16, 'Madrid'],
  [4.9, 52.4, 0.9, 16, 'Amsterdam / Randstad'],
  [8.5, 47.4, 0.85, 14, 'Zurich'],
  [16.4, 48.2, 0.85, 14, 'Vienna'],
  [37.6, 55.7, 0.9, 18, 'Moscow'],
  [30.5, 50.4, 0.8, 13, 'Kyiv'],
  [21.0, 52.2, 0.8, 13, 'Warsaw'],
  [28.9, 41.0, 0.9, 16, 'Istanbul'],
  // North America
  [-74.0, 40.7, 1.0, 22, 'New York Metro'],
  [-87.6, 41.8, 0.9, 18, 'Chicago'],
  [-118.2, 34.0, 0.95, 20, 'Los Angeles'],
  [-122.4, 37.8, 0.95, 18, 'San Francisco Bay'],
  [-95.3, 29.7, 0.85, 16, 'Houston'],
  [-80.2, 25.8, 0.85, 16, 'Miami'],
  [-79.4, 43.6, 0.85, 16, 'Toronto'],
  [-99.1, 19.4, 0.9, 17, 'Mexico City'],
  [-123.1, 49.3, 0.8, 14, 'Vancouver'],
  // South America & Australia
  [-46.6, -23.5, 0.95, 18, 'São Paulo'],
  [-58.4, -34.6, 0.9, 16, 'Buenos Aires'],
  [-70.6, -33.4, 0.8, 13, 'Santiago'],
  [-74.1, 4.7, 0.8, 13, 'Bogotá'],
  [151.2, -33.8, 0.9, 16, 'Sydney Gateway'],
  [144.9, -37.8, 0.85, 15, 'Melbourne']
];

// Major Highway & Telemetry Corridors [startHubIndex, endHubIndex]
export const INFRASTRUCTURE_CORRIDORS: [number, number][] = [
  // India Core Golden Quadrilateral
  [0, 1], [0, 4], [0, 5], [1, 2], [2, 3], [1, 6], [4, 3], [1, 7], [7, 2], [5, 2],
  // Trans-Eurasian Telemetry Trunk
  [0, 12], [12, 11], [11, 9], [9, 10], [10, 8], [9, 8], [8, 15],
  [0, 17], [17, 18], [17, 19], [19, 36], [36, 27], [27, 26], [26, 25], [26, 30],
  [25, 29], [29, 28], [28, 27], [27, 32], [32, 33], [33, 34],
  // Trans-Atlantic Data Links
  [25, 37], [26, 37], [29, 37],
  // North American Megalopolis Corridor
  [37, 38], [37, 43], [38, 40], [38, 39], [39, 40], [37, 42], [42, 44], [40, 45],
  // African & Middle Eastern Corridors
  [19, 22], [22, 23], [23, 24], [17, 21], [21, 18],
  // Trans-Pacific Links
  [8, 40], [12, 47], [47, 48]
];

// Continental Dense Light Clusters (Center Lon, Center Lat, Radius, Density)
const REGIONAL_LIGHT_CLUSTERS: [number, number, number, number][] = [
  // Europe (Dense Golden Galaxy)
  [2.0, 48.0, 14, 450],
  [10.0, 51.0, 12, 380],
  [-1.5, 52.5, 8, 240],
  [12.0, 44.0, 8, 200],
  [-3.5, 40.0, 10, 180],
  // India (Intense Golden Galaxy)
  [77.0, 20.0, 15, 650], // Deccan / Central
  [78.0, 27.0, 12, 500], // Indo-Gangetic Belt
  [76.0, 12.0, 8, 350],  // South India / Bangalore Corridor
  [72.5, 21.0, 9, 300],  // Gujarat / Western
  [88.0, 24.0, 8, 260],  // Bengal Delta
  // Nile Ribbon & Middle East
  [31.2, 29.0, 6, 220],
  [48.0, 26.0, 10, 240],
  // East Asia
  [120.0, 31.0, 12, 550], // Yangtze Delta / East Coast
  [113.0, 23.0, 8, 320],  // Pearl River
  [137.0, 35.0, 8, 340],  // Japan Belt
  [127.0, 36.5, 6, 200],  // Korea
  // North America
  [-76.0, 40.0, 12, 480], // Northeast Megalopolis
  [-86.0, 41.5, 10, 300], // Midwest
  [-119.0, 35.0, 10, 320], // California
  [-96.0, 31.0, 8, 220],  // Texas
  // South America & Africa
  [-46.0, -23.0, 8, 220], // Southeast Brazil
  [28.0, -26.0, 6, 160],  // South Africa
];

function projectLonLatToCanvas(lon: number, lat: number, width: number, height: number): Point {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

export interface GeneratedEarthTextures {
  diffuseMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

// Global texture cache to prevent expensive multi-pass canvas re-generation on re-renders/navigation
let cachedDesktopTextures: GeneratedEarthTextures | null = null;
let cachedLowPowerTextures: GeneratedEarthTextures | null = null;

export function generateLivingEarthTextures(isLowPower: boolean = false): GeneratedEarthTextures {
  if (isLowPower && cachedLowPowerTextures) {
    return cachedLowPowerTextures;
  }
  if (!isLowPower && cachedDesktopTextures) {
    return cachedDesktopTextures;
  }

  const width = isLowPower ? 1024 : 2048;
  const height = isLowPower ? 512 : 1024;

  // 1. Create Diffuse Canvas (Day/Night Realistic Composite)
  const diffuseCanvas = document.createElement('canvas');
  diffuseCanvas.width = width;
  diffuseCanvas.height = height;
  const dCtx = diffuseCanvas.getContext('2d')!;

  // 2. Create Emissive Canvas (Night City Lights, Road Networks, Glowing Electric Coastlines)
  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = width;
  emissiveCanvas.height = height;
  const eCtx = emissiveCanvas.getContext('2d')!;

  // 3. Create Bump Canvas (Topographic Elevation Relief)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;

  // --------------------------------------------------------------------------
  // A. BASE DEEP MIDNIGHT NAVY & ABYSSAL OCEANIC MANTLE
  // --------------------------------------------------------------------------
  const oceanGrad = dCtx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.0, '#020614'); // Polar Deep Abyssal Blue
  oceanGrad.addColorStop(0.2, '#041026'); // Sub-Arctic Midnight Navy
  oceanGrad.addColorStop(0.5, '#081D3E'); // Luminous Equatorial Oceanic Blue
  oceanGrad.addColorStop(0.8, '#041026');
  oceanGrad.addColorStop(1.0, '#020614');
  dCtx.fillStyle = oceanGrad;
  dCtx.fillRect(0, 0, width, height);

  // Emissive: Pure deep navy base
  eCtx.fillStyle = '#010511';
  eCtx.fillRect(0, 0, width, height);

  // Bump: Base neutral sea level
  bCtx.fillStyle = '#606060';
  bCtx.fillRect(0, 0, width, height);

  // Bathymetric oceanic telemetry grid & contour rings
  dCtx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  dCtx.lineWidth = 1;
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * height;
    dCtx.beginPath();
    dCtx.moveTo(0, y);
    dCtx.lineTo(width, y);
    dCtx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    dCtx.beginPath();
    dCtx.moveTo(x, 0);
    dCtx.lineTo(x, height);
    dCtx.stroke();
  }

  // --------------------------------------------------------------------------
  // B. CONTINENTAL LANDMASSES & LUMINOUS ELECTRIC CYAN COASTLINES
  // --------------------------------------------------------------------------
  CONTINENT_POLYGONS.forEach((polygon) => {
    if (polygon.length < 3) return;

    // 1. Draw Landmass Fill on Diffuse (Dark Midnight Slate with subtle land shading)
    dCtx.beginPath();
    const startPt = projectLonLatToCanvas(polygon[0][0], polygon[0][1], width, height);
    dCtx.moveTo(startPt.x, startPt.y);

    for (let i = 1; i < polygon.length; i++) {
      const pt = projectLonLatToCanvas(polygon[i][0], polygon[i][1], width, height);
      dCtx.lineTo(pt.x, pt.y);
    }
    dCtx.closePath();

    // Landmass Interior: Rich midnight navy silhouette with subtle depth
    dCtx.fillStyle = '#0A223E';
    dCtx.fill();

    // Bump: Landmasses raised with topographic relief
    bCtx.beginPath();
    bCtx.moveTo(startPt.x, startPt.y);
    for (let i = 1; i < polygon.length; i++) {
      const pt = projectLonLatToCanvas(polygon[i][0], polygon[i][1], width, height);
      bCtx.lineTo(pt.x, pt.y);
    }
    bCtx.closePath();
    bCtx.fillStyle = '#D0D0D0';
    bCtx.fill();

    // 2. Multi-Pass Glowing Coastlines (Electric Cyan & Turquoise)
    // Outer glow pass on diffuse
    dCtx.strokeStyle = '#00F2FE';
    dCtx.lineWidth = isLowPower ? 2.6 : 3.8;
    dCtx.shadowColor = '#00F2FE';
    dCtx.shadowBlur = isLowPower ? 10 : 20;
    dCtx.stroke();
    dCtx.shadowBlur = 0; // Reset

    // Emissive Coastline Stroke (Intense neon glow)
    eCtx.beginPath();
    eCtx.moveTo(startPt.x, startPt.y);
    for (let i = 1; i < polygon.length; i++) {
      const pt = projectLonLatToCanvas(polygon[i][0], polygon[i][1], width, height);
      eCtx.lineTo(pt.x, pt.y);
    }
    eCtx.closePath();
    eCtx.strokeStyle = '#00F2FE';
    eCtx.lineWidth = isLowPower ? 2.2 : 3.4;
    eCtx.shadowColor = '#38BDF8';
    eCtx.shadowBlur = isLowPower ? 8 : 16;
    eCtx.stroke();
    eCtx.shadowBlur = 0;

    // 3. Topographic Inset Contours
    dCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    dCtx.lineWidth = 1.2;
    dCtx.stroke();
  });

  // --------------------------------------------------------------------------
  // C. SMART INFRASTRUCTURE HIGHWAYS & GOLDEN ROAD NETWORKS
  // --------------------------------------------------------------------------
  INFRASTRUCTURE_CORRIDORS.forEach(([sIdx, eIdx]) => {
    const sHub = METROPOLITAN_HUBS[sIdx];
    const eHub = METROPOLITAN_HUBS[eIdx];
    if (!sHub || !eHub) return;

    const p1 = projectLonLatToCanvas(sHub[0], sHub[1], width, height);
    const p2 = projectLonLatToCanvas(eHub[0], eHub[1], width, height);

    if (Math.abs(p1.x - p2.x) > width * 0.6) return;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - 8;

    // Diffuse Highway Filaments
    dCtx.beginPath();
    dCtx.moveTo(p1.x, p1.y);
    dCtx.quadraticCurveTo(midX, midY, p2.x, p2.y);
    dCtx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    dCtx.lineWidth = 1.5;
    dCtx.stroke();

    // Emissive Glowing Golden Filaments
    eCtx.beginPath();
    eCtx.moveTo(p1.x, p1.y);
    eCtx.quadraticCurveTo(midX, midY, p2.x, p2.y);
    eCtx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
    eCtx.lineWidth = 1.2;
    eCtx.shadowColor = '#F59E0B';
    eCtx.shadowBlur = 6;
    eCtx.stroke();
    eCtx.shadowBlur = 0;
  });

  // --------------------------------------------------------------------------
  // D. THOUSANDS OF SPARKLING GOLDEN CITY LIGHTS & URBAN CLUSTERS
  // --------------------------------------------------------------------------
  // 1. Primary Major Metropolitan Hubs
  METROPOLITAN_HUBS.forEach(([lon, lat, intensity, radiusSize]) => {
    const pt = projectLonLatToCanvas(lon, lat, width, height);
    const r = radiusSize * (width / 2048);

    // City Light Core on Diffuse (White Core -> Brilliant Golden Bloom)
    const cityGrad = dCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
    cityGrad.addColorStop(0.0, '#FFFFFF');
    cityGrad.addColorStop(0.25, '#FEF08A'); // Brilliant Gold
    cityGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.7)'); // Amber Bloom
    cityGrad.addColorStop(1.0, 'rgba(245, 158, 11, 0)');
    dCtx.fillStyle = cityGrad;
    dCtx.beginPath();
    dCtx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    dCtx.fill();

    // Emissive Glowing City Light Core
    const emissiveGrad = eCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
    emissiveGrad.addColorStop(0.0, '#FFFFFF');
    emissiveGrad.addColorStop(0.3, '#FDE047');
    emissiveGrad.addColorStop(0.7, `rgba(245, 158, 11, ${intensity * 0.95})`);
    emissiveGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    eCtx.fillStyle = emissiveGrad;
    eCtx.beginPath();
    eCtx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    eCtx.fill();

    // Surrounding metropolitan micro-pixels
    const subCount = Math.floor(12 * intensity);
    for (let s = 0; s < subCount; s++) {
      const ang = (s * Math.PI * 2) / subCount + lon;
      const dist = (r * 0.7) + (s % 4) * 4;
      const sx = pt.x + Math.cos(ang) * dist;
      const sy = pt.y + Math.sin(ang) * dist;

      dCtx.fillStyle = '#FFFBEB';
      eCtx.fillStyle = '#FEF08A';
      dCtx.fillRect(sx - 1, sy - 1, 2, 2);
      eCtx.fillRect(sx - 1, sy - 1, 2, 2);
    }
  });

  // 2. Thousands of Scattered Golden City Lights across Regional Continents
  // Creates the breathtaking NASA "Earth at Night" dense golden web seen in reference image
  REGIONAL_LIGHT_CLUSTERS.forEach(([cLon, cLat, spread, count]) => {
    const actualCount = isLowPower ? Math.floor(count * 0.45) : count;
    // Deterministic pseudo-random seed generator
    let seed = Math.abs(Math.sin(cLon * 12.9898 + cLat * 78.233)) * 43758.5453;

    for (let i = 0; i < actualCount; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const r1 = seed / 233280;
      seed = (seed * 9301 + 49297) % 233280;
      const r2 = seed / 233280;

      // Normal Gaussian distribution around cluster center
      const angle = r1 * Math.PI * 2;
      const dist = Math.sqrt(-2 * Math.log(Math.max(0.001, r2))) * (spread * 0.45);
      const lon = cLon + Math.cos(angle) * dist;
      const lat = cLat + Math.sin(angle) * (dist * 0.65);

      const pt = projectLonLatToCanvas(lon, lat, width, height);

      // Randomize light color: bright white-gold, warm gold, or amber
      const brightness = 0.5 + (i % 5) * 0.12;
      const isHubPoint = i % 8 === 0;

      if (isHubPoint) {
        // Larger secondary town light
        const townGrad = eCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 3.5);
        townGrad.addColorStop(0.0, '#FFFFFF');
        townGrad.addColorStop(0.4, '#FEF08A');
        townGrad.addColorStop(1.0, 'rgba(245, 158, 11, 0)');
        eCtx.fillStyle = townGrad;
        eCtx.beginPath();
        eCtx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        eCtx.fill();

        dCtx.fillStyle = '#FEF08A';
        dCtx.beginPath();
        dCtx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
        dCtx.fill();
      } else {
        // Tiny city light spark
        eCtx.fillStyle = `rgba(254, 240, 138, ${brightness})`;
        dCtx.fillStyle = `rgba(251, 191, 36, ${brightness * 0.85})`;
        eCtx.fillRect(pt.x - 0.75, pt.y - 0.75, 1.5, 1.5);
        dCtx.fillRect(pt.x - 0.75, pt.y - 0.75, 1.5, 1.5);
      }
    }
  });

  // --------------------------------------------------------------------------
  // E. CONVERT CANVASES TO HIGH-QUALITY THREE.JS TEXTURES
  // --------------------------------------------------------------------------
  const diffuseMap = new THREE.CanvasTexture(diffuseCanvas);
  diffuseMap.wrapS = THREE.RepeatWrapping;
  diffuseMap.wrapT = THREE.ClampToEdgeWrapping;
  diffuseMap.generateMipmaps = true;

  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.wrapT = THREE.ClampToEdgeWrapping;
  emissiveMap.generateMipmaps = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.generateMipmaps = true;

  const result: GeneratedEarthTextures = { diffuseMap, emissiveMap, bumpMap };
  if (isLowPower) {
    cachedLowPowerTextures = result;
  } else {
    cachedDesktopTextures = result;
  }

  return result;
}
