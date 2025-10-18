#!/usr/bin/env python3
"""
Enhanced Agent Registry with Capability Definitions
Implements agent metadata, input/output schemas, and dynamic discovery
"""

import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class AgentCapability(Enum):
    SUMMARIZE = "summarize"
    CREATE_PRESENTATION = "create_presentation"
    ANALYZE_DATA = "analyze_data"
    GENERATE_CONTENT = "generate_content"
    CODE_GENERATION = "code_generation"
    RESEARCH = "research"
    TRANSLATE = "translate"
    CALCULATE = "calculate"
    MULTI_STEP = "multi_step"

@dataclass
class InputSchema:
    """Agent input schema definition"""
    type: str  # text, json, file, data
    required: bool
    description: str
    max_length: Optional[int] = None
    formats: Optional[List[str]] = None
    examples: Optional[List[str]] = None

@dataclass
class OutputSchema:
    """Agent output schema definition"""
    type: str  # text, json, file, structured
    format: str  # plain, markdown, json, xml
    description: str
    max_length: Optional[int] = None
    structure: Optional[Dict[str, Any]] = None

@dataclass
class AgentMetadata:
    """Complete agent metadata"""
    agent_id: str
    name: str
    description: str
    url: str
    capabilities: List[AgentCapability]
    input_schema: InputSchema
    output_schema: OutputSchema
    status: str = "unknown"
    last_health_check: Optional[str] = None
    registered_at: Optional[str] = None
    performance_metrics: Optional[Dict[str, float]] = None

class EnhancedAgentRegistry:
    """Enhanced agent registry with schema definitions"""
    
    def __init__(self, db_path: str = "enhanced_agent_registry.db"):
        self.db_path = db_path
        self.agents: Dict[str, AgentMetadata] = {}
        self._init_database()
    
    def _init_database(self):
        """Initialize enhanced database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enhanced agents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agents (
                agent_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                url TEXT NOT NULL,
                capabilities TEXT,
                input_schema TEXT,
                output_schema TEXT,
                status TEXT DEFAULT 'unknown',
                last_health_check TIMESTAMP,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                performance_metrics TEXT
            )
        ''')
        
        # Agent performance tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agent_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT,
                execution_time REAL,
                success_rate REAL,
                quality_score REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (agent_id) REFERENCES agents (agent_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def register_agent(self, agent_metadata: AgentMetadata) -> Dict[str, Any]:
        """Register agent with complete metadata"""
        try:
            # Store in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO agents 
                (agent_id, name, description, url, capabilities, input_schema, output_schema, 
                 status, last_health_check, registered_at, updated_at, performance_metrics)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                agent_metadata.agent_id,
                agent_metadata.name,
                agent_metadata.description,
                agent_metadata.url,
                json.dumps([cap.value for cap in agent_metadata.capabilities]),
                json.dumps(asdict(agent_metadata.input_schema)),
                json.dumps(asdict(agent_metadata.output_schema)),
                agent_metadata.status,
                agent_metadata.last_health_check,
                datetime.now().isoformat(),
                datetime.now().isoformat(),
                json.dumps(agent_metadata.performance_metrics or {})
            ))
            
            conn.commit()
            conn.close()
            
            # Store in memory
            self.agents[agent_metadata.agent_id] = agent_metadata
            
            return {
                "status": "success",
                "agent_id": agent_metadata.agent_id,
                "message": "Agent registered successfully"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_agents_by_capability(self, capability: AgentCapability) -> List[AgentMetadata]:
        """Get agents that have a specific capability"""
        matching_agents = []
        for agent in self.agents.values():
            if capability in agent.capabilities and agent.status == "active":
                matching_agents.append(agent)
        return matching_agents
    
    def find_best_agent(self, task_type: str, input_requirements: Dict[str, Any]) -> Optional[AgentMetadata]:
        """Find the best agent for a specific task"""
        capability = AgentCapability(task_type)
        candidates = self.get_agents_by_capability(capability)
        
        if not candidates:
            return None
        
        # Score agents based on input compatibility and performance
        best_agent = None
        best_score = 0
        
        for agent in candidates:
            score = self._calculate_agent_score(agent, input_requirements)
            if score > best_score:
                best_score = score
                best_agent = agent
        
        return best_agent
    
    def _calculate_agent_score(self, agent: AgentMetadata, input_requirements: Dict[str, Any]) -> float:
        """Calculate agent suitability score"""
        score = 0.0
        
        # Input compatibility (40%)
        input_compatibility = self._check_input_compatibility(agent.input_schema, input_requirements)
        score += input_compatibility * 0.4
        
        # Performance metrics (30%)
        if agent.performance_metrics:
            avg_performance = sum(agent.performance_metrics.values()) / len(agent.performance_metrics)
            score += avg_performance * 0.3
        else:
            score += 0.5 * 0.3  # Default score if no metrics
        
        # Health status (20%)
        if agent.status == "active":
            score += 0.2
        elif agent.status == "unknown":
            score += 0.1
        
        # Capability match (10%)
        score += 0.1  # All candidates already match capability
        
        return score
    
    def _check_input_compatibility(self, input_schema: InputSchema, requirements: Dict[str, Any]) -> float:
        """Check how well agent input schema matches requirements"""
        compatibility = 0.0
        
        # Type compatibility
        if input_schema.type == requirements.get("type", "text"):
            compatibility += 0.5
        elif input_schema.type == "mixed" or requirements.get("type") == "mixed":
            compatibility += 0.3
        
        # Format compatibility
        if requirements.get("formats"):
            if input_schema.formats and any(fmt in input_schema.formats for fmt in requirements["formats"]):
                compatibility += 0.3
        
        # Length compatibility
        if requirements.get("max_length"):
            if input_schema.max_length and input_schema.max_length >= requirements["max_length"]:
                compatibility += 0.2
        
        return min(compatibility, 1.0)
    
    def update_performance(self, agent_id: str, execution_time: float, success: bool, quality_score: float):
        """Update agent performance metrics"""
        if agent_id not in self.agents:
            return
        
        agent = self.agents[agent_id]
        
        # Update in-memory metrics
        if not agent.performance_metrics:
            agent.performance_metrics = {}
        
        agent.performance_metrics["execution_time"] = execution_time
        agent.performance_metrics["success_rate"] = 1.0 if success else 0.0
        agent.performance_metrics["quality_score"] = quality_score
        
        # Store in database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO agent_performance (agent_id, execution_time, success_rate, quality_score)
            VALUES (?, ?, ?, ?)
        ''', (agent_id, execution_time, 1.0 if success else 0.0, quality_score))
        
        cursor.execute('''
            UPDATE agents SET performance_metrics = ?, updated_at = ?
            WHERE agent_id = ?
        ''', (json.dumps(agent.performance_metrics), datetime.now().isoformat(), agent_id))
        
        conn.commit()
        conn.close()
    
    def get_all_agents(self) -> List[AgentMetadata]:
        """Get all registered agents"""
        return list(self.agents.values())
    
    def load_from_database(self):
        """Load agents from database on startup"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM agents')
        rows = cursor.fetchall()
        
        for row in rows:
            agent_metadata = AgentMetadata(
                agent_id=row[0],
                name=row[1],
                description=row[2],
                url=row[3],
                capabilities=[AgentCapability(cap) for cap in json.loads(row[4])],
                input_schema=InputSchema(**json.loads(row[5])),
                output_schema=OutputSchema(**json.loads(row[6])),
                status=row[7],
                last_health_check=row[8],
                registered_at=row[9],
                performance_metrics=json.loads(row[11]) if row[11] else None
            )
            self.agents[agent_metadata.agent_id] = agent_metadata
        
        conn.close()

# Example agent definitions
def create_example_agents() -> List[AgentMetadata]:
    """Create example agents for testing"""
    
    agents = [
        AgentMetadata(
            agent_id="summarizer_agent",
            name="Document Summarizer",
            description="Specialized in summarizing long documents and texts",
            url="http://localhost:8001",
            capabilities=[AgentCapability.SUMMARIZE],
            input_schema=InputSchema(
                type="text",
                required=True,
                description="Text content to be summarized",
                max_length=50000,
                examples=["Research paper text", "Article content", "Document text"]
            ),
            output_schema=OutputSchema(
                type="text",
                format="markdown",
                description="Concise summary of the input text",
                max_length=2000
            )
        ),
        
        AgentMetadata(
            agent_id="presentation_agent",
            name="Presentation Generator",
            description="Creates PowerPoint presentations from text content",
            url="http://localhost:8002",
            capabilities=[AgentCapability.CREATE_PRESENTATION],
            input_schema=InputSchema(
                type="text",
                required=True,
                description="Text content to convert to presentation",
                max_length=10000,
                formats=["markdown", "structured_text"]
            ),
            output_schema=OutputSchema(
                type="file",
                format="pptx",
                description="PowerPoint presentation file",
                structure={"slides": "array", "titles": "array"}
            )
        ),
        
        AgentMetadata(
            agent_id="creative_writer",
            name="Creative Writer",
            description="Generates creative content like stories, poems, and articles",
            url="http://localhost:8003",
            capabilities=[AgentCapability.GENERATE_CONTENT],
            input_schema=InputSchema(
                type="text",
                required=True,
                description="Prompt or topic for creative content",
                max_length=1000,
                examples=["Write a poem about AI", "Create a story about robots"]
            ),
            output_schema=OutputSchema(
                type="text",
                format="structured",
                description="Creative content in requested format",
                max_length=5000
            )
        ),
        
        AgentMetadata(
            agent_id="code_generator",
            name="Code Generator",
            description="Generates code based on specifications and requirements",
            url="http://localhost:8004",
            capabilities=[AgentCapability.CODE_GENERATION],
            input_schema=InputSchema(
                type="text",
                required=True,
                description="Code specification or requirement",
                max_length=2000,
                examples=["Create a Python function to sort lists", "Generate REST API endpoint"]
            ),
            output_schema=OutputSchema(
                type="code",
                format="python",
                description="Generated code with comments",
                structure={"language": "string", "functions": "array", "tests": "array"}
            )
        )
    ]
    
    return agents

if __name__ == "__main__":
    registry = EnhancedAgentRegistry()
    
    # Register example agents
    example_agents = create_example_agents()
    for agent in example_agents:
        result = registry.register_agent(agent)
        print(f"Registered {agent.name}: {result['status']}")
    
    # Test agent discovery
    best_agent = registry.find_best_agent("summarize", {"type": "text", "max_length": 5000})
    if best_agent:
        print(f"\nBest agent for summarization: {best_agent.name}")
    
    print(f"\nTotal registered agents: {len(registry.get_all_agents())}")



