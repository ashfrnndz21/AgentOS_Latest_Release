#!/usr/bin/env python3
"""
Stateless Orchestration API
- Session-based processing with automatic cleanup
- On-demand model loading
- Memory-efficient agent execution
- No persistent state
"""

import os
import sys
import json
import uuid
import time
import logging
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from contextlib import contextmanager

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import requests
import psutil
import gc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
WORKING_MODEL = "llama3.2:1b"  # Fast, reliable model
SESSION_TIMEOUT = 300  # 5 minutes
MEMORY_THRESHOLD = 80  # 80% memory usage threshold

app = Flask(__name__)
app.config['SECRET_KEY'] = 'stateless_orchestration_secret'
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=1024*1024)

@dataclass
class SessionContext:
    """Session context for stateless processing"""
    session_id: str
    created_at: datetime
    query: str
    selected_agent: Optional[Dict] = None
    execution_result: Optional[Dict] = None
    status: str = "active"
    memory_usage: float = 0.0

class SessionManager:
    """Manages stateless sessions with automatic cleanup"""
    
    def __init__(self):
        self.active_sessions: Dict[str, SessionContext] = {}
        self.cleanup_thread = threading.Thread(target=self._cleanup_worker, daemon=True)
        self.cleanup_thread.start()
        logger.info("SessionManager initialized with automatic cleanup")
    
    def create_session(self, query: str) -> SessionContext:
        """Create a new stateless session"""
        session_id = str(uuid.uuid4())
        session = SessionContext(
            session_id=session_id,
            created_at=datetime.now(),
            query=query
        )
        self.active_sessions[session_id] = session
        logger.info(f"Created session {session_id} for query: {query[:50]}...")
        return session
    
    def get_session(self, session_id: str) -> Optional[SessionContext]:
        """Get session by ID"""
        return self.active_sessions.get(session_id)
    
    def update_session(self, session_id: str, **kwargs) -> bool:
        """Update session data"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            for key, value in kwargs.items():
                if hasattr(session, key):
                    setattr(session, key, value)
            return True
        return False
    
    def cleanup_session(self, session_id: str) -> bool:
        """Cleanup session and release resources"""
        if session_id in self.active_sessions:
            session = self.active_sessions.pop(session_id)
            logger.info(f"Cleaned up session {session_id}")
            
            # Force garbage collection
            gc.collect()
            
            # Log memory usage
            memory_usage = psutil.virtual_memory().percent
            logger.info(f"Memory usage after cleanup: {memory_usage}%")
            
            return True
        return False
    
    def _cleanup_worker(self):
        """Background worker for automatic session cleanup"""
        while True:
            try:
                current_time = datetime.now()
                expired_sessions = []
                
                for session_id, session in self.active_sessions.items():
                    if current_time - session.created_at > timedelta(seconds=SESSION_TIMEOUT):
                        expired_sessions.append(session_id)
                
                for session_id in expired_sessions:
                    logger.warning(f"Cleaning up expired session {session_id}")
                    self.cleanup_session(session_id)
                
                # Check memory usage
                memory_usage = psutil.virtual_memory().percent
                if memory_usage > MEMORY_THRESHOLD:
                    logger.warning(f"High memory usage: {memory_usage}%")
                    # Force cleanup of oldest sessions
                    if self.active_sessions:
                        oldest_session = min(self.active_sessions.items(), 
                                           key=lambda x: x[1].created_at)
                        self.cleanup_session(oldest_session[0])
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Cleanup worker error: {e}")
                time.sleep(60)

class ModelManager:
    """Manages model lifecycle with on-demand loading"""
    
    def __init__(self):
        self.loaded_models: Dict[str, bool] = {}
        self.model_health: Dict[str, bool] = {}
    
    def check_model_health(self, model_name: str) -> bool:
        """Check if model is healthy and responsive"""
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": model_name,
                    "prompt": "test",
                    "stream": False
                },
                timeout=5
            )
            is_healthy = response.status_code == 200
            self.model_health[model_name] = is_healthy
            
            if is_healthy:
                logger.info(f"Model {model_name} is healthy")
            else:
                logger.warning(f"Model {model_name} is unhealthy")
            
            return is_healthy
        except Exception as e:
            logger.error(f"Model health check failed for {model_name}: {e}")
            self.model_health[model_name] = False
            return False
    
    def ensure_model_loaded(self, model_name: str) -> bool:
        """Ensure model is loaded and healthy"""
        if not self.check_model_health(model_name):
            return False
        
        self.loaded_models[model_name] = True
        return True
    
    def unload_model(self, model_name: str):
        """Unload model to free memory"""
        try:
            # Note: Ollama doesn't have explicit unload, but we track state
            self.loaded_models[model_name] = False
            logger.info(f"Marked model {model_name} as unloaded")
        except Exception as e:
            logger.error(f"Failed to unload model {model_name}: {e}")

class StatelessOrchestrator:
    """Stateless orchestration engine"""
    
    def __init__(self):
        self.session_manager = SessionManager()
        self.model_manager = ModelManager()
        logger.info("StatelessOrchestrator initialized")
    
    def analyze_query(self, query: str, available_agents: List[Dict]) -> Dict:
        """Analyze query using rule-based approach (no LLM dependency)"""
        query_lower = query.lower()
        
        # Rule-based analysis
        if any(word in query_lower for word in ['health', 'medical', 'doctor', 'sick', 'ill', 'pain', 'medicine', 'symptoms', 'feeling', 'well', 'unwell']):
            query_type = "health"
            best_agent = self._find_best_agent(available_agents, ['health', 'medical', 'doctor'])
        elif any(word in query_lower for word in ['write', 'poem', 'story', 'creative', 'imagine', 'describe']):
            query_type = "creative"
            best_agent = self._find_best_agent(available_agents, ['creative', 'writing', 'storytelling'])
        elif any(word in query_lower for word in ['weather', 'rain', 'sunny', 'cloudy', 'temperature', 'forecast']):
            query_type = "weather"
            best_agent = self._find_best_agent(available_agents, ['weather', 'climate', 'meteorology'])
        elif any(word in query_lower for word in ['code', 'debug', 'program', 'function', 'algorithm', 'technical']):
            query_type = "technical"
            best_agent = self._find_best_agent(available_agents, ['technical', 'programming', 'coding'])
        else:
            query_type = "general"
            best_agent = available_agents[0] if available_agents else None
        
        return {
            "query_type": query_type,
            "selected_agent": best_agent,
            "reasoning": f"Rule-based analysis: identified {query_type} intent"
        }
    
    def _find_best_agent(self, agents: List[Dict], keywords: List[str]) -> Optional[Dict]:
        """Find best matching agent based on keywords"""
        best_agent = None
        best_score = 0
        
        for agent in agents:
            score = 0
            agent_name = agent.get('name', '').lower()
            agent_desc = agent.get('description', '').lower()
            
            for keyword in keywords:
                if keyword in agent_name:
                    score += 10
                if keyword in agent_desc:
                    score += 5
            
            if score > best_score:
                best_score = score
                best_agent = agent
        
        return best_agent if best_score > 0 else (agents[0] if agents else None)
    
    def execute_agent_query(self, agent_id: str, query: str, session_id: str) -> Dict:
        """Execute query with agent (stateless)"""
        try:
            # Ensure working model is loaded
            if not self.model_manager.ensure_model_loaded(WORKING_MODEL):
                return {
                    "success": False,
                    "error": "Model not available",
                    "execution_time": 0
                }
            
            # Execute query via Strands SDK
            start_time = time.time()
            response = requests.post(
                f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute",
                json={"input_text": query},
                timeout=60  # Shorter timeout for stateless execution
            )
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "result": result,
                    "execution_time": execution_time
                }
            else:
                return {
                    "success": False,
                    "error": f"Agent execution failed: {response.status_code}",
                    "execution_time": execution_time
                }
        
        except Exception as e:
            logger.error(f"Agent execution error: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": 0
            }
        finally:
            # Unload model to free memory
            self.model_manager.unload_model(WORKING_MODEL)
    
    def process_query(self, query: str) -> Dict:
        """Process query in stateless manner"""
        session = self.session_manager.create_session(query)
        
        try:
            # Get available agents
            agents_response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=5)
            if agents_response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to get available agents",
                    "session_id": session.session_id
                }
            
            a2a_agents = agents_response.json().get('agents', [])
            
            # Get Strands SDK agents
            sdk_response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=5)
            if sdk_response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to get SDK agents",
                    "session_id": session.session_id
                }
            
            sdk_agents = sdk_response.json().get('agents', [])
            
            # Match agents
            available_agents = []
            for a2a_agent in a2a_agents:
                a2a_name = a2a_agent.get('name')
                for sdk_agent in sdk_agents:
                    if sdk_agent.get('name') == a2a_name:
                        available_agents.append({
                            'id': sdk_agent['id'],
                            'name': sdk_agent['name'],
                            'description': sdk_agent.get('description', ''),
                            'capabilities': sdk_agent.get('tools', [])
                        })
                        break
            
            if not available_agents:
                return {
                    "success": False,
                    "error": "No agents available",
                    "session_id": session.session_id
                }
            
            # Analyze query
            analysis = self.analyze_query(query, available_agents)
            selected_agent = analysis['selected_agent']
            
            if not selected_agent:
                return {
                    "success": False,
                    "error": "No suitable agent found",
                    "session_id": session.session_id
                }
            
            # Update session
            self.session_manager.update_session(
                session.session_id,
                selected_agent=selected_agent
            )
            
            # Execute query
            execution_result = self.execute_agent_query(
                selected_agent['id'],
                query,
                session.session_id
            )
            
            # Update session with result
            self.session_manager.update_session(
                session.session_id,
                execution_result=execution_result,
                status="completed"
            )
            
            return {
                "success": execution_result['success'],
                "session_id": session.session_id,
                "selected_agent": selected_agent['name'],
                "query_type": analysis['query_type'],
                "execution_time": execution_result['execution_time'],
                "result": execution_result.get('result', {}),
                "error": execution_result.get('error')
            }
        
        except Exception as e:
            logger.error(f"Query processing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "session_id": session.session_id
            }
        
        finally:
            # Always cleanup session
            time.sleep(1)  # Brief delay to ensure response is sent
            self.session_manager.cleanup_session(session.session_id)

# Initialize orchestrator
orchestrator = StatelessOrchestrator()

@app.route('/api/stateless-orchestration/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    memory_usage = psutil.virtual_memory().percent
    active_sessions = len(orchestrator.session_manager.active_sessions)
    
    return jsonify({
        "status": "healthy",
        "memory_usage": f"{memory_usage}%",
        "active_sessions": active_sessions,
        "model_health": orchestrator.model_manager.model_health,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/stateless-orchestration/query', methods=['POST'])
def process_query():
    """Process query in stateless manner"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Processing stateless query: {query[:50]}...")
        
        result = orchestrator.process_query(query)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Query endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/stateless-orchestration/sessions', methods=['GET'])
def get_sessions():
    """Get active sessions info"""
    sessions_info = []
    for session_id, session in orchestrator.session_manager.active_sessions.items():
        sessions_info.append({
            "session_id": session_id,
            "created_at": session.created_at.isoformat(),
            "query": session.query[:50] + "..." if len(session.query) > 50 else session.query,
            "status": session.status,
            "duration": (datetime.now() - session.created_at).total_seconds()
        })
    
    return jsonify({
        "active_sessions": len(sessions_info),
        "sessions": sessions_info
    })

@app.route('/api/stateless-orchestration/sessions/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Manually cleanup a session"""
    if orchestrator.session_manager.cleanup_session(session_id):
        return jsonify({"success": True, "message": f"Session {session_id} cleaned up"})
    else:
        return jsonify({"success": False, "error": "Session not found"}), 404

if __name__ == '__main__':
    logger.info("🚀 Starting Stateless Orchestration API...")
    logger.info("📍 Port: 5013")
    logger.info("🧠 Memory-efficient, stateless processing")
    logger.info("🔄 Automatic session cleanup enabled")
    logger.info("⚡ On-demand model loading")
    
    app.run(host='0.0.0.0', port=5013, debug=False)
