import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CommunicationPortal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 190;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const interiorEmeraldLight = new THREE.PointLight(0x087b56, 3.8, 6);
    interiorEmeraldLight.position.set(0, 0, 1.0);
    scene.add(interiorEmeraldLight);

    const turquoiseHighlight = new THREE.PointLight(0x54d8c4, 2.6, 7);
    turquoiseHighlight.position.set(1.5, 1.2, 2.2);
    scene.add(turquoiseHighlight);

    const goldAccent = new THREE.PointLight(0xf5c77d, 2.0, 5);
    goldAccent.position.set(-1.2, -0.8, 1.8);
    scene.add(goldAccent);

    // 3. Central Speech Bubble Group
    const portalGroup = new THREE.Group();
    portalGroup.scale.set(0.01, 0.01, 0.01);
    scene.add(portalGroup);

    // Create 3D Extruded Speech Bubble Shape
    const bubbleShape = new THREE.Shape();
    const w = 1.6;
    const h = 1.1;
    const r = 0.35;
    // Rounded rect body with bottom-left pointer tail
    bubbleShape.moveTo(-w / 2 + r, -h / 2);
    // Bottom edge with tail
    bubbleShape.lineTo(-0.2, -h / 2);
    bubbleShape.lineTo(-0.55, -h / 2 - 0.38); // tail tip
    bubbleShape.lineTo(-0.4, -h / 2);
    bubbleShape.lineTo(-w / 2 + r, -h / 2);
    // Bottom-left corner
    bubbleShape.absarc(-w / 2 + r, -h / 2 + r, r, -Math.PI / 2, Math.PI, true);
    // Left edge & Top-left corner
    bubbleShape.lineTo(-w / 2, h / 2 - r);
    bubbleShape.absarc(-w / 2 + r, h / 2 - r, r, Math.PI, Math.PI / 2, true);
    // Top edge & Top-right corner
    bubbleShape.lineTo(w / 2 - r, h / 2);
    bubbleShape.absarc(w / 2 - r, h / 2 - r, r, Math.PI / 2, 0, true);
    // Right edge & Bottom-right corner
    bubbleShape.lineTo(w / 2, -h / 2 + r);
    bubbleShape.absarc(w / 2 - r, -h / 2 + r, r, 0, -Math.PI / 2, true);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const bubbleGeo = new THREE.ExtrudeGeometry(bubbleShape, extrudeSettings);
    bubbleGeo.center();

    // Translucent 3D Glass Material
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xa7e8d3,
      transparent: true,
      opacity: 0.42,
      roughness: 0.08,
      metalness: 0.12,
      transmission: 0.72,
      ior: 1.35,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const bubbleMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
    portalGroup.add(bubbleMesh);

    // 4. Three Luminous Harmonic Communication Orbs inside Bubble
    const orbGroup = new THREE.Group();
    portalGroup.add(orbGroup);

    const orbColors = [0x54d8c4, 0xf5c77d, 0x087b56];
    const orbMeshes: { mesh: THREE.Mesh; baseX: number; phase: number }[] = [];
    const orbGeo = new THREE.SphereGeometry(0.09, 20, 20);

    [-0.45, 0.0, 0.45].forEach((baseX, idx) => {
      const oMat = new THREE.MeshStandardMaterial({
        color: orbColors[idx],
        emissive: orbColors[idx],
        emissiveIntensity: 0.85,
        roughness: 0.2,
      });
      const oMesh = new THREE.Mesh(orbGeo, oMat);
      oMesh.position.set(baseX, 0, 0.05);
      orbGroup.add(oMesh);
      orbMeshes.push({ mesh: oMesh, baseX, phase: idx * 0.85 });
    });

    // 5. Coalescing Turquoise Particle Cloud
    const particleCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 3;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      pVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x54d8c4,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleCloud = new THREE.Points(pGeo, pMat);
    scene.add(particleCloud);

    // 6. Expanding Communication Waveform Rings
    const waveRings: { mesh: THREE.Mesh; scale: number; speed: number }[] = [];
    const ringGeo = new THREE.TorusGeometry(0.7, 0.015, 12, 48);

    for (let rIdx = 0; rIdx < 2; rIdx++) {
      const rMat = new THREE.MeshBasicMaterial({
        color: rIdx === 0 ? 0x54d8c4 : 0xa7e8d3,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, rMat);
      portalGroup.add(ringMesh);
      waveRings.push({
        mesh: ringMesh,
        scale: 0.4 + rIdx * 0.4,
        speed: 0.9 + rIdx * 0.2,
      });
    }

    // 7. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Stage 1 & 2: Expansion of speech bubble
      const scaleProg = Math.min(1, elapsed / 0.55);
      const easedScale = 1 - Math.pow(1 - scaleProg, 3);
      portalGroup.scale.set(easedScale, easedScale, easedScale);

      // Stage 3 & 4: Harmonic floating motion of communication particles inside
      orbMeshes.forEach((item) => {
        const floatY = Math.sin(elapsed * 4.2 + item.phase) * 0.12;
        const floatZ = Math.cos(elapsed * 3.5 + item.phase) * 0.06;
        item.mesh.position.y = floatY;
        item.mesh.position.z = 0.05 + floatZ;
      });

      // Stage 5 & 6: Communication rings expanding
      waveRings.forEach((wave, idx) => {
        wave.scale += wave.speed * 0.018;
        if (wave.scale > 2.4) {
          wave.scale = 0.5;
        }
        wave.mesh.scale.set(wave.scale, wave.scale, wave.scale);
        const wMat = wave.mesh.material as THREE.MeshBasicMaterial;
        wMat.opacity = Math.max(0, 0.65 * (1 - (wave.scale - 0.5) / 1.9));
      });

      // Swirling particles in cloud
      const posArray = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += pVelocities[i].x;
        posArray[i * 3 + 1] += pVelocities[i].y;
        posArray[i * 3 + 2] += pVelocities[i].z;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Gentle floating tilt of bubble
      portalGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.14;
      portalGroup.rotation.x = Math.cos(elapsed * 1.2) * 0.08;

      // Interior light pulsation
      interiorEmeraldLight.intensity = 2.8 + Math.sin(elapsed * 5) * 0.9;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      bubbleGeo.dispose();
      bubbleMat.dispose();
      orbGeo.dispose();
      pGeo.dispose();
      pMat.dispose();
      ringGeo.dispose();
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

export default CommunicationPortal;

