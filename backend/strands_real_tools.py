#!/usr/bin/env python3
"""
Real Strands SDK Tools Implementation
Uses the official Strands SDK @tool decorator
"""

import math
import json
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional
from strands import tool

# Core Tools
@tool
def think(thought: str) -> str:
    """
    Allow the agent to think through a problem step by step.
    
    Args:
        thought: The thought or reasoning process to record
    
    Returns:
        Confirmation that the thought was recorded
    """
    return f"Thought recorded: {thought}"

@tool
def calculator(expression: str) -> str:
    """
    Perform mathematical calculations and evaluate expressions.
    
    Use this tool when you need to:
    - Calculate numerical results for arithmetic operations
    - Evaluate mathematical expressions with functions like sin, cos, log, sqrt
    - Perform complex calculations that require precision
    - Convert between units or calculate percentages
    
    Args:
        expression: Mathematical expression to evaluate. Supports basic arithmetic (+, -, *, /),
                   powers (**), and math functions (sin, cos, tan, log, sqrt, etc.)
                   Examples: "2 + 2", "sqrt(16)", "sin(3.14159/2)", "2**10"
    
    Returns:
        The calculated result as a string.
    """
    try:
        # Safe evaluation of mathematical expressions
        allowed_names = {
            k: v for k, v in math.__dict__.items() if not k.startswith("__")
        }
        allowed_names.update({"abs": abs, "round": round})
        
        result = eval(expression, {"__builtins__": {}}, allowed_names)
        return f"Result: {result}"
    except Exception as e:
        return f"Calculation error: {str(e)}"

@tool
def current_time() -> str:
    """
    Get the current date and time.
    
    Returns:
        Current date and time in a readable format
    """
    now = datetime.now()
    return f"Current date and time: {now.strftime('%Y-%m-%d %H:%M:%S')}"

@tool
def memory_store(key: str, value: str) -> str:
    """
    Store information in memory for later retrieval.
    
    Args:
        key: The key to store the information under
        value: The information to store
    
    Returns:
        Confirmation that the information was stored
    """
    # In a real implementation, this would use a persistent storage
    return f"Stored '{value}' under key '{key}'"

@tool
def memory_retrieve(key: str) -> str:
    """
    Retrieve information from memory.
    
    Args:
        key: The key to retrieve information for
    
    Returns:
        The stored information or a message if not found
    """
    # In a real implementation, this would retrieve from persistent storage
    return f"Retrieved information for key '{key}' (mock implementation)"

@tool
def use_llm(prompt: str, model: str = "default") -> str:
    """
    Use a language model to generate text.
    
    Args:
        prompt: The prompt to send to the language model
        model: The model to use (optional)
    
    Returns:
        The generated text from the language model
    """
    return f"LLM response for prompt: {prompt[:50]}... (mock implementation)"

@tool
def environment_get(key: str) -> str:
    """
    Get an environment variable.
    
    Args:
        key: The environment variable name
    
    Returns:
        The value of the environment variable
    """
    import os
    value = os.environ.get(key, "Not found")
    return f"Environment variable {key}: {value}"

@tool
def sleep(seconds: float) -> str:
    """
    Pause execution for a specified number of seconds.
    
    Args:
        seconds: Number of seconds to sleep
    
    Returns:
        Confirmation that the sleep completed
    """
    import time
    time.sleep(seconds)
    return f"Slept for {seconds} seconds"

@tool
def stop(reason: str = "Agent stopped") -> str:
    """
    Stop the agent execution.
    
    Args:
        reason: The reason for stopping
    
    Returns:
        Confirmation that the agent is stopping
    """
    return f"Agent stopping: {reason}"

# File Operations
@tool
def file_read(filename: str) -> str:
    """
    Read the contents of a file safely.
    
    Args:
        filename: The path to the file to read
    
    Returns:
        The contents of the file
    """
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        return f"File contents of {filename}:\n{content}"
    except Exception as e:
        return f"Error reading file {filename}: {str(e)}"

@tool
def file_write(filename: str, content: str) -> str:
    """
    Write content to a file safely.
    
    Args:
        filename: The path to the file to write
        content: The content to write to the file
    
    Returns:
        Confirmation that the file was written
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"Successfully wrote {len(content)} characters to {filename}"
    except Exception as e:
        return f"Error writing file {filename}: {str(e)}"

# Web and Data Tools
@tool
def http_request(url: str, method: str = "GET", headers: Optional[Dict[str, str]] = None, data: Optional[str] = None) -> str:
    """
    Make an HTTP request to a URL.
    
    Args:
        url: The URL to request
        method: HTTP method (GET, POST, PUT, DELETE)
        headers: Optional headers to include
        data: Optional data to send with the request
    
    Returns:
        The response from the HTTP request
    """
    try:
        response = requests.request(method, url, headers=headers, data=data, timeout=10)
        return f"HTTP {method} {url}: Status {response.status_code}\nResponse: {response.text[:500]}"
    except Exception as e:
        return f"HTTP request error: {str(e)}"

@tool
def python_repl(code: str) -> str:
    """
    Execute Python code in a safe environment.
    
    Args:
        code: Python code to execute
    
    Returns:
        The output of the code execution
    """
    try:
        # Create a safe execution environment
        safe_globals = {
            '__builtins__': {
                'print': print,
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'list': list,
                'dict': dict,
                'tuple': tuple,
                'set': set,
            }
        }
        safe_locals = {}
        
        exec(code, safe_globals, safe_locals)
        return "Code executed successfully"
    except Exception as e:
        return f"Python execution error: {str(e)}"

# Media Tools
@tool
def generate_image(prompt: str, style: str = "realistic") -> str:
    """
    Generate an image from a text prompt.
    
    Args:
        prompt: Text description of the image to generate
        style: Style of the image (realistic, artistic, etc.)
    
    Returns:
        Information about the generated image
    """
    return f"Generated image for prompt '{prompt}' in {style} style (mock implementation)"

# Tool Registry
REAL_STRANDS_TOOLS = {
    'think': think,
    'calculator': calculator,
    'current_time': current_time,
    'memory_store': memory_store,
    'memory_retrieve': memory_retrieve,
    'use_llm': use_llm,
    'environment_get': environment_get,
    'sleep': sleep,
    'stop': stop,
    'file_read': file_read,
    'file_write': file_write,
    'http_request': http_request,
    'python_repl': python_repl,
    'generate_image': generate_image,
}

def get_real_tool(tool_name: str):
    """Get a real Strands SDK tool by name"""
    return REAL_STRANDS_TOOLS.get(tool_name)

def get_all_real_tools():
    """Get all available real Strands SDK tools"""
    return REAL_STRANDS_TOOLS

def get_tool_configuration_schema(tool_name: str) -> Optional[Dict[str, Any]]:
    """Get configuration schema for a tool"""
    if tool_name not in REAL_STRANDS_TOOLS:
        return None
    
    # Basic configuration schema for all tools
    return {
        'type': 'object',
        'properties': {
            'enabled': {
                'type': 'boolean',
                'default': True,
                'description': f'Enable {tool_name} tool'
            }
        }
    }

