/**
 * Enhanced Strands Tool Registry
 * Manages tool discovery, validation, and composition
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Settings, 
  Play, 
  TestTube, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Plus,
  Link,
  Eye,
  Code,
  Brain,
  Calculator,
  Globe,
  FileText,
  Database,
  MessageSquare,
  Workflow,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

// Tool execution strategies
export type ExecutionStrategy = 'concurrent' | 'sequential' | 'conditional' | 'parallel';

// Tool categories
export type ToolCategory = 
  | 'ai' 
  | 'utility' 
  | 'file' 
  | 'web' 
  | 'code' 
  | 'browser' 
  | 'media' 
  | 'workflow' 
  | 'cloud' 
  | 'memory' 
  | 'collaboration' 
  | 'database' 
  | 'weather';

// Tool metadata interface
export interface ToolMetadata {
  version: string;
  author: string;
  lastUpdated: string;
  dependencies: string[];
  tags: string[];
  performance: {
    avgExecutionTime: number;
    successRate: number;
    memoryUsage: number;
  };
}

// Tool schema interface
export interface ToolSpec {
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      required: boolean;
      description: string;
      default?: any;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: any[];
      };
    };
  };
  returns: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
  };
}

// Tool implementation interface
export interface ToolImplementation {
  execute: (input: any) => Promise<any>;
  validate: (input: any) => boolean;
  test: (input: any) => Promise<TestResult>;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Test result interface
export interface TestResult {
  success: boolean;
  executionTime: number;
  output: any;
  error?: string;
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Main Strands tool interface
export interface StrandsTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: React.ComponentType<any>;
  color: string;
  schema: ToolSpec;
  implementation: ToolImplementation;
  metadata: ToolMetadata;
  dependencies: string[];
  executionStrategy: ExecutionStrategy;
  isOfficial: boolean;
  isCustom: boolean;
  isMCP: boolean;
  configuration?: Record<string, any>;
}

// Tool composition interface
export interface ToolComposition {
  id: string;
  name: string;
  description: string;
  tools: StrandsTool[];
  connections: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
  executionStrategy: ExecutionStrategy;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
}

// Tool registry state
interface ToolRegistryState {
  tools: Map<string, StrandsTool>;
  categories: Map<ToolCategory, StrandsTool[]>;
  compositions: Map<string, ToolComposition>;
  validationResults: Map<string, ValidationResult>;
  testResults: Map<string, TestResult[]>;
  searchQuery: string;
  selectedCategory: ToolCategory | 'all';
  selectedTools: Set<string>;
  showAdvanced: boolean;
}

// Tool registry component
export const StrandsToolRegistry: React.FC = () => {
  const [state, setState] = useState<ToolRegistryState>({
    tools: new Map(),
    categories: new Map(),
    compositions: new Map(),
    validationResults: new Map(),
    testResults: new Map(),
    searchQuery: '',
    selectedCategory: 'all',
    selectedTools: new Set(),
    showAdvanced: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tools on component mount
  useEffect(() => {
    loadTools();
  }, []);

  // Load tools from backend
  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load official tools
      const officialResponse = await apiClient.get('/api/strands-sdk/tools/configuration');
      const officialTools = officialResponse.data.tools || [];

      // Load MCP tools
      const mcpResponse = await apiClient.get('/api/mcp/tools');
      const mcpTools = mcpResponse.data.tools || [];

      // Load custom tools
      const customResponse = await apiClient.get('/api/strands-sdk/tools/custom');
      const customTools = customResponse.data.tools || [];

      // Process and categorize tools
      const processedTools = new Map<string, StrandsTool>();
      const categorizedTools = new Map<ToolCategory, StrandsTool[]>();

      // Initialize categories
      const categories: ToolCategory[] = [
        'ai', 'utility', 'file', 'web', 'code', 'browser', 
        'media', 'workflow', 'cloud', 'memory', 'collaboration', 
        'database', 'weather'
      ];
      categories.forEach(cat => categorizedTools.set(cat, []));

      // Process official tools
      officialTools.forEach((tool: any) => {
        const strandsTool = convertToStrandsTool(tool, 'official');
        processedTools.set(tool.name, strandsTool);
        categorizedTools.get(tool.category)?.push(strandsTool);
      });

      // Process MCP tools
      mcpTools.forEach((tool: any) => {
        const strandsTool = convertToStrandsTool(tool, 'mcp');
        processedTools.set(tool.name, strandsTool);
        categorizedTools.get(tool.category)?.push(strandsTool);
      });

      // Process custom tools
      customTools.forEach((tool: any) => {
        const strandsTool = convertToStrandsTool(tool, 'custom');
        processedTools.set(tool.name, strandsTool);
        categorizedTools.get(tool.category)?.push(strandsTool);
      });

      setState(prev => ({
        ...prev,
        tools: processedTools,
        categories: categorizedTools,
        loading: false
      }));

    } catch (err) {
      console.error('Error loading tools:', err);
      setError('Failed to load tools. Please try again.');
      setLoading(false);
    }
  }, []);

  // Convert backend tool to StrandsTool
  const convertToStrandsTool = (tool: any, type: 'official' | 'mcp' | 'custom'): StrandsTool => {
    return {
      id: tool.name,
      name: tool.name,
      description: tool.description || 'No description available',
      category: tool.category || 'utility',
      icon: getToolIcon(tool.name),
      color: getToolColor(tool.category),
      schema: tool.schema || {
        name: tool.name,
        description: tool.description,
        parameters: {},
        returns: { type: 'string', description: 'Tool output' }
      },
      implementation: {
        execute: async (input: any) => {
          // This would be implemented by the backend
          return { result: 'Tool executed', input };
        },
        validate: (input: any) => true,
        test: async (input: any) => ({
          success: true,
          executionTime: 100,
          output: 'Test output',
          metrics: { memoryUsage: 0, cpuUsage: 0 }
        })
      },
      metadata: {
        version: tool.version || '1.0.0',
        author: tool.author || 'Unknown',
        lastUpdated: tool.lastUpdated || new Date().toISOString(),
        dependencies: tool.dependencies || [],
        tags: tool.tags || [],
        performance: {
          avgExecutionTime: tool.performance?.avgExecutionTime || 0,
          successRate: tool.performance?.successRate || 100,
          memoryUsage: tool.performance?.memoryUsage || 0
        }
      },
      dependencies: tool.dependencies || [],
      executionStrategy: tool.executionStrategy || 'sequential',
      isOfficial: type === 'official',
      isCustom: type === 'custom',
      isMCP: type === 'mcp',
      configuration: tool.configuration || {}
    };
  };

  // Get tool icon based on name
  const getToolIcon = (name: string): React.ComponentType<any> => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'calculator': Calculator,
      'web_search': Globe,
      'think': Brain,
      'current_time': Clock,
      'code_execution': Code,
      'file_operations': FileText,
      'database_query': Database,
      'a2a_send_message': MessageSquare,
      'coordinate_agents': Workflow,
      'agent_handoff': Workflow,
      'weather_api': Globe,
      'generate_image': FileText,
      'slack': MessageSquare,
      'workflow': Workflow,
      'browser': Globe,
      'python_repl': Code,
      'shell': Code,
      'http_request': Globe,
      'rss': Globe,
      'exa': Search,
      'bright_data': Database,
      'tavily': Search,
      'use_aws': Cloud,
      'mcp_client': Settings,
      'agent_core_memory': Brain,
      'mem0_memory': Brain,
      'nova_reels': FileText,
      'diagram': BarChart3,
      'handoff_to_user': MessageSquare,
      'cron': Clock,
      'journal': FileText,
      'retrieve': Search,
      'load_tool': Settings,
      'batch': Workflow,
      'graph': BarChart3,
      'swarm': Workflow,
      'use_computer': Settings,
      'speak': MessageSquare,
      'image_reader': FileText,
      'generate_image_stability': FileText,
      'environment': Settings,
      'sleep': Clock,
      'stop': Shield,
      'editor': FileText,
      'use_llm': Brain,
      'memory': Brain,
      'use_agent': Bot
    };
    return iconMap[name] || Settings;
  };

  // Get tool color based on category
  const getToolColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'ai': 'text-purple-500',
      'utility': 'text-blue-500',
      'file': 'text-green-500',
      'web': 'text-orange-500',
      'code': 'text-red-500',
      'browser': 'text-yellow-500',
      'media': 'text-pink-500',
      'workflow': 'text-indigo-500',
      'cloud': 'text-cyan-500',
      'memory': 'text-violet-500',
      'collaboration': 'text-emerald-500',
      'database': 'text-amber-500',
      'weather': 'text-sky-500'
    };
    return colorMap[category] || 'text-gray-500';
  };

  // Filter tools based on search and category
  const filteredTools = Array.from(state.tools.values()).filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory = state.selectedCategory === 'all' || tool.category === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setState(prev => ({
      ...prev,
      selectedTools: prev.selectedTools.has(toolId) 
        ? new Set([...prev.selectedTools].filter(id => id !== toolId))
        : new Set([...prev.selectedTools, toolId])
    }));
  };

  // Handle tool test
  const handleToolTest = async (toolId: string) => {
    const tool = state.tools.get(toolId);
    if (!tool) return;

    try {
      const testResult = await tool.implementation.test({});
      setState(prev => ({
        ...prev,
        testResults: new Map(prev.testResults.set(toolId, [
          ...(prev.testResults.get(toolId) || []),
          testResult
        ]))
      }));
    } catch (error) {
      console.error('Tool test failed:', error);
    }
  };

  // Handle tool validation
  const handleToolValidate = async (toolId: string) => {
    const tool = state.tools.get(toolId);
    if (!tool) return;

    try {
      const validationResult = await apiClient.post(`/api/strands-sdk/tools/validate`, {
        tool: tool.schema
      });
      
      setState(prev => ({
        ...prev,
        validationResults: new Map(prev.validationResults.set(toolId, validationResult.data))
      }));
    } catch (error) {
      console.error('Tool validation failed:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-300">Loading tools...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center text-red-400">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-500" />
          Strands Tool Registry
        </CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tools..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <select
            value={state.selectedCategory}
            onChange={(e) => setState(prev => ({ ...prev, selectedCategory: e.target.value as ToolCategory | 'all' }))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          >
            <option value="all">All Categories</option>
            {Array.from(state.categories.keys()).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-700">
            <TabsTrigger value="tools" className="text-gray-300 data-[state=active]:text-white">
              Tools ({filteredTools.length})
            </TabsTrigger>
            <TabsTrigger value="compositions" className="text-gray-300 data-[state=active]:text-white">
              Compositions ({state.compositions.size})
            </TabsTrigger>
            <TabsTrigger value="testing" className="text-gray-300 data-[state=active]:text-white">
              Testing
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-300 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="mt-4">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map(tool => (
                  <Card key={tool.id} className="bg-gray-700 border-gray-600 hover:border-purple-500 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <tool.icon className={`h-5 w-5 ${tool.color}`} />
                          <span className="text-white font-medium">{tool.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {tool.isOfficial && <Badge variant="secondary" className="text-xs">Official</Badge>}
                          {tool.isMCP && <Badge variant="outline" className="text-xs">MCP</Badge>}
                          {tool.isCustom && <Badge variant="default" className="text-xs">Custom</Badge>}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{tool.description}</p>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToolTest(tool.id)}
                            className="h-8 w-8 p-0"
                          >
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToolValidate(tool.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToolSelect(tool.id)}
                            className={`h-8 w-8 p-0 ${
                              state.selectedTools.has(tool.id) ? 'text-purple-500' : 'text-gray-400'
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="compositions" className="mt-4">
            <div className="text-center py-8 text-gray-400">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>Tool compositions will be available here</p>
              <p className="text-sm">Create complex tool workflows by combining multiple tools</p>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="mt-4">
            <div className="text-center py-8 text-gray-400">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>Tool testing interface will be available here</p>
              <p className="text-sm">Test individual tools and compositions</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>Tool analytics will be available here</p>
              <p className="text-sm">View performance metrics and usage statistics</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};


