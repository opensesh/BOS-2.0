'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CentralSphere
 * 
 * A glowing orange sphere at the origin that rotates independently.
 * Specs: radius 3, segments 32, color #FF5102, rotation 0.002 rad/frame
 */
function CentralSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Rotate sphere independently at 0.002 rad/frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial
        color="#FF5102"
        emissive="#FF5102"
        emissiveIntensity={0.3}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Scene lighting
 */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[20, 20, 20]} intensity={1} />
      <pointLight position={[-20, -20, -20]} intensity={0.5} color="#FE5102" />
      <pointLight position={[0, 0, 15]} intensity={0.3} color="#FFFAEE" />
    </>
  );
}

/**
 * InspoCanvas
 * 
 * Main canvas component with:
 * - Central rotating sphere
 * - Orbital camera controls
 * - Ready for Phase 2 orbital node positioning
 */
export default function InspoCanvas() {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ 
        position: [0, 5, 35], 
        fov: 55,
        near: 0.1,
        far: 200
      }}
      gl={{ 
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      }}
      style={{ background: '#141414' }}
      dpr={[1, 2]}
    >
      <SceneLighting />
      <CentralSphere />
      
      {/* OrbitControls with specified settings */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={100}
        autoRotate={false}
        enablePan={true}
        panSpeed={0.5}
        maxPolarAngle={Math.PI * 0.85}
      />
      
      {/* Fog for depth perception */}
      <fog attach="fog" args={['#141414', 30, 120]} />
    </Canvas>
  );
}
