@echo off
title Agent Platform - Embedded Python
color 0A
cd /d "%~dp0"

echo ========================================
echo   AGENT PLATFORM - EMBEDDED PYTHON
echo ========================================
echo.
echo This version includes Python runtime!
echo No installation required.
echo.

:: Check if embedded Python exists
if not exist "runtime\python\python.exe" (
    echo Downloading portable Python runtime...
    echo This is a one-time download (~25MB)
    echo.
    
    :: Download embedded Python
    powershell -Command "& {
        $url = 'https://www.python.org/ftp/python/3.11.5/python-3.11.5-embed-amd64.zip'
        $output = 'python-embed.zip'
        Write-Host 'Downloading Python...'
        try {
            Invoke-WebRequest -Uri $url -OutFile $output
            Expand-Archive -Path $output -DestinationPath 'runtime\python' -Force
            Remove-Item $output
            Write-Host 'Python downloaded successfully!'
        } catch {
            Write-Host 'Download failed. Please check internet connection.'
            pause
            exit 1
        }
    }"
    
    :: Install pip for embedded Python
    echo Setting up Python packages...
    runtime\python\python.exe -m ensurepip --default-pip
    runtime\python\python.exe -m pip install flask flask-cors requests
)

echo Starting servers with embedded Python...
echo.

:: Start backend
start "Backend" /min runtime\python\python.exe app\backend\simple_api.py

:: Wait and start frontend
timeout /t 3 /nobreak >nul
start "Frontend" /min runtime\python\python.exe -m http.server 3000 --directory app\frontend

:: Open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ Platform running with embedded Python!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Keep this window open.
pause
