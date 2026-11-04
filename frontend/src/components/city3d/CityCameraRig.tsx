import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CitySignal, CameraPreset, District } from './types';

interface CityCameraRigProps {
  selectedSignal: CitySignal | null;
  selectedDistrict: District | null;
  preset: CameraPreset;
  onControlsChange?: () => void;
}

export const CityCameraRig: React.FC<CityCameraRigProps> = ({
  selectedSignal,
  selectedDistrict,
  preset,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetLookAt = useRef(new THREE.Vector3(0, 0.8, 0));
  const targetCamPos = useRef(new THREE.Vector3(10.5, 9.5, 10.5));
  const isTransitioning = useRef(false);

  useEffect(() => {
    isTransitioning.current = true;
    if (selectedSignal) {
      targetLookAt.current.set(
        selectedSignal.position[0],
        0.9,
        selectedSignal.position[2]
      );
      targetCamPos.current.set(
        selectedSignal.position[0] + 3.2,
        selectedSignal.position[1] + 2.2,
        selectedSignal.position[2] + 3.2
      );
    } else if (selectedDistrict) {
      targetLookAt.current.set(
        selectedDistrict.center[0],
        0.8,
        selectedDistrict.center[2]
      );
      targetCamPos.current.set(
        selectedDistrict.center[0] + 5.5,
        6.5,
        selectedDistrict.center[2] + 5.5
      );
    } else {
      switch (preset) {
        case 'street':
          targetLookAt.current.set(0, 0.8, 0);
          targetCamPos.current.set(3.8, 1.8, 4.2);
          break;
        case 'patrol':
          targetLookAt.current.set(0, 0.8, 0);
          targetCamPos.current.set(11, 8.5, 11);
          break;
        case 'overview':
        default:
          targetLookAt.current.set(0, 0.8, 0);
          targetCamPos.current.set(10.5, 9.5, 10.5);
          break;
      }
    }
  }, [selectedSignal, selectedDistrict, preset]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Smooth camera positioning during preset transitions
    if (isTransitioning.current) {
      state.camera.position.lerp(targetCamPos.current, delta * 2.5);
      controlsRef.current.target.lerp(targetLookAt.current, delta * 3.5);
      if (
        state.camera.position.distanceTo(targetCamPos.current) < 0.1 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.1
      ) {
        isTransitioning.current = false;
      }
    } else {
      controlsRef.current.target.lerp(targetLookAt.current, delta * 2.0);
    }

    controlsRef.current.update();

    // Subtle pointer parallax when stationary
    if (!isTransitioning.current && !selectedSignal) {
      const pointer = state.pointer;
      state.camera.position.x +=
        (pointer.x * 0.3 - (state.camera.position.x - targetCamPos.current.x)) * 0.005;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.06}
      minDistance={3.8}
      maxDistance={22}
      minPolarAngle={Math.PI / 10}
      maxPolarAngle={Math.PI / 2.12} // Constrains below ground plane
      autoRotate={preset === 'patrol' && !selectedSignal}
      autoRotateSpeed={0.6}
    />
  );
};
