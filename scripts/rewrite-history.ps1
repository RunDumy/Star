<#
rewrite-history.ps1

PowerShell helper to safely run BFG or git-filter-repo to remove secrets from git history.

Usage (dry-run):
  .\scripts\rewrite-history.ps1 -RepoUrl "https://github.com/org/repo.git"

To actually apply changes (non-reversible):
  .\scripts\rewrite-history.ps1 -RepoUrl "https://github.com/org/repo.git" -Apply

This script expects a local `replacements.txt` (not committed) in the current working directory.
Do NOT put real secrets into files that will be pushed.
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$RepoUrl,
    [switch]$Apply,
    [ValidateSet('bfg', 'git-filter-repo')]
    [string]$Tool = 'bfg'
)

Set-StrictMode -Version Latest

$tmp = Join-Path $env:TEMP ([Guid]::NewGuid().ToString())
Write-Host "Creating mirror clone in: $tmp"
git clone --mirror $RepoUrl $tmp
Push-Location $tmp

if (-not (Test-Path (Join-Path (Get-Location) 'replacements.txt'))) {
    Write-Host "ERROR: replacements.txt not found in $tmp. Create a local replacements.txt (DO NOT commit it)." -ForegroundColor Red
    Pop-Location
    exit 1
}

if ($Tool -eq 'bfg') {
    Write-Host "Using BFG to replace text (dry-run unless -Apply passed)"
    if ($Apply) {
        java -jar "$(Resolve-Path ..\..\bfg.jar)" --replace-text replacements.txt
    }
    else {
        Write-Host "DRY RUN: BFG would run: java -jar bfg.jar --replace-text replacements.txt"
    }
}
else {
    Write-Host "Using git-filter-repo to replace text"
    if ($Apply) {
        git filter-repo --replace-text replacements.txt
    }
    else {
        Write-Host "DRY RUN: git filter-repo --replace-text replacements.txt"
    }
}

if ($Apply) {
    Write-Host "Running git reflog expire and gc"
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive

    Write-Host "Force-pushing cleaned refs to origin"
    git push --force --all origin
    git push --force --tags origin
    Write-Host "DONE: History rewrite applied and pushed. Inform collaborators to re-clone or reset their branches."
}
else {
    Write-Host "DRY RUN complete. To apply the rewrite, run this script with -Apply and ensure you have bfg.jar or git-filter-repo installed." -ForegroundColor Yellow
}

Pop-Location
