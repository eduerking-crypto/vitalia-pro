# Genera los iconos y el splash de Android para VITALIA Pro (sin dependencias externas).
# Uso: powershell -File scripts/generate-icons.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$res = Join-Path $PSScriptRoot "..\apps\mobile\android\app\src\main\res"
if (-not (Test-Path $res)) { throw "No existe $res. Ejecuta antes 'npx cap add android'." }

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $p.AddArc($x, $y, $d, $d, 180, 90)
    $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    return $p
}

function Draw-Heart($g, [float]$size, [float]$offX = 0, [float]$offY = 0, [switch]$Transparent) {
    $s = $size / 1024.0
    if (-not $Transparent) {
        $bg = New-RoundedPath 0 0 1024 1024 220
        $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            (New-Object System.Drawing.Point 0, 0),
            (New-Object System.Drawing.Point 1024, 1024),
            [System.Drawing.ColorTranslator]::FromHtml("#7FA37F"),
            [System.Drawing.ColorTranslator]::FromHtml("#527E86"))
        $g.FillPath($brush, $bg)
        $brush.Dispose(); $bg.Dispose()
    }
    $heart = New-Object System.Drawing.Drawing2D.GraphicsPath
    $heart.StartFigure()
    $heart.AddBezier(512, 830, 512, 830, 150, 600, 150, 380)
    $heart.AddBezier(150, 380, 150, 250, 250, 170, 360, 170)
    $heart.AddBezier(360, 170, 440, 170, 490, 220, 512, 270)
    $heart.AddBezier(512, 270, 534, 220, 584, 170, 664, 170)
    $heart.AddBezier(664, 170, 774, 170, 874, 250, 874, 380)
    $heart.AddBezier(874, 380, 874, 600, 512, 830, 512, 830)
    $heart.CloseFigure()
    $m = New-Object System.Drawing.Drawing2D.Matrix
    $m.Scale($s, $s)
    $m.Translate($offX, $offY)
    $heart.Transform($m)
    $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.FillPath($white, $heart)
    $white.Dispose(); $heart.Dispose(); $m.Dispose()
}

function Save-Icon([int]$size, [string]$path, [switch]$Round, [switch]$Foreground) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($Foreground) {
        # Zona segura del icono adaptativo: el corazón ocupa el 60% central.
        $inner = [float]($size * 0.60)
        Draw-Heart $g $inner (($size - $inner) / 2) (($size - $inner) / 2) -Transparent
    }
    elseif ($Round) {
        $circle = New-Object System.Drawing.Drawing2D.GraphicsPath
        $circle.AddEllipse(0, 0, $size, $size)
        $g.SetClip($circle)
        Draw-Heart $g $size
        $circle.Dispose()
    }
    else {
        Draw-Heart $g $size
    }

    $dir = Split-Path $path -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

$densities = @{ "mdpi" = 48; "hdpi" = 72; "xhdpi" = 96; "xxhdpi" = 144; "xxxhdpi" = 192 }
foreach ($d in $densities.Keys) {
    $base = $densities[$d]
    $dir = Join-Path $res "mipmap-$d"
    Save-Icon $base (Join-Path $dir "ic_launcher.png")
    Save-Icon $base (Join-Path $dir "ic_launcher_round.png") -Round
    Save-Icon ([int]($base * 2.25)) (Join-Path $dir "ic_launcher_foreground.png") -Foreground
}

# Splash: fondo bone con el corazon centrado (un PNG por densidad).
$splashes = @{
    "drawable"              = @(1280, 1920)
    "drawable-port-mdpi"    = @(320, 480)
    "drawable-port-hdpi"    = @(480, 800)
    "drawable-port-xhdpi"   = @(720, 1280)
    "drawable-port-xxhdpi"  = @(1080, 1920)
    "drawable-port-xxxhdpi" = @(1280, 1920)
    "drawable-land-mdpi"    = @(480, 320)
    "drawable-land-hdpi"    = @(800, 480)
    "drawable-land-xhdpi"   = @(1280, 720)
    "drawable-land-xxhdpi"  = @(1920, 1080)
    "drawable-land-xxxhdpi" = @(1920, 1280)
}

foreach ($dirName in $splashes.Keys) {
    $sw = [int]$splashes[$dirName][0]
    $sh = [int]$splashes[$dirName][1]
    $bmp = New-Object System.Drawing.Bitmap($sw, $sh)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#F7F5EF"))
    $logo = [float]([Math]::Min($sw, $sh) * 0.42)
    Draw-Heart $g $logo (($sw - $logo) / 2) (($sh - $logo) / 2)
    $dir = Join-Path $res $dirName
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $bmp.Save((Join-Path $dir "splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

Write-Host "OK Iconos y splash generados en apps/mobile/android/app/src/main/res" -ForegroundColor Green
