$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$StagingPath = Join-Path $ProjectRoot ".lambda-package"
$ZipPath = Join-Path $ProjectRoot "umg-image-resizer.zip"

Write-Host "1/5 Compilando TypeScript..."
Push-Location $ProjectRoot
try {
    npm run build

    if (Test-Path -LiteralPath $StagingPath) {
        Remove-Item -LiteralPath $StagingPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $StagingPath | Out-Null

    Write-Host "2/5 Copiando archivos compilados..."
    Copy-Item -Path (Join-Path $ProjectRoot "dist\*") -Destination $StagingPath -Recurse
    Copy-Item -LiteralPath (Join-Path $ProjectRoot "package.json") -Destination $StagingPath
    Copy-Item -LiteralPath (Join-Path $ProjectRoot "package-lock.json") -Destination $StagingPath

    Write-Host "3/5 Instalando dependencias de producción para Linux x64 (glibc)..."
    Push-Location $StagingPath
    try {
        npm ci --omit=dev --os=linux --cpu=x64 --libc=glibc
        $SharpLinuxBinary = Join-Path $StagingPath "node_modules\@img\sharp-linux-x64"
        $LibvipsLinuxBinary = Join-Path $StagingPath "node_modules\@img\sharp-libvips-linux-x64"
        if (-not (Test-Path -LiteralPath $SharpLinuxBinary) -or -not (Test-Path -LiteralPath $LibvipsLinuxBinary)) {
            throw "No se encontraron los binarios Linux x64 de Sharp en node_modules/@img."
        }
        Write-Host "Binarios Sharp y libvips para Linux x64 incluidos correctamente."
    }
    finally {
        Pop-Location
    }

    Remove-Item -LiteralPath (Join-Path $StagingPath "package.json") -Force
    Remove-Item -LiteralPath (Join-Path $StagingPath "package-lock.json") -Force

    if (Test-Path -LiteralPath $ZipPath) {
        Remove-Item -LiteralPath $ZipPath -Force
    }

    Write-Host "4/5 Creando archivo ZIP..."
    Compress-Archive -Path (Join-Path $StagingPath "*") -DestinationPath $ZipPath -CompressionLevel Optimal

    Write-Host "5/5 Paquete creado: $ZipPath"
    Write-Host "Configure Lambda con arquitectura x86_64 y handler index.handler."
}
finally {
    Pop-Location
}
