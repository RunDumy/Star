<#
consolidate-backend.ps1
Safe consolidation helper to merge `backend/` into `star-backend/` (PowerShell)
if ($LASTEXITCODE -ne 0) { Abort 'Not a git repository. Initialize or run from repo root.' }

    # Step 11: Deploy frontend with Vercel CLI
    Write-Host "Deploying frontend with Vercel"
    cd $frontendDir
    vercel deploy --prod
# consolidate-backend.ps1
# Docker-first consolidation helper to merge `backend/` into `star-backend/` (PowerShell)
# Run from the repository root. This script is interactive and non-destructive.

param(
    [string]$ProjectRoot = (Get-Location).Path,
    [string]$BackendDir = "backend",
    [string]$StarBackendDir = "star-backend",
    [switch]$RunTests
)

function Abort($msg) { Write-Host $msg -ForegroundColor Red; exit 1 }

Set-Location $ProjectRoot
Write-Host "Project root: $ProjectRoot"

# 1) Create backup branch
$backupBranch = "backup-consolidation-$(Get-Date -Format 'yyyyMMdd')"
Write-Host "Creating backup branch: $backupBranch"
# Verify we're in a git repo
git rev-parse --git-dir > $null 2>$null
if ($LASTEXITCODE -ne 0) { Abort 'Not a git repository. Initialize or run from repo root.' }

git checkout -b $backupBranch
if ($LASTEXITCODE -ne 0) { Abort 'Failed to create backup branch.' }

Write-Host "Pushing backup branch to origin (may prompt for credentials)"
git push origin $backupBranch

# Prepare absolute paths
$absBackend = Join-Path $ProjectRoot $BackendDir
$absStarBackend = Join-Path $ProjectRoot $StarBackendDir
if (-not (Test-Path $absBackend)) { Write-Host ("Source backend dir not found: {0}" -f $absBackend) -ForegroundColor Yellow }
if (-not (Test-Path $absStarBackend)) { Abort ("Destination (canonical) backend dir not found: {0}" -f $absStarBackend) }

# 2) Diff the two backend directories (non-index diff)
Write-Host "Running directory diff (git diff --no-index)"
$diff = git --no-pager diff --no-index -- $absBackend $absStarBackend 2>$null
if ($diff) {
    Write-Host ("Differences detected between {0} and {1}:" -f $BackendDir, $StarBackendDir) -ForegroundColor Yellow
    Write-Host $diff
    $proceed = Read-Host "Proceed to copy unique/newer files from $BackendDir -> $StarBackendDir? (Y/N)"
    if ($proceed -ne 'Y') { Write-Host 'Aborting per user request.'; exit 0 }
}
else {
    Write-Host "No diffs detected. Proceeding to ensure any missing files are copied."
}

# 3) Copy unique/updated files
Write-Host "Copying files from $BackendDir -> $StarBackendDir (preserving newer files)"
Get-ChildItem -Path $absBackend -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($absBackend.Length + 1)
    $destPath = Join-Path $absStarBackend $relativePath
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
    if (Test-Path $destPath) {
        $srcTime = $_.LastWriteTime
        $destTime = (Get-Item $destPath).LastWriteTime
        if ($srcTime -gt $destTime) {
            Copy-Item $_.FullName $destPath -Force
            Write-Host "Copied newer $relativePath"
        }
    } else {
        Copy-Item $_.FullName $destPath -Force
        Write-Host "Copied $relativePath"
    }
}

# 4) Move key root-level files into star-backend and star-frontend
Write-Host "Moving root-level backend and frontend files"
$rootBackendFiles = @("main.py", "star_auth.py")
foreach ($file in $rootBackendFiles) {
    $srcPath = Join-Path $ProjectRoot $file
    if (Test-Path $srcPath) {
        $destDir = Join-Path $absStarBackend 'star_backend_flask'
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
        Move-Item $srcPath (Join-Path $destDir $file) -Force
        Write-Host "Moved $file to $destDir"
    }
}
$srcSchema = Join-Path $ProjectRoot 'supabase_schema.sql'
if (Test-Path $srcSchema) {
    $destDir = Join-Path $absStarBackend 'database'
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
    Move-Item $srcSchema (Join-Path $destDir 'supabase_schema.sql') -Force
    Write-Host "Moved supabase_schema.sql to $destDir"
}

$frontendDir = Join-Path $ProjectRoot 'star-frontend'
$rootFrontendFiles = @('next.config.js','package.json','jest.config.js','babel.config.js')
foreach ($file in $rootFrontendFiles) {
    $srcPath = Join-Path $ProjectRoot $file
    if (Test-Path $srcPath) {
        Move-Item $srcPath (Join-Path $frontendDir $file) -Force
        Write-Host "Moved $file to $frontendDir"
    }
}

# 5) Move docker-compose.mcp.yml into config/docker if present
$dockerSrc = Join-Path $ProjectRoot 'docker-compose.mcp.yml'
$dockerDestDir = Join-Path $ProjectRoot 'config\docker'
if (Test-Path $dockerSrc) {
    if (-not (Test-Path $dockerDestDir)) { New-Item -ItemType Directory -Path $dockerDestDir | Out-Null }
    Move-Item $dockerSrc (Join-Path $dockerDestDir 'docker-compose.mcp.yml') -Force
    Write-Host "Moved docker-compose.mcp.yml to $dockerDestDir"
}

# 6) Update .gitignore for large files
Write-Host "Updating .gitignore"
$gitignorePath = Join-Path $ProjectRoot '.gitignore'
$largeFiles = @('*.zip','*.tar.gz','*.exe','*.msi','*.log','*.pyc','__pycache__/','.pytest_cache/','.venv/','node_modules/','.vercel/','.idea/','.vscode/','jre/','old-history/','bfg.jar')
foreach ($pattern in $largeFiles) {
    if (-not (Test-Path $gitignorePath)) { New-Item -Path $gitignorePath -ItemType File | Out-Null }
    if (-not (Select-String -Path $gitignorePath -Pattern "^$([regex]::Escape($pattern))$" -Quiet)) {
        Add-Content -Path $gitignorePath -Value $pattern
        Write-Host "Added $pattern to .gitignore"
    }
}

# 7) Check for large files (>10MB)
Write-Host "Checking for large files (>10MB)"
Get-ChildItem -Path $ProjectRoot -Recurse -File | Where-Object { $_.Length -gt 10MB } | ForEach-Object {
    Write-Host "Warning: Large file found: $($_.FullName) ($([math]::Round($_.Length/1MB,2)) MB)"
}

# 8) Start local Supabase (optional) - use CLI if available
Write-Host "Starting local Supabase (if supabase CLI available)"
Set-Location (Join-Path $absStarBackend 'star_backend_flask')
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    Write-Host "supabase CLI found. Starting local supabase..."
    npm install -g @supabase/cli | Out-Null
    supabase start
    if ($LASTEXITCODE -ne 0) { Abort 'supabase start failed' }
    Write-Host 'Applying supabase schema...'
    supabase db push
    if ($LASTEXITCODE -ne 0) { Abort 'supabase db push failed' }
} else {
    Write-Host 'supabase CLI not found. Skipping supabase start. If using docker compose, ensure you have an env file at config/docker/.env.dev and run docker compose.'
}

# 9) Run tests (run across all tests by default)
if ($RunTests) {
    Write-Host 'Running tests (pytest -q across repo)'
    Set-Location $ProjectRoot
    if (-not (Get-Command pytest -ErrorAction SilentlyContinue)) {
        Abort 'pytest not found. Activate your venv or install pytest in your environment.' }
    pytest -q
    if ($LASTEXITCODE -ne 0) { Abort 'Some tests failed. Please fix before proceeding.' }
}

# 10) Verify with docker-compose dev
Write-Host 'Bringing up docker compose (dev) to verify services'
Set-Location $ProjectRoot
$composeFile = Join-Path $ProjectRoot 'config\docker\docker-compose.dev.yml'
if (-not (Test-Path $composeFile)) { Abort ("Compose file not found: {0}" -f $composeFile) }
# Encourage use of .env.dev copied from example
$envExample = Join-Path $ProjectRoot 'config\docker\.env.dev.example'
$envFile = Join-Path $ProjectRoot 'config\docker\.env.dev'
if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
    Write-Host "No env file found at $envFile. Copying example to .env.dev (update secrets before use)"
    Copy-Item $envExample $envFile -Force
    Write-Host "Edit $envFile and replace placeholders (POSTGRES_PASSWORD, SUPABASE_ANON_KEY)"
}

Write-Host "Starting docker compose (may take a few minutes)..."
docker compose -f $composeFile up --build
if ($LASTEXITCODE -ne 0) { Abort 'docker compose failed. Fix issues and retry.' }

# 11) Optional: Deploy frontend with Vercel CLI (requires login and CLI installed)
Write-Host 'Would you like to deploy the frontend to Vercel now? (Y/N)'
$ans = Read-Host
if ($ans -eq 'Y') {
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) { Abort 'vercel CLI not found. Install with npm i -g vercel' }
    Set-Location (Join-Path $ProjectRoot 'star-frontend')
    vercel deploy --prod
    if ($LASTEXITCODE -ne 0) { Abort 'vercel deploy failed' }
}

# 12) Create PR branch with changes
$prBranch = "consolidate-backend-$(Get-Date -Format 'yyyyMMdd')"
Write-Host "Creating PR branch: $prBranch"
Set-Location $ProjectRoot
    }

    # Step 12: Create PR branch
    Write-Host "Creating PR branch: $prBranch"

Write-Host 'Consolidation complete. Please review changes and open a PR on GitHub.'
Write-Host "If everything looks good, consider deleting the old backend dir: Remove-Item -Recurse -Force $absBackend"
    cd $projectRoot
    git checkout -b $prBranch
    git add .
    git commit -m "Consolidate backend, move files, update .gitignore, run API tests, verify with Docker, deploy frontend"
    git push origin $prBranch

    Write-Host "Done. PR branch: $prBranch"
    Write-Host "Delete $backendDir after review: del /S /Q $backendDir"
    Write-Host "Verify backend: Check star-backend/render.yaml and redeploy on Render"
