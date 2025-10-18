# Bootstraps and starts the Flask backend for local development.
# Usage: Open PowerShell at repo root and run: .\scripts\start-backend.ps1

# Fail fast
$ErrorActionPreference = 'Stop'

function Test-Python {
    Write-Host "Checking for python..."
    if (Get-Command python -ErrorAction SilentlyContinue) {
        return "python"
    }
    if (Get-Command py -ErrorAction SilentlyContinue) {
        return "py"
    }
    Write-Error "Python not found in PATH. Please install Python 3.10+ and ensure 'python' or 'py' is available in PATH."
}

$python = Test-Python

# Create venv if missing
$venvPath = Join-Path $PSScriptRoot "..\.venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment at $venvPath..."
    & $python -m venv "$venvPath"
}

$venvPython = Join-Path $venvPath "Scripts\python.exe"
$venvPip = Join-Path $venvPath "Scripts\pip.exe"
if (-not (Test-Path $venvPython)) {
    Write-Error "Virtual environment Python not found at $venvPython."
}

# Install requirements
Write-Host "Installing Python dependencies (this may take a minute)..."
& $venvPip install -r (Join-Path $PSScriptRoot "..\star-backend\requirements.txt")

# Set minimal env vars for local dev if not set
if (-not $env:SECRET_KEY) { $env:SECRET_KEY = "dev_secret" }
if (-not $env:JWT_SECRET_KEY) { $env:JWT_SECRET_KEY = "dev_jwt_secret" }
if (-not $env:SUPABASE_URL) { $env:SUPABASE_URL = "your_supabase_url_here" }
if (-not $env:SUPABASE_ANON_KEY) { $env:SUPABASE_ANON_KEY = "your_supabase_anon_key_here" }
if (-not $env:ALLOWED_ORIGINS) { $env:ALLOWED_ORIGINS = "http://localhost:3000" }

Write-Host "Starting Flask backend (star-backend/star_backend_flask/app.py) with environment:" -ForegroundColor Cyan
Write-Host "  SECRET_KEY = $env:SECRET_KEY"
Write-Host "  JWT_SECRET_KEY = $env:JWT_SECRET_KEY"
Write-Host "  SUPABASE_URL = $env:SUPABASE_URL"
Write-Host "  SUPABASE_ANON_KEY = [HIDDEN]"
Write-Host "  ALLOWED_ORIGINS = $env:ALLOWED_ORIGINS"

# Start the backend (foreground)
Push-Location (Join-Path $PSScriptRoot "..\star-backend\star_backend_flask")
& $venvPython .\app.py
Pop-Location
