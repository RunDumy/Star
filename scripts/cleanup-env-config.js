#!/usr/bin/env node

/**
 * Environment Configuration Cleanup and Validation Utility
 * Consolidates duplicate .env files and validates Azure Key Vault integration
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
        azureYaml: 'azure.yaml',
        readme: 'README.md'
    }
};

// Environment variable validation rules
const ENV_VALIDATION = {
    frontend: {
        required: [
            'NEXT_PUBLIC_API_URL',
            'NEXT_PUBLIC_AGORA_APP_ID'
        ],
        optional: [
            'NEXT_PUBLIC_SOCKET_URL',
            'NEXT_PUBLIC_AZURE_KEY_VAULT_URL',
            'NEXT_PUBLIC_APP_ENV'
        ]
    },
    backend: {
        required: [
            'COSMOS_DB_CONNECTION_STRING',
            'AGORA_APP_ID',
            'AGORA_APP_CERTIFICATE',
            'SECRET_KEY'
        ],
        azure_keyvault: [
            'AZURE_KEY_VAULT_URL',
            'AZURE_CLIENT_ID',
            'AZURE_CLIENT_SECRET',
            'AZURE_TENANT_ID'
        ],
        spotify: [
            'SPOTIFY_CLIENT_ID',
            'SPOTIFY_CLIENT_SECRET'
        ],
        optional: [
            'IPGEOLOCATION_API_KEY',
            'AZURE_STORAGE_CONNECTION_STRING',
            'LOG_LEVEL',
            'NO_REDIS'
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

            // Step 3: Check Azure Key Vault integration
            await this.validateAzureKeyVaultSetup();

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

        // Check Azure Key Vault variables
        const hasKeyVaultVars = ENV_VALIDATION.backend.azure_keyvault.some(v => envVars[v]);
        if (hasKeyVaultVars) {
            for (const keyVaultVar of ENV_VALIDATION.backend.azure_keyvault) {
                if (!envVars[keyVaultVar]) {
                    this.warnings.push(`Missing Azure Key Vault variable: ${keyVaultVar}`);
                }
            }
        }

        // Validate Cosmos DB connection string format
        if (envVars.COSMOS_DB_CONNECTION_STRING) {
            if (!envVars.COSMOS_DB_CONNECTION_STRING.includes('AccountEndpoint=')) {
                this.errors.push('COSMOS_DB_CONNECTION_STRING appears to be invalid');
            }
        }

        this.info.push(`✅ Backend environment validated (${Object.keys(envVars).length} variables)`);
    }

    /**
     * Validate Azure Key Vault integration setup
     */
    async validateAzureKeyVaultSetup() {
        this.info.push('🔐 Validating Azure Key Vault integration...');

        // Check if Azure SDK packages are installed
        const backendRequirements = path.join(CONFIG_PATHS.backend.base, '../requirements.txt');
        if (fs.existsSync(backendRequirements)) {
            const requirements = fs.readFileSync(backendRequirements, 'utf8');

            const azurePackages = [
                'azure-keyvault-secrets',
                'azure-identity',
                'azure-cosmos'
            ];

            for (const pkg of azurePackages) {
                if (!requirements.includes(pkg)) {
                    this.warnings.push(`Missing Azure package in requirements.txt: ${pkg}`);
                }
            }
        }

        // Check app.py for Key Vault integration
        const appPyPath = CONFIG_PATHS.backend.appPy;
        if (fs.existsSync(appPyPath)) {
            const appContent = fs.readFileSync(appPyPath, 'utf8');

            if (appContent.includes('azure.keyvault') || appContent.includes('KeyVaultSecret')) {
                this.info.push('✅ Azure Key Vault integration detected in app.py');
            } else {
                this.warnings.push('Azure Key Vault integration not detected in app.py');
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

# Azure Configuration (Optional)
NEXT_PUBLIC_AZURE_KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
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
NO_REDIS=true

# Azure Cosmos DB
COSMOS_DB_CONNECTION_STRING=AccountEndpoint=https://your-account.documents.azure.com:443/;AccountKey=your-key-here;

# Agora RTC Configuration
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_certificate_here

# Azure Key Vault (Recommended for production)
AZURE_KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
AZURE_CLIENT_ID=your_azure_client_id_here
AZURE_CLIENT_SECRET=your_azure_client_secret_here
AZURE_TENANT_ID=your_azure_tenant_id_here

# Spotify Integration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Additional Services (Optional)
IPGEOLOCATION_API_KEY=your_ipgeolocation_key_here
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your-account;AccountKey=your-key;

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
        console.log('   2. Set up Azure Key Vault for production secrets management');
        console.log('   3. Validate Docker Compose configuration');
        console.log('   4. Run integration tests to verify all connections');
        console.log('   5. Deploy to Azure using the deployment pipeline');
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