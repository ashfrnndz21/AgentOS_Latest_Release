#!/usr/bin/env python3
"""
Contextual Query Analyzer
Step-by-step LLM orchestrator that performs:
1. Contextual reasoning of the query
2. Domain identification (single or multiple)
3. Task type classification (sequential, direct, parallel)
4. Step-by-step sequence definition
"""

import json
import requests
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class ContextualQueryAnalyzer:
    """Step-by-step contextual query analyzer for intelligent orchestration"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", model: str = "qwen3:1.7b"):
        self.ollama_base_url = ollama_base_url
        self.model = model
    
    def analyze_query_contextually(self, query: str, available_agents: List[Dict] = None) -> Dict:
        """
        Perform comprehensive contextual analysis of the query
        
        Args:
            query: User's input query
            available_agents: List of available agents (optional for context)
            
        Returns:
            Dict containing detailed analysis results
        """
        try:
            logger.info(f"Starting contextual analysis for query: {query[:50]}...")
            
            # Step 1: Contextual Reasoning
            contextual_reasoning = self._analyze_contextual_reasoning(query)
            
            # Step 2: Domain Identification
            domain_analysis = self._analyze_domains(query)
            
            # Step 3: Task Type Classification
            task_classification = self._classify_task_type(query, contextual_reasoning, domain_analysis)
            
            # Step 4: Sequence Definition
            sequence_definition = self._define_execution_sequence(query, task_classification, domain_analysis)
            
            # Step 5: Agent Requirements (if agents provided)
            agent_requirements = None
            if available_agents:
                agent_requirements = self._analyze_agent_requirements(query, available_agents, task_classification)
            
            # Compile comprehensive analysis
            analysis_result = {
                "success": True,
                "timestamp": datetime.now().isoformat(),
                "query": query,
                "step_1_contextual_reasoning": contextual_reasoning,
                "step_2_domain_analysis": domain_analysis,
                "step_3_task_classification": task_classification,
                "step_4_sequence_definition": sequence_definition,
                "step_5_agent_requirements": agent_requirements,
                "orchestration_summary": {
                    "complexity_level": contextual_reasoning.get("complexity_level", "unknown"),
                    "primary_domain": domain_analysis.get("primary_domain", "unknown"),
                    "task_type": task_classification.get("task_type", "unknown"),
                    "estimated_steps": len(sequence_definition.get("execution_steps", [])),
                    "requires_multiple_agents": task_classification.get("requires_multiple_agents", False)
                }
            }
            
            logger.info(f"Contextual analysis completed successfully")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in contextual analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _analyze_contextual_reasoning(self, query: str) -> Dict:
        """Step 1: Deep contextual reasoning of the query"""
        prompt = f"""Analyze this query with deep contextual reasoning:

QUERY: "{query}"

Provide a comprehensive analysis covering:

1. USER INTENT: What does the user actually want to achieve?
2. CONTEXT CLUES: What implicit information can be inferred?
3. COMPLEXITY LEVEL: Simple, Moderate, or Complex?
4. URGENCY: How time-sensitive is this request?
5. DEPENDENCIES: What other information or steps might be needed?
6. SUCCESS CRITERIA: How will we know when this is complete?
7. POTENTIAL CHALLENGES: What could make this difficult?

Respond in JSON format:
{{
    "user_intent": "clear description of what user wants",
    "context_clues": ["clue1", "clue2", "clue3"],
    "complexity_level": "simple|moderate|complex",
    "urgency": "low|medium|high",
    "dependencies": ["dependency1", "dependency2"],
    "success_criteria": "how to measure completion",
    "potential_challenges": ["challenge1", "challenge2"],
    "reasoning_confidence": 0.85
}}"""

        return self._call_llm(prompt, "contextual_reasoning")
    
    def _analyze_domains(self, query: str) -> Dict:
        """Step 2: Identify domain(s) of the query"""
        prompt = f"""Identify the domain(s) and subject areas for this query:

QUERY: "{query}"

Analyze and identify:

1. PRIMARY DOMAIN: The main subject area
2. SECONDARY DOMAINS: Additional related areas
3. CROSS_DOMAIN: Whether this spans multiple domains
4. TECHNICAL LEVEL: Beginner, Intermediate, Advanced, Expert
5. DOMAIN_SPECIFIC_TERMS: Key terminology used
6. REQUIRED_EXPERTISE: What expertise is needed

Available domains include:
- Software Development & Programming
- Data Science & Analytics
- System Administration & DevOps
- Business & Finance
- Research & Analysis
- Creative & Content
- Technical Support & Troubleshooting
- Scientific Computing
- Web Development
- Machine Learning & AI
- Database Management
- Security & Compliance
- Project Management
- Documentation & Communication

Respond in JSON format:
{{
    "primary_domain": "main domain",
    "secondary_domains": ["domain1", "domain2"],
    "cross_domain": true/false,
    "technical_level": "beginner|intermediate|advanced|expert",
    "domain_specific_terms": ["term1", "term2"],
    "required_expertise": ["expertise1", "expertise2"],
    "domain_confidence": 0.9
}}"""

        return self._call_llm(prompt, "domain_analysis")
    
    def _classify_task_type(self, query: str, contextual_reasoning: Dict, domain_analysis: Dict) -> Dict:
        """Step 3: Classify the task type (sequential, direct, parallel)"""
        prompt = f"""Classify the task type and execution strategy for this query:

QUERY: "{query}"

CONTEXTUAL REASONING: {json.dumps(contextual_reasoning, indent=2)}
DOMAIN ANALYSIS: {json.dumps(domain_analysis, indent=2)}

Determine the execution strategy:

1. TASK TYPE: 
   - DIRECT: Single action, immediate response
   - SEQUENTIAL: Multiple steps that must be done in order
   - PARALLEL: Multiple independent tasks that can run simultaneously
   - HYBRID: Mix of sequential and parallel elements

2. EXECUTION COMPLEXITY:
   - SIMPLE: Single agent can handle
   - MODERATE: May need multiple agents in sequence
   - COMPLEX: Requires coordination of multiple agents

3. COORDINATION REQUIREMENTS:
   - NONE: No coordination needed
   - LIGHT: Basic handoff between agents
   - HEAVY: Complex orchestration and communication

4. TIMING CONSTRAINTS:
   - IMMEDIATE: Needs quick response
   - BATCH: Can be processed in batches
   - STREAMING: Continuous processing

Respond in JSON format:
{{
    "task_type": "direct|sequential|parallel|hybrid",
    "execution_complexity": "simple|moderate|complex",
    "coordination_requirements": "none|light|heavy",
    "timing_constraints": "immediate|batch|streaming",
    "requires_multiple_agents": true/false,
    "estimated_agent_count": 1-5,
    "reasoning": "detailed explanation of classification",
    "confidence": 0.85
}}"""

        return self._call_llm(prompt, "task_classification")
    
    def _define_execution_sequence(self, query: str, task_classification: Dict, domain_analysis: Dict) -> Dict:
        """Step 4: Define the step-by-step execution sequence"""
        prompt = f"""Define the detailed execution sequence for this query:

QUERY: "{query}"

TASK CLASSIFICATION: {json.dumps(task_classification, indent=2)}
DOMAIN ANALYSIS: {json.dumps(domain_analysis, indent=2)}

Create a detailed step-by-step execution plan:

1. BREAK DOWN the query into specific, actionable steps
2. DEFINE the order and dependencies between steps
3. IDENTIFY what needs to be done at each step
4. SPECIFY the expected inputs and outputs for each step
5. DETERMINE if steps can be parallelized or must be sequential
6. ESTIMATE the time and resources needed for each step

Respond in JSON format:
{{
    "execution_steps": [
        {{
            "step_number": 1,
            "step_name": "descriptive name",
            "description": "what needs to be done",
            "required_inputs": ["input1", "input2"],
            "expected_outputs": ["output1", "output2"],
            "dependencies": ["step1", "step2"],
            "can_parallelize": true/false,
            "estimated_duration": "time estimate",
            "complexity": "low|medium|high",
            "required_expertise": ["expertise1", "expertise2"]
        }}
    ],
    "overall_sequence_type": "linear|branching|converging|diverging",
    "critical_path": ["step1", "step3", "step5"],
    "parallel_opportunities": ["step2+step4", "step6+step7"],
    "total_estimated_duration": "overall time estimate",
    "success_metrics": ["metric1", "metric2"]
}}"""

        return self._call_llm(prompt, "sequence_definition")
    
    def _analyze_agent_requirements(self, query: str, available_agents: List[Dict], task_classification: Dict) -> Dict:
        """Step 5: Analyze agent requirements and matching"""
        # Prepare agent summary for analysis
        agent_summary = []
        for agent in available_agents:
            agent_summary.append({
                'id': agent.get('id', 'unknown'),
                'name': agent.get('name', 'Unknown'),
                'description': agent.get('description', ''),
                'capabilities': agent.get('capabilities', []),
                'tools': agent.get('tools', []),
                'model': agent.get('model', 'unknown')
            })
        
        prompt = f"""Analyze agent requirements and matching for this query:

QUERY: "{query}"

TASK CLASSIFICATION: {json.dumps(task_classification, indent=2)}

AVAILABLE AGENTS:
{json.dumps(agent_summary, indent=2)}

Determine:

1. Which agents are best suited for this query
2. What order they should be used in (if sequential)
3. How they should coordinate (if parallel)
4. What specific capabilities are needed
5. Any gaps in current agent capabilities

Respond in JSON format:
{{
    "recommended_agents": [
        {{
            "agent_id": "agent_id",
            "agent_name": "agent_name",
            "suitability_score": 0.9,
            "role": "primary|secondary|support",
            "reasoning": "why this agent is suitable",
            "required_capabilities": ["cap1", "cap2"],
            "execution_order": 1
        }}
    ],
    "coordination_strategy": "sequential|parallel|hybrid",
    "capability_gaps": ["missing_capability1", "missing_capability2"],
    "optimization_suggestions": ["suggestion1", "suggestion2"],
    "confidence": 0.85
}}"""

        return self._call_llm(prompt, "agent_requirements")
    
    def _call_llm(self, prompt: str, analysis_type: str) -> Dict:
        """Call the LLM for analysis"""
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,  # Lower temperature for more consistent analysis
                        "top_p": 0.9,
                        "max_tokens": 2000
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '').strip()
                
                # Try to parse JSON response
                try:
                    # Extract JSON from response (handle cases where LLM adds extra text)
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_text = response_text[json_start:json_end]
                        return json.loads(json_text)
                    else:
                        # Fallback if no JSON found
                        return {
                            "error": "No valid JSON found in response",
                            "raw_response": response_text
                        }
                except json.JSONDecodeError as e:
                    return {
                        "error": f"JSON parsing error: {str(e)}",
                        "raw_response": response_text
                    }
            else:
                return {
                    "error": f"LLM call failed with status {response.status_code}",
                    "status_code": response.status_code
                }
                
        except Exception as e:
            logger.error(f"Error calling LLM for {analysis_type}: {e}")
            return {
                "error": str(e),
                "analysis_type": analysis_type
            }

# Example usage and testing
if __name__ == "__main__":
    analyzer = ContextualQueryAnalyzer()
    
    # Test query
    test_query = "I need to analyze customer data, create a predictive model, and generate a business report with recommendations"
    
    result = analyzer.analyze_query_contextually(test_query)
    print(json.dumps(result, indent=2))

