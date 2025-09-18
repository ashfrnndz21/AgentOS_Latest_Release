@echo off
echo Creating simple ZIP package...
echo.

:: Build the app
echo Building frontend...
call npm run build

:: Create package folder
if exist "SimpleAgentPlatform" rmdir /s /q "SimpleAgentPlatform"
mkdir "SimpleAgentPlatform"

:: Copy files
echo Copying files...
xcopy /E /I /Y "dist" "SimpleAgentPlatform\frontend"
xcopy /E /I /Y "backend" "SimpleAgentPlatform\backend"
copy "package.json" "SimpleAgentPlatform\"

:: Create simple launcher
echo Creating launcher...
(
echo @echo off
echo echo Starting Agent Platform...
echo echo.
echo echo Make sure you have Node.js and Python installed
echo echo.
echo echo Starting backend...
echo start /B python backend\simple_api.py
echo timeout /t 3 /nobreak ^>nul
echo.
echo echo Starting frontend...
echo start /B python -m http.server 8080 --directory frontend
echo timeout /t 2 /nobreak ^>nul
echo.
echo echo Platform ready at: http://localhost:8080
echo echo.
echo start http://localhost:8080
echo.
echo pause
) > "SimpleAgentPlatform\Start.bat"

:: Copy troubleshooting tools
echo Adding troubleshooting tools...
copy "Start-Agent-Platform-Debug.bat" "SimpleAgentPlatform\"
copy "Fix-Windows-Issues.bat" "SimpleAgentPlatform\"
copy "Windows-Troubleshooting-Guide.md" "SimpleAgentPlatform\"
copy "WINDOWS-README.md" "SimpleAgentPlatform\README.md"

:: Create ZIP and copy to Desktop
echo Creating ZIP...
powershell -command "Compress-Archive -Path 'SimpleAgentPlatform\*' -DestinationPath 'SimpleAgentPlatform.zip' -Force"

echo Copying to Desktop...
copy "SimpleAgentPlatform.zip" "%USERPROFILE%\Desktop\SimpleAgentPlatform.zip"

echo.
echo ✅ Done! Check your Desktop for: SimpleAgentPlatform.zip
echo.
pause