@echo off
title Agent Platform - Windows Issue Fixer
color 0E

echo ========================================
echo    WINDOWS ISSUE DIAGNOSTIC & FIX
echo ========================================
echo.

:: Check Windows version
echo System Information:
echo OS: %OS%
echo Processor: %PROCESSOR_ARCHITECTURE%
ver
echo.

:: Check firewall settings
echo [1/8] Checking Windows Firewall...
netsh advfirewall show allprofiles state | findstr "State"
echo.

:: Check if ports are blocked
echo [2/8] Checking port availability...
netstat -an | findstr :3000 >nul
if not errorlevel 1 (
    echo WARNING: Port 3000 is already in use
    echo Attempting to free port 3000...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
        echo Killing process %%a
        taskkill /f /pid %%a >nul 2>&1
    )
)

netstat -an | findstr :5000 >nul
if not errorlevel 1 (
    echo WARNING: Port 5000 is already in use
    echo Attempting to free port 5000...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
        echo Killing process %%a
        taskkill /f /pid %%a >nul 2>&1
    )
)

:: Check Node.js and npm
echo.
echo [3/8] Verifying Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found in PATH
    echo Please add Node.js to your system PATH
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

node --version
npm --version

:: Check Python
echo.
echo [4/8] Verifying Python installation...
where python >nul 2>&1
if errorlevel 1 (
    where python3 >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Python not found in PATH
        echo Please install Python and add to PATH
        echo Download from: https://python.org/
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
    )
) else (
    set PYTHON_CMD=python
)

%PYTHON_CMD% --version

:: Clear npm cache
echo.
echo [5/8] Clearing npm cache...
npm cache clean --force

:: Remove and reinstall node_modules
echo.
echo [6/8] Reinstalling dependencies...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del package-lock.json
)

echo Installing fresh dependencies...
npm install --legacy-peer-deps --verbose
if errorlevel 1 (
    echo ERROR: npm install failed
    echo Trying with different flags...
    npm install --force --legacy-peer-deps
)

:: Install Python dependencies
echo.
echo [7/8] Installing Python dependencies...
%PYTHON_CMD% -m pip install --upgrade pip
%PYTHON_CMD% -m pip install flask flask-cors requests

:: Create Windows-specific startup script
echo.
echo [8/8] Creating optimized startup script...

(
echo @echo off
echo title Agent Platform - Production Start
echo color 0A
echo.
echo Starting Agent Platform...
echo.
echo Starting backend server...
echo start "Backend" cmd /c "%PYTHON_CMD% backend\simple_api.py"
echo.
echo timeout /t 3 /nobreak ^>nul
echo.
echo Starting frontend server...
echo start "Frontend" cmd /c "npm run dev"
echo.
echo timeout /t 8 /nobreak ^>nul
echo.
echo Opening browser...
echo start http://localhost:3000
echo.
echo echo Servers are starting...
echo echo Frontend: http://localhost:3000
echo echo Backend:  http://localhost:5000
echo echo.
echo echo Keep server windows open!
echo pause
) > Start-Agent-Platform-Fixed.bat

echo.
echo ========================================
echo    WINDOWS FIXES APPLIED!
echo ========================================
echo.
echo Next steps:
echo 1. Use Start-Agent-Platform-Fixed.bat to start
echo 2. Wait 10-15 seconds after starting
echo 3. If browser doesn't open, manually go to http://localhost:3000
echo 4. Keep the server command windows open
echo.
echo If you still have issues:
echo - Check Windows Defender/Antivirus settings
echo - Ensure ports 3000 and 5000 aren't blocked
echo - Run as Administrator if needed
echo.
pause