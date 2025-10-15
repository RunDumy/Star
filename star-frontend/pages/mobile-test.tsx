/**
 * Mobile Integration Test Page
 * Demonstrates all mobile optimization features for STAR platform
 */

import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import MobileFeed from '../src/components/mobile/MobileFeed';
import { MobileAppContainer } from '../src/components/mobile/MobileNavigation';
import MobilePerformanceMonitor, { usePerformanceOptimization } from '../src/components/mobile/MobilePerformanceMonitor';
import {
    generateMobileClasses,
    useDeviceDetection,
    useMobileOptimization,
    usePWA
} from '../src/lib/MobileOptimization';

// Mock data for mobile feed demonstration
const generateMockFeedItems = (count: number) => {
    const types = ['post', 'tarot', 'numerology', 'music', 'badge'];
    const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const elements = ['fire', 'water', 'air', 'earth', 'spirit'];

    return Array.from({ length: count }, (_, index) => ({
        id: `item-${index}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        author: {
            id: `user-${index}`,
            name: `Cosmic User ${index + 1}`,
            zodiacSign: zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)],
            avatar: Math.random() > 0.5 ? undefined : `https://ui-avatars.com/api/?name=User${index}&background=random`
        },
        content: {
            text: `This is a cosmic message from the universe! ✨ The stars align in mysterious ways, bringing us wisdom and insights from beyond. #CosmicWisdom #StarPlatform ${Math.random() > 0.5 ? 'This is a longer message that demonstrates the expand/collapse functionality in mobile view. When text is too long, users can tap to read more and get the full cosmic insight!' : ''}`,
            images: Math.random() > 0.7 ? [
                'https://picsum.photos/400/300?random=' + index,
                ...(Math.random() > 0.5 ? ['https://picsum.photos/400/300?random=' + (index + 100)] : [])
            ] : undefined,
            tarotCards: types[Math.floor(Math.random() * types.length)] === 'tarot' ? [
                { name: 'The Star' },
                { name: 'The Moon' },
                { name: 'The Sun' }
            ] : undefined,
            numerologyData: types[Math.floor(Math.random() * types.length)] === 'numerology' ? {
                lifePathNumber: Math.floor(Math.random() * 9) + 1
            } : undefined,
            musicTrack: types[Math.floor(Math.random() * types.length)] === 'music' ? {
                name: `Cosmic Track ${index}`,
                artist: 'Universal Artist'
            } : undefined,
            badgeEarned: types[Math.floor(Math.random() * types.length)] === 'badge' ? {
                name: 'Cosmic Explorer'
            } : undefined
        },
        interactions: {
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            shares: Math.floor(Math.random() * 25),
            zodiacReactions: {
                aries: Math.floor(Math.random() * 10),
                leo: Math.floor(Math.random() * 10),
                sagittarius: Math.floor(Math.random() * 10)
            }
        },
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        energy: Math.floor(Math.random() * 100),
        element: elements[Math.floor(Math.random() * elements.length)] as any
    }));
};

const MobileTestPage: NextPage = () => {
    const deviceInfo = useDeviceDetection();
    const mobileOptimization = useMobileOptimization();
    const { handlePerformanceUpdate, metrics, optimizationsApplied } = usePerformanceOptimization();
    const { isInstallable, isInstalled, installApp } = usePWA();

    // Feed state
    const [feedItems, setFeedItems] = useState(generateMockFeedItems(10));
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Demo controls
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [performanceMode, setPerformanceMode] = useState(false);

    // Load more items (simulated)
    const handleLoadMore = async () => {
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, deviceInfo.isMobile ? 1000 : 500));

        const newItems = generateMockFeedItems(5);
        setFeedItems(prev => [...prev, ...newItems]);
        setCurrentPage(prev => prev + 1);
        setLoading(false);

        return newItems;
    };

    // Handle feed interactions
    const handleItemInteract = (itemId: string, action: string) => {
        console.log(`Mobile interaction: ${action} on ${itemId}`);

        setFeedItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newInteractions = { ...item.interactions };

                switch (action) {
                    case 'like':
                        newInteractions.likes += 1;
                        break;
                    case 'comment':
                        newInteractions.comments += 1;
                        break;
                    case 'share':
                        newInteractions.shares += 1;
                        break;
                }

                return { ...item, interactions: newInteractions };
            }
            return item;
        }));
    };

    // Mobile-specific effects
    useEffect(() => {
        // Set up mobile viewport (client-side only)
        if (typeof window !== 'undefined') {
            const setVH = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };

            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);

            // Add mobile classes to body
            document.body.className = generateMobileClasses(deviceInfo);

            return () => {
                window.removeEventListener('resize', setVH);
                window.removeEventListener('orientationchange', setVH);
            };
        }
    }, [deviceInfo]);

    // Performance monitoring
    useEffect(() => {
        if (performanceMode) {
            document.body.classList.add('performance-mode');
        } else {
            document.body.classList.remove('performance-mode');
        }
    }, [performanceMode]);

    return (
        <>
            <Head>
                <title>STAR Platform - Mobile Optimized</title>
                <meta name="description" content="Experience the cosmic social platform optimized for mobile devices" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <meta name="theme-color" content="#1a1a2e" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="STAR Platform" />

                {/* PWA icons */}
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />

                {/* Mobile optimizations */}
                <link rel="preload" href="/fonts/cosmic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Head>

            <MobileAppContainer showNavigation={true}>
                {/* Performance Monitor */}
                <MobilePerformanceMonitor
                    onPerformanceUpdate={handlePerformanceUpdate}
                    showDebugInfo={showDebugInfo}
                    autoOptimize={true}
                />

                {/* Main Content */}
                <div className="relative">
                    {/* Header with device info */}
                    <div className="p-4 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold">STAR Platform Mobile</h1>
                                <p className="text-sm text-gray-300">
                                    Optimized for {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
                                </p>
                            </div>

                            {/* PWA Install Button */}
                            {isInstallable && !isInstalled && (
                                <button
                                    onClick={installApp}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    📱 Install App
                                </button>
                            )}
                        </div>

                        {/* Device Info Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                <div className="text-xs text-gray-300">Screen</div>
                                <div className="font-semibold">{deviceInfo.screenWidth}×{deviceInfo.screenHeight}</div>
                                <div className="text-xs text-gray-400">{deviceInfo.orientation}</div>
                            </div>

                            <div className="bg-white bg-opacity-10 rounded-lg p-3">
                                <div className="text-xs text-gray-300">Network</div>
                                <div className="font-semibold">{deviceInfo.connectionType}</div>
                                <div className="text-xs text-gray-400">
                                    {deviceInfo.touchEnabled ? '👆 Touch' : '🖱️ Mouse'}
                                </div>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        {metrics && (
                            <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Performance</span>
                                    <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${metrics.fps >= 50 ? 'bg-green-600' : metrics.fps >= 30 ? 'bg-yellow-600' : 'bg-red-600'}
                  `}>
                                        {metrics.fps} FPS
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <div className="text-gray-300">Memory</div>
                                        <div>{metrics.memoryUsage}%</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-300">LCP</div>
                                        <div>{Math.round(metrics.largestContentfulPaint)}ms</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-300">CLS</div>
                                        <div>{metrics.cumulativeLayoutShift.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Debug Controls */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowDebugInfo(!showDebugInfo)}
                                className={`
                  px-3 py-1 rounded-lg text-xs transition-colors
                  ${showDebugInfo ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
                `}
                            >
                                {showDebugInfo ? '🐛 Hide Debug' : '🐛 Show Debug'}
                            </button>

                            <button
                                onClick={() => setPerformanceMode(!performanceMode)}
                                className={`
                  px-3 py-1 rounded-lg text-xs transition-colors
                  ${performanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}
                `}
                            >
                                {performanceMode ? '⚡ Exit Perf Mode' : '⚡ Perf Mode'}
                            </button>
                        </div>

                        {/* Applied Optimizations */}
                        {optimizationsApplied.length > 0 && (
                            <div className="mt-3 p-2 bg-yellow-900 bg-opacity-50 rounded-lg">
                                <div className="text-xs text-yellow-300 font-medium mb-1">
                                    Active Optimizations:
                                </div>
                                {optimizationsApplied.map((opt, index) => (
                                    <div key={index} className="text-xs text-yellow-200">
                                        • {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile Feed */}
                    <div className="p-4">
                        <MobileFeed
                            items={feedItems}
                            onLoadMore={handleLoadMore}
                            onItemInteract={handleItemInteract}
                            className="mobile-optimized-feed"
                        />
                    </div>

                    {/* Touch Gesture Guide */}
                    {deviceInfo.touchEnabled && (
                        <div className="fixed bottom-20 left-4 bg-black bg-opacity-80 rounded-lg p-3 text-white text-xs max-w-xs">
                            <div className="font-semibold mb-2">📱 Touch Gestures</div>
                            <div className="space-y-1">
                                <div>👆 Tap - Select item</div>
                                <div>👆👆 Double tap - Like</div>
                                <div>👆⏱️ Long press - Menu</div>
                                <div>👈 Swipe left - Like</div>
                                <div>👉 Swipe right - Share</div>
                                <div>🤏 Pinch - Zoom (in 3D)</div>
                            </div>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-purple-900 rounded-lg p-6 text-white text-center">
                                <div className="flex items-center justify-center space-x-2 mb-3">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-100" />
                                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-200" />
                                </div>
                                <div>Loading cosmic content...</div>
                            </div>
                        </div>
                    )}
                </div>
            </MobileAppContainer>

            {/* Mobile-specific styles */}
            <style jsx>{`
        .mobile-optimized-feed {
          /* Custom mobile feed styles */
        }

        @media (max-width: 768px) {
          .mobile-app {
            padding-bottom: 8rem;
          }
        }

        .performance-mode * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.1s !important;
        }

        .low-power-mode {
          filter: brightness(0.8);
        }

        .slow-network-mode img {
          filter: blur(1px);
          transition: filter 0.3s ease;
        }

        .slow-network-mode img:hover {
          filter: none;
        }
      `}</style>
        </>
    );
};

// Disable static generation to avoid window issues
export async function getServerSideProps() {
    return {
        props: {},
    };
}

export default MobileTestPage;