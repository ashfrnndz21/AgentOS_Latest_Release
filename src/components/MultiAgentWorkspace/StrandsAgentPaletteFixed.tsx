import React, { useState, useEffect } from 'react';
import { Bot, Brain, Shield, Database, GitBranch, MessageSquare, Search, Code, FileText, Calculator, Server, Globe, Zap, Settings, RefreshCw, AlertCircle, Eye, Info, Users, BarChart3, Briefcase, Headphones, Wrench, Network, Cpu, Target, BookOpen, Lightbulb, ArrowRight, X, Key, CheckCircle, Download, Activity, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mcpGatewayService, MCPTool } from '@/lib/services/MCPGatewayService';
import { useStrandsNativeTools, StrandsNativeTool } from '@/hooks/useStrandsNativeTools';
import { strandsAgentService, DisplayableOllamaAgent, StrandsAgent } from '@/lib/services/StrandsAgentService';

interface StrandsAgentPaletteFixedProps {
  onAddAgent: (agentType: string, agentData?: any) => void;
  onAddUtility: (nodeType: string, utilityData?: any) => void;
  onSelectMCPTool?: (tool: MCPTool) => void;
  onSelectStrandsTool?: (tool: StrandsNativeTool) => void;
}

export const StrandsAgentPaletteFixed = ({
  onAddAgent,
  onAddUtility,
  onSelectMCPTool,
  onSelectStrandsTool,
}: StrandsAgentPaletteFixedProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);

  // Strands agents state
  const [strandsAgents, setStrandsAgents] = useState<StrandsAgent[]>([]);
  const [strandsLoading, setStrandsLoading] = useState(false);

  // Ollama agents for display (read-only)
  const [ollamaAgents, setOllamaAgents] = useState<DisplayableOllamaAgent[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);

  // Use the Strands Native Tools hook - THIS IS THE KEY!
  const { tools: strandsTools, loading: strandsToolsLoading } = useStrandsNativeTools();

  // Load MCP tools
  const loadMCPTools = async () => {
    setMcpLoading(true);
    try {
      const tools = await mcpGatewayService.getTools();
      setMcpTools(tools);
      console.log('✅ MCP Tools loaded successfully:', tools.length);
    } catch (error) {
      console.error('❌ Failed to load MCP tools:', error);
    } finally {
      setMcpLoading(false);
    }
  };

  // Load Strands agents
  const loadStrandsAgents = async () => {
    setStrandsLoading(true);
    try {
      const agents = await strandsAgentService.getStrandsAgents();
      setStrandsAgents(agents);
      console.log('✅ Strands Agents loaded successfully:', agents.length);
    } catch (error) {
      console.error('❌ Failed to load Strands agents:', error);
    } finally {
      setStrandsLoading(false);
    }
  };

  // Load Ollama agents
  const loadOllamaAgents = async () => {
    setOllamaLoading(true);
    try {
      const agents = await strandsAgentService.getOllamaAgents();
      setOllamaAgents(agents);
      console.log('✅ Ollama Agents loaded successfully:', agents.length);
    } catch (error) {
      console.error('❌ Failed to load Ollama agents:', error);
    } finally {
      setOllamaLoading(false);
    }
  };

  useEffect(() => {
    loadMCPTools();
    loadStrandsAgents();
    loadOllamaAgents();
  }, []);

  return (
    <div className={`h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ${collapsed ? 'w-12' : 'w-80'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-white">Agent Palette</h2>
            <p className="text-sm text-gray-400">Fixed with Native Tools</p>
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
              <TabsTrigger value="strands-tools" className="text-xs">
                Tools
              </TabsTrigger>
              <TabsTrigger value="local-tools" className="text-xs">
                Local
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

                {strandsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400">Loading Strands agents...</span>
                  </div>
                )}

                {!strandsLoading && strandsAgents.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No Strands agents found</p>
                    <p className="text-xs text-gray-500 mt-1">Create your first agent to get started</p>
                  </div>
                )}

                {!strandsLoading && strandsAgents.map((agent) => (
                  <Card key={agent.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
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
                              Strands
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {agent.model}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-gray-500 ${
                                agent.status === 'active' ? 'text-green-400' : 
                                agent.status === 'inactive' ? 'text-yellow-400' : 'text-red-400'
                              }`}
                            >
                              {agent.status}
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
                ))}
              </TabsContent>

              {/* SDK Agents Tab */}
              <TabsContent value="sdk-agents" className="p-4 space-y-2">
                <h3 className="text-sm font-medium text-white mb-4">SDK Agents</h3>
                <div className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">No SDK agents found</p>
                  <p className="text-xs text-gray-500 mt-1">Create your first SDK agent to get started</p>
                </div>
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
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-gray-500 ${
                                tool.status === 'available' ? 'text-green-400' : 
                                tool.status === 'unavailable' ? 'text-red-400' : 'text-yellow-400'
                              }`}
                            >
                              {tool.status}
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

              {/* Strands Tools Tab - THE KEY TAB! */}
              <TabsContent value="strands-tools" className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Strands Native Tools</h3>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                    {strandsTools.length} tools
                  </Badge>
                </div>

                {strandsToolsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400">Loading Strands tools...</span>
                  </div>
                )}

                {!strandsToolsLoading && strandsTools.length === 0 && (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No Strands tools found</p>
                    <p className="text-xs text-gray-500 mt-1">This should not happen - check the hook</p>
                  </div>
                )}

                {!strandsToolsLoading && strandsTools.map((tool) => (
                  <Card key={tool.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors">
                          <tool.icon className="h-4 w-4" style={{ color: tool.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{tool.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                              Strands
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {tool.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-gray-500 ${
                                tool.requiresApi ? 'text-orange-400' : 'text-green-400'
                              }`}
                            >
                              {tool.requiresApi ? 'API Required' : 'Local'}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-gray-500 ${
                                tool.complexity === 'simple' ? 'text-green-400' : 
                                tool.complexity === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                              }`}
                            >
                              {tool.complexity}
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

              {/* Local Tools Tab */}
              <TabsContent value="local-tools" className="p-4 space-y-2">
                <h3 className="text-sm font-medium text-white mb-4">Local Tools</h3>
                <div className="text-center py-8">
                  <Cpu className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">Local tools are now in Strands Tools tab</p>
                  <p className="text-xs text-gray-500 mt-1">Check the "Tools" tab above</p>
                </div>
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
                  <Card key={agent.id} className="p-3 bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-600 group-hover:bg-gray-500 transition-colors">
                          <Brain className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{agent.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{agent.description || 'No description'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                              Ollama
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {agent.model || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddAgent('ollama', agent)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
};



