"use client";

import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface EnhancedCameraControlsProps {
    enableAutoRotate?: boolean;
    enableZoom?: boolean;
    enablePan?: boolean;
    minDistance?: number;
    maxDistance?: number;
    autoRotateSpeed?: number;
    dampingFactor?: number;
    enableTransitions?: boolean;
    targets?: Array<{
        name: string;
        position: [number, number, number];
        lookAt?: [number, number, number];
    }>;
}

export const EnhancedCameraControls: React.FC<EnhancedCameraControlsProps> = ({
    enableAutoRotate = true,
    enableZoom = true,
    enablePan = true,
    minDistance = 8,
    maxDistance = 200,
    autoRotateSpeed = 0.5,
    dampingFactor = 0.05,
    enableTransitions = true,
    targets = []
}) => {
    const controlsRef = useRef<any>(null);
    const { camera, gl } = useThree();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentTarget, setCurrentTarget] = useState<string | null>(null);

    // Enhanced mouse/touch interactions
    const [pointerDown, setPointerDown] = useState(false);
    const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
    const [dragSensitivity, setDragSensitivity] = useState(1);

    // Smooth camera transitions
    const transitionCamera = useCallback((
        targetPosition: [number, number, number],
        targetLookAt: [number, number, number] = [0, 0, 0],
        duration: number = 2000
    ) => {
        if (!controlsRef.current || !enableTransitions) return;

        setIsTransitioning(true);

        const startPosition = camera.position.clone();
        const startTarget = controlsRef.current.target.clone();

        const endPosition = new THREE.Vector3(...targetPosition);
        const endTarget = new THREE.Vector3(...targetLookAt);

        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing function (ease-in-out cubic)
            const easeInOut = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Interpolate camera position
            camera.position.lerpVectors(startPosition, endPosition, easeInOut);

            // Interpolate target
            if (controlsRef.current) {
                controlsRef.current.target.lerpVectors(startTarget, endTarget, easeInOut);
                controlsRef.current.update();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsTransitioning(false);
            }
        };

        animate();
    }, [camera, enableTransitions]);

    // Navigate to specific planet or location
    const navigateToTarget = useCallback((targetName: string) => {
        const target = targets.find(t => t.name === targetName);
        if (!target) return;

        setCurrentTarget(targetName);

        // Calculate optimal camera position (offset from target)
        const offset = new THREE.Vector3(
            target.position[0] + 15,
            target.position[1] + 10,
            target.position[2] + 15
        );

        transitionCamera(
            [offset.x, offset.y, offset.z],
            target.lookAt || target.position,
            1500
        );
    }, [targets, transitionCamera]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (isTransitioning) return;

            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    // Return to center view
                    transitionCamera([0, 20, 30], [0, 0, 0]);
                    setCurrentTarget(null);
                    break;
                case 'KeyR':
                    // Reset camera
                    camera.position.set(0, 0, 15);
                    if (controlsRef.current) {
                        controlsRef.current.target.set(0, 0, 0);
                        controlsRef.current.update();
                    }
                    break;
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                    const targetIndex = parseInt(event.code.slice(-1)) - 1;
                    if (targets[targetIndex]) {
                        navigateToTarget(targets[targetIndex].name);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [camera, targets, navigateToTarget, transitionCamera, isTransitioning]);

    // Enhanced pointer interactions
    const handlePointerDown = useCallback((event: PointerEvent) => {
        setPointerDown(true);
        setPointerPosition({ x: event.clientX, y: event.clientY });

        // Adjust drag sensitivity based on camera distance
        if (controlsRef.current) {
            const distance = camera.position.distanceTo(controlsRef.current.target);
            setDragSensitivity(Math.max(0.5, Math.min(2, distance / 20)));
        }
    }, [camera]);

    const handlePointerMove = useCallback((event: PointerEvent) => {
        if (!pointerDown) return;

        const deltaX = event.clientX - pointerPosition.x;
        const deltaY = event.clientY - pointerPosition.y;

        // Enhanced rotation with distance-based sensitivity
        if (controlsRef.current && Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            controlsRef.current.rotateSpeed = dragSensitivity;
        }

        setPointerPosition({ x: event.clientX, y: event.clientY });
    }, [pointerDown, pointerPosition, dragSensitivity]);

    const handlePointerUp = useCallback(() => {
        setPointerDown(false);
        if (controlsRef.current) {
            controlsRef.current.rotateSpeed = 1;
        }
    }, []);

    // Setup pointer event listeners
    useEffect(() => {
        const canvas = gl.domElement;

        canvas.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [gl, handlePointerDown, handlePointerMove, handlePointerUp]);

    // Adaptive auto-rotation
    useFrame(() => {
        if (controlsRef.current) {
            // Disable auto-rotation when user is interacting
            const shouldAutoRotate = enableAutoRotate && !pointerDown && !isTransitioning;
            controlsRef.current.autoRotate = shouldAutoRotate;

            // Adaptive damping - smoother when further from targets
            const nearestTargetDistance = targets.length > 0
                ? Math.min(...targets.map(t => camera.position.distanceTo(new THREE.Vector3(...t.position))))
                : 50;

            const adaptiveDamping = Math.max(0.02, Math.min(0.1, dampingFactor * (nearestTargetDistance / 30)));
            controlsRef.current.dampingFactor = adaptiveDamping;
        }
    });

    return (
        <>
            <OrbitControls
                ref={controlsRef}
                enableZoom={enableZoom}
                enablePan={enablePan}
                enableRotate={true}
                enableDamping={true}
                dampingFactor={dampingFactor}
                minDistance={minDistance}
                maxDistance={maxDistance}
                autoRotate={enableAutoRotate}
                autoRotateSpeed={autoRotateSpeed}
                rotateSpeed={0.8}
                zoomSpeed={1.2}
                panSpeed={0.8}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
                screenSpacePanning={false}
                makeDefault
            />

            {/* Navigation UI Overlay */}
            {typeof window !== 'undefined' && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        zIndex: 1000,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                        🚀 Space Navigation
                    </div>
                    <div>🖱️ Drag: Rotate view</div>
                    <div>🎯 Scroll: Zoom in/out</div>
                    <div>⌨️ Space: Return to center</div>
                    <div>⌨️ R: Reset camera</div>
                    {targets.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                            <div>📍 Quick navigate:</div>
                            {targets.slice(0, 5).map((target, index) => (
                                <div key={target.name}>
                                    {index + 1}: {target.name}
                                </div>
                            ))}
                        </div>
                    )}
                    {currentTarget && (
                        <div style={{ marginTop: '8px', color: '#00ff88' }}>
                            📍 Viewing: {currentTarget}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};