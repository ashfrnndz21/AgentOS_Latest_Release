#!/usr/bin/env python3
"""
Orchestration Formatter API
Provides intelligent formatting and interpretation of complete orchestration responses
"""

import requests
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Service URLs
ENHANCED_ORCHESTRATION_URL = "http://localhost:5014"
A2A_OBSERVABILITY_URL = "http://localhost:5018"
TEXT_CLEANING_URL = "http://localhost:5019"

class OrchestrationFormatter:
    """Intelligent formatter for orchestration responses"""
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.formatting_model = "qwen3:1.7b"
    
    def format_complete_orchestration(self, query: str, session_id: str = None) -> Dict[str, Any]:
        """
        Format complete orchestration with all stages, handoffs, and interpretations
        
        Args:
            query: Original user query
            session_id: Optional session ID to get specific orchestration data
        
        Returns:
            Complete formatted orchestration response
        """
        try:
            # Get orchestration data
            orchestration_data = self._get_orchestration_data(query, session_id)
            
            # Get handoff data
            handoff_data = self._get_handoff_data(session_id)
            
            # Get trace data
            trace_data = self._get_trace_data(session_id)
            
            # Create comprehensive formatting prompt
            formatting_prompt = self._create_comprehensive_formatting_prompt(
                query, orchestration_data, handoff_data, trace_data
            )
            
            # Call formatting LLM
            formatted_response = self._call_formatting_llm(formatting_prompt)
            
            return {
                "success": True,
                "query": query,
                "session_id": session_id,
                "formatted_response": formatted_response,
                "raw_data": {
                    "orchestration": orchestration_data,
                    "handoffs": handoff_data,
                    "traces": trace_data
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error formatting orchestration: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _get_orchestration_data(self, query: str, session_id: str = None) -> Dict[str, Any]:
        """Get orchestration data from Enhanced Orchestration API"""
        try:
            if session_id:
                # Get specific session data (if available)
                response = requests.get(f"{ENHANCED_ORCHESTRATION_URL}/api/enhanced-orchestration/session/{session_id}")
                if response.status_code == 200:
                    return response.json()
            
            # Execute new orchestration
            response = requests.post(
                f"{ENHANCED_ORCHESTRATION_URL}/api/enhanced-orchestration/query",
                json={"query": query},
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get orchestration data: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error getting orchestration data: {e}")
            return {}
    
    def _get_handoff_data(self, session_id: str = None) -> List[Dict[str, Any]]:
        """Get handoff data from A2A Observability API"""
        try:
            response = requests.get(f"{A2A_OBSERVABILITY_URL}/api/a2a-observability/handoffs")
            
            if response.status_code == 200:
                data = response.json()
                handoffs = data.get('handoffs', [])
                
                # Filter by session_id if provided
                if session_id:
                    handoffs = [h for h in handoffs if h.get('session_id') == session_id]
                
                return handoffs
            else:
                logger.error(f"Failed to get handoff data: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting handoff data: {e}")
            return []
    
    def _get_trace_data(self, session_id: str = None) -> List[Dict[str, Any]]:
        """Get trace data from A2A Observability API"""
        try:
            response = requests.get(f"{A2A_OBSERVABILITY_URL}/api/a2a-observability/traces")
            
            if response.status_code == 200:
                data = response.json()
                traces = data.get('traces', [])
                
                # Filter by session_id if provided
                if session_id:
                    traces = [t for t in traces if t.get('session_id') == session_id]
                
                return traces
            else:
                logger.error(f"Failed to get trace data: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting trace data: {e}")
            return []
    
    def _create_comprehensive_formatting_prompt(self, query: str, orchestration_data: Dict[str, Any], 
                                              handoff_data: List[Dict[str, Any]], trace_data: List[Dict[str, Any]]) -> str:
        """Create comprehensive formatting prompt"""
        
        return f"""You are an AI Orchestration Response Formatter. Create a beautifully structured, comprehensive response from this complete orchestration data.

ORIGINAL QUERY: {query}

6-STAGE ORCHESTRATION ANALYSIS:
{json.dumps(orchestration_data, indent=2)}

HANDOFF SEQUENCE:
{json.dumps(handoff_data, indent=2)}

TRACE DATA:
{json.dumps(trace_data, indent=2)}

Create a comprehensive, well-structured response that includes:

## 1. **Query Analysis Summary**
- What the system understood about the query
- Domain identification and complexity assessment
- Required expertise and dependencies

## 2. **Agent Selection & Rationale**
- Which agents were selected and why
- Capability matching and relevance scores
- Execution strategy and reasoning

## 3. **Step-by-Step Execution Flow**
- Complete handoff sequence with timing
- What each agent received as input
- What each agent processed and generated
- Context flow between agents

## 4. **Key Insights Generated**
- Most important findings from each agent
- Technical details and specific metrics
- Actionable recommendations and insights

## 5. **Final Synthesis**
- How all outputs were combined
- Final recommendations and next steps
- Technical accuracy and completeness

## 6. **Performance Metrics**
- Execution times and efficiency
- Success rates and quality scores
- System performance indicators

Format it professionally with clear sections, bullet points, code blocks for technical details, and emphasis on the most valuable insights. Make it easy to understand the complete flow and the value each component added.

Formatted Orchestration Response:"""
    
    def _call_formatting_llm(self, prompt: str) -> str:
        """Call the formatting LLM"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.formatting_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 3000
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                logger.error(f"Formatting LLM failed: {response.status_code}")
                return ""
                
        except Exception as e:
            logger.error(f"Error calling formatting LLM: {e}")
            return ""

# Initialize formatter
orchestration_formatter = OrchestrationFormatter()

# API Endpoints
@app.route('/api/format-complete-orchestration', methods=['POST'])
def format_complete_orchestration():
    """Format complete orchestration with all data"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        session_id = data.get('session_id')
        
        if not query:
            return jsonify({"error": "No query provided"}), 400
        
        result = orchestration_formatter.format_complete_orchestration(query, session_id)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in format_complete_orchestration endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/format-existing-session', methods=['POST'])
def format_existing_session():
    """Format existing orchestration session"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({"error": "No session_id provided"}), 400
        
        # Get handoff data for the session
        handoff_data = orchestration_formatter._get_handoff_data(session_id)
        trace_data = orchestration_formatter._get_trace_data(session_id)
        
        if not handoff_data and not trace_data:
            return jsonify({"error": "No data found for session"}), 404
        
        # Create formatting prompt for existing session
        query = trace_data[0].get('query', 'Unknown query') if trace_data else 'Unknown query'
        
        formatting_prompt = orchestration_formatter._create_comprehensive_formatting_prompt(
            query, {}, handoff_data, trace_data
        )
        
        formatted_response = orchestration_formatter._call_formatting_llm(formatting_prompt)
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "query": query,
            "formatted_response": formatted_response,
            "raw_data": {
                "handoffs": handoff_data,
                "traces": trace_data
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in format_existing_session endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "orchestration-formatter-api",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("🚀 Starting Orchestration Formatter API...")
    logger.info("📍 Port: 5021")
    logger.info("🧠 Intelligent orchestration formatting enabled")
    app.run(host='0.0.0.0', port=5021, debug=True)
