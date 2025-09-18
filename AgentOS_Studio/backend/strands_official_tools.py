#!/usr/bin/env python3
"""
Official Strands Tools Integration
Discovers and loads tools from the official Strands tools ecosystem
"""

import importlib
import inspect
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import json

@dataclass
class StrandsToolMetadata:
    name: str
    description: str
    category: str
    parameters: Dict[str, Any]
    examples: List[str]
    version: str
    author: str
    requires: List[str]
    tags: List[str]

class StrandsToolsRegistry:
    """Registry for official Strands tools"""
    
    def __init__(self):
        self.tools: Dict[str, Any] = {}
        self.metadata: Dict[str, StrandsToolMetadata] = {}
        self.categories: Dict[str, List[str]] = {}
        self._initialized = False
    
    def discover_official_tools(self) -> Dict[str, List[str]]:
        """Discover official Strands tools from the ecosystem"""
        if self._initialized:
            return self.categories
            
        try:
            # Try to import official strands_tools package
            import strands_tools
            print("[Strands Tools] ✅ Official strands_tools package found!")
            
            # Discover all available tools
            tools_by_category = self._scan_official_package(strands_tools)
            
        except ImportError:
            print("[Strands Tools] Official strands_tools package not found, using fallback discovery")
            tools_by_category = self._fallback_tool_discovery()
        
        self.categories = tools_by_category
        self._initialized = True
        return tools_by_category
    
    def _scan_official_package(self, strands_tools_module) -> Dict[str, List[str]]:
        """Scan the official strands_tools package for available tools"""
        tools_by_category = {
            'web': [],
            'data': [],
            'communication': [],
            'file': [],
            'api': [],
            'utility': [],
            'ai': [],
            'database': []
        }
        
        # Scan for tool modules
        for module_name in dir(strands_tools_module):
            if not module_name.startswith('_'):
                try:
                    module = getattr(strands_tools_module, module_name)
                    if hasattr(module, '__all__'):
                        for tool_name in module.__all__:
                            tool_func = getattr(module, tool_name)
                            if hasattr(tool_func, '__tool__'):  # Strands tool decorator
                                category = self._get_tool_category(module_name)
                                tools_by_category[category].append(tool_name)
                                self._register_tool(tool_name, tool_func, category)
                except Exception as e:
                    print(f"[Strands Tools] Warning: Could not load {module_name}: {e}")
        
        return tools_by_category
    
    def _fallback_tool_discovery(self) -> Dict[str, List[str]]:
        """Fallback tool discovery when official package is not available"""
        # Common official Strands tools based on the ecosystem
        fallback_tools = {
            'web': [
                'web_search', 'web_scraper', 'url_analyzer', 'sitemap_crawler',
                'web_screenshot', 'link_checker', 'seo_analyzer', 'html_parser'
            ],
            'data': [
                'csv_reader', 'json_parser', 'xml_parser', 'data_validator',
                'data_transformer', 'data_aggregator', 'data_cleaner', 'excel_reader'
            ],
            'communication': [
                'email_sender', 'slack_messenger', 'teams_notifier', 'discord_bot',
                'telegram_sender', 'sms_sender', 'webhook_caller', 'push_notifier',
                'a2a_discover_agent', 'a2a_list_discovered_agents', 'a2a_send_message'
            ],
            'file': [
                'file_reader', 'file_writer', 'pdf_reader', 'image_analyzer',
                'document_converter', 'zip_extractor', 'file_uploader', 'text_extractor'
            ],
            'api': [
                'rest_client', 'graphql_client', 'soap_client', 'api_tester',
                'oauth_handler', 'rate_limiter', 'api_monitor', 'json_rpc_client'
            ],
            'utility': [
                'calculator', 'date_formatter', 'uuid_generator', 'hash_generator',
                'base64_encoder', 'url_encoder', 'regex_matcher', 'password_generator'
            ],
            'ai': [
                'text_summarizer', 'sentiment_analyzer', 'language_detector',
                'text_translator', 'image_classifier', 'speech_to_text', 'text_to_speech',
                'think'  # Core reasoning tool
            ],
            'database': [
                'sql_executor', 'mongodb_client', 'redis_client', 'elasticsearch_client',
                'database_migrator', 'query_builder', 'data_backup', 'schema_validator'
            ],
            'multi_agent': [
                'coordinate_agents', 'agent_handoff'
            ]
        }
        
        # Register fallback tools with mock metadata
        for category, tool_names in fallback_tools.items():
            for tool_name in tool_names:
                self._register_fallback_tool(tool_name, category)
        
        return fallback_tools
    
    def _register_fallback_tool(self, tool_name: str, category: str):
        """Register a fallback tool with generated metadata"""
        # Generate description based on tool name
        description = self._generate_tool_description(tool_name)
        
        metadata = StrandsToolMetadata(
            name=tool_name,
            description=description,
            category=category,
            parameters=self._generate_tool_parameters(tool_name),
            examples=[f"Use {tool_name} to {description.lower()}"],
            version="1.0.0",
            author="Strands Team",
            requires=[],
            tags=self._generate_tool_tags(tool_name, category)
        )
        
        self.metadata[tool_name] = metadata
        
        # Add to category
        if category not in self.categories:
            self.categories[category] = []
        if tool_name not in self.categories[category]:
            self.categories[category].append(tool_name)
    
    def _generate_tool_description(self, tool_name: str) -> str:
        """Generate a description for a tool based on its name"""
        descriptions = {
            'web_search': 'Search the web for information using various search engines',
            'web_scraper': 'Extract data from web pages and websites',
            'url_analyzer': 'Analyze URLs for security, performance, and metadata',
            'sitemap_crawler': 'Crawl website sitemaps to discover pages and structure',
            'web_screenshot': 'Capture screenshots of web pages',
            'link_checker': 'Check links for validity and accessibility',
            'seo_analyzer': 'Analyze web pages for SEO optimization',
            'html_parser': 'Parse and extract data from HTML content',
            
            'csv_reader': 'Read and parse CSV files',
            'json_parser': 'Parse and manipulate JSON data',
            'xml_parser': 'Parse and extract data from XML documents',
            'data_validator': 'Validate data against schemas and rules',
            'data_transformer': 'Transform data between different formats',
            'data_aggregator': 'Aggregate and summarize data',
            'data_cleaner': 'Clean and normalize data',
            'excel_reader': 'Read and parse Excel spreadsheets',
            
            'email_sender': 'Send emails with attachments and formatting',
            'slack_messenger': 'Send messages to Slack channels and users',
            'teams_notifier': 'Send notifications to Microsoft Teams',
            'discord_bot': 'Interact with Discord servers and channels',
            'telegram_sender': 'Send messages via Telegram bot',
            'sms_sender': 'Send SMS messages',
            'webhook_caller': 'Make HTTP webhook calls',
            'push_notifier': 'Send push notifications to devices',
            
            'calculator': 'Perform mathematical calculations and evaluations',
            'date_formatter': 'Format and manipulate dates and times',
            'uuid_generator': 'Generate unique identifiers',
            'hash_generator': 'Generate cryptographic hashes',
            'base64_encoder': 'Encode and decode base64 data',
            'url_encoder': 'Encode and decode URLs',
            'regex_matcher': 'Match and extract data using regular expressions',
            'password_generator': 'Generate secure passwords',
            
            # Multi-Agent Collaboration Tools
            'think': 'Advanced recursive thinking tool for deep analytical processing and reasoning',
            'a2a_discover_agent': 'Discover A2A-compliant agents and their capabilities',
            'a2a_list_discovered_agents': 'List all discovered A2A agents with their details',
            'a2a_send_message': 'Send messages to specific A2A agents for communication',
            'coordinate_agents': 'Coordinate multiple A2A agents to complete complex tasks',
            'agent_handoff': 'Hand off tasks between agents with context preservation'
        }
        
        return descriptions.get(tool_name, f'Perform {tool_name.replace("_", " ")} operations')
    
    def _generate_tool_parameters(self, tool_name: str) -> Dict[str, Any]:
        """Generate parameters for a tool based on its name"""
        common_params = {
            'web_search': {
                'query': {'type': 'str', 'required': True, 'description': 'Search query'},
                'max_results': {'type': 'int', 'required': False, 'default': 10, 'description': 'Maximum number of results'}
            },
            'calculator': {
                'expression': {'type': 'str', 'required': True, 'description': 'Mathematical expression to evaluate'}
            },
            'email_sender': {
                'to': {'type': 'str', 'required': True, 'description': 'Recipient email address'},
                'subject': {'type': 'str', 'required': True, 'description': 'Email subject'},
                'body': {'type': 'str', 'required': True, 'description': 'Email body content'}
            },
            'file_reader': {
                'file_path': {'type': 'str', 'required': True, 'description': 'Path to the file to read'}
            }
        }
        
        return common_params.get(tool_name, {
            'input': {'type': 'str', 'required': True, 'description': f'Input for {tool_name}'}
        })
    
    def _generate_tool_tags(self, tool_name: str, category: str) -> List[str]:
        """Generate tags for a tool"""
        base_tags = [category]
        
        if 'search' in tool_name:
            base_tags.append('search')
        if 'analyzer' in tool_name or 'analysis' in tool_name:
            base_tags.append('analysis')
        if 'generator' in tool_name:
            base_tags.append('generator')
        if 'reader' in tool_name:
            base_tags.append('reader')
        if 'sender' in tool_name or 'notifier' in tool_name:
            base_tags.append('communication')
        
        return base_tags
    
    def _get_tool_category(self, module_name: str) -> str:
        """Determine tool category from module name"""
        category_mapping = {
            'web': 'web',
            'data': 'data', 
            'comm': 'communication',
            'file': 'file',
            'api': 'api',
            'util': 'utility',
            'ai': 'ai',
            'db': 'database',
            'database': 'database'
        }
        
        for key, category in category_mapping.items():
            if key in module_name.lower():
                return category
        
        return 'utility'  # Default category
    
    def _register_tool(self, name: str, tool_func: Any, category: str):
        """Register a tool with metadata"""
        self.tools[name] = tool_func
        
        # Extract metadata from tool function
        metadata = StrandsToolMetadata(
            name=name,
            description=getattr(tool_func, '__doc__', f'{name} tool'),
            category=category,
            parameters=self._extract_parameters(tool_func),
            examples=getattr(tool_func, '__examples__', []),
            version=getattr(tool_func, '__version__', '1.0.0'),
            author=getattr(tool_func, '__author__', 'Strands Team'),
            requires=getattr(tool_func, '__requires__', []),
            tags=getattr(tool_func, '__tags__', [category])
        )
        
        self.metadata[name] = metadata
        
        # Add to category
        if category not in self.categories:
            self.categories[category] = []
        if name not in self.categories[category]:
            self.categories[category].append(name)
    
    def _extract_parameters(self, tool_func: Any) -> Dict[str, Any]:
        """Extract parameter information from tool function"""
        try:
            sig = inspect.signature(tool_func)
            parameters = {}
            
            for param_name, param in sig.parameters.items():
                parameters[param_name] = {
                    'type': str(param.annotation) if param.annotation != inspect.Parameter.empty else 'Any',
                    'default': param.default if param.default != inspect.Parameter.empty else None,
                    'required': param.default == inspect.Parameter.empty
                }
            
            return parameters
        except Exception:
            return {}
    
    def get_available_tools(self) -> List[str]:
        """Get list of all available tools"""
        return list(self.tools.keys()) + list(self.metadata.keys())
    
    def get_tools_by_category(self, category: str) -> List[str]:
        """Get tools in a specific category"""
        return self.categories.get(category, [])
    
    def get_tool_metadata(self, tool_name: str) -> Optional[StrandsToolMetadata]:
        """Get metadata for a specific tool"""
        return self.metadata.get(tool_name)
    
    def get_tool_function(self, tool_name: str) -> Optional[Any]:
        """Get the actual tool function"""
        return self.tools.get(tool_name)
    
    def get_catalog(self) -> Dict[str, Any]:
        """Get the complete tool catalog"""
        if not self._initialized:
            self.discover_official_tools()
        
        catalog = {
            'categories': {},
            'tools': {},
            'total_count': 0
        }
        
        for category, tool_names in self.categories.items():
            catalog['categories'][category] = {
                'name': category.title(),
                'description': f'{category.title()} related tools',
                'tools': tool_names,
                'count': len(tool_names)
            }
            
            for tool_name in tool_names:
                metadata = self.get_tool_metadata(tool_name)
                if metadata:
                    catalog['tools'][tool_name] = {
                        **asdict(metadata),
                        'available': tool_name in self.tools  # Check if actually available
                    }
                    catalog['total_count'] += 1
        
        return catalog

# Global registry instance
strands_tools_registry = StrandsToolsRegistry()

# Initialize on import
print("[Strands Tools] Initializing official tools registry...")
strands_tools_registry.discover_official_tools()
print(f"[Strands Tools] ✅ Registry initialized with {len(strands_tools_registry.get_available_tools())} tools")