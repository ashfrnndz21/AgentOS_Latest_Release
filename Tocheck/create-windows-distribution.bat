@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    AWS Agent Platform - Windows Distribution
echo ========================================
echo.
echo Creating portable distribution for Windows...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

:: Create distribution directory
set DIST_DIR=AgentPlatform-Windows-Distribution
if exist "%DIST_DIR%" (
    echo Removing existing distribution directory...
    rmdir /s /q "%DIST_DIR%"
)

echo Creating distribution directory: %DIST_DIR%
mkdir "%DIST_DIR%"
mkdir "%DIST_DIR%\app"
mkdir "%DIST_DIR%\backend"
mkdir "%DIST_DIR%\docs"

echo.
echo ========================================
echo    Building Frontend Application
echo ========================================
echo.

:: Install dependencies
echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

:: Build the application
echo Building production application...
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

echo ✅ Frontend build completed successfully
echo.

:: Copy built application
echo Copying built application to distribution...
xcopy /E /I /Y "dist\*" "%DIST_DIR%\app\"
if errorlevel 1 (
    echo ERROR: Failed to copy built application
    pause
    exit /b 1
)

:: Copy backend files
echo Copying backend files...
copy "backend\*.py" "%DIST_DIR%\backend\" >nul 2>&1
copy "scripts\*.py" "%DIST_DIR%\backend\" >nul 2>&1
copy "scripts\*.sh" "%DIST_DIR%\backend\" >nul 2>&1

:: Copy package.json for reference
copy "package.json" "%DIST_DIR%\app\" >nul 2>&1

echo.
echo ========================================
echo    Creating Startup Scripts
echo ========================================
echo.

:: Create main startup script
(
echo @echo off
echo setlocal enabledelayedexpansion
echo.
echo echo ========================================
echo echo    AWS Agent Platform - Windows
echo echo ========================================
echo echo.
echo echo Starting AWS Agent Platform...
echo echo.
echo echo ✅ Agent Command Centre - Create and manage AI agents
echo echo ✅ Multi-Agent Orchestration - Build complex workflows  
echo echo ✅ MCP Gateway - Enterprise tool integration
echo echo ✅ Agent Control Panel - Monitor and control agents
echo echo ✅ Industry Templates - Banking, Telco, Healthcare
echo echo ✅ Real-time Monitoring - Performance and analytics
echo echo.
echo echo The platform will open in your default browser.
echo echo Keep this window open while using the platform.
echo echo.
echo.
echo :: Check if Python is available for backend
echo python --version ^>nul 2^>^&1
echo if not errorlevel 1 ^(
echo     echo Starting backend server...
echo     start /B python backend\simple_api.py
echo     timeout /t 2 /nobreak ^>nul
echo ^)
echo.
echo :: Start simple HTTP server for frontend
echo echo Starting frontend server...
echo echo.
echo echo 🌐 Opening browser to: http://localhost:8080
echo echo.
echo start http://localhost:8080
echo.
echo :: Use Python's built-in server if available, otherwise use Node.js
echo python --version ^>nul 2^>^&1
echo if not errorlevel 1 ^(
echo     echo Using Python HTTP server...
echo     cd app
echo     python -m http.server 8080
echo ^) else ^(
echo     echo Python not found, checking for Node.js...
echo     node --version ^>nul 2^>^&1
echo     if not errorlevel 1 ^(
echo         echo Using Node.js HTTP server...
echo         cd app
echo         npx serve -s . -l 8080
echo     ^) else ^(
echo         echo ERROR: Neither Python nor Node.js found
echo         echo Please install Python or Node.js to run the server
echo         pause
echo         exit /b 1
echo     ^)
echo ^)
) > "%DIST_DIR%\Start-Agent-Platform.bat"

:: Create simple HTTP server script (alternative)
(
echo @echo off
echo echo Starting Agent Platform on http://localhost:8080
echo echo.
echo start http://localhost:8080
echo cd app
echo python -m http.server 8080
) > "%DIST_DIR%\Start-Simple.bat"

:: Create Node.js server script (alternative)
(
echo @echo off
echo echo Starting Agent Platform with Node.js server...
echo echo.
echo start http://localhost:8080
echo cd app
echo npx serve -s . -l 8080
) > "%DIST_DIR%\Start-NodeJS.bat"

echo.
echo ========================================
echo    Creating Documentation
echo ========================================
echo.

:: Create README
(
echo # AWS Agent Platform - Windows Distribution
echo.
echo ## Quick Start
echo.
echo 1. **Double-click `Start-Agent-Platform.bat`** to launch the platform
echo 2. **Your browser will open automatically** to http://localhost:8080
echo 3. **Start creating agents** using the Agent Command Centre
echo.
echo ## What's Included
echo.
echo ✅ **Complete Agent Platform** - All features and components
echo ✅ **Agent Command Centre** - Create agents with 3 different workflows
echo ✅ **Multi-Agent Orchestration** - Drag-and-drop workflow builder
echo ✅ **MCP Gateway** - Enterprise tool integration system
echo ✅ **Agent Control Panel** - Real-time monitoring and management
echo ✅ **Industry Templates** - Banking, Telco, Healthcare configurations
echo ✅ **Settings Management** - Configure API keys and preferences
echo.
echo ## Alternative Startup Methods
echo.
echo If the main startup script doesn't work, try these alternatives:
echo.
echo - **`Start-Simple.bat`** - Uses Python's built-in HTTP server
echo - **`Start-NodeJS.bat`** - Uses Node.js serve package
echo.
echo ## Requirements
echo.
echo - **Windows 10/11** - Modern Windows operating system
echo - **Modern Browser** - Chrome, Firefox, Edge, or Safari
echo - **Python 3.7+** ^(optional^) - For backend features and HTTP server
echo - **Node.js 16+** ^(optional^) - Alternative HTTP server
echo.
echo ## Features Overview
echo.
echo ### Agent Creation
echo - **Standard Agents** - Basic AI agents with customizable prompts
echo - **Strands Workflows** - Advanced reasoning and memory patterns
echo - **Multi-Agent Workflows** - Complex orchestration with drag-and-drop
echo.
echo ### MCP Gateway
echo - **Tool Integration** - Connect to enterprise tools and services
echo - **Server Management** - Add and configure MCP servers
echo - **Real-time Monitoring** - Track tool usage and performance
echo.
echo ### Industry Templates
echo - **Banking** - Financial services and compliance workflows
echo - **Telecommunications** - Network management and customer analytics
echo - **Healthcare** - Patient care and medical workflow management
echo.
echo ## Troubleshooting
echo.
echo ### Platform Won't Start
echo 1. Make sure you have Python or Node.js installed
echo 2. Try running `Start-Simple.bat` instead
echo 3. Check Windows Defender isn't blocking the scripts
echo.
echo ### Browser Doesn't Open
echo 1. Manually navigate to http://localhost:8080
echo 2. Try a different browser
echo 3. Check if port 8080 is available
echo.
echo ### Features Not Working
echo 1. Check the console window for error messages
echo 2. Ensure you have a stable internet connection
echo 3. Try refreshing the browser page
echo.
echo ## Support
echo.
echo For technical support or questions:
echo - Check the console window for error messages
echo - Ensure all requirements are met
echo - Try the alternative startup methods
echo.
echo ---
echo.
echo **Built with React + TypeScript + Vite**
echo **© 2024 AWS Agent Platform**
) > "%DIST_DIR%\README.md"

:: Create installation guide
(
echo # Installation Guide - AWS Agent Platform
echo.
echo ## Prerequisites
echo.
echo Before running the AWS Agent Platform, ensure you have one of the following:
echo.
echo ### Option 1: Python ^(Recommended^)
echo 1. Download Python from https://python.org/downloads/
echo 2. Install Python 3.7 or later
echo 3. Make sure "Add Python to PATH" is checked during installation
echo.
echo ### Option 2: Node.js
echo 1. Download Node.js from https://nodejs.org/
echo 2. Install Node.js 16 or later
echo 3. npm will be installed automatically
echo.
echo ## Quick Setup
echo.
echo 1. **Extract** the zip file to your desired location
echo 2. **Navigate** to the extracted folder
echo 3. **Double-click** `Start-Agent-Platform.bat`
echo 4. **Wait** for your browser to open automatically
echo 5. **Start** creating agents and workflows!
echo.
echo ## Verification
echo.
echo To verify everything is working:
echo.
echo 1. The platform should open at http://localhost:8080
echo 2. You should see the Agent Command Centre dashboard
echo 3. Try creating a new agent using Quick Actions
echo 4. Check that all navigation items work properly
echo.
echo ## Next Steps
echo.
echo - **Explore** the Agent Command Centre
echo - **Create** your first agent using Quick Actions
echo - **Try** the Multi-Agent Orchestration workspace
echo - **Configure** MCP Gateway for enterprise tools
echo - **Monitor** your agents in the Agent Control Panel
echo.
) > "%DIST_DIR%\docs\INSTALLATION.md"

:: Create feature overview
(
echo # Feature Overview - AWS Agent Platform
echo.
echo ## Core Features
echo.
echo ### 🤖 Agent Command Centre
echo - **Quick Actions** - Create agents with guided workflows
echo - **Agent Dashboard** - View and manage all your agents
echo - **Real-time Monitoring** - Track agent performance and status
echo.
echo ### 🔧 Agent Creation Workflows
echo.
echo #### Standard Agent Creation
echo - Basic agent configuration
echo - Model selection ^(GPT-4, Claude, etc.^)
echo - Custom system prompts
echo - Tool integration
echo.
echo #### Strands Workflow Creation
echo - Advanced reasoning patterns
echo - Memory configuration
echo - Guardrails and safety measures
echo - Multi-step workflow design
echo.
echo #### Multi-Agent Orchestration
echo - Drag-and-drop workflow builder
echo - Agent interconnections
echo - Data flow management
echo - Complex workflow execution
echo.
echo ### 🌐 MCP Gateway
echo - **Server Management** - Connect to MCP servers
echo - **Tool Discovery** - Browse available tools
echo - **Integration** - Add tools to agents
echo - **Monitoring** - Track tool usage
echo.
echo ### 📊 Agent Control Panel
echo - **Real-time Dashboard** - Live agent status
echo - **Performance Metrics** - Usage statistics
echo - **Error Monitoring** - Issue tracking
echo - **Resource Management** - System health
echo.
echo ### 🏢 Industry Templates
echo.
echo #### Banking Agent OS
echo - Financial compliance workflows
echo - Risk analytics and assessment
echo - Customer value management
echo - Wealth management tools
echo.
echo #### Telco Agent OS
echo - Network optimization
echo - Customer analytics
echo - Service management
echo - Performance monitoring
echo.
echo #### Healthcare Agent OS
echo - Patient care workflows
echo - Medical data analysis
echo - Compliance management
echo - Care coordination
echo.
echo ## Advanced Features
echo.
echo ### Multi-Agent Workflows
echo - **Visual Builder** - Drag-and-drop interface
echo - **Agent Palette** - Pre-built agent types
echo - **Connection Management** - Define data flows
echo - **Execution Engine** - Run complex workflows
echo.
echo ### MCP Tool Integration
echo - **Dynamic Loading** - Real-time tool discovery
echo - **Drag-and-Drop** - Easy tool assignment
echo - **Configuration** - Tool-specific settings
echo - **Monitoring** - Usage tracking
echo.
echo ### Settings Management
echo - **API Configuration** - Set up service keys
echo - **Industry Selection** - Choose your domain
echo - **Customization** - Personalize the interface
echo - **Preferences** - Configure defaults
echo.
) > "%DIST_DIR%\docs\FEATURES.md"

echo.
echo ========================================
echo    Finalizing Distribution
echo ========================================
echo.

:: Create version info
echo %DATE% %TIME% > "%DIST_DIR%\VERSION.txt"
echo Built on Windows >> "%DIST_DIR%\VERSION.txt"
echo Node.js version: >> "%DIST_DIR%\VERSION.txt"
node --version >> "%DIST_DIR%\VERSION.txt" 2>&1

:: Make scripts executable (Windows doesn't need this, but for completeness)
echo Distribution package created successfully!
echo.

echo ========================================
echo    Distribution Complete!
echo ========================================
echo.
echo ✅ **Package Location**: %DIST_DIR%\
echo ✅ **Startup Script**: Start-Agent-Platform.bat
echo ✅ **Documentation**: README.md and docs\ folder
echo ✅ **Size**: 
dir "%DIST_DIR%" | find "bytes"
echo.
echo **Next Steps:**
echo 1. Test the distribution by running Start-Agent-Platform.bat
echo 2. Create a ZIP file of the %DIST_DIR% folder
echo 3. Share the ZIP with your colleagues
echo.
echo **Your colleagues can:**
echo 1. Extract the ZIP file
echo 2. Double-click Start-Agent-Platform.bat
echo 3. Start using the Agent Platform immediately!
echo.
echo **Distribution includes:**
echo - ✅ Complete built application
echo - ✅ Multiple startup options
echo - ✅ Comprehensive documentation
echo - ✅ Installation guide
echo - ✅ Feature overview
echo - ✅ Troubleshooting guide
echo.
pause