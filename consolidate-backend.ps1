<#
consolidate-backend.ps1
Safe consolidation helper to merge `backend/` into `star-backend/` (PowerShell)
Run from the repository root. This script is interactive and non-destructive.
#>

param(
    [string]$ProjectRoot = (Get-Location).Path,
    [string]$BackendDir = "backend",
    [string]$StarBackendDir = "star-backend",
    [switch]$RunTests,
    [switch]$DryRun
)

function Abort($msg) { Write-Host $msg -ForegroundColor Red; exit 1 }

Set-Location $ProjectRoot
Write-Host "Project root: $ProjectRoot"

# 1) Create backup branch
$backupBranch = "backup-consolidation-$(Get-Date -Format 'yyyyMMdd')"
git rev-parse --git-dir > $null 2>$null
Write-Host "Creating backup branch: $backupBranch"
# Verify we're in a git repo
git rev-parse --git-dir > $null 2>$null
if ($LASTEXITCODE -ne 0) { Abort 'Not a git repository. Initialize or run from repo root.' }

if (-not $DryRun) {
    git checkout -b $backupBranch
    if ($LASTEXITCODE -ne 0) { Abort 'Failed to create backup branch.' }

    Write-Host "Pushing backup branch to origin (may prompt for credentials)"
    git push origin $backupBranch
} else {
    Write-Host "DryRun: skipping branch creation/push for $backupBranch"
}

# 2) Diff the two backend directories (non-index diff)
$absBackend = Join-Path $ProjectRoot $BackendDir
$absStarBackend = Join-Path $ProjectRoot $StarBackendDir
if (-not (Test-Path $absBackend)) { Write-Host ("Source backend dir not found: {0}" -f $absBackend) -ForegroundColor Yellow }
if (-not (Test-Path $absStarBackend)) { Abort ("Destination (canonical) backend dir not found: {0}" -f $absStarBackend) }

Write-Host "Running directory diff (git diff --no-index)"
$diff = git --no-pager diff --no-index -- $absBackend $absStarBackend 2>$null
if ($diff) {
    Write-Host ("Differences detected between {0} and {1}:" -f $BackendDir, $StarBackendDir) -ForegroundColor Yellow
    Write-Host $diff
    if ($DryRun) {
        Write-Host "DryRun: showing diffs only; no copy actions will be performed."
        exit 0
    }
    $proceed = Read-Host "Proceed to copy unique/newer files from $BackendDir -> $StarBackendDir? (Y/N)"
    if ($proceed -ne 'Y') { Write-Host 'Aborting per user request.'; exit 0 }
}
else {
    Write-Host "No diffs detected. Proceeding to ensure any missing files are copied."
}

# 3) Copy unique/updated files
Write-Host "Copying files from $BackendDir -> $StarBackendDir (preserving newer files)"
Get-ChildItem -Path $absBackend -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($absBackend.Length).TrimStart('\')
    $dest = Join-Path $absStarBackend $rel
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
    if (Test-Path $dest) {
        $srcHash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        $destHash = (Get-FileHash $dest -Algorithm SHA256).Hash
        if ($srcHash -ne $destHash) {
            Write-Host ("Conflict or change: {0}" -f $rel)
            $srcTime = $_.LastWriteTime
            $destTime = (Get-Item $dest).LastWriteTime
            if ($srcTime -gt $destTime) {
                if (-not $DryRun) {
                    Copy-Item -Path $_.FullName -Destination $dest -Force
                    Write-Host ("  Copied newer source -> {0}" -f $rel)
                } else {
                    Write-Host ("  DryRun: would copy newer source -> {0}" -f $rel)
                }
            }
            else {
                Write-Host ("  Destination is newer; skipping {0}" -f $rel)
            }
        }
    }
    else {
        if (-not $DryRun) {
            Copy-Item -Path $_.FullName -Destination $dest -Force
            Write-Host ("  Copied new file -> {0}" -f $rel)
        } else {
            Write-Host ("  DryRun: would copy new file -> {0}" -f $rel)
        }
    }
}

# 4) Stage changes and run tests optionally
Write-Host "Staging copied changes under $StarBackendDir"

git add $StarBackendDir

# Optionally run tests
if ($RunTests) {
    Write-Host "Running backend tests: pytest"
    try {
        & pytest tests/backend
        if ($LASTEXITCODE -ne 0) { Abort 'pytest failed. Inspect tests and fix before committing.' }
    }
    catch {
        Write-Host "pytest not found or failed to run. Ensure your virtualenv is active and pytest installed." -ForegroundColor Yellow
        Abort 'Aborting due to test failure or missing pytest.'
    }

    Write-Host "Running frontend smoke build (npm --prefix)"
    & npm --prefix "$ProjectRoot\star-frontend" run build
    if ($LASTEXITCODE -ne 0) { Abort 'Frontend build failed. Inspect and fix before committing.' }
}

# 5) Create PR branch and commit
$prBranch = "consolidate-backend-$(Get-Date -Format 'yyyyMMdd')"
Write-Host "Creating PR branch: $prBranch"
git checkout -b $prBranch

Write-Host "Committing changes"
git add -A
git commit -m "Consolidate backend/ into star-backend/ (sync unique files)"
if ($LASTEXITCODE -ne 0) { Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow }

git push origin $prBranch

Write-Host "Consolidation complete. Review branch: $prBranch" -ForegroundColor Green
Write-Host ("Manual follow-up: after review, you can delete the old folder: {0}" -f $absBackend)

# 6) Quick path confirmations (informational)
Write-Host ("Confirmed canonical backend path: {0}" -f $absStarBackend)
if (Test-Path (Join-Path $absStarBackend 'star_backend_flask\app.py')) { Write-Host "Found Flask app: star_backend_flask/app.py" }
if (Test-Path (Join-Path $absStarBackend 'star_backend\main.py')) { Write-Host "Found FastAPI app: star_backend/main.py (experimental)" }

Write-Host "If you want the script to auto-delete $BackendDir after review, re-run with --confirm-delete switch (not implemented by default)."

Write-Host "Done."