@echo off
title Agent Platform - Static Demo
color 0A
cd /d "%~dp0"

echo ========================================
echo   AGENT PLATFORM - STATIC DEMO
echo ========================================
echo.
echo This version works without any installation!
echo Opening self-contained HTML application...
echo.

:: Open the HTML file directly
start AgentPlatform.html

echo.
echo ✅ Static platform opened in your browser!
echo.
echo Features available in demo mode:
echo ✅ All page navigation
echo ✅ Complete UI interface
echo ✅ Mock data and interactions
echo ✅ Responsive design
echo.
echo Note: This is a demonstration version.
echo For full functionality, use one of the other options.
echo.
pause
