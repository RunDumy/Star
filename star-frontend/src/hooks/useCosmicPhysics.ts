"use client";

import { useCallback, useRef } from 'react';

interface CosmicObject {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  mass: number;
  emotionalCharge: number;
}

export const useCosmicPhysics = () => {
  const objectsRef = useRef<CosmicObject[]>([]);

  const addObject = useCallback((object: CosmicObject) => {
    objectsRef.current.push(object);
  }, []);

  const removeObject = useCallback((id: string) => {
    objectsRef.current = objectsRef.current.filter(obj => obj.id !== id);
  }, []);

  const updatePhysics = useCallback((delta: number) => {
    // Update positions based on velocity
    objectsRef.current.forEach(obj => {
      obj.position[0] += obj.velocity[0] * delta;
      obj.position[1] += obj.velocity[1] * delta;
      obj.position[2] += obj.velocity[2] * delta;
    });

    // Apply gravitational forces between objects
    for (let i = 0; i < objectsRef.current.length; i++) {
      for (let j = i + 1; j < objectsRef.current.length; j++) {
        const obj1 = objectsRef.current[i];
        const obj2 = objectsRef.current[j];

        const dx = obj2.position[0] - obj1.position[0];
        const dy = obj2.position[1] - obj1.position[1];
        const dz = obj2.position[2] - obj1.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > 0.1) { // Avoid division by zero
          const force = (obj1.mass * obj2.mass) / (distance * distance);
          const forceX = force * dx / distance;
          const forceY = force * dy / distance;
          const forceZ = force * dz / distance;

          // Apply force (simplified - no actual physics constants)
          obj1.velocity[0] += forceX * delta * 0.001;
          obj1.velocity[1] += forceY * delta * 0.001;
          obj1.velocity[2] += forceZ * delta * 0.001;

          obj2.velocity[0] -= forceX * delta * 0.001;
          obj2.velocity[1] -= forceY * delta * 0.001;
          obj2.velocity[2] -= forceZ * delta * 0.001;
        }
      }
    }
  }, []);

  const getObjects = useCallback(() => objectsRef.current, []);

  return {
    addObject,
    removeObject,
    updatePhysics,
    getObjects
  };
};