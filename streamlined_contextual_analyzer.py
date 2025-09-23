#!/usr/bin/env python3
"""
Streamlined Contextual Query Analyzer
Single LLM call for essential analysis:
1. User Intent (reasoning)
2. Domain Analysis
3. Agent Orchestration Pattern (sequential, direct, parallel)
"""

import json
import requests
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class StreamlinedContextualAnalyzer:
    """Streamlined contextual query analyzer - single LLM call"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", model: str = "qwen3:1.7b"):
        self.ollama_base_url = ollama_base_url
        self.model = model
    
    def analyze_query(self, query: str) -> Dict:
        """
        Perform streamlined contextual analysis with single LLM call
        
        Args:
            query: User's input query
            
        Returns:
            Dict containing essential analysis results
        """
        try:
            logger.info(f"Starting streamlined analysis for query: {query[:50]}...")
            
            # Single comprehensive analysis call
            analysis_result = self._analyze_comprehensive(query)
            
            result = {
                "success": True,
                "timestamp": datetime.now().isoformat(),
                "query": query,
                "user_intent": analysis_result.get("user_intent", ""),
                "domain_analysis": analysis_result.get("domain_analysis", {}),
                "orchestration_pattern": analysis_result.get("orchestration_pattern", "sequential")
            }
            
            logger.info("Streamlined analysis completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in streamlined analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "query": query
            }
    
    def _analyze_comprehensive(self, query: str) -> Dict:
        """Single comprehensive analysis call"""
        prompt = f"""Analyze this query and provide essential information:

QUERY: "{query}"

Provide ONLY a JSON response with these exact fields:

{{
    "user_intent": "Clear description of what the user wants to achieve",
    "domain_analysis": {{
        "primary_domain": "Main domain (e.g., Software Development, Data Analysis, etc.)",
        "technical_level": "beginner, intermediate, or advanced",
        "secondary_domains": ["List", "of", "related", "domains"]
    }},
    "orchestration_pattern": "sequential, direct, or parallel"
}}

Guidelines:
- user_intent: Be specific about the user's goal
- primary_domain: Choose the most relevant domain
- technical_level: Assess based on query complexity
- secondary_domains: List 2-3 related domains
- orchestration_pattern: 
  * "sequential" = requires step-by-step execution
  * "direct" = can be handled by single agent immediately  
  * "parallel" = can be split into independent tasks

Respond with ONLY the JSON, no other text."""

        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "max_tokens": 500
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get("response", "").strip()
                
                # Extract JSON from response
                try:
                    # Find JSON in response
                    start_idx = response_text.find('{')
                    end_idx = response_text.rfind('}') + 1
                    
                    if start_idx != -1 and end_idx > start_idx:
                        json_str = response_text[start_idx:end_idx]
                        analysis = json.loads(json_str)
                        return analysis
                    else:
                        # Fallback if no JSON found
                        return {
                            "user_intent": "Analysis failed - no JSON found",
                            "domain_analysis": {
                                "primary_domain": "Unknown",
                                "technical_level": "beginner",
                                "secondary_domains": []
                            },
                            "orchestration_pattern": "sequential"
                        }
                except json.JSONDecodeError as e:
                    logger.error(f"JSON decode error: {e}")
                    return {
                        "user_intent": f"Analysis failed - JSON error: {str(e)}",
                        "domain_analysis": {
                            "primary_domain": "Unknown",
                            "technical_level": "beginner", 
                            "secondary_domains": []
                        },
                        "orchestration_pattern": "sequential"
                    }
            else:
                logger.error(f"LLM API error: {response.status_code}")
                return {
                    "user_intent": "Analysis failed - API error",
                    "domain_analysis": {
                        "primary_domain": "Unknown",
                        "technical_level": "beginner",
                        "secondary_domains": []
                    },
                    "orchestration_pattern": "sequential"
                }
                
        except requests.exceptions.Timeout:
            logger.error("LLM request timed out")
            return {
                "user_intent": "Analysis failed - timeout",
                "domain_analysis": {
                    "primary_domain": "Unknown",
                    "technical_level": "beginner",
                    "secondary_domains": []
                },
                "orchestration_pattern": "sequential"
            }
        except Exception as e:
            logger.error(f"Error calling LLM: {e}")
            return {
                "user_intent": f"Analysis failed - {str(e)}",
                "domain_analysis": {
                    "primary_domain": "Unknown",
                    "technical_level": "beginner",
                    "secondary_domains": []
                },
                "orchestration_pattern": "sequential"
            }

