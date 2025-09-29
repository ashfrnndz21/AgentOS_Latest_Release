# 🚀 Unified Orchestration System

## Overview

The Unified Orchestration System combines all existing orchestration implementations into a single, clean workflow that achieves the target architecture:

```
User Query → System Orchestrator (LLM) → Agent Registry → A2A Communication → Response
     ↓              ↓                        ↓                ↓                ↓
  Complex       6-Stage LLM              Dynamic Agent    Intelligent      Clean
  Analysis      Analysis                 Discovery        Handoffs         Output
```

## 🏗️ Architecture

### Core Components

1. **Unified System Orchestrator** (`unified_system_orchestrator.py`)
   - Central orchestrator that combines all existing implementations
   - 6-Stage LLM Analysis
   - Dynamic Agent Discovery
   - Intelligent A2A Handoffs
   - Text Cleaning & Synthesis

2. **Unified API** (`unified_orchestration_api.py`)
   - Single entry point for all orchestration functionality
   - Port: 5020
   - RESTful API with comprehensive endpoints

3. **Frontend Service** (`UnifiedOrchestrationService.ts`)
   - TypeScript service for frontend integration
   - Clean interface to unified API
   - Type-safe request/response handling

4. **Frontend Interface** (`UnifiedOrchestrationInterface.tsx`)
   - React component for unified orchestration
   - Real-time workflow visualization
   - System status monitoring

## 🚀 Quick Start

### 1. Start the System

```bash
# Make startup script executable
chmod +x start_unified_orchestration.sh

# Start the unified orchestration system
./start_unified_orchestration.sh
```

This will:
- Check if required services are running
- Start missing services automatically
- Launch the unified orchestration API on port 5020

### 2. Test the System

```bash
# Run comprehensive tests
python test_unified_orchestration.py
```

### 3. Use the API

```bash
# Health check
curl http://localhost:5020/health

# Quick orchestration
curl -X POST http://localhost:5020/api/quick-orchestrate \
  -H "Content-Type: application/json" \
  -d '{"query": "What is 2+2?"}'

# Full orchestration
curl -X POST http://localhost:5020/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"query": "Calculate 2x532 and write a poem about the result"}'
```

## 📋 API Endpoints

### Main Endpoints

- `GET /health` - Health check
- `POST /api/orchestrate` - Main orchestration endpoint
- `POST /api/quick-orchestrate` - Quick orchestration for simple queries
- `GET /api/status` - System status and component health

### Analysis Endpoints

- `POST /api/analyze-query` - 6-stage LLM query analysis
- `POST /api/discover-agents` - Dynamic agent discovery
- `POST /api/clean-text` - Text cleaning and formatting

## 🔧 Configuration

### Service URLs

```python
# Default configuration
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
OLLAMA_BASE_URL = "http://localhost:11434"
UNIFIED_API_URL = "http://localhost:5020"
```

### Environment Variables

```bash
# Optional environment variables
export ORCHESTRATOR_MODEL="qwen3:1.7b"
export SESSION_TIMEOUT=300
export MEMORY_THRESHOLD=85
```

## 🎯 Workflow Details

### Stage 1: Complex Analysis (6-Stage LLM)
- **Input**: User query
- **Process**: 6-stage LLM analysis using `enhanced_orchestrator_6stage.py`
- **Output**: Structured analysis with execution strategy

### Stage 2: Dynamic Agent Discovery
- **Input**: Query analysis
- **Process**: LLM-driven agent discovery using A2A service
- **Output**: Selected agents for execution

### Stage 3: Intelligent A2A Handoffs
- **Input**: Query + selected agents
- **Process**: Sequential A2A handoffs using `strands_orchestration_engine.py`
- **Output**: Agent execution results

### Stage 4: Clean Output Synthesis
- **Input**: Agent execution results
- **Process**: Text cleaning and response synthesis
- **Output**: Clean, formatted final response

## 🔍 Monitoring & Observability

### System Status

```bash
# Check system status
curl http://localhost:5020/api/status
```

Response:
```json
{
  "status": "healthy",
  "components": {
    "unified_orchestrator": "healthy",
    "strands_sdk": "healthy",
    "a2a_service": "healthy",
    "text_cleaning": "healthy"
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Workflow Tracking

Each orchestration includes comprehensive tracking:
- Session ID for traceability
- Workflow summary with timing
- Agent selection details
- Execution details
- Observability trace

## 🛠️ Development

### Project Structure

```
backend/
├── unified_system_orchestrator.py    # Core orchestrator
├── unified_orchestration_api.py      # API entry point
├── text_cleaning_service_simple.py   # Fallback text cleaning
├── enhanced_orchestrator_6stage.py   # 6-stage LLM analysis
├── strands_orchestration_engine.py   # A2A handoffs
├── a2a_service.py                    # A2A communication
└── strands_sdk_api.py               # Strands SDK

src/
├── lib/services/
│   └── UnifiedOrchestrationService.ts # Frontend service
└── components/A2A/
    └── UnifiedOrchestrationInterface.tsx # Frontend interface

scripts/
├── start_unified_orchestration.sh    # Startup script
└── test_unified_orchestration.py     # Test script
```

### Adding New Features

1. **New Agent Types**: Add to agent discovery logic in `unified_system_orchestrator.py`
2. **New Analysis Stages**: Extend the 6-stage analysis in `enhanced_orchestrator_6stage.py`
3. **New Handoff Patterns**: Add to A2A handoff logic in `strands_orchestration_engine.py`
4. **New API Endpoints**: Add to `unified_orchestration_api.py`

## 🐛 Troubleshooting

### Common Issues

1. **Service Not Starting**
   ```bash
   # Check if ports are available
   lsof -i :5020
   lsof -i :5006
   lsof -i :5008
   ```

2. **LLM Analysis Failing**
   ```bash
   # Check Ollama is running
   curl http://localhost:11434/api/tags
   ```

3. **Agent Discovery Failing**
   ```bash
   # Check A2A service
   curl http://localhost:5008/api/a2a/health
   ```

4. **Text Cleaning Failing**
   ```bash
   # Check text cleaning service
   curl http://localhost:5019/health
   ```

### Debug Mode

```bash
# Run with debug logging
export FLASK_DEBUG=1
python backend/unified_orchestration_api.py
```

## 📊 Performance

### Benchmarks

- **Simple Queries**: 2-5 seconds
- **Complex Queries**: 5-15 seconds
- **Multi-Agent Queries**: 10-30 seconds

### Optimization Tips

1. **Enable Caching**: Implement Redis caching for agent metadata
2. **Parallel Execution**: Use parallel execution for independent tasks
3. **Model Optimization**: Use smaller models for simple tasks
4. **Connection Pooling**: Implement connection pooling for external services

## 🔒 Security

### API Security

- CORS enabled for frontend integration
- Input validation on all endpoints
- Error handling without sensitive data exposure

### Service Security

- Internal service communication over localhost
- No external network dependencies
- Secure session management

## 📈 Future Enhancements

### Planned Features

1. **Async Processing**: Full async/await implementation
2. **Caching Layer**: Redis-based caching
3. **Circuit Breaker**: Resilience patterns
4. **Metrics Dashboard**: Real-time performance monitoring
5. **Agent Marketplace**: Dynamic agent registration

### Architecture Evolution

1. **Microservices**: Split into independent microservices
2. **Event-Driven**: Event-driven architecture with message queues
3. **Cloud Native**: Kubernetes deployment
4. **AI/ML Pipeline**: Advanced AI/ML integration

## 🤝 Contributing

### Code Style

- Follow PEP 8 for Python
- Use TypeScript for frontend
- Comprehensive error handling
- Detailed logging

### Testing

- Unit tests for all components
- Integration tests for workflows
- End-to-end tests for complete flows
- Performance tests for optimization

## 📄 License

This project is part of the AgentOS Studio Strands system.

---

## 🎉 Success!

You now have a unified orchestration system that combines all your existing implementations into a clean, maintainable architecture that achieves the target workflow:

**User Query → System Orchestrator (LLM) → Agent Registry → A2A Communication → Response**

The system is ready to use and can be extended with new features as needed!
