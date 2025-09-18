@echo off
echo ========================================
echo    Agent Observability Platform Setup
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Minimum version required: 18.0.0
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from https://python.org/
    echo Minimum version required: 3.8.0
    pause
    exit /b 1
)

echo [INFO] Node.js and Python detected ✓
echo.

:: Install frontend dependencies
echo [STEP 1/4] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

:: Install backend dependencies
echo [STEP 2/4] Installing backend dependencies...
pip install fastapi uvicorn sqlite3 python-multipart
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

:: Create database directory
echo [STEP 3/4] Setting up database...
if not exist "database" mkdir database

:: Create startup script
echo [STEP 4/4] Creating startup script...
(
echo @echo off
echo echo Starting Agent Observability Platform...
echo echo.
echo echo [1/2] Starting backend server...
echo start /B python backend/simple_api.py
echo timeout /t 3 /nobreak ^>nul
echo.
echo echo [2/2] Starting frontend...
echo start /B npm run dev
echo timeout /t 5 /nobreak ^>nul
echo.
echo echo ========================================
echo echo   Agent Observability Platform Ready!
echo echo ========================================
echo echo.
echo echo Frontend: http://localhost:8080
echo echo Backend:  http://localhost:8000
echo echo.
echo echo Press Ctrl+C to stop the servers
echo echo.
echo pause
) > start-app.bat

echo.
echo ========================================
echo        Setup Complete! ✓
echo ========================================
echo.
echo To start the application:
echo   1. Double-click 'start-app.bat'
echo   2. Wait for both servers to start
echo   3. Open http://localhost:8080 in your browser
echo.
echo To configure API keys:
echo   - Set OPENAI_API_KEY environment variable
echo   - Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
echo   - Set ANTHROPIC_API_KEY environment variable
echo.
pause