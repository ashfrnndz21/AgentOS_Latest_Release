"""
Strands Intelligence API Backend
Provides advanced AI agent reasoning, multi-agent orchestration, and workflow execution
Based on Amazon Strands Agents SDK principles
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import sqlite3
import uuid
import asyncio
import aiohttp
from datetime import datetime
import logging
from typing import Dict, List, Any, Optional
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
STRANDS_DATABASE_PATH = "strands_agents.db"

def init_strands_database():
    """Initialize SQLite database for Strands agents"""
    conn = sqlite3.connect(STRANDS_DATABASE_PATH)
    cursor = conn.cursor()
    
    # Strands agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT,
            description TEXT,
            
            -- Core Configuration
            system_prompt TEXT,
            model TEXT NOT NULL,
            temperature REAL DEFAULT 0.7,
            max_tokens INTEGER DEFAULT 1000,
            
            -- Strands Reasoning Configuration
            reasoning_pattern TEXT DEFAULT 'sequential',
            reflection_enabled BOOLEAN DEFAULT TRUE,
            chain_of_thought_depth INTEGER DEFAULT 3,
            
            -- Tool Configuration
            tools_config TEXT, -- JSON
            tool_selection_strategy TEXT DEFAULT 'automatic',
            mcp_servers TEXT,  -- JSON
            
            -- Multi-Agent Configuration
            agent_architecture TEXT DEFAULT 'single',
            delegation_rules TEXT, -- JSON
            communication_protocol TEXT DEFAULT 'direct',
            
            -- Observability Configuration
            telemetry_enabled BOOLEAN DEFAULT TRUE,
            tracing_level TEXT DEFAULT 'basic',
            metrics_collection TEXT, -- JSON
            
            -- Execution Configuration
            execution_mode TEXT DEFAULT 'local',
            resource_limits TEXT, -- JSON
            error_handling TEXT, -- JSON
            
            -- Source Information
            source_type TEXT DEFAULT 'strands_native',
            source_agent_id TEXT,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Strands executions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_executions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            input_text TEXT NOT NULL,
            output_text TEXT,
            
            -- Strands Execution Data
            reasoning_trace TEXT, -- JSON - Chain of thought
            tools_used TEXT,      -- JSON - Tools called
            reflection_steps TEXT, -- JSON - Reflection iterations
            
            -- Performance Metrics
            execution_time INTEGER,
            tokens_used INTEGER,
            tool_calls_count INTEGER,
            reflection_iterations INTEGER,
            llm_calls_count INTEGER,
            
            success BOOLEAN DEFAULT FALSE,
            error_message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (agent_id) REFERENCES strands_agents (id)
        )
    ''')
    
    # Strands workflows table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            
            -- Multi-Agent Configuration
            agents TEXT,          -- JSON - Agent IDs and roles
            architecture TEXT DEFAULT 'supervisor',    -- 'supervisor' | 'swarm' | 'hierarchical'
            communication_flow TEXT, -- JSON - How agents communicate
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_strands_database()

class StrandsLLMClient:
    """Client for communicating with Ollama Core for LLM inference"""
    
    def __init__(self):
        self.ollama_base_url = OLLAMA_BASE_URL
    
    async def generate_response(self, model: str, prompt: str, **kwargs) -> Dict[str, Any]:
        """Direct call to Ollama Core for LLM inference"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": kwargs.get('temperature', 0.7),
                        "num_predict": kwargs.get('max_tokens', 1000)
                    }
                }
                
                async with session.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=300)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            'response': result.get('response', ''),
                            'tokens_used': result.get('eval_count', 0),
                            'total_duration': result.get('total_duration', 0),
                            'success': True
                        }
                    else:
                        return {
                            'response': '',
                            'tokens_used': 0,
                            'error': f'Ollama API error: {response.status}',
                            'success': False
                        }
        except Exception as e:
            logger.error(f"Error calling Ollama: {str(e)}")
            return {
                'response': '',
                'tokens_used': 0,
                'error': str(e),
                'success': False
            }
    
    def generate_response_sync(self, model: str, prompt: str, **kwargs) -> Dict[str, Any]:
        """Synchronous wrapper for generate_response"""
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": kwargs.get('temperature', 0.7, timeout=30),
                        "num_predict": kwargs.get('max_tokens', 1000)
                    }
                },
                timeout=300
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'response': result.get('response', ''),
                    'tokens_used': result.get('eval_count', 0),
                    'total_duration': result.get('total_duration', 0),
                    'success': True
                }
            else:
                return {
                    'response': '',
                    'tokens_used': 0,
                    'error': f'Ollama API error: {response.status_code}',
                    'success': False
                }
        except Exception as e:
            logger.error(f"Error calling Ollama: {str(e)}")
            return {
                'response': '',
                'tokens_used': 0,
                'error': str(e),
                'success': False
            }

class StrandsReasoningEngine:
    """Core Strands reasoning engine implementing Amazon Strands SDK patterns"""
    
    def __init__(self):
        self.llm_client = StrandsLLMClient()
    
    def execute_agent(self, agent_config: Dict[str, Any], input_text: str) -> Dict[str, Any]:
        """Execute Strands agent with specified reasoning pattern"""
        reasoning_pattern = agent_config.get('reasoning_pattern', 'sequential')
        
        if reasoning_pattern == 'sequential':
            return self.execute_sequential_reasoning(agent_config, input_text)
        elif reasoning_pattern == 'adaptive':
            return self.execute_adaptive_reasoning(agent_config, input_text)
        elif reasoning_pattern == 'parallel':
            return self.execute_parallel_reasoning(agent_config, input_text)
        else:
            return self.execute_sequential_reasoning(agent_config, input_text)
    
    def execute_sequential_reasoning(self, agent_config: Dict[str, Any], input_text: str) -> Dict[str, Any]:
        """Execute sequential reasoning pattern (ReAct-style)"""
        reasoning_trace = []
        current_context = input_text
        total_tokens = 0
        llm_calls = 0
        
        try:
            # Step 1: Initial planning
            planning_prompt = self.build_planning_prompt(agent_config, input_text)
            
            planning_response = self.llm_client.generate_response_sync(
                model=agent_config['model'],
                prompt=planning_prompt,
                temperature=agent_config.get('temperature', 0.7),
                max_tokens=agent_config.get('max_tokens', 1000)
            )
            
            if not planning_response['success']:
                return self.create_error_result(f"Planning failed: {planning_response['error']}")
            
            llm_calls += 1
            total_tokens += planning_response['tokens_used']
            
            reasoning_trace.append({
                'step': 1,
                'type': 'planning',
                'prompt': planning_prompt,
                'response': planning_response['response'],
                'tokens_used': planning_response['tokens_used'],
                'timestamp': datetime.now().isoformat()
            })
            
            # Step 2: Execute planned actions
            planned_actions = self.parse_planned_actions(planning_response['response'])
            
            for i, action in enumerate(planned_actions[:agent_config.get('chain_of_thought_depth', 3)]):
                if action['type'] == 'tool_call':
                    # Tool execution (placeholder - would integrate with actual tools)
                    tool_result = self.execute_tool_placeholder(action['tool'], action.get('params', {}))
                    reasoning_trace.append({
                        'step': len(reasoning_trace) + 1,
                        'type': 'tool_execution',
                        'tool': action['tool'],
                        'input': action.get('params', {}),
                        'output': tool_result,
                        'timestamp': datetime.now().isoformat()
                    })
                    current_context += f"\nTool result: {tool_result}"
                
                elif action['type'] == 'reflection' and agent_config.get('reflection_enabled', True):
                    reflection_prompt = self.build_reflection_prompt(agent_config, current_context, input_text)
                    
                    reflection_response = self.llm_client.generate_response_sync(
                        model=agent_config['model'],
                        prompt=reflection_prompt,
                        temperature=agent_config.get('temperature', 0.7)
                    )
                    
                    if reflection_response['success']:
                        llm_calls += 1
                        total_tokens += reflection_response['tokens_used']
                        
                        reasoning_trace.append({
                            'step': len(reasoning_trace) + 1,
                            'type': 'reflection',
                            'prompt': reflection_prompt,
                            'response': reflection_response['response'],
                            'tokens_used': reflection_response['tokens_used'],
                            'timestamp': datetime.now().isoformat()
                        })
                        
                        current_context += f"\nReflection: {reflection_response['response']}"
            
            # Step 3: Generate final response
            final_prompt = self.build_final_response_prompt(agent_config, current_context, input_text)
            
            final_response = self.llm_client.generate_response_sync(
                model=agent_config['model'],
                prompt=final_prompt,
                temperature=agent_config.get('temperature', 0.7)
            )
            
            if not final_response['success']:
                return self.create_error_result(f"Final response failed: {final_response['error']}")
            
            llm_calls += 1
            total_tokens += final_response['tokens_used']
            
            reasoning_trace.append({
                'step': len(reasoning_trace) + 1,
                'type': 'final_response',
                'prompt': final_prompt,
                'response': final_response['response'],
                'tokens_used': final_response['tokens_used'],
                'timestamp': datetime.now().isoformat()
            })
            
            return {
                'final_answer': final_response['response'],
                'reasoning_trace': reasoning_trace,
                'total_tokens': total_tokens,
                'total_steps': len(reasoning_trace),
                'llm_calls': llm_calls,
                'tools_used': self.extract_tools_used(reasoning_trace),
                'reflection_steps': self.extract_reflections(reasoning_trace),
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Error in sequential reasoning: {str(e)}")
            return self.create_error_result(str(e))
    
    def execute_adaptive_reasoning(self, agent_config: Dict[str, Any], input_text: str) -> Dict[str, Any]:
        """Execute adaptive reasoning pattern (adjusts strategy based on progress)"""
        # Simplified adaptive reasoning - starts with planning, adapts based on results
        reasoning_trace = []
        current_context = input_text
        total_tokens = 0
        llm_calls = 0
        
        try:
            # Initial assessment
            assessment_prompt = f"""
            You are {agent_config.get('role', 'an AI assistant')}.
            System: {agent_config.get('system_prompt', '')}
            
            Task: {input_text}
            
            Assess this task and determine the best approach:
            1. Simple direct response
            2. Multi-step reasoning required
            3. Tool usage needed
            4. Complex analysis required
            
            Provide your assessment and recommended approach.
            """
            
            assessment_response = self.llm_client.generate_response_sync(
                model=agent_config['model'],
                prompt=assessment_prompt,
                temperature=agent_config.get('temperature', 0.7)
            )
            
            if not assessment_response['success']:
                return self.create_error_result(f"Assessment failed: {assessment_response['error']}")
            
            llm_calls += 1
            total_tokens += assessment_response['tokens_used']
            
            reasoning_trace.append({
                'step': 1,
                'type': 'assessment',
                'prompt': assessment_prompt,
                'response': assessment_response['response'],
                'tokens_used': assessment_response['tokens_used'],
                'timestamp': datetime.now().isoformat()
            })
            
            # Adapt strategy based on assessment
            if 'simple' in assessment_response['response'].lower():
                # Direct response
                final_response = self.llm_client.generate_response_sync(
                    model=agent_config['model'],
                    prompt=f"{agent_config.get('system_prompt', '')}\n\nTask: {input_text}\n\nResponse:",
                    temperature=agent_config.get('temperature', 0.7)
                )
                
                if final_response['success']:
                    llm_calls += 1
                    total_tokens += final_response['tokens_used']
                    
                    reasoning_trace.append({
                        'step': 2,
                        'type': 'direct_response',
                        'response': final_response['response'],
                        'tokens_used': final_response['tokens_used'],
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    return {
                        'final_answer': final_response['response'],
                        'reasoning_trace': reasoning_trace,
                        'total_tokens': total_tokens,
                        'llm_calls': llm_calls,
                        'strategy': 'direct',
                        'success': True
                    }
            else:
                # Fall back to sequential reasoning for complex tasks
                return self.execute_sequential_reasoning(agent_config, input_text)
            
        except Exception as e:
            logger.error(f"Error in adaptive reasoning: {str(e)}")
            return self.create_error_result(str(e))
    
    def execute_parallel_reasoning(self, agent_config: Dict[str, Any], input_text: str) -> Dict[str, Any]:
        """Execute parallel reasoning pattern (multiple reasoning paths)"""
        # Simplified parallel reasoning - break task into subtasks
        reasoning_trace = []
        total_tokens = 0
        llm_calls = 0
        
        try:
            # Break down task
            breakdown_prompt = f"""
            You are {agent_config.get('role', 'an AI assistant')}.
            System: {agent_config.get('system_prompt', '')}
            
            Task: {input_text}
            
            Break this task into 2-3 independent subtasks that can be worked on in parallel.
            Format your response as:
            SUBTASK 1: [description]
            SUBTASK 2: [description]
            SUBTASK 3: [description] (if needed)
            """
            
            breakdown_response = self.llm_client.generate_response_sync(
                model=agent_config['model'],
                prompt=breakdown_prompt,
                temperature=agent_config.get('temperature', 0.7)
            )
            
            if not breakdown_response['success']:
                return self.create_error_result(f"Task breakdown failed: {breakdown_response['error']}")
            
            llm_calls += 1
            total_tokens += breakdown_response['tokens_used']
            
            reasoning_trace.append({
                'step': 1,
                'type': 'task_breakdown',
                'prompt': breakdown_prompt,
                'response': breakdown_response['response'],
                'tokens_used': breakdown_response['tokens_used'],
                'timestamp': datetime.now().isoformat()
            })
            
            # Execute subtasks
            subtasks = self.parse_subtasks(breakdown_response['response'])
            subtask_results = []
            
            for i, subtask in enumerate(subtasks):
                subtask_prompt = f"""
                You are {agent_config.get('role', 'an AI assistant')}.
                System: {agent_config.get('system_prompt', '')}
                
                Original task: {input_text}
                Your subtask: {subtask}
                
                Complete this subtask:
                """
                
                subtask_response = self.llm_client.generate_response_sync(
                    model=agent_config['model'],
                    prompt=subtask_prompt,
                    temperature=agent_config.get('temperature', 0.7)
                )
                
                if subtask_response['success']:
                    llm_calls += 1
                    total_tokens += subtask_response['tokens_used']
                    
                    reasoning_trace.append({
                        'step': len(reasoning_trace) + 1,
                        'type': 'subtask_execution',
                        'subtask': subtask,
                        'response': subtask_response['response'],
                        'tokens_used': subtask_response['tokens_used'],
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    subtask_results.append(subtask_response['response'])
            
            # Synthesize results
            synthesis_prompt = f"""
            You are {agent_config.get('role', 'an AI assistant')}.
            System: {agent_config.get('system_prompt', '')}
            
            Original task: {input_text}
            
            Subtask results:
            {chr(10).join(f"Result {i+1}: {result}" for i, result in enumerate(subtask_results))}
            
            Synthesize these results into a comprehensive final answer:
            """
            
            synthesis_response = self.llm_client.generate_response_sync(
                model=agent_config['model'],
                prompt=synthesis_prompt,
                temperature=agent_config.get('temperature', 0.7)
            )
            
            if not synthesis_response['success']:
                return self.create_error_result(f"Synthesis failed: {synthesis_response['error']}")
            
            llm_calls += 1
            total_tokens += synthesis_response['tokens_used']
            
            reasoning_trace.append({
                'step': len(reasoning_trace) + 1,
                'type': 'synthesis',
                'prompt': synthesis_prompt,
                'response': synthesis_response['response'],
                'tokens_used': synthesis_response['tokens_used'],
                'timestamp': datetime.now().isoformat()
            })
            
            return {
                'final_answer': synthesis_response['response'],
                'reasoning_trace': reasoning_trace,
                'total_tokens': total_tokens,
                'llm_calls': llm_calls,
                'subtasks': subtasks,
                'subtask_results': subtask_results,
                'strategy': 'parallel',
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Error in parallel reasoning: {str(e)}")
            return self.create_error_result(str(e))
    
    def build_planning_prompt(self, agent_config: Dict[str, Any], input_text: str) -> str:
        """Build planning prompt for sequential reasoning"""
        return f"""
You are {agent_config.get('role', 'an AI assistant')}.
System: {agent_config.get('system_prompt', '')}

Task: {input_text}

Plan your approach step by step. Consider:
1. What information do you need?
2. What tools might be helpful?
3. What reasoning steps are required?
4. How will you verify your answer?

Available tools: {agent_config.get('tools_config', '[]')}

Provide a clear plan with specific actions you will take.
"""
    
    def build_reflection_prompt(self, agent_config: Dict[str, Any], current_context: str, original_input: str) -> str:
        """Build reflection prompt"""
        return f"""
You are {agent_config.get('role', 'an AI assistant')}.
System: {agent_config.get('system_prompt', '')}

Original task: {original_input}
Current progress: {current_context}

Reflect on your progress so far:
1. Are you on the right track?
2. What have you learned?
3. What should you do next?
4. Are there any issues or concerns?

Provide your reflection and next steps.
"""
    
    def build_final_response_prompt(self, agent_config: Dict[str, Any], current_context: str, original_input: str) -> str:
        """Build final response prompt"""
        return f"""
You are {agent_config.get('role', 'an AI assistant')}.
System: {agent_config.get('system_prompt', '')}

Original task: {original_input}
Work completed: {current_context}

Based on all the work above, provide your final comprehensive answer to the original task.
Be clear, accurate, and helpful.
"""
    
    def parse_planned_actions(self, planning_response: str) -> List[Dict[str, Any]]:
        """Parse planned actions from planning response"""
        actions = []
        
        # Simple parsing - look for action indicators
        if 'tool' in planning_response.lower() or 'search' in planning_response.lower():
            actions.append({'type': 'tool_call', 'tool': 'web_search', 'params': {}})
        
        if 'reflect' in planning_response.lower() or 'think' in planning_response.lower():
            actions.append({'type': 'reflection'})
        
        # If no specific actions found, add a reflection step
        if not actions:
            actions.append({'type': 'reflection'})
        
        return actions
    
    def parse_subtasks(self, breakdown_response: str) -> List[str]:
        """Parse subtasks from breakdown response"""
        subtasks = []
        lines = breakdown_response.split('\n')
        
        for line in lines:
            if 'SUBTASK' in line.upper() and ':' in line:
                subtask = line.split(':', 1)[1].strip()
                if subtask:
                    subtasks.append(subtask)
        
        # If no subtasks found, return the original as a single task
        if not subtasks:
            subtasks.append(breakdown_response.strip())
        
        return subtasks[:3]  # Limit to 3 subtasks
    
    def execute_tool_placeholder(self, tool_name: str, params: Dict[str, Any]) -> str:
        """Placeholder for tool execution - would integrate with actual tools/MCP"""
        return f"Tool '{tool_name}' executed with params {params}. Result: [Tool execution would happen here]"
    
    def extract_tools_used(self, reasoning_trace: List[Dict[str, Any]]) -> List[str]:
        """Extract list of tools used from reasoning trace"""
        tools = []
        for step in reasoning_trace:
            if step.get('type') == 'tool_execution':
                tools.append(step.get('tool', 'unknown'))
        return tools
    
    def extract_reflections(self, reasoning_trace: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract reflection steps from reasoning trace"""
        reflections = []
        for step in reasoning_trace:
            if step.get('type') == 'reflection':
                reflections.append({
                    'step': step.get('step'),
                    'response': step.get('response'),
                    'timestamp': step.get('timestamp')
                })
        return reflections
    
    def create_error_result(self, error_message: str) -> Dict[str, Any]:
        """Create standardized error result"""
        return {
            'final_answer': f"I apologize, but I encountered an error: {error_message}",
            'reasoning_trace': [],
            'total_tokens': 0,
            'total_steps': 0,
            'llm_calls': 0,
            'tools_used': [],
            'reflection_steps': [],
            'success': False,
            'error': error_message
        }

# Initialize reasoning engine
strands_reasoning_engine = StrandsReasoningEngine()

# API Routes

@app.route('/api/strands/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check if Ollama Core is running
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        ollama_status = "running" if response.status_code == 200 else "error"
        models = response.json().get("models", []) if ollama_status == "running" else []
        
        return jsonify({
            "strands_api": "running",
            "ollama_core": ollama_status,
            "models_available": len(models),
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "strands_api": "running",
            "ollama_core": "not_available",
            "models_available": 0,
            "database": "connected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 503

@app.route('/api/strands/agents', methods=['POST'])
def create_strands_agent():
    """Create a new Strands agent"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('model'):
            return jsonify({"error": "Name and model are required"}), 400
        
        # Generate agent ID
        agent_id = str(uuid.uuid4())
        
        # Store in database
        conn = sqlite3.connect(STRANDS_DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO strands_agents (
                id, name, role, description, system_prompt, model, temperature, max_tokens,
                reasoning_pattern, reflection_enabled, chain_of_thought_depth,
                tools_config, tool_selection_strategy, mcp_servers,
                agent_architecture, delegation_rules, communication_protocol,
                telemetry_enabled, tracing_level, metrics_collection,
                execution_mode, resource_limits, error_handling,
                source_type, source_agent_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            data.get('name'),
            data.get('role', 'AI Assistant'),
            data.get('description', ''),
            data.get('system_prompt', ''),
            data.get('model'),
            data.get('temperature', 0.7),
            data.get('max_tokens', 1000),
            data.get('reasoning_pattern', 'sequential'),
            data.get('reflection_enabled', True),
            data.get('chain_of_thought_depth', 3),
            json.dumps(data.get('tools_config', [])),
            data.get('tool_selection_strategy', 'automatic'),
            json.dumps(data.get('mcp_servers', [])),
            data.get('agent_architecture', 'single'),
            json.dumps(data.get('delegation_rules', [])),
            data.get('communication_protocol', 'direct'),
            data.get('telemetry_enabled', True),
            data.get('tracing_level', 'basic'),
            json.dumps(data.get('metrics_collection', [])),
            data.get('execution_mode', 'local'),
            json.dumps(data.get('resource_limits', {})),
            json.dumps(data.get('error_handling', {})),
            data.get('source_type', 'strands_native'),
            data.get('source_agent_id', None)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "agent": {
                "id": agent_id,
                "name": data.get('name'),
                "role": data.get('role', 'AI Assistant'),
                "description": data.get('description', ''),
                "model": data.get('model'),
                "reasoning_pattern": data.get('reasoning_pattern', 'sequential'),
                "created_at": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error creating Strands agent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/strands/agents', methods=['GET'])
def list_strands_agents():
    """List all Strands agents"""
    try:
        conn = sqlite3.connect(STRANDS_DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_agents ORDER BY created_at DESC')
        rows = cursor.fetchall()
        
        agents = []
        for row in rows:
            agent = {
                "id": row[0],
                "name": row[1],
                "role": row[2],
                "description": row[3],
                "system_prompt": row[4],
                "model": row[5],
                "temperature": row[6],
                "max_tokens": row[7],
                "reasoning_pattern": row[8],
                "reflection_enabled": bool(row[9]),
                "chain_of_thought_depth": row[10],
                "tools_config": json.loads(row[11]) if row[11] else [],
                "tool_selection_strategy": row[12],
                "mcp_servers": json.loads(row[13]) if row[13] else [],
                "agent_architecture": row[14],
                "delegation_rules": json.loads(row[15]) if row[15] else [],
                "communication_protocol": row[16],
                "telemetry_enabled": bool(row[17]),
                "tracing_level": row[18],
                "metrics_collection": json.loads(row[19]) if row[19] else [],
                "execution_mode": row[20],
                "resource_limits": json.loads(row[21]) if row[21] else {},
                "error_handling": json.loads(row[22]) if row[22] else {},
                "source_type": row[23],
                "source_agent_id": row[24],
                "created_at": row[25],
                "updated_at": row[26]
            }
            agents.append(agent)
        
        conn.close()
        
        return jsonify({"agents": agents})
        
    except Exception as e:
        logger.error(f"Error listing Strands agents: {str(e)}")
        return jsonify({"agents": []}), 500

@app.route('/api/strands/agents/<agent_id>', methods=['DELETE'])
def delete_strands_agent(agent_id):
    """Delete a Strands agent"""
    try:
        conn = sqlite3.connect(STRANDS_DATABASE_PATH)
        cursor = conn.cursor()
        
        # Check if agent exists
        cursor.execute('SELECT id FROM strands_agents WHERE id = ?', (agent_id,))
        agent = cursor.fetchone()
        
        if not agent:
            conn.close()
            return jsonify({"error": "Agent not found"}), 404
        
        # Delete the agent
        cursor.execute('DELETE FROM strands_agents WHERE id = ?', (agent_id,))
        conn.commit()
        conn.close()
        
        logger.info(f"Deleted Strands agent: {agent_id}")
        return jsonify({"success": True, "message": f"Agent {agent_id} deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error deleting Strands agent {agent_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/strands/agents/<agent_id>/execute', methods=['POST'])
def execute_strands_agent(agent_id):
    """Execute a Strands agent with advanced reasoning"""
    try:
        data = request.json
        input_text = data.get('input', '')
        
        if not input_text:
            return jsonify({"error": "Input is required"}), 400
        
        # Get agent from database
        conn = sqlite3.connect(STRANDS_DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_agents WHERE id = ?', (agent_id,))
        agent_row = cursor.fetchone()
        
        if not agent_row:
            conn.close()
            return jsonify({"error": "Strands agent not found"}), 404
        
        # Build agent config
        agent_config = {
            'id': agent_row[0],
            'name': agent_row[1],
            'role': agent_row[2],
            'description': agent_row[3],
            'system_prompt': agent_row[4],
            'model': agent_row[5],
            'temperature': agent_row[6],
            'max_tokens': agent_row[7],
            'reasoning_pattern': agent_row[8],
            'reflection_enabled': bool(agent_row[9]),
            'chain_of_thought_depth': agent_row[10],
            'tools_config': json.loads(agent_row[11]) if agent_row[11] else [],
            'tool_selection_strategy': agent_row[12],
            'mcp_servers': json.loads(agent_row[13]) if agent_row[13] else []
        }
        
        # Execute with Strands reasoning engine
        start_time = datetime.now()
        result = strands_reasoning_engine.execute_agent(agent_config, input_text)
        end_time = datetime.now()
        
        execution_time = int((end_time - start_time).total_seconds() * 1000)
        execution_id = str(uuid.uuid4())
        
        # Store execution trace
        cursor.execute('''
            INSERT INTO strands_executions (
                id, agent_id, input_text, output_text, reasoning_trace, tools_used,
                reflection_steps, execution_time, tokens_used, tool_calls_count,
                reflection_iterations, llm_calls_count, success, error_message, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            execution_id,
            agent_id,
            input_text,
            result.get('final_answer', ''),
            json.dumps(result.get('reasoning_trace', [])),
            json.dumps(result.get('tools_used', [])),
            json.dumps(result.get('reflection_steps', [])),
            execution_time,
            result.get('total_tokens', 0),
            len(result.get('tools_used', [])),
            len(result.get('reflection_steps', [])),
            result.get('llm_calls', 0),
            result.get('success', False),
            result.get('error', None)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "id": execution_id,
            "agentId": agent_id,
            "input": input_text,
            "output": result.get('final_answer', ''),
            "success": result.get('success', False),
            "duration": execution_time,
            "tokensUsed": result.get('total_tokens', 0),
            "llmCalls": result.get('llm_calls', 0),
            "toolsUsed": result.get('tools_used', []),
            "reflectionSteps": len(result.get('reflection_steps', [])),
            "reasoningTrace": result.get('reasoning_trace', []),
            "timestamp": end_time.isoformat(),
            "metadata": {
                "reasoning_pattern": agent_config['reasoning_pattern'],
                "model": agent_config['model'],
                "total_steps": result.get('total_steps', 0),
                "strategy": result.get('strategy', 'sequential')
            }
        })
        
    except Exception as e:
        logger.error(f"Error executing Strands agent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/strands/agents/<agent_id>/metrics', methods=['GET'])
def get_strands_agent_metrics(agent_id):
    """Get performance metrics for a Strands agent"""
    try:
        conn = sqlite3.connect(STRANDS_DATABASE_PATH)
        cursor = conn.cursor()
        
        # Get execution statistics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_executions,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_executions,
                SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_executions,
                AVG(execution_time) as avg_execution_time,
                SUM(tokens_used) as total_tokens_used,
                AVG(tokens_used) as avg_tokens_per_execution,
                SUM(llm_calls_count) as total_llm_calls,
                AVG(llm_calls_count) as avg_llm_calls_per_execution,
                SUM(tool_calls_count) as total_tool_calls,
                SUM(reflection_iterations) as total_reflections,
                MAX(timestamp) as last_execution
            FROM strands_executions 
            WHERE agent_id = ?
        ''', (agent_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0] > 0:  # If there are executions
            return jsonify({
                "totalExecutions": row[0],
                "successfulExecutions": row[1],
                "failedExecutions": row[2],
                "averageExecutionTime": row[3] or 0,
                "totalTokensUsed": row[4] or 0,
                "averageTokensPerExecution": row[5] or 0,
                "totalLLMCalls": row[6] or 0,
                "averageLLMCallsPerExecution": row[7] or 0,
                "totalToolCalls": row[8] or 0,
                "totalReflections": row[9] or 0,
                "lastExecution": row[10],
                "successRate": (row[1] / row[0] * 100) if row[0] > 0 else 0
            })
        else:
            return jsonify({
                "totalExecutions": 0,
                "successfulExecutions": 0,
                "failedExecutions": 0,
                "averageExecutionTime": 0,
                "totalTokensUsed": 0,
                "averageTokensPerExecution": 0,
                "totalLLMCalls": 0,
                "averageLLMCallsPerExecution": 0,
                "totalToolCalls": 0,
                "totalReflections": 0,
                "lastExecution": None,
                "successRate": 0
            })
            
    except Exception as e:
        logger.error(f"Error getting Strands agent metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/strands/ollama-agents', methods=['GET'])
def get_ollama_agents_for_display():
    """Get Ollama agents for display in Strands (read-only)"""
    try:
        # Call Ollama API to get agents
        response = requests.get('http://localhost:5002/api/agents/ollama', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            
            # Transform to safe display format with full configuration
            display_agents = []
            for agent in agents:
                guardrails = agent.get('guardrails', {})
                display_agent = {
                    'id': agent.get('id', ''),
                    'name': agent.get('name', 'Unnamed Agent'),
                    'role': agent.get('role', 'Assistant'),
                    'description': agent.get('description', 'No description'),
                    'model': agent.get('model', {}).get('model_id') or agent.get('model', 'unknown'),
                    'personality': agent.get('personality', ''),
                    'expertise': agent.get('expertise', ''),
                    'system_prompt': agent.get('system_prompt', ''),
                    'temperature': agent.get('temperature', 0.7),
                    'max_tokens': agent.get('max_tokens', 1000),
                    'created_at': agent.get('created_at', ''),
                    'updated_at': agent.get('updated_at', ''),
                    'source': 'ollama',
                    'capabilities': extract_capabilities(agent),
                    'has_guardrails': bool(guardrails.get('enabled', False)),
                    'is_configured': bool(agent.get('system_prompt', '')),
                    # Full guardrails configuration
                    'guardrails': {
                        'enabled': bool(guardrails.get('enabled', False)),
                        'safety_level': guardrails.get('safetyLevel', 'medium'),
                        'content_filters': guardrails.get('contentFilters', []),
                        'rules': guardrails.get('rules', [])
                    },
                    # Additional metadata for adaptation
                    'tools': agent.get('tools', []),
                    'memory': agent.get('memory', {
                        'shortTerm': True,
                        'longTerm': False,
                        'contextual': True
                    }),
                    'behavior': agent.get('behavior', {
                        'response_style': 'helpful',
                        'communication_tone': 'professional'
                    })
                }
                display_agents.append(display_agent)
            
            return jsonify({"agents": display_agents})
        else:
            return jsonify({"agents": []})
            
    except Exception as e:
        logger.error(f"Error getting Ollama agents for display: {str(e)}")
        return jsonify({"agents": []})

def extract_capabilities(agent):
    """Extract capabilities from agent data"""
    capabilities = []
    text = f"{agent.get('role', '')} {agent.get('description', '')}".lower()
    
    if 'research' in text or 'analysis' in text:
        capabilities.append('Research')
    if 'writing' in text or 'content' in text:
        capabilities.append('Writing')
    if 'code' in text or 'programming' in text:
        capabilities.append('Coding')
    if 'chat' in text or 'conversation' in text:
        capabilities.append('Chat')
    if 'calculation' in text or 'math' in text:
        capabilities.append('Math')
    
    return capabilities if capabilities else ['General']

if __name__ == '__main__':
    print("🚀 Starting Strands Intelligence API...")
    print("📊 Database initialized")
    print("🧠 Reasoning engine ready")
    print("🔗 Ollama integration configured")
    print("🌐 Server starting on port 5004...")
    
    app.run(host='0.0.0.0', port=5004, debug=True)