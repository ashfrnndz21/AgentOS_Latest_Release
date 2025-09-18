# Backend Architecture Clarification

## 🏗️ **Two-Backend System**

The platform uses a **two-backend architecture**:

### **1. Ollama Backend (Port 11434)**
- **Purpose**: Local AI model serving
- **Service**: Native Ollama application
- **Status**: ✅ Running (confirmed via `curl http://localhost:11434/api/tags`)
- **Management**: Managed by Ollama app, not by our BackendControl component

### **2. Python Backend (Port 8000)**
- **Purpose**: API integration layer between frontend and Ollama
- **Service**: `backend/simple_api.py` (FastAPI application)
- **Status**: ✅ Running (confirmed via `curl http://localhost:8000/health`)
- **Management**: This is what the BackendControl component manages

## 🎯 **BackendControl Component Purpose**

The BackendControl component in the UI manages the **Python Backend** (port 8000), NOT Ollama directly.

### **What it Controls:**
- Python FastAPI server (`simple_api.py`)
- API endpoints for agent creation, document processing, etc.
- Integration layer that communicates with Ollama
- Configuration management for timeouts and settings

### **What it Does NOT Control:**
- Ollama service itself (port 11434)
- Ollama model management (handled via API calls)
- Direct Ollama operations

## 🔍 **Current Status Investigation**

### **Backend Status Check:**
```bash
# Python Backend (what BackendControl manages)
curl http://localhost:8000/health
# ✅ Returns: {"status":"healthy","timestamp":"...","api_keys":{...}}

# Ollama Backend (separate service)
curl http://localhost:11434/api/tags  
# ✅ Returns: {"models":[...]} with available models
```

### **Process Verification:**
```bash
lsof -i :8000
# ✅ Shows Python process (PID 55847) listening on port 8000

ps aux | grep ollama
# ✅ Shows Ollama.app process running
```

## 🐛 **Current Issue Analysis**

### **Problem:**
- BackendControl shows "OFFLINE" when Python backend is actually running
- Start button doesn't work properly
- Status detection is failing

### **Likely Causes:**
1. **CORS Issues**: Frontend might be running on different port than expected
2. **Timing Issues**: Status check happening before config is loaded
3. **State Management**: Component state not updating properly
4. **Network Issues**: Fetch requests failing silently

### **CORS Configuration:**
```python
# In backend/simple_api.py
allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8081"]
```

## 🔧 **Debugging Steps Added**

### **1. Enhanced Logging**
- Added console.log statements to track status checks
- Debug function to test connection manually
- Better error reporting with detailed messages

### **2. Improved Error Handling**
- Timeout handling with AbortController
- Specific error messages for different failure types
- Force refresh capability

### **3. Debug Tools**
- "Debug" button to manually test connection
- Console logging for troubleshooting
- Alert messages showing actual response data

## 🚀 **How to Troubleshoot**

### **Step 1: Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Click "Refresh" or "Debug" button in BackendControl
4. Look for log messages starting with "Checking backend status at:"

### **Step 2: Verify Backend Response**
1. Click "Debug" button in BackendControl
2. Check alert message for actual response
3. Verify if backend is responding correctly

### **Step 3: Manual Test**
1. Open `test-backend-status.html` in browser
2. Check if direct fetch to backend works
3. Compare with BackendControl behavior

### **Step 4: Check Network Tab**
1. Open Network tab in developer tools
2. Click "Refresh" in BackendControl
3. Look for requests to `http://localhost:8000/health`
4. Check if requests are being made and what responses are received

## 📋 **Expected Behavior**

### **When Working Correctly:**
- BackendControl shows "ONLINE" with green indicator
- Status shows "Running" with port 8000
- Uptime information displayed
- Start button changes to Stop button
- Test/Debug button works without errors

### **Current Behavior:**
- Shows "OFFLINE" despite backend running
- Start button available (should show Stop)
- Status check appears to be failing

## 🎯 **Next Steps**

1. **Use Debug Button**: Click the Debug button to see actual connection test results
2. **Check Console**: Look for error messages or failed requests
3. **Verify Port**: Ensure frontend is making requests to correct port (8000)
4. **Test CORS**: Verify CORS headers are allowing the frontend origin

The Python backend is definitely running and responding correctly. The issue is in the frontend status detection mechanism.