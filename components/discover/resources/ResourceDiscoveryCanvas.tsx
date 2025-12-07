'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ResourceParticleSystem from './ResourceParticleSystem';
import { useResourceDiscoveryStore } from '@/lib/stores/resource-discovery-store';
import { generateClusteredLayout } from '@/lib/utils/force-cluster-layout';
import { getInspoResources, normalizeResource } from '@/lib/data/inspo';

/**
 * CameraController
 * 
 * Handles smooth camera transitions when:
 * - Focusing on a category cluster
 * - Resetting to overview position
 * 
 * Uses cubic easing for natural feel
 */
function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  const cameraTarget = useResourceDiscoveryStore((state) => state.cameraTarget);
  const isAnimating = useResourceDiscoveryStore((state) => state.isAnimating);
  const setAnimating = useResourceDiscoveryStore((state) => state.setAnimating);
  
  // Animation state
  const animationRef = useRef<{
    startTime: number;
    duration: number;
    fromPosition: THREE.Vector3;
    toPosition: THREE.Vector3;
    fromLookAt: THREE.Vector3;
    toLookAt: THREE.Vector3;
    isRunning: boolean;
  }>({
    startTime: 0,
    duration: 1200, // 1.2s
    fromPosition: new THREE.Vector3(),
    toPosition: new THREE.Vector3(),
    fromLookAt: new THREE.Vector3(),
    toLookAt: new THREE.Vector3(),
    isRunning: false,
  });
  
  // Start animation when cameraTarget changes
  useEffect(() => {
    if (!isAnimating) return;
    
    const { position, lookAt } = cameraTarget;
    
    animationRef.current = {
      startTime: Date.now(),
      duration: 1200,
      fromPosition: camera.position.clone(),
      toPosition: new THREE.Vector3(position.x, position.y, position.z),
      fromLookAt: controlsRef.current?.target.clone() || new THREE.Vector3(0, 0, 0),
      toLookAt: new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z),
      isRunning: true,
    };
  }, [cameraTarget, isAnimating, camera]);
  
  // Animate camera
  useFrame(() => {
    const anim = animationRef.current;
    if (!anim.isRunning) return;
    
    const elapsed = Date.now() - anim.startTime;
    const t = Math.min(elapsed / anim.duration, 1);
    
    // Ease-in-out cubic
    const eased = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    // Interpolate position
    camera.position.lerpVectors(anim.fromPosition, anim.toPosition, eased);
    
    // Interpolate lookAt target
    if (controlsRef.current) {
      const newTarget = new THREE.Vector3().lerpVectors(
        anim.fromLookAt,
        anim.toLookAt,
        eased
      );
      controlsRef.current.target.copy(newTarget);
      controlsRef.current.update();
    }
    
    // End animation
    if (t >= 1) {
      anim.isRunning = false;
      setAnimating(false);
    }
  });
  
  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      enablePan={true}
      panSpeed={0.5}
      minDistance={8}
      maxDistance={60}
      maxPolarAngle={Math.PI * 0.85}
      enabled={!animationRef.current.isRunning}
    />
  );
}

/**
 * Scene lighting for the particle visualization
 */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[20, 20, 20]} intensity={0.8} />
      <pointLight position={[-20, -20, -20]} intensity={0.3} color="#FE5102" />
    </>
  );
}

/**
 * ResourceDiscoveryCanvas
 * 
 * Main canvas component that:
 * 1. Fetches resources from Supabase on mount
 * 2. Generates force-directed clustered layout
 * 3. Renders interactive particle visualization
 * 4. Handles camera navigation
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
      
      // Generate clustered layout
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
        dpr={[1, 2]} // Responsive pixel ratio
      >
        <SceneLighting />
        <ResourceParticleSystem />
        <CameraController />
        
        {/* Optional: Add fog for depth perception */}
        <fog attach="fog" args={['#141414', 30, 80]} />
      </Canvas>
    </div>
  );
}
