"""
Ollama Service for AgentOS Platform
Provides integration with Ollama local AI models
"""

import asyncio
import aiohttp
import subprocess
import json
import os
import platform
from typing import List, Dict, Optional, Any
from fastapi import HTTPException
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OllamaService:
    """Service for managing Ollama local AI models"""
    
    def __init__(self, host: str = "http://localhost:11434", config: Dict[str, Any] = None):
        self.host = host
        self.session = None
        self.is_windows = platform.system() == "Windows"
        
        # Load timeout configuration
        self.config = config or self._load_default_config()
        self.timeouts = self.config.get("timeouts", {})
    
    def _load_default_config(self) -> Dict[str, Any]:
        """Load default configuration"""
        return {
            "timeouts": {
                "generation_timeout": 300,
                "health_check_timeout": 5,
                "model_pull_timeout": 300,
                "command_timeout": 60
            }
        }
    
    def update_config(self, config: Dict[str, Any]):
        """Update service configuration"""
        self.config = config
        self.timeouts = config.get("timeouts", {})
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def check_ollama_status(self) -> Dict[str, Any]:
        """Check if Ollama is running and accessible"""
        try:
            timeout = aiohttp.ClientTimeout(total=self.timeouts.get("health_check_timeout", 5))
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(f"{self.host}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "running",
                            "host": self.host,
                            "models": data.get("models", []),
                            "model_count": len(data.get("models", []))
                        }
                    return {
                        "status": "error", 
                        "message": f"Ollama responded with status {response.status}",
                        "host": self.host
                    }
        except aiohttp.ClientConnectorError:
            return {
                "status": "not_running", 
                "message": "Cannot connect to Ollama. Make sure Ollama is installed and running.",
                "host": self.host,
                "suggestion": "Run 'ollama serve' to start Ollama"
            }
        except asyncio.TimeoutError:
            return {
                "status": "timeout", 
                "message": "Ollama connection timed out",
                "host": self.host
            }
        except Exception as e:
            logger.error(f"Error checking Ollama status: {str(e)}")
            return {
                "status": "error", 
                "message": f"Unexpected error: {str(e)}",
                "host": self.host
            }
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """Get list of available Ollama models"""
        try:
            timeout = aiohttp.ClientTimeout(total=self.timeouts.get("health_check_timeout", 5))
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(f"{self.host}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        models = data.get("models", [])
                        
                        # Enhance model data with additional info
                        enhanced_models = []
                        for model in models:
                            enhanced_model = {
                                **model,
                                "size_gb": round(model.get("size", 0) / (1024**3), 2),
                                "family": self._extract_model_family(model.get("name", "")),
                                "is_code_model": self._is_code_model(model.get("name", "")),
                                "is_chat_model": self._is_chat_model(model.get("name", ""))
                            }
                            enhanced_models.append(enhanced_model)
                        
                        return enhanced_models
                    else:
                        raise HTTPException(
                            status_code=response.status, 
                            detail=f"Failed to list models: HTTP {response.status}"
                        )
        except Exception as e:
            logger.error(f"Error listing models: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")
    
    async def pull_model(self, model_name: str) -> Dict[str, Any]:
        """Pull a model from Ollama registry"""
        try:
            payload = {"name": model_name}
            timeout = aiohttp.ClientTimeout(total=self.timeouts.get("model_pull_timeout", 300))
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(f"{self.host}/api/pull", json=payload) as response:
                    if response.status == 200:
                        return {
                            "status": "success", 
                            "message": f"Model '{model_name}' pulled successfully",
                            "model": model_name
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "status": "error", 
                            "message": f"Failed to pull model: {error_text}",
                            "model": model_name
                        }
        except asyncio.TimeoutError:
            return {
                "status": "timeout", 
                "message": f"Model pull timed out for '{model_name}'. Large models may take longer.",
                "model": model_name
            }
        except Exception as e:
            logger.error(f"Error pulling model {model_name}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to pull model: {str(e)}")
    
    async def generate_response(self, model: str, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate response using Ollama model"""
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                **kwargs
            }
            
            timeout = aiohttp.ClientTimeout(total=self.timeouts.get("generation_timeout", 300))
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(f"{self.host}/api/generate", json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "status": "success",
                            "response": result.get("response", ""),
                            "model": model,
                            "done": result.get("done", True),
                            "context": result.get("context", []),
                            "total_duration": result.get("total_duration", 0),
                            "load_duration": result.get("load_duration", 0),
                            "prompt_eval_count": result.get("prompt_eval_count", 0),
                            "eval_count": result.get("eval_count", 0)
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "status": "error", 
                            "message": f"Generation failed: {error_text}",
                            "model": model
                        }
        except asyncio.TimeoutError:
            return {
                "status": "timeout", 
                "message": "Response generation timed out",
                "model": model
            }
        except Exception as e:
            logger.error(f"Error generating response with {model}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
    
    async def delete_model(self, model_name: str) -> Dict[str, Any]:
        """Delete a model from Ollama"""
        try:
            payload = {"name": model_name}
            timeout = aiohttp.ClientTimeout(total=self.timeouts.get("health_check_timeout", 5))
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.delete(f"{self.host}/api/delete", json=payload) as response:
                    if response.status == 200:
                        return {
                            "status": "success", 
                            "message": f"Model '{model_name}' deleted successfully",
                            "model": model_name
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "status": "error", 
                            "message": f"Failed to delete model: {error_text}",
                            "model": model_name
                        }
        except Exception as e:
            logger.error(f"Error deleting model {model_name}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")
    
    def execute_terminal_command(self, command: str) -> Dict[str, Any]:
        """Execute Ollama terminal commands safely"""
        try:
            # Sanitize command to only allow ollama commands
            command = command.strip()
            if not command.startswith('ollama'):
                return {
                    "error": "Only ollama commands are allowed",
                    "command": command
                }
            
            # Split command safely
            cmd_parts = command.split()
            
            # Execute command with timeout
            result = subprocess.run(
                cmd_parts,
                capture_output=True,
                text=True,
                timeout=self.timeouts.get("command_timeout", 60),
                cwd=os.getcwd()
            )
            
            return {
                "command": command,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
                "success": result.returncode == 0
            }
            
        except subprocess.TimeoutExpired:
            return {
                "error": "Command timed out (60s limit)",
                "command": command
            }
        except FileNotFoundError:
            return {
                "error": "Ollama command not found. Make sure Ollama is installed and in PATH.",
                "command": command,
                "suggestion": "Install Ollama from https://ollama.ai"
            }
        except Exception as e:
            logger.error(f"Error executing command '{command}': {str(e)}")
            return {
                "error": str(e),
                "command": command
            }
    
    def get_popular_models(self) -> List[Dict[str, Any]]:
        """Get list of popular Ollama models for easy installation"""
        return [
            {
                "name": "llama3.2",
                "description": "Meta's latest Llama model, great for general tasks",
                "size": "2.0GB",
                "category": "General",
                "recommended": True
            },
            {
                "name": "llama3.2:1b",
                "description": "Smaller, faster version of Llama 3.2",
                "size": "1.3GB",
                "category": "General",
                "recommended": True
            },
            {
                "name": "mistral",
                "description": "High-quality model from Mistral AI",
                "size": "4.1GB",
                "category": "General",
                "recommended": True
            },
            {
                "name": "codellama",
                "description": "Specialized for code generation and analysis",
                "size": "3.8GB",
                "category": "Code",
                "recommended": False
            },
            {
                "name": "phi3",
                "description": "Microsoft's efficient small language model",
                "size": "2.3GB",
                "category": "General",
                "recommended": False
            },
            {
                "name": "gemma2",
                "description": "Google's Gemma 2 model",
                "size": "5.4GB",
                "category": "General",
                "recommended": False
            },
            {
                "name": "qwen2.5",
                "description": "Alibaba's multilingual model",
                "size": "4.7GB",
                "category": "Multilingual",
                "recommended": False
            },
            {
                "name": "llama3.2-vision",
                "description": "Llama with vision capabilities",
                "size": "7.9GB",
                "category": "Multimodal",
                "recommended": False
            }
        ]
    
    def _extract_model_family(self, model_name: str) -> str:
        """Extract model family from model name"""
        name_lower = model_name.lower()
        if "llama" in name_lower:
            return "Llama"
        elif "mistral" in name_lower:
            return "Mistral"
        elif "codellama" in name_lower:
            return "CodeLlama"
        elif "phi" in name_lower:
            return "Phi"
        elif "gemma" in name_lower:
            return "Gemma"
        elif "qwen" in name_lower:
            return "Qwen"
        else:
            return "Other"
    
    def _is_code_model(self, model_name: str) -> bool:
        """Check if model is specialized for code"""
        code_indicators = ["code", "coder", "coding", "codellama"]
        return any(indicator in model_name.lower() for indicator in code_indicators)
    
    def _is_chat_model(self, model_name: str) -> bool:
        """Check if model is optimized for chat"""
        chat_indicators = ["chat", "instruct", "it"]
        return any(indicator in model_name.lower() for indicator in chat_indicators)

# Global instance for reuse
ollama_service = OllamaService()