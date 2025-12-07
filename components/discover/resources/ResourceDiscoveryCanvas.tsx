'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useResourceDiscoveryStore } from '@/lib/stores/resource-discovery-store';
import { generateClusteredLayout } from '@/lib/utils/force-cluster-layout';
import { getInspoResources, normalizeResource } from '@/lib/data/inspo';

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
 * Scene lighting for the visualization
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
 * ResourceDiscoveryCanvas
 * 
 * Main canvas component that:
 * 1. Fetches resources from data source on mount
 * 2. Generates clustered layout for Phase 2
 * 3. Renders central sphere with orbital camera controls
 * 4. Provides foundation for orbital node positioning
 */
export default function ResourceDiscoveryCanvas() {
  const setResources = useResourceDiscoveryStore((state) => state.setResources);
  const setClusters = useResourceDiscoveryStore((state) => state.setClusters);
  const setLoading = useResourceDiscoveryStore((state) => state.setLoading);
  const setError = useResourceDiscoveryStore((state) => state.setError);
  const isLoading = useResourceDiscoveryStore((state) => state.isLoading);
  
  // Fetch and process resources on mount
  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getInspoResources();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        throw new Error('No resources found');
      }
      
      // Normalize resources
      const normalized = data.map(normalizeResource);
      
      // Generate clustered layout (ready for Phase 2 orbital positioning)
      const { nodes, clusters } = generateClusteredLayout(normalized);
      
      setResources(nodes);
      setClusters(clusters);
      setLoading(false);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load resources';
      setError(message);
      setLoading(false);
      console.error('[ResourceDiscoveryCanvas] Error loading resources:', err);
    }
  }, [setResources, setClusters, setLoading, setError]);
  
  useEffect(() => {
    loadResources();
  }, [loadResources]);
  
  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-os-charcoal/80">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-os-vanilla border-t-os-aperol rounded-full animate-spin" />
            <p className="text-os-vanilla font-nhtext text-sm">
              Loading resources...
            </p>
          </div>
        </div>
      )}
      
      {/* Three.js Canvas */}
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
    </div>
  );
}
