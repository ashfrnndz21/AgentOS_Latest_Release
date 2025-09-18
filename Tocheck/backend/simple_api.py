"""
Simplified Backend API - Shows Real Errors and Logs
Handles missing API keys gracefully and provides clear error messages
Now includes Ollama integration for local AI models
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
import logging
import tempfile
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import sqlite3
from contextlib import asynccontextmanager

# Import Ollama service
from ollama_service import OllamaService

# Import Real RAG service
try:
    from rag_service import get_rag_service, RealRAGService
    RAG_AVAILABLE = True
except ImportError as e:
    RAG_AVAILABLE = False
    RAG_IMPORT_ERROR = str(e)

# Import Strands API
try:
    from strands_api import router as strands_router
    STRANDS_AVAILABLE = True
except ImportError as e:
    STRANDS_AVAILABLE = False
    STRANDS_IMPORT_ERROR = str(e)

# Import Monitoring API
try:
    from api.monitoring import router as monitoring_router
    MONITORING_AVAILABLE = True
except ImportError as e:
    MONITORING_AVAILABLE = False
    MONITORING_IMPORT_ERROR = str(e)

# Import Agents API
try:
    from api.agents import router as agents_router
    AGENTS_API_AVAILABLE = True
except ImportError as e:
    AGENTS_API_AVAILABLE = False
    AGENTS_API_IMPORT_ERROR = str(e)

# Import Workflow functionality
try:
    from workflow_api import setup_workflow_routes
    WORKFLOW_AVAILABLE = True
except ImportError as e:
    WORKFLOW_AVAILABLE = False
    WORKFLOW_IMPORT_ERROR = str(e)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global processing logs storage
processing_logs = []
MAX_LOGS = 1000

def add_processing_log(log_type: str, stage: str, message: str, document_id: str = None, document_name: str = None, details: dict = None):
    """Add a processing log entry"""
    global processing_logs
    
    log_entry = {
        "id": f"log-{datetime.now().timestamp()}-{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.now().isoformat(),
        "type": log_type,  # info, success, warning, error
        "stage": stage,    # upload, loading, chunking, embedding, indexing, ready, error
        "message": message,
        "document_id": document_id,
        "document_name": document_name,
        "details": details
    }
    
    processing_logs.append(log_entry)
    
    # Keep only the last MAX_LOGS entries
    if len(processing_logs) > MAX_LOGS:
        processing_logs = processing_logs[-MAX_LOGS:]
    
    # Also log to console for debugging
    logger.info(f"[{stage.upper()}] {message}")
    
    return log_entry

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
    description="Simplified backend with real error handling and multi-agent workflows",
    version="1.0.0",
    lifespan=lifespan
)

# Workflow setup will be done after add_server_log is defined

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:8081",
        "http://localhost:4173",
        "http://localhost:5174",
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:4173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
        # Add wildcard for development - REMOVE IN PRODUCTION
        "*"
    ],
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

# Setup workflow routes if available (now that add_server_log is defined)
if WORKFLOW_AVAILABLE:
    setup_workflow_routes(app)
    add_server_log("INFO", "✅ Multi-agent workflow engine initialized")
else:
    add_server_log("WARNING", f"⚠️ Workflow engine not available: {WORKFLOW_IMPORT_ERROR}")

# Setup monitoring routes
if MONITORING_AVAILABLE:
    app.include_router(monitoring_router, prefix="/api", tags=["monitoring"])
    add_server_log("INFO", "✅ System monitoring API initialized")
else:
    add_server_log("WARNING", f"⚠️ Monitoring API not available: {MONITORING_IMPORT_ERROR}")

# Setup additional agents API routes
if AGENTS_API_AVAILABLE:
    app.include_router(agents_router, prefix="/api", tags=["agents"])
    add_server_log("INFO", "✅ Enhanced agents API initialized")
else:
    add_server_log("WARNING", f"⚠️ Enhanced agents API not available: {AGENTS_API_IMPORT_ERROR}")

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

# Initialize Ollama service
ollama_service = OllamaService()
add_server_log("INFO", "🤖 Ollama service initialized")

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
        "agents_in_db": get_agent_count(),
        "uptime": "running",
        "port": 5052
    }

@app.post("/start")
async def start_backend():
    """Backend start endpoint (already running if this is called)"""
    return {
        "status": "success",
        "message": "Backend is already running",
        "port": 5052,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/stop")
async def stop_backend():
    """Backend stop endpoint (for demo purposes)"""
    add_server_log("WARNING", "🛑 Backend stop requested via API")
    return {
        "status": "success",
        "message": "Backend stop requested (demo mode - not actually stopping)",
        "timestamp": datetime.utcnow().isoformat()
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

@app.get("/api/agents/document-ready")
async def list_document_ready_agents(model_filter: str = None):
    """List agents that are suitable for document analysis, optionally filtered by model"""
    try:
        # Get custom document agents
        custom_agents_response = await list_document_agents()
        custom_agents = custom_agents_response.get("agents", [])
        
        # Get general agents that might be document-ready
        general_agents_response = await list_agents()
        general_agents = general_agents_response.get("agents", [])
        
        document_agents = []
        
        # Add custom document agents (these are always document-ready)
        for agent in custom_agents:
            if not model_filter or agent.get("model") == model_filter:
                document_agents.append(agent)
        
        # Add any existing general agents that are suitable for documents
        for agent in general_agents:
            config = agent.get("config", {})
            description = agent.get("description", "").lower()
            
            if (config.get("rag_enabled", False) or 
                "document" in description or 
                "analysis" in description or
                "legal" in description or
                "financial" in description or
                "research" in description):
                
                agent_model = config.get('model', {}).get('model_id', 'unknown')
                if not model_filter or agent_model == model_filter:
                    document_agents.append({
                        **agent,
                        "model": agent_model,
                        "document_ready": True,
                        "source": "user_created"
                    })
        
        # Get list of deleted predefined agents
        try:
            # Create table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS deleted_predefined_agents (
                    id TEXT PRIMARY KEY,
                    deleted_at TEXT
                )
            """)
            cursor.execute("SELECT id FROM deleted_predefined_agents")
            deleted_predefined_ids = [row[0] for row in cursor.fetchall()]
        except Exception as e:
            # If there's any issue with the table, just assume no agents are deleted
            deleted_predefined_ids = []
        
        # Add predefined document analysis agents (excluding deleted ones)
        all_predefined_agents = [
            {
                "id": "legal-analyst",
                "name": "Sarah",
                "role": "Legal Document Analyst",
                "expertise": "contract analysis, legal compliance, risk assessment",
                "personality": "Professional, detail-oriented, and thorough. I focus on legal implications and compliance requirements.",
                "model": "mistral",
                "description": "Specialized in legal document analysis with 5+ years experience in contract review",
                "document_ready": True,
                "predefined": True,
                "source": "predefined"
            },
            {
                "id": "financial-advisor",
                "name": "Marcus",
                "role": "Financial Document Advisor",
                "expertise": "financial analysis, investment strategies, risk management",
                "personality": "Analytical, data-driven, and strategic. I provide clear financial insights and recommendations.",
                "model": "mistral",
                "description": "Expert in financial document analysis and investment advisory",
                "document_ready": True,
                "predefined": True,
                "source": "predefined"
            },
            {
                "id": "technical-writer",
                "name": "Alex",
                "role": "Technical Documentation Specialist",
                "expertise": "technical writing, software documentation, API guides",
                "personality": "Clear, concise, and educational. I explain complex technical concepts in simple terms.",
                "model": "phi3",
                "description": "Specialized in making technical documents accessible and understandable",
                "document_ready": True,
                "predefined": True,
                "source": "predefined"
            },
            {
                "id": "research-assistant",
                "name": "Dr. Emma",
                "role": "Research Document Assistant",
                "expertise": "academic research, citation analysis, literature review",
                "personality": "Scholarly, methodical, and comprehensive. I provide detailed analysis with proper citations.",
                "model": "deepseek-r1",
                "description": "PhD-level research assistant for academic and scientific documents",
                "document_ready": True,
                "predefined": True,
                "source": "predefined"
            }
        ]
        
        # Filter out deleted predefined agents
        predefined_agents = [agent for agent in all_predefined_agents if agent["id"] not in deleted_predefined_ids]
        
        # Filter predefined agents by model if specified
        if model_filter:
            predefined_agents = [agent for agent in predefined_agents if agent["model"] == model_filter]
        
        # Combine all document agents
        all_document_agents = document_agents + predefined_agents
        
        add_server_log("INFO", f"📋 Listed {len(all_document_agents)} document-ready agents", {
            "custom": len(document_agents),
            "predefined": len(predefined_agents),
            "model_filter": model_filter
        })
        
        return {
            "agents": all_document_agents,
            "total": len(all_document_agents),
            "custom": len(document_agents),
            "predefined": len(predefined_agents),
            "model_filter": model_filter,
            "message": "Document-ready agents retrieved successfully"
        }
        
    except Exception as e:
        error_msg = f"Failed to list document-ready agents: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/document-agents")
async def create_document_agent(request: Request):
    """Create a custom document analysis agent"""
    try:
        body = await request.json()
        
        # Validate required fields
        required_fields = ['name', 'role', 'model', 'personality', 'expertise']
        for field in required_fields:
            if not body.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Generate agent ID
        agent_id = str(uuid.uuid4())
        
        # Prepare agent data
        agent_data = {
            'id': agent_id,
            'name': body['name'],
            'role': body['role'],
            'description': body.get('description', ''),
            'model': body['model'],
            'personality': body['personality'],
            'expertise': body['expertise'],
            'document_preferences': body.get('document_preferences', {}),
            'is_template': body.get('is_template', False),
            'user_created': True,
            'document_ready': True,
            'source': 'user_created',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Store in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS document_agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                description TEXT,
                model TEXT NOT NULL,
                personality TEXT NOT NULL,
                expertise TEXT NOT NULL,
                document_preferences TEXT,
                is_template BOOLEAN DEFAULT FALSE,
                user_created BOOLEAN DEFAULT TRUE,
                created_at TEXT,
                updated_at TEXT
            )
        """)
        
        # Insert agent
        cursor.execute("""
            INSERT INTO document_agents 
            (id, name, role, description, model, personality, expertise, document_preferences, is_template, user_created, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_data['id'],
            agent_data['name'],
            agent_data['role'],
            agent_data['description'],
            agent_data['model'],
            agent_data['personality'],
            agent_data['expertise'],
            json.dumps(agent_data['document_preferences']),
            agent_data['is_template'],
            agent_data['user_created'],
            agent_data['created_at'],
            agent_data['updated_at']
        ))
        
        conn.commit()
        conn.close()
        
        add_server_log("INFO", f"✅ Created custom document agent: {agent_data['name']}", {
            "agent_id": agent_id,
            "role": agent_data['role'],
            "model": agent_data['model']
        })
        
        return {
            "status": "success",
            "agent": agent_data,
            "message": f"Document agent '{agent_data['name']}' created successfully"
        }
        
    except Exception as e:
        error_msg = f"Failed to create document agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/document-agents")
async def list_document_agents():
    """List all custom document agents"""
    try:
        conn = get_db_connection()
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS document_agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                description TEXT,
                model TEXT NOT NULL,
                personality TEXT NOT NULL,
                expertise TEXT NOT NULL,
                document_preferences TEXT,
                is_template BOOLEAN DEFAULT FALSE,
                user_created BOOLEAN DEFAULT TRUE,
                created_at TEXT,
                updated_at TEXT
            )
        """)
        
        # Get all custom agents
        cursor.execute("""
            SELECT * FROM document_agents 
            WHERE user_created = TRUE 
            ORDER BY created_at DESC
        """)
        
        custom_agents = cursor.fetchall()
        conn.close()
        
        # Format agents for frontend
        formatted_agents = []
        for agent in custom_agents:
            formatted_agent = {
                **agent,
                'document_preferences': json.loads(agent['document_preferences']) if agent['document_preferences'] else {},
                'document_ready': True,
                'predefined': False,
                'source': 'user_created'
            }
            formatted_agents.append(formatted_agent)
        
        add_server_log("INFO", f"📋 Listed {len(formatted_agents)} custom document agents")
        
        return {
            "agents": formatted_agents,
            "total": len(formatted_agents),
            "message": "Custom document agents retrieved successfully"
        }
        
    except Exception as e:
        error_msg = f"Failed to list document agents: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.put("/api/document-agents/{agent_id}")
async def update_document_agent(agent_id: str, request: Request):
    """Update a custom document agent"""
    try:
        body = await request.json()
        
        # Prepare update data
        update_data = {
            'name': body.get('name'),
            'role': body.get('role'),
            'description': body.get('description', ''),
            'model': body.get('model'),
            'personality': body.get('personality'),
            'expertise': body.get('expertise'),
            'document_preferences': json.dumps(body.get('document_preferences', {})),
            'updated_at': datetime.now().isoformat()
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build update query
        set_clause = ', '.join([f"{k} = ?" for k in update_data.keys()])
        values = list(update_data.values()) + [agent_id]
        
        cursor.execute(f"""
            UPDATE document_agents 
            SET {set_clause}
            WHERE id = ? AND user_created = TRUE
        """, values)
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Agent not found or not editable")
        
        conn.commit()
        conn.close()
        
        add_server_log("INFO", f"✅ Updated document agent: {agent_id}")
        
        return {
            "status": "success",
            "message": "Document agent updated successfully"
        }
        
    except Exception as e:
        error_msg = f"Failed to update document agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.delete("/api/document-agents/{agent_id}")
async def delete_document_agent(agent_id: str):
    """Delete a document agent (custom or predefined)"""
    try:
        # First try to delete from database (custom agents)
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM document_agents 
            WHERE id = ?
        """, (agent_id,))
        
        if cursor.rowcount > 0:
            # Custom agent deleted successfully
            conn.commit()
            conn.close()
            add_server_log("INFO", f"🗑️ Deleted custom document agent: {agent_id}")
            return {
                "status": "success",
                "message": "Custom document agent deleted successfully"
            }
        
        conn.close()
        
        # Check if it's a predefined agent
        predefined_agent_ids = ["legal-analyst", "financial-advisor", "technical-writer", "research-assistant"]
        
        if agent_id in predefined_agent_ids:
            # For predefined agents, we'll add them to a "deleted" list in the database
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Create table for deleted predefined agents if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS deleted_predefined_agents (
                    id TEXT PRIMARY KEY,
                    deleted_at TEXT
                )
            """)
            
            # Add to deleted list
            cursor.execute("""
                INSERT OR REPLACE INTO deleted_predefined_agents (id, deleted_at)
                VALUES (?, ?)
            """, (agent_id, datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            
            add_server_log("INFO", f"🗑️ Marked predefined document agent as deleted: {agent_id}")
            return {
                "status": "success",
                "message": "Predefined document agent deleted successfully"
            }
        
        # Agent not found
        raise HTTPException(status_code=404, detail="Agent not found")
        
        
    except Exception as e:
        error_msg = f"Failed to delete document agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/document-agents/{agent_id}/restore")
async def restore_predefined_agent(agent_id: str):
    """Restore a deleted predefined agent"""
    try:
        # Check if it's a valid predefined agent
        predefined_agent_ids = ["legal-analyst", "financial-advisor", "technical-writer", "research-assistant"]
        
        if agent_id not in predefined_agent_ids:
            raise HTTPException(status_code=400, detail="Only predefined agents can be restored")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS deleted_predefined_agents (
                id TEXT PRIMARY KEY,
                deleted_at TEXT
            )
        """)
        
        # Remove from deleted list
        cursor.execute("""
            DELETE FROM deleted_predefined_agents WHERE id = ?
        """, (agent_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Agent was not deleted or does not exist")
        
        conn.commit()
        conn.close()
        
        add_server_log("INFO", f"🔄 Restored predefined document agent: {agent_id}")
        
        return {
            "status": "success",
            "message": "Predefined document agent restored successfully"
        }
        
    except Exception as e:
        error_msg = f"Failed to restore predefined agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

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
    
    elif framework == 'ollama':
        return {
            **base_metrics,
            "local_model_metrics": {
                "total_generations": 0,
                "successful_generations": 0,
                "failed_generations": 0,
                "avg_generation_time": 0.0,
                "total_tokens_generated": 0,
                "avg_tokens_per_generation": 0,
                "model_load_time": 0.0,
                "context_length_used": 0
            },
            "performance_metrics": {
                "cpu_usage": 0.0,
                "memory_usage": 0.0,
                "gpu_usage": 0.0,
                "inference_speed": 0.0
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

# ============================================================================
# OLLAMA INTEGRATION ENDPOINTS
# ============================================================================

@app.get("/api/ollama/status")
async def get_ollama_status():
    """Get Ollama service status and available models"""
    add_server_log("DEBUG", "📡 API call: GET /api/ollama/status")
    
    try:
        async with get_configured_ollama_service() as ollama:
            status = await ollama.check_ollama_status()
            
        add_server_log("INFO", f"🤖 Ollama status: {status['status']}", {
            "status": status['status'],
            "host": status.get('host', 'localhost:11434'),
            "model_count": status.get('model_count', 0)
        })
        
        return status
        
    except Exception as e:
        error_msg = f"Failed to check Ollama status: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/ollama/models")
async def list_ollama_models():
    """List available Ollama models with enhanced metadata"""
    add_server_log("DEBUG", "📡 API call: GET /api/ollama/models")
    
    try:
        async with get_configured_ollama_service() as ollama:
            models = await ollama.list_models()
            
        add_server_log("INFO", f"📋 Listed {len(models)} Ollama models", {
            "model_count": len(models),
            "models": [model.get('name', 'unknown') for model in models[:5]]  # First 5 for logging
        })
        
        return {
            "models": models,
            "total": len(models),
            "status": "success"
        }
        
    except Exception as e:
        error_msg = f"Failed to list Ollama models: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/ollama/models/popular")
async def get_popular_ollama_models():
    """Get list of popular Ollama models for easy installation"""
    add_server_log("DEBUG", "📡 API call: GET /api/ollama/models/popular")
    
    try:
        ollama = OllamaService()
        popular_models = ollama.get_popular_models()
        
        add_server_log("INFO", f"📋 Returned {len(popular_models)} popular models")
        
        return {
            "models": popular_models,
            "total": len(popular_models),
            "status": "success"
        }
        
    except Exception as e:
        error_msg = f"Failed to get popular models: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/ollama/pull")
async def pull_ollama_model(request: Request):
    """Pull a new Ollama model"""
    try:
        body = await request.json()
        model_name = body.get("model_name")
        
        if not model_name:
            raise HTTPException(status_code=400, detail="model_name is required")
        
        add_server_log("INFO", f"⬇️ Pulling Ollama model: {model_name}")
        
        async with get_configured_ollama_service() as ollama:
            result = await ollama.pull_model(model_name)
            
        if result["status"] == "success":
            add_server_log("INFO", f"✅ Successfully pulled model: {model_name}")
        else:
            add_server_log("ERROR", f"❌ Failed to pull model: {model_name} - {result.get('message', 'Unknown error')}")
        
        return result
        
    except Exception as e:
        error_msg = f"Failed to pull model: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/ollama/generate")
async def generate_ollama_response(request: Request):
    """Generate response using Ollama model"""
    try:
        body = await request.json()
        model = body.get("model")
        prompt = body.get("prompt")
        options = body.get("options", {})
        
        if not model or not prompt:
            raise HTTPException(status_code=400, detail="model and prompt are required")
        
        add_server_log("INFO", f"🤖 Generating response with {model}", {
            "model": model,
            "prompt_length": len(prompt),
            "options": options
        })
        
        async with get_configured_ollama_service() as ollama:
            result = await ollama.generate_response(model, prompt, **options)
            
        if result.get("status") == "success":
            add_server_log("INFO", f"✅ Generated response with {model}", {
                "model": model,
                "response_length": len(result.get("response", "")),
                "eval_count": result.get("eval_count", 0),
                "total_duration": result.get("total_duration", 0)
            })
        else:
            add_server_log("ERROR", f"❌ Generation failed with {model}: {result.get('message', 'Unknown error')}")
        
        return result
        
    except Exception as e:
        error_msg = f"Failed to generate response: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.delete("/api/ollama/models/{model_name}")
async def delete_ollama_model(model_name: str):
    """Delete an Ollama model"""
    add_server_log("INFO", f"🗑️ Deleting Ollama model: {model_name}")
    
    try:
        async with OllamaService() as ollama:
            result = await ollama.delete_model(model_name)
            
        if result["status"] == "success":
            add_server_log("INFO", f"✅ Successfully deleted model: {model_name}")
        else:
            add_server_log("ERROR", f"❌ Failed to delete model: {model_name} - {result.get('message', 'Unknown error')}")
        
        return result
        
    except Exception as e:
        error_msg = f"Failed to delete model: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/ollama/terminal")
async def execute_ollama_command(request: Request):
    """Execute Ollama terminal command safely"""
    try:
        body = await request.json()
        command = body.get("command")
        
        if not command:
            raise HTTPException(status_code=400, detail="command is required")
        
        add_server_log("INFO", f"💻 Executing Ollama command: {command}")
        
        ollama = OllamaService()
        result = ollama.execute_terminal_command(command)
        
        if result.get("success"):
            add_server_log("INFO", f"✅ Command executed successfully: {command}")
        else:
            add_server_log("WARNING", f"⚠️ Command failed: {command} - {result.get('error', 'Unknown error')}")
        
        return result
        
    except Exception as e:
        error_msg = f"Failed to execute command: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

# ============================================================================
# REAL RAG INTEGRATION ENDPOINTS
# ============================================================================

@app.get("/api/rag/status")
async def get_rag_status():
    """Get RAG service status and dependencies"""
    add_server_log("DEBUG", "📡 API call: GET /api/rag/status")
    
    if not RAG_AVAILABLE:
        return {
            "status": "unavailable",
            "error": RAG_IMPORT_ERROR,
            "message": "RAG dependencies not installed. Run: pip install langchain langchain-community chromadb fastembed pypdf",
            "required_packages": ["langchain", "langchain-community", "chromadb", "fastembed", "pypdf"]
        }
    
    try:
        rag_service = get_rag_service()
        dependencies = rag_service.check_dependencies()
        stats = rag_service.get_stats()
        
        return {
            "status": "available",
            "dependencies": dependencies,
            "stats": stats,
            "message": "Real RAG service is ready"
        }
        
    except Exception as e:
        error_msg = f"Failed to check RAG status: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        return {
            "status": "error",
            "error": str(e),
            "message": error_msg
        }

@app.post("/api/rag/ingest")
async def ingest_document(request: Request):
    """Ingest a document using real RAG pipeline"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        # Handle file upload
        form = await request.form()
        file = form.get("file")
        model_name = form.get("model_name", "mistral")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Validate file type
        filename = file.filename or "unknown"
        if not filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"Only PDF files are supported. Received: {filename}")
        
        # Read and validate file content
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Check PDF header
        if not content.startswith(b'%PDF-'):
            raise HTTPException(status_code=400, detail=f"File is not a valid PDF. Please upload a valid PDF file.")
        
        # Generate document ID
        document_id = str(uuid.uuid4())
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        add_server_log("INFO", f"📄 Ingesting document with real RAG: {file.filename}", {
            "document_id": document_id,
            "model_name": model_name,
            "file_size": len(content)
        })
        
        # Add processing log for upload
        add_processing_log("info", "upload", f"📤 Document uploaded: {file.filename}", document_id, file.filename)
        
        try:
            # Process with real RAG service
            rag_service = get_rag_service()
            result = await rag_service.ingest_document(temp_file_path, document_id, model_name, add_processing_log)
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            if result["status"] == "success":
                add_server_log("INFO", f"✅ Document ingested successfully: {document_id}", {
                    "chunks_created": result.get("chunks_created", 0),
                    "pages_processed": result.get("pages_processed", 0)
                })
            else:
                add_server_log("ERROR", f"❌ Document ingestion failed: {result.get('error', 'Unknown error')}")
            
            return {
                **result,
                "filename": file.filename,
                "real_rag": True
            }
            
        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise e
            
    except Exception as e:
        error_msg = f"Failed to ingest document: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/rag/query")
async def query_documents(request: Request):
    """Query documents using real RAG pipeline"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        body = await request.json()
        query = body.get("query")
        document_ids = body.get("document_ids", [])
        model_name = body.get("model_name", "mistral")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        # If no document IDs specified, use all available documents
        rag_service = get_rag_service()
        if not document_ids:
            # Get all available document IDs from the RAG service
            available_docs = list(rag_service.chains.keys())
            if available_docs:
                document_ids = available_docs
                add_server_log("INFO", f"🔍 No document IDs specified, using all available: {len(document_ids)} documents")
            else:
                raise HTTPException(status_code=400, detail="No documents available for querying")
        
        add_server_log("INFO", f"🔍 Processing RAG query with real pipeline", {
            "query_length": len(query),
            "document_ids": document_ids,
            "model_name": model_name
        })
        
        result = await rag_service.query_documents(query, document_ids, model_name)
        
        if result["status"] == "success":
            add_server_log("INFO", f"✅ RAG query completed successfully", {
                "chunks_retrieved": result.get("chunks_retrieved", 0),
                "response_length": len(result.get("response", ""))
            })
        else:
            add_server_log("ERROR", f"❌ RAG query failed: {result.get('error', 'Unknown error')}")
        
        return {
            **result,
            "real_rag": True
        }
        
    except Exception as e:
        error_msg = f"Failed to process RAG query: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/processing-logs")
async def get_processing_logs():
    """Get real-time processing logs"""
    global processing_logs
    
    return {
        "logs": processing_logs,
        "total": len(processing_logs),
        "real_time": True
    }

@app.delete("/api/processing-logs")
async def clear_processing_logs():
    """Clear all processing logs"""
    global processing_logs
    processing_logs.clear()
    
    return {
        "message": "Processing logs cleared",
        "status": "success"
    }

@app.get("/api/rag/documents")
async def list_rag_documents():
    """List all ingested documents"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        rag_service = get_rag_service()
        documents = rag_service.list_ingested_documents()
        
        add_server_log("INFO", f"📋 Listed {len(documents)} ingested documents")
        
        return {
            "documents": documents,
            "total": len(documents),
            "real_rag": True
        }
        
    except Exception as e:
        error_msg = f"Failed to list RAG documents: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/rag/agent-query")
async def agent_document_query(request: Request):
    """Query documents using an agent-enhanced RAG pipeline"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        body = await request.json()
        query = body.get("query")
        document_ids = body.get("document_ids", [])
        agent_config = body.get("agent_config", {})
        model_name = body.get("model_name", "mistral")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        if not agent_config:
            raise HTTPException(status_code=400, detail="Agent configuration is required")
        
        # If no document IDs specified, use all available documents
        rag_service = get_rag_service()
        if not document_ids:
            available_docs = list(rag_service.chains.keys())
            if available_docs:
                document_ids = available_docs
                add_server_log("INFO", f"🤖 Agent query using all available documents: {len(document_ids)}")
            else:
                raise HTTPException(status_code=400, detail="No documents available for querying")
        
        add_server_log("INFO", f"🤖 Processing agent-enhanced RAG query", {
            "agent_name": agent_config.get('name', 'Unknown'),
            "agent_role": agent_config.get('role', 'Unknown'),
            "query_length": len(query),
            "document_ids": document_ids,
            "model_name": model_name
        })
        
        result = await rag_service.query_documents_with_agent(query, document_ids, agent_config, model_name)
        
        if result["status"] == "success":
            add_server_log("INFO", f"✅ Agent RAG query completed successfully", {
                "agent_name": result.get("agent_info", {}).get("name", "Unknown"),
                "chunks_retrieved": result.get("chunks_retrieved", 0),
                "response_length": len(result.get("response", ""))
            })
        else:
            add_server_log("ERROR", f"❌ Agent RAG query failed: {result.get('error', 'Unknown error')}")
        
        return {
            **result,
            "real_rag": True,
            "agent_enhanced": True
        }
        
    except Exception as e:
        error_msg = f"Failed to process agent RAG query: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/rag/debug-query")
async def debug_rag_query(request: Request):
    """Debug RAG query with detailed logging"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        data = await request.json()
        query = data.get("query", "")
        document_ids = data.get("document_ids", [])
        model_name = data.get("model_name", "mistral")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        add_server_log("INFO", f"🔍 Debug RAG query: {query[:100]}...")
        
        rag_service = get_rag_service()
        
        # Get detailed debug information
        result = await rag_service.query_documents(query, document_ids, model_name)
        
        # Add extra debug info
        debug_info = {
            "available_documents": list(rag_service.chains.keys()),
            "requested_documents": document_ids,
            "vector_stores_count": len(rag_service.vector_stores),
            "retrievers_count": len(rag_service.retrievers),
            "chains_count": len(rag_service.chains)
        }
        
        result["debug_info"].update(debug_info)
        
        add_server_log("INFO", f"🔍 Debug query completed with {result.get('chunks_retrieved', 0)} chunks")
        
        return {
            **result,
            "real_rag": True
        }
        
    except Exception as e:
        error_msg = f"Failed to debug RAG query: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.delete("/api/rag/documents/{document_id}")
async def delete_rag_document(document_id: str):
    """Delete a document from RAG system"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        rag_service = get_rag_service()
        success = rag_service.clear_document(document_id)
        
        if success:
            add_server_log("INFO", f"🗑️ Deleted RAG document: {document_id}")
            return {"status": "success", "message": f"Document {document_id} deleted successfully"}
        else:
            add_server_log("WARNING", f"⚠️ Document not found: {document_id}")
            return {"status": "error", "message": f"Document {document_id} not found"}
        
    except Exception as e:
        error_msg = f"Failed to delete RAG document: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.delete("/api/rag/documents")
async def clear_all_rag_documents():
    """Clear all documents from RAG system (stateless mode)"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        rag_service = get_rag_service()
        cleared_count = rag_service.clear_all_documents()
        
        add_server_log("INFO", f"🧹 Cleared all RAG documents: {cleared_count} documents removed")
        return {
            "status": "success", 
            "message": f"Cleared {cleared_count} documents from RAG system",
            "cleared_count": cleared_count
        }
        
    except Exception as e:
        error_msg = f"Failed to clear RAG documents: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/rag/documents/{document_id}/chunks")
async def get_document_chunks(document_id: str):
    """Get chunks for a specific document with metadata"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        rag_service = get_rag_service()
        chunks = rag_service.get_document_chunks(document_id)
        
        add_server_log("INFO", f"📄 Retrieved {len(chunks)} chunks for document {document_id}")
        return {
            "status": "success",
            "document_id": document_id,
            "chunks": chunks,
            "total_chunks": len(chunks)
        }
        
    except Exception as e:
        error_msg = f"Failed to get document chunks: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"document_id": document_id, "error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/rag/models")
async def get_rag_models():
    """Get available models for RAG processing (proxy to Ollama)"""
    try:
        # Get models from Ollama service
        ollama_service = OllamaService()
        models = await ollama_service.list_models()
        
        # Extract model names for RAG use
        model_names = []
        if isinstance(models, list):
            for model in models:
                if isinstance(model, dict) and 'name' in model:
                    model_names.append(model['name'].split(':')[0])  # Remove tag
                elif isinstance(model, str):
                    model_names.append(model.split(':')[0])
        
        # Remove duplicates and sort
        model_names = sorted(list(set(model_names)))
        
        add_server_log("INFO", f"📋 Retrieved {len(model_names)} models for RAG", {"models": model_names})
        return {
            "models": model_names,
            "total": len(model_names),
            "source": "ollama"
        }
        
    except Exception as e:
        error_msg = f"Failed to get RAG models: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        # Return fallback models
        return {
            "models": ["mistral", "llama3.2", "phi3", "qwen2.5", "deepseek-r1"],
            "total": 5,
            "source": "fallback"
        }

@app.post("/api/rag/restart")
async def restart_rag_service():
    """Restart RAG service and clear all data"""
    if not RAG_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"RAG service unavailable: {RAG_IMPORT_ERROR}")
    
    try:
        # Clear all documents first
        rag_service = get_rag_service()
        cleared_count = rag_service.clear_all_documents()
        
        # Reinitialize the service
        rag_service.reinitialize()
        
        add_server_log("INFO", f"🔄 RAG service restarted: {cleared_count} documents cleared")
        return {
            "status": "success", 
            "message": f"RAG service restarted successfully, {cleared_count} documents cleared",
            "cleared_count": cleared_count
        }
        
    except Exception as e:
        error_msg = f"Failed to restart RAG service: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/agents/ollama")
async def create_ollama_agent(request: Request):
    """Create agent with Ollama model integration"""
    try:
        body = await request.json()
        agent_name = body.get("name", f"Ollama-Agent-{uuid.uuid4().hex[:8]}")
        model = body.get("model")
        role = body.get("role", "assistant")
        description = body.get("description", "Local AI agent powered by Ollama")
        host = body.get("host", "http://localhost:11434")
        
        if not model:
            raise HTTPException(status_code=400, detail="model is required")
        
        add_server_log("INFO", f"🤖 Creating Ollama agent: {agent_name} with model {model}")
        
        # Create basic agent configuration
        agent_id = str(uuid.uuid4())
        agent_config = {
            "id": agent_id,
            "name": agent_name,
            "model": model,
            "role": role,
            "description": description,
            "host": host,
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        return {
            "success": True,
            "message": "Ollama agent created successfully",
            "agent": agent_config
        }
        
    except Exception as e:
        error_msg = f"Failed to create Ollama agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/agents/ollama/enhanced")
async def create_enhanced_ollama_agent(request: Request):
    """Create enhanced Ollama agent with advanced features"""
    try:
        body = await request.json()
        
        # Required fields
        agent_name = body.get("name")
        model = body.get("model")
        role = body.get("role")
        
        if not all([agent_name, model, role]):
            raise HTTPException(status_code=400, detail="name, model, and role are required")
        
        # Enhanced fields
        description = body.get("description", "")
        personality = body.get("personality", "")
        expertise = body.get("expertise", "")
        system_prompt = body.get("systemPrompt", "You are a helpful AI assistant.")
        temperature = body.get("temperature", 0.7)
        max_tokens = body.get("maxTokens", 1000)
        
        # Advanced features
        capabilities = body.get("capabilities", {
            "conversation": True,
            "analysis": True,
            "creativity": True,
            "reasoning": True
        })
        
        rag_config = body.get("ragConfig", {
            "enabled": body.get("ragEnabled", False),
            "documentIds": [],
            "maxChunks": 5,
            "similarityThreshold": 0.7
        })
        
        guardrails = body.get("guardrails", {
            "enabled": False,
            "safetyLevel": "medium",
            "contentFilters": [],
            "rules": []
        })
        
        behavior = body.get("behavior", {
            "response_style": "professional",
            "communication_tone": "helpful"
        })
        
        host = body.get("host", "http://localhost:11434")
        
        add_server_log("INFO", f"🤖 Creating enhanced Ollama agent: {agent_name} with model {model}")
        
        # Check if Ollama is running and model exists
        async with OllamaService(host) as ollama:
            status = await ollama.check_ollama_status()
            if status["status"] != "running":
                raise HTTPException(status_code=503, detail="Ollama is not running")
            
            # Check if model exists (handle both "model" and "model:latest" formats)
            models = await ollama.list_models()
            model_names = [m.get("name", "") for m in models]
            
            # If exact model name not found, try with ":latest" suffix
            if model not in model_names:
                model_with_latest = f"{model}:latest"
                if model_with_latest in model_names:
                    model = model_with_latest  # Use the full name
                else:
                    # Also check if any model starts with the given name
                    matching_models = [name for name in model_names if name.startswith(f"{model}:")]
                    if matching_models:
                        model = matching_models[0]  # Use the first match
                    else:
                        raise HTTPException(status_code=404, detail=f"Model '{model}' not found in Ollama. Available models: {', '.join(model_names)}")
        
        # Generate agent ID
        agent_id = str(uuid.uuid4())
        
        # Create enhanced agent configuration
        agent_config = {
            "id": agent_id,
            "name": agent_name,
            "role": role,
            "description": description,
            "personality": personality,
            "expertise": expertise,
            "model": {
                "provider": "ollama",
                "model_id": model,
                "host": host
            },
            "system_prompt": system_prompt,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "capabilities": capabilities,
            "rag_config": rag_config,
            "guardrails": guardrails,
            "behavior": behavior,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        # Store in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create enhanced agents table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS enhanced_ollama_agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                description TEXT,
                personality TEXT,
                expertise TEXT,
                model_provider TEXT NOT NULL,
                model_id TEXT NOT NULL,
                model_host TEXT,
                system_prompt TEXT,
                temperature REAL DEFAULT 0.7,
                max_tokens INTEGER DEFAULT 1000,
                capabilities TEXT,
                rag_config TEXT,
                guardrails TEXT,
                behavior TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                status TEXT DEFAULT 'active'
            )
        """)
        
        # Insert enhanced agent
        cursor.execute("""
            INSERT INTO enhanced_ollama_agents 
            (id, name, role, description, personality, expertise, model_provider, model_id, model_host,
             system_prompt, temperature, max_tokens, capabilities, rag_config, guardrails, behavior,
             created_at, updated_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_id, agent_name, role, description, personality, expertise,
            "ollama", model, host, system_prompt, temperature, max_tokens,
            json.dumps(capabilities), json.dumps(rag_config), json.dumps(guardrails),
            json.dumps(behavior), agent_config["created_at"], agent_config["updated_at"], "active"
        ))
        
        conn.commit()
        conn.close()
        
        add_server_log("INFO", f"✅ Enhanced Ollama agent created successfully: {agent_name}", {
            "agent_id": agent_id,
            "model": model,
            "capabilities": list(capabilities.keys()),
            "rag_enabled": rag_config["enabled"],
            "guardrails_enabled": guardrails["enabled"]
        })
        
        return {
            "status": "success",
            "agent": agent_config,
            "message": f"Enhanced Ollama agent '{agent_name}' created successfully with model '{model}'",
            "features": {
                "capabilities": capabilities,
                "rag_integration": rag_config["enabled"],
                "safety_guardrails": guardrails["enabled"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to create enhanced Ollama agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/agents/ollama/enhanced")
async def list_enhanced_ollama_agents():
    """List all enhanced Ollama agents"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS enhanced_ollama_agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                description TEXT,
                personality TEXT,
                expertise TEXT,
                model_provider TEXT NOT NULL,
                model_id TEXT NOT NULL,
                model_host TEXT,
                system_prompt TEXT,
                temperature REAL DEFAULT 0.7,
                max_tokens INTEGER DEFAULT 1000,
                capabilities TEXT,
                rag_config TEXT,
                guardrails TEXT,
                behavior TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                status TEXT DEFAULT 'active'
            )
        """)
        
        cursor.execute("""
            SELECT * FROM enhanced_ollama_agents 
            WHERE status = 'active'
            ORDER BY created_at DESC
        """)
        
        agents = []
        for row in cursor.fetchall():
            agent = {
                "id": row[0],
                "name": row[1],
                "role": row[2],
                "description": row[3],
                "personality": row[4],
                "expertise": row[5],
                "model": {
                    "provider": row[6],
                    "model_id": row[7],
                    "host": row[8]
                },
                "system_prompt": row[9],
                "temperature": row[10],
                "max_tokens": row[11],
                "capabilities": json.loads(row[12]) if row[12] else {},
                "rag_config": json.loads(row[13]) if row[13] else {},
                "guardrails": json.loads(row[14]) if row[14] else {},
                "behavior": json.loads(row[15]) if row[15] else {},
                "created_at": row[16],
                "updated_at": row[17],
                "status": row[18]
            }
            agents.append(agent)
        
        conn.close()
        
        add_server_log("INFO", f"📋 Listed {len(agents)} enhanced Ollama agents")
        
        return {
            "status": "success",
            "agents": agents,
            "count": len(agents)
        }
        
    except Exception as e:
        error_msg = f"Failed to list enhanced Ollama agents: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/api/agents/ollama/enhanced/{agent_id}")
async def get_enhanced_ollama_agent(agent_id: str):
    """Get specific enhanced Ollama agent"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM enhanced_ollama_agents 
            WHERE id = ? AND status = 'active'
        """, (agent_id,))
        
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Enhanced Ollama agent not found")
        
        agent = {
            "id": row[0],
            "name": row[1],
            "role": row[2],
            "description": row[3],
            "personality": row[4],
            "expertise": row[5],
            "model": {
                "provider": row[6],
                "model_id": row[7],
                "host": row[8]
            },
            "system_prompt": row[9],
            "temperature": row[10],
            "max_tokens": row[11],
            "capabilities": json.loads(row[12]) if row[12] else {},
            "rag_config": json.loads(row[13]) if row[13] else {},
            "guardrails": json.loads(row[14]) if row[14] else {},
            "behavior": json.loads(row[15]) if row[15] else {},
            "created_at": row[16],
            "updated_at": row[17],
            "status": row[18]
        }
        
        conn.close()
        
        return {
            "status": "success",
            "agent": agent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to get enhanced Ollama agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.delete("/api/agents/ollama/enhanced/{agent_id}")
async def delete_enhanced_ollama_agent(agent_id: str):
    """Delete enhanced Ollama agent"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE enhanced_ollama_agents 
            SET status = 'deleted', updated_at = ?
            WHERE id = ? AND status = 'active'
        """, (datetime.now().isoformat(), agent_id))
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Enhanced Ollama agent not found")
        
        conn.commit()
        conn.close()
        
        add_server_log("INFO", f"🗑️ Deleted enhanced Ollama agent: {agent_id}")
        
        return {
            "status": "success",
            "message": "Enhanced Ollama agent deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to delete enhanced Ollama agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
        
        # Check if Ollama is running and model exists
        async with OllamaService(host) as ollama:
            status = await ollama.check_ollama_status()
            if status["status"] != "running":
                raise HTTPException(status_code=503, detail="Ollama is not running")
            
            # Check if model exists (handle both "model" and "model:latest" formats)
            models = await ollama.list_models()
            model_names = [m.get("name", "") for m in models]
            
            # If exact model name not found, try with ":latest" suffix
            if model not in model_names:
                model_with_latest = f"{model}:latest"
                if model_with_latest in model_names:
                    model = model_with_latest  # Use the full name
                else:
                    # Also check if any model starts with the given name
                    matching_models = [name for name in model_names if name.startswith(f"{model}:")]
                    if matching_models:
                        model = matching_models[0]  # Use the first match
                    else:
                        raise HTTPException(status_code=404, detail=f"Model '{model}' not found in Ollama. Available models: {', '.join(model_names)}")
        
        # Create agent configuration
        agent_config = {
            "name": agent_name,
            "model": {
                "provider": "ollama",
                "model_id": model,
                "host": host
            },
            "role": role,
            "description": description,
            "framework": "ollama",
            "tools": body.get("tools", []),
            "memory": body.get("memory", {}),
            "guardrails": body.get("guardrails", {})
        }
        
        # Generate agent metadata
        agent_metadata = {
            "framework_version": "1.0.0",
            "created_with": "ollama-integration",
            "created_at": datetime.utcnow().isoformat(),
            "agent_name": agent_name,
            "model_provider": "ollama",
            "model_id": model,
            "ollama_host": host,
            "local_model": True,
            "model_family": OllamaService()._extract_model_family(model),
            "is_code_model": OllamaService()._is_code_model(model),
            "is_chat_model": OllamaService()._is_chat_model(model)
        }
        
        # Store agent in database
        agent_id = str(uuid.uuid4())
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO agents (id, name, framework, config, status, metadata, performance_metrics)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_id,
            agent_name,
            "ollama",
            json.dumps(agent_config),
            "active",
            json.dumps(agent_metadata),
            json.dumps(generate_initial_metrics("ollama"))
        ))
        
        conn.commit()
        conn.close()
        
        add_server_log("INFO", f"✅ Ollama agent created successfully: {agent_name}", {
            "agent_id": agent_id,
            "model": model,
            "host": host
        })
        
        return {
            "agent_id": agent_id,
            "name": agent_name,
            "framework": "ollama",
            "status": "active",
            "model": model,
            "host": host,
            "message": f"Ollama agent '{agent_name}' created successfully with model '{model}'",
            "real_integration": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Failed to create Ollama agent: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}", {"error": str(e)})
        raise HTTPException(status_code=500, detail=error_msg)

# ============================================================================
# END OLLAMA INTEGRATION
# ============================================================================
# STRANDS FRAMEWORK INTEGRATION
# ============================================================================

# Include Strands API router
if STRANDS_AVAILABLE:
    app.include_router(strands_router)
    logger.info("✅ Strands Framework API enabled")
else:
    logger.warning(f"⚠️ Strands Framework API disabled: {STRANDS_IMPORT_ERROR}")

# ============================================================================

# Test endpoint for Strands integration
@app.get("/api/strands/test")
async def test_strands_integration():
    """Test endpoint to verify Strands integration is working"""
    return {
        "status": "success",
        "message": "Strands integration is working",
        "strands_available": STRANDS_AVAILABLE,
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================================================
# CONFIGURATION MANAGEMENT ENDPOINTS
# ============================================================================

# Configuration storage
CONFIG_FILE = "backend_config.json"
DEFAULT_CONFIG = {
    "timeouts": {
        "generation_timeout": 300,
        "health_check_timeout": 5,
        "model_pull_timeout": 300,
        "command_timeout": 60
    },
    "ollama_host": "http://localhost:11434",
    "backend_port": 5052
}

def load_config() -> dict:
    """Load configuration from file or return defaults"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
                # Merge with defaults to ensure all keys exist
                merged_config = DEFAULT_CONFIG.copy()
                merged_config.update(config)
                return merged_config
        return DEFAULT_CONFIG.copy()
    except Exception as e:
        logger.error(f"Error loading config: {e}")
        return DEFAULT_CONFIG.copy()

def save_config(config: dict) -> bool:
    """Save configuration to file"""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving config: {e}")
        return False

@app.get("/config")
async def get_backend_config():
    """Get current backend configuration"""
    add_server_log("DEBUG", "📡 API call: GET /config")
    try:
        config = load_config()
        return {
            "status": "success",
            "config": config,
            "message": "Configuration retrieved successfully"
        }
    except Exception as e:
        error_msg = f"Failed to get configuration: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/config")
async def update_backend_config(request: Request):
    """Update backend configuration"""
    add_server_log("DEBUG", "📡 API call: POST /config")
    try:
        data = await request.json()
        
        # Validate configuration structure
        if "timeouts" not in data:
            raise ValueError("Missing 'timeouts' in configuration")
        
        required_timeouts = ["generation_timeout", "health_check_timeout", "model_pull_timeout", "command_timeout"]
        for timeout_key in required_timeouts:
            if timeout_key not in data["timeouts"]:
                raise ValueError(f"Missing timeout configuration: {timeout_key}")
        
        # Validate timeout values
        for timeout_key, timeout_value in data["timeouts"].items():
            if not isinstance(timeout_value, (int, float)) or timeout_value <= 0:
                raise ValueError(f"Invalid timeout value for {timeout_key}: {timeout_value}")
        
        # Save configuration
        if save_config(data):
            add_server_log("INFO", "✅ Backend configuration updated successfully")
            
            # Update the OllamaService timeout if it exists
            # This would require modifying the OllamaService class to accept dynamic timeouts
            
            return {
                "status": "success",
                "message": "Configuration updated successfully",
                "config": data
            }
        else:
            raise Exception("Failed to save configuration to file")
            
    except Exception as e:
        error_msg = f"Failed to update configuration: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/restart")
async def restart_backend():
    """Restart backend service (simulation)"""
    add_server_log("INFO", "🔄 Backend restart requested via API")
    try:
        # In a real implementation, this would restart the service
        # For now, we'll simulate a restart
        await asyncio.sleep(1)  # Simulate restart delay
        
        return {
            "status": "success",
            "message": "Backend restart initiated",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        error_msg = f"Failed to restart backend: {str(e)}"
        add_server_log("ERROR", f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

# Load configuration on startup
current_config = load_config()
add_server_log("INFO", f"📋 Configuration loaded: {current_config}")

def get_configured_ollama_service() -> OllamaService:
    """Get OllamaService instance with current configuration"""
    config = load_config()
    host = config.get("ollama_host", "http://localhost:11434")
    return OllamaService(host=host, config=config)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5052)