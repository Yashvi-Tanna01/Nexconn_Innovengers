import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CandidateLinkProps {
  start: [number, number, number];
  end: [number, number, number];
  isActive?: boolean;
}

export const CandidateLink: React.FC<CandidateLinkProps> = ({
  start,
  end,
  isActive = true,
}) => {
  const pulseRef = useRef<THREE.Mesh>(null);

  // Generate 3D quadratic bezier curve points & Three.js Line object
  const { curve, lineObject } = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);
    // Arc apex rises above the ground
    const midX = (vStart.x + vEnd.x) / 2;
    const midZ = (vStart.z + vEnd.z) / 2;
    const midY = Math.max(vStart.y, vEnd.y) + 1.2;
    const vMid = new THREE.Vector3(midX, midY, midZ);

    const quadCurve = new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd);
    const points = quadCurve.getPoints(40);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: 0xD97706, // Restrained champagne/amber
      transparent: true,
      opacity: isActive ? 0.85 : 0.35,
    });

    const line = new THREE.Line(geometry, material);
    return { curve: quadCurve, lineObject: line };
  }, [start, end, isActive]);

  // Animate pulse traveling across the candidate curve
  useFrame((state) => {
    if (!pulseRef.current) return;
    const t = (state.clock.getElapsedTime() * 0.45) % 1.0;
    const point = curve.getPoint(t);
    pulseRef.current.position.copy(point);
  });

  return (
    <group>
      {/* 3D Line Primitive */}
      <primitive object={lineObject} />

      {/* Traveling Candidate Pulse Beacon */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>
    </group>
  );
};
