// @ts-nocheck
import { useEffect, useRef, useState } from "react";
/// <reference types="@react-three/fiber" />
import { useAuth } from "@/lib/AuthContext";
import { Line, OrbitControls, Text, shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";
import Link from "next/link";
import * as THREE from "three";
import { CosmicLighting } from "./cosmic/CosmicLighting";
import { CosmicParticles } from "./cosmic/CosmicParticles";
import { CosmicSpace } from "./cosmic/CosmicSpace";

// DistortionAuraMaterial (unchanged)
const DistortionAuraMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(1, 1, 1),
    distortionStrength: 0.2,
    zodiacType: 0,
  },
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time;
    uniform vec3 color;
    uniform float distortionStrength;
    uniform int zodiacType;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vec2 uv = vUv;
      float t = time * 0.5;
      float distortion = 0.0;
      if (zodiacType == 0) {
        distortion = sin(uv.x * 10.0 + t) * cos(uv.y * 10.0 + t) * distortionStrength;
      } else if (zodiacType == 1) {
        float angle = atan(uv.y - 0.5, uv.x - 0.5);
        distortion = sin(angle * 5.0 + t) * distortionStrength;
      } else if (zodiacType == 2) {
        distortion = sin(length(uv - 0.5) * 20.0 + t) * distortionStrength;
      } else {
        distortion = sin(uv.y * 15.0 + t) * distortionStrength;
      }
      uv += vNormal.xy * distortion;
      float intensity = 0.5 + 0.5 * sin(t + uv.x * 5.0);
      gl_FragColor = vec4(color * intensity, intensity * 0.3);
    }
  `
);

// Enhanced DNANodeMaterial with color blending and mood pulsing
const DNANodeMaterial = shaderMaterial(
  {
    time: 0,
    baseColor: new THREE.Color(1, 1, 1),
    secondaryColor: new THREE.Color(1, 1, 1),
    strength: 0.5,
    zodiacType: 0,
    tarotBurst: 0.0,
    transitBurst: 0.0,
    glowBurst: 0.0,
    moodIntensity: 0.5,
  },
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time;
    uniform vec3 baseColor;
    uniform vec3 secondaryColor;
    uniform float strength;
    uniform int zodiacType;
    uniform float tarotBurst;
    uniform float transitBurst;
    uniform float glowBurst;
    uniform float moodIntensity;
    varying vec2 vUv;
    varying vec3 vPosition;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      float t = time * 0.8;
      float glow = strength;
      float pulse = 0.5 + 0.5 * sin(t * (1.0 + moodIntensity)); // Mood-specific pulsing

      if (zodiacType == 0) { // Passionate
        float n = noise(uv * 10.0 + t);
        glow *= 0.5 + 0.5 * sin(t + n * 2.0);
      } else if (zodiacType == 1) { // Curious
        float angle = atan(uv.y - 0.5, uv.x - 0.5);
        glow *= 0.6 + 0.4 * cos(angle * 5.0 + t);
      } else if (zodiacType == 2) { // Reflective
        float n = noise(uv * 5.0 + t);
        glow *= 0.5 + 0.5 * sin(length(uv - 0.5) * 15.0 + t + n);
      } else if (zodiacType == 3) { // Serene
        glow *= 0.6 + 0.4 * sin(uv.y * 10.0 + t);
      } else { // Neutral
        glow *= 0.5 + 0.5 * sin(t + uv.x * 5.0);
      }

      // Color blending
      vec3 color = mix(baseColor, secondaryColor, 0.5 + 0.5 * sin(t * 0.5));
      glow += tarotBurst * (0.5 + 0.5 * sin(t * 2.0));
      glow += transitBurst * (0.7 + 0.3 * sin(t * 3.0));
      glow += glowBurst * (1.0 + 0.5 * sin(t * 4.0));
      gl_FragColor = vec4(color * glow * pulse, glow * 0.7);
    }
  `
);

// HolographicLabelMaterial (unchanged)
const HolographicLabelMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(1, 1, 1),
    opacity: 0.8,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;

    void main() {
      float shimmer = 0.5 + 0.5 * sin(vUv.x * 10.0 + time * 2.0);
      gl_FragColor = vec4(color, opacity * shimmer);
    }
  `
);

// ParticleTrailMaterial for Mood Rings
const ParticleTrailMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(1, 1, 1),
    moodType: 0,
  },
  `
    attribute vec3 velocity;
    varying vec3 vPosition;
    void main() {
      vPosition = position + velocity * 0.05;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
      gl_PointSize = 2.0;
    }
  `,
  `
    uniform float time;
    uniform vec3 color;
    uniform int moodType;
    varying vec3 vPosition;

    void main() {
      float t = time * 0.7;
      float intensity = 0.5;

      if (moodType == 0) { // Passionate
        intensity = 0.5 + 0.5 * sin(t + vPosition.x * 6.0);
      } else if (moodType == 1) { // Curious
        intensity = 0.6 + 0.4 * cos(atan(vPosition.y, vPosition.x) * 4.0 + t);
      } else if (moodType == 2) { // Reflective
        intensity = 0.5 + 0.5 * sin(length(vPosition.xy) * 12.0 + t);
      } else if (moodType == 3) { // Serene
        intensity = 0.6 + 0.4 * sin(vPosition.y * 8.0 + t);
      } else { // Neutral
        intensity = 0.5 + 0.5 * sin(t + vPosition.z * 5.0);
      }

      gl_FragColor = vec4(color * intensity, intensity * 0.7);
    }
  `
);

// HelixTrailMaterial (unchanged)
const HelixTrailMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(1, 1, 1),
    zodiacType: 0,
  },
  `
    attribute vec3 velocity;
    varying vec3 vPosition;
    void main() {
      vPosition = position + velocity * 0.1;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
      gl_PointSize = 3.0;
    }
  `,
  `
    uniform float time;
    uniform vec3 color;
    uniform int zodiacType;
    varying vec3 vPosition;

    void main() {
      float t = time * 0.5;
      float intensity = 0.5;

      if (zodiacType == 0) {
        intensity = 0.5 + 0.5 * sin(t + vPosition.x * 5.0);
      } else if (zodiacType == 1) {
        intensity = 0.6 + 0.4 * cos(atan(vPosition.y, vPosition.x) * 3.0 + t);
      } else if (zodiacType == 2) {
        intensity = 0.5 + 0.5 * sin(length(vPosition.xy) * 10.0 + t);
      } else {
        intensity = 0.6 + 0.4 * sin(vPosition.y * 5.0 + t);
      }

      gl_FragColor = vec4(color * intensity, intensity * 0.8);
    }
  `
);

// Extend Three.js elements for JSX
extend(THREE);
extend({
  DistortionAuraMaterial,
  DNANodeMaterial,
  HolographicLabelMaterial,
  HelixTrailMaterial,
  ParticleTrailMaterial,
});

function Stars() {
  const pointsRef = useRef<THREE.Points>(null!);
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <primitive object={pointsRef.current} />
  );
}

function Nebula() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.material.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[50, 32, 32]} />
      <DistortionAuraMaterial
        color={new THREE.Color("#4a0e4e")}
        distortionStrength={0.1}
        zodiacType={2}
      />
    </mesh>
  );
}

function PlanetButton({
  position,
  text,
  href,
  zodiac,
  size = 0.5,
  color = "#00f",
  isMoon = false,
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const { user } = useAuth();
  const zodiacTypes = { Aries: 0, Leo: 1, Virgo: 2, Libra: 3 };
  const auraColors = {
    Aries: new THREE.Color("#ff4500"),
    Leo: new THREE.Color("#ffd700"),
    Virgo: new THREE.Color("#00ff7f"),
    Libra: new THREE.Color("#1e90ff"),
  };

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += isMoon ? 0.02 : 0.01;
      meshRef.current.scale.setScalar(hovered ? size * 1.2 : size);
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(hovered ? size * 1.6 : size * 1.4);
      auraRef.current.material.uniforms.time.value = clock.getElapsedTime();
      auraRef.current.material.uniforms.distortionStrength.value = hovered ? 0.4 : 0.2;
    }
  });

  const handleClick = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/interactions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.id}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interaction_type: "aura_click", zodiac_sign: zodiac }),
      });
    } catch (err) {
      console.error("Failed to log aura interaction");
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#ff5555" : color}
          emissive={isMoon ? "#aaa" : "#333"}
          roughness={isMoon ? 0.8 : 0.4}
        />
      </mesh>
      <mesh ref={auraRef}>
        <sphereGeometry args={[size * 1.4, 32, 32]} />
        <DistortionAuraMaterial
          color={auraColors[zodiac] || new THREE.Color("#ffffff")}
          zodiacType={zodiacTypes[zodiac] || 0}
        />
      </mesh>
      <Text
        position={[0, size + 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`${text} (${zodiac})`}
      </Text>
      <Link href={href} className="absolute inset-0" />
    </group>
  );
}

function ZodiacDNAStrand({ position, user }) {
  const groupRef = useRef<THREE.Group>(null!);
  const lineRef = useRef<THREE.Line>(null!);
  const trailRef = useRef<THREE.Points>(null!);
  const nodeRefs = useRef([]);
  const [hoveredTrait, setHoveredTrait] = useState(null);
  const [tarotBurst, setTarotBurst] = useState({});
  const [transitBurst, setTransitBurst] = useState({});
  const [glowBurst, setGlowBurst] = useState({});
  const [dna, setDNA] = useState([
    { trait_name: "Courage", zodiac_sign: "Aries", strength: 0.8 },
    { trait_name: "Creativity", zodiac_sign: "Leo", strength: 0.6 },
    { trait_name: "Precision", zodiac_sign: "Virgo", strength: 0.7 },
    { trait_name: "Harmony", zodiac_sign: "Libra", strength: 0.5 },
  ]);

  const traitColors = {
    Courage: new THREE.Color("#ff4500"),
    Creativity: new THREE.Color("#ffd700"),
    Precision: new THREE.Color("#00ff7f"),
    Harmony: new THREE.Color("#1e90ff"),
  };
  const traitTypes = {
    Courage: 0,
    Creativity: 1,
    Precision: 2,
    Harmony: 3,
  };

  const bind = useDrag(({ offset: [x, y], down }) => {
    if (groupRef.current && down) {
      groupRef.current.rotation.y += x * 0.005;
    }
  });

  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/zodiac-dna`, {
        headers: { Authorization: `Bearer ${user.id}` },
      })
        .then((res) => res.json())
        .then((data) => setDNA(data.dna));
    }
  }, [user]);

  const handleTarotPull = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tarot-pull`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}`, "Content-Type": "application/json" },
      });
      const { card, trait, strength } = await res.json();
      setDNA((prev) =>
        prev.map((t) =>
          t.trait_name === trait ? { ...t, strength } : t
        )
      );
      setTarotBurst((prev) => ({ ...prev, [trait]: 1.0 }));
      setGlowBurst((prev) => ({ ...prev, [trait]: 1.0 }));
      setTimeout(() => {
        setTarotBurst((prev) => ({ ...prev, [trait]: 0.0 }));
        setGlowBurst((prev) => ({ ...prev, [trait]: 0.0 }));
      }, 1000);
    } catch (err) {
      console.error("Failed to perform tarot pull");
    }
  };

  const handleTransitView = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transit`, {
        method: "GET",
        headers: { Authorization: `Bearer ${user.id}` },
      });
      const { transit, trait, strength } = await res.json();
      setDNA((prev) =>
        prev.map((t) =>
          t.trait_name === trait ? { ...t, strength } : t
        )
      );
      setTransitBurst((prev) => ({ ...prev, [trait]: 1.0 }));
      setGlowBurst((prev) => ({ ...prev, [trait]: 1.0 }));
      setTimeout(() => {
        setTransitBurst((prev) => ({ ...prev, [trait]: 0.0 }));
        setGlowBurst((prev) => ({ ...prev, [trait]: 0.0 }));
      }, 1000);
    } catch (err) {
      console.error("Failed to fetch transit");
    }
  };

  const points = dna.map((trait, i) => {
    const angle = i * Math.PI * 0.5;
    return new THREE.Vector3(
      Math.sin(angle) * 0.3,
      i * 0.3 - (dna.length - 1) * 0.15,
      Math.cos(angle) * 0.3
    );
  });

  const particleCount = 100;
  const trailPositions = new Float32Array(particleCount * 3);
  const trailVelocities = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const t = i / (particleCount - 1);
    const index = Math.floor(t * (points.length - 1));
    const nextIndex = Math.min(index + 1, points.length - 1);
    const lerp = t * (points.length - 1) - index;
    const pos = points[index].clone().lerp(points[nextIndex], lerp);
    trailPositions[i * 3] = pos.x + (Math.random() - 0.5) * 0.05;
    trailPositions[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.05;
    trailPositions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.05;
    trailVelocities[i * 3] = (Math.random() - 0.5) * 0.01;
    trailVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
    trailVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
  }

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.rotation.y += 0.01;
    }
    if (trailRef.current) {
      const pos = trailRef.current.geometry.attributes.position.array;
      const vel = trailRef.current.geometry.attributes.velocity.array;
      const boost = Object.values(transitBurst).some(v => v > 0) || Object.values(glowBurst).some(v => v > 0) ? 3 : (hoveredTrait ? 2 : 1);
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += vel[i * 3] * boost;
        pos[i * 3 + 1] += vel[i * 3 + 1] * boost;
        pos[i * 3 + 2] += vel[i * 3 + 2] * boost;
        const t = i / (particleCount - 1);
        const index = Math.floor(t * (points.length - 1));
        const nextIndex = Math.min(index + 1, points.length - 1);
        const lerp = t * (points.length - 1) - index;
        const target = points[index].clone().lerp(points[nextIndex], lerp);
        const dist = Math.sqrt(
          (pos[i * 3] - target.x) ** 2 +
          (pos[i * 3 + 1] - target.y) ** 2 +
          (pos[i * 3 + 2] - target.z) ** 2
        );
        if (dist > 0.1) {
          pos[i * 3] += (target.x - pos.i * 3) * 0.05;
          pos[i * 3 + 1] += (target.y - pos[i * 3 + 1]) * 0.05;
          pos[i * 3 + 2] += (target.z - pos[i * 3 + 2]) * 0.05;
        }
      }
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const handleTraitClick = async (trait) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/zodiac-dna`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          trait_name: trait.trait_name,
          zodiac_sign: trait.zodiac_sign,
          strength: Math.min(trait.strength + 0.1, 1.0),
        }),
      });
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/interactions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interaction_type: "trail_click", zodiac_sign: trait.zodiac_sign }),
      });
      setDNA((prev) =>
        prev.map((t) =>
          t.trait_name === trait.trait_name ? { ...t, strength: Math.min(t.strength + 0.1, 1.0) } : t
        )
      );
      setGlowBurst((prev) => ({ ...prev, [trait.trait_name]: 1.0 }));
      setTimeout(() => setGlowBurst((prev) => ({ ...prev, [trait.trait_name]: 0.0 })), 1000);
    } catch (err) {
      console.error("Failed to update DNA trait or log interaction");
    }
  };

  return (
    <group position={position} ref={groupRef} {...bind()}>
      <Line
        ref={lineRef}
        points={points}
        color="#ffffff"
        lineWidth={2}
      />
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={trailPositions} count={particleCount} itemSize={3} />
          <bufferAttribute attach="attributes-velocity" array={trailVelocities} count={particleCount} itemSize={3} />
        </bufferGeometry>
        <HelixTrailMaterial
          color={traitColors[dna[0].trait_name] || new THREE.Color("#ffffff")}
          zodiacType={traitTypes[dna[0].trait_name] || 0}
          time={Date.now() / 1000}
        />
      </points>
      {dna.map((trait, i) => (
        <group key={trait.trait_name}>
          <mesh
            position={points[i]}
            ref={(el) => (nodeRefs.current[i] = el)}
            onPointerOver={() => setHoveredTrait(trait.trait_name)}
            onPointerOut={() => setHoveredTrait(null)}
            onClick={() => handleTraitClick(trait)}
          >
            <sphereGeometry args={[0.1 * trait.strength, 16, 16]} />
            <DNANodeMaterial
              color={traitColors[trait.trait_name] || new THREE.Color("#ffffff")}
              strength={trait.strength}
              zodiacType={traitTypes[trait.trait_name] || 0}
              tarotBurst={tarotBurst[trait.trait_name] || 0.0}
              transitBurst={transitBurst[trait.trait_name] || 0.0}
              glowBurst={glowBurst[trait.trait_name] || 0.0}
              time={Date.now() / 1000}
            />
          </mesh>
          <Text
            position={[points[i].x, points[i].y + 0.15, points[i].z]}
            fontSize={0.12}
            anchorX="center"
            material={new HolographicLabelMaterial({
              color: traitColors[trait.trait_name] || new THREE.Color("#ffffff"),
              opacity: 0.8,
              time: Date.now() / 1000
            })}
          >
            {`${trait.trait_name}: ${trait.strength.toFixed(2)}`}
          </Text>
        </group>
      ))}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        onClick={handleTarotPull}
      >
        Draw Tarot
      </Text>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        onClick={handleTransitView}
      >
        View Transits
      </Text>
    </group>
  );
}

function CosmicTimeline({ position, user }) {
  const groupRef = useRef<THREE.Group>(null!);
  const lineRef = useRef<THREE.Line>(null!);
  const nodeRefs = useRef([]);
  const [timeline, setTimeline] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [glowBurst, setGlowBurst] = useState({});

  const eventColors = {
    tarot_pull: new THREE.Color("#ffd700"),
    transit_view: new THREE.Color("#1e90ff"),
    trail_click: new THREE.Color("#ff4500"),
  };
  const eventTypes = {
    tarot_pull: 0,
    transit_view: 1,
    trail_click: 2,
  };

  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/timeline`, {
        headers: { Authorization: `Bearer ${user.id}` },
      })
        .then((res) => res.json())
        .then((data) => setTimeline(data.timeline));
    }
  }, [user]);

  const points = timeline.map((event, i) => {
    const angle = i * Math.PI * 0.4;
    return new THREE.Vector3(
      Math.sin(angle) * 0.5,
      i * 0.4 - (timeline.length - 1) * 0.2,
      Math.cos(angle) * 0.5
    );
  });

  const bind = useDrag(({ offset: [x, y], down }) => {
    if (groupRef.current && down) {
      groupRef.current.rotation.y += x * 0.005;
    }
  });

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.rotation.y += 0.01;
    }
  });

  const handleEventClick = async (event) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/interactions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interaction_type: "timeline_click", zodiac_sign: event.zodiac_sign }),
      });
      setGlowBurst((prev) => ({ ...prev, [event.id]: 1.0 }));
      setTimeout(() => setGlowBurst((prev) => ({ ...prev, [event.id]: 0.0 })), 1000);
    } catch (err) {
      console.error("Failed to log timeline interaction");
    }
  };

  return (
    <group position={position} ref={groupRef} {...bind()}>
      <Line
        ref={lineRef}
        points={points}
        color="#ffffff"
        lineWidth={1.5}
      />
      {timeline.map((event, i) => (
        <group key={event.id}>
          <mesh
            position={points[i]}
            ref={(el) => (nodeRefs.current[i] = el)}
            onPointerOver={() => setHoveredEvent(event.id)}
            onPointerOut={() => setHoveredEvent(null)}
            onClick={() => handleEventClick(event)}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <DNANodeMaterial
              color={eventColors[event.type] || new THREE.Color("#ffffff")}
              strength={0.7}
              zodiacType={eventTypes[event.type] || 0}
              tarotBurst={0.0}
              transitBurst={0.0}
              glowBurst={glowBurst[event.id] || 0.0}
              time={Date.now() / 1000}
            />
          </mesh>
          <Text
            position={[points[i].x, points[i].y + 0.15, points[i].z]}
            fontSize={0.1}
            color={eventColors[event.type] || new THREE.Color("#ffffff")}
          >
            {event.type === "tarot_pull"
              ? `Tarot: ${event.details.card}`
              : event.type === "transit_view"
                ? `Transit: ${event.details.transit}`
                : `Trait Click: ${event.zodiac_sign}`}
          </Text>
        </group>
      ))}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="white"
      >
        Cosmic Timeline
      </Text>
    </group>
  );
}

function MoodRings({ position, user }) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRefs = useRef([]);
  const trailRef = useRef<THREE.Points>(null!);
  const [mood, setMood] = useState({ mood: "Neutral", intensity: 0.5 });
  const [hoveredMood, setHoveredMood] = useState(null);
  const [glowBurst, setGlowBurst] = useState({});

  const moodColors = {
    Passionate: { base: new THREE.Color("#ff4500"), secondary: new THREE.Color("#ff8c00") },
    Curious: { base: new THREE.Color("#ffd700"), secondary: new THREE.Color("#ffa500") },
    Reflective: { base: new THREE.Color("#00ff7f"), secondary: new THREE.Color("#00cc66") },
    Serene: { base: new THREE.Color("#1e90ff"), secondary: new THREE.Color("#87ceeb") },
    Neutral: { base: new THREE.Color("#ffffff"), secondary: new THREE.Color("#cccccc") },
  };
  const moodTypes = {
    Passionate: 0,
    Curious: 1,
    Reflective: 2,
    Serene: 3,
    Neutral: 4,
  };

  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/mood`, {
        headers: { Authorization: `Bearer ${user.id}` },
      })
        .then((res) => res.json())
        .then((data) => setMood({ mood: data.mood, intensity: data.intensity }));
    }
  }, [user]);

  const rings = [
    { mood: mood.mood, intensity: mood.intensity, offset: 0 },
  ];

  const particleCount = 50; // Reduced for performance
  const trailPositions = new Float32Array(particleCount * 3);
  const trailVelocities = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    trailPositions[i * 3] = Math.sin(angle) * 0.5;
    trailPositions[i * 3 + 1] = 0;
    trailPositions[i * 3 + 2] = Math.cos(angle) * 0.5;
    trailVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
    trailVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    trailVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  const bind = useDrag(({ offset: [x, y], down }) => {
    if (groupRef.current && down) {
      groupRef.current.rotation.y += x * 0.005;
    }
  });

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.y += 0.02 + mood.intensity * 0.01; // Mood-driven rotation speed
        ring.rotation.x = Math.sin(time * 0.5) * 0.1; // Subtle wobble
        ring.scale.setScalar(1 + mood.intensity * 0.3 * Math.sin(time * (2 + mood.intensity)));
      }
    });
    if (trailRef.current) {
      const pos = trailRef.current.geometry.attributes.position.array;
      const vel = trailRef.current.geometry.attributes.velocity.array;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
        const radius = 0.5 + mood.intensity * 0.1;
        const targetX = Math.sin(angle) * radius;
        const targetZ = Math.cos(angle) * radius;
        pos[i * 3] += vel[i * 3] + (targetX - pos[i * 3]) * 0.05;
        pos[i * 3 + 1] += vel[i * 3 + 1] + (0 - pos[i * 3 + 1]) * 0.05;
        pos[i * 3 + 2] += vel[i * 3 + 2] + (targetZ - pos[i * 3 + 2]) * 0.05;
      }
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const handleMoodClick = async (mood) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/interactions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.id}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interaction_type: "mood_click", zodiac_sign: null, details: { mood } }),
      });
      setGlowBurst((prev) => ({ ...prev, [mood]: 1.0 }));
      setTimeout(() => setGlowBurst((prev) => ({ ...prev, [mood]: 0.0 })), 1500); // Longer burst
    } catch (err) {
      console.error("Failed to log mood interaction");
    }
  };

  return (
    <group position={position} ref={groupRef} {...bind()}>
      {rings.map((ring, i) => (
        <group key={ring.mood}>
          <mesh
            position={[0, i * 0.2, 0]}
            ref={(el) => (ringRefs.current[i] = el)}
            onPointerOver={() => setHoveredMood(ring.mood)}
            onPointerOut={() => setHoveredMood(null)}
            onClick={() => handleMoodClick(ring.mood)}
          >
            <torusGeometry args={[0.5, 0.02, 16, 32]} />
            <DNANodeMaterial
              baseColor={moodColors[ring.mood]?.base || new THREE.Color("#ffffff")}
              secondaryColor={moodColors[ring.mood]?.secondary || new THREE.Color("#cccccc")}
              strength={ring.intensity}
              zodiacType={moodTypes[ring.mood] || 4}
              tarotBurst={0.0}
              transitBurst={0.0}
              glowBurst={glowBurst[ring.mood] || 0.0}
              moodIntensity={ring.intensity}
              time={Date.now() / 1000}
            />
          </mesh>
          <points ref={trailRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" array={trailPositions} count={particleCount} itemSize={3} />
              <bufferAttribute attach="attributes-velocity" array={trailVelocities} count={particleCount} itemSize={3} />
            </bufferGeometry>
            <ParticleTrailMaterial
              color={moodColors[ring.mood]?.base || new THREE.Color("#ffffff")}
              moodType={moodTypes[ring.mood] || 4}
              time={Date.now() / 1000}
            />
          </points>
          {hoveredMood === ring.mood && (
            <Text
              position={[0, i * 0.2 + 0.15, 0]}
              fontSize={0.1}
              material={new HolographicLabelMaterial({
                color: moodColors[ring.mood]?.base || new THREE.Color("#ffffff"),
                opacity: 0.8,
                time: Date.now() / 1000
              })}
            >
              {`Mood: ${ring.mood} (${ring.intensity.toFixed(2)})`}
            </Text>
          )}
        </group>
      ))}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="white"
        onClick={() => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/mood`, {
          headers: { Authorization: `Bearer ${user.id}` },
        }).then(res => res.json()).then(data => setMood({ mood: data.mood, intensity: data.intensity }))}
      >
        Refresh Mood
      </Text>
    </group>
  );
}

export default function CosmicInterface() {
  const { user } = useAuth();
  const [auraStyle, setAuraStyle] = useState("default");

  const handleAuraChange = async (style: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/preferences`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.id}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ar_filter: user?.zodiacSign.toLowerCase() + "_filter", sound_enabled: true, aura_style: style }),
      });
      setAuraStyle(style);
    } catch (err) {
      console.error("Failed to update aura style");
    }
  };

  return (
    <div className="h-screen w-full bg-black relative">
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        <CosmicSpace starCount={25000} nebulaCount={3} shootingStarCount={3}>
          <CosmicLighting
            ambientIntensity={0.1}
            pointLightCount={6}
            dynamicLights={true}
            colorScheme="mixed"
          />

          {/* Cosmic dust particles */}
          <CosmicParticles
            count={2000}
            type="dust"
            color="#4a90e2"
            size={0.5}
            spread={200}
            speed={0.005}
          />

          {/* Nebula particles */}
          <CosmicParticles
            count={500}
            type="nebula"
            color="#7c3aed"
            size={2}
            spread={150}
            speed={0.002}
            position={[50, 0, -50]}
          />

          <PlanetButton position={[-3, 2, 0]} label="Home" route="/home" size={0.8} color="#ff4500" planetType="rocky" />
          <PlanetButton position={[0, 2, 0]} label="Profile" route="/profile" size={0.4} color="#ffd700" planetType="ice" />
          <ZodiacDNAStrand position={[-1.5, 2.5, 0]} user={user} />
          <CosmicTimeline position={[1.5, 2.5, 0]} user={user} />
          <MoodRings position={[-1.5, 2.5, 0]} user={user} />
          <PlanetButton position={[3, 2, 0]} label="Feed" route="/feed" size={0.6} color="#00ff7f" planetType="rocky" />
          <PlanetButton position={[0, -1, 0]} label="Community" route="/community" size={0.5} color="#1e90ff" planetType="gas" hasAtmosphere />

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={3}
            maxDistance={150}
            zoomSpeed={0.6}
          />
        </CosmicSpace>
      </Canvas>
      {user && (
        <div className="absolute top-4 left-4 text-white z-10 bg-black/50 p-4 rounded-lg">
          <h2 className="text-xl font-bold">Star Navigator: {user.email}</h2>
          <p>Zodiac: {user.zodiacSign}</p>
          <select
            value={auraStyle}
            onChange={(e) => handleAuraChange(e.target.value)}
            className="mt-2 bg-gray-800 text-white p-2 rounded text-sm"
            aria-label="Select aura style"
          >
            <option value="default">Default Aura</option>
            <option value="fiery">Fiery Ripples (Aries)</option>
            <option value="swirly">Golden Swirls (Leo)</option>
            <option value="pulsing">Verdant Pulse (Virgo)</option>
            <option value="wavy">Harmonic Waves (Libra)</option>
          </select>
        </div>
      )}
    </div>
  );
}