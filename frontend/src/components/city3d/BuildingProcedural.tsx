import React, { memo } from 'react';
import * as THREE from 'three';

export interface BuildingSpec {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  type: 'tower' | 'stepped' | 'civic' | 'spire' | 'block';
  color: string;
  roofColor: string;
  hasSpire?: boolean;
  hasHeliPad?: boolean;
}

interface BuildingProceduralProps {
  spec: BuildingSpec;
  isDistrictHovered?: boolean;
}

// 1. Singleton Shared Geometries (One unit geometry scaled via mesh transform = zero allocations)
const SHARED_UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const SHARED_UNIT_PLANE = new THREE.PlaneGeometry(1, 1);
const SHARED_SPIRE_GEO = new THREE.CylinderGeometry(0.015, 0.035, 0.9, 6);
const SHARED_ROOF_GEO = new THREE.BoxGeometry(1, 1, 1);

// 2. Singleton Shared Materials Palette
const MATERIAL_CACHE = new Map<string, THREE.MeshStandardMaterial>();
const getBuildingMaterial = (color: string): THREE.MeshStandardMaterial => {
  let mat = MATERIAL_CACHE.get(color);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.28,
      metalness: 0.06,
    });
    MATERIAL_CACHE.set(color, mat);
  }
  return mat;
};

const ROOF_MATERIAL_CACHE = new Map<string, THREE.MeshStandardMaterial>();
const getRoofMaterial = (color: string): THREE.MeshStandardMaterial => {
  let mat = ROOF_MATERIAL_CACHE.get(color);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
    });
    ROOF_MATERIAL_CACHE.set(color, mat);
  }
  return mat;
};

const HOVERED_BUILDING_MAT = new THREE.MeshStandardMaterial({
  color: '#FFFFFF',
  roughness: 0.2,
  metalness: 0.1,
  emissive: '#0D9488',
  emissiveIntensity: 0.08,
});

const FACADE_NS_MAT = new THREE.MeshBasicMaterial({
  color: '#0284C7',
  transparent: true,
  opacity: 0.12,
  side: THREE.DoubleSide,
});

const FACADE_EW_MAT = new THREE.MeshBasicMaterial({
  color: '#06B6D4',
  transparent: true,
  opacity: 0.12,
  side: THREE.DoubleSide,
});

const SPIRE_MAT = new THREE.MeshStandardMaterial({
  color: '#64748B',
  metalness: 0.75,
  roughness: 0.25,
});

export const BuildingProcedural: React.FC<BuildingProceduralProps> = memo(({
  spec,
  isDistrictHovered = false,
}) => {
  const [w, h, d] = spec.size;
  const [x, y, z] = spec.position;

  const bodyMaterial = isDistrictHovered
    ? HOVERED_BUILDING_MAT
    : getBuildingMaterial(spec.color);
  const roofMaterial = getRoofMaterial(spec.roofColor);

  return (
    <group position={[x, y, z]}>
      {/* Main Building Body */}
      <mesh
        geometry={SHARED_UNIT_BOX}
        material={bodyMaterial}
        scale={[w, h, d]}
        castShadow
        receiveShadow
      />

      {/* Glass Curtain Facades (North/South) */}
      <mesh
        geometry={SHARED_UNIT_PLANE}
        material={FACADE_NS_MAT}
        position={[0, 0, d / 2 + 0.005]}
        scale={[w * 0.82, h * 0.88, 1]}
      />
      <mesh
        geometry={SHARED_UNIT_PLANE}
        material={FACADE_NS_MAT}
        position={[0, 0, -d / 2 - 0.005]}
        scale={[w * 0.82, h * 0.88, 1]}
      />

      {/* Glass Curtain Facades (East/West) */}
      <mesh
        geometry={SHARED_UNIT_PLANE}
        material={FACADE_EW_MAT}
        rotation={[0, Math.PI / 2, 0]}
        position={[w / 2 + 0.005, 0, 0]}
        scale={[d * 0.82, h * 0.88, 1]}
      />
      <mesh
        geometry={SHARED_UNIT_PLANE}
        material={FACADE_EW_MAT}
        rotation={[0, Math.PI / 2, 0]}
        position={[-w / 2 - 0.005, 0, 0]}
        scale={[d * 0.82, h * 0.88, 1]}
      />

      {/* Stepped Upper Tier (if tall tower) */}
      {spec.type === 'stepped' && (
        <mesh
          geometry={SHARED_UNIT_BOX}
          material={roofMaterial}
          position={[0, h / 2 + 0.35, 0]}
          scale={[w * 0.65, 0.7, d * 0.65]}
          castShadow
        />
      )}

      {/* Rooftop Utility Block */}
      <mesh
        geometry={SHARED_ROOF_GEO}
        material={roofMaterial}
        position={[0, h / 2 + 0.1, 0]}
        scale={[w * 0.45, 0.2, d * 0.45]}
      />

      {/* Rooftop Antenna Spire */}
      {spec.hasSpire && (
        <mesh
          geometry={SHARED_SPIRE_GEO}
          material={SPIRE_MAT}
          position={[0, h / 2 + 0.65, 0]}
        />
      )}
    </group>
  );
});

BuildingProcedural.displayName = 'BuildingProcedural';
