'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ParticleSystem from './ParticleSystem';
import { useInspoStore } from '@/lib/stores/inspo-store';

// Component to handle camera reset on view mode changes
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
    
    // Smoothly move camera to default position (closer for compact view)
    const targetPosition = new THREE.Vector3(0, 0, 22);
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
      minDistance={12}
      maxDistance={40}
      // Disable controls during transition for smoother experience
      enabled={!isTransitioning}
      // Always look at center
      target={[0, 0, 0]}
    />
  );
}

export default function InspoCanvas() {
  return (
    <Canvas
      className="w-full h-full"
      camera={{ position: [0, 0, 22], fov: 60 }}
      gl={{ alpha: true }}
      style={{ background: '#141414' }} // matches os-bg-dark
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <ParticleSystem radius={10} />
      <CameraController />
    </Canvas>
  );
}
