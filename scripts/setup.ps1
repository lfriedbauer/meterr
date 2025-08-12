# PowerShell Setup Script for meterr.ai
# Run this script to set up the development environment

Write-Host "🚀 Setting up meterr.ai development environment..." -ForegroundColor Cyan

# Check Node.js version
Write-Host "`n📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -ge 20) {
        Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js 20+ required. Current: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "`n📦 Checking pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>$null
if ($pnpmVersion) {
    Write-Host "✅ pnpm $pnpmVersion detected" -ForegroundColor Green
} else {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Check Vercel CLI
Write-Host "`n📦 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if ($vercelVersion) {
    Write-Host "✅ Vercel CLI detected" -ForegroundColor Green
} else {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env.local")) {
    Write-Host "`n📝 Creating .env.local file..." -ForegroundColor Yellow
    @"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# AWS (optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Vercel (for deployments)
VERCEL_TOKEN=
"@ | Out-File -FilePath .env.local -Encoding UTF8
    Write-Host "✅ .env.local created. Please add your API keys." -ForegroundColor Green
}

# Create required directories if they don't exist
$directories = @(
    ".claude/sub-agents",
    "apps/admin",
    "packages/@meterr/config/src",
    "packages/@meterr/database/src",
    "packages/@meterr/auth/src",
    "packages/@meterr/ai/src",
    "packages/@meterr/tools/src",
    "infrastructure/aws/cdk",
    "infrastructure/aws/lambda",
    "infrastructure/supabase/migrations",
    "infrastructure/supabase/functions"
)

Write-Host "`n📁 Ensuring directory structure..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    }
}

# Check ports availability
Write-Host "`n🔍 Checking port availability..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 6006)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "⚠️  Ports in use: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "   Run this to free them: Get-Process node | Stop-Process -Force" -ForegroundColor Gray
} else {
    Write-Host "✅ All development ports are available" -ForegroundColor Green
}

# Summary
Write-Host "`n✨ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Add your API keys to .env.local" -ForegroundColor White
Write-Host "  2. Run 'pnpm dev' to start development servers" -ForegroundColor White
Write-Host "  3. Visit http://localhost:3000 (marketing) and http://localhost:3001 (app)" -ForegroundColor White

Write-Host "`nUseful commands:" -ForegroundColor Cyan
Write-Host "  pnpm dev              - Start all development servers" -ForegroundColor Gray
Write-Host "  pnpm dev:marketing    - Start marketing site only" -ForegroundColor Gray
Write-Host "  pnpm dev:app         - Start main app only" -ForegroundColor Gray
Write-Host "  pnpm build           - Build all projects" -ForegroundColor Gray
Write-Host "  pnpm test            - Run tests" -ForegroundColor Gray
Write-Host "  pnpm deploy          - Deploy to Vercel" -ForegroundColor Gray