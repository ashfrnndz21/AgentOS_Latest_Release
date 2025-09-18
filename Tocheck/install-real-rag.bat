@echo off
echo 🚀 Installing Real RAG Dependencies for Document Workspace
echo ========================================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed
    pause
    exit /b 1
)

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is required but not installed
    pause
    exit /b 1
)

echo 📦 Installing RAG dependencies...
pip install -r backend/requirements-rag.txt

if errorlevel 0 (
    echo ✅ RAG dependencies installed successfully!
    echo.
    echo 🎯 Next steps:
    echo 1. Make sure Ollama is running: ollama serve
    echo 2. Pull a model: ollama pull mistral
    echo 3. Start the backend: python backend/simple_api.py
    echo 4. Use the Real Document Workspace in the app
    echo.
    echo 📚 Available models for RAG:
    echo - mistral (recommended)
    echo - llama3.2
    echo - codellama
) else (
    echo ❌ Failed to install RAG dependencies
    echo Try installing manually:
    echo pip install langchain langchain-community chromadb fastembed pypdf
)

pause