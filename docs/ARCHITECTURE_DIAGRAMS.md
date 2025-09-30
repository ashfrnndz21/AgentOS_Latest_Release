# AgentOS Studio Strands - Architecture Diagrams

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Frontend<br/>Port 5173]
        Dashboard[Agent Dashboard]
        Monitor[A2A Monitor]
        Config[Config Panel]
    end
    
    subgraph "API Gateway Layer"
        MainOrch[Main System Orchestrator<br/>Port 5031]
    end
    
    subgraph "Core Services"
        A2A[A2A Service<br/>Port 5008]
        OllamaAPI[Ollama API<br/>Port 5002]
        StrandsSDK[Strands SDK<br/>Port 5006]
    end
    
    subgraph "AI Layer"
        OllamaCore[Ollama Core<br/>Port 11434]
        Models[(AI Models<br/>qwen3:1.7b, llama3.1, phi3)]
    end
    
    subgraph "Agent Ecosystem"
        WeatherAgent[Weather Agent]
        CreativeAgent[Creative Assistant]
        CalculatorAgent[Calculator Agent]
        CustomAgents[Custom Agents...]
    end
    
    UI --> MainOrch
    Dashboard --> MainOrch
    Monitor --> A2A
    Config --> MainOrch
    
    MainOrch --> A2A
    MainOrch --> OllamaAPI
    A2A --> StrandsSDK
    OllamaAPI --> OllamaCore
    
    A2A --> WeatherAgent
    A2A --> CreativeAgent
    A2A --> CalculatorAgent
    A2A --> CustomAgents
    
    OllamaCore --> Models
```

### Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        MainCard[MainSystemOrchestratorCard]
        A2AMonitor[A2AOrchestrationMonitor]
        ConfigModal[MainSystemOrchestratorConfigModal]
        Observability[ObservabilityPanel]
    end
    
    subgraph "Backend Services"
        Orchestrator[Main System Orchestrator]
        A2AService[A2A Service]
        OllamaWrapper[Ollama API Wrapper]
        StrandsFramework[Strands SDK]
    end
    
    subgraph "Agent Registry"
        AgentDiscovery[Agent Discovery]
        AgentSelection[Agent Selection]
        AgentExecution[Agent Execution]
    end
    
    MainCard --> Orchestrator
    A2AMonitor --> A2AService
    ConfigModal --> Orchestrator
    Observability --> A2AService
    
    Orchestrator --> AgentDiscovery
    Orchestrator --> AgentSelection
    Orchestrator --> AgentExecution
    
    AgentExecution --> A2AService
    A2AService --> StrandsFramework
```

### Service Communication Flow

```mermaid
graph TD
    subgraph "User Interface"
        U[User]
        F[Frontend React App]
    end
    
    subgraph "Orchestration Layer"
        MO[Main Orchestrator<br/>Port 5031]
    end
    
    subgraph "Communication Layer"
        A2A[A2A Service<br/>Port 5008]
        OA[Ollama API<br/>Port 5002]
        SS[Strands SDK<br/>Port 5006]
    end
    
    subgraph "AI Infrastructure"
        OC[Ollama Core<br/>Port 11434]
        M[AI Models]
    end
    
    subgraph "Agent Pool"
        WA[Weather Agent]
        CA[Creative Assistant]
        CalA[Calculator Agent]
        OA2[Other Agents]
    end
    
    U --> F
    F --> MO
    MO --> A2A
    MO --> OA
    A2A --> SS
    OA --> OC
    OC --> M
    A2A --> WA
    A2A --> CA
    A2A --> CalA
    A2A --> OA2
```

## 🔄 Data Flow Architecture

### Request Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant MO as Main Orchestrator
    participant A2A as A2A Service
    participant A1 as Agent 1
    participant A2 as Agent 2
    participant O as Ollama API
    participant OC as Ollama Core
    
    U->>F: Submit Query
    F->>MO: POST /orchestrate
    MO->>MO: Analyze Query
    MO->>A2A: Discover Agents
    A2A-->>MO: Agent List
    MO->>MO: Select Agents
    MO->>A2A: Send Task to Agent 1
    A2A->>A1: Execute Task
    A1->>O: Generate Response
    O->>OC: LLM Request
    OC-->>O: AI Response
    O-->>A1: Formatted Response
    A1-->>A2A: Task Result
    A2A-->>MO: Agent 1 Output
    MO->>A2A: Send Task to Agent 2
    A2A->>A2: Execute with Context
    A2->>O: Generate Response
    O->>OC: LLM Request
    OC-->>O: AI Response
    O-->>A2: Formatted Response
    A2-->>A2A: Task Result
    A2A-->>MO: Agent 2 Output
    MO->>MO: Synthesize Response
    MO-->>F: Final Result
    F-->>U: Display Response
```

### Agent Selection Process

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
    
    subgraph "Agent Scoring Criteria"
        DM[Domain Match]
        CM[Capability Match]
        TS[Task Suitability]
        PH[Performance History]
    end
    
    AS --> DM
    AS --> CM
    AS --> TS
    AS --> PH
```

## 🎯 Agent Ecosystem Architecture

### Agent Types and Capabilities

```mermaid
graph TB
    subgraph "Agent Categories"
        subgraph "Data Agents"
            WA[Weather Agent<br/>🌤️ Weather Data]
            DA[Data Agent<br/>📊 Analytics]
        end
        
        subgraph "Creative Agents"
            CA[Creative Assistant<br/>🎨 Content Creation]
            PA[Poetry Agent<br/>📝 Creative Writing]
        end
        
        subgraph "Technical Agents"
            CalA[Calculator Agent<br/>🧮 Math Operations]
            TA[Technical Agent<br/>⚙️ Technical Tasks]
        end
        
        subgraph "Custom Agents"
            UA[User Defined<br/>🔧 Custom Logic]
            IA[Integration Agent<br/>🔗 External APIs]
        end
    end
    
    subgraph "Agent Capabilities"
        C1[General Capabilities]
        C2[Domain Expertise]
        C3[Specialized Skills]
        C4[Integration Abilities]
    end
    
    WA --> C1
    WA --> C2
    CA --> C1
    CA --> C3
    CalA --> C1
    CalA --> C3
    UA --> C4
    IA --> C4
```

### A2A Communication Protocol

```mermaid
sequenceDiagram
    participant MO as Main Orchestrator
    participant A2A as A2A Service
    participant A1 as Agent A
    participant A2 as Agent B
    participant V as Verification System
    
    MO->>A2A: Task Request for Agent A
    A2A->>V: Generate Handoff ID
    V-->>A2A: Unique Handoff ID
    A2A->>A1: Execute Task (with Handoff ID)
    A1->>A1: Process Task
    A1->>A2A: Return Result + Verification
    A2A->>V: Validate Output
    V-->>A2A: Verification Complete
    A2A-->>MO: Agent A Result + Verification
    
    MO->>A2A: Task Request for Agent B (with Agent A context)
    A2A->>V: Generate New Handoff ID
    V-->>A2A: New Handoff ID
    A2A->>A2: Execute Task (with context + Handoff ID)
    A2->>A2: Process Task with Context
    A2->>A2A: Return Result + Verification
    A2A->>V: Validate Output
    V-->>A2A: Verification Complete
    A2A-->>MO: Agent B Result + Verification
```

## 📊 Monitoring and Observability Architecture

### Health Monitoring System

```mermaid
graph TB
    subgraph "Health Monitoring"
        HM[Health Monitor]
        H1[Main Orchestrator Health]
        H2[A2A Service Health]
        H3[Ollama API Health]
        H4[Strands SDK Health]
    end
    
    subgraph "Metrics Collection"
        MC[Metrics Collector]
        EM[Execution Metrics]
        AM[Agent Metrics]
        SM[System Metrics]
    end
    
    subgraph "Observability Dashboard"
        OD[Observability Panel]
        RT[Real-time Status]
        AH[Agent History]
        CM[Conversation Monitoring]
    end
    
    HM --> H1
    HM --> H2
    HM --> H3
    HM --> H4
    
    H1 --> MC
    H2 --> MC
    H3 --> MC
    H4 --> MC
    
    MC --> EM
    MC --> AM
    MC --> SM
    
    EM --> OD
    AM --> OD
    SM --> OD
    
    OD --> RT
    OD --> AH
    OD --> CM
```

## 🔧 Configuration Architecture

### Configuration Management

```mermaid
graph LR
    subgraph "Configuration Sources"
        EV[Environment Variables]
        CF[Config Files]
        UI[UI Configuration]
        API[API Configuration]
    end
    
    subgraph "Configuration Manager"
        CM[Config Manager]
    end
    
    subgraph "Service Configuration"
        MO_CFG[Main Orchestrator Config]
        A2A_CFG[A2A Service Config]
        OA_CFG[Ollama API Config]
        SS_CFG[Strands SDK Config]
    end
    
    subgraph "Agent Configuration"
        AG_CFG[Agent Configs]
        MC_CFG[Model Configs]
        TC_CFG[Tool Configs]
    end
    
    EV --> CM
    CF --> CM
    UI --> CM
    API --> CM
    
    CM --> MO_CFG
    CM --> A2A_CFG
    CM --> OA_CFG
    CM --> SS_CFG
    
    CM --> AG_CFG
    CM --> MC_CFG
    CM --> TC_CFG
```

---

*These diagrams provide a comprehensive view of the AgentOS Studio Strands architecture, showing how all components interact and work together to enable sophisticated multi-agent orchestration.*