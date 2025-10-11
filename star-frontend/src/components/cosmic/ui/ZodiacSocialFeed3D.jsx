import { useCollaboration } from '@/contexts/CollaborationContext';
import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export const ZodiacSocialFeed3D = ({ position = [0, 0, -5], scale = 1 }) => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useCosmicTheme();
  const { currentUser } = useCollaboration();

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
    // Set up polling for real-time updates
    const interval = setInterval(fetchPosts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Zodiac emoji mapping for posts
  const getZodiacEmoji = (zodiacSign) => {
    const zodiacEmojis = {
      aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
      leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
      sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
    };
    return zodiacEmojis[zodiacSign?.toLowerCase()] || '⭐';
  };

  // Get elemental color based on zodiac
  const getElementalColor = (zodiacSign) => {
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];

    if (fireSigns.includes(zodiacSign?.toLowerCase())) return '#ff6b35';
    if (earthSigns.includes(zodiacSign?.toLowerCase())) return '#4ade80';
    if (airSigns.includes(zodiacSign?.toLowerCase())) return '#60a5fa';
    if (waterSigns.includes(zodiacSign?.toLowerCase())) return '#a78bfa';
    return '#fbbf24';
  };

  // Floating animation for feed items
  const FloatingPost = ({ post, index, onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime + index) * 0.001;
        meshRef.current.rotation.y += 0.005;
      }
    });

    const zodiacColor = getElementalColor(post.zodiacSign);
    const emoji = getZodiacEmoji(post.zodiacSign);

    return (
      <group
        ref={meshRef}
        position={[0, index * -1.5, 0]}
        onClick={() => onClick(post)}
      >
        {/* Post orb */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={zodiacColor}
            emissive={zodiacColor}
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Zodiac symbol */}
        <Text
          position={[0, 0, 0.35]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {emoji}
        </Text>

        {/* Author name */}
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.08}
          color={theme.colors?.text || '#ffffff'}
          anchorX="center"
          anchorY="middle"
        >
          {post.author}
        </Text>

        {/* Preview text */}
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.06}
          color={theme.colors?.textSecondary || '#cccccc'}
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {post.content?.substring(0, 50)}...
        </Text>
      </group>
    );
  };

  // Expanded post view
  const ExpandedPostView = ({ post, onClose }) => {
    if (!post) return null;

    const zodiacColor = getElementalColor(post.zodiacSign);
    const emoji = getZodiacEmoji(post.zodiacSign);

    return (
      <group position={[3, 0, 0]}>
        {/* Background panel */}
        <mesh>
          <planeGeometry args={[4, 6]} />
          <meshStandardMaterial
            color={theme.colors?.background || '#1a1a2e'}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Close button */}
        <mesh position={[1.8, 2.8, 0.1]} onClick={onClose}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color="#ff4757" />
        </mesh>
        <Text
          position={[1.8, 2.8, 0.2]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ✕
        </Text>

        {/* Zodiac symbol */}
        <Text
          position={[0, 2.5, 0.1]}
          fontSize={0.4}
          color={zodiacColor}
          anchorX="center"
          anchorY="middle"
        >
          {emoji}
        </Text>

        {/* Author */}
        <Text
          position={[0, 2, 0.1]}
          fontSize={0.15}
          color={theme.colors?.text || '#ffffff'}
          anchorX="center"
          anchorY="middle"
        >
          {post.author}
        </Text>

        {/* Content */}
        <Text
          position={[0, 1, 0.1]}
          fontSize={0.12}
          color={theme.colors?.text || '#ffffff'}
          anchorX="center"
          anchorY="middle"
          maxWidth={3.5}
        >
          {post.content}
        </Text>

        {/* Timestamp */}
        <Text
          position={[0, -2.5, 0.1]}
          fontSize={0.08}
          color={theme.colors?.textSecondary || '#cccccc'}
          anchorX="center"
          anchorY="middle"
        >
          {new Date(post.timestamp).toLocaleString()}
        </Text>

        {/* Emotional tone indicator */}
        {post.emotionalTone && (
          <Text
            position={[0, -2.8, 0.1]}
            fontSize={0.1}
            color={zodiacColor}
            anchorX="center"
            anchorY="middle"
          >
            {post.emotionalTone}
          </Text>
        )}
      </group>
    );
  };

  return (
    <group position={position} scale={scale}>
      {/* Feed title */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color={theme.colors?.accent || '#00d4ff'}
        anchorX="center"
        anchorY="middle"
      >
        🌟 Cosmic Feed 🌟
      </Text>

      {/* Post list */}
      <group position={[0, 2, 0]}>
        {posts.slice(0, 8).map((post, index) => (
          <FloatingPost
            key={post.id}
            post={post}
            index={index}
            onClick={setSelectedPost}
          />
        ))}
      </group>

      {/* Expanded post view */}
      <AnimatePresence>
        {selectedPost && (
          <ExpandedPostView
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>

      {/* Feed stats */}
      <Text
        position={[0, -6, 0]}
        fontSize={0.1}
        color={theme.colors?.textSecondary || '#cccccc'}
        anchorX="center"
        anchorY="middle"
      >
        {posts.length} posts in the cosmos
      </Text>
    </group>
  );
};