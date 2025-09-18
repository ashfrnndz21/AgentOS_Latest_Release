#!/bin/bash
echo "Creating Agent Platform ZIP for Windows colleagues..."
echo

# Install dependencies with legacy peer deps to fix the conflict
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the app
echo "Building frontend..."
npm run build

# Create package folder
echo "Creating package structure..."
if [ -d "AgentPlatform" ]; then
    rm -rf "AgentPlatform"
fi
mkdir -p "AgentPlatform"

# Copy files
echo "Copying application files..."
cp -r dist "AgentPlatform/frontend"
cp -r backend "AgentPlatform/backend"
cp -r src "AgentPlatform/src"
cp package.json "AgentPlatform/"

# Create Windows startup script for colleagues
echo "Creating Windows startup script..."
cat > "AgentPlatform/Start-Agent-Platform.bat" << 'EOF'
@echo off
title Agent Observability Platform
echo ========================================
echo   Agent Observability Platform
echo ========================================
echo.
echo Starting servers...
echo.
echo [1/2] Starting backend server...
start /B /MIN python backend\simple_api.py
timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend server...
start /B /MIN python -m http.server 8080 --directory frontend
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo     Platform Ready! 
echo ========================================
echo.
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:8000
echo.
echo Opening browser...
start http://localhost:8080
echo.
echo Press any key to stop servers and exit...
pause >nul
echo.
echo Stopping servers...
taskkill /f /im python.exe >nul 2>&1
echo Goodbye!
EOF

# Create API configuration script for Windows colleagues
echo "Creating API configuration script..."
cat > "AgentPlatform/Configure-API-Keys.bat" << 'EOF'
@echo off
title API Keys Configuration
echo ========================================
echo   API Keys Configuration
echo ========================================
echo.
echo Enter your API keys (press Enter to skip):
echo.
set /p "openai_key=OpenAI API Key: "
set /p "aws_access=AWS Access Key ID: "
set /p "aws_secret=AWS Secret Access Key: "
set /p "anthropic_key=Anthropic API Key: "

echo.
echo Saving configuration...
(
echo # Agent Platform API Configuration
echo OPENAI_API_KEY=%openai_key%
echo AWS_ACCESS_KEY_ID=%aws_access%
echo AWS_SECRET_ACCESS_KEY=%aws_secret%
echo AWS_DEFAULT_REGION=us-east-1
echo ANTHROPIC_API_KEY=%anthropic_key%
) > api-keys.env

echo.
echo Configuration saved! You can now start the platform.
pause
EOF

# Create README for colleagues
echo "Creating README..."
cat > "AgentPlatform/README.md" << 'EOF'
# Agent Observability Platform

## Quick Start (Windows)

1. **Configure API Keys** (Required):
   - Double-click `Configure-API-Keys.bat`
   - Enter at least one API key:
     - OpenAI API Key (for basic agents)
     - AWS Bedrock credentials (for advanced Strands workflows)
     - Anthropic API Key (for Claude models)

2. **Start Platform**:
   - Double-click `Start-Agent-Platform.bat`
   - Wait for servers to start (~10 seconds)
   - Browser opens automatically

3. **Use the Platform**:
   - Main Dashboard: http://localhost:8080
   - Agent Creation: http://localhost:8080/agent-command
   - Monitoring: http://localhost:8080/backend-validation

## Requirements
- Windows 10/11
- Python 3.8+ installed
- Internet connection
- At least one API key configured

## Features
- Create Generic Agents
- Create Strands Workflows (Advanced Reasoning)
- Create Multi-Agent Workflows
- Real-time Agent Monitoring
- Performance Analytics
- Error Tracking & Debugging

## API Keys Setup

### OpenAI
- Go to: https://platform.openai.com/api-keys
- Create new API key (starts with sk-)

### AWS Bedrock
- Go to AWS Console → IAM
- Create user with Bedrock permissions
- Generate Access Key ID and Secret Access Key

### Anthropic
- Go to: https://console.anthropic.com/
- Generate API key

Enjoy the platform! 🚀
EOF

# Create ZIP file
echo "Creating ZIP file..."
zip -r "AgentPlatform-Windows.zip" "AgentPlatform"

# Copy to Desktop
echo "Copying to Desktop..."
cp "AgentPlatform-Windows.zip" ~/Desktop/

# Clean up
rm -rf "AgentPlatform"

echo
echo "========================================"
echo "   ZIP FILE READY! ✅"
echo "========================================"
echo
echo "📁 Location: ~/Desktop/AgentPlatform-Windows.zip"
echo "📦 Ready to send to Windows colleagues!"
echo
echo "Your colleagues need to:"
echo "1. Extract the ZIP file"
echo "2. Run Configure-API-Keys.bat (enter API keys)"
echo "3. Double-click Start-Agent-Platform.bat"
echo "4. Browser opens automatically"
echo
echo "Features they'll have:"
echo "• Create Generic, Strands, and Multi-Agent workflows"
echo "• Real-time agent monitoring and analytics"
echo "• Performance tracking and error debugging"
echo "• Framework-specific insights"
echo