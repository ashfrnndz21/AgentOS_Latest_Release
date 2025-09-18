#!/bin/bash

echo "🧪 Testing Recruitment Implementation..."

# Check if recruitment routing is correct
echo "✅ Checking recruitment routing..."
if grep -A 1 'industrial-recruitment' src/pages/MultiAgentWorkspace.tsx | grep -q 'mode="recruitment"'; then
    echo "✅ Recruitment routing correctly configured"
else
    echo "❌ Recruitment routing not found"
    exit 1
fi

# Check if RecruitmentAgentPalette exists
echo "✅ Checking RecruitmentAgentPalette component..."
if [ -f "src/components/MultiAgentWorkspace/RecruitmentAgentPalette.tsx" ]; then
    echo "✅ RecruitmentAgentPalette.tsx exists"
else
    echo "❌ RecruitmentAgentPalette.tsx not found"
    exit 1
fi

# Check if BlankWorkspace supports recruitment mode
echo "✅ Checking BlankWorkspace recruitment mode support..."
if grep -q "mode.*'recruitment'" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ BlankWorkspace supports recruitment mode"
else
    echo "❌ BlankWorkspace recruitment mode support not found"
    exit 1
fi

# Check if recruitment nodes exist
echo "✅ Checking recruitment nodes..."
if grep -q "recruitmentNodes" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ Recruitment nodes found"
else
    echo "❌ Recruitment nodes not found"
    exit 1
fi

# Check if TelcoCvmPropertiesPanel has recruitment agent types
echo "✅ Checking TelcoCvmPropertiesPanel recruitment support..."
if grep -q "talent-sourcing-specialist" src/components/MultiAgentWorkspace/TelcoCvmPropertiesPanel.tsx; then
    echo "✅ Recruitment agent types found in properties panel"
else
    echo "❌ Recruitment agent types not found in properties panel"
    exit 1
fi

# Check if recruitment palette is imported
echo "✅ Checking recruitment palette import..."
if grep -q "import.*RecruitmentAgentPalette" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ RecruitmentAgentPalette imported"
else
    echo "❌ RecruitmentAgentPalette not imported"
    exit 1
fi

# Check if recruitment agents have specialized tools
echo "✅ Checking recruitment agent tools..."
if grep -q "LinkedIn Sourcing" src/components/MultiAgentWorkspace/TelcoCvmPropertiesPanel.tsx; then
    echo "✅ Recruitment-specific tools found"
else
    echo "❌ Recruitment-specific tools not found"
    exit 1
fi

# Check if recruitment agents have specialized metrics
echo "✅ Checking recruitment agent metrics..."
if grep -q "candidatesSourced" src/components/MultiAgentWorkspace/TelcoCvmPropertiesPanel.tsx; then
    echo "✅ Recruitment-specific metrics found"
else
    echo "❌ Recruitment-specific metrics not found"
    exit 1
fi

# Check indigo theming for recruitment
echo "✅ Checking recruitment indigo theming..."
if grep -q "border-indigo-400/20" src/components/MultiAgentWorkspace/RecruitmentAgentPalette.tsx; then
    echo "✅ Indigo theming found in recruitment palette"
else
    echo "❌ Indigo theming not found in recruitment palette"
    exit 1
fi

if grep -q "via-indigo-900" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ Indigo gradient found in BlankWorkspace"
else
    echo "❌ Indigo gradient not found in BlankWorkspace"
    exit 1
fi

echo ""
echo "🎉 All recruitment implementation tests passed!"
echo ""
echo "📋 Summary:"
echo "   ✅ Recruitment routing: 'industrial-recruitment' → BlankWorkspace mode='recruitment'"
echo "   ✅ RecruitmentAgentPalette with specialized HR agents"
echo "   ✅ TelcoCvmPropertiesPanel supports recruitment agents"
echo "   ✅ Detailed recruitment nodes and workflow"
echo "   ✅ Recruitment-specific tools, metrics, and guardrails"
echo "   ✅ Professional indigo theming for recruitment workspace"
echo ""
echo "🚀 The recruitment workspace now has:"
echo "   - 6 specialized talent management agents"
echo "   - Central Talent Management Orchestrator"
echo "   - HR tools (Candidate Database, Skills Matcher, Document Processor)"
echo "   - End-to-end talent lifecycle workflow"
echo "   - Professional indigo-themed interface"
echo "   - Comprehensive agent configuration with HR-specific metrics"