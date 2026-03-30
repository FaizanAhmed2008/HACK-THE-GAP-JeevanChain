import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { blockchainCubeConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

interface CubeProps {
  rotationProgress: number;
}

const Cube = ({ rotationProgress }: CubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const textures = useTexture(blockchainCubeConfig.cubeTextures);

  // Responsive cube size
  const cubeSize = Math.min(viewport.width * 0.35, 2.5);

  useFrame(() => {
    if (meshRef.current) {
      // Map rotation progress (0-1) to rotation angles
      const targetRotationY = rotationProgress * Math.PI * 2;
      const targetRotationX = Math.sin(rotationProgress * Math.PI) * 0.3;

      // Smooth interpolation
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotationY,
        0.1
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotationX,
        0.1
      );
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
      {textures.map((texture, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          map={texture}
          roughness={0.2}
          metalness={0.3}
          emissive={new THREE.Color(0x22D3EE)}
          emissiveIntensity={0.1}
        />
      ))}
    </mesh>
  );
};

const BlockchainCube = () => {
  // Null check: if config is empty, do not render
  if (blockchainCubeConfig.features.length === 0 || blockchainCubeConfig.cubeTextures.length === 0) {
    return null;
  }

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [rotationProgress, setRotationProgress] = useState(0);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=300%',
      scrub: 1,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;
        setRotationProgress(progress);

        // Calculate current feature index
        const featureIndex = Math.min(
          Math.floor(progress * 4),
          blockchainCubeConfig.features.length - 1
        );
        setCurrentFeatureIndex(featureIndex);

        // Velocity-based blur effect
        const velocity = Math.abs(self.getVelocity());
        const targetBlur = Math.min(velocity / 500, 8);
        const targetSpacing = Math.min(velocity / 100, 30);

        setBlurAmount(prev => prev + (targetBlur - prev) * 0.2);
        setLetterSpacing(prev => prev + (targetSpacing - prev) * 0.2);
      },
    });

    scrollTriggerRef.current = st;

    return () => {
      st.kill();
    };
  }, []);

  const currentFeature = blockchainCubeConfig.features[currentFeatureIndex];

  return (
    <section
      id="cube"
      ref={sectionRef}
      className="relative w-full h-screen bg-void-black overflow-hidden"
    >
      {/* Background title with blur effect */}
      <div
        ref={titleRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{
          filter: `blur(${blurAmount}px)`,
          letterSpacing: `${letterSpacing}px`,
        }}
      >
        <h2 className="font-display text-[20vw] text-white/5 uppercase whitespace-nowrap select-none">
          {currentFeature.subtitle}
        </h2>
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <spotLight
              position={[-10, -10, -10]}
              angle={0.15}
              penumbra={1}
              intensity={0.5}
              color="#22D3EE"
            />
            <pointLight position={[0, 0, 5]} intensity={0.5} color="#22D3EE" />
            <Cube rotationProgress={rotationProgress} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* Feature info overlay */}
      <div className="absolute bottom-12 left-12 z-20">
        <p className="font-mono-custom text-xs text-neon-cyan/60 uppercase tracking-wider mb-2">
          Feature {String(currentFeature.id).padStart(2, '0')} / {String(blockchainCubeConfig.features.length).padStart(2, '0')}
        </p>
        <h3 className="font-display text-5xl md:text-7xl text-white mb-2 transition-all duration-300">
          {currentFeature.title}
        </h3>
        <p className="font-mono-custom text-sm text-white/50">
          {currentFeature.subtitle}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col gap-3">
          {blockchainCubeConfig.features.map((feature, index) => (
            <div
              key={feature.id}
              className={`w-2 rounded-full transition-all duration-300 ${
                index === currentFeatureIndex
                  ? 'bg-neon-cyan h-8'
                  : 'bg-white/20 h-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-12 right-12 z-20">
        <p className="font-mono-custom text-xs text-white/40 uppercase tracking-wider">
          {blockchainCubeConfig.scrollHint}
        </p>
      </div>

      {/* Decorative corner lines */}
      <div className="absolute top-12 left-12 w-20 h-px bg-gradient-to-r from-neon-cyan/50 to-transparent" />
      <div className="absolute top-12 left-12 w-px h-20 bg-gradient-to-b from-neon-cyan/50 to-transparent" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default BlockchainCube;
