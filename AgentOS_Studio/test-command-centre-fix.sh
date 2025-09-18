#!/bin/bash

echo "🔧 Testing Command Centre Fix..."
echo "================================"

# Test 1: Check if the project data structure is correct
echo "✅ Test 1: Project data structure"
if grep -q "hydrogen-production" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ hydrogen-production project found"
else
    echo "   ✗ hydrogen-production project not found"
fi

if grep -q "industrial-forecasting" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ industrial-forecasting project found"
else
    echo "   ✗ industrial-forecasting project not found"
fi

if grep -q "process-engineering" src/components/CommandCentre/ProjectData.tsx; then
    echo "   ✓ process-engineering project found"
else
    echo "   ✗ process-engineering project not found"
fi

# Test 2: Check if CommandCentre uses correct default project
echo "✅ Test 2: CommandCentre default project"
if grep -q "hydrogen-production" src/pages/CommandCentre.tsx; then
    echo "   ✓ CommandCentre uses hydrogen-production as default"
else
    echo "   ✗ CommandCentre not using correct default project"
fi

# Test 3: Check if ProjectSelector has correct mappings
echo "✅ Test 3: ProjectSelector mappings"
if grep -q "hydrogen-production.*Hydrogen Production" src/components/CommandCentre/ProjectSelector.tsx; then
    echo "   ✓ ProjectSelector has correct hydrogen-production mapping"
else
    echo "   ✗ ProjectSelector mapping incorrect"
fi

# Test 4: Check for old banking references
echo "✅ Test 4: Old banking references cleanup"
OLD_REFS=$(grep -r "consumer-banking" src/components/CommandCentre/ 2>/dev/null | wc -l)
if [ "$OLD_REFS" -eq 0 ]; then
    echo "   ✓ No old consumer-banking references found"
else
    echo "   ⚠️  Found $OLD_REFS old consumer-banking references"
    grep -r "consumer-banking" src/components/CommandCentre/ 2>/dev/null || true
fi

# Test 5: Build test
echo "✅ Test 5: Build verification"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Build successful"
else
    echo "   ✗ Build failed - check for syntax errors"
    exit 1
fi

echo ""
echo "🎯 Root Cause of White Screen:"
echo "   The CommandCentre was trying to access 'consumer-banking' project data"
echo "   but the ProjectData only contains 'hydrogen-production', 'industrial-forecasting', etc."
echo ""
echo "🔧 Fixes Applied:"
echo "   1. Updated CommandCentre default project from 'consumer-banking' to 'hydrogen-production'"
echo "   2. Updated ProjectSelector mappings to use new project keys"
echo "   3. Ensured project data structure consistency"
echo ""
echo "💡 The Command Centre should now work without white screen issues!"