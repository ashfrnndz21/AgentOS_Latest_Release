@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Package for Colleagues - Windows
echo ========================================
echo.
echo This will create a complete ZIP package that your colleagues
echo can download, extract, and run immediately on Windows.
echo.
pause

:: First, create the distribution
echo Step 1: Creating distribution package...
call create-windows-distribution.bat
if errorlevel 1 (
    echo ERROR: Failed to create distribution
    pause
    exit /b 1
)

echo.
echo Step 2: Creating ZIP package...

:: Create ZIP file name with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD%"

set ZIP_NAME=AWS-Agent-Platform-Windows-%datestamp%.zip

:: Try to create ZIP using PowerShell (Windows 10+)
echo Creating ZIP file: %ZIP_NAME%
powershell -command "Compress-Archive -Path 'AgentPlatform-Windows-Distribution\*' -DestinationPath '%ZIP_NAME%' -Force"

if exist "%ZIP_NAME%" (
    echo.
    echo ========================================
    echo    Package Complete! 
    echo ========================================
    echo.
    echo ✅ **ZIP File Created**: %ZIP_NAME%
    echo ✅ **File Size**: 
    for %%A in ("%ZIP_NAME%") do echo    %%~zA bytes
    echo.
    echo **Share this ZIP file with your colleagues!**
    echo.
    echo **Instructions for colleagues:**
    echo 1. Download and extract %ZIP_NAME%
    echo 2. Double-click "Start-Agent-Platform.bat"
    echo 3. Browser opens automatically to the Agent Platform
    echo 4. Start creating agents immediately!
    echo.
    echo **What's included:**
    echo - ✅ Complete Agent Platform application
    echo - ✅ Agent Command Centre with Quick Actions
    echo - ✅ Multi-Agent Orchestration workspace
    echo - ✅ MCP Gateway for tool integration
    echo - ✅ Agent Control Panel for monitoring
    echo - ✅ Industry templates ^(Banking, Telco, Healthcare^)
    echo - ✅ Comprehensive documentation
    echo - ✅ Multiple startup options
    echo - ✅ Troubleshooting guides
    echo.
    echo **Requirements for colleagues:**
    echo - Windows 10/11
    echo - Modern web browser
    echo - Python 3.7+ OR Node.js 16+ ^(one of these^)
    echo.
    echo The ZIP file is ready to share!
    echo.
) else (
    echo ERROR: Failed to create ZIP file
    echo.
    echo **Manual ZIP Creation:**
    echo 1. Right-click on "AgentPlatform-Windows-Distribution" folder
    echo 2. Select "Send to" ^> "Compressed ^(zipped^) folder"
    echo 3. Rename the ZIP file to: %ZIP_NAME%
    echo 4. Share the ZIP file with your colleagues
    echo.
)

echo Opening distribution folder...
start "" "AgentPlatform-Windows-Distribution"

echo.
pause