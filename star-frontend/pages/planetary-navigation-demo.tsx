import { motion } from 'framer-motion';
import React, { useState } from 'react';
import PlanetaryNavigation from '../src/components/cosmic/PlanetaryNavigation';

interface PlanetaryGlyph {
    id: string;
    name: string;
    route: string;
    zodiacSign: string;
    element: 'fire' | 'water' | 'air' | 'earth';
    position: [number, number, number];
    color: string;
    description: string;
    isActive: boolean;
}

const PlanetaryNavigationDemo: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('/cosmic-feed');

    // Mock planetary glyphs data
    const planetaryGlyphs: PlanetaryGlyph[] = [
        {
            id: 'feed',
            name: 'Cosmic Feed',
            route: '/cosmic-feed',
            zodiacSign: 'gemini',
            element: 'air',
            position: [0, 2, 0],
            color: '#FFD700',
            description: 'Social cosmic interactions and posts',
            isActive: false
        },
        {
            id: 'profile',
            name: 'Cosmic Profile',
            route: '/cosmic-profile',
            zodiacSign: 'leo',
            element: 'fire',
            position: [2, 1, 1],
            color: '#FF6B35',
            description: 'Your personalized cosmic identity',
            isActive: false
        },
        {
            id: 'tarot',
            name: 'Tarot Reader',
            route: '/tarot-reader',
            zodiacSign: 'scorpio',
            element: 'water',
            position: [-2, 0, 1],
            color: '#8B5CF6',
            description: 'Divine cosmic guidance through cards',
            isActive: false
        },
        {
            id: 'moments',
            name: 'Zodiac Moments',
            route: '/zodiac-moments',
            zodiacSign: 'aries',
            element: 'fire',
            position: [1, -1, -1],
            color: '#FF4444',
            description: 'Short-form cosmic video content',
            isActive: false
        },
        {
            id: 'threads',
            name: 'Constellation Threads',
            route: '/constellation-threads',
            zodiacSign: 'aquarius',
            element: 'air',
            position: [-1, 1, -1],
            color: '#00BCD4',
            description: 'Threaded cosmic conversations',
            isActive: false
        },
        {
            id: 'cosmos',
            name: 'Enhanced Cosmos',
            route: '/enhanced-cosmos',
            zodiacSign: 'pisces',
            element: 'water',
            position: [0, -2, 0],
            color: '#673AB7',
            description: '3D collaborative cosmic space',
            isActive: false
        },
        {
            id: 'community',
            name: 'Community Hub',
            route: '/community-hub',
            zodiacSign: 'libra',
            element: 'air',
            position: [2, 0, -1],
            color: '#E91E63',
            description: 'Connect with cosmic beings',
            isActive: false
        },
        {
            id: 'insights',
            name: 'Cosmic Insights',
            route: '/cosmic-insights',
            zodiacSign: 'virgo',
            element: 'earth',
            position: [-2, -1, 0],
            color: '#4CAF50',
            description: 'Analytics and cosmic patterns',
            isActive: false
        }
    ];

    // Update active glyph based on current page
    const updatedGlyphs = planetaryGlyphs.map(glyph => ({
        ...glyph,
        isActive: glyph.route === currentPage
    }));

    // Handle navigation
    const handleNavigation = (route: string) => {
        setCurrentPage(route);
        // In a real app, this would trigger actual navigation
        console.log(`Navigating to: ${route}`);
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Planetary Navigation */}
            <PlanetaryNavigation
                currentPage={currentPage}
                onNavigate={handleNavigation}
                glyphs={updatedGlyphs}
            />

            {/* Page Content Overlay (simulate different pages) */}
            <motion.div
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-30"
            >
                <div className="max-w-md mx-auto bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                    <h2 className="text-white font-bold text-lg mb-2">
                        Current Page: {updatedGlyphs.find(g => g.route === currentPage)?.name}
                    </h2>
                    <p className="text-gray-300 text-sm">
                        {updatedGlyphs.find(g => g.route === currentPage)?.description}
                    </p>
                    <div className="mt-3 flex items-center space-x-2 text-sm">
                        <span className="text-gray-400">Element:</span>
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-medium`}
                            style={{ backgroundColor: updatedGlyphs.find(g => g.route === currentPage)?.color }}>
                            {updatedGlyphs.find(g => g.route === currentPage)?.element}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Demo Instructions (fade out after viewing) */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 4, duration: 1 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none"
            >
                <div className="bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-sm rounded-xl p-8 max-w-md mx-4 text-center border border-purple-500/30">
                    <div className="text-6xl mb-4">🌌</div>
                    <h2 className="text-white font-bold text-2xl mb-4">Planetary Navigation Demo</h2>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        Experience seamless cosmic navigation through 3D space. Click any orbiting glyph to travel between different areas of the STAR platform.
                    </p>
                    <div className="space-y-2 text-left text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Click glyphs to navigate</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                            <span>Drag to explore 3D space</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Scroll to zoom in/out</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PlanetaryNavigationDemo;