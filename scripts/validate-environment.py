#!/usr/bin/env python3
"""
STAR Platform Environment Validation Script
Checks if all required environment variables are properly configured
"""

import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple


class EnvironmentValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_count = 0

    def validate_required_vars(self, env_vars: Dict[str, str], category: str) -> None:
        """Validate required environment variables"""
        print(f"\n🔍 Validating {category}...")
        
        for var_name, description in env_vars.items():
            self.total_count += 1
            value = os.getenv(var_name)
            
            if not value:
                self.errors.append(f"❌ {var_name}: {description} (MISSING)")
                print(f"❌ {var_name}: Missing")
            elif value in ['your-secret-key', 'your-api-key', 'change-me']:
                self.warnings.append(f"⚠️  {var_name}: Using default/placeholder value")
                print(f"⚠️  {var_name}: Using placeholder value")
            else:
                self.success_count += 1
                print(f"✅ {var_name}: Configured")

    def validate_optional_vars(self, env_vars: Dict[str, str], category: str) -> None:
        """Validate optional environment variables"""
        print(f"\n🎯 Checking optional {category}...")
        
        for var_name, description in env_vars.items():
            self.total_count += 1
            value = os.getenv(var_name)
            
            if not value:
                print(f"⭕ {var_name}: Not configured (optional)")
            else:
                self.success_count += 1
                print(f"✅ {var_name}: Configured")

    def validate_backend_env(self):
        """Validate backend environment variables"""
        print("=" * 50)
        print("🌟 STAR Platform Backend Environment Validation")
        print("=" * 50)

        # Required variables
        required_vars = {
            'SECRET_KEY': 'Flask secret key for session security',
            'JWT_SECRET_KEY': 'JWT token signing key',
            'AGORA_APP_ID': 'Agora live streaming app ID',
            'AGORA_APP_CERTIFICATE': 'Agora app certificate for token generation'
        }
        self.validate_required_vars(required_vars, "Core Security & Streaming")

        # Database variables
        database_vars = {
            'SUPABASE_URL': 'Supabase project URL',
            'SUPABASE_ANON_KEY': 'Supabase anonymous key',
            'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key (backend only)'
        }
        self.validate_required_vars(database_vars, "Database Configuration")

        # Optional advanced features
        optional_vars = {
            'SPOTIFY_CLIENT_ID': 'Spotify API client ID for cosmic playlists',
            'SPOTIFY_CLIENT_SECRET': 'Spotify API client secret',
            'IPGEOLOCATION_API_KEY': 'IP geolocation service for astrology',
            'REDIS_URL': 'Redis URL for caching and real-time features'
        }
        self.validate_optional_vars(optional_vars, "Advanced Features")

    def validate_frontend_env(self):
        """Validate frontend environment variables"""
        print("\n" + "=" * 50)
        print("🎨 STAR Platform Frontend Environment Validation")
        print("=" * 50)

        # Required frontend variables
        required_frontend_vars = {
            'NEXT_PUBLIC_API_URL': 'Backend API URL for data fetching',
            'NEXT_PUBLIC_AGORA_APP_ID': 'Agora app ID for live streaming'
        }
        self.validate_required_vars(required_frontend_vars, "Core Frontend Config")

        # Optional frontend variables
        optional_frontend_vars = {
            'NEXT_PUBLIC_SPOTIFY_CLIENT_ID': 'Spotify client ID for playlist integration',
            'NEXT_PUBLIC_ENABLE_ANALYTICS': 'Enable analytics tracking',
            'NEXT_PUBLIC_ENABLE_3D_COSMOS': 'Enable 3D cosmic environment'
        }
        self.validate_optional_vars(optional_frontend_vars, "Frontend Features")

    def check_file_existence(self):
        """Check if environment files exist"""
        print("\n" + "=" * 50)
        print("📁 Environment Files Check")
        print("=" * 50)

        files_to_check = [
            ('star-backend/.env', 'Backend environment file'),
            ('star-frontend/.env.local', 'Frontend environment file'),
            ('star-backend/.env.example', 'Backend environment template'),
            ('star-frontend/.env.local.example', 'Frontend environment template')
        ]

        for file_path, description in files_to_check:
            if Path(file_path).exists():
                print(f"✅ {file_path}: {description} exists")
            else:
                print(f"❌ {file_path}: {description} missing")
                self.errors.append(f"Missing file: {file_path}")

    def test_connections(self):
        """Test basic connections and imports"""
        print("\n" + "=" * 50)
        print("🔌 Connection Tests")
        print("=" * 50)

        # Test if we can import required modules
        try:
            import requests
            print("✅ Requests library available")
        except ImportError:
            print("❌ Requests library not installed")
            self.errors.append("Missing dependency: requests")

        # Test API connection
        api_url = os.getenv('NEXT_PUBLIC_API_URL', 'http://localhost:5000')
        try:
            import requests
            response = requests.get(f"{api_url}/api/v1/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ Backend API connection successful: {api_url}")
            else:
                print(f"⚠️  Backend API responded with status: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Backend API connection failed: {e}")
            print("   (This is normal if backend is not running)")

    def generate_report(self):
        """Generate final validation report"""
        print("\n" + "=" * 50)
        print("📊 VALIDATION REPORT")
        print("=" * 50)

        print(f"Total checks: {self.total_count}")
        print(f"✅ Successful: {self.success_count}")
        print(f"❌ Errors: {len(self.errors)}")
        print(f"⚠️  Warnings: {len(self.warnings)}")

        if self.errors:
            print("\n🚨 ERRORS TO FIX:")
            for error in self.errors:
                print(f"  {error}")

        if self.warnings:
            print("\n⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"  {warning}")

        # Calculate score
        score = (self.success_count / max(self.total_count, 1)) * 100
        
        print(f"\n🎯 Configuration Score: {score:.1f}%")
        
        if score >= 90:
            print("🎉 Excellent! Your environment is well configured.")
        elif score >= 70:
            print("👍 Good! Most features should work properly.")
        elif score >= 50:
            print("⚡ Basic functionality available, consider adding optional features.")
        else:
            print("🔧 Needs work. Several core features may not function properly.")

        return len(self.errors) == 0

def main():
    """Main validation function"""
    validator = EnvironmentValidator()
    
    print("🌟 STAR Platform Environment Configuration Validator")
    print("   Checking your development environment setup...\n")

    # Load .env files if they exist
    try:
        from dotenv import load_dotenv

        # Try to load backend .env
        backend_env = Path('star-backend/.env')
        if backend_env.exists():
            load_dotenv(backend_env)
            print("✅ Loaded star-backend/.env")
        
        # Try to load frontend .env.local
        frontend_env = Path('star-frontend/.env.local')
        if frontend_env.exists():
            load_dotenv(frontend_env)
            print("✅ Loaded star-frontend/.env.local")
            
    except ImportError:
        print("⚠️  python-dotenv not installed, checking system environment only")

    # Run validations
    validator.check_file_existence()
    validator.validate_backend_env()
    validator.validate_frontend_env()
    validator.test_connections()
    
    # Generate final report
    success = validator.generate_report()

    if success:
        print("\n🚀 Environment validation passed! Ready to launch STAR platform.")
        return 0
    else:
        print("\n🔧 Please fix the errors above before proceeding.")
        return 1

if __name__ == "__main__":
    sys.exit(main())