# 🤖 Ollama Agents Integration

## Overview

I've successfully integrated the **Ollama Agents** feature from the tocheck folder into our existing app. This provides a comprehensive local AI agent management system powered by Ollama models.

## 🚀 What's Been Added

### **Frontend Components**
- **`OllamaAgentService.ts`** - Core service for agent management
- **`OllamaService.ts`** - Ollama API integration service  
- **`OllamaAgentChat.tsx`** - Interactive chat component for agents
- **`OllamaAgentDashboard.tsx`** - Full dashboard for managing agents
- **Navigation** - Added "Ollama Agents" to sidebar under Core Platform

### **Backend API**
- **`backend/ollama_api.py`** - Flask API for agent persistence and execution
- **`start_ollama_backend.py`** - Startup script with dependency checking
- **SQLite Database** - Local storage for agents, conversations, and metrics

### **Key Features**
1. **Agent Creation & Management** - Create, configure, and delete AI agents
2. **Real-time Chat** - Interactive conversations with agents
3. **Guardrails System** - Content filtering and safety controls
4. **Performance Monitoring** - Metrics, analytics, and health checks
5. **Model Integration** - Works with any Ollama model
6. **Persistent Storage** - Agents and conversations saved locally

## 🛠 Setup Instructions

### **1. Prerequisites**
```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull some models (examples)
ollama pull llama3.2:latest
ollama pull codellama:latest
ollama pull mistral:latest
```

### **2. Start Ollama Service**
```bash
# Start Ollama server
ollama serve
```

### **3. Start Backend API**
```bash
# Run the startup script (handles dependencies automatically)
python3 start_ollama_backend.py
```

### **4. Start Frontend**
```bash
# Start the React app (in another terminal)
npm run dev
```

### **5. Access Ollama Agents**
- Navigate to **http://localhost:5173/ollama-agents**
- Or click "Ollama Agents" in the sidebar under "Core Platform"

## 📋 Usage Guide

### **Creating Your First Agent**

1. **Click "Create Agent"** in the dashboard
2. **Fill in the details:**
   - **Name**: e.g., "Research Assistant"
   - **Role**: e.g., "Data Analyst" 
   - **Description**: What the agent does
   - **Model**: Select from available Ollama models
   - **System Prompt**: Instructions for the agent
   - **Temperature**: 0.1 (focused) to 1.0 (creative)
   - **Max Tokens**: Response length limit

3. **Configure Guardrails** (optional):
   - Enable content filtering
   - Set safety level (low/medium/high)
   - Add custom rules

4. **Click "Create Agent"**

### **Chatting with Agents**

1. **Click "Chat"** button next to any agent
2. **Type your message** in the input field
3. **Press Enter** or click Send
4. **View real-time metrics** below the chat

### **Monitoring Performance**

- **Total Executions**: Number of conversations
- **Average Response Time**: Speed metrics
- **Token Usage**: Resource consumption
- **Success Rate**: Reliability metrics

## 🔧 Configuration Options

### **Agent Configuration**
```typescript
{
  name: "Research Assistant",
  role: "Data Analyst", 
  model: "llama3.2:latest",
  systemPrompt: "You are a helpful research assistant...",
  temperature: 0.7,
  maxTokens: 1000,
  guardrails: {
    enabled: true,
    safetyLevel: "medium",
    contentFilters: ["profanity", "harmful"],
    rules: ["No financial advice", "No medical advice"]
  }
}
```

### **Backend Configuration**
- **Port**: 5052 (configurable in `ollama_api.py`)
- **Database**: SQLite (`ollama_agents.db`)
- **Ollama URL**: http://localhost:11434 (default)

## 🔍 API Endpoints

### **Agent Management**
- `GET /api/agents/ollama` - List all agents
- `POST /api/agents/ollama` - Create new agent
- `DELETE /api/agents/ollama/{id}` - Delete agent

### **Execution**
- `POST /api/agents/ollama/{id}/execute` - Execute agent
- `GET /api/agents/ollama/{id}/metrics` - Get performance metrics

### **Ollama Integration**
- `GET /api/ollama/status` - Check Ollama service status
- `GET /api/ollama/models` - List available models
- `POST /api/ollama/generate` - Generate response

### **Health Check**
- `GET /api/health` - System health status

## 🚨 Troubleshooting

### **Common Issues**

1. **"Ollama is not running"**
   ```bash
   # Start Ollama service
   ollama serve
   ```

2. **"No models available"**
   ```bash
   # Pull a model
   ollama pull llama3.2:latest
   ```

3. **"Backend API not available"**
   ```bash
   # Check if backend is running on port 5052
   curl http://localhost:5052/api/health
   ```

4. **"Failed to create agent"**
   - Check that Ollama is running
   - Verify the selected model exists
   - Check backend logs for errors

### **Backend Logs**
The backend provides detailed logging. Check the terminal where you ran `start_ollama_backend.py` for error messages.

### **Frontend Debugging**
Open browser developer tools (F12) and check the Console tab for any JavaScript errors.

## 🎯 Next Steps

### **Phase 2 Enhancements** (Available in tocheck folder)
1. **Advanced Reasoning** - Chain-of-thought, tree-of-thought patterns
2. **Multi-Agent Workflows** - Agent orchestration and handoffs  
3. **RAG Integration** - Document-based knowledge retrieval
4. **Strands Integration** - Advanced agent frameworks
5. **Memory Systems** - Long-term and contextual memory

### **Integration Options**
- Copy additional components from `tocheck/src/components/`
- Add workflow engine from `tocheck/backend/workflow_engine.py`
- Integrate with existing document RAG system
- Add multi-agent workspace capabilities

## 📊 Current Status

✅ **Completed:**
- Basic agent creation and management
- Real-time chat interface  
- Ollama model integration
- Performance monitoring
- Guardrails system
- Backend API with persistence
- Health monitoring

🔄 **Available for Integration:**
- Advanced reasoning patterns
- Multi-agent workflows
- RAG document integration
- Strands framework
- Memory systems
- Agent marketplace

## 🤝 Support

The Ollama Agents feature is now fully integrated and ready to use! The system provides:

- **Fallback Support**: Works offline with local storage if backend is unavailable
- **Error Handling**: Graceful degradation and user-friendly error messages  
- **Performance Monitoring**: Real-time metrics and health checks
- **Extensibility**: Easy to add more features from the tocheck folder

Navigate to `/ollama-agents` to start creating and chatting with your AI agents! 🚀