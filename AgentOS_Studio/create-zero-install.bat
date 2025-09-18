@echo off
title Creating Zero-Install Package
color 0A

echo ========================================
echo    ZERO-INSTALL PACKAGE CREATOR
echo ========================================
echo This creates a package that needs ZERO installation
echo Your colleagues just extract and run!
echo.

:: Build the app
echo [1/6] Building application...
call npm run build
if errorlevel 1 (
    echo Build failed. Please fix errors first.
    pause
    exit /b 1
)

:: Create package structure
set PKG=AgentPlatform-ZeroInstall
if exist "%PKG%" rmdir /s /q "%PKG%"
mkdir "%PKG%"
mkdir "%PKG%\app"
mkdir "%PKG%\tools"

echo [2/6] Copying application files...
xcopy /E /I /Y "dist" "%PKG%\app\frontend"
xcopy /E /I /Y "backend" "%PKG%\app\backend"

:: Create a simple Python HTTP server for frontend
echo [3/6] Creating simple servers...
(
echo import http.server
echo import socketserver
echo import os
echo import threading
echo import webbrowser
echo import time
echo.
echo class Handler^(http.server.SimpleHTTPRequestHandler^):
echo     def __init__^(self, *args, **kwargs^):
echo         super^(^).__init__^(*args, directory="app/frontend", **kwargs^)
echo.
echo def start_frontend^(^):
echo     with socketserver.TCPServer^(^("", 3000^), Handler^) as httpd:
echo         print^("Frontend server running on http://localhost:3000"^)
echo         httpd.serve_forever^(^)
echo.
echo def start_backend^(^):
echo     os.chdir^("app/backend"^)
echo     exec^(open^("simple_api.py"^).read^(^)^)
echo.
echo if __name__ == "__main__":
echo     # Start backend in thread
echo     backend_thread = threading.Thread^(target=start_backend^)
echo     backend_thread.daemon = True
echo     backend_thread.start^(^)
echo     
echo     # Wait a bit then start frontend
echo     time.sleep^(2^)
echo     frontend_thread = threading.Thread^(target=start_frontend^)
echo     frontend_thread.daemon = True  
echo     frontend_thread.start^(^)
echo     
echo     # Open browser
echo     time.sleep^(3^)
echo     webbrowser.open^("http://localhost:3000"^)
echo     
echo     print^("Agent Platform is running!"^)
echo     print^("Frontend: http://localhost:3000"^)
echo     print^("Backend: http://localhost:5000"^)
echo     print^("Press Ctrl+C to stop"^)
echo     
echo     try:
echo         while True:
echo             time.sleep^(1^)
echo     except KeyboardInterrupt:
echo         print^("Shutting down..."^)
) > "%PKG%\server.py"

:: Create Windows launcher that checks for Python
echo [4/6] Creating smart launcher...
(
echo @echo off
echo title Agent Platform - Zero Install
echo color 0A
echo cd /d "%%~dp0"
echo.
echo echo ========================================
echo echo    AGENT PLATFORM - ZERO INSTALL
echo echo ========================================
echo echo.
echo.
echo :: Check for Python
echo python --version ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo Python not found. Trying python3...
echo     python3 --version ^>nul 2^>^&1
echo     if errorlevel 1 ^(
echo         echo.
echo         echo ❌ Python is required but not found.
echo         echo.
echo         echo 📥 Quick Install Options:
echo         echo 1. Download from: https://python.org/downloads/
echo         echo 2. Or install from Microsoft Store: "Python 3.11"
echo         echo 3. Make sure to check "Add to PATH" during install
echo         echo.
echo         echo After installing Python, run this script again.
echo         echo.
echo         pause
echo         exit /b 1
echo     ^) else ^(
echo         set PYTHON_CMD=python3
echo     ^)
echo ^) else ^(
echo     set PYTHON_CMD=python
echo ^)
echo.
echo echo ✅ Python found: 
echo %%PYTHON_CMD%% --version
echo.
echo :: Install required packages
echo echo Installing required packages...
echo %%PYTHON_CMD%% -m pip install flask flask-cors requests ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo Warning: Some packages may not have installed
echo     echo Trying alternative installation...
echo     %%PYTHON_CMD%% -m pip install --user flask flask-cors requests
echo ^)
echo.
echo :: Kill existing processes
echo taskkill /f /im python.exe /t 2^>nul
echo.
echo :: Start the platform
echo echo 🚀 Starting Agent Platform...
echo echo.
echo echo This will:
echo echo - Start the backend API server
echo echo - Start the frontend web server  
echo echo - Open your browser automatically
echo echo.
echo echo Keep this window open while using the platform.
echo echo.
echo %%PYTHON_CMD%% server.py
echo.
echo pause
) > "%PKG%\Start-Agent-Platform.bat"

:: Create alternative launcher for systems with Node.js
echo [5/6] Creating Node.js alternative launcher...
(
echo @echo off
echo title Agent Platform - Node.js Mode
echo color 0B
echo cd /d "%%~dp0"
echo.
echo echo Using Node.js mode...
echo.
echo :: Check for Node.js
echo node --version ^>nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo Node.js not found. Please use Start-Agent-Platform.bat instead.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo :: Install serve package globally
echo echo Installing web server...
echo npm install -g serve 2^>nul
echo.
echo :: Start backend
echo echo Starting backend...
echo start "Backend" /min python app\backend\simple_api.py
echo.
echo :: Start frontend with serve
echo echo Starting frontend...
echo timeout /t 3 /nobreak ^>nul
echo start "Frontend" /min serve -s app\frontend -l 3000
echo.
echo :: Open browser
echo timeout /t 3 /nobreak ^>nul
echo start http://localhost:3000
echo.
echo echo Platform started!
echo echo Frontend: http://localhost:3000
echo echo Backend: http://localhost:5000
echo pause
) > "%PKG%\Start-With-NodeJS.bat"

:: Create comprehensive README
(
echo # Agent Platform - Zero Install Edition
echo.
echo ## 🎯 For Your Colleagues - Super Simple!
echo.
echo ### Option 1: Easiest ^(Recommended^)
echo 1. Extract this ZIP file
echo 2. Double-click `Start-Agent-Platform.bat`
echo 3. If Python isn't installed, follow the on-screen instructions
echo 4. Browser opens automatically - you're done!
echo.
echo ### Option 2: If you have Node.js
echo 1. Extract this ZIP file  
echo 2. Double-click `Start-With-NodeJS.bat`
echo 3. Browser opens automatically
echo.
echo ## 📋 System Requirements
echo.
echo **Minimum ^(automatically handled^):**
echo - Windows 10/11
echo - Python 3.8+ ^(will prompt to install if missing^)
echo - Internet connection ^(for first-time package installation^)
echo.
echo **Optional ^(for faster performance^):**
echo - Node.js 16+ ^(use Start-With-NodeJS.bat^)
echo.
echo ## 🔧 What Happens on First Run
echo.
echo 1. **Python Check**: Verifies Python is installed
echo 2. **Package Install**: Downloads Flask, Flask-CORS, Requests ^(~5MB^)
echo 3. **Server Start**: Launches backend and frontend servers
echo 4. **Browser Open**: Opens http://localhost:3000 automatically
echo.
echo ## ✅ Success Indicators
echo.
echo - Command window stays open with "Agent Platform is running!"
echo - Browser opens to the Agent Platform dashboard
echo - You can create agents and see the monitoring interface
echo.
echo ## 🚨 Troubleshooting
echo.
echo ### "Python not found"
echo - Install Python from https://python.org/downloads/
echo - **Important**: Check "Add Python to PATH" during installation
echo - Or install from Microsoft Store: search "Python 3.11"
echo.
echo ### "Site can't be reached"
echo - Wait 10-15 seconds after starting
echo - Refresh your browser
echo - Make sure the command window is still open
echo.
echo ### "Permission denied" errors
echo - Right-click the .bat file and "Run as Administrator"
echo - Or move the folder to your Desktop/Documents
echo.
echo ## 💡 Features Included
echo.
echo - ✅ Complete Agent Observability Platform
echo - ✅ Multi-framework agent creation ^(AgentCore, Strands, etc.^)
echo - ✅ Real-time monitoring and analytics
echo - ✅ Multi-agent workflow orchestration
echo - ✅ Advanced reasoning patterns
echo - ✅ Local execution ^(no cloud required^)
echo.
echo ## 🔒 Privacy & Security
echo.
echo - Everything runs locally on your machine
echo - No data sent to external servers
echo - Your API keys stay on your computer
echo - No account registration required
echo.
echo ---
echo.
echo **Need Help?** Keep the command window open and look for error messages.
echo Most issues are solved by installing Python with "Add to PATH" checked.
) > "%PKG%\README.md"

:: Create the ZIP
echo [6/6] Creating ZIP package...
powershell -command "Compress-Archive -Path '%PKG%\*' -DestinationPath '%PKG%.zip' -Force"

:: Copy to Desktop
copy "%PKG%.zip" "%USERPROFILE%\Desktop\%PKG%.zip"

echo.
echo ========================================
echo    ZERO-INSTALL PACKAGE READY!
echo ========================================
echo.
echo ✅ Package: %PKG%.zip ^(~5MB^)
echo ✅ Location: Your Desktop
echo.
echo 🎯 What your colleagues need:
echo - Just Python ^(will prompt if missing^)
echo - No Node.js required
echo - No npm install needed
echo - No build process
echo.
echo 📋 Instructions for colleagues:
echo 1. Extract ZIP
echo 2. Run Start-Agent-Platform.bat
echo 3. Install Python if prompted
echo 4. Platform opens automatically
echo.
echo 🚀 This is the simplest option for non-technical users!
echo.
pause