#!/usr/bin/env python3
"""
Base A2A Server
Provides the foundation for creating independent A2A servers
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit

# Strands SDK Integration
try:
    from strands import Agent, tool
    from strands.models.ollama import OllamaModel
    STRANDS_SDK_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Strands SDK not available: {e}")
    STRANDS_SDK_AVAILABLE = False

class BaseA2AServer:
    """Base class for A2A servers"""
    
    def __init__(self, agent_name: str, port: int, host: str = "0.0.0.0"):
        self.agent_name = agent_name
        self.port = port
        self.host = host
        self.agent = None
        self.app = Flask(__name__)
        CORS(self.app)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        self.setup_routes()
    
    def setup_routes(self):
        """Setup A2A server routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                "status": "healthy",
                "agent_name": self.agent_name,
                "port": self.port,
                "timestamp": datetime.now().isoformat()
            })
        
        @self.app.route('/capabilities', methods=['GET'])
        def get_capabilities():
            """Get agent capabilities"""
            if self.agent:
                return jsonify({
                    "agent_name": self.agent_name,
                    "capabilities": getattr(self.agent, 'tools', []),
                    "description": getattr(self.agent, 'description', ''),
                    "status": "active"
                })
            return jsonify({"error": "Agent not initialized"}), 500
        
        @self.app.route('/execute', methods=['POST'])
        def execute_agent():
            """Execute agent with input"""
            try:
                data = request.get_json()
                input_text = data.get('input', '')
                
                if not self.agent:
                    return jsonify({"error": "Agent not initialized"}), 500
                
                # Execute agent
                start_time = datetime.now()
                response = self.agent(input_text)
                execution_time = (datetime.now() - start_time).total_seconds()
                
                return jsonify({
                    "agent_name": self.agent_name,
                    "response": str(response),
                    "execution_time": execution_time,
                    "timestamp": datetime.now().isoformat(),
                    "status": "success"
                })
                
            except Exception as e:
                return jsonify({
                    "error": str(e),
                    "agent_name": self.agent_name,
                    "status": "error"
                }), 500
        
        @self.app.route('/a2a/message', methods=['POST'])
        def a2a_message():
            """Handle A2A messages from other agents"""
            try:
                data = request.get_json()
                from_agent = data.get('from_agent', 'unknown')
                message = data.get('message', '')
                
                if not self.agent:
                    return jsonify({"error": "Agent not initialized"}), 500
                
                # Process A2A message
                a2a_input = f"A2A Message from {from_agent}: {message}"
                start_time = datetime.now()
                response = self.agent(a2a_input)
                execution_time = (datetime.now() - start_time).total_seconds()
                
                return jsonify({
                    "agent_name": self.agent_name,
                    "from_agent": from_agent,
                    "original_message": message,
                    "response": str(response),
                    "execution_time": execution_time,
                    "timestamp": datetime.now().isoformat(),
                    "status": "success"
                })
                
            except Exception as e:
                return jsonify({
                    "error": str(e),
                    "agent_name": self.agent_name,
                    "status": "error"
                }), 500
    
    def create_agent(self, system_prompt: str, tools: List[str] = None, model_id: str = "llama3.2:latest"):
        """Create the Strands agent"""
        if not STRANDS_SDK_AVAILABLE:
            raise Exception("Strands SDK not available")
        
        # Create Ollama model
        model = OllamaModel(
            model_id=model_id,
            host="http://localhost:11434"
        )
        
        # Create agent with tools
        agent_tools = []
        if tools:
            for tool_name in tools:
                if tool_name == "calculator":
                    agent_tools.append(self._create_calculator_tool())
                elif tool_name == "current_time":
                    agent_tools.append(self._create_time_tool())
                elif tool_name == "think":
                    agent_tools.append(self._create_think_tool())
        
        self.agent = Agent(
            name=self.agent_name,
            system_prompt=system_prompt,
            model=model,
            tools=agent_tools
        )
        
        print(f"✅ {self.agent_name} agent created with tools: {tools}")
    
    def _create_calculator_tool(self):
        """Create calculator tool"""
        @tool
        def calculator(expression: str) -> str:
            """Calculate mathematical expressions safely"""
            try:
                # Safe evaluation of mathematical expressions
                allowed_chars = set('0123456789+-*/()., ')
                if not all(c in allowed_chars for c in expression):
                    return "Error: Invalid characters in expression"
                
                result = eval(expression)
                return f"Result: {result}"
            except Exception as e:
                return f"Error: {str(e)}"
        
        return calculator
    
    def _create_time_tool(self):
        """Create current time tool"""
        @tool
        def current_time() -> str:
            """Get current date and time"""
            now = datetime.now()
            return f"Current time: {now.strftime('%Y-%m-%d %H:%M:%S')}"
        
        return current_time
    
    def _create_think_tool(self):
        """Create think tool"""
        @tool
        def think(thought: str) -> str:
            """Think through a problem step by step"""
            return f"Thinking: {thought}\nThis requires careful analysis and consideration of multiple factors."
        
        return think
    
    def run(self):
        """Run the A2A server"""
        print(f"🚀 Starting {self.agent_name} A2A Server on port {self.port}")
        self.socketio.run(self.app, host=self.host, port=self.port, debug=False, allow_unsafe_werkzeug=True)












