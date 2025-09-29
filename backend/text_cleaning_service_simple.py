#!/usr/bin/env python3
"""
Simple Text Cleaning Service
Fallback text cleaning service for when the enhanced version is not available
"""

import re
import logging
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleTextCleaningService:
    """Simple text cleaning service with basic functionality"""
    
    def __init__(self):
        logger.info("Simple Text Cleaning Service initialized")
    
    def clean_llm_output(self, raw_output: str, output_type: str = "agent_response") -> str:
        """
        Clean LLM output using simple regex-based cleaning
        
        Args:
            raw_output: Raw output from LLM
            output_type: Type of output (agent_response, orchestrator_response, etc.)
        
        Returns:
            Cleaned output
        """
        if not raw_output or len(raw_output.strip()) < 10:
            return raw_output
        
        try:
            # Basic cleaning
            cleaned = self._basic_clean(raw_output)
            
            logger.info(f"Text cleaning completed: {len(raw_output)} -> {len(cleaned)} chars")
            return cleaned
            
        except Exception as e:
            logger.error(f"Text cleaning failed: {e}")
            return raw_output
    
    def _basic_clean(self, text: str) -> str:
        """Basic text cleaning using regex"""
        if not text:
            return text
        
        # Remove <think> tags
        cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        
        # Remove excessive whitespace
        cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
        
        # Remove leading/trailing whitespace
        cleaned = cleaned.strip()
        
        # Extract result if it's a calculation
        if 'Result:' in cleaned:
            result_match = re.search(r'Result:\s*([^\n]+)', cleaned)
            if result_match:
                return f"Result: {result_match.group(1).strip()}"
        
        # Extract key information from tool execution
        if '**Tool Execution:**' in cleaned:
            tool_section = re.search(r'\*\*Tool Execution:\*\*(.*?)(?=\n\n|\*\*|$)', cleaned, re.DOTALL)
            if tool_section:
                tool_content = tool_section.group(1).strip()
                result_match = re.search(r'Result:\s*([^\n]+)', tool_content)
                if result_match:
                    return f"Result: {result_match.group(1).strip()}"
        
        # Truncate if too long
        if len(cleaned) > 1000:
            cleaned = cleaned[:1000] + "..."
        
        return cleaned

# Global instance
text_cleaning_service = SimpleTextCleaningService()
