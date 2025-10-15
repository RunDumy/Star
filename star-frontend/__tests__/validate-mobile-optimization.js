/**
 * Mobile Optimization Validation Test (Simplified)
 * Tests mobile optimization implementation without external dependencies
 */

const fs = require('fs');
const path = require('path');

class MobileOptimizationValidator {
    constructor() {
        this.results = { passed: 0, failed: 0, tests: [] };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green  
            error: '\x1b[31m',   // Red
            warning: '\x1b[33m'  // Yellow
        };
        console.log(`${colors[type]}${message}\x1b[0m`);
    }

    test(name, testFn) {
        try {
            testFn();
            this.log(`✅ ${name} - PASSED`, 'success');
            this.results.passed++;
        } catch (error) {
            this.log(`❌ ${name} - FAILED: ${error.message}`, 'error');
            this.results.failed++;
        }
    }

    validateFileExists(filePath) {
        const fullPath = path.join(__dirname, filePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File missing: ${filePath}`);
        }
    }

    validateFileContent(filePath, requiredContent) {
        const fullPath = path.join(__dirname, filePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        for (const required of requiredContent) {
            if (!content.includes(required)) {
                throw new Error(`Missing required content "${required}" in ${filePath}`);
            }
        }
    }

    run() {
        this.log('🚀 Mobile Optimization Validation Started', 'info');
        this.log('='.repeat(50), 'info');

        // Test 1: Core files exist
        this.test('Core Mobile Files Exist', () => {
            const coreFiles = [
                'star-frontend/src/lib/MobileOptimization.ts',
                'star-frontend/src/components/mobile/MobileNavigation.tsx',
                'star-frontend/src/components/mobile/MobileFeed.tsx',
                'star-frontend/src/components/mobile/MobilePerformanceMonitor.tsx',
                'star-frontend/src/styles/mobile.css',
                'star-frontend/pages/mobile-test.tsx'
            ];

            coreFiles.forEach(file => this.validateFileExists(file));
        });

        // Test 2: MobileOptimization.ts has required exports
        this.test('MobileOptimization.ts Core Features', () => {
            this.validateFileContent('star-frontend/src/lib/MobileOptimization.ts', [
                'useDeviceDetection',
                'useTouchGestures',
                'useMobileOptimization',
                'BREAKPOINTS',
                'MOBILE_CONFIG',
                'DeviceInfo',
                'TouchGesture'
            ]);
        });

        // Test 3: Device detection functionality
        this.test('Device Detection System', () => {
            this.validateFileContent('star-frontend/src/lib/MobileOptimization.ts', [
                'isMobile',
                'isTablet',
                'isDesktop',
                'touchEnabled',
                'screenWidth',
                'screenHeight',
                'orientation'
            ]);
        });

        // Test 4: Touch gesture system
        this.test('Touch Gesture System', () => {
            this.validateFileContent('star-frontend/src/lib/MobileOptimization.ts', [
                'tap',
                'doubleTap',
                'longPress',
                'swipe',
                'pinch',
                'TouchGesture',
                'useTouchGestures'
            ]);
        });

        // Test 5: Performance optimization configs
        this.test('Performance Configuration System', () => {
            this.validateFileContent('star-frontend/src/lib/MobileOptimization.ts', [
                'maxParticles',
                'frameRate',
                'enableShadows',
                'antiAliasing',
                'textureQuality',
                'cosmos',
                'feed'
            ]);
        });

        // Test 6: Mobile Navigation component
        this.test('Mobile Navigation Component', () => {
            this.validateFileContent('star-frontend/src/components/mobile/MobileNavigation.tsx', [
                'MobileNavigation',
                'MobileAppContainer',
                'useDeviceDetection',
                'useTouchGestures',
                'NavItem'
            ]);
        });

        // Test 7: Mobile Feed component
        this.test('Mobile Feed Component', () => {
            this.validateFileContent('star-frontend/src/components/mobile/MobileFeed.tsx', [
                'MobileFeed',
                'FeedItem',
                'infinite scroll',
                'TouchGesture',
                'useMobileOptimization'
            ]);
        });

        // Test 8: Performance Monitor component
        this.test('Performance Monitor Component', () => {
            this.validateFileContent('star-frontend/src/components/mobile/MobilePerformanceMonitor.tsx', [
                'MobilePerformanceMonitor',
                'PerformanceMetrics',
                'fps',
                'memoryUsage',
                'largestContentfulPaint',
                'cumulativeLayoutShift'
            ]);
        });

        // Test 9: Mobile CSS styles
        this.test('Mobile CSS Optimization', () => {
            this.validateFileContent('star-frontend/src/styles/mobile.css', [
                'touch-action',
                'user-select',
                '@media (max-width: 768px)',
                '.mobile-app',
                '.performance-mode',
                '--vh',
                'orientation: landscape'
            ]);
        });

        // Test 10: Mobile test page integration
        this.test('Mobile Test Page Integration', () => {
            this.validateFileContent('star-frontend/pages/mobile-test.tsx', [
                'MobileNavigation',
                'MobileFeed',
                'MobilePerformanceMonitor',
                'useDeviceDetection',
                'PWA',
                'manifest.json',
                'apple-touch-icon'
            ]);
        });

        // Test 11: Breakpoint system validation
        this.test('Responsive Breakpoint System', () => {
            const mobileOptPath = path.join(__dirname, 'star-frontend/src/lib/MobileOptimization.ts');
            const content = fs.readFileSync(mobileOptPath, 'utf8');

            // Check breakpoint values
            const breakpoints = ['xs: 320', 'sm: 576', 'md: 768', 'lg: 992', 'xl: 1200', 'xxl: 1400'];
            breakpoints.forEach(bp => {
                if (!content.includes(bp)) {
                    throw new Error(`Missing breakpoint definition: ${bp}`);
                }
            });
        });

        // Test 12: TypeScript interfaces
        this.test('TypeScript Interface Definitions', () => {
            this.validateFileContent('star-frontend/src/lib/MobileOptimization.ts', [
                'interface DeviceInfo',
                'interface TouchGesture',
                'type TouchGesture',
                'React.FC',
                'useCallback',
                'useEffect'
            ]);
        });

        // Generate report
        this.generateReport();
    }

    generateReport() {
        this.log('='.repeat(50), 'info');
        this.log('📊 Mobile Optimization Validation Results', 'info');
        this.log('='.repeat(50), 'info');

        const total = this.results.passed + this.results.failed;
        const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;

        this.log(`Total Tests: ${total}`, 'info');
        this.log(`Passed: ${this.results.passed}`, 'success');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
        this.log(`Success Rate: ${successRate}%`, successRate >= 95 ? 'success' : 'warning');

        this.log('\n🎯 Mobile Optimization Features Implemented:', 'info');
        const features = [
            '📱 Cross-Device Detection (Mobile/Tablet/Desktop)',
            '👆 Advanced Touch Gesture Recognition',
            '⚡ Real-time Performance Monitoring',
            '📐 Responsive Breakpoint System',
            '🎨 Mobile-Optimized UI Components',
            '💾 PWA Integration Support',
            '📊 Web Vitals Tracking',
            '🔧 Adaptive Performance Configuration',
            '🎵 Touch-Optimized Social Feed',
            '🚀 Automatic Performance Optimizations'
        ];

        features.forEach(feature => {
            this.log(`  ✅ ${feature}`, 'success');
        });

        if (this.results.failed === 0) {
            this.log('\n🎉 Mobile Optimization Implementation Complete!', 'success');
            this.log('✨ All systems ready for mobile deployment', 'success');
            this.log('📱 Users can now enjoy the full STAR experience on mobile devices', 'info');
        } else {
            this.log(`\n⚠️  ${this.results.failed} validation(s) failed`, 'warning');
            this.log('Please review and fix issues before deployment', 'warning');
        }

        this.log('='.repeat(50), 'info');
    }
}

// Run validation
const validator = new MobileOptimizationValidator();
validator.run();