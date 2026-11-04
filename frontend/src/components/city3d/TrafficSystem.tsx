import React, { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerformanceSettings } from '../../utils/performance';

interface VehicleState {
  axis: 'x' | 'z';
  laneOffset: number;
  dir: 1 | -1;
  speed: number;
  progress: number;
  color: string;
}

// Shared static geometries & materials
const CHASSIS_GEO = new THREE.BoxGeometry(0.22, 0.12, 0.42);
const ROOF_GEO = new THREE.BoxGeometry(0.08, 0.03, 0.28);
const LIGHT_GEO = new THREE.SphereGeometry(0.025, 6, 6);

const CHASSIS_MAT = new THREE.MeshStandardMaterial({
  color: '#FFFFFF',
  metalness: 0.6,
  roughness: 0.25,
});
const HEADLIGHT_MAT = new THREE.MeshBasicMaterial({ color: '#00F2FE' });
const TAILLIGHT_MAT = new THREE.MeshBasicMaterial({ color: '#EF4444' });

const ROOF_MATS: Record<string, THREE.MeshBasicMaterial> = {
  '#0D9488': new THREE.MeshBasicMaterial({ color: '#0D9488' }),
  '#06B6D4': new THREE.MeshBasicMaterial({ color: '#06B6D4' }),
  '#3B82F6': new THREE.MeshBasicMaterial({ color: '#3B82F6' }),
  '#0284C7': new THREE.MeshBasicMaterial({ color: '#0284C7' }),
};

export const TrafficSystem: React.FC = memo(() => {
  const { maxVehicles, isTabVisible } = usePerformanceSettings();

  const allVehicles = useMemo<VehicleState[]>(() => [
    { axis: 'x', laneOffset: 0.55, dir: 1, speed: 2.2, progress: 0, color: '#0D9488' },
    { axis: 'x', laneOffset: 0.55, dir: 1, speed: 2.6, progress: 5.5, color: '#06B6D4' },
    { axis: 'x', laneOffset: 0.55, dir: 1, speed: 2.0, progress: 11, color: '#3B82F6' },
    { axis: 'x', laneOffset: -0.55, dir: -1, speed: 2.4, progress: 2, color: '#0284C7' },
    { axis: 'x', laneOffset: -0.55, dir: -1, speed: 2.8, progress: 8, color: '#0D9488' },
    { axis: 'z', laneOffset: 0.55, dir: 1, speed: 2.1, progress: 1.5, color: '#06B6D4' },
    { axis: 'z', laneOffset: 0.55, dir: 1, speed: 2.5, progress: 7, color: '#3B82F6' },
    { axis: 'z', laneOffset: -0.55, dir: -1, speed: 2.3, progress: 3.5, color: '#0D9488' },
    { axis: 'z', laneOffset: -0.55, dir: -1, speed: 2.7, progress: 9.5, color: '#0284C7' },
  ], []);

  // Filter vehicles according to performance tier
  const activeVehicles = useMemo(
    () => allVehicles.slice(0, maxVehicles),
    [allVehicles, maxVehicles]
  );

  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    if (!isTabVisible) return;
    const clampedDelta = Math.min(delta, 0.08);
    const range = 18;

    for (let i = 0; i < activeVehicles.length; i++) {
      const veh = activeVehicles[i];
      const grp = groupRefs.current[i];
      if (!grp) continue;

      veh.progress = (veh.progress + clampedDelta * veh.speed) % range;
      const pos = (veh.progress - range / 2) * veh.dir;

      if (veh.axis === 'x') {
        grp.position.set(pos, 0.08, veh.laneOffset);
        grp.rotation.set(0, veh.dir === 1 ? Math.PI / 2 : -Math.PI / 2, 0);
      } else {
        grp.position.set(veh.laneOffset, 0.08, pos);
        grp.rotation.set(0, veh.dir === 1 ? 0 : Math.PI, 0);
      }
    }
  });

  return (
    <group>
      {activeVehicles.map((veh, i) => (
        <group
          key={`vehicle-${i}`}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          {/* Chassis */}
          <mesh
            geometry={CHASSIS_GEO}
            material={CHASSIS_MAT}
            position={[0, 0.08, 0]}
          />

          {/* Roof Strip */}
          <mesh
            geometry={ROOF_GEO}
            material={ROOF_MATS[veh.color] || ROOF_MATS['#0D9488']}
            position={[0, 0.15, 0]}
          />

          {/* Headlights */}
          <mesh geometry={LIGHT_GEO} material={HEADLIGHT_MAT} position={[0.07, 0.08, 0.215]} />
          <mesh geometry={LIGHT_GEO} material={HEADLIGHT_MAT} position={[-0.07, 0.08, 0.215]} />

          {/* Taillights */}
          <mesh geometry={LIGHT_GEO} material={TAILLIGHT_MAT} position={[0.07, 0.08, -0.215]} />
          <mesh geometry={LIGHT_GEO} material={TAILLIGHT_MAT} position={[-0.07, 0.08, -0.215]} />
        </group>
      ))}
    </group>
  );
});

TrafficSystem.displayName = 'TrafficSystem';
