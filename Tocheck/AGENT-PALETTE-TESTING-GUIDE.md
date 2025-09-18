# Agent Palette Integration Testing Guide

## 🎯 Overview

This comprehensive testing suite validates the complete integration between Ollama agents and the Multi Agent Workspace palette. The integration allows your real Ollama agents to appear in the Agent Palette for drag & drop workflow creation.

## 📋 Test Files Overview

### **Core Test Files**

| File | Purpose | Description |
|------|---------|-------------|
| `test_agent_palette_complete.html` | **Visual Testing Interface** | Interactive browser-based testing with live API calls |
| `test_agent_palette_integration_complete.py` | **Backend Integration Test** | Validates API endpoints and data transformation |
| `validate_agent_palette_frontend.py` | **Frontend Validation** | Checks TypeScript files and component integration |
| `run_complete_agent_palette_tests.py` | **Complete Test Suite** | Runs all tests in sequence with comprehensive reporting |

### **Execution Scripts**

| File | Platform | Purpose |
|------|----------|---------|
| `test_agent_palette_integration.sh` | **macOS/Linux** | Bash script to run all tests |
| `test_agent_palette_integration.bat` | **Windows** | Batch script to run all tests |

## 🚀 Quick Start

### **Option 1: Run All Tests (Recommended)**

**macOS/Linux:**
```bash
./test_agent_palette_integration.sh
```

**Windows:**
```cmd
test_agent_palette_integration.bat
```

**Python (Cross-platform):**
```bash
python run_complete_agent_palette_tests.py
```

### **Option 2: Individual Tests**

**Frontend Validation:**
```bash
python validate_agent_palette_frontend.py
```

**Backend Integration:**
```bash
python test_agent_palette_integration_complete.py
```

**Visual Testing:**
```bash
# Open in browser
open test_agent_palette_complete.html
```

## 📊 What Each Test Validates

### **1. Frontend Validation (`validate_agent_palette_frontend.py`)**

**Checks:**
- ✅ `useOllamaAgentsForPalette` hook exists and is properly implemented
- ✅ `AgentPalette` component integration
- ✅ `BlankWorkspace` drag & drop handling
- ✅ `ModernAgentNode` display enhancements
- ✅ `OllamaAgentService` method calls
- ✅ TypeScript type definitions
- ✅ Error handling implementation

**Expected Output:**
```
🔍 Starting Frontend Integration Validation
==================================================
✅ PASS File Exists: src/hooks/useOllamaAgentsForPalette.ts
✅ PASS Hook - getAllAgents method: Uses correct service method
✅ PASS Hook - Transform function: Has transformation function
✅ PASS Hook - Icon assignment: Has icon assignment logic
...
🎉 ALL FRONTEND VALIDATIONS PASSED!
```

### **2. Backend Integration (`test_agent_palette_integration_complete.py`)**

**Checks:**
- ✅ Backend API accessibility
- ✅ `/api/agents/ollama/enhanced` endpoint
- ✅ Agent data structure validation
- ✅ Data transformation logic
- ✅ Icon assignment based on roles
- ✅ Capabilities mapping
- ✅ Guardrails status extraction
- ✅ Palette data format compliance

**Expected Output:**
```
🧪 Starting Agent Palette Integration Tests
==================================================
✅ PASS Backend Connection: Backend is accessible
✅ PASS Ollama Agents API: Retrieved 3 agents
✅ PASS Agent Data Structure: All agents have required fields
✅ PASS Agent Transformation: Successfully transformed 3 agents
...
🎉 ALL TESTS PASSED!
```

### **3. Visual Testing (`test_agent_palette_complete.html`)**

**Features:**
- 🌐 **Interactive Interface** - Visual representation of expected results
- 🔄 **Live API Testing** - Test backend connection and data transformation
- 📋 **Step-by-Step Guide** - Manual testing checklist
- 🔧 **Troubleshooting** - Common issues and solutions
- 📊 **Expected vs Actual** - Compare results

**How to Use:**
1. Open `test_agent_palette_complete.html` in your browser
2. Click "Test Backend Connection" to verify API access
3. Click "Test Agent Transformation" to validate data processing
4. Follow the manual testing checklist
5. Use troubleshooting guide if issues arise

## 🔧 Prerequisites

### **Required Components**

1. **Backend Running**
   ```bash
   python backend/simple_api.py
   ```
   - Should be accessible on `http://localhost:8000`
   - Health check endpoint should respond

2. **Ollama Agents Created**
   - At least one agent in Ollama Agent Management
   - Agents should have proper configuration (model, capabilities, etc.)

3. **Frontend Files**
   - All integration files should be in place
   - TypeScript compilation should be successful

### **File Structure Check**

The tests verify these files exist:
```
src/
├── hooks/
│   └── useOllamaAgentsForPalette.ts
├── components/
│   └── MultiAgentWorkspace/
│       ├── AgentPalette.tsx
│       ├── BlankWorkspace.tsx
│       └── nodes/
│           └── ModernAgentNode.tsx
└── lib/
    └── services/
        └── OllamaAgentService.ts
```

## 📈 Test Results Interpretation

### **Success Indicators**

**All Tests Pass:**
```
🎉 ALL TESTS PASSED!
✅ Agent Palette integration is working correctly
✅ Ready for production use
```

**What This Means:**
- Frontend components are properly integrated
- Backend API is accessible and returning correct data
- Data transformation is working correctly
- Agent icons, capabilities, and guardrails are properly mapped
- Drag & drop functionality should work in the browser

### **Failure Indicators**

**Common Failure Patterns:**

**Backend Not Running:**
```
❌ FAIL Backend Connection: Connection failed: Connection refused
```
**Solution:** Start backend with `python backend/simple_api.py`

**No Agents Found:**
```
❌ FAIL Ollama Agents API: Retrieved 0 agents
```
**Solution:** Create agents in Ollama Agent Management first

**Missing Files:**
```
❌ FAIL File Exists: Missing: src/hooks/useOllamaAgentsForPalette.ts
```
**Solution:** Ensure all integration files are properly created

**Method Call Issues:**
```
❌ FAIL Hook - getAllAgents method: Missing: Uses correct service method
```
**Solution:** Update hook to use `getAllAgents()` instead of `getAgents()`

## 🎯 Manual Testing Steps

After automated tests pass, manually verify:

### **Step 1: Navigate to Multi Agent Workspace**
- Go to your application
- Navigate to Multi Agent Workspace section
- Select "Start Building Your Workflow"

### **Step 2: Open Agent Palette**
- Agent Palette should be visible on the left side
- Click on the "Agents" tab
- Should show loading state initially

### **Step 3: Verify Agent Display**
Your Ollama agents should appear with:
- ✅ Correct names and descriptions
- ✅ Appropriate icons (💼 for CVM, 📡 for Telecom, etc.)
- ✅ Model information badges (phi3, mistral, etc.)
- ✅ Capability badges (Chat, Analysis, Creative, Reasoning)
- ✅ Guardrails indicators (✅ Enabled / ❌ Disabled)

### **Step 4: Test Drag & Drop**
- Drag an agent from the palette to the workspace canvas
- Agent should appear as a node with:
  - Correct icon and name
  - Model information
  - Guardrails status
  - All metadata preserved

### **Step 5: Verify Workflow Creation**
- Connect multiple agent nodes
- Verify agent properties are accessible
- Test workflow execution (if implemented)

## 🚨 Troubleshooting

### **Backend Issues**

**Problem:** Backend connection fails
```bash
# Check if backend is running
curl http://localhost:8000/health

# Start backend if not running
python backend/simple_api.py
```

**Problem:** API returns empty agent list
```bash
# Check Ollama agents directly
curl http://localhost:8000/api/agents/ollama/enhanced

# Create agents in Ollama Agent Management if empty
```

### **Frontend Issues**

**Problem:** Agents don't appear in palette
1. Check browser console for JavaScript errors
2. Verify network tab shows successful API calls
3. Check if hook is properly imported and used
4. Refresh page to reload components

**Problem:** Drag & drop doesn't work
1. Check console for drag event errors
2. Verify agent data structure in dev tools
3. Test with different agents to isolate issues

**Problem:** Agent nodes don't show metadata
1. Check if `BlankWorkspace` preserves agent data
2. Verify `ModernAgentNode` accesses correct properties
3. Check for TypeScript compilation errors

### **Data Issues**

**Problem:** Icons not showing correctly
- Check icon assignment logic in transformation function
- Verify role-based icon mapping
- Test with agents having different roles

**Problem:** Capabilities not displaying
- Check capabilities transformation in hook
- Verify boolean to string array conversion
- Test with agents having different capability configurations

**Problem:** Guardrails status incorrect
- Check guardrails extraction logic
- Verify boolean conversion
- Test with agents having different guardrails settings

## 📚 Additional Resources

### **Documentation Files**
- `AGENT-PALETTE-OLLAMA-INTEGRATION-COMPLETE.md` - Complete implementation guide
- `test_hook_fix.py` - Hook-specific validation
- `test_agent_palette_integration.py` - Original integration test

### **Debug Tools**
- Browser Developer Tools - Check console and network tabs
- Backend logs - Monitor API calls and errors
- React Developer Tools - Inspect component state and props

### **Support**
If tests continue to fail after troubleshooting:
1. Check all file paths and imports
2. Verify TypeScript compilation
3. Review backend logs for API errors
4. Test individual components in isolation
5. Compare with working implementation examples

## 🎉 Success Criteria

**Integration is complete when:**
- ✅ All automated tests pass
- ✅ Ollama agents appear in Agent Palette
- ✅ Agents show correct metadata (icons, models, capabilities, guardrails)
- ✅ Drag & drop creates proper workflow nodes
- ✅ Agent properties are preserved in workspace
- ✅ No console errors during operation
- ✅ Smooth user experience from agent creation to workflow building

**Ready for production use!** 🚀