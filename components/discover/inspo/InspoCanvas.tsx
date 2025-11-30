'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ParticleSystem from './ParticleSystem';

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
      <ParticleSystem count={1000} radius={15} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minDistance={10}
        maxDistance={50}
      />
    </Canvas>
  );
}
