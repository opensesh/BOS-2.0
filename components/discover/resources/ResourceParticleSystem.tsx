'use client';

import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useResourceDiscoveryStore, selectActiveResources } from '@/lib/stores/resource-discovery-store';
import type { ResourceNode } from '@/types/resource-discovery';
import { DEFAULT_CATEGORY_COLORS } from '@/types/resource-discovery';

/**
 * ResourceParticleSystem
 * 
 * Renders resource nodes as instanced particles with:
 * - Category-based coloring
 * - Opacity transitions for filtered/unfiltered states
 * - Smooth position updates
 * - Hover detection
 */

interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  opacities: Float32Array;
  scales: Float32Array;
}

// Animation state for smooth transitions
interface AnimationState {
  startTime: number;
  duration: number;
  fromOpacities: Float32Array;
  toOpacities: Float32Array;
  isAnimating: boolean;
}

export default function ResourceParticleSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const animationRef = useRef<AnimationState>({
    startTime: 0,
    duration: 1200, // 1.2s
    fromOpacities: new Float32Array(0),
    toOpacities: new Float32Array(0),
    isAnimating: false,
  });
  const currentOpacitiesRef = useRef<Float32Array>(new Float32Array(0));
  
  // Get Three.js context for raycasting
  const { raycaster, pointer, camera } = useThree();
  
  // Store state
  const resources = useResourceDiscoveryStore((state) => state.resources);
  const filter = useResourceDiscoveryStore((state) => state.filter);
  const particleAppearance = useResourceDiscoveryStore((state) => state.particleAppearance);
  const hoveredResourceId = useResourceDiscoveryStore((state) => state.hoveredResourceId);
  const setHoveredResource = useResourceDiscoveryStore((state) => state.setHoveredResource);
  
  // Get active resources based on current filter
  const activeResourceIds = useMemo(() => {
    const activeResources = selectActiveResources(useResourceDiscoveryStore.getState());
    return new Set(activeResources.map(r => r.id));
  }, [resources, filter]);
  
  // Calculate particle data (positions, colors, opacities)
  const particleData = useMemo<ParticleData>(() => {
    const count = resources.length;
    if (count === 0) {
      return {
        positions: new Float32Array(0),
        colors: new Float32Array(0),
        opacities: new Float32Array(0),
        scales: new Float32Array(0),
      };
    }
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const opacities = new Float32Array(count);
    const scales = new Float32Array(count);
    
    const { activeOpacity, inactiveOpacity, baseSize, hoverScale } = particleAppearance;
    
    resources.forEach((resource, i) => {
      // Position
      positions[i * 3] = resource.x;
      positions[i * 3 + 1] = resource.y;
      positions[i * 3 + 2] = resource.z;
      
      // Color based on category
      const colorHex = DEFAULT_CATEGORY_COLORS[resource.category || 'default'] 
        || DEFAULT_CATEGORY_COLORS.default;
      const color = new THREE.Color(colorHex);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Opacity based on filter state
      const isActive = activeResourceIds.has(resource.id);
      const hasFilter = filter.activeCategory !== null || filter.searchQuery !== '';
      opacities[i] = hasFilter 
        ? (isActive ? activeOpacity : inactiveOpacity)
        : activeOpacity;
      
      // Scale (with hover effect)
      scales[i] = resource.id === hoveredResourceId ? baseSize * hoverScale : baseSize;
    });
    
    return { positions, colors, opacities, scales };
  }, [resources, activeResourceIds, filter, particleAppearance, hoveredResourceId]);
  
  // Start opacity transition animation when filter changes
  useEffect(() => {
    if (resources.length === 0) return;
    
    const count = resources.length;
    const { activeOpacity, inactiveOpacity } = particleAppearance;
    const hasFilter = filter.activeCategory !== null || filter.searchQuery !== '';
    
    // Initialize current opacities if needed
    if (currentOpacitiesRef.current.length !== count) {
      currentOpacitiesRef.current = new Float32Array(count).fill(activeOpacity);
    }
    
    // Calculate target opacities
    const toOpacities = new Float32Array(count);
    resources.forEach((resource, i) => {
      const isActive = activeResourceIds.has(resource.id);
      toOpacities[i] = hasFilter 
        ? (isActive ? activeOpacity : inactiveOpacity)
        : activeOpacity;
    });
    
    // Start animation
    animationRef.current = {
      startTime: Date.now(),
      duration: 1200,
      fromOpacities: new Float32Array(currentOpacitiesRef.current),
      toOpacities,
      isAnimating: true,
    };
  }, [filter.activeCategory, filter.searchQuery, resources.length, activeResourceIds]);
  
  // Update instanced mesh
  const updateMesh = useCallback(() => {
    if (!meshRef.current || resources.length === 0) return;
    
    const dummy = new THREE.Object3D();
    const count = resources.length;
    
    // Get current animated opacities
    const { isAnimating, startTime, duration, fromOpacities, toOpacities } = animationRef.current;
    let opacities: Float32Array;
    
    if (isAnimating) {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-in-out cubic
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      opacities = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        opacities[i] = fromOpacities[i] + (toOpacities[i] - fromOpacities[i]) * eased;
      }
      
      if (t >= 1) {
        animationRef.current.isAnimating = false;
        currentOpacitiesRef.current = new Float32Array(toOpacities);
      } else {
        currentOpacitiesRef.current = opacities;
      }
    } else {
      opacities = currentOpacitiesRef.current.length === count 
        ? currentOpacitiesRef.current 
        : particleData.opacities;
    }
    
    // Update transforms
    for (let i = 0; i < count; i++) {
      const scale = particleData.scales[i];
      dummy.position.set(
        particleData.positions[i * 3],
        particleData.positions[i * 3 + 1],
        particleData.positions[i * 3 + 2]
      );
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Update colors with opacity baked in
    if (meshRef.current.geometry) {
      const colorWithAlpha = new Float32Array(count * 4);
      for (let i = 0; i < count; i++) {
        colorWithAlpha[i * 4] = particleData.colors[i * 3];
        colorWithAlpha[i * 4 + 1] = particleData.colors[i * 3 + 1];
        colorWithAlpha[i * 4 + 2] = particleData.colors[i * 3 + 2];
        colorWithAlpha[i * 4 + 3] = opacities[i];
      }
      
      const colorAttribute = new THREE.InstancedBufferAttribute(colorWithAlpha, 4);
      meshRef.current.geometry.setAttribute('instanceColor', colorAttribute);
    }
  }, [resources, particleData]);
  
  // Hover detection
  const handleHover = useCallback(() => {
    if (!meshRef.current || resources.length === 0) return;
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      const resourceId = resources[intersects[0].instanceId]?.id;
      if (resourceId !== hoveredResourceId) {
        setHoveredResource(resourceId);
      }
    } else if (hoveredResourceId !== null) {
      setHoveredResource(null);
    }
  }, [resources, raycaster, pointer, camera, hoveredResourceId, setHoveredResource]);
  
  // Animation frame
  useFrame(() => {
    updateMesh();
    handleHover();
    
    // Gentle rotation when not filtering
    if (groupRef.current && !filter.activeCategory) {
      groupRef.current.rotation.y += 0.0005;
    }
  });
  
  // Initial update
  useEffect(() => {
    updateMesh();
  }, [particleData, updateMesh]);
  
  if (resources.length === 0) return null;
  
  return (
    <group ref={groupRef}>
      <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, resources.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          vertexColors 
          transparent 
          opacity={1}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
