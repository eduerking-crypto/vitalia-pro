# Publica apps/web/out en la rama gh-pages (GitHub Pages).
# Uso: powershell -File scripts/publish-pages.ps1
param(
    [string]$RepoUrl = "https://github.com/eduerking-crypto/vitalia-pro.git"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$out  = Join-Path $root "apps/web/out"
if (-not (Test-Path $out)) { throw "No existe apps/web/out. Ejecuta antes el build estático." }

$tmp = Join-Path $env:TEMP ("vitalia-pages-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tmp | Out-Null

Write-Host "-> Preparando rama gh-pages en $tmp..." -ForegroundColor Cyan
Push-Location $tmp
try {
    git init -q
    git remote add origin $RepoUrl
    git checkout -q -b gh-pages
    Copy-Item (Join-Path $out "*") $tmp -Recurse -Force
    New-Item -ItemType File -Path (Join-Path $tmp ".nojekyll") -Force | Out-Null
    git add -A
    git -c user.name="VITALIA Bot" -c user.email="bot@vitalia.health" commit -q -m "deploy: sitio estático"
    git push -f origin gh-pages
} finally {
    Pop-Location
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "OK Publicado en la rama gh-pages" -ForegroundColor Green
