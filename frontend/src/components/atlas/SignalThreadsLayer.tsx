import React, { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { AtlasSignal, AtlasCandidateCluster } from './types';

interface SignalThreadsLayerProps {
  map: L.Map | null;
  signals: AtlasSignal[];
  clusters: AtlasCandidateCluster[];
  selectedSignalId: string | null;
  selectedClusterId: string | null;
  onSelectCluster: (cluster: AtlasCandidateCluster) => void;
  showThreads?: boolean;
}

interface ThreadPathData {
  cluster: AtlasCandidateCluster;
  sourceSignal: AtlasSignal;
  targetSignal: AtlasSignal;
  pathD: string;
  midpoint: { x: number; y: number };
  isSelected: boolean;
  confidencePercent: number;
}

export const SignalThreadsLayer: React.FC<SignalThreadsLayerProps> = ({
  map,
  signals,
  clusters,
  selectedSignalId,
  selectedClusterId,
  onSelectCluster,
  showThreads = true,
}) => {
  const [, setTick] = useState(0);

  // Re-calculate paths whenever the map moves, zooms, or container resizes (throttled to RAF)
  useEffect(() => {
    if (!map) return;

    let rafId: number | null = null;
    const handleUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        setTick((t) => (t + 1) % 1000000);
        rafId = null;
      });
    };

    map.on('move', handleUpdate);
    map.on('zoom', handleUpdate);
    map.on('resize', handleUpdate);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      map.off('move', handleUpdate);
      map.off('zoom', handleUpdate);
      map.off('resize', handleUpdate);
    };
  }, [map]);

  const threadPaths = useMemo<ThreadPathData[]>(() => {
    if (!map || !showThreads) return [];

    const list: ThreadPathData[] = [];

    clusters.forEach((cluster) => {
      if (cluster.signals.length < 2) return;
      const s1 = signals.find((s) => s.id === cluster.signals[0]);
      const s2 = signals.find((s) => s.id === cluster.signals[1]);

      if (!s1 || !s2) return;

      const p1 = map.latLngToLayerPoint(s1.coordinates);
      const p2 = map.latLngToLayerPoint(s2.coordinates);

      // Quadratic Bézier curve calculation
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) return;

      // Subtle perpendicular curve apex
      const nx = -dy / dist;
      const ny = dx / dist;
      const curvature = Math.min(dist * 0.22, 45);
      const cx = midX + nx * curvature;
      const cy = midY + ny * curvature;

      const pathD = `M ${p1.x},${p1.y} Q ${cx},${cy} ${p2.x},${p2.y}`;

      const isSelected =
        selectedClusterId === cluster.id ||
        selectedSignalId === s1.id ||
        selectedSignalId === s2.id;

      list.push({
        cluster,
        sourceSignal: s1,
        targetSignal: s2,
        pathD,
        midpoint: { x: cx, y: cy },
        isSelected,
        confidencePercent: Math.round(cluster.confidenceScore * 100),
      });
    });

    return list;
  }, [map, signals, clusters, selectedSignalId, selectedClusterId, showThreads]);

  if (!map || !showThreads || threadPaths.length === 0) {
    return null;
  }

  // Find layer origin to offset SVG properly inside Leaflet pane
  const pane = map.getPanes().overlayPane;
  if (!pane) return null;

  return (
    <svg
      className="atlas-signal-threads-svg pointer-events-none absolute inset-0 overflow-visible"
      style={{ zIndex: 400 }}
    >
      <defs>
        {/* Soft amber glow filter for active threads */}
        <filter id="thread-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#D99A45" floodOpacity="0.4" />
        </filter>
      </defs>

      {threadPaths.map(({ cluster, pathD, midpoint, isSelected, confidencePercent }) => {
        const isVerified = cluster.status === 'verified_incident';
        const color = isVerified ? '#D9534F' : '#D99A45';

        return (
          <g key={`thread-${cluster.id}`} className="atlas-thread-group">
            {/* Wider invisible interactive hit-area for touch and click */}
            <path
              d={pathD}
              fill="none"
              stroke="transparent"
              strokeWidth="24"
              className="pointer-events-auto cursor-pointer"
              onClick={() => onSelectCluster(cluster)}
            />

            {/* Background Halo for Active Selection */}
            {isSelected && (
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeOpacity="0.2"
                strokeLinecap="round"
              />
            )}

            {/* Primary Curved Signal Thread */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={isSelected ? '2.5' : '1.5'}
              strokeDasharray={isSelected ? '6, 4' : '4, 4'}
              strokeOpacity={isSelected ? '0.95' : '0.45'}
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Continuous Synaptic Data Flow along Infrastructure Conduits */}
            <circle r={isSelected ? '3.8' : '2.4'} fill={color} opacity={isSelected ? 0.95 : 0.6}>
              <animateMotion
                path={pathD}
                dur={isSelected ? '1.8s' : '3.6s'}
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>

            {/* High-Energy Synaptic Acceleration Pulse for Selected Cluster */}
            {isSelected && (
              <circle r="2" fill="#FFFFFF" opacity="0.95">
                <animateMotion
                  path={pathD}
                  dur="1.8s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
            )}

            {/* Compact Editorial Relationship Badge at Curve Apex */}
            <g
              transform={`translate(${midpoint.x}, ${midpoint.y})`}
              className="pointer-events-auto cursor-pointer select-none transition-transform hover:scale-105"
              onClick={() => onSelectCluster(cluster)}
            >
              <rect
                x="-58"
                y="-12"
                width="116"
                height="24"
                rx="12"
                fill="#FFFFFF"
                stroke={color}
                strokeWidth={isSelected ? '1.5' : '1'}
                filter="url(#thread-glow)"
                className="transition-all duration-200"
              />
              <circle
                cx="-46"
                cy="0"
                r="3"
                fill={color}
                className={isSelected ? 'animate-pulse' : ''}
              />
              <text
                x="4"
                y="3.5"
                textAnchor="middle"
                fontSize="9"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="700"
                fill={color}
                letterSpacing="0.06em"
              >
                {isVerified ? 'VERIFIED INCIDENT' : `AI CANDIDATE • ${confidencePercent}%`}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};

