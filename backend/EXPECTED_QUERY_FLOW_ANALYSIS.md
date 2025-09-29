# 🔄 Expected Complete Query Flow Analysis

## 📋 User Query
**Query**: "what is the impact of the radio network pre utilisation to customer churn ? what is a high prb util that will cause user experience impact ?"

---

## 🎯 Complete Expected Flow (Step-by-Step)

### **Phase 1: Frontend Query Submission (0-1 seconds)**

#### **Step 1: User Input**
```
Frontend Modal → User types query → Submit button clicked
```

#### **Step 2: Frontend Processing**
```
Frontend (Port 5173)
├── Validate query input
├── Prepare query payload
└── Send POST request to Frontend Agent Bridge
```

#### **Step 3: Frontend Agent Bridge**
```
POST /api/frontend-bridge/orchestrate
Port: 5012
Service: Frontend Agent Bridge
Payload: {
  "query": "what is the impact of the radio network pre utilisation to customer churn ? what is a high prb util that will cause user experience impact ?",
  "session_id": "uuid-1234",
  "timestamp": "2025-09-25T00:30:00Z"
}
```

---

### **Phase 2: Enhanced Orchestration Analysis (1-5 seconds)**

#### **Step 4: Enhanced Orchestration API**
```
POST /api/enhanced-orchestration/query
Port: 5014
Service: Enhanced Orchestration API
Process: Create orchestration session
```

#### **Step 5: 6-Stage LLM Analysis**
```
Enhanced 6-Stage Orchestrator (Internal)
Model: qwen3:1.7b
Process: Comprehensive query analysis

Stage 1: Query Analysis
├── User Intent: Analyze network utilization impact on churn
├── Domain: Telecommunications & Customer Experience  
├── Complexity: Moderate
└── Required Expertise: Network performance analysis, churn prediction

Stage 2: Sequence Definition
├── Workflow Steps: 
│   ├── Step 1: Network utilization analysis
│   └── Step 2: Churn correlation analysis
└── Execution Flow: Sequential

Stage 3: Execution Strategy
├── Strategy: Sequential
└── Reasoning: Network data needed before churn analysis

Stage 4: Agent Analysis
├── Telco RAN Agent: High suitability (network performance)
├── Telco Churn Agent: High suitability (churn prediction)
└── Other agents: Lower suitability

Stage 5: Agent Selection
├── Selected: Telco RAN Agent → Telco Churn Agent
└── Order: Network analysis first, then churn correlation

Stage 6: Orchestration Plan
├── Handoff Strategy: Sequential with context refinement
├── Expected Output: Comprehensive analysis
└── Confidence: 90%
```

#### **Step 6: Agent Registry Query**
```
GET /api/agents
Port: 5010
Service: Agent Registry
Response: Available Telco agents with capabilities
```

---

### **Phase 3: A2A Sequential Handover Execution (5-25 seconds)**

#### **Step 7: Strands Orchestration Engine**
```
Service: Strands Orchestration Engine
Port: 5006
Process: Coordinate A2A sequential handover
```

#### **Step 8: Agent 1 - Telco RAN Agent Execution**
```
A2A Communication Service (Port 5008)
├── POST /api/a2a/send-message
├── From: Orchestrator
├── To: Telco RAN Agent
└── Content: "Analyze radio network pre-utilisation patterns and identify high PRB utilization thresholds that impact user experience"

Strands SDK API (Port 5006)
├── POST /api/query
├── Agent: Telco RAN Agent
├── Model: qwen3:1.7b
└── Ollama Core (Port 11434)

Expected Telco RAN Agent Output:
"Based on network performance analysis, radio network pre-utilisation shows significant correlation with user experience degradation. High PRB utilization above 80% typically causes noticeable performance impact, with critical thresholds at 85% for voice services and 90% for data services. Network congestion patterns indicate that sustained utilization above 75% leads to increased packet loss and latency, directly affecting customer satisfaction metrics."
```

#### **Step 9: Text Cleaning Service**
```
POST /api/clean-text
Port: 5019
Service: Text Cleaning Service
Input: Raw Telco RAN Agent output
Process: Remove <think> tags, clean formatting
Output: Clean network analysis data
```

#### **Step 10: Dynamic Context Refinement**
```
POST /api/dynamic-context/process-handoff
Port: 5020
Service: Dynamic Context Refinement API

Context Analysis (LLM #1):
├── Complexity Score: 0.7
├── Information Density: 0.8
├── Key Information: PRB thresholds, utilization patterns
└── Recommended Strategy: Focus on Task

Context Refinement (LLM #2):
├── Strategy: Focus on Task
├── Target Agent: Telco Churn Agent
├── Refined Context: "Network analysis shows PRB utilization thresholds: 80% (performance impact), 85% (voice services), 90% (data services). Sustained utilization above 75% causes packet loss and latency affecting customer satisfaction."
└── Quality Score: 0.9
```

#### **Step 11: Agent 2 - Telco Churn Agent Execution**
```
A2A Communication Service (Port 5008)
├── POST /api/a2a/send-message
├── From: Orchestrator
├── To: Telco Churn Agent
└── Content: Refined context from Telco RAN Agent

Strands SDK API (Port 5006)
├── POST /api/query
├── Agent: Telco Churn Agent
├── Model: qwen3:1.7b
└── Ollama Core (Port 11434)

Expected Telco Churn Agent Output:
"Churn analysis reveals strong correlation between network utilization and customer churn rates. Customers experiencing network issues due to high PRB utilization (>80%) show 3.2x higher churn probability. Key findings: 1) 75-80% utilization: 15% churn increase, 2) 80-85% utilization: 35% churn increase, 3) >85% utilization: 60% churn increase. Proactive network optimization at 70% utilization threshold recommended to prevent customer churn."
```

#### **Step 12: Text Cleaning Service (Agent 2)**
```
POST /api/clean-text
Port: 5019
Service: Text Cleaning Service
Input: Raw Telco Churn Agent output
Process: Remove <think> tags, clean formatting
Output: Clean churn analysis data
```

---

### **Phase 4: Final Synthesis (25-30 seconds)**

#### **Step 13: Orchestrator Final Synthesis**
```
Enhanced Orchestration API (Port 5014)
Process: Combine both agent outputs
Synthesis Logic: Sequential with context refinement
Confidence: 90%

Final Response:
"Based on comprehensive analysis of radio network pre-utilisation and customer churn:

NETWORK PERFORMANCE IMPACT:
- High PRB utilization above 80% causes significant user experience degradation
- Critical thresholds: 85% for voice services, 90% for data services
- Sustained utilization above 75% leads to packet loss and latency

CHURN CORRELATION:
- Strong correlation between network utilization and customer churn
- 75-80% utilization: 15% churn increase
- 80-85% utilization: 35% churn increase  
- >85% utilization: 60% churn increase

RECOMMENDATIONS:
- Proactive network optimization at 70% utilization threshold
- Monitor PRB utilization in real-time
- Implement predictive churn models based on network performance
- Focus on network capacity planning to maintain utilization below 75%"
```

---

### **Phase 5: Observability & Monitoring (Throughout)**

#### **Step 14: A2A Observability Logging**
```
A2A Observability API (Port 5018)
Events Logged:
├── QUERY_ANALYSIS: Query understanding and breakdown
├── AGENT_SELECTION: Telco RAN Agent, Telco Churn Agent selected
├── AGENT_EXECUTION: Telco RAN Agent execution (Step 1)
├── CONTEXT_TRANSFER: Network analysis → Churn analysis
├── AGENT_EXECUTION: Telco Churn Agent execution (Step 2)
├── RESPONSE_SYNTHESIS: Final response generation
└── ORCHESTRATOR_ANALYSIS: 6-stage analysis completion

Handoffs Tracked:
├── Handoff #1: Orchestrator → Telco RAN Agent
├── Context: Network utilization analysis request
├── Tools Used: Network analysis tools
├── Execution Time: 8.5s
└── Status: Success

├── Handoff #2: Telco RAN Agent → Telco Churn Agent  
├── Context: Refined network analysis data
├── Tools Used: Churn prediction tools
├── Execution Time: 12.3s
└── Status: Success
```

#### **Step 15: Resource Monitoring**
```
Resource Monitor API (Port 5011)
├── Monitor all service health
├── Track memory usage (64.0%)
├── Monitor execution times
└── Log performance metrics
```

---

## 📊 Expected API Usage Summary

### **APIs That Should Have Been Used:**
1. ✅ **Frontend Agent Bridge** (Port 5012) - Query routing
2. ✅ **Enhanced Orchestration API** (Port 5014) - 6-stage analysis
3. ✅ **Agent Registry** (Port 5010) - Agent discovery
4. ✅ **Strands Orchestration Engine** (Port 5006) - A2A coordination
5. ✅ **A2A Communication Service** (Port 5008) - Agent messaging
6. ✅ **Strands SDK API** (Port 5006) - Agent execution
7. ✅ **Ollama Core** (Port 11434) - LLM inference
8. ✅ **Text Cleaning Service** (Port 5019) - Output cleaning
9. ✅ **Dynamic Context Refinement API** (Port 5020) - Context optimization
10. ✅ **A2A Observability API** (Port 5018) - Event tracking
11. ✅ **Resource Monitor API** (Port 5011) - Service monitoring

### **Expected Execution Metrics:**
- **Agents Coordinated**: 2 (Telco RAN Agent, Telco Churn Agent)
- **Successful Steps**: 2 (Network analysis, Churn analysis)
- **Execution Time**: ~30 seconds
- **Response Length**: ~500-800 characters
- **Handoffs**: 2 (Orchestrator→RAN, RAN→Churn)
- **Traces**: 6+ events logged
- **Context Refinements**: 1 (RAN→Churn handoff)

### **Expected Output Quality:**
- **Domain-Specific**: Telecommunications analysis
- **Technical Accuracy**: PRB utilization thresholds, churn correlation
- **Actionable Insights**: Specific recommendations
- **Professional Format**: Clean, structured response

---

## 🚨 What Actually Happened vs Expected

### **Expected Flow:**
```
Frontend → Backend APIs → Real Agent Processing → Domain-Specific Response
```

### **Actual Flow:**
```
Frontend → Mock Data Generation → Math/Poem Response
```

### **Root Cause:**
**Frontend-Backend Integration Broken** - Query never reached backend orchestration system

---

## 🔧 Required Fixes

1. **Fix Frontend-Backend Connection** - Ensure queries reach Enhanced Orchestration API
2. **Start Text Cleaning Service** - Critical for output processing
3. **Test End-to-End Flow** - Verify complete API chain works
4. **Validate Agent Configuration** - Ensure Telco agents are properly set up

The system has all the necessary APIs and logic, but the frontend is not properly connected to trigger the backend orchestration process.
