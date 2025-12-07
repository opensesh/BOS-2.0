'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  generateSphereLayout, 
  generateGalaxyLayout, 
  generateGridLayout,
  generateNebulaLayout,
  generateStarfieldLayout,
  generateVortexLayout 
} from '@/lib/utils/particle-layouts';
import { useInspoStore, ViewMode } from '@/lib/stores/inspo-store';

interface ParticleSystemProps {
  radius?: number;
}

export default function ParticleSystem({ radius = 15 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Get store values
  const viewMode = useInspoStore((state) => state.viewMode);
  const setTransitioning = useInspoStore((state) => state.setTransitioning);
  const { particleCount, particleSize, animationSpeed, autoPlay } = useInspoStore(
    (state) => state.particleSettings
  );
  const { innerColor, outerColor } = useInspoStore((state) => state.colorSettings);

  // Create THREE.Color objects from hex strings
  const innerColorObj = useMemo(() => new THREE.Color(innerColor), [innerColor]);
  const outerColorObj = useMemo(() => new THREE.Color(outerColor), [outerColor]);

  // Generate all layouts with current count
  const layouts = useMemo(() => ({
    sphere: generateSphereLayout(particleCount, radius),
    galaxy: generateGalaxyLayout(particleCount, radius),
    grid: generateGridLayout(particleCount, 2),
    nebula: generateNebulaLayout(particleCount, radius),
    starfield: generateStarfieldLayout(particleCount, radius),
    vortex: generateVortexLayout(particleCount, radius),
  }), [particleCount, radius]);

  // Track current positions for transitions
  const [currentPositions, setCurrentPositions] = useState<Float32Array>(layouts.sphere);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevViewModeRef = useRef(viewMode);
  const prevCountRef = useRef(particleCount);

  // Get target positions based on viewMode
  const getTargetPositions = useCallback((mode: ViewMode): Float32Array => {
    return layouts[mode] || layouts.sphere;
  }, [layouts]);

  // Calculate colors based on distance from center
  const calculateColors = useCallback((positions: Float32Array, count: number): Float32Array => {
    const colors = new Float32Array(count * 3);
    
    // Find max distance for normalization
    let maxDistance = 0;
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);
      if (distance > maxDistance) maxDistance = distance;
    }
    
    // Avoid division by zero
    if (maxDistance === 0) maxDistance = 1;
    
    // Interpolate colors based on normalized distance
    const tempColor = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);
      const t = distance / maxDistance; // 0 = center (inner), 1 = edge (outer)
      
      // Lerp between inner and outer colors
      tempColor.copy(innerColorObj).lerp(outerColorObj, t);
      
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }
    
    return colors;
  }, [innerColorObj, outerColorObj]);

  // Handle particle count changes - regenerate positions
  useEffect(() => {
    if (prevCountRef.current !== particleCount) {
      const newPositions = getTargetPositions(viewMode);
      setCurrentPositions(newPositions);
      prevCountRef.current = particleCount;
    }
  }, [particleCount, viewMode, getTargetPositions]);

  // Reset rotation and center when viewMode changes
  useEffect(() => {
    if (groupRef.current) {
      // Reset rotation for clean transition
      groupRef.current.rotation.set(0, 0, 0);
    }
  }, [viewMode]);

  // Handle viewMode changes with smooth transition
  useEffect(() => {
    if (prevViewModeRef.current === viewMode) return;

    const fromPositions = currentPositions;
    const toPositions = getTargetPositions(viewMode);

    // Handle size mismatch (if count changed during transition)
    if (fromPositions.length !== toPositions.length) {
      setCurrentPositions(toPositions);
      prevViewModeRef.current = viewMode;
      return;
    }

    setIsTransitioning(true);
    setTransitioning(true);

    const duration = 1500;
    const startTime = Date.now();
    const tempPositions = new Float32Array(fromPositions.length);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease-in-out-cubic
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      for (let i = 0; i < fromPositions.length; i++) {
        tempPositions[i] = fromPositions[i] + (toPositions[i] - fromPositions[i]) * eased;
      }

      setCurrentPositions(new Float32Array(tempPositions));

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
        setTransitioning(false);
        prevViewModeRef.current = viewMode;
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, setTransitioning, getTargetPositions]);

  // Update InstancedMesh positions and colors
  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const colors = calculateColors(currentPositions, particleCount);

    for (let i = 0; i < particleCount; i++) {
      dummy.position.set(
        currentPositions[i * 3] || 0,
        currentPositions[i * 3 + 1] || 0,
        currentPositions[i * 3 + 2] || 0
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
  }, [currentPositions, particleCount, calculateColors]);

  // Animation loop - rotation based on mode and settings
  useFrame((_, delta) => {
    if (!groupRef.current || !autoPlay || isTransitioning) return;
    
    const speed = animationSpeed * delta;
    
    // Different animation behaviors per mode
    switch (viewMode) {
      case 'sphere':
        groupRef.current.rotation.y += speed * 0.5;
        break;
      case 'galaxy':
        groupRef.current.rotation.y += speed * 0.3;
        break;
      case 'vortex':
        groupRef.current.rotation.y += speed * 0.8;
        break;
      case 'nebula':
        groupRef.current.rotation.y += speed * 0.1;
        groupRef.current.rotation.x += speed * 0.05;
        break;
      case 'starfield':
        groupRef.current.rotation.y += speed * 0.02;
        break;
      case 'grid':
        // Grid stays static by default
        break;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[particleSize, 8, 8]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </group>
  );
}
