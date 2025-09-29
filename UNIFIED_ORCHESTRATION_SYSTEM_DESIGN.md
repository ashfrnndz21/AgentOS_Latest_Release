# Unified Orchestration System Design

## 🎯 **System Overview**

The Unified Orchestration System is a sophisticated AI agent coordination framework that combines **6-Stage LLM Analysis**, **Dynamic Agent Discovery**, and **Agent-to-Agent (A2A) Communication** into a single, intelligent workflow.

### **Core Philosophy**
```
User Query → System Orchestrator (LLM) → Agent Registry → A2A Communication → Response
     ↓              ↓                        ↓                ↓                ↓
  Complex       6-Stage LLM              Dynamic Agent    Intelligent      Clean
  Analysis      Analysis                 Discovery        Handoffs         Output
```

---

## 🏗️ **Architecture Components**

### **1. Unified System Orchestrator (`unified_system_orchestrator.py`)**
- **Purpose**: Central orchestration engine that coordinates all workflow stages
- **Model**: Uses `qwen3:1.7b` as the orchestrator LLM
- **Session Management**: Tracks active sessions with 300-second timeout
- **Data Flow Tracking**: Complete visibility into all data exchanges

### **2. Working Orchestration API (`working_orchestration_api.py`)**
- **Port**: 5021
- **Purpose**: REST API endpoint for the unified system
- **Endpoints**: 
  - `/health` - Service health check
  - `/api/orchestrate` - Main orchestration endpoint

### **3. Frontend Integration**
- **UnifiedOrchestrationInterface.tsx**: React component for orchestration UI
- **UnifiedOrchestrationService.ts**: TypeScript service for API communication
- **SystemOrchestratorModal.tsx**: Modal interface for system orchestrator

---

## 🔄 **6-Stage LLM Analysis Workflow**

### **Stage 1: Query Analysis**
```python
def _analyze_query_stage_1(self, query: str) -> Dict[str, Any]:
    """
    Stage 1: Comprehensive query analysis
    - Domain identification
    - Complexity assessment
    - Intent classification
    - Required expertise mapping
    """
```

**Output Example:**
```json
{
  "domain": "Telecommunications & Customer Churn",
  "complexity": "moderate",
  "user_intent": "Understand the factors influencing customer churn",
  "required_expertise": "Network engineering (PRB/throughput), business metrics (KPIs), churn analysis",
  "dependencies": "None identified",
  "scope": "general"
}
```

### **Stage 2: Sequence Definition**
```python
def _define_workflow_sequence_stage_2(self, query: str, stage_1_analysis: Dict) -> Dict[str, Any]:
    """
    Stage 2: Define execution workflow
    - Execution flow planning
    - Handoff point identification
    - Parallel opportunity analysis
    - Workflow step definition
    """
```

**Output Example:**
```json
{
  "execution_flow": "First resolve technical metrics, then move to business KPIs",
  "handoff_points": "No handoffs required",
  "parallel_opportunities": "None identified",
  "workflow_steps": [
    "Step 1: Analyze PRB/throughput impact on churn",
    "Step 2: Identify KPIs affecting churn",
    "Step 3: Explain churn drivers beyond KPIs"
  ]
}
```

### **Stage 3: Orchestrator Reasoning**
```python
def _orchestrator_reasoning_stage_3(self, query: str, stage_1_analysis: Dict, stage_2_analysis: Dict) -> Dict[str, Any]:
    """
    Stage 3: Orchestrator contextual reasoning
    - User intent analysis
    - Domain analysis
    - Complexity assessment
    - Processing strategy determination
    """
```

### **Stage 4: Agent Registry Analysis**
```python
def _analyze_agent_registry_stage_4(self, available_agents: List[Dict], stage_1_analysis: Dict) -> Dict[str, Any]:
    """
    Stage 4: Agent capability analysis
    - Available agent assessment
    - Capability matching
    - Relevance scoring
    - Tool analysis
    """
```

**Output Example:**
```json
{
  "available_agents": [
    {
      "name": "Telco RAN Agent",
      "order": 1,
      "task": "Explain PRB/throughput impact on churn",
      "status": "Selected",
      "score": 80,
      "relevance": "Relevant for PRB/throughput analysis but secondary to churn",
      "role": "Focuses on network performance and provides recommendations"
    }
  ],
  "capability_matching": "The RAN Agent focuses on network performance metrics and their impact on churn"
}
```

### **Stage 5: Agent Selection & Sequencing**
```python
def _select_and_sequence_agents_stage_5(self, agent_analysis: Dict, stage_2_analysis: Dict) -> Dict[str, Any]:
    """
    Stage 5: Final agent selection and sequencing
    - Agent list finalization
    - Execution order determination
    - Handoff strategy planning
    - Context preparation
    """
```

### **Stage 6: Orchestration Plan**
```python
def _create_orchestration_plan_stage_6(self, selected_agents: Dict, stage_3_reasoning: Dict) -> Dict[str, Any]:
    """
    Stage 6: Final orchestration plan creation
    - Execution strategy finalization
    - Confidence assessment
    - Success criteria definition
    - Orchestration reasoning
    """
```

---

## 🔍 **Dynamic Agent Discovery**

### **Agent Registry Integration**
```python
def _discover_agents(self) -> List[Dict[str, Any]]:
    """
    Discover available agents from Strands SDK
    - Fetches agents from http://localhost:5006/api/strands-sdk/agents
    - Maps A2A agent IDs to Strands SDK agent IDs
    - Returns executable agent information
    """
```

### **Intelligent Agent Selection**
```python
def _select_agents_intelligently(self, available_agents: List[Dict], domain: str) -> List[Dict[str, Any]]:
    """
    LLM-driven agent selection based on:
    - Domain relevance (Telecommunications, Customer Churn, etc.)
    - Agent capabilities and tools
    - Query complexity requirements
    - Sequential processing needs
    """
```

**Specialized Logic for Telco Agents:**
- **Telco RAN Agent**: Selected for PRB/throughput analysis
- **Telco Churn Agent**: Selected for churn analysis and KPIs
- **Telco Customer Service**: Excluded from technical churn analysis

---

## 🤝 **A2A Communication & Handoffs**

### **Sequential Handoff Pattern**
```
Orchestrator → Agent 1 → Orchestrator → Agent 2 → Orchestrator → Final Output
```

### **Context-Aware Input Preparation**
```python
def _prepare_agent_input(self, agent: Dict[str, Any], step_number: int, query: str, previous_output: str = None) -> str:
    """
    Prepare context-aware input for each agent:
    - First agent: Direct query (exactly like direct calls)
    - Subsequent agents: Contextual input with previous results
    - Avoids complex A2A instructions that cause truncation
    """
```

### **Explicit Orchestrator Handoffs**
```python
def _orchestrator_process_agent_output(self, agent_output: str, step_number: int, session_id: str) -> Dict[str, Any]:
    """
    Explicit orchestrator processing after each agent:
    - Processes agent output
    - Updates context for next agent
    - Maintains complete data flow tracking
    - Ensures proper handoff pattern
    """
```

### **Complete Data Flow Tracking**
```python
def _track_data_exchange(self, session_id: str, step: int, data_sent: str, raw_data_received: str, cleaned_data_received: str):
    """
    Tracks every data exchange:
    - Data sent to agent
    - Raw data received from agent
    - Cleaned data after processing
    - Timestamps and metadata
    """
```

---

## 🧹 **Text Cleaning & Response Processing**

### **Frontend-Compatible Cleaning Logic**
```python
def _clean_agent_response(self, response: str) -> str:
    """
    Clean agent response using the same logic as frontend:
    - Split by <think> tags
    - Keep content after </think>
    - Remove other thinking tags (<reasoning>, <analysis>)
    - Preserve complete content (no truncation)
    """
```

### **Response Synthesis**
```python
def _synthesize_clean_response_with_tracking(self, handoff_result: Dict[str, Any], session_id: str, complete_data_flow: Dict[str, Any]) -> str:
    """
    Final response synthesis:
    - Applies frontend cleaning logic
    - Tracks compression ratios
    - Maintains complete data flow
    - Returns clean, readable output
    """
```

---

## 📊 **Observability & Monitoring**

### **Complete Data Flow Object**
```json
{
  "session_id": "uuid",
  "timestamp": "ISO datetime",
  "stage_1_analysis": { /* Query analysis */ },
  "stage_2_analysis": { /* Workflow planning */ },
  "stage_3_analysis": { /* Orchestrator reasoning */ },
  "stage_4_analysis": { /* Agent registry analysis */ },
  "stage_5_analysis": { /* Agent selection */ },
  "stage_6_analysis": { /* Orchestration plan */ },
  "data_exchanges": [
    {
      "step": 1,
      "agent": "Telco RAN Agent",
      "data_sent": "Query text sent to agent",
      "raw_data_received": "Complete raw response from agent",
      "cleaned_data_received": "Cleaned response after processing",
      "timestamp": "ISO datetime"
    }
  ],
  "final_synthesis": {
    "input": { /* Raw response data */ },
    "output": { /* Cleaned response data */ },
    "processing_notes": "Final response synthesis and cleaning completed"
  }
}
```

### **Workflow Summary**
```json
{
  "total_stages": 4,
  "stages_completed": 4,
  "execution_strategy": "sequential",
  "agents_used": ["Telco RAN Agent", "Telco Churn Agent"],
  "processing_time": 134.32,
  "success": true
}
```

---

## 🚀 **API Endpoints**

### **Main Orchestration Endpoint**
```http
POST http://localhost:5021/api/orchestrate
Content-Type: application/json

{
  "query": "How does RAN Affect churn and what is the PRB util threshold before a churn happen?"
}
```

### **Response Format**
```json
{
  "success": true,
  "session_id": "uuid",
  "response": "Clean, synthesized response",
  "workflow_summary": { /* Workflow metadata */ },
  "complete_data_flow": { /* Complete observability data */ },
  "timestamp": "ISO datetime"
}
```

### **Health Check**
```http
GET http://localhost:5021/health
```

---

## 🎨 **Frontend Integration**

### **UnifiedOrchestrationInterface.tsx**
- **Left Panel**: Query input and quick stats
- **Right Panel**: 5 tabs for detailed results
  - **Overview**: Session info and clean output
  - **Workflow**: 6-stage analysis breakdown
  - **Agents**: Agent selection and execution details
  - **Data Flow**: Complete A2A handoff tracking
  - **Performance**: Timing and metrics

### **SystemOrchestratorModal.tsx**
- **Modal Interface**: Integrated into main dashboard
- **Real-time Updates**: Live orchestration progress
- **Rich Data Display**: Complete observability

---

## 🔧 **Configuration & Setup**

### **Service Dependencies**
- **Strands SDK API**: Port 5006 (agent execution)
- **A2A Service**: Port 5008 (agent communication)
- **Ollama**: Port 11434 (LLM models)

### **Startup Scripts**
- **`start-unified-system.sh`**: Core system startup
- **`start-all-services.sh`**: Complete system with all services
- **`kill-all-services.sh`**: Clean shutdown

---

## 📈 **Performance Characteristics**

### **Execution Times**
- **Query Analysis**: ~2-5 seconds
- **Agent Discovery**: ~1-2 seconds
- **Agent Execution**: ~30-60 seconds per agent
- **Response Synthesis**: ~2-3 seconds
- **Total Workflow**: ~60-120 seconds for 2 agents

### **Scalability**
- **Session Management**: In-memory with timeout
- **Agent Discovery**: Dynamic, real-time
- **A2A Handoffs**: Sequential with context preservation
- **Data Tracking**: Complete observability maintained

---

## 🎯 **Key Features**

1. **6-Stage LLM Analysis**: Comprehensive query understanding
2. **Dynamic Agent Discovery**: Real-time agent selection
3. **A2A Communication**: Intelligent agent handoffs
4. **Complete Observability**: Full data flow tracking
5. **Frontend Integration**: Rich UI for orchestration results
6. **Text Cleaning**: Consistent, clean output
7. **Session Management**: Robust session handling
8. **Health Monitoring**: Service status tracking

This unified system provides a complete, intelligent orchestration framework that combines the best of all previous implementations into a single, cohesive workflow.
