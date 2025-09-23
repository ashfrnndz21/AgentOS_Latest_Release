# 🌐 AgentOS - Advanced Multi-Agent Orchestration Platform

<div align="center">

![AgentOS Logo](https://img.shields.io/badge/AgentOS-Advanced%20Multi--Agent%20Platform-blue?style=for-the-badge&logo=robot)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)

**Enterprise-grade multi-agent orchestration platform with real-time system monitoring and intelligent workflow management**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🏗️ Architecture](#️-architecture) • [🤖 Features](#-features) • [📊 Diagrams](#-architecture-diagrams)

</div>

---

## 🎯 Overview

**AgentOS** is a comprehensive multi-agent orchestration platform that enables enterprises to deploy, manage, and monitor AI agents across multiple industries. Built with modern microservices architecture, it provides real-time system monitoring, intelligent workflow orchestration, and seamless agent-to-agent (A2A) communication.

### ✨ Key Capabilities

- **🤖 Multi-Agent Orchestration**: Deploy and coordinate multiple AI agents with intelligent routing
- **🔄 Real-Time System Monitoring**: Live memory usage, session tracking, and performance metrics
- **🏭 Industry-Specific Workspaces**: Tailored environments for Industrial, Banking, Telco, and more
- **🧠 Intelligent Query Processing**: Advanced LLM-powered query analysis and agent selection
- **🔒 Enterprise Security**: Built-in guardrails, content filtering, and governance controls
- **📊 Comprehensive Analytics**: Performance tracking, traceability, and decision path analysis

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🌐 AgentOS Cloud Infrastructure                            │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🎯 AgentOS User Interface Layer                         │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┤
│  🔐 Authentication  │  📊 Dashboard Hub   │  🎨 Industry Engine │  🔧 Settings        │
│                     │                     │                     │                     │
│ • Auth.tsx          │ • MainContent.tsx   │ • IndustryContext   │ • BackendControl    │
│ • ErrorBoundary     │ • IndustrySidebar   │ • IndustryBanner    │ • ApiSettings       │
│ • Layout.tsx        │ • Sidebar.tsx       │ • IndustrySwitcher  │ • ModelSettings     │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            🎛️ AgentOS Command Centre                                │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┤
│  📈 Analytics       │  🔍 Data Access     │  ⚖️ Governance      │  📋 Project Mgmt    │
│                     │                     │                     │                     │
│ • FixedMainTabs     │ • DataAccessContent │ • GovernanceContent │ • ProjectData       │
│ • AgentTraceability │ • DocumentChat      │ • GuardrailsPanel   │ • ProjectSelector   │
│ • PerformanceMetrics│ • DocumentLibrary   │ • LocalGuardrails   │ • ProjectTiles      │
│ • StrandsTraceability│ • DocumentUploader │ • GlobalGuardrails  │ • QuickActions      │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         🤖 Multi-Agent Workspace Ecosystem                          │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┤
│  🧠 Strands System  │  🏭 Industrial      │  🏦 Banking         │  📱 Telco CVM       │
│                     │                     │                     │                     │
│ • StrandsWorkspace  │ • ForecastingWS     │ • BankingAgentPal   │ • TelcoCvmWS        │
│ • StrandsCanvas     │ • ProcurementWS     │ • WealthMgmtWS      │ • NetworkTwinWS     │
│ • StrandsAgentPal   │ • SafetyWorkspace   │ • RDWorkspace       │ • CvmAgentPalette   │
│ • WorkflowExecution │ • SafetyWorkspace   │ • ComplianceMonitor │ • NetworkAgents     │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🔧 Core Service Layer                                  │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┤
│  🦙 Ollama API      │  📚 RAG Service     │  🔗 Strands API     │  💬 Chat Orchestr. │
│  Port: 5002         │  Port: 5003         │  Port: 5004         │  Port: 5005         │
│                     │                     │                     │                     │
│ • ollama_api.py     │ • rag_api.py        │ • strands_api.py    │ • chat_orchestr.py  │
│ • Model Management  │ • Document Ingest   │ • Workflow Exec     │ • Multi-Agent Chat  │
│ • Agent CRUD        │ • Vector Storage    │ • Node Management   │ • Context Switching │
│ • Terminal Interface│ • Semantic Search   │ • Tool Integration  │ • Session Handling  │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         🚀 Enhanced Orchestration Services                          │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┤
│  🧠 A2A Service     │  📊 Resource Monitor│  🔄 Enhanced Orch.  │  🎯 Strands SDK     │
│  Port: 5008         │  Port: 5011         │  Port: 5014         │  Port: 5006         │
│                     │                     │                     │                     │
│ • Agent-to-Agent    │ • System Metrics    │ • 6-Stage Orchestr. │ • SDK Integration   │
│ • Communication     │ • Memory Tracking   │ • Query Analysis    │ • Model Management  │
│ • Handover Logic    │ • Service Status    │ • Agent Selection   │ • Execution Engine  │
│ • Session Mgmt      │ • Performance Mon.  │ • Response Synthesis│ • Tool Registry     │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               💾 Data Storage Layer                                 │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┤
│  🗃️ Agent Database  │  🔍 Vector Store    │  📊 Strands DB      │  💬 Chat DB         │
│  (SQLite)           │  (ChromaDB)         │  (SQLite)           │  (SQLite)           │
│                     │                     │                     │                     │
│ • ollama_agents.db  │ • rag_documents.db  │ • strands_agents.db │ • chat_orchestr.db  │
│ • Agent Configs     │ • Document Vectors  │ • Workflow States   │ • Chat Sessions     │
│ • Conversations     │ • Embeddings        │ • Execution Logs    │ • Message History   │
│ • Execution Logs    │ • Metadata Index    │ • Tool Configs      │ • Context Data      │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🧠 AI Processing Engine                                │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┤
│  🦙 Ollama Core     │  🛠️ Native Tools    │  🔒 Safety Layer    │  📈 Model Registry  │
│  Port: 11434        │                     │                     │                     │
│                     │                     │                     │                     │
│ • Model Inference   │ • Calculator        │ • Content Filter    │ • ollamaModels.ts  │
│ • GPU Acceleration  │ • Time Utils        │ • Guardrails        │ • modelValidator    │
│ • Memory Management │ • Letter Counter    │ • Rate Limiting     │ • Performance Bench │
│ • Load Balancing    │ • Python REPL       │ • Input Validation  │ • Auto-Updates      │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm/yarn**
- **Python** 3.8+ with pip
- **Ollama** (for local AI models)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashfrnndz21/AgentOS_Strands_A2A_V1.0.git
   cd AgentOS_Strands_A2A_V1.0
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Python backend dependencies
   pip install -r backend/requirements.txt
   ```

3. **Start Ollama service**
   ```bash
   # Install and start Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   ollama serve
   
   # Pull required models
   ollama pull qwen3:1.7b
   ```

4. **Launch AgentOS**
   ```bash
   # Start all services (recommended)
   ./scripts/start-all-services.sh
   
   # Or start manually
   ./scripts/kill-all-services.sh  # Clean slate
   ./scripts/start-all-services.sh # Start everything
   ```

5. **Access the platform**
   - **Frontend**: http://localhost:5173
   - **Backend APIs**: http://localhost:5002-5014
   - **Ollama**: http://localhost:11434

---

## 🤖 Features

### 🧠 Multi-Agent Orchestration

**Intelligent Agent Coordination**
- **6-Stage Orchestration**: Query analysis → Agent selection → Execution → Synthesis
- **Real-time Monitoring**: Live agent performance and system metrics
- **A2A Communication**: Seamless agent-to-agent handovers
- **Context Preservation**: Maintains conversation context across agents

**Supported Agent Types**
- **Creative Assistant**: Content generation, storytelling, creative writing
- **Technical Expert**: Code generation, technical documentation, problem solving
- **Research Agent**: Information gathering, analysis, fact-checking
- **Calculator Agent**: Mathematical computations, data analysis

### 🎛️ Command Centre

**Comprehensive Analytics**
- **Performance Metrics**: Response times, success rates, usage patterns
- **Agent Traceability**: Complete execution logs and decision paths
- **Resource Monitoring**: Memory usage, CPU utilization, session tracking
- **Real-time Dashboards**: Live system status and health indicators

**Data Management**
- **Document Processing**: Upload, ingest, and vectorize documents
- **Semantic Search**: AI-powered document retrieval and analysis
- **Knowledge Base**: Centralized repository for organizational knowledge
- **Content Governance**: Automated content filtering and compliance checks

### 🏭 Industry-Specific Workspaces

**Industrial Sector**
- **Forecasting Workspace**: Demand prediction, supply chain optimization
- **Procurement Workspace**: Vendor management, cost optimization
- **Safety Workspace**: Risk assessment, compliance monitoring
- **R&D Workspace**: Innovation tracking, research collaboration

**Banking & Finance**
- **Wealth Management**: Portfolio optimization, investment advice
- **Compliance Monitor**: Regulatory compliance, risk assessment
- **Risk Assessment**: Credit analysis, market risk evaluation

**Telecommunications**
- **Customer Value Management**: Churn prediction, customer segmentation
- **Network Twin**: Network optimization, performance monitoring
- **CVM Analytics**: Customer behavior analysis, retention strategies

---

## 📖 Documentation

### 🔧 Configuration

**Service Ports**
| Service | Port | Description |
|---------|------|-------------|
| Ollama API | 5002 | Model and agent management |
| RAG Service | 5003 | Document processing and search |
| Strands API | 5004 | Workflow execution |
| Chat Orchestrator | 5005 | Multi-agent chat coordination |
| Strands SDK | 5006 | SDK integration layer |
| A2A Service | 5008 | Agent-to-agent communication |
| Resource Monitor | 5011 | System monitoring and metrics |
| Enhanced Orchestration | 5014 | Advanced query processing |

**Environment Variables**
```bash
# Core Services
OLLAMA_BASE_URL=http://localhost:11434
STRANDS_SDK_URL=http://localhost:5006
A2A_SERVICE_URL=http://localhost:5008

# Database Configuration
DATABASE_PATH=./backend/agents.db
RAG_DATABASE_PATH=./backend/rag_documents.db

# Model Configuration
ORCHESTRATOR_MODEL=qwen3:1.7b
DEFAULT_MODEL=qwen3:1.7b
```

---

## 🛠️ Development

### 🏃‍♂️ Running in Development

**Frontend Development**
```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Backend Development**
```bash
# Individual services
python backend/ollama_api.py
python backend/rag_api.py
python backend/enhanced_orchestration_api.py

# All services
./scripts/start-all-services.sh
```

---

## 📊 Performance & Monitoring

### 🔍 System Metrics

**Real-Time Monitoring**
- **Memory Usage**: Live system memory consumption tracking
- **Active Sessions**: Real-time session count and management
- **Model Performance**: Response times, throughput, accuracy metrics
- **Service Health**: Comprehensive health checks across all services

---

## 🔒 Security & Governance

### 🛡️ Security Features

**Authentication & Authorization**
- **Multi-factor Authentication**: Secure user access control
- **Role-based Permissions**: Granular access control by user role
- **Session Management**: Secure session handling and timeout
- **API Security**: Rate limiting, input validation, CORS protection

**Content Security**
- **Content Filtering**: Automated inappropriate content detection
- **Guardrails**: Built-in safety mechanisms and compliance checks
- **Data Privacy**: GDPR-compliant data handling and processing
- **Audit Logging**: Comprehensive activity tracking and logging

---

## 🤝 Contributing

We welcome contributions to AgentOS! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### 🐛 Bug Reports
- Use GitHub Issues for bug reports
- Include system information and reproduction steps
- Provide logs and error messages when possible

### 💡 Feature Requests
- Submit feature requests via GitHub Issues
- Include use case descriptions and expected behavior
- Consider implementation complexity and impact

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📊 Architecture Diagrams

### Comprehensive System Visualization

For detailed architecture diagrams and workflow visualizations, see:

- **[🏗️ Architecture Diagrams](docs/ARCHITECTURE_DIAGRAMS.md)** - Complete system architecture with 10 detailed diagrams
- **[🔄 Workflow Diagrams](docs/WORKFLOW_DIAGRAMS.md)** - User journey and system process workflows
- **[📋 Original Architecture](ARCHITECTURE.md)** - Legacy architecture documentation

### Key Diagrams Available:

1. **🌐 System Architecture Overview** - Complete service orchestration architecture
2. **🔄 Enhanced Orchestration Workflow** - 6-stage multi-agent processing
3. **🧠 A2A Communication Flow** - Agent-to-agent handover process
4. **📊 Real-Time System Monitoring** - Live metrics and health monitoring
5. **🏭 Industry-Specific Workspaces** - Multi-industry agent ecosystem
6. **🔧 Service Communication Architecture** - Inter-service communication flow
7. **🔒 Security & Performance Architecture** - Multi-layer security and performance
8. **🚀 Deployment Architecture** - Production deployment strategy
9. **📈 Data Flow Architecture** - Complete information flow
10. **🎛️ Component Architecture** - Frontend component structure

---

## 🆘 Support

### 📚 Documentation
- **API Documentation**: Comprehensive API reference and examples
- **User Guide**: Step-by-step tutorials and best practices
- **Developer Guide**: Architecture details and customization options
- **FAQ**: Common questions and troubleshooting tips

### 💬 Community
- **GitHub Discussions**: Community support and feature discussions
- **Stack Overflow**: Tag questions with `agentos` for community help

---

<div align="center">

**Built with ❤️ by the AgentOS Team**

[🌐 Website](https://agentos.ai) • [📖 Docs](https://docs.agentos.ai) • [🐦 Twitter](https://twitter.com/agentos_ai) • [💼 LinkedIn](https://linkedin.com/company/agentos)

</div>