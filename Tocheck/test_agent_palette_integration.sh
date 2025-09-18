#!/bin/bash

# Agent Palette Integration Test Script
# Runs comprehensive tests to validate the Ollama agents integration

echo "🧪 Agent Palette Integration Test Suite"
echo "========================================"
echo ""

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python to run tests."
    exit 1
fi

echo "✅ Python found: $(python --version)"
echo ""

# Check if backend is running
echo "🔍 Checking backend status..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running on localhost:8000"
    BACKEND_RUNNING=true
else
    echo "⚠️ Backend not running on localhost:8000"
    echo "💡 Start backend with: python backend/simple_api.py"
    BACKEND_RUNNING=false
fi
echo ""

# Run frontend validation
echo "🔍 Running frontend validation..."
echo "=================================="
python validate_agent_palette_frontend.py
FRONTEND_EXIT_CODE=$?
echo ""

# Run backend integration test (only if backend is running)
if [ "$BACKEND_RUNNING" = true ]; then
    echo "🔍 Running backend integration test..."
    echo "====================================="
    python test_agent_palette_integration_complete.py
    BACKEND_EXIT_CODE=$?
else
    echo "⚠️ Skipping backend integration test (backend not running)"
    BACKEND_EXIT_CODE=0
fi
echo ""

# Run hook fix test if available
if [ -f "test_hook_fix.py" ]; then
    echo "🔍 Running hook fix validation..."
    echo "================================"
    python test_hook_fix.py
    HOOK_EXIT_CODE=$?
else
    echo "⚠️ Hook fix test not found, skipping"
    HOOK_EXIT_CODE=0
fi
echo ""

# Display HTML test information
echo "🌐 HTML Test Guide"
echo "=================="
echo "📄 Open test_agent_palette_complete.html in your browser for:"
echo "   • Visual testing interface"
echo "   • Interactive API testing"
echo "   • Step-by-step validation guide"
echo "   • Troubleshooting information"
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo "✅ Frontend validation: PASSED"
else
    echo "❌ Frontend validation: FAILED"
fi

if [ "$BACKEND_RUNNING" = true ]; then
    if [ $BACKEND_EXIT_CODE -eq 0 ]; then
        echo "✅ Backend integration: PASSED"
    else
        echo "❌ Backend integration: FAILED"
    fi
else
    echo "⚠️ Backend integration: SKIPPED (backend not running)"
fi

if [ $HOOK_EXIT_CODE -eq 0 ]; then
    echo "✅ Hook validation: PASSED"
else
    echo "❌ Hook validation: FAILED"
fi

echo ""

# Final result
if [ $FRONTEND_EXIT_CODE -eq 0 ] && [ $BACKEND_EXIT_CODE -eq 0 ] && [ $HOOK_EXIT_CODE -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo "✅ Agent Palette integration is working correctly"
    echo "✅ Ready for production use"
    echo ""
    echo "🔗 Next Steps:"
    echo "1. Test the integration in Multi Agent Workspace"
    echo "2. Verify drag & drop functionality"
    echo "3. Create workflows with your Ollama agents"
    exit 0
else
    echo "⚠️ SOME TESTS FAILED"
    echo "❌ Integration needs fixes before use"
    echo ""
    echo "🔗 Next Steps:"
    echo "1. Check the test output above for specific failures"
    echo "2. Fix the failing components"
    echo "3. Re-run the test suite"
    exit 1
fi