"use client";

import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useState } from 'react';
import * as THREE from 'three';

interface DepthVisualizationDashboardProps {
    showDashboard?: boolean;
    position?: [number, number, number];
}

export const DepthVisualizationDashboard: React.FC<DepthVisualizationDashboardProps> = ({
    showDashboard = true,
    position = [-15, 10, 0],
}) => {
    const { camera, scene } = useThree();
    const [depthMetrics, setDepthMetrics] = useState({
        cameraPosition: { x: 0, y: 0, z: 0 },
        cameraDistance: 0,
        objectsInView: 0,
        averageDepth: 0,
        fogDensity: 0,
        lightingIntensity: 0,
    });

    const [performanceMetrics, setPerformanceMetrics] = useState({
        fps: 0,
        drawCalls: 0,
        triangles: 0,
        geometries: 0,
    });

    useFrame((state) => {
        if (!showDashboard) return;

        const cameraPosition = camera.position;
        const cameraDistance = cameraPosition.length();

        // Calculate objects in view and depth metrics
        let totalDepth = 0;
        let objectCount = 0;

        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const distance = cameraPosition.distanceTo(object.position);
                if (distance < 200) { // Within reasonable viewing distance
                    totalDepth += distance;
                    objectCount++;
                }
            }
        });

        const averageDepth = objectCount > 0 ? totalDepth / objectCount : 0;

        // Get fog density if available
        const fogDensity = scene.fog ? (scene.fog as THREE.Fog).near / (scene.fog as THREE.Fog).far : 0;

        // Calculate lighting intensity (simplified)
        let totalLightIntensity = 0;
        let lightCount = 0;
        scene.traverse((object) => {
            if (object instanceof THREE.Light) {
                totalLightIntensity += object.intensity;
                lightCount++;
            }
        });
        const averageLightIntensity = lightCount > 0 ? totalLightIntensity / lightCount : 0;

        setDepthMetrics({
            cameraPosition: {
                x: Math.round(cameraPosition.x * 100) / 100,
                y: Math.round(cameraPosition.y * 100) / 100,
                z: Math.round(cameraPosition.z * 100) / 100,
            },
            cameraDistance: Math.round(cameraDistance * 100) / 100,
            objectsInView: objectCount,
            averageDepth: Math.round(averageDepth * 100) / 100,
            fogDensity: Math.round(fogDensity * 100) / 100,
            lightingIntensity: Math.round(averageLightIntensity * 100) / 100,
        });

        // Performance metrics (simplified)
        setPerformanceMetrics({
            fps: Math.round(1 / state.clock.getDelta()),
            drawCalls: 0, // Would need renderer info
            triangles: 0, // Would need renderer info
            geometries: scene.children.length,
        });
    });

    if (!showDashboard) return null;

    return (
        <Html position={position} center>
            <div style={{
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#ffffff',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                border: '1px solid #444',
                minWidth: '280px',
                boxShadow: '0 0 20px rgba(0, 100, 255, 0.3)',
            }}>
                <h3 style={{
                    margin: '0 0 10px 0',
                    color: '#00aaff',
                    textAlign: 'center',
                    fontSize: '14px'
                }}>
                    🌌 3D Depth Analytics
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {/* Camera Position */}
                    <div style={{ border: '1px solid #333', padding: '8px', borderRadius: '5px' }}>
                        <div style={{ color: '#ffaa00', fontWeight: 'bold', marginBottom: '5px' }}>
                            📍 Camera Position
                        </div>
                        <div>X: {depthMetrics.cameraPosition.x}</div>
                        <div>Y: {depthMetrics.cameraPosition.y}</div>
                        <div>Z: {depthMetrics.cameraPosition.z}</div>
                        <div style={{ color: '#88ccff' }}>
                            Distance: {depthMetrics.cameraDistance}
                        </div>
                    </div>

                    {/* Depth Metrics */}
                    <div style={{ border: '1px solid #333', padding: '8px', borderRadius: '5px' }}>
                        <div style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '5px' }}>
                            📊 Depth Metrics
                        </div>
                        <div>Objects: {depthMetrics.objectsInView}</div>
                        <div>Avg Depth: {depthMetrics.averageDepth}</div>
                        <div>Fog: {depthMetrics.fogDensity}</div>
                        <div style={{ color: '#ffff88' }}>
                            Light: {depthMetrics.lightingIntensity}
                        </div>
                    </div>

                    {/* Performance */}
                    <div style={{ border: '1px solid #333', padding: '8px', borderRadius: '5px' }}>
                        <div style={{ color: '#4ecdc4', fontWeight: 'bold', marginBottom: '5px' }}>
                            ⚡ Performance
                        </div>
                        <div>FPS: {performanceMetrics.fps}</div>
                        <div>Geometries: {performanceMetrics.geometries}</div>
                        <div>Draw Calls: {performanceMetrics.drawCalls}</div>
                        <div>Triangles: {performanceMetrics.triangles}</div>
                    </div>

                    {/* Spatial Awareness */}
                    <div style={{ border: '1px solid #333', padding: '8px', borderRadius: '5px' }}>
                        <div style={{ color: '#a78bfa', fontWeight: 'bold', marginBottom: '5px' }}>
                            🧭 Spatial Awareness
                        </div>
                        <div style={{
                            height: '40px',
                            background: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00)',
                            borderRadius: '3px',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: `${Math.min(depthMetrics.cameraDistance / 50 * 100, 100)}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '4px',
                                height: '4px',
                                background: '#ffffff',
                                borderRadius: '50%',
                                boxShadow: '0 0 4px #ffffff'
                            }} />
                        </div>
                        <div style={{ fontSize: '10px', marginTop: '5px' }}>
                            Depth Position
                        </div>
                    </div>
                </div>

                {/* Depth Visualization Bar */}
                <div style={{ marginTop: '10px' }}>
                    <div style={{ color: '#ffffff', fontSize: '10px', marginBottom: '5px' }}>
                        Depth Layers Active
                    </div>
                    <div style={{
                        height: '8px',
                        background: 'linear-gradient(90deg, #000033, #003366, #0066cc, #3399ff, #66ccff)',
                        borderRadius: '4px',
                        position: 'relative'
                    }}>
                        {[0, 0.25, 0.5, 0.75, 1].map((pos, index) => (
                            <div key={index} style={{
                                position: 'absolute',
                                left: `${pos * 100}%`,
                                top: '0',
                                width: '2px',
                                height: '8px',
                                background: '#ffffff',
                                opacity: 0.7
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        </Html>
    );
};

// Hook for accessing depth metrics in other components
export const useDepthMetrics = () => {
    const { camera, scene } = useThree();
    const [metrics, setMetrics] = useState(depthMetrics);

    useFrame(() => {
        const cameraPosition = camera.position;
        const cameraDistance = cameraPosition.length();

        let totalDepth = 0;
        let objectCount = 0;

        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const distance = cameraPosition.distanceTo(object.position);
                if (distance < 200) {
                    totalDepth += distance;
                    objectCount++;
                }
            }
        });

        const averageDepth = objectCount > 0 ? totalDepth / objectCount : 0;
        const fogDensity = scene.fog ? (scene.fog as THREE.Fog).near / (scene.fog as THREE.Fog).far : 0;

        let totalLightIntensity = 0;
        let lightCount = 0;
        scene.traverse((object) => {
            if (object instanceof THREE.Light) {
                totalLightIntensity += object.intensity;
                lightCount++;
            }
        });
        const averageLightIntensity = lightCount > 0 ? totalLightIntensity / lightCount : 0;

        setMetrics({
            cameraPosition: {
                x: Math.round(cameraPosition.x * 100) / 100,
                y: Math.round(cameraPosition.y * 100) / 100,
                z: Math.round(cameraPosition.z * 100) / 100,
            },
            cameraDistance: Math.round(cameraDistance * 100) / 100,
            objectsInView: objectCount,
            averageDepth: Math.round(averageDepth * 100) / 100,
            fogDensity: Math.round(fogDensity * 100) / 100,
            lightingIntensity: Math.round(averageLightIntensity * 100) / 100,
        });
    });

    return metrics;
};

const depthMetrics = {
    cameraPosition: { x: 0, y: 0, z: 0 },
    cameraDistance: 0,
    objectsInView: 0,
    averageDepth: 0,
    fogDensity: 0,
    lightingIntensity: 0,
};