#!/usr/bin/env python3
"""
Enhanced Text Cleaning Service
LLM-powered contextual formatter that intelligently parses and structures all outputs
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

class TextCleaningService:
    """Enhanced service to intelligently format and structure LLM outputs"""
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.cleaning_model = "qwen3:1.7b"  # LLM for intelligent formatting
    
    def clean_llm_output(self, raw_output: str, output_type: str = "agent_response") -> str:
        """
        Clean LLM output using intelligent contextual formatting
        
        Args:
            raw_output: Raw output from LLM
            output_type: Type of output (agent_response, orchestrator_response, etc.)
        
        Returns:
            Intelligently formatted output ready for handoff
        """
        if not raw_output or len(raw_output.strip()) < 10:
            return raw_output
        
        try:
            # Create intelligent formatting prompt based on output type
            formatting_prompt = self._create_intelligent_formatting_prompt(raw_output, output_type)
            
            # Call formatting LLM
            formatted_output = self._call_formatting_llm(formatting_prompt)
            
            logger.info(f"Intelligent formatting completed: {len(raw_output)} -> {len(formatted_output)} chars")
            return formatted_output
            
        except Exception as e:
            logger.error(f"Intelligent formatting failed: {e}")
            # Fallback to basic cleaning
            return self._basic_clean(raw_output)
    
    def format_orchestration_response(self, orchestration_data: Dict[str, Any]) -> str:
        """
        Format complete orchestration response with structured interpretation
        
        Args:
            orchestration_data: Complete orchestration data including stages, handoffs, etc.
        
        Returns:
            Beautifully formatted, interpreted response
        """
        try:
            # Create comprehensive formatting prompt
            formatting_prompt = self._create_orchestration_formatting_prompt(orchestration_data)
            
            # Call formatting LLM
            formatted_response = self._call_formatting_llm(formatting_prompt)
            
            logger.info(f"Orchestration response formatted successfully")
            return formatted_response
            
        except Exception as e:
            logger.error(f"Orchestration formatting failed: {e}")
            return self._fallback_orchestration_format(orchestration_data)
    
    def format_handoff_sequence(self, handoffs: List[Dict[str, Any]], query: str) -> str:
        """
        Format handoff sequence with step-by-step interpretation
        
        Args:
            handoffs: List of handoff data
            query: Original user query
        
        Returns:
            Structured handoff sequence with interpretations
        """
        try:
            # Create handoff formatting prompt
            formatting_prompt = self._create_handoff_formatting_prompt(handoffs, query)
            
            # Call formatting LLM
            formatted_handoffs = self._call_formatting_llm(formatting_prompt)
            
            logger.info(f"Handoff sequence formatted successfully")
            return formatted_handoffs
            
        except Exception as e:
            logger.error(f"Handoff formatting failed: {e}")
            return self._fallback_handoff_format(handoffs)
    
    def _create_intelligent_formatting_prompt(self, raw_output: str, output_type: str) -> str:
        """Create intelligent formatting prompt based on output type"""
        
        if output_type == "agent_response":
            return f"""You are an AI Output Formatter. Clean and structure this agent response for optimal readability and professional presentation.

Raw Agent Output:
{raw_output}

Format this response to:
1. Remove any <think> tags or internal reasoning
2. Extract the core actionable information
3. Structure it with clear headings and bullet points
4. Make it professional and concise
5. Preserve all important technical details and insights

Formatted Response:"""

        elif output_type == "orchestrator_response":
            return f"""You are an AI Output Formatter. Clean and structure this orchestrator response for optimal presentation.

Raw Orchestrator Output:
{raw_output}

Format this response to:
1. Create clear section headers
2. Structure the information logically
3. Highlight key insights and recommendations
4. Make it easy to scan and understand
5. Preserve all technical accuracy

Formatted Response:"""

        elif output_type == "handoff_context":
            return f"""You are an AI Output Formatter. Clean and structure this handoff context for the next agent.

Raw Handoff Context:
{raw_output}

Format this context to:
1. Extract the most relevant information for the next agent
2. Remove redundant or verbose content
3. Focus on actionable data and key insights
4. Make it concise but complete
5. Ensure clear transfer of knowledge

Formatted Context:"""

        else:
            return f"""You are an AI Output Formatter. Clean and structure this output for optimal presentation.

Raw Output:
{raw_output}

Format this output to:
1. Remove any internal thinking or verbose content
2. Structure with clear headings and organization
3. Highlight key points and insights
4. Make it professional and readable
5. Preserve all important information

Formatted Output:"""

    def _create_orchestration_formatting_prompt(self, orchestration_data: Dict[str, Any]) -> str:
        """Create comprehensive orchestration formatting prompt"""
        
        query = orchestration_data.get('query', 'Unknown query')
        stages = orchestration_data.get('stages', {})
        handoffs = orchestration_data.get('handoffs', [])
        final_response = orchestration_data.get('final_response', '')
        
        return f"""You are an AI Orchestration Response Formatter. Create a beautifully structured, interpreted response from this orchestration data.

ORIGINAL QUERY: {query}

6-STAGE ANALYSIS:
{json.dumps(stages, indent=2)}

HANDOFF SEQUENCE:
{json.dumps(handoffs, indent=2)}

FINAL RESPONSE:
{final_response}

Create a comprehensive, well-structured response that includes:

1. **Query Analysis Summary** - What the system understood about the query
2. **Agent Selection Rationale** - Why specific agents were chosen
3. **Step-by-Step Execution** - How each agent processed the query
4. **Key Insights Generated** - The most important findings from each agent
5. **Final Recommendations** - Actionable insights and next steps
6. **Technical Details** - Specific metrics, thresholds, and data points

Format it professionally with clear sections, bullet points, and emphasis on the most valuable insights.

Formatted Orchestration Response:"""

    def _create_handoff_formatting_prompt(self, handoffs: List[Dict[str, Any]], query: str) -> str:
        """Create handoff sequence formatting prompt"""
        
        return f"""You are an AI Handoff Sequence Formatter. Create a clear, step-by-step interpretation of this agent handoff sequence.

ORIGINAL QUERY: {query}

HANDOFF DATA:
{json.dumps(handoffs, indent=2)}

Create a structured handoff sequence that shows:

1. **Handoff Overview** - Summary of the entire sequence
2. **Step-by-Step Breakdown** - Each handoff with:
   - Agent involved
   - Input received
   - Processing performed
   - Output generated
   - Key insights extracted
3. **Context Flow** - How information flowed between agents
4. **Final Synthesis** - How all outputs were combined

Make it easy to understand the complete flow and the value each agent added.

Formatted Handoff Sequence:"""

    def _call_formatting_llm(self, prompt: str) -> str:
        """Call the formatting LLM"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.cleaning_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 2000
                    }
                },
                timeout=30
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
    
    def _basic_clean(self, raw_output: str) -> str:
        """Basic cleaning fallback"""
        import re
        
        # Remove <think> tags
        cleaned = re.sub(r'<think>.*?</think>', '', raw_output, flags=re.DOTALL)
        
        # Remove excessive whitespace
        cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
        
        # Remove leading/trailing whitespace
        cleaned = cleaned.strip()
        
        return cleaned
    
    def _fallback_orchestration_format(self, orchestration_data: Dict[str, Any]) -> str:
        """Fallback orchestration formatting when LLM fails"""
        query = orchestration_data.get('query', 'Unknown query')
        final_response = orchestration_data.get('final_response', 'No response available')
        
        return f"""# Orchestration Response

**Query:** {query}

**Response:**
{final_response}

*Note: This response was formatted using fallback formatting.*"""
    
    def _fallback_handoff_format(self, handoffs: List[Dict[str, Any]]) -> str:
        """Fallback handoff formatting when LLM fails"""
        formatted = "# Handoff Sequence\n\n"
        
        for i, handoff in enumerate(handoffs, 1):
            formatted += f"## Handoff {i}\n"
            formatted += f"**Status:** {handoff.get('status', 'Unknown')}\n"
            formatted += f"**Execution Time:** {handoff.get('execution_time', 0):.2f}s\n"
            formatted += f"**Output:** {handoff.get('output_received', 'No output')}\n\n"
        
        return formatted

# Initialize service
text_cleaning_service = TextCleaningService()

# API Endpoints
@app.route('/api/clean-text', methods=['POST'])
def clean_text():
    """Clean and format LLM output"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        output_type = data.get('output_type', 'agent_response')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        cleaned_text = text_cleaning_service.clean_llm_output(text, output_type)
        
        return jsonify({
            "success": True,
            "original_text": text,
            "cleaned_text": cleaned_text,
            "output_type": output_type,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in clean_text endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/format-orchestration', methods=['POST'])
def format_orchestration():
    """Format complete orchestration response"""
    try:
        data = request.get_json()
        orchestration_data = data.get('orchestration_data', {})
        
        if not orchestration_data:
            return jsonify({"error": "No orchestration data provided"}), 400
        
        formatted_response = text_cleaning_service.format_orchestration_response(orchestration_data)
        
        return jsonify({
            "success": True,
            "formatted_response": formatted_response,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in format_orchestration endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/format-handoffs', methods=['POST'])
def format_handoffs():
    """Format handoff sequence"""
    try:
        data = request.get_json()
        handoffs = data.get('handoffs', [])
        query = data.get('query', '')
        
        if not handoffs:
            return jsonify({"error": "No handoff data provided"}), 400
        
        formatted_handoffs = text_cleaning_service.format_handoff_sequence(handoffs, query)
        
        return jsonify({
            "success": True,
            "formatted_handoffs": formatted_handoffs,
            "query": query,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in format_handoffs endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "enhanced-text-cleaning-service",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("🚀 Starting Enhanced Text Cleaning Service...")
    logger.info("📍 Port: 5019")
    logger.info("🧠 LLM-powered contextual formatting enabled")
    app.run(host='0.0.0.0', port=5019, debug=True)
