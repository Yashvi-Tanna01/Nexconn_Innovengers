import React, { useRef, useMemo, useState, useEffect, Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectDeviceTier } from '../../utils/device';
import { useLoading } from '../../context/LoadingContext';
import {
  generateLivingEarthTextures,
  METROPOLITAN_HUBS,
  INFRASTRUCTURE_CORRIDORS,
} from './EarthTextureGenerator';

// Reusable scratch vectors, matrices, and quaternions to prevent per-frame GC allocations
const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const tempScale = new THREE.Vector3();
const tempRot = new THREE.Quaternion();

// Spherical coordinates (lat, lon in degrees) to Cartesian Vector3
// Exactly matching Three.js SphereGeometry UV projection
export function latLonToVector3(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Fibonacci sphere distribution for harmonious observation nodes across the globe
function generateFibonacciPoints(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    // Slight altitude variation for organic network depth
    const alt = radius + (i % 4 === 0 ? 0.024 : 0.012);
    points.push(new THREE.Vector3(x * alt, y * alt, z * alt));
  }
  return points;
}

// Procedural 4-Point Starburst / Light Flare Texture for Major Telemetry Hubs
let cachedStarburstTexture: THREE.CanvasTexture | null = null;
function createStarburstTexture(): THREE.CanvasTexture {
  if (cachedStarburstTexture) return cachedStarburstTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const cx = 64;
  const cy = 64;

  // 1. Central brilliant circular bloom
  const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  radGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  radGrad.addColorStop(0.12, 'rgba(224, 247, 255, 0.95)');
  radGrad.addColorStop(0.32, 'rgba(0, 242, 254, 0.7)');
  radGrad.addColorStop(0.65, 'rgba(0, 180, 255, 0.2)');
  radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.fill();

  // 2. Horizontal anamorphic flare spike
  const hGrad = ctx.createLinearGradient(0, cy, 128, cy);
  hGrad.addColorStop(0.0, 'rgba(0, 242, 254, 0)');
  hGrad.addColorStop(0.35, 'rgba(0, 242, 254, 0.7)');
  hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
  hGrad.addColorStop(0.65, 'rgba(0, 242, 254, 0.7)');
  hGrad.addColorStop(1.0, 'rgba(0, 242, 254, 0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, cy - 2, 128, 4);

  // 3. Vertical anamorphic flare spike
  const vGrad = ctx.createLinearGradient(cx, 0, cx, 128);
  vGrad.addColorStop(0.0, 'rgba(0, 242, 254, 0)');
  vGrad.addColorStop(0.35, 'rgba(0, 242, 254, 0.7)');
  vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
  vGrad.addColorStop(0.65, 'rgba(0, 242, 254, 0.7)');
  vGrad.addColorStop(1.0, 'rgba(0, 242, 254, 0)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(cx - 2, 0, 4, 128);

  // 4. Fine 45-degree diagonal diamond sparkles
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  const dGrad = ctx.createLinearGradient(-38, 0, 38, 0);
  dGrad.addColorStop(0.0, 'rgba(0, 242, 254, 0)');
  dGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
  dGrad.addColorStop(1.0, 'rgba(0, 242, 254, 0)');
  ctx.fillStyle = dGrad;
  ctx.fillRect(-38, -1.2, 76, 2.4);
  ctx.restore();

  cachedStarburstTexture = new THREE.CanvasTexture(canvas);
  return cachedStarburstTexture;
}

// Pre-calculated Arc Data with 3D quadratic curve, shared line object, and traveling pulse
interface CachedNetworkArc {
  curve: THREE.QuadraticBezierCurve3;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  line: THREE.Line;
  phaseOffset: number;
  speed: number;
  color: string;
}

// 3D Extruded Building Definition
interface BuildingInstance {
  lat: number;
  lon: number;
  height: number;
  width: number;
  depth: number;
  hasBeacon: boolean;
}

interface SignalOrbProps {
  reducedMotion?: boolean;
  interactionRef: React.MutableRefObject<{
    isDragging: boolean;
    dragVelocity: { x: number; y: number };
    rotationOffset: { x: number; y: number };
  }>;
  isActive: boolean;
}

function SignalOrb({ reducedMotion = false, interactionRef, isActive }: SignalOrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerAtmosphereRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerHeartRef = useRef<THREE.Mesh>(null);
  const coreMotesRef = useRef<THREE.InstancedMesh>(null);
  const ambientMotesRef = useRef<THREE.InstancedMesh>(null);

  // 3D Extruded Buildings & Rooftop Beacons
  const buildingsMeshRef = useRef<THREE.InstancedMesh>(null);
  const beaconsMeshRef = useRef<THREE.InstancedMesh>(null);

  // Network node instanced mesh refs
  const amberNodesRef = useRef<THREE.InstancedMesh>(null);
  const cyanNodesRef = useRef<THREE.InstancedMesh>(null);
  const hubNodeRef = useRef<THREE.Mesh>(null);
  const beaconRing1Ref = useRef<THREE.Mesh>(null);
  const beaconRing2Ref = useRef<THREE.Mesh>(null);

  // White-Blue Starburst Flares
  const starburstSpritesRef = useRef<(THREE.Sprite | null)[]>([]);

  // Orbital satellites
  const sat1Ref = useRef<THREE.Mesh>(null);
  const sat2Ref = useRef<THREE.Mesh>(null);
  const sat3Ref = useRef<THREE.Mesh>(null);
  const sat3TrailRef = useRef<THREE.Mesh>(null);
  const sat4Ref = useRef<THREE.Mesh>(null);

  // Orbital Ring group refs for independent celestial mechanics
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const ring4Ref = useRef<THREE.Group>(null);

  // Traveling pulses along arcs
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Device tier adaptation
  const deviceTier = useMemo(() => detectDeviceTier(), []);
  const radius = 1.85;

  // --------------------------------------------------------------------------
  // 1. PROCEDURAL 3D LIVING EARTH SURFACE TEXTURES (DEEP NAVY & ELECTRIC CYAN)
  // --------------------------------------------------------------------------
  const textures = useMemo(() => {
    return generateLivingEarthTextures(deviceTier.isLowPower);
  }, [deviceTier.isLowPower]);

  // Procedural Starburst Textures (Global Singleton Cached)
  const starburstTexture = useMemo(() => createStarburstTexture(), []);

  // Shared reusable materials & geometries for pulse photons & starbursts
  const sharedPulseGeometry = useMemo(() => new THREE.SphereGeometry(0.034, 8, 8), []);
  const cyanPulseMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.95 }),
    []
  );
  const goldPulseMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#FEF08A', transparent: true, opacity: 0.95 }),
    []
  );
  const starburstMaterial = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: starburstTexture,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [starburstTexture]
  );
  const tempArcPos = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    return () => {
      sharedPulseGeometry.dispose();
      cyanPulseMaterial.dispose();
      goldPulseMaterial.dispose();
      starburstMaterial.dispose();
    };
  }, [sharedPulseGeometry, cyanPulseMaterial, goldPulseMaterial, starburstMaterial]);

  // --------------------------------------------------------------------------
  // 2. 3D SMART CITY INFRASTRUCTURE (EXTRUDED BUILDINGS ON SURFACE)
  // --------------------------------------------------------------------------
  const { buildings, rooftopBeacons } = useMemo(() => {
    const list: BuildingInstance[] = [];
    const beacons: THREE.Vector3[] = [];

    // Dense cluster 1: Bangalore East Infrastructure Core (Primary Focus)
    const bglrLat = 13.0;
    const bglrLon = 77.6;
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      const dist = 0.55 + (i % 4) * 0.42;
      const lat = bglrLat + Math.sin(angle) * (dist * 0.7);
      const lon = bglrLon + Math.cos(angle) * dist;
      const h = 0.048 + (i % 5) * 0.018;
      list.push({
        lat,
        lon,
        height: h,
        width: 0.018 + (i % 3) * 0.005,
        depth: 0.018 + ((i + 1) % 3) * 0.005,
        hasBeacon: i % 4 === 0,
      });

      if (i % 4 === 0) {
        beacons.push(latLonToVector3(lat, lon, radius + h + 0.008));
      }
    }

    // Secondary Metropolitan Hub Clusters (Europe, Middle East, India, Asia, Africa)
    const majorMetros: [number, number, number][] = [
      [19.0, 72.8, 10],    // Mumbai
      [28.6, 77.2, 10],    // Delhi
      [51.5, -0.1, 16],    // London
      [48.8, 2.35, 12],    // Paris
      [52.5, 13.4, 8],     // Berlin
      [41.9, 12.5, 8],     // Rome
      [25.2, 55.3, 14],    // Dubai
      [30.0, 31.2, 10],    // Cairo
      [35.7, 139.7, 16],   // Tokyo
      [31.2, 121.5, 12],   // Shanghai
      [1.35, 103.8, 10],   // Singapore
      [-1.3, 36.8, 8],     // Nairobi
      [40.7, -74.0, 14],   // New York
    ];

    majorMetros.forEach(([mLat, mLon, count]) => {
      const actualCount = deviceTier.isLowPower ? Math.ceil(count * 0.5) : count;
      for (let j = 0; j < actualCount; j++) {
        const ang = (j * Math.PI * 2) / actualCount;
        const dist = 0.5 + (j % 3) * 0.35;
        const lat = mLat + Math.sin(ang) * (dist * 0.6);
        const lon = mLon + Math.cos(ang) * dist;
        const h = 0.038 + (j % 4) * 0.018;
        list.push({
          lat,
          lon,
          height: h,
          width: 0.016 + (j % 3) * 0.004,
          depth: 0.016 + ((j + 1) % 3) * 0.004,
          hasBeacon: j === 0,
        });

        if (j === 0) {
          beacons.push(latLonToVector3(lat, lon, radius + h + 0.008));
        }
      }
    });

    return { buildings: list, rooftopBeacons: beacons };
  }, [radius, deviceTier.isLowPower]);

  // Set up InstancedMesh for 3D Buildings
  useEffect(() => {
    if (!buildingsMeshRef.current) return;
    buildings.forEach((b, i) => {
      const normal = latLonToVector3(b.lat, b.lon, 1.0).normalize();
      const centerPos = normal.clone().multiplyScalar(radius + b.height / 2);
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      const scale = new THREE.Vector3(b.width / 0.016, b.height / 0.05, b.depth / 0.016);
      tempMatrix.compose(centerPos, quat, scale);
      buildingsMeshRef.current!.setMatrixAt(i, tempMatrix);
    });
    buildingsMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [buildings, radius]);

  // Set up InstancedMesh for Rooftop Beacon Lights
  useEffect(() => {
    if (!beaconsMeshRef.current) return;
    rooftopBeacons.forEach((pos, i) => {
      tempScale.set(1, 1, 1);
      tempRot.identity();
      tempMatrix.compose(pos, tempRot, tempScale);
      beaconsMeshRef.current!.setMatrixAt(i, tempMatrix);
    });
    beaconsMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [rooftopBeacons]);

  // --------------------------------------------------------------------------
  // 3. CIVIC INTELLIGENCE MESH (NODES, HUB, AND CURVED ARCS)
  // --------------------------------------------------------------------------
  const { hubPos, hubNormal, cyanPoints, amberPoints, starburstPositions } = useMemo(() => {
    // Primary Civic Hub: Bangalore East Central Infrastructure Node
    const hub = latLonToVector3(13.0, 77.6, radius + 0.038);
    const normal = hub.clone().normalize();

    // Electric Cyan Intelligence Signal Points (Eurasia, Middle East, Africa, India Core)
    const cyans: THREE.Vector3[] = [
      latLonToVector3(13.5, 78.2, radius + 0.026), // Bangalore Satellite
      latLonToVector3(12.6, 77.1, radius + 0.026), // Bangalore South
      latLonToVector3(18.5, 73.8, radius + 0.026), // Pune
      latLonToVector3(17.4, 78.5, radius + 0.026), // Hyderabad
      latLonToVector3(13.0, 80.2, radius + 0.026), // Chennai
      latLonToVector3(19.0, 72.8, radius + 0.026), // Mumbai
      latLonToVector3(28.6, 77.2, radius + 0.026), // Delhi
      latLonToVector3(22.5, 88.3, radius + 0.026), // Kolkata
      latLonToVector3(25.2, 55.3, radius + 0.026), // Dubai
      latLonToVector3(24.7, 46.7, radius + 0.026), // Riyadh
      latLonToVector3(30.0, 31.2, radius + 0.026), // Cairo
      latLonToVector3(51.5, -0.1, radius + 0.026), // London
      latLonToVector3(48.8, 2.35, radius + 0.026), // Paris
      latLonToVector3(52.5, 13.4, radius + 0.026), // Berlin
      latLonToVector3(41.9, 12.5, radius + 0.026), // Rome
      latLonToVector3(40.4, -3.7, radius + 0.026), // Madrid
      latLonToVector3(38.0, 23.7, radius + 0.026), // Athens
      latLonToVector3(41.0, 28.9, radius + 0.026), // Istanbul
      latLonToVector3(1.35, 103.8, radius + 0.026),// Singapore
      latLonToVector3(22.3, 114.1, radius + 0.026),// Hong Kong
      latLonToVector3(31.2, 121.5, radius + 0.026),// Shanghai
      latLonToVector3(35.7, 139.7, radius + 0.026),// Tokyo
      latLonToVector3(-1.3, 36.8, radius + 0.026), // Nairobi
      latLonToVector3(-26.2, 28.0, radius + 0.026),// Johannesburg
      latLonToVector3(6.5, 3.4, radius + 0.026),   // Lagos
      latLonToVector3(40.7, -74.0, radius + 0.026),// New York
    ];

    // Warm Golden Observation Nodes across inhabited continents
    const ambers = generateFibonacciPoints(deviceTier.isLowPower ? 56 : 96, radius);

    // Major Telemetry Junctions with White-Blue Light Bursts (Starburst Flares)
    // Matching the brilliant diamond stars in the reference image
    const starbursts: { pos: THREE.Vector3; phase: number; baseScale: number }[] = [
      { pos: latLonToVector3(13.0, 77.6, radius + 0.045), phase: 0.0, baseScale: 0.42 }, // Bangalore East Hub (Primary)
      { pos: latLonToVector3(51.5, -0.1, radius + 0.045), phase: 1.2, baseScale: 0.40 }, // London / Europe Hub
      { pos: latLonToVector3(48.8, 2.35, radius + 0.045), phase: 2.1, baseScale: 0.36 }, // Paris
      { pos: latLonToVector3(25.2, 55.3, radius + 0.045), phase: 3.4, baseScale: 0.38 }, // Dubai Gateway
      { pos: latLonToVector3(19.0, 72.8, radius + 0.045), phase: 0.7, baseScale: 0.36 }, // Mumbai
      { pos: latLonToVector3(28.6, 77.2, radius + 0.045), phase: 2.8, baseScale: 0.36 }, // Delhi
      { pos: latLonToVector3(30.0, 31.2, radius + 0.045), phase: 1.8, baseScale: 0.34 }, // Cairo / Nile
      { pos: latLonToVector3(35.7, 139.7, radius + 0.045), phase: 3.1, baseScale: 0.38 }, // Tokyo
      { pos: latLonToVector3(1.35, 103.8, radius + 0.045), phase: 0.5, baseScale: 0.35 }, // Singapore
      { pos: latLonToVector3(-1.3, 36.8, radius + 0.045), phase: 2.4, baseScale: 0.32 }, // Nairobi
    ];

    return {
      hubPos: hub,
      hubNormal: normal,
      cyanPoints: cyans,
      amberPoints: ambers,
      starburstPositions: starbursts,
    };
  }, [radius, deviceTier.isLowPower]);

  // Beacon ring quaternion for Hub normal orientation
  const hubRingQuat = useMemo(() => {
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), hubNormal);
  }, [hubNormal]);

  // Pre-calculated Great-Circle Network Connection Arcs in Electric Cyan & Warm Gold
  // Densely webbed across visible Europe, Africa, Middle East, and India
  const networkArcs = useMemo<CachedNetworkArc[]>(() => {
    const connections: { start: THREE.Vector3; end: THREE.Vector3; alt: number; color: string; speed: number; phase: number }[] = [
      // 1. India Infrastructure Core
      { start: hubPos, end: cyanPoints[0], alt: 0.12, color: '#00F2FE', speed: 1.4, phase: 0.0 },
      { start: hubPos, end: cyanPoints[1], alt: 0.12, color: '#00F2FE', speed: 1.3, phase: 1.1 },
      { start: hubPos, end: cyanPoints[4], alt: 0.14, color: '#00F2FE', speed: 1.3, phase: 0.5 }, // Bglr -> Chennai
      { start: hubPos, end: cyanPoints[3], alt: 0.16, color: '#00F2FE', speed: 1.2, phase: 2.1 }, // Bglr -> Hyderabad
      { start: hubPos, end: cyanPoints[2], alt: 0.18, color: '#00F2FE', speed: 1.2, phase: 3.2 }, // Bglr -> Pune
      { start: cyanPoints[2], end: cyanPoints[5], alt: 0.14, color: '#00F2FE', speed: 1.4, phase: 1.8 }, // Pune -> Mumbai
      { start: cyanPoints[5], end: cyanPoints[6], alt: 0.22, color: '#F59E0B', speed: 1.1, phase: 0.8 }, // Mumbai -> Delhi
      { start: cyanPoints[3], end: cyanPoints[6], alt: 0.24, color: '#00F2FE', speed: 1.0, phase: 2.9 }, // Hyderabad -> Delhi
      { start: cyanPoints[6], end: cyanPoints[7], alt: 0.22, color: '#00F2FE', speed: 1.2, phase: 1.4 }, // Delhi -> Kolkata
      { start: cyanPoints[4], end: cyanPoints[7], alt: 0.24, color: '#F59E0B', speed: 0.95, phase: 3.5 }, // Chennai -> Kolkata

      // 2. Trans-Arabian Sea Trunk (India <-> Middle East)
      { start: hubPos, end: cyanPoints[8], alt: 0.32, color: '#F59E0B', speed: 0.9, phase: 1.2 }, // Bglr -> Dubai
      { start: cyanPoints[5], end: cyanPoints[8], alt: 0.28, color: '#00F2FE', speed: 1.0, phase: 2.5 }, // Mumbai -> Dubai
      { start: cyanPoints[8], end: cyanPoints[9], alt: 0.16, color: '#00F2FE', speed: 1.3, phase: 0.4 }, // Dubai -> Riyadh
      { start: cyanPoints[9], end: cyanPoints[10], alt: 0.22, color: '#F59E0B', speed: 1.1, phase: 3.1 }, // Riyadh -> Cairo
      { start: cyanPoints[8], end: cyanPoints[10], alt: 0.26, color: '#00F2FE', speed: 0.95, phase: 1.7 }, // Dubai -> Cairo

      // 3. European Intelligence Network (Dense Hexagonal Grid)
      { start: cyanPoints[11], end: cyanPoints[12], alt: 0.14, color: '#00F2FE', speed: 1.4, phase: 0.2 }, // London -> Paris
      { start: cyanPoints[11], end: cyanPoints[13], alt: 0.18, color: '#00F2FE', speed: 1.2, phase: 1.6 }, // London -> Berlin
      { start: cyanPoints[12], end: cyanPoints[15], alt: 0.16, color: '#00F2FE', speed: 1.3, phase: 2.8 }, // Paris -> Madrid
      { start: cyanPoints[12], end: cyanPoints[14], alt: 0.18, color: '#F59E0B', speed: 1.1, phase: 0.9 }, // Paris -> Rome
      { start: cyanPoints[13], end: cyanPoints[14], alt: 0.20, color: '#00F2FE', speed: 1.2, phase: 3.4 }, // Berlin -> Rome
      { start: cyanPoints[14], end: cyanPoints[16], alt: 0.16, color: '#00F2FE', speed: 1.3, phase: 1.9 }, // Rome -> Athens
      { start: cyanPoints[16], end: cyanPoints[17], alt: 0.15, color: '#00F2FE', speed: 1.4, phase: 0.6 }, // Athens -> Istanbul
      { start: cyanPoints[17], end: cyanPoints[10], alt: 0.20, color: '#F59E0B', speed: 1.05, phase: 2.3 }, // Istanbul -> Cairo
      { start: cyanPoints[14], end: cyanPoints[10], alt: 0.26, color: '#00F2FE', speed: 0.95, phase: 3.8 }, // Rome -> Cairo

      // 4. Africa Civic Telemetry Backbone
      { start: cyanPoints[10], end: cyanPoints[22], alt: 0.28, color: '#00F2FE', speed: 1.0, phase: 1.3 }, // Cairo -> Nairobi
      { start: hubPos, end: cyanPoints[22], alt: 0.35, color: '#F59E0B', speed: 0.85, phase: 2.7 }, // Bglr -> Nairobi
      { start: cyanPoints[22], end: cyanPoints[23], alt: 0.30, color: '#00F2FE', speed: 0.95, phase: 0.7 }, // Nairobi -> Johannesburg
      { start: cyanPoints[24], end: cyanPoints[22], alt: 0.26, color: '#00F2FE', speed: 1.1, phase: 3.3 }, // Lagos -> Nairobi
      { start: cyanPoints[15], end: cyanPoints[24], alt: 0.34, color: '#F59E0B', speed: 0.8, phase: 1.5 }, // Madrid -> Lagos

      // 5. Southeast Asia & East Asia Telemetry
      { start: hubPos, end: cyanPoints[18], alt: 0.36, color: '#F59E0B', speed: 0.9, phase: 2.2 }, // Bglr -> Singapore
      { start: cyanPoints[18], end: cyanPoints[19], alt: 0.22, color: '#00F2FE', speed: 1.2, phase: 0.8 }, // Singapore -> Hong Kong
      { start: cyanPoints[19], end: cyanPoints[20], alt: 0.18, color: '#00F2FE', speed: 1.3, phase: 3.0 }, // Hong Kong -> Shanghai
      { start: cyanPoints[20], end: cyanPoints[21], alt: 0.20, color: '#00F2FE', speed: 1.25, phase: 1.1 }, // Shanghai -> Tokyo

      // 6. Citizen Observations Linked to Local Hubs
      { start: amberPoints[3], end: hubPos, alt: 0.14, color: '#FBBF24', speed: 1.1, phase: 4.1 },
      { start: amberPoints[8], end: cyanPoints[5], alt: 0.15, color: '#FBBF24', speed: 1.2, phase: 0.4 },
      { start: amberPoints[16], end: cyanPoints[11], alt: 0.16, color: '#FBBF24', speed: 1.15, phase: 2.5 },
      { start: amberPoints[24], end: cyanPoints[14], alt: 0.15, color: '#00F2FE', speed: 1.05, phase: 1.8 },
      { start: amberPoints[32], end: cyanPoints[8], alt: 0.17, color: '#FBBF24', speed: 1.2, phase: 3.4 },
      { start: amberPoints[40], end: cyanPoints[22], alt: 0.16, color: '#00F2FE', speed: 1.1, phase: 0.9 },
    ];

    return connections.map(({ start, end, alt, color, speed, phase }) => {
      const p1 = start.clone();
      const p2 = end.clone();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      if (mid.length() > 0.001) {
        mid.normalize().multiplyScalar(radius + alt);
      }
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(deviceTier.isLowPower ? 20 : 32);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.82,
      });
      const line = new THREE.Line(geometry, material);

      return { curve, geometry, material, line, speed, phaseOffset: phase, color };
    });
  }, [hubPos, cyanPoints, amberPoints, radius, deviceTier.isLowPower]);

  useEffect(() => {
    return () => {
      networkArcs.forEach((arc) => {
        arc.geometry.dispose();
        arc.material.dispose();
      });
    };
  }, [networkArcs]);

  // --------------------------------------------------------------------------
  // 4. CINEMATIC ORBITAL RINGS & SATELLITES
  // --------------------------------------------------------------------------
  const orbitalRingsData = useMemo(() => {
    const ringSegments = deviceTier.isLowPower ? 48 : 64;

    // Ring 1: Equatorial Electric Cyan Orbit (Radius 2.54)
    const r1Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const th = (i / ringSegments) * Math.PI * 2;
      r1Pts.push(new THREE.Vector3(2.54 * Math.cos(th), 0, 2.54 * Math.sin(th)));
    }
    const r1Geom = new THREE.BufferGeometry().setFromPoints(r1Pts);
    const r1Line = new THREE.Line(
      r1Geom,
      new THREE.LineBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85 })
    );

    // Ring 2: Oblique Warm Golden Telemetry Orbit (Radius 2.82)
    const r2Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const th = (i / ringSegments) * Math.PI * 2;
      r2Pts.push(new THREE.Vector3(2.82 * Math.cos(th), 0, 2.82 * Math.sin(th)));
    }
    const r2Geom = new THREE.BufferGeometry().setFromPoints(r2Pts);
    const r2Line = new THREE.Line(
      r2Geom,
      new THREE.LineBasicMaterial({ color: '#FEF08A', transparent: true, opacity: 0.8 })
    );

    // Ring 3: Counter-Oblique Turquoise Orbit (Radius 2.68)
    const r3Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const th = (i / ringSegments) * Math.PI * 2;
      r3Pts.push(new THREE.Vector3(2.68 * Math.cos(th), 0, 2.68 * Math.sin(th)));
    }
    const r3Geom = new THREE.BufferGeometry().setFromPoints(r3Pts);
    const r3Line = new THREE.Line(
      r3Geom,
      new THREE.LineBasicMaterial({ color: '#38BDF8', transparent: true, opacity: 0.75 })
    );

    // Ring 4: Outer Horizon Orbit (Radius 3.12)
    const r4Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const th = (i / ringSegments) * Math.PI * 2;
      r4Pts.push(new THREE.Vector3(3.12 * Math.cos(th), 0, 3.12 * Math.sin(th)));
    }
    const r4Geom = new THREE.BufferGeometry().setFromPoints(r4Pts);
    const r4Line = new THREE.Line(
      r4Geom,
      new THREE.LineBasicMaterial({ color: '#2DD4BF', transparent: true, opacity: 0.35 })
    );

    return { r1Geom, r2Geom, r3Geom, r4Geom, r1Line, r2Line, r3Line, r4Line };
  }, [deviceTier.isLowPower]);

  useEffect(() => {
    return () => {
      orbitalRingsData.r1Geom.dispose();
      (orbitalRingsData.r1Line.material as THREE.Material).dispose();
      orbitalRingsData.r2Geom.dispose();
      (orbitalRingsData.r2Line.material as THREE.Material).dispose();
      orbitalRingsData.r3Geom.dispose();
      (orbitalRingsData.r3Line.material as THREE.Material).dispose();
      orbitalRingsData.r4Geom.dispose();
      (orbitalRingsData.r4Line.material as THREE.Material).dispose();
    };
  }, [orbitalRingsData]);

  // Core Motes & Ambient Motes Data
  const coreMotesData = useMemo(() => {
    const count = 18;
    const speeds: number[] = [];
    const offsets: number[] = [];
    const radii: number[] = [];
    const incls: number[] = [];

    for (let i = 0; i < count; i++) {
      speeds.push(0.6 + (i % 5) * 0.25);
      offsets.push((i * Math.PI * 2) / count);
      radii.push(0.42 + (i % 4) * 0.18);
      incls.push(((i - count / 2) / count) * Math.PI * 0.7);
    }
    return { count, speeds, offsets, radii, incls };
  }, []);

  const ambientMotesData = useMemo(() => {
    const count = deviceTier.isLowPower ? 24 : 44;
    const pts: { pos: THREE.Vector3; speed: number; offset: number }[] = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const dist = 2.22 + (i % 5) * 0.26;
      const x = dist * Math.sin(phi) * Math.cos(theta);
      const y = dist * Math.cos(phi);
      const z = dist * Math.sin(phi) * Math.sin(theta);
      pts.push({
        pos: new THREE.Vector3(x, y, z),
        speed: 0.08 + (i % 3) * 0.04,
        offset: i * 0.35,
      });
    }
    return pts;
  }, [deviceTier.isLowPower]);

  // Initialize Instanced Meshes on Mount
  useEffect(() => {
    if (amberNodesRef.current) {
      amberPoints.forEach((pt, i) => {
        tempPos.copy(pt);
        tempScale.set(1, 1, 1);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        amberNodesRef.current!.setMatrixAt(i, tempMatrix);
      });
      amberNodesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (cyanNodesRef.current) {
      cyanPoints.forEach((pt, i) => {
        tempPos.copy(pt);
        tempScale.set(1, 1, 1);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        cyanNodesRef.current!.setMatrixAt(i, tempMatrix);
      });
      cyanNodesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (ambientMotesRef.current) {
      ambientMotesData.forEach((mote, i) => {
        tempPos.copy(mote.pos);
        tempScale.set(1, 1, 1);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        ambientMotesRef.current!.setMatrixAt(i, tempMatrix);
      });
      ambientMotesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [amberPoints, cyanPoints, ambientMotesData]);

  // --------------------------------------------------------------------------
  // 5. UNIFIED 60FPS ANIMATION LOOP (FLOATING 3D DYNAMICS & NETWORK PULSES)
  // --------------------------------------------------------------------------
  useFrame((state, delta) => {
    // 0. PERFORMANCE GUARD: Skip frame calculations if offscreen, tab hidden, or app in background
    if (!isActive || (typeof document !== 'undefined' && document.hidden)) {
      return;
    }

    const t = state.clock.elapsedTime;
    const { pointer } = state;
    const interaction = interactionRef.current;

    // A. Smooth Drag & Momentum Inertia + Ambient Rotation
    if (!interaction.isDragging) {
      interaction.rotationOffset.x += interaction.dragVelocity.x;
      interaction.rotationOffset.y += interaction.dragVelocity.y;
      // Smooth friction decay
      interaction.dragVelocity.x *= 0.93;
      interaction.dragVelocity.y *= 0.93;
    }

    if (groupRef.current) {
      if (reducedMotion) {
        groupRef.current.rotation.set(0.18, -2.32, 0);
        groupRef.current.position.y = 0;
      } else {
        // Slow continuous planetary drift around vertical Y-axis + user drag + pointer parallax
        // -2.32 perfectly highlights Europe, Africa, Middle East, and India front-and-center, matching reference image
        const ambientY = -2.32 + t * 0.055;
        const targetRotX = 0.18 + interaction.rotationOffset.x + pointer.y * 0.22;
        const targetRotY = interaction.rotationOffset.y + ambientY + pointer.x * 0.38;

        const dampFactor = interaction.isDragging ? 14.0 : 4.0;
        groupRef.current.rotation.x = THREE.MathUtils.damp(
          groupRef.current.rotation.x,
          targetRotX,
          dampFactor,
          delta
        );
        groupRef.current.rotation.y = THREE.MathUtils.damp(
          groupRef.current.rotation.y,
          targetRotY,
          dampFactor,
          delta
        );

        // Continuous gentle vertical floating motion (smooth suspended levitation in 3D space)
        const floatY = Math.sin(t * 1.25) * 0.075;
        groupRef.current.position.y = floatY;
      }
    }

    if (reducedMotion) return;

    // B. Inner Energy Core Breathing & Volumetric Pulse
    if (coreRef.current) {
      const corePulse = 1.0 + Math.sin(t * 1.6) * 0.055;
      coreRef.current.scale.set(corePulse, corePulse, corePulse);
    }
    if (innerHeartRef.current) {
      const heartPulse = 1.0 + Math.sin(t * 2.2 + 0.5) * 0.04;
      innerHeartRef.current.scale.set(heartPulse, heartPulse, heartPulse);
    }

    // C. Internal Core Motes Circulation
    if (coreMotesRef.current) {
      for (let i = 0; i < coreMotesData.count; i++) {
        const speed = coreMotesData.speeds[i];
        const offset = coreMotesData.offsets[i];
        const r = coreMotesData.radii[i];
        const incl = coreMotesData.incls[i];
        const ang = t * speed + offset;

        const x = r * Math.cos(ang) * Math.cos(incl);
        const y = r * Math.sin(ang) + Math.sin(t * 1.5 + i) * 0.04;
        const z = r * Math.cos(ang) * Math.sin(incl);

        tempPos.set(x, y, z);
        const moteScale = 0.8 + 0.25 * Math.sin(t * 2.5 + i);
        tempScale.set(moteScale, moteScale, moteScale);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        coreMotesRef.current.setMatrixAt(i, tempMatrix);
      }
      coreMotesRef.current.instanceMatrix.needsUpdate = true;
    }

    // D. Primary Hub Expanding Concentric Radar Wave Rings
    if (beaconRing1Ref.current && beaconRing2Ref.current) {
      const p1 = (t * 0.75) % 1;
      const s1 = 0.5 + p1 * 2.5;
      beaconRing1Ref.current.scale.set(s1, s1, s1);
      (beaconRing1Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p1) * 0.9;

      const p2 = (t * 0.75 + 0.5) % 1;
      const s2 = 0.5 + p2 * 2.5;
      beaconRing2Ref.current.scale.set(s2, s2, s2);
      (beaconRing2Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * 0.9;
    }

    // E. Rooftop Beacon Lights Subtle Pulse
    if (beaconsMeshRef.current) {
      const beaconPulse = 0.8 + 0.35 * Math.sin(t * 3.2);
      beaconsMeshRef.current.scale.set(beaconPulse, beaconPulse, beaconPulse);
    }

    // F. Traveling Photons along Cyan & Golden Network Arcs
    networkArcs.forEach((arc, idx) => {
      const arcT = t * arc.speed + arc.phaseOffset;
      arc.material.opacity = 0.45 + 0.5 * (0.5 + 0.5 * Math.sin(arcT));

      const pulseMesh = pulseRefs.current[idx];
      if (pulseMesh) {
        const progress = (arcT * 0.28) % 1;
        arc.curve.getPoint(progress, tempArcPos);
        pulseMesh.position.copy(tempArcPos);
        const pScale = 0.8 + 0.35 * Math.sin(progress * Math.PI);
        pulseMesh.scale.set(pScale, pScale, pScale);
      }
    });

    // G. White-Blue Starburst Flares Pulsing Animation
    starburstPositions.forEach((sb, idx) => {
      const sprite = starburstSpritesRef.current[idx];
      if (sprite) {
        const pulse = 1.0 + 0.28 * Math.sin(t * 3.0 + sb.phase);
        const s = sb.baseScale * pulse;
        sprite.scale.set(s, s, s);
      }
    });

    // H. Orbital Satellites on Ring 1, Ring 2 & Ring 3
    if (sat1Ref.current) {
      const a1 = t * 0.38;
      sat1Ref.current.position.set(2.54 * Math.cos(a1), 0, 2.54 * Math.sin(a1));
    }
    if (sat2Ref.current) {
      const a2 = t * 0.38 + Math.PI;
      sat2Ref.current.position.set(2.54 * Math.cos(a2), 0, 2.54 * Math.sin(a2));
    }
    if (sat3Ref.current) {
      const a3 = -t * 0.32;
      sat3Ref.current.position.set(2.82 * Math.cos(a3), 0, 2.82 * Math.sin(a3));

      if (sat3TrailRef.current) {
        const aTrail = a3 + 0.12;
        sat3TrailRef.current.position.set(2.82 * Math.cos(aTrail), 0, 2.82 * Math.sin(aTrail));
      }
    }
    if (sat4Ref.current) {
      const a4 = t * 0.26 + 1.5;
      sat4Ref.current.position.set(2.68 * Math.cos(a4), 0, 2.68 * Math.sin(a4));
    }

    // I. Independent Celestial Rotation of Orbital Rings
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.08;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.06;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 0.05;
    if (ring4Ref.current) ring4Ref.current.rotation.z -= delta * 0.035;

    // J. Ambient Stardust Motes Levitation & 3D Drift
    if (ambientMotesRef.current) {
      for (let i = 0; i < ambientMotesData.length; i++) {
        const mote = ambientMotesData[i];
        const ang = t * mote.speed + mote.offset;
        const radiusOsc = 2.22 + Math.sin(t * 1.2 + i) * 0.12;
        const x = radiusOsc * Math.cos(ang);
        const y = mote.pos.y + Math.sin(t * 0.7 + i) * 0.06;
        const z = radiusOsc * Math.sin(ang);

        tempPos.set(x, y, z);
        const scaleVal = 0.8 + 0.35 * Math.sin(t * 1.8 + i);
        tempScale.set(scaleVal, scaleVal, scaleVal);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        ambientMotesRef.current.setMatrixAt(i, tempMatrix);
      }
      ambientMotesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Main Floating Planet Group */}
      <group ref={groupRef}>
        {/* 1. INNER VOLUMETRIC ENERGY CORE (ELECTRIC CYAN & RADIANT NUCLEUS) */}
        <mesh ref={innerHeartRef}>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.95} />
        </mesh>

        <mesh ref={coreRef}>
          <sphereGeometry args={[1.08, 32, 32]} />
          <meshBasicMaterial color="#00F2FE" transparent opacity={0.4} />
        </mesh>

        <instancedMesh ref={coreMotesRef} args={[undefined, undefined, coreMotesData.count]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#E0F2FE" transparent opacity={0.9} />
        </instancedMesh>

        {/* Internal Core Radiant Point Light (Illuminating oceans & continents from within) */}
        <pointLight color="#00F2FE" intensity={3.8} distance={8.0} decay={2} />

        {/* 2. LAYER 1: DEEP MIDNIGHT NAVY EARTH SPHERE WITH ELECTRIC CYAN COASTLINES & GOLDEN CITY LIGHTS */}
        <mesh>
          <sphereGeometry args={[radius, deviceTier.isLowPower ? 40 : 64, deviceTier.isLowPower ? 40 : 64]} />
          {deviceTier.isLowPower ? (
            <meshStandardMaterial
              map={textures.diffuseMap}
              emissiveMap={textures.emissiveMap}
              emissive="#FFFFFF"
              emissiveIntensity={2.0}
              bumpMap={textures.bumpMap}
              bumpScale={0.025}
              roughness={0.24}
              metalness={0.10}
              transparent={true}
              opacity={0.98}
            />
          ) : (
            <meshPhysicalMaterial
              map={textures.diffuseMap}
              emissiveMap={textures.emissiveMap}
              emissive="#FFFFFF"
              emissiveIntensity={2.5}
              bumpMap={textures.bumpMap}
              bumpScale={0.035}
              roughness={0.22}
              metalness={0.14}
              clearcoat={1.0}
              clearcoatRoughness={0.08}
              transmission={0.12}
              thickness={1.1}
              ior={1.44}
              transparent={true}
              opacity={1.0}
            />
          )}
        </mesh>

        {/* Outer Crystal-Glass Translucent Atmospheric Enclosure with Specular Highlights */}
        <mesh ref={outerAtmosphereRef}>
          <sphereGeometry args={[radius * 1.018, deviceTier.isLowPower ? 32 : 48, deviceTier.isLowPower ? 32 : 48]} />
          <meshPhysicalMaterial
            color="#38BDF8"
            roughness={0.10}
            metalness={0.06}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            transmission={0.86}
            thickness={0.8}
            ior={1.48}
            transparent={true}
            opacity={0.28}
          />
        </mesh>

        {/* Atmospheric Fresnel Rim Halo (Intense Electric Cyan Perimeter Aura) */}
        <mesh>
          <sphereGeometry args={[radius * 1.034, deviceTier.isLowPower ? 28 : 48, deviceTier.isLowPower ? 28 : 48]} />
          <meshStandardMaterial
            color="#00F2FE"
            emissive="#00F2FE"
            emissiveIntensity={1.2}
            roughness={0.08}
            metalness={0.05}
            transparent={true}
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>

        {/* 3. LAYER 2: 3D EXTRUDED SMART CITY BUILDINGS (GOLDEN TOWERS & ROOFTOP BEACONS) */}
        <instancedMesh
          ref={buildingsMeshRef}
          args={[undefined, undefined, buildings.length]}
        >
          <boxGeometry args={[0.016, 0.05, 0.016]} />
          <meshStandardMaterial
            color="#FEF3C7"
            emissive="#F59E0B"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.85}
          />
        </instancedMesh>

        {/* Rooftop Beacon Lights on Key Towers */}
        <instancedMesh
          ref={beaconsMeshRef}
          args={[undefined, undefined, rooftopBeacons.length]}
        >
          <sphereGeometry args={[0.014, 6, 6]} />
          <meshBasicMaterial color="#00F2FE" transparent opacity={0.95} />
        </instancedMesh>

        {/* 4. LAYER 3: CIVIC INTELLIGENCE NETWORK (NODES, HUB, AND CURVED ARCS) */}
        {/* A. Golden Observation Points (Distributed across inhabited continents) */}
        <instancedMesh ref={amberNodesRef} args={[undefined, undefined, amberPoints.length]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#FBBF24" transparent opacity={0.9} />
        </instancedMesh>

        {/* B. Electric Cyan Telemetry Nodes */}
        <instancedMesh ref={cyanNodesRef} args={[undefined, undefined, cyanPoints.length]}>
          <sphereGeometry args={[0.036, 10, 10]} />
          <meshBasicMaterial color="#00F2FE" transparent opacity={0.95} />
        </instancedMesh>

        {/* C. Primary Central Hub Node (Bangalore East Civic Core) */}
        <mesh ref={hubNodeRef} position={hubPos}>
          <sphereGeometry args={[0.058, 14, 14]} />
          <meshBasicMaterial color="#00F2FE" />
        </mesh>
        {/* Inner Hub Brilliant White-Gold Glimmer */}
        <mesh position={hubPos}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {/* Expanding Radar Beacon Concentric Wave Rings at Hub */}
        <mesh
          ref={beaconRing1Ref}
          position={hubPos.clone().multiplyScalar(1.006)}
          quaternion={hubRingQuat}
        >
          <ringGeometry args={[0.042, 0.068, 32]} />
          <meshBasicMaterial color="#00F2FE" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh
          ref={beaconRing2Ref}
          position={hubPos.clone().multiplyScalar(1.008)}
          quaternion={hubRingQuat}
        >
          <ringGeometry args={[0.042, 0.068, 32]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>

        {/* D. White-Blue Light Bursts (Cinematic 4-Point Starburst Flares) */}
        <group>
          {starburstPositions.map((sb, idx) => (
            <sprite
              key={idx}
              ref={(el) => (starburstSpritesRef.current[idx] = el)}
              position={sb.pos}
              scale={[sb.baseScale, sb.baseScale, sb.baseScale]}
              material={starburstMaterial}
            />
          ))}
        </group>

        {/* E. Great-Circle Network Connection Arcs & Traveling Photons */}
        <group>
          {networkArcs.map((arc, idx) => (
            <group key={idx}>
              <primitive object={arc.line} />
              <mesh
                ref={(el) => (pulseRefs.current[idx] = el)}
                geometry={sharedPulseGeometry}
                material={arc.color === '#00F2FE' ? cyanPulseMaterial : goldPulseMaterial}
              />
            </group>
          ))}
        </group>

        {/* 5. LAYER 4: CINEMATIC ORBITAL SYSTEMS (4 DISTINCT LUMINOUS RINGS) */}
        {/* Ring 1: Equatorial Electric Cyan Orbit */}
        <group ref={ring1Ref} rotation={[0.38, 0, -0.22]}>
          <primitive object={orbitalRingsData.r1Line} />
          <mesh>
            <ringGeometry args={[2.48, 2.60, deviceTier.isLowPower ? 36 : 64]} />
            <meshBasicMaterial
              color="#00F2FE"
              transparent
              opacity={0.65}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={sat1Ref}>
            <sphereGeometry args={[0.046, 10, 10]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh ref={sat2Ref}>
            <sphereGeometry args={[0.034, 8, 8]} />
            <meshBasicMaterial color="#00F2FE" />
          </mesh>
        </group>

        {/* Ring 2: Oblique Warm Golden Telemetry Orbit */}
        <group ref={ring2Ref} rotation={[-0.68, 0.48, 0.28]}>
          <primitive object={orbitalRingsData.r2Line} />
          <mesh>
            <ringGeometry args={[2.76, 2.88, deviceTier.isLowPower ? 36 : 64]} />
            <meshBasicMaterial
              color="#F59E0B"
              transparent
              opacity={0.55}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={sat3Ref}>
            <sphereGeometry args={[0.044, 10, 10]} />
            <meshBasicMaterial color="#FBBF24" />
          </mesh>
          <mesh ref={sat3TrailRef}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color="#FEF08A" transparent opacity={0.75} />
          </mesh>
        </group>

        {/* Ring 3: Counter-Oblique Turquoise Orbit */}
        <group ref={ring3Ref} rotation={[0.42, -0.55, -0.35]}>
          <primitive object={orbitalRingsData.r3Line} />
          <mesh>
            <ringGeometry args={[2.64, 2.72, deviceTier.isLowPower ? 36 : 64]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.45}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={sat4Ref}>
            <sphereGeometry args={[0.036, 8, 8]} />
            <meshBasicMaterial color="#E0F2FE" />
          </mesh>
        </group>

        {/* Ring 4: Outer Precision Telemetry Orbit */}
        <group ref={ring4Ref} rotation={[0.15, -0.78, 0.12]}>
          <primitive object={orbitalRingsData.r4Line} />
        </group>

        {/* Ambient Stardust Motes */}
        <instancedMesh ref={ambientMotesRef} args={[undefined, undefined, ambientMotesData.length]}>
          <sphereGeometry args={[0.016, 6, 6]} />
          <meshBasicMaterial color="#BAE6FD" transparent opacity={0.7} />
        </instancedMesh>
      </group>
    </group>
  );
}

// Studio Lighting & Grounding Scene (Matching dramatic blue-and-gold lighting from reference image)
interface SceneProps {
  reducedMotion?: boolean;
  interactionRef: React.MutableRefObject<{
    isDragging: boolean;
    dragVelocity: { x: number; y: number };
    rotationOffset: { x: number; y: number };
  }>;
  isActive: boolean;
}

function Scene({ reducedMotion, interactionRef, isActive }: SceneProps) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 3.2 + Math.sin(t * 0.75) * 0.35;
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 4.0 + Math.cos(t * 0.95) * 0.45;
    }
  });

  return (
    <>
      {/* Studio Ambient & Directional Lighting */}
      <ambientLight intensity={1.35} color="#E0F2FE" />
      {/* Key Warm Sun Light (Highlights golden city blocks & specular reflections) */}
      <directionalLight ref={keyLightRef} position={[6, 8, 6]} intensity={3.2} color="#FFFBEB" />
      {/* Electric Cyan Rim Light (Dramatic atmospheric edge illumination) */}
      <directionalLight ref={rimLightRef} position={[-6, -4, -6]} intensity={4.0} color="#00F2FE" />
      {/* Soft Luminous Under-Fill (Deep blue under-illumination) */}
      <directionalLight position={[0, -6, 2]} intensity={2.0} color="#38BDF8" />

      {/* Living 3D Digital Earth (Floating suspended in 3D space) */}
      <SignalOrb reducedMotion={reducedMotion} interactionRef={interactionRef} isActive={isActive} />
    </>
  );
}

// Resilient WebGL Error Boundary with Pure CSS / SVG Fallback
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('SignalOrbCanvas WebGL fallback active:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// High-Fidelity Deep Midnight Navy & Cyan CSS / SVG Fallback for devices without WebGL
function SignalOrbCSSFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none bg-transparent">
      <div
        className="relative w-64 h-64 sm:w-76 sm:h-76 rounded-full shadow-[inset_0_0_50px_rgba(0,242,254,0.4),0_0_60px_rgba(0,242,254,0.35)] flex items-center justify-center overflow-hidden border border-cyan-300/40"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #0A2246 0%, #05142E 50%, #020919 100%)',
        }}
      >
        {/* Inner Cyan Radiant Core */}
        <div
          className="absolute w-36 h-36 rounded-full blur-xl opacity-80 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #FFFFFF 0%, #00F2FE 50%, transparent 100%)',
            animationDuration: '3s',
          }}
        />
        {/* Orbital Rings */}
        <div className="absolute inset-0 border border-cyan-400/40 rounded-full rotate-45 scale-95" />
        <div className="absolute inset-2 border border-amber-400/35 rounded-full -rotate-30 scale-90" />
        {/* Telemetry Network SVG Overlay */}
        <svg className="w-full h-full relative z-10" viewBox="0 0 200 200">
          <circle cx="100" cy="90" r="5" fill="#FFFFFF" />
          <circle cx="100" cy="90" r="10" stroke="#00F2FE" strokeWidth="1.2" fill="none" opacity="0.8" />
          <circle cx="125" cy="75" r="3.5" fill="#00F2FE" />
          <circle cx="80" cy="115" r="3" fill="#F59E0B" />
          <circle cx="135" cy="110" r="3.5" fill="#00F2FE" />
          <circle cx="70" cy="75" r="2.5" fill="#FBBF24" />
          <path d="M 100 90 Q 115 78 125 75" stroke="#00F2FE" strokeWidth="1.2" fill="transparent" />
          <path d="M 100 90 Q 90 105 80 115" stroke="#F59E0B" strokeWidth="1.2" fill="transparent" />
          <path d="M 100 90 Q 120 105 135 110" stroke="#00F2FE" strokeWidth="1.2" fill="transparent" />
        </svg>
      </div>
    </div>
  );
}

export interface SignalOrbCanvasProps {
  className?: string;
}

export const SignalOrbCanvas: React.FC<SignalOrbCanvasProps> = React.memo(({ className = '' }) => {
  const [webglSupported, setWebglSupported] = useState(true);
  const { isAppInitialized } = useLoading();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true
  );

  const deviceTier = useMemo(() => detectDeviceTier(), []);

  // Viewport intersection observer to completely halt rendering when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: '100px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tab visibility observer to halt 3D render loop when minimized or tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const isActive = isAppInitialized && isInView && isTabVisible;

  // Drag interaction state (ref-based for zero rerender lag)
  const interactionRef = useRef({
    isDragging: false,
    dragVelocity: { x: 0, y: 0 },
    rotationOffset: { x: 0, y: 0 },
  });
  const prevPointerRef = useRef({ x: 0, y: 0 });

  // WebGL support detection
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Pointer drag event handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    interactionRef.current.isDragging = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    interactionRef.current.dragVelocity = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactionRef.current.isDragging) return;
    const dx = (e.clientX - prevPointerRef.current.x) * 0.006;
    const dy = (e.clientY - prevPointerRef.current.y) * 0.006;

    interactionRef.current.rotationOffset.y += dx;
    interactionRef.current.rotationOffset.x += dy;

    interactionRef.current.dragVelocity = { x: dy * 0.7, y: dx * 0.7 };
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    interactionRef.current.isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className={`w-full h-full relative bg-transparent ${className}`} style={{ background: 'transparent' }}>
        <SignalOrbCSSFallback />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none bg-transparent ${className}`}
      style={{ touchAction: 'none', background: 'transparent' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="img"
      aria-label="3D Living Digital Earth — ANTAH Civic Intelligence Telemetry Network"
    >
      <WebGLErrorBoundary fallback={<SignalOrbCSSFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6.4], fov: 46 }}
          dpr={deviceTier.dpr}
          frameloop={isActive ? 'always' : 'never'}
          gl={{
            antialias: !deviceTier.isLowPower,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            precision: deviceTier.isLowPower ? 'mediump' : 'highp',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          style={{ background: 'transparent' }}
          className="w-full h-full bg-transparent"
        >
          <Scene interactionRef={interactionRef} isActive={isActive} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
});

export default SignalOrbCanvas;
