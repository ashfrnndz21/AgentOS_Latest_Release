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

# Import the 6-stage orchestrator
try:
    from enhanced_orchestrator_6stage import Enhanced6StageOrchestrator
except ImportError:
    try:
        # Try relative import
        from .enhanced_orchestrator_6stage import Enhanced6StageOrchestrator
    except ImportError:
        # Create a mock orchestrator if not available
        class Enhanced6StageOrchestrator:
            def __init__(self, ollama_base_url, orchestrator_model):
                self.ollama_base_url = ollama_base_url
                self.orchestrator_model = orchestrator_model
            
            def analyze_query_with_6stage_orchestrator(self, query, available_agents):
                return {
                    "stage_1_query_analysis": {
                        "user_intent": f"User query: {query}",
                        "domain": "general",
                        "complexity": "moderate",
                        "required_expertise": "general assistance"
                    },
                    "stage_3_execution_strategy": {
                        "strategy": "sequential",
                        "reasoning": "Using sequential execution for multi-agent coordination"
                    }
                }

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
ORCHESTRATOR_MODEL = "qwen3:1.7b"  # Enhanced model for 6-stage orchestration
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
        
        # Initialize the 6-stage orchestrator
        self.orchestrator_6stage = Enhanced6StageOrchestrator(
            ollama_base_url=OLLAMA_BASE_URL,
            orchestrator_model=ORCHESTRATOR_MODEL
        )
        
        logger.info("Enhanced Orchestrator initialized with 6-Stage LLM analysis")
    
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
        """Use LLM orchestrator to analyze query with full reasoning capture"""
        try:
            logger.info("Starting comprehensive LLM query analysis")
            
            # Prepare agent data for analysis
            agent_data = []
            for agent in available_agents:
                agent_data.append({
                    "id": agent.get('id', ''),
                    "name": agent.get('name', ''),
                    "description": agent.get('description', ''),
                    "capabilities": agent.get('tools', []),
                    "model": agent.get('model_id', 'unknown')
                })
            
            # Create comprehensive analysis prompt
            analysis_prompt = f"""You are the System Orchestrator. Perform a comprehensive analysis of this user query and available agents.

**USER QUERY:** {query}

**AVAILABLE AGENTS:**
{json.dumps(agent_data, indent=2)}

**ANALYSIS TASK:**
Provide a detailed JSON analysis with the following structure:

```json
{{
  "stage_1_query_analysis": {{
    "user_intent": "Detailed analysis of what the user wants to accomplish",
    "domain": "Primary domain/category of the request",
    "complexity": "Assessment of complexity (simple/moderate/complex)",
    "required_expertise": "What expertise is needed to fulfill this request",
    "context_reasoning": "Your detailed reasoning about the user's intent, context, and requirements",
    "domain_analysis": "Detailed analysis of the domain and its implications"
  }},
  "stage_2_agent_analysis": {{
    "agent_evaluations": [
      {{
        "agent_id": "agent_id",
        "agent_name": "agent_name",
        "relevance_score": 0.95,
        "capability_match": "Detailed analysis of how well this agent matches the requirements",
        "domain_relevance": "How relevant is this agent to the identified domain",
        "contextual_reasoning": "Your detailed reasoning for why this agent is suitable/not suitable",
        "strengths": ["strength1", "strength2"],
        "limitations": ["limitation1", "limitation2"],
        "recommended_role": "Specific role this agent should play"
      }}
    ],
    "overall_assessment": "Your overall assessment of agent capabilities and coordination needs"
  }},
  "stage_3_execution_strategy": {{
    "strategy": "sequential/parallel/single/orchestrator_only",
    "reasoning": "Analyze the user intent, agent relevance scores, and contextual fit to determine the optimal strategy. Consider: 1) If multiple agents have high relevance (>70%) and complementary roles, use 'sequential'. 2) If agents have similar relevance and can work independently, use 'parallel'. 3) If only one agent has high relevance (>50%), use 'single'. 4) If no agent has >50% relevance, recommend 'orchestrator_only'.",
    "coordination_requirements": "What coordination is needed between agents based on their roles and the user's intent",
    "execution_flow": "Step-by-step execution flow based on the chosen strategy",
    "strategy_justification": "Explain why this specific strategy is optimal given the agent scores and user requirements"
  }}
}}
```

**IMPORTANT:** Provide detailed reasoning in each section. Be specific about why each agent is suitable or not suitable for the task."""
            
            # Call LLM for analysis
            import requests
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": analysis_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "max_tokens": 3000
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '')
                
                # Try to parse JSON response
                try:
                    # Extract JSON from response
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_text = response_text[json_start:json_end]
                        analysis = json.loads(json_text)
                        
                        # Validate structure
                        if 'stage_1_query_analysis' in analysis:
                            logger.info("✅ LLM query analysis completed successfully")
                            return analysis
                        else:
                            raise ValueError("Invalid analysis structure")
                    else:
                        raise ValueError("No JSON found in LLM response")
                        
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Failed to parse LLM analysis JSON: {e}")
                    logger.error(f"LLM Response: {response_text[:500]}...")
                    return self._fallback_analysis(query, available_agents)
            else:
                logger.error(f"LLM analysis failed: {response.status_code}")
                return self._fallback_analysis(query, available_agents)
                
        except Exception as e:
            logger.error(f"LLM query analysis error: {e}")
            return self._fallback_analysis(query, available_agents)
    
    def release_llm_model(self):
        """Release LLM model from memory to free up resources"""
        try:
            # Force garbage collection multiple times
            import gc
            for _ in range(3):  # Multiple passes for better cleanup
                gc.collect()
            
            # Log memory status
            import psutil
            memory_usage = psutil.virtual_memory().percent
            logger.info(f"Memory management: Model released, current usage: {memory_usage:.1f}%")
            
            # If memory is still high, force more aggressive cleanup
            if memory_usage > 75:  # Lowered threshold for earlier cleanup
                logger.warning(f"High memory usage: {memory_usage:.1f}% - forcing aggressive cleanup")
                # Clear any cached models or temporary objects
                import sys
                if hasattr(sys, '_clear_type_cache'):
                    sys._clear_type_cache()
                
                # Force additional cleanup
                import os
                try:
                    os.system('sync')  # Force disk sync to free memory
                except:
                    pass
                
        except Exception as e:
            logger.warning(f"Memory management warning: {e}")

    def analyze_agents_contextually(self, query: str, available_agents: List[Dict], user_intent: str, domain_analysis: Dict) -> Dict:
        """Analyze all agents in registry with contextual scoring based on user intent and domain"""
        try:
            # Prepare simplified agent data for LLM analysis
            agent_data = []
            for agent in available_agents:
                agent_data.append({
                    "name": agent['name'],
                    "description": agent.get('description', ''),
                    "role": agent.get('description', '')  # Use description as role for now
                })
            
            # Create prompt for agent analysis
            prompt = f"""
You are an expert agent orchestrator. Analyze each agent and provide detailed contextual analysis with comprehensive reasoning.

USER QUERY: {query}
USER INTENT: {user_intent}
DOMAIN ANALYSIS: {domain_analysis}

AVAILABLE AGENTS:
{json.dumps(agent_data, indent=2)}

For each agent, provide detailed analysis with comprehensive reasoning:
1. Role Analysis: What is this agent's primary role?
2. Contextual Relevance: How well does this agent match the user's intent?
3. Association Score: A score from 0.0 to 1.0

Return your analysis in this JSON format:
{{
    "agent_analysis": [
        {{
            "agent_name": "agent_name",
            "role_analysis": "Brief 2-sentence analysis of the agent's role and purpose",
            "contextual_relevance": "Brief 2-sentence analysis of how well this agent matches the user intent",
            "association_score": 0.85
        }}
    ],
    "analysis_summary": "Brief 2-sentence overall summary of agent capabilities and recommendations"
}}
"""
            
            # Call LLM for analysis
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "qwen3:1.7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 1000  # Reduced from 2000
                    }
                },
                timeout=60  # Increased for better synthesis
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '')
                
                # Try to parse JSON response
                try:
                    # Extract JSON from response (handle potential markdown formatting)
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_text = response_text[json_start:json_end]
                        analysis = json.loads(json_text)
                        
                        # Validate and structure the response
                        if 'agent_analysis' in analysis:
                            return {
                                "success": True,
                                "agent_analysis": analysis['agent_analysis'],
                                "analysis_summary": analysis.get('analysis_summary', ''),
                                "total_agents_analyzed": len(analysis['agent_analysis'])
                            }
                        else:
                            raise ValueError("Invalid response format")
                    else:
                        raise ValueError("No JSON found in response")
                        
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Failed to parse agent analysis JSON: {e}")
                    # Fallback to simple analysis
                    return self._fallback_agent_analysis(available_agents, user_intent, domain_analysis)
            else:
                logger.error(f"LLM analysis failed: {response.status_code}")
                return self._fallback_agent_analysis(available_agents, user_intent, domain_analysis)
                
        except Exception as e:
            logger.error(f"Agent analysis error: {e}")
            return self._fallback_agent_analysis(available_agents, user_intent, domain_analysis)
    
    def _fallback_agent_analysis(self, available_agents: List[Dict], user_intent: str, domain_analysis: Dict) -> Dict:
        """Fallback agent analysis when LLM fails"""
        agent_analysis = []
        
        for agent in available_agents:
            # Simple scoring based on keyword matching
            score = 0.0
            agent_name = agent.get('name', '').lower()
            agent_desc = agent.get('description', '').lower()
            agent_capabilities = agent.get('capabilities', [])
            
            # Check for keyword matches
            query_lower = user_intent.lower()
            for word in query_lower.split():
                if word in agent_desc:
                    score += 0.2
                if word in agent_name:
                    score += 0.3
                if any(word in cap.lower() for cap in agent_capabilities):
                    score += 0.1
            
            # Cap the score at 1.0
            score = min(score, 1.0)
            
            agent_analysis.append({
                "agent_name": agent['name'],
                "role_analysis": f"Agent specialized in {agent.get('description', 'general assistance')}. Provides basic support for user queries.",
                "contextual_relevance": f"Basic keyword matching suggests {'high' if score > 0.5 else 'moderate' if score > 0.2 else 'low'} relevance to user intent. Suitable for general assistance tasks.",
                "association_score": score
            })
        
        # Sort by association score
        agent_analysis.sort(key=lambda x: x['association_score'], reverse=True)
        
        return {
            "success": True,
            "agent_analysis": agent_analysis,
            "analysis_summary": f"Analyzed {len(agent_analysis)} agents using fallback keyword matching. Found suitable agents for user query based on basic relevance scoring.",
            "total_agents_analyzed": len(agent_analysis)
        }
    
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
                timeout=60
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
    
    def process_query(self, query: str, contextual_analysis: Dict = None, test_mode: bool = False) -> Dict:
        """Process query through enhanced orchestration pipeline"""
        session = self.create_session(query)
        
        try:
            # Stage 1: Get available agents
            logger.info(f"[{session.session_id}] Stage 1: Getting available agents")
            
            # Get Strands SDK agents first
            sdk_response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
            if sdk_response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to get SDK agents",
                    "session_id": session.session_id
                }
            
            sdk_agents = sdk_response.json().get('agents', [])
            logger.info(f"[{session.session_id}] Found {len(sdk_agents)} SDK agents")
            
            # Get A2A agents (optional)
            a2a_agents = []
            try:
                a2a_response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
                if a2a_response.status_code == 200:
                    a2a_agents = a2a_response.json().get('agents', [])
                    logger.info(f"[{session.session_id}] Found {len(a2a_agents)} A2A agents")
            except Exception as e:
                logger.warning(f"[{session.session_id}] A2A service not available: {e}")
            
            # Use SDK agents directly (A2A agents will be registered during execution)
            available_agents = []
            for sdk_agent in sdk_agents:
                available_agents.append({
                    'id': sdk_agent['id'],
                    'name': sdk_agent['name'],
                    'description': sdk_agent.get('description', ''),
                    'capabilities': sdk_agent.get('tools', []),
                    'tools': sdk_agent.get('tools', []),
                    'model': sdk_agent.get('model_id', 'unknown'),
                    'system_prompt': sdk_agent.get('system_prompt', '')
                })
            
            logger.info(f"[{session.session_id}] Using {len(available_agents)} available agents")
            
            if not available_agents:
                return {
                    "success": False,
                    "error": "No agents available",
                    "session_id": session.session_id
                }
            
            # Stage 2: LLM Query Analysis (Sequential Loading - Load → Use → Release)
            logger.info(f"[{session.session_id}] Stage 2: LLM query analysis (Sequential Loading)")
            
            # Check memory before loading model
            import psutil
            memory_before = psutil.virtual_memory().percent
            logger.info(f"[{session.session_id}] Memory before LLM analysis: {memory_before:.1f}%")
            
            if memory_before > 85:
                logger.warning(f"[{session.session_id}] High memory usage ({memory_before:.1f}%) - forcing cleanup before LLM analysis")
                self.release_llm_model()
            
            analysis = self.analyze_query_with_llm(query, available_agents)
            
            # Enhanced Step 1 output - preserve detailed reasoning
            if 'stage_1_query_analysis' in analysis:
                analysis['stage_1_query_analysis']['detailed_reasoning'] = analysis['stage_1_query_analysis'].get('context_reasoning', '')
                analysis['stage_1_query_analysis']['reasoning'] = f"Comprehensive query analysis completed. User intent: {analysis['stage_1_query_analysis'].get('user_intent', 'Unknown')}. Domain: {analysis['stage_1_query_analysis'].get('domain', 'General')}. Complexity: {analysis['stage_1_query_analysis'].get('complexity', 'moderate')}."
            
            # Sequential Loading: Release model immediately after use
            logger.info(f"[{session.session_id}] Sequential Loading: Releasing LLM model after Orchestrator Reasoning")
            self.release_llm_model()
            
            memory_after = psutil.virtual_memory().percent
            logger.info(f"[{session.session_id}] Memory after LLM analysis: {memory_after:.1f}% (freed {memory_before - memory_after:.1f}%)")
            
            session.query_analysis = analysis
            
            # Stage 2.5: Agent Registry Analysis
            logger.info(f"[{session.session_id}] Stage 2.5: Agent registry contextual analysis")
            
            # Extract user intent and domain analysis from streamlined analysis if available
            user_intent = "General query assistance"
            domain_analysis = {"primary_domain": "General", "technical_level": "beginner"}
            
            # Check if we have contextual analysis data from frontend
            if contextual_analysis and contextual_analysis.get('success'):
                user_intent = contextual_analysis.get('user_intent', user_intent)
                domain_analysis = contextual_analysis.get('domain_analysis', domain_analysis)
                # Store in session for reference
                session.streamlined_analysis = contextual_analysis
            elif hasattr(session, 'streamlined_analysis') and session.streamlined_analysis:
                user_intent = session.streamlined_analysis.get('user_intent', user_intent)
                domain_analysis = session.streamlined_analysis.get('domain_analysis', domain_analysis)
            elif 'stage_1_query_analysis' in analysis:
                user_intent = analysis['stage_1_query_analysis'].get('user_intent', user_intent)
                domain_analysis = {
                    "primary_domain": analysis['stage_1_query_analysis'].get('domain', 'General'),
                    "technical_level": analysis['stage_1_query_analysis'].get('complexity', 'beginner')
                }
            
            # Perform contextual agent analysis (Sequential Loading - Load → Use → Release)
            logger.info(f"[{session.session_id}] Starting agent analysis with {len(available_agents)} agents (Sequential Loading)")
            
            # Check memory before agent analysis
            memory_before_agent = psutil.virtual_memory().percent
            logger.info(f"[{session.session_id}] Memory before agent analysis: {memory_before_agent:.1f}%")
            
            if memory_before_agent > 85:
                logger.warning(f"[{session.session_id}] High memory usage ({memory_before_agent:.1f}%) - forcing cleanup before agent analysis")
                self.release_llm_model()
            
            agent_analysis_result = self.analyze_agents_contextually(query, available_agents, user_intent, domain_analysis)
            logger.info(f"[{session.session_id}] Agent analysis result: {agent_analysis_result.get('success', False)}")
            session.agent_analysis = agent_analysis_result
            
            # Sequential Loading: Release model immediately after agent analysis
            logger.info(f"[{session.session_id}] Sequential Loading: Releasing LLM model after Agent Analysis")
            self.release_llm_model()
            
            memory_after_agent = psutil.virtual_memory().percent
            logger.info(f"[{session.session_id}] Memory after agent analysis: {memory_after_agent:.1f}% (freed {memory_before_agent - memory_after_agent:.1f}%)")
            
            # Add agent analysis to the main analysis result (ensure it's never null)
            if agent_analysis_result and agent_analysis_result.get('success'):
                analysis['agent_registry_analysis'] = agent_analysis_result
            else:
                # Fallback: create a minimal analysis structure
                analysis['agent_registry_analysis'] = {
                    "success": False,
                    "agent_analysis": [],
                    "analysis_summary": "Agent analysis failed - using fallback",
                    "total_agents_analyzed": 0
                }
            
            # Stage 3: Agent Selection & A2A Handover Orchestration
            logger.info(f"[{session.session_id}] Stage 3: Agent selection and A2A handover orchestration")
            
            # Get execution strategy from analysis
            execution_strategy = analysis.get('stage_3_execution_strategy', {}).get('strategy', 'direct')
            
            # Use agent analysis results for selection (faster than 6-stage orchestrator)
            selected_agents = []
            if agent_analysis_result and agent_analysis_result.get('success'):
                agent_analysis = agent_analysis_result.get('agent_analysis', [])
                # Select top 2 agents by association score
                sorted_agents = sorted(agent_analysis, key=lambda x: x.get('association_score', 0), reverse=True)
                for i, agent in enumerate(sorted_agents[:2]):  # Max 2 agents
                    selected_agents.append({
                        'agent_name': agent.get('agent_name', 'Unknown'),
                        'execution_order': i + 1,
                        'task_assignment': agent.get('role_analysis', 'General assistance')[:100]  # Truncate for brevity
                    })
            
            logger.info(f"Execution strategy: {execution_strategy}")
            logger.info(f"Selected agents: {len(selected_agents)}")
            logger.info(f"Selected agents details: {selected_agents}")
            
            # Execute based on intelligent strategy selection
            if execution_strategy.lower() == 'sequential' and len(selected_agents) > 1:
                # Sequential A2A handover execution - Multiple agents with complementary roles
                logger.info(f"[{session.session_id}] Stage 4: Sequential A2A handover execution")
                logger.info(f"[{session.session_id}] Selected agents for handover: {[a.get('agent_name', 'unknown') for a in selected_agents]}")
                execution_results = execute_sequential_a2a_handover(selected_agents, available_agents, query, session.session_id)
                session.execution_result = execution_results
                
            elif execution_strategy.lower() == 'parallel' and len(selected_agents) > 1:
                # Parallel execution - Multiple agents working independently
                logger.info(f"[{session.session_id}] Stage 4: Parallel execution")
                # For now, fall back to sequential (parallel implementation pending)
                execution_results = execute_sequential_a2a_handover(selected_agents, available_agents, query, session.session_id)
                session.execution_result = execution_results
                
            elif execution_strategy.lower() == 'single' and selected_agents:
                # Single agent execution - One agent with high relevance (>50%)
                logger.info(f"[{session.session_id}] Stage 4: Single agent execution")
                agent_info = selected_agents[0]
                agent_id = agent_info.get('agent_name')
                
                # Find agent by name
                selected_agent = next((a for a in available_agents if a['name'] == agent_id), None)
                if not selected_agent:
                    # Fallback to old method
                    selected_agent_id = analysis.get('stage_3_contextual_matching', {}).get('selected_agent_id')
                    selected_agent = next((a for a in available_agents if a['id'] == selected_agent_id), None)
                
                if not selected_agent:
                    return {
                        "success": False,
                        "error": "Selected agent not found",
                        "session_id": session.session_id
                    }
                
                logger.info(f"Single agent execution: {selected_agent['name']} (ID: {selected_agent['id']})")
                
            elif execution_strategy.lower() == 'orchestrator_only':
                # Orchestrator-only execution - No agent has >50% relevance
                logger.info(f"[{session.session_id}] Stage 4: Orchestrator-only execution (no agent >50% relevance)")
                execution_results = {
                    "success": True,
                    "execution_time": 0,
                    "orchestration_type": "orchestrator_only",
                    "strands_response": "The orchestrator determined that no available agents have sufficient relevance (>50%) for this query. The orchestrator will provide a general response based on its knowledge.",
                    "agents_coordinated": 0,
                    "coordination_results": {
                        "a2a_framework": False,
                        "handover_steps": [],
                        "strands_integration": False,
                        "successful_steps": 0
                    }
                }
                session.execution_result = execution_results
                
            elif execution_strategy.lower() == 'single' and selected_agents:
                # Complete single agent execution
                logger.info(f"[{session.session_id}] Executing single agent: {selected_agent['name']}")
                execution_result = self.execute_agent_query(selected_agent['id'], query, session.session_id)
                session.execution_result = execution_result
                
            elif execution_strategy.lower() == 'direct' and selected_agents:
                # Direct execution - Treat as sequential for now
                logger.info(f"[{session.session_id}] Stage 4: Direct execution (treating as sequential)")
                execution_results = execute_sequential_a2a_handover(selected_agents, available_agents, query, session.session_id)
                session.execution_result = execution_results
                
            else:
                # Fallback execution - No strategy matched
                logger.info(f"[{session.session_id}] Stage 4: Fallback execution")
                return {
                    "success": False,
                    "error": f"Unsupported execution strategy: {execution_strategy}",
                    "session_id": session.session_id
                }
            
            # Stage 5: Response Synthesis (Sequential Loading - Load → Use → Release)
            logger.info(f"[{session.session_id}] Stage 5: Response synthesis (Sequential Loading)")
            
            # Check memory before synthesis
            memory_before_synthesis = psutil.virtual_memory().percent
            logger.info(f"[{session.session_id}] Memory before synthesis: {memory_before_synthesis:.1f}%")
            
            if memory_before_synthesis > 85:
                logger.warning(f"[{session.session_id}] High memory usage ({memory_before_synthesis:.1f}%) - forcing cleanup before synthesis")
                self.release_llm_model()
            
            if execution_strategy.lower() == 'sequential' and len(selected_agents) > 1:
                # Handle sequential execution results
                final_response = self.synthesize_sequential_response(query, analysis, execution_results, selected_agents)
            else:
                # Handle single agent execution results
                if 'execution_result' in locals():
                    final_response = self.synthesize_response(query, analysis, execution_result, selected_agent)
                else:
                    # Fallback if execution_result is not defined
                    final_response = f"Orchestration completed but response synthesis failed. Strategy: {execution_strategy}, Agents: {len(selected_agents)}"
            
            # Sequential Loading: Release model immediately after synthesis
            logger.info(f"[{session.session_id}] Sequential Loading: Releasing LLM model after Response Synthesis")
            self.release_llm_model()
            
            memory_after_synthesis = psutil.virtual_memory().percent
            logger.info(f"[{session.session_id}] Memory after synthesis: {memory_after_synthesis:.1f}% (freed {memory_before_synthesis - memory_after_synthesis:.1f}%)")
            session.final_response = final_response
            
            # Update session status
            session.status = "completed"
            
            # Prepare comprehensive response with detailed reasoning
            execution_success = False
            if execution_strategy.lower() == 'sequential' and len(selected_agents) > 1:
                execution_success = execution_results.get('success', False)
            elif 'execution_result' in locals():
                execution_success = execution_result.get('success', False)
            else:
                execution_success = True  # Fallback for other cases
            
            # Define match_quality with fallback
            match_quality = analysis.get('stage_3_execution_strategy', {}).get('match_quality', 'moderate')
            
            result = {
                "success": execution_success,
                "session_id": session.session_id,
                "orchestration_summary": {
                    "total_stages": 6,
                    "stages_completed": 5,
                    "execution_strategy": analysis.get('stage_3_execution_strategy', {}).get('strategy', 'single'),
                    "reasoning_quality": match_quality,
                    "processing_time": (datetime.now() - session.created_at).total_seconds(),
                    # Add detailed LLM reasoning for frontend display
                    "user_intent": analysis.get('stage_1_query_analysis', {}).get('user_intent', 'Unknown'),
                    "domain": analysis.get('stage_1_query_analysis', {}).get('domain', 'General'),
                    "complexity": analysis.get('stage_1_query_analysis', {}).get('complexity', 'moderate'),
                    "context_reasoning": analysis.get('stage_1_query_analysis', {}).get('context_reasoning', ''),
                    "domain_analysis": analysis.get('stage_1_query_analysis', {}).get('domain_analysis', ''),
                    "agent_evaluations": analysis.get('stage_2_agent_analysis', {}).get('agent_evaluations', []),
                    "execution_reasoning": analysis.get('stage_3_execution_strategy', {}).get('reasoning', ''),
                    "coordination_requirements": analysis.get('stage_3_execution_strategy', {}).get('coordination_requirements', '')
                },
                "stage_1_query_analysis": {
                    **analysis.get('stage_1_query_analysis', {}),
                    "reasoning": "Analyzed user intent, domain, and complexity to understand query requirements"
                },
                "stage_2_sequence_definition": {
                    **analysis.get('stage_2_sequence_definition', {}),
                    "reasoning": "Defined workflow steps and execution flow based on query complexity"
                },
                "stage_3_execution_strategy": {
                    **analysis.get('stage_3_execution_strategy', {}),
                    "reasoning": "Determined optimal execution strategy (single/sequential/parallel) based on task requirements"
                },
                "stage_4_agent_analysis": {
                    **analysis.get('stage_4_agent_analysis', {}),
                    "reasoning": "Evaluated all available agents for their capabilities, tools, and suitability"
                },
                "stage_5_agent_matching": {
                    **analysis.get('stage_5_agent_matching', {}),
                    "reasoning": f"Matched query requirements with agent capabilities: Agent selected based on analysis"
                },
                "stage_6_orchestration_plan": {
                    **analysis.get('stage_6_orchestration_plan', {}),
                    "reasoning": "Created final orchestration plan with confidence assessment and execution strategy"
                },
                "selected_agent": {
                    "id": selected_agents[0].get('agent_id', 'unknown') if selected_agents and len(selected_agents) > 0 else 'unknown',
                    "name": selected_agents[0].get('agent_name', 'unknown') if selected_agents and len(selected_agents) > 0 else 'unknown',
                    "description": selected_agents[0].get('task_assignment', 'No description available') if selected_agents and len(selected_agents) > 0 else 'unknown',
                    "capabilities": selected_agents[0].get('capabilities', []) if selected_agents and len(selected_agents) > 0 else [],
                    "tools": selected_agents[0].get('tools', []) if selected_agents and len(selected_agents) > 0 else [],
                    "model": selected_agents[0].get('model', 'unknown') if selected_agents and len(selected_agents) > 0 else 'unknown',
                    "selection_reasoning": 'Agent selected based on contextual analysis and domain matching',
                    "match_quality": match_quality
                },
                "execution_details": {
                    "execution_time": execution_results.get('execution_time', 0) if execution_strategy.lower() == 'sequential' and len(selected_agents) > 1 else execution_result.get('execution_time', 0) if 'execution_result' in locals() else 0,
                    "agent_response_length": len(str(execution_results.get('strands_response', ''))) if execution_strategy.lower() == 'sequential' and len(selected_agents) > 1 else len(str(execution_result.get('result', ''))) if 'execution_result' in locals() else 0,
                    "success": execution_success
                },
                "final_response": final_response,
                "raw_agent_response": execution_results if execution_strategy.lower() == 'sequential' and len(selected_agents) > 1 else execution_result.get('result', {}) if 'execution_result' in locals() else {},
                "agent_registry_analysis": analysis.get('agent_registry_analysis', {}),
                "error": execution_results.get('error') if execution_strategy.lower() == 'sequential' and len(selected_agents) > 1 else execution_result.get('error') if 'execution_result' in locals() else None
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
    
    def synthesize_sequential_response(self, query: str, analysis: Dict, execution_results: Dict, selected_agents: List[Dict]) -> str:
        """Synthesize response from sequential A2A handover execution"""
        try:
            logger.info("Synthesizing sequential response from A2A handover")
            
            if not execution_results.get("success"):
                return f"Sequential execution failed: {execution_results.get('error', 'Unknown error')}"
            
            # Extract Strands response
            strands_response = execution_results.get("strands_response", "")
            coordination_results = execution_results.get("coordination_results", {})
            
            # Build comprehensive response
            response_parts = []
            
            # Add orchestration summary
            response_parts.append("🤖 **Multi-Agent Orchestration Complete**")
            response_parts.append(f"**Strategy**: Sequential A2A Handover")
            response_parts.append(f"**Agents Coordinated**: {execution_results.get('agents_coordinated', 0)}")
            response_parts.append("")
            
            # Add Strands orchestrator response
            if strands_response:
                response_parts.append("**Orchestrator Analysis:**")
                response_parts.append(strands_response)
                response_parts.append("")
            
            # Add coordination details
            if coordination_results:
                response_parts.append("**Coordination Details:**")
                if coordination_results.get("agent_references"):
                    response_parts.append(f"**Agents Referenced**: {', '.join(coordination_results['agent_references'])}")
                if coordination_results.get("coordination_indicators"):
                    response_parts.append(f"**Coordination Methods**: {', '.join(coordination_results['coordination_indicators'])}")
                response_parts.append("")
            
            # Add execution summary
            response_parts.append("**Execution Summary:**")
            response_parts.append(f"✅ Sequential A2A handover completed successfully")
            response_parts.append(f"⏱️ Total execution time: {execution_results.get('execution_time', 0):.2f} seconds")
            response_parts.append(f"🔄 Orchestration type: {execution_results.get('orchestration_type', 'unknown')}")
            
            # Add final synthesis section
            final_synthesis = self._generate_final_synthesis(query, analysis, execution_results, selected_agents)
            if final_synthesis:
                response_parts.append("")
                response_parts.append("---")
                response_parts.append("")
                response_parts.append("🎯 **FINAL ORCHESTRATED RESPONSE**")
                response_parts.append("")
                response_parts.append(final_synthesis)
            
            return "\n".join(response_parts)
            
        except Exception as e:
            logger.error(f"Error synthesizing sequential response: {e}")
            return f"Sequential response synthesis failed: {str(e)}"
    
    def _generate_final_synthesis(self, query: str, analysis: Dict, execution_results: Dict, selected_agents: List[Dict]) -> str:
        """Generate final synthesis using orchestrator LLM to process original query + agent outputs"""
        try:
            logger.info("Generating final synthesis using orchestrator LLM")
            
            # Extract agent outputs from coordination results
            handover_steps = execution_results.get("coordination_results", {}).get("handover_steps", [])
            if not handover_steps:
                logger.warning("No handover steps found for final synthesis")
                return ""
            
            # Collect all agent outputs (clean them first)
            agent_outputs = []
            for step in handover_steps:
                if step.get("a2a_status") == "success" and step.get("result"):
                    # Clean the output by removing <think> tags and reasoning
                    raw_output = step.get("result", "")
                    # Remove <think> blocks
                    import re
                    cleaned_output = re.sub(r'<think>.*?</think>', '', raw_output, flags=re.DOTALL)
                    # Remove extra whitespace
                    cleaned_output = re.sub(r'\n\s*\n', '\n\n', cleaned_output).strip()
                    
                    agent_outputs.append({
                        "agent_name": step.get("agent_name", "Unknown Agent"),
                        "step": step.get("step", 0),
                        "output": cleaned_output
                    })
            
            if not agent_outputs:
                logger.warning("No successful agent outputs found for synthesis")
                return ""
            
            # Prepare synthesis prompt
            synthesis_prompt = f"""You are the System Orchestrator. Your task is to provide a comprehensive, clean, and well-structured final response based on the original user query and the outputs from specialized agents.

**ORIGINAL USER QUERY:**
{query}

**AGENT OUTPUTS:**
"""
            
            for agent_output in agent_outputs:
                synthesis_prompt += f"""
**{agent_output['agent_name']} (Step {agent_output['step']}):**
{agent_output['output']}
"""
            
            synthesis_prompt += f"""

**YOUR TASK:**
Analyze the original query and all agent outputs above. Provide a clean, concise, and well-structured final response that:

1. **Directly answers the user's original question**
2. **Synthesizes the key insights from all agent outputs**
3. **Provides a cohesive, professional response**
4. **Excludes raw reasoning, thinking processes, and technical details**
5. **Focuses on the final deliverable (poem, code, analysis, etc.)**

**IMPORTANT:**
- Focus on answering the user's question completely
- Integrate information from all agents seamlessly
- Provide a clean, final answer without technical jargon
- **DO NOT include <think> tags, reasoning processes, or step-by-step analysis**
- **DO NOT include execution times, technical details, or orchestration metadata**
- **ONLY include the final deliverable (poem, code, analysis, etc.)**
- **Remove ALL thinking tags, reasoning blocks, and technical metadata from agent outputs**
- Make it easy to read and understand
- Be comprehensive but concise
- **CRITICAL: Your response should start directly with the final answer, no thinking process**

**FINAL RESPONSE (START DIRECTLY WITH THE ANSWER):**"""
            
            # Call orchestrator LLM for final synthesis
            try:
                import requests
                
                # Use the same Ollama API that the orchestrator uses
                ollama_response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "qwen3:1.7b",
                        "prompt": synthesis_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.3,
                            "max_tokens": 1000  # Reduced for better memory management
                        }
                    },
                    timeout=60
                )
                
                if ollama_response.status_code == 200:
                    ollama_data = ollama_response.json()
                    final_synthesis = ollama_data.get('response', '').strip()
                    
                    if final_synthesis:
                        # Post-process to remove any remaining <think> tags
                        import re
                        clean_response = re.sub(r'<think>.*?</think>', '', final_synthesis, flags=re.DOTALL)
                        clean_response = re.sub(r'\n\s*\n', '\n\n', clean_response).strip()
                        
                        logger.info("✅ Final synthesis generated successfully")
                        return clean_response
                    else:
                        logger.warning("Empty response from orchestrator LLM")
                        return ""
                else:
                    logger.error(f"Ollama API error during synthesis: {ollama_response.status_code}")
                    return ""
                    
            except Exception as llm_error:
                logger.error(f"Error calling orchestrator LLM for synthesis: {llm_error}")
                return ""
            
        except Exception as e:
            logger.error(f"Error generating final synthesis: {e}")
            # Fallback: return a simple clean version of the first agent's output
            if agent_outputs:
                first_output = agent_outputs[0]['output']
                # Remove <think> tags from fallback
                import re
                clean_fallback = re.sub(r'<think>.*?</think>', '', first_output, flags=re.DOTALL)
                clean_fallback = re.sub(r'\n\s*\n', '\n\n', clean_fallback).strip()
                return clean_fallback
            return ""
    
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
                        # Clean up multiple sessions if memory is very high
                        sessions_to_cleanup = min(3, len(self.active_sessions))
                        sorted_sessions = sorted(self.active_sessions.items(), 
                                               key=lambda x: x[1].created_at)
                        
                        for i in range(sessions_to_cleanup):
                            session_id = sorted_sessions[i][0]
                            logger.warning(f"Force cleaning up session {session_id} due to high memory")
                            self.cleanup_session(session_id)
                        
                        # Force garbage collection after cleanup
                        gc.collect()
                
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
        contextual_analysis = data.get('contextual_analysis', None)
        test_mode = data.get('test_mode', False)  # Add test mode parameter
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Processing enhanced orchestration query: {query[:50]}... (test_mode: {test_mode})")
        
        result = orchestrator.process_query(query, contextual_analysis, test_mode)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Enhanced query endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def execute_sequential_a2a_handover(selected_agents: List[Dict], available_agents: List[Dict], query: str, session_id: str) -> Dict[str, Any]:
    """Execute sequential A2A handover using Strands A2A framework"""
    try:
        logger.info(f"[{session_id}] Starting Strands A2A handover with {len(selected_agents)} agents")
        
        # Import Strands orchestration engine
        import sys
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        sys.path.append(current_dir)
        sys.path.append(parent_dir)
        
        try:
            from strands_orchestration_engine import get_strands_orchestration_engine
        except ImportError:
            # Create a mock orchestration engine if not available
            class MockStrandsOrchestrationEngine:
                def execute_sequential_a2a_handover(self, query, available_agents, session_id):
                    logger.warning(f"[{session_id}] Using mock orchestration engine - A2A not available")
                    return {
                        "success": False,
                        "error": "Strands orchestration engine not available",
                        "handover_steps": [],
                        "a2a_framework": False,
                        "fallback_mode": True
                    }
            
            def get_strands_orchestration_engine():
                return MockStrandsOrchestrationEngine()
        
        # Get orchestration engine
        orchestration_engine = get_strands_orchestration_engine()
        
        # Execute using Strands A2A framework
        result = orchestration_engine.execute_sequential_a2a_handover(query, available_agents, session_id)
        
        if result.get("success"):
            logger.info(f"[{session_id}] Strands A2A handover completed successfully")
            
            # Extract handover results
            handover_steps = result.get("handover_steps", [])
            successful_steps = [step for step in handover_steps if step.get("a2a_status") == "success"]
            
            # Build comprehensive response
            response_parts = []
            response_parts.append("🤖 **Multi-Agent A2A Orchestration Complete**")
            response_parts.append(f"**Framework**: Strands A2A Framework")
            response_parts.append(f"**Agents Coordinated**: {len(selected_agents)}")
            response_parts.append(f"**Successful Steps**: {len(successful_steps)}/{len(handover_steps)}")
            response_parts.append("")
            
            # Add step-by-step results (concise)
            for step in handover_steps:
                if step.get("a2a_status") == "success":
                    response_parts.append(f"**Step {step['step']}: {step['agent_name']}** ✅")
                    response_parts.append(f"Execution Time: {step['execution_time']:.2f}s")
                    response_parts.append("")
                else:
                    response_parts.append(f"**Step {step['step']}: {step['agent_name']}** ❌")
                    response_parts.append(f"Error: {step.get('error', 'Unknown error')}")
                    response_parts.append("")
            
            # Add final synthesis
            if successful_steps:
                final_synthesis = f"**Final Synthesis**: Successfully coordinated {len(successful_steps)} agents using Strands A2A framework. Each agent contributed their specialized capabilities to provide a comprehensive response to your query."
                response_parts.append(final_synthesis)
            
            return {
                "success": True,
                "orchestration_type": "strands_a2a_handover",
                "agents_coordinated": len(selected_agents),
                "strands_response": "\n".join(response_parts),
                "coordination_results": {
                    "handover_steps": handover_steps,
                    "successful_steps": len(successful_steps),
                    "a2a_framework": True,
                    "strands_integration": True
                },
                "execution_time": sum(step.get("execution_time", 0) for step in handover_steps),
                "session_id": session_id,
                "a2a_metadata": {
                    "framework_version": "1.0.0",
                    "strands_integration": True,
                    "fallback_mode": result.get("fallback_mode", False)
                }
            }
        else:
            logger.error(f"[{session_id}] Strands A2A handover failed: {result.get('error')}")
            return {
                "success": False,
                "error": result.get("error", "Unknown error in Strands A2A orchestration"),
                "session_id": session_id,
                "a2a_framework": result.get("a2a_framework", False)
            }
        
    except Exception as e:
        logger.error(f"Error in Strands A2A handover: {e}")
        return {
            "success": False,
            "error": str(e),
            "session_id": session_id,
            "a2a_framework": False
        }

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
