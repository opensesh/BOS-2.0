'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateSphereLayout } from '@/lib/utils/particle-layouts';

/**
 * CentralSphere
 * 
 * A sphere made of many small particles using Fibonacci distribution.
 * Creates the iconic particle sphere visualization.
 * 
 * This is a simplified, fixed version of ParticleSystem locked to sphere mode.
 */
function CentralSphere() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
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
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Set instance colors
    if (meshRef.current.geometry) {
      const colorAttribute = new THREE.InstancedBufferAttribute(colors, 3);
      meshRef.current.geometry.setAttribute('color', colorAttribute);
    }
  }, [positions, colors]);
  
  // Rotate the sphere group
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.5 * delta * 0.5;
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

/**
 * InspoCanvas
 * 
 * Main canvas component with:
 * - Central particle sphere (Fibonacci distribution)
 * - Orbital camera controls
 * - Ready for Phase 2 orbital node positioning
 */
export default function InspoCanvas() {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ 
        position: [0, 0, 22], 
        fov: 60
      }}
      gl={{ alpha: true }}
      style={{ background: '#141414' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <CentralSphere />
      
      {/* OrbitControls with specified settings */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={100}
        autoRotate={false}
        enablePan={false}
      />
    </Canvas>
  );
}
