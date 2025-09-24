# 🏗️ AgentOS Architecture Diagrams

## Overview

This document contains comprehensive architecture diagrams for the AgentOS multi-agent orchestration platform, showcasing the complete system design, data flow, and service interactions.

---

## 1. 🌐 System Architecture Overview

### Complete Service Orchestration Architecture

```mermaid
graph TB
    subgraph "🌐 AgentOS Cloud Infrastructure"
        subgraph "🎯 User Interface Layer"
            AUTH[🔐 Authentication<br/>Auth.tsx, ErrorBoundary]
            DASH[📊 Dashboard Hub<br/>MainContent.tsx, Sidebar.tsx]
            INDUSTRY[🎨 Industry Engine<br/>IndustryContext, IndustrySwitcher]
            SETTINGS[🔧 Settings<br/>BackendControl, ApiSettings]
        end
        
        subgraph "🎛️ Command Centre"
            ANALYTICS[📈 Analytics<br/>FixedMainTabs, AgentTraceability]
            DATA[🔍 Data Access<br/>DataAccessContent, DocumentChat]
            GOVERNANCE[⚖️ Governance<br/>GovernanceContent, GuardrailsPanel]
            PROJECTS[📋 Project Management<br/>ProjectData, ProjectSelector]
        end
        
        subgraph "🤖 Multi-Agent Workspace Ecosystem"
            STRANDS[🧠 Strands System<br/>StrandsWorkspace, StrandsCanvas]
            INDUSTRIAL[🏭 Industrial<br/>ForecastingWS, ProcurementWS]
            BANKING[🏦 Banking<br/>BankingAgentPal, WealthMgmtWS]
            TELCO[📱 Telco CVM<br/>TelcoCvmWS, NetworkTwinWS]
        end
        
        subgraph "🔧 Core Service Layer"
            OLLAMA[🦙 Ollama API<br/>Port: 5002<br/>ollama_api.py]
            RAG[📚 RAG Service<br/>Port: 5003<br/>rag_api.py]
            STRANDS_API[🔗 Strands API<br/>Port: 5004<br/>strands_api.py]
            CHAT[💬 Chat Orchestrator<br/>Port: 5005<br/>chat_orchestr.py]
        end
        
        subgraph "🚀 Enhanced Orchestration Services"
            A2A[🧠 A2A Service<br/>Port: 5008<br/>a2a_service.py]
            RESOURCE[📊 Resource Monitor<br/>Port: 5011<br/>resource_monitor_api.py]
            ENHANCED[🔄 Enhanced Orchestration<br/>Port: 5014<br/>enhanced_orchestration_api.py]
            SDK[🎯 Strands SDK<br/>Port: 5006<br/>strands_sdk_api.py]
        end
        
        subgraph "💾 Data Storage Layer"
            AGENT_DB[🗃️ Agent Database<br/>SQLite<br/>ollama_agents.db]
            VECTOR_DB[🔍 Vector Store<br/>ChromaDB<br/>rag_documents.db]
            STRANDS_DB[📊 Strands DB<br/>SQLite<br/>strands_agents.db]
            CHAT_DB[💬 Chat DB<br/>SQLite<br/>chat_orchestr.db]
        end
        
        subgraph "🧠 AI Processing Engine"
            OLLAMA_CORE[🦙 Ollama Core<br/>Port: 11434<br/>Model Inference]
            TOOLS[🛠️ Native Tools<br/>Calculator, Time Utils]
            SAFETY[🔒 Safety Layer<br/>Content Filter, Guardrails]
            REGISTRY[📈 Model Registry<br/>ollamaModels.ts]
        end
    end
    
    %% User Interface connections
    AUTH --> DASH
    DASH --> INDUSTRY
    INDUSTRY --> SETTINGS
    
    %% Command Centre connections
    DASH --> ANALYTICS
    ANALYTICS --> DATA
    DATA --> GOVERNANCE
    GOVERNANCE --> PROJECTS
    
    %% Workspace connections
    DASH --> STRANDS
    DASH --> INDUSTRIAL
    DASH --> BANKING
    DASH --> TELCO
    
    %% Core Service connections
    STRANDS --> OLLAMA
    STRANDS --> RAG
    STRANDS --> STRANDS_API
    STRANDS --> CHAT
    
    %% Enhanced Orchestration connections
    ENHANCED --> A2A
    ENHANCED --> RESOURCE
    ENHANCED --> SDK
    ENHANCED --> OLLAMA
    
    %% Data connections
    OLLAMA --> AGENT_DB
    RAG --> VECTOR_DB
    STRANDS_API --> STRANDS_DB
    CHAT --> CHAT_DB
    
    %% AI Engine connections
    OLLAMA --> OLLAMA_CORE
    SDK --> OLLAMA_CORE
    ENHANCED --> SAFETY
    RESOURCE --> REGISTRY
```

---

## 2. 🔄 Enhanced Orchestration Workflow

### 6-Stage Multi-Agent Orchestration Process

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant E as 🔄 Enhanced Orchestration (5014)
    participant L as 🧠 LLM Engine (qwen3:1.7b)
    participant A as 📋 Agent Registry
    participant S as 🤖 Selected Agent
    participant A2A as 🔗 A2A Service (5008)
    
    U->>F: Submit Query
    F->>E: POST /api/enhanced-orchestration/query
    
    Note over E: Stage 1: Orchestrator Reasoning
    E->>L: Analyze Query Context & Intent
    L-->>E: User Intent, Domain Analysis, Complexity
    
    Note over E: Stage 2: Agent Registry Analysis
    E->>A: Get Available Agents
    A-->>E: Agent List, Capabilities, Metadata
    
    Note over E: Stage 3: Agent Selection & Sequencing
    E->>L: Evaluate Agent Capabilities
    L-->>E: Agent Scores, Selection Rationale
    
    Note over E: Stage 4: A2A Sequential Handover Execution
    E->>A2A: Initialize Agent Communication
    A2A->>S: Execute Query with Context
    S-->>A2A: Agent Response
    A2A-->>E: Execution Results
    
    Note over E: Stage 5: Response Synthesis
    E->>E: Synthesize Multi-Agent Results
    E->>E: Apply Context & Formatting
    
    Note over E: Stage 6: Final Output Generation
    E-->>F: Complete Orchestration Result
    F-->>U: Display Results with Metrics
    
    Note over E: Memory Cleanup
    E->>E: Release Session Resources
```

---

## 3. 🧠 A2A Communication Flow

### Agent-to-Agent Handover Process

```mermaid
graph TD
    A[User Query] --> B[Enhanced Orchestration]
    B --> C{Query Analysis}
    C --> D[Agent Selection]
    D --> E[Create A2A Session]
    E --> F[A2A Service Initialization]
    
    F --> G{Execution Strategy}
    G -->|Single Agent| H[Direct Execution]
    G -->|Sequential| I[Sequential Handover]
    G -->|Parallel| J[Parallel Execution]
    
    H --> K[Agent Response]
    I --> L[Agent 1 → Agent 2 → Agent N]
    J --> M[All Agents Simultaneously]
    
    L --> N[Context Preservation]
    M --> N
    K --> N
    
    N --> O[Response Aggregation]
    O --> P[Final Synthesis]
    P --> Q[Return to User]
    
    subgraph "A2A Communication"
        E
        F
        G
        H
        I
        J
        N
    end
    
    subgraph "Agent Pool"
        AG1[Creative Assistant<br/>Port: 8001]
        AG2[Technical Expert<br/>Port: 8002]
        AG3[Research Agent<br/>Port: 8000]
        AG4[Calculator Agent<br/>Port: 8001]
    end
    
    I --> AG1
    I --> AG2
    I --> AG3
    J --> AG1
    J --> AG2
    J --> AG3
    J --> AG4
```

---

## 4. 📊 Real-Time System Monitoring

### Live Metrics and Health Monitoring

```mermaid
graph LR
    subgraph "🔍 Monitoring Dashboard"
        MEM[💾 Memory Usage<br/>74.8% (3.47GB/8.0GB)]
        SESS[👥 Active Sessions<br/>0 sessions]
        MODEL[🤖 Model Status<br/>qwen3:1.7b]
        HEALTH[❤️ Service Health<br/>All Systems Green]
    end
    
    subgraph "📊 Resource Monitor (5011)"
        CPU[🖥️ CPU Usage<br/>10.9%]
        DISK[💿 Disk Usage<br/>2.91%]
        SWAP[🔄 Swap Usage<br/>4.06GB/5.0GB]
        LOAD[⚡ Load Average<br/>3.21, 2.76, 2.49]
    end
    
    subgraph "🔧 Service Health Checks"
        OLLAMA_H[🦙 Ollama API<br/>Port: 5002 ✅]
        RAG_H[📚 RAG Service<br/>Port: 5003 ✅]
        STRANDS_H[🔗 Strands API<br/>Port: 5004 ✅]
        CHAT_H[💬 Chat Orchestrator<br/>Port: 5005 ✅]
        A2A_H[🧠 A2A Service<br/>Port: 5008 ✅]
        RESOURCE_H[📊 Resource Monitor<br/>Port: 5011 ✅]
        ENHANCED_H[🔄 Enhanced Orchestration<br/>Port: 5014 ✅]
        SDK_H[🎯 Strands SDK<br/>Port: 5006 ✅]
    end
    
    MEM --> CPU
    SESS --> HEALTH
    MODEL --> OLLAMA_H
    
    HEALTH --> OLLAMA_H
    HEALTH --> RAG_H
    HEALTH --> STRANDS_H
    HEALTH --> CHAT_H
    HEALTH --> A2A_H
    HEALTH --> RESOURCE_H
    HEALTH --> ENHANCED_H
    HEALTH --> SDK_H
```

---

## 5. 🏭 Industry-Specific Workspaces

### Multi-Industry Agent Ecosystem

```mermaid
graph TB
    subgraph "🎯 AgentOS Platform"
        MAIN[Main Dashboard]
    end
    
    subgraph "🧠 Strands System"
        SW[Strands Workspace]
        SC[Strands Canvas]
        SAP[Strands Agent Palette]
        WE[Workflow Execution]
    end
    
    subgraph "🏭 Industrial Sector"
        FW[Forecasting Workspace<br/>Demand Prediction]
        PW[Procurement Workspace<br/>Vendor Management]
        SW_INDUSTRIAL[Safety Workspace<br/>Risk Assessment]
        RDW[R&D Workspace<br/>Innovation Tracking]
    end
    
    subgraph "🏦 Banking & Finance"
        BW[Banking Agent Palette<br/>Financial Services]
        WW[Wealth Management<br/>Portfolio Optimization]
        CM[Compliance Monitor<br/>Regulatory Compliance]
        RA[Risk Assessment<br/>Credit Analysis]
    end
    
    subgraph "📱 Telecommunications"
        TCW[Telco CVM Workspace<br/>Customer Value Management]
        NTW[Network Twin Workspace<br/>Network Optimization]
        CAP[CVM Agent Palette<br/>Customer Segmentation]
        NA[Network Agents<br/>Performance Monitoring]
    end
    
    MAIN --> SW
    MAIN --> FW
    MAIN --> BW
    MAIN --> TCW
    
    SW --> SC
    SC --> SAP
    SAP --> WE
    
    FW --> PW
    PW --> SW_INDUSTRIAL
    SW_INDUSTRIAL --> RDW
    
    BW --> WW
    WW --> CM
    CM --> RA
    
    TCW --> NTW
    NTW --> CAP
    CAP --> NA
```

---

## 6. 🔧 Service Communication Architecture

### Inter-Service Communication Flow

```mermaid
graph LR
    subgraph "🖥️ Frontend Services"
        F1[React App<br/>Port: 5173]
        F2[Orchestration Monitor]
        F3[Agent Dashboard]
        F4[System Status]
    end
    
    subgraph "🔄 Orchestration Services"
        O1[Enhanced Orchestration<br/>Port: 5014]
        O2[Session Management]
        O3[Memory Cleanup]
        O4[6-Stage Processor]
    end
    
    subgraph "🤖 Agent Services"
        A1[A2A Service<br/>Port: 5008]
        A2[Strands SDK<br/>Port: 5006]
        A3[Agent Registry]
        A4[Agent Coordination]
    end
    
    subgraph "🔧 Core Services"
        C1[Ollama Core<br/>Port: 11434]
        C2[RAG API<br/>Port: 5003]
        C3[Resource Monitor<br/>Port: 5011]
        C4[Chat Orchestrator<br/>Port: 5005]
    end
    
    subgraph "💾 Data Services"
        D1[Agent Database<br/>SQLite]
        D2[Vector Store<br/>ChromaDB]
        D3[Session Storage]
        D4[Configuration Store]
    end
    
    F1 --> O1
    F2 --> O1
    F3 --> O1
    F4 --> C3
    
    O1 --> O2
    O1 --> O3
    O1 --> O4
    
    O1 --> A1
    O1 --> A2
    O1 --> A3
    O1 --> A4
    
    A2 --> C1
    A1 --> C4
    O1 --> C2
    O1 --> C3
    
    O2 --> D3
    A3 --> D1
    C2 --> D2
    O4 --> D4
```

---

## 7. 🔒 Security & Performance Architecture

### Multi-Layer Security and Performance

```mermaid
graph TB
    subgraph "🛡️ Security Layers"
        SL1[Input Validation<br/>Request Sanitization]
        SL2[Authentication<br/>User Verification]
        SL3[Authorization<br/>Role-based Access]
        SL4[Rate Limiting<br/>API Throttling]
        SL5[Data Encryption<br/>TLS/SSL]
        SL6[Content Filtering<br/>Safety Guardrails]
    end
    
    subgraph "⚡ Performance Layers"
        PL1[Caching Layer<br/>Response Caching]
        PL2[Load Balancing<br/>Request Distribution]
        PL3[Memory Management<br/>Resource Optimization]
        PL4[Resource Monitoring<br/>Real-time Metrics]
        PL5[Session Management<br/>Stateless Design]
        PL6[Auto-scaling<br/>Dynamic Resources]
    end
    
    subgraph "🔍 Monitoring & Analytics"
        MA1[Health Checks<br/>Service Status]
        MA2[Performance Metrics<br/>Response Times]
        MA3[Error Tracking<br/>Exception Handling]
        MA4[Audit Logging<br/>Activity Tracking]
        MA5[Usage Analytics<br/>User Behavior]
        MA6[System Alerts<br/>Proactive Monitoring]
    end
    
    SL1 --> SL2
    SL2 --> SL3
    SL3 --> SL4
    SL4 --> SL5
    SL5 --> SL6
    
    PL1 --> PL2
    PL2 --> PL3
    PL3 --> PL4
    PL4 --> PL5
    PL5 --> PL6
    
    MA1 --> MA2
    MA2 --> MA3
    MA3 --> MA4
    MA4 --> MA5
    MA5 --> MA6
    
    SL6 --> PL1
    PL6 --> MA1
```

---

## 8. 🚀 Deployment Architecture

### Production Deployment Strategy

```mermaid
graph TB
    subgraph "🌐 Load Balancer Layer"
        LB[Nginx/HAProxy<br/>SSL Termination]
    end
    
    subgraph "🖥️ Frontend Cluster"
        F1[Frontend Instance 1<br/>React App]
        F2[Frontend Instance 2<br/>React App]
        F3[Frontend Instance N<br/>React App]
    end
    
    subgraph "🔄 Orchestration Cluster"
        O1[Enhanced Orchestration 1<br/>Port: 5014]
        O2[Enhanced Orchestration 2<br/>Port: 5014]
        O3[Session Manager<br/>Port: 5015]
    end
    
    subgraph "🤖 Agent Services Cluster"
        A1[A2A Service 1<br/>Port: 5008]
        A2[A2A Service 2<br/>Port: 5008]
        A3[Strands SDK<br/>Port: 5006]
        A4[Agent Registry<br/>Port: 5010]
    end
    
    subgraph "🧠 AI Infrastructure"
        AI1[Ollama Cluster 1<br/>GPU Nodes]
        AI2[Ollama Cluster 2<br/>GPU Nodes]
        AI3[Model Storage<br/>Shared Volume]
        AI4[Model Registry<br/>Version Control]
    end
    
    subgraph "💾 Data Layer"
        DB1[Primary Database<br/>PostgreSQL]
        DB2[Replica Database<br/>Read Replicas]
        DB3[Vector Database<br/>ChromaDB Cluster]
        DB4[Cache Layer<br/>Redis Cluster]
    end
    
    subgraph "📊 Monitoring & Observability"
        MON1[Prometheus<br/>Metrics Collection]
        MON2[Grafana<br/>Visualization]
        MON3[ELK Stack<br/>Log Aggregation]
        MON4[AlertManager<br/>Incident Response]
    end
    
    LB --> F1
    LB --> F2
    LB --> F3
    
    F1 --> O1
    F2 --> O2
    F3 --> O3
    
    O1 --> A1
    O2 --> A2
    O3 --> A3
    O1 --> A4
    
    A1 --> AI1
    A2 --> AI2
    A3 --> AI3
    A4 --> AI4
    
    O1 --> DB1
    O2 --> DB2
    A3 --> DB3
    O3 --> DB4
    
    AI1 --> MON1
    DB1 --> MON1
    O1 --> MON1
    MON1 --> MON2
    MON2 --> MON3
    MON3 --> MON4
```

---

## 9. 📈 Data Flow Architecture

### Complete Information Flow

```mermaid
flowchart TD
    A[👤 User Input] --> B[🖥️ Frontend Processing]
    B --> C[🔄 Enhanced Orchestration API]
    C --> D[🧠 LLM Analysis Engine]
    D --> E[📋 Agent Registry Query]
    E --> F[🎯 Agent Selection Algorithm]
    F --> G[🤖 Agent Execution]
    G --> H[📝 Response Generation]
    H --> I[🔄 Response Synthesis]
    I --> J[🖥️ Frontend Display]
    J --> K[👤 User Output]
    
    subgraph "🔍 Analysis Phase"
        D
        E
        F
    end
    
    subgraph "⚡ Execution Phase"
        G
        H
        I
    end
    
    subgraph "💾 Data Persistence"
        L[Session Storage]
        M[Execution Logs]
        N[Performance Metrics]
        O[User Preferences]
    end
    
    C --> L
    G --> M
    I --> N
    J --> O
    
    subgraph "🔧 Real-time Monitoring"
        P[Memory Usage]
        Q[Active Sessions]
        R[Service Health]
        S[Performance Metrics]
    end
    
    C --> P
    G --> Q
    I --> R
    J --> S
```

---

## 10. 🎛️ Component Architecture

### Frontend Component Structure

```mermaid
graph TD
    subgraph "🎯 Main Application"
        APP[App.tsx]
        LAYOUT[Layout.tsx]
        ROUTER[BrowserRouter]
    end
    
    subgraph "🖥️ Core Pages"
        DASHBOARD[Dashboard]
        AGENTS[Agents Page]
        WORKSPACE[Multi-Agent Workspace]
        COMMAND[Command Centre]
        SETTINGS[Settings]
    end
    
    subgraph "🤖 Agent Components"
        AGENT_CARD[AgentCard.tsx]
        AGENT_CONFIG[AgentConfigDialog.tsx]
        AGENT_CHAT[OllamaAgentChat.tsx]
        A2A_CARD[A2AAgentCard.tsx]
        ORCHESTRATOR[OrchestratorCard.tsx]
    end
    
    subgraph "🔄 Orchestration Components"
        ENHANCED_MONITOR[EnhancedOrchestrationMonitor.tsx]
        A2A_MONITOR[A2AOrchestrationMonitor.tsx]
        REAL_TIME_MONITOR[RealTimeLLMOrchestrationMonitor.tsx]
        SYSTEM_STATUS[System Status Component]
    end
    
    subgraph "🎨 UI Components"
        BUTTON[Button]
        CARD[Card]
        DIALOG[Dialog]
        BADGE[Badge]
        ALERT[Alert]
        TABS[Tabs]
    end
    
    APP --> LAYOUT
    LAYOUT --> ROUTER
    ROUTER --> DASHBOARD
    ROUTER --> AGENTS
    ROUTER --> WORKSPACE
    ROUTER --> COMMAND
    ROUTER --> SETTINGS
    
    DASHBOARD --> AGENT_CARD
    DASHBOARD --> SYSTEM_STATUS
    AGENTS --> AGENT_CONFIG
    AGENTS --> AGENT_CHAT
    WORKSPACE --> A2A_CARD
    WORKSPACE --> ORCHESTRATOR
    COMMAND --> ENHANCED_MONITOR
    COMMAND --> A2A_MONITOR
    COMMAND --> REAL_TIME_MONITOR
    
    AGENT_CARD --> BUTTON
    AGENT_CARD --> CARD
    AGENT_CONFIG --> DIALOG
    SYSTEM_STATUS --> BADGE
    ORCHESTRATOR --> ALERT
    ENHANCED_MONITOR --> TABS
```

---

## Summary

This comprehensive architecture documentation provides a complete view of the AgentOS multi-agent orchestration platform, including:

- **🌐 Complete System Architecture** with all service layers
- **🔄 6-Stage Orchestration Workflow** with detailed sequencing
- **🧠 A2A Communication Flow** for agent handovers
- **📊 Real-Time Monitoring** with live metrics
- **🏭 Industry-Specific Workspaces** for different sectors
- **🔧 Service Communication** patterns and flows
- **🔒 Security & Performance** multi-layer architecture
- **🚀 Production Deployment** strategy
- **📈 Data Flow Architecture** with persistence
- **🎛️ Component Architecture** for frontend structure

Each diagram is designed to be self-contained and provides specific insights into different aspects of the system architecture.


