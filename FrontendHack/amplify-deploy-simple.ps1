# Script simplificado para deployar Frontend en AWS Amplify usando CLI
# Este script crea la app primero y luego conecta el repositorio

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = ""
)

$ErrorActionPreference = "Stop"

Write-Host "Desplegando Alerta UTEC Frontend en AWS Amplify..." -ForegroundColor Cyan

# Variables de configuración
$APP_NAME = "alerta-utec-frontend"
$REPO = "KarolayTamayoH/Alerta_Utec"
$BRANCH = "master"
$REGION = "us-east-1"

# Variables de entorno de la aplicación
$VITE_API_BASE_URL = "https://zictdclmxa.execute-api.us-east-1.amazonaws.com/dev"
$VITE_WS_URL = "wss://2uydj07b34.execute-api.us-east-1.amazonaws.com/dev"

Write-Host "`nConfiguracion:" -ForegroundColor Yellow
Write-Host "  App Name: $APP_NAME"
Write-Host "  Repository: $REPO"
Write-Host "  Branch: $BRANCH"
Write-Host "  Region: $REGION"

# Verificar si la app ya existe
Write-Host "`nVerificando si la app ya existe..." -ForegroundColor Yellow
$existingApps = aws amplify list-apps --region $REGION --query "apps[?name=='$APP_NAME'].appId" --output text 2>$null

if ($existingApps) {
    Write-Host "ADVERTENCIA: La aplicacion '$APP_NAME' ya existe (ID: $existingApps)" -ForegroundColor Yellow
    $response = Read-Host "Deseas eliminarla y crear una nueva? (s/n)"
    if ($response -eq "s") {
        Write-Host "Eliminando aplicacion existente..." -ForegroundColor Red
        aws amplify delete-app --app-id $existingApps --region $REGION
        Write-Host "Aplicacion eliminada" -ForegroundColor Green
    } else {
        Write-Host "Usando la app existente: $existingApps" -ForegroundColor Green
        $APP_ID = $existingApps
        
        # Obtener información de la app existente
        $appInfo = aws amplify get-app --app-id $APP_ID --region $REGION --output json | ConvertFrom-Json
        $DEFAULT_DOMAIN = $appInfo.app.defaultDomain
        
        Write-Host "`nApp ID: $APP_ID" -ForegroundColor Cyan
        Write-Host "URL: https://$BRANCH.$DEFAULT_DOMAIN" -ForegroundColor Cyan
        
        exit 0
    }
}

# Solicitar GitHub Token si no se proporcionó
if ([string]::IsNullOrEmpty($GitHubToken)) {
    Write-Host "`nNecesitas un GitHub Personal Access Token" -ForegroundColor Yellow
    Write-Host "   Crealo en: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "   Permisos necesarios: repo (todos), admin:repo_hook" -ForegroundColor Gray
    Write-Host ""
    $GitHubToken = Read-Host "Ingresa tu GitHub Token"
    
    if ([string]::IsNullOrEmpty($GitHubToken)) {
        Write-Host "ERROR: Token requerido para continuar" -ForegroundColor Red
        exit 1
    }
}

# Crear buildspec
$buildSpec = @"
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd FrontendHack
        - npm ci --legacy-peer-deps
    build:
      commands:
        - cd FrontendHack
        - npm run build
  artifacts:
    baseDirectory: FrontendHack/dist
    files:
      - '**/*'
  cache:
    paths:
      - FrontendHack/node_modules/**/*
"@

# Crear la aplicación en Amplify SIN el repositorio primero
Write-Host "`nCreando aplicacion en AWS Amplify..." -ForegroundColor Cyan

$createAppResult = aws amplify create-app `
    --name $APP_NAME `
    --region $REGION `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo crear la aplicacion" -ForegroundColor Red
    exit 1
}

$appData = $createAppResult | ConvertFrom-Json
$APP_ID = $appData.app.appId
$DEFAULT_DOMAIN = $appData.app.defaultDomain

Write-Host "Aplicacion creada exitosamente!" -ForegroundColor Green
Write-Host "   App ID: $APP_ID" -ForegroundColor Gray

# Actualizar la app con el build spec y variables de entorno
Write-Host "`nConfigurando build settings y variables de entorno..." -ForegroundColor Cyan

$updateAppResult = aws amplify update-app `
    --app-id $APP_ID `
    --region $REGION `
    --build-spec $buildSpec `
    --environment-variables "VITE_API_BASE_URL=$VITE_API_BASE_URL,VITE_WS_URL=$VITE_WS_URL" `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo actualizar la configuracion" -ForegroundColor Red
    exit 1
}

Write-Host "Configuracion actualizada!" -ForegroundColor Green

# Conectar el repositorio
Write-Host "`nConectando repositorio GitHub..." -ForegroundColor Cyan

$connectRepoResult = aws amplify create-branch `
    --app-id $APP_ID `
    --branch-name $BRANCH `
    --region $REGION `
    --enable-auto-build `
    --output json

if ($LASTEXITCODE -eq 0) {
    Write-Host "Rama conectada exitosamente!" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA: No se pudo conectar automaticamente el repositorio" -ForegroundColor Yellow
    Write-Host "Puedes conectarlo manualmente desde la consola de Amplify" -ForegroundColor Yellow
}

# Mostrar información final
Write-Host "`nDeployment configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "Informacion del despliegue:" -ForegroundColor Yellow
Write-Host "   App ID: $APP_ID"
Write-Host "   URL: https://$BRANCH.$DEFAULT_DOMAIN"
Write-Host ""
Write-Host "Links utiles:" -ForegroundColor Yellow
Write-Host "   Consola Amplify: https://console.aws.amazon.com/amplify/home?region=$REGION#$APP_ID"
Write-Host ""
Write-Host "SIGUIENTE PASO:" -ForegroundColor Cyan
Write-Host "1. Ve a la consola de Amplify: https://console.aws.amazon.com/amplify/home?region=$REGION#$APP_ID" -ForegroundColor Yellow
Write-Host "2. Conecta tu repositorio GitHub manualmente" -ForegroundColor Yellow
Write-Host "3. Selecciona la rama 'master'" -ForegroundColor Yellow
Write-Host "4. El build spec y variables de entorno ya estan configurados!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Una vez conectado, tu app estara en: https://$BRANCH.$DEFAULT_DOMAIN" -ForegroundColor Green
