import { useCollaboration } from "@/contexts/CollaborationContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { useRef, useState } from "react";
import * as THREE from "three";
import { CollaborativeAvatar } from "./CollaborativeAvatar";

export const CollaborativeConstellation = () => {
  const systemRef = useRef(null);
  const { users, currentUser, updateUserPosition } = useCollaboration();
  const { peers, isMuted, toggleMute } = useWebRTC("cosmic-constellation");
  const { camera, gl } = useThree();
  const [selectedStar, setSelectedStar] = useState(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useFrame((state) => {
    if (systemRef.current) {
      systemRef.current.rotation.y += 0.001;
      if (currentUser) {
        updateUserPosition(currentUser.id, [systemRef.current.position.x, systemRef.current.position.y, systemRef.current.position.z]);
      }
    }
  });

  // Gesture handling for star selection
  const gestureHandlers = useGesture({
    onDragStart: ({ event }) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);

      // Create a scene group to check intersections
      const sceneGroup = systemRef.current;
      if (sceneGroup) {
        const intersects = raycaster.current.intersectObjects(sceneGroup.children, true);
        const starMesh = intersects.find((i) => i.object.userData.isStar);
        if (starMesh) {
          setSelectedStar(starMesh.object.userData);
        }
      }
    },
  });

  return (
    <group {...gestureHandlers()}>
      <group ref={systemRef}>
        <mesh>
          <torusGeometry args={[8, 0.2, 16, 100]} />
          <meshStandardMaterial color="#4a90e2" emissive="#4a90e2" emissiveIntensity={0.2} transparent opacity={0.6} />
        </mesh>

        {/* Add some interactive stars */}
        <mesh position={[3, 1, 2]} userData={{ isStar: true, id: 'star1', name: 'Sirius' }}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-2, -1, 3]} userData={{ isStar: true, id: 'star2', name: 'Vega' }}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[1, -2, -2]} userData={{ isStar: true, id: 'star3', name: 'Betelgeuse' }}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.6} />
        </mesh>

        {currentUser && <CollaborativeAvatar user={currentUser} isCurrentUser={true} data-testid="collaborative-avatar" />}
        {users
          .filter((user) => user.id !== currentUser?.id)
          .map((user) => (
            <CollaborativeAvatar key={user.id} user={user} isCurrentUser={false} data-testid="collaborative-avatar" />
          ))}
        <mesh position={[5, 0, 0]} data-gaze-selectable data-gaze-route="/shared-chat" data-gaze-label="Shared Chat">
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#9b59b6" emissive="#9b59b6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-5, 2, 0]} data-gaze-selectable data-gaze-route="/shared-whiteboard" data-gaze-label="Cosmic Whiteboard">
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#2ecc71" emissive="#2ecc71" emissiveIntensity={0.3} />
        </mesh>
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-regular.woff"
        >
          Ursa Major
        </Text>
      </group>

      {/* Selected star indicator */}
      {selectedStar && (
        <Text
          position={[0, -4, 0]}
          fontSize={0.3}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
        >
          Selected: {selectedStar.name}
        </Text>
      )}

      <group position={[0, -3, 0]}>
        <mesh onClick={toggleMute}>
          <boxGeometry args={[1, 0.5, 0.2]} />
          <meshStandardMaterial color={isMuted ? "#ff4444" : "#4a90e2"} />
          <Text position={[0, 0, 0.11]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">
            {isMuted ? "Unmute" : "Mute"}
          </Text>
        </mesh>
      </group>
    </group>
  );
};