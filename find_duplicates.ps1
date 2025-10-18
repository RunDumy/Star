# Find Duplicate Files Script for STAR Platform
# This script identifies duplicate files by comparing file hashes

Write-Host "=== STAR Platform Duplicate File Finder ===" -ForegroundColor Yellow
Write-Host ""

# Function to get file hash and info
function Get-FileInfo {
    param([string]$Path)
    try {
        $file = Get-Item $Path
        $hash = Get-FileHash $Path -Algorithm SHA256
        return @{
            Path = $Path
            Hash = $hash.Hash
            Size = $file.Length
            LastWrite = $file.LastWriteTime
        }
    } catch {
        return $null
    }
}

# Groups of files to check for duplicates
$fileGroups = @{
    "Requirements Files" = @(
        "requirements.txt",
        "requirements_consolidated.txt", 
        "star-backend\star_backend_flask\requirements.txt",
        "star-backend\star_backend_flask\requirements_backup.txt",
        "star-backend\star_backend_flask\requirements_core.txt",
        "star-backend\star_backend_flask\requirements_no_redis.txt",
        "star-backend\star_backend_flask\requirements_test.txt"
    )
    "Docker Files" = @(
        "Dockerfile",
        "Dockerfile.ci", 
        "star-backend\star_backend_flask\Dockerfile",
        "star-frontend\Dockerfile"
    )
    "Environment Files" = @(
        "star-frontend\.env.azure",
        "star-frontend\.env.development",
        "star-frontend\.env.production",
        "star-frontend\.env.local.example",
        "star-backend\star_backend_flask\.env.production",
        "config\docker\.env.dev",
        "config\docker\.env.dev.example"
    )
    "Package Files" = @(
        "package.json",
        "star-frontend\package.json"
    )
    "App Files" = @(
        "star-backend\star_backend_flask\app.py",
        "star-backend\star_backend_flask\app_production.py",
        "star-backend\star_backend_flask\app_minimal.py", 
        "star-backend\star_backend_flask\app_no_redis.py",
        "star-backend\star_backend_flask\app_test.py"
    )
}

$duplicates = @()
$basePath = "c:\Users\fudos\PycharmProjects\Star"

foreach ($groupName in $fileGroups.Keys) {
    Write-Host "Checking $groupName..." -ForegroundColor Cyan
    
    $fileInfos = @()
    foreach ($relativePath in $fileGroups[$groupName]) {
        $fullPath = Join-Path $basePath $relativePath
        if (Test-Path $fullPath) {
            $info = Get-FileInfo $fullPath
            if ($info) {
                $fileInfos += $info
            }
        } else {
            Write-Host "  File not found: $relativePath" -ForegroundColor Red
        }
    }
    
    # Group by hash to find duplicates
    $hashGroups = $fileInfos | Group-Object Hash
    $duplicateGroups = $hashGroups | Where-Object { $_.Count -gt 1 }
    
    if ($duplicateGroups.Count -gt 0) {
        Write-Host "  Found duplicate groups in ${groupName}:" -ForegroundColor Yellow
        foreach ($group in $duplicateGroups) {
            Write-Host "    Hash: $($group.Name.Substring(0,16))..." -ForegroundColor Magenta
            foreach ($file in $group.Group) {
                $relativePath = $file.Path.Replace($basePath, "").TrimStart("\")
                Write-Host "      - $relativePath (Size: $($file.Size) bytes, Modified: $($file.LastWrite))" -ForegroundColor Gray
            }
            $duplicates += @{
                Group = $groupName
                Hash = $group.Name
                Files = $group.Group
            }
        }
    } else {
        Write-Host "  No duplicates found in ${groupName}" -ForegroundColor Green
    }
    Write-Host ""
}

# Additional checks for backup directories
Write-Host "Checking backup directories..." -ForegroundColor Cyan
$backupDirs = @(
    "star-backend\requirements_backup",
    "archive",
    ".azure"
)

foreach ($dir in $backupDirs) {
    $fullDirPath = Join-Path $basePath $dir
    if (Test-Path $fullDirPath) {
        $fileCount = (Get-ChildItem $fullDirPath -Recurse -File).Count
        Write-Host "  $dir contains $fileCount files" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Yellow
if ($duplicates.Count -eq 0) {
    Write-Host "No exact duplicate files found!" -ForegroundColor Green
} else {
    Write-Host "Found $($duplicates.Count) groups of duplicate files" -ForegroundColor Red
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "1. Keep the main requirements.txt in star-backend/star_backend_flask/" -ForegroundColor White
    Write-Host "2. Remove root-level requirements files if they're not needed" -ForegroundColor White
    Write-Host "3. Consolidate environment files to avoid confusion" -ForegroundColor White
    Write-Host "4. Remove backup app.py files if main app.py is working" -ForegroundColor White
}