'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateOrbitalPosition } from '@/lib/utils/orbital-layout';
import type { NormalizedResource } from '@/lib/data/inspo';

/**
 * Category Color Mapping
 * 
 * Each category gets a distinct color for visual identification:
 * - Community: Blue (#3B82F6)
 * - Contractors: Purple (#8B5CF6)
 * - Inspiration: Orange (#FF5102) - matches brand Aperol
 * - Learning: Green (#10B981)
 * - Templates: Amber (#F59E0B)
 * - Tools: Pink (#EC4899)
 * - AI: Cyan (#06B6D4)
 */
const CATEGORY_COLORS: Record<string, string> = {
  'Community': '#3B82F6',    // Blue
  'Contractors': '#8B5CF6',  // Purple
  'Inspiration': '#FF5102',  // Orange (Aperol)
  'Learning': '#10B981',     // Green
  'Templates': '#F59E0B',    // Amber
  'Tools': '#EC4899',        // Pink
  'AI': '#06B6D4',           // Cyan
};

// Default color for unknown categories
const DEFAULT_COLOR = '#9CA3AF'; // Gray

/**
 * Get color for a resource based on its category
 */
function getCategoryColor(category: string | null): string {
  if (!category) return DEFAULT_COLOR;
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

interface ResourceNodesProps {
  resources: NormalizedResource[];
  activeFilter?: string | null;
}

/**
 * ResourceNodes
 * 
 * Renders all resources as individual sphere meshes orbiting the central sphere.
 * Like planets orbiting a sun, each resource has a deterministic position
 * based on its ID, ensuring consistent placement across sessions.
 * 
 * Features:
 * - Fibonacci sphere distribution for even spacing in 3D
 * - Category-based coloring for visual grouping
 * - InstancedMesh for efficient rendering of 100+ nodes
 * - Stores metadata for future hover/click interactions
 */
export default function ResourceNodes({ 
  resources, 
  activeFilter 
}: ResourceNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Resource node configuration
  const nodeRadius = 0.5;
  const orbitalConfig = {
    minRadius: 15,
    maxRadius: 50
  };
  
  // Filter resources if activeFilter is set (for Phase 3)
  const visibleResources = useMemo(() => {
    if (!activeFilter) return resources;
    return resources.filter(r => r.category === activeFilter);
  }, [resources, activeFilter]);
  
  // Calculate positions and colors for all visible resources
  const { positions, colors, resourceCount } = useMemo(() => {
    const count = visibleResources.length;
    const posArray = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    
    visibleResources.forEach((resource, index) => {
      // Get deterministic position based on resource ID
      const pos = generateOrbitalPosition(
        String(resource.id),
        index,
        count,
        orbitalConfig
      );
      
      posArray[index * 3] = pos.x;
      posArray[index * 3 + 1] = pos.y;
      posArray[index * 3 + 2] = pos.z;
      
      // Get color based on category
      const colorHex = getCategoryColor(resource.category);
      const color = new THREE.Color(colorHex);
      
      colorArray[index * 3] = color.r;
      colorArray[index * 3 + 1] = color.g;
      colorArray[index * 3 + 2] = color.b;
    });
    
    return { 
      positions: posArray, 
      colors: colorArray, 
      resourceCount: count 
    };
  }, [visibleResources, orbitalConfig.minRadius, orbitalConfig.maxRadius]);
  
  // Update InstancedMesh positions and colors
  useEffect(() => {
    if (!meshRef.current || resourceCount === 0) return;
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < resourceCount; i++) {
      dummy.position.set(
        positions[i * 3] || 0,
        positions[i * 3 + 1] || 0,
        positions[i * 3 + 2] || 0
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Update instance colors
    if (meshRef.current.geometry) {
      const colorAttribute = new THREE.InstancedBufferAttribute(colors, 3);
      meshRef.current.geometry.setAttribute('color', colorAttribute);
    }
  }, [positions, colors, resourceCount]);
  
  // Slow orbital rotation for the entire resource cloud
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Rotate the entire group slowly around Y axis
      // This creates a gentle "solar system" rotation effect
      groupRef.current.rotation.y += delta * 0.05;
    }
  });
  
  // Don't render if no resources
  if (resourceCount === 0) return null;
  
  return (
    <group ref={groupRef}>
      <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, resourceCount]}
        frustumCulled={false}
      >
        <sphereGeometry args={[nodeRadius, 16, 16]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </group>
  );
}
