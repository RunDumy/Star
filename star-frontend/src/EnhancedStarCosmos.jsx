import React, { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';
import AgoraRTC from 'agora-rtc-sdk-ng';

const Starfield = () => {
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);
  const velocities = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = (Math.random() - 0.5) * 100;
    positions[i + 2] = (Math.random() - 0.5) * 100;
    velocities[i] = (Math.random() - 0.5) * 0.01;
    velocities[i + 1] = (Math.random() - 0.5) * 0.01;
    velocities[i + 2] = (Math.random() - 0.5) * 0.01;
  }

  const ref = React.useRef();
  
  useFrame(() => {
    const positions = ref.current.array;
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];
      if (Math.abs(positions[i]) > 50) velocities[i] *= -1;
      if (Math.abs(positions[i + 1]) > 50) velocities[i + 1] *= -1;
      if (Math.abs(positions[i + 2]) > 50) velocities[i + 2] *= -1;
    }
    ref.current.needsUpdate = true;
  });

  return (
    <Points>
      <bufferGeometry>
        <bufferAttribute ref={ref} attach='attributes-position' array={positions} itemSize={3} />
      </bufferGeometry>
      <PointMaterial size={0.1} color='white' transparent opacity={0.8} />
    </Points>
  );
};

const PlanetButton = ({ position, color, label, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.mesh
      position={position}
      scale={hovered ? 0.35 : 0.3}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      animate={{ rotateY: hovered ? 2 * Math.PI : 0 }}
      transition={{ duration: 2 }}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.5 : 0.2} />
      <Html distanceFactor={10}>
        <div className='tooltip' style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '5px' }}>
          {label}
        </div>
      </Html>
    </motion.mesh>
  );
};

const EnhancedStarCosmos = () => {
  const [client, setClient] = useState(null);
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const channel = 'cosmic-channel';
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch(${process.env.NEXT_PUBLIC_API_URL}/api/v1/agora-token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      const { token } = await response.json();
      setToken(token);
    };
    fetchToken();

    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(agoraClient);

    return () => {
      if (agoraClient) agoraClient.leave();
    };
  }, []);

  const joinStream = async () => {
    if (!client || !token) return;
    await client.join(appId, channel, token, null);
    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await client.publish([localAudioTrack, localVideoTrack]);
    document.getElementById('local-stream').appendChild(localVideoTrack.getMediaElement());
  };

  return (
    <div style={{ height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 30], fov: 60 }} style={{ background: '#000000' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Starfield />
        <PlanetButton position={[10, 0, 10]} color='#FFD700' label='Venus' onClick={() => console.log('Venus clicked')} />
        <PlanetButton position={[0, 5, 15]} color='#FF4500' label='Mars' onClick={() => console.log('Mars clicked')} />
        <PlanetButton position={[-10, 0, 20]} color='#FFA500' label='Jupiter' onClick={joinStream} />
        <OrbitControls />
      </Canvas>
      <div id='local-stream' className='stream-container' style={{ position: 'absolute', bottom: '10px', right: '10px' }} />
    </div>
  );
};

export default EnhancedStarCosmos;
