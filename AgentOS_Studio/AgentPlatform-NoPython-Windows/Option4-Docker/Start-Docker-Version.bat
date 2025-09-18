@echo off
title Agent Platform - Docker Version
color 0D
cd /d "%~dp0"

echo ========================================
echo   AGENT PLATFORM - DOCKER VERSION
echo ========================================
echo.
echo This version runs in Docker containers!
echo Requires Docker Desktop to be installed.
echo.

:: Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is required but not installed.
    echo.
    echo 📥 Please install Docker Desktop:
    echo 1. Go to: https://docker.com/products/docker-desktop
    echo 2. Download for Windows
    echo 3. Install and start Docker Desktop
    echo 4. Restart this script
    echo.
    pause
    exit /b 1
)

echo ✅ Docker found
docker --version

echo Building and starting containers...
docker-compose up --build -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo ✅ Platform running in Docker!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo To stop: docker-compose down
echo.
pause
