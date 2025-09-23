#!/usr/bin/env python3
"""
Enhanced 6-Stage Orchestrator LLM Implementation
Implements the comprehensive orchestrator workflow as described:
1. Contextual Query Analysis
2. Sequence Definition  
3. Execution Strategy Detection
4. Comprehensive Agent Analysis
5. Intelligent Agent Matching
6. Orchestration Plan & Final Synthesis
"""

import json
import requests
import logging
import time
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class Enhanced6StageOrchestrator:
    """Advanced 6-Stage Orchestrator LLM for intelligent multi-agent coordination"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", orchestrator_model: str = "qwen3:1.7b"):
        self.ollama_base_url = ollama_base_url
        self.orchestrator_model = orchestrator_model
    
    def analyze_query_with_6stage_orchestrator(self, query: str, available_agents: List[Dict]) -> Dict:
        """Comprehensive 6-Stage Orchestrator LLM Analysis"""
        try:
            # Prepare comprehensive agent metadata for LLM analysis
            agent_summary = []
            for agent in available_agents:
                agent_summary.append({
                    'id': agent['id'],
                    'name': agent['name'],
                    'description': agent.get('description', ''),
                    'capabilities': agent.get('capabilities', []),
                    'tools': agent.get('tools', []),
                    'model': agent.get('model', 'unknown'),
                    'status': agent.get('status', 'active'),
                    'system_prompt': agent.get('system_prompt', ''),
                    'specialization': agent.get('description', '').lower()
                })
            
            # Create detailed agent configuration for comprehensive analysis
            agent_details = []
            for agent in agent_summary:
                capabilities = agent.get('capabilities', [])[:15]  # More capabilities for analysis
                tools = agent.get('tools', [])[:10]  # More tools for analysis
                system_prompt = agent.get('system_prompt', 'No system prompt available')
                if len(system_prompt) > 500:
                    system_prompt = system_prompt[:500] + "..."
                
                agent_details.append(f"""
AGENT: {agent['name']}
ID: {agent['id']}
DESCRIPTION: {agent['description']}
SYSTEM PROMPT: {system_prompt}
CAPABILITIES: {', '.join(capabilities) if capabilities else 'General assistance'}
TOOLS: {', '.join(tools) if tools else 'Standard tools'}
MODEL: {agent['model']}
STATUS: {agent['status']}
SPECIALIZATION: {agent['specialization']}
""")
                
            prompt = f"""Analyze this query and create an orchestration plan:

QUERY: "{query}"

AGENTS: {', '.join([agent['name'] for agent in agent_summary])}

For the query "{query}", determine:
1. What the user wants (intent, domain, complexity)
2. If this needs multiple agents working in sequence
3. Which agents should be used and in what order

JSON response:
{{
    "stage_1_query_analysis": {{
        "user_intent": "what user wants",
        "domain": "subject area",
        "complexity": "simple/moderate/complex",
        "required_expertise": "skills needed"
    }},
    "stage_2_sequence_definition": {{
        "workflow_steps": [
            {{"step": 1, "task": "first task", "required_expertise": "skills needed"}},
            {{"step": 2, "task": "second task", "required_expertise": "skills needed"}}
        ],
        "execution_flow": "how tasks should be executed"
    }},
    "stage_3_execution_strategy": {{
        "strategy": "single/sequential/parallel",
        "reasoning": "why this strategy"
    }},
    "stage_4_agent_analysis": {{
        "agent_evaluations": [
            {{"agent_name": "agent name", "suitability_score": 0.8, "reasoning": "why suitable"}}
        ]
    }},
    "stage_5_agent_matching": {{
        "selected_agents": [
            {{"agent_name": "Malaysia Agent", "execution_order": 1, "task_assignment": "teach about Malaysian food"}},
            {{"agent_name": "Singapore Agent", "execution_order": 2, "task_assignment": "help write poem about Singapore outdoor places"}}
        ],
        "matching_reasoning": "why these agents in this order"
    }},
    "stage_6_orchestration_plan": {{
        "final_strategy": "sequential",
        "agent_sequence": "Malaysia Agent then Singapore Agent",
        "confidence": 0.9
    }}
}}"""

            # Call LLM for comprehensive analysis
            logger.info(f"Calling 6-Stage Orchestrator LLM with model: {self.orchestrator_model}")
            logger.info(f"Prompt length: {len(prompt)} characters")
            
            # Retry mechanism for LLM calls
            max_retries = 2
            for attempt in range(max_retries + 1):
                try:
                    response = requests.post(
                        f"{self.ollama_base_url}/api/generate",
                        json={
                            "model": self.orchestrator_model,
                            "prompt": prompt,
                            "stream": False,
                            "options": {
                                "temperature": 0.2,  # Very low temperature for consistent analysis
                                "top_p": 0.9,
                                "max_tokens": 2000  # More tokens for comprehensive analysis
                            }
                        },
                        timeout=120  # 2 minutes timeout for qwen3:1.7b
                    )
                    break  # Success, exit retry loop
                except requests.exceptions.Timeout:
                    if attempt < max_retries:
                        logger.warning(f"LLM call timeout (attempt {attempt + 1}/{max_retries + 1}), retrying...")
                        time.sleep(5)  # Wait 5 seconds before retry
                        continue
                    else:
                        logger.error("LLM call failed after all retries due to timeout")
                        raise
                except Exception as e:
                    if attempt < max_retries:
                        logger.warning(f"LLM call error (attempt {attempt + 1}/{max_retries + 1}): {e}, retrying...")
                        time.sleep(5)
                        continue
                    else:
                        logger.error(f"LLM call failed after all retries: {e}")
                        raise
            
            logger.info(f"6-Stage Orchestrator LLM response status: {response.status_code}")
            
            if response.status_code == 200:
                logger.info("6-Stage Orchestrator analysis successful - processing response")
                result = response.json()
                llm_response = result.get('response', '').strip()
                
                # Parse LLM response
                try:
                    # Extract JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                    if json_match:
                        json_text = json_match.group()
                        
                        # Fix common JSON formatting issues
                        json_text = re.sub(r'(\d+)s\.(\d+)', r'\1.\2', json_text)  # Fix "0s.75" -> "0.75"
                        json_text = re.sub(r'(\d+)s(\d+)', r'\1.\2', json_text)    # Fix "0s75" -> "0.75"
                        json_text = re.sub(r'0+(\d+\.\d+)', r'\1', json_text)      # Fix "00.65" -> "0.65"
                        json_text = re.sub(r'(\d+)\.0+(\d+)', r'\1.\2', json_text) # Fix "1.00" -> "1.0"
                        
                        analysis = json.loads(json_text)
                        
                        # Debug: Log the comprehensive analysis
                        logger.info(f"6-Stage Orchestrator response: {llm_response[:300]}...")
                        logger.info(f"Analysis keys: {list(analysis.keys())}")
                        
                        # Process the 6-stage analysis
                        return self._process_6stage_analysis(analysis, agent_summary, query)
                    else:
                        logger.warning("No JSON found in 6-Stage Orchestrator response")
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse 6-Stage Orchestrator response: {e}")
                    logger.error(f"Raw response: {llm_response}")
                    
                    # Try to fix common JSON issues and retry
                    try:
                        if '```json' in llm_response:
                            json_start = llm_response.find('```json') + 7
                            json_end = llm_response.find('```', json_start)
                            if json_end > json_start:
                                json_content = llm_response[json_start:json_end].strip()
                                # Fix malformed JSON
                                json_content = self._fix_malformed_json(json_content)
                                analysis = json.loads(json_content)
                                logger.info("Successfully parsed JSON after cleanup")
                                return self._process_6stage_analysis(analysis, agent_summary, query)
                    except Exception as retry_e:
                        logger.error(f"Retry parsing also failed: {retry_e}")
            
            # No fallback - return error if 6-stage analysis fails
            logger.error(f"6-Stage Orchestrator analysis failed (status: {response.status_code}), no fallback available")
            raise Exception(f"6-Stage Orchestrator failed to generate valid JSON: {llm_response}")
            
        except Exception as e:
            logger.error(f"6-Stage Orchestrator analysis error: {e}")
            raise Exception(f"6-Stage Orchestrator completely failed: {e}")
    
    def _process_6stage_analysis(self, analysis: Dict, agent_summary: List[Dict], query: str) -> Dict:
        """Process the 6-stage analysis from LLM"""
        try:
            # Extract each stage
            stage_1 = analysis.get('stage_1_query_analysis', {})
            stage_2 = analysis.get('stage_2_sequence_definition', {})
            stage_3 = analysis.get('stage_3_execution_strategy', {})
            stage_4 = analysis.get('stage_4_agent_analysis', {})
            stage_5 = analysis.get('stage_5_agent_matching', {})
            stage_6 = analysis.get('stage_6_orchestration_plan', {})
            
            # Log comprehensive analysis
            logger.info(f"Stage 1 - Query Analysis: {stage_1.get('user_intent', 'N/A')}")
            
            # Handle stage_2 which might be a list or dict
            if isinstance(stage_2, list):
                logger.info(f"Stage 2 - Sequence: {len(stage_2)} steps")
                workflow_steps = stage_2
            else:
                logger.info(f"Stage 2 - Sequence: {len(stage_2.get('workflow_steps', []))} steps")
                workflow_steps = stage_2.get('workflow_steps', [])
            
            logger.info(f"Stage 3 - Strategy: {stage_3.get('strategy', 'N/A')}")
            # Handle stage_4 which might be a list or dict
            if isinstance(stage_4, list):
                logger.info(f"Stage 4 - Agents: {len(stage_4)} evaluated")
            else:
                logger.info(f"Stage 4 - Agents: {len(stage_4.get('agent_evaluations', []))} evaluated")
            logger.info(f"Stage 5 - Matching: {len(stage_5.get('selected_agents', []))} selected")
            logger.info(f"Stage 6 - Plan: {stage_6.get('final_strategy', 'N/A')} orchestration")
            
            # Process agent evaluations - handle case where stage_4 might be a list
            agent_evaluations = []
            if isinstance(stage_4, list):
                agent_evaluations_list = stage_4
            else:
                agent_evaluations_list = stage_4.get('agent_evaluations', [])
                
            for llm_eval in agent_evaluations_list:
                # Handle case where llm_eval might be a list instead of dict
                if isinstance(llm_eval, list):
                    logger.warning(f"Skipping list item in agent_evaluations: {llm_eval}")
                    continue
                if not isinstance(llm_eval, dict):
                    logger.warning(f"Skipping non-dict item in agent_evaluations: {type(llm_eval)}")
                    continue
                    
                agent_name = llm_eval.get('agent_name', '')
                # Find matching agent in our summary
                matching_agent = next((a for a in agent_summary if a['name'] == agent_name), None)
                if matching_agent:
                    agent_evaluations.append({
                        "agent_id": matching_agent['id'],
                        "agent_name": agent_name,
                        "primary_expertise": matching_agent.get('description', ''),
                        "capabilities_assessment": llm_eval.get('capability_analysis', f"Can help with {stage_1.get('domain', 'general')} tasks"),
                        "tools_analysis": llm_eval.get('tools_analysis', f"Tools enable {stage_1.get('domain', 'general')} assistance"),
                        "system_prompt_analysis": llm_eval.get('role_analysis', f"Agent specializes in {matching_agent.get('description', 'general assistance')}"),
                        "expertise_match": llm_eval.get('expertise_match', 'Moderate match'),
                        "reasoning": llm_eval.get('reasoning', 'No detailed reasoning provided'),
                        "suitability_score": llm_eval.get('suitability_score', 0.5),
                        "strengths": llm_eval.get('strengths', 'General capabilities'),
                        "limitations": llm_eval.get('limitations', 'None identified')
                    })
            
            # Process selected agents
            selected_agents = stage_5.get('selected_agents', [])
            selected_agent_id = None
            if selected_agents and len(selected_agents) > 0:
                try:
                    first_agent = selected_agents[0]
                    # Handle case where first_agent might be a list instead of dict
                    if isinstance(first_agent, dict):
                        first_agent_name = first_agent.get('agent_name', '')
                    elif isinstance(first_agent, str):
                        first_agent_name = first_agent
                    else:
                        first_agent_name = str(first_agent)
                        
                    for agent in agent_summary:
                        if agent['name'] in first_agent_name or first_agent_name in agent['name']:
                            selected_agent_id = agent['id']
                            break
                except Exception as e:
                    logger.warning(f"Error processing selected agents: {e}")
                    selected_agent_id = None
            
            if not selected_agent_id and agent_summary:
                selected_agent_id = agent_summary[0]['id']
                logger.warning(f"Could not match selected agent, using fallback: {selected_agent_id}")
            
            # Convert to expected format with 6-stage analysis
            structured_analysis = {
                'stage_1_query_analysis': {
                    'user_intent': stage_1.get('user_intent', 'N/A'),
                    'domain': stage_1.get('domain', 'N/A'),
                    'complexity': stage_1.get('complexity', 'moderate'),
                    'required_expertise': stage_1.get('required_expertise', 'N/A'),
                    'query_type': stage_1.get('query_type', 'general'),
                    'scope': stage_1.get('scope', 'general'),
                    'context_reasoning': stage_1.get('context_reasoning', f"6-Stage analysis: {stage_1.get('user_intent', 'N/A')}"),
                    'dependencies': stage_1.get('dependencies', 'None identified')
                },
                'stage_2_sequence_definition': {
                    'workflow_steps': workflow_steps,
                    'execution_flow': stage_2.get('execution_flow', 'Standard execution') if isinstance(stage_2, dict) else 'Sequential execution',
                    'handoff_points': stage_2.get('handoff_points', 'No handoffs required') if isinstance(stage_2, dict) else 'Between sequential steps',
                    'parallel_opportunities': stage_2.get('parallel_opportunities', 'None identified') if isinstance(stage_2, dict) else 'Sequential only'
                },
                'stage_3_execution_strategy': {
                    'strategy': stage_3.get('strategy', 'single'),
                    'reasoning': stage_3.get('reasoning', 'Standard execution strategy'),
                    'complexity_assessment': stage_3.get('complexity_assessment', 'moderate'),
                    'estimated_duration': stage_3.get('estimated_duration', 'unknown'),
                    'resource_requirements': stage_3.get('resource_requirements', 'standard')
                },
                'stage_4_agent_analysis': {
                    'agent_evaluations': agent_evaluations
                },
                'stage_5_agent_matching': {
                    'selected_agents': selected_agents,
                    'matching_reasoning': stage_5.get('matching_reasoning', 'Agent selected based on capabilities'),
                    'execution_plan': stage_5.get('execution_plan', 'Standard execution plan'),
                    'context_flow': stage_5.get('context_flow', 'Direct context passing')
                },
                'stage_6_orchestration_plan': {
                    'final_strategy': stage_6.get('final_strategy', 'single'),
                    'agent_sequence': stage_6.get('agent_sequence', 'Single agent execution'),
                    'context_passing_strategy': stage_6.get('context_passing_strategy', 'Direct passing'),
                    'synthesis_approach': stage_6.get('synthesis_approach', 'Standard synthesis'),
                    'success_criteria': stage_6.get('success_criteria', 'Task completion'),
                    'confidence': stage_6.get('confidence', 0.95),
                    'fallback_plan': stage_6.get('fallback_plan', 'Use single agent')
                },
                'stage_2_agent_analysis': {  # Legacy compatibility
                    'agent_evaluations': agent_evaluations
                },
                'stage_3_contextual_matching': {  # Legacy compatibility
                    'selected_agent_id': selected_agent_id,
                    'matching_reasoning': stage_5.get('matching_reasoning', f"6-Stage orchestrator selected agents for this task"),
                    'confidence': stage_6.get('confidence', 0.95),
                    'alternative_agents': [agent['name'] for agent in agent_summary if agent['id'] != selected_agent_id],
                    'match_quality': 'excellent' if stage_6.get('confidence', 0.95) > 0.8 else 'good',
                    'execution_strategy': stage_6.get('final_strategy', 'single')
                }
            }
            
            return structured_analysis
            
        except Exception as e:
            logger.error(f"Error processing 6-stage analysis: {e}")
            logger.error(f"Analysis data: {analysis}")
            logger.error(f"Agent summary: {agent_summary}")
            return self._fallback_6stage_analysis(query, agent_summary)
    
    def _fallback_6stage_analysis(self, query: str, agent_summary: List[Dict]) -> Dict:
        """Fallback analysis when 6-stage orchestrator fails"""
        query_lower = query.lower()
        
        # Enhanced execution strategy detection
        execution_strategy = "single"
        sequential_keywords = ['then', 'after', 'next', 'followed by', 'step by step', 'first', 'second', 'third', 'finally']
        parallel_keywords = ['simultaneously', 'at the same time', 'multiple', 'various', 'different', 'and also', 'while', 'during']
        
        is_sequential = any(keyword in query_lower for keyword in sequential_keywords)
        is_parallel = any(keyword in query_lower for keyword in parallel_keywords)
        
        if is_sequential:
            execution_strategy = "sequential"
        elif is_parallel:
            execution_strategy = "parallel"
        
        # Enhanced agent selection for sequential execution
        best_agent = agent_summary[0] if agent_summary else None
        if not best_agent:
            return {}
        
        # For sequential execution, try to select multiple agents
        selected_agents = []
        if execution_strategy == "sequential" and len(agent_summary) > 1:
            # Look for Malaysia and Singapore agents specifically
            malaysia_agent = next((a for a in agent_summary if 'malaysia' in a['name'].lower()), None)
            singapore_agent = next((a for a in agent_summary if 'singapore' in a['name'].lower()), None)
            
            if malaysia_agent and singapore_agent:
                selected_agents = [malaysia_agent, singapore_agent]
                logger.info(f"Fallback: Selected sequential agents: {[a['name'] for a in selected_agents]}")
            else:
                # Use first two agents if available
                selected_agents = agent_summary[:2]
                logger.info(f"Fallback: Using first two agents: {[a['name'] for a in selected_agents]}")
        else:
            selected_agents = [best_agent]
        
        return {
            'stage_1_query_analysis': {
                'user_intent': f"User wants to {query_lower}",
                'domain': 'general',
                'complexity': 'moderate',
                'required_expertise': 'general expertise',
                'query_type': 'general',
                'scope': 'general',
                'context_reasoning': f"Fallback analysis: {query[:100]}...",
                'dependencies': 'None identified'
            },
            'stage_2_sequence_definition': {
                'workflow_steps': [{'step': 1, 'task': 'Process query', 'required_expertise': 'general', 'dependencies': 'none', 'output': 'Response'}],
                'execution_flow': 'Single step execution',
                'handoff_points': 'No handoffs required',
                'parallel_opportunities': 'None identified'
            },
            'stage_3_execution_strategy': {
                'strategy': execution_strategy,
                'reasoning': f'Detected {execution_strategy} execution based on keywords',
                'complexity_assessment': 'simple',
                'estimated_duration': 'short',
                'resource_requirements': 'minimal'
            },
            'stage_4_agent_analysis': {
                'agent_evaluations': [{
                    'agent_id': best_agent['id'],
                    'agent_name': best_agent['name'],
                    'primary_expertise': best_agent.get('description', ''),
                    'capabilities_assessment': 'General assistance capabilities',
                    'tools_analysis': 'Standard tools available',
                    'system_prompt_analysis': f"Agent specializes in {best_agent.get('description', 'general assistance')}",
                    'expertise_match': 'Good match',
                    'reasoning': 'Fallback selection',
                    'suitability_score': 0.7,
                    'strengths': 'General capabilities',
                    'limitations': 'None identified'
                }]
            },
            'stage_5_agent_matching': {
                'selected_agents': [
                    {
                        'agent_name': agent['name'], 
                        'agent_id': agent['id'],
                        'execution_order': i + 1, 
                        'task_assignment': f'Step {i + 1}: Process query part {i + 1}', 
                        'context_requirements': 'Query and previous context', 
                        'handoff_requirements': 'Pass results to next agent' if i < len(selected_agents) - 1 else 'Final response', 
                        'expected_output': f'Response for step {i + 1}'
                    } for i, agent in enumerate(selected_agents)
                ],
                'matching_reasoning': f'Fallback selection of {len(selected_agents)} agents: {[a["name"] for a in selected_agents]}',
                'execution_plan': f'{execution_strategy} execution with {len(selected_agents)} agents',
                'context_flow': 'Sequential context passing' if execution_strategy == 'sequential' else 'Direct execution'
            },
            'stage_6_orchestration_plan': {
                'final_strategy': execution_strategy,
                'agent_sequence': f"{' -> '.join([a['name'] for a in selected_agents])}" if len(selected_agents) > 1 else 'Single agent execution',
                'context_passing_strategy': 'Sequential context passing' if execution_strategy == 'sequential' else 'Direct passing',
                'synthesis_approach': 'Multi-agent synthesis' if len(selected_agents) > 1 else 'Standard synthesis',
                'success_criteria': 'Task completion',
                'confidence': 0.7,
                'fallback_plan': f'Use {len(selected_agents)} agents in {execution_strategy} execution'
            },
            'stage_2_agent_analysis': {  # Legacy compatibility
                'agent_evaluations': []
            },
            'stage_3_contextual_matching': {  # Legacy compatibility
                'selected_agent_id': best_agent['id'],
                'matching_reasoning': f'Fallback selection of {best_agent["name"]}',
                'confidence': 0.7,
                'alternative_agents': [agent['name'] for agent in agent_summary if agent['id'] != best_agent['id']],
                'match_quality': 'good',
                'execution_strategy': execution_strategy
            }
        }
    
    def _fix_malformed_json(self, json_text: str) -> str:
        """Fix common malformed JSON issues from LLM responses"""
        try:
            import re
            
            # Remove any text before the first {
            json_text = re.sub(r'^[^{]*', '', json_text)
            
            # Fix unquoted keys like "agent_name0":"Creative Assistant"
            json_text = re.sub(r'"([^"]*\d+)"\s*:', r'"\1":', json_text)
            
            # Fix malformed complexity field with extra text
            json_text = re.sub(r'"complexity":\s*"([^"]*)"\s+as\s+[^,]*', r'"complexity": "\1"', json_text)
            
            # Fix malformed reasoning field at end
            json_text = re.sub(r'"confidence":\s*([^,}]*),\s*reasoning:\s*([^"]*)"', r'"confidence": \1, "reasoning": "\2"', json_text)
            
            # Fix the specific issue: {"step01: text", "task": null, "execution_flow": ""}
            json_text = re.sub(r'{"step(\d+):\s*([^"]*(?:"[^"]*")*[^"]*?)",\s*"task":\s*null', 
                             r'{"step": \1, "description": "\2", "task": null', json_text)
            
            # Fix other malformed step entries
            json_text = re.sub(r'{"step(\d+):\s*([^"]+)"', r'{"step": \1, "description": "\2"', json_text)
            
            # Remove trailing commas before closing braces
            json_text = re.sub(r',\s*}', '}', json_text)
            json_text = re.sub(r',\s*]', ']', json_text)
            
            # Fix any remaining control characters
            json_text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', json_text)
            
            return json_text
        except Exception as e:
            logger.warning(f"JSON cleanup failed: {e}")
            return json_text
