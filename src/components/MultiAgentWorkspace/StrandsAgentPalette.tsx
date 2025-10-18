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

  // A2A Orchestration agents state
  const [orchestrationAgents, setOrchestrationAgents] = useState<any[]>([]);
  const [orchestrationLoading, setOrchestrationLoading] = useState(false);

  // Tooltip state - track which agent's tooltip is shown
  const [activeTooltipAgentId, setActiveTooltipAgentId] = useState<string | null>(null);

  // Load A2A Orchestration agents
  const loadOrchestrationAgents = async () => {
    console.log('🔄 StrandsAgentPalette: Loading A2A Orchestration agents...');
    setOrchestrationLoading(true);
    try {
      const response = await fetch('http://localhost:5008/api/a2a/orchestration-agents');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ StrandsAgentPalette: Loaded orchestration agents:', data);
        setOrchestrationAgents(data.agents || []);
      } else {
        console.error('❌ Failed to load orchestration agents:', response.status);
        setOrchestrationAgents([]);
      }
    } catch (error) {
      console.error('❌ StrandsAgentPalette: Failed to load orchestration agents:', error);
      setOrchestrationAgents([]);
    } finally {
      setOrchestrationLoading(false);
    }
  };

  // Handle tooltip toggle
  const handleTooltipToggle = (agentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering drag or other events
    setActiveTooltipAgentId(prev => prev === agentId ? null : agentId);
  };

  // Handle agent deletion (for orchestration agents)
  const handleDeleteAgent = async (agentId: string, agentName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the onClick of the parent div
    
    // Confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to remove the agent "${agentName}" from orchestration? This will unregister it from A2A.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      // Call A2A service to unregister agent
      const response = await fetch(`http://localhost:5008/api/a2a/agents/${agentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh the orchestration agents list
        await loadOrchestrationAgents();
        setActiveTooltipAgentId(null); // Close tooltip if this agent was showing it
        console.log(`Agent ${agentName} removed from orchestration successfully`);
      } else {
        console.error('Failed to remove agent: Server returned error');
        alert('Failed to remove agent. Please try again.');
      }
    } catch (error) {
      console.error('Failed to remove agent:', error);
      alert('Failed to remove agent. Please check your connection and try again.');
    }
  };

  // Load agents on mount
  useEffect(() => {
    loadOrchestrationAgents();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadOrchestrationAgents();
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
        <Tabs defaultValue="a2a-agents" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-beam-dark">
            <TabsTrigger value="a2a-agents" className="text-gray-300 data-[state=active]:text-white text-xs">A2A Agents</TabsTrigger>
            <TabsTrigger value="utilities" className="text-gray-300 data-[state=active]:text-white text-xs">Utilities</TabsTrigger>
            <TabsTrigger value="local-tools" className="text-gray-300 data-[state=active]:text-white text-xs">Local</TabsTrigger>
            <TabsTrigger value="external-tools" className="text-gray-300 data-[state=active]:text-white text-xs">External</TabsTrigger>
            <TabsTrigger value="mcp-tools" className="text-gray-300 data-[state=active]:text-white text-xs">MCP</TabsTrigger>
          </TabsList>

          <TabsContent value="a2a-agents" className="space-y-3 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-300">A2A Orchestration Agents</h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5 bg-green-600">
                    {orchestrationAgents.length + 1}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  Orchestration-enabled agents ready for multi-agent workflows
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadOrchestrationAgents}
                  disabled={orchestrationLoading}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  title="Refresh A2A agents"
                >
                  <RefreshCw className={`h-3 w-3 ${orchestrationLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Loading state */}
            {orchestrationLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading orchestration agents...</p>
              </div>
            )}

            {/* No agents state */}
            {!orchestrationLoading && orchestrationAgents.length === 0 && (
              <div className="text-center py-8">
                <Network className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No orchestration agents registered</p>
                <p className="text-gray-500 text-xs mt-1">Create agents in Ollama Agent Dashboard and enable orchestration</p>
              </div>
            )}

            {/* Main System Orchestrator - Always First */}
            {!orchestrationLoading && (
              <div
                key="main-system-orchestrator"
                className="relative p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/50 rounded-lg hover:border-purple-400 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 group"
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  const dragData = {
                    type: 'main-system-orchestrator',
                    agent: {
                      id: 'main-system-orchestrator',
                      name: 'Main System Orchestrator',
                      capabilities: ['orchestration', 'coordination', 'routing', 'execution'],
                      orchestration_enabled: true,
                      a2a_status: 'registered',
                      dedicated_ollama_backend: {
                        port: 5031,
                        model: 'qwen3:1.7b',
                        status: 'running'
                      }
                    }
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={() => onAddAgent('main-system-orchestrator', {
                  id: 'main-system-orchestrator',
                  name: 'Main System Orchestrator',
                  capabilities: ['orchestration', 'coordination', 'routing', 'execution']
                })}
                style={{ userSelect: 'none' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/30 ring-2 ring-purple-400/50">
                      <Brain className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        Main System Orchestrator
                        <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-300">
                          Core System
                        </Badge>
                      </h4>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-300">
                          Master Coordinator
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-1">Functions:</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-purple-500/20">
                      Orchestration
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-purple-500/20">
                      Coordination
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-purple-500/20">
                      Routing
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-purple-500/20">
                      Execution
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Port:</span>
                    <Badge variant="secondary" className="text-xs bg-purple-500/20">
                      5031
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-purple-300">
                    <CheckCircle className="h-3 w-3" />
                    <span>System Core</span>
                  </div>
                </div>
              </div>
            )}

            {/* Separator between orchestrator and agents */}
            {!orchestrationLoading && orchestrationAgents.length > 0 && (
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-beam-dark-accent px-2 text-gray-500">Orchestration Agents</span>
                </div>
              </div>
            )}

            {/* A2A Orchestration agents list */}
            {!orchestrationLoading && orchestrationAgents.map((agent) => (
              <div
                key={agent.id}
                className="relative p-4 bg-gray-800/40 border border-gray-600/30 rounded-lg hover:border-green-400/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-800/60 group"
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  const dragData = {
                    type: 'a2a-orchestration-agent',
                    agent: agent
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={() => onAddAgent('a2a-orchestration-agent', agent)}
                style={{ userSelect: 'none' }}
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <Network className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                        <p className="text-xs text-gray-400">A2A Orchestration Agent</p>
                      </div>
                    </div>

                    {/* A2A Status Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-300">A2A Status</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Registered:</span>
                          <span className="text-green-400 font-medium">Yes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Orchestration:</span>
                          <span className="text-green-400 font-medium">Enabled</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">A2A ID:</span>
                          <span className="text-white font-mono text-xs truncate max-w-[180px]">{agent.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Connections:</span>
                          <span className="text-white font-medium">0</span>
                        </div>
                      </div>
                    </div>

                    {/* Tools/Capabilities Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-300">Tools ({agent.capabilities?.length || 0})</h4>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities && agent.capabilities.map((cap: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5">
                            {cap}
                          </Badge>
                        ))}
                        {(!agent.capabilities || agent.capabilities.length === 0) && (
                          <p className="text-xs text-gray-500">No tools assigned</p>
                        )}
                      </div>
                    </div>

                    {/* Backend Configuration */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-300">Backend Configuration</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Backend:</span>
                          <span className="text-white font-medium">
                            {agent.dedicated_ollama_backend ? `Port ${agent.dedicated_ollama_backend.port}` : 'Shared'}
                          </span>
                        </div>
                        {agent.dedicated_ollama_backend && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Model:</span>
                              <span className="text-white font-medium">{agent.dedicated_ollama_backend.model || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Status:</span>
                              <span className="text-green-400 font-medium capitalize">{agent.dedicated_ollama_backend.status || 'running'}</span>
                            </div>
                          </>
                        )}
                      </div>
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
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Network className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                          Orchestration Ready
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleTooltipToggle(agent.id, e)}
                    className="p-1 rounded-full hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors"
                    title="View Details"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </div>

                {/* Capabilities */}
                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-1">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities && agent.capabilities.slice(0, 3).map((cap: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5">
                        {cap}
                      </Badge>
                    ))}
                    {agent.capabilities && agent.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        +{agent.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Backend:</span>
                    <Badge variant="secondary" className="text-xs">
                      {agent.dedicated_ollama_backend ? `Port ${agent.dedicated_ollama_backend.port}` : 'Shared'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>A2A Registered</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="utilities" className="space-y-3 mt-4">
            {/* Utilities Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-300">Utility Nodes</h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                    {utilityNodes.length}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  Flow control and orchestration utilities
                </span>
              </div>
            </div>

            {/* Utility nodes list */}
            {utilityNodes.map((utility) => (
              <div
                key={utility.id}
                className="relative p-4 bg-gray-800/40 border border-gray-600/30 rounded-lg hover:border-purple-400/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-800/60 group"
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  const dragData = {
                    type: 'utility-node',
                    nodeType: utility.category,
                    nodeData: { ...utility, needsConfiguration: utility.configurable }
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={() => onAddUtility(utility.category, utility)}
                style={{ userSelect: 'none' }}
              >
                {/* Utility Node Card */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-purple-500/20`}>
                    {React.createElement(utility.icon, { className: `h-5 w-5 ${utility.color}` })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm capitalize">{utility.name}</h4>
                    <p className="text-gray-400 text-xs">{utility.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="local-tools" className="space-y-3 mt-4">
            {/* Local Tools Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-300">Local Tools</h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                    {localTools.length}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  Built-in tools for local operations
                </span>
              </div>
            </div>

            {/* Local tools list */}
            {toolsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading local tools...</p>
              </div>
            )}

            {!toolsLoading && localTools.length === 0 && (
              <div className="text-center py-8">
                <Code className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No local tools available</p>
              </div>
            )}

            {!toolsLoading && localTools.map((tool) => (
              <div
                key={tool.id}
                className="relative p-4 bg-gray-800/40 border border-gray-600/30 rounded-lg hover:border-blue-400/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-800/60 group"
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
                  if (onSelectStrandsTool) {
                    onSelectStrandsTool(tool);
                  }
                }}
                style={{ userSelect: 'none' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Code className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{tool.name}</h4>
                      <p className="text-gray-400 text-xs">{tool.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                      Local
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                  {tool.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>Click to configure tool</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {tool.requiresApiKey && (
                      <Badge variant="secondary" className="text-xs">
                        <Key className="h-3 w-3 mr-1" />
                        API Key
                      </Badge>
                    )}
                    {tool.configurable && (
                      <Badge variant="secondary" className="text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        Config
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
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

    </div>
  );
};