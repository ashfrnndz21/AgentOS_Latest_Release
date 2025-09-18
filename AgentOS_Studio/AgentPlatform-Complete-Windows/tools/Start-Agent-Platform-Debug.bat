@echo off
title Agent Platform - Startup Diagnostics
color 0A

echo ========================================
echo    AGENT PLATFORM - STARTUP DEBUG
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the Agent Platform directory.
    pause
    exit /b 1
)

:: Check Node.js installation
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✓ Node.js found: 
    node --version
)

:: Check Python installation
echo.
echo [2/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Python not found, trying python3...
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Python is not installed or not in PATH
        echo Please install Python from https://python.org/
        pause
        exit /b 1
    ) else (
        echo ✓ Python3 found:
        python3 --version
        set PYTHON_CMD=python3
    )
) else (
    echo ✓ Python found:
    python --version
    set PYTHON_CMD=python
)

:: Install dependencies if needed
echo.
echo [3/6] Checking dependencies...
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Node modules found
)

:: Check if backend dependencies exist
if not exist "backend\requirements.txt" (
    echo Creating backend requirements...
    echo flask>backend\requirements.txt
    echo flask-cors>>backend\requirements.txt
    echo requests>>backend\requirements.txt
)

:: Install Python dependencies
echo.
echo [4/6] Installing Python backend dependencies...
%PYTHON_CMD% -m pip install -r backend\requirements.txt
if errorlevel 1 (
    echo WARNING: Some Python packages may not have installed correctly
)

:: Kill any existing processes on our ports
echo.
echo [5/6] Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
echo ✓ Ports cleaned

:: Start the backend server
echo.
echo [6/6] Starting servers...
echo Starting Python backend server on port 5000...
start "Backend Server" cmd /c "%PYTHON_CMD% backend\simple_api.py"

:: Wait for backend to start
echo Waiting for backend server to start...
timeout /t 3 /nobreak >nul

:: Test backend connection
echo Testing backend connection...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Backend server may not be responding yet
    echo Continuing anyway...
) else (
    echo ✓ Backend server is responding
)

:: Start the frontend server
echo.
echo Starting React frontend server on port 3000...
start "Frontend Server" cmd /c "npm run dev"

:: Wait for frontend to start
echo Waiting for frontend server to start...
timeout /t 5 /nobreak >nul

:: Test frontend connection
echo Testing frontend connection...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo WARNING: Frontend server may not be responding yet
    echo Will try to open browser anyway...
) else (
    echo ✓ Frontend server is responding
)

:: Open browser
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo    SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo If you see "site can't be reached":
echo 1. Wait 30 seconds for servers to fully start
echo 2. Refresh your browser
echo 3. Check the server windows for errors
echo.
echo Press any key to view server logs...
pause >nul

:: Show server status
echo.
echo Current server status:
netstat -an | findstr :3000
netstat -an | findstr :5000

echo.
echo Keep this window open to see diagnostics.
echo Close this window to stop all servers.
pause