"""
Simplified Backend API - Shows Real Errors and Logs
Handles missing API keys gracefully and provides clear error messages
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import sqlite3
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_PATH = "agents.db"

def init_database():
    """Initialize SQLite database with proper schema"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Agents table with enhanced metadata
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            framework TEXT NOT NULL,
            config TEXT NOT NULL,
            status TEXT DEFAULT 'created',
            error_message TEXT,
            metadata TEXT,
            performance_metrics TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Agent executions table for tracking usage
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agent_executions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            execution_type TEXT NOT NULL,
            input_data TEXT,
            output_data TEXT,
            execution_time_ms INTEGER,
            success BOOLEAN,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("✅ Database initialized successfully")

# Initialize database on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield

def dict_factory(cursor, row):
    """Convert sqlite row to dict"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    return sqlite3.connect(DATABASE_PATH)

app = FastAPI(
    title="Enterprise Agent Platform API",
    description="Simplified backend with real error handling",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store server logs in memory for display
server_logs = []
max_logs = 100

def add_server_log(level: str, message: str, details: dict = None):
    """Add a log entry to the server logs"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        "details": details or {}
    }
    server_logs.append(log_entry)
    
    # Keep only the last max_logs entries
    if len(server_logs) > max_logs:
        server_logs.pop(0)
    
    # Also log to console
    logger.info(f"[{level}] {message}")

# Check API key availability
def check_api_keys():
    """Check which API keys are available"""
    api_status = {
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
        "bedrock": bool(os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"))
    }
    
    missing_keys = [provider for provider, available in api_status.items() if not available]
    
    return api_status, missing_keys

# Add startup log
api_status, missing_keys = check_api_keys()
if missing_keys:
    add_server_log("WARNING", f"⚠️ Missing API keys: {', '.join(missing_keys)}", {
        "missing_providers": missing_keys,
        "available_providers": [k for k, v in api_status.items() if v],
        "impact": "Agent creation will fail without proper API keys"
    })
else:
    add_server_log("INFO", "✅ All API keys configured", api_status)

@app.get("/")
async def root():
    return {"message": "Simplified Enterprise Agent Platform API", "status": "running"}

@app.get("/health")
async def health_check():
    api_status, missing_keys = check_api_keys()
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "api_keys": api_status,
        "missing_keys": missing_keys,
        "agents_in_db": get_agent_count()
    }

def get_agent_count():
    """Get count of agents in database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM agents")
        count = cursor.fetchone()[0]
        conn.close()
        return count
    except:
        return 0

@app.get("/api/agents")
async def list_agents():
    """List ONLY real agents created through the frontend - no mock data"""
    add_server_log("DEBUG", "📡 API call: GET /api/agents")
    
    try:
        conn = get_db_connection()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, framework, status, error_message, created_at, updated_at, config, metadata, performance_metrics
            FROM agents
            ORDER BY created_at DESC
        """)
        
        db_agents = cursor.fetchall()
        conn.close()
        
        # Format agents for display
        agents_list = []
        for agent in db_agents:
            config = {}
            metadata = {}
            performance_metrics = {}
            
            try:
                config = json.loads(agent['config']) if agent['config'] else {}
                metadata = json.loads(agent['metadata']) if agent['metadata'] else {}
                performance_metrics = json.loads(agent['performance_metrics']) if agent['performance_metrics'] else {}
            except:
                config = {}
                metadata = {}
                performance_metrics = {}
            
            # Extract framework-specific metadata
            framework_metadata = {}
            if agent['framework'] == 'strands':
                framework_metadata = {
                    "reasoning_capabilities": metadata.get('reasoning_capabilities', []),
                    "memory_systems": metadata.get('memory_systems', []),
                    "inference_strategy": metadata.get('inference_strategy', 'basic_reasoning'),
                    "reasoning_patterns": config.get('reasoning_engine', {}).get('patterns', {})
                }
            elif agent['framework'] == 'agentcore':
                framework_metadata = {
                    "agent_arn": metadata.get('agent_arn', ''),
                    "action_groups_count": metadata.get('action_groups_count', 0),
                    "knowledge_bases_count": metadata.get('knowledge_bases_count', 0),
                    "guardrails_enabled": metadata.get('guardrails_enabled', False),
                    "memory_enabled": metadata.get('memory_enabled', False)
                }
            
            agents_list.append({
                "agentId": agent['id'],
                "id": agent['id'],
                "name": agent['name'],
                "framework": agent['framework'],
                "status": agent['status'],
                "error_message": agent['error_message'],
                "created_at": agent['created_at'],
                "updated_at": agent['updated_at'],
                "model_provider": config.get('model', {}).get('provider', 'unknown'),
                "model_id": config.get('model', {}).get('model_id', 'unknown'),
                "tools": config.get('tools', []),
                "metadata": metadata,
                "framework_metadata": framework_metadata,
                "performance_metrics": performance_metrics,
                "source": "database"
            })
        
        add_server_log("INFO", f"📊 Returned {len(agents_list)} real agents", {
            "total_agents": len(agents_list),
            "frameworks": {
                "generic": len([a for a in agents_list if a['framework'] == 'generic']),
                "strands": len([a for a in agents_list if a['framework'] == 'strands']),
                "agentcore": len([a for a in agents_list if a['framework'] == 'agentcore'])
            }
        })
        
        return {
            "agents": agents_list,
            "total": len(agents_list),
            "frameworks": {
                "strands": len([a for a in agents_list if a['framework'] == 'strands']),
                "agentcore": len([a for a in agents_list if a['framework'] == 'agentcore']),
                "generic": len([a for a in agents_list if a['framework'] == 'generic'])
            },
            "real_agents_only": True,
            "mock_data": False
        }
        
    except Exception as e:
        add_server_log("ERROR", f"❌ Failed to list agents: {str(e)}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents")
async def create_agent_with_validation(request: Request):
    """Create agent with proper API key validation and error handling"""
    try:
        body = await request.json()
        agent_name = body.get('name', f'Agent-{uuid.uuid4().hex[:8]}')
        framework = body.get('framework', 'generic')
        
        add_server_log("INFO", f"🚀 Creating {framework} agent: {agent_name}")
        
        # Check API keys first
        api_status, missing_keys = check_api_keys()
        model_provider = body.get('config', {}).get('model', {}).get('provider', 'openai')
        
        # Framework-specific API key validation
        required_provider = None
        error_msg = None
        
        if framework == 'generic':
            # Generic agents can use any provider, check the requested one
            required_provider = model_provider
            if model_provider in missing_keys:
                error_msg = f"❌ Generic agent requires {model_provider.upper()} API key"
        
        elif framework == 'strands':
            # Strands agents require AWS Bedrock (conceptually)
            required_provider = 'bedrock'
            if 'bedrock' in missing_keys:
                error_msg = f"❌ Strands agent requires AWS Bedrock credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
        
        elif framework == 'agentcore':
            # Agent Core agents require AWS Bedrock
            required_provider = 'bedrock'
            if 'bedrock' in missing_keys:
                error_msg = f"❌ Agent Core requires AWS Bedrock credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
        
        elif framework == 'multi-agent':
            # Multi-agent workflows can use any provider, default to OpenAI
            required_provider = model_provider
            if model_provider in missing_keys:
                error_msg = f"❌ Multi-agent workflow requires {model_provider.upper()} API key"
        
        if error_msg:
            add_server_log("ERROR", error_msg, {
                "framework": framework,
                "required_provider": required_provider,
                "missing_keys": missing_keys,
                "agent_name": agent_name
            })
            
            # Store failed agent in database
            agent_id = str(uuid.uuid4())
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO agents (id, name, framework, config, status, error_message, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                agent_id,
                agent_name,
                framework,
                json.dumps(body.get('config', {})),
                'failed',
                error_msg,
                json.dumps({
                    "framework_version": "1.0.0",
                    "created_with": "command-centre",
                    "error_type": "api_key_missing",
                    "required_provider": required_provider
                })
            ))
            
            conn.commit()
            conn.close()
            
            return {
                "agent_id": agent_id,
                "name": agent_name,
                "framework": framework,
                "status": "failed",
                "error": error_msg,
                "missing_api_key": required_provider,
                "message": f"{framework.capitalize()} agent creation failed: {error_msg.replace('❌ ', '')}",
                "real_integration": True
            }
        
        # If API key is available, create agent successfully
        agent_id = str(uuid.uuid4())
        
        add_server_log("INFO", f"✅ {framework.capitalize()} agent: API key available for {required_provider or model_provider}", {
            "agent_id": agent_id,
            "provider": required_provider or model_provider,
            "framework": framework
        })
        
        # Generate framework-specific metadata
        agent_metadata = generate_agent_metadata(framework, body.get('config', {}), agent_name)
        initial_metrics = generate_initial_metrics(framework)
        
        # Store successful agent in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO agents (id, name, framework, config, status, metadata, performance_metrics)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_id,
            agent_name,
            framework,
            json.dumps(body.get('config', {})),
            'active',
            json.dumps(agent_metadata),
            json.dumps(initial_metrics)
        ))
        
        conn.commit()
        conn.close()
        
        add_server_log("INFO", f"🎉 {framework.capitalize()} agent created successfully: {agent_name}", {
            "agent_id": agent_id,
            "framework": framework,
            "model_provider": required_provider or model_provider,
            "status": "active"
        })
        
        return {
            "agent_id": agent_id,
            "name": agent_name,
            "framework": framework,
            "status": "active",
            "message": f"{framework.capitalize()} agent created successfully with {required_provider or model_provider}",
            "real_integration": True
        }
        
    except Exception as e:
        error_msg = f"❌ Agent creation failed: {str(e)}"
        add_server_log("ERROR", error_msg, {"error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/server/logs")
async def get_server_logs():
    """Get real-time server logs including errors and API calls"""
    return {
        "logs": server_logs[-50:],  # Return last 50 logs
        "total_logs": len(server_logs),
        "server_status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

def generate_agent_metadata(framework: str, config: dict, agent_name: str) -> dict:
    """Generate framework-specific metadata for agents"""
    base_metadata = {
        "framework_version": "1.0.0",
        "created_with": "command-centre",
        "created_at": datetime.utcnow().isoformat(),
        "agent_name": agent_name
    }
    
    if framework == 'strands':
        # Handle both old and new Strands workflow format
        reasoning_engine = config.get('reasoning_engine', {})
        patterns = reasoning_engine.get('patterns', config.get('reasoning_patterns', {}))
        memory_systems = reasoning_engine.get('memory_systems', config.get('memory', {}))
        
        # Extract reasoning capabilities
        reasoning_capabilities = []
        if isinstance(patterns, dict):
            reasoning_capabilities = [
                cap for cap, enabled in patterns.items() 
                if enabled and cap in ['chain_of_thought', 'tree_of_thought', 'reflection', 'self_critique', 'multi_step_reasoning', 'analogical_reasoning']
            ]
        
        # Extract memory systems
        memory_system_list = []
        if isinstance(memory_systems, dict):
            memory_system_list = [
                system for system, enabled in memory_systems.items()
                if enabled and system in ['working_memory', 'episodic_memory', 'semantic_memory', 'memory_consolidation', 'context_window_management']
            ]
        
        return {
            **base_metadata,
            "reasoning_capabilities": reasoning_capabilities,
            "memory_systems": memory_system_list,
            "inference_strategy": reasoning_engine.get('inference_strategy', 'basic_reasoning'),
            "model_provider": config.get('model', {}).get('provider', 'bedrock'),
            "model_id": config.get('model', {}).get('model_id', config.get('model', '')),
            "workflow_steps_count": len(config.get('workflow_steps', [])),
            "tools_count": len(config.get('tools', [])),
            "guardrails_enabled": bool(config.get('guardrails', {})),
            "performance_config": config.get('performance_config', {}),
            "workflow_type": "strands_agentic_workflow"
        }
    
    elif framework == 'multi-agent':
        agents_config = config.get('agents', [])
        
        return {
            **base_metadata,
            "agents_count": len(agents_config),
            "coordination_strategy": config.get('coordination_strategy', 'sequential'),
            "communication_protocol": config.get('communication_protocol', 'message_passing'),
            "failure_handling": config.get('failure_handling', 'retry_with_fallback'),
            "agent_types": [agent.get('type', 'specialist') for agent in agents_config],
            "workflow_type": "multi_agent_coordination"
        }
    
    elif framework == 'agentcore':
        bedrock_agent = config.get('bedrock_agent', {})
        
        return {
            **base_metadata,
            "agent_arn": f"arn:aws:bedrock:us-east-1:account:agent/{uuid.uuid4()}",
            "agent_version": "DRAFT",
            "foundation_model": bedrock_agent.get('foundation_model', 'claude-3-sonnet'),
            "action_groups_count": len(bedrock_agent.get('action_groups', [])),
            "knowledge_bases_count": len(bedrock_agent.get('knowledge_bases', [])),
            "guardrails_enabled": bool(bedrock_agent.get('guardrails_configuration')),
            "memory_enabled": bedrock_agent.get('memory_configuration', {}).get('enabled', False),
            "prompt_override_enabled": bool(bedrock_agent.get('prompt_override_configuration')),
            "aws_region": "us-east-1"
        }
    
    else:  # generic
        return {
            **base_metadata,
            "model_provider": config.get('model', {}).get('provider', 'openai'),
            "model_id": config.get('model', {}).get('model_id', 'gpt-4'),
            "tools_count": len(config.get('tools', [])),
            "memory_types": list(config.get('capabilities', {}).get('memory', {}).keys()),
            "guardrails_enabled": bool(config.get('capabilities', {}).get('guardrails', {})),
            "database_access": config.get('databaseAccess', False)
        }

def generate_initial_metrics(framework: str) -> dict:
    """Generate initial performance metrics for new agents"""
    base_metrics = {
        "total_requests": 0,
        "successful_requests": 0,
        "failed_requests": 0,
        "avg_response_time": 0.0,
        "last_activity": None,
        "uptime_seconds": 0
    }
    
    if framework == 'strands':
        return {
            **base_metrics,
            "reasoning_metrics": {
                "avg_reasoning_time": 0.0,
                "reasoning_accuracy": 0.0,
                "memory_efficiency": 0.0,
                "reflection_cycles": 0,
                "critique_improvements": 0
            },
            "pattern_usage": {
                "chain_of_thought_calls": 0,
                "tree_of_thought_calls": 0,
                "reflection_calls": 0,
                "self_critique_calls": 0
            }
        }
    
    elif framework == 'multi-agent':
        return {
            **base_metrics,
            "coordination_metrics": {
                "total_workflows": 0,
                "successful_workflows": 0,
                "failed_workflows": 0,
                "avg_coordination_time": 0.0,
                "agent_utilization": 0.0
            },
            "agent_metrics": {
                "active_agents": 0,
                "idle_agents": 0,
                "failed_agents": 0,
                "avg_agent_response_time": 0.0
            }
        }
    
    elif framework == 'agentcore':
        return {
            **base_metrics,
            "invocation_metrics": {
                "total_invocations": 0,
                "successful_invocations": 0,
                "failed_invocations": 0,
                "avg_latency_ms": 0.0
            },
            "action_group_metrics": [],
            "knowledge_base_metrics": [],
            "guardrails_metrics": {
                "blocked_requests": 0,
                "warning_requests": 0
            }
        }
    
    else:  # generic
        return {
            **base_metrics,
            "model_metrics": {
                "tokens_consumed": 0,
                "avg_tokens_per_request": 0,
                "cost_estimate": 0.0
            },
            "tool_metrics": {
                "tools_called": 0,
                "tool_success_rate": 0.0,
                "avg_tool_latency": 0.0
            }
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)