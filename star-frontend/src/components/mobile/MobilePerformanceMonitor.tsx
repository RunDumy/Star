/**
 * Mobile Performance Monitor
 * Real-time performance tracking and optimization for STAR platform mobile experience
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDeviceDetection, useMobileOptimization } from '../../lib/MobileOptimization';

// Performance metrics interface
interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    loadTime: number;
    networkType: string;
    batteryLevel?: number;
    isLowPowerMode: boolean;
    renderTime: number;
    scriptLoadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
}

interface MobilePerformanceMonitorProps {
    onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
    showDebugInfo?: boolean;
    autoOptimize?: boolean;
}

export const MobilePerformanceMonitor: React.FC<MobilePerformanceMonitorProps> = ({
    onPerformanceUpdate,
    showDebugInfo = false,
    autoOptimize = true
}) => {
    const deviceInfo = useDeviceDetection();
    const { throttle, debounce } = useMobileOptimization();

    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fps: 60,
        memoryUsage: 0,
        loadTime: 0,
        networkType: 'unknown',
        batteryLevel: undefined,
        isLowPowerMode: false,
        renderTime: 0,
        scriptLoadTime: 0,
        domContentLoaded: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
    });

    const [performanceGrade, setPerformanceGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('A');
    const [recommendations, setRecommendations] = useState<string[]>([]);

    // Performance tracking refs
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const fpsHistory = useRef<number[]>([]);
    const performanceObserver = useRef<PerformanceObserver | null>(null);
    const memoryInterval = useRef<NodeJS.Timeout | null>(null);

    // Calculate FPS
    const calculateFPS = useCallback(() => {
        const now = performance.now();
        const delta = now - lastTime.current;

        if (delta >= 1000) {
            const fps = Math.round((frameCount.current * 1000) / delta);
            fpsHistory.current.push(fps);

            // Keep only last 30 readings
            if (fpsHistory.current.length > 30) {
                fpsHistory.current.shift();
            }

            const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;

            setMetrics(prev => ({ ...prev, fps: Math.round(avgFps) }));
            frameCount.current = 0;
            lastTime.current = now;
        }

        frameCount.current++;
        requestAnimationFrame(calculateFPS);
    }, []);

    // Monitor Web Vitals
    const initWebVitalsMonitoring = useCallback(() => {
        if (typeof window === 'undefined') return;

        // Performance Observer for Core Web Vitals
        if ('PerformanceObserver' in window) {
            performanceObserver.current = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry) => {
                    switch (entry.entryType) {
                        case 'paint':
                            if (entry.name === 'first-contentful-paint') {
                                setMetrics(prev => ({
                                    ...prev,
                                    firstContentfulPaint: Math.round(entry.startTime)
                                }));
                            }
                            break;

                        case 'largest-contentful-paint':
                            setMetrics(prev => ({
                                ...prev,
                                largestContentfulPaint: Math.round(entry.startTime)
                            }));
                            break;

                        case 'layout-shift':
                            if (!(entry as any).hadRecentInput) {
                                setMetrics(prev => ({
                                    ...prev,
                                    cumulativeLayoutShift: prev.cumulativeLayoutShift + (entry as any).value
                                }));
                            }
                            break;

                        case 'first-input':
                            setMetrics(prev => ({
                                ...prev,
                                firstInputDelay: Math.round((entry as any).processingStart - entry.startTime)
                            }));
                            break;
                    }
                });
            });

            // Observe different entry types
            try {
                performanceObserver.current.observe({ entryTypes: ['paint'] });
                performanceObserver.current.observe({ entryTypes: ['largest-contentful-paint'] });
                performanceObserver.current.observe({ entryTypes: ['layout-shift'] });
                performanceObserver.current.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('Some performance observers not supported:', e);
            }
        }

        // Navigation timing
        if (performance.timing) {
            const timing = performance.timing;
            setMetrics(prev => ({
                ...prev,
                loadTime: timing.loadEventEnd - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                renderTime: timing.loadEventEnd - timing.domContentLoadedEventEnd
            }));
        }
    }, []);

    // Monitor memory usage
    const monitorMemory = useCallback(() => {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

            setMetrics(prev => ({
                ...prev,
                memoryUsage: Math.round((usedMB / limitMB) * 100)
            }));
        }
    }, []);

    // Monitor battery and network
    const monitorBatteryAndNetwork = useCallback(async () => {
        // Battery API
        if ('getBattery' in navigator) {
            try {
                const battery = await (navigator as any).getBattery();
                setMetrics(prev => ({
                    ...prev,
                    batteryLevel: Math.round(battery.level * 100),
                    isLowPowerMode: battery.level < 0.2
                }));
            } catch (e) {
                console.warn('Battery API not available:', e);
            }
        }

        // Network Information API
        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        if (connection) {
            setMetrics(prev => ({
                ...prev,
                networkType: connection.effectiveType || 'unknown'
            }));
        }
    }, []);

    // Calculate performance grade
    const calculatePerformanceGrade = useCallback((currentMetrics: PerformanceMetrics) => {
        let score = 100;
        const newRecommendations: string[] = [];

        // FPS scoring
        if (currentMetrics.fps < 30) {
            score -= 30;
            newRecommendations.push('Low frame rate detected - consider reducing visual effects');
        } else if (currentMetrics.fps < 45) {
            score -= 15;
            newRecommendations.push('Frame rate could be improved - optimize animations');
        }

        // Memory scoring
        if (currentMetrics.memoryUsage > 80) {
            score -= 25;
            newRecommendations.push('High memory usage - clear unused resources');
        } else if (currentMetrics.memoryUsage > 60) {
            score -= 10;
            newRecommendations.push('Memory usage is elevated - monitor for leaks');
        }

        // Core Web Vitals scoring
        if (currentMetrics.largestContentfulPaint > 4000) {
            score -= 20;
            newRecommendations.push('Slow loading - optimize images and resources');
        } else if (currentMetrics.largestContentfulPaint > 2500) {
            score -= 10;
            newRecommendations.push('Loading could be faster - compress assets');
        }

        if (currentMetrics.cumulativeLayoutShift > 0.25) {
            score -= 15;
            newRecommendations.push('Layout shifts detected - set image dimensions');
        } else if (currentMetrics.cumulativeLayoutShift > 0.1) {
            score -= 8;
            newRecommendations.push('Minor layout shifts - optimize loading sequence');
        }

        if (currentMetrics.firstInputDelay > 300) {
            score -= 15;
            newRecommendations.push('Slow input response - optimize JavaScript');
        } else if (currentMetrics.firstInputDelay > 100) {
            score -= 8;
            newRecommendations.push('Input delay detected - reduce main thread blocking');
        }

        // Network and battery considerations
        if (currentMetrics.networkType === 'slow-2g' || currentMetrics.networkType === '2g') {
            newRecommendations.push('Slow network detected - enable low-bandwidth mode');
        }

        if (currentMetrics.isLowPowerMode) {
            newRecommendations.push('Low battery detected - reduce background activity');
        }

        // Assign grade
        let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
        if (score >= 90) grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';
        else if (score >= 60) grade = 'D';

        setPerformanceGrade(grade);
        setRecommendations(newRecommendations);

        // Auto-optimization
        if (autoOptimize) {
            applyOptimizations(currentMetrics, newRecommendations);
        }

        return { grade, score, recommendations: newRecommendations };
    }, [autoOptimize]);

    // Apply performance optimizations
    const applyOptimizations = useCallback((currentMetrics: PerformanceMetrics, recs: string[]) => {
        // Reduce quality on poor performance
        if (currentMetrics.fps < 30 || currentMetrics.memoryUsage > 80) {
            document.body.classList.add('performance-mode');

            // Disable non-essential animations
            document.querySelectorAll('.energy-bar-glow').forEach(el => {
                (el as HTMLElement).style.animation = 'none';
            });
        }

        // Low power mode optimizations
        if (currentMetrics.isLowPowerMode) {
            document.body.classList.add('low-power-mode');

            // Reduce update frequency
            clearInterval(memoryInterval.current!);
            memoryInterval.current = setInterval(monitorMemory, 5000); // Slower updates
        }

        // Network optimizations
        if (currentMetrics.networkType === 'slow-2g' || currentMetrics.networkType === '2g') {
            document.body.classList.add('slow-network-mode');

            // Disable auto-playing content
            document.querySelectorAll('video[autoplay]').forEach(video => {
                (video as HTMLVideoElement).pause();
            });
        }
    }, [monitorMemory]);

    // Throttled performance update
    const throttledUpdate = useCallback(
        throttle((newMetrics: PerformanceMetrics) => {
            onPerformanceUpdate?.(newMetrics);
            calculatePerformanceGrade(newMetrics);
        }, 2000),
        [onPerformanceUpdate, calculatePerformanceGrade]
    );

    // Initialize monitoring
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Start FPS monitoring
        requestAnimationFrame(calculateFPS);

        // Start memory monitoring
        memoryInterval.current = setInterval(monitorMemory, 2000);

        // Initialize Web Vitals
        initWebVitalsMonitoring();

        // Monitor battery and network
        monitorBatteryAndNetwork();

        return () => {
            if (performanceObserver.current) {
                performanceObserver.current.disconnect();
            }
            if (memoryInterval.current) {
                clearInterval(memoryInterval.current);
            }
        };
    }, [calculateFPS, monitorMemory, initWebVitalsMonitoring, monitorBatteryAndNetwork]);

    // Update metrics callback
    useEffect(() => {
        throttledUpdate(metrics);
    }, [metrics, throttledUpdate]);

    // Don't render debug info unless requested
    if (!showDebugInfo) {
        return null;
    }

    return (
        <div className="performance-monitor fixed top-4 right-4 z-50 bg-black bg-opacity-80 rounded-lg p-3 text-white text-xs font-mono max-w-xs">
            {/* Performance Grade */}
            <div className="flex items-center justify-between mb-2">
                <span>Performance Grade</span>
                <span className={`
          font-bold text-lg px-2 py-1 rounded
          ${performanceGrade === 'A' ? 'bg-green-600' :
                        performanceGrade === 'B' ? 'bg-yellow-600' :
                            performanceGrade === 'C' ? 'bg-orange-600' :
                                performanceGrade === 'D' ? 'bg-red-600' : 'bg-red-800'}
        `}>
                    {performanceGrade}
                </span>
            </div>

            {/* Core Metrics */}
            <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                    <span>FPS:</span>
                    <span className={metrics.fps >= 50 ? 'text-green-400' : metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>
                        {metrics.fps}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Memory:</span>
                    <span className={metrics.memoryUsage <= 50 ? 'text-green-400' : metrics.memoryUsage <= 75 ? 'text-yellow-400' : 'text-red-400'}>
                        {metrics.memoryUsage}%
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Network:</span>
                    <span>{metrics.networkType}</span>
                </div>

                {metrics.batteryLevel !== undefined && (
                    <div className="flex justify-between">
                        <span>Battery:</span>
                        <span className={metrics.batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}>
                            {metrics.batteryLevel}%
                        </span>
                    </div>
                )}
            </div>

            {/* Web Vitals */}
            <div className="border-t border-gray-600 pt-2 mb-3">
                <div className="text-gray-400 mb-1">Web Vitals</div>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>LCP:</span>
                        <span className={metrics.largestContentfulPaint <= 2500 ? 'text-green-400' : 'text-red-400'}>
                            {Math.round(metrics.largestContentfulPaint)}ms
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>FID:</span>
                        <span className={metrics.firstInputDelay <= 100 ? 'text-green-400' : 'text-red-400'}>
                            {Math.round(metrics.firstInputDelay)}ms
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>CLS:</span>
                        <span className={metrics.cumulativeLayoutShift <= 0.1 ? 'text-green-400' : 'text-red-400'}>
                            {metrics.cumulativeLayoutShift.toFixed(3)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="border-t border-gray-600 pt-2">
                    <div className="text-yellow-400 mb-1">Recommendations:</div>
                    <div className="space-y-1">
                        {recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="text-xs text-gray-300">
                                • {rec}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Device Info */}
            <div className="border-t border-gray-600 pt-2 mt-2 text-gray-400">
                <div>{deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</div>
                <div>{deviceInfo.screenWidth}×{deviceInfo.screenHeight}</div>
            </div>
        </div>
    );
};

/**
 * Performance optimization hook
 */
export const usePerformanceOptimization = () => {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [optimizationsApplied, setOptimizationsApplied] = useState<string[]>([]);

    const handlePerformanceUpdate = useCallback((newMetrics: PerformanceMetrics) => {
        setMetrics(newMetrics);

        // Apply optimizations based on metrics
        const optimizations: string[] = [];

        if (newMetrics.fps < 30) {
            document.body.classList.add('low-fps-mode');
            optimizations.push('Low FPS mode enabled');
        }

        if (newMetrics.memoryUsage > 80) {
            // Trigger garbage collection if available
            if ('gc' in window) {
                (window as any).gc();
                optimizations.push('Garbage collection triggered');
            }
        }

        if (newMetrics.networkType === 'slow-2g') {
            document.body.classList.add('offline-mode');
            optimizations.push('Offline mode enabled');
        }

        setOptimizationsApplied(optimizations);
    }, []);

    return {
        metrics,
        optimizationsApplied,
        handlePerformanceUpdate
    };
};

export default MobilePerformanceMonitor;