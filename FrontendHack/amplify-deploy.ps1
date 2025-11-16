# Script para deployar Frontend en AWS Amplify usando CLI
# 
# IMPORTANTE: Necesitas un Personal Access Token de GitHub
# Crea uno en: https://github.com/settings/tokens
# Permisos necesarios: repo (todos), admin:repo_hook
#
# Uso:
#   .\amplify-deploy.ps1 -GitHubToken "ghp_tu_token_aqui"

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
    $response = Read-Host "¿Deseas eliminarla y crear una nueva? (s/n)"
    if ($response -eq "s") {
        Write-Host "Eliminando aplicacion existente..." -ForegroundColor Red
        aws amplify delete-app --app-id $existingApps --region $REGION
        Write-Host "Aplicacion eliminada" -ForegroundColor Green
    } else {
        Write-Host "Operacion cancelada" -ForegroundColor Red
        exit 1
    }
}

# Solicitar GitHub Token si no se proporcionó
if ([string]::IsNullOrEmpty($GitHubToken)) {
    Write-Host "`nNecesitas un GitHub Personal Access Token" -ForegroundColor Yellow
    Write-Host "   Créalo en: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "   Permisos necesarios: repo (todos), admin:repo_hook" -ForegroundColor Gray
    Write-Host ""
    $GitHubToken = Read-Host "Ingresa tu GitHub Token"
    
    if ([string]::IsNullOrEmpty($GitHubToken)) {
        Write-Host "ERROR: Token requerido para continuar" -ForegroundColor Red
        exit 1
    }
}

# Crear la aplicación en Amplify
Write-Host "`nCreando aplicacion en AWS Amplify..." -ForegroundColor Cyan

# Crear el buildspec en formato JSON correcto
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

$createAppResult = aws amplify create-app `
    --name $APP_NAME `
    --repository "https://github.com/$REPO" `
    --access-token $GitHubToken `
    --region $REGION `
    --platform WEB `
    --environment-variables "VITE_API_BASE_URL=$VITE_API_BASE_URL,VITE_WS_URL=$VITE_WS_URL" `
    --build-spec $buildSpec `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo crear la aplicacion" -ForegroundColor Red
    exit 1
}

$APP_ID = ($createAppResult | ConvertFrom-Json).app.appId
$DEFAULT_DOMAIN = ($createAppResult | ConvertFrom-Json).app.defaultDomain

Write-Host "Aplicacion creada exitosamente!" -ForegroundColor Green
Write-Host "   App ID: $APP_ID" -ForegroundColor Gray

# Crear y conectar la rama
Write-Host "`nConectando rama '$BRANCH'..." -ForegroundColor Cyan

$createBranchResult = aws amplify create-branch `
    --app-id $APP_ID `
    --branch-name $BRANCH `
    --region $REGION `
    --enable-auto-build `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo crear la rama" -ForegroundColor Red
    exit 1
}

Write-Host "Rama conectada exitosamente!" -ForegroundColor Green

# Iniciar el despliegue
Write-Host "`nIniciando despliegue..." -ForegroundColor Cyan

$startJobResult = aws amplify start-job `
    --app-id $APP_ID `
    --branch-name $BRANCH `
    --job-type RELEASE `
    --region $REGION `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo iniciar el despliegue" -ForegroundColor Red
    exit 1
}

$JOB_ID = ($startJobResult | ConvertFrom-Json).jobSummary.jobId

Write-Host "Despliegue iniciado!" -ForegroundColor Green
Write-Host "   Job ID: $JOB_ID" -ForegroundColor Gray

# Mostrar información final
Write-Host "`nDeployment en progreso!" -ForegroundColor Green
Write-Host ""
Write-Host "Informacion del despliegue:" -ForegroundColor Yellow
Write-Host "   App ID: $APP_ID"
Write-Host "   URL: https://$BRANCH.$DEFAULT_DOMAIN"
Write-Host "   Job ID: $JOB_ID"
Write-Host ""
Write-Host "Links utiles:" -ForegroundColor Yellow
Write-Host "   Consola Amplify: https://console.aws.amazon.com/amplify/home?region=$REGION#$APP_ID"
Write-Host "   Ver build: https://console.aws.amazon.com/amplify/home?region=$REGION#$APP_ID/$BRANCH/$JOB_ID"
Write-Host ""
Write-Host "El despliegue tomara aproximadamente 5-10 minutos." -ForegroundColor Cyan
Write-Host ""
Write-Host "Para verificar el estado del despliegue:" -ForegroundColor Yellow
Write-Host "   aws amplify get-job --app-id $APP_ID --branch-name $BRANCH --job-id $JOB_ID --region $REGION"
Write-Host ""
Write-Host "Una vez completado, tu app estara en: https://$BRANCH.$DEFAULT_DOMAIN" -ForegroundColor Green
