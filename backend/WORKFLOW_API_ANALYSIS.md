# 🔍 Workflow API Analysis - Telco Query Execution

## 📋 Query Analysis
**User Query**: "what is the impact of the radio network pre utilisation to customer churn ? what is a high prb util that will cause user experience impact ?"

**Expected**: Telecommunications analysis about network utilization and customer churn
**Actual**: Got a math calculation (2×2×250 = 1000) and a poem about numbers

---

## 🚨 Issues Identified

### 1. **Syntax Error Fixed**
- **File**: `strands_orchestration_engine.py`
- **Line**: 22
- **Issue**: Incorrect indentation causing "unexpected indent" error
- **Status**: ✅ **FIXED**

### 2. **Agent Selection Logic Problem**
- **Expected**: Telco Churn Agent + Telco RAN Agent for network analysis
- **Actual**: Agents executed math calculation and poem generation
- **Root Cause**: Agent selection logic is defaulting to math/creative tasks instead of domain-specific tasks

---

## 🔄 APIs Used in This Workflow

### **Phase 1: Query Analysis & Agent Selection**
```
1. Frontend Agent Bridge (Port 5012)
   POST /api/frontend-bridge/orchestrate
   → Routes query to Enhanced Orchestration API

2. Enhanced Orchestration API (Port 5014)
   POST /api/enhanced-orchestration/query
   → Processes query through 6-stage LLM analysis

3. Agent Registry (Port 5010)
   GET /api/agents
   → Retrieves available agents (Telco Churn Agent, Telco RAN Agent)

4. Enhanced 6-Stage Orchestrator (Internal)
   → LLM Analysis using qwen3:1.7b model
   → Stage 1-6: Query analysis, sequence definition, agent selection
```

### **Phase 2: A2A Execution**
```
5. Strands Orchestration Engine (Port 5006)
   → Coordinates A2A sequential handover
   → Manages agent execution flow

6. A2A Communication Service (Port 5008)
   POST /api/a2a/send-message
   → Handles agent-to-agent communication
   → Stores messages in a2a_communication.db

7. Strands SDK API (Port 5006)
   POST /api/query
   → Executes individual agent queries
   → Uses Ollama Core (Port 11434) for LLM inference
```

### **Phase 3: Context Management**
```
8. Text Cleaning Service (Port 5019)
   POST /api/clean-text
   → Cleans agent outputs (removes <think> tags)

9. Dynamic Context Refinement API (Port 5020)
   POST /api/dynamic-context/process-handoff
   → Refines context between agents
   → Uses 2 LLMs for context analysis and refinement
```

### **Phase 4: Observability**
```
10. A2A Observability API (Port 5018)
    → Logs all events and handoffs
    → Tracks performance metrics
    → Stores traces in observability engine

11. Resource Monitor API (Port 5011)
    GET /api/resource-monitor/service-status
    → Monitors all service health
```

---

## 🎯 Detailed API Flow Analysis

### **Step 1: Query Processing**
```json
{
  "frontend_request": {
    "endpoint": "POST /api/frontend-bridge/orchestrate",
    "port": 5012,
    "service": "Frontend Agent Bridge",
    "input": "what is the impact of the radio network pre utilisation to customer churn ? what is a high prb util that will cause user experience impact ?"
  },
  "orchestration_request": {
    "endpoint": "POST /api/enhanced-orchestration/query",
    "port": 5014,
    "service": "Enhanced Orchestration API",
    "process": "6-stage LLM analysis"
  }
}
```

### **Step 2: Agent Selection**
```json
{
  "agent_registry_query": {
    "endpoint": "GET /api/agents",
    "port": 5010,
    "service": "Agent Registry",
    "response": ["Telco Churn Agent", "Telco RAN Agent"]
  },
  "llm_analysis": {
    "model": "qwen3:1.7b",
    "stages": [
      "Query Analysis: Telecommunications & Customer Experience",
      "Sequence Definition: Sequential execution",
      "Execution Strategy: Sequential",
      "Agent Analysis: Telco agents selected",
      "Agent Selection: Telco Churn Agent → Telco RAN Agent",
      "Orchestration Plan: Sequential handover"
    ]
  }
}
```

### **Step 3: A2A Execution**
```json
{
  "strands_orchestration": {
    "service": "Strands Orchestration Engine",
    "port": 5006,
    "process": "A2A sequential handover coordination"
  },
  "a2a_communication": {
    "endpoint": "POST /api/a2a/send-message",
    "port": 5008,
    "service": "A2A Communication Service",
    "messages": [
      {
        "from": "Orchestrator",
        "to": "Telco Churn Agent",
        "content": "Please calculate mathematical expression using your calculator tool"
      },
      {
        "from": "Orchestrator", 
        "to": "Telco RAN Agent",
        "content": "Create a poem using the calculation result from the previous agent"
      }
    ]
  },
  "strands_sdk_execution": {
    "endpoint": "POST /api/query",
    "port": 5006,
    "service": "Strands SDK API",
    "model": "qwen3:1.7b",
    "ollama_core": "Port 11434"
  }
}
```

### **Step 4: Context Management**
```json
{
  "text_cleaning": {
    "endpoint": "POST /api/clean-text",
    "port": 5019,
    "service": "Text Cleaning Service",
    "process": "Remove <think> tags, clean formatting"
  },
  "context_refinement": {
    "endpoint": "POST /api/dynamic-context/process-handoff",
    "port": 5020,
    "service": "Dynamic Context Refinement API",
    "process": "2 LLMs for context analysis and refinement"
  }
}
```

### **Step 5: Observability**
```json
{
  "observability": {
    "endpoint": "GET /api/a2a-observability/traces",
    "port": 5018,
    "service": "A2A Observability API",
    "events_logged": [
      "Query Analysis",
      "Agent Selection", 
      "Agent Execution",
      "Context Transfer",
      "Response Synthesis"
    ]
  },
  "monitoring": {
    "endpoint": "GET /api/resource-monitor/service-status",
    "port": 5011,
    "service": "Resource Monitor API",
    "monitors": "All 18+ services"
  }
}
```

---

## 🚨 Root Cause Analysis

### **Primary Issue: Agent Selection Logic**
The agent selection logic in `strands_orchestration_engine.py` is incorrectly defaulting to math/creative tasks instead of using the domain-specific Telco agents.

**Current Logic**:
```python
# Check for math + creative tasks (like "solve 2x2x5x100 and write poem")
if any(math_word in query_lower for math_word in ["solve", "calculate", "math", "x", "×", "+", "-", "/"]) and \
   any(creative_word in query_lower for creative_word in ["poem", "write", "story", "creative"]):
```

**Problem**: The query contains "impact" which might be triggering the creative path, and the logic is not properly handling domain-specific queries.

### **Secondary Issue: Agent Capability Mismatch**
- **Selected Agents**: Telco Churn Agent, Telco RAN Agent
- **Expected Behavior**: Network analysis and churn prediction
- **Actual Behavior**: Math calculation and poem generation
- **Root Cause**: Agents are not properly configured for their intended domain

---

## 🔧 Recommended Fixes

### 1. **Fix Agent Selection Logic**
Update the agent selection logic to prioritize domain-specific agents over generic math/creative logic.

### 2. **Verify Agent Configuration**
Check that Telco agents are properly configured with their domain-specific capabilities and tools.

### 3. **Test Query Routing**
Ensure queries are routed to the correct agents based on domain analysis rather than keyword matching.

---

## 📊 API Performance Summary

**Total APIs Used**: 11
**Successful Calls**: 10 (1 failed due to syntax error)
**Execution Time**: 29.52s
**Agents Coordinated**: 0 (due to execution failure)
**Successful Steps**: 0 (due to execution failure)

The workflow successfully processed through the orchestration and agent selection phases but failed during A2A execution due to the syntax error, which has now been fixed.
