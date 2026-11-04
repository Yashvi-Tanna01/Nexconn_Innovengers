import React, { memo, useMemo } from 'react';
import { DISTRICTS, District } from './types';
import * as THREE from 'three';

interface DistrictZonesProps {
  selectedDistrict: District | null;
  hoveredDistrict: District | null;
  onSelectDistrict: (district: District) => void;
  onHoverDistrict: (district: District | null) => void;
}

const SHARED_PLANE = new THREE.PlaneGeometry(1, 1);
const SHARED_CYLINDER = new THREE.CylinderGeometry(0.02, 0.02, 1, 6);

export const DistrictZones: React.FC<DistrictZonesProps> = memo(({
  selectedDistrict,
  hoveredDistrict,
  onSelectDistrict,
  onHoverDistrict,
}) => {
  // Pre-generate stable edge geometries once for all 4 districts
  const districtEdgeGeometries = useMemo(() => {
    return DISTRICTS.map((d) => {
      const width = d.bounds.maxX - d.bounds.minX;
      const depth = d.bounds.maxZ - d.bounds.minZ;
      const boxGeo = new THREE.BoxGeometry(width, 0.05, depth);
      const edges = new THREE.EdgesGeometry(boxGeo);
      boxGeo.dispose();
      return { id: d.id, edges };
    });
  }, []);

  return (
    <group>
      {DISTRICTS.map((d, index) => {
        const isSelected = selectedDistrict?.id === d.id;
        const isHovered = hoveredDistrict?.id === d.id;
        const active = isSelected || isHovered;

        const width = d.bounds.maxX - d.bounds.minX;
        const depth = d.bounds.maxZ - d.bounds.minZ;
        const centerX = (d.bounds.minX + d.bounds.maxX) / 2;
        const centerZ = (d.bounds.minZ + d.bounds.maxZ) / 2;
        const edges = districtEdgeGeometries[index]?.edges;

        return (
          <group key={d.id} position={[centerX, 0.02, centerZ]}>
            {/* Holographic Zone Floor Tint */}
            <mesh
              geometry={SHARED_PLANE}
              scale={[width, depth, 1]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDistrict(d);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverDistrict(d);
              }}
              onPointerOut={() => onHoverDistrict(null)}
            >
              <meshBasicMaterial
                color={d.color}
                transparent
                opacity={isSelected ? 0.14 : isHovered ? 0.09 : 0.03}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Glowing Perimeter Border Lines with Precomputed Edges */}
            {edges && (
              <lineSegments geometry={edges}>
                <lineBasicMaterial
                  color={d.color}
                  transparent
                  opacity={active ? 0.9 : 0.3}
                />
              </lineSegments>
            )}

            {/* Corner Marker Beams */}
            {[
              [width / 2, depth / 2],
              [-width / 2, depth / 2],
              [width / 2, -depth / 2],
              [-width / 2, -depth / 2],
            ].map(([cx, cz], i) => (
              <mesh
                key={`corner-${i}`}
                geometry={SHARED_CYLINDER}
                position={[cx, active ? 0.3 : 0.15, cz]}
                scale={[1, active ? 0.6 : 0.3, 1]}
              >
                <meshBasicMaterial color={d.color} transparent opacity={active ? 0.8 : 0.4} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
});

DistrictZones.displayName = 'DistrictZones';
