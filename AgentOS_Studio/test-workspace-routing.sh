#!/bin/bash

echo "🧪 Testing Multi-Agent Workspace Routing..."

# Check if procurement routing is correct
echo "✅ Checking procurement routing..."
if grep -A 1 'industrial-procurement' src/pages/MultiAgentWorkspace.tsx | grep -q 'mode="procurement"'; then
    echo "✅ Procurement routing correctly configured"
else
    echo "❌ Procurement routing not found"
    exit 1
fi

# Check if forecasting routing is correct
echo "✅ Checking forecasting routing..."
if grep -A 1 'industrial-forecasting' src/pages/MultiAgentWorkspace.tsx | grep -q 'mode="forecasting"'; then
    echo "✅ Forecasting routing correctly configured"
else
    echo "❌ Forecasting routing not found"
    exit 1
fi

# Check if BlankWorkspace supports both modes
echo "✅ Checking BlankWorkspace mode support..."
if grep -q "mode.*'procurement'.*'forecasting'" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ BlankWorkspace supports both procurement and forecasting modes"
else
    echo "❌ BlankWorkspace mode support not found"
    exit 1
fi

# Check if both agent palettes exist
echo "✅ Checking agent palette files..."
if [ -f "src/components/MultiAgentWorkspace/ProcurementAgentPalette.tsx" ]; then
    echo "✅ ProcurementAgentPalette.tsx exists"
else
    echo "❌ ProcurementAgentPalette.tsx not found"
    exit 1
fi

if [ -f "src/components/MultiAgentWorkspace/ForecastingAgentPalette.tsx" ]; then
    echo "✅ ForecastingAgentPalette.tsx exists"
else
    echo "❌ ForecastingAgentPalette.tsx not found"
    exit 1
fi

# Check if both palettes are imported in BlankWorkspace
echo "✅ Checking palette imports..."
if grep -q "import.*ProcurementAgentPalette" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ ProcurementAgentPalette imported"
else
    echo "❌ ProcurementAgentPalette not imported"
    exit 1
fi

if grep -q "import.*ForecastingAgentPalette" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ ForecastingAgentPalette imported"
else
    echo "❌ ForecastingAgentPalette not imported"
    exit 1
fi

echo ""
echo "🎉 All workspace routing tests passed!"
echo ""
echo "📋 Summary:"
echo "   ✅ Procurement routing: 'industrial-procurement' → BlankWorkspace mode='procurement'"
echo "   ✅ Forecasting routing: 'industrial-forecasting' → BlankWorkspace mode='forecasting'"
echo "   ✅ BlankWorkspace supports both modes"
echo "   ✅ Both specialized agent palettes exist and are imported"
echo ""
echo "🚀 Now when you click on the Industrial Technology cards:"
echo "   - 'Agentic Procurement & Supply Chain' → Orange/red themed workspace with procurement agents"
echo "   - 'Financial Forecasting & Scenario Analysis' → Purple/indigo themed workspace with forecasting agents"