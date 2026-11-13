# Compila la web como sitio estático y la copia a apps/mobile/www para el APK.
# Uso:
#   pnpm --filter @vitalia/web build:static
#   powershell -File scripts/build-static.ps1 -BasePath /vitalia-pro -SkipMobileCopy
param(
    [string]$BasePath = "",
    [switch]$SkipMobileCopy
)

$ErrorActionPreference = "Stop"

$root   = Resolve-Path (Join-Path $PSScriptRoot "..")
$web    = Join-Path $root "apps/web"
$api    = Join-Path $web "src/app/api"
$apiOff = Join-Path $web "src/app/_api_offline"
$out    = Join-Path $web "out"
$www    = Join-Path $root "apps/mobile/www"

Write-Host "-> Preparando export estático (basePath: '$BasePath')..." -ForegroundColor Cyan
if (Test-Path $apiOff) { Remove-Item $apiOff -Recurse -Force }
if (Test-Path $out)    { Remove-Item $out -Recurse -Force }

# Las rutas de API no se pueden exportar: se apartan durante el build.
Move-Item $api $apiOff
try {
    Push-Location $web
    $env:STATIC_EXPORT = "true"
    $env:NEXT_PUBLIC_DEMO_MODE = "true"
    if ($BasePath) { $env:STATIC_BASE_PATH = $BasePath } else { Remove-Item Env:STATIC_BASE_PATH -ErrorAction SilentlyContinue }
    pnpm build
    if ($LASTEXITCODE -ne 0) { throw "next build falló" }
} finally {
    Pop-Location
    if (Test-Path $apiOff) { Move-Item $apiOff $api -Force }
    Remove-Item Env:STATIC_EXPORT -ErrorAction SilentlyContinue
}

if (-not (Test-Path $out)) { throw "No se generó la carpeta out/" }
$files = (Get-ChildItem $out -Recurse -File | Measure-Object).Count
Write-Host "OK Export listo: $files archivos en apps/web/out" -ForegroundColor Green

if (-not $SkipMobileCopy) {
    Write-Host "-> Copiando a apps/mobile/www..." -ForegroundColor Cyan
    if (Test-Path $www) { Get-ChildItem $www -Force | Remove-Item -Recurse -Force }
    Copy-Item (Join-Path $out "*") $www -Recurse -Force
    Write-Host "OK APK listo para 'cap sync'" -ForegroundColor Green
}
