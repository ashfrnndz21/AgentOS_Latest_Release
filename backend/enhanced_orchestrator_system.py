#!/usr/bin/env python3
"""
Enhanced Orchestrator System
Complete integration of all enhanced components
"""

import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS

from enhanced_query_understanding import EnhancedQueryUnderstanding, QueryAnalysis
from enhanced_agent_registry import EnhancedAgentRegistry, create_example_agents
from enhanced_routing_engine import EnhancedRoutingEngine, ExecutionPlan
from enhanced_execution_engine import EnhancedExecutionEngine

app = Flask(__name__)
CORS(app)

class EnhancedOrchestratorSystem:
    """Complete enhanced orchestrator system"""
    
    def __init__(self):
        # Initialize components
        self.query_understanding = EnhancedQueryUnderstanding()
        self.agent_registry = EnhancedAgentRegistry()
        self.routing_engine = EnhancedRoutingEngine(self.agent_registry)
        self.execution_engine = EnhancedExecutionEngine()
        
        # Load existing agents
        self.agent_registry.load_from_database()
        
        # Only register example agents if none exist AND this is explicitly requested
        # This prevents unwanted agent registration on every startup
        existing_agents = self.agent_registry.get_all_agents()
        if not existing_agents:
            print("📝 No existing agents found in enhanced registry")
            # Uncomment the line below only if you want to register example agents
            # self._register_example_agents()
        else:
            print(f"✅ Found {len(existing_agents)} existing agents in enhanced registry")
    
    def _register_example_agents(self):
        """Register actual agents from your system"""
        from enhanced_agent_registry import AgentMetadata, AgentCapability, InputSchema, OutputSchema
        
        # Get actual agents from your system
        actual_agents = [
            AgentMetadata(
                agent_id="creative_assistant",
                name="Creative Assistant",
                description="Expert in creative writing, storytelling, and innovative content creation.",
                url="http://localhost:11434",  # Ollama endpoint
                capabilities=[AgentCapability.GENERATE_CONTENT],
                input_schema=InputSchema(
                    type="text",
                    required=True,
                    description="Creative prompt or request",
                    max_length=1000,
                    examples=["Write a poem about AI", "Create a story about robots"]
                ),
                output_schema=OutputSchema(
                    type="text",
                    format="structured",
                    description="Creative content output",
                    max_length=5000
                )
            ),
            AgentMetadata(
                agent_id="technical_expert",
                name="Technical Expert",
                description="Focused on technical problem-solving and software development guidance.",
                url="http://localhost:11434",  # Ollama endpoint
                capabilities=[AgentCapability.CODE_GENERATION],
                input_schema=InputSchema(
                    type="text",
                    required=True,
                    description="Technical specification or problem",
                    max_length=2000,
                    examples=["Create a Python function", "Debug this code"]
                ),
                output_schema=OutputSchema(
                    type="code",
                    format="python",
                    description="Generated code with explanations",
                    max_length=10000
                )
            )
        ]
        
        for agent in actual_agents:
            self.agent_registry.register_agent(agent)
    
    async def process_query(self, query: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Complete query processing pipeline"""
        
        try:
            # Step 1: Query Understanding
            print("🧠 Analyzing query...")
            query_analysis = self.query_understanding.analyze_query(query, context)
            
            # Step 2: Agent Discovery
            print("🔍 Discovering available agents...")
            available_agents = self.agent_registry.get_all_agents()
            
            if not available_agents:
                return {
                    "status": "error",
                    "error": "No agents available"
                }
            
            # Step 3: Create Execution Plan
            print("📋 Creating execution plan...")
            execution_plan = self.routing_engine.create_execution_plan(query_analysis, available_agents)
            
            if not execution_plan.assignments:
                return {
                    "status": "error",
                    "error": "No suitable agents found for the query"
                }
            
            # Step 4: Execute Plan
            print("⚡ Executing plan...")
            session_id = f"session_{hash(query) % 10000}"
            execution_result = await self.execution_engine.execute_plan(
                execution_plan, session_id, {"query": query, "context": context}
            )
            
            # Step 5: Synthesize Response
            print("🎯 Synthesizing response...")
            final_response = await self._synthesize_response(query_analysis, execution_result)
            
            return final_response
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _synthesize_response(self, query_analysis: QueryAnalysis, 
                                 execution_result: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize final response from execution results"""
        
        if execution_result["status"] != "success":
            return execution_result
        
        # Extract results from execution
        task_results = execution_result.get("results", {})
        
        # Create structured response
        response = {
            "status": "success",
            "query": query_analysis.original_query,
            "analysis": {
                "task_types": [task.value for task in query_analysis.task_types],
                "complexity": query_analysis.complexity,
                "execution_strategy": query_analysis.execution_strategy,
                "multi_agent": query_analysis.requires_multiple_agents
            },
            "execution_summary": execution_result.get("execution_summary", {}),
            "results": {},
            "synthesis": {
                "combined_output": "",
                "key_findings": [],
                "recommendations": []
            }
        }
        
        # Process individual task results
        for task_id, task_result in task_results.items():
            if isinstance(task_result, dict) and "result" in task_result:
                response["results"][task_id] = {
                    "agent": task_result.get("agent_id"),
                    "output": task_result.get("result", {}).get("output", ""),
                    "execution_time": task_result.get("execution_time", 0),
                    "quality_score": task_result.get("quality_score", 0)
                }
        
        # Generate synthesis
        response["synthesis"] = await self._generate_synthesis(query_analysis, response["results"])
        
        return response
    
    async def _generate_synthesis(self, query_analysis: QueryAnalysis, 
                                results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate synthesis of multiple task results"""
        
        synthesis = {
            "combined_output": "",
            "key_findings": [],
            "recommendations": []
        }
        
        # Combine outputs based on task types
        outputs = []
        for task_id, result in results.items():
            if result.get("output"):
                outputs.append(result["output"])
        
        if outputs:
            synthesis["combined_output"] = "\n\n".join(outputs)
        
        # Extract key findings
        synthesis["key_findings"] = [
            f"Completed {len(results)} tasks successfully",
            f"Total execution time: {sum(r.get('execution_time', 0) for r in results.values()):.1f}s",
            f"Average quality score: {sum(r.get('quality_score', 0) for r in results.values()) / len(results):.2f}"
        ]
        
        # Generate recommendations
        if query_analysis.complexity == "complex":
            synthesis["recommendations"].append("Consider breaking down into smaller tasks for better results")
        
        if len(results) > 1:
            synthesis["recommendations"].append("Multi-agent collaboration completed successfully")
        
        return synthesis

# Initialize system
orchestrator_system = EnhancedOrchestratorSystem()

# Flask API endpoints
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "enhanced-orchestrator-system",
        "agents_registered": len(orchestrator_system.agent_registry.get_all_agents()),
        "timestamp": json.dumps(datetime.now().isoformat())
    })

@app.route('/api/query/analyze', methods=['POST'])
def analyze_query():
    """Analyze query without execution"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        context = data.get('context')
        
        if not query:
            return jsonify({"status": "error", "error": "Query is required"}), 400
        
        analysis = orchestrator_system.query_understanding.analyze_query(query, context)
        
        return jsonify({
            "status": "success",
            "analysis": {
                "task_types": [task.value for task in analysis.task_types],
                "input_type": analysis.input_type.value,
                "complexity": analysis.complexity,
                "requires_multiple_agents": analysis.requires_multiple_agents,
                "execution_strategy": analysis.execution_strategy,
                "dependencies": analysis.dependencies,
                "context_requirements": analysis.context_requirements
            }
        })
        
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/agents', methods=['GET'])
def get_agents():
    """Get all registered agents"""
    agents = orchestrator_system.agent_registry.get_all_agents()
    
    return jsonify({
        "status": "success",
        "agents": [
            {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "description": agent.description,
                "url": agent.url,
                "capabilities": [cap.value for cap in agent.capabilities],
                "status": agent.status
            }
            for agent in agents
        ]
    })

@app.route('/api/agents/register', methods=['POST'])
def register_agent():
    """Register a new agent"""
    try:
        data = request.get_json()
        
        # Create agent metadata from request
        from enhanced_agent_registry import AgentMetadata, AgentCapability, InputSchema, OutputSchema
        
        agent_metadata = AgentMetadata(
            agent_id=data.get('agent_id'),
            name=data.get('name'),
            description=data.get('description'),
            url=data.get('url'),
            capabilities=[AgentCapability(cap) for cap in data.get('capabilities', [])],
            input_schema=InputSchema(**data.get('input_schema', {})),
            output_schema=OutputSchema(**data.get('output_schema', {}))
        )
        
        result = orchestrator_system.agent_registry.register_agent(agent_metadata)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/orchestrate', methods=['POST'])
def orchestrate():
    """Main orchestration endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        context = data.get('context')
        
        if not query:
            return jsonify({"status": "error", "error": "Query is required"}), 400
        
        # Run async orchestration
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(orchestrator_system.process_query(query, context))
        loop.close()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/execution/status/<session_id>', methods=['GET'])
def get_execution_status(session_id):
    """Get execution status for a session"""
    status = orchestrator_system.execution_engine.get_execution_status(session_id)
    return jsonify(status)

if __name__ == '__main__':
    print("🚀 Starting Enhanced Orchestrator System...")
    print("📍 Port: 5033")
    print("🧠 Query Understanding: Enabled")
    print("🔍 Agent Registry: Enhanced")
    print("📋 Routing Engine: Intelligent")
    print("⚡ Execution Engine: Multi-agent")
    
    app.run(host='0.0.0.0', port=5034, debug=False)
