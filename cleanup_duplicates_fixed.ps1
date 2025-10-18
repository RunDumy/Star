# STAR Platform Safe Duplicate File Cleanup
# This script removes confirmed duplicate files that are safe to delete

Write-Host "STAR Platform Duplicate File Cleanup" -ForegroundColor Yellow
Write-Host ""

$basePath = "c:\Users\fudos\PycharmProjects\Star"
Set-Location $basePath

# Files confirmed safe to remove
$filesToRemove = @(
    "star-backend\requirements_backup\requirements_test.txt",  # Duplicate of requirements in flask dir
    ".next\package.json",                                      # Build artifact
    "star-frontend\.next\package.json",                        # Build artifact  
    "star-frontend\out\package.json"                           # Build artifact
)

Write-Host "Files to be removed:" -ForegroundColor Yellow
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  X $file ($size bytes)" -ForegroundColor Red
    } else {
        Write-Host "  - $file (not found)" -ForegroundColor Gray
    }
}

Write-Host ""
$confirmation = Read-Host "Do you want to proceed with cleanup? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host ""
    Write-Host "Starting cleanup..." -ForegroundColor Green
    
    foreach ($file in $filesToRemove) {
        if (Test-Path $file) {
            try {
                Remove-Item -Path $file -Force
                Write-Host "  OK Removed: $file" -ForegroundColor Green
            } catch {
                Write-Host "  ERROR Failed to remove: $file - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
    Write-Host "Cleanup completed!" -ForegroundColor Green
    
} else {
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- Build artifacts removed (these are regenerated automatically)" -ForegroundColor White
Write-Host "- Duplicate requirements file removed from backup directory" -ForegroundColor White
Write-Host "- Main project files remain untouched" -ForegroundColor White