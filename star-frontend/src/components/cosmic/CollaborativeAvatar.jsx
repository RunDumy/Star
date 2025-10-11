import { useCollaboration } from '@/contexts/CollaborationContext';
import { getActionColor } from '@/lib/zodiacActions';
import { ALL_ZODIAC_ANIMATIONS, getToneEnhancedAnimation } from '@/lib/zodiacAnimations';
import { getSystemForSign } from '@/lib/zodiacSystems';
import { animated, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGesture } from '@use-gesture/react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
  // Custom ParticleSystem component for action effects
const ParticleSystem = ({ action, isActive, color, userData }) => {
  const particlesRef = useRef();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isActive && action && userData) {
      const system = getSystemForSign(userData.zodiacSign);
      const allAnimations = GENERATE_ALL_ZODIAC_ANIMATIONS();
      const systemAnimations = allAnimations[system];

      if (systemAnimations && systemAnimations[action]) {
        const config = systemAnimations[action].particles;
        const newParticles = Array.from({ length: config.count }, (_, i) => ({
          id: i,
          position: [0, 0, 0],
          velocity: [
            config.direction === 'forward' ? config.speed * 0.1 : (Math.random() - 0.5) * config.speed * 0.1,
            config.direction === 'top' ? config.speed * 0.1 : config.direction === 'down' ? -config.speed * 0.1 : (Math.random() - 0.5) * config.speed * 0.1,
            config.direction === 'out' ? config.speed * 0.1 : (Math.random() - 0.5) * config.speed * 0.1,
          ],
          life: 1.0,
          color: color || '#ffffff',
        }));
        setParticles(newParticles);

        // Cleanup particles after animation
        const timer = setTimeout(() => setParticles([]), systemAnimations[action].duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isActive, action, color, userData]);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particles.forEach((particle, index) => {
        const mesh = particlesRef.current.children[index];
        if (mesh) {
          // Update position based on velocity
          mesh.position.x += particle.velocity[0] * delta;
          mesh.position.y += particle.velocity[1] * delta;
          mesh.position.z += particle.velocity[2] * delta;

          // Fade out over time
          particle.life -= delta * 2;
          mesh.material.opacity = Math.max(0, particle.life);
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle) => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={particle.life}
          />
        </mesh>
      ))}
    </group>
  );
};

// Zodiac color mapping for avatars
const getZodiacColor = (zodiacSign) => {
  const colorMap = {
    // Western signs
    aries: '#ff4444', taurus: '#44ff44', gemini: '#ffff44',
    cancer: '#4444ff', leo: '#ffaa44', virgo: '#44ffaa',
    libra: '#aa44ff', scorpio: '#ff44aa', sagittarius: '#44aaff',
    capricorn: '#aaaaaa', aquarius: '#44ffff', pisces: '#aa44aa',
    // Mayan Day Signs
    crocodile: '#8B4513', wind: '#87CEEB', jaguar: '#000000',
    road: '#DAA520', serpent: '#32CD32', death: '#8B0000',
    deer: '#228B22', rabbit: '#FFB6C1', water: '#4169E1',
    dog: '#8B4513', monkey: '#FFD700', reed: '#9ACD32',
    eagle: '#B22222', vulture: '#696969', earth: '#8B4513',
    storm: '#4682B4', sun: '#FFD700', night: '#191970',
    seed: '#32CD32',
    // Aztec Day Signs
    house: '#8B4513', lizard: '#20B2AA', grass: '#9ACD32',
    movement: '#FF4500', flint: '#708090'
  };
  return colorMap[zodiacSign?.toLowerCase()] || '#4a90e2';
};

const getElementalEffect = (zodiacSign) => {
  const elementMap = {
    // Western signs
    aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
    leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
    sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
    // Mayan Day Signs
    crocodile: 'earth', wind: 'air', jaguar: 'fire',
    road: 'earth', serpent: 'fire', death: 'fire',
    deer: 'earth', rabbit: 'air', water: 'water',
    dog: 'earth', monkey: 'air', reed: 'earth',
    eagle: 'fire', vulture: 'air', earth: 'earth',
    storm: 'air', sun: 'fire', night: 'water',
    seed: 'earth',
    // Aztec Day Signs
    house: 'earth', lizard: 'water', grass: 'earth',
    movement: 'water', flint: 'water'
  };
  return elementMap[zodiacSign?.toLowerCase()] || 'default';
};

export const CollaborativeAvatar = ({ userId, onClick, isCurrentUser = false }) => {
  const meshRef = useRef();
  const particleRef = useRef();
  const { onlineUsers, updateUserPosition, socket } = useCollaboration();
  const { theme } = useCosmicTheme();
  const [userData, setUserData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [elementalParticles, setElementalParticles] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);

  // Spring animation setup
  const [spring, api] = useSpring(() => ({
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    emissiveIntensity: 0.2,
    config: { mass: 1, tension: 280, friction: 60 },
  }));

  // Gesture handling for drag interactions
  const bind = useGesture({
    onDrag: ({ active, movement: [x, y], velocity }) => {
      if (isCurrentUser && active) {
        // Update position based on drag
        const newPosition = [
          (userData?.position?.[0] || 0) + x * 0.01,
          (userData?.position?.[1] || 0) - y * 0.01,
          userData?.position?.[2] || 0
        ];
        updateUserPosition(userId, newPosition);
      }
    },
    onHover: ({ hovering }) => {
      setIsHovered(hovering);
    }
  });

  useEffect(() => {
    const user = onlineUsers.get(userId);
    if (user) {
      // Get Galactic Tone information if available
      const galacticToneInfo = user.galactic_tone ? getGalacticTone(user.galactic_tone) : null;
      
      setUserData({
        ...user,
        galacticToneInfo,
        chinese_zodiac_actions: user.chinese_zodiac_actions || {
          comment: 'Comment',
          like: 'Like',
          follow: 'Follow',
          share: 'Share'
        },
        western_zodiac_actions: user.western_zodiac_actions || {
          comment: 'Comment',
          like: 'Like',
          follow: 'Follow',
          share: 'Share'
        },
        mayan_zodiac_actions: user.mayan_zodiac_actions || {
          comment: 'Comment',
          like: 'Like',
          follow: 'Follow',
          share: 'Share'
        },
        aztec_zodiac_actions: user.aztec_zodiac_actions || {
          comment: 'Comment',
          like: 'Like',
          follow: 'Follow',
          share: 'Share'
        }
      });
      // Generate elemental particles based on zodiac sign
      const element = getElementalEffect(user.zodiacSign);
      const particles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        position: [
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ],
        color: getZodiacColor(user.zodiacSign),
        element
      }));
      setElementalParticles(particles);
    }
  }, [onlineUsers, userId]);

  // Listen for action notifications
  useEffect(() => {
    if (!socket) return;

    const handleActionNotification = ({ user_id, action, action_type }) => {
      if (user_id === userId) {
        const user = onlineUsers.get(userId);
        if (user) {
          const system = getSystemForSign(user.zodiacSign);
          let animationConfig;

          // Check if user has Galactic Tone and use enhanced animations
          if (user.galactic_tone && (system === 'AZTEC' || system === 'MAYAN')) {
            // Find action type
            let actionType = null;
            for (const [type, actionWord] of Object.entries(userData?.[`${system.toLowerCase()}_zodiac_actions`] || {})) {
              if (actionWord === action) {
                actionType = type;
                break;
              }
            }

            if (actionType) {
              // Use tone-enhanced animation
              animationConfig = getToneEnhancedAnimation(system, user.zodiacSign || user.aztec_zodiac, actionType, user.galactic_tone);
            }
          } else {
            // Use regular animations
            const systemAnimations = ALL_ZODIAC_ANIMATIONS[system];
            animationConfig = systemAnimations?.[action];
          }

          if (animationConfig) {
            setCurrentAction(action);
            api.start({
              ...animationConfig,
              onRest: () => {
                setCurrentAction(null);
                api.start(animationConfig.onRest || {});
              }
            });
            // Play sound effect
            const audio = new Audio(`/sounds/${action.toLowerCase()}.mp3`);
            audio.play().catch(() => {}); // Handle playback errors
          }
        }
      }
    };

    socket.on('action_notification', handleActionNotification);
    return () => socket.off('action_notification', handleActionNotification);
  }, [userId, api, socket]);

  useFrame((state, delta) => {
    if (delta > 0.1) return; // Throttle for performance
    if (meshRef.current && userData) {
      // Smooth position interpolation
      meshRef.current.position.lerp(
        new THREE.Vector3(
          userData.position[0] || 0,
          userData.position[1] || 0,
          userData.position[2] || 0
        ),
        0.1
      );

      if (userData.rotation) {
        meshRef.current.rotation.y = userData.rotation;
      }
    }

    // Animate elemental particles
    if (particleRef.current) {
      particleRef.current.children.forEach((particle, index) => {
        const time = state.clock.elapsedTime;
        const element = elementalParticles[index]?.element;

        switch (element) {
          case 'fire':
            particle.position.y += Math.sin(time * 3 + index) * 0.01;
            particle.material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
            break;
          case 'water':
            particle.position.x += Math.sin(time * 2 + index) * 0.005;
            particle.position.z += Math.cos(time * 2 + index) * 0.005;
            break;
          case 'air':
            particle.position.y += Math.sin(time * 4 + index) * 0.02;
            break;
          case 'earth':
            particle.rotation.x += 0.01;
            particle.rotation.y += 0.01;
            break;
          default:
            particle.position.y += Math.sin(time + index) * 0.01;
        }
      });
    }
  });

  if (!userData) return null;

  const zodiacColor = getZodiacColor(userData.zodiacSign);
  const element = getElementalEffect(userData.zodiacSign);

  return (
    <animated.group ref={meshRef} scale={spring.scale} position={spring.position} rotation={spring.rotation}>
      {/* Main avatar sphere */}
      <mesh
        {...bind()}
        onClick={(event) => onClick(userData, event)}
        castShadow
        receiveShadow
        data-aria-label={`${userData.name} ${currentAction || 'is online'}`}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <animated.meshStandardMaterial
          color={zodiacColor}
          emissive={zodiacColor}
          emissiveIntensity={spring.emissiveIntensity}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Elemental aura ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.4, 16]} />
        <meshBasicMaterial
          color={zodiacColor}
          transparent
          opacity={isHovered ? 0.6 : 0.3}
          side={2}
        />
      </mesh>

      {/* Elemental particles */}
      <group ref={particleRef}>
        {elementalParticles.map((particle) => (
          <mesh key={particle.id} position={particle.position}>
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial
              color={particle.color}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* User name */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {userData.name}
      </Text>

      {/* Zodiac sign indicator with Galactic Tone */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.1}
        color={zodiacColor}
        anchorX="center"
        anchorY="middle"
      >
        {(() => {
          const displayedZodiac = userData.aztec_zodiac || userData.mayan_zodiac || userData.vedic_zodiac || userData.western_zodiac || userData.chinese_zodiac;
          const toneSymbol = userData.galacticToneInfo?.symbol || '';
          const toneNumber = userData.galactic_tone || '';
          const displayedTone = userData.galactic_tone ? toneSymbol + ' ' + toneNumber : '';
          return displayedZodiac + (displayedTone ? ' ' + displayedTone : '');
        })()}
      </Text>

      {/* Galactic Tone Color Ring */}
      {userData.galacticToneInfo && (
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.42, 0.45, 32]} />
          <meshBasicMaterial
            color={userData.galacticToneInfo.color}
            transparent
            opacity={0.8}
            side={2}
          />
        </mesh>
      )}

      {/* Current action display */}
      {currentAction && (
        <>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.15}
            color="#87ceeb"
            anchorX="center"
            anchorY="middle"
          >
            {currentAction}
          </Text>
          <ParticleSystem
            action={currentAction}
            isActive={!!currentAction}
            color={getActionColor(userData.zodiacSign, currentAction)}
            userData={userData}
          />
        </>
      )}

      {/* Status indicator */}
      <mesh position={[0.4, 0.4, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Activity indicator */}
      {userData.isActive && (
        <mesh position={[-0.4, 0.4, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          backgroundColor="rgba(0,0,0,0.8)"
          padding={0.1}
        >
          {`${userData.name} (${element})`}
        </Text>
      )}
    </animated.group>
  );
};