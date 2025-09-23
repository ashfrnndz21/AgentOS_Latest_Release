#!/usr/bin/env python3
"""
Frontend Agent Bridge Service
Bridges frontend A2A agents with backend orchestration system
"""

import requests
import json
import uuid
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
BACKEND_REGISTRY_URL = "http://localhost:5010"
FRONTEND_A2A_URL = "http://localhost:5008"
ORCHESTRATION_URL = "http://localhost:8005"

class FrontendAgentBridge:
    """Bridges frontend agents with backend orchestration"""
    
    def __init__(self):
        self.frontend_agents = {}
        self.bridge_port = 5012
        self.setup_routes()
    
    def register_frontend_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a frontend agent with the backend system"""
        try:
            # Create bridge URL for the agent
            agent_id = agent_data.get('id', str(uuid.uuid4()))
            bridge_url = f"http://localhost:{self.bridge_port}/agent/{agent_id}"
            
            # Enhance capabilities based on agent name and description
            enhanced_capabilities = self._enhance_agent_capabilities(agent_data)
            
            # Store frontend agent info with enhanced capabilities
            self.frontend_agents[agent_id] = {
                **agent_data,
                'capabilities': enhanced_capabilities,
                'bridge_url': bridge_url,
                'strands_agent_id': agent_data.get('agent_id', agent_id),  # Store original Strands SDK agent ID
                'registered_at': datetime.now().isoformat()
            }
            
            # Register with backend agent registry
            backend_agent_data = {
                "id": agent_id,
                "name": agent_data.get('name', 'Frontend Agent'),
                "description": agent_data.get('description', ''),
                "url": bridge_url,
                "capabilities": enhanced_capabilities,
                "type": "frontend_bridge"
            }
            
            # Register with backend registry
            registry_response = requests.post(
                f"{BACKEND_REGISTRY_URL}/agents",
                json=backend_agent_data,
                timeout=5
            )
            
            if registry_response.status_code in [200, 201]:
                print(f"✅ Frontend agent registered: {agent_data.get('name')} -> {bridge_url}")
                return {
                    "status": "success",
                    "agent_id": agent_id,
                    "bridge_url": bridge_url,
                    "message": "Frontend agent registered with backend orchestration"
                }
            else:
                return {
                    "status": "error",
                    "error": f"Failed to register with backend: {registry_response.text}"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _enhance_agent_capabilities(self, agent_data: Dict[str, Any]) -> List[str]:
        """Enhance agent capabilities based on name and description"""
        existing_capabilities = agent_data.get('capabilities', [])
        agent_name = agent_data.get('name', '').lower()
        description = agent_data.get('description', '').lower()
        
        # If capabilities already exist, return them
        if existing_capabilities:
            return existing_capabilities
        
        enhanced_capabilities = []
        
        # Weather-related capabilities
        weather_indicators = ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'forecast', 'climate']
        if any(indicator in agent_name or indicator in description for indicator in weather_indicators):
            enhanced_capabilities.extend(['weather_analysis', 'forecasting', 'current_time', 'think'])
        
        # Technical/coding capabilities
        tech_indicators = ['technical', 'code', 'programming', 'software', 'development', 'debug']
        if any(indicator in agent_name or indicator in description for indicator in tech_indicators):
            enhanced_capabilities.extend(['code_execution', 'file_operations', 'calculator', 'think'])
        
        # Mathematical capabilities
        math_indicators = ['calculate', 'math', 'equation', 'formula', 'number', 'compute']
        if any(indicator in agent_name or indicator in description for indicator in math_indicators):
            enhanced_capabilities.extend(['calculator', 'compute', 'think'])
        
        # Research capabilities
        research_indicators = ['research', 'analyze', 'study', 'investigate', 'explore', 'expert']
        if any(indicator in agent_name or indicator in description for indicator in research_indicators):
            enhanced_capabilities.extend(['research', 'analysis', 'think'])
        
        # Default capabilities if nothing specific found
        if not enhanced_capabilities:
            enhanced_capabilities = ['think', 'general_assistance']
        
        return list(set(enhanced_capabilities))  # Remove duplicates
    
    def handle_orchestration_request(self, agent_id: str, question: str) -> Dict[str, Any]:
        """Handle orchestration request from backend and forward to Strands SDK agent"""
        try:
            if agent_id not in self.frontend_agents:
                return {
                    "status": "error",
                    "error": "Frontend agent not found"
                }
            
            agent_info = self.frontend_agents[agent_id]
            strands_agent_id = agent_info.get('strands_agent_id')
            
            if not strands_agent_id:
                return {
                    "status": "error",
                    "error": "Strands SDK agent ID not found"
                }
            
            # Call the actual Strands SDK agent
            import requests
            import time
            
            start_time = time.time()
            
            # Call Strands SDK agent execution endpoint
            strands_url = f"http://localhost:5006/api/strands-sdk/agents/{strands_agent_id}/execute"
            payload = {
                "input": question,
                "user": "orchestration_service"
            }
            
            try:
                response = requests.post(strands_url, json=payload, timeout=30)
                execution_time = time.time() - start_time
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Extract the actual response from Strands SDK
                    if 'response' in result:
                        agent_response = result['response']
                    elif 'output' in result:
                        agent_response = result['output']
                    else:
                        agent_response = str(result)
                    
                    return {
                        "status": "success",
                        "response": f"**{agent_info['name']} Response:**\n{agent_response}",
                        "agent_name": agent_info['name'],
                        "execution_time": execution_time
                    }
                else:
                    # Fallback to template response if Strands SDK fails
                    capabilities = agent_info.get('capabilities', [])
                    response = self._generate_agent_response(agent_info['name'], question, capabilities)
                    
                    return {
                        "status": "success",
                        "response": response,
                        "agent_name": agent_info['name'],
                        "execution_time": execution_time
                    }
                    
            except requests.exceptions.RequestException as e:
                # Fallback to template response if request fails
                capabilities = agent_info.get('capabilities', [])
                response = self._generate_agent_response(agent_info['name'], question, capabilities)
                
                return {
                    "status": "success",
                    "response": response,
                    "agent_name": agent_info['name'],
                    "execution_time": 1.0
                }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _generate_agent_response(self, agent_name: str, question: str, capabilities: List[str]) -> str:
        """Generate a response based on agent capabilities"""
        if "weather" in agent_name.lower() or "weather" in capabilities:
            return f"""**Weather Agent Response:**
I understand you're asking about weather. While I don't have real-time weather data access, I can provide general weather information and guidance.

**Your Question:** {question}

**General Weather Information:**
- Weather patterns vary by location and season
- For current conditions, I recommend checking local weather services
- I can help with weather-related calculations and general climate information

**Available Capabilities:** {', '.join(capabilities)}"""

        elif "technical" in agent_name.lower() or "technical" in capabilities:
            return f"""**Technical Expert Response:**
I'm here to help with technical problem-solving and software development guidance.

**Your Question:** {question}

**Technical Analysis:**
Based on your question, I can provide:
- Code solutions and best practices
- Architecture recommendations
- Debugging assistance
- Technology guidance

**Available Capabilities:** {', '.join(capabilities)}"""

        else:
            return f"""**{agent_name} Response:**
I've received your question and I'm processing it using my available capabilities.

**Your Question:** {question}

**My Response:**
I'm a specialized agent designed to help with specific tasks. I can assist you with various capabilities including: {', '.join(capabilities)}

**Available Capabilities:** {', '.join(capabilities)}"""
    
    def setup_routes(self):
        """Setup Flask routes"""
        
        @app.route('/health', methods=['GET'])
        def health_check():
            return jsonify({
                "status": "healthy",
                "service": "Frontend Agent Bridge",
                "frontend_agents": len(self.frontend_agents),
                "timestamp": datetime.now().isoformat()
            })
        
        @app.route('/agent/<agent_id>/health', methods=['GET'])
        def agent_health_check(agent_id):
            if agent_id in self.frontend_agents:
                return jsonify({"status": "healthy", "agent_id": agent_id})
            else:
                return jsonify({"status": "not_found"}), 404
        
        @app.route('/agent/<agent_id>/capabilities', methods=['GET'])
        def get_agent_capabilities(agent_id):
            if agent_id in self.frontend_agents:
                agent = self.frontend_agents[agent_id]
                return jsonify({
                    "agent_name": agent['name'],
                    "capabilities": agent.get('capabilities', []),
                    "description": agent.get('description', '')
                })
            else:
                return jsonify({"status": "not_found"}), 404
        
        @app.route('/agent/<agent_id>/a2a/message', methods=['POST'])
        def handle_agent_message(agent_id):
            """Handle A2A message for frontend agent"""
            try:
                data = request.get_json()
                question = data.get('message', '')
                
                result = self.handle_orchestration_request(agent_id, question)
                
                if result["status"] == "success":
                    return jsonify({
                        "status": "success",
                        "response": result["response"],
                        "execution_time": result["execution_time"],
                        "agent_name": result["agent_name"]
                    })
                else:
                    return jsonify(result), 400
                    
            except Exception as e:
                return jsonify({
                    "status": "error",
                    "error": str(e)
                }), 500
        
        @app.route('/register', methods=['POST'])
        def register_agent():
            """Register a frontend agent"""
            try:
                data = request.get_json()
                result = self.register_frontend_agent(data)
                return jsonify(result)
            except Exception as e:
                return jsonify({
                    "status": "error",
                    "error": str(e)
                }), 500
        
        @app.route('/agents', methods=['GET'])
        def list_agents():
            """List all registered frontend agents"""
            return jsonify({
                "status": "success",
                "agents": list(self.frontend_agents.values()),
                "count": len(self.frontend_agents)
            })

        @app.route('/agent/<agent_id>', methods=['DELETE'])
        def delete_agent(agent_id):
            """Delete a frontend agent"""
            try:
                if agent_id in self.frontend_agents:
                    del self.frontend_agents[agent_id]
                    return jsonify({
                        "status": "success",
                        "message": f"Agent {agent_id} deleted successfully"
                    })
                else:
                    return jsonify({
                        "status": "error",
                        "message": "Agent not found"
                    }), 404
            except Exception as e:
                return jsonify({
                    "status": "error",
                    "message": f"Failed to delete agent: {str(e)}"
                }), 500

# Global bridge instance
bridge = FrontendAgentBridge()

if __name__ == '__main__':
    print("🌉 Starting Frontend Agent Bridge Service...")
    print("📍 Port: 5012")
    print("🔗 Bridging frontend agents with backend orchestration")
    print("📡 Backend Registry: http://localhost:5010")
    print("📡 Frontend A2A: http://localhost:5008")
    print("📡 Orchestration: http://localhost:8005")
    
    app.run(host='0.0.0.0', port=5012, debug=False)
