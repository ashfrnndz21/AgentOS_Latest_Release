@echo off
REM 🚀 Complete Frontend Restart Script with Cache Clearing (Windows)
REM This script fully restarts the frontend development server and clears all caches

echo 🔄 Starting Complete Frontend Restart...
echo ==================================

REM 1. Kill any existing frontend processes
echo 🛑 Stopping existing frontend processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

REM 2. Clear all caches
echo 🧹 Clearing all caches...

REM Clear npm cache
npm cache clean --force 2>nul

REM Clear Vite cache
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist ".vite" rmdir /s /q ".vite" 2>nul

REM Clear dist folder
if exist "dist" rmdir /s /q "dist" 2>nul

REM Clear browser cache files (if any)
if exist ".cache" rmdir /s /q ".cache" 2>nul

REM 3. Reinstall dependencies (quick)
echo 📦 Refreshing dependencies...
npm install --silent

REM 4. Start fresh development server
echo 🚀 Starting fresh development server...
echo    Frontend will be available at: http://localhost:5173
echo    Backend should be running at: http://localhost:8000
echo.
echo ✅ Cache cleared - browser will load fresh code!
echo    Press Ctrl+C to stop the server
echo ==================================

REM Start with clean environment
npm run dev