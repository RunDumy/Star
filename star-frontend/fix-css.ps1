$content = Get-Content "universal-space.css"
$newContent = @()
for ($i = 0; $i -lt $content.Length; $i++) {
    if ($i -ne 48) { # Skip line 49 (0-based index 48)
        $newContent += $content[$i]
    }
}
$newContent | Set-Content "universal-space.css"
Write-Host "Fixed CSS file by removing extra brace"