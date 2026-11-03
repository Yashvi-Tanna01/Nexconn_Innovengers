import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SignalMarker } from './SignalMarker';
import { CandidateLink } from './CandidateLink';
import { CitySignal } from './types';

interface CityEnvironmentProps {
  signals: CitySignal[];
  selectedSignal: CitySignal | null;
  onSelectSignal: (signal: CitySignal) => void;
}

interface BuildingData {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  hasRoofFeature?: boolean;
}

interface TrafficPulse {
  roadIndex: number;
  direction: 1 | -1;
  speed: number;
  offset: number;
  color: string;
}

export const CityEnvironment: React.FC<CityEnvironmentProps> = ({
  signals,
  selectedSignal,
  onSelectSignal,
}) => {
  // Generate deterministic procedural city buildings
  const buildings = useMemo<BuildingData[]>(() => {
    const list: BuildingData[] = [];
    const colors = ['#FFFFFF', '#F8F9FA', '#F1F5F9', '#EDF2F7', '#E2E8F0'];
    let id = 1;

    // 4 major city quadrants with central avenues
    const quadrants = [
      { minX: -6.5, maxX: -1.2, minZ: -6.5, maxZ: -1.2 },
      { minX: 1.2, maxX: 6.5, minZ: -6.5, maxZ: -1.2 },
      { minX: -6.5, maxX: -1.2, minZ: 1.2, maxZ: 6.5 },
      { minX: 1.2, maxX: 6.5, minZ: 1.2, maxZ: 6.5 },
    ];

    quadrants.forEach((quad) => {
      for (let x = quad.minX + 0.6; x <= quad.maxX - 0.6; x += 1.4) {
        for (let z = quad.minZ + 0.6; z <= quad.maxZ - 0.6; z += 1.4) {
          // Leave some pockets for civic parks / plazas
          if ((Math.abs(x) < 2.5 && Math.abs(z) < 2.5) && (id % 3 === 0)) continue;

          // Pseudorandom height based on coordinates
          const pseudoRand = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
          const rand = Math.abs(pseudoRand - Math.floor(pseudoRand));
          const height = 0.8 + rand * 2.8;
          const width = 0.85 + (rand * 0.3);
          const depth = 0.85 + ((1 - rand) * 0.3);
          const color = colors[Math.floor(rand * colors.length)];

          list.push({
            id: id++,
            position: [x, height / 2, z],
            size: [width, height, depth],
            color,
            hasRoofFeature: height > 2.0,
          });
        }
      }
    });

    return list;
  }, []);

  // Moving light trails (simulated civic traffic and energy flow)
  const trafficPulses = useMemo<TrafficPulse[]>(() => [
    { roadIndex: 0, direction: 1, speed: 1.8, offset: 0, color: '#0D9488' },
    { roadIndex: 0, direction: -1, speed: 2.2, offset: 3, color: '#06B6D4' },
    { roadIndex: 1, direction: 1, speed: 1.5, offset: 1.5, color: '#0D9488' },
    { roadIndex: 1, direction: -1, speed: 2.0, offset: 4.5, color: '#06B6D4' },
    { roadIndex: 2, direction: 1, speed: 1.6, offset: 2, color: '#0D9488' },
    { roadIndex: 3, direction: -1, speed: 1.9, offset: 3.5, color: '#06B6D4' },
  ], []);

  const trafficRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    trafficPulses.forEach((pulse, idx) => {
      const mesh = trafficRefs.current[idx];
      if (!mesh) return;

      // Animate along grid roads
      const t = ((time * pulse.speed + pulse.offset) % 14) - 7;
      if (pulse.roadIndex === 0) {
        mesh.position.set(t * pulse.direction, 0.05, 0.3);
      } else if (pulse.roadIndex === 1) {
        mesh.position.set(-0.3, 0.05, t * pulse.direction);
      } else if (pulse.roadIndex === 2) {
        mesh.position.set(t * pulse.direction, 0.05, -0.3);
      } else {
        mesh.position.set(0.3, 0.05, t * pulse.direction);
      }
    });
  });

  // Find candidate pair
  const candidatePair = useMemo(() => {
    const sig1 = signals.find((s) => s.id === 'SIG-802');
    const sig2 = signals.find((s) => s.id === 'SIG-805');
    if (sig1 && sig2) {
      return { start: sig1.position, end: sig2.position };
    }
    return null;
  }, [signals]);

  return (
    <group>
      {/* Lighting System: Crisp, warm civic illumination */}
      <ambientLight intensity={0.9} color="#FFFFFF" />
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.4}
        color="#FFFBF0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-10, 10, -10]}
        intensity={0.5}
        color="#E0F2FE"
      />

      {/* Ground Foundation Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#F4F4F0" roughness={0.8} />
      </mesh>

      {/* Primary Civic Street Grid */}
      {/* Central East-West Boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[16, 1.8]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>
      {/* Central North-South Avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1.8, 16]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>

      {/* Secondary Sector Roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 4.0]}>
        <planeGeometry args={[14, 0.8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -4.0]}>
        <planeGeometry args={[14, 0.8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.0, 0.008, 0]}>
        <planeGeometry args={[0.8, 14]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.0, 0.008, 0]}>
        <planeGeometry args={[0.8, 14]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.75} />
      </mesh>

      {/* Civic Parks / Green Plazas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, 0.012, -2.2]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshStandardMaterial color="#D1FAE5" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 0.012, 2.2]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshStandardMaterial color="#D1FAE5" roughness={0.9} />
      </mesh>

      {/* Stylized Park Trees */}
      {[-2.5, -1.9].map((tx) =>
        [-2.5, -1.9].map((tz) => (
          <group key={`tree-${tx}-${tz}`} position={[tx, 0, tz]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 0.5, 6]} />
              <meshStandardMaterial color="#94A3B8" />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
              <coneGeometry args={[0.22, 0.55, 6]} />
              <meshStandardMaterial color="#059669" roughness={0.6} />
            </mesh>
          </group>
        ))
      )}

      {/* Procedural Buildings */}
      {buildings.map((b) => (
        <group key={`bldg-${b.id}`} position={b.position}>
          {/* Main Building Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.3}
              metalness={0.05}
            />
          </mesh>

          {/* Roof Accent / HVAC or Water Tank */}
          {b.hasRoofFeature && (
            <mesh position={[0, b.size[1] / 2 + 0.1, 0]}>
              <boxGeometry args={[b.size[0] * 0.45, 0.2, b.size[2] * 0.45]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.5} />
            </mesh>
          )}

          {/* Subtle Window Glow Strip */}
          <mesh position={[0, 0, b.size[2] / 2 + 0.005]}>
            <planeGeometry args={[b.size[0] * 0.75, b.size[1] * 0.65]} />
            <meshBasicMaterial color="#E0F2FE" transparent opacity={0.35} />
          </mesh>
        </group>
      ))}

      {/* Animated Traffic Light Trails */}
      {trafficPulses.map((pulse, idx) => (
        <mesh
          key={`traffic-${idx}`}
          ref={(el) => {
            trafficRefs.current[idx] = el;
          }}
          position={[0, 0.05, 0]}
        >
          <boxGeometry args={[0.25, 0.06, 0.12]} />
          <meshBasicMaterial color={pulse.color} />
        </mesh>
      ))}

      {/* Floating Civic Signals */}
      {signals.map((sig) => (
        <SignalMarker
          key={sig.id}
          signal={sig}
          isSelected={selectedSignal?.id === sig.id}
          onSelect={onSelectSignal}
        />
      ))}

      {/* Candidate Pattern Connection Arc */}
      {candidatePair && (
        <CandidateLink
          start={candidatePair.start}
          end={candidatePair.end}
          isActive={
            selectedSignal?.id === 'SIG-802' || selectedSignal?.id === 'SIG-805'
          }
        />
      )}
    </group>
  );
};

