# AgentOS Studio Strands - Complete Multi-Agent Orchestration Platform

<div align="center">

![AgentOS Logo](https://img.shields.io/badge/AgentOS-Studio_Strands-blue?style=for-the-badge&logo=robot)
![Version](https://img.shields.io/badge/version-Latest_Release-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Advanced Multi-Agent Orchestration with Utility Services & LLM Integration**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-brightgreen?style=for-the-badge)](http://localhost:5173)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-blue?style=for-the-badge)](./docs/)

</div>

## 🌟 Overview

**AgentOS Studio Strands** is a comprehensive multi-agent orchestration platform that enables intelligent AI agents to collaborate seamlessly through advanced Agent-to-Agent (A2A) communication. Built with the Strands framework, it provides a sophisticated ecosystem where specialized agents work together to solve complex tasks through coordinated execution, enhanced by powerful utility services for database operations and synthetic data generation.

### ✨ Key Features

- 🤖 **Multi-Agent Orchestration**: Intelligent agent selection and coordination with Main System Orchestrator
- 🔄 **A2A Communication**: Seamless agent-to-agent handovers and messaging with verification
- 🛠️ **Utility Agentic Services**: LLM-powered database creation and synthetic data generation
- 🧠 **Strands Framework Integration**: Advanced agent lifecycle management with database tools
- 📊 **Real-time Observability**: Comprehensive monitoring with categorized service status
- 🎯 **Dynamic Task Decomposition**: Adaptive workflow generation with strict task scoping
- 🔧 **Extensible Architecture**: Plugin-based agent and tool ecosystem

---

## 🏗️ System Architecture

### Complete Service Architecture

The system follows a layered architecture with clear separation of concerns:

#### **Core Services Layer**
- **Frontend Interface** (Port 5173): React-based UI with authentication and orchestration cards
- **Main System Orchestrator** (Port 5031): Central orchestration engine with multi-agent coordination
- **A2A Service** (Port 5008): Agent-to-Agent communication hub with handover management
- **Strands SDK** (Port 5006): Tool integration framework with database tools
- **Ollama API** (Port 5002): LLM integration wrapper with model management
- **Ollama Core** (Port 11434): Core LLM engine with multiple AI models

#### **Utility Services Layer**
- **Utility API Gateway** (Port 5044): Central gateway for all utility services
- **Database Agent Service** (Port 5041): LLM-powered database schema generation
- **Synthetic Data Service** (Port 5042): AI-generated realistic data creation
- **Utility Orchestration Engine** (Port 5043): Workflow coordination for utility services

#### **Additional Services**
- **RAG API** (Port 5003): Document processing and retrieval
- **Enhanced Orchestration** (Port 5014): Dynamic LLM orchestration
- **Agent Registry** (Port 5010): Agent management and discovery
- **Resource Monitor** (Port 5011): System health and performance monitoring

### Key Components

- **MainSystemOrchestratorCard**: Primary orchestration interface with configuration panel
- **A2AOrchestrationMonitor**: Real-time agent coordination with verification display
- **UtilityAgenticServicesPage**: Database and synthetic data management interface
- **ServiceStatus**: Categorized service monitoring with health indicators
- **ResourceMonitoring**: System metrics and performance analytics

---

## 🚀 Latest Capabilities

### 1. **Enhanced Multi-Agent Orchestration**

**Main System Orchestrator (Port 5031)** provides sophisticated orchestration with:

- **Intelligent Task Analysis**: Query type detection (creative, technical, analytical)
- **Dynamic Agent Selection**: Relevance scoring and capability matching
- **Sequential Execution**: Dependency-based agent execution order
- **Context Preservation**: Complete context passing between agents
- **Verification System**: Authenticity markers for all agent outputs
- **Configuration Panel**: Dynamic system prompt and model selection

### 2. **Utility Agentic Services**

**Complete utility ecosystem** for database and data operations:

#### **Database Agent Service (Port 5041)**
- **LLM-Powered Schema Generation**: Natural language to SQL conversion
- **Model Selection**: Dynamic Ollama model discovery and selection
- **Preview/Confirmation Workflow**: Review schema before database creation
- **SQL Parsing**: Structured table and column extraction
- **Error Handling**: Robust fallback mechanisms

#### **Synthetic Data Service (Port 5042)**
- **AI-Generated Data**: Context-aware realistic data creation
- **Multi-Table Support**: Simultaneous data generation across tables
- **Preview/Confirmation**: Review data before database insertion
- **Faker Integration**: Fallback to Faker library when needed
- **Schema-Aware Generation**: Data generation based on table structure

#### **Utility Orchestration Engine (Port 5043)**
- **Workflow Coordination**: Multi-step utility service orchestration
- **Task Queue Management**: Sequential task processing
- **Execution History**: Complete workflow tracking
- **Error Recovery**: Robust error handling and retry logic

### 3. **Enhanced Service Monitoring**

**Categorized Service Status** with comprehensive health monitoring:

- **Core LLM Services**: Ollama Core, Ollama API
- **Agent Platform Services**: Strands SDK, Strands API, Agent Registry
- **Orchestration Services**: Main System Orchestrator, Enhanced Orchestration, Chat Orchestrator
- **Communication Services**: A2A Service, A2A Observability
- **Utility Services**: Database, Synthetic Data, Orchestration Gateway
- **Processing Services**: RAG API, Text Cleaning, Dynamic Context

### 4. **Database Tools Integration**

**Strands SDK Database Tools** for agent interaction:

- **list_databases()**: List all available utility databases
- **get_database_schema()**: Retrieve database structure and tables
- **analyze_database_data()**: Statistical analysis of database content
- **database_query()**: Execute SQL queries on utility databases

---

## 🔄 Multi-Agent Orchestration Workflow

### Complete Orchestration Process

The system follows a sophisticated 4-phase orchestration process:

1. **Query Analysis & Task Decomposition**
   - Query type detection and complexity assessment
   - Task breakdown with priority levels and dependencies
   - Workflow pattern determination (single vs multi-agent)

2. **Agent Discovery & Selection**
   - A2A service agent discovery
   - Relevance scoring based on domain expertise
   - Capability alignment and performance history

3. **Sequential Agent Execution**
   - Dependency-based execution order
   - Context preservation between agents
   - A2A handover management with verification

4. **Response Synthesis**
   - Content aggregation from multiple agents
   - Format optimization and quality enhancement
   - Verification display for transparency

### Key Workflow Features

- **Strict Task Scoping**: Agents adhere to assigned tasks only
- **Execution Order Control**: Priority and dependency-based sequencing
- **Verification Markers**: Authenticity proof for all agent outputs
- **Error Recovery**: Robust fallback mechanisms and retry logic

---

## 🛠️ Core Components

### Backend Services

| Service | Port | Purpose | Key Features |
|---------|------|---------|--------------|
| **Main System Orchestrator** | 5031 | Central orchestration engine | Query analysis, agent selection, response synthesis |
| **A2A Service** | 5008 | Agent-to-Agent communication hub | Agent registration, handover management, metrics |
| **Strands SDK** | 5006 | Tool integration framework | Database tools, execution management, workflows |
| **Ollama API** | 5002 | LLM integration wrapper | Model management, response generation, health monitoring |
| **Utility API Gateway** | 5044 | Utility services gateway | Database, synthetic data, orchestration coordination |
| **Database Agent Service** | 5041 | Database creation service | LLM schema generation, preview/confirmation workflow |
| **Synthetic Data Service** | 5042 | Data generation service | AI-powered realistic data creation, multi-table support |
| **Resource Monitor** | 5011 | System monitoring | Health checks, performance metrics, service categorization |

### Frontend Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **MainSystemOrchestratorCard** | Primary orchestration interface | Query input, agent selection display, response formatting, configuration panel |
| **A2AOrchestrationMonitor** | Real-time agent coordination | Agent status, handover tracking, execution metrics, verification display |
| **UtilityAgenticServicesPage** | Utility services management | Database creation, synthetic data generation, orchestration monitoring |
| **ServiceStatus** | Service monitoring | Categorized service status, health indicators, port information |
| **ResourceMonitoring** | System analytics | Memory, CPU, disk usage, service performance metrics |

### Agent Ecosystem

| Agent Type | Capabilities | Use Cases |
|------------|--------------|-----------|
| **Weather Agent** | Weather data retrieval, meteorological analysis | Weather queries, climate information, forecast requests |
| **Creative Assistant** | Creative writing, poetry, storytelling | Content generation, creative tasks, artistic expression |
| **Calculator Agent** | Mathematical computations, data analysis | Calculations, numerical analysis, statistical operations |
| **Database Agents** | Database operations, data analysis | SQL queries, schema analysis, data insights |
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
git clone https://github.com/ashfrnndz21/AgentOS_Latest_Release.git
cd AgentOS_Latest_Release

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Start Ollama and pull models
ollama serve
ollama pull qwen3:1.7b
ollama pull llama3.1
ollama pull phi3
ollama pull phi4-mini-reasoning
```

### Running the System

```bash
# Start all backend services (including utility services)
./scripts/start-all-services.sh

# Start frontend development server
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Main Orchestrator: http://localhost:5031
# Utility Services: http://localhost:5044
```

### Service Management

```bash
# Start all services
./scripts/start-all-services.sh

# Start utility services only
./scripts/start-utility-services.sh

# Stop utility services
./scripts/stop-utility-services.sh

# Stop all services
./scripts/stop-all-services.sh
```

---

## 📊 Service Health & Monitoring

### Health Endpoints

| Service | Health Endpoint | Status Check |
|---------|----------------|--------------|
| Main Orchestrator | `GET /health` | ✅ Service status, agent count, model info |
| A2A Service | `GET /api/a2a/health` | ✅ Agent registry, message queue, connections |
| Strands SDK | `GET /api/strands-sdk/health` | ✅ Tool registry, workflow status, integration health |
| Utility Services | `GET /api/utility/health` | ✅ Database, synthetic data, orchestration status |
| Resource Monitor | `GET /api/resource-monitor/health` | ✅ System metrics, service categorization |

### Real-time Monitoring

The system provides comprehensive observability through:

- **Execution Metrics**: Response times, token usage, success rates
- **Agent Performance**: Individual agent statistics and capabilities
- **Conversation Lineage**: Complete interaction history and handovers
- **System Health**: Service status, resource utilization, error tracking
- **Service Categorization**: Grouped service monitoring by function

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
STRANDS_SDK_PORT=5006
OLLAMA_API_PORT=5002
UTILITY_GATEWAY_PORT=5044
DATABASE_AGENT_PORT=5041
SYNTHETIC_DATA_PORT=5042
UTILITY_ORCHESTRATION_PORT=5043

# Agent Configuration
AGENT_TIMEOUT=30
MAX_AGENTS_PER_TASK=5
VERIFICATION_ENABLED=true
```

### Utility Services Configuration

```bash
# Database Agent Configuration
DATABASE_AGENT_MODEL=qwen3:1.7b
SCHEMA_GENERATION_TIMEOUT=120
PREVIEW_ENABLED=true

# Synthetic Data Configuration
SYNTHETIC_DATA_MODEL=qwen3:1.7b
DATA_GENERATION_TIMEOUT=120
MULTI_TABLE_ENABLED=true
```

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

# Utility services testing
python scripts/test-utility-services.py
```

### Validation Features

- **Agent Authenticity**: Verification markers prove genuine agent outputs
- **Task Scoping**: Agents strictly adhere to assigned tasks
- **Execution Order**: Proper sequential execution based on dependencies
- **Output Quality**: Structured formatting and content validation
- **Database Integration**: SQL validation and schema verification

---

## 🎯 Advanced Features

### 1. **LLM-Powered Utility Services**

**Intelligent database and data operations** with:

- **Natural Language to SQL**: Convert descriptions to database schemas
- **Context-Aware Data Generation**: Realistic data based on schema understanding
- **Model Selection**: Dynamic Ollama model discovery and optimization
- **Preview/Confirmation Workflow**: Review before committing changes
- **Error Recovery**: Robust fallback mechanisms

### 2. **Enhanced Agent Orchestration**

**Sophisticated multi-agent coordination** with:

- **Intelligent Task Analysis**: Query type detection and complexity assessment
- **Dynamic Agent Selection**: Relevance scoring and capability matching
- **Sequential Execution**: Dependency-based agent execution order
- **Context Preservation**: Complete context passing between agents
- **Verification System**: Authenticity markers for all agent outputs

### 3. **Comprehensive Service Monitoring**

**Full system visibility** through:

- **Categorized Service Status**: Grouped monitoring by service function
- **Real-time Health Checks**: Live service status and performance metrics
- **Resource Monitoring**: Memory, CPU, disk usage tracking
- **Service Dependencies**: Understanding of service relationships
- **Error Tracking**: Comprehensive error logging and recovery

### 4. **Database Tools Integration**

**Agent-database interaction** capabilities:

- **Database Discovery**: List and explore available databases
- **Schema Analysis**: Understand database structure and relationships
- **Data Analysis**: Statistical insights and data exploration
- **Query Execution**: Direct SQL query execution by agents
- **Integration Framework**: Seamless agent-database communication

---

## 🔒 Security & Reliability

### Security Features

- **Input Validation**: Comprehensive input sanitization and validation
- **Output Filtering**: Secure response processing and content filtering
- **Rate Limiting**: Protection against abuse and overuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Isolation**: Secure service separation and access control
- **Database Security**: SQL injection prevention and access control

### Reliability Features

- **Error Recovery**: Automatic error handling and recovery mechanisms
- **Service Resilience**: Health checks and automatic service restart
- **Data Integrity**: Verification systems ensure authentic agent outputs
- **Performance Monitoring**: Continuous monitoring and optimization
- **Graceful Degradation**: Fallback mechanisms for service failures

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
- Test utility services integration thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/ashfrnndz21/AgentOS_Latest_Release/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ashfrnndz21/AgentOS_Latest_Release/discussions)
- **Documentation**: [Complete Documentation](./docs/)

---

<div align="center">

**AgentOS Studio Strands** - Empowering the future of intelligent agent orchestration

*Built with ❤️ using React, Python, Ollama, and the Strands Framework*

[![GitHub stars](https://img.shields.io/github/stars/ashfrnndz21/AgentOS_Latest_Release?style=social)](https://github.com/ashfrnndz21/AgentOS_Latest_Release/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ashfrnndz21/AgentOS_Latest_Release?style=social)](https://github.com/ashfrnndz21/AgentOS_Latest_Release/network/members)

</div>