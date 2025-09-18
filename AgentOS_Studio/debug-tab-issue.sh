#!/bin/bash

echo "🔍 DEBUGGING TAB CLICKING ISSUE"
echo "================================"

echo ""
echo "✅ 1. CHECKING COMPONENT STRUCTURE"
echo "----------------------------------"

# Check if all required components exist
echo "🔍 Checking MainTabs component..."
if [ -f "src/components/CommandCentre/MainTabs.tsx" ]; then
    echo "✅ MainTabs.tsx exists"
else
    echo "❌ MainTabs.tsx missing"
fi

echo "🔍 Checking content components..."
for component in "ToolsContent" "DataAccessContent" "GovernanceContent" "CostContent"; do
    if [ -f "src/components/CommandCentre/${component}.tsx" ]; then
        echo "✅ ${component}.tsx exists"
    else
        echo "❌ ${component}.tsx missing"
    fi
done

echo ""
echo "✅ 2. CHECKING FOR SYNTAX ERRORS"
echo "--------------------------------"

# Check for basic syntax issues in MainTabs
echo "🔍 Checking MainTabs syntax..."
if grep -q "export.*MainTabs" src/components/CommandCentre/MainTabs.tsx; then
    echo "✅ MainTabs export found"
else
    echo "❌ MainTabs export missing"
fi

if grep -q "onValueChange.*handleTabChangeInternal" src/components/CommandCentre/MainTabs.tsx; then
    echo "✅ onValueChange handler found"
else
    echo "❌ onValueChange handler missing"
fi

echo ""
echo "✅ 3. CHECKING TAB VALUES"
echo "------------------------"

# Check if all tab values are consistent
echo "🔍 Checking TabsTrigger values..."
for tab in "dashboard" "traceability" "tools" "data" "governance" "cost" "monitoring"; do
    if grep -q "value=\"${tab}\"" src/components/CommandCentre/MainTabs.tsx; then
        echo "✅ TabsTrigger for '${tab}' found"
    else
        echo "❌ TabsTrigger for '${tab}' missing"
    fi
    
    if grep -q "TabsContent value=\"${tab}\"" src/components/CommandCentre/MainTabs.tsx; then
        echo "✅ TabsContent for '${tab}' found"
    else
        echo "❌ TabsContent for '${tab}' missing"
    fi
done

echo ""
echo "✅ 4. CHECKING PROJECT DATA ACCESS"
echo "----------------------------------"

# Check if project data structure is correct
echo "🔍 Checking project data structure..."
if grep -q "projectData\[selectedProject\]" src/components/CommandCentre/MainTabs.tsx; then
    echo "✅ Project data access pattern found"
else
    echo "❌ Project data access pattern missing"
fi

echo ""
echo "✅ 5. CHECKING IMPORTS"
echo "----------------------"

# Check if all required imports are present
echo "🔍 Checking UI component imports..."
if grep -q "import.*Tabs.*from.*@/components/ui/tabs" src/components/CommandCentre/MainTabs.tsx; then
    echo "✅ Tabs components imported"
else
    echo "❌ Tabs components not imported"
fi

echo ""
echo "🎯 POTENTIAL ISSUES TO CHECK:"
echo "=============================="
echo ""
echo "1. 🖱️ CLICK EVENTS:"
echo "   - Check browser console for JavaScript errors"
echo "   - Verify no CSS is blocking pointer events"
echo "   - Test if tabs respond to keyboard navigation"
echo ""
echo "2. 📊 PROJECT DATA:"
echo "   - Verify selectedProject exists in projectData"
echo "   - Check if project data has all required properties"
echo "   - Ensure no undefined values causing errors"
echo ""
echo "3. 🎨 STYLING:"
echo "   - Check if tabs are visually disabled"
echo "   - Verify z-index and positioning"
echo "   - Look for CSS conflicts"
echo ""
echo "4. ⚛️ REACT STATE:"
echo "   - Check if activeTab state is updating"
echo "   - Verify setActiveTab function is working"
echo "   - Look for state conflicts"
echo ""
echo "📝 DEBUGGING STEPS:"
echo "==================="
echo "1. Open browser console and navigate to Command Centre"
echo "2. Look for console.log messages starting with 🔄 or 🔍"
echo "3. Try clicking tabs and check for error messages"
echo "4. Check if handleTabChangeInternal is being called"
echo "5. Verify project data is loaded correctly"
echo ""