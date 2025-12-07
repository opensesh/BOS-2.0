'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
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

interface NodeData {
  index: number;
  originalPosition: THREE.Vector3;
  currentPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  scale: number;
  resourceId: number | null;
}

const CLUSTER_RADIUS = 5; // Units to search for nearby nodes
const MAX_CLUSTER_SIZE = 20; // Maximum nodes in cluster
const ORBIT_RADIUS = 2; // Radius of orbit circle around center
const ANIMATION_DURATION = 0.5; // seconds

export default function ParticleSystem({ radius = 15 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer } = useThree();
  
  // Store node data for clustering
  const nodeDataRef = useRef<NodeData[]>([]);
  const animationsRef = useRef<gsap.core.Tween[]>([]);
  
  // Get store values
  const viewMode = useInspoStore((state) => state.viewMode);
  const setTransitioning = useInspoStore((state) => state.setTransitioning);
  const resources = useInspoStore((state) => state.resources);
  const { particleCount, particleSize, animationSpeed, autoPlay } = useInspoStore(
    (state) => state.particleSettings
  );
  const { innerColor, outerColor } = useInspoStore((state) => state.colorSettings);
  const hoveredNodeId = useInspoStore((state) => state.hoveredNodeId);
  const setHoveredNodeId = useInspoStore((state) => state.setHoveredNodeId);
  const clusterState = useInspoStore((state) => state.clusterState);
  const setClusterState = useInspoStore((state) => state.setClusterState);
  const clearCluster = useInspoStore((state) => state.clearCluster);

  // Create THREE.Color objects from hex strings
  const innerColorObj = useMemo(() => new THREE.Color(innerColor), [innerColor]);
  const outerColorObj = useMemo(() => new THREE.Color(outerColor), [outerColor]);

  // Determine actual particle count (use resources count if available, else default)
  const actualCount = resources.length > 0 ? Math.min(resources.length, particleCount) : particleCount;

  // Generate all layouts with current count
  const layouts = useMemo(() => ({
    sphere: generateSphereLayout(actualCount, radius),
    galaxy: generateGalaxyLayout(actualCount, radius),
    grid: generateGridLayout(actualCount, 2),
    nebula: generateNebulaLayout(actualCount, radius),
    starfield: generateStarfieldLayout(actualCount, radius),
    vortex: generateVortexLayout(actualCount, radius),
  }), [actualCount, radius]);

  // Track current positions for transitions
  const [currentPositions, setCurrentPositions] = useState<Float32Array>(layouts.sphere);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevViewModeRef = useRef(viewMode);
  const prevCountRef = useRef(actualCount);

  // Initialize node data when positions change
  useEffect(() => {
    const nodes: NodeData[] = [];
    for (let i = 0; i < actualCount; i++) {
      const pos = new THREE.Vector3(
        currentPositions[i * 3] || 0,
        currentPositions[i * 3 + 1] || 0,
        currentPositions[i * 3 + 2] || 0
      );
      nodes.push({
        index: i,
        originalPosition: pos.clone(),
        currentPosition: pos.clone(),
        targetPosition: pos.clone(),
        scale: 1,
        resourceId: resources[i]?.id ?? null,
      });
    }
    nodeDataRef.current = nodes;
  }, [currentPositions, actualCount, resources]);

  // Get target positions based on viewMode
  const getTargetPositions = useCallback((mode: ViewMode): Float32Array => {
    return layouts[mode] || layouts.sphere;
  }, [layouts]);

  // Calculate colors based on distance from center
  const calculateColors = useCallback((positions: Float32Array, count: number): Float32Array => {
    const colors = new Float32Array(count * 3);
    
    let maxDistance = 0;
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);
      if (distance > maxDistance) maxDistance = distance;
    }
    
    if (maxDistance === 0) maxDistance = 1;
    
    const tempColor = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);
      const t = distance / maxDistance;
      
      tempColor.copy(innerColorObj).lerp(outerColorObj, t);
      
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }
    
    return colors;
  }, [innerColorObj, outerColorObj]);

  // Find nearby nodes within radius
  const findNearbyNodes = useCallback((centerIndex: number): number[] => {
    const nodes = nodeDataRef.current;
    if (!nodes[centerIndex]) return [];
    
    const centerPos = nodes[centerIndex].originalPosition;
    const nearby: { index: number; distance: number }[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      if (i === centerIndex) continue;
      const distance = centerPos.distanceTo(nodes[i].originalPosition);
      if (distance <= CLUSTER_RADIUS) {
        nearby.push({ index: i, distance });
      }
    }
    
    // Sort by distance and take closest MAX_CLUSTER_SIZE
    nearby.sort((a, b) => a.distance - b.distance);
    return nearby.slice(0, MAX_CLUSTER_SIZE).map(n => n.index);
  }, []);

  // Animate nodes to cluster formation
  const animateToCluster = useCallback((centerId: number, nearbyIds: number[]) => {
    // Kill any existing animations
    animationsRef.current.forEach(tween => tween.kill());
    animationsRef.current = [];
    
    const nodes = nodeDataRef.current;
    const centerNode = nodes[centerId];
    if (!centerNode) return;
    
    // Animate center node scale
    const centerScaleAnim = gsap.to(centerNode, {
      scale: 1.5,
      duration: ANIMATION_DURATION,
      ease: 'power2.out',
    });
    animationsRef.current.push(centerScaleAnim);
    
    // Animate nearby nodes to orbit positions
    nearbyIds.forEach((nodeId, index) => {
      const node = nodes[nodeId];
      if (!node) return;
      
      // Calculate orbit position around center
      const angle = (index / nearbyIds.length) * Math.PI * 2;
      const orbitX = centerNode.originalPosition.x + Math.cos(angle) * ORBIT_RADIUS;
      const orbitY = centerNode.originalPosition.y + Math.sin(angle) * ORBIT_RADIUS * 0.5;
      const orbitZ = centerNode.originalPosition.z + Math.sin(angle) * ORBIT_RADIUS;
      
      node.targetPosition.set(orbitX, orbitY, orbitZ);
      
      const posAnim = gsap.to(node.currentPosition, {
        x: orbitX,
        y: orbitY,
        z: orbitZ,
        duration: ANIMATION_DURATION,
        ease: 'power2.out',
        delay: index * 0.02, // Stagger effect
      });
      animationsRef.current.push(posAnim);
      
      // Scale up slightly
      const scaleAnim = gsap.to(node, {
        scale: 1.2,
        duration: ANIMATION_DURATION,
        ease: 'power2.out',
        delay: index * 0.02,
      });
      animationsRef.current.push(scaleAnim);
    });
    
    setClusterState({
      centerId,
      nearbyIds,
      isAnimating: true,
    });
  }, [setClusterState]);

  // Animate nodes back to original positions
  const animateToOriginal = useCallback(() => {
    // Kill any existing animations
    animationsRef.current.forEach(tween => tween.kill());
    animationsRef.current = [];
    
    const nodes = nodeDataRef.current;
    
    nodes.forEach((node, index) => {
      // Reset scale
      const scaleAnim = gsap.to(node, {
        scale: 1,
        duration: ANIMATION_DURATION,
        ease: 'power2.out',
      });
      animationsRef.current.push(scaleAnim);
      
      // Reset position
      const posAnim = gsap.to(node.currentPosition, {
        x: node.originalPosition.x,
        y: node.originalPosition.y,
        z: node.originalPosition.z,
        duration: ANIMATION_DURATION,
        ease: 'power2.out',
      });
      animationsRef.current.push(posAnim);
    });
    
    clearCluster();
  }, [clearCluster]);

  // Handle particle count changes
  useEffect(() => {
    if (prevCountRef.current !== actualCount) {
      const newPositions = getTargetPositions(viewMode);
      setCurrentPositions(newPositions);
      prevCountRef.current = actualCount;
    }
  }, [actualCount, viewMode, getTargetPositions]);

  // Reset rotation when viewMode changes
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
  }, [viewMode]);

  // Handle viewMode changes with smooth transition
  useEffect(() => {
    if (prevViewModeRef.current === viewMode) return;

    const fromPositions = currentPositions;
    const toPositions = getTargetPositions(viewMode);

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
  }, [viewMode, setTransitioning, getTargetPositions, currentPositions]);

  // Raycasting for hover detection
  useFrame(() => {
    if (!meshRef.current || isTransitioning || clusterState.isAnimating) return;
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      const instanceId = intersects[0].instanceId;
      
      if (hoveredNodeId !== instanceId) {
        // New node hovered
        setHoveredNodeId(instanceId);
        const nearbyIds = findNearbyNodes(instanceId);
        animateToCluster(instanceId, nearbyIds);
      }
    } else if (hoveredNodeId !== null) {
      // Mouse left all nodes
      animateToOriginal();
    }
  });

  // Update InstancedMesh positions, scales, and colors
  useFrame(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const nodes = nodeDataRef.current;
    
    // Build position array for color calculation
    const posArray = new Float32Array(actualCount * 3);
    
    for (let i = 0; i < actualCount; i++) {
      const node = nodes[i];
      if (node) {
        // Use animated current position if clustering, otherwise use layout position
        const pos = clusterState.centerId !== null || clusterState.nearbyIds.length > 0
          ? node.currentPosition
          : new THREE.Vector3(
              currentPositions[i * 3] || 0,
              currentPositions[i * 3 + 1] || 0,
              currentPositions[i * 3 + 2] || 0
            );
        
        dummy.position.copy(pos);
        dummy.scale.setScalar(node.scale);
        
        posArray[i * 3] = pos.x;
        posArray[i * 3 + 1] = pos.y;
        posArray[i * 3 + 2] = pos.z;
      } else {
        dummy.position.set(
          currentPositions[i * 3] || 0,
          currentPositions[i * 3 + 1] || 0,
          currentPositions[i * 3 + 2] || 0
        );
        dummy.scale.setScalar(1);
        
        posArray[i * 3] = currentPositions[i * 3] || 0;
        posArray[i * 3 + 1] = currentPositions[i * 3 + 1] || 0;
        posArray[i * 3 + 2] = currentPositions[i * 3 + 2] || 0;
      }
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update colors
    if (meshRef.current.geometry) {
      const colors = calculateColors(posArray, actualCount);
      const colorAttribute = new THREE.InstancedBufferAttribute(colors, 3);
      meshRef.current.geometry.setAttribute('color', colorAttribute);
    }
  });

  // Rotation animation loop
  useFrame((_, delta) => {
    if (!groupRef.current || !autoPlay || isTransitioning) return;
    
    const speed = animationSpeed * delta;
    
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
        break;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, actualCount]}
        frustumCulled={false}
      >
        <sphereGeometry args={[particleSize, 8, 8]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </group>
  );
}
