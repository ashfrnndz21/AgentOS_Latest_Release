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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

    def _create_cleaning_prompt(self, raw_output: str, output_type: str) -> str:
        """Create appropriate cleaning prompt based on output type (legacy method)"""
        
        if output_type == "agent_response":
            return f"""You are a text cleaning assistant. Clean this agent response to extract only the final, actionable output that should be passed to the next agent.

REMOVE:
- <think> tags and internal reasoning
- Verbose explanations and step-by-step thinking
- Unnecessary formatting and extra whitespace

KEEP:
- Final results (numbers, calculations, answers)
- Clean, concise outputs
- Essential information for the next agent

Raw agent response:
{raw_output}

Cleaned output (only the final result/answer):"""

        elif output_type == "orchestrator_response":
            return f"""You are a text cleaning assistant. Clean this orchestrator response to extract only the essential information for agents.

REMOVE:
- Verbose explanations
- Internal reasoning
- Unnecessary formatting

KEEP:
- Clear instructions
- Essential context
- Actionable information

Raw orchestrator response:
{raw_output}

Cleaned output (only essential information):"""

        else:
            return f"""You are a text cleaning assistant. Clean this LLM output to make it concise and actionable.

REMOVE:
- Internal thinking and reasoning
- Verbose explanations
- Unnecessary formatting

KEEP:
- Final results
- Essential information
- Clean, concise output

Raw output:
{raw_output}

Cleaned output:"""
    
    def _call_cleaning_llm(self, prompt: str) -> str:
        """Call the cleaning LLM"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.cleaning_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,  # Low temperature for consistent cleaning
                        "top_p": 0.9,
                        "max_tokens": 500  # Limit output length
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                cleaned_output = result.get('response', '').strip()
                
                # Additional post-processing
                cleaned_output = self._post_process_cleaned_output(cleaned_output)
                
                return cleaned_output
            else:
                logger.error(f"Cleaning LLM failed: {response.status_code}")
                return self._basic_clean(prompt.split('\n\nRaw')[0])
                
        except Exception as e:
            logger.error(f"Error calling cleaning LLM: {e}")
            return self._basic_clean(prompt.split('\n\nRaw')[0])
    
    def _post_process_cleaned_output(self, output: str) -> str:
        """Post-process the cleaned output"""
        if not output:
            return output
        
        # Remove any remaining <think> tags
        import re
        output = re.sub(r'<think>.*?</think>', '', output, flags=re.DOTALL)
        
        # Remove excessive whitespace
        output = re.sub(r'\n\s*\n', '\n', output)
        output = output.strip()
        
        # Ensure it's not too long
        if len(output) > 1000:
            output = output[:1000] + "..."
        
        return output
    
    def _basic_clean(self, text: str) -> str:
        """Basic fallback cleaning when LLM cleaning fails"""
        if not text:
            return text
        
        import re
        
        # Remove <think> tags
        cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        
        # Extract result if it's a calculation
        if 'Result:' in cleaned:
            result_match = re.search(r'Result:\s*([^\n]+)', cleaned)
            if result_match:
                return f"Result: {result_match.group(1).strip()}"
        
        # Extract key information
        if '**Tool Execution:**' in cleaned:
            tool_section = re.search(r'\*\*Tool Execution:\*\*(.*?)(?=\n\n|\*\*|$)', cleaned, re.DOTALL)
            if tool_section:
                tool_content = tool_section.group(1).strip()
                result_match = re.search(r'Result:\s*([^\n]+)', tool_content)
                if result_match:
                    return f"Result: {result_match.group(1).strip()}"
        
        # Clean up whitespace
        cleaned = re.sub(r'\n\s*\n', '\n', cleaned)
        cleaned = cleaned.strip()
        
        # Truncate if too long
        if len(cleaned) > 500:
            cleaned = cleaned[:500] + "..."
        
        return cleaned

# Global instance
text_cleaning_service = TextCleaningService()
