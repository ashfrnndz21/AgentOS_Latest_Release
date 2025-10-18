#!/usr/bin/env python3
"""
Main System Orchestrator
Independent backend orchestrator using granite4:micro with A2A Strands SDK integration
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
MAIN_ORCHESTRATOR_PORT = int(os.getenv('MAIN_ORCHESTRATOR_PORT', '5031'))
STRANDS_SDK_URL = os.getenv('STRANDS_SDK_URL', 'http://localhost:5006')
A2A_SERVICE_URL = os.getenv('A2A_SERVICE_URL', 'http://localhost:5008')
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
ORCHESTRATOR_MODEL = os.getenv('ORCHESTRATOR_MODEL', 'granite4:micro')

# Load configuration from file
def load_orchestrator_config():
    """Load orchestrator configuration from environment file"""
    config = {}
    config_file = "orchestrator_config.env"
    
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
    
    # Set defaults
    defaults = {
        'MULTI_AGENT_KEYWORDS': 'churn,campaign,slogan,prepaid,analysis,creative,technical,research',
        'MIN_AGENT_SCORE_THRESHOLD': '0.1',
        'MIN_MULTI_AGENT_SCORE_THRESHOLD': '0.3',
        'MIN_AGENTS_FOR_MULTI_AGENT': '2',
        'OLLAMA_TIMEOUT': '30',
        'A2A_TIMEOUT': '120',
        'AGENT_EXECUTION_TIMEOUT': '60',
        'EXCLUDE_ORCHESTRATOR_FROM_SELECTION': 'true',
        'ORCHESTRATOR_ID': 'main-system-orchestrator',
        'LOG_LEVEL': 'INFO',
        'ENABLE_DEBUG_LOGGING': 'false',
        'DEFAULT_WORKFLOW_PATTERN': 'single_agent',
        'DEFAULT_COORDINATION_STRATEGY': 'sequential',
        'DEFAULT_COMPLEXITY_LEVEL': 'moderate',
        'ENABLE_OUTPUT_CLEANING': 'true',
        'ENABLE_REFLECTION': 'true',
        'ENABLE_SYNTHESIS': 'true'
    }
    
    for key, default_value in defaults.items():
        if key not in config:
            config[key] = default_value
    
    return config

# Load configuration
ORCHESTRATOR_CONFIG = load_orchestrator_config()

# Load agent capabilities
def load_agent_capabilities():
    """Load agent capabilities from JSON configuration"""
    capabilities = {}
    capabilities_file = "agent_capabilities.json"
    
    if os.path.exists(capabilities_file):
        with open(capabilities_file, 'r') as f:
            capabilities_data = json.load(f)
            capabilities = capabilities_data.get('agent_capabilities', {})
    
    return capabilities

# Load agent capabilities
AGENT_CAPABILITIES = load_agent_capabilities()

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
    """Agent capability mapping with dynamic capabilities"""
    agent_id: str
    name: str
    capabilities: List[str]
    model: str
    status: str
    a2a_enabled: bool
    description: str = ""
    system_prompt: str = ""
    keywords: List[str] = None
    domain: str = ""
    specialization: str = ""
    
    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []
        
        # Load dynamic capabilities if available
        if self.agent_id in AGENT_CAPABILITIES:
            dynamic_cap = AGENT_CAPABILITIES[self.agent_id]
            self.name = dynamic_cap.get('name', self.name)
            self.description = dynamic_cap.get('description', self.description)
            self.system_prompt = dynamic_cap.get('system_prompt', self.system_prompt)
            self.keywords = dynamic_cap.get('keywords', self.keywords)
            self.domain = dynamic_cap.get('domain', self.domain)
            self.specialization = dynamic_cap.get('specialization', self.specialization)
            
            # Merge capabilities
            dynamic_capabilities = dynamic_cap.get('capabilities', [])
            self.capabilities = list(set(self.capabilities + dynamic_capabilities))

class MainSystemOrchestrator:
    """Enhanced Main System Orchestrator with production patterns while preserving advanced capabilities"""
    
    def __init__(self):
        self.orchestrator_model = ORCHESTRATOR_MODEL
        self.active_sessions = {}
        self.registered_agents = {}
        self.orchestration_history = []
        
        # Enhanced: Add production patterns
        self.task_queue = {}  # Simple in-memory task queue
        self.agent_versions = {}  # Agent versioning support
        self.execution_memory = {}  # Orchestrator memory for consolidation
        
        logger.info("🚀 Enhanced Main System Orchestrator initialized")
        logger.info(f"📍 Model: {self.orchestrator_model}")
        logger.info(f"📍 Port: {MAIN_ORCHESTRATOR_PORT}")
        logger.info("📍 A2A Strands SDK Integration: Enabled")
        logger.info("🆕 Production Patterns: Task Queue, Agent Versioning, Memory Management")
        
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
                
                # Skip Main System Orchestrator from agent discovery
                if name == "Main System Orchestrator":
                    logger.info(f"🚫 Excluding Main System Orchestrator from agent discovery")
                    continue
                
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
    
    def _classify_agent_type_from_capabilities(self, agent: AgentCapability) -> str:
        """Dynamically classify agent type based on capabilities"""
        capabilities_str = ' '.join(agent.capabilities).lower()
        keywords_str = ' '.join(agent.keywords).lower() if agent.keywords else ''
        combined = f"{capabilities_str} {keywords_str}"
        
        # Analytical/Technical agents
        if any(kw in combined for kw in ['analysis', 'research', 'data', 'technical', 'network', 'performance', 'metrics']):
            return 'analytical'
        
        # Creative agents
        elif any(kw in combined for kw in ['creative', 'poetry', 'writing', 'slogan', 'story', 'humor', 'poem']):
            return 'creative'
        
        # Code/Implementation agents
        elif any(kw in combined for kw in ['code', 'programming', 'development', 'python', 'implementation']):
            return 'technical_implementation'
        
        # Campaign/Marketing agents
        elif any(kw in combined for kw in ['campaign', 'marketing', 'customer', 'churn', 'retention']):
            return 'strategic'
        
        # General agents
        else:
            return 'general'
    
    def _build_agent_capability_map(self) -> Dict[str, Dict]:
        """Build a dynamic map of agent capabilities for prompt injection"""
        agent_map = {}
        for agent in self.registered_agents.values():
            # Skip orchestrator
            if agent.name == "Main System Orchestrator":
                continue
                
            agent_map[agent.name] = {
                'capabilities': agent.capabilities,
                'type': self._classify_agent_type_from_capabilities(agent),
                'specialization': agent.specialization if hasattr(agent, 'specialization') else 'general',
                'keywords': agent.keywords if hasattr(agent, 'keywords') else []
            }
        return agent_map
    
    def analyze_query_with_llm(self, query: str) -> Dict[str, Any]:
        """Analyze query using configured orchestrator model (default: granite4:micro)"""
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
- **Single-agent**: Query has ONE clear intent that ONE agent can handle (e.g., "write a poem", "get weather data")
- **Multi-agent**: Query has MULTIPLE distinct tasks requiring DIFFERENT specialized agents (e.g., "analyze churn data AND design campaigns AND create slogans")
- **Multi-domain** when query explicitly requires different expertise areas (e.g., "write a poem AND create code")
- **Multi-agent** when query has multiple independent tasks or requires coordination
- **Combined queries** (analysis + creative) should be treated as MULTI-AGENT workflow pattern
- **Telco queries** requiring churn analysis + campaign design + creative content = MULTI-AGENT
- **CRITICAL**: If query contains "AND" or "then" connecting different task types (e.g., "analyze X AND create Y", "explain X then write Y"), use MULTI-AGENT workflow pattern
- **CRITICAL**: Technical analysis + creative generation = MULTI-AGENT (not single-agent)

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
- **single_agent**: Query has ONE clear intent that ONE agent can handle (e.g., "write a poem", "get weather data")
- **multi_agent**: Query has MULTIPLE distinct tasks requiring DIFFERENT specialized agents (e.g., "analyze churn data AND design campaigns AND create slogans")
- **varying_domain**: Query explicitly spans different expertise areas
- **is_multi_domain**: Only true if query explicitly requires multiple domains

CRITICAL RULES:
- If query contains "AND" or "then" connecting different task types → **multi_agent**
- Technical analysis + creative generation → **multi_agent** (not single-agent)
- "Explain X then create Y" → **multi_agent** workflow pattern
- "Analyze X AND write Y" → **multi_agent** workflow pattern
- "Explain X and then use that to create Y" → **multi_agent** workflow pattern
- "Identify X and then write Y" → **multi_agent** workflow pattern

SPECIFIC EXAMPLES:
- "Explain 4G performance indicators and then create a poem" = **multi_agent** (technical + creative)
- "Analyze data and then write a story" = **multi_agent** (analytical + creative)
- "Get weather data and then create code" = **multi_agent** (data + technical)

IMPORTANT: If the query requires BOTH data analysis AND creative generation, use **multi_agent** workflow pattern.
IMPORTANT: Any query with "and then" connecting different domains = **multi_agent** workflow pattern.
IMPORTANT: Telco queries with churn analysis + campaign design + creative content = **multi_agent** workflow pattern.
"""

            # Call orchestrator model via Ollama (default: granite4:micro)
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
                timeout=int(ORCHESTRATOR_CONFIG['OLLAMA_TIMEOUT'])
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
                except json.JSONDecodeError as e:
                    logger.warning(f"JSON parsing failed: {e}, using fallback analysis")
                    analysis = self._fallback_task_analysis(query)
                
                # POST-PROCESSING VALIDATION: Check if LLM misclassified multi-agent query
                analysis = self._validate_analysis_classification(query, analysis)
                
                logger.info(f"🧠 Query analysis completed: {analysis['agentic_workflow_pattern']} workflow pattern")
                return analysis
                
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return self._fallback_analysis(query)
                
        except Exception as e:
            logger.error(f"Error in query analysis: {e}")
            return self._fallback_analysis(query)
    
    def _validate_analysis_classification(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and correct LLM analysis if it misclassified multi-agent queries"""
        query_lower = query.lower()
        
        # Check for obvious multi-agent patterns that LLM might have missed
        multi_agent_patterns = [
            'and then',
            'then use that to',
            'then create',
            'then write',
            'then make',
            'then generate',
            'and create',
            'and write',
            'and make',
            'and generate'
        ]
        
        # Check for domain combinations that should be multi-agent
        has_technical = any(word in query_lower for word in ['explain', 'analyze', 'identify', 'performance', 'indicator', 'technical', 'data', 'code', 'python'])
        has_creative = any(word in query_lower for word in ['poem', 'story', 'creative', 'funny', 'humorous', 'write', 'create', 'generate'])
        has_analytical = any(word in query_lower for word in ['analyze', 'research', 'study', 'examine', 'investigate'])
        
        # If LLM classified as single_agent but we detect multi-agent patterns, correct it
        if (analysis.get('agentic_workflow_pattern') == 'single_agent' and 
            (any(pattern in query_lower for pattern in multi_agent_patterns) or
             (has_technical and has_creative) or
             (has_analytical and has_creative))):
            
            logger.warning(f"🔧 Correcting misclassified query: {query[:50]}... - should be multi_agent")
            
            # Update analysis to multi-agent
            analysis['agentic_workflow_pattern'] = 'multi_agent'
            analysis['orchestration_strategy'] = 'sequential'
            analysis['query_type'] = 'multi_domain'
            
            if 'domain_analysis' not in analysis:
                analysis['domain_analysis'] = {}
            analysis['domain_analysis']['is_multi_domain'] = True
            
            if has_technical and has_creative:
                analysis['domain_analysis']['primary_domain'] = 'technical'
                analysis['domain_analysis']['secondary_domains'] = ['creative']
                analysis['reasoning'] = f"Corrected: Query requires both technical analysis and creative generation - multi_agent workflow needed"
            elif has_analytical and has_creative:
                analysis['domain_analysis']['primary_domain'] = 'analytical'
                analysis['domain_analysis']['secondary_domains'] = ['creative']
                analysis['reasoning'] = f"Corrected: Query requires both analytical work and creative generation - multi_agent workflow needed"
            
            # Update workflow steps to reflect multi-agent nature
            if 'workflow_steps' in analysis:
                steps = analysis['workflow_steps']
                if len(steps) < 2:
                    # Split the query into logical steps
                    if 'and then' in query_lower:
                        parts = query_lower.split('and then')
                        if len(parts) == 2:
                            analysis['workflow_steps'] = [parts[0].strip(), parts[1].strip()]
        
        return analysis
    
    def _fallback_analysis(self, query: str) -> Dict[str, Any]:
        """Pure LLM-based analysis without keyword dependencies"""
        
        # Use LLM to analyze the query structure and requirements
        analysis_prompt = f"""
Analyze this query and determine the optimal workflow pattern. Consider:
1. Does this query require multiple distinct capabilities/expertise areas?
2. Are there sequential dependencies between tasks?
3. What is the complexity level?

Query: "{query}"

Respond with JSON only:
{{
    "has_multiple_requests": boolean,
    "task_nature": "sequential" | "parallel" | "direct",
    "complexity_level": "simple" | "moderate" | "complex",
    "workflow_pattern": "single_agent" | "multi_agent" | "varying_domain",
    "orchestration_strategy": "sequential" | "parallel" | "hybrid",
    "query_type": "creative" | "technical" | "analytical" | "multi_domain",
    "reasoning": "explanation of the analysis"
}}
"""
        
        try:
            # Use Granite4:micro for analysis
            response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", 
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": analysis_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                }, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                llm_response = result.get('response', '').strip()
                
                # Extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                if json_match:
                    analysis_result = json.loads(json_match.group())
                    logger.info(f"🧠 LLM Analysis Result: {analysis_result}")
                    return self._format_analysis_result(query, analysis_result)
            
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
        
        # Fallback to simple analysis if LLM fails
        return self._simple_fallback_analysis(query)
    
    def _format_analysis_result(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Format LLM analysis result into standard format"""
        query_length = len(query.split())
        
        return {
            "query": query,
            "query_length": query_length,
            "agentic_workflow_pattern": analysis.get("workflow_pattern", "single_agent"),
            "orchestration_strategy": analysis.get("orchestration_strategy", "sequential"),
            "query_type": analysis.get("query_type", "analytical"),
            "task_nature": analysis.get("task_nature", "direct"),
            "complexity": analysis.get("complexity_level", "simple"),
            "multi_domain": analysis.get("has_multiple_requests", False),
            "reasoning": analysis.get("reasoning", "LLM-based analysis"),
            "workflow_steps": self._generate_workflow_steps(analysis.get("workflow_pattern", "single_agent")),
            "timestamp": datetime.now().isoformat()
        }
    
    def _generate_workflow_steps(self, pattern: str) -> List[str]:
        """Generate workflow steps based on pattern"""
        if pattern == "single_agent":
            return [
                "Analyze the specific requirements",
                "Execute the task with specialized knowledge",
                "Provide comprehensive response"
            ]
        elif pattern == "multi_agent":
            return [
                "Analyze query components",
                "Coordinate between specialized agents",
                "Synthesize multi-agent outputs"
            ]
        else:  # varying_domain
            return [
                "Identify domain-specific requirements",
                "Route tasks to appropriate domain agents",
                "Integrate cross-domain results"
            ]
        
    def _simple_fallback_analysis(self, query: str) -> Dict[str, Any]:
        """Simple fallback analysis if LLM fails"""
        query_length = len(query.split())
        
        # Basic fallback - assume multi-agent for complex queries
        if query_length > 15:
            workflow_pattern = "multi_agent"
            orchestration_strategy = "sequential"
            query_type = "multi_domain"
        else:
            workflow_pattern = "single_agent"
            orchestration_strategy = "sequential"
            query_type = "analytical"
        
        return {
            "query": query,
            "query_length": query_length,
            "agentic_workflow_pattern": workflow_pattern,
            "orchestration_strategy": orchestration_strategy,
            "query_type": query_type,
            "task_nature": "direct",
            "complexity": "simple" if query_length < 10 else "moderate",
            "multi_domain": query_length > 15,
            "reasoning": "Simple fallback analysis - LLM unavailable",
            "workflow_steps": self._generate_workflow_steps(workflow_pattern),
            "timestamp": datetime.now().isoformat()
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
            agent_analysis = self._analyze_agent_relevance(query, analysis, available_agents)
            
            # Step 2: Rank agents by score and select optimal combination
            selected_agents = self._select_optimal_agent_combination(query, analysis, agent_analysis, available_agents)
            
            logger.info(f"🎯 Selected {len(selected_agents)} agents: {[a.name for a in selected_agents]}")
            return selected_agents
            
        except Exception as e:
            logger.error(f"Error in agent selection: {e}")
            return self._fallback_agent_selection(available_agents, analysis)
    
    def _fallback_task_analysis(self, query: str) -> Dict[str, Any]:
        """Fallback task analysis when LLM parsing fails"""
        query_lower = query.lower()
        
        # Simple heuristic analysis
        if any(word in query_lower for word in ['poem', 'story', 'creative', 'write', 'art']):
            return {
                "query_type": "creative",
                "task_nature": "direct",
                "agentic_workflow_pattern": "single_agent",
                "orchestration_strategy": "sequential",
                "workflow_steps": ["creative_generation"],
                "reasoning": "Fallback: Detected creative query"
            }
        elif any(word in query_lower for word in ['code', 'program', 'python', 'function', 'script']):
            return {
                "query_type": "technical",
                "task_nature": "direct", 
                "agentic_workflow_pattern": "single_agent",
                "orchestration_strategy": "sequential",
                "workflow_steps": ["technical_implementation"],
                "reasoning": "Fallback: Detected technical query"
            }
        elif any(word in query_lower for word in ['and', 'also', 'then', 'next', 'after']):
            return {
                "query_type": "multi_domain",
                "task_nature": "sequential",
                "agentic_workflow_pattern": "multi_agent", 
                "orchestration_strategy": "sequential",
                "workflow_steps": ["analyze", "execute", "synthesize"],
                "reasoning": "Fallback: Detected multi-step query"
            }
        else:
            return {
                "query_type": "analytical",
                "task_nature": "direct",
                "agentic_workflow_pattern": "single_agent",
                "orchestration_strategy": "sequential", 
                "workflow_steps": ["analysis"],
                "reasoning": "Fallback: Default analytical query"
            }

    def _analyze_agent_relevance(self, query: str, analysis: Dict[str, Any], available_agents: List[AgentCapability]) -> Dict[str, Any]:
        """Analyze each agent's relevance to the query and score them using orchestrator model"""
        try:
            # Create detailed agent analysis prompt
            agent_details = []
            for agent in available_agents:
                # Skip orchestrator if configured to exclude it
                orchestrator_id = ORCHESTRATOR_CONFIG['ORCHESTRATOR_ID']
                exclude_orchestrator = ORCHESTRATOR_CONFIG['EXCLUDE_ORCHESTRATOR_FROM_SELECTION'].lower() == 'true'
                
                if exclude_orchestrator and agent.agent_id == orchestrator_id:
                    continue
                    
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
You are the Main System Orchestrator. Analyze each agent's relevance to this specific query and map them to the workflow steps from query analysis.

Query: "{query}"

Query Analysis Results:
- Type: {analysis.get('query_type', 'unknown')}
- Task Nature: {analysis.get('task_nature', 'unknown')}
- Workflow Pattern: {analysis.get('agentic_workflow_pattern', 'unknown')}
- Complexity: {analysis.get('complexity_level', 'unknown')}
- Multi-Domain: {analysis.get('domain_analysis', {}).get('is_multi_domain', False)}
- Primary Domain: {analysis.get('domain_analysis', {}).get('primary_domain', 'unknown')}
- Workflow Steps: {analysis.get('workflow_steps', [])}

Available Agents:
{json.dumps(agent_details, indent=2)}

TASK: Map the workflow steps to specific agents. For each workflow step, select the most suitable agent and create task decomposition.

IMPORTANT: Use the workflow_steps from query analysis to create task_decomposition. Don't create new tasks.

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
                "task": "Map this to a workflow step from query analysis",
                "workflow_step": "The specific workflow step this agent handles",
                "dependencies": [],
                "priority": "high|medium|low"
            }}
        ]
    }},
    "overall_recommendation": "Detailed explanation of optimal agent selection strategy"
}}
"""

            # Call orchestrator model for intelligent agent analysis
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
        """Fallback scoring system when orchestrator model analysis fails"""
        logger.info(f"🔄 Using fallback agent scoring for {len(available_agents)} agents")
        agent_scores = []
        
        query_lower = query.lower()
        query_type = analysis.get('query_type', 'technical')
        
        for agent in available_agents:
            # Skip orchestrator if configured to exclude it
            orchestrator_id = ORCHESTRATOR_CONFIG['ORCHESTRATOR_ID']
            exclude_orchestrator = ORCHESTRATOR_CONFIG['EXCLUDE_ORCHESTRATOR_FROM_SELECTION'].lower() == 'true'
            
            if exclude_orchestrator and agent.agent_id == orchestrator_id:
                continue
                
            score = 0.0
            reasoning_parts = []
            
            # Enhanced capability matching using dynamic capabilities
            capabilities = agent.capabilities
            agent_keywords = getattr(agent, 'keywords', [])
            agent_domain = getattr(agent, 'domain', '')
            agent_specialization = getattr(agent, 'specialization', '')
            
            # Score based on capabilities
            if 'technical' in capabilities and any(keyword in query_lower for keyword in ['code', 'function', 'program', 'script', 'python', 'javascript', 'technical', 'development']):
                score += 0.4
                reasoning_parts.append("Technical capability match")
            
            if 'creative' in capabilities and any(keyword in query_lower for keyword in ['poem', 'story', 'creative', 'write', 'art', 'poetry', 'slogan']):
                score += 0.4
                reasoning_parts.append("Creative capability match")
            
            if 'churn_analysis' in capabilities and any(keyword in query_lower for keyword in ['churn', 'analysis', 'customer', 'retention']):
                score += 0.5
                reasoning_parts.append("Churn analysis capability match")
            
            if 'campaign_design' in capabilities and any(keyword in query_lower for keyword in ['campaign', 'prepaid', 'promotion', 'strategy']):
                score += 0.5
                reasoning_parts.append("Campaign design capability match")
            
            if 'data_analysis' in capabilities and any(keyword in query_lower for keyword in ['data', 'analysis', 'metrics', 'report']):
                score += 0.4
                reasoning_parts.append("Data analysis capability match")
            
            # Score based on keywords
            keyword_matches = sum(1 for keyword in agent_keywords if keyword.lower() in query_lower)
            if keyword_matches > 0:
                score += keyword_matches * 0.2
                reasoning_parts.append(f"Keyword match: {keyword_matches} keywords")
            
            # Score based on domain
            if agent_domain and agent_domain.lower() in query_lower:
                score += 0.3
                reasoning_parts.append(f"Domain expertise: {agent_domain}")
            
            # Score based on specialization
            if agent_specialization and agent_specialization.lower() in query_lower:
                score += 0.4
                reasoning_parts.append(f"Specialization match: {agent_specialization}")
            
            # Domain-based scoring with query type alignment
            query_type = analysis.get('query_type', 'general')
            if query_type == 'analytical' and 'creative' in capabilities:
                score *= 0.7  # Reduce creative agent score for analytical queries
                reasoning_parts.append("Domain alignment penalty: creative agent for analytical query")
            elif query_type == 'creative' and 'churn_analysis' in capabilities:
                score *= 0.8  # Slight reduction for analytical agent on creative query
                reasoning_parts.append("Domain alignment penalty: analytical agent for creative query")
            elif query_type == 'analytical' and 'churn_analysis' in capabilities:
                score *= 1.2  # Boost analytical agents for analytical queries
                reasoning_parts.append("Domain alignment boost: analytical agent for analytical query")
            elif query_type == 'creative' and 'creative_writing' in capabilities:
                score *= 1.2  # Boost creative agents for creative queries
                reasoning_parts.append("Domain alignment boost: creative agent for creative query")
            
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
        
        # Don't override multi-agent analysis in fallback - let query analysis determine this
        result = {
            "agent_scores": agent_scores,
            "multi_agent_analysis": {
                "requires_multiple_agents": True,  # Default to multi-agent for complex queries
                "coordination_strategy": "sequential",
                "task_decomposition": []  # Empty - let query analysis provide task decomposition
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
            
            # Determine if we need multiple agents - CRITICAL FIX for multi-agent sequential workflows
            workflow_pattern = analysis.get('agentic_workflow_pattern', 'single_agent')
            orchestration_strategy = analysis.get('orchestration_strategy', 'sequential')
            
            # FIX: For multi_agent workflow pattern, ALWAYS set requires_multiple = True
            # regardless of whether strategy is sequential, parallel, or hybrid
            if workflow_pattern in ['multi_agent', 'varying_domain']:
                requires_multiple = True
                logger.info(f"🎯 Multi-agent workflow detected (pattern: {workflow_pattern}, strategy: {orchestration_strategy})")
            else:
                # For single_agent patterns, check if LLM analysis recommends multiple agents
                requires_multiple = multi_agent_info.get('requires_multiple_agents', False)
            
            # For multi-agent queries, check configurable keywords
            query_lower = query.lower()
            multi_agent_keywords = ORCHESTRATOR_CONFIG['MULTI_AGENT_KEYWORDS'].split(',')
            min_agents_for_multi = int(ORCHESTRATOR_CONFIG['MIN_AGENTS_FOR_MULTI_AGENT'])
            
            if any(keyword.strip() in query_lower for keyword in multi_agent_keywords) and len(sorted_agents) >= min_agents_for_multi:
                requires_multiple = True
                logger.info(f"🎯 Multi-agent query detected by keywords - forcing multi-agent workflow")
                logger.info(f"🎯 Query keywords found: {[kw for kw in multi_agent_keywords if kw.strip() in query_lower]}")
                logger.info(f"🎯 Available agents: {len(sorted_agents)}")
            
            selected_agents = []
            
            logger.info(f"🎯 Workflow pattern: {workflow_pattern}, Strategy: {orchestration_strategy}, Requires multiple: {requires_multiple}")
            
            if requires_multiple:
                # Multi-agent analysis recommends multiple agents - prioritize this over workflow pattern
                logger.info(f"🔄 Multi-agent analysis recommends multiple agents (workflow_pattern was '{workflow_pattern}')")
                
                # Select multiple agents based on task decomposition with proper ordering
                task_decomposition = multi_agent_info.get('task_decomposition', [])
                
                # GUARD CLAUSE: If task decomposition is missing or empty for multi-agent workflow, 
                # regenerate it based on workflow steps and available agents
                if not task_decomposition and requires_multiple:
                    logger.warning(f"⚠️ Task decomposition missing for multi-agent workflow - regenerating from workflow steps")
                    workflow_steps = analysis.get('workflow_steps', [])
                    logger.info(f"📋 Workflow steps: {workflow_steps}")
                    logger.info(f"📋 Available sorted agents: {[(a['agent_id'], a['agent_name']) for a in sorted_agents]}")
                    
                    if workflow_steps and len(sorted_agents) >= len(workflow_steps):
                        # Generate task decomposition by intelligently matching tasks to agents based on capabilities
                        task_decomposition = []
                        used_agents = set()
                        
                        for i, step in enumerate(workflow_steps):
                            # Find the best agent for this specific task based on content matching
                            best_agent = None
                            best_score = 0
                            
                            # Look for agents that haven't been used yet or have relevant capabilities
                            for agent_score in sorted_agents:
                                agent_name = agent_score['agent_name'].lower()
                                step_lower = step.lower()
                                
                                # Calculate task-specific relevance
                                task_relevance = 0
                                
                                # Check for domain-specific keywords
                                if 'ran' in agent_name or '5g' in agent_name or 'network' in agent_name:
                                    if any(keyword in step_lower for keyword in ['prb', 'resource block', 'network', 'throughput', 'capacity', 'data']):
                                        task_relevance += 0.4
                                
                                if 'churn' in agent_name or 'management' in agent_name:
                                    if any(keyword in step_lower for keyword in ['churn', 'policy', 'strategy', 'analysis', 'customer', 'retention']):
                                        task_relevance += 0.4
                                
                                if 'weather' in agent_name:
                                    if any(keyword in step_lower for keyword in ['weather', 'climate', 'forecast']):
                                        task_relevance += 0.4
                                
                                if 'creative' in agent_name:
                                    if any(keyword in step_lower for keyword in ['creative', 'story', 'poem', 'content', 'writing']):
                                        task_relevance += 0.4
                                
                                # Prefer agents that haven't been used yet for better distribution
                                if agent_score['agent_id'] not in used_agents:
                                    task_relevance += 0.2
                                
                                if task_relevance > best_score:
                                    best_score = task_relevance
                                    best_agent = agent_score
                            
                            # If no good match found, use the next available agent
                            if not best_agent:
                                for agent_score in sorted_agents:
                                    if agent_score['agent_id'] not in used_agents:
                                        best_agent = agent_score
                                        break
                            
                            if best_agent:
                                task_entry = {
                                    'agent_id': best_agent['agent_id'],
                                    'agent_name': best_agent['agent_name'],
                                    'task': step,
                                    'workflow_step': step,
                                    'dependencies': [workflow_steps[i-1]] if i > 0 else [],
                                    'priority': 'high' if i == 0 else 'medium',
                                    'task_relevance': best_score
                                }
                                task_decomposition.append(task_entry)
                                used_agents.add(best_agent['agent_id'])
                                logger.info(f"📋 Created task entry {i}: agent_id='{best_agent['agent_id']}', agent_name='{best_agent['agent_name']}', task='{step}', relevance={best_score:.2f}")
                            else:
                                logger.warning(f"⚠️ No suitable agent found for task {i}: {step}")
                        
                        # Update multi_agent_info with regenerated task decomposition
                        multi_agent_info['task_decomposition'] = task_decomposition
                        multi_agent_info['requires_multiple_agents'] = True
                        multi_agent_info['coordination_strategy'] = orchestration_strategy
                        
                        # CRITICAL: Also update the task_analysis with the regenerated task decomposition
                        if 'multi_agent_analysis' not in analysis:
                            analysis['multi_agent_analysis'] = {}
                        analysis['multi_agent_analysis'] = multi_agent_info
                        logger.info(f"🔄 Updated analysis with regenerated task decomposition")
                        
                        logger.info(f"✅ Regenerated task decomposition with {len(task_decomposition)} tasks")
                        for task in task_decomposition:
                            logger.info(f"  - {task['agent_name']}: {task['task']}")
                    else:
                        logger.error(f"❌ Cannot regenerate task decomposition: insufficient agents or workflow steps")
                        logger.error(f"   Workflow steps: {len(workflow_steps)}, Available agents: {len(sorted_agents)}")
                else:
                    logger.info(f"📋 Task decomposition already exists with {len(task_decomposition)} tasks")
                    for i, task in enumerate(task_decomposition):
                        logger.info(f"  Task {i}: agent_id='{task.get('agent_id')}', agent_name='{task.get('agent_name')}', task='{task.get('task')}'")
                
                if task_decomposition:
                    # Check if all tasks are assigned to the same agent (single-agent multi-task scenario)
                    unique_agents = set(task.get('agent_id') for task in task_decomposition)
                    
                    if len(unique_agents) == 1:
                        # Single agent with multiple tasks - select that agent
                        agent_id = list(unique_agents)[0]
                        agent_score = next((s for s in sorted_agents if s['agent_id'] == agent_id), None)
                        
                        if agent_score and agent_score['relevance_score'] > 0.3:
                            agent = next((a for a in available_agents if a.agent_id == agent_id), None)
                            if agent:
                                selected_agents.append(agent)
                                logger.info(f"🎯 Single agent multi-task selected: {agent.name} for {len(task_decomposition)} tasks (score: {agent_score['relevance_score']:.2f})")
                    else:
                        # Multiple agents - select based on configurable capabilities
                        query_lower = query.lower()
                        multi_agent_keywords = ORCHESTRATOR_CONFIG['MULTI_AGENT_KEYWORDS'].split(',')
                        min_score_threshold = float(ORCHESTRATOR_CONFIG['MIN_AGENT_SCORE_THRESHOLD'])
                        
                        logger.info(f"🎯 Checking multi-agent keywords in query: {query_lower}")
                        logger.info(f"🎯 Multi-agent keywords found: {[kw for kw in multi_agent_keywords if kw.strip() in query_lower]}")
                        
                        if any(keyword.strip() in query_lower for keyword in multi_agent_keywords):
                            logger.info(f"🎯 Multi-agent query detected - selecting specialized agents")
                            # For multi-agent queries, select agents based on capabilities and relevance
                            for agent_score in sorted_agents:
                                agent_name = agent_score['agent_name'].lower()
                                if agent_score['relevance_score'] > min_score_threshold:
                                    agent = next((a for a in available_agents if a.agent_id == agent_score['agent_id']), None)
                                    if agent and agent not in selected_agents:
                                        selected_agents.append(agent)
                                        logger.info(f"🎯 Specialized Agent selected: {agent.name} (score: {agent_score['relevance_score']:.2f})")
                        else:
                            # Original logic for other multi-agent scenarios
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
                else:
                    # No task decomposition - select top agents based on query analysis workflow steps
                    workflow_steps = analysis.get('workflow_steps', [])
                    if workflow_steps and len(workflow_steps) > 1:
                        # Select agents based on workflow steps
                        for i, step in enumerate(workflow_steps[:len(sorted_agents)]):
                            if i < len(sorted_agents) and sorted_agents[i]['relevance_score'] > 0.3:
                                agent = next((a for a in available_agents if a.agent_id == sorted_agents[i]['agent_id']), None)
                                if agent and agent not in selected_agents:
                                    selected_agents.append(agent)
                                    logger.info(f"🎯 Multi-agent selected: {agent.name} for step {i+1}: {step} (score: {sorted_agents[i]['relevance_score']:.2f})")
                    else:
                        # Fallback: select top 2 agents if available
                        for agent_score in sorted_agents[:2]:
                            if agent_score['relevance_score'] > 0.3:
                                agent = next((a for a in available_agents if a.agent_id == agent_score['agent_id']), None)
                                if agent and agent not in selected_agents:
                                    selected_agents.append(agent)
                                    logger.info(f"🎯 Multi-agent fallback selected: {agent.name} (score: {agent_score['relevance_score']:.2f})")
            elif workflow_pattern == 'single_agent':
                # Select the best single agent
                best_agent = sorted_agents[0]
                if best_agent['relevance_score'] > 0.3:  # Minimum threshold
                    agent = next((a for a in available_agents if a.agent_id == best_agent['agent_id']), None)
                    if agent:
                        selected_agents.append(agent)
                        logger.info(f"🎯 Single agent selected: {agent.name} (score: {best_agent['relevance_score']:.2f})")
            
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
        """Fallback agent selection when orchestrator model is unavailable"""
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
                        "description": "Independent backend orchestrator using granite4:micro with A2A Strands SDK integration",
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
                timeout=int(ORCHESTRATOR_CONFIG['OLLAMA_TIMEOUT'])
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
            # Get all previous outputs, but clean them first
            available_outputs = []
            for agent_key, output_data in previous_outputs.items():
                if output_data:
                    # Handle both dict and string output_data with enhanced error handling
                    clean_result = None
                    
                    if isinstance(output_data, dict):
                        # Try multiple keys to extract result
                        result_text = output_data.get('result') or output_data.get('output') or output_data.get('response', '')
                        if result_text:
                            clean_result = self._extract_clean_output(result_text)
                    elif isinstance(output_data, str):
                        # Direct string output
                        clean_result = self._extract_clean_output(output_data)
                    
                    if clean_result and clean_result.strip():
                        # Format agent name/ID for display
                        display_name = agent_key if isinstance(agent_key, str) else str(agent_key)
                        # Truncate for readability but keep sufficient context
                        truncated = clean_result[:800] + "..." if len(clean_result) > 800 else clean_result
                        available_outputs.append(f"**Previous Agent ({display_name}) Output:**\n{truncated}")
            
            if available_outputs:
                previous_context = f"\n\n{'='*60}\nCONTEXT FROM PREVIOUS AGENTS (Use this to inform your response):\n{'='*60}\n"
                previous_context += "\n\n".join(available_outputs)
                previous_context += f"\n{'='*60}\n"
                previous_context += "\n🔑 CRITICAL INSTRUCTIONS FOR MULTI-AGENT COORDINATION:\n"
                previous_context += "1. BUILD UPON the previous agent's output - don't duplicate their work\n"
                previous_context += "2. Your task is DIFFERENT from what they did - focus on YOUR specific assignment\n"
                previous_context += "3. Use their output as INPUT/CONTEXT for your specialized task\n"
                previous_context += "4. Do NOT repeat information already provided by previous agents\n"
                previous_context += "5. Your response should COMPLEMENT and EXTEND the previous work\n"
                logger.info(f"📤 Injected context from {len(available_outputs)} previous agent(s) into instructions")
        
        # Get the specific task for this agent from task decomposition
        logger.info(f"🔍 Getting specific task for agent {agent.name} (ID: {agent.agent_id})")
        logger.info(f"🔍 Task analysis keys: {list(task_analysis.keys())}")
        agent_specific_task = self._get_agent_specific_task(agent.agent_id, task_analysis)
        logger.info(f"🔍 Agent specific task result: '{agent_specific_task}'")
        
        # Get agent's dynamic capabilities
        agent_specialization = getattr(agent, 'specialization', '')
        agent_description = getattr(agent, 'description', '')
        agent_keywords = getattr(agent, 'keywords', [])
        system_prompt = getattr(agent, 'system_prompt', '')
        
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

AGENT PROFILE:
- Name: {agent.name}
- Model: {agent.model}
- Specialization: {agent_specialization or 'General purpose'}
- Description: {agent_description or 'No specific description available'}
- Capabilities: {agent.capabilities}
- Keywords: {agent_keywords}
- System Context: {system_prompt if system_prompt else 'No specific system prompt configured.'}

AGENT-SPECIFIC TASK: {agent_specific_task}

CURRENT STEP: {step}
FULL USER QUERY: "{query}" (for context only)
{previous_context}

CRITICAL: Generate instructions for ONLY the agent-specific task above. IGNORE other parts of the full query.

TASK SCOPING RULES:
- This agent ({agent.name}) should do ONLY: {agent_specific_task}
- Do NOT include instructions for other agents' tasks
- Do NOT generate instructions for creative tasks if this is a technical agent
- Do NOT generate instructions for technical tasks if this is a creative agent

Generate specific instructions for this agent. Focus on:
1. What exactly they need to do (ONLY their specific task from the decomposition)
2. How to approach the task (using their specific capabilities)
3. What format the output should be in
4. Any specific requirements or constraints

OUTPUT FORMAT REQUIREMENTS:
- Generate output based on your specific agent type and capabilities
- NO mixed outputs - each agent does ONLY their designated task
- Do NOT use examples from previous queries - generate content specific to the current query

CRITICAL TASK SCOPING RULES:
- Each agent should focus EXCLUSIVELY on their specialized capability
- Do NOT include instructions for tasks that belong to other agents
- The agent should work ONLY on their assigned specific task, not the entire query
- Generate content specific to the CURRENT query - do NOT reference or use examples from previous queries
- Focus on your specific task assignment and agent capabilities

DEPENDENCY RULES:
- If this agent depends on previous agent outputs, use ONLY the provided previous output data
- Do NOT generate or retrieve data that should come from other agents
- If no previous output is available, wait or request the required data from the orchestrator
- Use the exact data provided in previous outputs, do not substitute with your own knowledge

Instructions should be clear, actionable, and specific to this agent's capabilities and assigned task.
"""

        # DIRECT INSTRUCTION GENERATION: Bypass LLM to prevent task conflation
        return self._generate_direct_agent_instructions(agent, agent_specific_task, previous_context, step)
    
    def _generate_direct_agent_instructions(self, agent: AgentCapability, agent_specific_task: str, previous_context: str, step: int) -> str:
        """Generate direct, scoped instructions without using LLM to prevent task conflation"""
        
        # DYNAMIC TASK BOUNDARY ANALYSIS
        task_lower = agent_specific_task.lower()
        
        # Determine what this agent should focus on vs avoid
        focus_areas = []
        avoid_areas = []
        
        # Analyze task content to determine boundaries
        if any(word in task_lower for word in ['explain', 'analyze', 'identify', 'research', 'technical', 'performance', 'data']):
            focus_areas.append("technical analysis and explanation")
            avoid_areas.append("creative writing (poems, stories, humor)")
        
        if any(word in task_lower for word in ['poem', 'story', 'creative', 'funny', 'humorous', 'write', 'create']):
            focus_areas.append("creative content generation")
            avoid_areas.append("technical analysis or data processing")
        
        if any(word in task_lower for word in ['code', 'program', 'python', 'function', 'script']):
            focus_areas.append("code implementation and technical solutions")
            avoid_areas.append("creative content or documentation writing")
        
        # Build dynamic boundary instructions
        boundary_instructions = ""
        if focus_areas:
            boundary_instructions += f"FOCUS ON: {', '.join(focus_areas)}\n"
        if avoid_areas:
            boundary_instructions += f"AVOID: {', '.join(avoid_areas)}\n"
        
        # Base instruction template with dynamic boundaries
        instructions = f"""You are the {agent.name}.

ASSIGNED TASK: {agent_specific_task}

CRITICAL: Focus ONLY on your assigned task above. Do NOT perform tasks assigned to other agents.

{boundary_instructions}

APPROACH:
- Use your specialized capabilities: {', '.join(agent.capabilities)}
- Focus on your specific role and expertise
- Deliver output in a clear, structured format

OUTPUT REQUIREMENTS:
- Provide a complete response for your assigned task
- Use your domain expertise appropriately
- Do NOT include tasks that belong to other agents

{previous_context if previous_context else ""}

Execute your assigned task now."""

        return instructions
    
    def _get_agent_specific_task(self, agent_id: str, task_analysis: Dict[str, Any]) -> str:
        """Get the specific task assigned to this agent from task decomposition"""
        try:
            # Look for task decomposition in the analysis
            multi_agent_info = task_analysis.get('multi_agent_analysis', {})
            task_decomposition = multi_agent_info.get('task_decomposition', [])
            
            # Debug: Print task decomposition to see what we have
            logger.info(f"Task decomposition for agent {agent_id}: {task_decomposition}")
            
            # build quick name->id map from available_agents (serializable)
            available_agents = task_analysis.get('available_agents', [])
            name_to_id = {}
            for a in available_agents:
                # support both dict and object
                if isinstance(a, dict):
                    name_to_id[a.get('name')] = a.get('agent_id')
                else:
                    name_to_id[getattr(a, 'name', None)] = getattr(a, 'agent_id', None)
            
            logger.info(f"Available agents name->id mapping: {name_to_id}")
            logger.info(f"Looking for agent_id: {agent_id}")
            
            # Find the specific task for this agent
            for task in task_decomposition:
                task_agent_id = task.get('agent_id')
                task_agent_name = task.get('agent_name')
                
                logger.info(f"Checking task: agent_id='{task_agent_id}', agent_name='{task_agent_name}', task='{task.get('task')}'")
                
                # If task specifies name but not id, resolve it explicitly
                if not task_agent_id and task_agent_name:
                    resolved_id = name_to_id.get(task_agent_name)
                    if resolved_id:
                        task_agent_id = resolved_id
                        logger.info(f"Resolved agent name '{task_agent_name}' to id '{resolved_id}'")
                    else:
                        # If we can't resolve the name, skip this task (explicit)
                        logger.warning(f"Could not resolve agent name '{task_agent_name}' to id; skipping task {task.get('task')}")
                        continue

                # Only match by agent_id now (no truthy short-circuit)
                if task_agent_id == agent_id:
                    specific_task = task.get('task', 'Execute assigned task')
                    logger.info(f"✅ Found specific task for {agent_id}: {specific_task}")
                    return specific_task
                else:
                    logger.info(f"❌ Task agent_id '{task_agent_id}' does not match requested agent_id '{agent_id}'")
                    
                    # CRITICAL FIX: Try matching by agent name as well
                    if task_agent_name:
                        # Get the agent name for the requested agent_id
                        requested_agent_name = None
                        for name, aid in name_to_id.items():
                            if aid == agent_id:
                                requested_agent_name = name
                                break
                        
                        if requested_agent_name and task_agent_name.lower().strip() == requested_agent_name.lower().strip():
                            specific_task = task.get('task', 'Execute assigned task')
                            logger.info(f"✅ Found specific task by name match for {requested_agent_name}: {specific_task}")
                            return specific_task
            
            # If no specific task found, return an explicit error-style task (do NOT
            # fall back to capability assignment silently)
            logger.error(f"❌ No specific task found for agent {agent_id} in task decomposition")
            logger.error(f"❌ Task decomposition had {len(task_decomposition)} tasks")
            logger.error(f"❌ Available agents: {list(name_to_id.keys())}")
            logger.error(f"❌ Requested agent_id: '{agent_id}'")
            logger.error(f"❌ Task decomposition entries:")
            for i, task in enumerate(task_decomposition):
                logger.error(f"   Task {i}: agent_id='{task.get('agent_id')}', agent_name='{task.get('agent_name')}', task='{task.get('task')}'")
            
            # Try to find a fallback by name matching
            agent_name_fallback = None
            for name, aid in name_to_id.items():
                if aid == agent_id:
                    agent_name_fallback = name
                    break
            
            if agent_name_fallback:
                logger.info(f"🔄 Trying fallback match by name: '{agent_name_fallback}'")
                for task in task_decomposition:
                    if task.get('agent_name') == agent_name_fallback:
                        specific_task = task.get('task', 'Execute assigned task')
                        logger.info(f"✅ Found fallback task for {agent_name_fallback}: {specific_task}")
                        return specific_task
            
            return f"ERROR: No specific task assigned to agent {agent_id} - orchestrator must provide a valid task_decomposition entry."
                
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
                timeout=int(ORCHESTRATOR_CONFIG['OLLAMA_TIMEOUT'])
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
    
    def _execute_agent_with_reflection(self, agent: AgentCapability, instructions: str, task_analysis: Dict[str, Any], session_id: str, iteration: int, previous_outputs: Dict[str, str] = None) -> Dict[str, Any]:
        """Execute a single agent with reflection context and previous outputs"""
        logger.info(f"🔄 _execute_agent_with_reflection called for {agent.name} (iteration {iteration})")
        
        # Initialize execution timing
        step_start = time.time()
        execution_time = 0
        
        try:
            handoff_id = f"{session_id}_reflection_{iteration}"
            
            # REDUCED CONTEXT: Only send essential information to prevent over-density
            # Get cleaned previous output (most recent only)
            cleaned_previous_output = ""
            if previous_outputs:
                # Get the most recent output
                latest_output = list(previous_outputs.values())[-1] if previous_outputs else ""
                cleaned_previous_output = self._extract_clean_output(latest_output)
                logger.info(f"🔗 Passing cleaned previous output to {agent.name}")
            
            # Minimal context to prevent agent confusion
            context = {
                "query": instructions,
                "previous_output": cleaned_previous_output,
                "handoff_id": handoff_id
            }
            
            # Register Main System Orchestrator if not already registered
            orchestrator_id = "main-system-orchestrator"
            self._ensure_orchestrator_registered(orchestrator_id)
            
            # Send via A2A service with retry mechanism
            max_retries = 3
            retry_delay = 1  # seconds
            
            for attempt in range(max_retries):
                try:
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
                        timeout=int(ORCHESTRATOR_CONFIG['A2A_TIMEOUT'])
                    )
                    
                    # If successful, break out of retry loop
                    if response.status_code in [200, 201]:
                        break
                    elif attempt < max_retries - 1:
                        logger.warning(f"⚠️ Agent {agent.name} attempt {attempt + 1} failed (HTTP {response.status_code}), retrying in {retry_delay}s...")
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        logger.error(f"❌ Agent {agent.name} failed after {max_retries} attempts")
                        
                except Exception as e:
                    if attempt < max_retries - 1:
                        logger.warning(f"⚠️ Agent {agent.name} attempt {attempt + 1} failed with error: {str(e)}, retrying in {retry_delay}s...")
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        logger.error(f"❌ Agent {agent.name} failed after {max_retries} attempts with error: {str(e)}")
                        raise
            
            # After retry loop completes, calculate execution time and process response
            step_end = time.time()
            execution_time = step_end - step_start
            
            if response.status_code in [200, 201]:
                result = response.json()
                
                # Extract agent response from A2A service response structure with proper type checking
                agent_response = (
                    result.get('execution_result', {}).get('response')
                    or result.get('response')
                    or result.get('message', {}).get('response', '')
                    or str(result.get('result', ''))
                    or str(result.get('output', ''))
                    or ''
                )
                
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
    
    def synthesize_final_response_with_reflection(self, orchestration_results: Dict[str, Any], query: str, task_analysis: Dict[str, Any], conversation_lineage: List[Dict[str, Any]], cleaned_map: Dict[str, str] = None) -> str:
        """Synthesize final response with reflection context using professional formatting"""
        
        synthesis_prompt = f"""
You are the Main System Orchestrator's synthesis engine. Create a professional technical response that incorporates reflection and iterative improvement, following the same high-quality patterns as the Ollama Agents page.

ORIGINAL QUERY: "{query}"

TASK ANALYSIS:
- Task Type: {task_analysis.get('task_type', 'general')}
- Complexity: {task_analysis.get('complexity_level', 'moderate')}
- Success Criteria: {task_analysis.get('success_criteria', [])}
- Expected Output: {task_analysis.get('expected_output_format', 'comprehensive response')}

AGENT CLEANED OUTPUTS:
{json.dumps(cleaned_map, indent=2) if cleaned_map else json.dumps(orchestration_results, indent=2)}

CONVERSATION LINEAGE:
{json.dumps(conversation_lineage, indent=2)}

PROFESSIONAL SYNTHESIS REQUIREMENTS:
1. **Technical Accuracy**: Use precise technical terminology and accurate calculations
2. **Professional Tone**: Maintain formal, technical language appropriate for professional documentation
3. **Structured Format**: Organize content with clear headings, bullet points, and logical flow
4. **Actionable Content**: Provide specific, implementable recommendations with measurable outcomes
5. **Technical Depth**: Include relevant formulas, parameters, and technical specifications where appropriate

RESPONSE STRUCTURE GUIDELINES:
- **Executive Summary**: Start with key findings and primary recommendations
- **Technical Analysis**: Detailed analysis with specific metrics, calculations, and technical details
- **Implementation Plan**: Step-by-step implementation with timelines and resource requirements
- **Success Metrics**: Specific KPIs, thresholds, and monitoring procedures
- **Risk Assessment**: Potential impacts and mitigation strategies

CONTENT QUALITY STANDARDS:
- Use accurate technical calculations (e.g., PRB utilization 0-100%, not arbitrary numbers)
- Reference appropriate tools and methodologies for the domain
- Include specific technical parameters and thresholds
- Provide measurable success criteria
- Use professional formatting with proper technical documentation style

TECHNICAL ACCURACY REQUIREMENTS:
- For telecommunications: Use proper 4G/LTE terminology, not Wi-Fi tools
- For calculations: Show realistic values (e.g., 75-85% utilization, not 2015%)
- For tools: Reference domain-appropriate tools and APIs
- For metrics: Include specific KPIs and monitoring procedures

REFLECTION INTEGRATION:
- Highlight iterative improvements and quality assessments from the lineage
- Show how the response evolved through reflection and refinement
- Present the final optimized solution with clear rationale
- Include quality metrics and validation results where available

CONTENT CLEANUP:
- Remove all technical metadata, A2A communication details, and execution logs
- Extract only the actual technical content from agent responses
- Remove thinking processes and internal reasoning
- Present clean, professional technical documentation
- Format with proper technical documentation standards

Create a professional technical response that matches the quality and structure of the Ollama Agents page:
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
                timeout=int(ORCHESTRATOR_CONFIG['AGENT_EXECUTION_TIMEOUT'])
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
    
    def _initialize_session_memory(self, session_id: str, query: str) -> Dict[str, Any]:
        """Initialize orchestrator memory for session consolidation with structured data separation"""
        self.execution_memory[session_id] = {
            "cleaned": {},    # User-facing content only
            "raw": {},        # Audit trail for debugging
            "meta": {},       # Session metadata
            "query": query,
            "tasks": {},
            "status": "started",
            "timestamp": datetime.now().isoformat(),
            "agent_outputs": {},
            "consolidated_result": None
        }
        
        # Store session-level metadata
        self.execution_memory[session_id]["meta"]["query"] = query
        self.execution_memory[session_id]["meta"]["created_at"] = datetime.now().isoformat()
        
        logger.info(f"🧠 Initialized structured orchestrator memory for session {session_id}")
        return self.execution_memory[session_id]
    
    def _get_all_previous_outputs(self, session_id: str, iteration: int) -> Dict[str, str]:
        """Get all previous agent outputs for sequential chaining"""
        if session_id not in self.execution_memory:
            return {}
        
        cleaned_outputs = self.execution_memory[session_id].get("cleaned", {})
        
        # Return all outputs from previous iterations
        previous_outputs = {}
        for agent_name, output in cleaned_outputs.items():
            if output and output.strip():
                previous_outputs[agent_name] = output
        
        logger.info(f"📚 Retrieved {len(previous_outputs)} previous outputs for iteration {iteration + 1}")
        return previous_outputs

    def _record_agent_output(self, session_id: str, agent_name: str, agent_result: Any):
        """
        Record agent output in orchestrator memory, but store only the cleaned
        user-facing content. Keep the raw result in history if needed.
        """
        if session_id not in self.execution_memory:
            self.execution_memory[session_id] = {"cleaned": {}, "raw": {}, "meta": {}}

        # agent_result may be dict with 'result' or 'response' or plain string
        raw_text = ""
        if isinstance(agent_result, dict):
            raw_text = agent_result.get("result") or agent_result.get("response") or agent_result.get("message") or json.dumps(agent_result)
        elif isinstance(agent_result, str):
            raw_text = agent_result
        else:
            try:
                raw_text = json.dumps(agent_result)
            except:
                raw_text = str(agent_result)

        # Save raw (for auditing) but do not send this to dependent agents
        self.execution_memory[session_id]["raw"][agent_name] = raw_text

        # Clean it and save as cleaned output for downstream consumption
        clean_text = self._extract_clean_output(raw_text)
        self.execution_memory[session_id]["cleaned"][agent_name] = clean_text

        # Add lightweight metadata
        self.execution_memory[session_id]["meta"].setdefault(agent_name, {})["recorded_at"] = datetime.now().isoformat()

        # Legacy compatibility
        if session_id in self.execution_memory and "agent_outputs" in self.execution_memory[session_id]:
            self.execution_memory[session_id]["agent_outputs"][agent_name] = {
                "output": {"result": clean_text},
                "timestamp": datetime.now().isoformat()
            }

        logger.info(f"📝 Recorded {agent_name} clean output in orchestrator memory")
    
    def _reflect_on_results(self, session_id: str) -> Dict[str, Any]:
        """Analyze consistency and completeness of agent outputs"""
        if session_id not in self.execution_memory:
            return {"status": "error", "message": "No session found"}
        
        cleaned_outputs = self.execution_memory[session_id].get("cleaned", {})
        
        reflection_analysis = {
            "total_agents": len(cleaned_outputs),
            "completed_agents": len([o for o in cleaned_outputs.values() if o and o.strip()]),
            "output_quality": {},
            "consistency_check": {},
            "completeness_score": 0.0,
            "recommendations": []
        }
        
        # Analyze each output
        for agent_name, output in cleaned_outputs.items():
            if not output or not output.strip():
                reflection_analysis["output_quality"][agent_name] = {
                    "status": "empty",
                    "score": 0.0,
                    "issues": ["No output produced"]
                }
                continue
            
            # Basic quality metrics
            word_count = len(output.split())
            char_count = len(output)
            has_structure = any(marker in output for marker in ["##", "**", "-", "1.", "•"])
            
            quality_score = min(1.0, (word_count / 50) + (0.2 if has_structure else 0))
            
            reflection_analysis["output_quality"][agent_name] = {
                "status": "completed",
                "score": quality_score,
                "word_count": word_count,
                "char_count": char_count,
                "has_structure": has_structure
            }
        
        # Calculate completeness
        completed_count = reflection_analysis["completed_agents"]
        total_count = reflection_analysis["total_agents"]
        reflection_analysis["completeness_score"] = completed_count / total_count if total_count > 0 else 0.0
        
        # Generate recommendations
        if reflection_analysis["completeness_score"] < 1.0:
            reflection_analysis["recommendations"].append("Some agents did not produce output - check for errors")
        
        if reflection_analysis["completeness_score"] > 0.5:
            avg_quality = sum(q["score"] for q in reflection_analysis["output_quality"].values() if q["status"] == "completed") / completed_count
            if avg_quality < 0.7:
                reflection_analysis["recommendations"].append("Output quality could be improved - consider refining agent instructions")
        
        logger.info(f"🔍 Reflection analysis: {reflection_analysis['completeness_score']:.2f} completeness, {len(reflection_analysis['recommendations'])} recommendations")
        return reflection_analysis

    def _consolidate_agent_outputs(self, session_id: str) -> Dict[str, Any]:
        """Consolidate all agent outputs into final result"""
        if session_id not in self.execution_memory:
            return {"error": "Session not found in memory"}
        
        memory = self.execution_memory[session_id]
        agent_outputs = memory["agent_outputs"]
        
        if not agent_outputs:
            return {"error": "No agent outputs to consolidate"}
        
        # Enhanced consolidation logic with intelligent merging
        consolidated = {
            "type": "multi_agent" if len(agent_outputs) > 1 else "single_agent",
            "agents_used": list(agent_outputs.keys()),
            "individual_results": {},
            "combined_content": "",
            "structured_content": {},
            "intelligent_summary": "",
            "metadata": {
                "session_id": session_id,
                "consolidation_timestamp": datetime.now().isoformat(),
                "total_agents": len(agent_outputs)
            }
        }
        
        # Intelligent content categorization and merging with context-aware integration
        content_sections = []
        code_sections = []
        analysis_sections = []
        churn_insights = []
        campaign_ideas = []
        creative_elements = []
        
        # Extract and categorize content from each agent
        seen_content_types = set()  # Track content types to prevent duplicates
        seen_creative_content = set()  # Track specific creative content to prevent duplicates
        
        for agent_name, agent_data in agent_outputs.items():
            # Handle both dict and string agent_data
            if isinstance(agent_data, dict):
                output = agent_data.get("output", "")
            elif isinstance(agent_data, str):
                output = agent_data
            else:
                output = str(agent_data)
            
            consolidated["individual_results"][agent_name] = output
            
            # Extract content intelligently
            content = self._extract_content_from_output(output)
            if content:
                # Check for duplicate content sections and filter by agent role
                content_type = self._determine_content_type(content, agent_name)
                
                # Enhanced duplicate detection for creative content
                if content_type == 'creative_content':
                    # Create a content signature to detect similar creative outputs
                    content_signature = self._create_content_signature(content)
                    if content_signature in seen_creative_content:
                        logger.info(f"🚫 Filtering duplicate creative content from {agent_name} (similar to previous)")
                        continue
                    seen_creative_content.add(content_signature)
                
                if content_type in seen_content_types:
                    logger.info(f"🚫 Filtering duplicate {content_type} content from {agent_name}")
                    continue
                seen_content_types.add(content_type)
                # Extract specific insights for context-aware merging
                if 'churn' in agent_name.lower():
                    churn_reasons = self._extract_churn_reasons(content)
                    churn_insights.extend(churn_reasons)
                elif 'prepaid' in agent_name.lower() or 'campaign' in agent_name.lower():
                    campaigns = self._extract_campaign_ideas(content)
                    campaign_ideas.extend(campaigns)
                elif 'creative' in agent_name.lower():
                    creative_items = self._extract_creative_elements(content)
                    creative_elements.extend(creative_items)
                
                # Categorize content based on type and patterns (order matters - check most specific first)
                if self._is_creative_content(content, agent_name):
                    content_sections.append({"agent": agent_name, "content": content})
                elif self._is_code_content(content):
                    code_sections.append({"agent": agent_name, "content": content})
                elif self._is_analysis_content(content, agent_name):
                    analysis_sections.append({"agent": agent_name, "content": content})
                else:
                    # Default to general content section
                    content_sections.append({"agent": agent_name, "content": content})
                
                # Legacy format for backward compatibility
                consolidated["combined_content"] += f"\n\n=== {agent_name} ===\n{content}"
        
        # Build structured content
        consolidated["structured_content"] = {
            "creative_content": content_sections,
            "code_implementation": code_sections,
            "analysis_results": analysis_sections
        }
        
        # Generate intelligent summary
        consolidated["intelligent_summary"] = self._generate_intelligent_summary(
            memory["query"], content_sections, code_sections, analysis_sections
        )
        
        # Add execution insights
        consolidated["execution_insights"] = {
            "content_generators": len(content_sections),
            "code_implementers": len(code_sections),
            "analysts": len(analysis_sections),
            "total_content_length": len(consolidated["combined_content"])
        }
        
        memory["consolidated_result"] = consolidated
        memory["status"] = "completed"
        
        # Add context-aware integration section if we have multiple types
        if churn_insights or campaign_ideas or creative_elements:
            integration_section = self._create_integration_section(churn_insights, campaign_ideas, creative_elements)
            if integration_section:
                consolidated["structured_content"]["integrated_insights"] = integration_section
        
        logger.info(f"🎯 Consolidated outputs from {len(agent_outputs)} agents with intelligent merging")
        return consolidated
    
    def _determine_content_type(self, content: str, agent_name: str) -> str:
        """Determine the type of content to prevent duplicates"""
        content_lower = content.lower()
        
        # Technical/analytical content
        if any(keyword in content_lower for keyword in ['explanation', 'analysis', 'indicators', 'metrics', 'performance']):
            if '4g' in agent_name.lower() or 'network' in agent_name.lower() or 'ran' in agent_name.lower():
                return 'technical_explanation'
            elif 'churn' in agent_name.lower():
                return 'churn_analysis'
            else:
                return 'general_analysis'
        
        # Creative content
        elif any(keyword in content_lower for keyword in ['poem', 'creative', 'humorous', 'verse', 'rhyme']):
            return 'creative_content'
        
        # Campaign content
        elif any(keyword in content_lower for keyword in ['campaign', 'strategy', 'promotional']):
            return 'campaign_content'
        
        # Default
        else:
            return f'general_{agent_name.lower().replace(" ", "_")}'
    
    def _create_content_signature(self, content: str) -> str:
        """Create a signature for content to detect duplicates"""
        import hashlib
        import re
        
        # Normalize content for comparison
        normalized = content.lower().strip()
        
        # Remove common variations that don't affect meaning
        normalized = re.sub(r'[^\w\s]', '', normalized)  # Remove punctuation
        normalized = re.sub(r'\s+', ' ', normalized)     # Normalize whitespace
        
        # Extract key phrases for creative content
        if any(word in normalized for word in ['poem', 'verse', 'rhyme', 'creative']):
            # For poems, extract first and last lines as signature
            lines = [line.strip() for line in normalized.split('\n') if line.strip()]
            if len(lines) >= 2:
                signature = f"{lines[0]}...{lines[-1]}"
            else:
                signature = normalized[:100]  # First 100 chars
        else:
            signature = normalized[:200]  # First 200 chars for other content
        
        # Create hash for consistent comparison
        return hashlib.md5(signature.encode()).hexdigest()
    
    def _extract_churn_reasons(self, text: str) -> List[str]:
        """Extract churn reasons from text"""
        reasons = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['churn', 'reason', 'cause', 'issue']):
                if line.strip().startswith('-') or line.strip().startswith('•'):
                    reasons.append(line.strip())
        return reasons
    
    def _extract_campaign_ideas(self, text: str) -> List[str]:
        """Extract campaign ideas from text"""
        ideas = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['campaign', 'promotion', 'strategy', 'offer']):
                if line.strip().startswith('-') or line.strip().startswith('•') or line.strip().startswith('1.'):
                    ideas.append(line.strip())
        return ideas
    
    def _extract_creative_elements(self, text: str) -> List[str]:
        """Extract creative elements from text"""
        elements = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['slogan', 'poem', 'creative', 'catchy']):
                if line.strip().startswith('"') or line.strip().startswith("'"):
                    elements.append(line.strip())
        return elements
    
    def _create_integration_section(self, churn_insights: List[str], campaign_ideas: List[str], creative_elements: List[str]) -> str:
        """Create an integration section that connects insights across agents"""
        if not churn_insights and not campaign_ideas and not creative_elements:
            return ""
        
        integration_parts = ["## 🔗 Integrated Insights"]
        
        if churn_insights:
            integration_parts.append("**Key Churn Drivers Identified:**")
            integration_parts.extend(churn_insights[:3])  # Top 3 insights
        
        if campaign_ideas:
            integration_parts.append("\n**Recommended Campaign Strategies:**")
            integration_parts.extend(campaign_ideas[:3])  # Top 3 ideas
        
        if creative_elements:
            integration_parts.append("\n**Creative Elements Generated:**")
            integration_parts.extend(creative_elements[:3])  # Top 3 elements
        
        return "\n".join(integration_parts)
    
    def _extract_content_from_output(self, output: Dict[str, Any]) -> str:
        """Extract meaningful content from agent output"""
        if isinstance(output, dict):
            # Try different possible content keys
            for key in ["final_response", "result", "content", "summary", "code"]:
                if key in output and output[key]:
                    return str(output[key])
            
            # If no specific key, return the whole output as string
            return str(output)
        else:
            return str(output)
    
    def _extract_clean_output(self, raw: str) -> str:
        """
        Clean raw agent output:
          - remove internal reasoning / <think>...</think> blocks
          - strip any A2A wrapper metadata if present
          - remove fake TASK_DECOMPOSITION blocks created by agents
          - unescape HTML entities
        """
        if not raw:
            return ""

        text = str(raw)

        # 1) Remove <think>...</think> and similar tags
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<reasoning>.*?</reasoning>", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<analysis>.*?</analysis>", "", text, flags=re.DOTALL | re.IGNORECASE)

        # 2) Remove obvious system markers
        text = re.sub(r"(Output truncated.*$)", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"🔍 Authentic Agent Output Verification:.*$", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"✅ Source:.*$", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"✅ Agent ID:.*$", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"✅ A2A Handoff:.*$", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"✅ Timestamp:.*$", "", text, flags=re.DOTALL | re.IGNORECASE)

        # 3) Remove fake TASK_DECOMPOSITION blocks that agents create when trying to self-heal
        # These are diagnostic artifacts and should not appear in final outputs
        text = re.sub(r"TASK_DECOMPOSITION:.*?(?=\n\n|\Z)", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"\*\*TASK_DECOMPOSITION\*\*.*?(?=\n\n|\Z)", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"## TASK_DECOMPOSITION.*?(?=\n#|\Z)", "", text, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove "Error Context:" diagnostic blocks
        text = re.sub(r"Error Context:.*?(?=\n\n|\Z)", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"No specific task was assigned.*?(?=\n\n|\Z)", "", text, flags=re.DOTALL | re.IGNORECASE)

        # 4) Remove JSON/metadata blocks if agent wrapped response in ```json ... ```
        text = re.sub(r"```(?:json|text)?\s*[\s\S]*?```", "", text, flags=re.IGNORECASE)

        # 5) Remove any leftover square-bracketed debug lines like [LOG], [DEBUG]
        text = re.sub(r"^\[.*?\]\s*$", "", text, flags=re.MULTILINE)

        # 6) Collapse multiple blank lines and trim
        text = re.sub(r"\n\s*\n+", "\n\n", text).strip()

        # 7) Unescape html entities
        try:
            from html import unescape
            text = unescape(text)
        except:
            pass

        return text.strip()
    
    def _extract_json_from_model_response(self, text: str) -> Dict[str, Any]:
        """Extract JSON from model response text"""
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except Exception:
            pass
        return {}
    
    def _queue_task(self, agent: AgentCapability, task: str) -> None:
        """Queue a task for an agent to ensure proper isolation"""
        if agent.name not in self.task_queue:
            self.task_queue[agent.name] = []
        self.task_queue[agent.name].append({
            "task": task,
            "timestamp": datetime.now().isoformat(),
            "status": "queued"
        })
        logger.info(f"📋 Queued task for {agent.name}")
    
    def _dequeue_task(self, agent: AgentCapability) -> Optional[Dict[str, Any]]:
        """Dequeue the next task for an agent"""
        if agent.name in self.task_queue and self.task_queue[agent.name]:
            task = self.task_queue[agent.name].pop(0)
            task["status"] = "processing"
            logger.info(f"📋 Dequeued task for {agent.name}")
            return task
        return None
    
    def _complete_task(self, agent: AgentCapability, result: Dict[str, Any]) -> None:
        """Mark a task as completed for an agent"""
        if agent.name in self.task_queue:
            for task in self.task_queue[agent.name]:
                if task["status"] == "processing":
                    task["status"] = "completed"
                    task["result"] = result
                    task["completed_at"] = datetime.now().isoformat()
                    logger.info(f"✅ Completed task for {agent.name}")
                    break
    
    def _is_code_content(self, content: str) -> bool:
        """Determine if content contains code"""
        code_indicators = [
            "```python", "```javascript", "```java", "```cpp", "```go", "```rust",
            "def ", "function ", "class ", "import ", "from ", "public class",
            "SELECT ", "INSERT ", "UPDATE ", "CREATE TABLE", "#!/usr/bin/env",
            "import ", "require(", "var ", "let ", "const ", "function(",
            "print(", "return ", "if __name__", "#!/usr/bin/python"
        ]
        
        # Check for code indicators
        has_code_indicators = any(indicator in content.lower() for indicator in code_indicators)
        
        # Also check for JSON structures that might contain code
        if content.strip().startswith('{') and content.strip().endswith('}'):
            # If it's a JSON structure, check if it contains code-like content
            try:
                import json
                parsed = json.loads(content)
                if isinstance(parsed, dict):
                    # Look for code-related keys or values
                    for key, value in parsed.items():
                        if isinstance(value, str) and any(indicator in value.lower() for indicator in code_indicators):
                            return True
                        if key.lower() in ['code', 'program', 'script', 'function']:
                            return True
            except:
                pass
        
        return has_code_indicators
    
    def _is_analysis_content(self, content: str, agent_name: str) -> bool:
        """Determine if content is analysis/technical content"""
        analysis_indicators = [
            "analysis", "sentiment", "score", "metrics", "statistics", "data",
            "conclusion", "findings", "results", "evaluation", "positive:", "negative:",
            "neutral:", "accuracy", "precision", "recall", "f1-score"
        ]
        agent_indicators = ["technical", "analyst", "data", "research", "expert"]
        
        content_lower = content.lower()
        agent_lower = agent_name.lower()
        
        # Check if it's actually analysis content (not just from a technical agent)
        has_analysis_content = any(indicator in content_lower for indicator in analysis_indicators)
        is_technical_agent = any(indicator in agent_lower for indicator in agent_indicators)
        
        # Only categorize as analysis if there's actual analysis content AND it's from a technical agent
        # AND the content is not empty or just metadata
        if is_technical_agent and has_analysis_content and len(content.strip()) > 50:
            return True
        
        # Don't categorize empty or metadata-only responses as analysis
        return False
    
    def _is_creative_content(self, content: str, agent_name: str) -> bool:
        """Determine if content is creative content (poems, stories, etc.)"""
        creative_indicators = [
            "poem", "story", "poetry", "verse", "rhyme", "stanza", "narrative",
            "creative", "artistic", "imaginative", "beautiful", "whispering",
            "falls", "silent", "night", "snow", "dance", "gentle", "embrace"
        ]
        agent_indicators = ["creative", "assistant", "writer", "poet"]
        
        content_lower = content.lower()
        agent_lower = agent_name.lower()
        
        # Don't categorize as creative if it's clearly code from a technical agent
        if "technical" in agent_lower and ("```python" in content_lower or "def " in content_lower or "import " in content_lower):
            return False
        
        # Check for creative content indicators
        has_creative_content = any(indicator in content_lower for indicator in creative_indicators)
        is_creative_agent = any(indicator in agent_lower for indicator in agent_indicators)
        
        # Also check for JSON structures containing poems/stories
        if content.strip().startswith('{') and content.strip().endswith('}'):
            try:
                import json
                parsed = json.loads(content)
                if isinstance(parsed, dict):
                    # Look for creative content keys
                    for key, value in parsed.items():
                        if key.lower() in ['poem', 'story', 'verse', 'content', 'text']:
                            if isinstance(value, str) and len(value.strip()) > 10:
                                return True
            except:
                pass
        
        return has_creative_content or is_creative_agent
    
    def _generate_intelligent_summary(self, query: str, content_sections: List[Dict], code_sections: List[Dict], analysis_sections: List[Dict]) -> str:
        """Generate intelligent summary of the multi-agent execution"""
        summary_parts = []
        
        # Query context
        summary_parts.append(f"**Query:** {query}")
        
        # Execution overview
        total_sections = len(content_sections) + len(code_sections) + len(analysis_sections)
        summary_parts.append(f"**Execution:** {total_sections} agent(s) completed successfully")
        
        # Content summary
        if content_sections:
            agents = [section['agent'] for section in content_sections]
            summary_parts.append(f"**Content Generation:** {', '.join(agents)} created creative content")
        
        if code_sections:
            agents = [section['agent'] for section in code_sections]
            summary_parts.append(f"**Code Implementation:** {', '.join(agents)} provided technical solutions")
        
        if analysis_sections:
            agents = [section['agent'] for section in analysis_sections]
            summary_parts.append(f"**Analysis:** {', '.join(agents)} performed technical analysis")
        
        # Key achievements
        achievements = []
        if content_sections:
            achievements.append("✅ Creative content generation")
        if code_sections:
            achievements.append("✅ Code implementation")
        if analysis_sections:
            achievements.append("✅ Technical analysis")
        
        if achievements:
            summary_parts.append(f"**Key Achievements:** {' | '.join(achievements)}")
        
        return "\n\n".join(summary_parts)
    
    def _build_agent_dependency_graph(self, selected_agents: List[AgentCapability], task_analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """Build dependency graph for agents based on capabilities and task analysis"""
        dependencies = {}
        
        # Create agent capability mapping
        agent_capability_map = {}
        for agent in selected_agents:
            agent_capability_map[agent.agent_id] = agent.capabilities
        
        # Load capability dependencies from configuration
        capability_dependencies = self._load_capability_dependencies()
        
        # Build dependencies based on agent capabilities
        for agent in selected_agents:
            agent_deps = []
            
            # Check if this agent has capabilities that depend on other capabilities
            for capability in agent.capabilities:
                if capability in capability_dependencies:
                    required_capabilities = capability_dependencies[capability]
                    
                    # Find agents that have the required capabilities
                    for req_cap in required_capabilities:
                        for other_agent_id, other_capabilities in agent_capability_map.items():
                            if other_agent_id != agent.agent_id and req_cap in other_capabilities:
                                if other_agent_id not in agent_deps:
                                    agent_deps.append(other_agent_id)
            
            # Remove duplicates and self-references
            agent_deps = list(set(agent_deps))
            agent_deps = [dep for dep in agent_deps if dep != agent.agent_id]
            
            dependencies[agent.agent_id] = agent_deps
        
        return dependencies
    
    def _load_capability_dependencies(self) -> Dict[str, List[str]]:
        """Load capability dependencies from configuration"""
        dependencies = {}
        
        # Get capability dependencies from orchestrator config
        capability_deps_str = ORCHESTRATOR_CONFIG.get('CAPABILITY_DEPENDENCIES', '')
        
        if capability_deps_str:
            # Parse format: capability1:dependency1,dependency2;capability2:dependency3
            for capability_group in capability_deps_str.split(';'):
                if ':' in capability_group:
                    capability, deps_str = capability_group.split(':', 1)
                    capability = capability.strip()
                    
                    if deps_str.strip():
                        # Split dependencies by comma
                        dependencies[capability] = [dep.strip() for dep in deps_str.split(',') if dep.strip()]
                    else:
                        # Empty dependencies
                        dependencies[capability] = []
        
        # Fallback to default dependencies if none configured
        if not dependencies:
            dependencies = {
                'churn_analysis': [],
                'campaign_design': ['churn_analysis'],
                'creative_writing': ['churn_analysis'],
                'creative': ['churn_analysis'],
                'poetry': ['churn_analysis'],
                'marketing_copy': ['churn_analysis'],
                'slogan_creation': ['churn_analysis'],
                'data_analysis': [],
                'technical_writing': []
            }
        
        return dependencies
    
    def _get_agent_input_context(self, agent: AgentCapability, agent_dependencies: Dict[str, List[str]], agent_results: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Get input context for an agent based on its dependencies"""
        context = {}
        
        # Get dependencies for this agent
        deps = agent_dependencies.get(agent.agent_id, [])
        
        # Get results from dependent agents with proper type checking
        for dep_agent_id in deps:
            if dep_agent_id in agent_results:
                dep_result = agent_results[dep_agent_id]
                if dep_result:
                    # Handle both dict and string results with proper type checking
                    if isinstance(dep_result, dict):
                        # Extract result from dict structure
                        result_text = (
                            dep_result.get('result', '')
                            or dep_result.get('output', '')
                            or dep_result.get('response', '')
                            or str(dep_result)
                        )
                        clean_output = self._extract_clean_output(result_text)
                        context[dep_agent_id] = clean_output
                    elif isinstance(dep_result, str):
                        # Direct string result
                        clean_output = self._extract_clean_output(dep_result)
                        context[dep_agent_id] = clean_output
                    else:
                        # Handle other types by converting to string
                        clean_output = self._extract_clean_output(str(dep_result))
                        context[dep_agent_id] = clean_output
        
        # Also get from session memory for additional context
        if session_id in self.execution_memory:
            session_memory = self.execution_memory[session_id].get('cleaned', {})
            for agent_name, output in session_memory.items():
                if output and output.strip():
                    context[agent_name] = output
        
        return context
    
    def _update_session_context(self, session_id: str, agent_name: str, agent_result: Any):
        """Update session context with agent result for downstream consumption"""
        if session_id not in self.execution_memory:
            self.execution_memory[session_id] = {"cleaned": {}, "raw": {}, "meta": {}}
        
        # Extract clean output
        raw_text = ""
        if isinstance(agent_result, dict):
            raw_text = agent_result.get("result") or agent_result.get("response") or agent_result.get("message") or json.dumps(agent_result)
        elif isinstance(agent_result, str):
            raw_text = agent_result
        else:
            raw_text = str(agent_result)
        
        # Clean and store
        clean_text = self._extract_clean_output(raw_text)
        self.execution_memory[session_id]["cleaned"][agent_name] = clean_text
        self.execution_memory[session_id]["raw"][agent_name] = raw_text
        
        logger.info(f"📝 Updated session context for {agent_name}: {len(clean_text)} characters")
    
    def _determine_execution_strategy(self, selected_agents: List[AgentCapability], task_analysis: Dict[str, Any]) -> str:
        """Determine optimal execution strategy based on query analysis and dependencies"""
        try:
            # First, check the workflow pattern from query analysis
            workflow_pattern = task_analysis.get('agentic_workflow_pattern', 'single_agent')
            orchestration_strategy = task_analysis.get('orchestration_strategy', 'sequential')
            
            # If query analysis already determined strategy, use it
            if orchestration_strategy and orchestration_strategy != 'sequential':
                logger.info(f"🎯 Using query analysis strategy: {orchestration_strategy}")
                return orchestration_strategy
            
            # For single_agent workflow, always use sequential
            if workflow_pattern == 'single_agent':
                logger.info(f"📋 Single agent workflow - using sequential execution")
                return "sequential"
            
            # For multi_agent workflow, analyze dependencies
            multi_agent_info = task_analysis.get('multi_agent_analysis', {})
            task_decomposition = multi_agent_info.get('task_decomposition', [])
            
            # Analyze dependencies
            has_dependencies = False
            parallel_candidates = []
            
            for task in task_decomposition:
                dependencies = task.get('dependencies', [])
                if dependencies:
                    has_dependencies = True
                    break
                else:
                    parallel_candidates.append(task)
            
            # If all tasks have no dependencies, can run in parallel
            if not has_dependencies and len(parallel_candidates) > 1:
                logger.info(f"🚀 All {len(parallel_candidates)} tasks have no dependencies - using parallel execution")
                return "parallel"
            
            # If some tasks have dependencies, use sequential (safer than hybrid)
            elif has_dependencies and len(task_decomposition) > 1:
                logger.info(f"🔄 Dependencies detected - using sequential execution")
                return "sequential"
            
            # Default to sequential for safety
            else:
                logger.info(f"📋 Using sequential execution (safe default)")
                return "sequential"
                
        except Exception as e:
            logger.warning(f"⚠️ Error determining execution strategy: {e}, defaulting to sequential")
            return "sequential"
    
    def _execute_agents_sequential(self, selected_agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any], session_id: str, orchestration_results: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agents sequentially with proper dependency-based data passing"""
        logger.info(f"📋 Executing {len(selected_agents)} agents sequentially with dependency-based data passing")
        
        # Build dependency graph
        agent_dependencies = self._build_agent_dependency_graph(selected_agents, task_analysis)
        logger.info(f"🔗 Agent dependency graph: {agent_dependencies}")
        
        # Execute agents in dependency order
        executed_agents = set()
        agent_results = {}
        
        while len(executed_agents) < len(selected_agents):
            # Find agents ready to execute (dependencies satisfied)
            ready_agents = []
            for agent in selected_agents:
                if agent.agent_id not in executed_agents:
                    deps = agent_dependencies.get(agent.agent_id, [])
                    if all(dep in executed_agents for dep in deps):
                        ready_agents.append(agent)
            
            if not ready_agents:
                logger.error("❌ Circular dependency detected or no agents ready to execute")
                logger.error(f"❌ Executed agents: {executed_agents}")
                logger.error(f"❌ Selected agents: {[agent.agent_id for agent in selected_agents]}")
                logger.error(f"❌ Agent dependencies: {agent_dependencies}")
                break
            
            # Execute ready agents
            for agent in ready_agents:
                current_iteration = len(executed_agents) + 1
                logger.info(f"🔄 Processing Agent {current_iteration}/{len(selected_agents)}: {agent.name}")
                
                try:
                    # Get context from dependent agents
                    input_context = self._get_agent_input_context(agent, agent_dependencies, agent_results, session_id)
                    logger.info(f"📚 Input context for {agent.name}: {len(input_context)} dependencies")
                    logger.info(f"📚 Agent dependencies for {agent.name}: {agent_dependencies.get(agent.agent_id, [])}")
                    logger.info(f"📚 Available agent_results keys: {list(agent_results.keys())}")
                    if input_context:
                        for context_key, context_value in input_context.items():
                            logger.info(f"📚 Context from {context_key}: {context_value[:100]}...")
                    
                    # Generate instructions with context
                    agent_instructions = self.generate_agent_instructions(
                        query, task_analysis, agent, current_iteration, input_context
                    )
                    logger.info(f"📋 Generated instructions for {agent.name}: {len(agent_instructions)} characters")
                    if "Creative Assistant" in agent.name:
                        logger.info(f"📋 Creative Assistant instructions preview: {agent_instructions[:200]}...")
                
                    # Execute agent with context
                    agent_result = self._execute_agent_with_reflection(
                        agent, agent_instructions, task_analysis, session_id, current_iteration, input_context
                    )
                
                    if agent_result:
                        orchestration_results[agent.name] = agent_result
                        agent_results[agent.agent_id] = agent_result
                        logger.info(f"✅ Agent {agent.name} executed successfully and added to results")
                    else:
                        logger.warning(f"⚠️ Agent {agent.name} returned empty result")
                        # Still mark as executed to prevent infinite loop
                        agent_results[agent.agent_id] = {"result": "", "error": "Empty result"}
                        
                except Exception as e:
                    logger.error(f"❌ Error executing agent {agent.name}: {str(e)}")
                    # Still mark as executed to prevent infinite loop
                    agent_results[agent.agent_id] = {"result": "", "error": str(e)}
                
                # Always mark agent as executed to prevent infinite loop
                executed_agents.add(agent.agent_id)
                logger.info(f"✅ Agent {agent.name} marked as executed (ID: {agent.agent_id})")
                
                # Record output and update session memory
                self._record_agent_output(session_id, agent.name, agent_result)
                
                # IMPLEMENT REFLECTION: Analyze agent output after each execution
                if agent_result and isinstance(agent_result, dict):
                    agent_output = agent_result.get('result', '')
                    if agent_output:
                        try:
                            # Define success criteria for this agent
                            success_criteria = ["completeness", "relevance", "clarity"]
                            
                            # Analyze the output
                            analysis_result = self.analyze_agent_output(
                                agent_output, task_analysis, success_criteria
                            )
                            
                            logger.info(f"📊 Output Analysis: Quality {analysis_result.get('quality_score', 0):.2f}, Next: {analysis_result.get('next_action', 'continue')}")
                            
                            # Store analysis in session memory for later use
                            if session_id in self.execution_memory:
                                self.execution_memory[session_id]["analysis"][agent.name] = analysis_result
                                
                        except Exception as e:
                            logger.error(f"Error in agent output analysis: {e}")
                self._update_session_context(session_id, agent.name, agent_result)
                
                # Analyze output for quality
                # Handle both dict and string agent_result
                if isinstance(agent_result, dict):
                    result_text = agent_result.get('result', '')
                elif isinstance(agent_result, str):
                    result_text = agent_result
                else:
                    result_text = str(agent_result)
                
            output_analysis = self.analyze_agent_output(
                    result_text,
                task_analysis,
                task_analysis.get('success_criteria', [])
            )
            
            logger.info(f"📊 Output Analysis: Quality {output_analysis.get('quality_score', 0):.2f}, Next: {output_analysis.get('next_action')}")
            
        return orchestration_results
    
    def _execute_agents_parallel(self, selected_agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any], session_id: str, orchestration_results: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agents in parallel using threading"""
        logger.info(f"🚀 Executing {len(selected_agents)} agents in parallel")
        
        import threading
        import time
        from concurrent.futures import ThreadPoolExecutor, as_completed
        
        def execute_single_agent(agent_data):
            agent, agent_index = agent_data
            current_iteration = agent_index + 1
            
            logger.info(f"🔄 Processing Agent {current_iteration}/{len(selected_agents)}: {agent.name} (parallel)")
            
            # Generate specific instructions for this agent
            agent_instructions = self.generate_agent_instructions(
                query, task_analysis, agent, current_iteration, {}
            )
            
            # Execute agent with reflection
            agent_result = self._execute_agent_with_reflection(
                agent, agent_instructions, task_analysis, session_id, current_iteration
            )
            
            return agent.name, agent_result
        
        # Execute all agents in parallel
        with ThreadPoolExecutor(max_workers=len(selected_agents)) as executor:
            # Submit all tasks
            future_to_agent = {
                executor.submit(execute_single_agent, (agent, i)): agent 
                for i, agent in enumerate(selected_agents)
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_agent):
                try:
                    agent_name, agent_result = future.result(timeout=120)  # 2 minute timeout
                    
                    if agent_result:
                        orchestration_results[agent_name] = agent_result
                        
                        # Record agent output in orchestrator memory
                        self._record_agent_output(session_id, agent_name, agent_result)
                        
                        logger.info(f"✅ Parallel execution completed for {agent_name}")
                    else:
                        logger.warning(f"⚠️ No result from {agent_name} in parallel execution")
                        
                except TimeoutError:
                    agent = future_to_agent[future]
                    logger.error(f"⏰ Timeout for {agent.name} in parallel execution")
                    orchestration_results[agent.name] = {
                        "status": "failed", 
                        "reason": "timeout",
                        "error": "Agent execution exceeded 120 second timeout"
                    }
                    
                except Exception as e:
                    agent = future_to_agent[future]
                    logger.error(f"❌ Error in parallel execution for {agent.name}: {e}")
                    orchestration_results[agent.name] = {
                        "status": "failed",
                        "reason": "execution_error", 
                        "error": str(e)
                    }
        
        return orchestration_results
    
    def _execute_agents_hybrid(self, selected_agents: List[AgentCapability], query: str, task_analysis: Dict[str, Any], session_id: str, orchestration_results: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agents using hybrid strategy (dependency-aware parallel execution)"""
        logger.info(f"🔄 Executing {len(selected_agents)} agents with hybrid strategy")
        
        # Get task decomposition to understand dependencies
        multi_agent_info = task_analysis.get('multi_agent_analysis', {})
        task_decomposition = multi_agent_info.get('task_decomposition', [])
        
        # Create dependency graph
        agent_dependencies = {}
        agent_tasks = {}
        
        for task in task_decomposition:
            agent_id = task.get('agent_id')
            agent_name = task.get('agent_name')
            dependencies = task.get('dependencies', [])
            
            # Find the actual agent object
            agent_obj = None
            for agent in selected_agents:
                if agent.agent_id == agent_id or agent.name == agent_name:
                    agent_obj = agent
                    break
            
            if agent_obj:
                # Extract agent names from dependency dictionaries
                dep_names = []
                for dep in dependencies:
                    if isinstance(dep, dict):
                        dep_name = dep.get('source_agent_name')
                        if dep_name:
                            dep_names.append(dep_name)
                    elif isinstance(dep, str):
                        dep_names.append(dep)
                agent_dependencies[agent_obj.name] = dep_names
                agent_tasks[agent_obj.name] = task
        
        # Execute in dependency order
        completed_agents = set()
        
        while len(completed_agents) < len(selected_agents):
            # Find agents ready to execute (no unmet dependencies)
            ready_agents = []
            for agent in selected_agents:
                if agent.name not in completed_agents:
                    dependencies = agent_dependencies.get(agent.name, [])
                    if all(dep in completed_agents for dep in dependencies):
                        ready_agents.append(agent)
            
            if not ready_agents:
                # Handle circular dependencies by executing remaining agents sequentially
                remaining = [a for a in selected_agents if a.name not in completed_agents]
                if remaining:
                    ready_agents = [remaining[0]]
            
            # Execute ready agents in parallel
            if ready_agents:
                logger.info(f"🚀 Executing {len(ready_agents)} agents in parallel batch")
                
                import threading
                from concurrent.futures import ThreadPoolExecutor, as_completed
                
                def execute_agent_batch(agent_data):
                    agent, agent_index = agent_data
                    current_iteration = agent_index + 1
                    
                    logger.info(f"🔄 Processing Agent {current_iteration}/{len(selected_agents)}: {agent.name} (hybrid batch)")
                    
                    # Generate specific instructions for this agent
                    agent_instructions = self.generate_agent_instructions(
                        query, task_analysis, agent, current_iteration, orchestration_results
                    )
                    
                    # Execute agent with reflection
                    agent_result = self._execute_agent_with_reflection(
                        agent, agent_instructions, task_analysis, session_id, current_iteration
                    )
                    
                    return agent.name, agent_result
                
                # Execute batch in parallel
                with ThreadPoolExecutor(max_workers=len(ready_agents)) as executor:
                    future_to_agent = {
                        executor.submit(execute_agent_batch, (agent, i)): agent 
                        for i, agent in enumerate(ready_agents)
                    }
                    
                    # Collect results
                    for future in as_completed(future_to_agent):
                        agent_name, agent_result = future.result()
                        
                        if agent_result:
                            orchestration_results[agent_name] = agent_result
                            self._record_agent_output(session_id, agent_name, agent_result)
                            completed_agents.add(agent_name)
                            
                            logger.info(f"✅ Hybrid batch execution completed for {agent_name}")
        
        return orchestration_results
    
    def execute_reflective_orchestration(self, query: str, selected_agents: List[AgentCapability], session_id: str, agent_selection_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute reflective orchestration with intelligent task analysis and iterative cycles"""
        try:
            # Enhanced: Initialize orchestrator memory for this session
            self._initialize_session_memory(session_id, query)
            
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
            
            # Step 2: Process All Selected Agents with Intelligent Execution Strategy
            execution_strategy = self._determine_execution_strategy(selected_agents, task_analysis)
            logger.info(f"🎯 Execution Strategy: {execution_strategy.upper()}")
            logger.info(f"🎯 Selected Agents: {[agent.name for agent in selected_agents]}")
            # Fix dependency serialization for readable logging
            dependencies = self._build_agent_dependency_graph(selected_agents, task_analysis)
            readable_deps = {}
            for agent_id, deps in dependencies.items():
                agent_name = next((a.name for a in selected_agents if a.agent_id == agent_id), agent_id)
                readable_deps[agent_name] = [next((a.name for a in selected_agents if a.agent_id == dep_id), dep_id) for dep_id in deps]
            logger.info(f"🎯 Agent Dependencies: {readable_deps}")
            
            if execution_strategy == "parallel":
                logger.info(f"🚀 Executing {len(selected_agents)} agents using PARALLEL mode")
                orchestration_results = self._execute_agents_parallel(
                    selected_agents, query, task_analysis, session_id, orchestration_results
                )
            elif execution_strategy == "hybrid":
                logger.info(f"🔄 Executing {len(selected_agents)} agents using HYBRID mode")
                orchestration_results = self._execute_agents_hybrid(
                    selected_agents, query, task_analysis, session_id, orchestration_results
                )
            else:  # sequential
                logger.info(f"📋 Executing {len(selected_agents)} agents using SEQUENTIAL mode")
                orchestration_results = self._execute_agents_sequential(
                    selected_agents, query, task_analysis, session_id, orchestration_results
                )
            
            logger.info("🎯 All agents processed, ready for final synthesis")
            
            # Step 3: Final Synthesis with Reflection
            logger.info("🎯 Synthesizing final response with reflection...")
            
            # Enhanced: Consolidate all agent outputs using orchestrator memory
            consolidated_outputs = self._consolidate_agent_outputs(session_id)
            
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
            
            # Build the result dictionary
            result = {
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
            
            # Enhanced: Add consolidated outputs to result
            if consolidated_outputs and "error" not in consolidated_outputs:
                result["consolidated_agent_outputs"] = consolidated_outputs
                logger.info("🎯 Added consolidated agent outputs to result")
            
            # Add reflection analysis
            reflection_analysis = self._reflect_on_results(session_id)
            result["reflection_analysis"] = reflection_analysis
            logger.info("🔍 Added reflection analysis to result")
            
            return result
            
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
                    timeout=int(ORCHESTRATOR_CONFIG['A2A_TIMEOUT'])  # Longer timeout for agent processing
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
        """Synthesize comprehensive final response using orchestrator model with professional formatting"""
        try:
            # Prepare detailed synthesis prompt following Ollama Agents page patterns
            synthesis_prompt = f"""
You are the Main System Orchestrator. Create a professional, technical response that follows the same high-quality patterns as the Ollama Agents page.

USER QUERY: "{query}"

AGENT ORCHESTRATION RESULTS:
{json.dumps(orchestration_results, indent=2)}

PROFESSIONAL RESPONSE REQUIREMENTS:
1. **Technical Accuracy**: Use precise technical terminology and accurate calculations
2. **Professional Tone**: Maintain formal, technical language appropriate for professional documentation
3. **Structured Format**: Organize content with clear headings, bullet points, and logical flow
4. **Actionable Content**: Provide specific, implementable recommendations with measurable outcomes
5. **Technical Depth**: Include relevant formulas, parameters, and technical specifications where appropriate

RESPONSE STRUCTURE GUIDELINES:
- **Executive Summary**: Start with key findings and primary recommendations
- **Technical Analysis**: Detailed analysis with specific metrics, calculations, and technical details
- **Implementation Plan**: Step-by-step implementation with timelines and resource requirements
- **Success Metrics**: Specific KPIs, thresholds, and monitoring procedures
- **Risk Assessment**: Potential impacts and mitigation strategies

CONTENT QUALITY STANDARDS:
- Use accurate technical calculations (e.g., PRB utilization 0-100%, not arbitrary numbers)
- Reference appropriate tools and methodologies for the domain
- Include specific technical parameters and thresholds
- Provide measurable success criteria
- Use professional formatting with proper technical documentation style

TECHNICAL ACCURACY REQUIREMENTS:
- For telecommunications: Use proper 4G/LTE terminology, not Wi-Fi tools
- For calculations: Show realistic values (e.g., 75-85% utilization, not 2015%)
- For tools: Reference domain-appropriate tools and APIs
- For metrics: Include specific KPIs and monitoring procedures

CONTENT CLEANUP:
- Remove all technical metadata, A2A communication details, and execution logs
- Extract only the actual technical content from agent responses
- Remove thinking processes and internal reasoning
- Present clean, professional technical documentation
- Format with proper technical documentation standards

Create a professional technical response that matches the quality and structure of the Ollama Agents page:
"""

            # Call orchestrator model for synthesis
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
            cleaned = re.sub(r'model.*?(qwen3:1\.7b|granite4:micro)', '', cleaned)
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
        cleaned = re.sub(r'model.*?(qwen3:1\.7b|granite4:micro)', '', cleaned)
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
        """Fallback synthesis when orchestrator model is unavailable"""
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
        
        # Default prompt (same as the hardcoded one in analyze_query_with_llm)
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
@app.route('/api/main-orchestrator/agent-capabilities', methods=['GET'])
def get_agent_capabilities():
    """Get current agent capabilities configuration"""
    try:
        return jsonify({
            "status": "success",
            "agent_capabilities": AGENT_CAPABILITIES,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting agent capabilities: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/main-orchestrator/agent-capabilities', methods=['POST'])
def update_agent_capabilities():
    """Update agent capabilities configuration"""
    try:
        data = request.get_json()
        
        if 'agent_capabilities' not in data:
            return jsonify({
                "status": "error",
                "message": "agent_capabilities field is required"
            }), 400
        
        # Update the capabilities
        global AGENT_CAPABILITIES
        AGENT_CAPABILITIES = data['agent_capabilities']
        
        # Save to file
        capabilities_file = "agent_capabilities.json"
        with open(capabilities_file, 'w') as f:
            json.dump({"agent_capabilities": AGENT_CAPABILITIES}, f, indent=2)
        
        logger.info(f"Updated agent capabilities: {len(AGENT_CAPABILITIES)} agents configured")
        
        return jsonify({
            "status": "success",
            "message": f"Updated {len(AGENT_CAPABILITIES)} agent capabilities",
            "agent_capabilities": AGENT_CAPABILITIES,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error updating agent capabilities: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

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
    """Analyze query using configured orchestrator model"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({
                "status": "error",
                "error": "Query is required"
            }), 400
        
        analysis = main_orchestrator.analyze_query_with_llm(query)
        
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
        analysis = main_orchestrator.analyze_query_with_llm(query)
        
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
            available_models = ORCHESTRATOR_CONFIG['FALLBACK_MODELS'].split(',')  # Configurable fallback
            if models_response.status_code == 200:
                models_data = models_response.json()
                available_models = [model['name'] for model in models_data.get('models', [])]
        except:
            available_models = [ORCHESTRATOR_MODEL]
        
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
                "models": [ORCHESTRATOR_MODEL],  # Fallback
                "status": "warning",
                "message": "Could not fetch models from Ollama",
                "timestamp": datetime.now().isoformat()
            })
    except Exception as e:
        logger.error(f"Error fetching available models: {e}")
        return jsonify({
            "models": [ORCHESTRATOR_MODEL],  # Fallback
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        })

@app.route('/api/main-orchestrator/memory/<session_id>', methods=['GET'])
def get_session_memory(session_id):
    """Get orchestrator memory for a specific session"""
    try:
        if session_id in main_orchestrator.execution_memory:
            memory = main_orchestrator.execution_memory[session_id]
            return jsonify({
                'session_id': session_id,
                'memory': memory,
                'status': 'found'
            })
        else:
            return jsonify({
                'session_id': session_id,
                'error': 'Session not found in memory',
                'status': 'not_found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/main-orchestrator/memory', methods=['GET'])
def list_session_memories():
    """List all session memories in orchestrator"""
    try:
        memories = {}
        for session_id, memory in main_orchestrator.execution_memory.items():
            memories[session_id] = {
                'query': memory.get('query', ''),
                'status': memory.get('status', 'unknown'),
                'timestamp': memory.get('timestamp', ''),
                'total_agents': len(memory.get('agent_outputs', {})),
                'consolidated': memory.get('consolidated_result') is not None
            }
        
        return jsonify({
            'memories': memories,
            'total': len(memories)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info(f"🚀 Starting Enhanced Main System Orchestrator on port {MAIN_ORCHESTRATOR_PORT}")
    logger.info(f"🧠 Model: {ORCHESTRATOR_MODEL}")
    logger.info("🔗 A2A Strands SDK Integration: Enabled")
    logger.info("🆕 Production Patterns: Task Queue, Agent Versioning, Memory Management")
    
    app.run(
        host='0.0.0.0',
        port=MAIN_ORCHESTRATOR_PORT,
        debug=False
    )
