# 📚 AgentOS Studio API Documentation

## Enhanced LLM Orchestration API

### Base URL
```
http://localhost:5014
```

### Authentication
Currently no authentication required. Future versions will include API key authentication.

---

## 🧠 Enhanced Orchestration Endpoints

### Process Query
**POST** `/api/enhanced-orchestration/query`

Process a user query through the 5-stage LLM orchestration pipeline.

#### Request Body
```json
{
  "query": "string - The user's query to process"
}
```

#### Response
```json
{
  "success": true,
  "session_id": "uuid",
  "stage_1_query_analysis": {
    "user_intent": "detailed analysis of what user is asking for",
    "domain": "specific domain or subject area",
    "complexity": "simple|moderate|complex",
    "required_expertise": "type of expertise needed",
    "context_reasoning": "detailed explanation of query context understanding"
  },
  "stage_2_agent_analysis": {
    "agent_evaluations": [
      {
        "agent_id": "uuid",
        "agent_name": "Agent Name",
        "primary_expertise": "main area of expertise",
        "capabilities_assessment": "detailed analysis of what this agent can do",
        "tools_analysis": "analysis of available tools and how they help",
        "system_prompt_analysis": "how system prompt defines their role",
        "suitability_score": 0.95
      }
    ]
  },
  "stage_3_contextual_matching": {
    "selected_agent_id": "uuid",
    "matching_reasoning": "detailed explanation of why this agent is the best match",
    "confidence": 0.95,
    "alternative_agents": ["agent_id_1", "agent_id_2"],
    "match_quality": "excellent|good|moderate",
    "execution_strategy": "single|sequential|parallel"
  },
  "selected_agent": {
    "id": "uuid",
    "name": "Agent Name",
    "description": "Agent description"
  },
  "execution_time": 4.82,
  "final_response": "The synthesized response to the user",
  "raw_agent_response": {
    "agent_name": "Agent Name",
    "execution_id": "uuid",
    "execution_time": 4.81,
    "model_used": "llama3.2:1b",
    "sdk_powered": true,
    "tools_used": [],
    "response": "Raw agent response"
  },
  "error": null
}
```

#### Example Request
```bash
curl -X POST http://localhost:5014/api/enhanced-orchestration/query \
  -H "Content-Type: application/json" \
  -d '{"query": "I need help with creative writing for a story"}'
```

---

### Get Health Status
**GET** `/api/enhanced-orchestration/health`

Get the health status of the Enhanced Orchestration service.

#### Response
```json
{
  "status": "healthy",
  "memory_usage": "80.6%",
  "active_sessions": 0,
  "orchestrator_model": "llama3.2:1b",
  "timestamp": "2025-09-20T15:50:08.593979"
}
```

---

### Get Active Sessions
**GET** `/api/enhanced-orchestration/sessions`

Get information about active orchestration sessions.

#### Response
```json
{
  "active_sessions": 1,
  "sessions": [
    {
      "session_id": "uuid",
      "created_at": "2025-09-20T15:50:08.593979",
      "query": "I need help with creative writing...",
      "status": "completed",
      "stages_completed": 5,
      "duration": 4.82
    }
  ]
}
```

---

### Cleanup Session
**DELETE** `/api/enhanced-orchestration/sessions/{session_id}`

Manually cleanup a specific orchestration session.

#### Response
```json
{
  "success": true,
  "message": "Enhanced session {session_id} cleaned up"
}
```

---

## 🤖 Agent Services APIs

### A2A Service (Port 5008)

#### Register Agent
**POST** `/api/a2a/register`

Register an agent with the A2A service.

#### Get Agents
**GET** `/api/a2a/agents`

Get all registered A2A agents.

#### Agent Communication
**POST** `/api/a2a/communicate`

Send messages between agents.

---

### Strands SDK Service (Port 5006)

#### Create Agent
**POST** `/api/strands-sdk/agents`

Create a new Strands SDK agent.

#### Get Agents
**GET** `/api/strands-sdk/agents`

Get all Strands SDK agents.

#### Execute Agent
**POST** `/api/strands-sdk/agents/{agent_id}/execute`

Execute a query with a specific agent.

---

### Agent Registry Service (Port 5010)

#### Get Registry
**GET** `/api/registry/agents`

Get the complete agent registry.

#### Update Agent
**PUT** `/api/registry/agents/{agent_id}`

Update agent metadata in the registry.

---

## 📊 Resource Monitoring API

### Base URL
```
http://localhost:5011
```

### Get System Health
**GET** `/api/resource-monitor/health`

Get comprehensive system health information.

#### Response
```json
{
  "system_health": {
    "cpu_usage": 45.2,
    "memory_usage": 78.5,
    "disk_usage": 32.1,
    "uptime": 3600
  },
  "services": {
    "enhanced_orchestration": {
      "status": "healthy",
      "response_time": 120,
      "memory_usage": "150MB"
    },
    "a2a_service": {
      "status": "healthy",
      "response_time": 45,
      "memory_usage": "80MB"
    },
    "strands_sdk": {
      "status": "healthy",
      "response_time": 200,
      "memory_usage": "200MB"
    }
  }
}
```

---

## 🧠 Ollama Integration API

### Base URL
```
http://localhost:11434
```

### Generate Response
**POST** `/api/generate`

Generate AI responses using Ollama models.

#### Request Body
```json
{
  "model": "llama3.2:1b",
  "prompt": "Your prompt here",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

---

## 📄 RAG API (Port 5003)

### Ingest Document
**POST** `/api/rag/ingest`

Upload and process documents for retrieval.

#### Request Body
```multipart/form-data
{
  "file": "document.pdf",
  "metadata": {
    "title": "Document Title",
    "category": "Document Category"
  }
}
```

### Query Documents
**POST** `/api/rag/query`

Query processed documents with AI.

#### Request Body
```json
{
  "query": "What is this document about?",
  "context_length": 1000
}
```

---

## 🔧 Configuration APIs

### Get Service Configuration
**GET** `/api/config/services`

Get configuration for all services.

### Update Service Configuration
**PUT** `/api/config/services/{service_name}`

Update configuration for a specific service.

---

## 📈 Analytics APIs

### Get Orchestration Analytics
**GET** `/api/analytics/orchestration`

Get analytics about orchestration performance.

#### Response
```json
{
  "total_queries": 1250,
  "success_rate": 0.95,
  "average_response_time": 4.2,
  "most_used_agents": [
    {
      "agent_name": "Creative Assistant",
      "usage_count": 450,
      "success_rate": 0.98
    }
  ],
  "query_types": {
    "creative_writing": 300,
    "technical_support": 250,
    "health_advice": 200
  }
}
```

### Get Agent Performance
**GET** `/api/analytics/agents/{agent_id}`

Get performance metrics for a specific agent.

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-09-20T15:50:08.593979"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_QUERY` | Query is empty or invalid |
| `NO_AGENTS_AVAILABLE` | No agents available for processing |
| `LLM_ANALYSIS_FAILED` | LLM analysis failed |
| `AGENT_EXECUTION_FAILED` | Agent execution failed |
| `SESSION_NOT_FOUND` | Session not found |
| `MEMORY_LIMIT_EXCEEDED` | Memory usage exceeded limit |

---

## 🔐 Rate Limiting

### Current Limits
- **Enhanced Orchestration**: 100 requests/minute per IP
- **Agent Execution**: 50 requests/minute per session
- **Document Processing**: 10 requests/minute per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📝 WebSocket Events

### Real-time Orchestration Updates

Connect to WebSocket for real-time orchestration progress:

```javascript
const ws = new WebSocket('ws://localhost:5014/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Orchestration Update:', data);
};
```

### Event Types

| Event | Description |
|-------|-------------|
| `query_received` | Query received and processing started |
| `stage_1_complete` | Agent discovery completed |
| `stage_2_complete` | LLM query analysis completed |
| `stage_3_complete` | Agent capability analysis completed |
| `stage_4_complete` | Agent selection completed |
| `stage_5_complete` | Agent execution completed |
| `orchestration_complete` | Full orchestration completed |
| `error` | Error occurred during processing |

---

## 🧪 Testing APIs

### Test Orchestration
**POST** `/api/test/orchestration`

Test the orchestration pipeline with sample queries.

### Benchmark Performance
**POST** `/api/test/benchmark`

Run performance benchmarks on the orchestration system.

---

## 📊 Monitoring & Logging

### Get Service Logs
**GET** `/api/logs/{service_name}`

Get logs for a specific service.

### Get Performance Metrics
**GET** `/api/metrics/performance`

Get detailed performance metrics.

---

## 🔄 Webhook Integration

### Register Webhook
**POST** `/api/webhooks/register`

Register webhooks for orchestration events.

### Webhook Payload
```json
{
  "event_type": "orchestration_complete",
  "session_id": "uuid",
  "query": "original query",
  "response": "generated response",
  "execution_time": 4.82,
  "timestamp": "2025-09-20T15:50:08.593979"
}
```
