import { Environment, Float, OrbitControls, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PlanetaryGlyph {
    id: string;
    name: string;
    route: string;
    zodiacSign: string;
    element: 'fire' | 'water' | 'air' | 'earth';
    position: [number, number, number];
    color: string;
    description: string;
    isActive: boolean;
}

interface PlanetaryNavigationProps {
    currentPage: string;
    onNavigate: (route: string) => void;
    glyphs: PlanetaryGlyph[];
}

// Individual orbiting glyph component
const OrbitingGlyph: React.FC<{
    glyph: PlanetaryGlyph;
    onClick: () => void;
    isActive: boolean;
}> = ({ glyph, onClick, isActive }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Orbital animation
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            const radius = 4 + Math.sin(time * 0.5) * 0.5;
            const speed = glyph.element === 'fire' ? 1.2 :
                glyph.element === 'air' ? 1.0 :
                    glyph.element === 'water' ? 0.8 : 0.6;

            meshRef.current.position.x = Math.cos(time * speed + glyph.position[0]) * radius;
            meshRef.current.position.z = Math.sin(time * speed + glyph.position[0]) * radius;
            meshRef.current.position.y = glyph.position[1] + Math.sin(time * 0.7) * 0.3;

            // Rotation based on element
            meshRef.current.rotation.y += glyph.element === 'fire' ? 0.02 : 0.01;
            meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
        }
    });

    // Element-based particle system
    const getElementalParticles = (element: string) => {
        const particleCount = hovered ? 100 : 50;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const radius = 0.5 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
        }

        return positions;
    };

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh
                ref={meshRef}
                onClick={onClick}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                scale={isActive ? 1.5 : hovered ? 1.2 : 1}
            >
                {/* Main glyph sphere */}
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial
                    color={glyph.color}
                    emissive={glyph.color}
                    emissiveIntensity={isActive ? 0.8 : hovered ? 0.4 : 0.2}
                    roughness={0.2}
                    metalness={0.8}
                />

                {/* Zodiac glyph text */}
                <Text
                    position={[0, 0, 0.4]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/cosmic-font.woff"
                >
                    {getZodiacEmoji(glyph.zodiacSign)}
                </Text>

                {/* Orbital ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.8, 0.02, 8, 100]} />
                    <meshBasicMaterial
                        color={glyph.color}
                        transparent
                        opacity={hovered ? 0.6 : 0.3}
                    />
                </mesh>

                {/* Elemental particles */}
                <points>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            array={getElementalParticles(glyph.element)}
                            count={getElementalParticles(glyph.element).length / 3}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        color={glyph.color}
                        size={0.02}
                        transparent
                        opacity={hovered ? 0.8 : 0.4}
                        sizeAttenuation
                    />
                </points>
            </mesh>
        </Float>
    );
};

// Central cosmic core
const CosmicCore: React.FC = () => {
    const coreRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (coreRef.current) {
            coreRef.current.rotation.y += 0.005;
            coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <mesh ref={coreRef}>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial
                color="#8B5CF6"
                emissive="#8B5CF6"
                emissiveIntensity={0.3}
                roughness={0.1}
                metalness={0.9}
                wireframe
            />

            {/* Inner core */}
            <mesh scale={0.7}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial
                    color="#EC4899"
                    emissive="#EC4899"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </mesh>
    );
};

// Camera controller for smooth transitions
const CameraController: React.FC<{ targetGlyph: PlanetaryGlyph | null }> = ({ targetGlyph }) => {
    const { camera, gl } = useThree();

    useEffect(() => {
        if (targetGlyph) {
            // Smooth camera transition to selected glyph
            const targetPosition = new THREE.Vector3(...targetGlyph.position);
            targetPosition.multiplyScalar(1.5); // Move back from target

            // Animate camera position
            const startPosition = camera.position.clone();
            const duration = 1000; // 1 second
            const startTime = Date.now();

            const animateCamera = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

                camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                camera.lookAt(0, 0, 0); // Always look at center

                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                }
            };

            animateCamera();
        }
    }, [targetGlyph, camera]);

    return null;
};

// Main component
const PlanetaryNavigation: React.FC<PlanetaryNavigationProps> = ({
    currentPage,
    onNavigate,
    glyphs
}) => {
    const [selectedGlyph, setSelectedGlyph] = useState<PlanetaryGlyph | null>(null);
    const [showInterface, setShowInterface] = useState(true);

    // Helper function for zodiac emoji
    const getZodiacEmoji = (sign: string) => {
        const emojiMap: { [key: string]: string } = {
            'aries': '♈', 'taurus': '♉', 'gemini': '♊', 'cancer': '♋',
            'leo': '♌', 'virgo': '♍', 'libra': '♎', 'scorpio': '♏',
            'sagittarius': '♐', 'capricorn': '♑', 'aquarius': '♒', 'pisces': '♓'
        };
        return emojiMap[sign.toLowerCase()] || '⭐';
    };

    // Handle glyph selection and navigation
    const handleGlyphClick = (glyph: PlanetaryGlyph) => {
        setSelectedGlyph(glyph);
        setTimeout(() => {
            onNavigate(glyph.route);
        }, 1000); // Delay navigation for animation
    };

    // Toggle interface visibility
    const toggleInterface = () => {
        setShowInterface(!showInterface);
    };

    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-black via-purple-950 to-black overflow-hidden">
            {/* 3D Scene */}
            <Canvas
                camera={{ position: [8, 5, 8], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.3} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} color="#8B5CF6" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#EC4899" />

                    {/* Environment */}
                    <Stars
                        radius={300}
                        depth={50}
                        count={5000}
                        factor={4}
                        saturation={0}
                        fade
                    />
                    <Environment preset="night" />

                    {/* Central cosmic core */}
                    <CosmicCore />

                    {/* Orbiting glyphs */}
                    {glyphs.map((glyph) => (
                        <OrbitingGlyph
                            key={glyph.id}
                            glyph={glyph}
                            onClick={() => handleGlyphClick(glyph)}
                            isActive={glyph.route === currentPage}
                        />
                    ))}

                    {/* Camera controller */}
                    <CameraController targetGlyph={selectedGlyph} />

                    {/* Controls */}
                    <OrbitControls
                        enablePan={false}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={15}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI - Math.PI / 6}
                    />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <AnimatePresence>
                {showInterface && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-6 pointer-events-auto">
                            <div className="flex items-center justify-between">
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="flex items-center space-x-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                        <span className="text-white font-bold">🌌</span>
                                    </div>
                                    <div>
                                        <h1 className="text-white font-bold text-xl">Cosmic Navigation</h1>
                                        <p className="text-gray-300 text-sm">Navigate through the stellar interface</p>
                                    </div>
                                </motion.div>

                                <button
                                    onClick={toggleInterface}
                                    className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                                >
                                    ⚙️
                                </button>
                            </div>
                        </div>

                        {/* Navigation Help */}
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-xl p-4 max-w-xs pointer-events-auto"
                        >
                            <h3 className="text-white font-semibold mb-3 flex items-center">
                                <span className="mr-2">🎯</span>
                                Navigation Guide
                            </h3>
                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    <span>Click orbital glyphs to navigate</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                    <span>Drag to rotate view</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span>Scroll to zoom</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Glyph Information Panel */}
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-xl p-4 max-w-xs pointer-events-auto"
                        >
                            <h3 className="text-white font-semibold mb-3 flex items-center">
                                <span className="mr-2">📍</span>
                                Current: {glyphs.find(g => g.route === currentPage)?.name || 'Unknown'}
                            </h3>

                            <div className="space-y-3">
                                {glyphs.map((glyph) => (
                                    <motion.div
                                        key={glyph.id}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => handleGlyphClick(glyph)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${glyph.route === currentPage
                                                ? 'bg-purple-600/50 border border-purple-400'
                                                : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                                                style={{ backgroundColor: glyph.color }}
                                            >
                                                {getZodiacEmoji(glyph.zodiacSign)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white truncate">{glyph.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{glyph.description}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Bottom Controls */}
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 pointer-events-auto"
                        >
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                                Enter Cosmic Mode
                            </button>
                            <button
                                onClick={toggleInterface}
                                className="px-6 py-3 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-colors"
                            >
                                Hide Interface
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading transition overlay */}
            <AnimatePresence>
                {selectedGlyph && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <div
                                className="w-20 h-20 rounded-full mb-4 mx-auto flex items-center justify-center text-white text-3xl font-bold animate-pulse"
                                style={{ backgroundColor: selectedGlyph.color }}
                            >
                                {getZodiacEmoji(selectedGlyph.zodiacSign)}
                            </div>
                            <h2 className="text-white text-xl font-bold mb-2">
                                Navigating to {selectedGlyph.name}
                            </h2>
                            <p className="text-gray-300">
                                {selectedGlyph.description}
                            </p>
                            <div className="mt-4 flex justify-center space-x-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-white rounded-full"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [1, 0.5, 1]
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimal toggle for hidden interface */}
            {!showInterface && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={toggleInterface}
                    className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors z-40"
                >
                    🌌
                </motion.button>
            )}
        </div>
    );
};

// Export with zodiac emoji helper
export default PlanetaryNavigation;

// Helper function to get zodiac emoji (needed for global access)
function getZodiacEmoji(sign: string): string {
    const emojiMap: { [key: string]: string } = {
        'aries': '♈', 'taurus': '♉', 'gemini': '♊', 'cancer': '♋',
        'leo': '♌', 'virgo': '♍', 'libra': '♎', 'scorpio': '♏',
        'sagittarius': '♐', 'capricorn': '♑', 'aquarius': '♒', 'pisces': '♓'
    };
    return emojiMap[sign.toLowerCase()] || '⭐';
}