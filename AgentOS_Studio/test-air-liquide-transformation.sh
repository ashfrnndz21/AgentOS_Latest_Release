#!/bin/bash

echo "🧪 Testing Air Liquide Industrial Transformation..."
echo "=================================================="

# Test 1: Check if the application starts without errors
echo "✅ Test 1: Application startup"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Build successful"
else
    echo "   ✗ Build failed"
    exit 1
fi

# Test 2: Check if ProjectData.tsx has been properly transformed
echo "✅ Test 2: ProjectData transformation"
if grep -q "hydrogen-production" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ Hydrogen Production project found"
else
    echo "   ✗ Hydrogen Production project not found"
fi

if grep -q "industrial-gas-supply" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ Industrial Gas Supply project found"
else
    echo "   ✗ Industrial Gas Supply project not found"
fi

if grep -q "process-engineering" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ Process Engineering project found"
else
    echo "   ✗ Process Engineering project not found"
fi

# Test 3: Check if banking references have been removed
echo "✅ Test 3: Banking references removal"
if ! grep -q "consumer-banking\|corporate-banking\|wealth-management" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ Banking project keys removed"
else
    echo "   ✗ Banking project keys still present"
fi

if ! grep -q "loan\|credit\|KYC\|banking" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ Banking terminology removed"
else
    echo "   ✗ Banking terminology still present"
fi

# Test 4: Check if industrial terminology is present
echo "✅ Test 4: Industrial terminology verification"
if grep -q "hydrogen\|electrolysis\|production\|safety\|energy" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ Industrial terminology found"
else
    echo "   ✗ Industrial terminology not found"
fi

# Test 5: Check if Air Liquide branding is in place
echo "✅ Test 5: Air Liquide branding"
if grep -q "Air Liquide" src/contexts/IndustryContext.tsx; then
    echo "   ✓ Air Liquide branding found in IndustryContext"
else
    echo "   ✗ Air Liquide branding not found in IndustryContext"
fi

if [ -f "src/components/ui/AirLiquideLogo.tsx" ]; then
    echo "   ✓ Air Liquide logo component exists"
else
    echo "   ✗ Air Liquide logo component missing"
fi

# Test 6: Check if specialized agent palettes exist
echo "✅ Test 6: Specialized agent palettes"
if [ -f "src/components/MultiAgentWorkspace/ProcurementAgentPalette.tsx" ]; then
    echo "   ✓ Procurement Agent Palette exists"
else
    echo "   ✗ Procurement Agent Palette missing"
fi

if [ -f "src/components/MultiAgentWorkspace/ForecastingAgentPalette.tsx" ]; then
    echo "   ✓ Forecasting Agent Palette exists"
else
    echo "   ✗ Forecasting Agent Palette missing"
fi

if [ -f "src/components/MultiAgentWorkspace/RecruitmentAgentPalette.tsx" ]; then
    echo "   ✓ Recruitment Agent Palette exists"
else
    echo "   ✗ Recruitment Agent Palette missing"
fi

echo ""
echo "🎉 Air Liquide Industrial Transformation Test Complete!"
echo "=================================================="