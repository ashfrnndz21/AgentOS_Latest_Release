#!/bin/bash
echo "Creating FIXED Windows package with better server startup..."
echo

# Build the app (assuming it's already built)
if [ ! -d "dist" ]; then
    echo "Building frontend..."
    npm run build
fi

# Create package folder
echo "Creating package structure..."
if [ -d "AgentPlatform-Fixed" ]; then
    rm -rf "AgentPlatform-Fixed"
fi
mkdir -p "AgentPlatform-Fixed"

# Copy files
echo "Copying application files..."
cp -r dist "AgentPlatform-Fixed/frontend"
cp -r backend "AgentPlatform-Fixed/backend"
cp package.json "AgentPlatform-Fixed/"

# Create IMPROVED Windows startup script with diagnostics
echo "Creating improved Windows startup script..."
cat > "AgentPlatform-Fixed/Start-Agent-Platform.bat" << 'EOF'
@echo off
title Agent Observability Platform
color 0A
cd /d "%~dp0"

echo ========================================
echo   Agent Observability Platform
echo   Startup Diagnostics
echo ========================================
echo.

:: Check if Python is installed
echo [STEP 1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
) else (
    python --version
    echo [OK] Python is available
)
echo.

:: Check if ports are available
echo [STEP 2/5] Checking if ports are available...
netstat -an | find "8080" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 8080 may be in use
    echo Trying to kill any existing processes...
    taskkill /f /im python.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -an | find "8000" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 8000 may be in use
    echo Trying to kill any existing processes...
    taskkill /f /im python.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)
echo [OK] Ports should be available now
echo.

:: Load API keys if they exist
echo [STEP 3/5] Loading API configuration...
if exist "api-keys.env" (
    echo [OK] API configuration found
    for /f "usebackq tokens=1,2 delims==" %%a in ("api-keys.env") do (
        if not "%%a"=="" if not "%%a"=="#" set %%a=%%b
    )
) else (
    echo [WARNING] No API configuration found
    echo Run Configure-API-Keys.bat to set up API keys
)
echo.

:: Start backend server
echo [STEP 4/5] Starting backend server...
echo Starting Python FastAPI server on port 8000...
start /B "Backend-Server" cmd /c "python backend\simple_api.py > backend.log 2>&1"

:: Wait and check if backend started
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

:: Test backend
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend server is running
) else (
    echo [WARNING] Backend server may not be running properly
    echo Check backend.log for errors
)
echo.

:: Start frontend server
echo [STEP 5/5] Starting frontend server...
echo Starting frontend server on port 8080...
start /B "Frontend-Server" cmd /c "python -m http.server 8080 --directory frontend > frontend.log 2>&1"

:: Wait and check if frontend started
echo Waiting for frontend to start...
timeout /t 3 /nobreak >nul

:: Test frontend
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend server is running
) else (
    echo [WARNING] Frontend server may not be running properly
    echo Check frontend.log for errors
)
echo.

echo ========================================
echo   Platform Status Check
echo ========================================
echo.
echo Testing connections...
echo.

:: Test backend connection
echo Backend (http://localhost:8000):
curl -s -w "Status: %%{http_code}\n" http://localhost:8000/health 2>nul || echo [FAILED] Cannot connect to backend

echo.
echo Frontend (http://localhost:8080):
curl -s -w "Status: %%{http_code}\n" -o nul http://localhost:8080 2>nul || echo [FAILED] Cannot connect to frontend

echo.
echo ========================================
echo   Platform Ready!
echo ========================================
echo.
echo URLs:
echo   Frontend: http://localhost:8080
echo   Backend:  http://localhost:8000
echo   Health:   http://localhost:8000/health
echo.
echo Features Available:
echo   • Agent Command Centre
echo   • Create Generic Agents
echo   • Create Strands Workflows
echo   • Multi-Agent Workflows  
echo   • Real-time Monitoring
echo   • Performance Analytics
echo.

:: Open browser
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:8080

echo.
echo ========================================
echo   Troubleshooting
echo ========================================
echo.
echo If browser shows "site can't be reached":
echo 1. Check that both servers started (see messages above)
echo 2. Try manually: http://localhost:8080
echo 3. Check firewall settings
echo 4. Look at backend.log and frontend.log for errors
echo 5. Make sure Python is installed and in PATH
echo.
echo Press any key to stop servers and exit...
pause >nul

echo.
echo Stopping servers...
taskkill /f /im python.exe /t >nul 2>&1
echo Servers stopped. Goodbye!
timeout /t 2 /nobreak >nul
EOF

# Create troubleshooting script
echo "Creating troubleshooting script..."
cat > "AgentPlatform-Fixed/Troubleshoot.bat" << 'EOF'
@echo off
title Troubleshooting - Agent Platform
echo ========================================
echo   Agent Platform Troubleshooting
echo ========================================
echo.

echo Checking system requirements...
echo.

:: Check Python
echo [1] Python Installation:
python --version 2>nul && echo [OK] Python is installed || echo [ERROR] Python not found - install from https://python.org/
echo.

:: Check pip
echo [2] Pip Installation:
pip --version 2>nul && echo [OK] Pip is available || echo [ERROR] Pip not found
echo.

:: Check required packages
echo [3] Required Python Packages:
pip show fastapi >nul 2>&1 && echo [OK] FastAPI available || echo [MISSING] FastAPI - run: pip install fastapi
pip show uvicorn >nul 2>&1 && echo [OK] Uvicorn available || echo [MISSING] Uvicorn - run: pip install uvicorn
echo.

:: Check ports
echo [4] Port Availability:
netstat -an | find "8080" >nul && echo [WARNING] Port 8080 in use || echo [OK] Port 8080 available
netstat -an | find "8000" >nul && echo [WARNING] Port 8000 in use || echo [OK] Port 8000 available
echo.

:: Check files
echo [5] Required Files:
if exist "backend\simple_api.py" (echo [OK] Backend file exists) else (echo [ERROR] Backend file missing)
if exist "frontend\index.html" (echo [OK] Frontend files exist) else (echo [ERROR] Frontend files missing)
echo.

:: Check logs
echo [6] Recent Logs:
if exist "backend.log" (
    echo Backend log (last 5 lines):
    powershell "Get-Content backend.log -Tail 5"
) else (
    echo No backend log found
)
echo.
if exist "frontend.log" (
    echo Frontend log (last 5 lines):
    powershell "Get-Content frontend.log -Tail 5"
) else (
    echo No frontend log found
)

echo.
echo ========================================
echo   Quick Fixes
echo ========================================
echo.
echo If servers won't start:
echo 1. Install missing packages: pip install fastapi uvicorn python-multipart
echo 2. Kill existing processes: taskkill /f /im python.exe
echo 3. Check Windows Firewall settings
echo 4. Try running as Administrator
echo.
echo If browser can't connect:
echo 1. Wait 10-15 seconds after starting
echo 2. Try http://127.0.0.1:8080 instead
echo 3. Check antivirus/firewall blocking
echo 4. Try different browser
echo.
pause
EOF

# Create simple manual start script
echo "Creating manual start script..."
cat > "AgentPlatform-Fixed/Manual-Start.bat" << 'EOF'
@echo off
echo Manual startup for Agent Platform
echo.
echo Step 1: Install dependencies
pip install fastapi uvicorn python-multipart
echo.
echo Step 2: Start backend (keep this window open)
echo Starting backend on http://localhost:8000
python backend\simple_api.py
pause
EOF

# Create frontend-only script
cat > "AgentPlatform-Fixed/Start-Frontend-Only.bat" << 'EOF'
@echo off
echo Starting frontend server only...
echo Make sure backend is running separately!
echo.
echo Frontend will be available at: http://localhost:8080
python -m http.server 8080 --directory frontend
pause
EOF

# Update the API configuration script
cat > "AgentPlatform-Fixed/Configure-API-Keys.bat" << 'EOF'
@echo off
title API Keys Configuration
color 0B
echo ========================================
echo   API Keys Configuration
echo ========================================
echo.
echo This will configure API keys for the Agent Platform.
echo You need at least ONE of these keys to use the platform:
echo.
echo   • OpenAI API Key (for Generic Agents)
echo   • AWS Bedrock (for Strands Workflows)  
echo   • Anthropic API Key (for Claude models)
echo.

if exist "api-keys.env" (
    echo Current configuration found:
    type "api-keys.env"
    echo.
    set /p "update=Update configuration? (y/n): "
    if /i not "%update%"=="y" goto :end
)

echo.
echo Enter your API keys (press Enter to skip):
echo.
set /p "openai_key=OpenAI API Key: "
set /p "aws_access=AWS Access Key ID: "
set /p "aws_secret=AWS Secret Access Key: "
set /p "anthropic_key=Anthropic API Key: "

echo.
echo Saving configuration...
(
echo # Agent Platform API Configuration
echo # Generated on %date% at %time%
echo.
echo # OpenAI Configuration (for Generic Agents)
echo OPENAI_API_KEY=%openai_key%
echo.
echo # AWS Bedrock Configuration (for Strands Workflows)
echo AWS_ACCESS_KEY_ID=%aws_access%
echo AWS_SECRET_ACCESS_KEY=%aws_secret%
echo AWS_DEFAULT_REGION=us-east-1
echo.
echo # Anthropic Configuration (for Claude models)
echo ANTHROPIC_API_KEY=%anthropic_key%
) > "api-keys.env"

echo.
echo ✅ Configuration saved to api-keys.env
echo.
echo You can now start the platform with Start-Agent-Platform.bat
echo.
:end
pause
EOF

# Create comprehensive README
cat > "AgentPlatform-Fixed/README.md" << 'EOF'
# 🚀 Agent Observability Platform - Windows Edition

## 🎯 Quick Start (3 Steps)

### Step 1: Configure API Keys
- Double-click `Configure-API-Keys.bat`
- Enter at least ONE API key (OpenAI, AWS Bedrock, or Anthropic)

### Step 2: Start Platform
- Double-click `Start-Agent-Platform.bat`
- Wait for both servers to start (~10-15 seconds)
- Browser opens automatically

### Step 3: Use the Platform
- **Main Dashboard**: http://localhost:8080
- **Agent Creation**: http://localhost:8080/agent-command  
- **Monitoring**: http://localhost:8080/backend-validation

## 🛠️ System Requirements
- Windows 10/11
- Python 3.8+ (with pip)
- Internet connection
- Ports 8080 and 8000 available

## 🔧 If "Site Can't Be Reached"

### Quick Fixes:
1. **Wait longer** - servers need 10-15 seconds to start
2. **Check Python** - run `python --version` in Command Prompt
3. **Install packages** - run `pip install fastapi uvicorn python-multipart`
4. **Kill processes** - run `taskkill /f /im python.exe`
5. **Try manual start** - use `Manual-Start.bat`
6. **Run troubleshooting** - use `Troubleshoot.bat`

### Alternative URLs:
- Try: http://127.0.0.1:8080
- Try: http://localhost:8080/agent-command

## 📋 Available Scripts

- `Start-Agent-Platform.bat` - Main launcher with diagnostics
- `Configure-API-Keys.bat` - Set up API keys
- `Troubleshoot.bat` - Diagnose issues
- `Manual-Start.bat` - Manual backend startup
- `Start-Frontend-Only.bat` - Frontend only

## 🔑 API Keys Setup

### OpenAI (for Generic Agents)
1. Go to: https://platform.openai.com/api-keys
2. Create new API key (starts with `sk-`)

### AWS Bedrock (for Strands Workflows)
1. Go to AWS Console → IAM
2. Create user with Bedrock permissions
3. Generate Access Key ID and Secret Access Key

### Anthropic (for Claude Models)
1. Go to: https://console.anthropic.com/
2. Generate API key

## 🎯 Platform Features

### Agent Creation
- **Generic Agents**: Basic AI agents for general tasks
- **Strands Workflows**: Advanced reasoning with chain-of-thought, reflection, memory
- **Multi-Agent Workflows**: Coordinate multiple agents for complex tasks

### Real-time Monitoring
- Live agent performance dashboard
- Success rates, response times, error tracking
- Framework-specific analytics and insights
- Live server logs and debugging tools

## 🆘 Need Help?

1. Run `Troubleshoot.bat` for system diagnostics
2. Check `backend.log` and `frontend.log` for errors
3. Ensure Python and pip are installed
4. Make sure ports 8080 and 8000 are not blocked
5. Try running as Administrator if needed

**Enjoy the platform!** 🎉
EOF

# Create ZIP file
echo "Creating ZIP file..."
zip -r "AgentPlatform-Windows-FIXED.zip" "AgentPlatform-Fixed"

# Copy to Desktop
echo "Copying to Desktop..."
cp "AgentPlatform-Windows-FIXED.zip" ~/Desktop/

# Clean up
rm -rf "AgentPlatform-Fixed"

echo
echo "========================================"
echo "   FIXED ZIP FILE READY! ✅"
echo "========================================"
echo
echo "📁 Location: ~/Desktop/AgentPlatform-Windows-FIXED.zip"
echo "🔧 This version includes:"
echo "   • Better server startup with diagnostics"
echo "   • Troubleshooting tools"
echo "   • Multiple startup options"
echo "   • Comprehensive error checking"
echo "   • Manual fallback scripts"
echo
echo "📋 Your colleagues should:"
echo "1. Extract the ZIP file"
echo "2. Run Configure-API-Keys.bat"
echo "3. Run Start-Agent-Platform.bat"
echo "4. If issues, run Troubleshoot.bat"
echo
echo "This should fix the 'site can't be reached' issue!"
echo