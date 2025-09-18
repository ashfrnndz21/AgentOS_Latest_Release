import React, { useState, useEffect } from 'react';
import { Bot, Brain, Shield, Database, GitBranch, MessageSquare, Search, Code, FileText, Calculator, Server, Globe, Zap, Settings, RefreshCw, AlertCircle, Eye, Info, Users, BarChart3, Briefcase, Headphones, Wrench, Network, Cpu, Target, BookOpen, Lightbulb, ArrowRight, X, Key, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mcpGatewayService, MCPTool } from '@/lib/services/MCPGatewayService';
import { useStrandsNativeTools, StrandsNativeTool } from '@/hooks/useStrandsNativeTools';
import { StrandsToolConfigDialog } from './config/StrandsToolConfigDialog';
import { StrandsAgentAdaptationDialog } from './StrandsAgentAdaptationDialog';
import { strandsAgentService, DisplayableOllamaAgent, StrandsAgent } from '@/lib/services/StrandsAgentService';

interface StrandsAgentPaletteProps {
  onAddAgent: (agentType: string, agentData?: any) => void;
  onAddUtility: (nodeType: string, utilityData?: any) => void;
  onSelectMCPTool?: (tool: MCPTool) => void;
  onSelectStrandsTool?: (tool: StrandsNativeTool) => void;
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

  // Communication & Support
  if (roleLower.includes('chat') || roleLower.includes('conversation') || roleLower.includes('support'))
    return { icon: Headphones, color: 'text-purple-500' };

  // Technical & Development
  if (roleLower.includes('coder') || roleLower.includes('developer') || roleLower.includes('technical'))
    return { icon: Code, color: 'text-orange-500' };

  // Research & Knowledge
  if (roleLower.includes('researcher') || roleLower.includes('research') || roleLower.includes('knowledge'))
    return { icon: BookOpen, color: 'text-indigo-500' };

  // Content & Writing
  if (roleLower.includes('writer') || roleLower.includes('content') || roleLower.includes('creative'))
    return { icon: FileText, color: 'text-pink-500' };

  // Coordination & Management
  if (roleLower.includes('coordinator') || roleLower.includes('manager') || roleLower.includes('orchestrat'))
    return { icon: Target, color: 'text-red-500' };

  // Telecommunications
  if (roleLower.includes('telecom') || roleLower.includes('telco') || roleLower.includes('network'))
    return { icon: Network, color: 'text-cyan-500' };

  // AI & Intelligence
  if (roleLower.includes('ai') || roleLower.includes('intelligent') || roleLower.includes('smart'))
    return { icon: Brain, color: 'text-violet-500' };

  // Expert & Specialist
  if (roleLower.includes('expert') || roleLower.includes('specialist'))
    return { icon: Lightbulb, color: 'text-yellow-500' };

  // Fallback based on capabilities
  if (capabilities.includes('Analysis')) return { icon: BarChart3, color: 'text-green-500' };
  if (capabilities.includes('Creative')) return { icon: Lightbulb, color: 'text-yellow-500' };
  if (capabilities.includes('Chat')) return { icon: MessageSquare, color: 'text-blue-500' };
  if (capabilities.includes('Reasoning')) return { icon: Brain, color: 'text-violet-500' };

  return { icon: Bot, color: 'text-gray-500' }; // Default
};

export const StrandsAgentPalette: React.FC<StrandsAgentPaletteProps> = ({ onAddAgent, onAddUtility, onSelectMCPTool, onSelectStrandsTool }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [toolConfigDialog, setToolConfigDialog] = useState<{ tool: StrandsNativeTool; config?: any } | null>(null);
  const [configuredTools, setConfiguredTools] = useState<Set<string>>(new Set());

  // Strands agents state
  const [strandsAgents, setStrandsAgents] = useState<StrandsAgent[]>([]);
  const [strandsLoading, setStrandsLoading] = useState(false);

  // Ollama agents for display (read-only)
  const [ollamaAgents, setOllamaAgents] = useState<DisplayableOllamaAgent[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);

  // Adaptation dialog state
  const [showAdaptationDialog, setShowAdaptationDialog] = useState(false);
  const [selectedOllamaAgent, setSelectedOllamaAgent] = useState<DisplayableOllamaAgent | null>(null);

  // Tooltip state - track which agent's tooltip is shown
  const [activeTooltipAgentId, setActiveTooltipAgentId] = useState<string | null>(null);

  // Load Strands agents
  const loadStrandsAgents = async () => {
    console.log('🔄 StrandsAgentPalette: Loading Strands agents...');
    setStrandsLoading(true);
    try {
      const agents = await strandsAgentService.getStrandsAgents();
      console.log('✅ StrandsAgentPalette: Loaded agents:', agents);
      setStrandsAgents(agents);
    } catch (error) {
      console.error('❌ StrandsAgentPalette: Failed to load Strands agents:', error);
    } finally {
      setStrandsLoading(false);
    }
  };

  // Load Ollama agents for display
  const loadOllamaAgents = async () => {
    setOllamaLoading(true);
    try {
      const agents = await strandsAgentService.getOllamaAgentsForDisplay();
      setOllamaAgents(agents);
    } catch (error) {
      console.error('Failed to load Ollama agents for display:', error);
    } finally {
      setOllamaLoading(false);
    }
  };

  // Handle agent adaptation
  const handleAgentAdapted = (strandsAgent: StrandsAgent) => {
    setStrandsAgents(prev => [...prev, strandsAgent]);
    setShowAdaptationDialog(false);
    setSelectedOllamaAgent(null);
  };

  // Handle tooltip toggle
  const handleTooltipToggle = (agentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering drag or other events
    setActiveTooltipAgentId(prev => prev === agentId ? null : agentId);
  };

  // Handle agent deletion
  const handleDeleteAgent = async (agentId: string, agentName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the onClick of the parent div
    
    // Confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete the agent "${agentName}"? This action cannot be undone.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      const success = await strandsAgentService.deleteStrandsAgent(agentId);
      if (success) {
        setStrandsAgents(prev => prev.filter(agent => agent.id !== agentId));
        setActiveTooltipAgentId(null); // Close tooltip if this agent was showing it
        console.log(`Agent ${agentName} deleted successfully`);
      } else {
        console.error('Failed to delete agent: Server returned error');
        alert('Failed to delete agent. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please check your connection and try again.');
    }
  };

  // Load agents on mount
  useEffect(() => {
    loadStrandsAgents();
    loadOllamaAgents();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadStrandsAgents();
      loadOllamaAgents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get Strands native tools
  const {
    localTools,
    externalTools,
    loading: toolsLoading
  } = useStrandsNativeTools();

  // Complete set of utilities
  const utilityNodes = [
    {
      id: 'decision',
      name: 'decision',
      category: 'decision',
      description: 'Decision point with intelligent routing',
      icon: GitBranch,
      color: 'text-yellow-400',
      configurable: true,
      localOnly: true,
      requiresApiKey: false,
      criteria: ['condition-based', 'confidence-threshold', 'capability-match']
    },
    {
      id: 'handoff',
      name: 'handoff',
      category: 'handoff',
      description: 'Smart agent handoff with context transfer',
      icon: ArrowRight,
      color: 'text-blue-400',
      configurable: true,
      localOnly: true,
      requiresApiKey: false,
      criteria: ['expertise-match', 'workload-balance', 'availability']
    },
    {
      id: 'human',
      name: 'human',
      category: 'human',
      description: 'Human-in-the-loop input collection',
      icon: MessageSquare,
      color: 'text-orange-400',
      configurable: true,
      localOnly: true,
      requiresApiKey: false,
      criteria: ['interrupt-message', 'input-type', 'timeout-strategy']
    },
    {
      id: 'memory',
      name: 'memory',
      category: 'memory',
      description: 'Shared memory and context storage',
      icon: Database,
      color: 'text-green-400',
      configurable: true,
      localOnly: true,
      requiresApiKey: false,
      criteria: ['persistence-level', 'access-control', 'retention-policy']
    },
    {
      id: 'guardrail',
      name: 'guardrail',
      category: 'guardrail',
      description: 'Safety and compliance validation',
      icon: Shield,
      color: 'text-red-400',
      configurable: true,
      localOnly: true,
      requiresApiKey: false,
      criteria: ['safety-level', 'compliance-rules', 'escalation-policy']
    },
    {
      id: 'aggregator',
      name: 'aggregator',
      category: 'aggregator',
      description: 'Multi-agent response aggregation',
      icon: Users,
      color: 'text-purple-400',
      configurable: true,
      localOnly: true,
      requiresApiKey: false,
      criteria: ['consensus-method', 'weight-strategy', 'conflict-resolution']
    },
    {
      id: 'monitor',
      name: 'monitor',
      category: 'monitor',
      description: 'Performance and behavior monitoring',
      icon: Eye,
      color: 'text-cyan-400',
      configurable: true,
      localOnly: true,
      requiresApiKey: false,
      criteria: ['metrics-collection', 'alert-thresholds', 'reporting-frequency']
    }
  ];
  const utilitiesLoading = false;
  const utilitiesError = null;
  const getUtilityStatus = (category: string) => 'Ready';

  // Load MCP tools
  useEffect(() => {
    const loadMCPTools = async () => {
      try {
        setMcpLoading(true);
        const tools = await mcpGatewayService.getTools();
        setMcpTools(tools);
      } catch (error) {
        console.error('Failed to load MCP tools:', error);
      } finally {
        setMcpLoading(false);
      }
    };
    loadMCPTools();
  }, []);

  const getCategoryIcon = (category: MCPTool['category']) => {
    switch (category) {
      case 'aws': return Database;
      case 'git': return Code;
      case 'filesystem': return Server;
      case 'api': return Globe;
      case 'text': return Zap;
      default: return Settings;
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-beam-dark-accent border-r border-gray-700 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="w-full p-2 text-gray-400 hover:text-white"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-beam-dark-accent border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Agent Palette</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-white"
          >
            ←
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ overflowX: 'visible' }}>
        <Tabs defaultValue="strands-agents" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-beam-dark">
            <TabsTrigger value="strands-agents" className="text-gray-300 data-[state=active]:text-white text-xs">Strands</TabsTrigger>
            <TabsTrigger value="adapt-ollama" className="text-gray-300 data-[state=active]:text-white text-xs">Adapt</TabsTrigger>
            <TabsTrigger value="utilities" className="text-gray-300 data-[state=active]:text-white text-xs">Utilities</TabsTrigger>
            <TabsTrigger value="local-tools" className="text-gray-300 data-[state=active]:text-white text-xs">Local</TabsTrigger>
            <TabsTrigger value="external-tools" className="text-gray-300 data-[state=active]:text-white text-xs">External</TabsTrigger>
            <TabsTrigger value="mcp-tools" className="text-gray-300 data-[state=active]:text-white text-xs">MCP</TabsTrigger>
          </TabsList>

          <TabsContent value="strands-agents" className="space-y-3 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-300">Strands Agents</h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                    {strandsAgents.length}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  Advanced AI agents with reasoning capabilities
                </span>
              </div>
              <div className="flex items-center gap-1">
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
            </div>

            {/* Loading state */}
            {strandsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading Strands agents...</p>
              </div>
            )}

            {/* No agents state */}
            {!strandsLoading && strandsAgents.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No Strands agents yet</p>
                <p className="text-gray-500 text-xs mt-1 mb-3">Adapt Ollama agents or create new ones</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdaptationDialog(true)}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Adapt from Ollama
                </Button>
              </div>
            )}

            {/* Strands agents list */}
            {!strandsLoading && strandsAgents.map((agent) => (
              <div
                key={agent.id}
                className="relative p-4 bg-gray-800/40 border border-gray-600/30 rounded-lg hover:border-blue-400/50 cursor-pointer transition-all duration-200 hover:bg-gray-800/60 group"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'strands-agent',
                    agent: agent
                  }));
                }}
                onClick={() => onAddAgent('strands-agent', agent)}
              >
                {/* Click-based Tooltip for Strands Agents */}
                {activeTooltipAgentId === agent.id && (
                  <div
                    className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-96 transition-all duration-300"
                    style={{
                      left: '400px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10000
                    }}
                  >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Brain className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                        <p className="text-xs text-gray-400">Strands Intelligence Agent</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2">Agent Configuration</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Role:</span>
                          <div className="text-white font-medium">{agent.role}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Model:</span>
                          <div className="text-white font-medium">{agent.model}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Reasoning:</span>
                          <div className="text-blue-400 font-medium capitalize">{agent.reasoning_pattern}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Architecture:</span>
                          <div className="text-white font-medium capitalize">{agent.agent_architecture}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2">Advanced Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.reflection_enabled && (
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                            <Eye className="h-3 w-3 mr-1" />
                            Reflection
                          </Badge>
                        )}
                        {agent.telemetry_enabled && (
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Telemetry
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                          CoT Depth: {agent.chain_of_thought_depth}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-1">Description</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{agent.description}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-700 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Drag to canvas to add to workflow
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipAgentId(null);
                        }}
                        className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        title="Close"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  </div>
                )}
                {/* Delete button - positioned absolutely in top-right */}
                <button
                  onClick={(e) => handleDeleteAgent(agent.id, agent.name, e)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-auto"
                  title="Delete Agent"
                  style={{ zIndex: 10001 }}
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Brain className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                      <p className="text-gray-400 text-xs">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {agent.reasoning_pattern}
                    </Badge>
                    <button
                      onClick={(e) => handleTooltipToggle(agent.id, e)}
                      className="p-1 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                      title="View Details"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Model:</span>
                    <Badge variant="secondary" className="text-xs">
                      {agent.model}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.reflection_enabled && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Eye className="h-3 w-3" />
                        <span>Reflection</span>
                      </div>
                    )}
                    {agent.telemetry_enabled && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <BarChart3 className="h-3 w-3" />
                        <span>Telemetry</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="adapt-ollama" className="space-y-3 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-300">Adapt from Ollama</h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                    {ollamaAgents.length}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  Convert Ollama agents to Strands intelligence agents
                </span>
              </div>
              <div className="flex items-center gap-1">
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
            </div>

            {/* Loading state */}
            {ollamaLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading Ollama agents...</p>
              </div>
            )}

            {/* No agents state */}
            {!ollamaLoading && ollamaAgents.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No Ollama agents found</p>
                <p className="text-gray-500 text-xs mt-1">Create agents in Ollama Agent Management first</p>
              </div>
            )}

            {/* Ollama agents list */}
            {!ollamaLoading && ollamaAgents.map((agent) => (
              <div
                key={agent.id}
                className="relative p-4 bg-gray-800/40 border border-gray-600/30 rounded-lg hover:border-green-400/50 cursor-pointer transition-all duration-200 hover:bg-gray-800/60 group"
                onClick={() => {
                  setSelectedOllamaAgent(agent);
                  setShowAdaptationDialog(true);
                }}
              >
                {/* Hover Tooltip for Ollama Agents */}
                <div
                  className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-96 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none"
                  style={{
                    left: '400px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10000
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <Bot className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                        <p className="text-xs text-gray-400">Ollama Agent (Ready for Adaptation)</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2">Current Configuration</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Role:</span>
                          <div className="text-white font-medium">{agent.role}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Model:</span>
                          <div className="text-white font-medium">{agent.model}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Temperature:</span>
                          <div className="text-white font-medium">{agent.temperature}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Max Tokens:</span>
                          <div className="text-white font-medium">{agent.max_tokens}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.capabilities.map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs border-green-500/30 text-green-400">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2">Security Features</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Guardrails:</span>
                          {agent.guardrails?.enabled ? (
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                              <Shield className="h-3 w-3 mr-1" />
                              {agent.guardrails.safety_level} level
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Basic
                            </Badge>
                          )}
                        </div>
                        {agent.guardrails?.enabled && (
                          <div className="flex flex-wrap gap-1">
                            {agent.guardrails.content_filters?.map((filter, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-red-500/30 text-red-400">
                                {filter}
                              </Badge>
                            ))}
                            {agent.guardrails.rules?.length > 0 && (
                              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                {agent.guardrails.rules.length} rules
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Configuration:</span>
                          {agent.is_configured ? (
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                              <Settings className="h-3 w-3 mr-1" />
                              Partial
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-1">Description</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{agent.description}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 text-center">
                        Click to adapt to Strands Intelligence Agent
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Bot className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                      <p className="text-gray-400 text-xs">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                      Ollama
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Model:</span>
                    <Badge variant="secondary" className="text-xs">
                      {agent.model}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 2).map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.capabilities.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {agent.has_guardrails && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Shield className="h-3 w-3" />
                          <span>Protected</span>
                        </div>
                      )}
                      {agent.is_configured && (
                        <div className="flex items-center gap-1 text-blue-400">
                          <CheckCircle className="h-3 w-3" />
                          <span>Configured</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs px-2 border-green-400/30 text-green-400 hover:bg-green-400/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOllamaAgent(agent);
                        setShowAdaptationDialog(true);
                      }}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Adapt
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="utilities" className="space-y-3 mt-4">
            <div className="text-xs text-gray-400 mb-3">
              Strands-powered workflow utilities with dynamic configuration
            </div>

            {utilitiesLoading && (
              <div className="flex items-center justify-center p-4 text-gray-400">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Loading Strands utilities...
              </div>
            )}

            {utilitiesError && (
              <div className="flex items-center justify-center p-4 text-red-400">
                <AlertCircle className="h-4 w-4 mr-2" />
                Failed to load utilities
              </div>
            )}

            {!utilitiesLoading && !utilitiesError && utilityNodes.map((node) => (
              <div
                key={node.name}
                className="relative p-4 bg-gray-800/40 border border-gray-600/30 rounded-lg hover:border-blue-400/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-800/60 group"
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  const dragData = {
                    type: 'utility-node',
                    nodeType: node.name,
                    nodeData: { ...node, needsConfiguration: node.configurable }
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.configurable) {
                    onAddUtility(node.name, { ...node, needsConfiguration: true });
                  } else {
                    onAddUtility(node.name, node);
                  }
                }}
                style={{ userSelect: 'none' }}
              >
                {/* Enhanced Hover Tooltip for Utilities */}
                <div
                  className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none"
                  style={{
                    left: '400px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10000
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-700/50 ${node.color}`}>
                        <node.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white capitalize">{node.name} Node</h3>
                        <p className="text-xs text-gray-400">Strands Workflow Utility</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{node.description}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-2">Configuration Options</h4>
                      <div className="space-y-1">
                        {node.criteria.map((criterion) => (
                          <div key={criterion} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${node.name === 'decision' ? 'bg-yellow-400' :
                              node.name === 'handoff' ? 'bg-blue-400' :
                                node.name === 'human' ? 'bg-orange-400' :
                                  node.name === 'memory' ? 'bg-green-400' :
                                    node.name === 'guardrail' ? 'bg-red-400' :
                                      node.name === 'aggregator' ? 'bg-purple-400' :
                                        node.name === 'monitor' ? 'bg-cyan-400' : 'bg-gray-400'
                              }`} />
                            <span className="text-xs text-gray-400 capitalize">
                              {criterion.replace('-', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {node.configurable && (
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            <Settings className="h-3 w-3 mr-1" />
                            Configurable
                          </Badge>
                        )}
                        {node.localOnly && (
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                            <Shield className="h-3 w-3 mr-1" />
                            Local Only
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                          Status: {getUtilityStatus(node.category)}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 text-center">
                        Drag to canvas or click to configure and add
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gray-700/50 ${node.color}`}>
                    <node.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white capitalize">{node.name}</h3>
                    <p className="text-xs text-gray-400">{node.description}</p>
                  </div>
                  {node.configurable && (
                    <Settings className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status:</span>
                    <Badge variant="secondary" className="text-xs">
                      {getUtilityStatus(node.category)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {node.localOnly && (
                      <Badge variant="outline" className="text-xs">
                        Local
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="local-tools" className="space-y-3 mt-4">
            <div className="text-xs text-gray-400 mb-3">
              Local Strands tools for enhanced agent capabilities
            </div>

            {toolsLoading && (
              <div className="flex items-center justify-center p-4 text-gray-400">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Loading local tools...
              </div>
            )}

            {!toolsLoading && localTools.map((tool) => (
              <Card
                key={tool.id}
                className="p-4 bg-gray-800/40 border-gray-600/30 hover:border-blue-400/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-800/60 group"
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  const dragData = {
                    type: 'strands-tool',
                    tool: tool
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={() => {
                  if (tool.requiresConfiguration && !configuredTools.has(tool.id)) {
                    setToolConfigDialog({ tool });
                  } else {
                    onSelectStrandsTool?.(tool);
                  }
                }}
                style={{ userSelect: 'none' }}
              >
                {/* Hover Tooltip for Local Tools */}
                <div
                  className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none"
                  style={{
                    left: '400px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10000
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-700/50 ${tool.color}`}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                        <p className="text-xs text-gray-400">Local Strands Tool</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{tool.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-2">Configuration</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Category:</span>
                          <Badge variant="secondary" className="text-xs capitalize">{tool.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Requires Setup:</span>
                          <span className={tool.requiresConfiguration ? 'text-yellow-400' : 'text-green-400'}>
                            {tool.requiresConfiguration ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-blue-400">Ready</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 text-center">
                        Drag to canvas or click to configure
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gray-700/50 ${tool.color}`}>
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">{tool.name}</h3>
                    <p className="text-xs text-gray-400">{tool.description}</p>
                  </div>
                  {tool.requiresConfiguration && !configuredTools.has(tool.id) && (
                    <Settings className="h-4 w-4 text-yellow-400" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Category:</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {tool.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                      Local
                    </Badge>
                    {configuredTools.has(tool.id) && (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="external-tools" className="space-y-3 mt-4">
            <div className="text-xs text-gray-400 mb-3">
              External Strands tools requiring API keys or configuration
            </div>

            {toolsLoading && (
              <div className="flex items-center justify-center p-4 text-gray-400">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Loading external tools...
              </div>
            )}

            {!toolsLoading && externalTools.map((tool) => (
              <Card
                key={tool.id}
                className="p-4 bg-gray-800/40 border-gray-600/30 hover:border-purple-400/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-800/60 group"
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  const dragData = {
                    type: 'external-tool',
                    tool: tool
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={() => {
                  if (tool.requiresConfiguration && !configuredTools.has(tool.id)) {
                    setToolConfigDialog({ tool });
                  } else {
                    onSelectStrandsTool?.(tool);
                  }
                }}
                style={{ userSelect: 'none' }}
              >
                {/* Hover Tooltip for External Tools */}
                <div
                  className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none"
                  style={{
                    left: '400px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10000
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-700/50 ${tool.color}`}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                        <p className="text-xs text-gray-400">External Strands Tool</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{tool.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-2">Requirements</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">API Key:</span>
                          <span className={tool.requiresApi ? 'text-yellow-400' : 'text-green-400'}>
                            {tool.requiresApi ? 'Required' : 'Not Required'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Configuration:</span>
                          <span className={tool.requiresConfiguration ? 'text-yellow-400' : 'text-green-400'}>
                            {tool.requiresConfiguration ? 'Required' : 'Ready'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Category:</span>
                          <Badge variant="secondary" className="text-xs capitalize">{tool.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 text-center">
                        Drag to canvas or click to configure
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gray-700/50 ${tool.color}`}>
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">{tool.name}</h3>
                    <p className="text-xs text-gray-400">{tool.description}</p>
                  </div>
                  {tool.requiresApi && (
                    <Key className="h-4 w-4 text-yellow-400" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Category:</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {tool.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                      External
                    </Badge>
                    {configuredTools.has(tool.id) && (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mcp-tools" className="space-y-3 mt-4">
            <div className="text-xs text-gray-400 mb-3">
              Model Context Protocol tools for extended functionality
            </div>

            {mcpLoading && (
              <div className="flex items-center justify-center p-4 text-gray-400">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Loading MCP tools...
              </div>
            )}

            {!mcpLoading && mcpTools.length === 0 && (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No MCP tools available</p>
                <p className="text-gray-500 text-xs mt-1">Configure MCP servers to see tools here</p>
              </div>
            )}

            {!mcpLoading && mcpTools.map((tool) => {
              const IconComponent = getCategoryIcon(tool.category);
              return (
                <Card
                  key={tool.name}
                  className="p-4 bg-gray-800/40 border-gray-600/30 hover:border-cyan-400/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-800/60 group"
                  draggable={true}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    const dragData = {
                      type: 'mcp-tool',
                      tool: tool
                    };
                    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                    e.dataTransfer.effectAllowed = 'move';
                    e.currentTarget.style.opacity = '0.5';
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onClick={() => onSelectMCPTool?.(tool)}
                  style={{ userSelect: 'none' }}
                >
                  {/* Hover Tooltip for MCP Tools */}
                  <div
                    className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none"
                    style={{
                      left: '400px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10000
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-700/50 text-cyan-400">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                          <p className="text-xs text-gray-400">MCP Protocol Tool</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{tool.description}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-300 mb-2">Server Details</h4>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Server:</span>
                            <Badge variant="secondary" className="text-xs">{tool.serverName}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Category:</span>
                            <Badge variant="secondary" className="text-xs capitalize">{tool.category}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Complexity:</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${tool.usageComplexity === 'low'
                                ? 'border-green-600 text-green-400'
                                : tool.usageComplexity === 'medium'
                                  ? 'border-yellow-600 text-yellow-400'
                                  : 'border-red-600 text-red-400'
                                }`}
                            >
                              {tool.usageComplexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500 text-center">
                          Drag to canvas to integrate with workflow
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gray-700/50 text-cyan-400">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white">{tool.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{tool.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Server:</span>
                      <Badge variant="secondary" className="text-xs">
                        {tool.serverName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${tool.usageComplexity === 'low'
                          ? 'border-green-600 text-green-400'
                          : tool.usageComplexity === 'medium'
                            ? 'border-yellow-600 text-yellow-400'
                            : 'border-red-600 text-red-400'
                          }`}
                      >
                        {tool.usageComplexity}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                        MCP
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Strands Tool Configuration Dialog */}
      {toolConfigDialog && (
        <StrandsToolConfigDialog
          isOpen={true}
          onClose={() => setToolConfigDialog(null)}
          onSave={(config) => {
            console.log('Strands tool configured:', config);
            if (toolConfigDialog?.tool) {
              setConfiguredTools(prev => new Set([...prev, toolConfigDialog.tool.id]));
            }
            setToolConfigDialog(null);
            onSelectStrandsTool?.(toolConfigDialog.tool);
          }}
          tool={toolConfigDialog.tool}
          initialConfig={toolConfigDialog.config}
        />
      )}

      {/* Strands Agent Adaptation Dialog */}
      <StrandsAgentAdaptationDialog
        isOpen={showAdaptationDialog}
        onClose={() => {
          setShowAdaptationDialog(false);
          setSelectedOllamaAgent(null);
        }}
        ollamaAgent={selectedOllamaAgent}
        onAgentAdapted={handleAgentAdapted}
      />
    </div>
  );
};