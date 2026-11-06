import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const NeuralConnectionsPortal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 190;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.6);

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

    const neuralGlowLight = new THREE.PointLight(0x54d8c4, 3.2, 7);
    neuralGlowLight.position.set(0, 0.8, 2);
    scene.add(neuralGlowLight);

    const goldPulseLight = new THREE.PointLight(0xf5c77d, 2.2, 6);
    goldPulseLight.position.set(-1, -0.8, 1.8);
    scene.add(goldPulseLight);

    // 3. Network Root Group (for 3D Rotation & Progressive Expansion)
    const networkGroup = new THREE.Group();
    networkGroup.scale.set(0.01, 0.01, 0.01);
    scene.add(networkGroup);

    // 4. Generate 16 Nodes at Distinct 3D Depths
    const nodeCount = 16;
    const nodeCoords: THREE.Vector3[] = [
      new THREE.Vector3(0, 0, 0.3),
      new THREE.Vector3(-0.95, 0.65, 0.1),
      new THREE.Vector3(0.85, 0.75, -0.2),
      new THREE.Vector3(-0.8, -0.65, -0.3),
      new THREE.Vector3(0.9, -0.55, 0.2),
      new THREE.Vector3(-1.45, 0.1, 0.4),
      new THREE.Vector3(1.5, 0.15, -0.3),
      new THREE.Vector3(0.15, 1.35, 0.2),
      new THREE.Vector3(-0.2, -1.3, -0.1),
      new THREE.Vector3(-0.55, 0.3, -0.6),
      new THREE.Vector3(0.65, -0.2, -0.7),
      new THREE.Vector3(-1.15, -0.85, 0.5),
      new THREE.Vector3(1.2, 0.85, 0.4),
      new THREE.Vector3(-0.45, -0.8, 0.7),
      new THREE.Vector3(0.5, 0.8, -0.6),
      new THREE.Vector3(0.0, -0.4, 0.9),
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x54d8c4,
      emissive: 0x087b56,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.4,
    });

    nodeCoords.forEach((coord, i) => {
      const mesh = new THREE.Mesh(sphereGeo, nodeMat.clone());
      mesh.position.copy(coord);
      // Slight scale variety
      const s = i === 0 ? 1.4 : 0.85 + (i % 4) * 0.15;
      mesh.scale.set(s, s, s);
      networkGroup.add(mesh);
      nodeMeshes.push(mesh);
    });

    // 5. Connect Pairs within Distance Threshold to Form Neural Graph
    interface EdgeData {
      start: THREE.Vector3;
      end: THREE.Vector3;
      length: number;
    }
    const edges: EdgeData[] = [];
    const lineCoords: number[] = [];

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodeCoords[i].distanceTo(nodeCoords[j]);
        if (dist < 1.45) {
          edges.push({
            start: nodeCoords[i],
            end: nodeCoords[j],
            length: dist,
          });
          lineCoords.push(
            nodeCoords[i].x, nodeCoords[i].y, nodeCoords[i].z,
            nodeCoords[j].x, nodeCoords[j].y, nodeCoords[j].z
          );
        }
      }
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x087b56,
      transparent: true,
      opacity: 0.45,
    });
    const networkLines = new THREE.LineSegments(linesGeo, linesMat);
    networkGroup.add(networkLines);

    // 6. Golden Synaptic Energy Pulses Traveling Along Edges
    const pulseCount = 7;
    const pulseMeshes: { mesh: THREE.Mesh; edgeIndex: number; progress: number; speed: number }[] = [];
    const pulseGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xf5c77d,
    });

    for (let p = 0; p < pulseCount; p++) {
      const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
      networkGroup.add(pMesh);
      pulseMeshes.push({
        mesh: pMesh,
        edgeIndex: Math.floor(Math.random() * edges.length),
        progress: Math.random(),
        speed: 0.8 + Math.random() * 1.2,
      });
    }

    // 7. Ambient Micro-Sparkles
    const dustCount = 30;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 4;
      dustPos[i + 1] = (Math.random() - 0.5) * 3;
      dustPos[i + 2] = (Math.random() - 0.5) * 3;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xf5c77d,
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    networkGroup.add(dustPoints);

    // 8. Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Stage 1 & 2: Expansion of network structure
      const scaleProg = Math.min(1, elapsed / 0.55);
      const easedScale = 1 - Math.pow(1 - scaleProg, 3);
      networkGroup.scale.set(easedScale, easedScale, easedScale);

      // Stage 3 & 4: Progressive line illumination
      linesMat.opacity = Math.min(0.65, 0.15 + elapsed * 0.45);

      // Stage 5: Move golden energy pulses along synaptic paths
      pulseMeshes.forEach((pulse) => {
        pulse.progress += pulse.speed * 0.018;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.edgeIndex = Math.floor(Math.random() * edges.length);
        }
        const edge = edges[pulse.edgeIndex];
        if (edge) {
          pulse.mesh.position.lerpVectors(edge.start, edge.end, pulse.progress);
        }
      });

      // Stage 6 & 7: Gentle 3D rotation with depth
      networkGroup.rotation.y = elapsed * 0.42;
      networkGroup.rotation.x = Math.sin(elapsed * 0.6) * 0.18;

      // Node subtle pulsation
      nodeMeshes.forEach((mesh, idx) => {
        const pulse = 1 + Math.sin(elapsed * 4 + idx) * 0.12;
        mesh.scale.set(pulse, pulse, pulse);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      nodeMat.dispose();
      linesGeo.dispose();
      linesMat.dispose();
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

export default NeuralConnectionsPortal;

