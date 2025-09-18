@echo off
title Agent Platform - Node.js Only
color 0B
cd /d "%~dp0"

echo ========================================
echo   AGENT PLATFORM - NODE.JS ONLY
echo ========================================
echo.
echo This version only requires Node.js!
echo No Python needed.
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo.
    echo 📥 Please install Node.js:
    echo 1. Go to: https://nodejs.org/
    echo 2. Download LTS version
    echo 3. Install with default settings
    echo 4. Restart this script
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

:: Install serve package if needed
echo Installing web server...
npm install -g serve 2>nul

:: Start backend
echo Starting Node.js backend...
start "Backend" /min node app\backend-nodejs.js

:: Start frontend
echo Starting frontend...
timeout /t 3 /nobreak >nul
start "Frontend" /min serve -s app\frontend -l 3000

:: Open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ Platform running with Node.js only!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Keep this window open.
pause
