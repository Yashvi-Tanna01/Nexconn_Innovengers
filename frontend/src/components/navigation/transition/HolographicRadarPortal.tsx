import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HolographicRadarPortal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 190;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.6, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sweepLight = new THREE.PointLight(0x54d8c4, 3.5, 6);
    sweepLight.position.set(0, 1.2, 0);
    scene.add(sweepLight);

    const goldPulseLight = new THREE.PointLight(0xf5c77d, 2.0, 5);
    goldPulseLight.position.set(0, 0.5, 0);
    scene.add(goldPulseLight);

    // 3. Radar Root Group (Tilted for 3D Holographic Depth)
    const radarGroup = new THREE.Group();
    radarGroup.scale.set(0.01, 0.01, 0.01);
    scene.add(radarGroup);

    // Translucent holographic base disc
    const discGeo = new THREE.CircleGeometry(1.65, 48);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x064c3b,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = -Math.PI / 2;
    radarGroup.add(discMesh);

    // Concentric Layered Rings
    const ringRadii = [0.55, 1.1, 1.65];
    const ringColors = [0x54d8c4, 0xa7e8d3, 0x087b56];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.015, r + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[idx],
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.01 * (idx + 1);
      radarGroup.add(ringMesh);
    });

    // Polar Grid Lines (Crosshairs)
    const crossGeo = new THREE.BufferGeometry();
    const crossCoords = [
      -1.65, 0, 0,  1.65, 0, 0,
      0, 0, -1.65,  0, 0, 1.65,
      -1.16, 0, -1.16,  1.16, 0, 1.16,
      -1.16, 0, 1.16,   1.16, 0, -1.16,
    ];
    crossGeo.setAttribute('position', new THREE.Float32BufferAttribute(crossCoords, 3));
    const crossMat = new THREE.LineBasicMaterial({
      color: 0x087b56,
      transparent: true,
      opacity: 0.35,
    });
    const crossLines = new THREE.LineSegments(crossGeo, crossMat);
    crossLines.position.y = 0.02;
    radarGroup.add(crossLines);

    // Rotating Scanning Wedge (Turquoise Sector)
    const sweepGeo = new THREE.CircleGeometry(1.64, 32, 0, Math.PI * 0.32);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0x54d8c4,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
    sweepMesh.rotation.x = -Math.PI / 2;
    sweepMesh.position.y = 0.03;
    radarGroup.add(sweepMesh);

    // 4. Luminous Location Points on the Radar
    const signalNodesData = [
      { r: 0.85, a: 0.6, label: 'SIG-1' },
      { r: 1.35, a: 1.4, label: 'SIG-2' },
      { r: 0.72, a: 2.5, label: 'SIG-3' },
      { r: 1.45, a: 3.2, label: 'SIG-4' },
      { r: 1.05, a: 4.1, label: 'SIG-5' },
      { r: 0.60, a: 5.2, label: 'SIG-6' },
      { r: 1.50, a: 5.8, label: 'SIG-7' },
    ];

    const signalMeshes: { mesh: THREE.Mesh; angle: number; r: number; baseScale: number }[] = [];
    const signalPositions: THREE.Vector3[] = [];

    signalNodesData.forEach((item) => {
      const x = Math.cos(item.a) * item.r;
      const z = Math.sin(item.a) * item.r;
      const pos = new THREE.Vector3(x, 0.05, z);
      signalPositions.push(pos);

      // Node sphere
      const nodeGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0x54d8c4,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      radarGroup.add(nodeMesh);

      signalMeshes.push({ mesh: nodeMesh, angle: item.a, r: item.r, baseScale: 1 });
    });

    // Connecting Lines between neighbor signal points
    const connIndices = [
      0, 1,
      1, 2,
      2, 3,
      3, 4,
      4, 5,
      5, 6,
      6, 0,
    ];
    const connCoords: number[] = [];
    for (let i = 0; i < connIndices.length; i += 2) {
      const p1 = signalPositions[connIndices[i]];
      const p2 = signalPositions[connIndices[i + 1]];
      connCoords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute('position', new THREE.Float32BufferAttribute(connCoords, 3));
    const connMat = new THREE.LineBasicMaterial({
      color: 0xa7e8d3,
      transparent: true,
      opacity: 0.45,
    });
    const connLines = new THREE.LineSegments(connGeo, connMat);
    radarGroup.add(connLines);

    // 5. Golden Signal Pulse Ring (Expands outward from center)
    const pulseGeo = new THREE.RingGeometry(0.1, 0.14, 48);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xf5c77d,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.rotation.x = -Math.PI / 2;
    pulseMesh.position.y = 0.06;
    radarGroup.add(pulseMesh);

    // 6. Floating Ambient Holographic Particles
    const dustCount = 35;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 3;
      dustPos[i + 1] = Math.random() * 1.5;
      dustPos[i + 2] = (Math.random() - 0.5) * 3;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x54d8c4,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    radarGroup.add(dustPoints);

    // 7. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Stage 1 & 2: Expansion of holographic radar layers from central point
      const scaleProg = Math.min(1, elapsed / 0.55);
      const easedScale = 1 - Math.pow(1 - scaleProg, 3);
      radarGroup.scale.set(easedScale, easedScale, easedScale);

      // Stage 3: Smooth rotation of the scanning beam
      const sweepAngle = elapsed * 2.8;
      sweepMesh.rotation.z = -sweepAngle;

      // Sweep light coordinates follow the beam edge
      sweepLight.position.x = Math.cos(sweepAngle) * 0.9;
      sweepLight.position.z = Math.sin(sweepAngle) * 0.9;

      // Stage 4: Light up signal points when beam passes
      const normalizedSweep = (sweepAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      signalMeshes.forEach((item) => {
        const diff = Math.abs(normalizedSweep - item.angle);
        const isNear = diff < 0.4 || diff > (Math.PI * 2 - 0.4);
        const targetScale = isNear ? 1.7 : 1.0;
        item.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
        const mat = item.mesh.material as THREE.MeshBasicMaterial;
        mat.color.setHex(isNear ? 0xf5c77d : 0x54d8c4);
      });

      // Stage 6: Golden signal pulse cycle
      const pulseCycle = (elapsed * 1.2) % 2.0;
      if (pulseCycle < 1.4) {
        const pScale = 0.2 + (pulseCycle / 1.4) * 11;
        pulseMesh.scale.set(pScale, pScale, pScale);
        pulseMat.opacity = Math.max(0, 0.75 * (1 - pulseCycle / 1.4));
        pulseMesh.visible = true;
      } else {
        pulseMesh.visible = false;
      }

      // Gentle floating tilt
      radarGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      discGeo.dispose();
      discMat.dispose();
      crossGeo.dispose();
      crossMat.dispose();
      sweepGeo.dispose();
      sweepMat.dispose();
      connGeo.dispose();
      connMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-[240px] h-[190px] sm:w-[260px] sm:h-[200px] flex items-center justify-center relative select-none"
      aria-hidden="true"
    />
  );
};

export default HolographicRadarPortal;

