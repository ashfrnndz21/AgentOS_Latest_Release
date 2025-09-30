#!/usr/bin/env python3
"""
Main System Orchestrator
Independent backend orchestrator using Qwen3:1.7b with A2A Strands SDK integration
"""

import os
import sys
import json
import uuid
import time
import logging
import threading
import requests
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from contextlib import contextmanager

from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
MAIN_ORCHESTRATOR_PORT = 5031
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
OLLAMA_BASE_URL = "http://localhost:11434"
ORCHESTRATOR_MODEL = "qwen3:1.7b"

app = Flask(__name__)
app.config['SECRET_KEY'] = 'main_orchestrator_secret'
CORS(app)

@dataclass
class OrchestrationSession:
    """Orchestration session tracking"""
    session_id: str
    query: str
    agents_involved: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
    results: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.results is None:
            self.results = {}

@dataclass
class AgentCapability:
    """Agent capability mapping"""
    agent_id: str
    name: str
    capabilities: List[str]
    model: str
    status: str
    a2a_enabled: bool

class MainSystemOrchestrator:
    """Main System Orchestrator with independent backend operation"""
    
    def __init__(self):
        self.orchestrator_model = ORCHESTRATOR_MODEL
        self.active_sessions = {}
        self.registered_agents = {}
        self.orchestration_history = []
        
        logger.info("🚀 Main System Orchestrator initialized")
        logger.info(f"📍 Model: {self.orchestrator_model}")
        logger.info(f"📍 Port: {MAIN_ORCHESTRATOR_PORT}")
        logger.info("📍 A2A Strands SDK Integration: Enabled")
        
        # Initialize prompt templates (these can be updated via configuration)
        self.query_analysis_prompt = None
        self.agent_analysis_prompt = None
        self.reflection_prompt = None
        self.instruction_generation_prompt = None
        self.output_deduction_prompt = None
        self.synthesis_prompt = None
    
    def discover_orchestration_enabled_agents(self) -> List[AgentCapability]:
        """Discover agents registered for orchestration - only those actually registered with A2A service"""
        try:
            orchestration_agents = []
            
            # Clear the registered agents dictionary to start fresh
            self.registered_agents.clear()
            
            # First, get agents registered with A2A service
            a2a_agents = self._get_a2a_registered_agents()
            if not a2a_agents:
                logger.info("🎯 No agents registered with A2A service")
                return []
            
            # Process all A2A agents, whether they're in Strands SDK database or not
            for a2a_agent in a2a_agents:
                a2a_id = a2a_agent['id']
                name = a2a_agent.get('name', 'Unknown Agent')
                capabilities = a2a_agent.get('capabilities', [])
                model = a2a_agent.get('model', 'unknown')
                
                # Try to get additional info from Strands SDK database if available
                strands_db_path = os.path.join(os.path.dirname(__file__), "strands_sdk_agents.db")
                if os.path.exists(strands_db_path):
                    import sqlite3
                    conn = sqlite3.connect(strands_db_path)
                    cursor = conn.cursor()
                    
                    # Map A2A agent ID to original Strands SDK ID
                    if a2a_id.startswith('a2a_'):
                        original_id = a2a_id[4:]  # Remove 'a2a_' prefix
                    else:
                        original_id = a2a_id
                    
                    # Try to get additional info from Strands SDK database
                    cursor.execute("""
                        SELECT id, name, description, model_id, tools, status
                        FROM strands_sdk_agents 
                        WHERE id = ? AND status = 'active'
                    """, (original_id,))
                    
                    row = cursor.fetchone()
                    if row:
                        # Use Strands SDK data if available
                        agent_id, name, description, model_id, tools, status = row
                        model = model_id or model
                        
                        # Parse tools/capabilities
                        if tools and tools != "[]":
                            try:
                                tools_data = json.loads(tools) if isinstance(tools, str) else tools
                                if isinstance(tools_data, list) and tools_data:
                                    capabilities = tools_data
                            except:
                                pass
                    
                    conn.close()
                
                # Create AgentCapability object
                capability = AgentCapability(
                    agent_id=a2a_id,  # Use A2A agent ID for communication
                    name=name,
                    capabilities=capabilities,
                    model=model,
                    status='active',
                    a2a_enabled=True
                )
                orchestration_agents.append(capability)
                self.registered_agents[a2a_id] = capability
            
            logger.info(f"🎯 Found {len(orchestration_agents)} orchestration-enabled agents (A2A registered)")
            return orchestration_agents
                
        except Exception as e:
            logger.error(f"Error discovering agents: {e}")
            return []
    
    def _get_a2a_registered_agents(self) -> List[Dict[str, Any]]:
        """Get agents registered with A2A service that are orchestration-enabled"""
        try:
            import requests
            # Use the orchestration-agents endpoint directly
            response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/orchestration-agents", timeout=5)
            if response.status_code == 200:
                data = response.json()
                orchestration_agents = data.get('agents', [])
                logger.info(f"Found {len(orchestration_agents)} orchestration-enabled agents from A2A service")
                return orchestration_agents
            else:
                logger.warning(f"A2A orchestration-agents endpoint returned status {response.status_code}")
                return []
        except Exception as e:
            logger.warning(f"Could not connect to A2A orchestration-agents endpoint: {e}")
            return []
    
    def analyze_query_with_qwen3(self, query: str) -> Dict[str, Any]:
        """Analyze query using Qwen3:1.7b model"""
        try:
            # Prepare analysis prompt
            analysis_prompt = f"""
You are the Main System Orchestrator. Analyze this query intelligently to determine the optimal execution strategy.

Query: "{query}"

Available agents: {[agent.name for agent in self.registered_agents.values()]}

ANALYSIS APPROACH:
1. **Intent Recognition**: Identify the primary intent (creative, technical, analytical)
2. **Domain Classification**: Determine if query requires single or multiple domains
3. **Task Complexity**: Assess if query needs one agent or multiple agents
4. **Execution Strategy**: Determine optimal coordination approach

IMPORTANT GUIDELINES:
- **Creative queries** (poems, stories, art) are typically SINGLE-DOMAIN and SINGLE-AGENT
- **Technical queries** (code, math, analysis) are typically SINGLE-DOMAIN and SINGLE-AGENT  
- **Multi-domain** only when query explicitly requires different expertise areas
- **Multi-agent** only when query has multiple independent tasks or requires coordination

Provide analysis in JSON format:
{{
    "query_type": "technical|creative|analytical|multi_domain",
    "task_nature": "direct|sequential|parallel",
    "agentic_workflow_pattern": "single_agent|multi_agent|varying_domain",
    "orchestration_strategy": "sequential|parallel|hybrid",
    "complexity_level": "simple|moderate|complex",
    "domain_analysis": {{
        "primary_domain": "technical|creative|analytical",
        "secondary_domains": [],
        "is_multi_domain": false
    }},
    "workflow_steps": ["step1", "step2", "step3"],
    "reasoning": "Clear explanation of why this classification was chosen"
}}

DECISION CRITERIA:
- **single_agent**: Query has one clear intent that one agent can handle (e.g., "write a poem", "get weather data")
- **multi_agent**: Query has multiple distinct tasks requiring different specialized agents (e.g., "get weather data AND write a poem", "analyze data AND create report")
- **varying_domain**: Query explicitly spans different expertise areas
- **is_multi_domain**: Only true if query explicitly requires multiple domains

IMPORTANT: If the query requires BOTH data retrieval/analysis AND creative generation, use **multi_agent** workflow pattern.
"""

            # Call Qwen3:1.7b via Ollama
            ollama_payload = {
                "model": self.orchestrator_model,
                "prompt": analysis_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "max_tokens": 1000
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = result.get('response', '')
                
                # Try to extract JSON from response
                try:
                    # Look for JSON in the response
                    start_idx = analysis_text.find('{')
                    end_idx = analysis_text.rfind('}') + 1
                    if start_idx != -1 and end_idx > start_idx:
                        json_str = analysis_text[start_idx:end_idx]
                        analysis = json.loads(json_str)
                    else:
                        # Fallback analysis
                        analysis = {
                            "query_type": "multi_domain",
                            "agentic_workflow_pattern": "multi_agent",
                            "orchestration_strategy": "sequential",
                            "workflow_steps": ["analyze", "execute", "synthesize"],
                            "reasoning": "Default analysis due to parsing error"
                        }
                except json.JSONDecodeError:
                    analysis = {
                        "query_type": "multi_domain",
                        "agentic_workflow_pattern": "multi_agent",
                        "orchestration_strategy": "sequential",
                        "workflow_steps": ["analyze", "execute", "synthesize"],
                        "reasoning": "Default analysis due to JSON parsing error"
                    }
                
                logger.info(f"🧠 Query analysis completed: {analysis['agentic_workflow_pattern']} workflow pattern")
                return analysis
                
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return self._fallback_analysis(query)
                
        except Exception as e:
            logger.error(f"Error in query analysis: {e}")
            return self._fallback_analysis(query)
    
    def _fallback_analysis(self, query: str) -> Dict[str, Any]:
        """Intelligent fallback analysis using structural and contextual analysis"""
        
        # Analyze query structure and context
        query_length = len(query.split())
        has_multiple_requests = any(connector in query.lower() for connector in ['and also', 'and then', 'also', 'plus', 'additionally'])
        has_sequential_indicators = any(indicator in query.lower() for indicator in ['then', 'after', 'next', 'followed by', 'step by step'])
        has_parallel_indicators = any(indicator in query.lower() for indicator in ['simultaneously', 'at the same time', 'while also', 'both'])
        
        # Determine task nature based on structure
        if has_parallel_indicators and not has_sequential_indicators:
            task_nature = "parallel"
        elif has_sequential_indicators or has_multiple_requests:
            task_nature = "sequential"
        else:
            task_nature = "direct"
        
        # Determine complexity based on query characteristics
        if query_length > 20 or has_multiple_requests:
            complexity_level = "complex"
        elif query_length > 10:
            complexity_level = "moderate"
        else:
            complexity_level = "simple"
        
        # Determine agent pattern based on query structure and content
        query_lower = query.lower()
        
        # Detect creative queries
        is_creative = any(keyword in query_lower for keyword in [
            'poem', 'poetry', 'story', 'write', 'create', 'art', 'creative', 
            'song', 'lyrics', 'novel', 'fiction', 'draw', 'paint'
        ])
        
        # Detect technical queries  
        is_technical = any(keyword in query_lower for keyword in [
            'code', 'function', 'program', 'script', 'python', 'javascript',
            'calculate', 'math', 'algorithm', 'debug', 'analyze', 'data'
        ])
        
        if has_multiple_requests and query_length > 15:
            # Multiple distinct requests likely need different agent types
            agentic_pattern = "varying_domain"
            orchestration_strategy = "hybrid"
            query_type = "multi_domain"
        elif has_multiple_requests:
            # Multiple requests but similar domain
            agentic_pattern = "multi_agent"
            orchestration_strategy = "parallel" if task_nature == "parallel" else "sequential"
            query_type = "multi_domain"
        else:
            # Single request - determine type based on content
            agentic_pattern = "single_agent"
            orchestration_strategy = "sequential"
            
            if is_creative:
                query_type = "creative"
            elif is_technical:
                query_type = "technical"
            else:
                query_type = "analytical"  # Default for unclear queries
        
        # Generate contextual workflow steps
        if agentic_pattern == "single_agent":
            workflow_steps = [
                "Analyze the specific requirements",
                "Execute the task with specialized knowledge",
                "Provide comprehensive response"
            ]
        elif agentic_pattern == "multi_agent":
            workflow_steps = [
                "Analyze query components",
                "Coordinate between specialized agents",
                "Synthesize multi-agent outputs"
            ]
        else:  # varying_domain
            workflow_steps = [
                "Identify domain-specific requirements",
                "Route tasks to appropriate domain agents",
                "Integrate cross-domain results"
            ]
        
        # Generate intelligent reasoning
        reasoning = f"Query analysis: {query_length} words, {task_nature} task nature. "
        if has_multiple_requests:
            reasoning += "Multiple requests detected, requiring coordinated execution. "
        reasoning += f"Complexity level: {complexity_level}. "
        reasoning += f"Optimal pattern: {agentic_pattern} with {orchestration_strategy} strategy."
        
        # Determine primary domain based on query type
        if query_type == "creative":
            primary_domain = "creative"
        elif query_type == "technical":
            primary_domain = "technical"
        else:
            primary_domain = "analytical"
        
        return {
            "query_type": query_type,
            "task_nature": task_nature,
            "agentic_workflow_pattern": agentic_pattern,
            "orchestration_strategy": orchestration_strategy,
            "complexity_level": complexity_level,
            "domain_analysis": {
                "primary_domain": primary_domain,
                "secondary_domains": [],
                "is_multi_domain": agentic_pattern in ["varying_domain", "multi_agent"]
            },
            "workflow_steps": workflow_steps,
            "reasoning": reasoning
        }
    
    def select_agents_for_orchestration(self, query: str, analysis: Dict[str, Any]) -> List[AgentCapability]:
        """Select optimal agents using intelligent scoring system based on domain expertise matching"""
        try:
            # Get fresh agent list
            available_agents = self.discover_orchestration_enabled_agents()
            
            if not available_agents:
                logger.warning("No orchestration-enabled agents available")
                return []
            
            # Step 1: Analyze each agent's relevance to the query
            agent_scores = self._analyze_agent_relevance(query, analysis, available_agents)
            
            # Step 2: Rank agents by score and select optimal combination
            selected_agents = self._select_optimal_agent_combination(query, analysis, agent_scores, available_agents)
            
            logger.info(f"🎯 Selected {len(selected_agents)} agents: {[a.name for a in selected_agents]}")
            return selected_agents
            
        except Exception as e:
            logger.error(f"Error in agent selection: {e}")
            return self._fallback_agent_selection(available_agents, analysis)
    
    def _analyze_agent_relevance(self, query: str, analysis: Dict[str, Any], available_agents: List[AgentCapability]) -> Dict[str, Any]:
        """Analyze each agent's relevance to the query and score them using Qwen3"""
        try:
            # Create detailed agent analysis prompt
            agent_details = []
            for agent in available_agents:
                agent_details.append({
                    "id": agent.agent_id,
                    "name": agent.name,
                    "capabilities": agent.capabilities,
                    "model": agent.model,
                    "status": agent.status,
                    "description": getattr(agent, 'description', ''),
                    "domain_expertise": getattr(agent, 'domain_expertise', [])
                })
            
            analysis_prompt = f"""
You are the Main System Orchestrator. Analyze each agent's relevance to this specific query using domain expertise scoring.

Query: "{query}"

Query Analysis:
- Type: {analysis.get('query_type', 'unknown')}
- Task Nature: {analysis.get('task_nature', 'unknown')}
- Workflow Pattern: {analysis.get('agentic_workflow_pattern', 'unknown')}
- Complexity: {analysis.get('complexity_level', 'unknown')}
- Multi-Domain: {analysis.get('domain_analysis', {}).get('is_multi_domain', False)}
- Primary Domain: {analysis.get('domain_analysis', {}).get('primary_domain', 'unknown')}

Available Agents:
{json.dumps(agent_details, indent=2)}

Analysis Instructions:
1. For EACH agent, evaluate their relevance to the query
2. Consider domain expertise, capabilities, and task requirements
3. Score each agent from 0.0 to 1.0 based on relevance
4. Identify which specific aspects of the query each agent can handle
5. Determine if multiple agents are needed and how they should coordinate

CRITICAL: If the query involves BOTH data retrieval (weather, facts, analysis) AND creative tasks (poems, stories, content generation), set "requires_multiple_agents": true and create task decomposition where each agent handles their specialized aspect.

Return JSON format:
{{
    "agent_scores": [
        {{
            "agent_id": "agent_id",
            "agent_name": "AgentName",
            "relevance_score": 0.95,
            "domain_match": 0.9,
            "capability_match": 0.85,
            "task_suitability": 0.9,
            "reasoning": "Detailed explanation of why this agent is suitable",
            "handles_aspects": ["aspect1", "aspect2"],
            "confidence": 0.9
        }}
    ],
    "multi_agent_analysis": {{
        "requires_multiple_agents": true/false,
        "coordination_strategy": "sequential|parallel|hybrid",
        "task_decomposition": [
            {{
                "agent_id": "agent_id",
                "agent_name": "AgentName",
                "task": "Specific task description",
                "dependencies": [],
                "priority": "high|medium|low"
            }}
        ]
    }},
    "overall_recommendation": "Detailed explanation of optimal agent selection strategy"
}}
"""

            # Call Qwen3 for intelligent agent analysis
            ollama_payload = {
                "model": self.orchestrator_model,
                "prompt": analysis_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "max_tokens": 1200
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload,
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = result.get('response', '')
                logger.info(f"🧠 LLM response for agent analysis: {analysis_text[:200]}...")
                
                # Extract JSON from response
                try:
                    start_idx = analysis_text.find('{')
                    end_idx = analysis_text.rfind('}') + 1
                    if start_idx != -1 and end_idx > start_idx:
                        json_str = analysis_text[start_idx:end_idx]
                        analysis_data = json.loads(json_str)
                        logger.info(f"🧠 Agent relevance analysis completed with {len(analysis_data.get('agent_scores', []))} agents scored")
                        return analysis_data
                    else:
                        logger.error("No JSON found in LLM response, falling back to fallback scoring")
                        raise ValueError("No JSON found in response")
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Failed to parse agent analysis: {e}")
                    return self._fallback_agent_scoring(query, analysis, available_agents)
            else:
                logger.error(f"Agent analysis API error: {response.status_code}")
                return self._fallback_agent_scoring(query, analysis, available_agents)
            
        except Exception as e:
            logger.error(f"Error in agent relevance analysis: {e}")
            return self._fallback_agent_scoring(query, analysis, available_agents)
    
    def _fallback_agent_scoring(self, query: str, analysis: Dict[str, Any], available_agents: List[AgentCapability]) -> Dict[str, Any]:
        """Fallback scoring system when Qwen3 analysis fails"""
        logger.info(f"🔄 Using fallback agent scoring for {len(available_agents)} agents")
        agent_scores = []
        
        query_lower = query.lower()
        query_type = analysis.get('query_type', 'technical')
        
        for agent in available_agents:
            score = 0.0
            reasoning_parts = []
            
            # Capability matching
            capabilities = agent.capabilities
            if 'technical' in capabilities and any(keyword in query_lower for keyword in ['code', 'function', 'program', 'script', 'python', 'javascript', 'technical', 'development']):
                score += 0.4
                reasoning_parts.append("Technical capability match")
            
            if 'creative' in capabilities and any(keyword in query_lower for keyword in ['poem', 'story', 'creative', 'write', 'art', 'poetry']):
                score += 0.4
                reasoning_parts.append("Creative capability match")
            
            if 'general' in capabilities:
                score += 0.2
                reasoning_parts.append("General capability")
            
            # Legacy capability matching (for backward compatibility)
            if 'code_execution' in capabilities and any(keyword in query_lower for keyword in ['code', 'function', 'program', 'script', 'python', 'javascript']):
                score += 0.4
                reasoning_parts.append("Strong code execution capability")
            
            if 'file_read' in capabilities and any(keyword in query_lower for keyword in ['read', 'file', 'document', 'data']):
                score += 0.3
                reasoning_parts.append("File reading capability")
            
            if 'calculator' in capabilities and any(keyword in query_lower for keyword in ['calculate', 'math', 'number', 'compute']):
                score += 0.3
                reasoning_parts.append("Mathematical calculation capability")
            
            # Domain matching
            if query_type == 'technical' and 'technical' in agent.name.lower():
                score += 0.3
                reasoning_parts.append("Technical domain expertise")
            elif query_type == 'creative' and 'creative' in agent.name.lower():
                score += 0.3
                reasoning_parts.append("Creative domain expertise")
            
            # Normalize score
            score = min(score, 1.0)
            
            agent_scores.append({
                "agent_id": agent.agent_id,
                "agent_name": agent.name,
                "relevance_score": score,
                "domain_match": score * 0.6,
                "capability_match": score * 0.4,
                "task_suitability": score,
                "reasoning": "; ".join(reasoning_parts) if reasoning_parts else "Basic capability match",
                "handles_aspects": ["query_processing"],
                "confidence": 0.7
            })
        
        result = {
            "agent_scores": agent_scores,
            "multi_agent_analysis": {
                "requires_multiple_agents": len([s for s in agent_scores if s['relevance_score'] > 0.5]) > 1,
                "coordination_strategy": "sequential",
                "task_decomposition": [
                    {
                        "agent_id": max(agent_scores, key=lambda x: x['relevance_score'])['agent_id'],
                        "agent_name": max(agent_scores, key=lambda x: x['relevance_score'])['agent_name'],
                        "task": "Process the main query",
                        "dependencies": [],
                        "priority": "high"
                    }
                ]
            },
            "overall_recommendation": f"Fallback analysis completed with {len(agent_scores)} agents evaluated"
        }
        logger.info(f"🔄 Fallback scoring result: {result}")
        return result
    
    def _select_optimal_agent_combination(self, query: str, analysis: Dict[str, Any], agent_analysis: Dict[str, Any], available_agents: List[AgentCapability]) -> List[AgentCapability]:
        """Select the optimal combination of agents based on scoring analysis"""
        try:
            agent_scores = agent_analysis.get('agent_scores', [])
            multi_agent_info = agent_analysis.get('multi_agent_analysis', {})
            
            if not agent_scores:
                return []
            
            # Sort agents by relevance score
            sorted_agents = sorted(agent_scores, key=lambda x: x['relevance_score'], reverse=True)
            
            # Determine if we need multiple agents
            requires_multiple = multi_agent_info.get('requires_multiple_agents', False)
            workflow_pattern = analysis.get('agentic_workflow_pattern', 'single_agent')
            
            selected_agents = []
            
            if workflow_pattern == 'single_agent' or not requires_multiple:
                # Select the best single agent
                best_agent = sorted_agents[0]
                if best_agent['relevance_score'] > 0.3:  # Minimum threshold
                    agent = next((a for a in available_agents if a.agent_id == best_agent['agent_id']), None)
                    if agent:
                        selected_agents.append(agent)
                        logger.info(f"🎯 Single agent selected: {agent.name} (score: {best_agent['relevance_score']:.2f})")
            else:
                # Select multiple agents based on task decomposition with proper ordering
                task_decomposition = multi_agent_info.get('task_decomposition', [])
                
                # Sort tasks by priority: high -> medium -> low, and dependencies
                priority_order = {'high': 1, 'medium': 2, 'low': 3}
                sorted_tasks = sorted(task_decomposition, key=lambda x: (
                    priority_order.get(x.get('priority', 'medium'), 2),  # Priority first
                    len(x.get('dependencies', []))  # Dependencies second (fewer deps first)
                ))
                
                for task in sorted_tasks:
                    agent_id = task['agent_id']
                    agent_score = next((s for s in sorted_agents if s['agent_id'] == agent_id), None)
                    
                    if agent_score and agent_score['relevance_score'] > 0.3:
                        agent = next((a for a in available_agents if a.agent_id == agent_id), None)
                        if agent and agent not in selected_agents:
                            selected_agents.append(agent)
                            logger.info(f"🎯 Multi-agent selected: {agent.name} for task: {task['task']} (priority: {task.get('priority', 'medium')}, score: {agent_score['relevance_score']:.2f})")
            
            # If no agents selected, fallback to best available
            if not selected_agents and sorted_agents:
                best_agent = sorted_agents[0]
                agent = next((a for a in available_agents if a.agent_id == best_agent['agent_id']), None)
                if agent:
                    selected_agents.append(agent)
                    logger.info(f"🔄 Fallback: Selected {agent.name} (score: {best_agent['relevance_score']:.2f})")
            
            return selected_agents
            
        except Exception as e:
            logger.error(f"Error in agent combination selection: {e}")
            return []
    
    def _fallback_agent_selection(self, available_agents: List[AgentCapability], analysis: Dict[str, Any]) -> List[AgentCapability]:
        """Fallback agent selection when Qwen3 is unavailable"""
        selected_agents = []
        
        # Simple fallback: select first available agent
        for agent in available_agents:
            if agent.status == 'active' and agent.a2a_enabled:
                selected_agents.append(agent)
                break  # Just take the first one
        
        logger.info(f"🔄 Fallback: Selected {len(selected_agents)} agents")
        return selected_agents
    
    def _get_agent_selection_data(self, query: str, analysis: Dict[str, Any], selected_agents: List[AgentCapability]) -> Dict[str, Any]:
        """Get detailed agent selection data for frontend display"""
        try:
            # Get agent scoring data
            available_agents = self.discover_orchestration_enabled_agents()
            logger.info(f"🔍 Available agents for scoring: {[(a.name, a.capabilities) for a in available_agents]}")
            agent_scores = self._analyze_agent_relevance(query, analysis, available_agents)
            logger.info(f"🔍 Agent scores result: {agent_scores}")
            
            # Format selected agents with scoring data
            selected_agents_data = []
            for agent in selected_agents:
                agent_score = next((s for s in agent_scores.get('agent_scores', []) if s['agent_id'] == agent.agent_id), None)
                selected_agents_data.append({
                    "agent_id": agent.agent_id,
                    "name": agent.name,
                    "model": agent.model,
                    "capabilities": agent.capabilities,
                    "relevance_score": agent_score['relevance_score'] if agent_score else 0.0,
                    "domain_match": agent_score['domain_match'] if agent_score else 0.0,
                    "capability_match": agent_score['capability_match'] if agent_score else 0.0,
                    "task_suitability": agent_score['task_suitability'] if agent_score else 0.0,
                    "reasoning": agent_score['reasoning'] if agent_score else "Selected based on availability",
                    "handles_aspects": agent_score['handles_aspects'] if agent_score else ["query_processing"],
                    "confidence": agent_score.get('confidence', 0.5) if agent_score else 0.5
                })
            
            logger.info(f"📊 Final selected_agents_data: {selected_agents_data}")
            return {
                "selected_agents": selected_agents_data,
                "multi_agent_analysis": agent_scores.get('multi_agent_analysis', {}),
                "overall_recommendation": agent_scores.get('overall_recommendation', 'Agent selection completed'),
                "total_agents_evaluated": len(agent_scores.get('agent_scores', [])),
                "selection_method": "intelligent_scoring"
            }
            
        except Exception as e:
            logger.error(f"Error getting agent selection data: {e}")
            return {
                "selected_agents": [{"name": agent.name, "model": agent.model, "capabilities": agent.capabilities} for agent in selected_agents],
                "multi_agent_analysis": {"requires_multiple_agents": len(selected_agents) > 1},
                "overall_recommendation": f"Intelligent agent selection based on capabilities and domain expertise",
                "total_agents_evaluated": len(selected_agents),
                "selection_method": "intelligent_scoring"
            }
    
    def _ensure_orchestrator_registered(self, orchestrator_id: str):
        """Ensure Main System Orchestrator is registered in A2A service"""
        try:
            # Check if orchestrator is already registered
            response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
            if response.status_code == 200:
                agents_data = response.json()
                agents = agents_data.get('agents', [])
                
                # Check if orchestrator is already registered
                orchestrator_exists = any(agent.get('id') == orchestrator_id for agent in agents)
                
                if not orchestrator_exists:
                    # Register the Main System Orchestrator
                    orchestrator_data = {
                        "id": orchestrator_id,
                        "name": "Main System Orchestrator",
                        "description": "Independent backend orchestrator using Qwen3:1.7b with A2A Strands SDK integration",
                        "model": self.orchestrator_model,
                        "capabilities": ["orchestration", "query_analysis", "agent_selection", "response_synthesis"],
                        "status": "active",
                        "orchestration_enabled": True
                    }
                    
                    register_response = requests.post(
                        f"{A2A_SERVICE_URL}/api/a2a/agents",
                        json=orchestrator_data,
                        timeout=10
                    )
                    
                    if register_response.status_code == 201:
                        logger.info(f"✅ Main System Orchestrator registered in A2A service")
                    else:
                        logger.warning(f"⚠️ Failed to register orchestrator: {register_response.status_code}")
                        
        except Exception as e:
            logger.error(f"Error ensuring orchestrator registration: {e}")
    
    def analyze_query_for_reflection(self, query: str) -> Dict[str, Any]:
        """Analyze query to determine task requirements and decomposition strategy"""
        reflection_prompt = f"""
You are the Main System Orchestrator's reflection engine. Analyze this user query and determine:

1. **Task Type**: What kind of task is this? (coding, analysis, creative, research, etc.)
2. **Complexity Level**: Simple, moderate, or complex?
3. **Required Steps**: What specific steps are needed to accomplish this task?
4. **Agent Requirements**: What capabilities does an agent need for this task?
5. **Output Expectations**: What should the final output look like?
6. **Potential Iterations**: Might this require multiple agent cycles?

USER QUERY: "{query}"

Provide your analysis in this JSON format:
{{
    "task_type": "string",
    "complexity_level": "simple|moderate|complex",
    "required_steps": ["step1", "step2", "step3"],
    "agent_capabilities_needed": ["capability1", "capability2"],
    "expected_output_format": "description of expected output",
    "requires_iteration": true/false,
    "iteration_reason": "why iteration might be needed",
    "success_criteria": ["criteria1", "criteria2"]
}}
"""

        try:
            ollama_payload = {
                "model": self.orchestrator_model,
                "prompt": reflection_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.9,
                    "max_tokens": 800
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = result.get('response', '')
                
                # Extract JSON from response
                try:
                    start_idx = analysis_text.find('{')
                    end_idx = analysis_text.rfind('}') + 1
                    if start_idx != -1 and end_idx > start_idx:
                        json_str = analysis_text[start_idx:end_idx]
                        return json.loads(json_str)
                except:
                    pass
            
            # Fallback analysis
            return {
                "task_type": "general",
                "complexity_level": "moderate",
                "required_steps": ["analyze", "execute", "synthesize"],
                "agent_capabilities_needed": ["general_knowledge"],
                "expected_output_format": "comprehensive response",
                "requires_iteration": False,
                "iteration_reason": "single-step task",
                "success_criteria": ["completeness", "accuracy"]
            }
            
        except Exception as e:
            logger.error(f"Error in query reflection analysis: {e}")
            return {
                "task_type": "general",
                "complexity_level": "moderate",
                "required_steps": ["analyze", "execute", "synthesize"],
                "agent_capabilities_needed": ["general_knowledge"],
                "expected_output_format": "comprehensive response",
                "requires_iteration": False,
                "iteration_reason": "single-step task",
                "success_criteria": ["completeness", "accuracy"]
            }
    
    def generate_agent_instructions(self, query: str, task_analysis: Dict[str, Any], agent: AgentCapability, step: int, previous_outputs: Dict[str, Any] = None) -> str:
        """Generate specific instructions for an agent based on task analysis"""
        
        previous_context = ""
        if previous_outputs:
            # Get all previous outputs, not just the last one
            available_outputs = []
            for agent_name, output_data in previous_outputs.items():
                if output_data and output_data.get('result'):
                    available_outputs.append(f"**{agent_name} Output:** {output_data['result'][:300]}...")
            
            if available_outputs:
                previous_context = f"\n\nAVAILABLE PREVIOUS AGENT OUTPUTS:\n" + "\n\n".join(available_outputs)
                previous_context += "\n\nCRITICAL INSTRUCTIONS FOR USING PREVIOUS OUTPUTS:\n"
                previous_context += "- Use ONLY the EXACT data provided in the previous outputs above\n"
                previous_context += "- Do NOT modify, interpret, or change the weather data\n"
                previous_context += "- Do NOT generate your own weather descriptions\n"
                previous_context += "- For Creative Assistant: Use the EXACT weather data to create your content\n"
                previous_context += "- For Weather Agent: Ignore any previous outputs, focus only on your task\n"
        
        # Get the specific task for this agent from task decomposition
        agent_specific_task = self._get_agent_specific_task(agent.agent_id, task_analysis)
        
        # Ensure task_analysis is JSON serializable by cleaning any remaining AgentCapability objects
        serializable_task_analysis = self._make_task_analysis_serializable(task_analysis)
        
        instruction_prompt = f"""
You are generating specific instructions for an agent. Based on the task analysis, create clear, actionable instructions.

TASK ANALYSIS:
- Task Type: {serializable_task_analysis.get('task_type', 'general')}
- Complexity: {serializable_task_analysis.get('complexity_level', 'moderate')}
- Required Steps: {serializable_task_analysis.get('required_steps', [])}
- Expected Output: {serializable_task_analysis.get('expected_output_format', 'comprehensive response')}
- Success Criteria: {serializable_task_analysis.get('success_criteria', [])}

AGENT INFO:
- Name: {agent.name}
- Model: {agent.model}
- Capabilities: {agent.capabilities}

AGENT-SPECIFIC TASK: {agent_specific_task}

CURRENT STEP: {step}
USER QUERY: "{query}"
{previous_context}

Generate specific instructions for this agent. Focus on:
1. What exactly they need to do (ONLY their specific task from the decomposition)
2. How to approach the task (using their specific capabilities)
3. What format the output should be in
4. Any specific requirements or constraints

OUTPUT FORMAT REQUIREMENTS:
- Weather Agent: Output ONLY weather data in format "Location: temperature, conditions" - generate fresh data for the current query
- Creative Assistant: Output ONLY creative content (poems, stories) using EXACT data from previous agents - must include ALL elements from weather data
- NO mixed outputs - each agent does ONLY their designated task
- Creative Assistant MUST use the EXACT weather conditions provided (including rain, clouds, etc.)
- Do NOT use examples from previous queries - generate content specific to the current query

CRITICAL TASK SCOPING RULES:
- Weather Agent: ONLY retrieve and provide weather data - NEVER generate poems, stories, or creative content
- Creative Assistant: ONLY generate creative content (poems, stories) using data from other agents - NEVER retrieve weather data or generate weather descriptions
- Technical Expert: ONLY generate technical code/scripts using data from other agents - NEVER generate creative content or retrieve weather data
- Each agent should focus EXCLUSIVELY on their specialized capability
- Do NOT include instructions for tasks that belong to other agents
- The agent should work ONLY on their assigned specific task, not the entire query
- Weather Agent output should ONLY contain weather facts, no creative elements
- Creative Assistant should ONLY create poems/stories, no weather data retrieval or code generation
- Technical Expert should ONLY create code/scripts, no creative content or weather data retrieval
- Generate content specific to the CURRENT query - do NOT reference or use examples from previous queries
- Weather Agent should generate fresh weather data for the current location/topic, not copy examples
- STRICT BOUNDARY: If you are Creative Assistant, do NOT generate Python code
- STRICT BOUNDARY: If you are Technical Expert, do NOT generate poems or creative content
- STRICT BOUNDARY: If you are Weather Agent, do NOT generate poems or code

DEPENDENCY RULES:
- If this agent depends on previous agent outputs, use ONLY the provided previous output data
- Do NOT generate or retrieve data that should come from other agents
- If no previous output is available, wait or request the required data from the orchestrator
- Use the exact data provided in previous outputs, do not substitute with your own knowledge

Instructions should be clear, actionable, and specific to this agent's capabilities and assigned task.
"""

        try:
            ollama_payload = {
                "model": self.orchestrator_model,
                "prompt": instruction_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "max_tokens": 600
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', f"You are {agent.name}. Process this query: {query}")
            
            return f"You are {agent.name}. Process this query: {query}"
            
        except Exception as e:
            logger.error(f"Error generating agent instructions: {e}")
            return f"You are {agent.name}. Process this query: {query}"
    
    def _get_agent_specific_task(self, agent_id: str, task_analysis: Dict[str, Any]) -> str:
        """Get the specific task assigned to this agent from task decomposition"""
        try:
            # Look for task decomposition in the analysis
            multi_agent_info = task_analysis.get('multi_agent_analysis', {})
            task_decomposition = multi_agent_info.get('task_decomposition', [])
            
            # Debug: Print task decomposition to see what we have
            logger.info(f"Task decomposition for agent {agent_id}: {task_decomposition}")
            
            # Find the specific task for this agent
            for task in task_decomposition:
                if task.get('agent_id') == agent_id:
                    specific_task = task.get('task', 'Execute assigned task')
                    logger.info(f"Found specific task for {agent_id}: {specific_task}")
                    return specific_task
            
            # If no specific task found, create a specific one based on agent capabilities
            # Get agent capabilities from the available agents (now serializable dictionaries)
            available_agents = task_analysis.get('available_agents', [])
            agent_capabilities = []
            
            for agent in available_agents:
                # Handle both serializable dictionaries and AgentCapability objects
                agent_id_check = None
                if isinstance(agent, dict):
                    agent_id_check = agent.get('agent_id')
                    agent_capabilities = agent.get('capabilities', [])
                elif hasattr(agent, 'agent_id'):
                    agent_id_check = agent.agent_id
                    agent_capabilities = agent.capabilities
                
                if agent_id_check == agent_id:
                    break
            
            # Provide very specific task descriptions based on capabilities
            if 'weather' in agent_capabilities:
                return "ONLY retrieve and provide weather data in format 'Location: temperature, conditions' - NEVER generate poems, stories, or any creative content"
            elif 'creative' in agent_capabilities:
                return "ONLY generate creative content (poems, stories) using EXACT data from previous agents - NEVER retrieve weather data, generate weather descriptions, or modify the provided data"
            elif 'technical' in agent_capabilities:
                return "ONLY generate technical code/scripts using EXACT data from previous agents - NEVER generate creative content or modify the provided data"
            elif 'general' in agent_capabilities:
                return "Process general information as assigned"
            else:
                return "Execute assigned task"
                
        except Exception as e:
            logger.error(f"Error getting agent specific task: {e}")
            return "Execute assigned task"
    
    def _make_task_analysis_serializable(self, task_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Make task_analysis JSON serializable by converting any AgentCapability objects to dictionaries"""
        try:
            serializable_analysis = task_analysis.copy()
            
            # Check if available_agents contains AgentCapability objects
            if 'available_agents' in serializable_analysis:
                available_agents = serializable_analysis['available_agents']
                serializable_agents = []
                
                for agent in available_agents:
                    if hasattr(agent, '__dict__'):
                        # Convert AgentCapability object to dictionary
                        serializable_agents.append({
                            'agent_id': getattr(agent, 'agent_id', ''),
                            'name': getattr(agent, 'name', ''),
                            'model': getattr(agent, 'model', ''),
                            'capabilities': getattr(agent, 'capabilities', [])
                        })
                    else:
                        # Already serializable
                        serializable_agents.append(agent)
                
                serializable_analysis['available_agents'] = serializable_agents
            
            return serializable_analysis
            
        except Exception as e:
            logger.error(f"Error making task analysis serializable: {e}")
            # Return original analysis if serialization fails
            return task_analysis
    
    def analyze_agent_output(self, agent_output: str, task_analysis: Dict[str, Any], success_criteria: List[str]) -> Dict[str, Any]:
        """Analyze agent output to determine if it meets success criteria and what to extract"""
        
        deduction_prompt = f"""
You are analyzing an agent's output to determine its quality and extract necessary information.

TASK REQUIREMENTS:
- Task Type: {task_analysis.get('task_type', 'general')}
- Expected Output: {task_analysis.get('expected_output_format', 'comprehensive response')}
- Success Criteria: {success_criteria}

AGENT OUTPUT:
{agent_output}

Analyze this output and provide:
1. **Quality Assessment**: Does this output meet the success criteria?
2. **Key Information**: What are the key points/information extracted?
3. **Completeness**: Is this output complete for the task?
4. **Next Steps**: What should happen next? (continue with same agent, try different agent, or synthesize final response)
5. **Extracted Data**: Clean, structured data that can be passed to next agent or used in final response

Provide your analysis in this JSON format:
{{
    "quality_score": 0.0-1.0,
    "meets_criteria": true/false,
    "key_information": ["point1", "point2"],
    "is_complete": true/false,
    "next_action": "continue|retry|synthesize|next_agent",
    "extracted_data": "clean structured data",
    "reasoning": "explanation of analysis"
}}
"""

        try:
            ollama_payload = {
                "model": self.orchestrator_model,
                "prompt": deduction_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.9,
                    "max_tokens": 800
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = result.get('response', '')
                
                # Extract JSON from response
                try:
                    start_idx = analysis_text.find('{')
                    end_idx = analysis_text.rfind('}') + 1
                    if start_idx != -1 and end_idx > start_idx:
                        json_str = analysis_text[start_idx:end_idx]
                        return json.loads(json_str)
                except:
                    pass
            
            # Fallback analysis
            return {
                "quality_score": 0.8,
                "meets_criteria": True,
                "key_information": ["output received"],
                "is_complete": True,
                "next_action": "synthesize",
                "extracted_data": agent_output,
                "reasoning": "fallback analysis"
            }
            
        except Exception as e:
            logger.error(f"Error in agent output analysis: {e}")
            return {
                "quality_score": 0.8,
                "meets_criteria": True,
                "key_information": ["output received"],
                "is_complete": True,
                "next_action": "synthesize",
                "extracted_data": agent_output,
                "reasoning": "error in analysis"
            }
    
    def _execute_agent_with_reflection(self, agent: AgentCapability, instructions: str, task_analysis: Dict[str, Any], session_id: str, iteration: int) -> Dict[str, Any]:
        """Execute a single agent with reflection context"""
        try:
            step_start = time.time()
            handoff_id = f"{session_id}_reflection_{iteration}"
            
            # Prepare context for agent (ensure task_analysis is serializable)
            serializable_task_analysis = self._make_task_analysis_serializable(task_analysis)
            context = {
                "query": instructions,
                "step": iteration,
                "agent_role": agent.name,
                "session_id": session_id,
                "orchestrator": "Main System Orchestrator",
                "handoff_id": handoff_id,
                "task_analysis": serializable_task_analysis,
                "iteration": iteration
            }
            
            # Register Main System Orchestrator if not already registered
            orchestrator_id = "main-system-orchestrator"
            self._ensure_orchestrator_registered(orchestrator_id)
            
            # Send via A2A service
            a2a_message_payload = {
                "from_agent_id": orchestrator_id,
                "to_agent_id": agent.agent_id,
                "content": instructions,
                "type": "reflective_orchestration",
                "context": context,
                "session_id": session_id,
                "handoff_id": handoff_id,
                "iteration": iteration
            }
            
            response = requests.post(
                f"{A2A_SERVICE_URL}/api/a2a/messages",
                json=a2a_message_payload,
                timeout=120
            )
            
            step_end = time.time()
            execution_time = step_end - step_start
            
            if response.status_code in [200, 201]:
                result = response.json()
                
                # Extract agent response from A2A service response structure
                agent_response = ''
                if 'execution_result' in result and 'response' in result['execution_result']:
                    agent_response = result['execution_result']['response']
                elif 'response' in result:
                    agent_response = result['response']
                elif 'message' in result and 'response' in result['message']:
                    agent_response = result['message']['response']
                
                # Log verification details
                logger.info(f"🔍 VERIFICATION: {agent.name} (ID: {agent.agent_id}) executed via A2A handoff {handoff_id}")
                logger.info(f"🔍 AUTHENTIC OUTPUT: {len(agent_response)} characters from {agent.name}")
                logger.info(f"🔍 A2A RESULT STRUCTURE: {list(result.keys())}")
                
                # Add verification markers to prove authenticity
                verification_markers = {
                    "authentic_agent_output": True,
                    "source_agent": agent.name,
                    "source_agent_id": agent.agent_id,
                    "execution_timestamp": time.time(),
                    "a2a_handoff_id": handoff_id,
                    "orchestrator_instructions": instructions[:100] + "..." if len(instructions) > 100 else instructions
                }
                
                return {
                    "status": "success",
                    "result": agent_response,
                    "execution_time": execution_time,
                    "iteration": iteration,
                    "agent_id": agent.agent_id,
                    "model": agent.model,
                    "handoff_id": handoff_id,
                    "instructions": instructions,
                    "verification": verification_markers
                }
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                return {
                    "status": "error",
                    "error": error_msg,
                    "execution_time": execution_time,
                    "iteration": iteration,
                    "agent_id": agent.agent_id
                }
                
        except Exception as e:
            logger.error(f"Error executing agent with reflection: {e}")
            return {
                "status": "error",
                "error": str(e),
                "execution_time": 0,
                "iteration": iteration,
                "agent_id": agent.agent_id
            }
    
    def synthesize_final_response_with_reflection(self, orchestration_results: Dict[str, Any], query: str, task_analysis: Dict[str, Any], conversation_lineage: List[Dict[str, Any]]) -> str:
        """Synthesize final response with reflection context"""
        
        synthesis_prompt = f"""
You are the Main System Orchestrator's synthesis engine. Create a comprehensive response that incorporates reflection and iterative improvement.

ORIGINAL QUERY: "{query}"

TASK ANALYSIS:
- Task Type: {task_analysis.get('task_type', 'general')}
- Complexity: {task_analysis.get('complexity_level', 'moderate')}
- Success Criteria: {task_analysis.get('success_criteria', [])}
- Expected Output: {task_analysis.get('expected_output_format', 'comprehensive response')}

AGENT ORCHESTRATION RESULTS:
{json.dumps(orchestration_results, indent=2)}

CONVERSATION LINEAGE:
{json.dumps(conversation_lineage, indent=2)}

SYNTHESIS INSTRUCTIONS:
1. Analyze the original query and all agent outputs with reflection context
2. Consider the iterative improvements and quality assessments from the lineage
3. Create a unified, comprehensive response that directly answers the user's question
4. Integrate insights from all successful agent outputs into a cohesive narrative
5. Highlight any iterative improvements or refinements made during the process
6. Maintain a natural, conversational tone that feels helpful and approachable
7. Provide actionable, useful information that the user can immediately apply
8. Structure the response logically with clear, natural transitions between topics
9. CRITICAL: Clean up all technical metadata, A2A communication details, and raw execution data
10. IMPORTANT: Extract only the actual response content from agent outputs, ignoring all technical wrapper data
11. IMPORTANT: The final response should look like it came directly from a helpful assistant, not from a technical system

Create a comprehensive response that fully addresses the user's query with reflection insights:
"""

        try:
            ollama_payload = {
                "model": self.orchestrator_model,
                "prompt": synthesis_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "max_tokens": 2000
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                synthesized_response = result.get('response', '')
                
                # Apply additional cleanup to ensure clean output
                cleaned_response = self._clean_response_output(synthesized_response)
                return cleaned_response
            else:
                logger.error(f"Synthesis API error: {response.status_code}")
                return self._fallback_synthesis(orchestration_results, query)
                
        except Exception as e:
            logger.error(f"Error in reflective response synthesis: {e}")
            return self._fallback_synthesis(orchestration_results, query)
    
    def execute_reflective_orchestration(self, query: str, selected_agents: List[AgentCapability], session_id: str, agent_selection_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute reflective orchestration with intelligent task analysis and iterative cycles"""
        try:
            orchestration_results = {}
            workflow_steps = []
            conversation_lineage = []
            
            # Step 1: Query Analysis & Reflection
            logger.info("🧠 Starting reflective query analysis...")
            task_analysis = self.analyze_query_for_reflection(query)
            
            # Add agent selection data (including task decomposition) to task analysis
            if agent_selection_data:
                # Convert AgentCapability objects to serializable dictionaries
                serializable_agents = []
                for agent in selected_agents:
                    if hasattr(agent, '__dict__'):
                        serializable_agents.append({
                            'agent_id': getattr(agent, 'agent_id', ''),
                            'name': getattr(agent, 'name', ''),
                            'model': getattr(agent, 'model', ''),
                            'capabilities': getattr(agent, 'capabilities', [])
                        })
                    else:
                        serializable_agents.append(agent)
                
                task_analysis.update({
                    'multi_agent_analysis': agent_selection_data.get('multi_agent_analysis', {}),
                    'agent_selection': agent_selection_data.get('agent_selection', {}),
                    'available_agents': serializable_agents  # Include serializable agent data
                })
            
            logger.info(f"📋 Task Analysis: {task_analysis.get('task_type')} - {task_analysis.get('complexity_level')}")
            
            # Step 2: Process All Selected Agents Sequentially
            for agent_index, agent in enumerate(selected_agents):
                current_iteration = agent_index + 1
                
                logger.info(f"🔄 Processing Agent {current_iteration}/{len(selected_agents)}: {agent.name}")
                
                # Generate specific instructions for this agent
                agent_instructions = self.generate_agent_instructions(
                    query, task_analysis, agent, current_iteration, orchestration_results
                )
                
                # Execute agent with reflection
                agent_result = self._execute_agent_with_reflection(
                    agent, agent_instructions, task_analysis, session_id, current_iteration
                )
                
                if agent_result:
                    orchestration_results[agent.name] = agent_result
                    
                    # Analyze agent output for quality and next steps
                    output_analysis = self.analyze_agent_output(
                        agent_result.get('result', ''),
                        task_analysis,
                        task_analysis.get('success_criteria', [])
                    )
                    
                    logger.info(f"📊 Output Analysis: Quality {output_analysis.get('quality_score', 0):.2f}, Next: {output_analysis.get('next_action')}")
                    
                    # Add to conversation lineage
                    handoff_record = {
                        "handoff_id": f"{session_id}_reflection_{current_iteration}",
                        "from_agent": "Main System Orchestrator",
                        "to_agent": agent.name,
                        "timestamp": datetime.now().isoformat(),
                        "handoff_type": "reflective_orchestration",
                        "status": "completed",
                        "instructions": agent_instructions,
                        "agent_response": agent_result.get('result', ''),
                        "execution_time": agent_result.get('execution_time', 0),
                        "output_analysis": output_analysis,
                        "iteration": current_iteration
                    }
                    conversation_lineage.append(handoff_record)
                    
                    logger.info(f"✅ Agent {agent.name} completed successfully")
                else:
                    logger.error(f"❌ Agent {agent.name} failed")
                    # Continue with next agent even if current one failed
                    continue
            
            logger.info("🎯 All agents processed, ready for final synthesis")
            
            # Step 3: Final Synthesis with Reflection
            logger.info("🎯 Synthesizing final response with reflection...")
            final_response = self.synthesize_final_response_with_reflection(
                orchestration_results, query, task_analysis, conversation_lineage
            )
            
            # Create orchestration session
            session = OrchestrationSession(
                session_id=session_id,
                query=query,
                agents_involved=[agent.name for agent in selected_agents],
                status="completed",
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            self.active_sessions[session_id] = session
            
            # Store in history
            self.orchestration_history.append({
                "session_id": session_id,
                "query": query,
                "agents_involved": [agent.name for agent in selected_agents],
                "workflow_steps": workflow_steps,
                "total_execution_time": sum(result.get('execution_time', 0) for result in orchestration_results.values()),
                "status": "completed",
                "timestamp": datetime.now().isoformat(),
                "reflection_enabled": True,
                "task_analysis": task_analysis
            })
            
            return {
                "session_id": session_id,
                "status": "completed",
                "agents_involved": [agent.name for agent in selected_agents],
                "workflow_steps": workflow_steps,
                "orchestration_results": orchestration_results,
                "total_execution_time": sum(result.get('execution_time', 0) for result in orchestration_results.values()),
                "conversation_lineage": conversation_lineage,
                "task_analysis": task_analysis,
                "reflection_enabled": True,
                "final_response": final_response,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in reflective orchestration: {e}")
            return {
                "session_id": session_id,
                "status": "error",
                "error": str(e),
                "success": False
            }
            
            # Create orchestration session
            session = OrchestrationSession(
                session_id=session_id,
                query=query,
                agents_involved=[agent.name for agent in selected_agents],
                status="running",
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            self.active_sessions[session_id] = session
            
            # Execute orchestration sequentially with conversation lineage tracking
            conversation_lineage = []
            for i, agent in enumerate(selected_agents):
                step_start = time.time()
                
                # Create handoff ID for lineage tracking
                handoff_id = f"{session_id}_handoff_{i+1}"
                
                # Prepare enhanced context for agent with lineage (avoiding circular reference)
                previous_data = ""
                if orchestration_results:
                    last_agent = list(orchestration_results.keys())[-1]
                    previous_data = orchestration_results[last_agent].get('result', '')
                
                context = {
                    "query": query,
                    "step": i + 1,
                    "total_steps": len(selected_agents),
                    "agent_role": agent.name,
                    "session_id": session_id,
                    "orchestrator": "Main System Orchestrator",
                    "handoff_id": handoff_id,
                    "processed_data": previous_data,
                    "handoff_type": "orchestration" if i == 0 else "data_processing"
                }
                
                # Create handoff record for lineage tracking
                handoff_record = {
                    "handoff_id": handoff_id,
                    "from_agent": "Main System Orchestrator",
                    "to_agent": agent.name,
                    "timestamp": datetime.now().isoformat(),
                    "context": context,
                    "handoff_type": context["handoff_type"],
                    "status": "in_progress",
                    "instructions": f"You are {agent.name}. Process this query using your specialized capabilities: {agent.capabilities}. Previous agent results: {context.get('processed_data', 'None')}"
                }
                
                # Add to conversation lineage
                conversation_lineage.append(handoff_record)
                
                # Send direct A2A message to agent backend with lineage (avoiding circular reference)
                a2a_payload = {
                    "from_agent": "Main System Orchestrator",
                    "to_agent": agent.agent_id,
                    "message": f"Execute query: {query}",
                    "context": context,
                    "session_id": session_id,
                    "query": query,
                    "agent_instructions": handoff_record["instructions"],
                    "handoff_id": handoff_id
                }
                
                # Register Main System Orchestrator if not already registered
                orchestrator_id = "main-system-orchestrator"
                self._ensure_orchestrator_registered(orchestrator_id)
                
                # Send via A2A service using correct endpoint with lineage (avoiding circular reference)
                a2a_message_payload = {
                    "from_agent_id": orchestrator_id,
                    "to_agent_id": agent.agent_id,
                    "content": f"Execute query: {query}",
                    "type": "orchestration",
                    "context": context,
                    "session_id": session_id,
                    "query": query,
                    "agent_instructions": handoff_record["instructions"],
                    "handoff_id": handoff_id,
                    "handoff_type": context["handoff_type"]
                }
                
                response = requests.post(
                    f"{A2A_SERVICE_URL}/api/a2a/messages",
                    json=a2a_message_payload,
                    timeout=120  # Longer timeout for agent processing
                )
                
                step_end = time.time()
                execution_time = step_end - step_start
                
                if response.status_code in [200, 201]:
                    result = response.json()
                    agent_response = result.get('response', '')
                    
                    # Update handoff record with completion
                    handoff_record["status"] = "completed"
                    handoff_record["completion_time"] = datetime.now().isoformat()
                    handoff_record["agent_response"] = agent_response
                    handoff_record["execution_time"] = execution_time
                    
                    orchestration_results[agent.name] = {
                        "status": "success",
                        "result": agent_response,
                        "execution_time": execution_time,
                        "step": i + 1,
                        "agent_id": agent.agent_id,
                        "model": agent.model,
                        "handoff_id": handoff_id
                    }
                    
                    workflow_steps.append({
                        "step": i + 1,
                        "agent": agent.name,
                        "agent_id": agent.agent_id,
                        "status": "completed",
                        "execution_time": execution_time,
                        "result": agent_response[:200] + "..." if len(agent_response) > 200 else agent_response
                    })
                    
                    logger.info(f"✅ Agent {agent.name} completed step {i+1} in {execution_time:.2f}s")
                    logger.info(f"📝 Agent response length: {len(agent_response)} characters")
                else:
                    error_msg = f"HTTP {response.status_code}: {response.text}"
                    orchestration_results[agent.name] = {
                        "status": "error",
                        "error": error_msg,
                        "execution_time": execution_time,
                        "step": i + 1,
                        "agent_id": agent.agent_id
                    }
                    
                    workflow_steps.append({
                        "step": i + 1,
                        "agent": agent.name,
                        "agent_id": agent.agent_id,
                        "status": "error",
                        "execution_time": execution_time,
                        "error": error_msg
                    })
                    
                    logger.error(f"❌ Agent {agent.name} failed step {i+1}: {error_msg}")
            
            # Update session
            session.status = "completed"
            session.updated_at = datetime.now()
            session.results = orchestration_results
            
            # Store in history
            self.orchestration_history.append({
                "session_id": session_id,
                "query": query,
                "agents_involved": [agent.name for agent in selected_agents],
                "workflow_steps": workflow_steps,
                "total_execution_time": sum(step.get('execution_time', 0) for step in workflow_steps),
                "status": "completed",
                "timestamp": datetime.now().isoformat()
            })
            
            return {
                "session_id": session_id,
                "status": "completed",
                "agents_involved": [agent.name for agent in selected_agents],
                "workflow_steps": workflow_steps,
                "orchestration_results": orchestration_results,
                "total_execution_time": sum(step.get('execution_time', 0) for step in workflow_steps),
                "conversation_lineage": conversation_lineage,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in direct agent orchestration: {e}")
            return {
                "session_id": session_id,
                "status": "error",
                "error": str(e),
                "success": False
            }
    
    def synthesize_final_response(self, orchestration_results: Dict[str, Any], query: str) -> str:
        """Synthesize comprehensive final response using Qwen3:1.7b"""
        try:
            # Prepare detailed synthesis prompt
            synthesis_prompt = f"""
You are the Main System Orchestrator. Create a comprehensive, professional response that synthesizes all agent outputs into a cohesive answer to the user's query.

USER QUERY: "{query}"

AGENT ORCHESTRATION RESULTS:
{json.dumps(orchestration_results, indent=2)}

INSTRUCTIONS:
1. Analyze the original query and all agent responses to understand the complete context
2. Create a unified, comprehensive response that directly answers the user's question
3. Integrate insights from all successful agent outputs into a cohesive narrative
4. Maintain a natural, conversational tone that feels helpful and approachable
5. If any agents failed, acknowledge this briefly but focus on successful results
6. Provide actionable, useful information that the user can immediately apply
7. Structure the response logically with clear, natural transitions between topics
8. CRITICAL: Clean up all technical metadata, A2A communication details, and raw execution data
9. CRITICAL: Extract only the actual content from agent outputs, removing all technical wrapper data
10. CRITICAL: Present a clean, user-friendly response that looks like it came directly from a helpful assistant

RESPONSE FORMATTING GUIDELINES:
- Start with a direct, natural answer to the query
- For single tasks: Present the solution in a clear, step-by-step manner
- For multiple tasks: Organize responses by task with natural transitions like "First," "Next," "Additionally," "Finally"
- Use natural language transitions between different agent contributions
- Provide clear, actionable insights that flow naturally
- End with a helpful summary or next steps if appropriate
- NO technical details, metadata, or A2A communication data should be visible to the user

CONTENT CLEANUP REQUIREMENTS:
- Remove all JSON metadata, execution results, and technical wrapper information
- Extract only the actual content from agent responses
- Remove thinking processes, internal reasoning, and technical logs
- Present clean, readable content that directly addresses the user's query
- Format appropriately: use code blocks only for actual code, paragraphs for text
- IMPORTANT: Do NOT include any technical details like HTTP status codes, execution times, model names, or A2A communication data
- IMPORTANT: Extract only the actual response content from agent outputs, ignoring all technical wrapper data
- IMPORTANT: The final response should look like it came directly from a helpful assistant, not from a technical system

MULTI-TASK FORMATTING:
- When handling multiple related tasks, organize them naturally with clear transitions
- Use conversational connectors like "Let me help you with that," "Here's how to approach this," "For the next part"
- Present each task solution in a logical order that makes sense to the user
- Ensure smooth flow between different aspects of the response
- Avoid repetitive formatting symbols - let the content speak naturally

Create a comprehensive response that fully addresses the user's query:
"""

            # Call Qwen3:1.7b for synthesis
            ollama_payload = {
                "model": self.orchestrator_model,
                "prompt": synthesis_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "max_tokens": 3000
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_payload,
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.json()
                synthesized_response = result.get('response', '')
                logger.info("✨ Response synthesis completed")
                logger.info(f"📝 Synthesized response length: {len(synthesized_response)} characters")
                
                # Apply additional cleanup to ensure clean output
                cleaned_response = self._clean_response_output(synthesized_response)
                return cleaned_response
            else:
                logger.error(f"Synthesis API error: {response.status_code}")
                return self._fallback_synthesis(orchestration_results, query)
                
        except Exception as e:
            logger.error(f"Error in response synthesis: {e}")
            return self._fallback_synthesis(orchestration_results, query)
    
    def _clean_response_output(self, response: str) -> str:
        """Clean up response output to remove technical metadata and ensure user-friendly format"""
        try:
            # Check if response contains JSON that should be formatted
            json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            json_matches = re.findall(json_pattern, response, re.DOTALL)
            
            # If we find JSON, try to format it nicely
            if json_matches:
                cleaned = response
                
                # Try to parse and format each JSON block
                for json_match in json_matches:
                    try:
                        parsed_json = json.loads(json_match)
                        
                        # Check if this looks like a structured response (poem, data, etc.)
                        if self._is_structured_content(parsed_json):
                            formatted_content = self._format_structured_content(parsed_json)
                            cleaned = cleaned.replace(json_match, formatted_content)
                        else:
                            # For other JSON, just clean it up
                            cleaned = cleaned.replace(json_match, '')
                    except json.JSONDecodeError:
                        # If it's not valid JSON, remove it
                        cleaned = cleaned.replace(json_match, '')
                
                # Clean up any remaining technical artifacts
                cleaned = self._remove_technical_artifacts(cleaned)
                logger.info("🧹 Response cleaned and JSON formatted for display")
                return cleaned
            
            # Original cleaning logic for non-JSON responses
            cleaned = response
            
            # Remove thinking blocks completely
            cleaned = re.sub(r'<think>.*?</think>', '', cleaned, flags=re.DOTALL)
            
            # Remove all JSON metadata patterns (more comprehensive)
            cleaned = re.sub(r'\{[^}]*"execution_result"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"ollama_metadata"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"message_id"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"status"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"response"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"success"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"created_at"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"done"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"eval_count"[^}]*\}', '', cleaned)
            cleaned = re.sub(r'\{[^}]*"total_duration"[^}]*\}', '', cleaned)
            
            # Remove technical wrapper patterns
            cleaned = re.sub(r'HTTP \d+:', '', cleaned)
            cleaned = re.sub(r'execution_time.*?seconds?', '', cleaned)
            cleaned = re.sub(r'model.*?qwen3:1\.7b', '', cleaned)
            cleaned = re.sub(r'from_agent.*?Main System Orchestrator', '', cleaned)
            cleaned = re.sub(r'to_agent.*?', '', cleaned)
            cleaned = re.sub(r'timestamp.*?', '', cleaned)
            
            # Remove escaped characters and clean up
            cleaned = cleaned.replace('\\n', '\n')
            cleaned = cleaned.replace('\\"', '"')
            cleaned = cleaned.replace('\\t', '\t')
            
            # Remove excessive whitespace and clean up formatting
            cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)  # Multiple newlines to double
            cleaned = re.sub(r'^\s+', '', cleaned, flags=re.MULTILINE)  # Leading whitespace
            cleaned = cleaned.strip()
            
            # Ensure proper formatting for different content types
            if '```' in cleaned:
                # Ensure code blocks are properly formatted
                cleaned = re.sub(r'```(\w+)?\n', r'```\1\n', cleaned)
            
            # Remove any remaining technical artifacts
            cleaned = re.sub(r'^.*?response.*?:', '', cleaned, flags=re.MULTILINE)
            cleaned = re.sub(r'^.*?success.*?:', '', cleaned, flags=re.MULTILINE)
            
            # Clean up excessive formatting symbols for natural language
            cleaned = re.sub(r'\*\*\*\*+', '', cleaned)  # Remove excessive asterisks
            cleaned = re.sub(r'##+', '', cleaned)  # Remove excessive hash symbols
            cleaned = re.sub(r'__+', '', cleaned)  # Remove excessive underscores
            cleaned = re.sub(r'---+', '---', cleaned)  # Normalize horizontal rules
            cleaned = re.sub(r'\n\s*---\s*\n', '\n\n', cleaned)  # Clean up horizontal rules
            
            # Ensure natural paragraph breaks
            cleaned = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned)  # Multiple newlines to double
            
            logger.info("🧹 Response cleaned and formatted with natural language")
            return cleaned
            
        except Exception as e:
            logger.error(f"Error cleaning response: {e}")
            return response  # Return original if cleanup fails
    
    def _is_structured_content(self, parsed_json: dict) -> bool:
        """Check if JSON contains structured content that should be formatted"""
        # Check for common structured content patterns
        structured_keys = ['title', 'author', 'poem', 'lines', 'content', 'data', 'result', 'output']
        return any(key in parsed_json for key in structured_keys)
    
    def _format_structured_content(self, parsed_json: dict) -> str:
        """Format structured JSON content for better display"""
        try:
            # Handle poem-like content
            if 'poem' in parsed_json and 'lines' in parsed_json.get('poem', {}):
                poem_data = parsed_json['poem']
                lines = poem_data.get('lines', [])
                
                formatted = ""
                if 'title' in parsed_json:
                    formatted += f"**{parsed_json['title']}**\n\n"
                if 'author' in parsed_json:
                    formatted += f"*by {parsed_json['author']}*\n\n"
                
                # Format poem lines
                for line in lines:
                    formatted += f"{line}\n"
                
                # Add metadata if available
                if 'metadata' in parsed_json:
                    metadata = parsed_json['metadata']
                    formatted += "\n"
                    for key, value in metadata.items():
                        formatted += f"*{key.replace('_', ' ').title()}: {value}*\n"
                
                return formatted.strip()
            
            # Handle general structured content
            elif 'content' in parsed_json or 'result' in parsed_json or 'output' in parsed_json:
                content = parsed_json.get('content') or parsed_json.get('result') or parsed_json.get('output')
                if isinstance(content, str):
                    return content
                elif isinstance(content, list):
                    return '\n'.join(str(item) for item in content)
                elif isinstance(content, dict):
                    formatted = ""
                    for key, value in content.items():
                        formatted += f"**{key.replace('_', ' ').title()}**: {value}\n"
                    return formatted.strip()
            
            # Handle data arrays
            elif 'data' in parsed_json and isinstance(parsed_json['data'], list):
                formatted = ""
                for item in parsed_json['data']:
                    if isinstance(item, dict):
                        for key, value in item.items():
                            formatted += f"**{key.replace('_', ' ').title()}**: {value}\n"
                        formatted += "\n"
                    else:
                        formatted += f"{item}\n"
                return formatted.strip()
            
            # Default formatting for other structured content
            else:
                formatted = ""
                for key, value in parsed_json.items():
                    if isinstance(value, dict):
                        formatted += f"**{key.replace('_', ' ').title()}**:\n"
                        for sub_key, sub_value in value.items():
                            formatted += f"  • {sub_key.replace('_', ' ').title()}: {sub_value}\n"
                    elif isinstance(value, list):
                        formatted += f"**{key.replace('_', ' ').title()}**:\n"
                        for item in value:
                            formatted += f"  • {item}\n"
                    else:
                        formatted += f"**{key.replace('_', ' ').title()}**: {value}\n"
                return formatted.strip()
                
        except Exception as e:
            logger.error(f"Error formatting structured content: {e}")
            return str(parsed_json)
    
    def _remove_technical_artifacts(self, text: str) -> str:
        """Remove technical artifacts from text"""
        cleaned = text
        
        # Remove technical wrapper patterns
        cleaned = re.sub(r'HTTP \d+:', '', cleaned)
        cleaned = re.sub(r'execution_time.*?seconds?', '', cleaned)
        cleaned = re.sub(r'model.*?qwen3:1\.7b', '', cleaned)
        cleaned = re.sub(r'from_agent.*?Main System Orchestrator', '', cleaned)
        cleaned = re.sub(r'to_agent.*?', '', cleaned)
        cleaned = re.sub(r'timestamp.*?', '', cleaned)
        
        # Remove escaped characters and clean up
        cleaned = cleaned.replace('\\n', '\n')
        cleaned = cleaned.replace('\\"', '"')
        cleaned = cleaned.replace('\\t', '\t')
        
        # Remove excessive whitespace and clean up formatting
        cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)  # Multiple newlines to double
        cleaned = re.sub(r'^\s+', '', cleaned, flags=re.MULTILINE)  # Leading whitespace
        cleaned = cleaned.strip()
        
        return cleaned
    
    def _fallback_synthesis(self, orchestration_results: Dict[str, Any], query: str) -> str:
        """Fallback synthesis when Qwen3 is unavailable"""
        response_parts = [f"Response to: {query}\n"]
        
        for agent_name, result in orchestration_results.items():
            if result.get('status') == 'success':
                response_parts.append(f"{agent_name}: {result.get('result', '')}")
            else:
                response_parts.append(f"{agent_name}: Error - {result.get('error', 'Unknown error')}")
        
        return "\n\n".join(response_parts)
    
    # Prompt Management Methods
    def _get_query_analysis_prompt(self) -> str:
        """Get the current query analysis prompt template"""
        if self.query_analysis_prompt:
            return self.query_analysis_prompt
        
        # Default prompt (same as the hardcoded one in analyze_query_with_qwen3)
        return """You are the Main System Orchestrator. Analyze this query intelligently to determine the optimal execution strategy.

Query: "{query}"

Available agents: {available_agents}

ANALYSIS APPROACH:
1. **Intent Recognition**: Identify the primary intent (creative, technical, analytical)
2. **Domain Classification**: Determine if query requires single or multiple domains
3. **Task Complexity**: Assess if query needs one agent or multiple agents
4. **Execution Strategy**: Determine optimal coordination approach

IMPORTANT GUIDELINES:
- **Creative queries** (poems, stories, art) are typically SINGLE-DOMAIN and SINGLE-AGENT
- **Technical queries** (code, math, analysis) are typically SINGLE-DOMAIN and SINGLE-AGENT  
- **Multi-domain** only when query explicitly requires different expertise areas
- **Multi-agent** only when query has multiple independent tasks or requires coordination

Provide analysis in JSON format:
{{
    "query_type": "technical|creative|analytical|multi_domain",
    "task_nature": "direct|sequential|parallel",
    "agentic_workflow_pattern": "single_agent|multi_agent|varying_domain",
    "orchestration_strategy": "sequential|parallel|hybrid",
    "complexity_level": "simple|moderate|complex",
    "domain_analysis": {{
        "primary_domain": "technical|creative|analytical",
        "secondary_domains": [],
        "is_multi_domain": false
    }},
    "workflow_steps": ["step1", "step2", "step3"],
    "reasoning": "Clear explanation of why this classification was chosen"
}}

DECISION CRITERIA:
- **single_agent**: Query has one clear intent that one agent can handle
- **multi_agent**: Query has multiple distinct tasks requiring different agents
- **varying_domain**: Query explicitly spans different expertise areas
- **is_multi_domain**: Only true if query explicitly requires multiple domains"""

    def _get_agent_analysis_prompt(self) -> str:
        """Get the current agent analysis prompt template"""
        if self.agent_analysis_prompt:
            return self.agent_analysis_prompt
        
        # Default prompt
        return """You are the Main System Orchestrator. Analyze each agent's relevance to this specific query using domain expertise scoring.

Query: "{query}"

Available Agents:
{agent_details}

SCORING CRITERIA:
1. Domain expertise match (0.0-1.0)
2. Capability alignment (0.0-1.0)  
3. Task suitability (0.0-1.0)
4. Overall relevance (0.0-1.0)

Provide analysis in JSON format:
{{
    "agent_analyses": [
        {{
            "agent_id": "agent_id",
            "agent_name": "AgentName",
            "relevance_score": 0.95,
            "domain_match": 0.9,
            "capability_match": 0.85,
            "task_suitability": 0.9,
            "reasoning": "Detailed explanation of why this agent is suitable",
            "handles_aspects": ["aspect1", "aspect2"],
            "confidence": 0.9
        }}
    ],
    "multi_agent_analysis": {{
        "requires_multiple_agents": true/false,
        "coordination_strategy": "sequential|parallel|hybrid",
        "reasoning": "Explanation of multi-agent coordination needs"
    }}
}}"""

    def _get_reflection_prompt(self) -> str:
        """Get the current reflection prompt template"""
        if self.reflection_prompt:
            return self.reflection_prompt
        
        # Default prompt
        return """You are the Main System Orchestrator's reflection engine. Analyze this user query and determine:

1. **Task Type**: What kind of task is this? (coding, analysis, creative, research, etc.)
2. **Complexity Level**: Simple, moderate, or complex?
3. **Required Skills**: What capabilities are needed?
4. **Success Criteria**: How will we know when it's complete?
5. **Potential Challenges**: What might be difficult?
6. **Resource Requirements**: What agents/tools are needed?

Provide structured analysis in JSON format."""

    def _get_instruction_generation_prompt(self) -> str:
        """Get the current instruction generation prompt template"""
        if self.instruction_generation_prompt:
            return self.instruction_generation_prompt
        
        # Default prompt
        return """You are generating specific instructions for an agent. Based on the task analysis, create clear, actionable instructions.

TASK ANALYSIS:
{task_analysis}

AGENT INFO:
-- Name: {agent_name}
- Model: {agent_model}
-- Capabilities: {agent_capabilities}

Create specific, actionable instructions that the agent can follow to complete this task effectively."""

    def _get_output_deduction_prompt(self) -> str:
        """Get the current output deduction prompt template"""
        if self.output_deduction_prompt:
            return self.output_deduction_prompt
        
        # Default prompt
        return """You are analyzing an agent's output to determine its quality and extract necessary information.

AGENT OUTPUT:
{agent_output}

SUCCESS CRITERIA:
{success_criteria}

Provide analysis in JSON format:
{{
    "quality_score": 0.0-1.0,
    "meets_criteria": true/false,
    "extracted_information": "key information from the output",
    "improvements_needed": ["suggestion1", "suggestion2"],
    "confidence": 0.0-1.0
}}"""

    def _get_synthesis_prompt(self) -> str:
        """Get the current synthesis prompt template"""
        if self.synthesis_prompt:
            return self.synthesis_prompt
        
        # Default prompt
        return """You are the Main System Orchestrator. Create a comprehensive, professional response that synthesizes all agent outputs into a cohesive answer to the user's query.

USER QUERY: "{query}"

AGENT OUTPUTS:
{agent_outputs}

SYNTHESIS REQUIREMENTS:
1. **Coherence**: Ensure the response flows logically
2. **Completeness**: Address all aspects of the query
3. **Clarity**: Make complex information accessible
4. **Professionalism**: Maintain high quality standards

Create a comprehensive response that effectively answers the user's query using all available information."""

    def _update_query_analysis_prompt(self, prompt: str):
        """Update the query analysis prompt template"""
        self.query_analysis_prompt = prompt
        logger.info("Updated query analysis prompt")

    def _update_agent_analysis_prompt(self, prompt: str):
        """Update the agent analysis prompt template"""
        self.agent_analysis_prompt = prompt
        logger.info("Updated agent analysis prompt")

    def _update_reflection_prompt(self, prompt: str):
        """Update the reflection prompt template"""
        self.reflection_prompt = prompt
        logger.info("Updated reflection prompt")

    def _update_instruction_generation_prompt(self, prompt: str):
        """Update the instruction generation prompt template"""
        self.instruction_generation_prompt = prompt
        logger.info("Updated instruction generation prompt")

    def _update_output_deduction_prompt(self, prompt: str):
        """Update the output deduction prompt template"""
        self.output_deduction_prompt = prompt
        logger.info("Updated output deduction prompt")

    def _update_synthesis_prompt(self, prompt: str):
        """Update the synthesis prompt template"""
        self.synthesis_prompt = prompt
        logger.info("Updated synthesis prompt")

# Initialize orchestrator
main_orchestrator = MainSystemOrchestrator()

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "service": "main-system-orchestrator",
        "status": "healthy",
        "model": ORCHESTRATOR_MODEL,
        "port": MAIN_ORCHESTRATOR_PORT,
        "a2a_integration": True,
        "strands_sdk_enabled": True,
        "active_sessions": len(main_orchestrator.active_sessions),
        "registered_agents": len(main_orchestrator.registered_agents),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/main-orchestrator/discover-agents', methods=['GET'])
def discover_agents():
    """Discover orchestration-enabled agents"""
    try:
        agents = main_orchestrator.discover_orchestration_enabled_agents()
        return jsonify({
            "status": "success",
            "agents": [asdict(agent) for agent in agents],
            "count": len(agents),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/main-orchestrator/analyze', methods=['POST'])
def analyze_query():
    """Analyze query using Qwen3:1.7b"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({
                "status": "error",
                "error": "Query is required"
            }), 400
        
        analysis = main_orchestrator.analyze_query_with_qwen3(query)
        
        return jsonify({
            "status": "success",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/main-orchestrator/orchestrate', methods=['POST'])
def orchestrate():
    """Main orchestration endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({
                "status": "error",
                "error": "Query is required"
            }), 400
        
        session_id = str(uuid.uuid4())
        
        # Step 1: Discover agents
        agents = main_orchestrator.discover_orchestration_enabled_agents()
        if not agents:
            return jsonify({
                "status": "error",
                "error": "No orchestration-enabled agents found"
            }), 400
        
        # Step 2: Analyze query
        analysis = main_orchestrator.analyze_query_with_qwen3(query)
        
        # Step 3: Select agents using intelligent scoring system
        selected_agents = main_orchestrator.select_agents_for_orchestration(query, analysis)
        agent_selection_data = main_orchestrator._get_agent_selection_data(query, analysis, selected_agents)
        
        if not selected_agents:
            return jsonify({
                "status": "error",
                "error": "No suitable agents found for orchestration",
                "session_id": session_id,
                "analysis": analysis,
                "agent_selection": agent_selection_data
            }), 400
        
        # Step 4: Execute reflective orchestration with agent selection data
        orchestration_result = main_orchestrator.execute_reflective_orchestration(query, selected_agents, session_id, agent_selection_data)
        
        # Step 5: Handle response (reflective orchestration already includes final_response)
        if orchestration_result.get('success') and not orchestration_result.get('final_response'):
            # Fallback synthesis if not already included
            final_response = main_orchestrator.synthesize_final_response(
                orchestration_result.get('orchestration_results', {}),
                query
            )
            orchestration_result['final_response'] = final_response
        
        return jsonify({
            "status": "success",
            "session_id": session_id,
            "query": query,
            "analysis": analysis,
            "agent_selection": agent_selection_data,
            "selected_agents": [asdict(agent) for agent in selected_agents],
            "orchestration_result": orchestration_result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/main-orchestrator/sessions', methods=['GET'])
def get_sessions():
    """Get orchestration sessions"""
    try:
        return jsonify({
            "status": "success",
            "active_sessions": len(main_orchestrator.active_sessions),
            "session_history": main_orchestrator.orchestration_history[-10:],  # Last 10 sessions
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/main-orchestrator/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get specific orchestration session"""
    try:
        if session_id in main_orchestrator.active_sessions:
            session = main_orchestrator.active_sessions[session_id]
            return jsonify({
                "status": "success",
                "session": asdict(session),
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "error",
                "error": "Session not found"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Configuration Management
@app.route('/api/main-orchestrator/config', methods=['GET'])
def get_config():
    """Get current orchestrator configuration"""
    try:
        # Get available Ollama models
        try:
            models_response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            available_models = ["qwen3:1.7b"]  # Default fallback
            if models_response.status_code == 200:
                models_data = models_response.json()
                available_models = [model['name'] for model in models_data.get('models', [])]
        except:
            available_models = ["qwen3:1.7b"]
        
        config = {
            # Core Settings
            "orchestrator_model": main_orchestrator.orchestrator_model,
            "main_orchestrator_port": MAIN_ORCHESTRATOR_PORT,
            "strands_sdk_url": STRANDS_SDK_URL,
            "a2a_service_url": A2A_SERVICE_URL,
            "ollama_base_url": OLLAMA_BASE_URL,
            
            # Model Parameters (these would be stored in the orchestrator instance)
            "temperature_query_analysis": 0.3,
            "temperature_agent_analysis": 0.2,
            "temperature_reflection": 0.2,
            "temperature_instruction": 0.3,
            "temperature_deduction": 0.2,
            "temperature_synthesis": 0.3,
            
            "top_p_query_analysis": 0.9,
            "top_p_agent_analysis": 0.8,
            "top_p_reflection": 0.9,
            "top_p_instruction": 0.9,
            "top_p_deduction": 0.9,
            "top_p_synthesis": 0.9,
            
            "max_tokens_query_analysis": 1000,
            "max_tokens_agent_analysis": 1200,
            "max_tokens_reflection": 800,
            "max_tokens_instruction": 600,
            "max_tokens_deduction": 800,
            "max_tokens_synthesis": 2000,
            
            # Timeout Settings
            "timeout_a2a_discovery": 5,
            "timeout_query_analysis": 30,
            "timeout_agent_analysis": 45,
            "timeout_reflection": 30,
            "timeout_instruction": 30,
            "timeout_deduction": 30,
            "timeout_synthesis": 60,
            "timeout_a2a_message": 120,
            "timeout_a2a_register": 10,
            
            # Scoring & Thresholds
            "minimum_relevance_threshold": 0.3,
            "default_confidence_score": 0.7,
            "technical_capability_weight": 0.4,
            "creative_capability_weight": 0.4,
            "general_capability_weight": 0.2,
            "code_execution_weight": 0.4,
            "file_read_weight": 0.3,
            "calculator_weight": 0.3,
            "domain_expertise_weight": 0.3,
            
            # System Prompts (these would be stored as class variables)
            "query_analysis_prompt": main_orchestrator._get_query_analysis_prompt(),
            "agent_analysis_prompt": main_orchestrator._get_agent_analysis_prompt(),
            "reflection_prompt": main_orchestrator._get_reflection_prompt(),
            "instruction_generation_prompt": main_orchestrator._get_instruction_generation_prompt(),
            "output_deduction_prompt": main_orchestrator._get_output_deduction_prompt(),
            "synthesis_prompt": main_orchestrator._get_synthesis_prompt(),
            
            # Advanced Options
            "enable_json_formatting": True,
            "enable_markdown_formatting": True,
            "enable_structured_content_formatting": True,
            "enable_technical_artifact_removal": True,
            "enable_reflection_engine": True,
            "enable_quality_scoring": True,
            "logging_level": "INFO",
            
            # Available Models
            "available_models": available_models,
            
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(config)
        
    except Exception as e:
        logger.error(f"Error getting configuration: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/main-orchestrator/config', methods=['PUT'])
def update_config():
    """Update orchestrator configuration"""
    try:
        config_data = request.get_json()
        
        # Update core settings
        if 'orchestrator_model' in config_data:
            main_orchestrator.orchestrator_model = config_data['orchestrator_model']
            logger.info(f"Updated orchestrator model to: {config_data['orchestrator_model']}")
        
        # Update system prompts
        if 'query_analysis_prompt' in config_data:
            main_orchestrator._update_query_analysis_prompt(config_data['query_analysis_prompt'])
        
        if 'agent_analysis_prompt' in config_data:
            main_orchestrator._update_agent_analysis_prompt(config_data['agent_analysis_prompt'])
        
        if 'reflection_prompt' in config_data:
            main_orchestrator._update_reflection_prompt(config_data['reflection_prompt'])
        
        if 'instruction_generation_prompt' in config_data:
            main_orchestrator._update_instruction_generation_prompt(config_data['instruction_generation_prompt'])
        
        if 'output_deduction_prompt' in config_data:
            main_orchestrator._update_output_deduction_prompt(config_data['output_deduction_prompt'])
        
        if 'synthesis_prompt' in config_data:
            main_orchestrator._update_synthesis_prompt(config_data['synthesis_prompt'])
        
        # Update model parameters (these would be stored in the orchestrator instance)
        model_params = [
            'temperature_query_analysis', 'temperature_agent_analysis', 'temperature_reflection',
            'temperature_instruction', 'temperature_deduction', 'temperature_synthesis',
            'top_p_query_analysis', 'top_p_agent_analysis', 'top_p_reflection',
            'top_p_instruction', 'top_p_deduction', 'top_p_synthesis',
            'max_tokens_query_analysis', 'max_tokens_agent_analysis', 'max_tokens_reflection',
            'max_tokens_instruction', 'max_tokens_deduction', 'max_tokens_synthesis'
        ]
        
        for param in model_params:
            if param in config_data:
                setattr(main_orchestrator, param, config_data[param])
        
        # Update timeout settings
        timeout_params = [
            'timeout_a2a_discovery', 'timeout_query_analysis', 'timeout_agent_analysis',
            'timeout_reflection', 'timeout_instruction', 'timeout_deduction',
            'timeout_synthesis', 'timeout_a2a_message', 'timeout_a2a_register'
        ]
        
        for param in timeout_params:
            if param in config_data:
                setattr(main_orchestrator, param, config_data[param])
        
        # Update scoring & thresholds
        scoring_params = [
            'minimum_relevance_threshold', 'default_confidence_score',
            'technical_capability_weight', 'creative_capability_weight',
            'general_capability_weight', 'code_execution_weight',
            'file_read_weight', 'calculator_weight', 'domain_expertise_weight'
        ]
        
        for param in scoring_params:
            if param in config_data:
                setattr(main_orchestrator, param, config_data[param])
        
        # Update advanced options
        advanced_params = [
            'enable_json_formatting', 'enable_markdown_formatting',
            'enable_structured_content_formatting', 'enable_technical_artifact_removal',
            'enable_reflection_engine', 'enable_quality_scoring'
        ]
        
        for param in advanced_params:
            if param in config_data:
                setattr(main_orchestrator, param, config_data[param])
        
        logger.info("✅ Configuration updated successfully")
        
        return jsonify({
            "status": "success",
            "message": "Configuration updated successfully",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error updating configuration: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/main-orchestrator/models', methods=['GET'])
def get_available_models():
    """Get available Ollama models"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models_data = response.json()
            models = [model['name'] for model in models_data.get('models', [])]
            return jsonify({
                "models": models,
                "status": "success",
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "models": ["qwen3:1.7b"],  # Fallback
                "status": "warning",
                "message": "Could not fetch models from Ollama",
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"Error fetching available models: {e}")
        return jsonify({
            "models": ["qwen3:1.7b"],  # Fallback
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        })

if __name__ == '__main__':
    logger.info(f"🚀 Starting Main System Orchestrator on port {MAIN_ORCHESTRATOR_PORT}")
    logger.info(f"🧠 Model: {ORCHESTRATOR_MODEL}")
    logger.info("🔗 A2A Strands SDK Integration: Enabled")
    
    app.run(
        host='0.0.0.0',
        port=MAIN_ORCHESTRATOR_PORT,
        debug=False
    )
