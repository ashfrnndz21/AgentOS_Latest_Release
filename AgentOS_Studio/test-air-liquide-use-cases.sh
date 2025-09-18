#!/bin/bash

echo "🧪 Testing Air Liquide Use Case Pages..."
echo "========================================"

# Test 1: Check if use case pages exist
echo "✅ Test 1: Use case page files"
if [ -f "src/pages/ProcurementAnalytics.tsx" ]; then
    echo "   ✓ ProcurementAnalytics.tsx exists"
else
    echo "   ✗ ProcurementAnalytics.tsx missing"
fi

if [ -f "src/pages/SafetyMonitoring.tsx" ]; then
    echo "   ✓ SafetyMonitoring.tsx exists"
else
    echo "   ✗ SafetyMonitoring.tsx missing"
fi

# Test 2: Check if routes are added to App.tsx
echo "✅ Test 2: Route configuration"
if grep -q "procurement-analytics" src/App.tsx; then
    echo "   ✓ Procurement Analytics route found"
else
    echo "   ✗ Procurement Analytics route not found"
fi

if grep -q "safety-monitoring" src/App.tsx; then
    echo "   ✓ Safety Monitoring route found"
else
    echo "   ✗ Safety Monitoring route not found"
fi

# Test 3: Check if imports are correct
echo "✅ Test 3: Import statements"
if grep -q "ProcurementAnalytics" src/App.tsx; then
    echo "   ✓ ProcurementAnalytics import found"
else
    echo "   ✗ ProcurementAnalytics import not found"
fi

if grep -q "SafetyMonitoring" src/App.tsx; then
    echo "   ✓ SafetyMonitoring import found"
else
    echo "   ✗ SafetyMonitoring import not found"
fi

# Test 4: Check if navigation paths exist in IndustryContext
echo "✅ Test 4: Navigation configuration"
if grep -q "/procurement-analytics" src/contexts/IndustryContext.tsx; then
    echo "   ✓ Procurement Analytics navigation found"
else
    echo "   ✗ Procurement Analytics navigation not found"
fi

if grep -q "/safety-monitoring" src/contexts/IndustryContext.tsx; then
    echo "   ✓ Safety Monitoring navigation found"
else
    echo "   ✗ Safety Monitoring navigation not found"
fi

# Test 5: Check if pages contain Air Liquide specific content
echo "✅ Test 5: Air Liquide content verification"
if grep -q "Air Liquide" src/pages/ProcurementAnalytics.tsx; then
    echo "   ✓ Air Liquide branding in ProcurementAnalytics"
else
    echo "   ✗ Air Liquide branding missing in ProcurementAnalytics"
fi

if grep -q "Hydrogen Production" src/pages/ProcurementAnalytics.tsx; then
    echo "   ✓ Hydrogen Production content in ProcurementAnalytics"
else
    echo "   ✗ Hydrogen Production content missing in ProcurementAnalytics"
fi

if grep -q "Air Liquide" src/pages/SafetyMonitoring.tsx; then
    echo "   ✓ Air Liquide branding in SafetyMonitoring"
else
    echo "   ✗ Air Liquide branding missing in SafetyMonitoring"
fi

# Test 6: Build test
echo "✅ Test 6: Build verification"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Build successful with new use case pages"
else
    echo "   ✗ Build failed - check for syntax errors"
    exit 1
fi

echo ""
echo "🎉 Air Liquide Use Case Pages Test Complete!"
echo "============================================"
echo ""
echo "📋 Available Use Cases:"
echo "   • Procurement Analytics: /procurement-analytics"
echo "   • Safety Monitoring: /safety-monitoring"
echo "   • R&D Discovery: /rd-discovery"
echo "   • Talent Management: /talent-management"
echo ""
echo "🔗 Navigation: Check sidebar 'Agent Use Cases' section"
echo "💡 Default Industry: Air Liquide Industrial (updated in IndustryContext)"