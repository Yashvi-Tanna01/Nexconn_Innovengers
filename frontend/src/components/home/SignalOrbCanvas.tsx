import React, { useRef, useMemo, useState, useEffect, Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { detectDeviceTier } from '../../utils/device';

// Reusable scratch vectors, matrices, and colors to prevent per-frame GC allocations
const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const tempScale = new THREE.Vector3();
const tempRot = new THREE.Quaternion();

// Spherical coordinates (lat, lon in degrees) to Cartesian Vector3
function latLonToVector3(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Fibonacci sphere distribution for harmonious citizen observations across the orb
function generateFibonacciPoints(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    // Slight altitude variation for organic depth
    const alt = radius + (i % 4 === 0 ? 0.025 : 0.012);
    points.push(new THREE.Vector3(x * alt, y * alt, z * alt));
  }
  return points;
}

// Pre-calculated Arc Data with 3D quadratic curve and traveling pulse
interface CachedNetworkArc {
  curve: THREE.QuadraticBezierCurve3;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  phaseOffset: number;
  speed: number;
  color: string;
}

interface SignalOrbProps {
  reducedMotion?: boolean;
  interactionRef: React.MutableRefObject<{
    isDragging: boolean;
    dragVelocity: { x: number; y: number };
    rotationOffset: { x: number; y: number };
  }>;
}

function SignalOrb({ reducedMotion = false, interactionRef }: SignalOrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerHeartRef = useRef<THREE.Mesh>(null);
  const coreMotesRef = useRef<THREE.InstancedMesh>(null);
  const ambientMotesRef = useRef<THREE.InstancedMesh>(null);

  // Network node instanced mesh refs
  const amberNodesRef = useRef<THREE.InstancedMesh>(null);
  const tealNodesRef = useRef<THREE.InstancedMesh>(null);
  const hubNodeRef = useRef<THREE.Mesh>(null);
  const beaconRing1Ref = useRef<THREE.Mesh>(null);
  const beaconRing2Ref = useRef<THREE.Mesh>(null);

  // Orbital satellites
  const sat1Ref = useRef<THREE.Mesh>(null);
  const sat2Ref = useRef<THREE.Mesh>(null);
  const sat3Ref = useRef<THREE.Mesh>(null);
  const sat3TrailRef = useRef<THREE.Mesh>(null);

  // Traveling pulses along arcs
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Device tier adaptation
  const deviceTier = useMemo(() => detectDeviceTier(), []);
  const radius = 1.85;

  // 1. Structured Civic Intelligence Nodes
  const { hubPos, hubNormal, tealPoints, amberPoints } = useMemo(() => {
    // Primary Civic Hub: Bangalore East Central Infrastructure Node
    const hub = latLonToVector3(18, 38, radius + 0.035);
    const normal = hub.clone().normalize();

    // Correlated Sector Clusters (Teal)
    const teals: THREE.Vector3[] = [
      latLonToVector3(25, 48, radius + 0.025),
      latLonToVector3(12, 52, radius + 0.025),
      latLonToVector3(22, 24, radius + 0.025),
      latLonToVector3(8, 30, radius + 0.025),
      // Sector 3 Water/Culvert Cluster
      latLonToVector3(-18, 92, radius + 0.025),
      latLonToVector3(-12, 102, radius + 0.025),
      latLonToVector3(-24, 84, radius + 0.025),
      // 100 Ft Rd Municipal Cluster
      latLonToVector3(34, -45, radius + 0.025),
      latLonToVector3(42, -38, radius + 0.025),
      latLonToVector3(28, -55, radius + 0.025),
      // Regional Telemetry Beacons
      latLonToVector3(-35, -30, radius + 0.025),
      latLonToVector3(50, 110, radius + 0.025),
    ];

    // Citizen Observation Nodes (Warm Amber distributed across the globe)
    const ambers = generateFibonacciPoints(deviceTier.isLowPower ? 26 : 38, radius);

    return { hubPos: hub, hubNormal: normal, tealPoints: teals, amberPoints: ambers };
  }, [radius, deviceTier.isLowPower]);

  // Beacon ring quaternion for Hub tangent orientation
  const hubRingQuat = useMemo(() => {
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), hubNormal);
  }, [hubNormal]);

  // 2. Pre-calculated Great-Circle Network Connection Arcs
  const networkArcs = useMemo<CachedNetworkArc[]>(() => {
    const connections: { start: THREE.Vector3; end: THREE.Vector3; alt: number; color: string; speed: number; phase: number }[] = [
      // Primary Hub to neighboring cluster nodes
      { start: hubPos, end: tealPoints[0], alt: 0.16, color: '#0D9488', speed: 1.2, phase: 0.0 },
      { start: hubPos, end: tealPoints[1], alt: 0.18, color: '#0D9488', speed: 1.4, phase: 1.2 },
      { start: hubPos, end: tealPoints[2], alt: 0.15, color: '#0D9488', speed: 1.1, phase: 2.4 },
      { start: hubPos, end: tealPoints[3], alt: 0.17, color: '#0D9488', speed: 1.3, phase: 3.6 },
      // Cluster to Cluster long-distance telemetry trunks
      { start: hubPos, end: tealPoints[4], alt: 0.38, color: '#D97706', speed: 0.85, phase: 0.8 },
      { start: tealPoints[4], end: tealPoints[5], alt: 0.14, color: '#0D9488', speed: 1.3, phase: 2.1 },
      { start: tealPoints[4], end: tealPoints[6], alt: 0.16, color: '#E7A65B', speed: 1.1, phase: 3.9 },
      { start: hubPos, end: tealPoints[7], alt: 0.36, color: '#0D9488', speed: 0.9, phase: 1.7 },
      { start: tealPoints[7], end: tealPoints[8], alt: 0.15, color: '#D97706', speed: 1.2, phase: 3.1 },
      // Citizen observations connected into local clusters
      { start: amberPoints[2], end: tealPoints[2], alt: 0.14, color: '#E7A65B', speed: 1.0, phase: 4.2 },
      { start: amberPoints[8], end: tealPoints[0], alt: 0.15, color: '#E7A65B', speed: 1.15, phase: 0.5 },
      { start: amberPoints[14], end: tealPoints[10], alt: 0.22, color: '#0D9488', speed: 0.95, phase: 2.8 },
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
        opacity: 0.6,
      });

      return { curve, geometry, material, speed, phaseOffset: phase, color };
    });
  }, [hubPos, tealPoints, amberPoints, radius, deviceTier.isLowPower]);

  // Clean up arc geometries and materials on unmount
  useEffect(() => {
    return () => {
      networkArcs.forEach((arc) => {
        arc.geometry.dispose();
        arc.material.dispose();
      });
    };
  }, [networkArcs]);

  // 3. Coordinate Telemetry Grid Lines (Equator, Parallels, Meridians)
  const gridGeometries = useMemo(() => {
    const geoms: { geometry: THREE.BufferGeometry; color: string; opacity: number }[] = [];
    const segments = deviceTier.isLowPower ? 48 : 64;

    // Equator line
    const eqPts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const th = (i / segments) * Math.PI * 2;
      eqPts.push(new THREE.Vector3((radius + 0.006) * Math.cos(th), 0, (radius + 0.006) * Math.sin(th)));
    }
    geoms.push({
      geometry: new THREE.BufferGeometry().setFromPoints(eqPts),
      color: '#0D9488',
      opacity: 0.32,
    });

    // Parallels (+0.75 and -0.75)
    [-0.8, 0.8].forEach((yVal) => {
      const pts: THREE.Vector3[] = [];
      const r = Math.sqrt(Math.max(0, radius * radius - yVal * yVal)) + 0.006;
      for (let i = 0; i <= segments; i++) {
        const th = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(th), yVal, r * Math.sin(th)));
      }
      geoms.push({
        geometry: new THREE.BufferGeometry().setFromPoints(pts),
        color: '#CBD5E1',
        opacity: 0.18,
      });
    });

    // Meridians (Longitudes at 0°, 45°, 90°, 135°)
    [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach((rotY) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const th = (i / segments) * Math.PI * 2;
        const x = (radius + 0.006) * Math.sin(th);
        const y = (radius + 0.006) * Math.cos(th);
        pts.push(new THREE.Vector3(x * Math.cos(rotY), y, x * Math.sin(rotY)));
      }
      geoms.push({
        geometry: new THREE.BufferGeometry().setFromPoints(pts),
        color: '#94A3B8',
        opacity: 0.15,
      });
    });

    return geoms;
  }, [radius, deviceTier.isLowPower]);

  useEffect(() => {
    return () => {
      gridGeometries.forEach((g) => g.geometry.dispose());
    };
  }, [gridGeometries]);

  // 4. Orbital System Ring Lines & Ribbons
  const orbitalRingsData = useMemo(() => {
    const ringSegments = deviceTier.isLowPower ? 48 : 64;

    // Ring 1: Equatorial Intelligence Orbit (Radius 2.52)
    const r1Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const th = (i / ringSegments) * Math.PI * 2;
      r1Pts.push(new THREE.Vector3(2.52 * Math.cos(th), 0, 2.52 * Math.sin(th)));
    }
    const r1Geom = new THREE.BufferGeometry().setFromPoints(r1Pts);

    // Ring 2: Oblique Telemetry Orbit (Radius 2.78)
    const r2Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const th = (i / ringSegments) * Math.PI * 2;
      r2Pts.push(new THREE.Vector3(2.78 * Math.cos(th), 0, 2.78 * Math.sin(th)));
    }
    const r2Geom = new THREE.BufferGeometry().setFromPoints(r2Pts);

    // Ring 3: Outer Horizon Orbit (Radius 3.02)
    const r3Pts: THREE.Vector3[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const th = (i / ringSegments) * Math.PI * 2;
      r3Pts.push(new THREE.Vector3(3.02 * Math.cos(th), 0, 3.02 * Math.sin(th)));
    }
    const r3Geom = new THREE.BufferGeometry().setFromPoints(r3Pts);

    return { r1Geom, r2Geom, r3Geom };
  }, [deviceTier.isLowPower]);

  useEffect(() => {
    return () => {
      orbitalRingsData.r1Geom.dispose();
      orbitalRingsData.r2Geom.dispose();
      orbitalRingsData.r3Geom.dispose();
    };
  }, [orbitalRingsData]);

  // 5. Pre-generate Core Motes & Ambient Motes Data
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
    const count = deviceTier.isLowPower ? 16 : 28;
    const pts: { pos: THREE.Vector3; speed: number; offset: number }[] = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const dist = 2.2 + (i % 5) * 0.22;
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

    if (tealNodesRef.current) {
      tealPoints.forEach((pt, i) => {
        tempPos.copy(pt);
        tempScale.set(1, 1, 1);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        tealNodesRef.current!.setMatrixAt(i, tempMatrix);
      });
      tealNodesRef.current.instanceMatrix.needsUpdate = true;
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
  }, [amberPoints, tealPoints, ambientMotesData]);

  // 6. UNIFIED ANIMATION LOOP (Strictly 1 animation loop, zero allocations per frame)
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { pointer } = state;
    const interaction = interactionRef.current;

    // A. Smooth Drag & Inertia Deceleration + Ambient Rotation
    if (!interaction.isDragging) {
      interaction.rotationOffset.x += interaction.dragVelocity.x;
      interaction.rotationOffset.y += interaction.dragVelocity.y;
      // Gentle friction decay
      interaction.dragVelocity.x *= 0.93;
      interaction.dragVelocity.y *= 0.93;
    }

    if (groupRef.current) {
      if (reducedMotion) {
        groupRef.current.rotation.set(0.12, 0.35, 0);
      } else {
        // Slow ambient planetary drift + user drag offset + pointer parallax
        const ambientY = t * 0.085;
        const targetRotX = interaction.rotationOffset.x + pointer.y * 0.22;
        const targetRotY = interaction.rotationOffset.y + ambientY + pointer.x * 0.38;

        groupRef.current.rotation.x = THREE.MathUtils.damp(
          groupRef.current.rotation.x,
          targetRotX,
          3.8,
          delta
        );
        groupRef.current.rotation.y = THREE.MathUtils.damp(
          groupRef.current.rotation.y,
          targetRotY,
          3.8,
          delta
        );

        // Organic levitation float
        groupRef.current.position.y = Math.sin(t * 1.1) * 0.045;
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

    // D. Primary Hub Beacon Pulse Waves
    if (beaconRing1Ref.current && beaconRing2Ref.current) {
      const p1 = (t * 0.75) % 1;
      const s1 = 0.5 + p1 * 2.2;
      beaconRing1Ref.current.scale.set(s1, s1, s1);
      (beaconRing1Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p1) * 0.85;

      const p2 = (t * 0.75 + 0.5) % 1;
      const s2 = 0.5 + p2 * 2.2;
      beaconRing2Ref.current.scale.set(s2, s2, s2);
      (beaconRing2Ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * 0.85;
    }

    // E. Traveling Signal Packets along Network Arcs
    networkArcs.forEach((arc, idx) => {
      const arcT = t * arc.speed + arc.phaseOffset;
      // Soft breathing opacity
      arc.material.opacity = 0.28 + 0.48 * (0.5 + 0.5 * Math.sin(arcT));

      const pulseMesh = pulseRefs.current[idx];
      if (pulseMesh) {
        const progress = (arcT * 0.28) % 1;
        const pos = arc.curve.getPoint(progress);
        pulseMesh.position.copy(pos);
        const pScale = 0.75 + 0.35 * Math.sin(progress * Math.PI);
        pulseMesh.scale.set(pScale, pScale, pScale);
      }
    });

    // F. Orbital Satellite Positions
    // Satellite 1 on Ring 1 (Equatorial)
    if (sat1Ref.current) {
      const a1 = t * 0.38;
      sat1Ref.current.position.set(2.52 * Math.cos(a1), 0, 2.52 * Math.sin(a1));
    }
    // Satellite 2 on Ring 1 (180 deg opposite)
    if (sat2Ref.current) {
      const a2 = t * 0.38 + Math.PI;
      sat2Ref.current.position.set(2.52 * Math.cos(a2), 0, 2.52 * Math.sin(a2));
    }
    // Satellite 3 on Ring 2 (Oblique Amber Orbit)
    if (sat3Ref.current) {
      const a3 = -t * 0.32;
      sat3Ref.current.position.set(2.78 * Math.cos(a3), 0, 2.78 * Math.sin(a3));

      if (sat3TrailRef.current) {
        const aTrail = a3 + 0.12;
        sat3TrailRef.current.position.set(2.78 * Math.cos(aTrail), 0, 2.78 * Math.sin(aTrail));
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. INNER ENERGY CORE (Volumetric Golden Nucleus) */}
      {/* Intense Golden Heart */}
      <mesh ref={innerHeartRef}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#FFFBEB" transparent opacity={0.95} />
      </mesh>

      {/* Volumetric Subsurface Amber Mantle */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.08, 32, 32]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.42} />
      </mesh>

      {/* Internal Core Swarm Particles */}
      <instancedMesh
        ref={coreMotesRef}
        args={[undefined, undefined, coreMotesData.count]}
      >
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshBasicMaterial color="#FEF3C7" transparent opacity={0.9} />
      </instancedMesh>

      {/* Internal Radiant Point Light */}
      <pointLight color="#F59E0B" intensity={3.5} distance={7.0} decay={2} />

      {/* 2. MAIN SPHERICAL BODY (Pearl-White Glass & Ceramic Mantle) */}
      <mesh>
        <sphereGeometry args={[radius, deviceTier.isLowPower ? 36 : 64, deviceTier.isLowPower ? 36 : 64]} />
        {deviceTier.isLowPower ? (
          // Low-Power Mobile Tier: Lightweight Standard Material with soft warm emissive glow
          <meshStandardMaterial
            color="#FFFDF9"
            emissive="#FED7AA"
            emissiveIntensity={0.22}
            roughness={0.28}
            metalness={0.03}
            transparent={true}
            opacity={0.94}
          />
        ) : (
          // High-Fidelity Desktop Tier: Physical Material with ceramic clearcoat & glass transmission
          <meshPhysicalMaterial
            color="#FFFDF9"
            emissive="#FFF7ED"
            emissiveIntensity={0.16}
            roughness={0.20}
            metalness={0.03}
            clearcoat={0.88}
            clearcoatRoughness={0.12}
            transmission={0.58}
            thickness={1.4}
            ior={1.40}
            transparent={true}
            opacity={0.94}
          />
        )}
      </mesh>

      {/* Atmospheric Fresnel Rim Halo (Subtle Cyan-Teal Luminous Perimeter) */}
      <mesh>
        <sphereGeometry args={[radius * 1.018, deviceTier.isLowPower ? 28 : 48, deviceTier.isLowPower ? 28 : 48]} />
        <meshStandardMaterial
          color="#CCFBF1"
          emissive="#0D9488"
          emissiveIntensity={0.18}
          roughness={0.15}
          metalness={0.05}
          transparent={true}
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 3. COORDINATE TELEMETRY GRID (Equator, Parallels, Meridians) */}
      <group>
        {gridGeometries.map((g, i) => (
          <primitive
            key={i}
            object={
              new THREE.Line(
                g.geometry,
                new THREE.LineBasicMaterial({
                  color: new THREE.Color(g.color),
                  transparent: true,
                  opacity: g.opacity,
                })
              )
            }
          />
        ))}
      </group>

      {/* 4. CONNECTED CIVIC INTELLIGENCE NETWORK */}
      {/* A. Citizen Observation Nodes (Warm Amber) */}
      <instancedMesh
        ref={amberNodesRef}
        args={[undefined, undefined, amberPoints.length]}
      >
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshBasicMaterial color="#E7A65B" transparent opacity={0.85} />
      </instancedMesh>

      {/* B. Correlated Civic Signals (Vibrant Teal) */}
      <instancedMesh
        ref={tealNodesRef}
        args={[undefined, undefined, tealPoints.length]}
      >
        <sphereGeometry args={[0.036, 10, 10]} />
        <meshBasicMaterial color="#0D9488" transparent opacity={0.95} />
      </instancedMesh>

      {/* C. Primary Central Hub Node (Bangalore East Civic Core) */}
      <mesh ref={hubNodeRef} position={hubPos}>
        <sphereGeometry args={[0.052, 14, 14]} />
        <meshBasicMaterial color="#286B56" />
      </mesh>
      {/* Inner Hub Amber Glimmer */}
      <mesh position={hubPos}>
        <sphereGeometry args={[0.026, 10, 10]} />
        <meshBasicMaterial color="#FEF3C7" />
      </mesh>

      {/* Expanding Radar Beacon Rings at Hub */}
      <mesh
        ref={beaconRing1Ref}
        position={hubPos.clone().multiplyScalar(1.006)}
        quaternion={hubRingQuat}
      >
        <ringGeometry args={[0.038, 0.056, 32]} />
        <meshBasicMaterial color="#0D9488" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        ref={beaconRing2Ref}
        position={hubPos.clone().multiplyScalar(1.008)}
        quaternion={hubRingQuat}
      >
        <ringGeometry args={[0.038, 0.056, 32]} />
        <meshBasicMaterial color="#E7A65B" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* D. Network Curved Connection Arcs & Traveling Pulses */}
      <group>
        {networkArcs.map((arc, idx) => (
          <group key={idx}>
            <primitive object={new THREE.Line(arc.geometry, arc.material)} />
            <mesh
              ref={(el) => (pulseRefs.current[idx] = el)}
              geometry={new THREE.SphereGeometry(0.036, 8, 8)}
              material={
                new THREE.MeshBasicMaterial({
                  color: arc.color === '#0D9488' ? '#5EEAD4' : '#FFD188',
                  transparent: true,
                  opacity: 0.95,
                })
              }
            />
          </group>
        ))}
      </group>

      {/* 5. CINEMATIC ORBITAL SYSTEMS */}
      {/* Orbital Ring 1: Equatorial Intelligence Orbit (Teal) */}
      <group rotation={[0.38, 0, -0.22]}>
        <primitive
          object={
            new THREE.Line(
              orbitalRingsData.r1Geom,
              new THREE.LineBasicMaterial({ color: '#0D9488', transparent: true, opacity: 0.35 })
            )
          }
        />
        {/* Soft Ribbon Backdrop */}
        <mesh>
          <ringGeometry args={[2.49, 2.55, deviceTier.isLowPower ? 36 : 64]} />
          <meshBasicMaterial color="#0D9488" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
        {/* Telemetry Satellites on Ring 1 */}
        <mesh ref={sat1Ref}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshBasicMaterial color="#0D9488" />
        </mesh>
        <mesh ref={sat2Ref}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#5EEAD4" />
        </mesh>
      </group>

      {/* Orbital Ring 2: Oblique Telemetry Orbit (Warm Amber) */}
      <group rotation={[-0.65, 0.45, 0.28]}>
        <primitive
          object={
            new THREE.Line(
              orbitalRingsData.r2Geom,
              new THREE.LineBasicMaterial({ color: '#E7A65B', transparent: true, opacity: 0.32 })
            )
          }
        />
        <mesh>
          <ringGeometry args={[2.75, 2.81, deviceTier.isLowPower ? 36 : 64]} />
          <meshBasicMaterial color="#E7A65B" transparent opacity={0.07} side={THREE.DoubleSide} />
        </mesh>
        {/* Satellite & Trail on Ring 2 */}
        <mesh ref={sat3Ref}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        <mesh ref={sat3TrailRef}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#FDE68A" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Orbital Ring 3: Outer Horizon Orbit (Muted Slate / Precision Tick Ring) */}
      <group rotation={[0.18, -0.75, 0.12]}>
        <primitive
          object={
            new THREE.Line(
              orbitalRingsData.r3Geom,
              new THREE.LineBasicMaterial({ color: '#94A3B8', transparent: true, opacity: 0.22 })
            )
          }
        />
      </group>

      {/* 6. AMBIENT COSMIC TELEMETRY STARDUST MOTES */}
      <instancedMesh
        ref={ambientMotesRef}
        args={[undefined, undefined, ambientMotesData.length]}
      >
        <sphereGeometry args={[0.016, 6, 6]} />
        <meshBasicMaterial color="#CBD5E1" transparent opacity={0.6} />
      </instancedMesh>
    </group>
  );
}

// Studio Lighting & Grounding Scene
interface SceneProps {
  reducedMotion?: boolean;
  interactionRef: React.MutableRefObject<{
    isDragging: boolean;
    dragVelocity: { x: number; y: number };
    rotationOffset: { x: number; y: number };
  }>;
}

function Scene({ reducedMotion, interactionRef }: SceneProps) {
  return (
    <>
      {/* Studio Lighting */}
      <ambientLight intensity={1.1} color="#FFFDF7" />
      {/* Key Warm Sun Light (Ceramic Specular Highlights) */}
      <directionalLight position={[6, 8, 6]} intensity={2.4} color="#FFF7ED" />
      {/* Cyan-Teal Backlight (Cinematic Rim Glow) */}
      <directionalLight position={[-6, -4, -6]} intensity={1.8} color="#2DD4BF" />
      {/* Gentle Fill */}
      <directionalLight position={[0, -5, 4]} intensity={0.6} color="#FFFBEB" />

      {/* Living Civic Intelligence Globe */}
      <SignalOrb reducedMotion={reducedMotion} interactionRef={interactionRef} />

      {/* Soft Hover Contact Shadow */}
      <ContactShadows
        position={[0, -2.42, 0]}
        opacity={0.36}
        scale={7.2}
        blur={2.2}
        far={4.8}
        color="#2E2822"
        frames={1}
        resolution={512}
      />
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

// High-Fidelity CSS / SVG Fallback for devices without WebGL
function SignalOrbCSSFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      <div className="absolute w-72 h-16 rounded-[100%] bg-stone-900/15 blur-2xl translate-y-36" />
      {/* Outer Ceramic Glass Sphere */}
      <div
        className="relative w-64 h-64 sm:w-76 sm:h-76 rounded-full shadow-[inset_0_0_50px_rgba(255,255,255,0.9),0_20px_50px_rgba(217,119,6,0.25)] flex items-center justify-center overflow-hidden border border-white/60"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FFFDF7 40%, #FEF3C7 75%, #FDE68A 100%)',
        }}
      >
        {/* Inner Amber Core Glow */}
        <div
          className="absolute w-36 h-36 rounded-full blur-xl opacity-75 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #FFFBEB 10%, #F59E0B 70%, transparent 100%)',
            animationDuration: '3s',
          }}
        />
        {/* Orbital Ring Graphic */}
        <div className="absolute inset-0 border-2 border-teal-500/30 rounded-full rotate-45 scale-95" />
        <div className="absolute inset-2 border border-amber-500/25 rounded-full -rotate-30 scale-90" />
        {/* Civic Network SVG Overlay */}
        <svg className="w-full h-full relative z-10" viewBox="0 0 200 200">
          <circle cx="100" cy="90" r="5" fill="#286B56" />
          <circle cx="100" cy="90" r="10" stroke="#0D9488" strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx="125" cy="75" r="3.5" fill="#0D9488" />
          <circle cx="80" cy="115" r="3" fill="#D97706" />
          <circle cx="135" cy="110" r="3.5" fill="#0D9488" />
          <circle cx="70" cy="75" r="2.5" fill="#D97706" />
          <path d="M 100 90 Q 115 78 125 75" stroke="#0D9488" strokeWidth="1.2" fill="transparent" />
          <path d="M 100 90 Q 90 105 80 115" stroke="#D97706" strokeWidth="1.2" fill="transparent" />
          <path d="M 100 90 Q 120 105 135 110" stroke="#0D9488" strokeWidth="1.2" fill="transparent" />
        </svg>
      </div>
    </div>
  );
}

export interface SignalOrbCanvasProps {
  className?: string;
}

export const SignalOrbCanvas: React.FC<SignalOrbCanvasProps> = ({ className = '' }) => {
  const [webglSupported, setWebglSupported] = useState(true);

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
      <div className={`w-full h-full relative ${className}`}>
        <SignalOrbCSSFallback />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="img"
      aria-label="3D Civic Intelligence Globe — ANTAH Connected Telemetry Network"
    >
      <WebGLErrorBoundary fallback={<SignalOrbCSSFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6.4], fov: 46 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          className="w-full h-full"
        >
          <Scene interactionRef={interactionRef} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};

export default SignalOrbCanvas;
