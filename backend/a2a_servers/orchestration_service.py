"""
Central Orchestration Service
Provides detailed logging and routing of agent communication with real-time WebSocket updates
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit

class OrchestrationLogger:
    """Logs orchestration steps with timestamps and details"""
    
    def __init__(self, socketio=None):
        self.steps = []
        self.start_time = None
        self.socketio = socketio
        self.session_id = None
    
    def start_orchestration(self, task: str, user: str = "User"):
        """Start a new orchestration session"""
        self.start_time = time.time()
        self.steps = []
        self.session_id = f"orch_{int(time.time())}"
        self.log_step("ORCHESTRATION_START", {
            "task": task,
            "user": user,
            "timestamp": datetime.now().isoformat(),
            "session_id": self.session_id
        })
    
    def log_step(self, step_type: str, details: Dict[str, Any]):
        """Log an orchestration step and emit real-time updates"""
        elapsed = time.time() - self.start_time if self.start_time else 0
        step = {
            "step_type": step_type,
            "timestamp": datetime.now().isoformat(),
            "elapsed_seconds": round(elapsed, 2),
            "details": details
        }
        self.steps.append(step)
        
        # Print to console for real-time visibility
        print(f"\n🔄 [{elapsed:.2f}s] {step_type}")
        for key, value in details.items():
            print(f"   {key}: {value}")
        print()
        
        # Emit real-time WebSocket update
        if self.socketio and self.session_id:
            self.socketio.emit('orchestration_step', {
                'type': 'orchestration_step',
                'payload': step,
                'timestamp': datetime.now().isoformat(),
                'session_id': self.session_id
            })
    
    def get_orchestration_summary(self):
        """Get complete orchestration summary"""
        total_time = time.time() - self.start_time if self.start_time else 0
        return {
            "total_steps": len(self.steps),
            "total_time_seconds": round(total_time, 2),
            "steps": self.steps,
            "summary": self._generate_summary()
        }
    
    def _generate_summary(self):
        """Generate human-readable summary"""
        step_types = [step["step_type"] for step in self.steps]
        return {
            "agents_contacted": len([s for s in step_types if "AGENT_RESPONSE" in s]),
            "routing_decisions": len([s for s in step_types if "ROUTING_DECISION" in s]),
            "coordination_events": len([s for s in step_types if "COORDINATION" in s]),
            "final_result": "SUCCESS" if "ORCHESTRATION_COMPLETE" in step_types else "IN_PROGRESS"
        }

class CentralOrchestrator:
    """Central orchestrator for multi-agent communication"""
    
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        self.logger = OrchestrationLogger(self.socketio)
        self.agent_registry = "http://localhost:5010"
        self.available_agents = {}
        self.setup_routes()
        self.setup_socketio_events()
    
    def setup_socketio_events(self):
        """Setup WebSocket event handlers"""
        
        @self.socketio.on('connect')
        def handle_connect():
            print(f"🔌 Client connected to orchestration service")
            emit('orchestration_status', {
                'type': 'connection_established',
                'message': 'Connected to real-time orchestration service',
                'timestamp': datetime.now().isoformat()
            })
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            print(f"🔌 Client disconnected from orchestration service")
        
        @self.socketio.on('join_orchestration')
        def handle_join_orchestration(data):
            session_id = data.get('session_id')
            print(f"🔌 Client joined orchestration session: {session_id}")
            emit('orchestration_status', {
                'type': 'session_joined',
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            })
    
    def discover_agents(self):
        """Discover available agents from registry"""
        try:
            response = requests.get(f"{self.agent_registry}/agents", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.available_agents = {
                    agent["id"]: {
                        "name": agent["name"],
                        "url": agent["url"],
                        "capabilities": agent["capabilities"],
                        "status": agent["status"]
                    }
                    for agent in data["agents"]
                }
                return True
        except Exception as e:
            print(f"⚠️ Failed to discover agents: {e}")
        return False
    
    def route_question(self, question: str) -> List[str]:
        """Determine which agents should handle the question based on capabilities and availability"""
        question_lower = question.lower()
        selected_agents = []
        
        # Weather-related keywords and capabilities
        weather_keywords = ["weather", "temperature", "rain", "sunny", "cloudy", "forecast", "climate"]
        weather_capabilities = ["weather_analysis", "forecasting"]
        
        if any(keyword in question_lower for keyword in weather_keywords):
            # Find any available agent with weather capabilities
            weather_agents = [
                agent_id for agent_id, agent_info in self.available_agents.items()
                if agent_info.get("status") == "active" and 
                any(cap in agent_info.get("capabilities", []) for cap in weather_capabilities)
            ]
            if weather_agents:
                selected_agents.extend(weather_agents)
            else:
                # Fallback to any agent with "weather" in name
                weather_agents = [
                    agent_id for agent_id, agent_info in self.available_agents.items()
                    if agent_info.get("status") == "active" and 
                    "weather" in agent_info.get("name", "").lower()
                ]
                selected_agents.extend(weather_agents)
        
        # Financial/stock keywords and capabilities
        financial_keywords = ["stock", "market", "investment", "price", "financial", "trading", "portfolio", "sector"]
        financial_capabilities = ["stock_analysis", "market_trends", "financial_data"]
        
        if any(keyword in question_lower for keyword in financial_keywords):
            financial_agents = [
                agent_id for agent_id, agent_info in self.available_agents.items()
                if agent_info.get("status") == "active" and 
                any(cap in agent_info.get("capabilities", []) for cap in financial_capabilities)
            ]
            selected_agents.extend(financial_agents)
        
        # Mathematical keywords and capabilities
        math_keywords = ["calculate", "math", "equation", "formula", "number", "compute", "+", "-", "*", "/"]
        math_capabilities = ["calculator", "compute"]
        
        if any(keyword in question_lower for keyword in math_keywords):
            math_agents = [
                agent_id for agent_id, agent_info in self.available_agents.items()
                if agent_info.get("status") == "active" and 
                any(cap in agent_info.get("capabilities", []) for cap in math_capabilities)
            ]
            selected_agents.extend(math_agents)
        
        # Research keywords and capabilities
        research_keywords = ["research", "analyze", "study", "investigate", "explore"]
        research_capabilities = ["research", "analysis"]
        
        if any(keyword in question_lower for keyword in research_keywords):
            research_agents = [
                agent_id for agent_id, agent_info in self.available_agents.items()
                if agent_info.get("status") == "active" and 
                any(cap in agent_info.get("capabilities", []) for cap in research_capabilities)
            ]
            selected_agents.extend(research_agents)
        
        # Remove duplicates and ensure we have active agents
        selected_agents = list(set(selected_agents))
        selected_agents = [
            agent_id for agent_id in selected_agents 
            if self.available_agents.get(agent_id, {}).get("status") == "active"
        ]
        
        # If no specific agents identified, use any available coordinator or first available agent
        if not selected_agents:
            coordinator_agents = [
                agent_id for agent_id, agent_info in self.available_agents.items()
                if agent_info.get("status") == "active" and 
                "coordinator" in agent_info.get("name", "").lower()
            ]
            if coordinator_agents:
                selected_agents = coordinator_agents
            else:
                # Use any available agent
                available_agents = [
                    agent_id for agent_id, agent_info in self.available_agents.items()
                    if agent_info.get("status") == "active"
                ]
                selected_agents = available_agents[:1]  # Take first available
        
        return selected_agents
    
    def contact_agent(self, agent_id: str, question: str) -> Dict[str, Any]:
        """Contact a specific agent with the question"""
        if agent_id not in self.available_agents:
            return {"error": f"Agent {agent_id} not available"}
        
        agent_info = self.available_agents[agent_id]
        agent_url = agent_info["url"]
        
        # Log the contact attempt
        self.logger.log_step("AGENT_CONTACT", {
            "agent_id": agent_id,
            "agent_name": agent_info["name"],
            "agent_url": agent_url,
            "question": question,
            "capabilities": agent_info.get("capabilities", []),
            "tools_available": agent_info.get("capabilities", [])
        })
        
        try:
            # Send A2A message to the agent
            response = requests.post(
                f"{agent_url}/a2a/message",
                json={
                    "from_agent": "Central Orchestrator",
                    "message": question
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract detailed LLM response information
                llm_response = result.get("response", "")
                execution_time = result.get("execution_time", 0)
                
                # Log detailed agent response with LLM information
                self.logger.log_step("AGENT_RESPONSE", {
                    "agent_id": agent_id,
                    "agent_name": agent_info["name"],
                    "response_time": execution_time,
                    "status": result.get("status", "unknown"),
                    "llm_response_length": len(llm_response),
                    "llm_response_preview": llm_response[:300] + "..." if len(llm_response) > 300 else llm_response,
                    "full_llm_response": llm_response,  # Full response for detailed analysis
                    "tools_used": agent_info.get("capabilities", []),
                    "model_type": "LLM (Ollama/Strands SDK)",
                    "processing_details": {
                        "execution_time_seconds": execution_time,
                        "response_quality": "high" if len(llm_response) > 100 else "basic",
                        "contains_reasoning": "yes" if any(word in llm_response.lower() for word in ["because", "therefore", "however", "additionally"]) else "no"
                    }
                })
                
                # Emit detailed LLM conversation lineage
                if self.socketio and self.logger.session_id:
                    self.socketio.emit('agent_conversation', {
                        'type': 'agent_conversation',
                        'payload': {
                            'agent_id': agent_id,
                            'agent_name': agent_info["name"],
                            'question': question,
                            'llm_response': llm_response,
                            'execution_time': execution_time,
                            'tools_available': agent_info.get("capabilities", []),
                            'timestamp': datetime.now().isoformat()
                        },
                        'timestamp': datetime.now().isoformat(),
                        'session_id': self.logger.session_id
                    })
                
                return result
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                self.logger.log_step("AGENT_ERROR", {
                    "agent_id": agent_id,
                    "error": error_msg,
                    "http_status": response.status_code
                })
                return {"error": error_msg}
                
        except Exception as e:
            error_msg = f"Connection error: {str(e)}"
            self.logger.log_step("AGENT_ERROR", {
                "agent_id": agent_id,
                "error": error_msg,
                "exception_type": type(e).__name__
            })
            return {"error": error_msg}
    
    def orchestrate_question(self, question: str, user: str = "User") -> Dict[str, Any]:
        """Orchestrate a question across multiple agents"""
        # Start orchestration logging
        self.logger.start_orchestration(question, user)
        
        # Discover available agents
        self.logger.log_step("AGENT_DISCOVERY", {
            "registry_url": self.agent_registry,
            "discovering_agents": True
        })
        
        if not self.discover_agents():
            return {
                "error": "Failed to discover agents",
                "orchestration_log": self.logger.get_orchestration_summary()
            }
        
        self.logger.log_step("AGENT_DISCOVERY", {
            "agents_found": len(self.available_agents),
            "available_agents": list(self.available_agents.keys())
        })
        
        # Route question to appropriate agents
        selected_agents = self.route_question(question)
        self.logger.log_step("ROUTING_DECISION", {
            "question": question,
            "selected_agents": selected_agents,
            "routing_reasoning": "Based on keyword analysis and agent capabilities"
        })
        
        # Contact each selected agent
        agent_responses = {}
        for agent_id in selected_agents:
            response = self.contact_agent(agent_id, question)
            agent_responses[agent_id] = response
        
        # Log coordination
        self.logger.log_step("COORDINATION", {
            "agents_contacted": len(selected_agents),
            "successful_responses": len([r for r in agent_responses.values() if "error" not in r]),
            "coordination_strategy": "Parallel agent execution with response aggregation"
        })
        
        # Generate final response
        final_response = self._generate_final_response(question, agent_responses)
        
        self.logger.log_step("ORCHESTRATION_COMPLETE", {
            "final_response_length": len(final_response),
            "total_agents_used": len(selected_agents),
            "orchestration_successful": True,
            "final_response": final_response
        })
        
        # Emit orchestration completion event
        if self.socketio and self.logger.session_id:
            self.socketio.emit('orchestration_complete', {
                'type': 'orchestration_complete',
                'payload': {
                    'question': question,
                    'selected_agents': selected_agents,
                    'agent_responses': agent_responses,
                    'final_response': final_response,
                    'orchestration_log': self.logger.get_orchestration_summary(),
                    'total_time_seconds': self.logger.get_orchestration_summary()['total_time_seconds']
                },
                'timestamp': datetime.now().isoformat(),
                'session_id': self.logger.session_id
            })
        
        return {
            "question": question,
            "selected_agents": selected_agents,
            "agent_responses": agent_responses,
            "final_response": final_response,
            "orchestration_log": self.logger.get_orchestration_summary()
        }
    
    def _generate_final_response(self, question: str, agent_responses: Dict[str, Any]) -> str:
        """Generate final response from agent responses"""
        responses = []
        for agent_id, response in agent_responses.items():
            if "error" not in response:
                agent_name = self.available_agents.get(agent_id, {}).get("name", agent_id)
                agent_response = response.get("response", "")
                responses.append(f"**{agent_name}:**\n{agent_response}")
            else:
                responses.append(f"**{agent_id}:** Error - {response['error']}")
        
        return "\n\n".join(responses)
    
    def setup_routes(self):
        """Setup orchestration routes"""
        
        @self.app.route('/orchestrate', methods=['POST'])
        def orchestrate():
            """Main orchestration endpoint"""
            try:
                data = request.get_json()
                question = data.get('question', '')
                user = data.get('user', 'User')
                
                if not question:
                    return jsonify({"error": "Question is required"}), 400
                
                result = self.orchestrate_question(question, user)
                return jsonify(result)
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/agents', methods=['GET'])
        def list_agents():
            """List available agents"""
            if self.discover_agents():
                return jsonify({
                    "available_agents": self.available_agents,
                    "count": len(self.available_agents)
                })
            else:
                return jsonify({"error": "Failed to discover agents"}), 500
        
        @self.app.route('/health', methods=['GET'])
        def health():
            """Health check"""
            return jsonify({
                "status": "healthy",
                "service": "Central Orchestrator",
                "timestamp": datetime.now().isoformat()
            })
        
        @self.app.route('/orchestration/log', methods=['GET'])
        def get_log():
            """Get orchestration log"""
            return jsonify(self.logger.get_orchestration_summary())
    
    def run(self, port: int = 8005, debug: bool = False):
        """Run the orchestration service with WebSocket support"""
        print(f"🎭 Starting Central Orchestrator on port {port}")
        print(f"🔌 WebSocket support enabled for real-time updates")
        self.socketio.run(self.app, host='0.0.0.0', port=port, debug=debug)

def main():
    """Main function"""
    orchestrator = CentralOrchestrator()
    orchestrator.run(port=8005, debug=False)

if __name__ == "__main__":
    main()
