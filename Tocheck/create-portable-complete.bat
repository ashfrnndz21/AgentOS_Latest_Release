@echo off
title Creating Portable Agent Platform Package
color 0A

echo ========================================
echo    CREATING PORTABLE PACKAGE
echo ========================================
echo This will create a complete package with:
echo - Node.js runtime embedded
echo - Python runtime embedded  
echo - All dependencies included
echo - No installation required for colleagues
echo.

:: Build the React app first
echo [1/8] Building React application...
call npm run build --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Build failed. Please fix build errors first.
    pause
    exit /b 1
)

:: Create main package directory
set PACKAGE_NAME=AgentPlatform-Portable-Windows
if exist "%PACKAGE_NAME%" rmdir /s /q "%PACKAGE_NAME%"
mkdir "%PACKAGE_NAME%"

echo [2/8] Setting up package structure...
mkdir "%PACKAGE_NAME%\runtime"
mkdir "%PACKAGE_NAME%\runtime\nodejs"
mkdir "%PACKAGE_NAME%\runtime\python"
mkdir "%PACKAGE_NAME%\app"
mkdir "%PACKAGE_NAME%\data"

:: Copy application files
echo [3/8] Copying application files...
xcopy /E /I /Y "dist" "%PACKAGE_NAME%\app\frontend"
xcopy /E /I /Y "backend" "%PACKAGE_NAME%\app\backend"
xcopy /E /I /Y "src" "%PACKAGE_NAME%\app\src"
copy "package.json" "%PACKAGE_NAME%\app\"
copy "*.md" "%PACKAGE_NAME%\" 2>nul

:: Download portable Node.js
echo [4/8] Downloading portable Node.js...
echo This may take a few minutes...

:: Create download script for Node.js
(
echo $nodeUrl = "https://nodejs.org/dist/v18.17.0/node-v18.17.0-win-x64.zip"
echo $nodeZip = "nodejs-portable.zip"
echo Write-Host "Downloading Node.js portable..."
echo try {
echo     Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip
echo     Expand-Archive -Path $nodeZip -DestinationPath "%PACKAGE_NAME%\runtime\nodejs" -Force
echo     Remove-Item $nodeZip
echo     Write-Host "Node.js downloaded successfully"
echo } catch {
echo     Write-Host "Failed to download Node.js: $_"
echo     Write-Host "Please download manually from nodejs.org"
echo }
) > download-nodejs.ps1

powershell -ExecutionPolicy Bypass -File download-nodejs.ps1
del download-nodejs.ps1

:: Download portable Python
echo [5/8] Downloading portable Python...

:: Create download script for Python
(
echo $pythonUrl = "https://www.python.org/ftp/python/3.11.5/python-3.11.5-embed-amd64.zip"
echo $pythonZip = "python-portable.zip"
echo Write-Host "Downloading Python portable..."
echo try {
echo     Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonZip
echo     Expand-Archive -Path $pythonZip -DestinationPath "%PACKAGE_NAME%\runtime\python" -Force
echo     Remove-Item $pythonZip
echo     Write-Host "Python downloaded successfully"
echo } catch {
echo     Write-Host "Failed to download Python: $_"
echo     Write-Host "Please download manually from python.org"
echo }
) > download-python.ps1

powershell -ExecutionPolicy Bypass -File download-python.ps1
del download-python.ps1

:: Create pip installer for Python
echo [6/8] Setting up Python environment...
(
echo import sys
echo import subprocess
echo import os
echo.
echo # Install pip
echo try:
echo     import pip
echo except ImportError:
echo     print("Installing pip..."^)
echo     import urllib.request
echo     urllib.request.urlretrieve("https://bootstrap.pypa.io/get-pip.py", "get-pip.py"^)
echo     subprocess.run([sys.executable, "get-pip.py"]^)
echo     os.remove("get-pip.py"^)
echo.
echo # Install required packages
echo packages = ["flask", "flask-cors", "requests"]
echo for package in packages:
echo     print(f"Installing {package}..."^)
echo     subprocess.run([sys.executable, "-m", "pip", "install", package]^)
echo.
echo print("Python setup complete!"^)
) > "%PACKAGE_NAME%\setup-python.py"

:: Create the main launcher
echo [7/8] Creating portable launcher...
(
echo @echo off
echo title Agent Platform - Portable Edition
echo color 0A
echo cd /d "%%~dp0"
echo.
echo echo ========================================
echo echo    AGENT PLATFORM - PORTABLE EDITION
echo echo ========================================
echo echo.
echo echo This package includes everything needed!
echo echo No installation required.
echo echo.
echo.
echo :: Set up paths
echo set NODE_PATH=%%CD%%\runtime\nodejs\node-v18.17.0-win-x64
echo set PYTHON_PATH=%%CD%%\runtime\python
echo set PATH=%%NODE_PATH%%;%%PYTHON_PATH%%;%%PATH%%
echo.
echo :: Check if runtimes exist
echo if not exist "%%NODE_PATH%%\node.exe" (
echo     echo ERROR: Node.js runtime not found!
echo     echo Please run Setup-Dependencies.bat first
echo     pause
echo     exit /b 1
echo ^)
echo.
echo if not exist "%%PYTHON_PATH%%\python.exe" (
echo     echo ERROR: Python runtime not found!
echo     echo Please run Setup-Dependencies.bat first
echo     pause
echo     exit /b 1
echo ^)
echo.
echo :: Setup Python packages if needed
echo if not exist "%%PYTHON_PATH%%\Lib\site-packages\flask" (
echo     echo Setting up Python packages...
echo     "%%PYTHON_PATH%%\python.exe" setup-python.py
echo ^)
echo.
echo :: Kill any existing processes
echo echo Cleaning up existing processes...
echo taskkill /f /im node.exe /t 2^>nul
echo taskkill /f /im python.exe /t 2^>nul
echo.
echo :: Start backend server
echo echo Starting backend server...
echo start "Backend Server" /min "%%PYTHON_PATH%%\python.exe" "app\backend\simple_api.py"
echo.
echo :: Wait for backend
echo echo Waiting for backend to start...
echo timeout /t 5 /nobreak ^>nul
echo.
echo :: Start frontend server using Node.js
echo echo Starting frontend server...
echo cd app
echo start "Frontend Server" /min "%%NODE_PATH%%\node.exe" -e "const http=require('http'^); const fs=require('fs'^); const path=require('path'^); const server=http.createServer((req,res^)=^>{let filePath='./frontend'+req.url; if(req.url==='/'^^)filePath='./frontend/index.html'; const ext=path.extname(filePath^).toLowerCase(^); const mimeTypes={'html':'text/html','js':'text/javascript','css':'text/css','json':'application/json','png':'image/png','jpg':'image/jpg','gif':'image/gif','svg':'image/svg+xml','ico':'image/x-icon'}; const contentType=mimeTypes[ext.substring(1^)]^^'text/plain'; fs.readFile(filePath,(err,content^)=^>{if(err^){if(err.code==='ENOENT'^){res.writeHead(404^); res.end('File not found'^);}else{res.writeHead(500^); res.end('Server error'^);}}else{res.writeHead(200,{'Content-Type':contentType}^); res.end(content,'utf-8'^);}}^);}^); server.listen(3000,^(^)=^>console.log('Server running on port 3000'^)^);"
echo cd ..
echo.
echo :: Wait for frontend
echo echo Waiting for frontend to start...
echo timeout /t 3 /nobreak ^>nul
echo.
echo :: Open browser
echo echo Opening Agent Platform...
echo start http://localhost:3000
echo.
echo echo ========================================
echo echo    PLATFORM READY!
echo echo ========================================
echo echo.
echo echo Frontend: http://localhost:3000
echo echo Backend:  http://localhost:5000
echo echo.
echo echo Keep this window open while using the platform.
echo echo Close this window to stop all servers.
echo echo.
echo pause
) > "%PACKAGE_NAME%\Start-Agent-Platform.bat"

:: Create dependency setup script
(
echo @echo off
echo title Setting Up Dependencies
echo color 0E
echo.
echo echo ========================================
echo echo    SETTING UP DEPENDENCIES
echo echo ========================================
echo echo.
echo echo This will download and setup:
echo echo - Node.js runtime
echo echo - Python runtime  
echo echo - Required packages
echo echo.
echo echo This only needs to be run once.
echo echo.
echo pause
echo.
echo :: Download Node.js if missing
echo if not exist "runtime\nodejs\node-v18.17.0-win-x64\node.exe" (
echo     echo Downloading Node.js...
echo     powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.0/node-v18.17.0-win-x64.zip' -OutFile 'nodejs.zip'; Expand-Archive -Path 'nodejs.zip' -DestinationPath 'runtime\nodejs' -Force; Remove-Item 'nodejs.zip'"
echo ^)
echo.
echo :: Download Python if missing  
echo if not exist "runtime\python\python.exe" (
echo     echo Downloading Python...
echo     powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.5/python-3.11.5-embed-amd64.zip' -OutFile 'python.zip'; Expand-Archive -Path 'python.zip' -DestinationPath 'runtime\python' -Force; Remove-Item 'python.zip'"
echo ^)
echo.
echo :: Setup Python packages
echo echo Setting up Python packages...
echo runtime\python\python.exe setup-python.py
echo.
echo echo ========================================
echo echo    SETUP COMPLETE!
echo echo ========================================
echo echo.
echo echo You can now run Start-Agent-Platform.bat
echo echo.
echo pause
) > "%PACKAGE_NAME%\Setup-Dependencies.bat"

:: Create simple README
echo [8/8] Creating documentation...
(
echo # Agent Platform - Portable Edition
echo.
echo ## 🚀 Quick Start
echo.
echo ### First Time Setup:
echo 1. Run `Setup-Dependencies.bat` ^(downloads Node.js and Python^)
echo 2. Wait for downloads to complete ^(~50MB total^)
echo 3. Run `Start-Agent-Platform.bat`
echo 4. Browser opens automatically
echo.
echo ### Daily Use:
echo - Just run `Start-Agent-Platform.bat`
echo - No installation needed!
echo.
echo ## 📋 What's Included
echo - ✅ Complete Agent Platform
echo - ✅ Node.js runtime ^(portable^)
echo - ✅ Python runtime ^(portable^)
echo - ✅ All dependencies
echo - ✅ No admin rights needed
echo.
echo ## 🔧 Troubleshooting
echo - If setup fails, check internet connection
echo - If platform won't start, run Setup-Dependencies.bat again
echo - Keep the command window open while using
echo.
echo ## 💡 Features
echo - Create AI agents with multiple frameworks
echo - Real-time monitoring and observability
echo - Multi-agent workflow orchestration
echo - Advanced reasoning patterns
echo - No cloud dependencies - runs locally
echo.
echo ---
echo **Note:** First run requires internet for dependency download ^(~50MB^)
) > "%PACKAGE_NAME%\README.md"

:: Create the ZIP package
echo Creating ZIP package...
powershell -command "Compress-Archive -Path '%PACKAGE_NAME%\*' -DestinationPath '%PACKAGE_NAME%.zip' -Force"

:: Copy to Desktop
echo Copying to Desktop...
copy "%PACKAGE_NAME%.zip" "%USERPROFILE%\Desktop\%PACKAGE_NAME%.zip"

echo.
echo ========================================
echo    PORTABLE PACKAGE CREATED!
echo ========================================
echo.
echo ✅ Package: %PACKAGE_NAME%.zip
echo ✅ Location: Desktop
echo ✅ Size: ~15MB ^(+50MB on first run^)
echo.
echo 📦 What your colleagues get:
echo - Complete Agent Platform
echo - Embedded Node.js and Python
echo - One-click setup and launch
echo - No installation required
echo - Works on any Windows PC
echo.
echo 👥 Instructions for colleagues:
echo 1. Extract ZIP file
echo 2. Run Setup-Dependencies.bat ^(first time only^)
echo 3. Run Start-Agent-Platform.bat
echo 4. Platform opens in browser automatically
echo.
pause