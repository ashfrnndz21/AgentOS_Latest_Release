#!/usr/bin/env python3
"""
Official Strands Tools Integration
Integrates with the official strands-agents-tools package
"""

import logging
from typing import Dict, Any, List, Optional
from strands import tool

logger = logging.getLogger(__name__)

# Import official Strands tools with error handling
def safe_import(module_name, tool_name=None):
    """Safely import a tool module and return the tool function if available"""
    try:
        module = __import__(f'strands_tools.{module_name}', fromlist=[tool_name or module_name])
        return getattr(module, tool_name or module_name)
    except Exception as e:
        logger.warning(f"Could not import {module_name}: {e}")
        return None

# Core tools that should always be available
official_think = safe_import('think')
official_calculator = safe_import('calculator')
official_current_time = safe_import('current_time')
official_memory = safe_import('memory')
official_use_llm = safe_import('use_llm')
official_environment = safe_import('environment')
official_sleep = safe_import('sleep')
official_stop = safe_import('stop')

# File operations
official_file_read = safe_import('file_read')
official_file_write = safe_import('file_write')
official_editor = safe_import('editor')

# Web and data tools
official_tavily = safe_import('tavily')
official_http_request = safe_import('http_request')
official_rss = safe_import('rss')
official_exa = safe_import('exa')
official_bright_data = safe_import('bright_data')

# Code and development
official_python_repl = safe_import('python_repl')
official_shell = safe_import('shell')

# Media and communication
official_generate_image = safe_import('generate_image')
official_generate_image_stability = safe_import('generate_image_stability')
official_image_reader = safe_import('image_reader')
official_speak = safe_import('speak')
official_slack = safe_import('slack')

# Workflow and automation
official_workflow = safe_import('workflow')
official_agent_graph = safe_import('agent_graph')
official_use_agent = safe_import('use_agent')
official_handoff_to_user = safe_import('handoff_to_user')
official_cron = safe_import('cron')
official_journal = safe_import('journal')
official_retrieve = safe_import('retrieve')
official_load_tool = safe_import('load_tool')
official_batch = safe_import('batch')
official_graph = safe_import('graph')
official_swarm = safe_import('swarm')

# Advanced tools (may have dependencies)
official_use_computer = safe_import('use_computer')
official_use_aws = safe_import('use_aws')
official_mcp_client = safe_import('mcp_client')
official_agent_core_memory = safe_import('agent_core_memory')
official_mem0_memory = safe_import('mem0_memory')
official_nova_reels = safe_import('nova_reels')
official_diagram = safe_import('diagram')

# Tools that may have additional dependencies
official_browser = safe_import('browser')
official_code_interpreter = safe_import('code_interpreter')

# A2A tools (may have dependencies)
try:
    import strands_tools.a2a_client as official_a2a_client
    A2A_AVAILABLE = True
except ImportError as e:
    logger.warning(f"A2A tools not available: {e}")
    A2A_AVAILABLE = False

OFFICIAL_TOOLS_AVAILABLE = True
logger.info("✅ Official Strands tools loaded successfully!")

# Tool configuration schemas based on official documentation
TOOL_CONFIGURATION_SCHEMAS = {
    'think': {
        'name': 'Think',
        'description': 'Advanced recursive thinking tool with model switching support',
        'category': 'ai',
        'configurable': True,
        'configuration': {
            'cycle_count': {
                'type': 'number',
                'default': 3,
                'min': 1,
                'max': 10,
                'description': 'Number of thinking cycles'
            },
            'model_provider': {
                'type': 'select',
                'options': ['ollama', 'openai', 'anthropic', 'bedrock', 'litellm'],
                'default': 'ollama',
                'description': 'Model provider for thinking'
            },
            'system_prompt': {
                'type': 'textarea',
                'default': 'You are an expert analytical thinker.',
                'description': 'System prompt for thinking process'
            }
        }
    },
    'calculator': {
        'name': 'Calculator',
        'description': 'Advanced mathematical operations powered by SymPy',
        'category': 'utility',
        'configurable': True,
        'configuration': {
            'precision': {
                'type': 'number',
                'default': 15,
                'min': 1,
                'max': 50,
                'description': 'Decimal precision for calculations'
            },
            'use_scientific_notation': {
                'type': 'boolean',
                'default': False,
                'description': 'Use scientific notation for large numbers'
            }
        }
    },
    'web_search': {
        'name': 'Web Search',
        'description': 'Search the web using Tavily API',
        'category': 'web',
        'configurable': True,
        'configuration': {
            'api_key': {
                'type': 'password',
                'required': True,
                'description': 'Tavily API key'
            },
            'max_results': {
                'type': 'number',
                'default': 5,
                'min': 1,
                'max': 20,
                'description': 'Maximum number of search results'
            }
        }
    },
    'memory': {
        'name': 'Memory',
        'description': 'Store and retrieve memories using Mem0',
        'category': 'ai',
        'configurable': True,
        'configuration': {
            'api_key': {
                'type': 'password',
                'required': True,
                'description': 'Mem0 API key'
            },
            'max_results': {
                'type': 'number',
                'default': 50,
                'min': 1,
                'max': 100,
                'description': 'Maximum results to return'
            }
        }
    },
    'file_read': {
        'name': 'File Reader',
        'description': 'Read and analyze files with advanced features',
        'category': 'file',
        'configurable': True,
        'configuration': {
            'max_file_size': {
                'type': 'number',
                'default': 10485760,  # 10MB
                'description': 'Maximum file size in bytes'
            },
            'allowed_extensions': {
                'type': 'multiselect',
                'options': ['.txt', '.py', '.js', '.json', '.csv', '.md', '.html', '.xml'],
                'default': ['.txt', '.py', '.js', '.json', '.md'],
                'description': 'Allowed file extensions'
            }
        }
    },
    'python_repl': {
        'name': 'Python REPL',
        'description': 'Execute Python code with state persistence',
        'category': 'code',
        'configurable': True,
        'configuration': {
            'timeout': {
                'type': 'number',
                'default': 30,
                'min': 1,
                'max': 300,
                'description': 'Execution timeout in seconds'
            },
            'max_output_length': {
                'type': 'number',
                'default': 10000,
                'description': 'Maximum output length'
            }
        }
    },
    'shell': {
        'name': 'Shell',
        'description': 'Execute shell commands securely',
        'category': 'system',
        'configurable': True,
        'configuration': {
            'timeout': {
                'type': 'number',
                'default': 30,
                'min': 1,
                'max': 300,
                'description': 'Command timeout in seconds'
            },
            'allowed_commands': {
                'type': 'multiselect',
                'options': ['ls', 'cat', 'grep', 'find', 'ps', 'top', 'df', 'du'],
                'default': ['ls', 'cat', 'grep', 'find'],
                'description': 'Allowed shell commands'
            }
        }
    },
    'current_time': {
        'name': 'Current Time',
        'description': 'Get current date and time information',
        'category': 'utility',
        'configurable': True,
        'configuration': {
            'timezone': {
                'type': 'select',
                'options': ['UTC', 'local', 'America/New_York', 'Europe/London', 'Asia/Tokyo'],
                'default': 'local',
                'description': 'Timezone for time display'
            },
            'format': {
                'type': 'select',
                'options': ['iso', 'readable', 'timestamp', 'custom'],
                'default': 'readable',
                'description': 'Time format to return'
            }
        }
    },
    'coordinate_agents': {
        'name': 'Coordinate Agents',
        'description': 'Coordinate multiple agents for collaborative tasks',
        'category': 'multi_agent',
        'configurable': True,
        'configuration': {
            'max_agents': {
                'type': 'number',
                'default': 5,
                'min': 1,
                'max': 20,
                'description': 'Maximum number of agents to coordinate'
            },
            'timeout': {
                'type': 'number',
                'default': 60,
                'min': 10,
                'max': 300,
                'description': 'Coordination timeout in seconds'
            },
            'strategy': {
                'type': 'select',
                'options': ['parallel', 'sequential', 'hierarchical', 'democratic'],
                'default': 'parallel',
                'description': 'Coordination strategy'
            }
        }
    },
    'a2a_discover_agent': {
        'name': 'A2A Discover Agent',
        'description': 'Discover other agents in the network',
        'category': 'multi_agent',
        'configurable': True,
        'configuration': {
            'discovery_timeout': {
                'type': 'number',
                'default': 30,
                'min': 5,
                'max': 120,
                'description': 'Discovery timeout in seconds'
            },
            'max_agents': {
                'type': 'number',
                'default': 10,
                'min': 1,
                'max': 50,
                'description': 'Maximum agents to discover'
            }
        }
    },
    'a2a_list_discovered_agents': {
        'name': 'A2A List Discovered Agents',
        'description': 'List all discovered agents',
        'category': 'multi_agent',
        'configurable': True,
        'configuration': {
            'include_status': {
                'type': 'boolean',
                'default': True,
                'description': 'Include agent status information'
            },
            'include_capabilities': {
                'type': 'boolean',
                'default': True,
                'description': 'Include agent capabilities'
            }
        }
    },
    'a2a_send_message': {
        'name': 'A2A Send Message',
        'description': 'Send message to another agent',
        'category': 'multi_agent',
        'configurable': True,
        'configuration': {
            'timeout': {
                'type': 'number',
                'default': 30,
                'min': 5,
                'max': 120,
                'description': 'Message timeout in seconds'
            },
            'retry_attempts': {
                'type': 'number',
                'default': 3,
                'min': 0,
                'max': 10,
                'description': 'Number of retry attempts'
            }
        }
    },
    'agent_handoff': {
        'name': 'Agent Handoff',
        'description': 'Hand off task to another agent',
        'category': 'multi_agent',
        'configurable': True,
        'configuration': {
            'include_context': {
                'type': 'boolean',
                'default': True,
                'description': 'Include current context in handoff'
            },
            'priority': {
                'type': 'select',
                'options': ['low', 'normal', 'high', 'urgent'],
                'default': 'normal',
                'description': 'Handoff priority level'
            }
        }
    },
    'weather_api': {
        'name': 'Weather API',
        'description': 'Get weather information for any location',
        'category': 'utility',
        'configurable': True,
        'configuration': {
            'api_key': {
                'type': 'password',
                'required': True,
                'description': 'OpenWeatherMap API key'
            },
            'units': {
                'type': 'select',
                'options': ['metric', 'imperial', 'kelvin'],
                'default': 'metric',
                'description': 'Temperature units'
            },
            'language': {
                'type': 'select',
                'options': ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh'],
                'default': 'en',
                'description': 'Response language'
            }
        }
    },
    'file_operations': {
        'name': 'File Operations',
        'description': 'Read, write, and manage files',
        'category': 'file',
        'configurable': True,
        'configuration': {
            'max_file_size': {
                'type': 'number',
                'default': 10485760,  # 10MB
                'min': 1024,
                'max': 104857600,  # 100MB
                'description': 'Maximum file size in bytes'
            },
            'allowed_extensions': {
                'type': 'multiselect',
                'options': ['.txt', '.py', '.js', '.json', '.csv', '.md', '.html', '.xml', '.pdf', '.docx'],
                'default': ['.txt', '.py', '.js', '.json', '.md'],
                'description': 'Allowed file extensions'
            },
            'safe_mode': {
                'type': 'boolean',
                'default': True,
                'description': 'Enable safe mode for file operations'
            }
        }
    },
    'web_search': {
        'name': 'Web Search',
        'description': 'Search the web for information',
        'category': 'web',
        'configurable': True,
        'configuration': {
            'api_key': {
                'type': 'password',
                'required': True,
                'description': 'Search API key (Tavily, SerpAPI, etc.)'
            },
            'max_results': {
                'type': 'number',
                'default': 5,
                'min': 1,
                'max': 20,
                'description': 'Maximum number of search results'
            },
            'search_engine': {
                'type': 'select',
                'options': ['tavily', 'serpapi', 'google', 'bing'],
                'default': 'tavily',
                'description': 'Search engine to use'
            }
        }
    },
    'code_execution': {
        'name': 'Code Execution',
        'description': 'Execute code in various programming languages',
        'category': 'code',
        'configurable': True,
        'configuration': {
            'timeout': {
                'type': 'number',
                'default': 30,
                'min': 5,
                'max': 300,
                'description': 'Execution timeout in seconds'
            },
            'max_output_length': {
                'type': 'number',
                'default': 10000,
                'min': 1000,
                'max': 100000,
                'description': 'Maximum output length'
            },
            'allowed_languages': {
                'type': 'multiselect',
                'options': ['python', 'javascript', 'bash', 'sql', 'r', 'go', 'rust'],
                'default': ['python', 'javascript', 'bash'],
                'description': 'Allowed programming languages'
            }
        }
    },
    'database_query': {
        'name': 'Database Query',
        'description': 'Execute database queries',
        'category': 'database',
        'configurable': True,
        'configuration': {
            'connection_string': {
                'type': 'password',
                'required': True,
                'description': 'Database connection string'
            },
            'query_timeout': {
                'type': 'number',
                'default': 30,
                'min': 5,
                'max': 300,
                'description': 'Query timeout in seconds'
            },
            'max_rows': {
                'type': 'number',
                'default': 1000,
                'min': 10,
                'max': 10000,
                'description': 'Maximum rows to return'
            }
        }
    },
    'browser': {
        'name': 'Browser',
        'description': 'Automate web browser interactions',
        'category': 'web',
        'configurable': True,
        'configuration': {
            'headless': {
                'type': 'boolean',
                'default': True,
                'description': 'Run browser in headless mode'
            },
            'timeout': {
                'type': 'number',
                'default': 30,
                'min': 5,
                'max': 300,
                'description': 'Browser operation timeout in seconds'
            },
            'viewport_width': {
                'type': 'number',
                'default': 1280,
                'min': 320,
                'max': 3840,
                'description': 'Browser viewport width'
            },
            'viewport_height': {
                'type': 'number',
                'default': 720,
                'min': 240,
                'max': 2160,
                'description': 'Browser viewport height'
            }
        }
    },
    'code_interpreter': {
        'name': 'Code Interpreter',
        'description': 'Execute code in multiple programming languages',
        'category': 'code',
        'configurable': True,
        'configuration': {
            'timeout': {
                'type': 'number',
                'default': 30,
                'min': 5,
                'max': 300,
                'description': 'Code execution timeout in seconds'
            },
            'max_output_length': {
                'type': 'number',
                'default': 10000,
                'min': 1000,
                'max': 100000,
                'description': 'Maximum output length'
            },
            'allowed_languages': {
                'type': 'multiselect',
                'options': ['python', 'javascript', 'bash', 'sql', 'r', 'go', 'rust', 'java', 'cpp'],
                'default': ['python', 'javascript', 'bash'],
                'description': 'Allowed programming languages'
            }
        }
    },
    'generate_image': {
        'name': 'Generate Image',
        'description': 'Generate images using AI models',
        'category': 'media',
        'configurable': True,
        'configuration': {
            'model': {
                'type': 'select',
                'options': ['dall-e-3', 'dall-e-2', 'midjourney', 'stable-diffusion'],
                'default': 'dall-e-3',
                'description': 'Image generation model'
            },
            'size': {
                'type': 'select',
                'options': ['1024x1024', '1024x1792', '1792x1024', '512x512', '256x256'],
                'default': '1024x1024',
                'description': 'Image size'
            },
            'quality': {
                'type': 'select',
                'options': ['standard', 'hd'],
                'default': 'standard',
                'description': 'Image quality'
            }
        }
    },
    'slack': {
        'name': 'Slack',
        'description': 'Send messages and interact with Slack',
        'category': 'communication',
        'configurable': True,
        'configuration': {
            'bot_token': {
                'type': 'password',
                'required': True,
                'description': 'Slack bot token'
            },
            'channel': {
                'type': 'text',
                'default': '#general',
                'description': 'Default Slack channel'
            },
            'timeout': {
                'type': 'number',
                'default': 30,
                'min': 5,
                'max': 300,
                'description': 'Slack API timeout in seconds'
            }
        }
    },
    'workflow': {
        'name': 'Workflow',
        'description': 'Create and execute automated workflows',
        'category': 'automation',
        'configurable': True,
        'configuration': {
            'max_steps': {
                'type': 'number',
                'default': 50,
                'min': 1,
                'max': 200,
                'description': 'Maximum workflow steps'
            },
            'timeout': {
                'type': 'number',
                'default': 300,
                'min': 30,
                'max': 3600,
                'description': 'Workflow timeout in seconds'
            },
            'parallel_execution': {
                'type': 'boolean',
                'default': True,
                'description': 'Enable parallel step execution'
            }
        }
    }
}

def get_official_tools() -> Dict[str, Any]:
    """Get all available official Strands tools"""
    tools = {}
    
    # Core AI Tools
    if official_think:
        tools['think'] = official_think
    if official_memory:
        tools['memory'] = official_memory
    if official_use_llm:
        tools['use_llm'] = official_use_llm
        
    # Utility Tools
    if official_calculator:
        tools['calculator'] = official_calculator
    if official_current_time:
        tools['current_time'] = official_current_time
    if official_environment:
        tools['environment'] = official_environment
    if official_sleep:
        tools['sleep'] = official_sleep
    if official_stop:
        tools['stop'] = official_stop
        
    # File Operations
    if official_file_read:
        tools['file_read'] = official_file_read
    if official_file_write:
        tools['file_write'] = official_file_write
    if official_editor:
        tools['editor'] = official_editor
        
    # Web & Data
    if official_tavily:
        tools['tavily'] = official_tavily
        tools['web_search'] = official_tavily  # Alias for compatibility
    if official_http_request:
        tools['http_request'] = official_http_request
    if official_rss:
        tools['rss'] = official_rss
    if official_exa:
        tools['exa'] = official_exa
    if official_bright_data:
        tools['bright_data'] = official_bright_data
        
    # Code & Development
    if official_python_repl:
        tools['python_repl'] = official_python_repl
        tools['code_execution'] = official_python_repl  # Alias for compatibility
    if official_code_interpreter:
        tools['code_interpreter'] = official_code_interpreter
    if official_shell:
        tools['shell'] = official_shell
        
    # Browser & Automation
    if official_browser:
        tools['browser'] = official_browser
    if official_use_computer:
        tools['use_computer'] = official_use_computer
        
    # Media & Communication
    if official_generate_image:
        tools['generate_image'] = official_generate_image
    if official_generate_image_stability:
        tools['generate_image_stability'] = official_generate_image_stability
    if official_image_reader:
        tools['image_reader'] = official_image_reader
    if official_speak:
        tools['speak'] = official_speak
    if official_slack:
        tools['slack'] = official_slack
        
    # Workflow & Automation
    if official_workflow:
        tools['workflow'] = official_workflow
    if official_agent_graph:
        tools['agent_graph'] = official_agent_graph
    if official_use_agent:
        tools['use_agent'] = official_use_agent
    if official_handoff_to_user:
        tools['handoff_to_user'] = official_handoff_to_user
    if official_cron:
        tools['cron'] = official_cron
    if official_journal:
        tools['journal'] = official_journal
    if official_retrieve:
        tools['retrieve'] = official_retrieve
    if official_load_tool:
        tools['load_tool'] = official_load_tool
    if official_batch:
        tools['batch'] = official_batch
    if official_graph:
        tools['graph'] = official_graph
    if official_swarm:
        tools['swarm'] = official_swarm
        
    # Cloud & Infrastructure
    if official_use_aws:
        tools['use_aws'] = official_use_aws
    if official_mcp_client:
        tools['mcp_client'] = official_mcp_client
        
    # Memory Systems
    if official_agent_core_memory:
        tools['agent_core_memory'] = official_agent_core_memory
    if official_mem0_memory:
        tools['mem0_memory'] = official_mem0_memory
        
    # Video & Advanced Media
    if official_nova_reels:
        tools['nova_reels'] = official_nova_reels
        
    # Visualization
    if official_diagram:
        tools['diagram'] = official_diagram
    
    # Add A2A tools if available
    if A2A_AVAILABLE:
        tools.update({
            'a2a_discover_agent': official_a2a_client.a2a_discover_agent,
            'a2a_list_discovered_agents': official_a2a_client.a2a_list_discovered_agents,
            'a2a_send_message': official_a2a_client.a2a_send_message,
            'coordinate_agents': official_a2a_client.coordinate_agents,
            'agent_handoff': official_a2a_client.agent_handoff,
        })
    
    return tools

def get_tool_configuration_schema(tool_name: str) -> Optional[Dict[str, Any]]:
    """Get configuration schema for a specific tool"""
    return TOOL_CONFIGURATION_SCHEMAS.get(tool_name)

def get_all_tool_schemas() -> Dict[str, Dict[str, Any]]:
    """Get configuration schemas for all tools"""
    return TOOL_CONFIGURATION_SCHEMAS

def get_tools_by_category() -> Dict[str, List[str]]:
    """Get tools organized by category"""
    categories = {}
    for tool_name, schema in TOOL_CONFIGURATION_SCHEMAS.items():
        category = schema['category']
        if category not in categories:
            categories[category] = []
        categories[category].append(tool_name)
    return categories

# Export the official tools
if OFFICIAL_TOOLS_AVAILABLE:
    OFFICIAL_TOOLS = get_official_tools()
    print(f"[Official Strands Tools] ✅ Loaded {len(OFFICIAL_TOOLS)} official tools")
    print(f"[Official Strands Tools] Categories: {list(get_tools_by_category().keys())}")
else:
    OFFICIAL_TOOLS = {}
    print("[Official Strands Tools] ❌ Official tools not available")
