import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const LivingEarthPortal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 190;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
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

    const emeraldLight = new THREE.PointLight(0x087b56, 3.5, 10);
    emeraldLight.position.set(2, 2, 3);
    scene.add(emeraldLight);

    const goldLight = new THREE.PointLight(0xf5c77d, 2.2, 8);
    goldLight.position.set(-2, -1.5, 2.5);
    scene.add(goldLight);

    const centralGlow = new THREE.PointLight(0x54d8c4, 2.0, 6);
    centralGlow.position.set(0, 0, 0);
    scene.add(centralGlow);

    // 3. Procedural Earth Texture (Continents & Golden City Lights)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Ocean deep emerald
      ctx.fillStyle = '#064C3B';
      ctx.fillRect(0, 0, 1024, 512);

      // Continent shapes
      ctx.fillStyle = '#0F694D';
      const continents = [
        // Americas
        { x: 260, y: 160, r: 85 },
        { x: 290, y: 250, r: 65 },
        { x: 340, y: 350, r: 75 },
        // Eurasia & Africa
        { x: 550, y: 160, r: 95 },
        { x: 670, y: 190, r: 110 },
        { x: 580, y: 290, r: 80 },
        // Australia & Islands
        { x: 790, y: 350, r: 55 },
        { x: 720, y: 270, r: 40 },
      ];
      continents.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        // Edge detail
        ctx.fillStyle = '#17835E';
        ctx.beginPath();
        ctx.arc(c.x + 10, c.y - 10, c.r * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F694D';
      });

      // Golden city lights clusters
      ctx.fillStyle = '#F5C77D';
      for (let i = 0; i < 180; i++) {
        const cx = 200 + Math.random() * 650;
        const cy = 120 + Math.random() * 280;
        const radius = Math.random() < 0.25 ? 2.5 : 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.needsUpdate = true;

    // 4. Group for the Miniature Earth
    const earthGroup = new THREE.Group();
    earthGroup.scale.set(0.01, 0.01, 0.01);
    scene.add(earthGroup);

    // Inner Core Earth Sphere
    const earthGeo = new THREE.SphereGeometry(1.05, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.45,
      metalness: 0.2,
      emissive: 0x064c3b,
      emissiveIntensity: 0.35,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmospheric translucent glass sphere
    const glassGeo = new THREE.SphereGeometry(1.18, 36, 36);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa7e8d3,
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.3,
      reflectivity: 0.8,
    });
    const glassSphere = new THREE.Mesh(glassGeo, glassMat);
    earthGroup.add(glassSphere);

    // Turquoise outer halo atmospheric glow
    const haloGeo = new THREE.SphereGeometry(1.28, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x54d8c4,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    earthGroup.add(haloMesh);

    // 5. Orbital Rings & Traveling Particles
    const ringsGroup = new THREE.Group();
    earthGroup.add(ringsGroup);

    const ringAngles = [
      { rx: 1.1, ry: 0.3, rz: 0.2, rad: 1.62, color: 0x54d8c4 },
      { rx: 0.4, ry: 1.2, rz: -0.5, rad: 1.82, color: 0xa7e8d3 },
      { rx: -0.6, ry: -0.4, rz: 0.9, rad: 2.05, color: 0xf5c77d },
    ];

    const orbitalParticles: { angle: number; speed: number; radius: number; group: THREE.Group }[] = [];

    ringAngles.forEach((cfg) => {
      const ringSubGroup = new THREE.Group();
      ringSubGroup.rotation.set(cfg.rx, cfg.ry, cfg.rz);
      ringsGroup.add(ringSubGroup);

      // Torus wire ring
      const torusGeo = new THREE.TorusGeometry(cfg.rad, 0.012, 12, 64);
      const torusMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.65,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      ringSubGroup.add(torus);

      // Orbiting particle point
      const pGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({
        color: cfg.color === 0xf5c77d ? 0xfff0c4 : 0xffffff,
      });
      const particleMesh = new THREE.Mesh(pGeo, pMat);
      ringSubGroup.add(particleMesh);

      orbitalParticles.push({
        angle: Math.random() * Math.PI * 2,
        speed: 1.4 + Math.random() * 0.8,
        radius: cfg.rad,
        group: ringSubGroup,
      });
    });

    // 6. Ambient Stardust Micro-particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 45;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 5;
      starPos[i + 1] = (Math.random() - 0.5) * 4;
      starPos[i + 2] = (Math.random() - 0.5) * 3;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xf5c77d,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 7. Animation Loop with Stage-by-Stage Choreography
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Stage 1 & 2: Expansion from emerald light to full glass sphere
      const scaleProgress = Math.min(1, elapsed / 0.55);
      // Smooth cubic ease out
      const easedScale = 1 - Math.pow(1 - scaleProgress, 3);
      earthGroup.scale.set(easedScale, easedScale, easedScale);

      // Stage 3 & 4: Slow Earth rotation & city lights illumination
      earthMesh.rotation.y = elapsed * 0.55;
      glassSphere.rotation.y = elapsed * 0.35;
      glassSphere.rotation.x = Math.sin(elapsed * 0.5) * 0.08;

      // Pulse central atmospheric light
      centralGlow.intensity = 1.6 + Math.sin(elapsed * 3) * 0.5;

      // Stage 5 & 6: Orbital rings rotation and particles movement
      ringsGroup.rotation.y = elapsed * 0.22;
      orbitalParticles.forEach((p, idx) => {
        p.angle += p.speed * 0.02;
        const mesh = p.group.children[1] as THREE.Mesh;
        if (mesh) {
          mesh.position.x = Math.cos(p.angle) * p.radius;
          mesh.position.y = Math.sin(p.angle) * p.radius;
        }
      });

      // Drifting stars
      starPoints.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup & Disposal
    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      earthGeo.dispose();
      earthMat.dispose();
      earthTexture.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      starGeo.dispose();
      starMat.dispose();
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

export default LivingEarthPortal;

