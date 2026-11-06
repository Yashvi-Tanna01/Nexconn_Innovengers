import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const EnergyFormationPortal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 190;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.4);

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

    const coreLight = new THREE.PointLight(0x087b56, 4.0, 8);
    coreLight.position.set(0, 0, 1.2);
    scene.add(coreLight);

    const goldAccentLight = new THREE.PointLight(0xf5c77d, 2.5, 6);
    goldAccentLight.position.set(1.5, 1.5, 2);
    scene.add(goldAccentLight);

    // 3. 3D Plus Icon Structure (Horizontal & Vertical Bars)
    const plusGroup = new THREE.Group();
    scene.add(plusGroup);

    const barMat = new THREE.MeshStandardMaterial({
      color: 0x087b56,
      emissive: 0x064c3b,
      roughness: 0.25,
      metalness: 0.35,
    });
    const vBarGeo = new THREE.BoxGeometry(0.32, 1.35, 0.24);
    const hBarGeo = new THREE.BoxGeometry(1.35, 0.32, 0.24);
    const vBar = new THREE.Mesh(vBarGeo, barMat);
    const hBar = new THREE.Mesh(hBarGeo, barMat);
    plusGroup.add(vBar);
    plusGroup.add(hBar);

    // Plus Outer Edge Glow
    const glowGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x54d8c4,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    plusGroup.add(glowMesh);

    // 4. Luminous Morphing Particle System (Swarm)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleOrigins: { x: number; y: number; z: number }[] = [];
    const particleVortexData: { angle: number; radius: number; speed: number; yOffset: number }[] = [];

    // Distribute initial particles across the Plus Cross layout
    for (let i = 0; i < particleCount; i++) {
      let x = 0;
      let y = 0;
      if (i < particleCount / 2) {
        // Vertical bar
        x = (Math.random() - 0.5) * 0.32;
        y = (Math.random() - 0.5) * 1.35;
      } else {
        // Horizontal bar
        x = (Math.random() - 0.5) * 1.35;
        y = (Math.random() - 0.5) * 0.32;
      }
      const z = (Math.random() - 0.5) * 0.24;
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
      particleOrigins.push({ x, y, z });

      particleVortexData.push({
        angle: Math.random() * Math.PI * 2,
        radius: 0.4 + Math.random() * 1.3,
        speed: 2.2 + Math.random() * 2.5,
        yOffset: (Math.random() - 0.5) * 1.2,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x54d8c4,
      size: 0.055,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Converged Energy Core (Emerald glowing sphere)
    const coreGeo = new THREE.SphereGeometry(0.48, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x54d8c4,
      transparent: true,
      opacity: 0,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Translucent Glass Sphere around Core
    const glassShellGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const glassShellMat = new THREE.MeshPhysicalMaterial({
      color: 0xa7e8d3,
      transparent: true,
      opacity: 0,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.75,
      ior: 1.25,
    });
    const glassShell = new THREE.Mesh(glassShellGeo, glassShellMat);
    scene.add(glassShell);

    // Expanding Energy Shockwave Ring
    const shockwaveGeo = new THREE.TorusGeometry(0.5, 0.024, 16, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x54d8c4,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveRing = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveRing.rotation.x = Math.PI / 2.8;
    scene.add(shockwaveRing);

    // 6. Animation Loop with Phased Choreography
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;
      const positions = particleGeo.attributes.position.array as Float32Array;

      // Phase 1 (0 to 0.45s): Plus appears, glows
      if (elapsed < 0.5) {
        const p1 = Math.min(1, elapsed / 0.4);
        const scale = 1 - Math.pow(1 - p1, 3);
        plusGroup.scale.set(scale, scale, scale);
        plusGroup.rotation.z = Math.sin(elapsed * 2) * 0.08;
        barMat.opacity = 1;
        glowMat.opacity = 0.25 * p1;
      }

      // Phase 2 (0.4s to 0.95s): Plus dissolves into swirling particles
      const dissolveProgress = Math.max(0, Math.min(1, (elapsed - 0.38) / 0.55));
      if (dissolveProgress > 0) {
        barMat.transparent = true;
        barMat.opacity = Math.max(0, 1 - dissolveProgress * 1.5);
        glowMat.opacity = Math.max(0, 0.25 * (1 - dissolveProgress));

        // Shift particle color from turquoise to golden/emerald mix
        particleMat.color.setHex(dissolveProgress > 0.5 ? 0xf5c77d : 0x54d8c4);
      }

      // Particle movement interpolation
      const convergeProgress = Math.max(0, Math.min(1, (elapsed - 0.85) / 0.45));

      for (let i = 0; i < particleCount; i++) {
        const vData = particleVortexData[i];
        vData.angle += vData.speed * 0.02;

        if (convergeProgress < 0.05) {
          // Swirling orbit outward
          const currentRadius = vData.radius * Math.min(1, elapsed / 0.7);
          positions[i * 3] = Math.cos(vData.angle) * currentRadius;
          positions[i * 3 + 1] = Math.sin(vData.angle) * currentRadius * 0.8 + Math.sin(elapsed * 4 + i) * 0.1;
          positions[i * 3 + 2] = Math.sin(vData.angle * 2) * 0.4;
        } else {
          // Accelerate and converge into core
          const collapse = 1 - Math.pow(convergeProgress, 2);
          const currentRadius = vData.radius * collapse;
          positions[i * 3] = Math.cos(vData.angle) * currentRadius;
          positions[i * 3 + 1] = Math.sin(vData.angle) * currentRadius * 0.8;
          positions[i * 3 + 2] = Math.sin(vData.angle * 2) * currentRadius * 0.5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Phase 3 & 4 (1.0s to 1.5s+): Core ignites, glass sphere forms, ring expands
      if (elapsed > 0.95) {
        const coreProg = Math.min(1, (elapsed - 0.95) / 0.45);
        coreMat.opacity = coreProg * 0.95;
        coreMesh.scale.set(coreProg, coreProg, coreProg);
        glassShellMat.opacity = coreProg * 0.35;
        glassShell.scale.set(coreProg, coreProg, coreProg);

        // Shockwave expansion
        const waveProg = (elapsed - 1.15) / 0.5;
        if (waveProg > 0 && waveProg <= 1) {
          const wScale = 1 + waveProg * 2.8;
          shockwaveRing.scale.set(wScale, wScale, wScale);
          shockwaveMat.opacity = Math.max(0, 0.85 * (1 - waveProg));
        }
      }

      // Dynamic light pulsation
      coreLight.intensity = 2.5 + Math.sin(elapsed * 6) * 1.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      vBarGeo.dispose();
      hBarGeo.dispose();
      barMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      glassShellGeo.dispose();
      glassShellMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
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

export default EnergyFormationPortal;

