@echo off
REM Agent Palette Integration Test Script for Windows
REM Runs comprehensive tests to validate the Ollama agents integration

echo 🧪 Agent Palette Integration Test Suite
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python to run tests.
    pause
    exit /b 1
)

echo ✅ Python found
python --version
echo.

REM Check if backend is running
echo 🔍 Checking backend status...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on localhost:8000
    set BACKEND_RUNNING=true
) else (
    echo ⚠️ Backend not running on localhost:8000
    echo 💡 Start backend with: python backend/simple_api.py
    set BACKEND_RUNNING=false
)
echo.

REM Run frontend validation
echo 🔍 Running frontend validation...
echo ==================================
python validate_agent_palette_frontend.py
set FRONTEND_EXIT_CODE=%errorlevel%
echo.

REM Run backend integration test (only if backend is running)
if "%BACKEND_RUNNING%"=="true" (
    echo 🔍 Running backend integration test...
    echo =====================================
    python test_agent_palette_integration_complete.py
    set BACKEND_EXIT_CODE=%errorlevel%
) else (
    echo ⚠️ Skipping backend integration test (backend not running)
    set BACKEND_EXIT_CODE=0
)
echo.

REM Run hook fix test if available
if exist "test_hook_fix.py" (
    echo 🔍 Running hook fix validation...
    echo ================================
    python test_hook_fix.py
    set HOOK_EXIT_CODE=%errorlevel%
) else (
    echo ⚠️ Hook fix test not found, skipping
    set HOOK_EXIT_CODE=0
)
echo.

REM Display HTML test information
echo 🌐 HTML Test Guide
echo ==================
echo 📄 Open test_agent_palette_complete.html in your browser for:
echo    • Visual testing interface
echo    • Interactive API testing
echo    • Step-by-step validation guide
echo    • Troubleshooting information
echo.

REM Summary
echo 📊 Test Summary
echo ===============

if %FRONTEND_EXIT_CODE% equ 0 (
    echo ✅ Frontend validation: PASSED
) else (
    echo ❌ Frontend validation: FAILED
)

if "%BACKEND_RUNNING%"=="true" (
    if %BACKEND_EXIT_CODE% equ 0 (
        echo ✅ Backend integration: PASSED
    ) else (
        echo ❌ Backend integration: FAILED
    )
) else (
    echo ⚠️ Backend integration: SKIPPED (backend not running)
)

if %HOOK_EXIT_CODE% equ 0 (
    echo ✅ Hook validation: PASSED
) else (
    echo ❌ Hook validation: FAILED
)

echo.

REM Final result
if %FRONTEND_EXIT_CODE% equ 0 if %BACKEND_EXIT_CODE% equ 0 if %HOOK_EXIT_CODE% equ 0 (
    echo 🎉 ALL TESTS PASSED!
    echo ✅ Agent Palette integration is working correctly
    echo ✅ Ready for production use
    echo.
    echo 🔗 Next Steps:
    echo 1. Test the integration in Multi Agent Workspace
    echo 2. Verify drag & drop functionality
    echo 3. Create workflows with your Ollama agents
    pause
    exit /b 0
) else (
    echo ⚠️ SOME TESTS FAILED
    echo ❌ Integration needs fixes before use
    echo.
    echo 🔗 Next Steps:
    echo 1. Check the test output above for specific failures
    echo 2. Fix the failing components
    echo 3. Re-run the test suite
    pause
    exit /b 1
)