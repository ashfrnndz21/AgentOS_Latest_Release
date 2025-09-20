#!/usr/bin/env python3
"""
Enhanced LLM Orchestration API
- LLM-powered query analysis and agent selection
- Intelligent context understanding
- Dynamic agent routing based on metadata
- Memory-efficient execution with cleanup
- Response synthesis and formatting
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
from flask_cors import CORS
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
ORCHESTRATOR_MODEL = "llama3.2:1b"  # Fast, reliable model for orchestration
SESSION_TIMEOUT = 300  # 5 minutes
MEMORY_THRESHOLD = 85  # 85% memory usage threshold
CLEANUP_DELAY = 2  # 2 seconds delay before cleanup

app = Flask(__name__)
app.config['SECRET_KEY'] = 'enhanced_orchestration_secret'
CORS(app)

@dataclass
class OrchestrationSession:
    """Enhanced orchestration session with LLM analysis"""
    session_id: str
    created_at: datetime
    query: str
    query_analysis: Optional[Dict] = None
    selected_agent: Optional[Dict] = None
    execution_result: Optional[Dict] = None
    final_response: Optional[str] = None
    status: str = "active"
    memory_usage: float = 0.0
    processing_stages: List[str] = None

    def __post_init__(self):
        if self.processing_stages is None:
            self.processing_stages = []

class EnhancedOrchestrator:
    """Enhanced LLM-powered orchestration system"""
    
    def __init__(self):
        self.active_sessions: Dict[str, OrchestrationSession] = {}
        self.agent_metadata_cache: Dict[str, Dict] = {}
        self.cleanup_thread = threading.Thread(target=self._cleanup_worker, daemon=True)
        self.cleanup_thread.start()
        logger.info("Enhanced Orchestrator initialized with LLM analysis")
    
    def create_session(self, query: str) -> OrchestrationSession:
        """Create a new orchestration session"""
        session_id = str(uuid.uuid4())
        session = OrchestrationSession(
            session_id=session_id,
            created_at=datetime.now(),
            query=query,
            processing_stages=["created", "analyzing", "selecting", "executing", "synthesizing", "cleanup"]
        )
        self.active_sessions[session_id] = session
        logger.info(f"Created enhanced session {session_id} for query: {query[:50]}...")
        return session
    
    def analyze_query_with_llm(self, query: str, available_agents: List[Dict]) -> Dict:
        """Use LLM to analyze query context and select best agent with explicit reasoning stages"""
        try:
            # Prepare agent metadata for LLM analysis
            agent_summary = []
            for agent in available_agents:
                agent_summary.append({
                    'id': agent['id'],
                    'name': agent['name'],
                    'description': agent.get('description', ''),
                    'capabilities': agent.get('capabilities', []),
                    'tools': agent.get('tools', []),
                    'model': agent.get('model', 'unknown'),
                    'system_prompt': agent.get('system_prompt', ''),
                    'specialization': agent.get('description', '').lower()
                })
            
            # Debug: Log agent summary
            logger.info(f"Available agents for LLM analysis: {[agent['name'] for agent in agent_summary]}")
            for agent in agent_summary:
                logger.info(f"Agent: {agent['name']} (ID: {agent['id']}) - {agent['description']}")
            
            # Create structured LLM prompt with explicit reasoning stages
            prompt = f"""You are an intelligent orchestration system that performs structured analysis to match user queries with the most appropriate agent.

Available Agents in Registry:
{json.dumps(agent_summary, indent=2)}

User Query: "{query}"

Follow this EXACT reasoning process:

STAGE 1: QUERY CONTEXT ANALYSIS
Analyze the user's query to understand:
- What is the user actually asking for?
- What domain/subject area does this fall under?
- What level of expertise is required?
- What type of assistance is needed?

STAGE 2: AGENT CAPABILITY ANALYSIS  
For each agent, analyze their actual capabilities:
- What is their primary expertise area?
- What tools and capabilities do they have?
- How does their system prompt define their role?
- What specific tasks can they perform well?

STAGE 3: CONTEXTUAL MATCHING
Match the query context with agent capabilities:
- Which agent's expertise aligns with the user's needs?
- Which agent has the right tools for this specific request?
- Which agent's system prompt indicates they can handle this type of query?

Respond with ONLY a valid JSON object:
{{
    "stage_1_query_analysis": {{
        "user_intent": "detailed_analysis_of_what_user_is_actually_asking_for",
        "domain": "specific_domain_or_subject_area",
        "complexity": "simple|moderate|complex",
        "required_expertise": "type_of_expertise_needed",
        "context_reasoning": "detailed_explanation_of_query_context_understanding"
    }},
    "stage_2_agent_analysis": {{
        "agent_evaluations": [
            {{
                "agent_id": "agent_id",
                "agent_name": "agent_name",
                "primary_expertise": "main_area_of_expertise",
                "capabilities_assessment": "detailed_analysis_of_what_this_agent_can_do",
                "tools_analysis": "analysis_of_available_tools_and_how_they_help",
                "system_prompt_analysis": "how_system_prompt_defines_their_role",
                "suitability_score": 0.95
            }}
        ]
    }},
    "stage_3_contextual_matching": {{
        "selected_agent_id": "best_matching_agent_id",
        "matching_reasoning": "detailed_explanation_of_why_this_agent_is_the_best_match_based_on_query_context_and_agent_capabilities",
        "confidence": 0.95,
        "alternative_agents": ["other_suitable_agent_ids"],
        "match_quality": "excellent|good|moderate",
        "execution_strategy": "single|sequential|parallel"
    }}
}}

Be precise and thorough in your analysis. Focus on the actual capabilities and expertise of each agent."""

            # Call LLM for analysis
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,  # Low temperature for consistent analysis
                        "top_p": 0.9,
                        "max_tokens": 1000
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                llm_response = result.get('response', '').strip()
                
                # Parse LLM response
                try:
                    # Extract JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                    if json_match:
                        analysis = json.loads(json_match.group())
                        
                        # Debug: Log the full LLM response
                        logger.info(f"LLM response: {llm_response[:200]}...")
                        logger.info(f"Parsed analysis: {analysis}")
                        
                        # Ensure contextual matching is properly structured
                        if 'stage_3_contextual_matching' in analysis:
                            selected_id = analysis['stage_3_contextual_matching'].get('selected_agent_id')
                            logger.info(f"LLM orchestration analysis successful: {selected_id}")
                            
                            # Log detailed reasoning for debugging
                            if 'stage_1_query_analysis' in analysis:
                                query_analysis = analysis['stage_1_query_analysis']
                                logger.info(f"Query Analysis: {query_analysis.get('user_intent', 'N/A')}")
                                logger.info(f"Domain: {query_analysis.get('domain', 'N/A')}")
                                logger.info(f"Context Reasoning: {query_analysis.get('context_reasoning', 'N/A')}")
                            
                            if 'stage_2_agent_analysis' in analysis:
                                agent_analysis = analysis['stage_2_agent_analysis']
                                logger.info(f"Agent Evaluations: {len(agent_analysis.get('agent_evaluations', []))} agents analyzed")
                            
                            if 'stage_3_contextual_matching' in analysis:
                                matching = analysis['stage_3_contextual_matching']
                                logger.info(f"Matching Reasoning: {matching.get('matching_reasoning', 'N/A')}")
                                logger.info(f"Match Quality: {matching.get('match_quality', 'N/A')}")
                            
                            return analysis
                        else:
                            logger.warning("No stage_3_contextual_matching in LLM response")
                    else:
                        logger.warning("No JSON found in LLM response")
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse LLM response: {e}")
                    logger.error(f"Raw response: {llm_response}")
            
            # Fallback to rule-based analysis
            logger.warning("LLM analysis failed, using fallback")
            return self._fallback_analysis(query, available_agents)
            
        except Exception as e:
            logger.error(f"LLM analysis error: {e}")
            return self._fallback_analysis(query, available_agents)
    
    def _fallback_analysis(self, query: str, available_agents: List[Dict]) -> Dict:
        """Dynamic fallback analysis when LLM fails"""
        query_lower = query.lower()
        
        # Dynamic keyword analysis for better matching
        keyword_matches = {}
        
        for agent in available_agents:
            score = 0
            agent_name = agent.get('name', '').lower()
            agent_desc = agent.get('description', '').lower()
            agent_capabilities = agent.get('capabilities', [])
            
            # Check for direct keyword matches in description
            for word in query_lower.split():
                if word in agent_desc:
                    score += 3
                if word in agent_name:
                    score += 2
            
            # Check for capability matches
            for capability in agent_capabilities:
                if any(word in capability.lower() for word in query_lower.split()):
                    score += 2
            
            # Check for semantic matches
            if any(word in query_lower for word in ['help', 'assist', 'support']):
                if 'assistant' in agent_name or 'help' in agent_desc:
                    score += 1
            
            keyword_matches[agent['id']] = {
                'agent': agent,
                'score': score
            }
        
        # Find best matching agent
        best_match = max(keyword_matches.items(), key=lambda x: x[1]['score'])
        best_agent = best_match[1]['agent']
        best_score = best_match[1]['score']
        
        # Determine domain dynamically
        if best_score > 0:
            # Try to infer domain from the best matching agent
            agent_desc = best_agent.get('description', '').lower()
            if any(word in agent_desc for word in ['health', 'medical', 'doctor']):
                domain = "health"
            elif any(word in agent_desc for word in ['creative', 'write', 'poem', 'story']):
                domain = "creative"
            elif any(word in agent_desc for word in ['technical', 'code', 'program']):
                domain = "technical"
            elif any(word in agent_desc for word in ['weather', 'climate']):
                domain = "weather"
            else:
                domain = "general"
        else:
            domain = "general"
        
        return {
            "stage_1_query_analysis": {
                "user_intent": f"User query requiring {domain} assistance",
                "domain": domain,
                "complexity": "moderate",
                "required_expertise": domain,
                "context_reasoning": f"Fallback analysis suggests {domain} domain based on keyword matching"
            },
            "stage_2_agent_analysis": {
                "agent_evaluations": [
                    {
                        "agent_id": best_agent['id'],
                        "agent_name": best_agent['name'],
                        "primary_expertise": domain,
                        "capabilities_assessment": f"Best match based on keyword scoring (score: {best_score})",
                        "tools_analysis": f"Tools: {best_agent.get('capabilities', [])}",
                        "system_prompt_analysis": f"Description: {best_agent.get('description', '')}",
                        "suitability_score": min(best_score / 10.0, 1.0)
                    }
                ]
            },
            "stage_3_contextual_matching": {
                "selected_agent_id": best_agent['id'],
                "matching_reasoning": f"Fallback selected {best_agent['name']} based on keyword matching (score: {best_score})",
                "confidence": 0.6,
                "alternative_agents": [aid for aid, data in keyword_matches.items() if aid != best_agent['id'] and data['score'] > 0],
                "match_quality": "moderate",
                "execution_strategy": "single"
            }
        }
    
    def execute_agent_query(self, agent_id: str, query: str, session_id: str) -> Dict:
        """Execute query with selected agent"""
        try:
            start_time = time.time()
            
            # Execute via Strands SDK
            response = requests.post(
                f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute",
                json={"input": query},
                timeout=180  # 3 minutes timeout
            )
            
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "result": result,
                    "execution_time": execution_time,
                    "agent_id": agent_id
                }
            else:
                return {
                    "success": False,
                    "error": f"Agent execution failed: {response.status_code}",
                    "execution_time": execution_time,
                    "agent_id": agent_id
                }
        
        except Exception as e:
            logger.error(f"Agent execution error: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": 0,
                "agent_id": agent_id
            }
    
    def synthesize_response(self, query: str, analysis: Dict, execution_result: Dict, agent_metadata: Dict) -> str:
        """Use LLM to synthesize final response from agent output"""
        try:
            if not execution_result.get('success'):
                return f"I apologize, but I encountered an error while processing your request: {execution_result.get('error', 'Unknown error')}"
            
            agent_response = execution_result.get('result', {})
            
            # Extract the actual response text
            response_text = ""
            if isinstance(agent_response, dict):
                response_text = agent_response.get('response', agent_response.get('output_text', str(agent_response)))
            else:
                response_text = str(agent_response)
            
            # Create synthesis prompt
            synthesis_prompt = f"""You are a response synthesizer that creates polished, user-friendly responses from agent outputs.

Original User Query: "{query}"
Query Analysis: {json.dumps(analysis.get('query_analysis', {}), indent=2)}
Selected Agent: {agent_metadata.get('name', 'Unknown')} - {agent_metadata.get('description', '')}
Agent Response: {response_text}

Your task is to:
1. Review the agent's response
2. Ensure it directly addresses the user's query
3. Make the response clear, helpful, and well-formatted
4. Add any necessary context or clarifications
5. Maintain a professional yet friendly tone

Provide a polished, final response that the user will receive. Do not include any meta-commentary about the orchestration process."""

            # Call LLM for response synthesis
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": synthesis_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,  # Higher temperature for natural response
                        "top_p": 0.9,
                        "max_tokens": 800
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                synthesized_response = result.get('response', '').strip()
                logger.info(f"Response synthesis successful")
                return synthesized_response
            else:
                # Fallback to original agent response
                return response_text
                
        except Exception as e:
            logger.error(f"Response synthesis error: {e}")
            # Fallback to original agent response
            return str(execution_result.get('result', {}).get('response', 'Response processing completed'))
    
    def process_query(self, query: str) -> Dict:
        """Process query through enhanced orchestration pipeline"""
        session = self.create_session(query)
        
        try:
            # Stage 1: Get available agents
            logger.info(f"[{session.session_id}] Stage 1: Getting available agents")
            
            # Get A2A agents
            a2a_response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
            if a2a_response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to get A2A agents",
                    "session_id": session.session_id
                }
            
            a2a_agents = a2a_response.json().get('agents', [])
            
            # Get Strands SDK agents
            sdk_response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
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
                            'capabilities': sdk_agent.get('tools', []),
                            'tools': sdk_agent.get('tools', []),
                            'model': sdk_agent.get('model_id', 'unknown'),
                            'system_prompt': sdk_agent.get('system_prompt', '')
                        })
                        break
            
            if not available_agents:
                return {
                    "success": False,
                    "error": "No agents available",
                    "session_id": session.session_id
                }
            
            # Stage 2: LLM Query Analysis
            logger.info(f"[{session.session_id}] Stage 2: LLM query analysis")
            analysis = self.analyze_query_with_llm(query, available_agents)
            session.query_analysis = analysis
            
            # Stage 3: Agent Selection
            logger.info(f"[{session.session_id}] Stage 3: Agent selection")
            selected_agent_id = analysis['stage_3_contextual_matching']['selected_agent_id']
            
            # Dynamic agent selection: Use LLM's intelligent analysis
            selected_agent_id = analysis['stage_3_contextual_matching']['selected_agent_id']
            reasoning = analysis['stage_3_contextual_matching'].get('matching_reasoning', '')
            match_quality = analysis['stage_3_contextual_matching'].get('match_quality', 'unknown')
            
            # Find the agent by ID (LLM should now be more accurate with dynamic analysis)
            selected_agent = next((a for a in available_agents if a['id'] == selected_agent_id), None)
            
            # Log the dynamic selection
            if selected_agent:
                logger.info(f"Dynamic selection: {selected_agent['name']} (ID: {selected_agent['id']})")
                logger.info(f"Match quality: {match_quality}")
                logger.info(f"Reasoning: {reasoning}")
            else:
                # If LLM still gets ID wrong, try to extract agent name from reasoning
                logger.warning(f"Agent with ID {selected_agent_id} not found, attempting name-based fallback")
                for agent in available_agents:
                    if agent['name'].lower() in reasoning.lower():
                        selected_agent = agent
                        logger.info(f"Fallback selection by name: {agent['name']} (ID: {agent['id']})")
                        # Update the analysis with correct ID
                        analysis['stage_3_contextual_matching']['selected_agent_id'] = agent['id']
                        break
            
            if not selected_agent:
                return {
                    "success": False,
                    "error": "Selected agent not found",
                    "session_id": session.session_id
                }
            
            session.selected_agent = selected_agent
            
            # Stage 4: Agent Execution
            logger.info(f"[{session.session_id}] Stage 4: Agent execution")
            execution_result = self.execute_agent_query(selected_agent_id, query, session.session_id)
            session.execution_result = execution_result
            
            # Stage 5: Response Synthesis
            logger.info(f"[{session.session_id}] Stage 5: Response synthesis")
            final_response = self.synthesize_response(query, analysis, execution_result, selected_agent)
            session.final_response = final_response
            
            # Update session status
            session.status = "completed"
            
            # Prepare response
            result = {
                "success": execution_result['success'],
                "session_id": session.session_id,
                "stage_1_query_analysis": analysis.get('stage_1_query_analysis', {}),
                "stage_2_agent_analysis": analysis.get('stage_2_agent_analysis', {}),
                "stage_3_contextual_matching": analysis.get('stage_3_contextual_matching', {}),
                "selected_agent": {
                    "id": selected_agent['id'],
                    "name": selected_agent['name'],
                    "description": selected_agent['description']
                },
                "execution_time": execution_result.get('execution_time', 0),
                "final_response": final_response,
                "raw_agent_response": execution_result.get('result', {}),
                "error": execution_result.get('error')
            }
            
            # Schedule cleanup after delay
            threading.Timer(CLEANUP_DELAY, self.cleanup_session, [session.session_id]).start()
            
            return result
        
        except Exception as e:
            logger.error(f"Query processing error: {e}")
            session.status = "failed"
            return {
                "success": False,
                "error": str(e),
                "session_id": session.session_id
            }
    
    def cleanup_session(self, session_id: str) -> bool:
        """Cleanup session and release resources"""
        if session_id in self.active_sessions:
            session = self.active_sessions.pop(session_id)
            logger.info(f"Cleaned up enhanced session {session_id}")
            
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
                    logger.warning(f"Cleaning up expired enhanced session {session_id}")
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
                logger.error(f"Enhanced cleanup worker error: {e}")
                time.sleep(60)

# Initialize orchestrator
orchestrator = EnhancedOrchestrator()

@app.route('/api/enhanced-orchestration/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    memory_usage = psutil.virtual_memory().percent
    active_sessions = len(orchestrator.active_sessions)
    
    return jsonify({
        "status": "healthy",
        "memory_usage": f"{memory_usage}%",
        "active_sessions": active_sessions,
        "orchestrator_model": ORCHESTRATOR_MODEL,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/enhanced-orchestration/query', methods=['POST'])
def process_query():
    """Process query through enhanced orchestration"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Processing enhanced orchestration query: {query[:50]}...")
        
        result = orchestrator.process_query(query)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Enhanced query endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/enhanced-orchestration/sessions', methods=['GET'])
def get_sessions():
    """Get active sessions info"""
    sessions_info = []
    for session_id, session in orchestrator.active_sessions.items():
        sessions_info.append({
            "session_id": session_id,
            "created_at": session.created_at.isoformat(),
            "query": session.query[:50] + "..." if len(session.query) > 50 else session.query,
            "status": session.status,
            "stages_completed": len(session.processing_stages),
            "duration": (datetime.now() - session.created_at).total_seconds()
        })
    
    return jsonify({
        "active_sessions": len(sessions_info),
        "sessions": sessions_info
    })

@app.route('/api/enhanced-orchestration/sessions/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Manually cleanup a session"""
    if orchestrator.cleanup_session(session_id):
        return jsonify({"success": True, "message": f"Enhanced session {session_id} cleaned up"})
    else:
        return jsonify({"success": False, "error": "Session not found"}), 404

if __name__ == '__main__':
    logger.info("🚀 Starting Enhanced LLM Orchestration API...")
    logger.info("📍 Port: 5014")
    logger.info("🧠 LLM-powered query analysis and agent selection")
    logger.info("🔄 Intelligent orchestration with memory management")
    logger.info("⚡ Enhanced response synthesis")
    
    app.run(host='0.0.0.0', port=5014, debug=False)
