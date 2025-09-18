#!/usr/bin/env python3
"""
Real Ollama Integration for Strands SDK API
Replaces mock implementation with actual Ollama calls
"""

import requests
import json
from typing import List, Dict, Any

class RealOllamaModel:
    """Real implementation that calls Ollama directly"""
    
    def __init__(self, host="http://localhost:11434", model_id="llama3", **kwargs):
        self.host = host
        self.model_id = model_id
        self.temperature = kwargs.get('temperature', 0.7)
        self.top_p = kwargs.get('top_p', 0.9)
        self.max_tokens = kwargs.get('max_tokens', 1000)
        self.config = kwargs
        print(f"[Real Ollama] Model initialized: {host} - {model_id} (temp: {self.temperature})")
    
    def generate(self, prompt: str, system_prompt: str = None) -> str:
        """Generate response using real Ollama"""
        try:
            # Prepare the request payload
            payload = {
                "model": self.model_id,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "top_p": self.top_p,
                    "num_predict": self.max_tokens
                }
            }
            
            # Add system prompt if provided
            if system_prompt:
                payload["system"] = system_prompt
            
            print(f"[Real Ollama] Calling Ollama with model: {self.model_id}")
            
            # Make request to Ollama
            response = requests.post(
                f"{self.host}/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', 'No response generated')
            else:
                return f"Error: Ollama returned status {response.status_code}"
                
        except Exception as e:
            print(f"[Real Ollama] Error: {e}")
            return f"Error calling Ollama: {str(e)}"

class RealAgent:
    """Real agent implementation that uses actual Ollama"""
    
    def __init__(self, model, system_prompt="You are a helpful assistant.", tools=None):
        self.model = model
        self.system_prompt = system_prompt
        self.tools = tools or []
        print(f"[Real Agent] Created with model: {model.model_id}")
    
    def __call__(self, input_text: str) -> str:
        """Execute the agent with real Ollama"""
        print(f"[Real Agent] Processing: {input_text[:50]}...")
        
        # Use real Ollama model to generate response
        response = self.model.generate(input_text, self.system_prompt)
        
        print(f"[Real Agent] Generated {len(response)} characters")
        return response

# Tool implementations (these work with both mock and real)
def web_search(query: str) -> str:
    """Search the web for information"""
    try:
        # Using DuckDuckGo Instant Answer API
        url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        result = ""
        if data.get('Abstract'):
            result += f"Summary: {data['Abstract']}\n"
        if data.get('AbstractURL'):
            result += f"Source: {data['AbstractURL']}\n"
        
        return result if result else f"No specific information found for: {query}"
        
    except Exception as e:
        return f"Web search error: {str(e)}"

def calculator(expression: str) -> str:
    """Perform mathematical calculations"""
    try:
        # Safe evaluation of mathematical expressions
        import ast
        import operator
        
        # Supported operations
        ops = {
            ast.Add: operator.add,
            ast.Sub: operator.sub,
            ast.Mult: operator.mul,
            ast.Div: operator.truediv,
            ast.Pow: operator.pow,
            ast.USub: operator.neg,
        }
        
        def eval_expr(node):
            if isinstance(node, ast.Num):
                return node.n
            elif isinstance(node, ast.BinOp):
                return ops[type(node.op)](eval_expr(node.left), eval_expr(node.right))
            elif isinstance(node, ast.UnaryOp):
                return ops[type(node.op)](eval_expr(node.operand))
            else:
                raise TypeError(node)
        
        result = eval_expr(ast.parse(expression, mode='eval').body)
        return f"Result: {result}"
        
    except Exception as e:
        return f"Calculation error: {str(e)}"

# Available tools
REAL_TOOLS = {
    'web_search': web_search,
    'calculator': calculator
}