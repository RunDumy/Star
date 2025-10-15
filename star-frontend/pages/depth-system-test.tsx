import Head from 'next/head';
import { useState } from 'react';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';

export default function DepthSystemTest() {
    const [showDepthInfo, setShowDepthInfo] = useState(true);

    return (
        <CosmicPageWrapper showNavigation={true}>
            <Head>
                <title>STAR - Depth System Test</title>
                <meta name="description" content="Test the enhanced depth system features" />
            </Head>

            <div className="space-color" style={{
                position: 'relative',
                zIndex: 100,
                padding: '2rem',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <div className="space-glow" style={{
                    padding: '2rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    background: 'rgba(0, 0, 0, 0.8)'
                }}>
                    <h1 style={{
                        textAlign: 'center',
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        textShadow: '0 0 20px #3b82f6'
                    }}>
                        🌌 Depth System Test
                    </h1>

                    <p style={{
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        marginBottom: '2rem',
                        opacity: 0.8
                    }}>
                        Experience the enhanced 3D depth perception system
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div className="space-glow" style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.1)'
                        }}>
                            <h3>✅ Multi-Layer Starfield</h3>
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                                <li>Far Stars: 1000px depth</li>
                                <li>Mid Stars: 500px depth</li>
                                <li>Near Stars: 200px depth</li>
                            </ul>
                        </div>

                        <div className="space-glow" style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.1)'
                        }}>
                            <h3>✅ True 3D Positioning</h3>
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                                <li>X-axis: -15 to +15</li>
                                <li>Y-axis: -15 to +12</li>
                                <li>Z-axis: -12 to +10</li>
                            </ul>
                        </div>

                        <div className="space-glow" style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: 'rgba(124, 58, 237, 0.1)'
                        }}>
                            <h3>✅ Volumetric Effects</h3>
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                                <li>Space fog layers</li>
                                <li>Atmospheric scattering</li>
                                <li>Distance-based blur</li>
                            </ul>
                        </div>

                        <div className="space-glow" style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.1)'
                        }}>
                            <h3>✅ Enhanced Visual Cues</h3>
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                                <li>Depth-based scaling</li>
                                <li>Progressive lighting</li>
                                <li>Orbital motion</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setShowDepthInfo(!showDepthInfo)}
                            className="space-glow"
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '25px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.5)',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {showDepthInfo ? '🔍 Hide Depth Info' : '👁️ Show Depth Info'}
                        </button>
                    </div>
                </div>

                <div className="space-glow" style={{
                    padding: '1.5rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.6)'
                }}>
                    <h2 style={{ marginBottom: '1rem' }}>🎮 Interactive Features</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <h4>🖱️ Camera Controls</h4>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                Use mouse to orbit, zoom, and pan around the 3D space
                            </p>
                        </div>
                        <div>
                            <h4>🪐 Planet Navigation</h4>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                Click on planets to navigate between pages
                            </p>
                        </div>
                        <div>
                            <h4>🌟 Parallax Effect</h4>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                Move the camera to see multi-layer star parallax
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CosmicPageWrapper>
    );
}