@echo off
echo 🤖 Starting Ollama-enabled Backend Server...

echo 🔄 Stopping existing backend processes...
taskkill /f /im python.exe 2>nul

echo 🚀 Starting Ollama backend on port 5001...
cd backend
start /b python simple_api.py

echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak >nul

echo ✅ Ollama backend should now be running!
echo 📡 Available endpoints:
echo    - http://localhost:5001/api/ollama/status
echo    - http://localhost:5001/api/ollama/models  
echo    - http://localhost:5001/api/ollama/terminal
echo.
echo 🎯 Access Ollama Terminal at: http://localhost:8081/ollama-terminal
pause