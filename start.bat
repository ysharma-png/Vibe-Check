@echo off
title CacheFlow Dev Server
echo ========================================================
echo   Starting CacheFlow Application
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Launching Brave Browser at http://localhost:3000...
start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" http://localhost:3000 2>nul || start http://localhost:3000

echo [2/2] Starting Next.js development server...
echo.
npm run dev
pause
