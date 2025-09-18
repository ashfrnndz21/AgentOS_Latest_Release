# 🏗️ Backend Architecture & Port Configuration

## Current Backend Services

Our system now runs **multiple independent backend services** on different ports, each serving specific purposes:

### 📊 Service Port Map

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
├─────────────────────────────────────────────────────────────┤
│ Port 5002 │ ollama_api.py          │ Legacy Ollama Agents   │
│ Port 5003 │ strands_api.py         │ Custom Strands System  │
│ Port 5004 │ chat_orchestrator_api.py│ Chat Orchestration    │
│ Port 5005 │ rag_api.py             │ RAG Document System    │
│ Port 5006 │ strands_sdk_api.py     │ Official Strands SDK   │ ← NEW!
│ Port 11434│ Ollama Server          │ LLM Model Server       │
└─────────────────────────────────────────────────────────────┘
```

## 🆕 New Strands SDK Service (Port 5006)

### Purpose
- **Official Strands SDK Integration**: Uses the real `strands-agents` Python package
- **Parallel System**: Runs alongside existing services without disruption
- **SDK Compliance**: Follows official Strands patterns exactly

### Key Features
```python
# Real Strands SDK Usage
from strands import Agent
from strands.model_providers import OllamaModel

# Create agent following official patterns
ollama_model = OllamaModel(
    host="http://localhost:11434",
    model_id="llama3"
)

agent = Agent(
    model=ollama_model,
    system_prompt="You are a helpful assistant."
)

# Execute agent
response = agent("Your input here")
```

### Database
- **Separate Database**: `strands_sdk_agents.db` (independent from existing systems)
- **Tables**: 
  - `strands_sdk_agents` - Agent configurations
  - `strands_sdk_executions` - Execution logs with SDK metadata

### API Endpoints
```
GET    /api/strands-sdk/health           # Health check
POST   /api/strands-sdk/agents          # Create agent
GET    /api/strands-sdk/agents          # List agents
GET    /api/strands-sdk/agents/{id}     # Get specific agent
POST   /api/strands-sdk/agents/{id}/execute  # Execute agent
DELETE /api/strands-sdk/agents/{id}     # Delete agent
```

## 🎨 Frontend Integration

### Dashboard Integration
The `OllamaAgentDashboard.tsx` now has **two creation buttons**:

```tsx
// Existing button (unchanged)
<Button onClick={() => setShowCreateDialog(true)}>
  <Plus size={16} className="mr-2" />
  Create Agent
</Button>

// NEW Strands SDK button
<Button onClick={() => setShowStrandsSdkDialog(true)}>
  <Sparkles size={16} className="mr-2" />
  Create Strands Agent
</Button>
```

### Service Layer
```typescript
// src/lib/services/StrandsSdkService.ts
class StrandsSdkService {
  private baseUrl = 'http://localhost:5006/api/strands-sdk';
  
  async createAgent(agentData: StrandsSdkCreateRequest) {
    // Communicates with port 5006
  }
}
```

### UI Components
```
src/components/MultiAgentWorkspace/
├── StrandsSdkAgentDialog.tsx     # Creation dialog with SDK preview
└── (existing components unchanged)

src/lib/services/
├── StrandsSdkService.ts          # New service for SDK API
├── OllamaAgentService.ts         # Existing service (unchanged)
└── (other services unchanged)
```

## 🔄 How It All Works Together

### 1. User Workflow
```
User clicks "Create Strands Agent" 
    ↓
StrandsSdkAgentDialog opens
    ↓
Shows form + real SDK code preview
    ↓
User fills form and clicks create
    ↓
StrandsSdkService.createAgent() called
    ↓
HTTP POST to localhost:5006/api/strands-sdk/agents
    ↓
Backend creates agent using real Strands SDK
    ↓
Agent stored in strands_sdk_agents.db
    ↓
Success response returned to UI
    ↓
Dialog closes, dashboard refreshes
```

### 2. Agent Execution Flow
```
User executes Strands SDK agent
    ↓
StrandsSdkService.executeAgent() called
    ↓
HTTP POST to localhost:5006/api/strands-sdk/agents/{id}/execute
    ↓
Backend loads agent config from database
    ↓
Creates Strands Agent using official SDK:
  - OllamaModel(host, model_id)
  - Agent(model, system_prompt)
    ↓
Executes: agent(input_text)
    ↓
Logs execution in strands_sdk_executions table
    ↓
Returns response with SDK metadata
```

### 3. Mixed Agent Display
The dashboard shows **both types** of agents with clear badges:

```tsx
// Legacy agents show:
<Badge variant="secondary">Legacy</Badge>

// Strands SDK agents show:
<Badge variant="secondary" className="bg-purple-100 text-purple-700">
  <Sparkles className="h-3 w-3 mr-1" />
  Strands SDK
</Badge>
```

## 🚀 Benefits of This Architecture

### ✅ Zero Risk
- Existing system completely untouched
- Independent databases and services
- Easy to remove if needed

### ✅ True SDK Compliance
- Uses official `strands-agents` package
- Follows documented patterns exactly
- Gets official SDK updates automatically

### ✅ User Choice
- Side-by-side comparison of approaches
- Users can choose preferred method
- Gradual migration path available

### ✅ Future-Proof
- Foundation for full SDK migration
- Can add advanced SDK features incrementally
- Maintains backward compatibility

## 🔧 Service Management

### Start All Services
```bash
# Start individual services
./start-strands-sdk-service.sh     # Port 5006
./start-all-services.sh            # All other services

# Or start specific service
cd backend && python3 strands_sdk_api.py
```

### Health Checks
```bash
# Check Strands SDK service
curl http://localhost:5006/api/strands-sdk/health

# Check all services
./check-services-status.sh
```

### Service Dependencies
```
Strands SDK Service (5006)
    ↓ depends on
Ollama Server (11434)
    ↓ provides
LLM Models (llama3, mistral, etc.)
```

## 📊 Data Flow Summary

```
Frontend (React/TypeScript)
    ↕ HTTP Requests
StrandsSdkService.ts
    ↕ Port 5006
strands_sdk_api.py (Flask)
    ↕ Official SDK
Strands Agent Library
    ↕ Port 11434
Ollama Server
    ↕ Model Loading
Local LLM Models
```

This architecture gives us the best of both worlds: **stability** (existing system unchanged) and **innovation** (official Strands SDK integration) running in parallel!