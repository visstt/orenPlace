# Полный деплой OrenPlace (Windows / PowerShell)
# Использование: .\scripts\deploy.ps1 [-NoApk] [-NoDocker]
param(
    [switch]$NoApk,
    [switch]$NoDocker
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

# deploy.config: SERVER_IP=...
$configPath = Join-Path $Root "scripts\deploy.config"
$SERVER_IP = "95.105.109.38"
$HTTP_PORT = "29"
if (Test-Path $configPath) {
    Get-Content $configPath | ForEach-Object {
        if ($_ -match '^\s*SERVER_IP=(.+)$') { $SERVER_IP = $Matches[1].Trim() }
        if ($_ -match '^\s*HTTP_PORT=(.+)$') { $HTTP_PORT = $Matches[1].Trim() }
    }
}

$SERVER_URL = if ($HTTP_PORT -eq "80") { "http://$SERVER_IP" } else { "http://${SERVER_IP}:${HTTP_PORT}" }
$API_URL = "$SERVER_URL/api"
$ApkDest = Join-Path $Root "landing\downloads\orenplace.apk"

function Log($msg) { Write-Host "`n▶ $msg" -ForegroundColor Cyan }
function Ok($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }

function Rand-Hex([int]$bytes) {
    $b = New-Object byte[] $bytes
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
    return ([BitConverter]::ToString($b) -replace '-', '').ToLower()
}

function Copy-EnvIfMissing($example, $target) {
    if (-not (Test-Path $target)) {
        Copy-Item $example $target
        Ok "Создан $(Split-Path $target -Leaf) из $(Split-Path $example -Leaf)"
    } else {
        Ok "Уже есть $(Split-Path $target -Leaf)"
    }
}

function Ensure-ProdSecrets {
    $envFile = Join-Path $Root ".env.production"
    $content = Get-Content $envFile -Raw
    if ($content -match 'change-me-strong-password') {
        $pg = Rand-Hex 16
        $jwt = Rand-Hex 32
        $jwtR = Rand-Hex 32
        $content = $content -replace 'change-me-strong-password', $pg
        $content = $content -replace 'change-me-long-random-string', $jwt
        $content = $content -replace 'change-me-another-long-random-string', $jwtR
        Set-Content $envFile $content -NoNewline
        Ok "Сгенерированы секреты в .env.production"
    }
}

function Write-MobileEnv {
    $f = Join-Path $Root "mobile\.env.production"
    @"
# Сгенерировано scripts/deploy.ps1
EXPO_PUBLIC_API_URL=$API_URL
EXPO_PUBLIC_API_ORIGIN=$SERVER_URL
"@ | Set-Content $f -Encoding utf8
    Ok "mobile/.env.production → $API_URL"
}

function Write-BackendEnv {
    $prod = Get-Content (Join-Path $Root ".env.production")
    $get = { param($k) ($prod | Where-Object { $_ -match "^$k=" }) -replace "^$k=", "" }
    $user = & $get "POSTGRES_USER"
    $pass = & $get "POSTGRES_PASSWORD"
    $db = & $get "POSTGRES_DB"
    $jwt = & $get "JWT_SECRET"
    $jwtR = & $get "JWT_REFRESH_SECRET"
    $exp = & $get "JWT_EXPIRATION"
    $expR = & $get "JWT_REFRESH_EXPIRATION"
    $port = & $get "PORT"
    if (-not $port) { $port = "3000" }
    @"
# Сгенерировано scripts/deploy.ps1
DATABASE_URL=postgresql://${user}:${pass}@localhost:5432/${db}?schema=public
JWT_SECRET=$jwt
JWT_REFRESH_SECRET=$jwtR
JWT_EXPIRATION=$exp
JWT_REFRESH_EXPIRATION=$expR
PORT=$port
"@ | Set-Content (Join-Path $Root "backend\.env") -Encoding utf8
    Ok "backend/.env синхронизирован"
}

function Patch-EasJson {
    $eas = Join-Path $Root "mobile\eas.json"
    if (Test-Path $eas) {
        (Get-Content $eas -Raw) `
            -replace 'https://YOUR_DOMAIN/api', $API_URL `
            -replace 'http://YOUR_DOMAIN/api', $API_URL |
            Set-Content $eas -NoNewline
        Ok "mobile/eas.json → $API_URL"
    }
}

function Build-Admin {
    Log "Сборка админ-панели"
    Push-Location (Join-Path $Root "admin")
    if (Test-Path package-lock.json) { npm ci } else { npm install }
    npm run build
    Pop-Location
    Ok "admin → backend/admin-static"
}

function Build-Apk {
    Log "Сборка Android APK"
    Push-Location (Join-Path $Root "mobile")
    $env:EXPO_PUBLIC_API_URL = $API_URL
    $env:EXPO_PUBLIC_API_ORIGIN = $SERVER_URL
    if (Test-Path package-lock.json) { npm ci } else { npm install }
    npx expo prebuild --platform android --non-interactive
    Push-Location android
    $apkSrc = $null
    try {
        .\gradlew.bat assembleRelease -x lint --no-daemon 2>$null
        if ($LASTEXITCODE -eq 0) { $apkSrc = "app\build\outputs\apk\release\app-release.apk" }
    } catch { }
    if (-not $apkSrc) {
        Warn "Release не собрался, пробуем debug APK"
        .\gradlew.bat assembleDebug -x lint --no-daemon
        $apkSrc = "app\build\outputs\apk\debug\app-debug.apk"
    }
    Pop-Location
    Pop-Location
    New-Item -ItemType Directory -Force -Path (Split-Path $ApkDest) | Out-Null
    Copy-Item (Join-Path $Root "mobile\android\$apkSrc") $ApkDest -Force
    Ok "APK → landing\downloads\orenplace.apk"
}

function Invoke-DockerCompose {
    param([string[]]$Args)
    docker compose @Args 2>$null
    if ($LASTEXITCODE -eq 0) { return $true }
    docker-compose @Args
    return $LASTEXITCODE -eq 0
}

function Start-Docker {
    Log "Запуск Docker-контейнеров"
    $env:HTTP_PORT = $HTTP_PORT
    $nginx = docker ps -a --format "{{.Names}}" 2>$null | Where-Object { $_ -match "orenplace-nginx" }
    if ($nginx) {
        Warn "Удаляем старые контейнеры nginx"
        $nginx | ForEach-Object { docker rm -f $_ 2>$null | Out-Null }
    }
    if (-not (Invoke-DockerCompose @("-f", "docker-compose.prod.yml", "--env-file", ".env.production", "up", "-d", "--build", "--remove-orphans"))) {
        throw "Docker Compose завершился с ошибкой"
    }
    $running = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -eq "orenplace-nginx" }
    if (-not $running) { throw "Контейнер orenplace-nginx не запущен" }
    Ok "Контейнеры запущены"
}

Log "OrenPlace deploy → $SERVER_IP"

Copy-EnvIfMissing ".env.production.example" ".env.production"
Copy-EnvIfMissing "backend\.env.example" "backend\.env"
Copy-EnvIfMissing "mobile\.env.production.example" "mobile\.env.production"

Ensure-ProdSecrets
Write-MobileEnv
Write-BackendEnv
Patch-EasJson

Build-Admin

if ($NoApk) {
    Warn "Пропуск сборки APK (-NoApk)"
} elseif ((Test-Path $ApkDest) -and $env:FORCE_APK_REBUILD -ne "1") {
    Ok "APK уже есть (FORCE_APK_REBUILD=1 для пересборки)"
} else {
    try {
        Build-Apk
    } catch {
        Warn "APK не собран: $($_.Exception.Message). Нужны Java JDK 17+ и Android SDK."
    }
}

if (-not $NoDocker) {
    Start-Docker
} else {
    Warn "Пропуск Docker (-NoDocker)"
}

Write-Host @"

════════════════════════════════════════
  OrenPlace задеплоен
════════════════════════════════════════
  Лендинг:  $SERVER_URL/
  API:      $API_URL
  Swagger:  $SERVER_URL/api/docs
  Админка:  $SERVER_URL/admin/
  APK:      $SERVER_URL/downloads/orenplace.apk
════════════════════════════════════════
"@
