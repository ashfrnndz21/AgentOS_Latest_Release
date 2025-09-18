# 🔧 Strands Integration Troubleshooting Guide

## 🚨 **Issue: "Failed to create agent: Not Found"**

This error means the frontend can't reach the Strands API endpoints. Let's debug step by step:

## 🔍 **Step 1: Check Backend Status**

### **1. Start the Backend**:
```bash
cd backend
python simple_api.py
```

### **2. Verify Backend is Running**:
- Open: `http://localhost:8000`
- You should see: "Enterprise Agent Platform API"

### **3. Test Strands Integration**:
- Open: `http://localhost:8000/api/strands/test`
- Expected response:
```json
{
  "status": "success",
  "message": "Strands integration is working",
  "strands_available": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔍 **Step 2: Check API Documentation**

### **1. View API Docs**:
- Open: `http://localhost:8000/docs`
- Look for **"strands-framework"** section
- You should see endpoints like:
  - `POST /api/strands/agents`
  - `GET /api/strands/agents`
  - `POST /api/strands/agents/execute`

### **2. Test Agent Creation Manually**:
- In the API docs, try `POST /api/strands/agents`
- Use this test payload:
```json
{
  "name": "Test Agent",
  "description": "Test Strands agent",
  "model": {
    "provider": "ollama",
    "model_name": "llama3.2:8b"
  },
  "reasoning_patterns": {
    "chain_of_thought": true,
    "tree_of_thought": false,
    "reflection": false,
    "self_critique": false,
    "multi_step_reasoning": false,
    "analogical_reasoning": false
  },
  "memory_enabled": true,
  "tools": [],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

## 🔍 **Step 3: Check Ollama Status**

### **1. Verify Ollama is Running**:
```bash
ollama serve
```

### **2. Check Available Models**:
```bash
ollama list
```

### **3. Test Ollama Connectivity**:
- Open: `http://localhost:8000/api/ollama/status`
- Should show: `"status": "running"`

## 🔍 **Step 4: Check Frontend Configuration**

### **1. Verify Frontend is Calling Correct URL**:
- The frontend should call: `http://localhost:8000/api/strands/agents`
- Check browser Network tab when creating agent

### **2. Check for CORS Issues**:
- Look for CORS errors in browser console
- Backend should allow `http://localhost:3000` and `http://localhost:5173`

## 🛠️ **Common Fixes**

### **Fix 1: Backend Import Issues**
If you see import errors in backend logs:
```bash
cd backend
python -c "import strands_api; print('OK')"
```

### **Fix 2: Missing Dependencies**
```bash
pip install fastapi uvicorn pydantic
```

### **Fix 3: Port Conflicts**
- Backend should run on port 8000
- Frontend on port 3000 or 5173
- Ollama on port 11434

### **Fix 4: Restart Services**
```bash
# Stop all services
pkill -f "python simple_api.py"
pkill -f "ollama serve"

# Restart in order
ollama serve &
python backend/simple_api.py &
npm run dev
```

## 🔍 **Step 5: Debug Logs**

### **1. Check Backend Logs**:
When starting backend, look for:
```
✅ Strands Framework API enabled
```

If you see:
```
⚠️ Strands Framework API disabled: [error message]
```
Then there's an import issue.

### **2. Check Browser Console**:
- Open Developer Tools → Console
- Look for network errors when creating agent
- Check Network tab for failed requests

### **3. Check Browser Network Tab**:
- When clicking "Create Agent", you should see:
- `POST http://localhost:8000/api/strands/agents`
- Status should be 200, not 404

## 🚀 **Quick Test Sequence**

Run these tests in order:

1. **Backend Health**: `curl http://localhost:8000/api/strands/test`
2. **Ollama Status**: `curl http://localhost:8000/api/ollama/status`  
3. **Strands Endpoints**: Check `http://localhost:8000/docs`
4. **Frontend Connection**: Create agent and check Network tab

## 📞 **If Still Not Working**

### **Manual API Test**:
```bash
curl -X POST "http://localhost:8000/api/strands/agents" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "model": {"provider": "ollama", "model_name": "llama3.2:8b"},
    "reasoning_patterns": {"chain_of_thought": true},
    "memory_enabled": true,
    "temperature": 0.7,
    "max_tokens": 2000
  }'
```

Expected response:
```json
{
  "agent_id": "strands-20240115103000-0",
  "name": "Test Agent",
  "model": "llama3.2:8b",
  "status": "ready",
  "created_at": "2024-01-15T10:30:00.000Z",
  "capabilities": ["Chain Of Thought", "Ollama Model: llama3.2:8b"],
  "tools": []
}
```

## 🎯 **Expected Working State**

When everything is working:
1. ✅ Backend shows "Strands Framework API enabled"
2. ✅ `/api/strands/test` returns success
3. ✅ `/docs` shows Strands endpoints
4. ✅ Ollama status is "running"
5. ✅ Frontend can create agents without "Not Found" error

Follow this guide step by step to identify where the issue is occurring!