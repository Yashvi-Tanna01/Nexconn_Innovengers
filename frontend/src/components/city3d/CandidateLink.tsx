import React, { useMemo, useRef, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CandidateLinkProps {
  start: [number, number, number];
  end: [number, number, number];
  isActive?: boolean;
  confidenceScore?: number;
}

// Reusable static geometries, materials and vector registers
const PULSE_SPHERE_1 = new THREE.SphereGeometry(0.08, 10, 10);
const PULSE_SPHERE_2 = new THREE.SphereGeometry(0.06, 10, 10);
const AMBER_PULSE_MAT = new THREE.MeshBasicMaterial({ color: '#F59E0B' });
const CYAN_PULSE_MAT = new THREE.MeshBasicMaterial({ color: '#06B6D4' });

const TEMP_VEC_1 = new THREE.Vector3();
const TEMP_VEC_2 = new THREE.Vector3();

export const CandidateLink: React.FC<CandidateLinkProps> = memo(({
  start,
  end,
  isActive = true,
  confidenceScore = 0.94,
}) => {
  const pulse1Ref = useRef<THREE.Mesh>(null);
  const pulse2Ref = useRef<THREE.Mesh>(null);

  // Generate 3D quadratic bezier curve points & Three.js Line object
  const { curve, lineObject, outerGlowObject } = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    const midX = (vStart.x + vEnd.x) / 2;
    const midZ = (vStart.z + vEnd.z) / 2;
    const midY = Math.max(vStart.y, vEnd.y) + 1.4;
    const vMid = new THREE.Vector3(midX, midY, midZ);

    const quadCurve = new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd);
    const points = quadCurve.getPoints(36);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Primary Amber Line
    const material = new THREE.LineBasicMaterial({
      color: 0xD97706,
      transparent: true,
      opacity: isActive ? 0.9 : 0.4,
    });
    const line = new THREE.Line(geometry, material);

    // Secondary Cyan Echo Line
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0x06B6D4,
      transparent: true,
      opacity: isActive ? 0.4 : 0.15,
    });
    const glowLine = new THREE.Line(geometry, glowMaterial);

    return { curve: quadCurve, lineObject: line, outerGlowObject: glowLine };
  }, [start, end, isActive]);

  // Clean up WebGL resources when unmounting or re-computing
  useEffect(() => {
    return () => {
      lineObject.geometry.dispose();
      (lineObject.material as THREE.Material).dispose();
      (outerGlowObject.material as THREE.Material).dispose();
    };
  }, [lineObject, outerGlowObject]);

  // Zero-allocation frame loop (reuses TEMP_VEC registers)
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (pulse1Ref.current) {
      const t1 = (elapsed * 0.4) % 1.0;
      curve.getPoint(t1, TEMP_VEC_1);
      pulse1Ref.current.position.copy(TEMP_VEC_1);
    }
    if (pulse2Ref.current) {
      const t2 = (1.0 - (elapsed * 0.4) % 1.0);
      curve.getPoint(t2, TEMP_VEC_2);
      pulse2Ref.current.position.copy(TEMP_VEC_2);
    }
  });

  return (
    <group>
      <primitive object={lineObject} />
      <primitive object={outerGlowObject} />

      <mesh ref={pulse1Ref} geometry={PULSE_SPHERE_1} material={AMBER_PULSE_MAT} />
      <mesh ref={pulse2Ref} geometry={PULSE_SPHERE_2} material={CYAN_PULSE_MAT} />
    </group>
  );
});

CandidateLink.displayName = 'CandidateLink';
