import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'core' | 'signal';
  severity?: 'critical' | 'high' | 'medium';
  telemetry: string;
  metricLabel: string;
  metricValue: string;
}

interface EdgeData {
  id: string;
  from: number;
  to: number;
}

interface PatternNeuralGraphProps {
  clusterId: number | string;
  clusterTitle: string;
  confidenceScore: number;
  className?: string;
}

export const PatternNeuralGraph: React.FC<PatternNeuralGraphProps> = ({
  clusterId,
  clusterTitle,
  confidenceScore,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number | null>(null);

  // Initial node definitions
  const initialNodes: NodeData[] = useMemo(() => [
    {
      id: `core-${clusterId}`,
      label: 'Correlation Hub',
      sublabel: `Cluster #${clusterId}`,
      baseX: 200,
      baseY: 105,
      x: 200,
      y: 105,
      vx: 0,
      vy: 0,
      type: 'core',
      telemetry: `${Math.round(confidenceScore * 100)}% Confidence Correlation Match`,
      metricLabel: 'Neural Confidence',
      metricValue: `${Math.round(confidenceScore * 100)}%`,
    },
    {
      id: 'sig-pressure',
      label: 'Pressure Drop',
      sublabel: 'Potable Trunk #14',
      baseX: 68,
      baseY: 48,
      x: 68,
      y: 48,
      vx: 0,
      vy: 0,
      type: 'signal',
      severity: 'critical',
      telemetry: 'ΔP -2.4 bar pressure loss detected across main conduit junction',
      metricLabel: 'Hydraulic Delta',
      metricValue: '-2.4 bar',
    },
    {
      id: 'sig-runoff',
      label: 'Surface Runoff',
      sublabel: 'Crossroad 7',
      baseX: 332,
      baseY: 52,
      x: 332,
      y: 52,
      vx: 0,
      vy: 0,
      type: 'signal',
      severity: 'high',
      telemetry: 'Superficial flooding reported adjacent to sector drainage catch-basin',
      metricLabel: 'Flow Volume',
      metricValue: '~18 L/min',
    },
    {
      id: 'sig-shear',
      label: 'Pavement Shear',
      sublabel: 'Sector 3 Quad',
      baseX: 88,
      baseY: 162,
      x: 88,
      y: 162,
      vx: 0,
      vy: 0,
      type: 'signal',
      severity: 'high',
      telemetry: 'Sub-base soil displacement causing 4.2cm asphalt fault depression',
      metricLabel: 'Depression',
      metricValue: '-4.2 cm',
    },
    {
      id: 'sig-acoustic',
      label: 'Acoustic Telemetry',
      sublabel: 'Sensor Grid #88',
      baseX: 312,
      baseY: 158,
      x: 312,
      y: 158,
      vx: 0,
      vy: 0,
      type: 'signal',
      severity: 'medium',
      telemetry: 'Ultrasonic pipe vibration signature matches continuous subterranean rupture',
      metricLabel: 'Frequency',
      metricValue: '420 Hz',
    },
  ], [clusterId, confidenceScore]);

  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
  const [impulseKey, setImpulseKey] = useState<number>(0);
  const draggingRef = useRef<{ index: number; startX: number; startY: number } | null>(null);

  // Interconnected synaptic conduits
  const edges: EdgeData[] = useMemo(() => [
    { id: 'e-core-pressure', from: 0, to: 1 },
    { id: 'e-core-runoff', from: 0, to: 2 },
    { id: 'e-core-shear', from: 0, to: 3 },
    { id: 'e-core-acoustic', from: 0, to: 4 },
    { id: 'e-pressure-shear', from: 1, to: 3 },
    { id: 'e-runoff-acoustic', from: 2, to: 4 },
  ], []);

  // Real Spring Physics Animation Loop
  useEffect(() => {
    if (shouldReduceMotion) return;

    let lastTime = performance.now();

    const updatePhysics = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      setNodes((prevNodes) => {
        let hasMotion = false;
        const updated = prevNodes.map((node, i) => {
          // If being dragged, don't apply physics
          if (draggingRef.current && draggingRef.current.index === i) {
            return node;
          }

          // Spring force back to base position
          const k = 14.0; // Spring stiffness
          const damping = 4.5; // Damping factor

          const fx = (node.baseX - node.x) * k - node.vx * damping;
          const fy = (node.baseY - node.y) * k - node.vy * damping;

          const nvx = node.vx + fx * dt;
          const nvy = node.vy + fy * dt;
          const nx = node.x + nvx * dt;
          const ny = node.y + nvy * dt;

          if (Math.abs(nvx) > 0.05 || Math.abs(nvy) > 0.05 || Math.abs(nx - node.baseX) > 0.1) {
            hasMotion = true;
          }

          return {
            ...node,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
          };
        });

        return hasMotion || draggingRef.current !== null ? updated : prevNodes;
      });

      animRef.current = requestAnimationFrame(updatePhysics);
    };

    animRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [shouldReduceMotion]);

  // Pointer drag event handlers for node interaction
  const getSvgCoordinates = useCallback((e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 220 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDownNode = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedNodeIndex(index);
    setImpulseKey((prev) => prev + 1); // Trigger synaptic transmission wave
    draggingRef.current = { index, startX: e.clientX, startY: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveSvg = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const coords = getSvgCoordinates(e);
    if (!coords) return;

    const dragIdx = draggingRef.current.index;
    setNodes((prev) =>
      prev.map((node, i) =>
        i === dragIdx
          ? { ...node, x: Math.max(20, Math.min(380, coords.x)), y: Math.max(20, Math.min(200, coords.y)), vx: 0, vy: 0 }
          : node
      )
    );
  };

  const handlePointerUpSvg = () => {
    draggingRef.current = null;
  };

  const selectedNode = nodes[selectedNodeIndex] || nodes[0];

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-[#E3E8E4] bg-gradient-to-b from-[#FBFBF9] via-[#FAF8F3] to-[#F5F6F4] p-4 select-none shadow-xs ${className}`}
    >
      {/* Dynamic Ambient Background Illumination */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_45%,rgba(8,123,86,0.09)_0%,rgba(61,214,165,0.04)_45%,transparent_75%)]" />

      {/* Header Telemetry Status Bar */}
      <div className="relative z-10 flex items-center justify-between pb-2 mb-2 border-b border-[#E3E8E4]/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#087B56] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#087B56]" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#087B56]">
            Interactive Neural Mesh
          </span>
        </div>
        <div className="text-[10px] font-mono font-medium text-stone-500 flex items-center gap-2">
          <span>Click or drag nodes</span>
          <span className="text-stone-300">•</span>
          <span className="text-[#087B56] font-bold">Live Simulation</span>
        </div>
      </div>

      {/* Interactive SVG Neural Canvas */}
      <div className="relative w-full h-48 sm:h-56 touch-none">
        <svg
          ref={svgRef}
          viewBox="0 0 400 220"
          className="w-full h-full overflow-visible cursor-grab active:cursor-grabbing"
          onPointerMove={handlePointerMoveSvg}
          onPointerUp={handlePointerUpSvg}
          onPointerLeave={handlePointerUpSvg}
        >
          <defs>
            {/* Emerald to Gold Synaptic Line Gradient */}
            <linearGradient id="synapticConduit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#087B56" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#3DD6A5" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#F5C77D" stopOpacity="0.85" />
            </linearGradient>

            {/* Core Volumetric Glow */}
            <radialGradient id="hubHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3DD6A5" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#087B56" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#087B56" stopOpacity="0" />
            </radialGradient>

            <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3DD6A5" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. Synaptic Connection Lines */}
          {edges.map((edge) => {
            const source = nodes[edge.from];
            const target = nodes[edge.to];
            if (!source || !target) return null;

            // Curved quadratic Bezier path with dynamic tension
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.hypot(dx, dy) || 1;
            const curvature = Math.min(dist * 0.15, 25);
            const cx = midX - (dy / dist) * curvature;
            const cy = midY + (dx / dist) * curvature;
            const pathD = `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`;

            const isConnectedToSelected = edge.from === selectedNodeIndex || edge.to === selectedNodeIndex;

            return (
              <g key={edge.id}>
                {/* Conduit Background Shadow Track */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth={isConnectedToSelected ? '3' : '1.5'}
                  strokeDasharray="4 4"
                  opacity={0.6}
                />

                {/* Active Synaptic Illuminated Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#synapticConduit)"
                  strokeWidth={isConnectedToSelected ? '2.5' : '1.5'}
                  opacity={isConnectedToSelected ? 0.95 : 0.55}
                  filter={isConnectedToSelected ? 'url(#glowFilter)' : undefined}
                />

                {/* Continuous Synaptic Energy Particle Flow */}
                {!shouldReduceMotion && (
                  <circle r={isConnectedToSelected ? '3.5' : '2.2'} fill="#F5C77D" opacity="0.95">
                    <animateMotion
                      path={pathD}
                      dur={`${2.0 + (edge.from % 2) * 0.6}s`}
                      repeatCount="indefinite"
                      rotate="auto"
                    />
                  </circle>
                )}

                {/* Impulse Transmission Burst on Selection */}
                {isConnectedToSelected && !shouldReduceMotion && (
                  <circle key={`impulse-${impulseKey}-${edge.id}`} r="4.2" fill="#FFFFFF">
                    <animateMotion
                      path={pathD}
                      dur="0.65s"
                      repeatCount="1"
                      fill="freeze"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* 2. Interactive Nodes */}
          {nodes.map((node, i) => {
            const isSelected = selectedNodeIndex === i;
            const isCore = node.type === 'core';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-grab active:cursor-grabbing transition-transform"
                onPointerDown={(e) => handlePointerDownNode(i, e)}
              >
                {/* Selection Halo Ring */}
                {isSelected && (
                  <>
                    <circle
                      r={isCore ? 34 : 24}
                      fill="none"
                      stroke="#087B56"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                    <circle
                      r={isCore ? 26 : 18}
                      fill="none"
                      stroke="#F5C77D"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  </>
                )}

                {/* Core Radial Atmosphere */}
                {isCore && <circle r="36" fill="url(#hubHalo)" />}

                {/* Main Node Disc */}
                <circle
                  r={isCore ? 18 : 11}
                  fill={isCore ? '#087B56' : '#FFFFFF'}
                  stroke={
                    isCore
                      ? '#F5C77D'
                      : node.severity === 'critical'
                      ? '#DC2626'
                      : isSelected
                      ? '#087B56'
                      : '#3DD6A5'
                  }
                  strokeWidth={isCore ? 3 : 2.5}
                  className="shadow-sm"
                />

                {/* Center Core Pip */}
                {isCore ? (
                  <circle r="6" fill="#FFFFFF" />
                ) : (
                  <circle
                    r="4"
                    fill={node.severity === 'critical' ? '#DC2626' : '#087B56'}
                    opacity={isSelected ? 1 : 0.75}
                  />
                )}

                {/* Node Text Label (Floating below) */}
                <text
                  y={isCore ? 30 : node.y > 110 ? 22 : -16}
                  textAnchor="middle"
                  className={`text-[9.5px] font-sans font-bold select-none ${
                    isSelected ? 'fill-[#087B56] font-extrabold' : isCore ? 'fill-[#202827]' : 'fill-[#475569]'
                  }`}
                >
                  {node.label}
                </text>
                <text
                  y={isCore ? 41 : node.y > 110 ? 32 : -7}
                  textAnchor="middle"
                  className="text-[8px] font-mono fill-[#737C78] select-none"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. Deep Telemetry Readout for Selected Focal Node */}
      <motion.div
        key={selectedNode.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-2 p-3 rounded-2xl bg-white border border-[#E3E8E4] flex items-center justify-between gap-3 shadow-2xs"
      >
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-[#087B56] border border-emerald-200">
              {selectedNode.label}
            </span>
            <span className="text-[10px] font-mono text-stone-500 truncate">
              {selectedNode.sublabel}
            </span>
          </div>
          <p className="text-[11px] text-[#202827] leading-snug truncate">
            {selectedNode.telemetry}
          </p>
        </div>

        <div className="shrink-0 text-right pl-2 border-l border-stone-100">
          <span className="text-[9px] font-mono text-stone-400 block uppercase">
            {selectedNode.metricLabel}
          </span>
          <span className="text-xs font-mono font-bold text-[#087B56]">
            {selectedNode.metricValue}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default PatternNeuralGraph;
