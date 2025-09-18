# Document Chat Debug & Fix Guide 🔧

## 🎯 **Issue:** Can't chat with uploaded PDF documents

## 🔍 **Debugging Steps:**

### **Step 1: Check Backend Status**
```bash
# Make sure your backend is running
python backend/simple_api.py
# OR
python backend/ollama_service.py
```

### **Step 2: Test Ollama Connection**
1. Open `test-ollama-connection.html` in your browser
2. Click "Test Ollama Status" - should show green status
3. Click "Test Generate" - should return a response

### **Step 3: Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Upload a document and try to chat
4. Look for debug messages:
   - "RAG Service available: true"
   - "Selected documents: [...]"
   - "Available documents: [...]"
   - "RAG Response: {...}"

### **Step 4: Verify Document Processing**
1. Upload a document
2. Check that status changes from "Processing" → "Ready"
3. Switch to "Chat with Documents" tab
4. Verify document appears in selection badges

## 🛠️ **Common Issues & Fixes:**

### **Issue 1: Backend Not Running**
**Symptoms:** Ollama status shows red, no response to chat
**Fix:**
```bash
# Start the backend
cd backend
python simple_api.py
```

### **Issue 2: Ollama Not Running**
**Symptoms:** Backend running but Ollama status red
**Fix:**
```bash
# Start Ollama
ollama serve

# Pull a model if needed
ollama pull llama3.2
```

### **Issue 3: Document IDs Not Matching**
**Symptoms:** Documents upload but chat doesn't work
**Fix:** Already implemented - RAG service now uses consistent IDs

### **Issue 4: No Documents Selected**
**Symptoms:** Chat works but gives generic responses
**Fix:** Select specific documents using the badges in chat interface

### **Issue 5: Model Not Available**
**Symptoms:** Chat fails with model error
**Fix:**
```bash
# Check available models
ollama list

# Pull the model you're trying to use
ollama pull llama3.2
```

## 🔧 **Enhanced Debugging Features Added:**

### **Console Logging:**
- RAG service availability check
- Document ID mapping verification
- Ollama request/response logging
- Chunk finding results

### **Status Indicators:**
- Real-time Ollama connection status
- Document processing status
- Model selection feedback

## 🚀 **Testing Workflow:**

### **1. Complete Setup Check:**
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Backend
cd backend
python simple_api.py

# Terminal 3: Start Frontend
npm run dev
```

### **2. Test Document Upload:**
1. Go to Document Workspace
2. Upload a PDF/TXT file
3. Watch status change to "Ready"
4. Check console for processing logs

### **3. Test Chat Functionality:**
1. Switch to "Chat with Documents" tab
2. Select documents using badges
3. Choose Ollama model (llama3.2 recommended)
4. Ask: "What is this document about?"
5. Check console for debug logs

### **4. Verify RAG Pipeline:**
```
Upload → Text Extraction → Chunking → RAG Index → Chat Ready
```

## 🎯 **Expected Console Output:**
```
RAG Service available: true
Selected documents: ["doc-id-123"]
Available documents: [{id: "doc-id-123", name: "file.pdf"}]
Selected model: llama3.2
RAG Query: {query: "What is this about?", documentIds: ["doc-id-123"]}
Available documents in RAG service: ["doc-id-123"]
Found chunks: 5
Sources: ["file.pdf"]
Sending request to Ollama: {model: "llama3.2", prompt: "..."}
Ollama response: {status: "success", response: "Based on the document..."}
```

## 🔥 **Quick Test Commands:**

### **Test Backend:**
```bash
curl http://localhost:8000/api/ollama/status
```

### **Test Ollama:**
```bash
curl http://localhost:11434/api/tags
```

### **Test Generate:**
```bash
curl -X POST http://localhost:8000/api/ollama/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2","prompt":"Hello"}'
```

## 🎉 **Success Indicators:**

- ✅ **Ollama Status**: Green "Connected" 
- ✅ **Document Upload**: Status shows "Ready"
- ✅ **Chat Interface**: Model selector works
- ✅ **Document Selection**: Badges are clickable
- ✅ **AI Response**: Real response with sources
- ✅ **Console Logs**: Debug messages appear

## 🔮 **If Still Not Working:**

### **Check Network:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Ollama: http://localhost:11434

### **Check Ports:**
```bash
# Check if ports are in use
lsof -i :5173  # Frontend
lsof -i :8000  # Backend  
lsof -i :11434 # Ollama
```

### **Restart Everything:**
```bash
# Kill all processes
pkill -f "ollama"
pkill -f "python"
pkill -f "npm"

# Restart in order
ollama serve &
python backend/simple_api.py &
npm run dev
```

The debug logging will help identify exactly where the issue is occurring in the RAG pipeline! 🚀