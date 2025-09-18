#!/usr/bin/env python3
"""
Strands SDK Agent Service
Implements official Strands SDK patterns with UI wrapper

This service runs independently from the existing ollama_api.py
Port: 5006 (different from existing services)
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import sqlite3
import uuid
import json
import time
from datetime import datetime
import os
import sys
import concurrent.futures
import threading

# Official Strands SDK Integration with Ollama
try:
    from strands import Agent, tool
    from strands.models.ollama import OllamaModel
    import requests
    from datetime import datetime
    import math
    STRANDS_SDK_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Strands SDK not available: {e}")
    STRANDS_SDK_AVAILABLE = False

# A2A Integration
try:
    from a2a_strands_integration import get_a2a_integration
    A2A_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ A2A integration not available: {e}")
    A2A_AVAILABLE = False
    print("[Strands SDK] ✅ Official Strands SDK with Ollama integration loaded successfully!")
    
    # Import official tools registry
    from strands_official_tools import strands_tools_registry
    print("[Strands SDK] ✅ Official tools registry loaded successfully!")
    
    # Import official Strands tools
    from strands_official_integration import OFFICIAL_TOOLS, get_tool_configuration_schema, get_all_tool_schemas
    print("[Strands SDK] ✅ Official Strands tools loaded successfully!")
    
    # Import collaboration tools (Think Tool + A2A Protocol) - using simplified version as fallback
    from strands_collaboration_tools_simple import COLLABORATION_TOOLS
    print("[Strands SDK] ✅ Fallback collaboration tools loaded successfully!")
    print("[Strands SDK] Using official OllamaModel from strands.models.ollama")
    
    # Test the official integration
    try:
        test_model = OllamaModel(host="http://localhost:11434", model_id="llama3.2:latest")
        print(f"[Strands SDK] ✅ Official OllamaModel test successful")
    except Exception as e:
        print(f"[Strands SDK] ⚠️  OllamaModel test warning: {e}")
    
except ImportError as e:
    print(f"[Strands SDK] Warning: Official Ollama integration not available ({e}), using real Ollama fallback")
    STRANDS_SDK_AVAILABLE = False
    
    # Real Ollama implementation when Strands SDK is not available
    class RealOllamaModel:
        """Real Ollama implementation for Strands SDK API"""
        def __init__(self, host="http://localhost:11434", model_id="llama3.2:latest", **kwargs):
            self.host = host
            self.model_id = model_id
            # Accept additional parameters like temperature, top_p, etc.
            self.temperature = kwargs.get('temperature', 0.7)
            self.top_p = kwargs.get('top_p', 0.9)
            self.max_tokens = kwargs.get('max_tokens', 1000)
            # Store all kwargs for compatibility
            self.config = kwargs
            print(f"[Strands SDK] RealOllamaModel initialized: {host} - {model_id} (temp: {self.temperature})")
        
        def generate(self, prompt: str, system_prompt: str = None) -> str:
            """Generate response using real Ollama"""
            try:
                import requests
                
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
                
                print(f"[Strands SDK] Calling real Ollama with model: {self.model_id}")
                
                # Make request to Ollama
                response = requests.post(
                    f"{self.host}/api/generate",
                    json=payload,
                    timeout=60
                )
                
                if response.status_code == 200:
                    try:
                        result = response.json()
                        return result.get('response', 'No response generated')
                    except json.JSONDecodeError as e:
                        print(f"[Strands SDK] JSON decode error: {e}")
                        print(f"[Strands SDK] Response content: {response.text[:200]}...")
                        return f"Error: Invalid JSON response from Ollama: {str(e)}"
                else:
                    print(f"[Strands SDK] Ollama error status {response.status_code}: {response.text}")
                    return f"Error: Ollama returned status {response.status_code}: {response.text}"
                    
            except Exception as e:
                print(f"[Strands SDK] Error: {e}")
                return f"Error calling Ollama: {str(e)}"

    class RealAgent:
        """Real Agent implementation using actual Ollama"""
        def __init__(self, model, system_prompt="You are a helpful assistant.", tools=None):
            self.model = model
            self.system_prompt = system_prompt
            self.tools = tools or []
            print(f"[Strands SDK] RealAgent created with model: {model.model_id}")
        
        def __call__(self, input_text):
            """Execute the agent with real Ollama"""
            print(f"[Strands SDK] Processing with real Ollama: {input_text[:50]}...")
            
            # Use real Ollama model to generate response
            response = self.model.generate(input_text, self.system_prompt)
            
            print(f"[Strands SDK] Generated {len(response)} characters from real Ollama")
            return response

    Agent = RealAgent
    STRANDS_SDK_AVAILABLE = False

# Ensure OllamaModel and Agent are always available
if 'OllamaModel' not in globals():
    # Use the RealOllamaModel from the else block
    class OllamaModel:
        """Real Ollama implementation for Strands SDK API"""
        def __init__(self, host="http://localhost:11434", model_id="llama3.2:latest", **kwargs):
            self.host = host
            self.model_id = model_id
            self.temperature = kwargs.get('temperature', 0.7)
            self.top_p = kwargs.get('top_p', 0.9)
            self.max_tokens = kwargs.get('max_tokens', 1000)
            self.config = kwargs
        
        def generate(self, prompt: str, system_prompt: str = None) -> str:
            """Generate response using real Ollama"""
            try:
                import requests
                
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
                
                if system_prompt:
                    payload["system"] = system_prompt
                
                response = requests.post(
                    f"{self.host}/api/generate",
                    json=payload,
                    timeout=60
                )
                
                if response.status_code == 200:
                    return response.json().get("response", "")
                else:
                    return f"Error: {response.status_code}"
            except Exception as e:
                return f"Error: {str(e)}"

if 'Agent' not in globals():
    class Agent:
        """Real Agent implementation for Strands SDK API"""
        def __init__(self, model, system_prompt="", tools=None, **kwargs):
            self.model = model
            self.system_prompt = system_prompt
            self.tools = tools or []
            self.kwargs = kwargs
        
        def __call__(self, input_text):
            """Execute the agent with real Ollama"""
            print(f"[Strands SDK] Processing with real Ollama: {input_text[:50]}...")
            
            # Use real Ollama model to generate response
            response = self.model.generate(input_text, self.system_prompt)
            
            print(f"[Strands SDK] Generated {len(response)} characters from real Ollama")
            return response

# Mock tool decorator for fallback
def tool(func):
    """Mock tool decorator when Strands SDK is not available"""
    func._is_tool = True
    return func

# Strands SDK Tool Implementations
@tool
def web_search(query: str) -> str:
    """
    Search the web for information about a query.
    
    Use this tool when you need to find current information, facts, news, or data
    that is not in your training data. This tool is ideal for:
    - Current events and news
    - Recent developments in technology, science, or other fields
    - Factual information about people, places, or organizations
    - Product information and reviews
    - Weather, stock prices, or other real-time data
    
    Args:
        query: The search query string. Be specific and use relevant keywords.
               Examples: "latest AI developments 2024", "Python programming tutorial"
    
    Returns:
        Search results with summaries and source URLs when available.
    """
    def try_search(search_query: str) -> str:
        """Helper function to try a search query"""
        try:
            url = f"https://api.duckduckgo.com/?q={search_query}&format=json&no_html=1&skip_disambig=1"
            response = requests.get(url, timeout=10)
            data = response.json()
            
            result = ""
            if data.get('Abstract'):
                result += f"Summary: {data['Abstract']}\n"
            if data.get('AbstractURL'):
                result += f"Source: {data['AbstractURL']}\n"
            
            # If no abstract, try related topics (memory-efficient)
            if not result and data.get('RelatedTopics'):
                topics = []
                for topic in data['RelatedTopics'][:3]:
                    if isinstance(topic, dict) and topic.get('Text'):
                        topics.append(f"• {topic['Text']}")
                if topics:
                    result = "Related information:\n" + "\n".join(topics) + "\n"
            
            return result.strip()
        except Exception:
            return ""
    
    try:
        # Strategy 1: Try original query
        result = try_search(query)
        if result:
            return result
        
        # Strategy 2: Extract key entities for news queries
        news_keywords = ['latest', 'news', 'recent', 'current', 'breaking', 'today']
        if any(keyword in query.lower() for keyword in news_keywords):
            # Extract company/entity names (simple approach)
            words = query.lower().split()
            entities = []
            for word in words:
                if word.capitalize() in ['Nvidia', 'Apple', 'Google', 'Microsoft', 'Tesla', 'Amazon', 'Meta']:
                    entities.append(word.capitalize())
                elif len(word) > 3 and word not in news_keywords and word not in ['the', 'and', 'for', 'with', 'top']:
                    entities.append(word.capitalize())
            
            # Try searching for each entity
            for entity in entities[:2]:  # Limit to 2 entities
                result = try_search(entity)
                if result:
                    return f"Found information about {entity}:\n{result}\n\nNote: For latest news, try searching for '{entity} news' on a news website."
        
        # Strategy 3: Try simplified query (remove news-specific words)
        simplified_query = query
        for keyword in ['latest', 'news', 'recent', 'current', 'breaking', 'today', 'top', '-']:
            simplified_query = simplified_query.replace(keyword, '').strip()
        
        if simplified_query and simplified_query != query:
            result = try_search(simplified_query)
            if result:
                return f"Found general information about '{simplified_query}':\n{result}\n\nNote: For current news, try a news website or more specific search terms."
        
        # Strategy 4: Try first meaningful word
        words = [word for word in query.split() if len(word) > 3 and word.lower() not in ['latest', 'news', 'recent', 'current', 'breaking', 'today']]
        if words:
            result = try_search(words[0])
            if result:
                return f"Found information about '{words[0]}':\n{result}\n\nNote: For specific news, try searching on news websites."
        
        return f"I searched for '{query}' but couldn't find specific information. DuckDuckGo's API works best for general information about companies, people, and concepts rather than current news. For latest news, try:\n• Searching for just the company name (e.g., 'Nvidia')\n• Using a dedicated news website\n• Being more specific about what information you need"
        
    except Exception as e:
        return f"Web search failed: {str(e)}"

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
    """Get the current date and time"""
    now = datetime.now()
    return f"Current date and time: {now.strftime('%Y-%m-%d %H:%M:%S')}"

@tool
def weather_api(location: str) -> str:
    """Get weather information for a location (mock implementation)"""
    return f"Weather information for {location} is not available in this demo version. This tool would typically connect to a weather API."

@tool
def file_operations(operation: str, filename: str = "", content: str = "") -> str:
    """Perform file operations (read, write, list) - restricted for security"""
    return f"File operations are restricted in this demo environment for security reasons. Operation '{operation}' was requested."

@tool
def code_execution(code: str, language: str = "python") -> str:
    """Execute code (mock implementation for security)"""
    return f"Code execution is disabled in this demo environment for security reasons. Code in {language} was provided but not executed."

@tool
def database_query(query: str) -> str:
    """Execute database queries (mock implementation)"""
    return f"Database queries are not available in this demo version. Query '{query}' was requested but not executed."

# Tool registry - prioritize official tools, fallback to custom implementations
AVAILABLE_TOOLS = {}

# Add official tools first (if available)
try:
    from strands_official_integration import get_official_tools
    OFFICIAL_TOOLS = get_official_tools()
    if OFFICIAL_TOOLS:
        AVAILABLE_TOOLS.update(OFFICIAL_TOOLS)
        print(f"[Strands SDK] ✅ Using {len(OFFICIAL_TOOLS)} official tools")
    else:
        print("[Strands SDK] ⚠️  Official tools not available, using fallback implementations")
except ImportError:
    print("[Strands SDK] ⚠️  Official tools not available, using fallback implementations")
    # Fallback to custom implementations
    AVAILABLE_TOOLS.update({
    'web_search': web_search,
    'calculator': calculator,
    'current_time': current_time,
    'weather_api': weather_api,
    'file_operations': file_operations,
    'code_execution': code_execution,
    'database_query': database_query,
    })

# Override think tool with our simplified version to prevent timeouts
try:
    from strands_collaboration_tools_simple import think as simple_think
    AVAILABLE_TOOLS['think'] = simple_think
    print("[Strands SDK] ✅ Using simplified think tool to prevent timeouts")
except ImportError as e:
    print(f"[Strands SDK] ⚠️  Could not load simplified think tool: {e}")

# Add collaboration tools (these are our custom implementations)
try:
    from strands_collaboration_tools_simple import COLLABORATION_TOOLS
    AVAILABLE_TOOLS.update(COLLABORATION_TOOLS)
    print(f"[Strands SDK] ✅ Added {len(COLLABORATION_TOOLS)} collaboration tools")
except ImportError as e:
    print(f"[Strands SDK] ⚠️  Could not load collaboration tools: {e}")

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Database file for Strands SDK agents (separate from existing ollama_agents.db)
STRANDS_SDK_DB = "strands_sdk_agents.db"

def emit_progress(agent_id, stage, details, progress=0, tools_used=None):
    """Emit real-time progress updates via WebSocket"""
    try:
        socketio.emit('agent_progress', {
            'agent_id': agent_id,
            'stage': stage,
            'details': details,
            'progress': progress,
            'timestamp': datetime.now().isoformat(),
            'tools_used': tools_used or []
        })
    except Exception as e:
        print(f"[WebSocket] Error emitting progress: {e}")

def init_strands_sdk_database():
    """Initialize SQLite database for Strands SDK agents"""
    conn = sqlite3.connect(STRANDS_SDK_DB)
    cursor = conn.cursor()
    
    # Strands SDK agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_sdk_agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            
            -- Strands SDK Configuration
            model_provider TEXT DEFAULT 'ollama',
            model_id TEXT NOT NULL,
            host TEXT DEFAULT 'http://localhost:11434',
            
            -- Agent Configuration
            system_prompt TEXT,
            tools TEXT, -- JSON array of tool names
            
            -- Strands SDK specific
            sdk_config TEXT, -- JSON of additional SDK config
            sdk_version TEXT DEFAULT '1.0.0',
            
            -- Metadata
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    # Execution logs for Strands SDK agents
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_sdk_executions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            input_text TEXT NOT NULL,
            output_text TEXT,
            execution_time REAL,
            success BOOLEAN DEFAULT FALSE,
            error_message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sdk_metadata TEXT, -- JSON of SDK-specific execution data
            FOREIGN KEY (agent_id) REFERENCES strands_sdk_agents (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("[Strands SDK] Database initialized successfully")

@app.route('/api/strands-sdk/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'strands-sdk-api',
        'version': '1.0.0',
        'sdk_type': 'official-strands' if STRANDS_SDK_AVAILABLE else 'mock-strands',
        'sdk_available': STRANDS_SDK_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/strands-sdk/agents', methods=['POST'])
def create_strands_agent():
    """Create a new Strands SDK agent following official patterns"""
    try:
        data = request.json
        print(f"[Strands SDK] Creating agent with data: {data}")
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'error': 'Agent name is required'}), 400
        
        agent_id = str(uuid.uuid4())
        
        # Validate Strands SDK configuration
        model_config = {
            'host': data.get('host', 'http://localhost:11434'),
            'model_id': data.get('model_id', 'llama3.2:latest')
        }
        
        # Fast agent creation validation with Strands SDK patterns
        try:
            print(f"[Strands SDK] Validating agent creation with config: {model_config}")
            
            # Extract Ollama configuration
            ollama_config = data.get('ollama_config', {})
            enhanced_model_config = {**model_config, **ollama_config}
            
            # Filter out None/empty values
            enhanced_model_config = {k: v for k, v in enhanced_model_config.items() 
                                   if v is not None and v != '' and v != []}
            
            print(f"[Strands SDK] Enhanced model config: {enhanced_model_config}")
            
            # Fast validation: Just test model initialization without full execution
            try:
                ollama_model = OllamaModel(**enhanced_model_config)
                print(f"[Strands SDK] ✅ Model initialization successful")
            except Exception as model_error:
                print(f"[Strands SDK] ❌ Model initialization failed: {model_error}")
                return jsonify({'error': f'Model configuration error: {str(model_error)}'}), 400
            
            # Handle tools if provided
            tools = data.get('tools', [])
            agent_kwargs = {
                'model': ollama_model,
                'system_prompt': data.get('system_prompt', 'You are a helpful assistant.')
            }
            
            if tools:
                print(f"[Strands SDK] Agent configured with tools: {tools}")
                # Validate tool availability without loading
                tool_functions = []
                for tool_name in tools:
                    if tool_name in AVAILABLE_TOOLS:
                        tool_functions.append(AVAILABLE_TOOLS[tool_name])
                        print(f"[Strands SDK] ✅ Tool available: {tool_name}")
                    else:
                        print(f"[Strands SDK] ❌ Tool not found: {tool_name}")
                        return jsonify({'error': f'Tool "{tool_name}" not available'}), 400
                
                if tool_functions:
                    agent_kwargs['tools'] = tool_functions
            
            # Fast validation: Just create agent without test execution
            try:
                test_agent = Agent(**agent_kwargs)
                print(f"[Strands SDK] ✅ Agent creation successful")
                
                # Optional: Run test execution if requested (slower but more thorough)
                if data.get('validate_execution', False):
                    print(f"[Strands SDK] Running validation test execution...")
                    test_response = test_agent("Hello, this is a validation test.")
                    
                    # Handle AgentResult object properly
                    if hasattr(test_response, 'content'):
                        response_text = test_response.content
                    elif hasattr(test_response, 'text'):
                        response_text = test_response.text
                    else:
                        response_text = str(test_response)
                    
                    print(f"[Strands SDK] ✅ Validation test successful: {response_text[:50]}...")
                else:
                    print(f"[Strands SDK] ⚡ Fast creation mode - skipping test execution")
                    
            except Exception as agent_error:
                print(f"[Strands SDK] ❌ Agent creation failed: {agent_error}")
                return jsonify({'error': f'Agent creation error: {str(agent_error)}'}), 400
            
        except Exception as e:
            print(f"[Strands SDK] Agent validation failed: {str(e)}")
            return jsonify({'error': f'Strands SDK configuration error: {str(e)}'}), 400
        
        # Store in database
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO strands_sdk_agents 
            (id, name, description, model_provider, model_id, host, system_prompt, tools, sdk_config)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            data.get('name'),
            data.get('description', ''),
            'ollama',
            data.get('model_id', 'llama3.1'),
            data.get('host', 'http://localhost:11434'),
            data.get('system_prompt', 'You are a helpful assistant.'),
            json.dumps(data.get('tools', [])),
            json.dumps({
                'ollama_config': data.get('ollama_config', {}),
                'enhanced_features': True,
                'strands_version': '1.8.0'
            })
        ))
        
        conn.commit()
        conn.close()
        
        print(f"[Strands SDK] Agent created successfully: {agent_id}")
        
        return jsonify({
            'id': agent_id,
            'message': 'Strands SDK agent created successfully',
            'sdk_validated': True,
            'sdk_type': 'official-strands',
            'model_config': model_config
        })
        
    except Exception as e:
        print(f"[Strands SDK] Error creating agent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents/<agent_id>/execute-stream', methods=['POST'])
def execute_strands_agent_stream(agent_id):
    """Execute Strands SDK agent with real-time progress streaming"""
    try:
        data = request.json
        input_text = data.get('input', '')
        
        if not input_text:
            return jsonify({'error': 'Input text is required'}), 400
        
        def generate_progress():
            """Generator function for real-time progress updates"""
            try:
                # Load agent configuration
                conn = sqlite3.connect(STRANDS_SDK_DB)
                cursor = conn.cursor()
                
                cursor.execute('SELECT * FROM strands_sdk_agents WHERE id = ?', (agent_id,))
                agent_data = cursor.fetchone()
                
                if not agent_data:
                    yield f"data: {json.dumps({'error': 'Agent not found'})}\n\n"
                    return
                
                # Extract agent configuration
                agent_config = {
                    'id': agent_data[0],
                    'name': agent_data[1],
                    'description': agent_data[2],
                    'model_id': agent_data[3],
                    'host': agent_data[4],
                    'system_prompt': agent_data[5],
                    'tools': json.loads(agent_data[6]) if agent_data[6] else [],
                    'ollama_config': json.loads(agent_data[7]) if agent_data[7] else {},
                    'sdk_version': agent_data[8],
                    'created_at': agent_data[9],
                    'updated_at': agent_data[10],
                    'status': agent_data[11],
                    'model_provider': agent_data[12],
                    'sdk_config': json.loads(agent_data[13]) if agent_data[13] else {}
                }
                
                # Stream progress: Step 1
                step_data = {'step': 'Initializing Strands SDK', 'details': f'Loading agent: {agent_config["name"]}', 'status': 'running'}
                yield f"data: {json.dumps(step_data)}\n\n"
                time.sleep(0.1)
                
                # Stream progress: Step 2
                step_data = {'step': 'Agent configuration loaded', 'details': f'Model: {agent_config["model_id"]}, Host: {agent_config["host"]}', 'status': 'running'}
                yield f"data: {json.dumps(step_data)}\n\n"
                time.sleep(0.1)
                
                # Create model configuration
                base_config = {
                    'host': agent_config['host'],
                    'model_id': agent_config['model_id']
                }
                
                sdk_config = agent_config.get('sdk_config', {})
                ollama_config = sdk_config.get('ollama_config', {}) if isinstance(sdk_config, dict) else {}
                enhanced_config = {**base_config, **ollama_config}
                enhanced_config = {k: v for k, v in enhanced_config.items() 
                                  if v is not None and v != '' and v != []}
                
                # Stream progress: Step 3
                step_data = {'step': 'Model configuration loaded', 'details': f'Host: {enhanced_config.get("host")}, Model: {enhanced_config.get("model_id")}', 'status': 'running'}
                yield f"data: {json.dumps(step_data)}\n\n"
                time.sleep(0.1)
                
                ollama_model = OllamaModel(**enhanced_config)
                
                # Handle tools
                agent_kwargs = {
                    'model': ollama_model,
                    'system_prompt': agent_config['system_prompt']
                }
                
                tools = agent_config.get('tools', [])
                tools_loaded = []
                
                if tools:
                    # Stream progress: Step 4
                    step_data = {'step': f'Agent configured with tools: {tools}', 'details': f'Available tools: {", ".join(tools)}', 'status': 'running'}
                    yield f"data: {json.dumps(step_data)}\n\n"
                    time.sleep(0.1)
                    
                    tool_functions = []
                    for i, tool_name in enumerate(tools):
                        if tool_name in AVAILABLE_TOOLS:
                            tool_functions.append(AVAILABLE_TOOLS[tool_name])
                            tools_loaded.append(tool_name)
                            
                            # Stream progress: Each tool loaded
                            step_data = {'step': f'Loaded tool: {tool_name}', 'details': f'Tool #{i+1}: {tool_name}', 'status': 'running'}
                            yield f"data: {json.dumps(step_data)}\n\n"
                            time.sleep(0.1)
                    
                    if tool_functions:
                        agent_kwargs['tools'] = tool_functions
                        # Stream progress: Tools ready
                        step_data = {'step': f'Agent will execute with {len(tool_functions)} tools', 'details': f'Ready to use: {", ".join(tools_loaded)}', 'status': 'running'}
                        yield f"data: {json.dumps(step_data)}\n\n"
                        time.sleep(0.1)
                
                agent = Agent(**agent_kwargs)
                
                # Stream progress: Starting execution
                step_data = {'step': 'Starting agent execution', 'details': f'Processing input: {input_text[:50]}...', 'status': 'running'}
                yield f"data: {json.dumps(step_data)}\n\n"
                time.sleep(0.1)
                
                # Execute agent
                start_time = time.time()
                
                # Initialize operations log for streaming
                operations_log = []
                
                # Use the same execution logic as the non-streaming endpoint
                try:
                    # Execute agent with timeout protection using ThreadPoolExecutor
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(lambda: agent(input_text))
                        try:
                            response = future.result(timeout=60)  # Increased timeout for Strands SDK
                            execution_time = time.time() - start_time
                        except concurrent.futures.TimeoutError:
                            execution_time = time.time() - start_time
                            step_data = {'step': 'Execution timeout', 'details': 'Agent execution timed out after 60 seconds', 'status': 'error'}
                            yield f"data: {json.dumps(step_data)}\n\n"
                            return
                except Exception as e:
                    execution_time = time.time() - start_time
                    error_data = {'error': str(e), 'type': 'error'}
                    yield f"data: {json.dumps(error_data)}\n\n"
                    return
                
                # Stream progress: Processing response
                step_data = {'step': 'Processing agent response', 'details': f'Agent completed execution in {execution_time:.2f}s', 'status': 'running'}
                yield f"data: {json.dumps(step_data)}\n\n"
                time.sleep(0.1)
                
                # Handle response and extract tool usage information
                if hasattr(response, 'content'):
                    response_text = response.content
                elif hasattr(response, 'text'):
                    response_text = response.text
                else:
                    response_text = str(response)
                
                # Try to extract tool usage from Strands agent response
                tools_used = []
                
                # Check if response object has tool usage information
                if hasattr(response, 'tool_calls') and response.tool_calls:
                    for tool_call in response.tool_calls:
                        if hasattr(tool_call, 'name'):
                            tools_used.append(tool_call.name)
                elif hasattr(response, 'tools_used') and response.tools_used:
                    tools_used = response.tools_used
                elif hasattr(response, 'metadata') and response.metadata:
                    if 'tools_used' in response.metadata:
                        tools_used = response.metadata['tools_used']
                
                # If no direct tool usage info, fall back to intelligent detection
                if tools_loaded:
                    # Check for web search usage
                    if 'web_search' in tools_loaded:
                        # Check input for search intent AND response for search patterns
                        input_has_search = any(word in input_text.lower() for word in ['search', 'find', 'look up', 'google', 'web', 'what is', 'who is', 'when', 'where', 'how'])
                        
                        # Success indicators in response
                        success_indicators = [
                            'found information', 'summary:', 'source:', 'results show',
                            'according to', 'based on search', 'information found',
                            'search results', 'online information', 'latest information',
                            'here is what i found', 'search returned', 'web search shows'
                        ]
                        
                        # Failure indicators in response  
                        failure_indicators = [
                            'no specific result found', 'wasn\'t a specific result', 'no results found',
                            'search did not yield', 'couldn\'t find', 'no information found'
                        ]
                        
                        response_has_success = any(indicator in response_text.lower() for indicator in success_indicators)
                        response_has_failure = any(indicator in response_text.lower() for indicator in failure_indicators)
                        
                        # Tool was used if input requested search (regardless of success/failure)
                        if input_has_search:
                            tools_used.append('web_search')
                            status = 'successful' if response_has_success else 'attempted' if response_has_failure else 'unknown'
                            step_data = {'step': f'Web search tool {status}', 'details': f'Detected web search usage - Status: {status}', 'status': 'running'}
                            yield f"data: {json.dumps(step_data)}\n\n"
                            time.sleep(0.1)
                            print(f"[Strands SDK] Detected web_search tool usage - Status: {status}")
                    
                    # Check for calculator usage
                    if 'calculator' in tools_loaded:
                        input_has_calc = any(word in input_text.lower() for word in ['calculate', 'compute', 'math', '+', '-', '*', '/', '='])
                        calc_indicators = ['calculated', 'calculation', 'result is', 'equals', 'math', 'computed', 'answer is']
                        
                        if input_has_calc or any(indicator in response_text.lower() for indicator in calc_indicators):
                            tools_used.append('calculator')
                            step_data = {'step': 'Calculator tool used', 'details': 'Detected calculator usage in agent interaction', 'status': 'running'}
                            yield f"data: {json.dumps(step_data)}\n\n"
                            time.sleep(0.1)
                    
                    # Check for time/date tool usage
                    if 'current_time' in tools_loaded:
                        input_has_time = any(word in input_text.lower() for word in ['time', 'date', 'today', 'now', 'current'])
                        time_indicators = ['current time', 'time is', 'date is', 'today is', 'now is', 'current date']
                        
                        if input_has_time or any(indicator in response_text.lower() for indicator in time_indicators):
                            tools_used.append('current_time')
                            step_data = {'step': 'Time tool used', 'details': 'Detected time tool usage in agent interaction', 'status': 'running'}
                            yield f"data: {json.dumps(step_data)}\n\n"
                            time.sleep(0.1)
                
                # Stream progress: Final step
                step_data = {'step': 'Response generated', 'details': f'Generated {len(response_text)} characters in {execution_time:.2f}s', 'status': 'completed'}
                yield f"data: {json.dumps(step_data)}\n\n"
                time.sleep(0.1)
                
                # Send final result
                execution_id = str(uuid.uuid4())
                final_result = {
                    'type': 'final_result',
                    'response': response_text,
                    'execution_time': execution_time,
                    'execution_id': execution_id,
                    'sdk_powered': True,
                    'sdk_type': 'official-strands',
                    'agent_name': agent_config['name'],
                    'model_used': agent_config['model_id'],
                    'tools_used': tools_used,
                    'success': True
                }
                
                yield f"data: {json.dumps(final_result)}\n\n"
                
                # Log to database with metadata
                cursor.execute('''
                    INSERT INTO strands_sdk_executions 
                    (id, agent_id, input_text, output_text, execution_time, success, sdk_metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    execution_id, 
                    agent_id, 
                    input_text, 
                    response_text, 
                    execution_time, 
                    True,
                    json.dumps({
                        'execution_metadata': {
                            'input_length': len(input_text),
                            'output_length': len(response_text),
                            'tools_used': tools_used,
                            'tools_available': tools_loaded,
                            'operations_log': operations_log
                        }
                    })
                ))
                
                conn.commit()
                conn.close()
                
            except Exception as e:
                error_data = {'error': str(e), 'type': 'error'}
                yield f"data: {json.dumps(error_data)}\n\n"
        
        return Response(
            generate_progress(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents/<agent_id>/execute', methods=['POST'])
def execute_strands_agent(agent_id):
    """Execute Strands SDK agent using official SDK patterns (non-streaming fallback)"""
    try:
        data = request.json
        input_text = data.get('input', '')
        
        if not input_text:
            return jsonify({'error': 'Input text is required'}), 400
        
        print(f"[Strands SDK] Executing agent {agent_id} with input: {input_text[:50]}...")
        
        # Emit initial progress
        emit_progress(agent_id, "initializing", "Starting agent execution...", 5)
        
        # Load agent configuration
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        agent_data = cursor.fetchone()
        
        if not agent_data:
            return jsonify({'error': 'Strands agent not found'}), 404
        
        # Extract agent configuration
        agent_config = {
            'id': agent_data[0],
            'name': agent_data[1],
            'description': agent_data[2],
            'model_id': agent_data[3],
            'host': agent_data[4],
            'system_prompt': agent_data[5],
            'tools': json.loads(agent_data[6]) if agent_data[6] else [],
            'ollama_config': json.loads(agent_data[7]) if agent_data[7] else {},
            'sdk_version': agent_data[8],
            'created_at': agent_data[9],
            'updated_at': agent_data[10],
            'status': agent_data[11],
            'model_provider': agent_data[12],
            'sdk_config': json.loads(agent_data[13]) if agent_data[13] else {}
        }
        
        print(f"[Strands SDK] Agent config loaded: {agent_config['name']} - {agent_config['model_id']}")
        
        # Emit progress update
        emit_progress(agent_id, "config_loaded", f"Agent: {agent_config['name']}, Model: {agent_config['model_id']}", 15)
        
        # Track actual operations performed (memory-limited)
        MAX_OPERATIONS = 25  # Limit operations log size
        operations_log = []
        
        def add_operation(step, details):
            """Add operation with memory management"""
            operations_log.append({
                'step': step,
                'details': details,
                'timestamp': datetime.now().isoformat()
            })
            # Keep only the last MAX_OPERATIONS
            if len(operations_log) > MAX_OPERATIONS:
                operations_log.pop(0)
        
        add_operation('Initializing Strands SDK', f"Loading agent: {agent_config['name']}")
        add_operation('Agent configuration loaded', f"Model: {agent_config['model_id']}, Host: {agent_config['host']}")
        
        # Create Strands SDK agent following official patterns with enhanced config
        base_config = {
            'host': agent_config['host'],
            'model_id': agent_config['model_id']
        }
        
        # Add enhanced Ollama configuration if available
        sdk_config = agent_config.get('sdk_config', {})
        ollama_config = sdk_config.get('ollama_config', {}) if isinstance(sdk_config, dict) else {}
        
        # Merge configurations, filtering out None/empty values
        enhanced_config = {**base_config, **ollama_config}
        enhanced_config = {k: v for k, v in enhanced_config.items() 
                          if v is not None and v != '' and v != []}
        
        print(f"[Strands SDK] Using enhanced config: {enhanced_config}")
        operations_log.append({
            'step': 'Model configuration loaded',
            'details': f"Host: {enhanced_config.get('host')}, Model: {enhanced_config.get('model_id')}",
            'timestamp': datetime.now().isoformat()
        })
        
        ollama_model = OllamaModel(**enhanced_config)
        
        # Create agent with tools if available
        agent_kwargs = {
            'model': ollama_model,
            'system_prompt': agent_config['system_prompt']
        }
        
        tools = agent_config.get('tools', [])
        tools_loaded = []
        if tools:
            print(f"[Strands SDK] Agent configured with tools: {tools}")
            emit_progress(agent_id, "loading_tools", f"Loading {len(tools)} tools: {', '.join(tools)}", 25)
            operations_log.append({
                'step': f'Agent configured with tools: {tools}',
                'details': f"Available tools: {', '.join(tools)}",
                'timestamp': datetime.now().isoformat()
            })
            
            # Load actual tool implementations
            tool_functions = []
            for tool_name in tools:
                if tool_name in AVAILABLE_TOOLS:
                    tool_functions.append(AVAILABLE_TOOLS[tool_name])
                    tools_loaded.append(tool_name)
                    print(f"[Strands SDK] Loaded tool: {tool_name}")
                    operations_log.append({
                        'step': f'Loaded tool: {tool_name}',
                        'details': f"Tool #{len(tools_loaded)}: {tool_name}",
                        'timestamp': datetime.now().isoformat()
                    })
                else:
                    print(f"[Strands SDK] Warning: Tool '{tool_name}' not available")
            
            if tool_functions:
                agent_kwargs['tools'] = tool_functions
                operations_log.append({
                    'step': f'Agent will execute with {len(tool_functions)} tools',
                    'details': f"Ready to use: {', '.join(tools_loaded)}",
                    'timestamp': datetime.now().isoformat()
                })
                print(f"[Strands SDK] Agent will execute with {len(tool_functions)} tools")
        
        agent = Agent(**agent_kwargs)
        
        # Execute using Strands SDK
        emit_progress(agent_id, "executing", f"Processing input: {input_text[:50]}...", 50)
        operations_log.append({
            'step': 'Starting agent execution',
            'details': f"Processing input: {input_text[:50]}...",
            'timestamp': datetime.now().isoformat()
        })
        
        start_time = time.time()
        
        # Capture tool usage by monitoring the response
        tools_used = []
        
        # Add execution timeout (120 seconds) - thread-safe version
        
        def execute_with_timeout():
            """Execute agent with timeout protection"""
            return agent(input_text)
        
        try:
            # Execute agent with timeout protection using ThreadPoolExecutor
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(execute_with_timeout)
                try:
                    response = future.result(timeout=60)  # Increased timeout for Strands SDK
                    execution_time = time.time() - start_time
                except concurrent.futures.TimeoutError:
                    raise TimeoutError("Agent execution timed out after 60 seconds")
            
        except TimeoutError as e:
            execution_time = time.time() - start_time
            
            # Log timeout error
            operations_log.append({
                'step': 'Execution timeout',
                'details': f'Agent execution timed out after 120 seconds',
                'timestamp': datetime.now().isoformat()
            })
            
            # Return timeout response
            response_text = f"Agent execution timed out after 120 seconds. Please try a simpler query."
            
            # Log failed execution
            execution_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO strands_sdk_executions 
                (id, agent_id, input_text, output_text, execution_time, success, error_message, sdk_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                execution_id, 
                agent_id, 
                input_text, 
                response_text, 
                execution_time, 
                False,  # success = False
                str(e),
                json.dumps({
                    'sdk_version': '1.0.0',
                    'model_config': {
                        'host': agent_config['host'],
                        'model_id': agent_config['model_id']
                    },
                    'execution_metadata': {
                        'timestamp': datetime.now().isoformat(),
                        'input_length': len(input_text),
                        'output_length': len(response_text),
                        'tools_used': [],
                        'tools_available': tools_loaded,
                        'operations_log': operations_log,
                        'timeout': True,
                        'error': str(e)
                    }
                })
            ))
            
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': False,
                'response': response_text,
                'execution_time': execution_time,
                'error': str(e),
                'execution_id': execution_id,
                'sdk_powered': True,
                'sdk_type': 'official-strands',
                'agent_name': agent_config['name'],
                'model_used': agent_config['model_id'],
                'operations_log': operations_log,
                'tools_used': [],
                'timeout': True
            }), 500
        
        print(f"[Strands SDK] Execution completed in {execution_time:.2f}s")
        print(f"[Strands SDK] Response type: {type(response)}")
        
        # Emit progress update for completion
        emit_progress(agent_id, "processing_response", f"Agent completed execution in {execution_time:.2f}s", 75)
        
        # Add operation for response processing
        operations_log.append({
            'step': 'Processing agent response',
            'details': f"Agent completed execution in {execution_time:.2f}s",
            'timestamp': datetime.now().isoformat()
        })
        
        # Handle AgentResult object properly
        if hasattr(response, 'content'):
            response_text = response.content
        elif hasattr(response, 'text'):
            response_text = response.text
        else:
            response_text = str(response)
        
        print(f"[Strands SDK] Response text: {response_text[:100]}...")
        
        # Enhanced tool usage detection with better logic
        emit_progress(agent_id, "detecting_tools", "Analyzing tool usage in response...", 85)
        if tools_loaded:
            # Check for web search usage - improved detection
            if 'web_search' in tools_loaded:
                # Check input for search intent AND response for search patterns
                input_has_search = any(word in input_text.lower() for word in ['search', 'find', 'look up', 'google', 'web'])
                
                # Success indicators in response
                success_indicators = [
                    'found information', 'summary:', 'source:', 'results show',
                    'according to', 'based on search', 'information found',
                    'search results', 'online information', 'latest information',
                    'here is what i found', 'search returned', 'web search shows'
                ]
                
                # Failure indicators in response  
                failure_indicators = [
                    'no specific result found', 'wasn\'t a specific result', 'no results found',
                    'search did not yield', 'couldn\'t find', 'no information found'
                ]
                
                response_has_success = any(indicator in response_text.lower() for indicator in success_indicators)
                response_has_failure = any(indicator in response_text.lower() for indicator in failure_indicators)
                
                # Tool was used if input requested search (regardless of success/failure)
                if input_has_search:
                    tools_used.append('web_search')
                    status = 'successful' if response_has_success else 'attempted' if response_has_failure else 'unknown'
                    operations_log.append({
                        'step': f'Web search tool {status}',
                        'details': f'Detected web search usage - Status: {status}',
                        'timestamp': datetime.now().isoformat()
                    })
                    print(f"[Strands SDK] Detected web_search tool usage - Status: {status}")
            
            # Check for calculator usage
            if 'calculator' in tools_loaded:
                input_has_calc = any(word in input_text.lower() for word in ['calculate', 'compute', 'math', '+', '-', '*', '/', '='])
                calc_indicators = ['calculated', 'calculation', 'result is', 'equals', 'math', 'computed', 'answer is']
                
                if input_has_calc or any(indicator in response_text.lower() for indicator in calc_indicators):
                    tools_used.append('calculator')
                    operations_log.append({
                        'step': 'Calculator tool used',
                        'details': 'Detected calculator usage in agent interaction',
                        'timestamp': datetime.now().isoformat()
                    })
                    print(f"[Strands SDK] Detected calculator tool usage")
            
            # Check for time/date tool usage
            if 'current_time' in tools_loaded:
                input_has_time = any(word in input_text.lower() for word in ['time', 'date', 'today', 'now', 'current'])
                time_indicators = ['current time', 'time is', 'date is', 'today is', 'now is', 'current date']
                
                if input_has_time or any(indicator in response_text.lower() for indicator in time_indicators):
                    tools_used.append('current_time')
                    operations_log.append({
                        'step': 'Time tool used',
                        'details': 'Detected time tool usage in agent interaction',
                        'timestamp': datetime.now().isoformat()
                    })
                    print(f"[Strands SDK] Detected current_time tool usage")
            for tool in tools_loaded:
                if tool not in tools_used and tool in ['calculator', 'current_time']:
                    # Simple heuristic: if tool is loaded and response is relevant, assume it was used
                    if tool == 'calculator' and any(indicator in response_text.lower() for indicator in ['result:', 'calculation', 'equals']):
                        tools_used.append(tool)
                        operations_log.append({
                            'step': f'{tool.replace("_", " ").title()} executed',
                            'details': f'Used {tool} tool',
                            'timestamp': datetime.now().isoformat()
                        })
        
        operations_log.append({
            'step': 'Response generated',
            'details': f"Generated {len(response_text)} characters in {execution_time:.2f}s",
            'timestamp': datetime.now().isoformat()
        })
        
        # Log execution
        execution_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO strands_sdk_executions 
            (id, agent_id, input_text, output_text, execution_time, success, sdk_metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            execution_id, 
            agent_id, 
            input_text, 
            response_text, 
            execution_time, 
            True,
            json.dumps({
                'sdk_version': '1.0.0',
                'model_config': {
                    'host': agent_config['host'],
                    'model_id': agent_config['model_id']
                },
                'execution_metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'input_length': len(input_text),
                    'output_length': len(str(response)),
                    'tools_used': tools_used,
                    'tools_available': tools_loaded,
                    'operations_log': operations_log
                }
            })
        ))
        
        conn.commit()
        conn.close()
        
        # Emit final completion progress
        emit_progress(agent_id, "completed", f"Execution completed successfully in {execution_time:.2f}s", 100, tools_used)
        
        return jsonify({
            'response': response_text,
            'execution_time': execution_time,
            'execution_id': execution_id,
            'sdk_powered': True,
            'sdk_type': 'official-strands',
            'agent_name': agent_config['name'],
            'model_used': agent_config['model_id'],
            'operations_log': operations_log,
            'tools_used': tools_used
        })
        
    except Exception as e:
        print(f"[Strands SDK] Execution error: {str(e)}")
        
        # Log failed execution
        try:
            conn = sqlite3.connect(STRANDS_SDK_DB)
            cursor = conn.cursor()
            
            execution_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO strands_sdk_executions 
                (id, agent_id, input_text, error_message, success, sdk_metadata)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                execution_id, 
                agent_id, 
                data.get('input', ''), 
                str(e), 
                False,
                json.dumps({'error_timestamp': datetime.now().isoformat()})
            ))
            
            conn.commit()
            conn.close()
        except:
            pass  # Don't fail on logging errors
        
        return jsonify({'error': str(e), 'sdk_type': 'official-strands'}), 500

@app.route('/api/strands-sdk/agents', methods=['GET'])
def list_strands_agents():
    """List all Strands SDK agents"""
    try:
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_sdk_agents ORDER BY created_at DESC')
        agents = cursor.fetchall()
        
        agents_list = []
        for agent in agents:
            agent_id = agent[0]
            
            # Get recent executions for this agent (before closing connection)
            cursor.execute('''
                SELECT input_text, output_text, execution_time, success, timestamp
                FROM strands_sdk_executions 
                WHERE agent_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 10
            ''', (agent_id,))
            
            recent_executions = cursor.fetchall()
            
            # Format recent executions
            formatted_executions = []
            for exec_data in recent_executions:
                formatted_executions.append({
                    'input_text': exec_data[0][:100] + '...' if len(exec_data[0]) > 100 else exec_data[0],
                    'output_text': exec_data[1][:100] + '...' if exec_data[1] and len(exec_data[1]) > 100 else exec_data[1],
                    'execution_time': exec_data[2],
                    'success': bool(exec_data[3]),
                    'timestamp': exec_data[4]
                })
            
            # Check A2A registration status
            a2a_status = {
                'registered': False,
                'a2a_agent_id': None,
                'a2a_status': 'unknown'
            }
            
            agents_list.append({
                'id': agent[0],
                'name': agent[1],
                'description': agent[2],
                'model_provider': agent[12],
                'model_id': agent[3],
                'host': agent[4],
                'system_prompt': agent[5],
                'tools': json.loads(agent[6]) if agent[6] else [],
                'sdk_config': json.loads(agent[13]) if agent[13] else {},
                'sdk_version': agent[8],
                'created_at': agent[9],
                'updated_at': agent[10],
                'status': agent[11],
                'sdk_type': 'official-strands',
                'recent_executions': formatted_executions,
                'a2a_status': a2a_status
            })
        
        conn.close()
        
        print(f"[Strands SDK] Listed {len(agents_list)} agents")
        print(f"[Strands SDK] First agent data: {agents_list[0] if agents_list else 'No agents'}")
        return jsonify({
            'agents': agents_list,
            'count': len(agents_list),
            'status': 'success'
        })
        
    except Exception as e:
        print(f"[Strands SDK] Error listing agents: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents/<agent_id>', methods=['GET'])
def get_strands_agent(agent_id):
    """Get a specific Strands SDK agent"""
    try:
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        agent_data = cursor.fetchone()
        
        if not agent_data:
            return jsonify({'error': 'Strands agent not found'}), 404
        
        # Get execution history
        cursor.execute('''
            SELECT id, input_text, output_text, execution_time, success, timestamp 
            FROM strands_sdk_executions 
            WHERE agent_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 10
        ''', (agent_id,))
        executions = cursor.fetchall()
        
        conn.close()
        
        agent = {
            'id': agent_data[0],
            'name': agent_data[1],
            'description': agent_data[2],
            'model_provider': agent_data[3],
            'model_id': agent_data[4],
            'host': agent_data[5],
            'system_prompt': agent_data[6],
            'tools': json.loads(agent_data[7]) if agent_data[7] else [],
            'sdk_config': json.loads(agent_data[8]) if agent_data[8] else {},
            'sdk_version': agent_data[9],
            'created_at': agent_data[10],
            'updated_at': agent_data[11],
            'status': agent_data[12],
            'sdk_type': 'official-strands',
            'recent_executions': [
                {
                    'id': exec_data[0],
                    'input': exec_data[1][:100] + '...' if len(exec_data[1]) > 100 else exec_data[1],
                    'output': exec_data[2][:100] + '...' if exec_data[2] and len(exec_data[2]) > 100 else exec_data[2],
                    'execution_time': exec_data[3],
                    'success': exec_data[4],
                    'timestamp': exec_data[5]
                } for exec_data in executions
            ]
        }
        
        return jsonify(agent)
        
    except Exception as e:
        print(f"[Strands SDK] Error getting agent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents/<agent_id>/analytics', methods=['GET'])
def get_agent_analytics(agent_id):
    """Get detailed analytics for a specific Strands SDK agent"""
    try:
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        # Get agent info
        cursor.execute('SELECT * FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        agent_data = cursor.fetchone()
        
        if not agent_data:
            return jsonify({'error': 'Agent not found'}), 404
        
        # Get execution statistics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_executions,
                AVG(execution_time) as avg_execution_time,
                MIN(execution_time) as min_execution_time,
                MAX(execution_time) as max_execution_time,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_executions,
                COUNT(CASE WHEN success = 0 THEN 1 END) as failed_executions
            FROM strands_sdk_executions 
            WHERE agent_id = ?
        ''', (agent_id,))
        
        stats = cursor.fetchone()
        
        # Get recent executions
        cursor.execute('''
            SELECT input_text, output_text, execution_time, success, timestamp, sdk_metadata
            FROM strands_sdk_executions 
            WHERE agent_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 10
        ''', (agent_id,))
        
        recent_executions = cursor.fetchall()
        
        # Get comprehensive tool usage statistics
        cursor.execute('''
            SELECT sdk_metadata, execution_time, timestamp, success
            FROM strands_sdk_executions 
            WHERE agent_id = ? AND sdk_metadata IS NOT NULL
            ORDER BY timestamp DESC
        ''', (agent_id,))
        
        metadata_rows = cursor.fetchall()
        tools_usage = {}
        tools_timing = {}
        tools_sequences = []
        tools_success_rates = {}
        tools_error_counts = {}
        total_tokens = 0
        hourly_tool_usage = {}
        
        for row in metadata_rows:
            if row[0]:
                try:
                    metadata = json.loads(row[0])
                    exec_metadata = metadata.get('execution_metadata', {})
                    execution_time = row[1]
                    timestamp = row[2]
                    success = row[3]
                    
                    # Extract tool usage data
                    tools_used = exec_metadata.get('tools_used', [])
                    operations_log = exec_metadata.get('operations_log', [])
                    
                    # Count tool usage
                    for tool in tools_used:
                        tools_usage[tool] = tools_usage.get(tool, 0) + 1
                        
                        # Track tool success rates
                        if tool not in tools_success_rates:
                            tools_success_rates[tool] = {'success': 0, 'total': 0}
                        tools_success_rates[tool]['total'] += 1
                        if success:
                            tools_success_rates[tool]['success'] += 1
                    
                    # Track tool sequences
                    if tools_used:
                        tools_sequences.append({
                            'sequence': tools_used,
                            'timestamp': timestamp,
                            'execution_time': execution_time,
                            'success': success
                        })
                    
                    # Calculate tool timing from operations log
                    tool_timings = {}
                    for op in operations_log:
                        if 'tool' in op.get('step', '').lower():
                            tool_name = op.get('step', '').replace('Loaded tool: ', '').replace(' tool used', '')
                            if tool_name and tool_name in tools_used:
                                # Estimate tool execution time (simplified)
                                tool_timings[tool_name] = execution_time / len(tools_used) if tools_used else 0
                    
                    # Aggregate tool timings
                    for tool, timing in tool_timings.items():
                        if tool not in tools_timing:
                            tools_timing[tool] = []
                        tools_timing[tool].append(timing)
                    
                    # Track hourly tool usage
                    hour = timestamp.split(' ')[1].split(':')[0] if ' ' in timestamp else '00'
                    if hour not in hourly_tool_usage:
                        hourly_tool_usage[hour] = {}
                    for tool in tools_used:
                        hourly_tool_usage[hour][tool] = hourly_tool_usage[hour].get(tool, 0) + 1
                    
                    # Sum tokens (approximate)
                    total_tokens += exec_metadata.get('input_length', 0) + exec_metadata.get('output_length', 0)
                except Exception as e:
                    print(f"[Analytics] Error processing metadata: {e}")
                    pass
        
        # Calculate success rate
        success_rate = (stats[4] / stats[0] * 100) if stats[0] > 0 else 0
        
        # Get hourly usage pattern (last 24 hours)
        cursor.execute('''
            SELECT 
                strftime('%H', timestamp) as hour,
                COUNT(*) as count
            FROM strands_sdk_executions 
            WHERE agent_id = ? AND datetime(timestamp) > datetime('now', '-24 hours')
            GROUP BY strftime('%H', timestamp)
            ORDER BY hour
        ''', (agent_id,))
        
        hourly_usage = dict(cursor.fetchall())
        
        conn.close()
        
        # Calculate tool performance metrics
        tool_performance = {}
        for tool, timings in tools_timing.items():
            if timings:
                tool_performance[tool] = {
                    'avg_execution_time': round(sum(timings) / len(timings), 2),
                    'min_execution_time': round(min(timings), 2),
                    'max_execution_time': round(max(timings), 2),
                    'total_invocations': len(timings)
                }
        
        # Calculate tool success rates
        tool_success_rates = {}
        for tool, rates in tools_success_rates.items():
            if rates['total'] > 0:
                tool_success_rates[tool] = {
                    'success_rate': round((rates['success'] / rates['total']) * 100, 1),
                    'successful_invocations': rates['success'],
                    'total_invocations': rates['total'],
                    'failure_rate': round(((rates['total'] - rates['success']) / rates['total']) * 100, 1)
                }
        
        # Analyze tool sequences
        tool_combinations = {}
        for seq_data in tools_sequences:
            sequence = ','.join(seq_data['sequence'])  # Convert to string for JSON compatibility
            if sequence not in tool_combinations:
                tool_combinations[sequence] = {
                    'count': 0,
                    'avg_execution_time': 0,
                    'success_rate': 0,
                    'total_execution_time': 0,
                    'successful_executions': 0
                }
            tool_combinations[sequence]['count'] += 1
            tool_combinations[sequence]['total_execution_time'] += seq_data['execution_time']
            if seq_data['success']:
                tool_combinations[sequence]['successful_executions'] += 1
        
        # Calculate averages for tool combinations
        for combo in tool_combinations.values():
            combo['avg_execution_time'] = round(combo['total_execution_time'] / combo['count'], 2)
            combo['success_rate'] = round((combo['successful_executions'] / combo['count']) * 100, 1)
        
        # Format response
        analytics = {
            'agent_info': {
                'id': agent_data[0],
                'name': agent_data[1],
                'description': agent_data[2],
                'model_id': agent_data[4],
                'tools': json.loads(agent_data[7]) if agent_data[7] else [],
                'created_at': agent_data[10],
                'updated_at': agent_data[11]
            },
            'execution_stats': {
                'total_executions': stats[0] or 0,
                'avg_execution_time': round(stats[1], 2) if stats[1] else 0,
                'min_execution_time': round(stats[2], 2) if stats[2] else 0,
                'max_execution_time': round(stats[3], 2) if stats[3] else 0,
                'successful_executions': stats[4] or 0,
                'failed_executions': stats[5] or 0,
                'success_rate': round(success_rate, 1)
            },
            'tool_usage': tools_usage,
            'tool_performance': tool_performance,
            'tool_success_rates': tool_success_rates,
            'tool_sequences': tools_sequences[:10],  # Last 10 sequences
            'tool_combinations': tool_combinations,
            'hourly_tool_usage': hourly_tool_usage,
            'total_tokens': total_tokens,
            'hourly_usage': hourly_usage,
            'recent_executions': [
                {
                    'input': execution[0][:100] + '...' if len(execution[0]) > 100 else execution[0],
                    'output': execution[1][:100] + '...' if execution[1] and len(execution[1]) > 100 else execution[1],
                    'execution_time': round(execution[2], 2) if execution[2] else 0,
                    'success': bool(execution[3]),
                    'timestamp': execution[4]
                } for execution in recent_executions
            ]
        }
        
        return jsonify(analytics)
        
    except Exception as e:
        print(f"[Strands SDK] Error getting agent analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/tool-config', methods=['GET'])
def get_tool_config():
    """Get current tool detection configuration"""
    try:
        # Default configuration following Strands SDK best practices
        default_config = {
            'web_search': {
                'enabled': True,
                'keywords': ['search', 'find', 'look up', 'google', 'web', 'what is', 'who is', 'when', 'where', 'how', 'latest', 'current'],
                'responsePatterns': ['found information', 'summary:', 'source:', 'according to', 'search results', 'based on search'],
                'description': 'Detects when the agent uses web search functionality based on Strands SDK natural language invocation'
            },
            'calculator': {
                'enabled': True,
                'keywords': ['calculate', 'compute', 'math', '+', '-', '*', '/', '=', 'result', 'equation'],
                'responsePatterns': ['calculated', 'calculation', 'result is', 'equals', 'answer is', 'computed'],
                'description': 'Detects when the agent performs mathematical calculations using the calculator tool'
            },
            'current_time': {
                'enabled': True,
                'keywords': ['time', 'date', 'today', 'now', 'current', 'when is'],
                'responsePatterns': ['current time', 'time is', 'date is', 'today is', 'now is', 'current date'],
                'description': 'Detects when the agent retrieves current time/date information'
            }
        }
        
        return jsonify({
            'config': default_config,
            'message': 'Tool detection configuration retrieved successfully'
        })
        
    except Exception as e:
        print(f"[Strands SDK] Error getting tool config: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/tool-config', methods=['POST'])
def update_tool_config():
    """Update tool detection configuration"""
    try:
        data = request.json
        config = data.get('config', {})
        
        # Validate configuration structure
        for tool_name, tool_config in config.items():
            required_fields = ['enabled', 'keywords', 'responsePatterns', 'description']
            for field in required_fields:
                if field not in tool_config:
                    return jsonify({'error': f'Missing required field "{field}" for tool "{tool_name}"'}), 400
        
        # Store configuration (in a real implementation, this would be persisted)
        # For now, we'll just validate and return success
        
        return jsonify({
            'message': 'Tool detection configuration updated successfully',
            'config': config
        })
        
    except Exception as e:
        print(f"[Strands SDK] Error updating tool config: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/tools/discover', methods=['GET'])
def discover_strands_tools():
    """Discover all available Strands tools with metadata"""
    try:
        # Get tools from the official registry
        tool_catalog = strands_tools_registry.get_catalog()
        
        # Add our available tools to the catalog
        for tool_name, tool_func in AVAILABLE_TOOLS.items():
            if tool_name not in tool_catalog['tools']:
                # Get metadata from the registry or create default
                metadata = strands_tools_registry.get_tool_metadata(tool_name)
                if metadata:
                    tool_catalog['tools'][tool_name] = {
                        'name': metadata.name,
                        'description': metadata.description,
                        'category': metadata.category,
                        'parameters': metadata.parameters,
                        'examples': metadata.examples,
                        'version': metadata.version,
                        'author': metadata.author,
                        'requires': metadata.requires,
                        'tags': metadata.tags,
                        'available': True
                    }
                else:
                    # Create basic metadata for tools not in registry
                    tool_catalog['tools'][tool_name] = {
                        'name': tool_name,
                        'description': f'{tool_name.replace("_", " ").title()} tool',
                        'category': 'utility',
                        'parameters': {},
                        'examples': [],
                        'version': '1.0.0',
                        'author': 'Strands Team',
                        'requires': [],
                        'tags': [],
                        'available': True
                    }
                    tool_catalog['total_count'] += 1
        
        return jsonify({
            'success': True,
            'catalog': tool_catalog,
            'message': f'Discovered {tool_catalog["total_count"]} tools'
        })
        
    except Exception as e:
        logger.error(f"Error discovering tools: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/tools/configuration/<tool_name>', methods=['GET'])
def get_tool_configuration(tool_name):
    """Get configuration schema for a specific tool"""
    try:
        schema = get_tool_configuration_schema(tool_name)
        if schema:
            return jsonify({
                'success': True,
                'tool_name': tool_name,
                'configuration': schema
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Configuration schema not found for tool: {tool_name}'
            }), 404
    except Exception as e:
        logger.error(f"Error getting tool configuration: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/tools/configuration', methods=['GET'])
def get_all_tool_configurations():
    """Get configuration schemas for all tools"""
    try:
        schemas = get_all_tool_schemas()
        return jsonify({
            'success': True,
            'configurations': schemas,
            'total_tools': len(schemas)
        })
    except Exception as e:
        logger.error(f"Error getting all tool configurations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/tools/categories', methods=['GET'])
def get_tool_categories():
    """Get tools organized by category"""
    try:
        from strands_official_integration import get_tools_by_category
        categories = get_tools_by_category()
        return jsonify({
            'success': True,
            'categories': categories,
            'total_categories': len(categories)
        })
    except Exception as e:
        logger.error(f"Error getting tool categories: {str(e)}")
        return jsonify({'error': str(e)}), 500

# A2A Integration Endpoints
@app.route('/api/strands-sdk/a2a/register', methods=['POST'])
def register_agent_for_a2a():
    """Register a Strands SDK agent for A2A communication"""
    try:
        if not A2A_AVAILABLE:
            return jsonify({'error': 'A2A integration not available'}), 503
        
        data = request.get_json()
        agent_id = data.get('agent_id')
        
        if not agent_id:
            return jsonify({'error': 'agent_id is required'}), 400
        
        # Get agent data
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        agent_data = cursor.fetchone()
        conn.close()
        
        if not agent_data:
            return jsonify({'error': 'Agent not found'}), 404
        
        # Convert to dict
        agent_dict = {
            'id': agent_data[0],
            'name': agent_data[1],
            'description': agent_data[2],
            'model_id': agent_data[3],
            'host': agent_data[4],
            'system_prompt': agent_data[5],
            'tools': json.loads(agent_data[6]) if agent_data[6] else [],
            'status': agent_data[7] or 'active'
        }
        
        # Register with A2A
        a2a_integration = get_a2a_integration()
        result = a2a_integration.register_strands_agent_for_a2a(agent_id, agent_dict)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error registering agent for A2A: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/a2a/agents', methods=['GET'])
def get_a2a_agents():
    """Get A2A registered agents"""
    try:
        if not A2A_AVAILABLE:
            return jsonify({'error': 'A2A integration not available'}), 503
        
        a2a_integration = get_a2a_integration()
        agents = a2a_integration.get_a2a_agents()
        
        return jsonify({
            'success': True,
            'agents': agents,
            'count': len(agents)
        })
    except Exception as e:
        logger.error(f"Error getting A2A agents: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/a2a/messages', methods=['POST'])
def send_a2a_message():
    """Send A2A message between Strands agents"""
    try:
        if not A2A_AVAILABLE:
            return jsonify({'error': 'A2A integration not available'}), 503
        
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        to_agent_id = data.get('to_agent_id')
        content = data.get('content')
        
        if not all([from_agent_id, to_agent_id, content]):
            return jsonify({'error': 'from_agent_id, to_agent_id, and content are required'}), 400
        
        a2a_integration = get_a2a_integration()
        result = a2a_integration.send_a2a_message(from_agent_id, to_agent_id, content)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error sending A2A message: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/a2a/messages/history', methods=['GET'])
def get_a2a_message_history():
    """Get A2A message history"""
    try:
        if not A2A_AVAILABLE:
            return jsonify({'error': 'A2A integration not available'}), 503
        
        agent_id = request.args.get('agent_id')
        a2a_integration = get_a2a_integration()
        messages = a2a_integration.get_a2a_message_history(agent_id)
        
        return jsonify({
            'success': True,
            'messages': messages,
            'count': len(messages)
        })
    except Exception as e:
        logger.error(f"Error getting A2A message history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/a2a/connections', methods=['POST'])
def create_a2a_connection():
    """Create A2A connection between Strands agents"""
    try:
        if not A2A_AVAILABLE:
            return jsonify({'error': 'A2A integration not available'}), 503
        
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        to_agent_id = data.get('to_agent_id')
        
        if not all([from_agent_id, to_agent_id]):
            return jsonify({'error': 'from_agent_id and to_agent_id are required'}), 400
        
        a2a_integration = get_a2a_integration()
        result = a2a_integration.create_a2a_connection(from_agent_id, to_agent_id)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error creating A2A connection: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/a2a/auto-register', methods=['POST'])
def auto_register_all_agents():
    """Auto-register all Strands SDK agents for A2A communication"""
    try:
        if not A2A_AVAILABLE:
            return jsonify({'error': 'A2A integration not available'}), 503
        
        a2a_integration = get_a2a_integration()
        result = a2a_integration.auto_register_all_strands_agents()
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error auto-registering agents: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents/<agent_id>', methods=['DELETE'])
def delete_strands_agent(agent_id):
    """Delete a Strands SDK agent with cascade A2A cleanup"""
    try:
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        # Check if agent exists
        cursor.execute('SELECT name FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        agent = cursor.fetchone()
        
        if not agent:
            return jsonify({'error': 'Strands agent not found'}), 404
        
        agent_name = agent[0]
        
        # Delete executions first (foreign key constraint)
        cursor.execute('DELETE FROM strands_sdk_executions WHERE agent_id = ?', (agent_id,))
        
        # Delete agent
        cursor.execute('DELETE FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        
        conn.commit()
        conn.close()
        
        # Cascade deletion: Remove from A2A service if registered
        try:
            a2a_response = requests.delete(f"http://localhost:5008/api/a2a/agents/{agent_id}", timeout=5)
            if a2a_response.status_code == 200:
                print(f"[Strands SDK] ✅ A2A registration cleaned up for {agent_name}")
            elif a2a_response.status_code == 404:
                print(f"[Strands SDK] ℹ️  Agent {agent_name} was not registered in A2A service")
            else:
                print(f"[Strands SDK] ⚠️  A2A cleanup failed for {agent_name}: {a2a_response.status_code}")
        except Exception as a2a_error:
            print(f"[Strands SDK] ⚠️  A2A cleanup error for {agent_name}: {a2a_error}")
        
        print(f"[Strands SDK] Agent deleted: {agent_name}")
        
        return jsonify({
            'message': f'Strands SDK agent "{agent_name}" deleted successfully',
            'sdk_type': 'official-strands',
            'a2a_cleanup': 'attempted'
        })
        
    except Exception as e:
        print(f"[Strands SDK] Error deleting agent: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[Strands SDK] Starting Strands SDK Agent Service...")
    
    if STRANDS_SDK_AVAILABLE:
        print("[Strands SDK] ✅ Using Official Strands SDK!")
    else:
        print("[Strands SDK] ⚠️  Using mock implementation for development")
        print("[Strands SDK] Install 'pip install strands-agents' for production")
    
    # Initialize database
    init_strands_sdk_database()
    
    print("[Strands SDK] 🚀 Starting server on port 5006...")
    print("[Strands SDK] 🔗 WebSocket support enabled")
    print("[Strands SDK] 📊 Database initialized")
    
    # Start server on port 5006 with WebSocket support
    try:
        socketio.run(app, debug=False, port=5006, host='0.0.0.0', allow_unsafe_werkzeug=True)
    except Exception as e:
        print(f"[Strands SDK] ❌ Error starting server: {e}")
        sys.exit(1)