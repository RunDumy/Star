#!/usr/bin/env node

/**
 * Integration Testing Script for STAR Platform Frontend Components
 * Tests the real-time music sync and analytics dashboard components
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;

// Test configuration
const TEST_CONFIG = {
    frontendDir: 'star-frontend',
    backendDir: 'star-backend/star_backend_flask',
    testTimeout: 30000,
    apiUrl: 'http://localhost:5000',
    frontendUrl: 'http://localhost:3000',
    testUser: {
        username: 'cosmic_tester',
        email: 'test@cosmic.star',
        password: 'CosmicTest123!'
    }
};

// ANSI color codes for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class CosmicIntegrationTester {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.results = [];
        this.backendProcess = null;
        this.frontendProcess = null;
    }

    /**
     * Main test execution
     */
    async run() {
        this.log('🌟 STAR Platform Integration Testing Suite', 'cyan', true);
        this.log('=' + '='.repeat(60), 'cyan');

        try {
            // Pre-flight checks
            await this.preflightChecks();

            // Setup test environment
            await this.setupTestEnvironment();

            // Start services
            await this.startServices();

            // Run component tests
            await this.runComponentTests();

            // Run integration tests
            await this.runIntegrationTests();

            // Generate test report
            this.generateReport();

        } catch (error) {
            this.log(`❌ Test suite failed: ${error.message}`, 'red');
            process.exit(1);
        } finally {
            // Cleanup
            await this.cleanup();
        }
    }

    /**
     * Pre-flight environment checks
     */
    async preflightChecks() {
        this.log('🔍 Running pre-flight checks...', 'blue');

        // Check Node.js version
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            this.addResult('Node.js Version', nodeVersion.includes('v1') ? 'PASS' : 'FAIL', nodeVersion);
        } catch {
            this.addResult('Node.js', 'FAIL', 'Node.js not found');
        }

        // Check Python version
        try {
            const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
            this.addResult('Python Version', pythonVersion.includes('Python 3') ? 'PASS' : 'FAIL', pythonVersion);
        } catch {
            this.addResult('Python', 'FAIL', 'Python not found');
        }

        // Check frontend dependencies
        const frontendPackageJson = path.join(TEST_CONFIG.frontendDir, 'package.json');
        if (fs.existsSync(frontendPackageJson)) {
            this.addResult('Frontend package.json', 'PASS', 'Found');
        } else {
            this.addResult('Frontend package.json', 'FAIL', 'Missing');
        }

        // Check backend requirements
        const backendRequirements = path.join(TEST_CONFIG.backendDir, '../requirements.txt');
        if (fs.existsSync(backendRequirements)) {
            this.addResult('Backend requirements.txt', 'PASS', 'Found');
        } else {
            this.addResult('Backend requirements.txt', 'FAIL', 'Missing');
        }

        // Check environment files
        const frontendEnv = path.join(TEST_CONFIG.frontendDir, '.env.local');
        const backendEnv = path.join(TEST_CONFIG.backendDir, '.env');

        this.addResult('Frontend .env.local', fs.existsSync(frontendEnv) ? 'PASS' : 'WARN', 'Environment file');
        this.addResult('Backend .env', fs.existsSync(backendEnv) ? 'PASS' : 'WARN', 'Environment file');
    }

    /**
     * Setup test environment
     */
    async setupTestEnvironment() {
        this.log('🔧 Setting up test environment...', 'blue');

        // Install frontend dependencies if needed
        try {
            process.chdir(TEST_CONFIG.frontendDir);
            if (!fs.existsSync('node_modules')) {
                this.log('Installing frontend dependencies...', 'yellow');
                execSync('npm install', { stdio: 'inherit' });
            }
            this.addResult('Frontend Dependencies', 'PASS', 'Installed');
        } catch (error) {
            this.addResult('Frontend Dependencies', 'FAIL', error.message);
        } finally {
            process.chdir('..');
        }

        // Install backend dependencies if needed
        try {
            process.chdir(TEST_CONFIG.backendDir);
            this.log('Installing backend dependencies...', 'yellow');
            execSync('pip install -r ../requirements.txt', { stdio: 'inherit' });
            this.addResult('Backend Dependencies', 'PASS', 'Installed');
        } catch (error) {
            this.addResult('Backend Dependencies', 'FAIL', error.message);
        } finally {
            process.chdir('../..');
        }
    }

    /**
     * Start backend and frontend services
     */
    async startServices() {
        this.log('🚀 Starting services...', 'blue');

        // Start backend
        try {
            this.log('Starting backend service...', 'yellow');
            this.backendProcess = spawn('python', ['app.py'], {
                cwd: TEST_CONFIG.backendDir,
                stdio: 'pipe'
            });

            // Wait for backend to be ready
            await this.waitForService(TEST_CONFIG.apiUrl + '/api/health', 'Backend');

        } catch (error) {
            this.addResult('Backend Service', 'FAIL', error.message);
            throw error;
        }

        // Start frontend
        try {
            this.log('Starting frontend service...', 'yellow');
            this.frontendProcess = spawn('npm', ['run', 'dev'], {
                cwd: TEST_CONFIG.frontendDir,
                stdio: 'pipe'
            });

            // Wait for frontend to be ready
            await this.waitForService(TEST_CONFIG.frontendUrl, 'Frontend');

        } catch (error) {
            this.addResult('Frontend Service', 'FAIL', error.message);
            throw error;
        }
    }

    /**
     * Run component unit tests
     */
    async runComponentTests() {
        this.log('🧪 Running component tests...', 'blue');

        try {
            process.chdir(TEST_CONFIG.frontendDir);

            // Run Spotify Player tests
            this.log('Testing Real-time Cosmic Spotify Player...', 'yellow');
            try {
                execSync('npm test -- RealTimeCosmicSpotifyPlayer.test.tsx --watchAll=false', {
                    stdio: 'inherit',
                    timeout: TEST_CONFIG.testTimeout
                });
                this.addResult('Spotify Player Tests', 'PASS', 'All tests passed');
            } catch {
                this.addResult('Spotify Player Tests', 'FAIL', 'Some tests failed');
            }

            // Run Analytics Dashboard tests
            this.log('Testing Enhanced Cosmic Analytics Dashboard...', 'yellow');
            try {
                execSync('npm test -- EnhancedCosmicAnalyticsDashboard.test.tsx --watchAll=false', {
                    stdio: 'inherit',
                    timeout: TEST_CONFIG.testTimeout
                });
                this.addResult('Analytics Dashboard Tests', 'PASS', 'All tests passed');
            } catch {
                this.addResult('Analytics Dashboard Tests', 'FAIL', 'Some tests failed');
            }

        } catch (error) {
            this.addResult('Component Tests', 'FAIL', error.message);
        } finally {
            process.chdir('..');
        }
    }

    /**
     * Run integration tests
     */
    async runIntegrationTests() {
        this.log('🔗 Running integration tests...', 'blue');

        // Test API endpoints
        await this.testApiEndpoints();

        // Test WebSocket connectivity
        await this.testWebSocketConnection();

        // Test service integrations
        await this.testServiceIntegrations();
    }

    /**
     * Test API endpoints
     */
    async testApiEndpoints() {
        this.log('Testing API endpoints...', 'yellow');

        const endpoints = [
            { name: 'Health Check', path: '/api/health', method: 'GET' },
            { name: 'Analytics Dashboard', path: '/api/v1/analytics/dashboard', method: 'GET' },
            { name: 'Real-time Data', path: '/api/v1/analytics/real-time', method: 'GET' },
            { name: 'Spotify Integration', path: '/api/v1/spotify/search', method: 'GET' },
            { name: 'Key Vault Status', path: '/api/v1/admin/keyvault/status', method: 'GET' }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios({
                    method: endpoint.method,
                    url: `${TEST_CONFIG.apiUrl}${endpoint.path}`,
                    timeout: 5000,
                    validateStatus: (status) => status < 500 // Accept any status < 500
                });

                if (response.status < 400) {
                    this.addResult(`API: ${endpoint.name}`, 'PASS', `Status: ${response.status}`);
                } else {
                    this.addResult(`API: ${endpoint.name}`, 'WARN', `Status: ${response.status}`);
                }
            } catch (error) {
                this.addResult(`API: ${endpoint.name}`, 'FAIL', error.message);
            }
        }
    }

    /**
     * Test WebSocket connection
     */
    async testWebSocketConnection() {
        this.log('Testing WebSocket connectivity...', 'yellow');

        // This is a simplified test - in a real scenario you'd use socket.io-client
        try {
            const response = await axios.get(`${TEST_CONFIG.apiUrl}/socket.io/`);
            if (response.status === 200) {
                this.addResult('WebSocket Server', 'PASS', 'Socket.IO endpoint accessible');
            } else {
                this.addResult('WebSocket Server', 'WARN', 'Socket.IO endpoint returned non-200');
            }
        } catch (error) {
            this.addResult('WebSocket Server', 'FAIL', 'Socket.IO endpoint not accessible');
        }
    }

    /**
     * Test service integrations
     */
    async testServiceIntegrations() {
        this.log('Testing service integrations...', 'yellow');

        // Test Supabase database connection
        try {
            const response = await axios.get(`${TEST_CONFIG.apiUrl}/api/v1/system/database-status`);
            this.addResult('Supabase Integration', response.data.healthy ? 'PASS' : 'FAIL', 'Database connectivity');
        } catch {
            this.addResult('Supabase Integration', 'WARN', 'Status endpoint not available');
        }

        // Test Supabase auth integration
        try {
            const response = await axios.get(`${TEST_CONFIG.apiUrl}/api/v1/admin/auth/status`);
            this.addResult('Supabase Auth', response.data.available ? 'PASS' : 'WARN', 'Auth status');
        } catch {
            this.addResult('Supabase Auth', 'WARN', 'Status endpoint not available');
        }
    }

    /**
     * Wait for a service to become available
     */
    async waitForService(url, serviceName, maxAttempts = 30) {
        this.log(`Waiting for ${serviceName} to be ready...`, 'yellow');

        for (let i = 0; i < maxAttempts; i++) {
            try {
                await axios.get(url, { timeout: 2000 });
                this.addResult(`${serviceName} Service`, 'PASS', 'Service started successfully');
                return;
            } catch {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        throw new Error(`${serviceName} service did not start within expected time`);
    }

    /**
     * Add test result
     */
    addResult(test, status, details) {
        this.results.push({ test, status, details });

        if (status === 'PASS') {
            this.passed++;
            this.log(`✅ ${test}: ${details}`, 'green');
        } else if (status === 'WARN') {
            this.skipped++;
            this.log(`⚠️  ${test}: ${details}`, 'yellow');
        } else {
            this.failed++;
            this.log(`❌ ${test}: ${details}`, 'red');
        }
    }

    /**
     * Generate test report
     */
    generateReport() {
        this.log('\n📊 Integration Test Report', 'cyan', true);
        this.log('=' + '='.repeat(60), 'cyan');

        this.log(`\n📈 Test Summary:`, 'blue');
        this.log(`   Passed: ${this.passed}`, 'green');
        this.log(`   Failed: ${this.failed}`, this.failed > 0 ? 'red' : 'green');
        this.log(`   Warnings: ${this.skipped}`, 'yellow');
        this.log(`   Total: ${this.results.length}`);

        // Detailed results by category
        const categories = {
            'Environment': this.results.filter(r => r.test.includes('Version') || r.test.includes('package.json') || r.test.includes('.env')),
            'Dependencies': this.results.filter(r => r.test.includes('Dependencies')),
            'Services': this.results.filter(r => r.test.includes('Service')),
            'Components': this.results.filter(r => r.test.includes('Tests')),
            'API Endpoints': this.results.filter(r => r.test.includes('API:')),
            'Integrations': this.results.filter(r => r.test.includes('Integration') || r.test.includes('WebSocket') || r.test.includes('Supabase'))
        };

        for (const [category, tests] of Object.entries(categories)) {
            if (tests.length > 0) {
                this.log(`\n📋 ${category}:`, 'blue');
                tests.forEach(test => {
                    const icon = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️' : '❌';
                    this.log(`   ${icon} ${test.test}: ${test.details}`);
                });
            }
        }

        // Overall status
        this.log('\n🎯 Overall Status:', 'blue');
        if (this.failed === 0) {
            this.log('🎉 All critical tests passed! STAR Platform is ready for deployment.', 'green', true);
        } else if (this.failed <= 2) {
            this.log('🔧 Minor issues detected. Review failed tests before deployment.', 'yellow', true);
        } else {
            this.log('🚨 Major issues detected. Please fix critical failures before proceeding.', 'red', true);
        }

        // Next steps
        this.log('\n🌟 Next Steps:', 'cyan');
        this.log('   1. Review any failed tests and address issues');
        this.log('   2. Ensure all environment variables are properly configured');
        this.log('   3. Validate Supabase setup for production');
        this.log('   4. Run deployment pipeline when all tests pass');
        this.log('   5. Monitor application performance post-deployment');
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        this.log('\n🧹 Cleaning up test environment...', 'blue');

        if (this.backendProcess) {
            this.backendProcess.kill();
            this.log('Backend process terminated', 'yellow');
        }

        if (this.frontendProcess) {
            this.frontendProcess.kill();
            this.log('Frontend process terminated', 'yellow');
        }
    }

    /**
     * Utility method for colored logging
     */
    log(message, color = 'reset', bold = false) {
        const colorCode = colors[color] || colors.reset;
        const style = bold ? colors.bright : '';
        console.log(`${style}${colorCode}${message}${colors.reset}`);
    }
}

// Execute if run directly
if (require.main === module) {
    const tester = new CosmicIntegrationTester();
    tester.run().catch(error => {
        console.error('❌ Integration testing failed:', error);
        process.exit(1);
    });
}

module.exports = { CosmicIntegrationTester };