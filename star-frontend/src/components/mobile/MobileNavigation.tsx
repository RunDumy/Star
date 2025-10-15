/**
 * Mobile Navigation Component for STAR Platform
 * Responsive navigation optimized for mobile devices with touch gestures
 */

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
    useDeviceDetection,
    useMobileOptimization,
    useTouchGestures,
    type TouchGesture
} from '../../lib/MobileOptimization';

// Navigation items for mobile
interface NavItem {
    name: string;
    route: string;
    icon: string;
    color: string;
    description: string;
    energy?: number;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
    {
        name: 'Profile',
        route: '/cosmic-profile-enhanced',
        icon: '👤',
        color: 'from-red-500 to-pink-500',
        description: 'Your Cosmic Identity',
        energy: 85
    },
    {
        name: 'Feed',
        route: '/cosmic-feed',
        icon: '🌌',
        color: 'from-blue-500 to-cyan-500',
        description: 'Social Universe',
        energy: 70
    },
    {
        name: 'Tarot',
        route: '/tarot-reader',
        icon: '🔮',
        color: 'from-purple-500 to-indigo-500',
        description: 'Divine Readings',
        energy: 90
    },
    {
        name: 'Cosmos',
        route: '/collaborative-cosmos',
        icon: '🪐',
        color: 'from-green-500 to-teal-500',
        description: '3D Space',
        energy: 75
    },
    {
        name: 'Numbers',
        route: '/numerology-enhanced',
        icon: '🔢',
        color: 'from-yellow-500 to-orange-500',
        description: 'Sacred Math',
        energy: 80
    },
    {
        name: 'Music',
        route: '/enhanced-spotify',
        icon: '🎵',
        color: 'from-purple-400 to-pink-400',
        description: 'Cosmic Sounds',
        energy: 88
    }
];

export const MobileNavigation: React.FC<{
    onNavigate?: (item: NavItem) => void;
    currentRoute?: string;
}> = ({ onNavigate, currentRoute }) => {
    const deviceInfo = useDeviceDetection();
    const router = useRouter();
    const [selectedItem, setSelectedItem] = useState<NavItem | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Handle navigation
    const handleItemSelect = (item: NavItem) => {
        setSelectedItem(item);
        onNavigate?.(item);

        // Navigate immediately on mobile
        if (deviceInfo.isMobile) {
            router.push(item.route);
        }

        setIsMenuOpen(false);
    };

    // Touch gesture handling
    const handleGesture = (gesture: TouchGesture) => {
        switch (gesture.type) {
            case 'swipe':
                if (gesture.direction === 'up' && !isMenuOpen) {
                    setIsMenuOpen(true);
                } else if (gesture.direction === 'down' && isMenuOpen) {
                    setIsMenuOpen(false);
                }
                break;

            case 'tap':
                // Handle tap selection
                break;
        }
    };

    const touchHandlers = useTouchGestures(handleGesture);

    // Mobile grid layout
    if (deviceInfo.isMobile) {
        return (
            <div className="mobile-navigation">
                {/* Bottom navigation bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-md z-50">
                    <div className="grid grid-cols-3 gap-1 p-2">
                        {MOBILE_NAV_ITEMS.slice(0, 6).map((item, index) => (
                            <button
                                key={item.name}
                                onClick={() => handleItemSelect(item)}
                                className={`
                  relative p-4 rounded-lg transition-all duration-300
                  bg-gradient-to-br ${item.color}
                  text-white text-center
                  ${currentRoute === item.route ? 'ring-2 ring-white scale-105' : 'hover:scale-105'}
                  ${deviceInfo.isMobile ? 'text-xs' : 'text-sm'}
                `}
                                {...touchHandlers}
                            >
                                <div className="text-2xl mb-1">{item.icon}</div>
                                <div className="font-semibold">{item.name}</div>

                                {/* Energy indicator */}
                                {item.energy && (
                                    <div className="absolute top-1 right-1 text-xs bg-white bg-opacity-20 rounded-full px-1">
                                        {item.energy}%
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Swipe indicator */}
                    <div className="text-center py-2 text-white text-xs opacity-60">
                        Swipe up for more options
                    </div>
                </div>

                {/* Expandable menu overlay */}
                {isMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-95 z-40 flex items-center justify-center"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <div className="grid grid-cols-2 gap-4 p-6 max-w-sm w-full">
                            {MOBILE_NAV_ITEMS.map((item) => (
                                <div
                                    key={item.name}
                                    onClick={() => handleItemSelect(item)}
                                    className={`
                    p-6 rounded-xl bg-gradient-to-br ${item.color}
                    text-white text-center cursor-pointer
                    transform transition-all duration-300 hover:scale-105
                    shadow-lg
                  `}
                                >
                                    <div className="text-3xl mb-2">{item.icon}</div>
                                    <div className="font-bold text-lg">{item.name}</div>
                                    <div className="text-sm opacity-90">{item.description}</div>

                                    {/* Energy bar */}
                                    {item.energy && (
                                        <div className="mt-2">
                                            <div className="bg-white bg-opacity-20 rounded-full h-2">
                                                <div
                                                    className="bg-white rounded-full h-2 transition-all duration-500"
                                                    style={{ width: `${item.energy}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Close hint */}
                        <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm">
                            Tap outside to close
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Tablet layout - sidebar
    if (deviceInfo.isTablet) {
        return (
            <div className="tablet-navigation fixed left-0 top-0 bottom-0 w-20 bg-black bg-opacity-90 backdrop-blur-md z-40">
                <div className="flex flex-col items-center py-4 space-y-4">
                    {MOBILE_NAV_ITEMS.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleItemSelect(item)}
                            className={`
                relative w-14 h-14 rounded-xl transition-all duration-300
                bg-gradient-to-br ${item.color}
                text-white flex items-center justify-center
                ${currentRoute === item.route ? 'ring-2 ring-white scale-110' : 'hover:scale-110'}
              `}
                            title={item.description}
                        >
                            <span className="text-2xl">{item.icon}</span>

                            {/* Energy dot */}
                            {item.energy && item.energy > 80 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Desktop layout - top navigation
    return (
        <div className="desktop-navigation fixed top-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-md z-40">
            <div className="flex items-center justify-center space-x-6 py-4">
                {MOBILE_NAV_ITEMS.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => handleItemSelect(item)}
                        className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
              bg-gradient-to-r ${item.color}
              text-white
              ${currentRoute === item.route ? 'ring-2 ring-white scale-105' : 'hover:scale-105'}
            `}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs opacity-90">{item.description}</div>
                        </div>

                        {/* Energy indicator */}
                        {item.energy && (
                            <div className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1">
                                {item.energy}%
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

/**
 * Mobile App Container with responsive layout
 */
export const MobileAppContainer: React.FC<{
    children: React.ReactNode;
    showNavigation?: boolean;
}> = ({ children, showNavigation = true }) => {
    const deviceInfo = useDeviceDetection();
    const mobileOptimization = useMobileOptimization();

    useEffect(() => {
        // Set up mobile viewport
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);

        return () => {
            window.removeEventListener('resize', setVH);
            window.removeEventListener('orientationchange', setVH);
        };
    }, []);

    // Calculate padding based on navigation
    const getPaddingClass = () => {
        if (!showNavigation) return '';

        if (deviceInfo.isMobile) {
            return 'pb-32'; // Bottom navigation
        } else if (deviceInfo.isTablet) {
            return 'pl-20'; // Left sidebar
        } else {
            return 'pt-20'; // Top navigation
        }
    };

    const getAppClassName = (device: any) => {
        if (device.isMobile) return 'mobile-app';
        if (device.isTablet) return 'tablet-app';
        return 'desktop-app';
    };

    const getPerformanceIcon = (connectionType: string) => {
        if (connectionType === 'slow-2g' || connectionType === '2g') return '🐌';
        if (connectionType === '3g') return '🚀';
        return '⚡';
    };

    return (
        <div className={`
      min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black
      ${getAppClassName(deviceInfo)}
      ${getPaddingClass()}
    `}>
            {/* Navigation */}
            {showNavigation && <MobileNavigation currentRoute={window.location.pathname} />}

            {/* Main content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Mobile-specific UI */}
            {deviceInfo.isMobile && (
                <>
                    {/* Status bar spacer */}
                    <div className="h-6 bg-black bg-opacity-50 fixed top-0 left-0 right-0 z-50" />

                    {/* Performance mode indicator */}
                    <div className="fixed top-8 right-4 z-30">
                        <div className="bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-xs">
                            {deviceInfo.connectionType === 'slow-2g' || deviceInfo.connectionType === '2g' ? '🐌' :
                                deviceInfo.connectionType === '3g' ? '🚀' : '⚡'}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const MobileComponents = { MobileNavigation, MobileAppContainer };
export default MobileComponents;