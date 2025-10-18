#!/usr/bin/env node

/**
 * Environment Configuration Cleanup and Validation Utility
 * Consolidates duplicate .env files and validates Supabase + Render integration
 */

const fs = require('fs');
const path = require('path');

// Configuration paths
const CONFIG_PATHS = {
    frontend: {
        base: 'star-frontend',
        envLocal: 'star-frontend/.env.local',
        envExample: 'star-frontend/.env.example',
        nextConfig: 'star-frontend/next.config.mjs',
        packageJson: 'star-frontend/package.json'
    },
    backend: {
        base: 'star-backend/star_backend_flask',
        env: 'star-backend/star_backend_flask/.env',
        envExample: 'star-backend/star_backend_flask/.env.example',
        requirements: 'star-backend/requirements.txt',
        appPy: 'star-backend/star_backend_flask/app.py'
    },
    root: {
        dockerCompose: 'docker-compose.yml',
        vercelJson: 'vercel.json',
        readme: 'README.md'
    }
};

// Environment variable validation rules
const ENV_VALIDATION = {
    frontend: {
        required: [
            'NEXT_PUBLIC_API_URL',
            'NEXT_PUBLIC_AGORA_APP_ID',
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ],
        optional: [
            'NEXT_PUBLIC_SOCKET_URL',
            'NEXT_PUBLIC_APP_ENV'
        ]
    },
    backend: {
        required: [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'AGORA_APP_ID',
            'AGORA_APP_CERTIFICATE',
            'SECRET_KEY'
        ],
        supabase: [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
        ],
        spotify: [
            'SPOTIFY_CLIENT_ID',
            'SPOTIFY_CLIENT_SECRET'
        ],
        optional: [
            'IPGEOLOCATION_API_KEY',
            'LOG_LEVEL',
            'FLASK_ENV'
        ]
    }
};

class EnvironmentCleanupUtility {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.duplicateEnvFiles = [];
        this.missingRequired = [];
    }

    /**
     * Main cleanup and validation process
     */
    async run() {
        console.log('🌟 STAR Platform Environment Cleanup & Validation');
        console.log('='.repeat(60));

        try {
            // Step 1: Find and analyze duplicate environment files
            await this.findDuplicateEnvFiles();

            // Step 2: Validate existing environment configurations
            await this.validateEnvironmentFiles();

            // Step 3: Check Supabase integration
            await this.validateSupabaseSetup();

            // Step 4: Validate configuration consistency
            await this.validateConfigurationConsistency();

            // Step 5: Generate consolidated .env files
            await this.generateConsolidatedEnvFiles();

            // Step 6: Output validation report
            this.generateReport();

        } catch (error) {
            console.error('❌ Cleanup process failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * Find duplicate environment files across the project
     */
    async findDuplicateEnvFiles() {
        this.info.push('🔍 Scanning for duplicate environment files...');

        const envFiles = [
            '.env',
            '.env.local',
            '.env.development',
            '.env.production',
            '.env.example'
        ];

        const foundFiles = [];

        // Recursively search for env files
        const searchDir = (dir, depth = 0) => {
            if (depth > 3) return; // Prevent deep recursion

            try {
                const items = fs.readdirSync(dir);

                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);

                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        searchDir(fullPath, depth + 1);
                    } else if (envFiles.includes(item)) {
                        foundFiles.push({
                            file: item,
                            path: fullPath,
                            directory: dir,
                            size: stat.size,
                            modified: stat.mtime
                        });
                    }
                }
            } catch (error) {
                this.warnings.push(`Could not scan directory: ${dir}`);
            }
        };

        searchDir('.');

        // Group by filename to identify duplicates
        const grouped = foundFiles.reduce((acc, file) => {
            if (!acc[file.file]) acc[file.file] = [];
            acc[file.file].push(file);
            return acc;
        }, {});

        // Identify actual duplicates
        for (const [filename, instances] of Object.entries(grouped)) {
            if (instances.length > 1) {
                this.duplicateEnvFiles.push({
                    filename,
                    instances: instances.sort((a, b) => b.modified - a.modified)
                });
            }
        }

        if (this.duplicateEnvFiles.length > 0) {
            this.warnings.push(`Found ${this.duplicateEnvFiles.length} duplicate environment file types`);
        } else {
            this.info.push('✅ No duplicate environment files found');
        }
    }

    /**
     * Validate environment file contents
     */
    async validateEnvironmentFiles() {
        this.info.push('🔧 Validating environment file contents...');

        // Check frontend environment
        await this.validateFrontendEnv();

        // Check backend environment
        await this.validateBackendEnv();
    }

    /**
     * Validate frontend environment configuration
     */
    async validateFrontendEnv() {
        const envPath = CONFIG_PATHS.frontend.envLocal;

        if (!fs.existsSync(envPath)) {
            this.warnings.push(`Frontend .env.local not found: ${envPath}`);
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = this.parseEnvFile(envContent);

        // Check required variables
        for (const required of ENV_VALIDATION.frontend.required) {
            if (!envVars[required]) {
                this.missingRequired.push(`Frontend: ${required}`);
            }
        }

        // Validate API URL format
        if (envVars.NEXT_PUBLIC_API_URL) {
            try {
                new URL(envVars.NEXT_PUBLIC_API_URL);
            } catch {
                this.errors.push('NEXT_PUBLIC_API_URL is not a valid URL');
            }
        }

        this.info.push(`✅ Frontend environment validated (${Object.keys(envVars).length} variables)`);
    }

    /**
     * Validate backend environment configuration
     */
    async validateBackendEnv() {
        const envPath = CONFIG_PATHS.backend.env;

        if (!fs.existsSync(envPath)) {
            this.warnings.push(`Backend .env not found: ${envPath}`);
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = this.parseEnvFile(envContent);

        // Check required variables
        for (const required of ENV_VALIDATION.backend.required) {
            if (!envVars[required]) {
                this.missingRequired.push(`Backend: ${required}`);
            }
        }

        // Check Supabase variables
        const hasSupabaseVars = ENV_VALIDATION.backend.supabase.some(v => envVars[v]);
        if (hasSupabaseVars) {
            for (const supabaseVar of ENV_VALIDATION.backend.supabase) {
                if (!envVars[supabaseVar]) {
                    this.warnings.push(`Missing Supabase variable: ${supabaseVar}`);
                }
            }
        }

        // Validate Supabase URL format
        if (envVars.SUPABASE_URL) {
            try {
                new URL(envVars.SUPABASE_URL);
            } catch {
                this.errors.push('SUPABASE_URL is not a valid URL');
            }
        }

        this.info.push(`✅ Backend environment validated (${Object.keys(envVars).length} variables)`);
    }

    /**
     * Validate Supabase integration setup
     */
    async validateSupabaseSetup() {
        this.info.push('🔐 Validating Supabase integration...');

        // Check if Supabase packages are installed
        const backendRequirements = path.join(CONFIG_PATHS.backend.base, '../requirements.txt');
        if (fs.existsSync(backendRequirements)) {
            const requirements = fs.readFileSync(backendRequirements, 'utf8');

            const supabasePackages = [
                'supabase'
            ];

            for (const pkg of supabasePackages) {
                if (!requirements.includes(pkg)) {
                    this.warnings.push(`Missing Supabase package in requirements.txt: ${pkg}`);
                }
            }
        }

        // Check app.py for Supabase integration
        const appPyPath = CONFIG_PATHS.backend.appPy;
        if (fs.existsSync(appPyPath)) {
            const appContent = fs.readFileSync(appPyPath, 'utf8');

            if (appContent.includes('supabase') || appContent.includes('SupabaseDBHelper')) {
                this.info.push('✅ Supabase integration detected in app.py');
            } else {
                this.warnings.push('Supabase integration not detected in app.py');
            }
        }
    }

    /**
     * Validate configuration consistency across files
     */
    async validateConfigurationConsistency() {
        this.info.push('🔄 Validating configuration consistency...');

        // Check docker-compose.yml for environment consistency
        const dockerComposePath = CONFIG_PATHS.root.dockerCompose;
        if (fs.existsSync(dockerComposePath)) {
            const dockerContent = fs.readFileSync(dockerComposePath, 'utf8');

            // Check for hardcoded URLs that should be environment variables
            if (dockerContent.includes('http://localhost:5000') &&
                !dockerContent.includes('${API_URL}')) {
                this.warnings.push('Docker Compose contains hardcoded API URL');
            }
        }

        // Check Next.js config for consistency
        const nextConfigPath = CONFIG_PATHS.frontend.nextConfig;
        if (fs.existsSync(nextConfigPath)) {
            const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

            if (nextConfig.includes('localhost') && !nextConfig.includes('process.env')) {
                this.warnings.push('Next.js config contains hardcoded URLs');
            }
        }
    }

    /**
     * Generate consolidated environment files
     */
    async generateConsolidatedEnvFiles() {
        this.info.push('📝 Generating consolidated environment files...');

        // Generate frontend .env.example
        const frontendEnvExample = this.generateFrontendEnvExample();
        const frontendExamplePath = CONFIG_PATHS.frontend.envExample;

        if (!fs.existsSync(frontendExamplePath) || this.shouldOverwrite(frontendExamplePath)) {
            fs.writeFileSync(frontendExamplePath, frontendEnvExample);
            this.info.push(`✅ Generated ${frontendExamplePath}`);
        }

        // Generate backend .env.example
        const backendEnvExample = this.generateBackendEnvExample();
        const backendExamplePath = CONFIG_PATHS.backend.envExample;

        if (!fs.existsSync(backendExamplePath) || this.shouldOverwrite(backendExamplePath)) {
            fs.writeFileSync(backendExamplePath, backendEnvExample);
            this.info.push(`✅ Generated ${backendExamplePath}`);
        }
    }

    /**
     * Generate frontend .env.example content
     */
    generateFrontendEnvExample() {
        return `# STAR Platform Frontend Environment Configuration
# Copy this file to .env.local and fill in your actual values

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Agora RTC Configuration
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# App Configuration
NEXT_PUBLIC_APP_ENV=development

# Analytics Configuration (Optional)
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_DEBUG_MODE=false
`;
    }

    /**
     * Generate backend .env.example content
     */
    generateBackendEnvExample() {
        return `# STAR Platform Backend Environment Configuration
# Copy this file to .env and fill in your actual values

# Core Configuration
SECRET_KEY=your-super-secret-key-here
LOG_LEVEL=INFO

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Agora RTC Configuration
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_certificate_here

# Spotify Integration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Additional Services (Optional)
IPGEOLOCATION_API_KEY=your_ipgeolocation_key_here

# Development Configuration
FLASK_ENV=development
FLASK_DEBUG=true
`;
    }

    /**
     * Parse environment file content into key-value pairs
     */
    parseEnvFile(content) {
        const vars = {};
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...valueParts] = trimmed.split('=');
                vars[key.trim()] = valueParts.join('=').trim();
            }
        }

        return vars;
    }

    /**
     * Check if file should be overwritten
     */
    shouldOverwrite(filePath) {
        // For this utility, only overwrite if the file is older than 7 days
        try {
            const stat = fs.statSync(filePath);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return stat.mtime < weekAgo;
        } catch {
            return true;
        }
    }

    /**
     * Generate final validation report
     */
    generateReport() {
        console.log('\n📊 Environment Validation Report');
        console.log('='.repeat(60));

        // Info messages
        if (this.info.length > 0) {
            console.log('\n✅ Information:');
            this.info.forEach(msg => console.log(`   ${msg}`));
        }

        // Warnings
        if (this.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.warnings.forEach(msg => console.log(`   ${msg}`));
        }

        // Errors
        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.errors.forEach(msg => console.log(`   ${msg}`));
        }

        // Missing required variables
        if (this.missingRequired.length > 0) {
            console.log('\n🔴 Missing Required Variables:');
            this.missingRequired.forEach(msg => console.log(`   ${msg}`));
        }

        // Duplicate files
        if (this.duplicateEnvFiles.length > 0) {
            console.log('\n📁 Duplicate Environment Files:');
            this.duplicateEnvFiles.forEach(dup => {
                console.log(`   ${dup.filename}:`);
                dup.instances.forEach((instance, i) => {
                    console.log(`     ${i + 1}. ${instance.path} (${instance.size} bytes, ${instance.modified.toISOString()})`);
                });
            });
        }

        // Summary
        console.log('\n📝 Summary:');
        console.log(`   Errors: ${this.errors.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        console.log(`   Missing Required: ${this.missingRequired.length}`);
        console.log(`   Duplicate File Types: ${this.duplicateEnvFiles.length}`);

        if (this.errors.length === 0 && this.missingRequired.length === 0) {
            console.log('\n🎉 Environment configuration is ready for production deployment!');
        } else {
            console.log('\n🔧 Please address the errors and missing variables before deployment.');
        }

        console.log('\n🌟 Next Steps:');
        console.log('   1. Review and update .env files based on .env.example templates');
        console.log('   2. Set up Supabase project and configure tables');
        console.log('   3. Validate Docker Compose configuration');
        console.log('   4. Run integration tests to verify all connections');
        console.log('   5. Deploy to Vercel (frontend) and Render (backend)');
    }
}

// Execute if run directly
if (require.main === module) {
    const utility = new EnvironmentCleanupUtility();
    utility.run().catch(error => {
        console.error('❌ Utility failed:', error);
        process.exit(1);
    });
}

module.exports = { EnvironmentCleanupUtility };