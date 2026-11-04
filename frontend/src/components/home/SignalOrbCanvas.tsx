import React, { useRef, useMemo, useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { detectDeviceTier } from '../../utils/device';

// Pre-allocated reusable matrix and vectors to avoid per-frame GC allocations
const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const tempScale = new THREE.Vector3();
const tempRot = new THREE.Quaternion();

// Fibonacci sphere distribution for harmonious signal points across the orb
function generateFibonacciPoints(count: number, radius: number) {
  const points: { position: [number, number, number]; isKeySignal: boolean }[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const pointRadius = radius + (i % 5 === 0 ? 0.04 : 0.015);
    points.push({
      position: [x * pointRadius, y * pointRadius, z * pointRadius],
      isKeySignal: i % 7 === 0 || i === 12 || i === 34,
    });
  }
  return points;
}

// Pre-calculated Arc Data structure with cached curves and geometries
interface CachedArc {
  curve: THREE.QuadraticBezierCurve3;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  phaseOffset: number;
  speed: number;
}

function SignalOrb() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const keyNodesRef = useRef<THREE.InstancedMesh>(null);
  const regularNodesRef = useRef<THREE.InstancedMesh>(null);

  // Device tier adaptation
  const deviceTier = useMemo(() => detectDeviceTier(), []);
  const radius = 2.05;

  // 1. Generate Fibonacci Points (memoized once)
  const signalPoints = useMemo(() => generateFibonacciPoints(56, radius), [radius]);
  const keySignals = useMemo(() => signalPoints.filter((p) => p.isKeySignal), [signalPoints]);
  const regularSignals = useMemo(() => signalPoints.filter((p) => !p.isKeySignal), [signalPoints]);

  // 2. Pre-generate Arc Geometries & Materials (Single allocation, reused across all frames)
  const arcsData = useMemo<CachedArc[]>(() => {
    const pairs = [
      { start: signalPoints[8].position, end: signalPoints[24].position, phaseOffset: 0.0, speed: 1.1 },
      { start: signalPoints[18].position, end: signalPoints[35].position, phaseOffset: 1.6, speed: 1.3 },
      { start: signalPoints[32].position, end: signalPoints[48].position, phaseOffset: 3.2, speed: 0.9 },
      { start: signalPoints[5].position, end: signalPoints[42].position, phaseOffset: 4.8, speed: 1.2 },
    ];

    return pairs.map(({ start, end, phaseOffset, speed }) => {
      const p1 = new THREE.Vector3(...start);
      const p2 = new THREE.Vector3(...end);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      if (mid.length() > 0.001) {
        mid.normalize().multiplyScalar(2.36);
      }
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const pts = curve.getPoints(28);
      const geometry = new THREE.BufferGeometry().setFromPoints(pts);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color('#E7A65B'),
        transparent: true,
        opacity: 0.5,
      });

      return { curve, geometry, material, phaseOffset, speed };
    });
  }, [signalPoints]);

  // Traveling pulse meshes refs
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  // 3. Initialize Instanced Meshes for Signal Nodes (Zero per-frame allocation)
  useEffect(() => {
    if (keyNodesRef.current) {
      keySignals.forEach((pt, i) => {
        tempPos.set(pt.position[0], pt.position[1], pt.position[2]);
        tempScale.set(1, 1, 1);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        keyNodesRef.current!.setMatrixAt(i, tempMatrix);
      });
      keyNodesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (regularNodesRef.current) {
      regularSignals.forEach((pt, i) => {
        tempPos.set(pt.position[0], pt.position[1], pt.position[2]);
        tempScale.set(1, 1, 1);
        tempRot.identity();
        tempMatrix.compose(tempPos, tempRot, tempScale);
        regularNodesRef.current!.setMatrixAt(i, tempMatrix);
      });
      regularNodesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [keySignals, regularSignals]);

  // Clean up geometries and materials on unmount
  useEffect(() => {
    return () => {
      arcsData.forEach((arc) => {
        arc.geometry.dispose();
        arc.material.dispose();
      });
    };
  }, [arcsData]);

  // Shared pulse node geometry & material
  const pulseGeometry = useMemo(() => new THREE.SphereGeometry(0.036, 8, 8), []);
  const pulseMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#FFD188', transparent: true, opacity: 0.95 }),
    []
  );

  // 4. UNIFIED SINGLE ANIMATION LOOP (Strictly 1 loop for all components, refs only, zero React state)
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { pointer } = state;

    if (groupRef.current) {
      // Smooth dampened pointer tracking + slow ambient rotation
      const targetRotX = pointer.y * 0.26;
      const targetRotY = t * 0.11 + pointer.x * 0.42;

      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotX,
        3.5,
        delta
      );
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotY,
        3.5,
        delta
      );

      // Organic hover float
      groupRef.current.position.y = Math.sin(t * 1.1) * 0.055;
    }

    // Warm internal core breathing glow
    if (coreRef.current) {
      const corePulse = 1.0 + Math.sin(t * 1.8) * 0.06;
      coreRef.current.scale.set(corePulse, corePulse, corePulse);
    }

    if (innerGlowRef.current) {
      const glowPulse = 1.0 + Math.sin(t * 1.4 + 0.8) * 0.04;
      innerGlowRef.current.scale.set(glowPulse, glowPulse, glowPulse);
    }

    // Update Arc lines and traveling pulse positions in the same loop
    arcsData.forEach((arc, idx) => {
      const arcT = t * arc.speed + arc.phaseOffset;
      // Pulse opacity
      arc.material.opacity = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(arcT));

      // Traveling pulse along the arc
      const pulseMesh = pulseRefs.current[idx];
      if (pulseMesh) {
        const progress = (arcT * 0.35) % 1;
        const pos = arc.curve.getPoint(progress);
        pulseMesh.position.copy(pos);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* 1. Deep Inner Luminous Heart (Intense Warmth) */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[0.62, 24, 24]} />
        <meshBasicMaterial color="#FFECB3" transparent opacity={0.9} />
      </mesh>

      {/* 2. Primary Subsurface Amber Glow Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.65} />
      </mesh>

      {/* Consolidated Internal Core Point Light - Warm radiance with zero shadow overhead */}
      <pointLight color="#F97316" intensity={3.6} distance={6.5} decay={2} />

      {/* 3. Translucent Frosted Ivory Outer Orb Shell (Adaptive Quality) */}
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        {deviceTier.isLowPower ? (
          // Balanced/Low-Power Tier: Highly efficient MeshStandardMaterial with subsurface emissive feel
          <meshStandardMaterial
            color="#FAF8F5"
            emissive="#FFEEDD"
            emissiveIntensity={0.25}
            roughness={0.28}
            metalness={0.02}
            transparent={true}
            opacity={0.95}
          />
        ) : (
          // High Tier: Physical Material with soft transmission & roughness
          <meshPhysicalMaterial
            color="#FAF8F5"
            emissive="#FFF3E0"
            emissiveIntensity={0.16}
            roughness={0.24}
            metalness={0.03}
            transmission={0.65}
            thickness={1.6}
            ior={1.36}
            transparent={true}
            opacity={0.94}
          />
        )}
      </mesh>

      {/* 4. Surface Signal Nodes: Rendered via InstancedMesh (Reduced from 64 draw calls to 2) */}
      {/* Key Signal Nodes (Emerald-Teal) */}
      <instancedMesh
        ref={keyNodesRef}
        args={[undefined, undefined, keySignals.length]}
      >
        <sphereGeometry args={[0.034, 10, 10]} />
        <meshBasicMaterial color="#0D9488" transparent opacity={0.95} />
      </instancedMesh>

      {/* Standard Signal Nodes (Warm Amber) */}
      <instancedMesh
        ref={regularNodesRef}
        args={[undefined, undefined, regularSignals.length]}
      >
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#E7A65B" transparent opacity={0.78} />
      </instancedMesh>

      {/* 5. Animated Signal Relationship Threads (Pre-allocated Arcs & Pulses) */}
      <group>
        {arcsData.map((arc, idx) => (
          <group key={idx}>
            <primitive object={new THREE.Line(arc.geometry, arc.material)} />
            <mesh
              ref={(el) => (pulseRefs.current[idx] = el)}
              geometry={pulseGeometry}
              material={pulseMaterial}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

// Scene Setup with Key, Fill & Soft Lighting
function Scene() {
  return (
    <>
      <ambientLight intensity={1.2} color="#FFFBF0" />
      <directionalLight position={[6, 8, 5]} intensity={2.2} color="#FFF8E7" />
      <directionalLight position={[-5, -3, -4]} intensity={0.9} color="#E0F2FE" />

      {/* Centered Floating Orb with single unified animation loop */}
      <SignalOrb />

      {/* 
        High-Performance Soft Contact Shadow:
        frames={1} renders the shadow texture ONCE at startup and caches the texture,
        saving 60 expensive shadow FBO render passes per second!
      */}
      <ContactShadows
        position={[0, -2.6, 0]}
        opacity={0.38}
        scale={7.5}
        blur={2.4}
        far={5.0}
        color="#2E2822"
        frames={1}
        resolution={512}
      />
    </>
  );
}

// Resilient WebGL Error Boundary with Pure CSS / SVG Glow Fallback
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
      <div
        className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full shadow-[inset_0_0_60px_rgba(255,255,255,0.8),0_20px_60px_rgba(231,166,91,0.35)] animate-pulse"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FEEBC8 30%, #F6AD55 65%, #DD6B20 100%)',
          animationDuration: '4s',
        }}
      >
        <div
          className="absolute inset-8 rounded-full blur-md opacity-75"
          style={{
            background: 'radial-gradient(circle, #FFFBEB 10%, #F59E0B 70%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full opacity-60" viewBox="0 0 200 200">
            <circle cx="85" cy="70" r="3" fill="#0D9488" />
            <circle cx="120" cy="95" r="2.5" fill="#D97706" />
            <circle cx="65" cy="115" r="3" fill="#0D9488" />
            <circle cx="140" cy="130" r="2" fill="#D97706" />
            <path
              d="M 85 70 Q 105 50 120 95"
              stroke="#D97706"
              strokeWidth="1"
              fill="transparent"
              strokeDasharray="2,2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export interface SignalOrbCanvasProps {
  className?: string;
}

export const SignalOrbCanvas: React.FC<SignalOrbCanvasProps> = ({ className = '' }) => {
  const [webglSupported, setWebglSupported] = useState(true);

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

  if (!webglSupported) {
    return (
      <div className={`w-full h-full relative ${className}`}>
        <SignalOrbCSSFallback />
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <WebGLErrorBoundary fallback={<SignalOrbCSSFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          className="w-full h-full"
        >
          <Scene />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};

export default SignalOrbCanvas;
