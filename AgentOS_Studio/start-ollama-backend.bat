@echo off
echo 🚀 Starting Ollama Terminal Backend...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if Ollama is installed
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Ollama is not installed or not in PATH.
    echo 📥 Please install Ollama from https://ollama.ai
    echo 🔄 Continuing anyway - you can install Ollama later...
)

REM Create virtual environment if it doesn't exist
if not exist "backend\venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv backend\venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call backend\venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing Python dependencies...
pip install -r backend\requirements.txt

REM Start the backend server
echo 🌐 Starting backend server on port 5001...
echo 📡 Backend will be available at: http://localhost:5001
echo 🔗 Health check: http://localhost:5001/health
echo 📋 API docs: http://localhost:5001/docs
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

cd backend && python ollama_api.py