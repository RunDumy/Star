import { useCollaboration } from '@/contexts/CollaborationContext';
import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';

export const ControlPanel3D = ({ position = [-4, 0, -3], scale = 1 }) => {
  const [activeTool, setActiveTool] = useState('navigation');
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, dispatch } = useCosmicTheme();
  const { currentUser, updateUserSettings } = useCollaboration();

  const tools = [
    {
      id: 'navigation',
      name: 'Navigation',
      icon: '🧭',
      description: 'Move through the cosmos',
      color: '#00d4ff'
    },
    {
      id: 'social',
      name: 'Social',
      icon: '👥',
      description: 'Connect with others',
      color: '#ff6b6b'
    },
    {
      id: 'creation',
      name: 'Create',
      icon: '✨',
      description: 'Build constellations',
      color: '#4ecdc4'
    },
    {
      id: 'analysis',
      name: 'Analyze',
      icon: '🔍',
      description: 'Explore cosmic data',
      color: '#45b7d1'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      description: 'Customize experience',
      color: '#f9ca24'
    }
  ];

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId);
    // Emit tool change event
    if (window.cosmicEventEmitter) {
      window.cosmicEventEmitter.emit('toolChanged', { toolId, tool: tools.find(t => t.id === toolId) });
    }
  };

  const handleThemePreset = (preset) => {
    dispatch({ type: 'SET_PRESET', payload: preset });
  };

  const handleQualityChange = (quality) => {
    if (updateUserSettings) {
      updateUserSettings({ graphicsQuality: quality });
    }
  };

  // Floating animation for the panel
  const PanelMesh = ({ children, onClick }) => {
    const meshRef = useRef();

    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
      }
    });

    return (
      <group ref={meshRef} onClick={onClick}>
        {children}
      </group>
    );
  };

  const ToolButton = ({ tool, isActive, onClick, position }) => {
    const buttonRef = useRef();

    useFrame((state) => {
      if (buttonRef.current && isActive) {
        buttonRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    });

    return (
      <group ref={buttonRef} position={position} onClick={() => onClick(tool.id)}>
        {/* Button background */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial
            color={isActive ? tool.color : theme.colors?.secondary || '#333333'}
            emissive={isActive ? tool.color : '#000000'}
            emissiveIntensity={isActive ? 0.3 : 0}
          />
        </mesh>

        {/* Icon */}
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {tool.icon}
        </Text>

        {/* Tool name */}
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.08}
          color={theme.colors?.text || '#ffffff'}
          anchorX="center"
          anchorY="middle"
        >
          {tool.name}
        </Text>

        {/* Active indicator */}
        {isActive && (
          <mesh position={[0, 0, -0.1]}>
            <ringGeometry args={[0.35, 0.4, 16]} />
            <meshStandardMaterial
              color={tool.color}
              emissive={tool.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    );
  };

  const SettingsPanel = () => {
    const themePresets = ['nebula', 'galaxy', 'aurora', 'void'];
    const qualityOptions = ['low', 'medium', 'high', 'ultra'];

    return (
      <group position={[2, 0, 0]}>
        {/* Settings panel background */}
        <mesh>
          <planeGeometry args={[3, 4]} />
          <meshStandardMaterial
            color={theme.colors?.background || '#1a1a2e'}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Title */}
        <Text
          position={[0, 1.8, 0.1]}
          fontSize={0.2}
          color={theme.colors?.accent || '#00d4ff'}
          anchorX="center"
          anchorY="middle"
        >
          ⚙️ Settings
        </Text>

        {/* Theme presets */}
        <Text
          position={[-1.2, 1.2, 0.1]}
          fontSize={0.12}
          color={theme.colors?.text || '#ffffff'}
          anchorX="left"
          anchorY="middle"
        >
          Theme:
        </Text>
        {themePresets.map((preset, index) => (
          <mesh
            key={preset}
            position={[-1 + index * 0.8, 0.8, 0.05]}
            onClick={() => handleThemePreset(preset)}
          >
            <planeGeometry args={[0.7, 0.3]} />
            <meshStandardMaterial
              color={theme.name === preset ? '#4ade80' : theme.colors?.secondary || '#333333'}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
        {themePresets.map((preset, index) => (
          <Text
            key={`text-${preset}`}
            position={[-1 + index * 0.8, 0.8, 0.1]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </Text>
        ))}

        {/* Quality settings */}
        <Text
          position={[-1.2, 0.2, 0.1]}
          fontSize={0.12}
          color={theme.colors?.text || '#ffffff'}
          anchorX="left"
          anchorY="middle"
        >
          Quality:
        </Text>
        {qualityOptions.map((quality, index) => (
          <mesh
            key={quality}
            position={[-1 + index * 0.8, -0.2, 0.05]}
            onClick={() => handleQualityChange(quality)}
          >
            <planeGeometry args={[0.7, 0.3]} />
            <meshStandardMaterial
              color={currentUser?.settings?.graphicsQuality === quality ? '#4ade80' : theme.colors?.secondary || '#333333'}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
        {qualityOptions.map((quality, index) => (
          <Text
            key={`quality-${quality}`}
            position={[-1 + index * 0.8, -0.2, 0.1]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {quality.charAt(0).toUpperCase() + quality.slice(1)}
          </Text>
        ))}

        {/* User info */}
        <Text
          position={[0, -1.2, 0.1]}
          fontSize={0.1}
          color={theme.colors?.textSecondary || '#cccccc'}
          anchorX="center"
          anchorY="middle"
        >
          {currentUser?.name || 'Cosmic Explorer'}
        </Text>
      </group>
    );
  };

  return (
    <group position={position} scale={scale}>
      {/* Main panel */}
      <PanelMesh>
        {/* Panel background */}
        <mesh>
          <boxGeometry args={[2.5, 4, 0.1]} />
          <meshStandardMaterial
            color={theme.colors?.background || '#1a1a2e'}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Title */}
        <Text
          position={[0, 1.8, 0.06]}
          fontSize={0.15}
          color={theme.colors?.accent || '#00d4ff'}
          anchorX="center"
          anchorY="middle"
        >
          🛠️ Control Panel
        </Text>

        {/* Tool buttons */}
        {tools.map((tool, index) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={handleToolSelect}
            position={[0, 1.2 - index * 0.6, 0.06]}
          />
        ))}

        {/* Expand/collapse button */}
        <mesh
          position={[0, -1.8, 0.06]}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        <Text
          position={[0, -1.8, 0.11]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {isExpanded ? '−' : '+'}
        </Text>
      </PanelMesh>

      {/* Expanded settings panel */}
      <AnimatePresence>
        {isExpanded && activeTool === 'settings' && <SettingsPanel />}
      </AnimatePresence>

      {/* Active tool indicator */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.08}
        color={theme.colors?.textSecondary || '#cccccc'}
        anchorX="center"
        anchorY="middle"
      >
        Active: {tools.find(t => t.id === activeTool)?.name}
      </Text>
    </group>
  );
};