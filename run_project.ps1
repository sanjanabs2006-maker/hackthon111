# Krishi Mitra - Full Stack Launcher
Write-Host "🌾 Starting Krishi Mitra Ecosystem..." -ForegroundColor Green

# 1. Start Flask API in background
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "📡 Starting Python Flask Backend on http://localhost:5000..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "-m flask --app run.py run --port 5000" -WorkingDirectory $backendPath

Start-Sleep -Seconds 2

Write-Host "💻 Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $frontendPath

Write-Host "`n✅ Krishi Mitra is up and running!" -ForegroundColor Green
Write-Host "👉 Open your browser at: http://localhost:5173" -ForegroundColor Yellow

