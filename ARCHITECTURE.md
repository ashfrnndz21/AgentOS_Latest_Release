# 🏗️ AgentOS Studio Architecture Documentation

## System Architecture Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Frontend<br/>Port 5173]
        Dashboard[Agent Dashboard]
        Monitor[Orchestration Monitor]
        Settings[Settings & Config]
    end
    
    subgraph "Orchestration Layer"
        Enhanced[Enhanced LLM Orchestration<br/>Port 5014]
        LLM[LLM Analysis Engine<br/>llama3.2:1b]
        Session[Session Management]
    end
    
    subgraph "Agent Services"
        A2A[A2A Service<br/>Port 5008]
        Strands[Strands SDK<br/>Port 5006]
        Registry[Agent Registry<br/>Port 5010]
        Bridge[Agent Bridge<br/>Port 5012]
    end
    
    subgraph "Core Services"
        Ollama[Ollama Core<br/>Port 11434]
        RAG[RAG API<br/>Port 5003]
        Resource[Resource Monitor<br/>Port 5011]
        Chat[Chat Orchestrator<br/>Port 5005]
    end
    
    subgraph "Data Layer"
        DB1[Agent Database]
        DB2[Session Database]
        DB3[Document Database]
    end
    
    UI --> Dashboard
    UI --> Monitor
    UI --> Settings
    Dashboard --> Enhanced
    Monitor --> Enhanced
    Settings --> Resource
    Enhanced --> LLM
    Enhanced --> Session
    Enhanced --> A2A
    Enhanced --> Strands
    A2A --> Registry
    Strands --> Ollama
    Bridge --> A2A
    Bridge --> Strands
    Enhanced --> Resource
    Resource --> RAG
    Chat --> RAG
    Session --> DB2
    Registry --> DB1
    RAG --> DB3
```

## Enhanced LLM Orchestration Workflow

### 5-Stage Orchestration Process

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant E as Enhanced Orchestration
    participant L as LLM Engine
    participant A as Agent Registry
    participant S as Selected Agent
    
    U->>F: Submit Query
    F->>E: POST /api/enhanced-orchestration/query
    
    Note over E: Stage 1: Agent Discovery
    E->>A: Get Available Agents
    A-->>E: Agent List & Metadata
    
    Note over E: Stage 2: LLM Query Analysis
    E->>L: Analyze Query Context
    L-->>E: Query Analysis & Intent
    
    Note over E: Stage 3: Agent Capability Analysis
    E->>L: Evaluate Agent Capabilities
    L-->>E: Agent Evaluations & Scores
    
    Note over E: Stage 4: Contextual Matching
    E->>L: Match Query to Best Agent
    L-->>E: Selected Agent & Reasoning
    
    Note over E: Stage 5: Agent Execution
    E->>S: Execute Query
    S-->>E: Agent Response
    
    Note over E: Stage 6: Response Synthesis
    E->>E: Synthesize Final Response
    E-->>F: Complete Orchestration Result
    F-->>U: Display Results
```

## LLM Reasoning Process

### 3-Stage LLM Analysis

```mermaid
graph TD
    A[User Query] --> B[Stage 1: Query Context Analysis]
    B --> C[Stage 2: Agent Capability Analysis]
    C --> D[Stage 3: Contextual Matching]
    D --> E[Agent Selection]
    
    B --> B1[User Intent Analysis]
    B --> B2[Domain Identification]
    B --> B3[Complexity Assessment]
    B --> B4[Required Expertise]
    
    C --> C1[Agent Evaluation 1]
    C --> C2[Agent Evaluation 2]
    C --> C3[Agent Evaluation N]
    
    C1 --> C1A[Primary Expertise]
    C1 --> C1B[Capabilities Assessment]
    C1 --> C1C[Tools Analysis]
    C1 --> C1D[Suitability Score]
    
    D --> D1[Matching Reasoning]
    D --> D2[Confidence Level]
    D --> D3[Match Quality]
    D --> D4[Alternative Agents]
    
    E --> F[Execute Selected Agent]
```

## Service Communication Flow

### Inter-Service Communication

```mermaid
graph LR
    subgraph "Frontend Services"
        F1[React App]
        F2[Orchestration Monitor]
        F3[Agent Dashboard]
    end
    
    subgraph "Orchestration Services"
        O1[Enhanced Orchestration]
        O2[Session Management]
        O3[Memory Cleanup]
    end
    
    subgraph "Agent Services"
        A1[A2A Service]
        A2[Strands SDK]
        A3[Agent Registry]
    end
    
    subgraph "Core Services"
        C1[Ollama Core]
        C2[RAG API]
        C3[Resource Monitor]
    end
    
    F1 --> O1
    F2 --> O1
    F3 --> O1
    O1 --> A1
    O1 --> A2
    O1 --> A3
    A2 --> C1
    O1 --> C2
    O1 --> C3
    O2 --> O3
```

## Memory Management Architecture

### Stateless Session Design

```mermaid
graph TD
    A[Query Received] --> B[Create Session]
    B --> C[Process Query]
    C --> D[Execute Agent]
    D --> E[Generate Response]
    E --> F[Return Result]
    F --> G[Schedule Cleanup]
    G --> H[Cleanup Session]
    H --> I[Release Memory]
    I --> J[GC Collection]
    
    subgraph "Session Lifecycle"
        B
        C
        D
        E
        F
    end
    
    subgraph "Memory Management"
        G
        H
        I
        J
    end
```

## Data Flow Architecture

### Information Flow

```mermaid
flowchart TD
    A[User Input] --> B[Frontend Processing]
    B --> C[Enhanced Orchestration API]
    C --> D[LLM Analysis]
    D --> E[Agent Registry Query]
    E --> F[Agent Selection]
    F --> G[Agent Execution]
    G --> H[Response Generation]
    H --> I[Response Synthesis]
    I --> J[Frontend Display]
    J --> K[User Output]
    
    subgraph "Analysis Phase"
        D
        E
        F
    end
    
    subgraph "Execution Phase"
        G
        H
        I
    end
```

## Security & Performance Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Security Layers"
        SL1[Input Validation]
        SL2[Authentication]
        SL3[Authorization]
        SL4[Rate Limiting]
        SL5[Data Encryption]
    end
    
    subgraph "Performance Layers"
        PL1[Caching Layer]
        PL2[Load Balancing]
        PL3[Memory Management]
        PL4[Resource Monitoring]
    end
    
    SL1 --> SL2
    SL2 --> SL3
    SL3 --> SL4
    SL4 --> SL5
    
    PL1 --> PL2
    PL2 --> PL3
    PL3 --> PL4
```

## Deployment Architecture

### Production Deployment

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx/HAProxy]
    end
    
    subgraph "Frontend Cluster"
        F1[Frontend Instance 1]
        F2[Frontend Instance 2]
        F3[Frontend Instance N]
    end
    
    subgraph "Backend Cluster"
        B1[Orchestration Service 1]
        B2[Orchestration Service 2]
        B3[Agent Services]
    end
    
    subgraph "AI Infrastructure"
        AI1[Ollama Cluster]
        AI2[GPU Nodes]
        AI3[Model Storage]
    end
    
    subgraph "Data Layer"
        DB1[Primary Database]
        DB2[Replica Database]
        DB3[Cache Layer]
    end
    
    LB --> F1
    LB --> F2
    LB --> F3
    F1 --> B1
    F2 --> B2
    F3 --> B3
    B1 --> AI1
    B2 --> AI2
    B3 --> AI3
    B1 --> DB1
    B2 --> DB2
    B3 --> DB3
```
