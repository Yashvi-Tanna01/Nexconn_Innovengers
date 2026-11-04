import React, { useMemo, memo } from 'react';
import * as THREE from 'three';
import { BuildingProcedural, BuildingSpec } from './BuildingProcedural';
import { CityStreets } from './CityStreets';
import { TrafficSystem } from './TrafficSystem';
import { DistrictZones } from './DistrictZones';
import { SignalMarker } from './SignalMarker';
import { CandidateLink } from './CandidateLink';
import { CitySignal, District } from './types';
import { usePerformanceSettings } from '../../utils/performance';

interface CityEnvironmentProps {
  signals: CitySignal[];
  selectedSignal: CitySignal | null;
  selectedDistrict: District | null;
  hoveredDistrict: District | null;
  onSelectSignal: (signal: CitySignal) => void;
  onSelectDistrict: (district: District) => void;
  onHoverDistrict: (district: District | null) => void;
}

export const CityEnvironment: React.FC<CityEnvironmentProps> = memo(({
  signals,
  selectedSignal,
  selectedDistrict,
  hoveredDistrict,
  onSelectSignal,
  onSelectDistrict,
  onHoverDistrict,
}) => {
  const { enableShadows, maxBuildingDensity } = usePerformanceSettings();

  // Generate deterministic architectural specs
  const buildingSpecs = useMemo<BuildingSpec[]>(() => {
    const list: BuildingSpec[] = [];
    const colors = ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#FFFFFF', '#EDEBE4'];
    const roofColors = ['#94A3B8', '#64748B', '#CBD5E1', '#475569'];
    let id = 1;

    // 4 major urban city quadrants
    const sectors = [
      { minX: -6.4, maxX: -1.3, minZ: -6.4, maxZ: -1.3, code: 'OVP' },
      { minX: 1.3, maxX: 6.4, minZ: -6.4, maxZ: -1.3, code: 'IND' },
      { minX: -6.4, maxX: -1.3, minZ: 1.3, maxZ: 6.4, code: 'SEC' },
      { minX: 1.3, maxX: 6.4, minZ: 1.3, maxZ: 6.4, code: 'MET' },
    ];

    sectors.forEach((sec) => {
      for (let x = sec.minX + 0.65; x <= sec.maxX - 0.65; x += 1.45) {
        for (let z = sec.minZ + 0.65; z <= sec.maxZ - 0.65; z += 1.45) {
          if (Math.abs(x) < 2.6 && Math.abs(z) < 2.6 && id % 3 === 0) continue;

          const hash = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
          const rand = Math.abs(hash - Math.floor(hash));

          const height = 0.9 + rand * 3.4;
          const width = 0.88 + rand * 0.25;
          const depth = 0.88 + (1 - rand) * 0.25;

          const type: BuildingSpec['type'] =
            height > 3.2 ? 'spire' : height > 2.2 ? 'stepped' : height > 1.4 ? 'tower' : 'block';

          list.push({
            id: id++,
            position: [x, height / 2, z],
            size: [width, height, depth],
            type,
            color: colors[Math.floor(rand * colors.length)],
            roofColor: roofColors[Math.floor((1 - rand) * roofColors.length)],
            hasSpire: type === 'spire' || (rand > 0.8 && height > 2.0),
            hasHeliPad: rand > 0.85 && height > 2.4,
          });
        }
      }
    });

    return list.slice(0, maxBuildingDensity);
  }, [maxBuildingDensity]);

  // Find candidate connection pair
  const candidatePair = useMemo(() => {
    const s1 = signals.find((s) => s.id === 'SIG-802');
    const s2 = signals.find((s) => s.id === 'SIG-805');
    if (s1 && s2) {
      return { start: s1.position, end: s2.position, confidence: 0.94 };
    }
    return null;
  }, [signals]);

  return (
    <group>
      {/* 1. Atmospheric Fog */}
      <fog attach="fog" args={['#F8F9FA', 13, 26]} />

      {/* 2. Volumetric Lighting System */}
      <ambientLight intensity={0.95} color="#FFFFFF" />
      <directionalLight
        position={[12, 20, 14]}
        intensity={1.5}
        color="#FFFDF7"
        castShadow={enableShadows}
        shadow-mapSize-width={enableShadows ? 1024 : 512}
        shadow-mapSize-height={enableShadows ? 1024 : 512}
        shadow-camera-near={10}
        shadow-camera-far={45}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-12, 8, -12]} intensity={0.45} color="#E0F2FE" />
      <hemisphereLight args={['#FFFFFF', '#E2E8F0', 0.5]} />

      {/* 3. District Zones */}
      <DistrictZones
        selectedDistrict={selectedDistrict}
        hoveredDistrict={hoveredDistrict}
        onSelectDistrict={onSelectDistrict}
        onHoverDistrict={onHoverDistrict}
      />

      {/* 4. Detailed Streets, Crosswalks, and Plazas */}
      <CityStreets />

      {/* 5. Autonomous Traffic System */}
      <TrafficSystem />

      {/* 6. Procedural Architecture */}
      {buildingSpecs.map((spec) => (
        <BuildingProcedural
          key={`bldg-${spec.id}`}
          spec={spec}
          isDistrictHovered={
            Boolean(
              hoveredDistrict &&
                spec.position[0] >= hoveredDistrict.bounds.minX &&
                spec.position[0] <= hoveredDistrict.bounds.maxX &&
                spec.position[2] >= hoveredDistrict.bounds.minZ &&
                spec.position[2] <= hoveredDistrict.bounds.maxZ
            )
          }
        />
      ))}

      {/* 7. Floating Civic Signal Beacons */}
      {signals.map((sig) => (
        <SignalMarker
          key={sig.id}
          signal={sig}
          isSelected={selectedSignal?.id === sig.id}
          onSelect={onSelectSignal}
        />
      ))}

      {/* 8. Candidate AI Pattern Neural Arc */}
      {candidatePair && (
        <CandidateLink
          start={candidatePair.start}
          end={candidatePair.end}
          confidenceScore={candidatePair.confidence}
          isActive={
            selectedSignal?.id === 'SIG-802' ||
            selectedSignal?.id === 'SIG-805' ||
            !selectedSignal
          }
        />
      )}
    </group>
  );
});

CityEnvironment.displayName = 'CityEnvironment';
