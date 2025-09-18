@echo off
title AgentOS Platform
color 0A
cd /d "%~dp0"

echo ========================================
echo   AGENTOS PLATFORM
echo ========================================
echo.
echo 🚀 Starting AgentOS with latest features:
echo ✅ Grouped Navigation Sidebar
echo ✅ AgentCore Observability  
echo ✅ Architecture Blueprint
echo ✅ Agent Creation Wizards
echo ✅ Multi-Agent Workspace
echo ✅ Real-time Monitoring
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
    %PYTHON_CMD% -m pip install flask flask-cors requests --break-system-packages --quiet
)
cd ..\..

:: Clean up any existing processes
echo [3/4] Preparing servers...
taskkill /f /im python.exe /t 2>nul
taskkill /f /im node.exe /t 2>nul

:: Start backend server
echo Starting AgentOS backend API...
start "AgentOS Backend" /min %PYTHON_CMD% app\backend\agentos_api.py

:: Wait for backend to initialize
echo Waiting for backend to start...
timeout /t 4 /nobreak >nul

:: Start frontend server
echo [4/4] Starting AgentOS frontend...
%PYTHON_CMD% -c "import http.server, socketserver, webbrowser, threading, time; handler = lambda *args: http.server.SimpleHTTPRequestHandler(*args, directory='app/frontend'); server = socketserver.TCPServer(('', 3000), handler); threading.Thread(target=server.serve_forever, daemon=True).start(); time.sleep(2); webbrowser.open('http://localhost:3000'); print('🎉 AgentOS is now running!'); print(''); print('Frontend: http://localhost:3000'); print('Backend API: http://localhost:5000'); print(''); print('✨ New Features:'); print('- Grouped Navigation (4 main sections)'); print('- AgentCore Observability'); print('- Architecture Blueprint in Core Platform'); print('- Enhanced agent creation workflows'); print(''); print('Keep this window open while using AgentOS.'); print('Close this window to stop all servers.'); print(''); input('Press Enter to stop servers...')"

echo Shutting down AgentOS...
taskkill /f /im python.exe /t 2>nul
echo AgentOS stopped.
pause
