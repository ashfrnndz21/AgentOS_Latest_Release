# AgentOS Studio Strands - A2A Multi-Agent Orchestration Platform

<div align="center">

![AgentOS Logo](https://img.shields.io/badge/AgentOS-Studio_Strands-blue?style=for-the-badge&logo=robot)
![Version](https://img.shields.io/badge/version-2.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Advanced Agent-to-Agent (A2A) Orchestration with Multi-Agent Intelligence**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-brightgreen?style=for-the-badge)](http://localhost:5173)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-blue?style=for-the-badge)](./docs/)

</div>

## 🌟 Overview

**AgentOS Studio Strands** is a cutting-edge multi-agent orchestration platform that enables intelligent AI agents to collaborate seamlessly through advanced Agent-to-Agent (A2A) communication. Built with the Strands framework, it provides a sophisticated ecosystem where specialized agents work together to solve complex tasks through coordinated execution.

### ✨ Key Features

- 🤖 **Multi-Agent Orchestration**: Intelligent agent selection and coordination
- 🔄 **A2A Communication**: Seamless agent-to-agent handovers and messaging
- 🧠 **Strands Framework Integration**: Advanced agent lifecycle management
- 📊 **Real-time Observability**: Comprehensive monitoring and analytics
- 🎯 **Dynamic Task Decomposition**: Adaptive workflow generation
- 🛠️ **Extensible Architecture**: Plugin-based agent and tool ecosystem

---

## 🏗️ System Architecture

> 📋 **Detailed Architecture Diagrams**: See [ARCHITECTURE_DIAGRAMS.md](./docs/ARCHITECTURE_DIAGRAMS.md) for comprehensive system architecture diagrams including component relationships, service communication flows, and configuration management.

### High-Level Architecture Overview

The system follows a layered architecture with clear separation of concerns:

1. **Frontend Layer** (Port 5173): React-based UI components
2. **API Gateway Layer** (Port 5031): Main System Orchestrator
3. **Core Services**: A2A Service (5008), Ollama API (5002), Strands SDK (5006)
4. **AI Layer** (Port 11434): Ollama Core with multiple AI models
5. **Agent Ecosystem**: Specialized agents (Weather, Creative, Calculator, etc.)

### Key Components

- **MainSystemOrchestratorCard**: Primary orchestration interface
- **A2AOrchestrationMonitor**: Multi-agent coordination visualization
- **MainSystemOrchestratorConfigModal**: Dynamic configuration management
- **ObservabilityPanel**: System health and analytics monitoring

---

## 🔄 Multi-Agent Orchestration Workflow

> 🔄 **Detailed Workflow Diagrams**: See [WORKFLOW_DIAGRAMS.md](./docs/WORKFLOW_DIAGRAMS.md) for comprehensive workflow diagrams including complete system workflow, A2A communication protocols, agent selection processes, and error handling flows.

### Workflow Overview

The system follows a sophisticated 4-phase orchestration process:

1. **Query Analysis & Task Decomposition**: Understanding and breaking down complex queries
2. **Agent Discovery & Selection**: Intelligent agent matching and selection
3. **Sequential Agent Execution**: Coordinated task processing with context preservation
4. **Response Synthesis**: Intelligent aggregation and formatting of results

### Key Workflow Features

- **A2A Communication**: Seamless agent-to-agent handovers with verification
- **Context Preservation**: Complete context passing between agents
- **Verification System**: Authenticity markers for all agent outputs
- **Error Recovery**: Robust fallback mechanisms and retry logic

---

## 🚀 How the System Works

### 1. **Query Processing Pipeline**

When a user submits a query, the system follows this intelligent processing pipeline:

1. **Query Analysis**: The Main System Orchestrator analyzes the query to understand:
   - Query type (creative, technical, analytical, etc.)
   - Complexity level (simple, moderate, complex)
   - Required capabilities and domains
   - Optimal workflow pattern (single-agent vs multi-agent)

2. **Task Decomposition**: Complex queries are broken down into manageable subtasks with:
   - Clear task definitions and requirements
   - Priority levels (high, medium, low)
   - Dependency mapping between tasks
   - Expected output formats

### 2. **Agent Discovery & Selection**

The system intelligently selects the best agents for each task:

1. **Agent Discovery**: Scans the A2A service for available orchestration-enabled agents
2. **Relevance Scoring**: Each agent is scored based on:
   - Domain expertise match (0-1.0)
   - Capability alignment (0-1.0)
   - Task suitability (0-1.0)
   - Performance history
3. **Selection Strategy**: Agents are selected based on:
   - Relevance scores (>0.3 threshold)
   - Workflow pattern requirements
   - Task dependencies and priorities

### 3. **Multi-Agent Coordination**

The system coordinates multiple agents through sophisticated orchestration:

1. **Sequential Execution**: Agents execute in dependency order
2. **Context Preservation**: Previous agent outputs are passed as context
3. **Handover Management**: A2A service manages seamless agent transitions
4. **Verification**: Each agent output includes authenticity markers

### 4. **Response Synthesis**

Final responses are intelligently synthesized:

1. **Content Aggregation**: Combines outputs from multiple agents
2. **Format Optimization**: Converts structured data to human-readable format
3. **Quality Enhancement**: Applies formatting and cleaning rules
4. **Verification Display**: Shows authenticity markers for transparency

---

## 🛠️ Core Components

### Backend Services

| Service | Port | Purpose | Key Features |
|---------|------|---------|--------------|
| **Main System Orchestrator** | 5031 | Central orchestration engine | Query analysis, agent selection, response synthesis |
| **A2A Service** | 5008 | Agent-to-Agent communication hub | Agent registration, handover management, metrics |
| **Ollama API** | 5002 | LLM integration wrapper | Model management, response generation, health monitoring |
| **Strands SDK** | 5006 | Tool integration framework | Tool registration, execution management, workflows |

### Frontend Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **MainSystemOrchestratorCard** | Primary orchestration interface | Query input, agent selection display, response formatting |
| **A2AOrchestrationMonitor** | Real-time agent coordination | Agent status, handover tracking, execution metrics |
| **MainSystemOrchestratorConfigModal** | Dynamic configuration | System prompts, model selection, formatting parameters |
| **ObservabilityPanel** | System monitoring | Health status, performance metrics, conversation lineage |

### Agent Ecosystem

| Agent Type | Capabilities | Use Cases |
|------------|--------------|-----------|
| **Weather Agent** | Weather data retrieval, meteorological analysis | Weather queries, climate information, forecast requests |
| **Creative Assistant** | Creative writing, poetry, storytelling | Content generation, creative tasks, artistic expression |
| **Calculator Agent** | Mathematical computations, data analysis | Calculations, numerical analysis, statistical operations |
| **Custom Agents** | Configurable capabilities | Domain-specific tasks, specialized workflows |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Ollama** (with recommended models)

### Installation

```bash
# Clone the repository
git clone https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1.git
cd AgentOS_Strands_A2A_V1.1

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Start Ollama and pull models
ollama serve
ollama pull qwen3:1.7b
ollama pull llama3.1
ollama pull phi3
```

### Running the System

```bash
# Start all backend services
./scripts/start-all-services.sh

# Start frontend development server
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Main Orchestrator: http://localhost:5031
```

---

## 📊 Service Health & Monitoring

### Health Endpoints

| Service | Health Endpoint | Status Check |
|---------|----------------|--------------|
| Main Orchestrator | `GET /health` | ✅ Service status, agent count, model info |
| A2A Service | `GET /api/a2a/health` | ✅ Agent registry, message queue, connections |
| Ollama API | `GET /api/health` | ✅ Ollama status, model availability, execution metrics |
| Strands SDK | `GET /health` | ✅ Tool registry, workflow status, integration health |

### Real-time Monitoring

The system provides comprehensive observability through:

- **Execution Metrics**: Response times, token usage, success rates
- **Agent Performance**: Individual agent statistics and capabilities
- **Conversation Lineage**: Complete interaction history and handovers
- **System Health**: Service status, resource utilization, error tracking

---

## 🔧 Configuration

### Environment Variables

```bash
# Core Configuration
OLLAMA_BASE_URL=http://localhost:11434
ORCHESTRATOR_MODEL=qwen3:1.7b

# Service Ports
MAIN_ORCHESTRATOR_PORT=5031
A2A_SERVICE_PORT=5008
OLLAMA_API_PORT=5002
STRANDS_SDK_PORT=5006

# Agent Configuration
AGENT_TIMEOUT=30
MAX_AGENTS_PER_TASK=5
VERIFICATION_ENABLED=true
```

### Agent Configuration

Agents can be configured through the Strands framework with:

- **Capability Definitions**: Domain expertise and skill sets
- **Model Assignments**: Specific LLM models per agent
- **Execution Parameters**: Timeouts, retry logic, output formats
- **Integration Settings**: API endpoints, authentication, rate limits

---

## 🧪 Testing & Validation

### Test Scripts

```bash
# Comprehensive A2A testing
python scripts/comprehensive-a2a-test.py

# Detailed agent orchestration testing
python scripts/detailed-a2a-test.py

# Health monitoring
./scripts/health-monitor.sh

# Agent output verification
python scripts/test-agent-verification.py
```

### Validation Features

- **Agent Authenticity**: Verification markers prove genuine agent outputs
- **Task Scoping**: Agents strictly adhere to assigned tasks
- **Execution Order**: Proper sequential execution based on dependencies
- **Output Quality**: Structured formatting and content validation

---

## 🎯 Advanced Features

### 1. **Intelligent Agent Selection**

The system uses sophisticated algorithms to select the most suitable agents:

- **Domain Matching**: Agents are scored based on domain expertise
- **Capability Alignment**: Skills and capabilities are matched to task requirements
- **Performance History**: Past performance influences future selections
- **Dynamic Scoring**: Real-time relevance calculation for optimal agent choice

### 2. **A2A Communication Protocol**

Advanced agent-to-agent communication with:

- **Handover Management**: Seamless task transitions between agents
- **Context Preservation**: Complete context passing between agents
- **Verification System**: Authenticity markers for all agent outputs
- **Error Handling**: Robust error recovery and fallback mechanisms

### 3. **Dynamic Response Formatting**

Intelligent response processing with:

- **JSON Detection**: Automatic structured content identification
- **Format Conversion**: Human-readable format transformation
- **Content Enhancement**: Markdown parsing and rich text display
- **Verification Display**: Transparency in agent output sources

### 4. **Comprehensive Observability**

Full system visibility through:

- **Real-time Metrics**: Live performance and health monitoring
- **Conversation Tracking**: Complete interaction lineage
- **Agent Analytics**: Individual agent performance statistics
- **System Diagnostics**: Health checks and troubleshooting tools

---

## 🔒 Security & Reliability

### Security Features

- **Input Validation**: Comprehensive input sanitization and validation
- **Output Filtering**: Secure response processing and content filtering
- **Rate Limiting**: Protection against abuse and overuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Isolation**: Secure service separation and access control

### Reliability Features

- **Error Recovery**: Automatic error handling and recovery mechanisms
- **Service Resilience**: Health checks and automatic service restart
- **Data Integrity**: Verification systems ensure authentic agent outputs
- **Performance Monitoring**: Continuous monitoring and optimization

---

## 🤝 Contributing

We welcome contributions to AgentOS Studio Strands! Here's how to get started:

1. **Fork the Repository**: Create your own fork of the project
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Your Changes**: Implement your improvements or fixes
4. **Add Tests**: Ensure your changes are properly tested
5. **Submit a Pull Request**: Create a PR with a clear description

### Development Guidelines

- Follow the existing code style and patterns
- Add comprehensive tests for new features
- Update documentation for any API changes
- Ensure all services remain healthy after changes

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1/discussions)
- **Documentation**: [Complete Documentation](./docs/)

---

<div align="center">

**AgentOS Studio Strands** - Empowering the future of intelligent agent orchestration

*Built with ❤️ using React, Python, Ollama, and the Strands Framework*

[![GitHub stars](https://img.shields.io/github/stars/ashfrnndz21/AgentOS_Strands_A2A_V1.1?style=social)](https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ashfrnndz21/AgentOS_Strands_A2A_V1.1?style=social)](https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.1/network/members)

</div>