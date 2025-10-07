import { CollaborativeAvatar } from '@/components/cosmic/CollaborativeAvatar';
import { ConstellationRenderer } from '@/components/cosmic/ConstellationRenderer';
import { GazeVoiceNavigator } from '@/components/cosmic/GazeVoiceNavigator';
import { AvatarCustomizer } from '@/components/cosmic/personalization/AvatarCustomizer';
import { ConstellationEditor } from '@/components/cosmic/personalization/ConstellationEditor';
import { ThemeCustomizer } from '@/components/cosmic/personalization/ThemeCustomizer';
import { CosmicFeed3D } from '@/components/CosmicFeed3D';
import { CollaborationProvider, useCollaboration } from '@/contexts/CollaborationContext';
import { CosmicThemeProvider, useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../lib/supabase';
import Login from '../components/Login';

// Dynamically import components that use browser APIs
const NotificationPanel = dynamic(() => import('@/components/cosmic/NotificationPanel').then(mod => ({ default: mod.NotificationPanel })), { ssr: false });
const LiveStreamCreation = dynamic(() => import('@/components/cosmic/LiveStreamCreation').then(mod => ({ default: mod.LiveStreamCreation })), { ssr: false });
const PostCreation = dynamic(() => import('@/components/cosmic/PostCreation').then(mod => ({ default: mod.PostCreation })), { ssr: false });
const AgoraUIKitLiveStream = dynamic(() => import('@/components/cosmic/AgoraUIKitLiveStream').then(mod => ({ default: mod.AgoraUIKitLiveStream })), { ssr: false });

// Inner component that uses the contexts
const CollaborativeCosmosScene = () => {
  const { onlineUsers, avatars, constellations, currentUser, createConstellation } = useCollaboration();
  const { theme } = useCosmicTheme();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [activeStream, setActiveStream] = useState(null);
  const [posts, setPosts] = useState([]);
  const canvasRef = useRef();

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

  // Create a sample constellation for demonstration
  useEffect(() => {
    if (constellations.size === 0 && currentUser) {
      createConstellation({
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
      });
    }
  }, [constellations.size, currentUser, createConstellation]);

  // Fetch posts from Supabase
  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
      }
    }
    fetchPosts();

    // Real-time subscription
    const channel = supabase
      .channel('post-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post' },
        (payload) => {
          setPosts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="w-full h-screen relative bg-black">
      {/* 3D Canvas */}
      <Canvas ref={canvasRef} className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={50}
          minDistance={2}
        />

        {/* Cosmic background */}
        <color attach="background" args={[theme.backgroundColor || '#000011']} />
        <fog attach="fog" args={[theme.backgroundColor || '#000011', 30, 100]} />

        {/* Stars background */}
        <Stars
          radius={300}
          depth={60}
          count={theme.starDensity || 5000}
          factor={theme.starSize || 4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Ambient lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        {/* Render online user avatars */}
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
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm">
          <h1 className="text-xl font-bold mb-2">Collaborative Cosmos</h1>
          <p className="text-sm opacity-80">
            Online: {onlineUsers.size} | Constellations: {constellations.size}
          </p>
          <div className="mt-2 space-y-2">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              {showCustomizer ? 'Hide' : 'Show'} Theme Customizer
            </button>
            <button
              onClick={() => setShowPostCreation(!showPostCreation)}
              className="w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              {showPostCreation ? 'Hide' : 'Show'} Post Creation
            </button>
            <button
              onClick={() => setShowLiveStream(!showLiveStream)}
              className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              {showLiveStream ? 'Hide' : 'Show'} Live Stream
            </button>
          </div>
          {/* Posts Section */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Recent Posts</h2>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-800 p-2 rounded text-sm">
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="opacity-80">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Login Section */}
          <div className="mt-4">
            <Login />
          </div>
        </div>
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