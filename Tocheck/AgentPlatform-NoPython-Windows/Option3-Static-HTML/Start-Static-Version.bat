@echo off
title Agent Platform - Static HTML
color 0E
cd /d "%~dp0"

echo ========================================
echo   AGENT PLATFORM - STATIC VERSION
echo ========================================
echo.
echo This version works without any installation!
echo Limited backend functionality (demo mode).
echo.

:: Try different methods to open
echo Opening platform in your default browser...

:: Method 1: Direct file opening
start index.html

:: Method 2: If available, use Python's simple server
python -m http.server 8080 >nul 2>&1 &
if not errorlevel 1 (
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    echo Running on: http://localhost:8080
) else (
    :: Method 3: Try Node.js serve
    npx serve . -l 8080 >nul 2>&1 &
    if not errorlevel 1 (
        timeout /t 2 /nobreak >nul
        start http://localhost:8080
        echo Running on: http://localhost:8080
    ) else (
        echo Platform opened as static files.
        echo Some features may be limited without a server.
    )
)

echo.
echo ✅ Static version running!
echo Note: Backend features are simulated.
echo.
pause
