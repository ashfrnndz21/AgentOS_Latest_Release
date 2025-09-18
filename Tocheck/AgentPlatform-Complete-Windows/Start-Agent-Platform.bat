@echo off
title Agent Platform - Complete Edition
color 0A
cd /d "%~dp0"

echo ========================================
echo   AGENT PLATFORM - COMPLETE EDITION
echo ========================================
echo.
echo 🚀 Starting complete Agent Platform with:
echo ✅ Command Centre ^& Agent Dashboard
echo ✅ Multi-Agent Workspace ^& Orchestration  
echo ✅ Wealth Management ^& CVM Modules
echo ✅ Backend Validation ^& Observability
echo ✅ Strands Workflows ^& Agent Creation
echo ✅ Real-time Monitoring ^& Analytics
echo.

:: Check Python installation
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ❌ Python is required but not installed.
        echo.
        echo 📥 Please install Python:
        echo 1. Go to: https://python.org/downloads/
        echo 2. Download Python 3.8 or newer
        echo 3. During install, check "Add Python to PATH"
        echo 4. Restart this script after installation
        echo.
        echo Alternative: Install from Microsoft Store ^(search "Python 3.11"^)
        echo.
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
        echo ✅ Python3 found
    )
) else (
    set PYTHON_CMD=python
    echo ✅ Python found
)

:: Install Python dependencies
echo [2/4] Installing Python dependencies...
cd app\backend
%PYTHON_CMD% -m pip install flask flask-cors requests --quiet --user
if errorlevel 1 (
    echo Warning: Some packages may not have installed correctly
    echo Trying alternative installation method...
    %PYTHON_CMD% -m pip install flask flask-cors requests --break-system-packages --quiet
)
cd ..\..

:: Clean up any existing processes
echo [3/4] Preparing servers...
taskkill /f /im python.exe /t 2>nul
taskkill /f /im node.exe /t 2>nul

:: Start backend server
echo Starting backend API server...
start "Agent Platform Backend" /min %PYTHON_CMD% app\backend\complete_api.py

:: Wait for backend to initialize
echo Waiting for backend to start...
timeout /t 4 /nobreak >nul

:: Test backend connection
echo Testing backend connection...
%PYTHON_CMD% -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health').read()" >nul 2>&1
if errorlevel 1 (
    echo Warning: Backend may still be starting...
) else (
    echo ✅ Backend API is responding
)

:: Start frontend server
echo [4/4] Starting frontend server...
%PYTHON_CMD% -c "import http.server, socketserver, webbrowser, threading, time; handler = lambda *args: http.server.SimpleHTTPRequestHandler(*args, directory='app/frontend'); server = socketserver.TCPServer(('', 3000), handler); threading.Thread(target=server.serve_forever, daemon=True).start(); time.sleep(2); webbrowser.open('http://localhost:3000'); print('Frontend server running on http://localhost:3000'); print('Backend API running on http://localhost:5000'); print(''); print('🎉 Agent Platform is now running!'); print(''); print('Available features:'); print('- Command Centre: Main dashboard and controls'); print('- Agent Dashboard: View and manage all agents'); print('- Multi-Agent Workspace: Coordinate multiple agents'); print('- Wealth Management: Financial planning tools'); print('- Customer Value Management: CRM and analytics'); print('- Backend Validation: System monitoring and health'); print('- Settings: Configure platform preferences'); print(''); print('Keep this window open while using the platform.'); print('Close this window to stop all servers.'); print(''); input('Press Enter to stop servers...')"

echo Shutting down servers...
taskkill /f /im python.exe /t 2>nul
echo Platform stopped.
pause
