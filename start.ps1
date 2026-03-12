# Web3 Chess DApp - Development Startup Script
# This script starts both the backend server and frontend client

Write-Host "🎮 Starting Web3 Chess DApp..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path ".\server") -or -not (Test-Path ".\client")) {
    Write-Host "❌ Error: Please run this script from the web3_chess root directory" -ForegroundColor Red
    exit 1
}

# Check if node_modules exist
$serverModules = Test-Path ".\server\node_modules"
$clientModules = Test-Path ".\client\node_modules"

if (-not $serverModules -or -not $clientModules) {
    Write-Host "📦 Dependencies not installed. Installing now..." -ForegroundColor Yellow
    
    if (-not $serverModules) {
        Write-Host "Installing server dependencies..." -ForegroundColor Yellow
        Set-Location server
        npm install
        Set-Location ..
    }
    
    if (-not $clientModules) {
        Write-Host "Installing client dependencies..." -ForegroundColor Yellow
        Set-Location client
        npm install
        Set-Location ..
    }
    
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location server
    npm run dev
}

Start-Sleep -Seconds 2

Write-Host "🚀 Starting frontend client..." -ForegroundColor Green
$clientJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location client
    npm run dev
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Application started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📍 Frontend Client: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎮 Open your browser to http://localhost:5173 to play!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers..." -ForegroundColor Gray

# Keep script running and display output
try {
    while ($true) {
        $serverOutput = Receive-Job -Job $serverJob -ErrorAction SilentlyContinue
        $clientOutput = Receive-Job -Job $clientJob -ErrorAction SilentlyContinue
        
        if ($serverOutput) {
            Write-Host "[SERVER] $serverOutput" -ForegroundColor Blue
        }
        if ($clientOutput) {
            Write-Host "[CLIENT] $clientOutput" -ForegroundColor Magenta
        }
        
        # Check if jobs are still running
        if ($serverJob.State -eq "Completed" -or $clientJob.State -eq "Completed") {
            Write-Host "⚠️ One of the servers stopped." -ForegroundColor Yellow
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Stop-Job -Job $clientJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $clientJob -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped." -ForegroundColor Green
}
