# Official Strands Tools Integration Strategy

## 🎯 **Overview**

Based on the official Strands tools repository (https://github.com/strands-agents/tools/tree/main/src/strands_tools), we need to integrate the official tool ecosystem into our Strands agent creation process.

## 🔍 **Current State Analysis**

### **What We Have**
- ✅ Custom tools: `web_search`, `calculator`, `current_time`
- ✅ Basic tool loading system in `strands_sdk_api.py`
- ✅ Frontend tool selection in agent creation dialog
- ✅ Tool usage tracking and display

### **What We Need**
- 🔄 Official Strands tools integration
- 🔄 Dynamic tool discovery and loading
- 🔄 Tool metadata and documentation
- 🔄 Tool configuration and parameters
- 🔄 Tool categorization and filtering

## 🏗️ **Implementation Strategy**

### **Phase 1: Official Tools Discovery**

```python
# backend/strands_official_tools.py
"""
Official Strands Tools Integration
Discovers and loads tools from the official Strands tools ecosystem
"""

import importlib
import inspect
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from strands import tool

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
    
    def discover_official_tools(self) -> Dict[str, List[str]]:
        """Discover official Strands tools from the ecosystem"""
        try:
            # Try to import official strands_tools package
            import strands_tools
            
            # Discover all available tools
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
            for module_name in dir(strands_tools):
                if not module_name.startswith('_'):
                    try:
                        module = getattr(strands_tools, module_name)
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
            
        except ImportError:
            print("[Strands Tools] Official strands_tools package not found, using fallback discovery")
            return self._fallback_tool_discovery()
    
    def _fallback_tool_discovery(self) -> Dict[str, List[str]]:
        """Fallback tool discovery when official package is not available"""
        # Common official Strands tools based on the ecosystem
        return {
            'web': [
                'web_search', 'web_scraper', 'url_analyzer', 'sitemap_crawler',
                'web_screenshot', 'link_checker', 'seo_analyzer'
            ],
            'data': [
                'csv_reader', 'json_parser', 'xml_parser', 'data_validator',
                'data_transformer', 'data_aggregator', 'data_cleaner'
            ],
            'communication': [
                'email_sender', 'slack_messenger', 'teams_notifier', 'discord_bot',
                'telegram_sender', 'sms_sender', 'webhook_caller'
            ],
            'file': [
                'file_reader', 'file_writer', 'pdf_reader', 'image_analyzer',
                'document_converter', 'zip_extractor', 'file_uploader'
            ],
            'api': [
                'rest_client', 'graphql_client', 'soap_client', 'api_tester',
                'oauth_handler', 'rate_limiter', 'api_monitor'
            ],
            'utility': [
                'calculator', 'date_formatter', 'uuid_generator', 'hash_generator',
                'base64_encoder', 'url_encoder', 'regex_matcher'
            ],
            'ai': [
                'text_summarizer', 'sentiment_analyzer', 'language_detector',
                'text_translator', 'image_classifier', 'speech_to_text'
            ],
            'database': [
                'sql_executor', 'mongodb_client', 'redis_client', 'elasticsearch_client',
                'database_migrator', 'query_builder', 'data_backup'
            ]
        }
    
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
            'db': 'database'
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
            tags=getattr(tool_func, '__tags__', [])
        )
        
        self.metadata[name] = metadata
        
        # Add to category
        if category not in self.categories:
            self.categories[category] = []
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
        return list(self.tools.keys())
    
    def get_tools_by_category(self, category: str) -> List[str]:
        """Get tools in a specific category"""
        return self.categories.get(category, [])
    
    def get_tool_metadata(self, tool_name: str) -> Optional[StrandsToolMetadata]:
        """Get metadata for a specific tool"""
        return self.metadata.get(tool_name)
    
    def get_tool_function(self, tool_name: str) -> Optional[Any]:
        """Get the actual tool function"""
        return self.tools.get(tool_name)

# Global registry instance
strands_tools_registry = StrandsToolsRegistry()
```

### **Phase 2: Enhanced Tool Loading in Backend**

```python
# Update backend/strands_sdk_api.py

from strands_official_tools import strands_tools_registry

# Add to the existing AVAILABLE_TOOLS
def load_official_tools():
    """Load official Strands tools into the registry"""
    official_tools = strands_tools_registry.discover_official_tools()
    
    # Merge with existing tools
    all_tools = {**AVAILABLE_TOOLS}
    
    for category, tools in official_tools.items():
        for tool_name in tools:
            tool_func = strands_tools_registry.get_tool_function(tool_name)
            if tool_func:
                all_tools[tool_name] = tool_func
    
    return all_tools

# Enhanced tool configuration endpoint
@app.route('/api/strands-sdk/tools/discover', methods=['GET'])
def discover_strands_tools():
    """Discover all available Strands tools with metadata"""
    try:
        # Load official tools
        official_tools = strands_tools_registry.discover_official_tools()
        
        # Build comprehensive tool catalog
        tool_catalog = {
            'categories': {},
            'tools': {},
            'total_count': 0
        }
        
        for category, tool_names in official_tools.items():
            tool_catalog['categories'][category] = {
                'name': category.title(),
                'description': f'{category.title()} related tools',
                'tools': [],
                'count': len(tool_names)
            }
            
            for tool_name in tool_names:
                metadata = strands_tools_registry.get_tool_metadata(tool_name)
                if metadata:
                    tool_info = {
                        'name': metadata.name,
                        'description': metadata.description,
                        'category': metadata.category,
                        'parameters': metadata.parameters,
                        'examples': metadata.examples,
                        'version': metadata.version,
                        'author': metadata.author,
                        'requires': metadata.requires,
                        'tags': metadata.tags,
                        'available': tool_name in AVAILABLE_TOOLS or strands_tools_registry.get_tool_function(tool_name) is not None
                    }
                    
                    tool_catalog['tools'][tool_name] = tool_info
                    tool_catalog['categories'][category]['tools'].append(tool_name)
                    tool_catalog['total_count'] += 1
        
        return jsonify({
            'success': True,
            'catalog': tool_catalog,
            'message': f'Discovered {tool_catalog["total_count"]} tools across {len(official_tools)} categories'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to discover Strands tools'
        }), 500

@app.route('/api/strands-sdk/tools/install', methods=['POST'])
def install_strands_tool():
    """Install a specific Strands tool"""
    try:
        data = request.get_json()
        tool_name = data.get('tool_name')
        
        if not tool_name:
            return jsonify({'error': 'tool_name is required'}), 400
        
        # Check if tool is available in registry
        tool_func = strands_tools_registry.get_tool_function(tool_name)
        if not tool_func:
            return jsonify({'error': f'Tool {tool_name} not found in registry'}), 404
        
        # Install tool (add to available tools)
        AVAILABLE_TOOLS[tool_name] = tool_func
        
        # Get metadata
        metadata = strands_tools_registry.get_tool_metadata(tool_name)
        
        return jsonify({
            'success': True,
            'tool_name': tool_name,
            'metadata': {
                'description': metadata.description if metadata else f'{tool_name} tool',
                'category': metadata.category if metadata else 'utility',
                'parameters': metadata.parameters if metadata else {},
                'version': metadata.version if metadata else '1.0.0'
            },
            'message': f'Tool {tool_name} installed successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': f'Failed to install tool {tool_name}'
        }), 500
```

### **Phase 3: Frontend Tool Discovery and Selection**

```typescript
// src/lib/services/StrandsToolsService.ts
export interface StrandsToolMetadata {
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
  examples: string[];
  version: string;
  author: string;
  requires: string[];
  tags: string[];
  available: boolean;
}

export interface StrandsToolCategory {
  name: string;
  description: string;
  tools: string[];
  count: number;
}

export interface StrandsToolCatalog {
  categories: Record<string, StrandsToolCategory>;
  tools: Record<string, StrandsToolMetadata>;
  total_count: number;
}

class StrandsToolsService {
  private baseUrl = 'http://localhost:5006/api/strands-sdk';

  async discoverTools(): Promise<StrandsToolCatalog> {
    const response = await fetch(`${this.baseUrl}/tools/discover`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to discover tools');
    }
    
    return data.catalog;
  }

  async installTool(toolName: string): Promise<StrandsToolMetadata> {
    const response = await fetch(`${this.baseUrl}/tools/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tool_name: toolName }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to install tool');
    }
    
    return data.metadata;
  }

  async getToolsByCategory(category: string, catalog: StrandsToolCatalog): Promise<StrandsToolMetadata[]> {
    const categoryData = catalog.categories[category];
    if (!categoryData) return [];
    
    return categoryData.tools.map(toolName => catalog.tools[toolName]).filter(Boolean);
  }
}

export const strandsToolsService = new StrandsToolsService();
```

### **Phase 4: Enhanced Agent Creation Dialog**

```typescript
// Update src/components/MultiAgentWorkspace/StrandsAgentConfigDialog.tsx

import { strandsToolsService, StrandsToolCatalog, StrandsToolMetadata } from '@/lib/services/StrandsToolsService';

// Add to component state
const [toolCatalog, setToolCatalog] = useState<StrandsToolCatalog | null>(null);
const [selectedCategory, setSelectedCategory] = useState<string>('web');
const [availableTools, setAvailableTools] = useState<StrandsToolMetadata[]>([]);
const [installingTool, setInstallingTool] = useState<string | null>(null);

// Load tool catalog on component mount
useEffect(() => {
  const loadToolCatalog = async () => {
    try {
      const catalog = await strandsToolsService.discoverTools();
      setToolCatalog(catalog);
      
      // Load tools for default category
      const webTools = await strandsToolsService.getToolsByCategory('web', catalog);
      setAvailableTools(webTools);
    } catch (error) {
      console.error('Failed to load tool catalog:', error);
      toast({
        title: "Tool Discovery Failed",
        description: "Could not load official Strands tools. Using basic tools only.",
        variant: "destructive",
      });
    }
  };
  
  loadToolCatalog();
}, []);

// Handle category change
const handleCategoryChange = async (category: string) => {
  setSelectedCategory(category);
  if (toolCatalog) {
    const categoryTools = await strandsToolsService.getToolsByCategory(category, toolCatalog);
    setAvailableTools(categoryTools);
  }
};

// Handle tool installation
const handleInstallTool = async (toolName: string) => {
  setInstallingTool(toolName);
  try {
    await strandsToolsService.installTool(toolName);
    
    // Add to selected tools
    setConfig(prev => ({
      ...prev,
      tools: [...(prev.tools || []), toolName]
    }));
    
    toast({
      title: "Tool Installed",
      description: `${toolName} has been installed and added to your agent.`,
    });
  } catch (error) {
    toast({
      title: "Installation Failed",
      description: `Failed to install ${toolName}: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setInstallingTool(null);
  }
};

// Enhanced tools selection UI
<div className="space-y-4">
  <Label className="text-white">Available Tools</Label>
  
  {/* Category Tabs */}
  {toolCatalog && (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(toolCatalog.categories).map(([categoryKey, category]) => (
        <Button
          key={categoryKey}
          variant={selectedCategory === categoryKey ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(categoryKey)}
          className="text-xs"
        >
          {category.name} ({category.count})
        </Button>
      ))}
    </div>
  )}
  
  {/* Tools Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
    {availableTools.map((tool) => (
      <div
        key={tool.name}
        className="border border-gray-600 rounded-lg p-3 hover:border-purple-400 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-white">{tool.name}</h4>
              <Badge variant="secondary" className="text-xs">
                v{tool.version}
              </Badge>
              {!tool.available && (
                <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                  Install Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {tool.description}
            </p>
            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            {tool.available ? (
              <Checkbox
                checked={config.tools?.includes(tool.name) || false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setConfig(prev => ({
                      ...prev,
                      tools: [...(prev.tools || []), tool.name]
                    }));
                  } else {
                    setConfig(prev => ({
                      ...prev,
                      tools: (prev.tools || []).filter(t => t !== tool.name)
                    }));
                  }
                }}
              />
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInstallTool(tool.name)}
                disabled={installingTool === tool.name}
                className="text-xs"
              >
                {installingTool === tool.name ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Install'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

## 🚀 **Implementation Steps**

### **Step 1: Install Official Strands Tools Package**
```bash
# Try to install official package
pip install strands-tools

# Or if using a specific version/source
pip install git+https://github.com/strands-agents/tools.git
```

### **Step 2: Create Tool Registry**
- Implement `StrandsToolsRegistry` class
- Add tool discovery and metadata extraction
- Create fallback system for when official package isn't available

### **Step 3: Enhance Backend API**
- Add `/tools/discover` endpoint for tool catalog
- Add `/tools/install` endpoint for dynamic tool installation
- Update agent creation to support official tools

### **Step 4: Update Frontend**
- Create `StrandsToolsService` for tool management
- Enhance agent creation dialog with tool browser
- Add tool installation and management UI

### **Step 5: Testing and Validation**
- Test tool discovery and installation
- Validate tool execution in agents
- Ensure proper error handling and fallbacks

## 🎯 **Expected Benefits**

1. **Rich Tool Ecosystem**: Access to official Strands tools
2. **Dynamic Discovery**: Automatic tool detection and loading
3. **Better UX**: Categorized tool browser with metadata
4. **Extensibility**: Easy addition of new tools
5. **Professional Integration**: Aligned with official Strands patterns

This implementation will transform your agent creation process into a comprehensive tool marketplace, allowing users to discover, install, and configure official Strands tools seamlessly.