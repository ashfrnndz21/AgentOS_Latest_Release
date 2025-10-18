# Multi-Agent Orchestration System - Complete Architecture

## 🏗️ **System Overview**

Our multi-agent orchestration system is built with the following architecture:

### **Core Components:**
1. **Main System Orchestrator** (`backend/main_system_orchestrator.py`) - Central coordination
2. **A2A Service** (`backend/a2a_service.py`) - Agent-to-Agent communication
3. **Strands SDK** (`backend/strands_sdk_api.py`) - Agent creation and management
4. **Frontend Interface** (`src/components/A2A/MainSystemOrchestratorCard.tsx`) - User interface

---

## 📋 **1. Main System Orchestrator**

### **Configuration:**
```python
MAIN_ORCHESTRATOR_PORT = 5031
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
OLLAMA_BASE_URL = "http://localhost:11434"
ORCHESTRATOR_MODEL = "granite4:micro"
```

### **Core Classes:**

#### **OrchestrationSession**
```python
@dataclass
class OrchestrationSession:
    session_id: str
    query: str
    agents_involved: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
    results: Dict[str, Any] = None
```

#### **AgentCapability**
```python
@dataclass
class AgentCapability:
    agent_id: str
    name: str
    capabilities: List[str]
    model: str
    status: str
    a2a_enabled: bool
```

#### **MainSystemOrchestrator**
```python
class MainSystemOrchestrator:
    def __init__(self):
        self.orchestrator_model = ORCHESTRATOR_MODEL
        self.active_sessions = {}
        self.registered_agents = {}
        self.orchestration_history = []
        
        # Enhanced: Add production patterns
        self.task_queue = {}  # Simple in-memory task queue
        self.agent_versions = {}  # Agent versioning support
        self.execution_memory = {}  # Orchestrator memory for consolidation
```

### **Key Methods:**

#### **Agent Discovery**
```python
def discover_orchestration_enabled_agents(self) -> List[AgentCapability]:
    """Discover agents registered for orchestration - only those actually registered with A2A service"""
```

#### **Query Analysis**
```python
def analyze_query_with_llm(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Analyze query using LLM to determine orchestration strategy"""
```

#### **Agent Selection**
```python
def _select_optimal_agent_combination(self, agent_analysis: Dict[str, Any], query: str) -> Dict[str, Any]:
    """Select optimal agent combination based on analysis"""
```

#### **Multi-Agent Coordination**
```python
def _execute_agents_sequential(self, agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Execute agents sequentially with dependency handling"""

def _execute_agents_parallel(self, agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Execute agents in parallel using ThreadPoolExecutor"""

def _execute_agents_hybrid(self, agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Execute agents in dependency-aware parallel batches"""
```

#### **Memory Management**
```python
def _initialize_session_memory(self, session_id: str, query: str, selected_agents: List[str]) -> None:
    """Initialize session memory for tracking agent outputs"""

def _record_agent_output(self, session_id: str, agent_name: str, output: Any) -> None:
    """Record agent output in orchestrator memory"""

def _consolidate_agent_outputs(self, session_id: str) -> Dict[str, Any]:
    """Consolidate and categorize agent outputs intelligently"""
```

### **Execution Strategy Selection**
```python
def _determine_execution_strategy(self, task_analysis: Dict[str, Any], selected_agents: List[AgentCapability]) -> str:
    """Determine execution strategy: sequential, parallel, or hybrid"""
    # Returns: 'sequential', 'parallel', or 'hybrid'
```

---

## 🔗 **2. A2A Service Architecture**

### **Core Components:**
```python
class A2AService:
    def __init__(self):
        self.agents: Dict[str, A2AAgent] = {}
        self.messages: List[A2AMessage] = {}
        self.connections: Dict[str, A2AConnection] = {}
        self.ollama_manager = DedicatedOllamaManager()
        self.message_history: Dict[str, List[A2AMessage]] = {}
```

### **Agent Registration**
```python
def register_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
    """Register an agent for A2A communication following Strands framework"""
```

### **Message Handling**
```python
def send_message(self, from_agent_id: str, to_agent_id: str, message: str, message_type: str = "communication") -> Dict[str, Any]:
    """Send message between agents"""
```

---

## 🤖 **3. Strands SDK Integration**

### **Agent Creation**
```python
@app.route('/api/strands-sdk/agents', methods=['POST'])
def create_strands_agent():
    """Create a new Strands SDK agent following official patterns"""
```

### **Agent Configuration**
```python
class RealAgent:
    def __init__(self, model, system_prompt="You are a helpful assistant.", tools=None):
        self.model = model
        self.system_prompt = system_prompt
        self.tools = tools or []
```

---

## 🎨 **4. Frontend Architecture**

### **Main Orchestrator Card Component**
```typescript
// src/components/A2A/MainSystemOrchestratorCard.tsx
interface OrchestrationResult {
  orchestration_results: Record<string, AgentResult>;
  consolidated_agent_outputs: {
    execution_insights: ExecutionInsights;
    intelligent_summary: string;
    structured_content: {
      creative_content: ContentSection[];
      code_implementation: ContentSection[];
      analysis_results: ContentSection[];
    };
  };
}
```

### **Enhanced Display Features**
- **Phase 1**: Orchestration Status
- **Phase 2**: Query Analysis  
- **Phase 3**: Agent Selection & Scoring
- **Phase 4**: Task Execution Details
- **Phase 5**: Final Response
- **Phase 6**: Enhanced Consolidation Analysis

---

## 🔄 **5. Multi-Agent Execution Flow**

### **Sequential Execution**
```python
def _execute_agents_sequential(self, agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any]) -> Dict[str, Any]:
    results = {}
    previous_outputs = {}
    
    for i, agent in enumerate(agents):
        # Execute agent with previous outputs as context
        result = self._execute_single_agent(agent, query, task_analysis, previous_outputs)
        results[agent.name] = result
        previous_outputs[agent.name] = result
```

### **Parallel Execution**
```python
def _execute_agents_parallel(self, agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any]) -> Dict[str, Any]:
    with ThreadPoolExecutor(max_workers=len(agents)) as executor:
        future_to_agent = {
            executor.submit(self._execute_single_agent, agent, query, task_analysis, {}): agent 
            for agent in agents
        }
        
        results = {}
        for future in as_completed(future_to_agent):
            agent = future_to_agent[future]
            results[agent.name] = future.result()
```

### **Hybrid Execution**
```python
def _execute_agents_hybrid(self, agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any]) -> Dict[str, Any]:
    # Group agents by dependency level
    dependency_groups = self._group_agents_by_dependencies(agents, task_analysis)
    
    results = {}
    previous_outputs = {}
    
    for group in dependency_groups:
        # Execute agents in parallel within each dependency group
        group_results = self._execute_agents_parallel(group, query, task_analysis)
        results.update(group_results)
        previous_outputs.update(group_results)
```

---

## 📊 **6. Intelligent Content Categorization**

### **Content Type Detection**
```python
def _is_creative_content(self, content: str, agent_name: str) -> bool:
    """Determine if content is creative content (poems, stories, etc.)"""

def _is_code_content(self, content: str) -> bool:
    """Determine if content contains code"""

def _is_analysis_content(self, content: str, agent_name: str) -> bool:
    """Determine if content is analysis/technical content"""
```

### **Structured Output Organization**
```python
def _consolidate_agent_outputs(self, session_id: str) -> Dict[str, Any]:
    structured_content = {
        "creative_content": [],
        "code_implementation": [],
        "analysis_results": []
    }
    
    # Categorize content based on type and patterns
    for agent_name, output in agent_outputs.items():
        content = self._extract_content_from_output(output)
        if self._is_creative_content(content, agent_name):
            structured_content["creative_content"].append({
                "agent": agent_name, 
                "content": content
            })
        # ... similar for code and analysis
```

---

## 🎯 **7. Key Features**

### **Advanced Capabilities:**
- ✅ **LLM-based Query Analysis** using Granite4:micro
- ✅ **Real Agent Execution** with A2A handoffs
- ✅ **Complex Multi-Agent Coordination** (sequential, parallel, hybrid)
- ✅ **Database-Backed Registry** with SQLite and performance metrics
- ✅ **Reflective Orchestration** with self-improving output analysis
- ✅ **Intelligent Content Categorization** (creative, code, analysis)
- ✅ **Parallel Execution** using ThreadPoolExecutor
- ✅ **Orchestrator Memory Management** with session tracking
- ✅ **Enhanced Result Merging** with AI-generated summaries

### **Production Patterns:**
- ✅ **Task Queue** for managing agent workloads
- ✅ **Agent Versioning** for capability tracking
- ✅ **Execution Memory** for output consolidation
- ✅ **Robust Error Handling** with retry logic
- ✅ **Session Management** with timeout handling

---

## 🚀 **8. API Endpoints**

### **Main Orchestrator Endpoints:**
- `POST /api/main-orchestrator/orchestrate` - Main orchestration endpoint
- `GET /api/main-orchestrator/health` - Health check
- `GET /api/main-orchestrator/agents` - Discover available agents
- `GET /api/main-orchestrator/sessions` - List active sessions
- `GET /api/main-orchestrator/memory/<session_id>` - Get session memory
- `GET /api/main-orchestrator/memory` - List all session memories

### **A2A Service Endpoints:**
- `GET /api/a2a/agents` - List registered agents
- `POST /api/a2a/agents` - Register new agent
- `POST /api/a2a/agents/{agent_id}/receive` - Send message to agent

### **Strands SDK Endpoints:**
- `POST /api/strands-sdk/agents` - Create new Strands agent
- `GET /api/strands-sdk/agents` - List Strands agents
- `GET /api/strands-sdk/health` - Health check

---

## 🔧 **9. Configuration & Setup**

### **Environment Setup:**
```bash
# Backend services
python main_system_orchestrator.py  # Port 5031
python a2a_service.py              # Port 5008  
python strands_sdk_api.py          # Port 5006

# Frontend
npm run dev                        # Port 5173
```

### **Agent Registration:**
```python
# Register agents with correct models
curl -X POST http://localhost:5008/api/a2a/agents \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Creative Assistant",
    "model": "qwen3:1.7b",
    "capabilities": ["general", "creative"]
  }'
```

---

## 📈 **10. Performance & Monitoring**

### **Execution Insights:**
- **Content Generators**: Count of agents producing creative content
- **Code Implementers**: Count of agents producing code
- **Analysts**: Count of agents producing analysis
- **Total Content Length**: Aggregate output size
- **Execution Time**: Per-agent and total timing

### **Session Tracking:**
- Session creation and management
- Agent output recording
- Memory consolidation
- Performance metrics

---

This multi-agent orchestration system represents a sophisticated, production-ready architecture that combines advanced LLM integration, real agent execution, intelligent coordination, and comprehensive result management. The system is designed to be extensible, maintainable, and capable of handling complex multi-agent workflows while preserving the advanced capabilities of individual agents.



