# AgentOS Studio Strands - Workflow Diagrams

## 🔄 Complete System Workflow

### Multi-Agent Orchestration Workflow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant MainOrch as Main Orchestrator
    participant A2A as A2A Service
    participant Agent1 as Weather Agent
    participant Agent2 as Creative Assistant
    participant Ollama as Ollama API
    participant Strands as Strands SDK
    
    User->>Frontend: Submit Query
    Frontend->>MainOrch: POST /orchestrate
    
    Note over MainOrch: Phase 1: Query Analysis & Task Decomposition
    MainOrch->>MainOrch: Analyze Query Type
    MainOrch->>MainOrch: Decompose Tasks
    MainOrch->>MainOrch: Determine Workflow Pattern
    
    Note over MainOrch: Phase 2: Agent Discovery & Selection
    MainOrch->>A2A: GET /orchestration-agents
    A2A-->>MainOrch: Available Agents List
    MainOrch->>MainOrch: Score Agent Relevance
    MainOrch->>MainOrch: Select Best Agents
    
    Note over MainOrch: Phase 3: Sequential Agent Execution
    MainOrch->>A2A: Send Task to Agent1
    A2A->>Agent1: Execute Task
    Agent1->>Ollama: Generate Response
    Ollama-->>Agent1: AI Response
    Agent1-->>A2A: Task Result
    A2A-->>MainOrch: Agent1 Output
    
    MainOrch->>A2A: Send Task to Agent2 (with Agent1 context)
    A2A->>Agent2: Execute Task with Previous Output
    Agent2->>Ollama: Generate Response
    Ollama-->>Agent2: AI Response
    Agent2-->>A2A: Task Result
    A2A-->>MainOrch: Agent2 Output
    
    Note over MainOrch: Phase 4: Response Synthesis
    MainOrch->>MainOrch: Synthesize Final Response
    MainOrch->>MainOrch: Format & Clean Output
    MainOrch-->>Frontend: Orchestration Result
    Frontend-->>User: Display Response
```

## 🤖 A2A Communication Workflow

### Agent-to-Agent Communication Protocol

```mermaid
graph TD
    subgraph "A2A Communication Protocol"
        A[Agent A] -->|1. Task Request| B[A2A Service]
        B -->|2. Route Message| C[Agent B]
        C -->|3. Execute Task| D[Ollama API]
        D -->|4. AI Response| C
        C -->|5. Return Result| B
        B -->|6. Handover Complete| A
    end
    
    subgraph "Verification System"
        E[Verification Markers]
        F[Execution Timestamps]
        G[Agent ID Tracking]
        H[A2A Handoff ID]
    end
    
    B --> E
    E --> F
    F --> G
    G --> H
```

## 🎯 Agent Selection Workflow

### Intelligent Agent Selection Process

```mermaid
flowchart TD
    Q[Query Input] --> QA[Query Analysis]
    QA --> QD[Query Decomposition]
    QD --> AD[Agent Discovery]
    AD --> AS[Agent Scoring]
    AS --> ASel[Agent Selection]
    ASel --> WE[Workflow Execution]
    WE --> RS[Response Synthesis]
    RS --> OUT[Final Output]
    
    subgraph "Query Analysis"
        QT[Query Type Detection]
        QC[Complexity Assessment]
        QP[Pattern Recognition]
    end
    
    subgraph "Task Decomposition"
        TD[Task Breakdown]
        TP[Priority Assignment]
        TDeps[Dependency Mapping]
    end
    
    subgraph "Agent Scoring Criteria"
        DM[Domain Match<br/>0.0 - 1.0]
        CM[Capability Match<br/>0.0 - 1.0]
        TS[Task Suitability<br/>0.0 - 1.0]
        PH[Performance History<br/>Weighted Score]
    end
    
    QA --> QT
    QA --> QC
    QA --> QP
    
    QD --> TD
    QD --> TP
    QD --> TDeps
    
    AS --> DM
    AS --> CM
    AS --> TS
    AS --> PH
```

## 📊 Response Processing Workflow

### Response Synthesis and Formatting

```mermaid
flowchart TD
    subgraph "Input Processing"
        AR[Agent Results]
        VR[Verification Data]
        MD[Metadata]
    end
    
    subgraph "Content Analysis"
        JD[JSON Detection]
        ST[Structure Analysis]
        QT[Content Type Detection]
    end
    
    subgraph "Formatting Pipeline"
        CP[Content Parsing]
        CF[Format Conversion]
        CE[Content Enhancement]
    end
    
    subgraph "Output Generation"
        FR[Final Response]
        VD[Verification Display]
        FF[Formatted Output]
    end
    
    AR --> JD
    VR --> ST
    MD --> QT
    
    JD --> CP
    ST --> CF
    QT --> CE
    
    CP --> FR
    CF --> VD
    CE --> FF
    
    FR --> OUT[User Display]
    VD --> OUT
    FF --> OUT
```

## 🔄 Error Handling Workflow

### Error Recovery and Fallback

```mermaid
flowchart TD
    subgraph "Error Detection"
        ET[Error Types]
        ES[Error Severity]
        EL[Error Location]
    end
    
    subgraph "Error Handling"
        EH[Error Handler]
        RF[Retry Logic]
        FB[Fallback Mechanism]
    end
    
    subgraph "Recovery Actions"
        RA[Retry Action]
        FA[Fallback Action]
        NA[Notification Action]
    end
    
    ET --> EH
    ES --> EH
    EL --> EH
    
    EH --> RF
    EH --> FB
    
    RF --> RA
    FB --> FA
    EH --> NA
```

---

*These workflow diagrams show the complete flow of the AgentOS Studio Strands system, from query processing to final response delivery.*