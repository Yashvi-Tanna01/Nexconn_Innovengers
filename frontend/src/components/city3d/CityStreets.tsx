import React, { memo } from 'react';
import * as THREE from 'three';

// Shared geometries and materials for zero-allocation street grid
const SHARED_PLANE = new THREE.PlaneGeometry(1, 1);

const GROUND_MAT = new THREE.MeshStandardMaterial({
  color: '#F4F4F0',
  roughness: 0.85,
  metalness: 0.02,
});

const TARMAC_PRIMARY_MAT = new THREE.MeshStandardMaterial({
  color: '#1E293B',
  roughness: 0.65,
});

const TARMAC_SECONDARY_MAT = new THREE.MeshStandardMaterial({
  color: '#334155',
  roughness: 0.7,
});

const INTERSECTION_MAT = new THREE.MeshStandardMaterial({
  color: '#0F172A',
  roughness: 0.6,
});

const WHITE_MARKING_MAT = new THREE.MeshBasicMaterial({
  color: '#FFFFFF',
  transparent: true,
  opacity: 0.85,
});

const CROSSWALK_MAT = new THREE.MeshBasicMaterial({
  color: '#E2E8F0',
});

const SIDEWALK_MAT = new THREE.MeshStandardMaterial({
  color: '#E2E8F0',
  roughness: 0.8,
});

export const CityStreets: React.FC = memo(() => {
  const dashPositions = [-7, -5, -3, 3, 5, 7];
  const crosswalkOffsets = [-0.8, -0.4, 0, 0.4, 0.8];

  return (
    <group>
      {/* 1. Main Ground Base Matrix */}
      <mesh
        geometry={SHARED_PLANE}
        material={GROUND_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        scale={[22, 22, 1]}
        receiveShadow
      />

      {/* 2. Primary Arterial Boulevards */}
      {/* East-West Arterial Avenue */}
      <mesh
        geometry={SHARED_PLANE}
        material={TARMAC_PRIMARY_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.008, 0]}
        scale={[18, 2.2, 1]}
        receiveShadow
      />

      {/* North-South Arterial Avenue */}
      <mesh
        geometry={SHARED_PLANE}
        material={TARMAC_PRIMARY_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.008, 0]}
        scale={[2.2, 18, 1]}
        receiveShadow
      />

      {/* Central Intersection Plaza */}
      <mesh
        geometry={SHARED_PLANE}
        material={INTERSECTION_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 0]}
        scale={[2.2, 2.2, 1]}
      />

      {/* Secondary Sector Access Streets */}
      <mesh
        geometry={SHARED_PLANE}
        material={TARMAC_SECONDARY_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.006, 4.2]}
        scale={[16, 1.2, 1]}
      />
      <mesh
        geometry={SHARED_PLANE}
        material={TARMAC_SECONDARY_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.006, -4.2]}
        scale={[16, 1.2, 1]}
      />
      <mesh
        geometry={SHARED_PLANE}
        material={TARMAC_SECONDARY_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[4.2, 0.006, 0]}
        scale={[1.2, 16, 1]}
      />
      <mesh
        geometry={SHARED_PLANE}
        material={TARMAC_SECONDARY_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-4.2, 0.006, 0]}
        scale={[1.2, 16, 1]}
      />

      {/* 3. Luminous Road Markings */}
      {dashPositions.map((x) => (
        <mesh
          key={`ew-dash-${x}`}
          geometry={SHARED_PLANE}
          material={WHITE_MARKING_MAT}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.015, 0]}
          scale={[0.9, 0.08, 1]}
        />
      ))}

      {dashPositions.map((z) => (
        <mesh
          key={`ns-dash-${z}`}
          geometry={SHARED_PLANE}
          material={WHITE_MARKING_MAT}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.015, z]}
          scale={[0.08, 0.9, 1]}
        />
      ))}

      {/* Crosswalk Zebra Strips at Central Hub */}
      {crosswalkOffsets.map((offset) => (
        <React.Fragment key={`crosswalk-${offset}`}>
          <mesh
            geometry={SHARED_PLANE}
            material={CROSSWALK_MAT}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[offset, 0.015, 1.3]}
            scale={[0.15, 0.35, 1]}
          />
          <mesh
            geometry={SHARED_PLANE}
            material={CROSSWALK_MAT}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[offset, 0.015, -1.3]}
            scale={[0.15, 0.35, 1]}
          />
          <mesh
            geometry={SHARED_PLANE}
            material={CROSSWALK_MAT}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[1.3, 0.015, offset]}
            scale={[0.35, 0.15, 1]}
          />
          <mesh
            geometry={SHARED_PLANE}
            material={CROSSWALK_MAT}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-1.3, 0.015, offset]}
            scale={[0.35, 0.15, 1]}
          />
        </React.Fragment>
      ))}

      {/* 4. Sidewalk Curbs */}
      <mesh
        geometry={SHARED_PLANE}
        material={SIDEWALK_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-2.9, 0.016, 2.9]}
        scale={[3.4, 3.4, 1]}
      />
      <mesh
        geometry={SHARED_PLANE}
        material={SIDEWALK_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[2.9, 0.016, 2.9]}
        scale={[3.4, 3.4, 1]}
      />
      <mesh
        geometry={SHARED_PLANE}
        material={SIDEWALK_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-2.9, 0.016, -2.9]}
        scale={[3.4, 3.4, 1]}
      />
      <mesh
        geometry={SHARED_PLANE}
        material={SIDEWALK_MAT}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[2.9, 0.016, -2.9]}
        scale={[3.4, 3.4, 1]}
      />
    </group>
  );
});

CityStreets.displayName = 'CityStreets';
