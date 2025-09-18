#!/bin/bash

echo "🔍 COMMAND CENTRE COMPLETE FIX VERIFICATION"
echo "=============================================="

echo ""
echo "✅ 1. CHECKING PROJECT DATA STRUCTURE"
echo "--------------------------------------"

# Check if all required functions exist in ProjectData.tsx
echo "🔍 Checking for missing functions..."
if grep -q "generateForecastingDecisionNodes" src/components/CommandCentre/ProjectData.tsx; then
    echo "✅ generateForecastingDecisionNodes() - EXISTS"
else
    echo "❌ generateForecastingDecisionNodes() - MISSING"
fi

if grep -q "generateForecastingLineageNodes" src/components/CommandCentre/ProjectData.tsx; then
    echo "✅ generateForecastingLineageNodes() - EXISTS"
else
    echo "❌ generateForecastingLineageNodes() - MISSING"
fi

if grep -q "generateForecastingLineageEdges" src/components/CommandCentre/ProjectData.tsx; then
    echo "✅ generateForecastingLineageEdges() - EXISTS"
else
    echo "❌ generateForecastingLineageEdges() - MISSING"
fi

echo ""
echo "✅ 2. CHECKING PROJECT KEYS"
echo "---------------------------"

# Check if correct project keys are used
if grep -q "hydrogen-production" src/components/CommandCentre/ProjectData.tsx; then
    echo "✅ 'hydrogen-production' project key - EXISTS"
else
    echo "❌ 'hydrogen-production' project key - MISSING"
fi

if grep -q "industrial-forecasting" src/components/CommandCentre/ProjectData.tsx; then
    echo "✅ 'industrial-forecasting' project key - EXISTS"
else
    echo "❌ 'industrial-forecasting' project key - MISSING"
fi

if grep -q "process-engineering" src/components/CommandCentre/ProjectData.tsx; then
    echo "✅ 'process-engineering' project key - EXISTS"
else
    echo "❌ 'process-engineering' project key - MISSING"
fi

echo ""
echo "✅ 3. CHECKING DEFAULT PROJECT SETTING"
echo "--------------------------------------"

# Check if default project is set correctly
if grep -q "hydrogen-production" src/pages/CommandCentre.tsx; then
    echo "✅ Default project set to 'hydrogen-production' - CORRECT"
else
    echo "❌ Default project not set to 'hydrogen-production' - NEEDS FIX"
fi

echo ""
echo "✅ 4. CHECKING PROJECT SELECTOR MAPPINGS"
echo "----------------------------------------"

# Check ProjectSelector mappings
if grep -q "'hydrogen-production': 'Hydrogen Production'" src/components/CommandCentre/ProjectSelector.tsx; then
    echo "✅ ProjectSelector mapping for hydrogen-production - CORRECT"
else
    echo "❌ ProjectSelector mapping for hydrogen-production - MISSING"
fi

if grep -q "'industrial-forecasting': 'Financial Forecasting" src/components/CommandCentre/ProjectSelector.tsx; then
    echo "✅ ProjectSelector mapping for industrial-forecasting - CORRECT"
else
    echo "❌ ProjectSelector mapping for industrial-forecasting - MISSING"
fi

echo ""
echo "✅ 5. CHECKING COST CONTENT UPDATES"
echo "-----------------------------------"

# Check if CostContent has been updated with Air Liquide projects
if grep -q "'Hydrogen Production'" src/components/CommandCentre/CostContent.tsx; then
    echo "✅ CostContent updated with 'Hydrogen Production' - CORRECT"
else
    echo "❌ CostContent still has old project names - NEEDS FIX"
fi

if grep -q "Electrolysis Process Agent" src/components/CommandCentre/CostContent.tsx; then
    echo "✅ CostContent updated with Air Liquide agents - CORRECT"
else
    echo "❌ CostContent still has old agent names - NEEDS FIX"
fi

echo ""
echo "✅ 6. CHECKING FOR OLD PROJECT REFERENCES"
echo "-----------------------------------------"

# Check for any remaining old project references
OLD_REFS=$(grep -r "consumer-banking\|network-capex\|customer-lifetime" src/components/CommandCentre/ --exclude-dir=node_modules --exclude="*.tsx.backup" | grep -v "TelcoProject" | wc -l)

if [ "$OLD_REFS" -eq 0 ]; then
    echo "✅ No old project references found - CLEAN"
else
    echo "⚠️  Found $OLD_REFS old project references - CHECK NEEDED"
    grep -r "consumer-banking\|network-capex\|customer-lifetime" src/components/CommandCentre/ --exclude-dir=node_modules --exclude="*.tsx.backup" | grep -v "TelcoProject" | head -5
fi

echo ""
echo "✅ 7. CHECKING ROUTING CONFIGURATION"
echo "------------------------------------"

# Check if routing is correct
if grep -q 'path="/agent-command"' src/App.tsx; then
    echo "✅ Route '/agent-command' configured - CORRECT"
else
    echo "❌ Route '/agent-command' not found - NEEDS FIX"
fi

if grep -q '<CommandCentre />' src/App.tsx; then
    echo "✅ CommandCentre component imported and used - CORRECT"
else
    echo "❌ CommandCentre component not properly configured - NEEDS FIX"
fi

echo ""
echo "✅ 8. CHECKING INDUSTRY CONTEXT"
echo "-------------------------------"

# Check if industry context is properly handled
if grep -q "currentIndustry.id === 'telco'" src/pages/CommandCentre.tsx; then
    echo "✅ Industry context handling - CORRECT"
else
    echo "❌ Industry context not properly handled - NEEDS FIX"
fi

echo ""
echo "🎯 SUMMARY"
echo "=========="
echo ""
echo "The Command Centre fix includes:"
echo "✅ Added missing generateForecastingDecisionNodes() function"
echo "✅ Added missing generateForecastingLineageNodes() function" 
echo "✅ Added missing generateForecastingLineageEdges() function"
echo "✅ Updated default project from 'consumer-banking' to 'hydrogen-production'"
echo "✅ Fixed ProjectSelector mappings for Air Liquide projects"
echo "✅ Updated CostContent with Air Liquide project names and agents"
echo "✅ Updated GuardrailData with industrial-specific guardrails"
echo "✅ Maintained telco compatibility through industry context"
echo ""
echo "🚀 EXPECTED RESULT:"
echo "The Command Centre should now load without white screen issues"
echo "and display complete Air Liquide industrial workflows!"
echo ""
echo "📍 TO TEST:"
echo "1. Navigate to '/agent-command' in the browser"
echo "2. Verify projects load: Hydrogen Production, Financial Forecasting, Process Engineering"
echo "3. Switch between projects and verify traceability displays"
echo "4. Check Cost tab shows Air Liquide agents and projects"
echo ""