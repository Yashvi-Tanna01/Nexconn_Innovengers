import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CitySignal } from './types';
import { REPORT_CATEGORIES } from '../../theme/tokens';

interface SignalMarkerProps {
  signal: CitySignal;
  isSelected: boolean;
  onSelect: (signal: CitySignal) => void;
}

export const SignalMarker: React.FC<SignalMarkerProps> = ({
  signal,
  isSelected,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const categoryMeta = REPORT_CATEGORIES[signal.category] || REPORT_CATEGORIES.public_infrastructure;
  const markerColor = categoryMeta.color;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Gentle bobbing motion
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = signal.position[1] + Math.sin(t * 2.5 + signal.position[0]) * 0.12;

    // Rotate pulsing ring
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
      const pulseScale = 1 + Math.sin(t * 3) * 0.18;
      ringRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });

  const scale = isSelected ? 1.4 : hovered ? 1.25 : 1.0;

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
      {/* Vertical Signal Beam Stem */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={hovered || isSelected ? 0.9 : 0.6}
        />
      </mesh>

      {/* Floating Signal Core Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Rotating Pulse Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0.32, 0.38, 32]} />
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={isSelected ? 0.85 : hovered ? 0.7 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Secondary Outer Radar Ring for candidate suggestions */}
      {signal.status === 'candidate_pattern' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <ringGeometry args={[0.48, 0.52, 24]} />
          <meshBasicMaterial
            color="#D97706" // Amber highlight for candidate patterns
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Soft Ground Beacon Point Light */}
      <pointLight
        color={markerColor}
        intensity={isSelected ? 1.2 : hovered ? 0.8 : 0.4}
        distance={3.5}
        decay={2}
      />
    </group>
  );
};

