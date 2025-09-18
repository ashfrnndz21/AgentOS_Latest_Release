@echo off
echo 🚀 Multi-Agent Workflow System Demo (Windows)
echo =============================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if Ollama is running
ollama list >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama is not running
    echo Please start Ollama with: ollama serve
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Run the demo
python start_workflow_demo.py

pause