@echo off
echo ========================================
echo   Building Portable Agent Platform
echo ========================================
echo.

:: Create portable directory structure
echo [STEP 1/6] Creating portable directory structure...
if exist "portable-agent-platform" rmdir /s /q "portable-agent-platform"
mkdir "portable-agent-platform"
mkdir "portable-agent-platform\app"
mkdir "portable-agent-platform\runtime"
mkdir "portable-agent-platform\data"
mkdir "portable-agent-platform\config"

:: Build frontend for production
echo [STEP 2/6] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)

:: Copy built frontend
echo [STEP 3/6] Copying frontend files...
xcopy /E /I /Y "dist" "portable-agent-platform\app\frontend"

:: Copy backend
echo [STEP 4/6] Copying backend files...
xcopy /E /I /Y "backend" "portable-agent-platform\app\backend"

:: Create portable launcher
echo [STEP 5/6] Creating portable launcher...
(
echo @echo off
echo title Agent Observability Platform
echo cd /d "%%~dp0"
echo.
echo echo ========================================
echo echo   Agent Observability Platform
echo echo ========================================
echo echo.
echo echo Starting servers...
echo.
echo :: Start backend
echo echo [1/2] Starting backend server...
echo start /B /MIN python app\backend\simple_api.py
echo timeout /t 3 /nobreak ^>nul
echo.
echo :: Start frontend server
echo echo [2/2] Starting frontend server...
echo start /B /MIN python -m http.server 8080 --directory app\frontend
echo timeout /t 2 /nobreak ^>nul
echo.
echo echo ========================================
echo echo     Platform Ready! ✓
echo echo ========================================
echo echo.
echo echo Frontend: http://localhost:8080
echo echo Backend:  http://localhost:8000
echo echo.
echo echo Opening browser...
echo start http://localhost:8080
echo.
echo echo Press any key to stop servers and exit...
echo pause ^>nul
echo.
echo echo Stopping servers...
echo taskkill /f /im python.exe ^>nul 2^>^&1
echo echo Goodbye!
) > "portable-agent-platform\Start-Agent-Platform.bat"

:: Create configuration file
echo [STEP 6/6] Creating configuration...
(
echo # Agent Observability Platform Configuration
echo # Edit these values to configure your API keys
echo.
echo # OpenAI Configuration
echo OPENAI_API_KEY=your_openai_api_key_here
echo.
echo # AWS Bedrock Configuration  
echo AWS_ACCESS_KEY_ID=your_aws_access_key_here
echo AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
echo AWS_DEFAULT_REGION=us-east-1
echo.
echo # Anthropic Configuration
echo ANTHROPIC_API_KEY=your_anthropic_api_key_here
echo.
echo # Server Configuration
echo FRONTEND_PORT=8080
echo BACKEND_PORT=8000
) > "portable-agent-platform\config\api-keys.env"

:: Create README
(
echo # Agent Observability Platform - Portable Edition
echo.
echo ## Quick Start
echo 1. Double-click `Start-Agent-Platform.bat`
echo 2. Wait for servers to start
echo 3. Browser will open automatically to http://localhost:8080
echo.
echo ## Configuration
echo Edit `config\api-keys.env` to add your API keys:
echo - OpenAI API Key
echo - AWS Bedrock Credentials  
echo - Anthropic API Key
echo.
echo ## Features
echo - Agent Creation ^(Generic, Strands, Multi-Agent^)
echo - Real-time Observability Dashboard
echo - Performance Monitoring
echo - Error Tracking
echo - Framework-specific Analytics
echo.
echo ## Requirements
echo - Windows 10/11
echo - Python 3.8+ ^(will be bundled in future versions^)
echo - Internet connection for API calls
echo.
echo ## Support
echo For issues or questions, check the documentation or logs.
) > "portable-agent-platform\README.md"

echo.
echo ========================================
echo     Portable Build Complete! ✓
echo ========================================
echo.
echo Portable app created in: portable-agent-platform\
echo.
echo To distribute:
echo   1. Zip the 'portable-agent-platform' folder
echo   2. Users extract and run 'Start-Agent-Platform.bat'
echo.
echo To test locally:
echo   1. cd portable-agent-platform
echo   2. Double-click 'Start-Agent-Platform.bat'
echo.
pause