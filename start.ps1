Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting CacheFlow Application" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$bravePath = "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
if (Test-Path $bravePath) {
    Write-Host "[1/2] Opening http://localhost:3000 in Brave Browser..." -ForegroundColor Green
    Start-Process $bravePath -ArgumentList "http://localhost:3000"
} else {
    Write-Host "[1/2] Opening http://localhost:3000 in Default Browser..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
}

Write-Host "[2/2] Starting Next.js Dev Server (npm run dev)..." -ForegroundColor Yellow
Write-Host ""
npm run dev
