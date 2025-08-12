# PowerShell Deployment Script for meterr.ai
# Handles deployment to Vercel and infrastructure updates

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "marketing", "app", "admin")]
    [string]$Target = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$Production = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false
)

Write-Host "🚀 meterr.ai Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Configuration
$apps = @{
    "marketing" = @{
        "path" = "apps/marketing"
        "name" = "meterr-marketing"
        "domain" = "meterr.ai"
    }
    "app" = @{
        "path" = "apps/app"
        "name" = "meterr-app"
        "domain" = "app.meterr.ai"
    }
    "admin" = @{
        "path" = "apps/admin"
        "name" = "meterr-admin"
        "domain" = "admin.meterr.ai"
    }
}

# Function to deploy a single app
function Deploy-App {
    param(
        [string]$AppName,
        [hashtable]$AppConfig
    )
    
    Write-Host "`n📦 Deploying $AppName..." -ForegroundColor Yellow
    
    Push-Location $AppConfig.path
    
    try {
        if (!$SkipBuild) {
            Write-Host "  Building $AppName..." -ForegroundColor Gray
            pnpm build
            if ($LASTEXITCODE -ne 0) {
                throw "Build failed for $AppName"
            }
        }
        
        Write-Host "  Deploying to Vercel..." -ForegroundColor Gray
        if ($Production) {
            vercel --prod --yes
        } else {
            vercel --yes
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $AppName deployed successfully!" -ForegroundColor Green
        } else {
            throw "Deployment failed for $AppName"
        }
    }
    catch {
        Write-Host "❌ Error deploying ${AppName}: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

# Pre-deployment checks
Write-Host "`n🔍 Running pre-deployment checks..." -ForegroundColor Yellow

# Check if Vercel CLI is installed
$vercelVersion = vercel --version 2>$null
if (!$vercelVersion) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if we're in the right directory
if (!(Test-Path "pnpm-workspace.yaml")) {
    Write-Host "❌ Not in meterr root directory!" -ForegroundColor Red
    exit 1
}

# Check git status
$gitStatus = git status --porcelain
if ($gitStatus -and $Production) {
    Write-Host "⚠️  Warning: You have uncommitted changes" -ForegroundColor Yellow
    Write-Host "   It's recommended to commit before production deployment" -ForegroundColor Gray
    $response = Read-Host "   Continue anyway? (y/N)"
    if ($response -ne 'y') {
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Install/update dependencies if needed
if (!$SkipBuild) {
    Write-Host "`n📦 Updating dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Deploy based on target
Write-Host "`n🚀 Starting deployment..." -ForegroundColor Cyan
Write-Host "  Target: $Target" -ForegroundColor Gray
Write-Host "  Environment: $(if ($Production) {'Production'} else {'Preview'})" -ForegroundColor Gray

switch ($Target) {
    "all" {
        foreach ($appName in @("marketing", "app")) {
            Deploy-App -AppName $appName -AppConfig $apps[$appName]
        }
    }
    default {
        if ($apps.ContainsKey($Target)) {
            Deploy-App -AppName $Target -AppConfig $apps[$Target]
        } else {
            Write-Host "❌ Unknown target: $Target" -ForegroundColor Red
            exit 1
        }
    }
}

# Post-deployment tasks
if ($Production) {
    Write-Host "`n📊 Post-deployment tasks..." -ForegroundColor Yellow
    
    # Tag the release in git
    $version = (Get-Content "package.json" | ConvertFrom-Json).version
    $tagName = "v$version-$(Get-Date -Format 'yyyyMMdd-HHmm')"
    
    Write-Host "  Creating git tag: $tagName" -ForegroundColor Gray
    git tag -a $tagName -m "Production deployment $tagName"
    
    Write-Host "  Pushing tag to origin..." -ForegroundColor Gray
    git push origin $tagName
    
    # Clear CDN cache if using CloudFront
    # aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
}

# Summary
Write-Host "`n✨ Deployment complete!" -ForegroundColor Green

if ($Production) {
    Write-Host "`nProduction URLs:" -ForegroundColor Cyan
    Write-Host "  Marketing: https://meterr.ai" -ForegroundColor White
    Write-Host "  App: https://app.meterr.ai" -ForegroundColor White
} else {
    Write-Host "`nPreview deployments created. Check Vercel dashboard for URLs." -ForegroundColor Cyan
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Verify deployment at the URLs above" -ForegroundColor Gray
Write-Host "  2. Run smoke tests" -ForegroundColor Gray
Write-Host "  3. Monitor error tracking (Sentry)" -ForegroundColor Gray
Write-Host "  4. Check analytics" -ForegroundColor Gray