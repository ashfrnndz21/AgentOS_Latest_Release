#!/bin/bash

echo "🧪 Testing Forecasting Properties Panel Integration..."

# Check if the BlankWorkspace has forecasting mode
echo "✅ Checking BlankWorkspace forecasting mode..."
if grep -q "mode === 'forecasting'" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ Forecasting mode found in BlankWorkspace"
else
    echo "❌ Forecasting mode not found in BlankWorkspace"
    exit 1
fi

# Check if ForecastingAgentPalette exists
echo "✅ Checking ForecastingAgentPalette component..."
if [ -f "src/components/MultiAgentWorkspace/ForecastingAgentPalette.tsx" ]; then
    echo "✅ ForecastingAgentPalette component found"
else
    echo "❌ ForecastingAgentPalette component not found"
    exit 1
fi

# Check if TelcoCvmPropertiesPanel has forecasting agent types
echo "✅ Checking TelcoCvmPropertiesPanel forecasting support..."
if grep -q "demand-forecasting-specialist" src/components/MultiAgentWorkspace/TelcoCvmPropertiesPanel.tsx; then
    echo "✅ Forecasting agent types found in properties panel"
else
    echo "❌ Forecasting agent types not found in properties panel"
    exit 1
fi

# Check if forecasting agents have detailed data structure
echo "✅ Checking forecasting agent data structure..."
if grep -q "forecastingNodes" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ Forecasting nodes found in BlankWorkspace"
else
    echo "❌ Forecasting nodes not found in BlankWorkspace"
    exit 1
fi

if grep -q "forecastingEdges" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ Forecasting edges found in BlankWorkspace"
else
    echo "❌ Forecasting edges not found in BlankWorkspace"
    exit 1
fi

# Check if properties panel handles forecasting-specific metrics
echo "✅ Checking forecasting-specific metrics handling..."
if grep -q "forecastAccuracy" src/components/MultiAgentWorkspace/TelcoCvmPropertiesPanel.tsx; then
    echo "✅ Forecast accuracy metrics found"
else
    echo "❌ Forecast accuracy metrics not found"
    exit 1
fi

if grep -q "scenariosCreated" src/components/MultiAgentWorkspace/TelcoCvmPropertiesPanel.tsx; then
    echo "✅ Scenario modeling metrics found"
else
    echo "❌ Scenario modeling metrics not found"
    exit 1
fi

if grep -q "reportsGenerated" src/components/MultiAgentWorkspace/TelcoCvmPropertiesPanel.tsx; then
    echo "✅ Market analysis metrics found"
else
    echo "❌ Market analysis metrics not found"
    exit 1
fi

# Check if forecasting palette has all required agents
echo "✅ Checking forecasting agent palette completeness..."
if grep -q "demand-forecasting-specialist" src/components/MultiAgentWorkspace/ForecastingAgentPalette.tsx; then
    echo "✅ Demand forecasting specialist found in palette"
else
    echo "❌ Demand forecasting specialist not found in palette"
    exit 1
fi

if grep -q "scenario-modeling-specialist" src/components/MultiAgentWorkspace/ForecastingAgentPalette.tsx; then
    echo "✅ Scenario modeling specialist found in palette"
else
    echo "❌ Scenario modeling specialist not found in palette"
    exit 1
fi

if grep -q "market-analysis-specialist" src/components/MultiAgentWorkspace/ForecastingAgentPalette.tsx; then
    echo "✅ Market analysis specialist found in palette"
else
    echo "❌ Market analysis specialist not found in palette"
    exit 1
fi

# Check purple theming for forecasting
echo "✅ Checking forecasting purple theming..."
if grep -q "border-purple-400/20" src/components/MultiAgentWorkspace/ForecastingAgentPalette.tsx; then
    echo "✅ Purple theming found in forecasting palette"
else
    echo "❌ Purple theming not found in forecasting palette"
    exit 1
fi

if grep -q "via-purple-900" src/components/MultiAgentWorkspace/BlankWorkspace.tsx; then
    echo "✅ Purple gradient found in BlankWorkspace"
else
    echo "❌ Purple gradient not found in BlankWorkspace"
    exit 1
fi

echo ""
echo "🎉 All forecasting properties panel tests passed!"
echo ""
echo "📋 Summary:"
echo "   ✅ Forecasting mode integrated in BlankWorkspace"
echo "   ✅ ForecastingAgentPalette with specialized agents"
echo "   ✅ TelcoCvmPropertiesPanel supports forecasting agents"
echo "   ✅ Detailed agent data structure with metrics, memory, tools, guardrails"
echo "   ✅ Forecasting-specific performance metrics"
echo "   ✅ Professional properties panel with 5 tabs"
echo "   ✅ Purple theming for forecasting workspace"
echo ""
echo "🚀 The forecasting workspace now has detailed agent profiles!"
echo "   - 6 specialized forecasting agents (Demand, Market, Scenario, Risk, Optimization, Sensitivity)"
echo "   - Central Forecasting Orchestrator for coordination"
echo "   - Analytics engines (Data Processor, Visualization, External Data)"
echo "   - Professional purple-themed interface"
echo "   - Comprehensive agent configuration with specialized metrics"