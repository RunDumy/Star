import { ConstellationRenderer } from '@/components/cosmic/ConstellationRenderer';
import { CosmicFeed3D } from '@/components/cosmic/CosmicFeed3D';
import { GazeVoiceNavigator } from '@/components/cosmic/GazeVoiceNavigator';
import { AvatarCustomizer } from '@/components/cosmic/personalization/AvatarCustomizer';
import { ConstellationEditor } from '@/components/cosmic/personalization/ConstellationEditor';
import { ThemeCustomizer } from '@/components/cosmic/personalization/ThemeCustomizer';
import { ControlPanel3D } from '@/components/cosmic/ui/ControlPanel3D';
import { ZodiacSocialFeed3D } from '@/components/cosmic/ui/ZodiacSocialFeed3D';
import { CollaborationProvider, useCollaboration } from '@/contexts/CollaborationContext';
import { CosmicThemeProvider, useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { OrbitControls, PerspectiveCamera, Sky, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collaborationAPI, postsAPI, zodiacAPI } from '../lib/api';

// Dynamically import components that use browser APIs
const NotificationPanel = dynamic(() => import('@/components/cosmic/NotificationPanel').then(mod => ({ default: mod.NotificationPanel })), { ssr: false });
const LiveStreamCreation = dynamic(() => import('@/components/cosmic/LiveStreamCreation').then(mod => ({ default: mod.LiveStreamCreation })), { ssr: false });
const PostCreation = dynamic(() => import('@/components/cosmic/PostCreation').then(mod => ({ default: mod.PostCreation })), { ssr: false });
const AgoraUIKitLiveStream = dynamic(() => import('@/components/cosmic/AgoraUIKitLiveStream').then(mod => ({ default: mod.AgoraUIKitLiveStream })), { ssr: false });
const CollaborativeAvatar = dynamic(() => import('@/components/cosmic/CollaborativeAvatar').then(mod => ({ default: mod.CollaborativeAvatar })), { ssr: false });
const ActionControls = dynamic(() => import('@/components/cosmic/ActionControls').then(mod => ({ default: mod.default })), { ssr: false });

// Enhanced Environment Components
const CosmicEnvironment = () => {
  const { theme } = useCosmicTheme();

  return (
    <>
      {/* Dynamic Sky */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
        {...theme.skySettings}
      />

      {/* Animated Starfield */}
      <Stars
        radius={300}
        depth={60}
        count={theme.starDensity || 8000}
        factor={theme.starSize || 6}
        saturation={0.2}
        fade
        speed={theme.animationSpeed || 1}
      />

      {/* Nebula Background Effects */}
      <fog attach="fog" args={[theme.fogColor || '#000033', 10, 200]} />

      {/* Ambient Lighting */}
      <ambientLight intensity={theme.ambientIntensity || 0.3} color={theme.ambientColor || '#ffffff'} />
      <pointLight
        position={[10, 10, 10]}
        intensity={theme.pointLightIntensity || 0.8}
        color={theme.pointLightColor || '#ffffff'}
      />

      {/* Zodiac Elemental Lighting */}
      <pointLight position={[-10, 5, -10]} intensity={0.4} color="#ff4444" /> {/* Fire */}
      <pointLight position={[10, 5, -10]} intensity={0.4} color="#87CEEB" /> {/* Air */}
      <pointLight position={[0, -5, 10]} intensity={0.4} color="#4361ee" /> {/* Water */}
    </>
  );
};

const InteractiveGround = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#1a1a2e"
        emissive="#16213e"
        emissiveIntensity={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const FloatingIslands = () => {
  const islands = [
    { position: [8, 0, 5], size: [3, 0.5, 2], rotation: [0, 0.5, 0] },
    { position: [-6, 1, -4], size: [2, 0.3, 1.5], rotation: [0, -0.3, 0] },
    { position: [3, 2, -8], size: [2.5, 0.4, 1.8], rotation: [0.1, 0.7, -0.1] },
  ];

  return islands.map((island, index) => (
    <FloatingIsland key={index} {...island} />
  ));
};

const FloatingIsland = ({ position, size, rotation }) => {
  const [ref] = useBox(() => ({
    mass: 0,
    position,
    rotation,
    args: size,
  }));

  const { theme } = useCosmicTheme();

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={theme.terrainColor || '#4a4a8a'}
        emissive={theme.terrainEmissive || '#2a2a5a'}
        emissiveIntensity={0.2}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

const CosmicParticles = () => {
  const { theme } = useCosmicTheme();
  const pointsRef = useRef();
  const particleCount = 200;

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50,
    ],
    color: theme.particleColors?.[i % theme.particleColors.length] || '#ffffff',
    size: Math.random() * 0.5 + 0.1,
  }));

  return (
    <group ref={pointsRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position} castShadow>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial color={particle.color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

// Inner component that uses the contexts
const CollaborativeCosmosScene = () => {
  const { onlineUsers, constellations, currentUser, createConstellation, socket } = useCollaboration();
  const { theme } = useCosmicTheme();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [activeStream, setActiveStream] = useState(null);
  const [posts, setPosts] = useState([]);
  const [zodiacNumbers, setZodiacNumbers] = useState(null);
  const [activeTool, setActiveTool] = useState('navigate');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const canvasRef = useRef();

  // Helper functions for zodiac integration
  const getActionColor = (zodiacSign, action) => {
    const colorMap = {
      aries: { like: '#ff4444', comment: '#ff8888', share: '#ffaaaa' },
      taurus: { like: '#44ff44', comment: '#88ff88', share: '#aaffaa' },
      gemini: { like: '#ffff44', comment: '#ffff88', share: '#ffffaa' },
      cancer: { like: '#4444ff', comment: '#8888ff', share: '#aaaaff' },
      leo: { like: '#ffaa44', comment: '#ffcc88', share: '#ffddaa' },
      virgo: { like: '#44ffaa', comment: '#88ffcc', share: '#aaffdd' },
      libra: { like: '#aa44ff', comment: '#cc88ff', share: '#ddaafe' },
      scorpio: { like: '#ff44aa', comment: '#ff88cc', share: '#ffaafe' },
      sagittarius: { like: '#44aaff', comment: '#88ccff', share: '#aaddff' },
      capricorn: { like: '#aaaaaa', comment: '#cccccc', share: '#dddddd' },
      aquarius: { like: '#44ffff', comment: '#88ffff', share: '#aaffff' },
      pisces: { like: '#aa44aa', comment: '#cc88cc', share: '#ddaadd' },
    };
    return colorMap[zodiacSign?.toLowerCase()]?.[action] || '#ffffff';
  };

  const getElementFromSign = (zodiacSign) => {
    const elementMap = {
      aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
      leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
      sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water'
    };
    return elementMap[zodiacSign?.toLowerCase()] || 'Unknown';
  };

  const getUserActions = (user) => {
    // This would integrate with the zodiac action system
    const actions = {
      like: 'Heart', comment: 'Speak', share: 'Connect', create: 'Build'
    };
    return actions;
  };

  // Handle avatar clicks
  const handleAvatarClick = (userData, event) => {
    setSelectedUser(userData);
    setSelectedConstellation(null);
  };

  // Handle constellation interactions
  const handleStarClick = (star, starIndex, constellation, event) => {
    setSelectedConstellation({ ...constellation, selectedStar: star, selectedStarIndex: starIndex });
    setSelectedUser(null);
  };

  const handleLineClick = (connection, connectionIndex, constellation, event) => {
    setSelectedConstellation({ ...constellation, selectedConnection: connection, selectedConnectionIndex: connectionIndex });
    setSelectedUser(null);
  };

  // Handle voice commands
  const handleVoiceCommand = (command) => {
    setIsVoiceActive(true);
    // Process voice commands for navigation and interactions
    console.log('Voice command:', command);
    setTimeout(() => setIsVoiceActive(false), 2000);
  };

  // Create a sample constellation for demonstration
  useEffect(() => {
    if (constellations.size === 0 && currentUser) {
      // Create sample zodiac constellations
      const sampleConstellations = [
        {
          name: "Ursa Major",
          stars: [
            { id: 'dubhe', name: 'Dubhe', position: [-2, 1, 0], color: '#ffd700', size: 0.15 },
            { id: 'merak', name: 'Merak', position: [-1, 0.5, 0], color: '#ffd700', size: 0.12 },
            { id: 'phekda', name: 'Phekda', position: [0, 0, 0], color: '#ffd700', size: 0.13 },
            { id: 'megrez', name: 'Megrez', position: [1, 0.3, 0], color: '#ffd700', size: 0.11 },
            { id: 'alioth', name: 'Alioth', position: [2, 0.8, 0], color: '#ffd700', size: 0.14 },
            { id: 'mizar', name: 'Mizar', position: [3, 1.2, 0], color: '#ffd700', size: 0.13 },
            { id: 'alkaid', name: 'Alkaid', position: [4, 1.5, 0], color: '#ffd700', size: 0.12 },
          ],
          connections: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6] // Big Dipper shape
          ],
          lineColor: '#ffffff',
          isActive: true,
        },
        {
          name: "Orion",
          stars: [
            { id: 'betelgeuse', name: 'Betelgeuse', position: [3, 2, 1], color: '#ff6b6b', size: 0.2 },
            { id: 'rigel', name: 'Rigel', position: [2, -1, 1], color: '#87ceeb', size: 0.18 },
          ],
          connections: [[0, 1]],
          lineColor: '#4a90e2',
          isActive: true,
        }
      ];

      sampleConstellations.forEach(constellation => {
        createConstellation(constellation);
      });
    }
  }, [constellations.size, currentUser, createConstellation]);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch posts
        const postsResponse = await postsAPI.getPosts();
        setPosts(postsResponse.data.posts || []);
        
        // Fetch zodiac numbers
        const zodiacResponse = await zodiacAPI.getNumbers();
        setZodiacNumbers(zodiacResponse.data);
        
        // Fetch existing constellations
        const constellationsResponse = await collaborationAPI.getConstellations();
        if (constellationsResponse.data) {
          constellationsResponse.data.forEach(constellation => {
            createConstellation(constellation);
          });
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, [createConstellation]);

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        className="w-full h-full"
        shadows
        camera={{ position: [0, 5, 15], fov: 60 }}
      >
        <CosmicThemeProvider>
          <CollaborationProvider>
            <Physics gravity={[0, -2, 0]}>
              {/* Environment */}
              <CosmicEnvironment />

              {/* Interactive Elements */}
              <InteractiveGround />
              <FloatingIslands />
              <CosmicParticles />

              {/* Camera Controls */}
              <PerspectiveCamera makeDefault />
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxDistance={100}
                minDistance={3}
                enableDamping
                dampingFactor={0.05}
              />

              {/* Collaborative Elements */}
              {Array.from(onlineUsers.keys()).map(userId => (
                <CollaborativeAvatar
                  key={userId}
                  userId={userId}
                  onClick={handleAvatarClick}
                />
              ))}

              {/* Render collaborative constellations */}
              {Array.from(constellations.keys()).map(constellationId => (
                <ConstellationRenderer
                  key={constellationId}
                  constellationId={constellationId}
                  onStarClick={handleStarClick}
                  onLineClick={handleLineClick}
                />
              ))}

              {/* Gaze and voice navigation */}
              <GazeVoiceNavigator />

              {/* 3D UI Components */}
              <ZodiacSocialFeed3D position={[5, 2, -8]} scale={0.8} />
              <ControlPanel3D position={[-6, 1, -6]} scale={0.9} />
            </Physics>
          </CollaborationProvider>
        </CosmicThemeProvider>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 text-white border border-white/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Cosmic Collaboration
                </h1>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online: {onlineUsers.size}</span>
                  <span>•</span>
                  <span>Constellations: {constellations.size}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {currentUser && (
                  <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getActionColor(currentUser.zodiacSign, 'like') }}
                    ></div>
                    <span className="text-sm">{currentUser.username}</span>
                    <span className="text-xs opacity-60">{currentUser.zodiacSign}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Left Sidebar - Tools */}
        <div className="absolute left-4 top-24 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-3 border border-white/10">
            <div className="space-y-2">
              {['navigate', 'create', 'social', 'stream'].map(tool => (
                <button
                  key={tool}
                  onClick={() => setActiveTool(tool)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    activeTool === tool
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                  title={tool.charAt(0).toUpperCase() + tool.slice(1)}
                >
                  <span className="text-lg">
                    {tool === 'navigate' && '🧭'}
                    {tool === 'create' && '✨'}
                    {tool === 'social' && '💬'}
                    {tool === 'stream' && '📹'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Information */}
        <div className="absolute right-4 top-24 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/10 max-w-sm">
            <h3 className="font-semibold mb-3 text-white">Cosmic Information</h3>

            {selectedUser && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getActionColor(selectedUser.zodiacSign, 'like') }}
                  ></div>
                  <div>
                    <h4 className="font-medium">{selectedUser.name}</h4>
                    <p className="text-sm opacity-60">{selectedUser.zodiacSign}</p>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p>Status: <span className="text-green-400">Online</span></p>
                  <p>Element: <span className="text-blue-400">{getElementFromSign(selectedUser.zodiacSign)}</span></p>
                </div>
              </div>
            )}

            {selectedConstellation && (
              <div className="space-y-3">
                <h4 className="font-medium">{selectedConstellation.name}</h4>
                <div className="text-sm space-y-1">
                  <p>Stars: {selectedConstellation.stars?.length || 0}</p>
                  <p>Connections: {selectedConstellation.connections?.length || 0}</p>
                  {selectedConstellation.selectedStar && (
                    <p className="text-yellow-400">Selected: {selectedConstellation.selectedStar.name}</p>
                  )}
                </div>
              </div>
            )}

            {!selectedUser && !selectedConstellation && (
              <div className="text-sm text-white/60 space-y-2">
                <p>Click on avatars or constellations to view details</p>
                <p>Use mouse to navigate</p>
                <p>Try voice commands: "look at north"</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar - Controls */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <ThemeCustomizer />
                <AvatarCustomizer />
                <ConstellationEditor />
              </div>

              <div className="flex items-center space-x-3">
                {/* Voice Activity Indicator */}
                {isVoiceActive && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Voice Active</span>
                  </div>
                )}

                {/* Quick Actions */}
                <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-sm font-medium transition-colors">
                  Create Post
                </button>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-medium transition-colors">
                  Start Stream
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Zodiac Actions Display */}
        {currentUser && (
          <div className="absolute top-24 left-20 pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
              <h3 className="font-semibold mb-2 text-white">Your Zodiac Actions</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(getUserActions(currentUser)).map(([action, label]) => (
                  <div key={action} className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getActionColor(currentUser.zodiacSign, action) }}
                    ></div>
                    <span className="capitalize text-white/80">{action}:</span>
                    <span className="text-blue-300 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Customizer */}
      {showCustomizer && (
        <div className="absolute top-4 right-4 z-10">
          <ThemeCustomizer />
        </div>
      )}

      {/* Avatar Customizer */}
      <AvatarCustomizer />

      {/* Constellation Editor */}
      <ConstellationEditor />

      {/* Selection Info Panel */}
      {(selectedUser || selectedConstellation) && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm max-w-md">
            {selectedUser && (
              <div>
                <h3 className="font-bold mb-2">User: {selectedUser.name}</h3>
                <p className="text-sm opacity-80">ID: {selectedUser.id}</p>
                <p className="text-sm opacity-80">Status: Online</p>
                {avatars.has(selectedUser.id) && (
                  <div className="mt-2">
                    <p className="text-sm">Avatar Position:</p>
                    <p className="text-xs opacity-60">
                      {avatars.get(selectedUser.id).position.map(coord => coord.toFixed(2)).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedConstellation && (
              <div>
                <h3 className="font-bold mb-2">Constellation: {selectedConstellation.name}</h3>
                <p className="text-sm opacity-80">Stars: {selectedConstellation.stars?.length || 0}</p>
                <p className="text-sm opacity-80">Connections: {selectedConstellation.connections?.length || 0}</p>
                {selectedConstellation.selectedStar && (
                  <div className="mt-2">
                    <p className="text-sm">Selected Star: {selectedConstellation.selectedStar.name}</p>
                    <p className="text-xs opacity-60">
                      Position: {selectedConstellation.selectedStar.position.map(coord => coord.toFixed(2)).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setSelectedUser(null);
                setSelectedConstellation(null);
              }}
              className="mt-3 px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/80 text-white p-3 rounded-lg backdrop-blur-sm text-sm max-w-xs">
          <p className="font-bold mb-1">Controls:</p>
          <p>• Click avatars to select users</p>
          <p>• Click constellation stars/lines</p>
          <p>• Use mouse to orbit camera</p>
          <p>• Scroll to zoom in/out</p>
          <p>• Try voice commands: "look at [direction]"</p>
        </div>
      </div>

      {/* Zodiac Action Controls */}
      <ActionControls />

      {/* Cosmic Feed 3D */}
      <CosmicFeed3D posts={[]} />

      {/* Post Creation Modal */}
      {showPostCreation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-black/90 text-white p-6 rounded-lg backdrop-blur-sm border border-purple-500/30">
            <h3 className="text-lg font-bold mb-4">Create Cosmic Post</h3>
            <PostCreation onPostCreated={() => setShowPostCreation(false)} />
            <button
              onClick={() => setShowPostCreation(false)}
              className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live Stream Modal */}
      {showLiveStream && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-black/90 text-white p-6 rounded-lg backdrop-blur-sm border border-green-500/30 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Live Stream Controls</h3>
            
            {activeStream ? (
              <div>
                <AgoraUIKitLiveStream 
                  streamId={activeStream.id} 
                  isHost={true} 
                />
                <button
                  onClick={() => setActiveStream(null)}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  End Stream
                </button>
              </div>
            ) : (
              <div>
                <LiveStreamCreation onStreamCreated={(stream) => setActiveStream(stream)} />
                <button
                  onClick={() => setShowLiveStream(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Panel */}
      <NotificationPanel />

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
};

// Main component with providers
const CollaborativeCosmos = () => {
  return (
    <CosmicThemeProvider>
      <CollaborationProvider>
        <CollaborativeCosmosScene />
      </CollaborationProvider>
    </CosmicThemeProvider>
  );
};

CollaborativeCosmosScene.propTypes = {
  // No props needed as it uses contexts
};

export default CollaborativeCosmos;