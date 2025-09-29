# Backend Service Architecture Redesign

## 🎯 **CORE PRINCIPLES**
1. **Single Responsibility** - Each service has one clear purpose
2. **Dependency Hierarchy** - Clear parent-child relationships
3. **Graceful Degradation** - Services work independently when possible
4. **Health Monitoring** - Proactive service health checks
5. **Auto-Recovery** - Automatic restart on failure

## 🏗️ **SERVICE LAYERS**

### **Layer 1: Core Infrastructure**
- **Ollama Core** (11434) - LLM Engine (External dependency)
- **Database** - SQLite/PostgreSQL (Data persistence)

### **Layer 2: Data Services**
- **Agent Registry** (5010) - Central agent management
- **Strands SDK API** (5006) - Agent data operations
- **Resource Monitor** (5011) - System monitoring

### **Layer 3: Business Logic Services**
- **Ollama API** (5002) - LLM operations
- **RAG API** (5003) - Document processing
- **Strands API** (5004) - Intelligence & reasoning
- **Chat Orchestrator** (5005) - Multi-agent chat

### **Layer 4: Orchestration Services**
- **Enhanced Orchestration** (5014) - Main orchestration
- **Working Orchestration** (5022) - Alternative orchestration
- **A2A Service** (5008) - Agent-to-agent communication

### **Layer 5: Integration Services**
- **Frontend Agent Bridge** (5012) - Frontend integration
- **A2A Observability** (5018) - Monitoring & tracing
- **Dynamic Context** (5020) - Context management

### **Layer 6: Frontend**
- **Vite Dev Server** (5173) - Frontend application

## 🔄 **DEPENDENCY FLOW**
```
Ollama Core → Agent Registry → Strands SDK → A2A Service → Orchestration → Frontend
     ↓              ↓              ↓            ↓            ↓
  Ollama API → Resource Monitor → Chat Orchestrator → Frontend Bridge
```

## 🛡️ **FAILURE ISOLATION**
- **Independent Services**: Can run without dependencies
- **Circuit Breakers**: Prevent cascade failures
- **Retry Logic**: Exponential backoff for transient failures
- **Health Checks**: Proactive monitoring and recovery

## 📊 **RESOURCE ALLOCATION**
- **Memory Limits**: Per-service memory constraints
- **CPU Throttling**: Prevent resource contention
- **Connection Pooling**: Efficient database connections
- **Caching**: Reduce redundant operations

