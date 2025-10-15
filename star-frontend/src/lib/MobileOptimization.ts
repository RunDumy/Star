/**
 * Mobile Optimization Utilities for STAR Platform
 * Responsive design helpers, touch gesture handlers, and mobile-specific optimizations
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

// Device detection and viewport utilities
export interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    screenWidth: number;
    screenHeight: number;
    orientation: 'portrait' | 'landscape';
    touchEnabled: boolean;
    devicePixelRatio: number;
    isIOS: boolean;
    isAndroid: boolean;
    supportsWebGL: boolean;
    connectionType?: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
}

// Breakpoints for responsive design
export const BREAKPOINTS = {
    xs: 320,    // Small mobile
    sm: 576,    // Mobile
    md: 768,    // Tablet
    lg: 992,    // Desktop
    xl: 1200,   // Large desktop
    xxl: 1400   // Extra large desktop
} as const;

// Mobile-optimized component configurations
export const MOBILE_CONFIG = {
    // 3D Cosmos optimizations
    cosmos: {
        mobile: {
            maxParticles: 100,
            renderDistance: 50,
            frameRate: 30,
            enableShadows: false,
            antiAliasing: false,
            textureQuality: 0.5,
            enablePostProcessing: false,
        },
        tablet: {
            maxParticles: 200,
            renderDistance: 75,
            frameRate: 45,
            enableShadows: true,
            antiAliasing: false,
            textureQuality: 0.75,
            enablePostProcessing: false,
        },
        desktop: {
            maxParticles: 500,
            renderDistance: 100,
            frameRate: 60,
            enableShadows: true,
            antiAliasing: true,
            textureQuality: 1.0,
            enablePostProcessing: true,
        }
    },

    // Feed optimizations
    feed: {
        mobile: {
            itemsPerPage: 5,
            imageQuality: 'low',
            autoplayVideos: false,
            preloadImages: 1,
            infiniteScrollThreshold: 0.9,
        },
        tablet: {
            itemsPerPage: 8,
            imageQuality: 'medium',
            autoplayVideos: false,
            preloadImages: 2,
            infiniteScrollThreshold: 0.8,
        },
        desktop: {
            itemsPerPage: 12,
            imageQuality: 'high',
            autoplayVideos: true,
            preloadImages: 3,
            infiniteScrollThreshold: 0.7,
        }
    },

    // Touch gesture configurations
    gestures: {
        tap: { maxTime: 200, maxDistance: 10 },
        doubleTap: { maxInterval: 300, maxDistance: 20 },
        longPress: { minTime: 500, maxDistance: 10 },
        swipe: { minDistance: 50, maxTime: 300 },
        pinch: { minScale: 0.5, maxScale: 3.0 },
        rotate: { minAngle: 15 }
    }
} as const;

/**
 * Hook for device detection and responsive behavior
 */
export const useDeviceDetection = (): DeviceInfo => {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        touchEnabled: false,
        devicePixelRatio: 1,
        isIOS: false,
        isAndroid: false,
        supportsWebGL: false,
        connectionType: 'unknown'
    });

    useEffect(() => {
        const detectDevice = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const userAgent = navigator.userAgent;

            // Device type detection
            const isMobile = width < BREAKPOINTS.md;
            const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
            const isDesktop = width >= BREAKPOINTS.lg;

            // OS detection
            const isIOS = /iPad|iPhone|iPod/.test(userAgent);
            const isAndroid = /Android/.test(userAgent);

            // Touch detection
            const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            // WebGL detection
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            const supportsWebGL = !!gl;

            // Network detection
            const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
            const connectionType = connection?.effectiveType || 'unknown';

            setDeviceInfo({
                isMobile,
                isTablet,
                isDesktop,
                screenWidth: width,
                screenHeight: height,
                orientation: width > height ? 'landscape' : 'portrait',
                touchEnabled,
                devicePixelRatio: window.devicePixelRatio || 1,
                isIOS,
                isAndroid,
                supportsWebGL,
                connectionType
            });
        };

        // Initial detection
        detectDevice();

        // Listen for resize and orientation changes
        window.addEventListener('resize', detectDevice);
        window.addEventListener('orientationchange', detectDevice);

        return () => {
            window.removeEventListener('resize', detectDevice);
            window.removeEventListener('orientationchange', detectDevice);
        };
    }, []);

    return deviceInfo;
};

/**
 * Hook for responsive values based on screen size
 */
export const useResponsiveValue = <T>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    xxl?: T;
}): T | undefined => {
    const { screenWidth } = useDeviceDetection();

    if (screenWidth >= BREAKPOINTS.xxl && values.xxl !== undefined) return values.xxl;
    if (screenWidth >= BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
    if (screenWidth >= BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
    if (screenWidth >= BREAKPOINTS.md && values.md !== undefined) return values.md;
    if (screenWidth >= BREAKPOINTS.sm && values.sm !== undefined) return values.sm;
    if (values.xs !== undefined) return values.xs;

    // Return the largest available value if no specific match
    const availableValues = Object.entries(values).filter(([, value]) => value !== undefined);
    return availableValues.length > 0 ? availableValues[availableValues.length - 1][1] : undefined;
};

/**
 * Touch gesture detection hook
 */
export interface TouchGesture {
    type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'rotate';
    startPoint: { x: number; y: number };
    endPoint?: { x: number; y: number };
    distance?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    scale?: number;
    rotation?: number;
    preventDefault: () => void;
}

export const useTouchGestures = (
    onGesture: (gesture: TouchGesture) => void,
    options: Partial<typeof MOBILE_CONFIG.gestures> = {}
) => {
    const config = useMemo(() => ({ ...MOBILE_CONFIG.gestures, ...options }), [options]);
    const [touchState, setTouchState] = useState({
        startTime: 0,
        startPoint: { x: 0, y: 0 },
        currentPoint: { x: 0, y: 0 },
        touches: [] as Touch[],
        lastTap: 0
    });

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        const now = Date.now();

        setTouchState({
            startTime: now,
            startPoint: { x: touch.clientX, y: touch.clientY },
            currentPoint: { x: touch.clientX, y: touch.clientY },
            touches: Array.from(e.touches),
            lastTap: touchState.lastTap
        });

        // Long press detection
        setTimeout(() => {
            const distance = Math.sqrt(
                Math.pow(touchState.currentPoint.x - touchState.startPoint.x, 2) +
                Math.pow(touchState.currentPoint.y - touchState.startPoint.y, 2)
            );

            if (distance <= config.longPress.maxDistance && Date.now() - touchState.startTime >= config.longPress.minTime) {
                onGesture({
                    type: 'longPress',
                    startPoint: touchState.startPoint,
                    endPoint: touchState.currentPoint,
                    distance,
                    duration: Date.now() - touchState.startTime,
                    preventDefault: () => e.preventDefault()
                });
            }
        }, config.longPress.minTime);
    }, [config, onGesture, touchState]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        const touch = e.touches[0];
        setTouchState(prev => ({
            ...prev,
            currentPoint: { x: touch.clientX, y: touch.clientY },
            touches: Array.from(e.touches)
        }));

        // Pinch gesture detection
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );

            // Calculate scale and rotation (simplified)
            const scale = distance / 100; // Normalize scale

            onGesture({
                type: 'pinch',
                startPoint: { x: touch1.clientX, y: touch1.clientY },
                endPoint: { x: touch2.clientX, y: touch2.clientY },
                scale: Math.max(config.pinch.minScale, Math.min(config.pinch.maxScale, scale)),
                preventDefault: () => e.preventDefault()
            });
        }
    }, [config, onGesture]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        const now = Date.now();
        const duration = now - touchState.startTime;
        const distance = Math.sqrt(
            Math.pow(touchState.currentPoint.x - touchState.startPoint.x, 2) +
            Math.pow(touchState.currentPoint.y - touchState.startPoint.y, 2)
        );

        // Tap detection
        if (duration <= config.tap.maxTime && distance <= config.tap.maxDistance) {
            // Double tap detection
            if (now - touchState.lastTap <= config.doubleTap.maxInterval) {
                onGesture({
                    type: 'doubleTap',
                    startPoint: touchState.startPoint,
                    endPoint: touchState.currentPoint,
                    distance,
                    duration,
                    preventDefault: () => e.preventDefault()
                });
            } else {
                onGesture({
                    type: 'tap',
                    startPoint: touchState.startPoint,
                    endPoint: touchState.currentPoint,
                    distance,
                    duration,
                    preventDefault: () => e.preventDefault()
                });
            }

            setTouchState(prev => ({ ...prev, lastTap: now }));
        }

        // Swipe detection
        else if (distance >= config.swipe.minDistance && duration <= config.swipe.maxTime) {
            const deltaX = touchState.currentPoint.x - touchState.startPoint.x;
            const deltaY = touchState.currentPoint.y - touchState.startPoint.y;

            let direction: 'up' | 'down' | 'left' | 'right';
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }

            onGesture({
                type: 'swipe',
                startPoint: touchState.startPoint,
                endPoint: touchState.currentPoint,
                distance,
                duration,
                direction,
                preventDefault: () => e.preventDefault()
            });
        }
    }, [config, onGesture, touchState]);

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd
    };
};

/**
 * Mobile performance optimization hook
 */
export const useMobileOptimization = () => {
    const deviceInfo = useDeviceDetection();

    // Get optimized configuration based on device
    const getCosmosConfig = useCallback(() => {
        if (deviceInfo.isMobile) {
            return MOBILE_CONFIG.cosmos.mobile;
        } else if (deviceInfo.isTablet) {
            return MOBILE_CONFIG.cosmos.tablet;
        } else {
            return MOBILE_CONFIG.cosmos.desktop;
        }
    }, [deviceInfo]);

    const getFeedConfig = useCallback(() => {
        if (deviceInfo.isMobile) {
            return MOBILE_CONFIG.feed.mobile;
        } else if (deviceInfo.isTablet) {
            return MOBILE_CONFIG.feed.tablet;
        } else {
            return MOBILE_CONFIG.feed.desktop;
        }
    }, [deviceInfo]);

    // Throttle function for performance
    const throttle = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): T => {
        let inThrottle: boolean;
        return ((...args: any[]) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }) as T;
    }, []);

    // Debounce function for performance
    const debounce = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): T => {
        let timeoutId: NodeJS.Timeout;
        return ((...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        }) as T;
    }, []);

    // Image lazy loading helper
    const createLazyImage = useCallback((src: string, placeholder?: string) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;

            // Load lower quality on mobile
            if (deviceInfo.isMobile && src.includes('?')) {
                img.src = src + '&quality=70&format=webp';
            } else if (deviceInfo.isMobile) {
                img.src = src + '?quality=70&format=webp';
            } else {
                img.src = src;
            }
        });
    }, [deviceInfo]);

    return {
        deviceInfo,
        getCosmosConfig,
        getFeedConfig,
        throttle,
        debounce,
        createLazyImage,

        // Performance helpers
        shouldReduceMotion: deviceInfo.isMobile && deviceInfo.connectionType === 'slow-2g',
        shouldPreloadImages: !deviceInfo.isMobile || deviceInfo.connectionType === '4g',
        maxConcurrentRequests: deviceInfo.isMobile ? 2 : 6,
        enableVirtualization: deviceInfo.isMobile,
    };
};

/**
 * PWA (Progressive Web App) utilities
 */
export const usePWA = () => {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebApp = 'standalone' in window.navigator && (window.navigator as any).standalone;
        setIsInstalled(isStandalone || isInWebApp);

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPrompt) return false;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setIsInstallable(false);
        }

        setDeferredPrompt(null);
        return outcome === 'accepted';
    }, [deferredPrompt]);

    return {
        isInstallable,
        isInstalled,
        installApp
    };
};

/**
 * Mobile-specific CSS classes generator
 */
export const generateMobileClasses = (deviceInfo: DeviceInfo): string => {
    const classes = [];

    if (deviceInfo.isMobile) classes.push('mobile');
    if (deviceInfo.isTablet) classes.push('tablet');
    if (deviceInfo.isDesktop) classes.push('desktop');
    if (deviceInfo.touchEnabled) classes.push('touch-enabled');
    if (deviceInfo.isIOS) classes.push('ios');
    if (deviceInfo.isAndroid) classes.push('android');
    if (deviceInfo.orientation === 'portrait') classes.push('portrait');
    if (deviceInfo.orientation === 'landscape') classes.push('landscape');
    if (deviceInfo.devicePixelRatio >= 2) classes.push('high-dpi');
    if (!deviceInfo.supportsWebGL) classes.push('no-webgl');

    return classes.join(' ');
};

/**
 * Mobile viewport utilities
 */
export const setMobileViewport = () => {
    // Prevent zoom on iOS
    document.addEventListener('touchmove', (e: TouchEvent) => {
        if ((e as any).scale && (e as any).scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Handle viewport height on mobile (account for address bar)
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
};

const MobileOptimization = {
    useDeviceDetection,
    useResponsiveValue,
    useTouchGestures,
    useMobileOptimization,
    usePWA,
    generateMobileClasses,
    setMobileViewport,
    BREAKPOINTS,
    MOBILE_CONFIG
};

export default MobileOptimization;