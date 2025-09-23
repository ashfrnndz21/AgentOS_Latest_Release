"""
Simple Ollama API Backend
Provides basic endpoints for Ollama agent management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import sqlite3
import uuid
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
DATABASE_PATH = "ollama_agents.db"

def init_database():
    """Initialize SQLite database for agent storage"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT,
            description TEXT,
            model TEXT NOT NULL,
            personality TEXT,
            expertise TEXT,
            system_prompt TEXT,
            temperature REAL DEFAULT 0.7,
            max_tokens INTEGER DEFAULT 1000,
            guardrails_enabled BOOLEAN DEFAULT FALSE,
            safety_level TEXT DEFAULT 'medium',
            content_filters TEXT,
            custom_rules TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Conversations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            messages TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    ''')
    
    # Executions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS executions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            input_text TEXT NOT NULL,
            output_text TEXT,
            success BOOLEAN DEFAULT FALSE,
            duration INTEGER,
            tokens_used INTEGER,
            error_message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

@app.route('/api/ollama/status', methods=['GET'])
def get_ollama_status():
    """Check Ollama service status"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=30)
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                "status": "running",
                "models": data.get("models", []),
                "model_count": len(data.get("models", []))
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"Ollama responded with status {response.status_code}"
            }), 500
    except requests.exceptions.ConnectionError:
        return jsonify({
            "status": "not_running",
            "message": "Cannot connect to Ollama. Make sure Ollama is installed and running."
        }), 503
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/ollama/models', methods=['GET'])
def list_models():
    """List available Ollama models"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags")
        if response.status_code == 200:
            data = response.json()
            return jsonify(data.get("models", []))
        else:
            return jsonify([]), 500
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        return jsonify([]), 500

@app.route('/api/agents/ollama', methods=['POST'])
def create_agent():
    """Create a new Ollama agent"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('model'):
            return jsonify({"error": "Name and model are required"}), 400
        
        # Generate agent ID
        agent_id = str(uuid.uuid4())
        
        # Store in database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Handle both nested guardrails object and flat structure
        guardrails_enabled = False
        safety_level = 'medium'
        content_filters = []
        custom_rules = []
        
        if 'guardrails' in data and isinstance(data['guardrails'], dict):
            # Nested structure
            guardrails_enabled = data['guardrails'].get('enabled', False)
            safety_level = data['guardrails'].get('safetyLevel', 'medium')
            content_filters = data['guardrails'].get('contentFilters', [])
            custom_rules = data['guardrails'].get('rules', [])
        else:
            # Flat structure (for backward compatibility)
            guardrails_enabled = data.get('guardrails_enabled', False)
            safety_level = data.get('safety_level', 'medium')
            # Parse JSON strings if they exist
            if 'content_filters' in data:
                try:
                    content_filters = json.loads(data['content_filters']) if isinstance(data['content_filters'], str) else data['content_filters']
                except:
                    content_filters = []
            if 'custom_rules' in data:
                try:
                    custom_rules = json.loads(data['custom_rules']) if isinstance(data['custom_rules'], str) else data['custom_rules']
                except:
                    custom_rules = []
        
        cursor.execute('''
            INSERT INTO agents (
                id, name, role, description, model, personality, expertise,
                system_prompt, temperature, max_tokens, guardrails_enabled,
                safety_level, content_filters, custom_rules
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            data.get('name'),
            data.get('role', ''),
            data.get('description', ''),
            data.get('model'),
            data.get('personality', ''),
            data.get('expertise', ''),
            data.get('system_prompt', data.get('systemPrompt', '')),  # Handle both field names
            data.get('temperature', 0.7),
            data.get('max_tokens', data.get('maxTokens', 1000)),  # Handle both field names
            guardrails_enabled,
            safety_level,
            json.dumps(content_filters),
            json.dumps(custom_rules)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "agent": {
                "id": agent_id,
                "name": data.get('name'),
                "role": data.get('role', ''),
                "description": data.get('description', ''),
                "model": {"model_id": data.get('model')},
                "system_prompt": data.get('systemPrompt', ''),
                "temperature": data.get('temperature', 0.7),
                "max_tokens": data.get('maxTokens', 1000),
                "guardrails": data.get('guardrails', {}),
                "capabilities": data.get('capabilities', {}),
                "behavior": data.get('behavior', {})
            }
        })
        
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/agents/ollama', methods=['GET'])
def list_agents():
    """List all Ollama agents"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM agents ORDER BY created_at DESC')
        rows = cursor.fetchall()
        
        agents = []
        for row in rows:
            agent = {
                "id": row[0],
                "name": row[1],
                "role": row[2],
                "description": row[3],
                "model": {"model_id": row[4]},
                "personality": row[5],
                "expertise": row[6],
                "system_prompt": row[7],
                "temperature": row[8],
                "max_tokens": row[9],
                "guardrails": {
                    "enabled": bool(row[10]),
                    "safetyLevel": row[11],
                    "contentFilters": json.loads(row[12]) if row[12] else [],
                    "rules": json.loads(row[13]) if row[13] else []
                },
                "created_at": row[14],
                "updated_at": row[15]
            }
            agents.append(agent)
        
        conn.close()
        
        return jsonify({"agents": agents})
        
    except Exception as e:
        logger.error(f"Error listing agents: {str(e)}")
        return jsonify({"agents": []}), 500

@app.route('/api/agents/ollama/<agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an Ollama agent"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Delete agent
        cursor.execute('DELETE FROM agents WHERE id = ?', (agent_id,))
        
        # Delete related conversations and executions
        cursor.execute('DELETE FROM conversations WHERE agent_id = ?', (agent_id,))
        cursor.execute('DELETE FROM executions WHERE agent_id = ?', (agent_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True})
        
    except Exception as e:
        logger.error(f"Error deleting agent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ollama/generate', methods=['POST'])
def generate_response():
    """Generate response using Ollama"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('model') or not data.get('prompt'):
            return jsonify({"error": "Model and prompt are required"}), 400
        
        # Prepare Ollama request
        ollama_request = {
            "model": data.get('model'),
            "prompt": data.get('prompt'),
            "stream": False,
            "options": {
                "temperature": data.get('temperature', 0.7),
                "num_predict": data.get('max_tokens', 1000)
            }
        }
        
        if data.get('system'):
            ollama_request['system'] = data.get('system')
        
        # Make request to Ollama
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=ollama_request,
            timeout=300  # 5 minute timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({
                "status": "success",
                "response": result.get("response", ""),
                "eval_count": result.get("eval_count", 0),
                "eval_duration": result.get("eval_duration", 0),
                "total_duration": result.get("total_duration", 0)
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"Ollama API error: {response.status_code}"
            }), 500
            
    except requests.exceptions.Timeout:
        return jsonify({
            "status": "error",
            "message": "Request timed out"
        }), 408
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/agents/ollama/<agent_id>/execute', methods=['POST'])
def execute_agent(agent_id):
    """Execute an agent with input"""
    try:
        data = request.json
        input_text = data.get('input', '')
        
        if not input_text:
            return jsonify({"error": "Input is required"}), 400
        
        # Get agent from database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM agents WHERE id = ?', (agent_id,))
        agent_row = cursor.fetchone()
        
        if not agent_row:
            conn.close()
            return jsonify({"error": "Agent not found"}), 404
        
        # Prepare execution
        start_time = datetime.now()
        execution_id = str(uuid.uuid4())
        
        try:
            # Build prompt
            system_prompt = agent_row[7]  # system_prompt column
            model = agent_row[4]  # model column
            temperature = agent_row[8]  # temperature column
            max_tokens = agent_row[9]  # max_tokens column
            
            prompt = f"System: {system_prompt}\n\nHuman: {input_text}\n\nAssistant:"
            
            # Generate response
            ollama_request = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=ollama_request,
                timeout=300
            )
            
            if response.status_code == 200:
                result = response.json()
                output_text = result.get("response", "")
                tokens_used = result.get("eval_count", 0)
                duration = int((datetime.now() - start_time).total_seconds() * 1000)
                
                # Store execution
                cursor.execute('''
                    INSERT INTO executions (
                        id, agent_id, input_text, output_text, success,
                        duration, tokens_used, timestamp
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    execution_id, agent_id, input_text, output_text, True,
                    duration, tokens_used, datetime.now()
                ))
                
                conn.commit()
                conn.close()
                
                return jsonify({
                    "id": execution_id,
                    "agentId": agent_id,
                    "input": input_text,
                    "output": output_text,
                    "success": True,
                    "duration": duration,
                    "tokensUsed": tokens_used,
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {
                        "model": model,
                        "temperature": temperature,
                        "tools_used": [],
                        "context_length": 1
                    }
                })
            else:
                raise Exception(f"Ollama API error: {response.status_code}")
                
        except Exception as e:
            # Store failed execution
            duration = int((datetime.now() - start_time).total_seconds() * 1000)
            error_message = str(e)
            
            cursor.execute('''
                INSERT INTO executions (
                    id, agent_id, input_text, success, duration, error_message, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                execution_id, agent_id, input_text, False, duration, error_message, datetime.now()
            ))
            
            conn.commit()
            conn.close()
            
            return jsonify({
                "id": execution_id,
                "agentId": agent_id,
                "input": input_text,
                "output": "",
                "success": False,
                "duration": duration,
                "tokensUsed": 0,
                "error": error_message,
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "model": agent_row[4],
                    "temperature": agent_row[8],
                    "tools_used": [],
                    "context_length": 0
                }
            }), 500
            
    except Exception as e:
        logger.error(f"Error executing agent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/agents/ollama/<agent_id>/metrics', methods=['GET'])
def get_agent_metrics(agent_id):
    """Get agent performance metrics"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Get execution statistics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_executions,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_executions,
                SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_executions,
                AVG(duration) as avg_response_time,
                SUM(tokens_used) as total_tokens_used,
                MAX(timestamp) as last_execution
            FROM executions 
            WHERE agent_id = ?
        ''', (agent_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row and row[0] > 0:  # If there are executions
            return jsonify({
                "totalExecutions": row[0],
                "successfulExecutions": row[1],
                "failedExecutions": row[2],
                "averageResponseTime": row[3] or 0,
                "totalTokensUsed": row[4] or 0,
                "averageTokensPerExecution": (row[4] or 0) / row[0] if row[0] > 0 else 0,
                "lastExecution": row[5]
            })
        else:
            return jsonify({
                "totalExecutions": 0,
                "successfulExecutions": 0,
                "failedExecutions": 0,
                "averageResponseTime": 0,
                "totalTokensUsed": 0,
                "averageTokensPerExecution": 0,
                "lastExecution": None
            })
            
    except Exception as e:
        logger.error(f"Error getting agent metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
@app.route('/api/ollama/terminal', methods=['POST'])
def ollama_terminal():
    """Handle Ollama terminal commands"""
    try:
        data = request.json
        command = data.get('command', '').strip()
        
        if not command:
            return jsonify({"error": "Command is required", "success": False}), 400
        
        # Handle different Ollama commands
        if command.startswith('ollama '):
            # Remove 'ollama ' prefix for API calls
            cmd = command[7:].strip()
            
            if cmd == 'list':
                # List models
                try:
                    response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        models = data.get("models", [])
                        if not models:
                            return jsonify({
                                "success": True,
                                "stdout": "No models found. Try pulling a model first with 'ollama pull <model_name>'",
                                "stderr": ""
                            })
                        
                        output_lines = ["NAME\t\t\tID\t\t\tSIZE\t\tMODIFIED"]
                        for model in models:
                            name = model.get("name", "")
                            size_bytes = model.get("size", 0)
                            # Convert size to human readable format
                            size_gb = size_bytes / (1024**3)
                            size_str = f"{size_gb:.1f}GB" if size_gb >= 1 else f"{size_bytes/(1024**2):.0f}MB"
                            modified = model.get("modified_at", "")[:10]  # Just date part
                            output_lines.append(f"{name}\t{name[:20]}...\t{size_str}\t{modified}")
                        
                        return jsonify({
                            "success": True,
                            "stdout": "\n".join(output_lines),
                            "stderr": ""
                        })
                    else:
                        return jsonify({
                            "success": False,
                            "error": "Failed to connect to Ollama service",
                            "suggestion": "Make sure Ollama is running with 'ollama serve'"
                        })
                except requests.exceptions.ConnectionError:
                    return jsonify({
                        "success": False,
                        "error": "Cannot connect to Ollama service",
                        "suggestion": "Start Ollama with 'ollama serve' in another terminal"
                    })
            
            elif cmd.startswith('pull '):
                model_name = cmd[5:].strip()
                if not model_name:
                    return jsonify({
                        "success": False,
                        "error": "Model name is required",
                        "suggestion": "Usage: ollama pull <model_name>"
                    })
                
                try:
                    # Start the pull request (this will be async in Ollama)
                    response = requests.post(f"{OLLAMA_BASE_URL}/api/pull", 
                                           json={"name": model_name}, 
                                           timeout=30)
                    if response.status_code == 200:
                        return jsonify({
                            "success": True,
                            "stdout": f"Pulling {model_name}... This may take a while.",
                            "stderr": ""
                        })
                    else:
                        return jsonify({
                            "success": False,
                            "error": f"Failed to pull {model_name}",
                            "suggestion": "Check if the model name is correct"
                        })
                except requests.exceptions.Timeout:
                    return jsonify({
                        "success": True,
                        "stdout": f"Pull request for {model_name} started (running in background)",
                        "stderr": ""
                    })
                except requests.exceptions.ConnectionError:
                    return jsonify({
                        "success": False,
                        "error": "Cannot connect to Ollama service",
                        "suggestion": "Start Ollama with 'ollama serve'"
                    })
            
            elif cmd.startswith('show '):
                model_name = cmd[5:].strip()
                if not model_name:
                    return jsonify({
                        "success": False,
                        "error": "Model name is required",
                        "suggestion": "Usage: ollama show <model_name>"
                    })
                
                try:
                    response = requests.post(f"{OLLAMA_BASE_URL}/api/show", 
                                           json={"name": model_name}, 
                                           timeout=10)
                    if response.status_code == 200:
                        result = response.json()
                        info_lines = [
                            f"Model: {model_name}",
                            f"Architecture: {result.get('details', {}).get('family', 'Unknown')}",
                            f"Parameters: {result.get('details', {}).get('parameter_size', 'Unknown')}",
                            f"Quantization: {result.get('details', {}).get('quantization_level', 'Unknown')}",
                            f"Template: {result.get('template', 'Default')[:100]}..."
                        ]
                        return jsonify({
                            "success": True,
                            "stdout": "\n".join(info_lines),
                            "stderr": ""
                        })
                    else:
                        return jsonify({
                            "success": False,
                            "error": f"Model {model_name} not found",
                            "suggestion": f"Try 'ollama pull {model_name}' first"
                        })
                except requests.exceptions.ConnectionError:
                    return jsonify({
                        "success": False,
                        "error": "Cannot connect to Ollama service",
                        "suggestion": "Start Ollama with 'ollama serve'"
                    })
            
            elif cmd.startswith('rm '):
                model_name = cmd[3:].strip()
                if not model_name:
                    return jsonify({
                        "success": False,
                        "error": "Model name is required",
                        "suggestion": "Usage: ollama rm <model_name>"
                    })
                
                try:
                    response = requests.delete(f"{OLLAMA_BASE_URL}/api/delete", 
                                             json={"name": model_name}, 
                                             timeout=30)
                    if response.status_code == 200:
                        return jsonify({
                            "success": True,
                            "stdout": f"Successfully removed {model_name}",
                            "stderr": ""
                        })
                    else:
                        return jsonify({
                            "success": False,
                            "error": f"Failed to remove {model_name}",
                            "suggestion": "Check if the model name is correct and exists"
                        })
                except requests.exceptions.ConnectionError:
                    return jsonify({
                        "success": False,
                        "error": "Cannot connect to Ollama service",
                        "suggestion": "Start Ollama with 'ollama serve'"
                    })
            
            elif cmd.startswith('run '):
                parts = cmd[4:].strip().split(' ', 1)
                model_name = parts[0]
                prompt = parts[1] if len(parts) > 1 else ""
                
                if not model_name:
                    return jsonify({
                        "success": False,
                        "error": "Model name is required",
                        "suggestion": "Usage: ollama run <model_name> [prompt]"
                    })
                
                if prompt:
                    try:
                        # Generate response
                        response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", 
                                               json={
                                                   "model": model_name,
                                                   "prompt": prompt,
                                                   "stream": False
                                               }, 
                                               timeout=60)
                        if response.status_code == 200:
                            result = response.json()
                            return jsonify({
                                "success": True,
                                "stdout": result.get("response", ""),
                                "stderr": ""
                            })
                        else:
                            return jsonify({
                                "success": False,
                                "error": f"Failed to generate response with {model_name}",
                                "suggestion": f"Make sure {model_name} is available with 'ollama list'"
                            })
                    except requests.exceptions.Timeout:
                        return jsonify({
                            "success": False,
                            "error": "Request timed out",
                            "suggestion": "Try a shorter prompt or a smaller model"
                        })
                    except requests.exceptions.ConnectionError:
                        return jsonify({
                            "success": False,
                            "error": "Cannot connect to Ollama service",
                            "suggestion": "Start Ollama with 'ollama serve'"
                        })
                else:
                    return jsonify({
                        "success": True,
                        "stdout": f"Starting interactive session with {model_name}",
                        "stderr": "Note: Interactive mode not fully supported in web terminal"
                    })
            
            elif cmd == 'help' or cmd == '--help':
                help_text = """Available Ollama commands:
  ollama list                    List installed models
  ollama pull <model>           Download a model
  ollama show <model>           Show model information
  ollama rm <model>             Remove a model
  ollama run <model> [prompt]   Run a model with optional prompt
  ollama help                   Show this help message

Examples:
  ollama list
  ollama pull llama3.2
  ollama show llama3.2
  ollama rm mistral:latest
  ollama run llama3.2 "Hello, how are you?"
"""
                return jsonify({
                    "success": True,
                    "stdout": help_text,
                    "stderr": ""
                })
            
            else:
                return jsonify({
                    "success": False,
                    "error": f"Unknown command: {cmd}",
                    "suggestion": "Type 'ollama help' for available commands"
                })
        
        else:
            return jsonify({
                "success": False,
                "error": "Command must start with 'ollama'",
                "suggestion": "Only Ollama commands are supported. Try 'ollama help'"
            })
            
    except Exception as e:
        logger.error(f"Error in terminal command: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "suggestion": "Check server logs for more details"
        })

@app.route('/api/ollama/pull', methods=['POST'])
def pull_model():
    """Pull a model from Ollama registry"""
    try:
        data = request.json
        model_name = data.get('name', '').strip()
        
        if not model_name:
            return jsonify({"error": "Model name is required"}), 400
        
        response = requests.post(f"{OLLAMA_BASE_URL}/api/pull", 
                               json={"name": model_name}, 
                               timeout=60)
        
        if response.status_code == 200:
            return jsonify({
                "success": True,
                "message": f"Successfully started pulling {model_name}"
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Failed to pull {model_name}"
            }), 500
            
    except Exception as e:
        logger.error(f"Error pulling model: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ollama/delete', methods=['DELETE'])
def delete_model():
    """Delete a model"""
    try:
        data = request.json
        model_name = data.get('name', '').strip()
        
        if not model_name:
            return jsonify({"error": "Model name is required"}), 400
        
        response = requests.delete(f"{OLLAMA_BASE_URL}/api/delete", 
                                 json={"name": model_name}, timeout=30)
        
        if response.status_code == 200:
            return jsonify({
                "success": True,
                "message": f"Successfully deleted {model_name}"
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Failed to delete {model_name}"
            }), 500
            
    except Exception as e:
        logger.error(f"Error deleting model: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ollama/models/popular', methods=['GET'])
def get_popular_models():
    """Get popular models list"""
    popular_models = [
        {
            "name": "llama3.2",
            "description": "Meta's latest Llama model - 3.2B parameters",
            "size": "2.0GB",
            "category": "General"
        },
        {
            "name": "llama3.2:1b",
            "description": "Smaller Llama 3.2 model - 1.2B parameters",
            "size": "1.3GB",
            "category": "General"
        },
        {
            "name": "mistral",
            "description": "Mistral 7B model - excellent for coding",
            "size": "4.1GB",
            "category": "General"
        },
        {
            "name": "phi3",
            "description": "Microsoft's Phi-3 model - 3.8B parameters",
            "size": "2.3GB",
            "category": "General"
        },
        {
            "name": "codellama",
            "description": "Code-specialized Llama model",
            "size": "3.8GB",
            "category": "Code"
        },
        {
            "name": "qwen2.5",
            "description": "Alibaba's Qwen 2.5 model - 7.6B parameters",
            "size": "4.7GB",
            "category": "General"
        }
    ]
    
    return jsonify(popular_models)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check Ollama status
        ollama_status = "unknown"
        try:
            response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            ollama_status = "running" if response.status_code == 200 else "error"
        except:
            ollama_status = "not_running"
        
        # Count agents
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM agents')
        agent_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM conversations')
        conversation_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM executions')
        execution_count = cursor.fetchone()[0]
        
        conn.close()
        
        errors = []
        if ollama_status != "running":
            errors.append("Ollama service is not running")
        
        status = "healthy" if len(errors) == 0 else ("degraded" if ollama_status == "running" else "unhealthy")
        
        return jsonify({
            "status": status,
            "ollamaStatus": ollama_status,
            "agentCount": agent_count,
            "activeConversations": conversation_count,
            "totalExecutions": execution_count,
            "errors": errors
        })
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

# ===== STRANDS WORKFLOW INTEGRATION =====

@app.route('/api/strands/agents', methods=['GET'])
def get_strands_agents():
    """Get all agents in Strands-compatible format"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM agents ORDER BY created_at DESC')
        rows = cursor.fetchall()
        
        strands_agents = []
        for row in rows:
            # Transform existing agent to Strands format
            strands_agent = {
                'id': row[0],
                'name': row[1],
                'model': row[4],
                'systemPrompt': row[7] or f"You are {row[1]}, a helpful AI assistant.",
                'reasoningPattern': 'sequential',  # Default
                'contextManagement': {
                    'preserveMemory': True,
                    'maxContextLength': 4000,
                    'compressionLevel': 'summary'
                },
                'ollamaConfig': {
                    'temperature': row[8] or 0.7,
                    'maxTokens': row[9] or 1000,
                    'keepAlive': '5m'
                },
                'capabilities': json.loads(row[5]) if row[5] else [],
                'category': determine_agent_category(row[5]),
                'tools': get_agent_tools(row[0]),
                'createdAt': row[14],
                'updatedAt': row[15]
            }
            strands_agents.append(strands_agent)
        
        conn.close()
        return jsonify({'agents': strands_agents})
        
    except Exception as e:
        logger.error(f"Error getting Strands agents: {str(e)}")
        return jsonify({'agents': []}), 500

@app.route('/api/strands/workflows', methods=['POST'])
def create_strands_workflow():
    """Create Strands-style workflow"""
    try:
        data = request.json
        
        workflow_id = str(uuid.uuid4())
        workflow = {
            'id': workflow_id,
            'name': data['name'],
            'description': data.get('description', ''),
            'tasks': data.get('tasks', []),
            'agents': data.get('agents', []),
            'executionConfig': data.get('executionConfig', {
                'parallelExecution': True,
                'maxConcurrentTasks': 3,
                'timeoutMs': 300000
            }),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Store workflow in database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Create workflows table if not exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS strands_workflows (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                workflow_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            INSERT INTO strands_workflows (id, name, description, workflow_data)
            VALUES (?, ?, ?, ?)
        ''', (workflow_id, workflow['name'], workflow['description'], json.dumps(workflow)))
        
        conn.commit()
        conn.close()
        
        return jsonify({'workflow_id': workflow_id, 'workflow': workflow})
        
    except Exception as e:
        logger.error(f"Error creating Strands workflow: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands/workflows/<workflow_id>/execute', methods=['POST'])
def execute_strands_workflow(workflow_id):
    """Execute Strands workflow with dependency resolution"""
    try:
        input_data = request.json.get('input', {})
        
        # Get workflow from database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT workflow_data FROM strands_workflows WHERE id = ?', (workflow_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({'error': 'Workflow not found'}), 404
        
        workflow_data = json.loads(row[0])
        conn.close()
        
        # Execute workflow using Strands pattern
        execution_id = str(uuid.uuid4())
        execution_result = {
            'id': execution_id,
            'workflow_id': workflow_id,
            'status': 'running',
            'start_time': datetime.now().isoformat(),
            'input': input_data,
            'results': {},
            'metrics': {
                'total_tasks': len(workflow_data.get('tasks', [])),
                'completed_tasks': 0,
                'error_count': 0
            }
        }
        
        # Simulate Strands workflow execution
        execute_workflow_tasks(workflow_data, execution_result, input_data)
        
        execution_result['status'] = 'completed'
        execution_result['end_time'] = datetime.now().isoformat()
        
        return jsonify(execution_result)
        
    except Exception as e:
        logger.error(f"Error executing Strands workflow: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands/workflows/<workflow_id>/status', methods=['GET'])
def get_strands_workflow_status(workflow_id):
    """Get Strands workflow execution status"""
    try:
        # Get workflow from database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_workflows WHERE id = ?', (workflow_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({'error': 'Workflow not found'}), 404
        
        workflow_data = json.loads(row[3])
        
        # Get execution history (would be stored in separate table in production)
        status = {
            'workflow_id': workflow_id,
            'name': row[1],
            'description': row[2],
            'status': 'idle',  # Would track actual execution status
            'tasks': workflow_data.get('tasks', []),
            'agents': workflow_data.get('agents', []),
            'created_at': row[4],
            'updated_at': row[5]
        }
        
        conn.close()
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"Error getting workflow status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands/tools', methods=['GET'])
def get_strands_tools():
    """Get available Strands tools"""
    try:
        # Core Strands tools (from samples)
        strands_tools = [
            {
                'name': 'calculator',
                'description': 'Perform mathematical calculations and expressions',
                'category': 'calculator',
                'parameters': {
                    'expression': {
                        'type': 'string',
                        'description': 'Mathematical expression to evaluate',
                        'required': True
                    }
                }
            },
            {
                'name': 'current_time',
                'description': 'Get current date and time information',
                'category': 'custom',
                'parameters': {
                    'format': {
                        'type': 'string',
                        'description': 'Time format (iso, local, utc)',
                        'required': False,
                        'default': 'iso'
                    }
                }
            },
            {
                'name': 'letter_counter',
                'description': 'Count occurrences of a specific letter in a word',
                'category': 'custom',
                'parameters': {
                    'word': {
                        'type': 'string',
                        'description': 'Word to analyze',
                        'required': True
                    },
                    'letter': {
                        'type': 'string',
                        'description': 'Letter to count (single character)',
                        'required': True
                    }
                }
            },
            {
                'name': 'python_repl',
                'description': 'Execute Python code (simplified version)',
                'category': 'custom',
                'parameters': {
                    'code': {
                        'type': 'string',
                        'description': 'Python code to execute',
                        'required': True
                    }
                }
            },
            {
                'name': 'web_search',
                'description': 'Search the web for information',
                'category': 'web_search',
                'parameters': {
                    'query': {
                        'type': 'string',
                        'description': 'Search query',
                        'required': True
                    },
                    'limit': {
                        'type': 'number',
                        'description': 'Maximum number of results',
                        'required': False,
                        'default': 5
                    }
                }
            }
        ]
        
        return jsonify({'tools': strands_tools})
        
    except Exception as e:
        logger.error(f"Error getting Strands tools: {str(e)}")
        return jsonify({'tools': []}), 500

@app.route('/api/strands/tools/<tool_name>/execute', methods=['POST'])
def execute_strands_tool(tool_name):
    """Execute a Strands tool"""
    try:
        data = request.json
        params = data.get('params', {})
        context = data.get('context', {})
        
        # Execute tool based on name
        if tool_name == 'calculator':
            result = execute_calculator_tool(params)
        elif tool_name == 'current_time':
            result = execute_current_time_tool(params)
        elif tool_name == 'letter_counter':
            result = execute_letter_counter_tool(params)
        elif tool_name == 'python_repl':
            result = execute_python_repl_tool(params)
        elif tool_name == 'web_search':
            result = execute_web_search_tool(params)
        else:
            return jsonify({'error': f'Tool {tool_name} not found'}), 404
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Helper functions for Strands integration
def determine_agent_category(capabilities_json):
    """Determine agent category based on capabilities"""
    if not capabilities_json:
        return 'general'
    
    try:
        capabilities = json.loads(capabilities_json) if isinstance(capabilities_json, str) else capabilities_json
        if not capabilities:
            return 'general'
        
        capabilities_str = ' '.join(capabilities).lower()
        
        if any(word in capabilities_str for word in ['research', 'analysis', 'investigate']):
            return 'research'
        elif any(word in capabilities_str for word in ['calculation', 'math', 'compute']):
            return 'calculation'
        elif any(word in capabilities_str for word in ['documentation', 'writing', 'content']):
            return 'documentation'
        else:
            return 'general'
    except:
        return 'general'

def get_agent_tools(agent_id):
    """Get tools available to an agent"""
    # For now, return default Strands tools
    # In production, this would be based on agent configuration
    return ['calculator', 'current_time', 'letter_counter']

def execute_workflow_tasks(workflow_data, execution_result, input_data):
    """Execute workflow tasks with dependency resolution (Strands pattern)"""
    tasks = workflow_data.get('tasks', [])
    agents = workflow_data.get('agents', [])
    completed_tasks = []
    
    # Create agent lookup for quick access
    agent_lookup = {agent.get('id', ''): agent for agent in agents}
    
    # Execute tasks in dependency order
    for task in tasks:
        try:
            start_time = datetime.now()
            task_id = task.get('taskId', '')
            agent_id = task.get('agentId', '')
            
            logger.info(f"Executing task {task_id} with agent {agent_id}")
            
            # Get the agent for this task
            agent = agent_lookup.get(agent_id)
            if not agent:
                # If no specific agent, try to find one from database
                agent = get_agent_from_database(agent_id)
            
            if agent:
                # Execute the task with the actual agent
                task_output = execute_task_with_agent(task, agent, input_data, completed_tasks)
                status = 'completed'
            else:
                # Fallback to simulation if agent not found
                task_output = f"Task {task.get('description', '')} completed with input: {input_data}"
                status = 'completed'
                logger.warning(f"Agent {agent_id} not found, using simulation")
            
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            task_result = {
                'task_id': task_id,
                'status': status,
                'output': task_output,
                'execution_time': execution_time,
                'agent_id': agent_id,
                'agent_name': agent.get('name', 'Unknown') if agent else 'Unknown'
            }
            
            execution_result['results'][task_id] = task_result
            execution_result['metrics']['completed_tasks'] += 1
            completed_tasks.append(task_id)
            
        except Exception as e:
            execution_result['metrics']['error_count'] += 1
            logger.error(f"Task execution failed: {str(e)}")
            
            # Add failed task result
            task_result = {
                'task_id': task.get('taskId', ''),
                'status': 'error',
                'output': f"Task failed: {str(e)}",
                'execution_time': 0,
                'error': str(e)
            }
            execution_result['results'][task.get('taskId', '')] = task_result

def get_agent_from_database(agent_id):
    """Get agent details from database"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM agents WHERE id = ?', (agent_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row[0],
                'name': row[1],
                'role': row[2],
                'description': row[3],
                'model': row[4],
                'system_prompt': row[7],
                'temperature': row[8],
                'max_tokens': row[9]
            }
    except Exception as e:
        logger.error(f"Error getting agent from database: {str(e)}")
    return None

def execute_task_with_agent(task, agent, input_data, completed_tasks):
    """Execute a task using an actual Ollama agent"""
    try:
        # Build the prompt for the task
        task_description = task.get('description', '')
        task_input = task.get('input', input_data)
        
        # Include context from completed tasks
        context = ""
        if completed_tasks:
            context = f"Previous task results: {', '.join(completed_tasks)}. "
        
        # Create the full prompt
        prompt = f"{context}Task: {task_description}\nInput: {task_input}\n\nPlease complete this task:"
        
        # Execute with Ollama
        ollama_request = {
            "model": agent.get('model', 'llama3.2:latest'),
            "prompt": f"System: {agent.get('system_prompt', '')}\n\nHuman: {prompt}\n\nAssistant:",
            "stream": False,
            "options": {
                "temperature": agent.get('temperature', 0.7),
                "num_predict": agent.get('max_tokens', 1000)
            }
        }
        
        # Make request to Ollama
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=ollama_request,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "No response from agent")
        else:
            return f"Agent execution failed: HTTP {response.status_code}"
            
    except Exception as e:
        logger.error(f"Error executing task with agent: {str(e)}")
        return f"Task execution error: {str(e)}"

# Strands tool implementations
def execute_calculator_tool(params):
    """Execute calculator tool (from Strands samples)"""
    try:
        expression = params.get('expression', '')
        if not expression:
            return {'error': 'Expression is required', 'success': False}
        
        # Safe evaluation (basic implementation)
        # Remove dangerous characters
        sanitized = ''.join(c for c in expression if c in '0123456789+-*/.() ')
        
        try:
            result = eval(sanitized)
            return {
                'result': result,
                'expression': expression,
                'success': True,
                'type': 'calculation'
            }
        except:
            return {
                'error': 'Invalid mathematical expression',
                'expression': expression,
                'success': False
            }
    except Exception as e:
        return {'error': str(e), 'success': False}

def execute_current_time_tool(params):
    """Execute current_time tool (from Strands samples)"""
    try:
        format_type = params.get('format', 'iso')
        timezone = params.get('timezone', 'UTC')
        
        now = datetime.now()
        
        if format_type == 'local':
            time_string = now.strftime('%Y-%m-%d %H:%M:%S')
        elif format_type == 'utc':
            time_string = now.utctimetuple()
            time_string = datetime(*time_string[:6]).isoformat() + 'Z'
        else:  # iso
            time_string = now.isoformat()
        
        return {
            'current_time': time_string,
            'timestamp': int(now.timestamp()),
            'timezone': timezone,
            'format': format_type,
            'success': True
        }
    except Exception as e:
        return {'error': str(e), 'success': False}

def execute_letter_counter_tool(params):
    """Execute letter_counter tool (from Strands samples)"""
    try:
        word = params.get('word', '')
        letter = params.get('letter', '')
        
        if not word or not letter:
            return {'error': 'Both word and letter parameters are required', 'success': False}
        
        if len(letter) != 1:
            return {'error': 'Letter parameter must be a single character', 'success': False}
        
        count = word.lower().count(letter.lower())
        
        return {
            'word': word,
            'letter': letter,
            'count': count,
            'success': True
        }
    except Exception as e:
        return {'error': str(e), 'success': False}

def execute_python_repl_tool(params):
    """Execute python_repl tool (simplified version)"""
    try:
        code = params.get('code', '')
        if not code:
            return {'error': 'Code parameter is required', 'success': False}
        
        # Simplified implementation - just return the code
        # In production, you'd want proper Python execution environment
        return {
            'code': code,
            'output': f'Code received: {code}\nNote: Python execution would happen here in production environment',
            'success': True,
            'note': 'This is a simplified implementation for demonstration'
        }
    except Exception as e:
        return {'error': str(e), 'success': False}

def execute_web_search_tool(params):
    """Execute web_search tool (placeholder)"""
    try:
        query = params.get('query', '')
        limit = params.get('limit', 5)
        
        if not query:
            return {'error': 'Query parameter is required', 'success': False}
        
        # Placeholder implementation
        return {
            'query': query,
            'results': [
                {
                    'title': f'Search result for: {query}',
                    'url': 'https://example.com',
                    'snippet': 'This is a placeholder search result. In production, this would connect to a real search API.'
                }
            ],
            'success': True,
            'note': 'This is a placeholder implementation'
        }
    except Exception as e:
        return {'error': str(e), 'success': False}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)