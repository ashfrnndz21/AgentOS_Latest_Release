import React, { useState } from 'react';
import { Bot, Brain, Shield, Database, GitBranch, MessageSquare, Search, Code, FileText, Calculator, Server, Globe, Zap, Settings, RefreshCw, AlertCircle, Eye, Info, Users, BarChart3, Briefcase, Headphones, Wrench, Network, Cpu, Target, BookOpen, Lightbulb, ArrowRight, X, Key, CheckCircle, Download, Activity, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mcpGatewayService, MCPTool } from '@/lib/services/MCPGatewayService';
// Removed useStrandsNativeTools hook - this was causing the white screen
// import { useStrandsNativeTools, StrandsNativeTool } from '@/hooks/useStrandsNativeTools';
import { StrandsToolConfigDialog } from './config/StrandsToolConfigDialog';
import { StrandsAgentAdaptationDialog } from './StrandsAgentAdaptationDialog';
import { strandsAgentService, DisplayableOllamaAgent, StrandsAgent } from '@/lib/services/StrandsAgentService';
import { strandsSdkService, StrandsSdkAgent } from '@/lib/services/StrandsSdkService';

interface StrandsAgentPaletteProps {
  onAddAgent: (agentType: string, agentData?: any) => void;
  onAddUtility: (nodeType: string, utilityData?: any) => void;
  onSelectMCPTool?: (tool: MCPTool) => void;
  onSelectStrandsTool?: (tool: any) => void; // Changed from StrandsNativeTool
  externalStrandsSdkAgents?: StrandsSdkAgent[];
  onLoadStrandsSdkAgents?: () => Promise<void>;
}

// Professional agent icons mapping
const getProfessionalAgentIcon = (role: string, capabilities: string[]): { icon: React.ComponentType<any>, color: string } => {
  const roleLower = role.toLowerCase();

  // Business & Customer Management
  if (roleLower.includes('cvm') || roleLower.includes('customer') || roleLower.includes('business'))
    return { icon: Briefcase, color: 'text-blue-500' };

  // Analytics & Data
  if (roleLower.includes('analyst') || roleLower.includes('analysis') || roleLower.includes('data'))
    return { icon: BarChart3, color: 'text-green-500' };

  // Technical & Development
  if (roleLower.includes('developer') || roleLower.includes('engineer') || roleLower.includes('technical'))
    return { icon: Code, color: 'text-purple-500' };

  // Support & Service
  if (roleLower.includes('support') || roleLower.includes('service') || roleLower.includes('help'))
    return { icon: Headphones, color: 'text-orange-500' };

  // Research & Innovation
  if (roleLower.includes('research') || roleLower.includes('innovation') || roleLower.includes('r&d'))
    return { icon: Lightbulb, color: 'text-yellow-500' };

  // Finance & Accounting
  if (roleLower.includes('finance') || roleLower.includes('accounting') || roleLower.includes('financial'))
    return { icon: Calculator, color: 'text-emerald-500' };

  // Marketing & Sales
  if (roleLower.includes('marketing') || roleLower.includes('sales') || roleLower.includes('promotion'))
    return { icon: Target, color: 'text-pink-500' };

  // Operations & Management
  if (roleLower.includes('operations') || roleLower.includes('management') || roleLower.includes('admin'))
    return { icon: Settings, color: 'text-gray-500' };

  // Default
  return { icon: Bot, color: 'text-blue-400' };
};

export const StrandsAgentPaletteOriginal = ({
  onAddAgent,
  onAddUtility,
  onSelectMCPTool,
  onSelectStrandsTool,
  externalStrandsSdkAgents,
  onLoadStrandsSdkAgents,
}: StrandsAgentPaletteProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [toolConfigDialog, setToolConfigDialog] = useState<{ tool: any; config?: any } | null>(null);
  const [configuredTools, setConfiguredTools] = useState<Set<string>>(new Set());

  // Strands agents state
  const [strandsAgents, setStrandsAgents] = useState<StrandsAgent[]>([]);
  const [strandsLoading, setStrandsLoading] = useState(false);
  
  // Strands SDK agents state
  const [strandsSdkAgents, setStrandsSdkAgents] = useState<StrandsSdkAgent[]>([]);
  const [strandsSdkLoading, setStrandsSdkLoading] = useState(false);
  
  // Use external agents if provided, otherwise use internal state
  const displaySdkAgents = externalStrandsSdkAgents || strandsSdkAgents;

  // Ollama agents state
  const [ollamaAgents, setOllamaAgents] = useState<DisplayableOllamaAgent[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);

  // Adaptation dialog state
  const [showAdaptationDialog, setShowAdaptationDialog] = useState(false);
  const [selectedOllamaAgent, setSelectedOllamaAgent] = useState<DisplayableOllamaAgent | null>(null);

  // Tooltip state - track which agent's tooltip is shown
  const [activeTooltipAgentId, setActiveTooltipAgentId] = useState<string | null>(null);

  // Load Strands agents
  const loadStrandsAgents = async () => {
    setStrandsLoading(true);
    try {
      const agents = await strandsAgentService.getStrandsAgents();
      setStrandsAgents(agents);
    } catch (error) {
      console.error('Failed to load Strands agents:', error);
    } finally {
      setStrandsLoading(false);
    }
  };

  // Load Strands SDK agents
  const loadStrandsSdkAgents = async () => {
    setStrandsSdkLoading(true);
    try {
      const agents = await strandsSdkService.getStrandsSdkAgents();
      setStrandsSdkAgents(agents);
    } catch (error) {
      console.error('Failed to load Strands SDK agents:', error);
    } finally {
      setStrandsSdkLoading(false);
    }
  };

  // Load Ollama agents
  const loadOllamaAgents = async () => {
    setOllamaLoading(true);
    try {
      const agents = await strandsAgentService.getOllamaAgents();
      setOllamaAgents(agents);
    } catch (error) {
      console.error('Failed to load Ollama agents:', error);
    } finally {
      setOllamaLoading(false);
    }
  };

  // Load MCP tools
  const loadMCPTools = async () => {
    setMcpLoading(true);
    try {
      const tools = await mcpGatewayService.getTools();
      setMcpTools(tools);
    } catch (error) {
      console.error('Failed to load MCP tools:', error);
    } finally {
      setMcpLoading(false);
    }
  };

  // Load data on mount
  React.useEffect(() => {
    loadStrandsAgents();
    loadStrandsSdkAgents();
    loadOllamaAgents();
    loadMCPTools();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadStrandsAgents();
      loadStrandsSdkAgents();
      loadOllamaAgents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Removed useStrandsNativeTools hook - this was causing the white screen
  // Instead, we'll use static tool definitions
  const localTools = [
    { id: 'file_reader', name: 'File Reader', description: 'Read and process files', category: 'File Operations', icon: '📄' },
    { id: 'file_writer', name: 'File Writer', description: 'Write and save files', category: 'File Operations', icon: '✏️' },
    { id: 'code_analyzer', name: 'Code Analyzer', description: 'Analyze code structure and patterns', category: 'Development', icon: '🔍' },
    { id: 'web_scraper', name: 'Web Scraper', description: 'Extract data from websites', category: 'Web', icon: '🕷️' },
    { id: 'data_processor', name: 'Data Processor', description: 'Process and transform data', category: 'Data', icon: '⚙️' },
  ];

  const externalTools = [
    { id: 'api_client', name: 'API Client', description: 'Make HTTP requests to external APIs', category: 'Integration', icon: '🌐' },
    { id: 'database_connector', name: 'Database Connector', description: 'Connect to databases', category: 'Data', icon: '🗄️' },
    { id: 'cloud_storage', name: 'Cloud Storage', description: 'Access cloud storage services', category: 'Storage', icon: '☁️' },
  ];

  const toolsLoading = false; // Static tools, no loading needed

  // Handle tool configuration
  const handleToolConfig = (tool: any) => {
    setToolConfigDialog({ tool, config: configuredTools.has(tool.id) ? {} : undefined });
  };

  // Handle tool configuration save
  const handleToolConfigSave = (toolId: string, config: any) => {
    setConfiguredTools(prev => new Set([...prev, toolId]));
    setToolConfigDialog(null);
  };

  // Handle Ollama agent adaptation
  const handleAdaptAgent = (agent: DisplayableOllamaAgent) => {
    setSelectedOllamaAgent(agent);
    setShowAdaptationDialog(true);
  };

  return (
    <div className={`h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ${collapsed ? 'w-12' : 'w-80'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-white">Agent Palette</h2>
            <p className="text-sm text-gray-400">Original version - no problematic hooks</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          {collapsed ? <ArrowRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="strands-agents" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-7 bg-gray-700">
              <TabsTrigger value="strands-agents" className="text-xs">
                Strands
              </TabsTrigger>
              <TabsTrigger value="sdk-agents" className="text-xs">
                SDK
              </TabsTrigger>
              <TabsTrigger value="utilities" className="text-xs">
                Utils
              </TabsTrigger>
              <TabsTrigger value="mcp-tools" className="text-xs">
                MCP
              </TabsTrigger>
              <TabsTrigger value="local-tools" className="text-xs">
                Local
              </TabsTrigger>
              <TabsTrigger value="external-tools" className="text-xs">
                External
              </TabsTrigger>
              <TabsTrigger value="ollama-agents" className="text-xs">
                Ollama
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* Strands Agents Tab */}
              <TabsContent value="strands-agents" className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Strands Agents</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadStrandsAgents}
                    disabled={strandsLoading}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    title="Refresh Strands agents"
                  >
                    <RefreshCw className={`h-3 w-3 ${strandsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {/* Loading state */}
                {strandsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400">Loading agents...</span>
                  </div>
                )}

                {/* Agents list */}
                {!strandsLoading && strandsAgents.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No Strands agents found</p>
                    <p className="text-xs text-gray-500 mt-1">Create your first agent to get started</p>
                  </div>
                )}

                {!strandsLoading && strandsAgents.map((agent) => {
                  const { icon: IconComponent, color } = getProfessionalAgentIcon(agent.name, agent.tools || []);
                  return (
                    <Card key={agent.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors`}>
                            <IconComponent className={`h-4 w-4 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{agent.name}</h4>
                            <p className="text-xs text-gray-400 truncate">{agent.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                                Strands
                              </Badge>
                              <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                                {agent.model}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddAgent('strands', agent)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* SDK Agents Tab */}
              <TabsContent value="sdk-agents" className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">SDK Agents</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadStrandsSdkAgents}
                    disabled={strandsSdkLoading}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    title="Refresh SDK agents"
                  >
                    <RefreshCw className={`h-3 w-3 ${strandsSdkLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {strandsSdkLoading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400">Loading SDK agents...</span>
                  </div>
                )}

                {!strandsSdkLoading && displaySdkAgents.length === 0 && (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No SDK agents found</p>
                    <p className="text-xs text-gray-500 mt-1">Create your first SDK agent to get started</p>
                  </div>
                )}

                {!strandsSdkLoading && displaySdkAgents.map((agent) => {
                  const { icon: IconComponent, color } = getProfessionalAgentIcon(agent.name, agent.tools || []);
                  return (
                    <Card key={agent.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors`}>
                            <IconComponent className={`h-4 w-4 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{agent.name}</h4>
                            <p className="text-xs text-gray-400 truncate">{agent.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                                SDK
                              </Badge>
                              <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                                {agent.model}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddAgent('sdk', agent)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Utilities Tab */}
              <TabsContent value="utilities" className="p-4 space-y-2">
                <h3 className="text-sm font-medium text-white mb-4">Workflow Utilities</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'decision', name: 'Decision', icon: GitBranch, description: 'Decision node' },
                    { id: 'handoff', name: 'Handoff', icon: ArrowRight, description: 'Handoff node' },
                    { id: 'memory', name: 'Memory', icon: Database, description: 'Memory node' },
                    { id: 'guardrail', name: 'Guardrail', icon: Shield, description: 'Guardrail node' },
                    { id: 'aggregator', name: 'Aggregator', icon: Target, description: 'Aggregator node' },
                    { id: 'monitor', name: 'Monitor', icon: Eye, description: 'Monitor node' },
                    { id: 'human', name: 'Human', icon: Users, description: 'Human node' },
                  ].map((utility) => (
                    <Card
                      key={utility.id}
                      className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group"
                      onClick={() => onAddUtility(utility.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <utility.icon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-2" />
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">{utility.name}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* MCP Tools Tab */}
              <TabsContent value="mcp-tools" className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">MCP Tools</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMCPTools}
                    disabled={mcpLoading}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    title="Refresh MCP tools"
                  >
                    <RefreshCw className={`h-3 w-3 ${mcpLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {mcpLoading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400">Loading MCP tools...</span>
                  </div>
                )}

                {!mcpLoading && mcpTools.length === 0 && (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No MCP tools found</p>
                    <p className="text-xs text-gray-500 mt-1">Connect to MCP servers to see available tools</p>
                  </div>
                )}

                {!mcpLoading && mcpTools.map((tool) => (
                  <Card key={tool.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors">
                          <Database className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{tool.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-purple-600 text-white">
                              MCP
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {tool.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectMCPTool?.(tool)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Local Tools Tab */}
              <TabsContent value="local-tools" className="p-4 space-y-2">
                <h3 className="text-sm font-medium text-white mb-4">Local Tools</h3>
                
                {localTools.map((tool) => (
                  <Card key={tool.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors">
                          <Cpu className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{tool.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                              Local
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {tool.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectStrandsTool?.(tool)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* External Tools Tab */}
              <TabsContent value="external-tools" className="p-4 space-y-2">
                <h3 className="text-sm font-medium text-white mb-4">External Tools</h3>
                
                {externalTools.map((tool) => (
                  <Card key={tool.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors">
                          <Globe className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{tool.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                              External
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {tool.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectStrandsTool?.(tool)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Ollama Agents Tab */}
              <TabsContent value="ollama-agents" className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Ollama Agents</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadOllamaAgents}
                    disabled={ollamaLoading}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    title="Refresh Ollama agents"
                  >
                    <RefreshCw className={`h-3 w-3 ${ollamaLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {ollamaLoading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400">Loading Ollama agents...</span>
                  </div>
                )}

                {!ollamaLoading && ollamaAgents.length === 0 && (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No Ollama agents found</p>
                    <p className="text-xs text-gray-500 mt-1">Start Ollama to see available models</p>
                  </div>
                )}

                {!ollamaLoading && ollamaAgents.map((agent) => (
                  <Card key={agent.name} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors">
                          <Brain className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{agent.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{agent.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-purple-600 text-white">
                              Ollama
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {agent.model}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAdaptAgent(agent)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Adapt agent"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddAgent('ollama', agent)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      {/* Tool Configuration Dialog */}
      {toolConfigDialog && (
        <StrandsToolConfigDialog
          open={!!toolConfigDialog}
          onOpenChange={(open) => !open && setToolConfigDialog(null)}
          tool={toolConfigDialog.tool}
          onSave={handleToolConfigSave}
        />
      )}

      {/* Agent Adaptation Dialog */}
      {showAdaptationDialog && selectedOllamaAgent && (
        <StrandsAgentAdaptationDialog
          open={showAdaptationDialog}
          onOpenChange={setShowAdaptationDialog}
          agent={selectedOllamaAgent}
          onAdapt={(adaptedAgent) => {
            console.log('Agent adapted:', adaptedAgent);
            setShowAdaptationDialog(false);
            setSelectedOllamaAgent(null);
          }}
        />
      )}
    </div>
  );
};










