import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CitySignal } from './types';

interface CityCameraRigProps {
  selectedSignal: CitySignal | null;
}

export const CityCameraRig: React.FC<CityCameraRigProps> = ({ selectedSignal }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetLookAt = useRef(new THREE.Vector3(0, 0.8, 0));

  useEffect(() => {
    if (selectedSignal) {
      targetLookAt.current.set(
        selectedSignal.position[0],
        0.8,
        selectedSignal.position[2]
      );
    } else {
      targetLookAt.current.set(0, 0.8, 0);
    }
  }, [selectedSignal]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Smoothly interpolate orbit control target towards focused signal
    controlsRef.current.target.lerp(targetLookAt.current, delta * 3);
    controlsRef.current.update();

    // Subtle pointer parallax when not actively dragging
    const pointer = state.pointer;
    state.camera.position.x += (pointer.x * 0.4 - (state.camera.position.x - 10)) * 0.01;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={4.5}
      maxDistance={20}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.15} // Prevents going underneath ground plane
      autoRotate={!selectedSignal}
      autoRotateSpeed={0.5}
    />
  );
};

