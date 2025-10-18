// platforms/star-app/src/components/cosmic/ElementalNexus.jsx
import { animated, config, useSpring } from '@react-spring/three';
import {
  Float,
  QuadraticBezierLine,
  Sparkles,
  Text,
  Trail
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';

// Context and Data
import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { ELEMENT_COLORS } from '@/lib/zodiacSystems';

// Elemental Nexus Component - Central Energy Hub
export const ElementalNexus = ({ position = [0, 0, 0], scale = 1, interactive = true }) => {
  const { theme } = useCosmicTheme();
  const nexusRef = useRef();
  const ringsRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(1);

  // Spring animations - must be called unconditionally before any early returns
  const { nexusScale, ringRotation } = useSpring({
    nexusScale: hovered ? 1.2 : 1,
    ringRotation: hovered ? Math.PI / 4 : 0,
    config: config.gentle
  });

  // Element positions in a pentagonal arrangement (5 elements)
  const elementPositions = useMemo(() => {
    const elements = Object.keys(ELEMENT_COLORS);
    const positions = [];
    const radius = 8 * scale;

    elements.forEach((element, index) => {
      const angle = (index / elements.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push({ element, position: [x, 0, z], angle });
    });

    return positions;
  }, [scale]);

  // Energy pulsing animation
  useFrame((state) => {
    if (nexusRef.current) {
      const time = state.clock.elapsedTime;
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      nexusRef.current.scale.setScalar(pulse * scale);

      // Update energy level based on time
      setEnergyLevel(0.7 + Math.sin(time * 0.5) * 0.3);
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.y = time * 0.2;
      ringsRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Central Nexus Core */}
      <animated.group scale={nexusScale}>
        <mesh
          ref={nexusRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => setSelectedElement(null)}
        >
          <sphereGeometry args={[2 * scale, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Energy Core Glow */}
        <mesh>
          <sphereGeometry args={[2.5 * scale, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            side={2}
          />
        </mesh>

        {/* Nexus Label */}
        <Text
          position={[0, 3 * scale, 0]}
          fontSize={0.6 * scale}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          ELEMENTAL NEXUS
        </Text>
      </animated.group>

      {/* Rotating Energy Rings */}
      <animated.group ref={ringsRef} rotation-y={ringRotation}>
        {[...Array(3)].map((_, index) => (
          <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3 + index * 1.5, 3.5 + index * 1.5, 64]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.2}
              transparent
              opacity={0.3 - index * 0.1}
              side={2}
            />
          </mesh>
        ))}
      </animated.group>

      {/* Element Nodes */}
      {elementPositions.map(({ element, position: elemPos, angle }) => (
        <ElementNode
          key={element}
          element={element}
          position={elemPos}
          angle={angle}
          scale={scale}
          energyLevel={energyLevel}
          selected={selectedElement === element}
          onSelect={() => setSelectedElement(element)}
          interactive={interactive}
        />
      ))}

      {/* Energy Flow Connections */}
      <EnergyFlowConnections
        elementPositions={elementPositions}
        energyLevel={energyLevel}
        selectedElement={selectedElement}
      />

      {/* Central Energy Sparkles */}
      <Sparkles
        count={50}
        scale={[10 * scale, 10 * scale, 10 * scale]}
        size={3}
        speed={0.5}
        color="#ffffff"
        opacity={0.6}
      />

      {/* Hover Effects */}
      {hovered && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh>
            <sphereGeometry args={[4 * scale, 16, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.05}
              side={2}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
};

// Individual Element Node Component
const ElementNode = ({
  element,
  position,
  angle,
  scale,
  energyLevel,
  selected,
  onSelect,
  interactive
}) => {
  const nodeRef = useRef();
  const [hovered, setHovered] = useState(false);

  const elementColor = ELEMENT_COLORS[element];

  // Spring animation for selection - must be called before any early returns
  const { nodeScale, emissiveIntensity } = useSpring({
    nodeScale: selected ? 1.3 : hovered ? 1.1 : 1,
    emissiveIntensity: selected ? 0.8 : hovered ? 0.5 : 0.3,
    config: config.gentle
  });

  useFrame((state) => {
    if (nodeRef.current) {
      // Orbital motion
      const time = state.clock.elapsedTime;
      const orbitRadius = 0.5;
      const orbitSpeed = 0.5;

      nodeRef.current.position.x = position[0] + Math.cos(time * orbitSpeed + angle) * orbitRadius;
      nodeRef.current.position.z = position[2] + Math.sin(time * orbitSpeed + angle) * orbitRadius;

      // Energy pulsing
      const pulse = Math.sin(time * 3 + angle) * 0.2 + 0.8;
      nodeRef.current.scale.setScalar(pulse * energyLevel * scale);
    }
  });

  if (!elementColor) return null;

  return (
    <animated.group scale={nodeScale}>
      <mesh
        ref={nodeRef}
        position={position}
        onPointerOver={() => interactive && setHovered(true)}
        onPointerOut={() => interactive && setHovered(false)}
        onClick={() => interactive && onSelect()}
      >
        {/* Main Element Sphere */}
        <sphereGeometry args={[0.8 * scale, 16, 16]} />
        <animated.meshStandardMaterial
          color={elementColor.primary}
          emissive={elementColor.primary}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Element Aura */}
      <mesh position={position}>
        <sphereGeometry args={[1.2 * scale, 16, 16]} />
        <meshBasicMaterial
          color={elementColor.secondary}
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>

      {/* Element Label */}
      <Text
        position={[position[0], position[1] + 1.5 * scale, position[2]]}
        fontSize={0.3 * scale}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        {element}
      </Text>

      {/* Element Sparkles */}
      {(selected || hovered) && (
        <Sparkles
          count={20}
          scale={[2 * scale, 2 * scale, 2 * scale]}
          position={position}
          size={2}
          speed={1}
          color={elementColor.primary}
          opacity={0.8}
        />
      )}

      {/* Energy Trail */}
      {selected && (
        <Trail
          width={3}
          length={8}
          color={elementColor.primary}
          attenuation={(t) => t * t}
        >
          <mesh position={position}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={elementColor.primary} />
          </mesh>
        </Trail>
      )}
    </animated.group>
  );
};

// Energy Flow Connections Between Elements
const EnergyFlowConnections = ({ elementPositions, energyLevel, selectedElement }) => {
  const connections = useMemo(() => {
    const flows = [];
    for (let i = 0; i < elementPositions.length; i++) {
      for (let j = i + 1; j < elementPositions.length; j++) {
        const elem1 = elementPositions[i];
        const elem2 = elementPositions[j];

        // Create energy flow between compatible elements
        const compatible = areElementsCompatible(elem1.element, elem2.element);
        if (compatible || selectedElement) {
          flows.push({
            start: elem1.position,
            end: elem2.position,
            color: getFlowColor(elem1.element, elem2.element),
            active: selectedElement === elem1.element || selectedElement === elem2.element
          });
        }
      }
    }
    return flows;
  }, [elementPositions, selectedElement]);

  return connections.map((flow, index) => (
    <EnergyFlowLine
      key={index}
      start={flow.start}
      end={flow.end}
      color={flow.color}
      active={flow.active}
      energyLevel={energyLevel}
    />
  ));
};

// Individual Energy Flow Line
const EnergyFlowLine = ({ start, end, color, active, energyLevel }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current && active) {
      // Flowing animation
      const time = state.clock.elapsedTime;
      const flowSpeed = 2;
      const flow = (time * flowSpeed) % 1;

      // Update line opacity based on flow
      lineRef.current.material.opacity = (0.3 + Math.sin(flow * Math.PI) * 0.4) * energyLevel;
    }
  });

  if (!active) return null;

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={start}
      end={end}
      mid={[0, 2, 0]}
      color={color}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={0.5 * energyLevel}
    />
  );
};

// Helper Functions
const areElementsCompatible = (elem1, elem2) => {
  // Define elemental relationships (simplified)
  const compatibilities = {
    FIRE: ['AIR', 'FIRE'],
    WATER: ['EARTH', 'WATER'],
    AIR: ['FIRE', 'AIR'],
    EARTH: ['WATER', 'EARTH']
  };

  return compatibilities[elem1]?.includes(elem2) || compatibilities[elem2]?.includes(elem1);
};

const getFlowColor = (elem1, elem2) => {
  // Blend colors of the two elements
  const color1 = ELEMENT_COLORS[elem1]?.primary || '#ffffff';
  const color2 = ELEMENT_COLORS[elem2]?.primary || '#ffffff';

  // Simple color blending (average)
  const r = (parseInt(color1.slice(1, 3), 16) + parseInt(color2.slice(1, 3), 16)) / 2;
  const g = (parseInt(color1.slice(3, 5), 16) + parseInt(color2.slice(3, 5), 16)) / 2;
  const b = (parseInt(color1.slice(5, 7), 16) + parseInt(color2.slice(5, 7), 16)) / 2;

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

// Elemental Nexus Info Panel
export const ElementalNexusInfo = ({ selectedElement, position = [0, 0, 0] }) => {
  if (!selectedElement) return null;

  const elementColor = ELEMENT_COLORS[selectedElement];
  if (!elementColor) return null;

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[4, 2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.8}
        />
      </mesh>

      <Text
        position={[0, 0.5, 0.01]}
        fontSize={0.3}
        color={elementColor.primary}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {selectedElement.toUpperCase()}
      </Text>

      <Text
        position={[0, 0, 0.01]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        Energy Flow: {elementColor.energy || 'Balanced'}
      </Text>

      <Text
        position={[0, -0.3, 0.01]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        Click to explore elemental connections
      </Text>
    </group>
  );
};

export default ElementalNexus;
