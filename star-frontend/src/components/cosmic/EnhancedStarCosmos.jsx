// platforms/star-app/src/components/cosmic/EnhancedStarCosmos.jsx
import { Physics, usePlane } from '@react-three/cannon';
import {
    Float,
    OrbitControls,
    PerspectiveCamera,
    Sky,
    Sparkles,
    Stars,
    Text
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';

// Enhanced Components
import { CosmicAvatar } from './CosmicAvatar';
import { ElementalNexus } from './ElementalNexus';
import { EnhancedCosmicUI } from './EnhancedCosmicUI';
import { MultiSystemSocialOrbit } from './MultiSystemSocialOrbit';
import { VoiceCosmicNavigator } from './VoiceCosmicNavigator';
import { ZodiacConstellation } from './ZodiacConstellation';
import { ZodiacParticleUniverse } from './ZodiacParticleUniverse';

// Context Providers
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { ELEMENT_COLORS, ZODIAC_SYSTEMS } from '@/lib/zodiacSystems';

// Enhanced Cosmic Environment with Dynamic Elements
const DynamicCosmicEnvironment = () => {
  const { theme } = useCosmicTheme();
  const nebulaRef = useRef();
  const galaxyRef = useRef();

  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      nebulaRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <>
      {/* Dynamic Cosmic Sky */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
        {...theme.skySettings}
      />

      {/* Animated Starfield with Multiple Layers */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <Stars
        radius={200}
        depth={100}
        count={8000}
        factor={8}
        saturation={0.2}
        fade
        speed={0.5}
      />

      {/* Nebula Cloud System */}
      <mesh ref={nebulaRef}>
        <sphereGeometry args={[80, 64, 64]} />
        <shaderMaterial
          transparent
          opacity={0.1}
          side={2}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
              vUv = uv;
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
              vec2 uv = vUv * 2.0 - 1.0;
              float d = length(uv);
              float a = atan(uv.y, uv.x);

              // Nebula pattern
              float n = sin(d * 8.0 + time) * 0.5 + 0.5;
              n += sin(a * 5.0 + time * 0.5) * 0.3;
              n = smoothstep(0.3, 0.7, n);

              vec3 color = mix(
                vec3(0.1, 0.1, 0.3),
                vec3(0.4, 0.2, 0.6),
                n
              );

              gl_FragColor = vec4(color, n * 0.1);
            }
          `}
          uniforms={{
            time: { value: 0 }
          }}
        />
      </mesh>

      {/* Sparkling Cosmic Dust */}
      <Sparkles
        count={200}
        scale={[100, 100, 100]}
        size={6}
        speed={0.4}
        color="#ffffff"
        opacity={0.6}
      />

      {/* Zodiac Elemental Lighting */}
      <ambientLight intensity={0.4} color={theme.ambientColor || '#1a1a2e'} />
      <pointLight position={[15, 10, 15]} intensity={1.5} color="#ff4444" /> {/* Fire */}
      <pointLight position={[-15, 5, 10]} intensity={1.2} color="#87CEEB" /> {/* Air */}
      <pointLight position={[10, -5, -15]} intensity={1.2} color="#4361ee" /> {/* Water */}
      <pointLight position={[-10, -10, 15]} intensity={1.0} color="#8B4513" /> {/* Earth */}
    </>
  );
};

// Interactive Cosmic Ground with Zodiac Symbols
const InteractiveCosmicGround = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -8, 0],
  }));

  const { theme } = useCosmicTheme();
  const groundRef = useRef();

  useFrame((state) => {
    if (groundRef.current) {
      groundRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group>
      {/* Main Ground */}
      <mesh ref={ref} receiveShadow>
        <circleGeometry args={[80, 128]} />
        <meshStandardMaterial
          color={theme.groundColor || '#0a0a2e'}
          emissive={theme.groundEmissive || '#1a1a4a'}
          emissiveIntensity={0.4}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Zodiac Symbol Ring */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.9, 0]}>
        <ringGeometry args={[25, 30, 72]} />
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>

      {/* Ground Pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.8, 0]}>
        <circleGeometry args={[75, 64]} />
        <meshBasicMaterial
          transparent
          opacity={0.05}
          side={2}
          wireframe
          color="#ffffff"
        />
      </mesh>
    </group>
  );
};

// Floating Zodiac Temples for Each System
const ZodiacTemples = () => {
  const temples = [
    { system: 'WESTERN', position: [20, 0, 0], color: '#ff6b6b', rotation: [0, 0, 0] },
    { system: 'CHINESE', position: [-20, 0, 0], color: '#4ecdc4', rotation: [0, Math.PI, 0] },
    { system: 'VEDIC', position: [0, 0, 20], color: '#ffe66d', rotation: [0, Math.PI / 2, 0] }
  ];

  return temples.map((temple, index) => (
    <ZodiacTemple key={temple.system} {...temple} />
  ));
};

const ZodiacTemple = ({ system, position, color, rotation }) => {
  const templeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (templeRef.current) {
      templeRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      templeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <group ref={templeRef} position={position} rotation={rotation}>
      {/* Temple Base */}
      <mesh
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[3, 4, 2, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Temple Spire */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1.5, 4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* System Name */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {system}
      </Text>

      {/* Floating Orbs */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {ZODIAC_SYSTEMS[system].signs.map((sign, index) => {
          const angle = (index / 12) * Math.PI * 2;
          const radius = 6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const element = Object.entries(ZODIAC_SYSTEMS[system].elements)
            .find(([_, signs]) => signs.includes(sign))?.[0];
          const elementColor = ELEMENT_COLORS[element]?.primary || color;

          return (
            <mesh key={sign} position={[x, 2, z]} castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={elementColor}
                emissive={elementColor}
                emissiveIntensity={0.5}
              />
              <Text
                position={[0, 0.6, 0]}
                fontSize={0.2}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                font="/fonts/inter-regular.woff"
              >
                {sign}
              </Text>
            </mesh>
          );
        })}
      </Float>

      {/* Connection Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 6.5, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>
    </group>
  );
};

// Enhanced Cosmic Portal System
const CosmicPortalSystem = () => {
  const portals = [
    { id: 'social', position: [0, 0, -15], color: '#4a90e2', label: 'Social Hub', size: 4 },
    { id: 'creation', position: [15, 0, 15], color: '#9b59b6', label: 'Creation Zone', size: 3.5 },
    { id: 'exploration', position: [-15, 0, 15], color: '#2ecc71', label: 'Exploration', size: 3 },
    { id: 'streaming', position: [0, 0, 25], color: '#e74c3c', label: 'Live Stream', size: 3.5 }
  ];

  return portals.map(portal => (
    <CosmicPortal key={portal.id} {...portal} />
  ));
};

const CosmicPortal = ({ position, color, label, size }) => {
  const portalRef = useRef();
  const [active, setActive] = useState(false);

  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      portalRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Portal Outer Ring */}
      <mesh ref={portalRef} castShadow>
        <torusGeometry args={[size, 0.3, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Portal Core */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.6, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
          side={2}
        />
      </mesh>

      {/* Portal Energy Field */}
      <mesh>
        <sphereGeometry args={[size * 0.8, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={2}
          wireframe
        />
      </mesh>

      {/* Portal Label */}
      <Text
        position={[0, size + 1, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {label}
      </Text>

      {/* Interactive Zone */}
      <mesh
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
      >
        <sphereGeometry args={[size * 1.2, 16, 16]} />
        <meshBasicMaterial
          visible={false}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Activation Effect */}
      {active && (
        <Sparkles
          count={30}
          scale={[size * 2, size * 2, size * 2]}
          size={4}
          speed={0.5}
          color={color}
        />
      )}
    </group>
  );
};

// Enhanced Collaborative Elements
const CollaborativeCosmicElements = () => {
  const { onlineUsers, constellations, currentUser } = useCollaboration();

  return (
    <group>
      {/* Collaborative Avatars */}
      {Array.from(onlineUsers.keys()).map(userId => (
        <CosmicAvatar
          key={userId}
          userId={userId}
          enhanced={true}
        />
      ))}

      {/* Dynamic Constellations */}
      {Array.from(constellations.keys()).map(constellationId => (
        <ZodiacConstellation
          key={constellationId}
          constellationId={constellationId}
          interactive={true}
        />
      ))}

      {/* Multi-System Social Orbits */}
      <MultiSystemSocialOrbit position={[0, 3, 0]} />

      {/* Elemental Nexus */}
      <ElementalNexus position={[10, 0, -10]} />

      {/* Zodiac Particle Universe */}
      <ZodiacParticleUniverse />
    </group>
  );
};

// Main Enhanced Star Cosmos Component
export const EnhancedStarCosmos = () => {
  const canvasRef = useRef();
  const { theme } = useCosmicTheme();
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeMode, setActiveMode] = useState('explore');
  const [voiceActive, setVoiceActive] = useState(false);

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden cosmic-background">
      {/* Enhanced 3D Canvas */}
      <Canvas
        ref={canvasRef}
        className="w-full h-full"
        shadows
        camera={{ position: [0, 15, 30], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -3, 0]} allowSleep={false}>
            {/* Enhanced Environment */}
            <DynamicCosmicEnvironment />
            <InteractiveCosmicGround />

            {/* Camera Controls */}
            <PerspectiveCamera makeDefault />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxDistance={150}
              minDistance={5}
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
            />

            {/* Cosmic Structures */}
            <ZodiacTemples />
            <CosmicPortalSystem />

            {/* Collaborative Elements */}
            <CollaborativeCosmicElements />

            {/* Voice Navigation */}
            <VoiceCosmicNavigator
              onVoiceActive={setVoiceActive}
              onCommand={(command) => console.log('Cosmic Command:', command)}
            />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Enhanced Cosmic UI */}
      <EnhancedCosmicUI
        selectedElement={selectedElement}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        voiceActive={voiceActive}
        onElementSelect={setSelectedElement}
      />

      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 pointer-events-none cosmic-glow"></div>
    </div>
  );
};

export default EnhancedStarCosmos;