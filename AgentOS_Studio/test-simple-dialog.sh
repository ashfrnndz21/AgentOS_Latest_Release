#!/bin/bash

echo "🧪 Testing Simple Adaptation Dialog"
echo "=================================="

echo "✅ Changes Applied:"
echo "   - Replaced complex StrandsAgentAdaptationDialog with SimpleAdaptationDialog"
echo "   - Simple dialog only shows basic agent info and buttons"
echo "   - Added console logging for debugging"

echo ""
echo "🎯 Test Steps:"
echo "1. Open http://localhost:5173"
echo "2. Open browser developer tools (F12) → Console tab"
echo "3. Navigate to Strands Multi-Agent Workspace"
echo "4. Go to Agent Palette → Adapt tab"
echo "5. Click on 'Security Expert Agent'"

echo ""
echo "Expected Results:"
echo "✅ Simple dialog should open without white screen"
echo "✅ Console should show: 'SimpleAdaptationDialog render: {isOpen: true, agent: Security Expert Agent}'"
echo "✅ Dialog should display basic agent information"
echo "✅ Close and Test Adapt buttons should be visible"

echo ""
echo "If this works:"
echo "   → The issue is in the complex StrandsAgentAdaptationDialog component"
echo "   → We can then identify the specific problematic section"

echo ""
echo "If this still shows white screen:"
echo "   → The issue is in the palette component or data loading"
echo "   → Check console for JavaScript errors"

echo ""
echo "🌐 Ready to test: http://localhost:5173"