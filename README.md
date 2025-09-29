# AgentOS Studio Strands - Advanced A2A Orchestration Platform

[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org)
[![Ollama](https://img.shields.io/badge/ollama-integrated-purple.svg)](https://ollama.ai)

## 🚀 Overview

AgentOS Studio Strands is a cutting-edge **Agent-to-Agent (A2A) orchestration platform** that enables seamless multi-agent collaboration using advanced AI models. Built with React frontend and Python backend, it integrates Ollama for local LLM execution and provides comprehensive observability and management capabilities.

### ✨ Key Features

- **🤖 Multi-Agent Orchestration**: Intelligent agent selection and coordination
- **🧠 Local LLM Integration**: Powered by Ollama with multiple model support
- **📊 Real-time Observability**: Comprehensive monitoring and analytics
- **🔄 Dynamic Workflow Management**: Adaptive task decomposition and execution
- **🎯 Smart Response Formatting**: Enhanced JSON parsing and display
- **📈 Performance Analytics**: Detailed metrics and conversation lineage
- **🛠️ Tool Integration**: Extensible tool ecosystem with Strands SDK
- **🌐 Modern UI**: Responsive React interface with dark theme

## 🏗️ System Architecture

### High-Level Architecture

The system follows a layered architecture with clear separation of concerns:

1. **Frontend Layer**: React-based UI components
2. **API Gateway Layer**: Service orchestration and routing
3. **Core Services**: Business logic and processing
4. **AI Layer**: LLM integration and model management
5. **Data Layer**: Persistence and storage

### Component Architecture

- **MainSystemOrchestratorCard**: Primary orchestration interface
- **A2AOrchestrationMonitor**: Multi-agent coordination visualization
- **ObservabilityPanel**: System health and analytics
- **ConversationLineage**: Interaction tracking and history

## 🔄 System Workflow

### 1. Query Processing Workflow

1. User submits query through frontend UI
2. Main System Orchestrator analyzes the query
3. Available agents are discovered and scored
4. Best agents are selected for task execution
5. Agents execute tasks with LLM integration
6. Results are synthesized and formatted
7. Final response is displayed to user

### 2. Multi-Agent Orchestration Flow

- **Query Analysis**: Understanding task requirements
- **Task Decomposition**: Breaking down complex tasks
- **Agent Selection**: Intelligent agent matching
- **Sequential Execution**: Coordinated task processing
- **Response Synthesis**: Unified result compilation
- **Formatting**: Enhanced display preparation

### 3. Response Formatting Pipeline

- **JSON Detection**: Identifying structured content
- **Content Parsing**: Extracting meaningful data
- **Format Conversion**: Transforming to display format
- **Frontend Rendering**: Rich text presentation

## 🛠️ Core Components

### Backend Services

#### 1. Main System Orchestrator (`main_system_orchestrator.py`)
- **Port**: 5031
- **Purpose**: Central orchestration engine
- **Features**: Query analysis, agent selection, response synthesis

#### 2. A2A Service (`a2a_service.py`)
- **Port**: 5008
- **Purpose**: Agent-to-Agent communication hub
- **Features**: Agent registration, handover management, metrics collection

#### 3. Ollama API (`ollama_api.py`)
- **Port**: 5002
- **Purpose**: LLM integration wrapper
- **Features**: Model management, response generation, health monitoring

#### 4. Strands SDK (`strands_sdk_api.py`)
- **Port**: 5006
- **Purpose**: Tool integration framework
- **Features**: Tool registration, execution management, workflow templates

### Frontend Components

- **MainSystemOrchestratorCard**: Primary interface for orchestration
- **A2AOrchestrationMonitor**: Real-time agent coordination visualization
- **ObservabilityPanel**: System health and performance monitoring
- **Response Formatting**: Enhanced display of structured content

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Ollama** (with models: qwen3:1.7b, llama3.1, phi3)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1.git
   cd AgentOS_Strands_A2A_V1.1
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   npm install
   ```

3. **Start Ollama and pull models**
   ```bash
   ollama serve
   ollama pull qwen3:1.7b
   ollama pull llama3.1
   ollama pull phi3
   ```

### Running the System

1. **Start backend services**
   ```bash
   ./start-all-services.sh
   ```

2. **Start frontend**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Main Orchestrator: http://localhost:5031

## 📊 Service Architecture

### Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 5173 | React development server |
| Main Orchestrator | 5031 | Central orchestration |
| A2A Service | 5008 | Agent communication |
| Ollama API | 5002 | LLM integration |
| Strands SDK | 5006 | Tool framework |
| Ollama Core | 11434 | LLM service |

## 🔧 Configuration

### Environment Variables

```bash
OLLAMA_BASE_URL=http://localhost:11434
ORCHESTRATOR_MODEL=qwen3:1.7b
MAIN_ORCHESTRATOR_PORT=5031
A2A_SERVICE_PORT=5008
OLLAMA_API_PORT=5002
STRANDS_SDK_PORT=5006
```

## 📈 Monitoring & Observability

### Health Endpoints

- Main Orchestrator: `GET /health`
- A2A Service: `GET /api/a2a/health`
- Ollama API: `GET /api/health`
- Strands SDK: `GET /health`

### Metrics Collection

- Execution times and token usage
- Success rates and error tracking
- Resource utilization monitoring
- Conversation lineage tracking

## 🧪 Testing

### Test Scripts

```bash
python scripts/comprehensive-a2a-test.py
python scripts/detailed-a2a-test.py
./scripts/health-monitor.sh
```

## 🚀 Advanced Features

### 1. Dynamic Agent Selection
Intelligent agent selection based on domain expertise, capability matching, and performance history.

### 2. Response Formatting
Advanced JSON response formatting with poem formatting, data presentation, and markdown conversion.

### 3. Multi-Agent Coordination
Sophisticated agent coordination with sequential execution, handover management, and context preservation.

### 4. Observability Features
Comprehensive monitoring with real-time metrics, conversation lineage, and resource monitoring.

## 🔒 Security

- Input validation and output filtering
- Rate limiting and CORS configuration
- SQL injection prevention
- Environment isolation and access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1/discussions)

---

**AgentOS Studio Strands** - Empowering intelligent agent orchestration for the future of AI collaboration.
