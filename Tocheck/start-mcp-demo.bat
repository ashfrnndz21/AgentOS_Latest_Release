@echo off
echo 🚀 AgentRepo MCP Integration Demo Setup
echo ======================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required but not installed.
    echo Please install Python and try again.
    pause
    exit /b 1
)

echo ✅ Python found

REM Install MCP package
echo 📦 Installing MCP package...
pip install mcp uvicorn

if %errorlevel% equ 0 (
    echo ✅ MCP package installed successfully
) else (
    echo ❌ Failed to install MCP package
    echo Try: pip install --user mcp uvicorn
    pause
    exit /b 1
)

REM Start the demo MCP server
echo.
echo 🎯 Starting Demo MCP Server...
echo This server provides 8 demo tools for testing
echo.

python demo-mcp-server.py
pause