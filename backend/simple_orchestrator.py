#!/usr/bin/env python3
"""
Simple Orchestrator - Direct execution without complex LLM analysis
Fixes the "Unknown Agent" issue by directly using Strands SDK agents
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import uuid
import time
import logging
from datetime import datetime
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Service URLs
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "simple-orchestrator",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/orchestrate', methods=['POST'])
def orchestrate():
    """Simple orchestration that directly uses Strands SDK agents"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        session_id = str(uuid.uuid4())
        logger.info(f"[{session_id}] 🚀 Processing query: {query[:50]}...")
        
        # Step 1: Get available agents from Strands SDK
        logger.info(f"[{session_id}] 🔍 Getting available agents...")
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
        
        if response.status_code != 200:
            return jsonify({
                "success": False,
                "error": f"Failed to get agents from Strands SDK: {response.status_code}"
            }), 500
        
        agents_data = response.json()
        available_agents = agents_data.get('agents', [])
        
        if not available_agents:
            return jsonify({
                "success": False,
                "error": "No agents available"
            }), 500
        
        logger.info(f"[{session_id}] Found {len(available_agents)} agents: {[a.get('name', 'Unknown') for a in available_agents]}")
        
        # Step 2: Select appropriate agents based on query
        selected_agents = select_agents_for_query(query, available_agents, session_id)
        logger.info(f"[{session_id}] Selected {len(selected_agents)} agents: {[a.get('name', 'Unknown') for a in selected_agents]}")
        
        # Step 3: Execute orchestration
        execution_results = []
        handoffs = []
        data_exchanges = []
        
        current_context = query
        for i, agent in enumerate(selected_agents):
            agent_name = agent.get('name', 'Unknown Agent')
            agent_id = agent.get('id', '')
            
            logger.info(f"[{session_id}] Executing with agent {i+1}/{len(selected_agents)}: {agent_name}")
            
            # Prepare input for this agent
            agent_input = prepare_agent_input(agent, i+1, query, current_context)
            
            # Track data exchange: Orchestrator → Agent
            data_exchanges.append({
                "handoff_number": i + 1,
                "direction": "Orchestrator → Agent",
                "from": "System Orchestrator",
                "to": agent_name,
                "agent_id": agent_id,
                "data_sent": agent_input,
                "data_length": len(agent_input),
                "timestamp": datetime.now().isoformat(),
                "data_type": "Task Assignment"
            })
            
            # Execute agent
            start_time = time.time()
            execution_result = execute_agent(agent, agent_input, session_id)
            execution_time = time.time() - start_time
            
            if execution_result.get('success', False):
                agent_output = execution_result.get('response', '')
                
                # Track handoff: Agent → Orchestrator
                handoffs.append({
                    "handoff_number": i + 1,
                    "from": agent_name,
                    "to": "System Orchestrator",
                    "agent_id": agent_id,
                    "data_received": agent_output,
                    "data_length": len(agent_output),
                    "timestamp": datetime.now().isoformat(),
                    "execution_time": execution_time,
                    "status": "success"
                })
                
                # Track data exchange: Agent → Orchestrator
                data_exchanges.append({
                    "handoff_number": i + 1,
                    "direction": "Agent → Orchestrator",
                    "from": agent_name,
                    "to": "System Orchestrator",
                    "agent_id": agent_id,
                    "data_received": agent_output,
                    "data_length": len(agent_output),
                    "timestamp": datetime.now().isoformat(),
                    "data_type": "Task Result"
                })
                
                execution_results.append({
                    "agent_name": agent_name,
                    "agent_id": agent_id,
                    "input": agent_input,
                    "output": agent_output,
                    "execution_time": execution_time,
                    "success": True
                })
                
                # Update context for next agent
                current_context = agent_output
                
                logger.info(f"[{session_id}] ✅ Agent {agent_name} completed in {execution_time:.2f}s")
            else:
                logger.error(f"[{session_id}] ❌ Agent {agent_name} failed: {execution_result.get('error', 'Unknown error')}")
                execution_results.append({
                    "agent_name": agent_name,
                    "agent_id": agent_id,
                    "input": agent_input,
                    "output": "",
                    "execution_time": execution_time,
                    "success": False,
                    "error": execution_result.get('error', 'Unknown error')
                })
        
        # Step 4: Prepare final response
        final_response = ""
        if execution_results:
            # Use the output from the last successful agent
            for result in reversed(execution_results):
                if result.get('success', False) and result.get('output'):
                    final_response = result['output']
                    break
        
        total_execution_time = sum(r.get('execution_time', 0) for r in execution_results)
        successful_agents = [r for r in execution_results if r.get('success', False)]
        
        logger.info(f"[{session_id}] ✅ Orchestration completed: {len(successful_agents)}/{len(execution_results)} agents successful")
        
        return jsonify({
            "success": True,
            "response": final_response,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "workflow_summary": {
                "total_agents": len(execution_results),
                "successful_agents": len(successful_agents),
                "total_execution_time": total_execution_time,
                "agents_used": [r.get('agent_name', 'Unknown') for r in execution_results]
            },
            "complete_data_flow": {
                "session_id": session_id,
                "original_query": query,
                "handoffs": handoffs,
                "data_exchanges": data_exchanges,
                "final_synthesis": {
                    "total_agents_used": len(execution_results),
                    "successful_executions": len(successful_agents),
                    "final_response_length": len(final_response)
                }
            }
        })
        
    except Exception as e:
        logger.error(f"❌ Orchestration error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

def select_agents_for_query(query: str, available_agents: List[Dict], session_id: str) -> List[Dict]:
    """Select appropriate agents based on query content"""
    query_lower = query.lower()
    selected = []
    
    # Simple keyword-based selection
    if any(word in query_lower for word in ['poem', 'poetry', 'creative', 'story', 'write']):
        # Look for creative agents
        for agent in available_agents:
            if 'creative' in agent.get('name', '').lower():
                selected.append(agent)
                break
    
    if any(word in query_lower for word in ['python', 'code', 'program', 'technical', 'develop']):
        # Look for technical agents
        for agent in available_agents:
            if 'technical' in agent.get('name', '').lower():
                selected.append(agent)
                break
    
    # If no specific agents found, use first available agent
    if not selected and available_agents:
        selected.append(available_agents[0])
    
    logger.info(f"[{session_id}] Selected agents based on query analysis: {[a.get('name', 'Unknown') for a in selected]}")
    return selected

def prepare_agent_input(agent: Dict, step_number: int, query: str, previous_output: str = None) -> str:
    """Prepare input for agent execution"""
    if step_number == 1:
        return query
    else:
        return f"Based on the previous analysis, {query}"

def execute_agent(agent: Dict, input_text: str, session_id: str) -> Dict:
    """Execute agent using Strands SDK"""
    try:
        agent_id = agent.get('id', '')
        agent_name = agent.get('name', 'Unknown Agent')
        
        logger.info(f"[{session_id}] Executing agent {agent_name} (ID: {agent_id})")
        
        response = requests.post(
            f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute",
            json={
                "input": input_text,
                "stream": False,
                "show_thinking": True
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "response": result.get('response', ''),
                "execution_time": result.get('execution_time', 0.0)
            }
        else:
            return {
                "success": False,
                "error": f"Agent execution failed: {response.status_code}"
            }
            
    except Exception as e:
        logger.error(f"[{session_id}] Error executing agent {agent_name}: {e}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == '__main__':
    logger.info("🚀 Starting Simple Orchestrator...")
    logger.info("📍 Port: 5023")
    logger.info("🎯 Direct Strands SDK integration - no complex LLM analysis")
    
    app.run(host='0.0.0.0', port=5023, debug=True)

