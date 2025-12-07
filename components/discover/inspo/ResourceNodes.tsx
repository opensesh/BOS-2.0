'use client';

import { useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateOrbitalPosition } from '@/lib/utils/orbital-layout';
import type { NormalizedResource } from '@/lib/data/inspo';

/**
 * Category Color Mapping
 */
const CATEGORY_COLORS: Record<string, string> = {
  'Community': '#3B82F6',
  'Contractors': '#8B5CF6',
  'Inspiration': '#FF5102',
  'Learning': '#10B981',
  'Templates': '#F59E0B',
  'Tools': '#EC4899',
  'AI': '#06B6D4',
};

const DEFAULT_COLOR = '#9CA3AF';

function getCategoryColor(category: string | null): string {
  if (!category) return DEFAULT_COLOR;
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

/**
 * Animation configuration
 */
const ANIMATION = {
  ENTRANCE_DELAY: 400,
  STAGGER_DELAY: 20,
  ENTRANCE_DURATION: 600,
  FILTER_LERP_SPEED: 0.1,
  HOVER_LERP_SPEED: 0.15,     // Snappy hover scale
  CLICK_LERP_SPEED: 0.3,      // Fast click pulse
  VISIBLE_OPACITY: 1.0,
  HIDDEN_OPACITY: 0.0,
  HOVER_SCALE: 1.3,           // Scale multiplier on hover
  CLICK_SCALE: 1.5,           // Scale multiplier on click (pulse)
  NORMAL_SCALE: 1.0,
  MIN_OPACITY_FOR_INTERACTION: 0.1, // Minimum opacity to allow hover/click
};

export interface ResourceNodesHandle {
  getMesh: () => THREE.InstancedMesh | null;
  getResourceAtIndex: (index: number) => NormalizedResource | null;
  getOpacityAtIndex: (index: number) => number;
  getGroupRotation: () => THREE.Euler | null;
}

interface ResourceNodesProps {
  resources: NormalizedResource[];
  activeFilter?: string | null;
  hoveredIndex?: number | null;
  clickedIndex?: number | null;
}

/**
 * ResourceNodes
 * 
 * Renders all resources as individual sphere meshes orbiting the central sphere.
 * Supports hover and click visual feedback with scale animations.
 */
const ResourceNodes = forwardRef<ResourceNodesHandle, ResourceNodesProps>(
  function ResourceNodes({ resources, activeFilter, hoveredIndex, clickedIndex }, ref) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    
    // Animation state
    const [isInitialized, setIsInitialized] = useState(false);
    const currentOpacitiesRef = useRef<Float32Array | null>(null);
    const targetOpacitiesRef = useRef<Float32Array | null>(null);
    const currentHoverScalesRef = useRef<Float32Array | null>(null);
    const entranceStartTimeRef = useRef<number | null>(null);
    
    const nodeRadius = 0.5;
    const orbitalConfig = { minRadius: 15, maxRadius: 50 };
    const resourceCount = resources.length;
    
    // Expose mesh and resource lookup for raycasting
    useImperativeHandle(ref, () => ({
      getMesh: () => meshRef.current,
      getResourceAtIndex: (index: number) => resources[index] || null,
      getOpacityAtIndex: (index: number) => currentOpacitiesRef.current?.[index] ?? 0,
      getGroupRotation: () => groupRef.current?.rotation || null,
    }));
    
    // Calculate FIXED positions and colors for ALL resources
    const { positions, colors } = useMemo(() => {
      const count = resources.length;
      const posArray = new Float32Array(count * 3);
      const colorArray = new Float32Array(count * 3);
      
      resources.forEach((resource, index) => {
        const pos = generateOrbitalPosition(
          String(resource.id),
          index,
          count,
          orbitalConfig
        );
        
        posArray[index * 3] = pos.x;
        posArray[index * 3 + 1] = pos.y;
        posArray[index * 3 + 2] = pos.z;
        
        const colorHex = getCategoryColor(resource.category);
        const color = new THREE.Color(colorHex);
        
        colorArray[index * 3] = color.r;
        colorArray[index * 3 + 1] = color.g;
        colorArray[index * 3 + 2] = color.b;
      });
      
      return { positions: posArray, colors: colorArray };
    }, [resources, orbitalConfig.minRadius, orbitalConfig.maxRadius]);
    
    // Initialize opacity and hover scale arrays
    useEffect(() => {
      if (resourceCount === 0) return;
      
      if (!currentOpacitiesRef.current || currentOpacitiesRef.current.length !== resourceCount) {
        currentOpacitiesRef.current = new Float32Array(resourceCount).fill(0);
        targetOpacitiesRef.current = new Float32Array(resourceCount).fill(ANIMATION.VISIBLE_OPACITY);
        currentHoverScalesRef.current = new Float32Array(resourceCount).fill(ANIMATION.NORMAL_SCALE);
        entranceStartTimeRef.current = Date.now();
        setIsInitialized(false);
      }
    }, [resourceCount]);
    
    // Update target opacities when filter changes
    useEffect(() => {
      if (!targetOpacitiesRef.current || resourceCount === 0) return;
      
      resources.forEach((resource, index) => {
        const shouldBeVisible = !activeFilter || resource.category === activeFilter;
        targetOpacitiesRef.current![index] = shouldBeVisible 
          ? ANIMATION.VISIBLE_OPACITY 
          : ANIMATION.HIDDEN_OPACITY;
      });
    }, [activeFilter, resources, resourceCount]);
    
    // Initial mesh setup
    useEffect(() => {
      if (!meshRef.current || resourceCount === 0) return;
      
      const dummy = new THREE.Object3D();
      
      for (let i = 0; i < resourceCount; i++) {
        dummy.position.set(
          positions[i * 3] || 0,
          positions[i * 3 + 1] || 0,
          positions[i * 3 + 2] || 0
        );
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      meshRef.current.instanceMatrix.needsUpdate = true;
      
      if (meshRef.current.geometry) {
        const colorAttribute = new THREE.InstancedBufferAttribute(colors, 3);
        meshRef.current.geometry.setAttribute('color', colorAttribute);
      }
    }, [positions, colors, resourceCount]);
    
    // Animation loop
    useFrame((_, delta) => {
      if (!meshRef.current || !groupRef.current || resourceCount === 0) return;
      if (!currentOpacitiesRef.current || !targetOpacitiesRef.current || !currentHoverScalesRef.current) return;
      
      // Slow orbital rotation
      groupRef.current.rotation.y += delta * 0.05;
      
      const now = Date.now();
      const entranceStart = entranceStartTimeRef.current || now;
      const timeSinceStart = now - entranceStart;
      
      const dummy = new THREE.Object3D();
      let hasChanges = false;
      
      for (let i = 0; i < resourceCount; i++) {
        // Entrance animation
        const nodeEntranceDelay = ANIMATION.ENTRANCE_DELAY + (i * ANIMATION.STAGGER_DELAY);
        const timeSinceNodeStart = timeSinceStart - nodeEntranceDelay;
        
        let targetOpacity = targetOpacitiesRef.current[i];
        
        if (!isInitialized && timeSinceNodeStart < ANIMATION.ENTRANCE_DURATION) {
          if (timeSinceNodeStart <= 0) {
            targetOpacity = 0;
          } else {
            const entranceProgress = timeSinceNodeStart / ANIMATION.ENTRANCE_DURATION;
            const easedProgress = entranceProgress < 0.5
              ? 2 * entranceProgress * entranceProgress
              : 1 - Math.pow(-2 * entranceProgress + 2, 2) / 2;
            targetOpacity = easedProgress * targetOpacitiesRef.current[i];
          }
        }
        
        // Lerp opacity
        const currentOpacity = currentOpacitiesRef.current[i];
        const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * ANIMATION.FILTER_LERP_SPEED;
        
        if (Math.abs(newOpacity - currentOpacity) > 0.001) {
          currentOpacitiesRef.current[i] = newOpacity;
          hasChanges = true;
        }
        
        // Hover and click scale animation
        const isHovered = hoveredIndex === i && newOpacity >= ANIMATION.MIN_OPACITY_FOR_INTERACTION;
        const isClicked = clickedIndex === i;
        
        // Target scale: clicked > hovered > normal
        let targetHoverScale = ANIMATION.NORMAL_SCALE;
        if (isClicked) {
          targetHoverScale = ANIMATION.CLICK_SCALE;
        } else if (isHovered) {
          targetHoverScale = ANIMATION.HOVER_SCALE;
        }
        
        const currentHoverScale = currentHoverScalesRef.current[i];
        const lerpSpeed = isClicked ? ANIMATION.CLICK_LERP_SPEED : ANIMATION.HOVER_LERP_SPEED;
        const newHoverScale = currentHoverScale + (targetHoverScale - currentHoverScale) * lerpSpeed;
        
        if (Math.abs(newHoverScale - currentHoverScale) > 0.001) {
          currentHoverScalesRef.current[i] = newHoverScale;
          hasChanges = true;
        }
        
        // Final scale = opacity scale * hover/click scale
        const finalScale = Math.max(0.001, newOpacity) * newHoverScale;
        
        dummy.position.set(
          positions[i * 3] || 0,
          positions[i * 3 + 1] || 0,
          positions[i * 3 + 2] || 0
        );
        dummy.scale.set(finalScale, finalScale, finalScale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      if (hasChanges) {
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
      
      // Check entrance completion
      if (!isInitialized) {
        const lastNodeEntranceEnd = ANIMATION.ENTRANCE_DELAY + 
          ((resourceCount - 1) * ANIMATION.STAGGER_DELAY) + 
          ANIMATION.ENTRANCE_DURATION;
        
        if (timeSinceStart > lastNodeEntranceEnd) {
          setIsInitialized(true);
        }
      }
    });
    
    if (resourceCount === 0) return null;
    
    return (
      <group ref={groupRef}>
        <instancedMesh 
          ref={meshRef} 
          args={[undefined, undefined, resourceCount]}
          frustumCulled={false}
        >
          <sphereGeometry args={[nodeRadius, 16, 16]} />
          <meshBasicMaterial vertexColors transparent opacity={1} />
        </instancedMesh>
      </group>
    );
  }
);

export default ResourceNodes;
