#!/usr/bin/env python3
"""
Debug version of Simple Orchestration API
Simplified version to test frontend integration
"""

import json
import requests
import logging
import time
from datetime import datetime
from typing import Dict, List, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"

app = Flask(__name__)
CORS(app)

class DebugOrchestrator:
    """Debug orchestrator - simplified version"""
    
    def __init__(self):
        self.active_sessions = {}
        logger.info("Debug Orchestrator initialized")
    
    def create_session(self, query: str) -> Dict:
        """Create a new session"""
        session_id = f"debug_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        session = {
            'session_id': session_id,
            'query': query,
            'created_at': datetime.now(),
            'status': 'active'
        }
        self.active_sessions[session_id] = session
        logger.info(f"Created debug session {session_id} for query: {query[:50]}...")
        return session
    
    def process_query(self, query: str, contextual_analysis: Dict = None) -> Dict:
        """Process query through simplified orchestration"""
        session = self.create_session(query)
        
        try:
            logger.info(f"[{session['session_id']}] Processing debug query: {query[:50]}...")
            
            # Simulate processing time
            time.sleep(2)
            
            # Create a simplified response
            result = {
                "success": True,
                "session_id": session['session_id'],
                "error": None,
                "execution_details": {
                    "execution_time": 2.0,
                    "step_1": "Debug contextual analysis",
                    "step_2": "Debug agent analysis", 
                    "step_3": "Debug agent selection",
                    "step_4": "Debug A2A execution",
                    "steps_completed": 4,
                    "success": True
                },
                "orchestrator_reasoning": "Debug mode: Simplified processing for frontend testing",
                "streamlined_analysis": contextual_analysis or {
                    "success": True,
                    "user_intent": "Debug test query",
                    "domain_analysis": {
                        "primary_domain": "Debug",
                        "secondary_domains": ["Testing"],
                        "technical_level": "beginner"
                    },
                    "orchestration_pattern": "sequential",
                    "timestamp": datetime.now().isoformat()
                },
                "agent_registry_analysis": {
                    "success": True,
                    "agent_analysis": [
                        {
                            "agent_name": "Debug Agent 1",
                            "association_score": 0.8,
                            "contextual_relevance": "Debug testing agent",
                            "role_analysis": "Debug agent for testing purposes"
                        },
                        {
                            "agent_name": "Debug Agent 2", 
                            "association_score": 0.6,
                            "contextual_relevance": "Secondary debug agent",
                            "role_analysis": "Secondary debug agent for testing"
                        }
                    ],
                    "analysis_summary": "Debug agents selected for testing",
                    "total_agents_analyzed": 2
                },
                "agent_selection": {
                    "success": True,
                    "selected_agents": [
                        {
                            "agent_name": "Debug Agent 1",
                            "execution_order": 1,
                            "task_assignment": "Debug task assignment 1",
                            "selection_reasoning": "Selected for debug testing",
                            "confidence_score": 0.8
                        },
                        {
                            "agent_name": "Debug Agent 2",
                            "execution_order": 2, 
                            "task_assignment": "Debug task assignment 2",
                            "selection_reasoning": "Selected for debug testing",
                            "confidence_score": 0.6
                        }
                    ],
                    "execution_strategy": "sequential",
                    "overall_reasoning": "Debug sequential execution",
                    "total_agents_selected": 2
                },
                "a2a_execution": {
                    "success": True,
                    "execution_strategy": "sequential",
                    "execution_results": [
                        {
                            "agent_name": "Debug Agent 1",
                            "execution_order": 1,
                            "task_assignment": "Debug task assignment 1",
                            "agent_response": "Debug response from agent 1",
                            "success": True,
                            "execution_time": 1.0,
                            "a2a_handoff_status": "success",
                            "handoff_message_sent": "Debug handoff message 1",
                            "agent_actual_response": "Debug actual response from agent 1"
                        },
                        {
                            "agent_name": "Debug Agent 2",
                            "execution_order": 2,
                            "task_assignment": "Debug task assignment 2", 
                            "agent_response": "Debug response from agent 2",
                            "success": True,
                            "execution_time": 1.0,
                            "a2a_handoff_status": "success",
                            "handoff_message_sent": "Debug handoff message 2",
                            "agent_actual_response": "Debug actual response from agent 2"
                        }
                    ],
                    "final_response": "Debug final response: This is a simplified debug response for frontend testing. The query was processed successfully in debug mode.",
                    "total_agents_executed": 2,
                    "accumulated_output": "Debug accumulated output from all agents"
                }
            }
            
            logger.info(f"[{session['session_id']}] Debug processing completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"[{session['session_id']}] Debug processing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "session_id": session['session_id']
            }

# Initialize orchestrator
orchestrator = DebugOrchestrator()

@app.route('/api/simple-orchestration/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "orchestrator_type": "debug_simplified",
        "active_sessions": len(orchestrator.active_sessions),
        "memory_usage": "N/A",
        "orchestrator_model": "debug",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/simple-orchestration/sessions', methods=['GET'])
def get_sessions():
    """Get active sessions"""
    try:
        sessions = []
        for session_id, session in orchestrator.active_sessions.items():
            sessions.append({
                "session_id": session_id,
                "query": session.get('query', ''),
                "status": session.get('status', 'unknown'),
                "created_at": session.get('created_at', datetime.now()).isoformat(),
                "duration": (datetime.now() - session.get('created_at', datetime.now())).total_seconds(),
                "stages_completed": 4
            })
        
        return jsonify({
            "sessions": sessions,
            "total": len(sessions)
        })
    except Exception as e:
        logger.error(f"Sessions endpoint error: {e}")
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/simple-orchestration/sessions/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Cleanup a specific session"""
    try:
        if session_id in orchestrator.active_sessions:
            del orchestrator.active_sessions[session_id]
            return jsonify({"success": True, "message": f"Session {session_id} cleaned up"})
        else:
            return jsonify({"success": False, "error": "Session not found"}), 404
    except Exception as e:
        logger.error(f"Cleanup session error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/simple-orchestration/query', methods=['POST'])
def process_query():
    """Process query through debug orchestration"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        contextual_analysis = data.get('contextual_analysis', None)
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Processing debug orchestration query: {query[:50]}...")
        
        result = orchestrator.process_query(query, contextual_analysis)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Debug query endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Debug Simple Orchestration API...")
    logger.info("📍 Port: 5015")
    logger.info("🧠 Debug mode: Simplified processing")
    app.run(host='0.0.0.0', port=5015, debug=False)
