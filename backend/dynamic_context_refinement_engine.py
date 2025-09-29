#!/usr/bin/env python3
"""
Dynamic Context Refinement Engine
Systematic, intelligent context management for A2A orchestration
"""

import requests
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
from text_cleaning_service import text_cleaning_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContextType(Enum):
    """Types of context in the A2A flow"""
    INITIAL_QUERY = "initial_query"
    AGENT_OUTPUT = "agent_output"
    REFINED_CONTEXT = "refined_context"
    HANDOFF_CONTEXT = "handoff_context"
    FINAL_SYNTHESIS = "final_synthesis"

class RefinementStrategy(Enum):
    """Context refinement strategies"""
    EXTRACT_KEY_INFO = "extract_key_info"
    FOCUS_ON_TASK = "focus_on_task"
    SIMPLIFY_COMPLEX = "simplify_complex"
    ENRICH_MINIMAL = "enrich_minimal"
    ADAPTIVE = "adaptive"

@dataclass
class ContextMetadata:
    """Metadata for context tracking"""
    context_type: ContextType
    source_agent: str
    target_agent: str
    refinement_strategy: RefinementStrategy
    original_length: int
    refined_length: int
    quality_score: float
    timestamp: str

@dataclass
class AgentCapability:
    """Agent capability profile"""
    agent_id: str
    agent_name: str
    primary_capabilities: List[str]
    tools: List[str]
    context_preferences: Dict[str, Any]
    max_context_length: int
    preferred_context_format: str

class DynamicContextRefinementEngine:
    """
    Systematic, dynamic context refinement engine for A2A orchestration
    
    Flow:
    1. Context Analysis - Understand what we have
    2. Strategy Selection - Choose refinement approach
    3. Context Refinement - Apply intelligent refinement
    4. Quality Assessment - Evaluate refinement quality
    5. Adaptive Learning - Improve future refinements
    """
    
    def __init__(self):
        self.strands_sdk_url = "http://localhost:5006"
        self.context_history: List[ContextMetadata] = []
        self.agent_capabilities: Dict[str, AgentCapability] = {}
        self.refinement_patterns: Dict[str, Any] = {}
        
    def register_agent_capability(self, agent: Dict[str, Any]) -> None:
        """Register agent capabilities for intelligent context refinement"""
        capability = AgentCapability(
            agent_id=agent['id'],
            agent_name=agent['name'],
            primary_capabilities=agent.get('capabilities', []),
            tools=agent.get('tools', []),
            context_preferences=agent.get('context_preferences', {}),
            max_context_length=agent.get('max_context_length', 1000),
            preferred_context_format=agent.get('preferred_context_format', 'structured')
        )
        self.agent_capabilities[agent['id']] = capability
        logger.info(f"Registered agent capability: {agent['name']}")
    
    def analyze_context(self, context: str, context_type: ContextType, 
                       source_agent: str = None) -> Dict[str, Any]:
        """
        Analyze context to understand its characteristics and requirements
        """
        try:
            analysis_prompt = f"""Analyze this context for A2A orchestration:

Context Type: {context_type.value}
Source Agent: {source_agent or 'Orchestrator'}
Context Length: {len(context)} characters

Context:
{context}

Provide a JSON analysis with:
{{
    "complexity_score": 0.0-1.0,
    "information_density": 0.0-1.0,
    "key_information": ["key1", "key2"],
    "redundant_content": ["redundant1", "redundant2"],
    "missing_context": ["missing1", "missing2"],
    "context_quality": 0.0-1.0,
    "refinement_needed": true/false,
    "recommended_strategy": "extract_key_info|focus_on_task|simplify_complex|enrich_minimal|adaptive"
}}"""

            response = requests.post(
                f"{self.strands_sdk_url}/api/query",
                json={
                    "query": analysis_prompt,
                    "model": "qwen3:1.7b",
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_analysis = result.get('response', '')
                
                # Clean and parse analysis
                cleaned_analysis = text_cleaning_service.clean_llm_output(raw_analysis, "analysis")
                
                try:
                    import re
                    json_match = re.search(r'\{.*\}', cleaned_analysis, re.DOTALL)
                    if json_match:
                        analysis_data = json.loads(json_match.group())
                        return analysis_data
                    else:
                        raise Exception("No JSON found in analysis")
                except json.JSONDecodeError:
                    # Fallback analysis
                    return {
                        "complexity_score": 0.5,
                        "information_density": 0.5,
                        "key_information": [],
                        "redundant_content": [],
                        "missing_context": [],
                        "context_quality": 0.5,
                        "refinement_needed": True,
                        "recommended_strategy": "adaptive"
                    }
            else:
                raise Exception(f"Context analysis failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Context analysis error: {e}")
            return {
                "complexity_score": 0.5,
                "information_density": 0.5,
                "key_information": [],
                "redundant_content": [],
                "missing_context": [],
                "context_quality": 0.5,
                "refinement_needed": True,
                "recommended_strategy": "adaptive"
            }
    
    def select_refinement_strategy(self, context_analysis: Dict[str, Any], 
                                 target_agent: AgentCapability) -> RefinementStrategy:
        """
        Select the best refinement strategy based on context analysis and target agent
        """
        try:
            complexity_score = context_analysis.get('complexity_score', 0.5)
            information_density = context_analysis.get('information_density', 0.5)
            context_quality = context_analysis.get('context_quality', 0.5)
            
            # Strategy selection logic
            if complexity_score > 0.8:
                return RefinementStrategy.SIMPLIFY_COMPLEX
            elif information_density < 0.3:
                return RefinementStrategy.ENRICH_MINIMAL
            elif context_quality < 0.4:
                return RefinementStrategy.EXTRACT_KEY_INFO
            elif target_agent.max_context_length < len(context_analysis.get('context', '')):
                return RefinementStrategy.FOCUS_ON_TASK
            else:
                return RefinementStrategy.ADAPTIVE
                
        except Exception as e:
            logger.error(f"Strategy selection error: {e}")
            return RefinementStrategy.ADAPTIVE
    
    def refine_context(self, context: str, context_type: ContextType,
                      source_agent: str, target_agent: AgentCapability,
                      strategy: RefinementStrategy, session_id: str) -> Tuple[str, ContextMetadata]:
        """
        Refine context using the selected strategy
        """
        try:
            logger.info(f"[{session_id}] Refining context using strategy: {strategy.value}")
            
            # Create strategy-specific refinement prompt
            refinement_prompt = self._create_refinement_prompt(
                context, context_type, source_agent, target_agent, strategy
            )
            
            # Call LLM for refinement
            response = requests.post(
                f"{self.strands_sdk_url}/api/query",
                json={
                    "query": refinement_prompt,
                    "model": "qwen3:1.7b",
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_refinement = result.get('response', '')
                
                # Clean refinement output
                refined_context = text_cleaning_service.clean_llm_output(
                    raw_refinement, "refined_context"
                )
                
                # Create metadata
                metadata = ContextMetadata(
                    context_type=context_type,
                    source_agent=source_agent,
                    target_agent=target_agent.agent_name,
                    refinement_strategy=strategy,
                    original_length=len(context),
                    refined_length=len(refined_context),
                    quality_score=self._assess_refinement_quality(context, refined_context),
                    timestamp=json.dumps({"timestamp": "2025-09-24T21:00:00Z"})
                )
                
                # Store in history
                self.context_history.append(metadata)
                
                logger.info(f"[{session_id}] Context refined: {len(context)} -> {len(refined_context)} chars")
                return refined_context, metadata
                
            else:
                raise Exception(f"Context refinement failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"[{session_id}] Context refinement error: {e}")
            # Fallback to cleaned context
            cleaned_context = text_cleaning_service.clean_llm_output(context, "fallback")
            metadata = ContextMetadata(
                context_type=context_type,
                source_agent=source_agent,
                target_agent=target_agent.agent_name,
                refinement_strategy=strategy,
                original_length=len(context),
                refined_length=len(cleaned_context),
                quality_score=0.5,
                timestamp=json.dumps({"timestamp": "2025-09-24T21:00:00Z"})
            )
            return cleaned_context, metadata
    
    def _create_refinement_prompt(self, context: str, context_type: ContextType,
                                source_agent: str, target_agent: AgentCapability,
                                strategy: RefinementStrategy) -> str:
        """Create strategy-specific refinement prompt"""
        
        base_prompt = f"""You are an A2A Context Refinement Engine. Refine the context for optimal handoff.

Context Type: {context_type.value}
Source Agent: {source_agent}
Target Agent: {target_agent.agent_name}
Target Agent Capabilities: {', '.join(target_agent.primary_capabilities)}
Target Agent Tools: {', '.join(target_agent.tools)}
Max Context Length: {target_agent.max_context_length}
Preferred Format: {target_agent.preferred_context_format}

Original Context:
{context}

Refinement Strategy: {strategy.value}

"""
        
        if strategy == RefinementStrategy.EXTRACT_KEY_INFO:
            return base_prompt + """
Extract only the key information needed for the target agent:
1. Identify the essential facts/results
2. Remove redundant explanations
3. Focus on actionable information
4. Keep it concise and clear

Refined Context:"""
        
        elif strategy == RefinementStrategy.FOCUS_ON_TASK:
            return base_prompt + """
Focus the context on the specific task the target agent needs to perform:
1. Identify the core task requirements
2. Provide relevant context for that task
3. Remove irrelevant information
4. Structure for task execution

Refined Context:"""
        
        elif strategy == RefinementStrategy.SIMPLIFY_COMPLEX:
            return base_prompt + """
Simplify complex context for better understanding:
1. Break down complex information
2. Use simpler language
3. Remove technical jargon
4. Make it more accessible

Refined Context:"""
        
        elif strategy == RefinementStrategy.ENRICH_MINIMAL:
            return base_prompt + """
Enrich minimal context with necessary details:
1. Add missing context
2. Provide background information
3. Clarify ambiguous points
4. Ensure completeness

Refined Context:"""
        
        else:  # ADAPTIVE
            return base_prompt + """
Adaptively refine the context based on the target agent's needs:
1. Analyze what the target agent needs
2. Adapt the context format and content
3. Optimize for the agent's capabilities
4. Ensure maximum effectiveness

Refined Context:"""
    
    def _assess_refinement_quality(self, original: str, refined: str) -> float:
        """Assess the quality of context refinement"""
        try:
            # Simple quality metrics
            length_ratio = len(refined) / len(original) if len(original) > 0 else 1.0
            information_preservation = 0.8  # Placeholder - could be more sophisticated
            
            # Quality score (0.0 - 1.0)
            quality_score = min(1.0, information_preservation * (1.0 - abs(length_ratio - 0.5)))
            return quality_score
            
        except Exception as e:
            logger.error(f"Quality assessment error: {e}")
            return 0.5
    
    def get_refinement_statistics(self) -> Dict[str, Any]:
        """Get statistics about context refinements"""
        if not self.context_history:
            return {"total_refinements": 0}
        
        total_refinements = len(self.context_history)
        avg_quality = sum(m.quality_score for m in self.context_history) / total_refinements
        avg_length_reduction = sum(m.original_length - m.refined_length for m in self.context_history) / total_refinements
        
        strategy_counts = {}
        for metadata in self.context_history:
            strategy = metadata.refinement_strategy.value
            strategy_counts[strategy] = strategy_counts.get(strategy, 0) + 1
        
        return {
            "total_refinements": total_refinements,
            "average_quality_score": avg_quality,
            "average_length_reduction": avg_length_reduction,
            "strategy_distribution": strategy_counts,
            "recent_refinements": [
                {
                    "source": m.source_agent,
                    "target": m.target_agent,
                    "strategy": m.refinement_strategy.value,
                    "quality": m.quality_score,
                    "length_change": m.refined_length - m.original_length
                }
                for m in self.context_history[-5:]  # Last 5 refinements
            ]
        }
    
    def process_context_handoff(self, context: str, context_type: ContextType,
                              source_agent: str, target_agent_id: str, 
                              session_id: str) -> Tuple[str, ContextMetadata]:
        """
        Main entry point for context handoff processing
        """
        try:
            # Get target agent capabilities
            target_agent = self.agent_capabilities.get(target_agent_id)
            if not target_agent:
                logger.warning(f"[{session_id}] Unknown target agent: {target_agent_id}")
                # Create default capability
                target_agent = AgentCapability(
                    agent_id=target_agent_id,
                    agent_name=target_agent_id,
                    primary_capabilities=[],
                    tools=[],
                    context_preferences={},
                    max_context_length=1000,
                    preferred_context_format="structured"
                )
            
            # Analyze context
            context_analysis = self.analyze_context(context, context_type, source_agent)
            
            # Select refinement strategy
            strategy = self.select_refinement_strategy(context_analysis, target_agent)
            
            # Refine context
            refined_context, metadata = self.refine_context(
                context, context_type, source_agent, target_agent, strategy, session_id
            )
            
            return refined_context, metadata
            
        except Exception as e:
            logger.error(f"[{session_id}] Context handoff processing error: {e}")
            # Fallback to basic cleaning
            cleaned_context = text_cleaning_service.clean_llm_output(context, "fallback")
            metadata = ContextMetadata(
                context_type=context_type,
                source_agent=source_agent,
                target_agent=target_agent_id,
                refinement_strategy=RefinementStrategy.ADAPTIVE,
                original_length=len(context),
                refined_length=len(cleaned_context),
                quality_score=0.5,
                timestamp=json.dumps({"timestamp": "2025-09-24T21:00:00Z"})
            )
            return cleaned_context, metadata

# Global instance
dynamic_context_engine = DynamicContextRefinementEngine()
