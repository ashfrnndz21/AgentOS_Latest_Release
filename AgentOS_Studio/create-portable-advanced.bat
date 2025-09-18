@echo off
echo ========================================
echo  Advanced Portable Agent Platform Builder
echo ========================================
echo.

:: Check if we have the tools needed
where curl >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] curl is required but not found
    echo Please install curl or use Windows 10/11 which includes it
    pause
    exit /b 1
)

:: Create advanced portable structure
echo [STEP 1/8] Creating advanced portable structure...
if exist "agent-platform-portable" rmdir /s /q "agent-platform-portable"
mkdir "agent-platform-portable"
mkdir "agent-platform-portable\runtime\node"
mkdir "agent-platform-portable\runtime\python"
mkdir "agent-platform-portable\app"
mkdir "agent-platform-portable\data"
mkdir "agent-platform-portable\config"
mkdir "agent-platform-portable\logs"

:: Download portable Node.js
echo [STEP 2/8] Downloading portable Node.js...
echo This may take a few minutes...
curl -L -o "node-portable.zip" "https://nodejs.org/dist/v18.17.0/node-v18.17.0-win-x64.zip"
if %errorlevel% neq 0 (
    echo [WARNING] Failed to download Node.js. Users will need Node.js installed.
) else (
    echo Extracting Node.js...
    powershell -command "Expand-Archive -Path 'node-portable.zip' -DestinationPath 'temp-node' -Force"
    xcopy /E /I /Y "temp-node\node-v18.17.0-win-x64\*" "agent-platform-portable\runtime\node\"
    rmdir /s /q "temp-node"
    del "node-portable.zip"
)

:: Download portable Python (embeddable)
echo [STEP 3/8] Downloading portable Python...
curl -L -o "python-portable.zip" "https://www.python.org/ftp/python/3.11.5/python-3.11.5-embed-amd64.zip"
if %errorlevel% neq 0 (
    echo [WARNING] Failed to download Python. Users will need Python installed.
) else (
    echo Extracting Python...
    powershell -command "Expand-Archive -Path 'python-portable.zip' -DestinationPath 'agent-platform-portable\runtime\python' -Force"
    del "python-portable.zip"
    
    :: Configure Python
    echo import sys; sys.path.append('Lib/site-packages') > "agent-platform-portable\runtime\python\sitecustomize.py"
)

:: Build and copy application
echo [STEP 4/8] Building application...
call npm run build
xcopy /E /I /Y "dist" "agent-platform-portable\app\frontend"
xcopy /E /I /Y "backend" "agent-platform-portable\app\backend"

:: Install Python dependencies to portable location
echo [STEP 5/8] Installing Python dependencies...
if exist "agent-platform-portable\runtime\python\python.exe" (
    "agent-platform-portable\runtime\python\python.exe" -m pip install --target "agent-platform-portable\runtime\python\Lib\site-packages" fastapi uvicorn python-multipart
)

:: Create advanced launcher
echo [STEP 6/8] Creating advanced launcher...
(
echo @echo off
echo title Agent Observability Platform - Portable Edition
echo cd /d "%%~dp0"
echo.
echo :: Set up environment
echo set PATH=%%CD%%\runtime\node;%%CD%%\runtime\python;%%PATH%%
echo set PYTHONPATH=%%CD%%\runtime\python\Lib\site-packages
echo.
echo :: Load configuration
echo if exist "config\api-keys.env" (
echo     for /f "usebackq tokens=1,2 delims==" %%%%a in ("config\api-keys.env"^) do (
echo         if not "%%%%a"=="" if not "%%%%a"=="^#" set %%%%a=%%%%b
echo     ^)
echo ^)
echo.
echo echo ========================================
echo echo   Agent Observability Platform
echo echo   Portable Edition v1.0
echo echo ========================================
echo echo.
echo echo Checking runtime...
echo.
echo :: Check if we have embedded runtimes
echo if exist "runtime\python\python.exe" (
echo     echo [✓] Using embedded Python runtime
echo     set PYTHON_CMD=runtime\python\python.exe
echo ^) else (
echo     echo [!] Using system Python
echo     set PYTHON_CMD=python
echo ^)
echo.
echo if exist "runtime\node\node.exe" (
echo     echo [✓] Using embedded Node.js runtime
echo     set NODE_CMD=runtime\node\node.exe
echo ^) else (
echo     echo [!] Using system Node.js
echo     set NODE_CMD=node
echo ^)
echo.
echo echo Starting servers...
echo.
echo :: Start backend server
echo echo [1/2] Starting backend server on port 8000...
echo start /B /MIN "Backend" %%PYTHON_CMD%% app\backend\simple_api.py
echo timeout /t 3 /nobreak ^>nul
echo.
echo :: Start frontend server  
echo echo [2/2] Starting frontend server on port 8080...
echo start /B /MIN "Frontend" %%PYTHON_CMD%% -m http.server 8080 --directory app\frontend
echo timeout /t 2 /nobreak ^>nul
echo.
echo :: Check if servers started
echo echo Checking server status...
echo curl -s http://localhost:8000/health ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 (
echo     echo [✓] Backend server is running
echo ^) else (
echo     echo [!] Backend server may not be running
echo ^)
echo.
echo curl -s http://localhost:8080 ^>nul 2^>^&1  
echo if %%errorlevel%% equ 0 (
echo     echo [✓] Frontend server is running
echo ^) else (
echo     echo [!] Frontend server may not be running
echo ^)
echo.
echo echo ========================================
echo echo     Platform Ready! 🚀
echo echo ========================================
echo echo.
echo echo 🌐 Frontend: http://localhost:8080
echo echo 🔧 Backend:  http://localhost:8000
echo echo 📊 Health:   http://localhost:8000/health
echo echo.
echo echo Opening browser in 3 seconds...
echo timeout /t 3 /nobreak ^>nul
echo start http://localhost:8080
echo.
echo echo ========================================
echo echo Press any key to stop servers and exit
echo echo ========================================
echo pause ^>nul
echo.
echo echo Stopping servers...
echo taskkill /f /im python.exe /t ^>nul 2^>^&1
echo taskkill /f /im node.exe /t ^>nul 2^>^&1
echo echo.
echo echo Servers stopped. Goodbye! 👋
echo timeout /t 2 /nobreak ^>nul
) > "agent-platform-portable\🚀 Start Agent Platform.bat"

:: Create configuration GUI
echo [STEP 7/8] Creating configuration tools...
(
echo @echo off
echo title API Configuration
echo cd /d "%%~dp0"
echo.
echo echo ========================================
echo echo    API Keys Configuration
echo echo ========================================
echo echo.
echo echo Current configuration:
echo if exist "config\api-keys.env" type "config\api-keys.env"
echo echo.
echo echo ----------------------------------------
echo echo.
echo set /p "openai_key=Enter OpenAI API Key (or press Enter to skip): "
echo set /p "aws_access=Enter AWS Access Key ID (or press Enter to skip): "
echo set /p "aws_secret=Enter AWS Secret Access Key (or press Enter to skip): "
echo set /p "anthropic_key=Enter Anthropic API Key (or press Enter to skip): "
echo.
echo echo Saving configuration...
echo (
echo # Agent Observability Platform Configuration
echo # Generated on %%date%% at %%time%%
echo.
echo # OpenAI Configuration
echo OPENAI_API_KEY=%%openai_key%%
echo.
echo # AWS Bedrock Configuration
echo AWS_ACCESS_KEY_ID=%%aws_access%%
echo AWS_SECRET_ACCESS_KEY=%%aws_secret%%
echo AWS_DEFAULT_REGION=us-east-1
echo.
echo # Anthropic Configuration  
echo ANTHROPIC_API_KEY=%%anthropic_key%%
echo.
echo # Server Configuration
echo FRONTEND_PORT=8080
echo BACKEND_PORT=8000
echo ^) ^> "config\api-keys.env"
echo.
echo echo ✓ Configuration saved!
echo echo.
echo echo You can now start the platform with:
echo echo "🚀 Start Agent Platform.bat"
echo echo.
echo pause
) > "agent-platform-portable\⚙️ Configure API Keys.bat"

:: Create documentation
echo [STEP 8/8] Creating documentation...
(
echo # 🚀 Agent Observability Platform - Portable Edition
echo.
echo ## 📦 What's Included
echo - Complete Agent Observability Platform
echo - Embedded Node.js and Python runtimes ^(when available^)
echo - Pre-built frontend and backend
echo - Configuration tools
echo - One-click launcher
echo.
echo ## 🎯 Quick Start
echo 1. **Configure API Keys**: Double-click `⚙️ Configure API Keys.bat`
echo 2. **Start Platform**: Double-click `🚀 Start Agent Platform.bat`  
echo 3. **Open Browser**: Goes to http://localhost:8080 automatically
echo.
echo ## 🔧 Features
echo - **Agent Creation**: Create Generic, Strands, and Multi-Agent workflows
echo - **Real-time Monitoring**: Live observability dashboard
echo - **Performance Analytics**: Success rates, response times, error tracking
echo - **Framework Support**: Multiple AI frameworks with specialized monitoring
echo - **Portable**: No installation required, runs from any folder
echo.
echo ## 📋 Requirements
echo - Windows 10/11 ^(64-bit^)
echo - Internet connection for API calls
echo - API keys for AI services ^(OpenAI, AWS Bedrock, Anthropic^)
echo.
echo ## 🔑 API Key Setup
echo ### Option 1: Use Configuration Tool
echo Run `⚙️ Configure API Keys.bat` and enter your keys
echo.
echo ### Option 2: Manual Configuration
echo Edit `config\api-keys.env` with your API keys:
echo ```
echo OPENAI_API_KEY=sk-your-key-here
echo AWS_ACCESS_KEY_ID=your-access-key
echo AWS_SECRET_ACCESS_KEY=your-secret-key
echo ANTHROPIC_API_KEY=your-anthropic-key
echo ```
echo.
echo ## 🌐 Access Points
echo - **Main Dashboard**: http://localhost:8080
echo - **Agent Command Centre**: http://localhost:8080/agent-command
echo - **Observability Platform**: http://localhost:8080/backend-validation
echo - **API Health Check**: http://localhost:8000/health
echo.
echo ## 🛠️ Troubleshooting
echo ### Servers Won't Start
echo - Check if ports 8080 and 8000 are available
echo - Ensure API keys are configured correctly
echo - Check logs in the `logs` folder
echo.
echo ### API Errors
echo - Verify API keys in `config\api-keys.env`
echo - Check internet connection
echo - Ensure API keys have proper permissions
echo.
echo ### Browser Issues
echo - Try refreshing the page
echo - Clear browser cache
echo - Try a different browser
echo.
echo ## 📁 Folder Structure
echo ```
echo agent-platform-portable\
echo ├── 🚀 Start Agent Platform.bat    # Main launcher
echo ├── ⚙️ Configure API Keys.bat       # Configuration tool
echo ├── README.md                       # This file
echo ├── app\                           # Application files
echo │   ├── frontend\                  # Built React app
echo │   └── backend\                   # Python FastAPI server
echo ├── runtime\                      # Embedded runtimes
echo │   ├── node\                     # Node.js runtime
echo │   └── python\                   # Python runtime
echo ├── config\                       # Configuration files
echo │   └── api-keys.env              # API keys configuration
echo ├── data\                         # Application data
echo └── logs\                         # Application logs
echo ```
echo.
echo ## 🎉 Enjoy!
echo You now have a complete, portable Agent Observability Platform!
echo.
echo For support or questions, refer to the application documentation.
) > "agent-platform-portable\README.md"

echo.
echo ========================================
echo   Advanced Portable Build Complete! ✓
echo ========================================
echo.
echo 📦 Portable app created in: agent-platform-portable\
echo 📁 Size: ~50-100MB ^(with embedded runtimes^)
echo.
echo 🎯 To distribute:
echo   1. Zip the 'agent-platform-portable' folder
echo   2. Users extract and run '🚀 Start Agent Platform.bat'
echo.
echo 🧪 To test locally:
echo   1. cd agent-platform-portable
echo   2. Run '⚙️ Configure API Keys.bat' ^(optional^)
echo   3. Double-click '🚀 Start Agent Platform.bat'
echo.
echo 🌟 Features:
echo   - Embedded Node.js and Python runtimes
echo   - One-click configuration
echo   - Automatic browser opening
echo   - No installation required
echo   - Runs from USB drive
echo.
pause