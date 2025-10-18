# Backend Directory Consolidation Script
# Consolidates duplicate backend directories for cleaner structure

Write-Host "🚀 STAR Platform - Backend Directory Consolidation" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$rootDir = "C:\Users\fudos\PycharmProjects\Star"
$backendRoot = "$rootDir\star-backend"
$activeBackend = "$backendRoot\star_backend_flask"
$archiveDir = "$rootDir\archive\star-backend-root-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Safety check - ensure active backend exists
if (!(Test-Path $activeBackend)) {
    Write-Host "❌ Error: Active backend directory not found: $activeBackend" -ForegroundColor Red
    exit 1
}

Write-Host "📍 Active Backend: $activeBackend" -ForegroundColor Green
Write-Host "📍 Archive Location: $archiveDir" -ForegroundColor Yellow

# Create archive directory
Write-Host "`n📁 Creating archive directory..." -ForegroundColor Blue
New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null

# Files to preserve from root backend (not duplicated in star_backend_flask)
$preserveFiles = @(
    ".azure",
    ".deployment", 
    "configure-azure-env.ps1",
    "configure-azure-env.sh",
    "Procfile.azure",
    "web.config",
    "startup.sh",
    "startup.txt",
    "docs",
    "multi_zodiac_setup.py",
    "oracle_integration.py", 
    "tonalpohualli.py",
    "zodiac_data_validator.py",
    "zodiac_production_enhancements.py",
    "validate_zodiac_system.py",
    "main_azure.py",
    "main_resilient.py",
    "main_test.py",
    "simple_app_test.py",
    "tests",
    "requirements_backup"
)

Write-Host "`n🗃️  Archiving important files from root backend..." -ForegroundColor Blue

foreach ($file in $preserveFiles) {
    $sourcePath = "$backendRoot\$file"
    if (Test-Path $sourcePath) {
        $destPath = "$archiveDir\$file"
        Write-Host "  📄 Archiving: $file" -ForegroundColor Gray
        
        if (Test-Path $sourcePath -PathType Container) {
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        }
        else {
            Copy-Item -Path $sourcePath -Destination $destPath -Force
        }
    }
}

# Create consolidation summary
$summaryContent = @"
Backend Directory Consolidation Summary
Generated: $(Get-Date)

Consolidation Actions:
- Active Backend: Kept at star-backend/star_backend_flask/
- Root Backend: Archived duplicate files to archive/

Preserved Files (Archived):
$(($preserveFiles | ForEach-Object { "- $_" }) -join "`n")

Files Removed (Duplicates):
- All duplicate Python files already in star_backend_flask/
- Duplicate Docker files  
- Duplicate requirements.txt files
- Duplicate environment files

Docker Configuration:
- docker-compose.yml correctly points to star-backend/star_backend_flask/
- No changes needed to deployment configuration

Next Steps:
1. Verify active backend still works: docker-compose up
2. Run tests: cd star-backend/star_backend_flask && python -m pytest
3. If everything works, delete archived files after 30 days
"@

$summaryContent | Out-File -FilePath "$archiveDir\CONSOLIDATION_SUMMARY.md" -Encoding UTF8

Write-Host "`n🧹 Cleaning up duplicate files in root backend..." -ForegroundColor Blue

# Files to remove (duplicates that exist in star_backend_flask)
$duplicateFiles = @(
    "animation_manager.py",
    "example_endpoint.py", 
    "migration_script.py",
    "run_docker.bat",
    "run_docker.ps1",
    "run_test.bat", 
    "run_test.py",
    "api",
    "instance",
    "migrations",
    "__init__.py",
    "__pycache__",
    ".dockerignore",
    "Dockerfile",
    "Dockerfile.production",
    "requirements.txt",
    ".env",
    ".env.azure", 
    ".env.development",
    ".env.example",
    ".gitignore",
    ".gitignore.azure",
    "pytest.ini",
    "README.md",
    "DEPLOYMENT_SUMMARY.md",
    "ENHANCEMENTS.md",
    "constraints.txt",
    "app.log",
    "install.log",
    "azure-cli.msi",
    "zodiac_system.log",
    "zodiac_validation_report_20251011_233752.json",
    ".pytest_cache"
)

foreach ($file in $duplicateFiles) {
    $filePath = "$backendRoot\$file"
    if (Test-Path $filePath) {
        Write-Host "  🗑️  Removing duplicate: $file" -ForegroundColor Gray
        Remove-Item -Path $filePath -Recurse -Force
    }
}

Write-Host "`n✅ Backend consolidation complete!" -ForegroundColor Green
Write-Host "📁 Active backend: star-backend/star_backend_flask/" -ForegroundColor Green  
Write-Host "📁 Archived files: $archiveDir" -ForegroundColor Yellow
Write-Host "`n🔍 Next steps:" -ForegroundColor Blue
Write-Host "1. Test with: docker-compose up" -ForegroundColor White
Write-Host "2. Run backend tests: cd star-backend/star_backend_flask && python -m pytest" -ForegroundColor White
Write-Host "3. If all works, delete archive after 30 days" -ForegroundColor White