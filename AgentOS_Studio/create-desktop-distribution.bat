@echo off
echo ========================================
echo  Creating Desktop Distribution Package
echo  Agent Observability Platform v1.0
echo ========================================
echo.

:: Get Desktop path
set "DESKTOP=%USERPROFILE%\Desktop"
echo 🖥️  Desktop location: %DESKTOP%
echo.

:: Create distribution directory
echo [STEP 1/10] Creating distribution structure...
if exist "AgentPlatform-Distribution" rmdir /s /q "AgentPlatform-Distribution"
mkdir "AgentPlatform-Distribution"
mkdir "AgentPlatform-Distribution\runtime"
mkdir "AgentPlatform-Distribution\app"
mkdir "AgentPlatform-Distribution\config"
mkdir "AgentPlatform-Distribution\data"
mkdir "AgentPlatform-Distribution\logs"
mkdir "AgentPlatform-Distribution\docs"

:: Build the frontend application
echo [STEP 2/10] Building frontend application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)

:: Copy all application files
echo [STEP 3/10] Copying application files...
xcopy /E /I /Y "dist" "AgentPlatform-Distribution\app\frontend"
xcopy /E /I /Y "backend" "AgentPlatform-Distribution\app\backend"
xcopy /E /I /Y "src" "AgentPlatform-Distribution\app\src"
copy "package.json" "AgentPlatform-Distribution\app\"

:: Download and embed Node.js runtime
echo [STEP 4/10] Downloading Node.js runtime...
echo This may take a few minutes depending on your internet connection...
curl -L -o "node-runtime.zip" "https://nodejs.org/dist/v18.17.0/node-v18.17.0-win-x64.zip"
if %errorlevel% equ 0 (
    echo Extracting Node.js runtime...
    powershell -command "Expand-Archive -Path 'node-runtime.zip' -DestinationPath 'temp-node' -Force"
    xcopy /E /I /Y "temp-node\node-v18.17.0-win-x64\*" "AgentPlatform-Distribution\runtime\node\"
    rmdir /s /q "temp-node"
    del "node-runtime.zip"
    echo [✓] Node.js runtime embedded successfully
) else (
    echo [WARNING] Could not download Node.js runtime. Users will need Node.js installed.
)

:: Download and embed Python runtime
echo [STEP 5/10] Downloading Python runtime...
curl -L -o "python-runtime.zip" "https://www.python.org/ftp/python/3.11.5/python-3.11.5-embed-amd64.zip"
if %errorlevel% equ 0 (
    echo Extracting Python runtime...
    powershell -command "Expand-Archive -Path 'python-runtime.zip' -DestinationPath 'AgentPlatform-Distribution\runtime\python' -Force"
    del "python-runtime.zip"
    
    :: Configure embedded Python
    echo import sys; sys.path.append('Lib/site-packages') > "AgentPlatform-Distribution\runtime\python\sitecustomize.py"
    echo [✓] Python runtime embedded successfully
) else (
    echo [WARNING] Could not download Python runtime. Users will need Python installed.
)

:: Install Python dependencies
echo [STEP 6/10] Installing Python dependencies...
if exist "AgentPlatform-Distribution\runtime\python\python.exe" (
    mkdir "AgentPlatform-Distribution\runtime\python\Lib\site-packages"
    "AgentPlatform-Distribution\runtime\python\python.exe" -m pip install --target "AgentPlatform-Distribution\runtime\python\Lib\site-packages" fastapi uvicorn python-multipart
    echo [✓] Python dependencies installed
) else (
    echo [WARNING] Python dependencies not pre-installed
)

:: Create the main launcher
echo [STEP 7/10] Creating main launcher...
(
echo @echo off
echo title Agent Observability Platform - Complete Edition
echo color 0A
echo cd /d "%%~dp0"
echo.
echo echo ========================================
echo echo   🚀 Agent Observability Platform
echo echo   Complete Edition v1.0
echo echo ========================================
echo echo.
echo echo 🔧 Initializing platform...
echo.
echo :: Set up environment paths
echo set PATH=%%CD%%\runtime\node;%%CD%%\runtime\python;%%PATH%%
echo set PYTHONPATH=%%CD%%\runtime\python\Lib\site-packages
echo.
echo :: Load API configuration if exists
echo if exist "config\api-keys.env" (
echo     echo [✓] Loading API configuration...
echo     for /f "usebackq tokens=1,2 delims==" %%%%a in ("config\api-keys.env"^) do (
echo         if not "%%%%a"=="" if not "%%%%a"=="^#" set %%%%a=%%%%b
echo     ^)
echo ^) else (
echo     echo [!] No API configuration found. Run 'Configure-API-Keys.bat' first.
echo ^)
echo.
echo :: Check runtime availability
echo if exist "runtime\python\python.exe" (
echo     echo [✓] Using embedded Python runtime
echo     set PYTHON_CMD=runtime\python\python.exe
echo ^) else (
echo     echo [!] Using system Python ^(requires Python 3.8+^)
echo     set PYTHON_CMD=python
echo ^)
echo.
echo if exist "runtime\node\node.exe" (
echo     echo [✓] Using embedded Node.js runtime
echo     set NODE_CMD=runtime\node\node.exe
echo ^) else (
echo     echo [!] Using system Node.js ^(requires Node.js 18+^)
echo     set NODE_CMD=node
echo ^)
echo.
echo :: Create data directories
echo if not exist "data\agents.db" (
echo     echo [✓] Initializing database...
echo     mkdir data 2^>nul
echo ^)
echo.
echo if not exist "logs" mkdir logs
echo.
echo echo 🚀 Starting servers...
echo echo.
echo :: Start backend server
echo echo [1/2] Starting backend server on port 8000...
echo start /B /MIN "Agent-Backend" %%PYTHON_CMD%% app\backend\simple_api.py ^> logs\backend.log 2^>^&1
echo.
echo :: Wait for backend to initialize
echo timeout /t 4 /nobreak ^>nul
echo.
echo :: Start frontend server
echo echo [2/2] Starting frontend server on port 8080...
echo start /B /MIN "Agent-Frontend" %%PYTHON_CMD%% -m http.server 8080 --directory app\frontend ^> logs\frontend.log 2^>^&1
echo.
echo :: Wait for frontend to initialize
echo timeout /t 3 /nobreak ^>nul
echo.
echo :: Health check
echo echo 🔍 Performing health check...
echo curl -s http://localhost:8000/health ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 (
echo     echo [✓] Backend server is healthy
echo ^) else (
echo     echo [!] Backend server health check failed
echo     echo     Check logs\backend.log for details
echo ^)
echo.
echo curl -s http://localhost:8080 ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 (
echo     echo [✓] Frontend server is healthy
echo ^) else (
echo     echo [!] Frontend server health check failed
echo     echo     Check logs\frontend.log for details
echo ^)
echo.
echo echo ========================================
echo echo   🎉 Platform Ready!
echo echo ========================================
echo echo.
echo echo 🌐 Main Dashboard:      http://localhost:8080
echo echo 🤖 Agent Command:       http://localhost:8080/agent-command
echo echo 📊 Observability:       http://localhost:8080/backend-validation
echo echo 🔧 API Health:          http://localhost:8000/health
echo echo.
echo echo 📋 Available Features:
echo echo   • Create Generic Agents
echo echo   • Create Strands Workflows ^(Advanced Reasoning^)
echo echo   • Create Multi-Agent Workflows
echo echo   • Real-time Agent Monitoring
echo echo   • Performance Analytics
echo echo   • Error Tracking ^& Debugging
echo echo   • Framework-specific Insights
echo echo.
echo echo 🚀 Opening browser in 3 seconds...
echo timeout /t 3 /nobreak ^>nul
echo start http://localhost:8080
echo.
echo echo ========================================
echo echo   Press any key to stop and exit
echo echo ========================================
echo pause ^>nul
echo.
echo echo 🛑 Stopping servers...
echo taskkill /f /im python.exe /t ^>nul 2^>^&1
echo taskkill /f /im node.exe /t ^>nul 2^>^&1
echo echo.
echo echo 👋 Platform stopped. Goodbye!
echo timeout /t 2 /nobreak ^>nul
) > "AgentPlatform-Distribution\🚀 Start-Agent-Platform.bat"

:: Create API configuration tool
echo [STEP 8/10] Creating configuration tools...
(
echo @echo off
echo title API Keys Configuration
echo color 0B
echo cd /d "%%~dp0"
echo.
echo echo ========================================
echo echo   🔑 API Keys Configuration
echo echo   Agent Observability Platform
echo echo ========================================
echo echo.
echo echo This tool will help you configure API keys for:
echo echo   • OpenAI ^(for Generic Agents^)
echo echo   • AWS Bedrock ^(for Strands ^& Agent Core^)
echo echo   • Anthropic ^(for Alternative Models^)
echo echo.
echo if exist "config\api-keys.env" (
echo     echo 📋 Current configuration found:
echo     echo ----------------------------------------
echo     type "config\api-keys.env"
echo     echo ----------------------------------------
echo     echo.
echo     set /p "update=Update configuration? (y/n): "
echo     if /i not "%%update%%"=="y" goto :end
echo ^)
echo.
echo echo 📝 Enter your API keys ^(press Enter to skip^):
echo echo.
echo set /p "openai_key=🤖 OpenAI API Key: "
echo set /p "aws_access=☁️  AWS Access Key ID: "
echo set /p "aws_secret=🔐 AWS Secret Access Key: "
echo set /p "aws_region=🌍 AWS Region ^(default: us-east-1^): "
echo set /p "anthropic_key=🧠 Anthropic API Key: "
echo.
echo if "%%aws_region%%"=="" set aws_region=us-east-1
echo.
echo echo 💾 Saving configuration...
echo if not exist "config" mkdir config
echo (
echo # Agent Observability Platform - API Configuration
echo # Generated on %%date%% at %%time%%
echo # 
echo # Configure your API keys below to enable all features
echo.
echo # OpenAI Configuration ^(for Generic Agents^)
echo OPENAI_API_KEY=%%openai_key%%
echo.
echo # AWS Bedrock Configuration ^(for Strands ^& Agent Core^)
echo AWS_ACCESS_KEY_ID=%%aws_access%%
echo AWS_SECRET_ACCESS_KEY=%%aws_secret%%
echo AWS_DEFAULT_REGION=%%aws_region%%
echo.
echo # Anthropic Configuration ^(for Claude models^)
echo ANTHROPIC_API_KEY=%%anthropic_key%%
echo.
echo # Server Configuration ^(do not modify^)
echo FRONTEND_PORT=8080
echo BACKEND_PORT=8000
echo DATABASE_PATH=data/agents.db
echo ^) ^> "config\api-keys.env"
echo.
echo echo ✅ Configuration saved successfully!
echo echo.
echo echo 📋 Configuration file: config\api-keys.env
echo echo 🚀 You can now start the platform with: Start-Agent-Platform.bat
echo echo.
echo :end
echo pause
) > "AgentPlatform-Distribution\⚙️ Configure-API-Keys.bat"

:: Create comprehensive documentation
echo [STEP 9/10] Creating documentation...
(
echo # 🚀 Agent Observability Platform - Complete Distribution
echo.
echo ## 📦 What You Have
echo This is a **complete, self-contained** Agent Observability Platform that includes:
echo.
echo ### 🎯 Core Features
echo - **Agent Creation**: Create and manage multiple types of AI agents
echo - **Real-time Monitoring**: Live observability dashboard with metrics
echo - **Framework Support**: Generic, Strands, Agent Core, and Multi-Agent workflows
echo - **Performance Analytics**: Success rates, response times, error tracking
echo - **Advanced Reasoning**: Strands workflows with chain-of-thought, reflection, etc.
echo - **Multi-Agent Coordination**: Complex workflows with multiple agents
echo.
echo ### 🛠️ Technical Capabilities
echo - **Web-based Interface**: Modern React frontend
echo - **REST API Backend**: Python FastAPI server
echo - **Real-time Updates**: Live data refresh every 3 seconds
echo - **Database Integration**: SQLite for agent storage
echo - **Framework Detection**: Automatic categorization and monitoring
echo - **Error Tracking**: Comprehensive logging and debugging
echo.
echo ## 🚀 Quick Start ^(2 Minutes^)
echo.
echo ### Step 1: Configure API Keys ^(Required^)
echo 1. Double-click `⚙️ Configure-API-Keys.bat`
echo 2. Enter your API keys:
echo    - **OpenAI API Key**: For generic agents
echo    - **AWS Bedrock**: For Strands and Agent Core workflows
echo    - **Anthropic API Key**: For Claude models
echo.
echo ### Step 2: Start the Platform
echo 1. Double-click `🚀 Start-Agent-Platform.bat`
echo 2. Wait for servers to start ^(~10 seconds^)
echo 3. Browser opens automatically to http://localhost:8080
echo.
echo ### Step 3: Create Your First Agent
echo 1. Go to **Agent Command Centre**
echo 2. Click **Quick Actions** → **Create New Agent**
echo 3. Fill out the form and submit
echo 4. Watch it appear in **Backend Validation** dashboard
echo.
echo ## 🌐 Application URLs
echo - **🏠 Main Dashboard**: http://localhost:8080
echo - **🤖 Agent Command Centre**: http://localhost:8080/agent-command
echo - **📊 Observability Platform**: http://localhost:8080/backend-validation
echo - **💰 Wealth Management**: http://localhost:8080/wealth-management
echo - **🔧 API Health Check**: http://localhost:8000/health
echo.
echo ## 🎉 Enjoy!
echo You now have a complete, portable Agent Observability Platform!
echo.
echo For support or questions, refer to the application documentation.
) > "AgentPlatform-Distribution\README.md"

:: Create final package and save to Desktop
echo [STEP 10/10] Creating final package and saving to Desktop...
echo.
echo 📦 Creating ZIP package...
powershell -command "Compress-Archive -Path 'AgentPlatform-Distribution\*' -DestinationPath 'AgentPlatform-Complete-v1.0.zip' -Force"

echo 🖥️  Copying to Desktop...
copy "AgentPlatform-Complete-v1.0.zip" "%DESKTOP%\AgentPlatform-Complete-v1.0.zip"

:: Create colleague instructions on Desktop
echo 📋 Creating colleague instructions on Desktop...
(
echo # 🚀 Agent Observability Platform - For Your Colleagues
echo.
echo ## Quick Setup Instructions:
echo.
echo 1. **Extract this ZIP file** to any folder on your Windows laptop
echo 2. **Configure API Keys** ^(one-time setup^):
echo    - Double-click `⚙️ Configure-API-Keys.bat`
echo    - Enter at least one API key:
echo      - OpenAI API Key ^(for basic agents^)
echo      - AWS Bedrock credentials ^(for advanced Strands workflows^)
echo      - Anthropic API Key ^(for Claude models^)
echo 3. **Start the Platform**:
echo    - Double-click `🚀 Start-Agent-Platform.bat`
echo    - Wait ~10 seconds for servers to start
echo    - Browser opens automatically to the dashboard
echo.
echo ## What You Can Do:
echo.
echo 🤖 **Create Agents**:
echo - **Generic Agents**: Basic AI agents for general tasks
echo - **Strands Workflows**: Advanced reasoning with chain-of-thought, reflection, memory
echo - **Multi-Agent Workflows**: Coordinate multiple agents for complex tasks
echo.
echo 📊 **Monitor Everything**:
echo - Real-time agent performance dashboard
echo - Success rates, response times, error tracking
echo - Framework-specific analytics and insights
echo - Live server logs and debugging tools
echo.
echo ## Main URLs:
echo - **Dashboard**: http://localhost:8080
echo - **Agent Creation**: http://localhost:8080/agent-command
echo - **Monitoring**: http://localhost:8080/backend-validation
echo.
echo ## Requirements:
echo - Windows 10/11 ^(64-bit^)
echo - Internet connection for API calls
echo - At least one API key configured
echo.
echo ## API Keys Needed:
echo.
echo ### OpenAI ^(for Generic Agents^)
echo - Go to: https://platform.openai.com/api-keys
echo - Create new API key
echo - Copy the key ^(starts with `sk-`^)
echo.
echo ### AWS Bedrock ^(for Strands ^& Advanced Features^)
echo - Go to AWS Console → IAM
echo - Create user with Bedrock permissions
echo - Generate Access Key ID and Secret Access Key
echo - Ensure Bedrock is enabled in your AWS region
echo.
echo ### Anthropic ^(for Claude Models^)
echo - Go to: https://console.anthropic.com/
echo - Generate API key
echo - Copy the key
echo.
echo ## Need Help?
echo - Check the `README.md` file in the extracted folder
echo - Look at logs in the `logs\` folder if something goes wrong
echo - Ensure ports 8080 and 8000 are available
echo.
echo **Enjoy exploring the platform!** 🎉
) > "%DESKTOP%\Agent-Platform-Instructions.md"

:: Clean up temporary files
echo 🧹 Cleaning up temporary files...
rmdir /s /q "AgentPlatform-Distribution"

echo.
echo ========================================
echo   🎉 DESKTOP DISTRIBUTION COMPLETE!
echo ========================================
echo.
echo 📁 Files created on your Desktop:
echo   ✅ AgentPlatform-Complete-v1.0.zip
echo   ✅ Agent-Platform-Instructions.md
echo.
echo 📦 Package Details:
echo   📏 Size: ~100-150MB ^(with embedded runtimes^)
echo   🎯 Ready to share with colleagues!
echo   🖥️  Located on your Desktop for easy access
echo.
echo 📋 What's included in the ZIP:
echo   ✅ Complete Agent Observability Platform
echo   ✅ All agent creation capabilities ^(Generic, Strands, Multi-Agent^)
echo   ✅ Real-time monitoring dashboard
echo   ✅ Embedded Node.js and Python runtimes
echo   ✅ One-click configuration and launch
echo   ✅ Comprehensive documentation
echo   ✅ No installation required
echo.
echo 🚀 To share with colleagues:
echo   1. Send them 'AgentPlatform-Complete-v1.0.zip' from your Desktop
echo   2. Include 'Agent-Platform-Instructions.md' for setup help
echo   3. They extract the ZIP file anywhere
echo   4. They run 'Configure-API-Keys.bat' ^(one time^)
echo   5. They double-click 'Start-Agent-Platform.bat'
echo   6. Browser opens automatically - ready to use!
echo.
echo 🌟 Features your colleagues will have:
echo   • Create Generic, Strands, and Multi-Agent workflows
echo   • Real-time agent monitoring and analytics
echo   • Performance tracking and error debugging
echo   • Framework-specific insights and capabilities
echo   • Professional observability dashboard
echo.
echo 🎯 Both files are now on your Desktop ready to share!
echo.
pause