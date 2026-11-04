import React, { useRef, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CitySignal } from './types';
import { REPORT_CATEGORIES } from '../../theme/tokens';

interface SignalMarkerProps {
  signal: CitySignal;
  isSelected: boolean;
  onSelect: (signal: CitySignal) => void;
}

// Shared geometries across all signal beacons
const SHARED_SHAFT_GEO = new THREE.CylinderGeometry(0.02, 0.035, 1.3, 6);
const SHARED_CORE_SPHERE = new THREE.SphereGeometry(0.22, 14, 14);
const SHARED_INNER_RING = new THREE.RingGeometry(0.34, 0.42, 24);
const SHARED_OUTER_RING = new THREE.RingGeometry(0.55, 0.62, 24);

export const SignalMarker: React.FC<SignalMarkerProps> = memo(({
  signal,
  isSelected,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const categoryMeta = REPORT_CATEGORIES[signal.category] || REPORT_CATEGORIES.public_infrastructure;
  const markerColor = categoryMeta.color;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Harmonic floating bob
    groupRef.current.position.y =
      signal.position[1] + Math.sin(t * 2.5 + signal.position[0]) * 0.12;

    // Counter-rotating rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 1.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 1.0;
    }
  });

  const active = isSelected || hovered;
  const scale = isSelected ? 1.4 : hovered ? 1.2 : 1.0;

  return (
    <group
      ref={groupRef}
      position={signal.position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(signal);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Vertical Light Shaft */}
      <mesh
        geometry={SHARED_SHAFT_GEO}
        position={[0, -0.65, 0]}
      >
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={active ? 0.9 : 0.6}
        />
      </mesh>

      {/* 2. Floating Luminous Core Sphere */}
      <mesh
        geometry={SHARED_CORE_SPHERE}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={isSelected ? 1.0 : hovered ? 0.7 : 0.4}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* 3. Inner Ring */}
      <mesh
        ref={ring1Ref}
        geometry={SHARED_INNER_RING}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={active ? 0.85 : 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Outer Ring */}
      <mesh
        ref={ring2Ref}
        geometry={SHARED_OUTER_RING}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={active ? 0.6 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
});

SignalMarker.displayName = 'SignalMarker';
