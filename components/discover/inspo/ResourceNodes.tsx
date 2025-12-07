'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
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

/**
 * Animation configuration
 */
const ANIMATION = {
  // Entrance animation timing
  ENTRANCE_DELAY: 400,        // Delay before nodes start appearing (after central sphere)
  STAGGER_DELAY: 20,          // Delay between each node's entrance
  ENTRANCE_DURATION: 600,     // Duration for entrance fade-in
  
  // Filter animation
  FILTER_LERP_SPEED: 0.1,     // Smooth interpolation speed for filter changes
  
  // Opacity values
  VISIBLE_OPACITY: 1.0,
  HIDDEN_OPACITY: 0.0,
};

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
 * - Smooth fade animations for entrance and filtering
 * - Camera stays fixed - only opacity changes on filter
 */
export default function ResourceNodes({ 
  resources, 
  activeFilter 
}: ResourceNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Animation state
  const [isInitialized, setIsInitialized] = useState(false);
  const currentOpacitiesRef = useRef<Float32Array | null>(null);
  const targetOpacitiesRef = useRef<Float32Array | null>(null);
  const entranceStartTimeRef = useRef<number | null>(null);
  
  // Resource node configuration
  const nodeRadius = 0.5;
  const orbitalConfig = {
    minRadius: 15,
    maxRadius: 50
  };
  
  const resourceCount = resources.length;
  
  // Calculate FIXED positions and colors for ALL resources (never changes based on filter)
  const { positions, colors } = useMemo(() => {
    const count = resources.length;
    const posArray = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);
    
    resources.forEach((resource, index) => {
      // Get deterministic position based on resource ID
      // Using full resources.length ensures consistent positions
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
    
    return { positions: posArray, colors: colorArray };
  }, [resources, orbitalConfig.minRadius, orbitalConfig.maxRadius]);
  
  // Initialize opacity arrays
  useEffect(() => {
    if (resourceCount === 0) return;
    
    // Create opacity arrays if they don't exist or size changed
    if (!currentOpacitiesRef.current || currentOpacitiesRef.current.length !== resourceCount) {
      // Start all nodes at 0 opacity for entrance animation
      currentOpacitiesRef.current = new Float32Array(resourceCount).fill(0);
      targetOpacitiesRef.current = new Float32Array(resourceCount).fill(ANIMATION.VISIBLE_OPACITY);
      entranceStartTimeRef.current = Date.now();
      setIsInitialized(false);
    }
  }, [resourceCount]);
  
  // Update target opacities when filter changes
  useEffect(() => {
    if (!targetOpacitiesRef.current || resourceCount === 0) return;
    
    resources.forEach((resource, index) => {
      // If no filter, all visible. If filter, only matching category visible.
      const shouldBeVisible = !activeFilter || resource.category === activeFilter;
      targetOpacitiesRef.current![index] = shouldBeVisible 
        ? ANIMATION.VISIBLE_OPACITY 
        : ANIMATION.HIDDEN_OPACITY;
    });
  }, [activeFilter, resources, resourceCount]);
  
  // Update InstancedMesh positions and colors (initial setup)
  useEffect(() => {
    if (!meshRef.current || resourceCount === 0) return;
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < resourceCount; i++) {
      dummy.position.set(
        positions[i * 3] || 0,
        positions[i * 3 + 1] || 0,
        positions[i * 3 + 2] || 0
      );
      // Start with scale 0 for entrance animation
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Set instance colors
    if (meshRef.current.geometry) {
      const colorAttribute = new THREE.InstancedBufferAttribute(colors, 3);
      meshRef.current.geometry.setAttribute('color', colorAttribute);
    }
  }, [positions, colors, resourceCount]);
  
  // Animation loop - handles entrance animation and filter opacity transitions
  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current || resourceCount === 0) return;
    if (!currentOpacitiesRef.current || !targetOpacitiesRef.current) return;
    
    // Slow orbital rotation for the entire resource cloud
    groupRef.current.rotation.y += delta * 0.05;
    
    const now = Date.now();
    const entranceStart = entranceStartTimeRef.current || now;
    const timeSinceStart = now - entranceStart;
    
    const dummy = new THREE.Object3D();
    let hasChanges = false;
    
    for (let i = 0; i < resourceCount; i++) {
      // Calculate entrance delay for this node (staggered appearance)
      const nodeEntranceDelay = ANIMATION.ENTRANCE_DELAY + (i * ANIMATION.STAGGER_DELAY);
      const timeSinceNodeStart = timeSinceStart - nodeEntranceDelay;
      
      let targetOpacity = targetOpacitiesRef.current[i];
      
      // During entrance animation, gradually increase target from 0
      if (!isInitialized && timeSinceNodeStart < ANIMATION.ENTRANCE_DURATION) {
        if (timeSinceNodeStart <= 0) {
          // Node hasn't started entrance yet
          targetOpacity = 0;
        } else {
          // Ease-in-out entrance
          const entranceProgress = timeSinceNodeStart / ANIMATION.ENTRANCE_DURATION;
          const easedProgress = entranceProgress < 0.5
            ? 2 * entranceProgress * entranceProgress
            : 1 - Math.pow(-2 * entranceProgress + 2, 2) / 2;
          targetOpacity = easedProgress * targetOpacitiesRef.current[i];
        }
      }
      
      // Smooth lerp toward target opacity
      const currentOpacity = currentOpacitiesRef.current[i];
      const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * ANIMATION.FILTER_LERP_SPEED;
      
      // Only update if there's a meaningful change
      if (Math.abs(newOpacity - currentOpacity) > 0.001) {
        currentOpacitiesRef.current[i] = newOpacity;
        hasChanges = true;
      }
      
      // Update instance matrix with scale based on opacity
      // Scale from 0 to 1 based on opacity for smooth pop-in effect
      const scale = Math.max(0.001, newOpacity); // Minimum scale to avoid issues
      
      dummy.position.set(
        positions[i * 3] || 0,
        positions[i * 3 + 1] || 0,
        positions[i * 3 + 2] || 0
      );
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    if (hasChanges) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Check if entrance animation is complete
    if (!isInitialized) {
      const lastNodeEntranceEnd = ANIMATION.ENTRANCE_DELAY + 
        ((resourceCount - 1) * ANIMATION.STAGGER_DELAY) + 
        ANIMATION.ENTRANCE_DURATION;
      
      if (timeSinceStart > lastNodeEntranceEnd) {
        setIsInitialized(true);
      }
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
        <meshBasicMaterial 
          vertexColors 
          transparent 
          opacity={1}
        />
      </instancedMesh>
    </group>
  );
}
