'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateSphereLayout } from '@/lib/utils/particle-layouts';
import ResourceNodes from './ResourceNodes';
import type { NormalizedResource } from '@/lib/data/inspo';

/**
 * Animation configuration for central sphere entrance
 */
const SPHERE_ANIMATION = {
  ENTRANCE_DURATION: 800,  // 800ms fade-in
  LERP_SPEED: 0.08,        // Smooth interpolation
};

/**
 * CentralSphere
 * 
 * A sphere made of many small particles using Fibonacci distribution.
 * Creates the iconic particle sphere visualization - the "sun" that
 * resource nodes orbit around.
 * 
 * Features entrance fade-in animation on mount.
 */
function CentralSphere() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  // Animation state
  const [isInitialized, setIsInitialized] = useState(false);
  const entranceStartRef = useRef<number>(Date.now());
  const currentScaleRef = useRef<number>(0);
  
  // Fixed settings (matching original defaults)
  const particleCount = 2000;
  const radius = 10;
  const particleSize = 0.12;
  const innerColor = '#FFFAEE'; // Vanilla
  const outerColor = '#FE5102'; // Aperol
  
  // Generate sphere positions using Fibonacci distribution
  const positions = useMemo(() => 
    generateSphereLayout(particleCount, radius),
    []
  );
  
  // Create color objects
  const innerColorObj = useMemo(() => new THREE.Color(innerColor), []);
  const outerColorObj = useMemo(() => new THREE.Color(outerColor), []);
  
  // Calculate colors based on distance from center
  const colors = useMemo(() => {
    const colorArray = new Float32Array(particleCount * 3);
    const tempColor = new THREE.Color();
    
    // Find max distance for normalization
    let maxDistance = 0;
    for (let i = 0; i < particleCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);
      if (distance > maxDistance) maxDistance = distance;
    }
    
    if (maxDistance === 0) maxDistance = 1;
    
    for (let i = 0; i < particleCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);
      const t = distance / maxDistance;
      
      tempColor.copy(innerColorObj).lerp(outerColorObj, t);
      
      colorArray[i * 3] = tempColor.r;
      colorArray[i * 3 + 1] = tempColor.g;
      colorArray[i * 3 + 2] = tempColor.b;
    }
    
    return colorArray;
  }, [positions, innerColorObj, outerColorObj]);
  
  // Update instanced mesh positions and colors (runs after mount)
  useEffect(() => {
    if (!meshRef.current) return;
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < particleCount; i++) {
      dummy.position.set(
        positions[i * 3] || 0,
        positions[i * 3 + 1] || 0,
        positions[i * 3 + 2] || 0
      );
      // Start at scale 0 for entrance animation
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
    
    // Mark entrance start
    entranceStartRef.current = Date.now();
  }, [positions, colors]);
  
  // Animation loop - handles entrance animation and rotation
  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    
    // Rotate the sphere group
    groupRef.current.rotation.y += 0.5 * delta * 0.5;
    
    // Handle entrance animation
    const now = Date.now();
    const timeSinceStart = now - entranceStartRef.current;
    
    // Calculate target scale based on entrance progress
    let targetScale = 1;
    if (timeSinceStart < SPHERE_ANIMATION.ENTRANCE_DURATION) {
      const progress = timeSinceStart / SPHERE_ANIMATION.ENTRANCE_DURATION;
      // Ease-out cubic for smooth deceleration
      targetScale = 1 - Math.pow(1 - progress, 3);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
    
    // Lerp current scale toward target
    const currentScale = currentScaleRef.current;
    const newScale = currentScale + (targetScale - currentScale) * SPHERE_ANIMATION.LERP_SPEED;
    
    // Only update matrices if scale changed significantly
    if (Math.abs(newScale - currentScale) > 0.001) {
      currentScaleRef.current = newScale;
      
      const dummy = new THREE.Object3D();
      for (let i = 0; i < particleCount; i++) {
        dummy.position.set(
          positions[i * 3] || 0,
          positions[i * 3 + 1] || 0,
          positions[i * 3 + 2] || 0
        );
        dummy.scale.set(newScale, newScale, newScale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[particleSize, 8, 8]} />
        <meshBasicMaterial ref={materialRef} vertexColors transparent opacity={1} />
      </instancedMesh>
    </group>
  );
}

/**
 * InspoCanvas Props
 */
interface InspoCanvasProps {
  resources?: NormalizedResource[];
  activeFilter?: string | null;
}

/**
 * InspoCanvas
 * 
 * Main canvas component with:
 * - Central particle sphere (the "sun" - Fibonacci distribution)
 * - Orbital resource nodes (the "planets" - each resource as a colored sphere)
 * - Orbital camera controls for 3D navigation
 * 
 * Resources are positioned in a spherical shell around the center using
 * deterministic positioning based on resource ID.
 */
export default function InspoCanvas({ 
  resources = [], 
  activeFilter 
}: InspoCanvasProps) {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ 
        position: [0, 0, 60], // Pulled back to see orbital nodes
        fov: 60
      }}
      gl={{ alpha: true }}
      style={{ background: '#141414' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Central particle sphere - the "sun" */}
      <CentralSphere />
      
      {/* Orbital resource nodes - the "planets" */}
      {resources.length > 0 && (
        <ResourceNodes 
          resources={resources}
          activeFilter={activeFilter}
        />
      )}
      
      {/* OrbitControls with settings for viewing the entire solar system */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={150}
        autoRotate={false}
        enablePan={false}
      />
    </Canvas>
  );
}
