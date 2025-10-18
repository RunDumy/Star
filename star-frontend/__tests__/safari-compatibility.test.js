/**
 * Safari/iOS CSS Compatibility Test
 * Tests CSS vendor prefixes and Safari-specific properties
 */

const fs = require('fs');
const path = require('path');

class SafariCompatibilityTester {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.testCount = 0;
        this.passCount = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    test(name, testFn) {
        this.testCount++;
        try {
            this.log(`Running test: ${name}`, 'info');
            testFn.call(this);
            this.passCount++;
            this.log(`Test passed: ${name}`, 'success');
        } catch (error) {
            this.errors.push({ test: name, error: error.message });
            this.log(`Test failed: ${name} - ${error.message}`, 'error');
        }
    }

    validateFileContent(filePath, requiredFeatures) {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = fs.readFileSync(fullPath, 'utf8');

        for (const feature of requiredFeatures) {
            if (!content.includes(feature)) {
                throw new Error(`Missing required feature: ${feature}`);
            }
        }
    }

    validateCSSVendorPrefixes(filePath) {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`CSS file not found: ${filePath}`);
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const issues = [];

        // Check for unprefixed transforms
        const transformMatch = content.match(/[^-\w]transform:\s*([^;]+)/g);
        if (transformMatch) {
            transformMatch.forEach(match => {
                const webkitVersion = match.replace('transform:', '-webkit-transform:');
                if (!content.includes(webkitVersion)) {
                    issues.push(`Missing -webkit-transform prefix for: ${match}`);
                }
            });
        }

        // Check for unprefixed animations
        const animationMatch = content.match(/[^-\w]animation:\s*([^;]+)/g);
        if (animationMatch) {
            animationMatch.forEach(match => {
                const webkitVersion = match.replace('animation:', '-webkit-animation:');
                if (!content.includes(webkitVersion)) {
                    issues.push(`Missing -webkit-animation prefix for: ${match}`);
                }
            });
        }

        // Check for unprefixed gradients
        const gradientMatch = content.match(/linear-gradient\([^)]+\)|radial-gradient\([^)]+\)/g);
        if (gradientMatch) {
            gradientMatch.forEach(match => {
                const webkitVersion = `-webkit-${match}`;
                // Only warn if this is a standalone gradient without webkit prefix nearby
                const contextIndex = content.indexOf(match);
                const beforeContext = content.substring(Math.max(0, contextIndex - 100), contextIndex);
                if (!beforeContext.includes('-webkit-')) {
                    this.warnings.push(`Consider adding -webkit- prefix for gradient: ${match}`);
                }
            });
        }

        if (issues.length > 0) {
            throw new Error(`CSS compatibility issues: ${issues.join(', ')}`);
        }
    }

    run() {
        this.log('Starting Safari/iOS compatibility tests...', 'info');

        // Test 1: 3D Cosmic CSS Webkit Prefixes
        this.test('3D Cosmic CSS WebKit Prefixes', () => {
            this.validateFileContent('styles/3d-cosmic.css', [
                '-webkit-animation:',
                '-webkit-transform:',
                '-webkit-transform-style:',
                '-webkit-perspective:',
                '-webkit-keyframes',
                '-webkit-radial-gradient'
            ]);
        });

        // Test 2: Mobile CSS Safari Support
        this.test('Mobile CSS Safari Support', () => {
            this.validateFileContent('src/styles/mobile.css', [
                '-webkit-font-smoothing:',
                '-webkit-tap-highlight-color:',
                '-webkit-touch-callout:',
                '-webkit-user-select:',
                '-webkit-appearance:',
                'appearance:',
                'env(safe-area-inset-top)',
                'env(safe-area-inset-bottom)'
            ]);
        });

        // Test 3: iOS Specific Styles
        this.test('iOS Specific Styles', () => {
            this.validateFileContent('src/styles/mobile.css', [
                '.ios .mobile-app',
                'overscroll-behavior:',
                'scroll-behavior:',
                '-webkit-fill-available',
                '.ios input',
                '.ios .cosmic-gradient'
            ]);
        });

        // Test 4: Comprehensive CSS Vendor Prefix Check
        this.test('3D CSS Vendor Prefix Validation', () => {
            this.validateCSSVendorPrefixes('styles/3d-cosmic.css');
        });

        this.test('Mobile CSS Vendor Prefix Validation', () => {
            this.validateCSSVendorPrefixes('src/styles/mobile.css');
        });

        // Test 5: Safari Features Detection
        this.test('Safari Features Detection', () => {
            this.validateFileContent('src/lib/MobileOptimization.ts', [
                'isIOS',
                'supportsWebGL',
                'devicePixelRatio',
                'touchEnabled',
                'ontouchstart'
            ]);
        });

        // Test 6: Mobile Viewport Handling
        this.test('Mobile Viewport Handling', () => {
            this.validateFileContent('src/styles/mobile.css', [
                '--vh:',
                'calc(var(--vh',
                'height: -webkit-fill-available'
            ]);
        });

        // Summary
        this.log('=== Safari Compatibility Test Summary ===', 'info');
        this.log(`Total tests: ${this.testCount}`, 'info');
        this.log(`Passed: ${this.passCount}`, 'success');
        this.log(`Failed: ${this.errors.length}`, this.errors.length > 0 ? 'error' : 'success');
        this.log(`Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'warning' : 'success');

        if (this.errors.length > 0) {
            this.log('Errors:', 'error');
            this.errors.forEach(error => {
                this.log(`  - ${error.test}: ${error.error}`, 'error');
            });
        }

        if (this.warnings.length > 0) {
            this.log('Warnings:', 'warning');
            this.warnings.forEach(warning => {
                this.log(`  - ${warning}`, 'warning');
            });
        }

        const success = this.errors.length === 0;
        this.log(`Safari compatibility test ${success ? 'PASSED' : 'FAILED'}`, success ? 'success' : 'error');

        return success;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new SafariCompatibilityTester();
    const success = tester.run();
    process.exit(success ? 0 : 1);
}

module.exports = { SafariCompatibilityTester };