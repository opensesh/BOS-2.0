'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ParticleSystem from './ParticleSystem';
import { useInspoStore } from '@/lib/stores/inspo-store';

// Component to handle camera reset and fade on view mode changes
function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const viewMode = useInspoStore((state) => state.viewMode);
  const isTransitioning = useInspoStore((state) => state.isTransitioning);

  // Reset camera position and target when view mode changes
  useEffect(() => {
    if (controlsRef.current) {
      // Reset OrbitControls target to center
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
    
    // Smoothly move camera to default position
    const targetPosition = new THREE.Vector3(0, 0, 30);
    const currentPosition = camera.position.clone();
    
    if (currentPosition.distanceTo(targetPosition) > 5) {
      // Animate camera back to center
      const duration = 800;
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        camera.position.lerpVectors(currentPosition, targetPosition, eased);
        
        if (t < 1) {
          requestAnimationFrame(animateCamera);
        }
      };
      
      animateCamera();
    }
  }, [viewMode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      enablePan={false}
      minDistance={15}
      maxDistance={50}
      // Disable controls during transition for smoother experience
      enabled={!isTransitioning}
      // Always look at center
      target={[0, 0, 0]}
    />
  );
}

// Fade overlay component for smooth transitions
function TransitionFade() {
  const meshRef = useRef<THREE.Mesh>(null);
  const isTransitioning = useInspoStore((state) => state.isTransitioning);
  const [opacity, setOpacity] = useState(0);
  const targetOpacity = useRef(0);
  
  // Animate opacity based on transition state
  useEffect(() => {
    targetOpacity.current = isTransitioning ? 0.6 : 0;
  }, [isTransitioning]);
  
  useFrame((_, delta) => {
    // Smoothly interpolate opacity
    const speed = isTransitioning ? 8 : 4; // Faster fade-in, slower fade-out
    const newOpacity = THREE.MathUtils.lerp(opacity, targetOpacity.current, delta * speed);
    setOpacity(newOpacity);
    
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = newOpacity;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 25]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial 
        color="#141414" 
        transparent 
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function InspoCanvas() {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ position: [0, 0, 30], fov: 75 }}
      gl={{ alpha: true }}
      style={{ background: '#141414' }} // matches os-bg-dark
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <ParticleSystem radius={15} />
      <TransitionFade />
      <CameraController />
    </Canvas>
  );
}
