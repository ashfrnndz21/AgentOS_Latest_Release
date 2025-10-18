#!/usr/bin/env python3
"""
Strands Chat Orchestrator API
============================

A dedicated backend for intelligent chat routing and agent orchestration.
Supports Direct LLM, Independent Agents, and Agent Palette integration.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import uuid
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import sqlite3
import threading
from dataclasses import dataclass, asdict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
STRANDS_API_URL = "http://localhost:5004"
DATABASE_PATH = "chat_orchestrator.db"

# ============================================================================
# Data Models
# ============================================================================

@dataclass
class ChatMessage:
    id: str
    session_id: str
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: datetime
    metadata: Dict[str, Any] = None

@dataclass
class ChatSession:
    id: str
    chat_type: str  # 'direct-llm', 'independent-agent', 'palette-agent'
    config: Dict[str, Any]
    created_at: datetime
    last_activity: datetime
    status: str = 'active'

@dataclass
class AgentRoute:
    agent_id: str
    confidence: float
    reasoning: str
    tools_needed: List[str] = None

# ============================================================================
# Database Setup
# ============================================================================

def init_database():
    """Initialize SQLite database for chat sessions and messages"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Chat sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            chat_type TEXT NOT NULL,
            config TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    # Chat messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
        )
    ''')
    
    # Agent routing history
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agent_routes (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            agent_id TEXT,
            confidence REAL,
            reasoning TEXT,
            tools_used TEXT,
            execution_time REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("✅ Database initialized successfully")

# ============================================================================
# Ollama Integration
# ============================================================================

class OllamaClient:
    """Direct integration with Ollama for LLM operations"""
    
    @staticmethod
    def get_models():
        """Get available Ollama models"""
        try:
            response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=30)
            if response.status_code == 200:
                data = response.json()
                return [{"name": model["name"], "size": model["size"]} for model in data.get("models", [])]
            return []
        except Exception as e:
            logger.error(f"Failed to get Ollama models: {e}")
            return []
    
    @staticmethod
    def generate_response(model: str, messages: List[Dict], temperature: float = 0.7, max_tokens: int = 1000):
        """Generate response using Ollama"""
        try:
            # Convert messages to Ollama format
            prompt = ""
            for msg in messages:
                if msg["role"] == "system":
                    prompt += f"System: {msg['content']}\n"
                elif msg["role"] == "user":
                    prompt += f"Human: {msg['content']}\n"
                elif msg["role"] == "assistant":
                    prompt += f"Assistant: {msg['content']}\n"
            
            prompt += "Assistant: "
            
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            
            response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                return {
                    "content": data.get("response", ""),
                    "model": model,
                    "tokens_used": data.get("eval_count", 0),
                    "generation_time": data.get("total_duration", 0) / 1000000000  # Convert to seconds
                }
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Failed to generate Ollama response: {e}")
            return None

# ============================================================================
# Agent Routing Intelligence
# ============================================================================

class AgentRouter:
    """Intelligent routing system for determining which agent should handle a query"""
    
    def __init__(self):
        self.routing_model = "qwen3:1.7b"  # Use qwen3:1.7b for routing decisions
    
    def analyze_query(self, query: str, available_agents: List[Dict]) -> AgentRoute:
        """Analyze user query and determine best agent to handle it"""
        
        # Create routing prompt
        agent_descriptions = []
        for agent in available_agents:
            agent_descriptions.append(f"- {agent['name']}: {agent.get('description', '')} (Role: {agent.get('role', 'General')})")
        
        routing_prompt = f"""
You are an intelligent agent router. Analyze the user query and determine which agent is best suited to handle it.

Available Agents:
{chr(10).join(agent_descriptions)}

User Query: "{query}"

Respond with JSON in this exact format:
{{
    "agent_id": "best_agent_id_or_null",
    "confidence": 0.85,
    "reasoning": "Why this agent was chosen",
    "tools_needed": ["tool1", "tool2"]
}}

If no specific agent is needed, set agent_id to null and confidence to 0.3 or lower.
"""
        
        try:
            # Use Ollama to make routing decision
            response = OllamaClient.generate_response(
                model=self.routing_model,
                messages=[{"role": "user", "content": routing_prompt}],
                temperature=0.1,  # Low temperature for consistent routing
                max_tokens=200
            )
            
            if response and response["content"]:
                # Parse JSON response
                try:
                    routing_data = json.loads(response["content"].strip())
                    return AgentRoute(
                        agent_id=routing_data.get("agent_id"),
                        confidence=routing_data.get("confidence", 0.5),
                        reasoning=routing_data.get("reasoning", "Automatic routing"),
                        tools_needed=routing_data.get("tools_needed", [])
                    )
                except json.JSONDecodeError:
                    logger.warning("Failed to parse routing response as JSON")
            
        except Exception as e:
            logger.error(f"Agent routing failed: {e}")
        
        # Fallback: no specific routing
        return AgentRoute(
            agent_id=None,
            confidence=0.2,
            reasoning="Fallback routing - no specific agent determined",
            tools_needed=[]
        )

# ============================================================================
# Chat Orchestrator
# ============================================================================

class ChatOrchestrator:
    """Main orchestrator for handling different chat types"""
    
    def __init__(self):
        self.agent_router = AgentRouter()
        self.ollama_client = OllamaClient()
    
    def create_session(self, chat_config: Dict) -> str:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chat_sessions (id, chat_type, config)
            VALUES (?, ?, ?)
        ''', (session_id, chat_config["type"], json.dumps(chat_config)))
        
        conn.commit()
        conn.close()
        
        logger.info(f"✅ Created chat session: {session_id} (type: {chat_config['type']})")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get chat session by ID"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM chat_sessions WHERE id = ?', (session_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return ChatSession(
                id=row[0],
                chat_type=row[1],
                config=json.loads(row[2]),
                created_at=datetime.fromisoformat(row[3]),
                last_activity=datetime.fromisoformat(row[4]),
                status=row[5]
            )
        return None
    
    def process_message(self, session_id: str, user_message: str) -> Dict[str, Any]:
        """Process user message and generate appropriate response"""
        session = self.get_session(session_id)
        if not session:
            return {"error": "Session not found"}
        
        # Store user message
        message_id = str(uuid.uuid4())
        self._store_message(session_id, message_id, "user", user_message)
        
        # Process based on chat type
        if session.chat_type == "direct-llm":
            return self._handle_direct_llm(session, user_message, message_id)
        elif session.chat_type == "independent-agent":
            return self._handle_independent_agent(session, user_message, message_id)
        elif session.chat_type == "palette-agent":
            return self._handle_palette_agent(session, user_message, message_id)
        else:
            return {"error": f"Unknown chat type: {session.chat_type}"}
    
    def _handle_direct_llm(self, session: ChatSession, user_message: str, message_id: str) -> Dict[str, Any]:
        """Handle Direct LLM chat with intelligent routing"""
        config = session.config
        
        # Get conversation history
        messages = self._get_conversation_history(session.id)
        
        # Add system prompt if configured
        if config.get("systemPrompt"):
            messages.insert(0, {"role": "system", "content": config["systemPrompt"]})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Check if we should route to an agent
        available_agents = self._get_available_agents()
        if available_agents:
            routing = self.agent_router.analyze_query(user_message, available_agents)
            
            # If high confidence routing to specific agent
            if routing.agent_id and routing.confidence > 0.7:
                logger.info(f"🎯 Routing to agent {routing.agent_id} (confidence: {routing.confidence})")
                return self._execute_agent_routing(session, routing, user_message, message_id)
        
        # Generate direct LLM response
        response = self.ollama_client.generate_response(
            model=config.get("model", "qwen3:1.7b"),
            messages=messages,
            temperature=config.get("temperature", 0.7),
            max_tokens=config.get("maxTokens", 1000)
        )
        
        if response:
            # Store assistant response
            assistant_message_id = str(uuid.uuid4())
            self._store_message(session.id, assistant_message_id, "assistant", response["content"])
            
            return {
                "message_id": assistant_message_id,
                "content": response["content"],
                "type": "direct-llm",
                "model": response["model"],
                "tokens_used": response["tokens_used"],
                "generation_time": response["generation_time"]
            }
        else:
            return {"error": "Failed to generate response"}
    
    def _handle_independent_agent(self, session: ChatSession, user_message: str, message_id: str) -> Dict[str, Any]:
        """Handle Independent Chat Agent"""
        config = session.config
        
        # Build agent persona prompt
        agent_prompt = f"""You are {config.get('name', 'Assistant')}, a {config.get('role', 'helpful assistant')}.

Personality: {config.get('personality', 'Professional and helpful')}
Capabilities: {', '.join(config.get('capabilities', []))}

{config.get('systemPrompt', 'You are a helpful AI assistant.')}
"""
        
        # Get conversation history
        messages = self._get_conversation_history(session.id)
        messages.insert(0, {"role": "system", "content": agent_prompt})
        messages.append({"role": "user", "content": user_message})
        
        # Generate response with agent persona
        response = self.ollama_client.generate_response(
            model=config.get("model", "qwen3:1.7b"),
            messages=messages,
            temperature=config.get("temperature", 0.7),
            max_tokens=config.get("maxTokens", 1000)
        )
        
        if response:
            assistant_message_id = str(uuid.uuid4())
            self._store_message(session.id, assistant_message_id, "assistant", response["content"])
            
            return {
                "message_id": assistant_message_id,
                "content": response["content"],
                "type": "independent-agent",
                "agent_name": config.get('name'),
                "model": response["model"],
                "tokens_used": response["tokens_used"],
                "generation_time": response["generation_time"]
            }
        else:
            return {"error": "Failed to generate agent response"}
    
    def _handle_palette_agent(self, session: ChatSession, user_message: str, message_id: str) -> Dict[str, Any]:
        """Handle Palette Agent chat"""
        config = session.config
        agent_id = config.get("agentId")
        
        if not agent_id:
            return {"error": "No agent ID specified for palette agent chat"}
        
        # Get agent details from Strands API
        agent_details = self._get_agent_details(agent_id)
        if not agent_details:
            return {"error": f"Agent {agent_id} not found"}
        
        # Execute agent through Strands API
        try:
            strands_response = requests.post(f"{STRANDS_API_URL}/api/strands/agents/{agent_id}/execute", 
                json={"input": user_message})
            
            if strands_response.status_code == 200:
                result = strands_response.json()
                
                assistant_message_id = str(uuid.uuid4())
                self._store_message(session.id, assistant_message_id, "assistant", result.get("output", ""))
                
                return {
                    "message_id": assistant_message_id,
                    "content": result.get("output", ""),
                    "type": "palette-agent",
                    "agent_id": agent_id,
                    "agent_name": agent_details.get("name"),
                    "execution_time": result.get("execution_time", 0),
                    "tools_used": result.get("tools_used", [])
                }
            else:
                return {"error": f"Agent execution failed: {strands_response.status_code}"}
                
        except Exception as e:
            logger.error(f"Palette agent execution failed: {e}")
            return {"error": f"Agent execution error: {str(e)}"}
    
    def _execute_agent_routing(self, session: ChatSession, routing: AgentRoute, user_message: str, message_id: str) -> Dict[str, Any]:
        """Execute routed agent call"""
        # Store routing decision
        self._store_routing(session.id, message_id, routing)
        
        # Execute the routed agent
        try:
            strands_response = requests.post(f"{STRANDS_API_URL}/api/strands/agents/{routing.agent_id}/execute", 
                json={"input": user_message})
            
            if strands_response.status_code == 200:
                result = strands_response.json()
                
                assistant_message_id = str(uuid.uuid4())
                self._store_message(session.id, assistant_message_id, "assistant", result.get("output", ""))
                
                return {
                    "message_id": assistant_message_id,
                    "content": result.get("output", ""),
                    "type": "routed-agent",
                    "agent_id": routing.agent_id,
                    "routing_confidence": routing.confidence,
                    "routing_reasoning": routing.reasoning,
                    "execution_time": result.get("execution_time", 0),
                    "tools_used": result.get("tools_used", [])
                }
            else:
                # Fallback to direct LLM if agent fails
                return self._fallback_to_llm(session, user_message, message_id)
                
        except Exception as e:
            logger.error(f"Routed agent execution failed: {e}")
            return self._fallback_to_llm(session, user_message, message_id)
    
    def _fallback_to_llm(self, session: ChatSession, user_message: str, message_id: str) -> Dict[str, Any]:
        """Fallback to direct LLM when agent routing fails"""
        messages = self._get_conversation_history(session.id)
        messages.append({"role": "user", "content": user_message})
        
        response = self.ollama_client.generate_response(
            model=session.config.get("model", "qwen3:1.7b"),
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        if response:
            assistant_message_id = str(uuid.uuid4())
            self._store_message(session.id, assistant_message_id, "assistant", response["content"])
            
            return {
                "message_id": assistant_message_id,
                "content": response["content"],
                "type": "fallback-llm",
                "model": response["model"],
                "tokens_used": response["tokens_used"],
                "generation_time": response["generation_time"]
            }
        else:
            return {"error": "All response methods failed"}
    
    def _get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT role, content FROM chat_messages 
            WHERE session_id = ? AND role != 'system'
            ORDER BY timestamp DESC LIMIT ?
        ''', (session_id, limit * 2))  # *2 to account for user/assistant pairs
        
        rows = cursor.fetchall()
        conn.close()
        
        # Reverse to get chronological order
        messages = []
        for role, content in reversed(rows):
            messages.append({"role": role, "content": content})
        
        return messages
    
    def _get_available_agents(self) -> List[Dict]:
        """Get available agents from Strands API"""
        try:
            response = requests.get(f"{STRANDS_API_URL}/api/strands/agents")
            if response.status_code == 200:
                return response.json().get("agents", [])
        except Exception as e:
            logger.error(f"Failed to get available agents: {e}")
        return []
    
    def _get_agent_details(self, agent_id: str) -> Optional[Dict]:
        """Get specific agent details"""
        try:
            response = requests.get(f"{STRANDS_API_URL}/api/strands/agents/{agent_id}")
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Failed to get agent details: {e}")
        return None
    
    def _store_message(self, session_id: str, message_id: str, role: str, content: str, metadata: Dict = None):
        """Store message in database"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chat_messages (id, session_id, role, content, metadata)
            VALUES (?, ?, ?, ?, ?)
        ''', (message_id, session_id, role, content, json.dumps(metadata) if metadata else None))
        
        # Update session last activity
        cursor.execute('''
            UPDATE chat_sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ?
        ''', (session_id,))
        
        conn.commit()
        conn.close()
    
    def _store_routing(self, session_id: str, message_id: str, routing: AgentRoute):
        """Store agent routing decision"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO agent_routes (id, session_id, message_id, agent_id, confidence, reasoning, tools_used)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (str(uuid.uuid4()), session_id, message_id, routing.agent_id, 
              routing.confidence, routing.reasoning, json.dumps(routing.tools_needed)))
        
        conn.commit()
        conn.close()

# ============================================================================
# API Endpoints
# ============================================================================

# Initialize orchestrator
orchestrator = ChatOrchestrator()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Chat Orchestrator API",
        "timestamp": datetime.now().isoformat(),
        "ollama_connected": len(OllamaClient.get_models()) > 0
    })

@app.route('/api/chat/models', methods=['GET'])
def get_models():
    """Get available Ollama models"""
    models = OllamaClient.get_models()
    return jsonify({"models": models})

@app.route('/api/chat/agents', methods=['GET'])
def get_agents():
    """Get available agents from palette"""
    agents = orchestrator._get_available_agents()
    return jsonify({"agents": agents})

@app.route('/api/chat/sessions', methods=['POST'])
def create_chat_session():
    """Create new chat session"""
    try:
        config = request.json
        if not config or not config.get("type"):
            return jsonify({"error": "Chat configuration required"}), 400
        
        session_id = orchestrator.create_session(config)
        return jsonify({
            "session_id": session_id,
            "status": "created",
            "chat_type": config["type"]
        })
    except Exception as e:
        logger.error(f"Failed to create chat session: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/sessions/<session_id>/messages', methods=['POST'])
def send_message(session_id):
    """Send message to chat session"""
    try:
        data = request.json
        if not data or not data.get("message"):
            return jsonify({"error": "Message content required"}), 400
        
        result = orchestrator.process_message(session_id, data["message"])
        
        if "error" in result:
            return jsonify(result), 400
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Failed to process message: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/sessions/<session_id>/history', methods=['GET'])
def get_chat_history(session_id):
    """Get chat session history"""
    try:
        limit = request.args.get('limit', 50, type=int)
        messages = orchestrator._get_conversation_history(session_id, limit)
        
        return jsonify({
            "session_id": session_id,
            "messages": messages
        })
    except Exception as e:
        logger.error(f"Failed to get chat history: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/sessions/<session_id>', methods=['GET'])
def get_session_info(session_id):
    """Get chat session information"""
    try:
        session = orchestrator.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        return jsonify({
            "session_id": session.id,
            "chat_type": session.chat_type,
            "config": session.config,
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat(),
            "status": session.status
        })
    except Exception as e:
        logger.error(f"Failed to get session info: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/sessions', methods=['GET'])
def list_sessions():
    """List all chat sessions"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, chat_type, created_at, last_activity, status 
            FROM chat_sessions 
            ORDER BY last_activity DESC
        ''')
        
        sessions = []
        for row in cursor.fetchall():
            sessions.append({
                "session_id": row[0],
                "chat_type": row[1],
                "created_at": row[2],
                "last_activity": row[3],
                "status": row[4]
            })
        
        conn.close()
        return jsonify({"sessions": sessions})
    except Exception as e:
        logger.error(f"Failed to list sessions: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================================================
# Advanced Orchestration Endpoint (Adapted from main_system_orchestrator.py)
# ============================================================================

@app.route('/api/chat/orchestrate', methods=['POST'])
def orchestrate():
    """Advanced orchestration endpoint with comprehensive response structure"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        workflow_context = data.get('workflow_context', {})
        
        if not query:
            return jsonify({
                "status": "error",
                "error": "Query is required"
            }), 400
        
        logger.info(f"🎯 Starting advanced orchestration for query: {query}")
        
        # Step 1: Analyze query with LLM
        analysis = analyze_query_with_llm(query, session_id)
        
        # Step 2: Discover available agents
        available_agents = discover_available_agents()
        
        # Step 3: Select best agents
        selected_agents = select_agents_for_query(query, available_agents, analysis)
        
        # Step 4: Execute orchestration
        orchestration_results = execute_agent_orchestration(query, selected_agents, session_id, analysis)
        
        # Step 5: Synthesize comprehensive response
        final_response = synthesize_comprehensive_response(orchestration_results, analysis)
        
        # Step 6: Build complete response structure
        response = {
            "status": "success",
            "session_id": session_id,
            "query": query,
            "analysis": analysis,
            "agent_selection": {
                "total_available": len(available_agents),
                "selected_agents": selected_agents,
                "selection_reasoning": "LLM-driven agent discovery based on query analysis"
            },
            "orchestration_result": orchestration_results,
            "final_response": final_response,
            
            # Enhanced response fields to resolve N/A issues
            "combined_content": final_response,
            "execution_insights": {
                "total_execution_time": orchestration_results.get("total_execution_time", 0),
                "success_rate": orchestration_results.get("success_rate", 100),
                "agents_used": len(selected_agents),
                "strategy_used": analysis.get("orchestration_strategy", "sequential")
            },
            "individual_results": orchestration_results.get("agent_results", {}),
            "intelligent_summary": {
                "query_type": analysis.get("query_type", "general"),
                "complexity": analysis.get("complexity_level", "simple"),
                "pattern": analysis.get("agentic_workflow_pattern", "single_agent"),
                "confidence": analysis.get("confidence", 0.9)
            },
            "metadata": {
                "orchestrator_model": "qwen3:1.7b",
                "timestamp": datetime.now().isoformat(),
                "session_id": session_id,
                "execution_strategy": analysis.get("orchestration_strategy", "sequential")
            },
            "structured_content": {
                "query_analysis": analysis,
                "agent_selection": selected_agents,
                "execution_details": orchestration_results
            },
            "type": analysis.get("query_type", "general"),
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Orchestration completed successfully for session {session_id}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Orchestration error: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

def analyze_query_with_llm(query: str, session_id: str) -> Dict[str, Any]:
    """Analyze query using LLM to determine orchestration strategy"""
    try:
        analysis_prompt = f"""
        Analyze this user query and determine the best orchestration approach:
        
        Query: "{query}"
        
        IMPORTANT: For multi-agent workflows, use "multi_agent" pattern when the query requires:
        - Multiple distinct domains (e.g., technical data gathering + analytical insights)
        - Sequential tasks (e.g., "get data" then "analyze data" then "create policy")
        - Different specialized agents (e.g., RAN agent for network data + Churn agent for customer analysis)
        - Keywords like "and then", "also", "plus", or multiple action verbs
        
        Examples of MULTI_AGENT queries:
        - "Get weather data and write a story about it" → multi_agent (weather + creative)
        - "Analyze PRB utilization and create churn policy" → multi_agent (technical + analytical)
        - "Tell me about 5G networks and how it affects customers" → multi_agent (technical + business)
        
        Examples of SINGLE_AGENT queries:
        - "What is 5G?" → single_agent (general knowledge)
        - "Write a poem" → single_agent (creative only)
        - "Explain network protocols" → single_agent (technical only)
        
        Respond with JSON containing:
        {{
            "query_type": "technical|creative|analytical|general",
            "complexity_level": "simple|moderate|complex",
            "agentic_workflow_pattern": "single_agent|multi_agent|varying_domain",
            "orchestration_strategy": "sequential|parallel|hybrid",
            "confidence": 0.85,
            "reasoning": "Brief explanation of the analysis"
        }}
        """
        
        response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", json={
            "model": "qwen3:1.7b",
            "prompt": analysis_prompt,
            "stream": False,
            "options": {"temperature": 0.3}
        }, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            analysis_text = result.get("response", "")
            
            # Extract JSON from response
            try:
                start = analysis_text.find("{")
                end = analysis_text.rfind("}") + 1
                if start != -1 and end > start:
                    analysis = json.loads(analysis_text[start:end])
                    
                    # Override pattern detection if LLM analysis is clearly wrong
                    corrected_analysis = _correct_pattern_detection(query, analysis)
                    
                    logger.info(f"📊 Query analysis completed: {corrected_analysis.get('query_type')} - {corrected_analysis.get('complexity_level')} - {corrected_analysis.get('agentic_workflow_pattern')}")
                    return corrected_analysis
            except json.JSONDecodeError:
                pass
        
        # Fallback analysis
        return {
            "query_type": "general",
            "complexity_level": "simple",
            "agentic_workflow_pattern": "single_agent",
            "orchestration_strategy": "sequential",
            "confidence": 0.7,
            "reasoning": "Fallback analysis due to LLM error"
        }
        
    except Exception as e:
        logger.error(f"Error in query analysis: {e}")
        return {
            "query_type": "general",
            "complexity_level": "simple",
            "agentic_workflow_pattern": "single_agent",
            "orchestration_strategy": "sequential",
            "confidence": 0.5,
            "reasoning": f"Error in analysis: {str(e)}"
        }

def _correct_pattern_detection(query: str, analysis: Dict) -> Dict:
    """Correct pattern detection if LLM analysis is clearly wrong"""
    query_lower = query.lower()
    
    # Multi-agent pattern indicators
    multi_agent_keywords = [
        "and then", "also", "plus", "additionally", "furthermore",
        "both", "together", "combine", "integrate", "correlate"
    ]
    
    # Domain-specific multi-agent patterns
    telco_multi_patterns = [
        ("prb", "churn"), ("network", "customer"), ("5g", "policy"), 
        ("ran", "retention"), ("throughput", "analysis"), ("performance", "strategy")
    ]
    
    weather_creative_patterns = [
        ("weather", "story"), ("weather", "poem"), ("temperature", "creative"),
        ("forecast", "write"), ("climate", "narrative")
    ]
    
    current_pattern = analysis.get("agentic_workflow_pattern", "single_agent")
    
    # Check for obvious multi-agent indicators
    if current_pattern == "single_agent":
        # Check for sequential keywords
        if any(keyword in query_lower for keyword in multi_agent_keywords):
            logger.info(f"🔧 Correcting pattern: sequential keywords detected")
            analysis["agentic_workflow_pattern"] = "multi_agent"
            analysis["orchestration_strategy"] = "sequential"
            analysis["reasoning"] += " [Corrected: Sequential keywords detected]"
        
        # Check for telco multi-domain patterns
        elif any((pattern1 in query_lower and pattern2 in query_lower) for pattern1, pattern2 in telco_multi_patterns):
            logger.info(f"🔧 Correcting pattern: telco multi-domain detected")
            analysis["agentic_workflow_pattern"] = "multi_agent"
            analysis["orchestration_strategy"] = "sequential"
            analysis["reasoning"] += " [Corrected: Telco multi-domain pattern detected]"
        
        # Check for weather + creative patterns
        elif any((pattern1 in query_lower and pattern2 in query_lower) for pattern1, pattern2 in weather_creative_patterns):
            logger.info(f"🔧 Correcting pattern: weather + creative detected")
            analysis["agentic_workflow_pattern"] = "multi_agent"
            analysis["orchestration_strategy"] = "sequential"
            analysis["reasoning"] += " [Corrected: Weather + creative pattern detected]"
    
    return analysis

def discover_available_agents() -> List[Dict]:
    """Discover available agents for orchestration"""
    try:
        # Try to get agents from A2A service
        a2a_response = requests.get("http://localhost:5008/api/a2a/agents", timeout=5)
        if a2a_response.status_code == 200:
            a2a_data = a2a_response.json()
            agents = a2a_data.get("agents", [])
            logger.info(f"🔍 Discovered {len(agents)} A2A agents")
            return agents
        
        # Fallback to default agents
        return [
            {
                "id": "weather-agent",
                "name": "Weather Agent",
                "capabilities": ["weather", "general"],
                "description": "Retrieves weather information",
                "port": 5026
            },
            {
                "id": "creative-assistant",
                "name": "Creative Assistant", 
                "capabilities": ["creative", "general"],
                "description": "Generates creative content",
                "port": 5027
            }
        ]
    except Exception as e:
        logger.error(f"Error discovering agents: {e}")
        return []

def select_agents_for_query(query: str, available_agents: List[Dict], analysis: Dict) -> List[Dict]:
    """Select best agents for the query using intelligent domain-specific matching"""
    try:
        logger.info(f"🎯 Starting intelligent agent selection for query: {query}")
        logger.info(f"🎯 Available agents: {[agent.get('name', 'unknown') for agent in available_agents]}")
        logger.info(f"🎯 Query analysis: {analysis}")
        
        # Check if this should be a multi-agent workflow
        workflow_pattern = analysis.get("agentic_workflow_pattern", "single_agent")
        query_type = analysis.get("query_type", "general")
        
        selected = []
        used_agents = set()
        
        # For multi-agent workflows, use intelligent task decomposition
        if workflow_pattern == "multi_agent" or workflow_pattern == "varying_domain":
            logger.info(f"🎯 Multi-agent workflow detected - using intelligent task decomposition")
            
            # Generate workflow steps from query analysis
            workflow_steps = _generate_workflow_steps(query, analysis)
            logger.info(f"🎯 Generated workflow steps: {workflow_steps}")
            
            # Match each workflow step to the best agent
            for i, step in enumerate(workflow_steps):
                best_agent = _find_best_agent_for_task(step, available_agents, used_agents)
                
                if best_agent:
                    selected.append(best_agent)
                    used_agents.add(best_agent.get("id", best_agent.get("name", "")))
                    logger.info(f"🎯 Assigned task {i+1}: '{step}' → {best_agent.get('name', 'unknown')}")
                else:
                    logger.warning(f"⚠️ No suitable agent found for task: {step}")
        
        # For single-agent workflows, use domain-specific matching
        else:
            logger.info(f"🎯 Single-agent workflow detected - using domain-specific matching")
            
            # Calculate relevance scores for each agent
            agent_scores = []
            for agent in available_agents:
                relevance = _calculate_agent_relevance(query, agent)
                if relevance > 0.3:  # Only consider agents with reasonable relevance
                    agent_scores.append((agent, relevance))
                    logger.info(f"🎯 Agent {agent.get('name', 'unknown')} relevance: {relevance:.2f}")
            
            # Sort by relevance and select the best one
            if agent_scores:
                agent_scores.sort(key=lambda x: x[1], reverse=True)
                selected.append(agent_scores[0][0])
                logger.info(f"🎯 Selected single agent: {agent_scores[0][0].get('name', 'unknown')} (relevance: {agent_scores[0][1]:.2f})")
        
        # Fallback: if no agents selected, pick the first available one
        if not selected and available_agents:
            selected.append(available_agents[0])
            logger.info(f"🎯 Fallback: selected first available agent: {available_agents[0].get('name', 'unknown')}")
        
        logger.info(f"🎯 Final selection: {len(selected)} agents selected")
        for agent in selected:
            logger.info(f"  - {agent.get('name', 'unknown')} (ID: {agent.get('id', 'unknown')})")
        
        return selected
        
    except Exception as e:
        logger.error(f"Error selecting agents: {e}")
        return []

def _generate_workflow_steps(query: str, analysis: Dict) -> List[str]:
    """Generate workflow steps from query analysis"""
    query_lower = query.lower()
    steps = []
    
    # Telco domain workflow patterns
    if any(keyword in query_lower for keyword in ["prb", "resource block", "5g", "ran", "network"]):
        if any(keyword in query_lower for keyword in ["churn", "policy", "strategy", "retention"]):
            steps.extend([
                "Gather and analyze 4G/5G PRB utilization data and network performance metrics",
                "Analyze correlation between network performance and customer churn patterns",
                "Develop comprehensive churn mitigation policy and retention strategy"
            ])
        else:
            steps.append("Analyze 4G/5G PRB utilization and network performance requirements")
    
    # Weather + Creative workflow patterns
    elif any(keyword in query_lower for keyword in ["weather", "temperature", "forecast"]) and any(keyword in query_lower for keyword in ["story", "poem", "creative", "funny"]):
        steps.extend([
            "Retrieve current weather data and forecast information",
            "Generate creative content (story, poem, or humorous narrative) based on weather data"
        ])
    
    # General multi-domain patterns
    elif analysis.get("query_type") == "technical" and any(keyword in query_lower for keyword in ["analysis", "strategy", "policy"]):
        steps.extend([
            "Perform technical analysis and data gathering",
            "Develop strategic recommendations and policy framework"
        ])
    
    # Default single step
    if not steps:
        steps.append(query)
    
    return steps

def _find_best_agent_for_task(task: str, available_agents: List[Dict], used_agents: set) -> Optional[Dict]:
    """Find the best agent for a specific task using intelligent matching"""
    best_agent = None
    best_score = 0
    
    task_lower = task.lower()
    
    for agent in available_agents:
        agent_name = agent.get("name", "").lower()
        agent_id = agent.get("id", "")
        
        # Skip if agent already used
        if agent_id in used_agents or agent_name in used_agents:
            continue
        
        # Calculate task-specific relevance
        task_relevance = 0
        
        # Domain-specific keyword matching (same patterns as Main System Orchestrator)
        if 'ran' in agent_name or '5g' in agent_name or 'network' in agent_name:
            if any(keyword in task_lower for keyword in ['prb', 'resource block', 'network', 'throughput', 'capacity', 'data', 'performance']):
                task_relevance += 0.4
        
        if 'churn' in agent_name or 'management' in agent_name:
            if any(keyword in task_lower for keyword in ['churn', 'policy', 'strategy', 'analysis', 'customer', 'retention', 'mitigation']):
                task_relevance += 0.4
        
        if 'weather' in agent_name:
            if any(keyword in task_lower for keyword in ['weather', 'climate', 'forecast', 'temperature', 'rain']):
                task_relevance += 0.4
        
        if 'creative' in agent_name:
            if any(keyword in task_lower for keyword in ['creative', 'story', 'poem', 'content', 'writing', 'narrative', 'humorous']):
                task_relevance += 0.4
        
        # Technical/analytical matching
        if 'technical' in agent_name or 'expert' in agent_name:
            if any(keyword in task_lower for keyword in ['technical', 'analysis', 'data', 'metrics', 'performance']):
                task_relevance += 0.3
        
        # Policy/strategy matching
        if 'policy' in agent_name or 'strategy' in agent_name:
            if any(keyword in task_lower for keyword in ['policy', 'strategy', 'recommendation', 'framework']):
                task_relevance += 0.3
        
        if task_relevance > best_score:
            best_score = task_relevance
            best_agent = agent
    
    logger.info(f"🎯 Best agent for task '{task}': {best_agent.get('name', 'none') if best_agent else 'none'} (score: {best_score:.2f})")
    return best_agent

def _calculate_agent_relevance(query: str, agent: Dict) -> float:
    """Calculate relevance score for single-agent selection"""
    query_lower = query.lower()
    agent_name = agent.get("name", "").lower()
    capabilities = agent.get("capabilities", [])
    
    relevance = 0
    
    # Domain-specific matching
    if 'ran' in agent_name or '5g' in agent_name:
        if any(keyword in query_lower for keyword in ['prb', '5g', 'ran', 'network', 'resource block']):
            relevance += 0.4
    
    if 'churn' in agent_name:
        if any(keyword in query_lower for keyword in ['churn', 'retention', 'customer', 'policy']):
            relevance += 0.4
    
    if 'weather' in agent_name:
        if any(keyword in query_lower for keyword in ['weather', 'temperature', 'forecast']):
            relevance += 0.4
    
    if 'creative' in agent_name:
        if any(keyword in query_lower for keyword in ['creative', 'story', 'poem', 'write']):
            relevance += 0.4
    
    # Capability-based matching
    for capability in capabilities:
        if capability.lower() in query_lower:
            relevance += 0.2
    
    return relevance

def execute_agent_orchestration(query: str, selected_agents: List[Dict], session_id: str, analysis: Dict) -> Dict[str, Any]:
    """Execute orchestration with selected agents using intelligent sequential execution"""
    try:
        start_time = time.time()
        agent_results = {}
        successful_agents = 0
        accumulated_context = ""
        
        # Determine execution strategy
        strategy = analysis.get("orchestration_strategy", "sequential")
        workflow_pattern = analysis.get("agentic_workflow_pattern", "single_agent")
        
        logger.info(f"🎯 Executing orchestration with strategy: {strategy}, pattern: {workflow_pattern}")
        logger.info(f"🎯 Selected agents: {[agent.get('name', 'unknown') for agent in selected_agents]}")
        
        # Sequential execution with context passing (for multi-agent workflows)
        if len(selected_agents) > 1 and strategy in ["sequential", "hybrid"]:
            logger.info(f"🎯 Using sequential execution with context passing")
            
            for i, agent in enumerate(selected_agents):
                try:
                    agent_start = time.time()
                    
                    # Build context-aware query for this agent
                    if i == 0:
                        # First agent gets original query
                        agent_query = query
                        context_info = "You are the first agent in this multi-agent workflow. Focus on your specific domain expertise."
                    else:
                        # Subsequent agents get context from previous agents
                        context_info = f"Previous agent output: {accumulated_context}\n\nBased on the above context, please continue with your specific domain expertise."
                        agent_query = f"Context from previous agents:\n{accumulated_context}\n\nOriginal query: {query}\n\nPlease provide your analysis based on the context above."
                    
                    logger.info(f"🎯 Agent {i+1}/{len(selected_agents)}: {agent.get('name', 'unknown')}")
                    logger.info(f"🎯 Context length: {len(context_info)} characters")
                    
                    # Call agent with context-aware query
                    agent_response = call_agent_direct(agent, agent_query, session_id)
                    
                    agent_end = time.time()
                    execution_time = agent_end - agent_start
                    
                    # Clean the agent response
                    cleaned_response = clean_agent_response(agent_response)
                    
                    # Accumulate context for next agent
                    accumulated_context += f"\n\n--- {agent.get('name', 'Agent')} Analysis ---\n{cleaned_response}"
                    
                    agent_results[agent.get("id", agent.get("name", ""))] = {
                        "agent_name": agent.get("name", "Unknown"),
                        "response": cleaned_response,
                        "execution_time": execution_time,
                        "success": True,
                        "tokens_used": len(cleaned_response.split()) * 1.3,
                        "confidence": 0.9,
                        "agent_order": i + 1,
                        "context_provided": len(context_info) if i > 0 else 0
                    }
                    
                    successful_agents += 1
                    logger.info(f"✅ Agent {agent.get('name', 'unknown')} completed in {execution_time:.2f}s (order: {i+1})")
                    
                except Exception as e:
                    logger.error(f"❌ Agent {agent.get('name', 'unknown')} failed: {e}")
                    agent_results[agent.get("id", agent.get("name", ""))] = {
                        "agent_name": agent.get("name", "Unknown"),
                        "response": f"Error: {str(e)}",
                        "execution_time": 0,
                        "success": False,
                        "tokens_used": 0,
                        "confidence": 0.0,
                        "agent_order": i + 1,
                        "context_provided": 0
                    }
        
        # Parallel execution (for single-agent or parallel strategy)
        else:
            logger.info(f"🎯 Using parallel execution")
            
            for agent in selected_agents:
                try:
                    agent_start = time.time()
                    
                    # Call agent via A2A or direct API
                    agent_response = call_agent_direct(agent, query, session_id)
                    
                    agent_end = time.time()
                    execution_time = agent_end - agent_start
                    
                    # Clean the agent response before storing
                    cleaned_response = clean_agent_response(agent_response)
                    
                    agent_results[agent.get("id", agent.get("name", ""))] = {
                        "agent_name": agent.get("name", "Unknown"),
                        "response": cleaned_response,
                        "execution_time": execution_time,
                        "success": True,
                        "tokens_used": len(cleaned_response.split()) * 1.3,
                        "confidence": 0.9,
                        "agent_order": 1,
                        "context_provided": 0
                    }
                    
                    successful_agents += 1
                    logger.info(f"✅ Agent {agent.get('name', 'unknown')} completed in {execution_time:.2f}s")
                    
                except Exception as e:
                    logger.error(f"❌ Agent {agent.get('name', 'unknown')} failed: {e}")
                    agent_results[agent.get("id", agent.get("name", ""))] = {
                        "agent_name": agent.get("name", "Unknown"),
                        "response": f"Error: {str(e)}",
                        "execution_time": 0,
                        "success": False,
                        "tokens_used": 0,
                        "confidence": 0.0,
                        "agent_order": 1,
                        "context_provided": 0
                    }
        
        total_time = time.time() - start_time
        success_rate = (successful_agents / len(selected_agents)) * 100 if selected_agents else 0
        
        logger.info(f"🎯 Orchestration completed: {successful_agents}/{len(selected_agents)} agents successful in {total_time:.2f}s")
        
        return {
            "total_execution_time": total_time,
            "success_rate": success_rate,
            "agents_coordinated": len(selected_agents),
            "agent_results": agent_results,
            "orchestration_type": "advanced_chat_orchestrator",
            "execution_strategy": strategy,
            "context_accumulated": len(accumulated_context) > 0,
            "final_context": accumulated_context[:500] + "..." if len(accumulated_context) > 500 else accumulated_context
        }
        
    except Exception as e:
        logger.error(f"Error in orchestration execution: {e}")
        return {
            "total_execution_time": 0,
            "success_rate": 0,
            "agents_coordinated": 0,
            "agent_results": {},
            "orchestration_type": "advanced_chat_orchestrator",
            "error": str(e)
        }

def call_agent_direct(agent: Dict, query: str, session_id: str) -> str:
    """Call agent directly via Strands SDK or dedicated Ollama backend"""
    try:
        agent_id = agent.get("id")
        agent_name = agent.get("name", "Unknown Agent")
        dedicated_backend = agent.get("dedicated_ollama_backend", {})
        strands_agent_id = agent.get("strands_agent_id")
        
        logger.info(f"🔍 Calling agent: {agent_name} (ID: {agent_id})")
        
        # Method 1: Try Strands SDK if agent has strands_agent_id
        if strands_agent_id:
            try:
                logger.info(f"📡 Using Strands SDK for agent {agent_name}")
                response = requests.post(
                    f"http://localhost:5006/api/strands-sdk/agents/{strands_agent_id}/execute",
                    json={
                        "input": query,
                        "session_id": session_id,
                        "stream": False
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    agent_response = result.get("response", result.get("output", ""))
                    logger.info(f"✅ Strands SDK response received from {agent_name}")
                    return agent_response
            except Exception as sdk_error:
                logger.warning(f"Strands SDK call failed for {agent_name}: {sdk_error}")
        
        # Method 2: Try dedicated Ollama backend if available
        if dedicated_backend and dedicated_backend.get('status') == 'running':
            try:
                ollama_url = dedicated_backend.get('host', 'http://localhost:11434')
                model = dedicated_backend.get('model', 'qwen3:1.7b')
                
                logger.info(f"📡 Using dedicated Ollama backend for {agent_name}: {ollama_url} with model {model}")
                
                # Prepare the prompt with agent context
                agent_capabilities = ', '.join(agent.get('capabilities', ['general']))
                prompt = f"""You are {agent_name}, a specialized AI agent with capabilities in: {agent_capabilities}.

User Query: {query}

Please provide a helpful, accurate response based on your specialized capabilities."""
                
                response = requests.post(
                    f"{ollama_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "num_predict": 500
                        }
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    agent_response = result.get("response", "")
                    logger.info(f"✅ Dedicated Ollama response received from {agent_name}")
                    return agent_response
            except Exception as ollama_error:
                logger.warning(f"Dedicated Ollama call failed for {agent_name}: {ollama_error}")
        
        # Method 3: Fallback to main Ollama instance
        logger.info(f"📡 Using fallback Ollama for {agent_name}")
        agent_capabilities = ', '.join(agent.get('capabilities', ['general']))
        model = agent.get('model', 'qwen3:1.7b')
        
        prompt = f"""You are {agent_name}, a specialized AI agent with capabilities in: {agent_capabilities}.

User Query: {query}

Please provide a helpful, accurate response based on your specialized capabilities."""
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 500
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            agent_response = result.get("response", "")
            logger.info(f"✅ Fallback Ollama response received from {agent_name}")
            return agent_response
        else:
            return f"Agent {agent_name} responded with status {response.status_code}"
        
    except Exception as e:
        logger.error(f"Error calling agent {agent.get('name', 'Unknown')}: {e}")
        return f"Error calling agent {agent.get('name', 'Unknown')}: {str(e)}"

def synthesize_comprehensive_response(orchestration_results: Dict, analysis: Dict) -> str:
    """Synthesize comprehensive response from orchestration results"""
    try:
        agent_results = orchestration_results.get("agent_results", {})
        
        if not agent_results:
            return "No agents were able to process the query successfully."
        
        # Build comprehensive response
        response_parts = []
        
        for agent_id, result in agent_results.items():
            if result.get("success"):
                # Clean the response: remove <think> tags and other artifacts
                cleaned_response = clean_agent_response(result['response'])
                response_parts.append(f"**{result['agent_name']}:** {cleaned_response}")
        
        if response_parts:
            return "\n\n".join(response_parts)
        else:
            return "All agents encountered errors while processing the query."
        
    except Exception as e:
        logger.error(f"Error synthesizing response: {e}")
        return "Error occurred while synthesizing the final response."

def clean_agent_response(response: str) -> str:
    """Clean agent response by removing think tags and other artifacts"""
    import re
    
    # Remove <think>...</think> blocks (including multiline)
    response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove any remaining XML-style tags
    response = re.sub(r'<[^>]+>', '', response)
    
    # Remove excessive whitespace
    response = re.sub(r'\n\s*\n\s*\n+', '\n\n', response)
    
    # Remove leading/trailing whitespace
    response = response.strip()
    
    # Remove repeated words (like *so* *so* *so*...)
    response = re.sub(r'(\*\w+\*\s*){5,}', '...', response)
    
    return response

# ============================================================================
# Startup
# ============================================================================

if __name__ == '__main__':
    print("🚀 Starting Strands Chat Orchestrator API...")
    print("=" * 50)
    print("🎯 Features:")
    print("   • Direct LLM Chat with intelligent routing")
    print("   • Independent Chat Agents with personas")
    print("   • Agent Palette integration")
    print("   • Conversation history and context")
    print("   • Intelligent agent routing")
    print("   • Tool integration support")
    print("")
    print("🔗 Endpoints:")
    print("   • Health: http://localhost:5005/health")
    print("   • Models: http://localhost:5005/api/chat/models")
    print("   • Agents: http://localhost:5005/api/chat/agents")
    print("   • Sessions: http://localhost:5005/api/chat/sessions")
    print("   • Orchestrate: http://localhost:5005/api/chat/orchestrate")
    print("")
    print("🔧 Dependencies:")
    print("   • Ollama: http://localhost:11434")
    print("   • Strands API: http://localhost:5004")
    print("")
    
    # Initialize database
    init_database()
    
    print("✅ Chat Orchestrator API ready!")
    print("🌐 Server starting on port 5005...")
    
    app.run(host='0.0.0.0', port=5005, debug=True)