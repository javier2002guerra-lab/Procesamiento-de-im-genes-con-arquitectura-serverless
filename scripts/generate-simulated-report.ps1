$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$EdgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$MockHtml = Join-Path $ProjectRoot "evidence\mockups\mock-capture.html"
$ReportHtml = Join-Path $ProjectRoot "docs\informe-academico-simulado.html"
$ScreenshotsPath = Join-Path $ProjectRoot "evidence\screenshots"
$PdfPath = Join-Path $ProjectRoot "docs\informe-academico-simulado.pdf"
$ProfileRoot = Join-Path $env:TEMP "umg-serverless-edge"

if (-not (Test-Path -LiteralPath $EdgePath)) {
    throw "No se encontró Microsoft Edge en $EdgePath"
}

Push-Location $ProjectRoot
try {
    npm run build
    npm run evidence:images
    New-Item -ItemType Directory -Force -Path $ScreenshotsPath | Out-Null

    $MockUri = (New-Object System.Uri((Resolve-Path $MockHtml).Path)).AbsoluteUri
    for ($Index = 1; $Index -le 16; $Index++) {
        $Output = Join-Path $ScreenshotsPath ("captura-{0:D2}.png" -f $Index)
        $Profile = "$ProfileRoot-capture-$Index"
        $PreviousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "SilentlyContinue"
        & $EdgePath --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 `
            --user-data-dir="$Profile" --screenshot="$Output" "$MockUri`?capture=$Index" 2>$null | Out-Null
        $EdgeExitCode = $LASTEXITCODE
        $ErrorActionPreference = $PreviousErrorActionPreference
        if ($EdgeExitCode -ne 0) {
            throw "Microsoft Edge falló al generar la captura $Index (código $EdgeExitCode)."
        }
        if (-not (Test-Path -LiteralPath $Output)) {
            throw "No se pudo generar la captura $Index."
        }
    }

    $ReportUri = (New-Object System.Uri((Resolve-Path $ReportHtml).Path)).AbsoluteUri
    $PreviousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    & $EdgePath --headless=new --disable-gpu --no-pdf-header-footer `
        --user-data-dir="$ProfileRoot-pdf" --print-to-pdf="$PdfPath" "$ReportUri" 2>$null | Out-Null
    $EdgeExitCode = $LASTEXITCODE
    $ErrorActionPreference = $PreviousErrorActionPreference
    if ($EdgeExitCode -ne 0) {
        throw "Microsoft Edge falló al generar el PDF (código $EdgeExitCode)."
    }

    if (-not (Test-Path -LiteralPath $PdfPath)) {
        throw "No se pudo generar el PDF."
    }

    Write-Host "Informe generado: $PdfPath"
}
finally {
    Pop-Location
}
