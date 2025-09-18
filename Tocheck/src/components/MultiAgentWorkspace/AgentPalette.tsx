import React, { useState, useEffect } from 'react';
import { Bot, Brain, Shield, Database, GitBranch, MessageSquare, Search, Code, FileText, Calculator, Server, Globe, Zap, Settings, RefreshCw, AlertCircle, Eye, Info, Users, BarChart3, Briefcase, Headphones, Wrench, Network, Cpu, Target, BookOpen, Lightbulb, ArrowRight, X, Key, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mcpGatewayService, MCPTool } from '@/lib/services/MCPGatewayService';
import { useOllamaAgentsForPalette, PaletteAgent } from '@/hooks/useOllamaAgentsForPalette';
import { useStrandsNativeTools, StrandsNativeTool } from '@/hooks/useStrandsNativeTools';
import { StrandsToolConfigDialog } from './config/StrandsToolConfigDialog';
// import { useStrandsUtilities } from '@/hooks/useStrandsUtilities';

interface AgentPaletteProps {
  onAddAgent: (agentType: string, agentData?: PaletteAgent) => void;
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

// Agent Configuration Dialog Component
const AgentConfigDialog: React.FC<{ agent: PaletteAgent }> = ({ agent }) => {
  return (
    <DialogContent className="max-w-2xl bg-beam-dark border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-400" />
          Agent Configuration: {agent.name}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 text-white">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Basic Information</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Name:</span> {agent.name}</div>
              <div><span className="text-gray-400">Role:</span> {agent.role}</div>
              <div><span className="text-gray-400">Type:</span> {agent.type}</div>
              <div><span className="text-gray-400">Model:</span> {agent.model}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Security & Compliance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Guardrails:</span>
                {agent.guardrails ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Shield className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability) => (
              <Badge key={capability} variant="outline" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Description</h3>
          <p className="text-sm text-gray-300">{agent.description}</p>
        </div>

        {/* Original Configuration */}
        {agent.originalAgent && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Full Configuration</h3>
            <div className="bg-beam-dark-accent p-3 rounded border border-gray-700 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                {JSON.stringify(agent.originalAgent, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export const AgentPalette: React.FC<AgentPaletteProps> = ({ onAddAgent, onAddUtility, onSelectMCPTool, onSelectStrandsTool }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [toolConfigDialog, setToolConfigDialog] = useState<{ tool: StrandsNativeTool; config?: any } | null>(null);
  const [configuredTools, setConfiguredTools] = useState<Set<string>>(new Set());

  // Load Ollama agents
  const { agents: ollamaAgents, loading: agentsLoading, error: agentsError, refreshAgents } = useOllamaAgentsForPalette();
  
  // Get Strands native tools
  const { 
    localTools, 
    externalTools, 
    loading: toolsLoading 
  } = useStrandsNativeTools();
  
  // Load Strands utilities - temporarily disabled for debugging
  // const { utilityNodes, loading: utilitiesLoading, error: utilitiesError, getUtilityStatus } = useStrandsUtilities();
  
  // Complete set of utilities (restored from original)
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

  // Standard card dimensions for consistency
  const STANDARD_CARD_HEIGHT = 'h-[100px]';
  const STANDARD_CARD_WIDTH = 'w-full';

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

  const agentTypes = [
    { name: 'Researcher Agent', icon: Search, description: 'Researches and gathers information' },
    { name: 'Coder Agent', icon: Code, description: 'Writes and reviews code' },
    { name: 'Writer Agent', icon: FileText, description: 'Creates content and documentation' },
    { name: 'Analyst Agent', icon: Calculator, description: 'Analyzes data and provides insights' },
    { name: 'Coordinator Agent', icon: Bot, description: 'Orchestrates other agents' },
    { name: 'Chat Agent', icon: MessageSquare, description: 'Handles conversations' },
  ];

  // Utility nodes are now loaded dynamically from Strands SDK

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
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-beam-dark">
            <TabsTrigger value="agents" className="text-gray-300 data-[state=active]:text-white text-xs">Agents</TabsTrigger>
            <TabsTrigger value="utilities" className="text-gray-300 data-[state=active]:text-white text-xs">Utilities</TabsTrigger>
            <TabsTrigger value="local-tools" className="text-gray-300 data-[state=active]:text-white text-xs">Local Tools</TabsTrigger>
            <TabsTrigger value="external-tools" className="text-gray-300 data-[state=active]:text-white text-xs">External Tools</TabsTrigger>
            <TabsTrigger value="mcp-tools" className="text-gray-300 data-[state=active]:text-white text-xs">MCP Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="space-y-3 mt-4">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Ollama Agents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshAgents}
                disabled={agentsLoading}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <RefreshCw className={`h-3 w-3 ${agentsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Loading state */}
            {agentsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beam-blue mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading your agents...</p>
              </div>
            )}

            {/* Error state */}
            {agentsError && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm">Failed to load agents</p>
                <p className="text-gray-500 text-xs mt-1">{agentsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAgents}
                  className="mt-2 text-xs"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* No agents state */}
            {!agentsLoading && !agentsError && ollamaAgents.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No agents available</p>
                <p className="text-gray-500 text-xs mt-1">Create agents in Ollama Agent Management first</p>
              </div>
            )}

            {/* Ollama agents list */}
            {!agentsLoading && !agentsError && ollamaAgents.map((agent) => {
              const { icon: IconComponent, color } = getProfessionalAgentIcon(agent.role, agent.capabilities);
              
              return (
                <div 
                  key={agent.id}
                  className="relative p-4 bg-gray-800/40 border border-gray-600/30 rounded-lg hover:border-blue-400/50 cursor-pointer transition-all duration-200 hover:bg-gray-800/60 group"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      type: 'ollama-agent',
                      agent: agent
                    }));
                  }}
                  onClick={() => onAddAgent('ollama-agent', agent)}
                >
                  {/* Enhanced Hover Tooltip with Complete Configuration */}
                  <div 
                    className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-96 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none max-h-[80vh] overflow-y-auto"
                    style={{
                      left: '400px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10000
                    }}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                        <div className={`p-2 rounded-lg bg-gray-700/50 ${color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Agent Configuration: {agent.name}</h3>
                          <p className="text-xs text-gray-400">Complete configuration details for this agent</p>
                        </div>
                      </div>
                      
                      {/* Basic Information */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Agent ID:</span>
                            <div className="text-white font-mono text-xs break-all">
                              {agent.originalAgent?.id || agent.id}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <div className="text-green-400 font-medium">Active</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Role:</span>
                            <div className="text-white font-medium">{agent.role}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Created:</span>
                            <div className="text-white font-medium">
                              {agent.originalAgent?.created_at ? 
                                new Date(agent.originalAgent.created_at).toLocaleDateString() : 
                                'Unknown'
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 mb-2">Description</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {agent.originalAgent?.description || agent.description || 
                           `${agent.role} specialized for intelligent task processing and workflow automation with ${agent.model} model.`}
                        </p>
                      </div>

                      {/* Personality */}
                      {agent.originalAgent?.personality && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-300 mb-2">Personality</h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {agent.originalAgent.personality}
                          </p>
                        </div>
                      )}

                      {/* Expertise */}
                      {agent.originalAgent?.expertise && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-300 mb-2">Expertise</h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {agent.originalAgent.expertise}
                          </p>
                        </div>
                      )}
                      
                      {/* Model Configuration */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          Model Configuration
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Model:</span>
                            <div className="text-white font-medium">{agent.model}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <div className="text-white font-medium capitalize">{agent.type}</div>
                          </div>
                          {agent.originalAgent?.temperature && (
                            <div>
                              <span className="text-gray-400">Temperature:</span>
                              <div className="text-white font-medium">{agent.originalAgent.temperature}</div>
                            </div>
                          )}
                          {(agent.originalAgent?.max_tokens || agent.originalAgent?.maxTokens) && (
                            <div>
                              <span className="text-gray-400">Max Tokens:</span>
                              <div className="text-white font-medium">
                                {agent.originalAgent.max_tokens || agent.originalAgent.maxTokens}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Capabilities */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Capabilities
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.map((cap) => (
                            <span key={cap} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Guardrails */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Security & Guardrails
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Status:</span>
                            {(() => {
                              // Check for enhanced guardrails in multiple locations
                              const enhancedGuardrails = agent.originalAgent?.enhancedGuardrails || 
                                                       (agent.originalAgent as any)?.enhanced_guardrails ||
                                                       (agent as any)?.enhancedGuardrails;
                              
                              const hasEnhancedGuardrails = Boolean(enhancedGuardrails && (
                                enhancedGuardrails.contentFilter?.enabled ||
                                enhancedGuardrails.piiRedaction?.enabled ||
                                enhancedGuardrails.customRules?.length > 0 ||
                                enhancedGuardrails.behaviorLimits?.enabled
                              ));
                              
                              if (hasEnhancedGuardrails) {
                                return (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Protected
                                  </Badge>
                                );
                              } else if (agent.guardrails) {
                                return (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Basic
                                  </Badge>
                                );
                              } else {
                                return (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    None
                                  </Badge>
                                );
                              }
                            })()}
                          </div>
                          {/* Enhanced Guardrails Details */}
                          {(() => {
                            // Check for enhanced guardrails in multiple locations
                            const enhancedGuardrails = agent.originalAgent?.enhancedGuardrails || 
                                                     (agent.originalAgent as any)?.enhanced_guardrails ||
                                                     (agent as any)?.enhancedGuardrails;
                            
                            if (!enhancedGuardrails) return null;
                            
                            return (
                              <div className="space-y-2 mt-2">
                                {/* Content Filter Details */}
                                {enhancedGuardrails.contentFilter?.enabled && (
                                  <div className="text-xs">
                                    <span className="text-gray-400">Content Filter:</span>
                                    <div className="ml-2 mt-1">
                                      {enhancedGuardrails.contentFilter.level && (
                                        <div className="text-blue-300 mb-1">
                                          Level: {enhancedGuardrails.contentFilter.level}
                                        </div>
                                      )}
                                      {enhancedGuardrails.contentFilter.customKeywords?.length > 0 && (
                                        <div className="text-red-300">
                                          {enhancedGuardrails.contentFilter.customKeywords.length} blocked keywords
                                        </div>
                                      )}
                                      {enhancedGuardrails.contentFilter.blockedPhrases?.length > 0 && (
                                        <div className="text-red-300">
                                          {enhancedGuardrails.contentFilter.blockedPhrases.length} blocked phrases
                                        </div>
                                      )}
                                      {enhancedGuardrails.contentFilter.allowedDomains?.length > 0 && (
                                        <div className="text-green-300">
                                          {enhancedGuardrails.contentFilter.allowedDomains.length} allowed domains
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* PII Redaction */}
                                {enhancedGuardrails.piiRedaction?.enabled && (
                                  <div className="text-xs">
                                    <span className="text-gray-400">PII Protection:</span>
                                    <div className="ml-2 mt-1">
                                      <div className="text-yellow-300">
                                        Strategy: {enhancedGuardrails.piiRedaction.strategy}
                                      </div>
                                      {enhancedGuardrails.piiRedaction.customTypes?.length > 0 && (
                                        <div className="text-yellow-300">
                                          {enhancedGuardrails.piiRedaction.customTypes.length} custom types
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Custom Rules */}
                                {enhancedGuardrails.customRules?.length > 0 && (
                                  <div className="text-xs">
                                    <span className="text-gray-400">Custom Rules:</span>
                                    <div className="ml-2 mt-1 text-orange-300">
                                      {enhancedGuardrails.customRules.filter((r: any) => r.enabled).length} active rules
                                    </div>
                                  </div>
                                )}

                                {/* Behavior Limits */}
                                {enhancedGuardrails.behaviorLimits?.enabled && (
                                  <div className="text-xs">
                                    <span className="text-gray-400">Behavior Limits:</span>
                                    <div className="ml-2 mt-1 text-purple-300">
                                      {enhancedGuardrails.behaviorLimits.customLimits?.length || 0} custom limits
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Fallback for basic guardrails */}
                          {!agent.originalAgent?.enhancedGuardrails && (
                            <>
                              {(agent.originalAgent?.guardrails?.content_filter || agent.originalAgent?.guardrails?.contentFilters) && (
                                <div className="text-xs">
                                  <span className="text-gray-400">Content Filter:</span>
                                  <span className="text-green-400 ml-2">Enabled</span>
                                </div>
                              )}
                              {(agent.originalAgent?.guardrails?.safety_level || agent.originalAgent?.guardrails?.safetyLevel) && (
                                <div className="text-xs">
                                  <span className="text-gray-400">Safety Level:</span>
                                  <span className="text-white ml-2 capitalize">
                                    {agent.originalAgent.guardrails.safety_level || agent.originalAgent.guardrails.safetyLevel}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* System Prompt */}
                      {(agent.originalAgent?.system_prompt || agent.originalAgent?.systemPrompt) && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                            <Code className="h-3 w-3" />
                            System Prompt
                          </h4>
                          <div className="bg-gray-800/50 p-2 rounded border border-gray-700 max-h-20 overflow-y-auto">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                              {agent.originalAgent.system_prompt || agent.originalAgent.systemPrompt}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      {/* Usage Instructions */}
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500 text-center">
                          Drag to canvas or click to add to workflow
                        </p>
                      </div>
                    </div>
                    
                    {/* Tooltip Arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                      <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-600 rotate-45"></div>
                    </div>
                  </div>
                  {/* Header with Icon and Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gray-700/50 ${color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white mb-1">{agent.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400">Active</span>
                      </div>
                    </div>
                    {agent.guardrails && (
                      <Shield className="h-4 w-4 text-green-400" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                    {agent.role?.includes('cvm') || agent.role?.includes('customer') ? 
                      'Maps complete customer journeys across touchpoints and identifies friction points' :
                    agent.role?.includes('analyst') ? 
                      'Predicts customer lifetime value and identifies high-value segments' :
                    agent.role?.includes('chat') ? 
                      'Recommends personalized next best actions for each customer interaction' :
                      agent.description || 'Specialized AI agent for automated task processing'
                    }
                  </p>

                  {/* Model Info */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Model:</span>
                    <span className="text-xs text-white font-medium">
                      {agent.model.replace('llama3.2:', 'GPT-4o').replace('llama3:', 'Claude 3').replace('mistral:', 'Mistral').replace('phi3:', 'Phi-3')}
                    </span>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Capabilities:</span>
                      <span className="text-xs text-blue-400">+{agent.capabilities.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                          {cap.replace('customer-analysis', 'Journey Mapping')
                             .replace('risk-assessment', 'Risk Analysis')  
                             .replace('data-analysis', 'Data Analytics')
                             .replace('document-processing', 'Document Processing')
                             .substring(0, 12)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
                  console.log('🚀 Starting drag for utility node:', dragData);
                  console.log('🚀 Drag event target:', e.target);
                  console.log('🚀 Drag event current target:', e.currentTarget);
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  e.dataTransfer.effectAllowed = 'move';
                  
                  // Add visual feedback
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  console.log('🏁 Drag ended for utility node:', node.name);
                  // Restore visual feedback
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger configuration dialog instead of directly adding
                  if (node.configurable) {
                    onAddUtility(node.name, { ...node, needsConfiguration: true });
                  } else {
                    onAddUtility(node.name, node);
                  }
                }}
                style={{ userSelect: 'none' }}
              >
                {/* Hover Tooltip */}
                <div 
                  className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none select-none"
                  style={{
                    left: '400px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10000,
                    pointerEvents: 'none'
                  }}
                  onDragStart={(e) => e.preventDefault()}
                  onDrag={(e) => e.preventDefault()}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-700/50 ${node.color}`}>
                        <node.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white capitalize">{node.name} Node</h3>
                        <p className="text-xs text-gray-400">Workflow Utility</p>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {node.description}
                      </p>
                    </div>
                    
                    {/* Configuration Criteria */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-2">Configuration Options</h4>
                      <div className="space-y-1">
                        {node.criteria.map((criterion) => (
                          <div key={criterion} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              node.name === 'decision' ? 'bg-yellow-400' :
                              node.name === 'handoff' ? 'bg-blue-400' :
                              node.name === 'human' ? 'bg-orange-400' :
                              node.name === 'memory' ? 'bg-green-400' :
                              node.name === 'guardrail' ? 'bg-red-400' :
                              node.name === 'aggregator' ? 'bg-purple-400' :
                              'bg-cyan-400'
                            }`}></div>
                            <span className="text-xs text-gray-300">
                              {criterion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Use Cases */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-300 mb-1">Best For</h4>
                      <p className="text-xs text-gray-400">
                        {node.name === 'decision' ? 'Conditional routing, A/B testing, confidence-based branching' :
                         node.name === 'handoff' ? 'Expert routing, load balancing, context preservation' :
                         node.name === 'human' ? 'Approval workflows, data collection, quality control' :
                         node.name === 'memory' ? 'State management, context sharing, data persistence' :
                         node.name === 'guardrail' ? 'Safety validation, compliance checks, content filtering' :
                         node.name === 'aggregator' ? 'Multi-agent consensus, result combination, voting systems' :
                         'Performance tracking, SLA monitoring, alerting systems'}
                      </p>
                    </div>
                    
                    {/* Action Hint */}
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500 text-center">
                        Click to add to workspace or drag to canvas
                      </p>
                    </div>
                  </div>
                  
                  {/* Tooltip Arrow */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                    <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-600 rotate-45"></div>
                  </div>
                </div>
                {/* Drag Handle Indicator */}
                <div className="absolute top-2 right-2 text-gray-500 text-xs opacity-50" style={{ pointerEvents: 'none' }}>
                  ⋮⋮
                </div>

                {/* Header with Icon and Status */}
                <div className="flex items-center gap-3 mb-3" style={{ pointerEvents: 'none' }}>
                  <div className={`p-2 rounded-lg bg-gray-700/50 ${node.color}`}>
                    <node.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white capitalize mb-1">{node.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${node.color.replace('text-', 'bg-')}`}></div>
                      <span className={`text-xs ${node.color}`}>
                        {getUtilityStatus(node.category)}
                      </span>
                      {node.configurable && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Configurable
                        </Badge>
                      )}
                      {node.localOnly && (
                        <Badge variant="outline" className="text-xs px-1 py-0 bg-green-900/20 text-green-400">
                          Local
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 mb-3 leading-relaxed" style={{ pointerEvents: 'none' }}>
                  {node.description}
                </p>

                {/* Type Info */}
                <div className="flex items-center justify-between mb-2" style={{ pointerEvents: 'none' }}>
                  <span className="text-xs text-gray-400">Type:</span>
                  <span className="text-xs text-white font-medium">
                    {node.name === 'decision' ? 'Logic Gate' :
                     node.name === 'handoff' ? 'Context Transfer' :
                     node.name === 'human' ? 'Input Collector' :
                     node.name === 'memory' ? 'Data Store' :
                     node.name === 'guardrail' ? 'Safety Check' :
                     node.name === 'aggregator' ? 'Response Merger' :
                     'Metrics Tracker'}
                  </span>
                </div>

                {/* Rules */}
                <div className="space-y-1" style={{ pointerEvents: 'none' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Rules:</span>
                    <span className="text-xs text-blue-400">+{node.criteria.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {node.criteria.slice(0, 2).map((criterion) => (
                      <span key={criterion} className={`px-2 py-1 text-xs rounded border ${
                        node.name === 'decision' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        node.name === 'handoff' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        node.name === 'human' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                        node.name === 'memory' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        node.name === 'guardrail' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        node.name === 'aggregator' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {criterion.replace('condition-based', 'Conditional')
                                 .replace('expertise-match', 'Expertise')
                                 .replace('interrupt-message', 'Interrupt')
                                 .replace('persistence-level', 'Persistence')
                                 .replace('safety-level', 'Safety')
                                 .replace('consensus-method', 'Consensus')
                                 .replace('metrics-collection', 'Metrics')
                                 .substring(0, 10)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="local-tools" className="space-y-3 mt-4">
            {toolsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beam-blue mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading local tools...</p>
              </div>
            ) : localTools.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No local tools available</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-3">
                  Local tools work without API keys - drag to add to workflow
                </div>
                {localTools.map((tool) => {
                  const IconComponent = tool.icon;
                  
                  return (
                    <Card 
                      key={tool.id}
                      className="relative p-3 h-[100px] w-full bg-beam-dark border-gray-700 hover:border-beam-blue cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg group"
                      draggable
                      onDragStart={(e) => {
                        console.log('Local Strands Tool drag started:', tool);
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'strands-tool',
                          tool: tool
                        }));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => {
                        console.log('Local Strands Tool clicked:', tool);
                        onSelectStrandsTool?.(tool);
                      }}
                    >
                      {/* Hover Tooltip */}
                      <div 
                        className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none"
                        style={{
                          left: '100%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          marginLeft: '10px',
                          zIndex: 1000
                        }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${tool.color}20` }}>
                              <IconComponent className="h-4 w-4" style={{ color: tool.color }} />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                              <p className="text-xs text-gray-400">Local Tool</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">Category:</span>
                              <div className="text-white font-medium capitalize">{tool.category}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Complexity:</span>
                              <div className={`font-medium ${
                                tool.complexity === 'simple' ? 'text-green-400' :
                                tool.complexity === 'moderate' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {tool.complexity}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {tool.tags.slice(0, 4).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            <span>No API key required</span>
                          </div>
                        </div>
                        
                        {/* Tooltip Arrow */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                          <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-600 rotate-45"></div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex items-center gap-3 h-full">
                        <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${tool.color}20` }}>
                          <IconComponent className="h-5 w-5" style={{ color: tool.color }} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">{tool.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-tight mt-1">
                            {tool.description}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              {tool.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>Local</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="external-tools" className="space-y-3 mt-4">
            {toolsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beam-blue mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading external tools...</p>
              </div>
            ) : externalTools.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No external tools available</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-3">
                  External tools require API configuration - click to configure
                </div>
                {externalTools.map((tool) => {
                  const IconComponent = tool.icon;
                  
                  return (
                    <Card 
                      key={tool.id}
                      className={`relative p-3 h-[100px] w-full bg-beam-dark border-gray-700 hover:border-beam-blue transition-all duration-200 hover:shadow-lg group ${
                        configuredTools.has(tool.id) 
                          ? 'cursor-grab active:cursor-grabbing border-green-600' 
                          : 'cursor-pointer'
                      }`}
                      draggable={configuredTools.has(tool.id)}
                      onDragStart={configuredTools.has(tool.id) ? (e) => {
                        console.log('External Strands Tool drag started:', tool);
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'strands-tool',
                          tool: tool
                        }));
                        e.dataTransfer.effectAllowed = 'copy';
                      } : undefined}
                      onClick={() => {
                        if (!configuredTools.has(tool.id)) {
                          console.log('External Strands Tool clicked for configuration:', tool);
                          setToolConfigDialog({ tool });
                        } else {
                          console.log('External Strands Tool is configured and draggable:', tool);
                          onSelectStrandsTool?.(tool);
                        }
                      }}
                    >
                      {/* Hover Tooltip */}
                      <div 
                        className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg shadow-2xl p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none"
                        style={{
                          left: '100%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          marginLeft: '10px',
                          zIndex: 1000
                        }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${tool.color}20` }}>
                              <IconComponent className="h-4 w-4" style={{ color: tool.color }} />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                              <p className="text-xs text-gray-400">External Tool</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">Category:</span>
                              <div className="text-white font-medium capitalize">{tool.category}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Complexity:</span>
                              <div className={`font-medium ${
                                tool.complexity === 'simple' ? 'text-green-400' :
                                tool.complexity === 'moderate' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {tool.complexity}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {tool.tags.slice(0, 4).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {configuredTools.has(tool.id) ? (
                            <div className="flex items-center gap-2 text-xs text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              <span>Configured and ready to use</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-yellow-400">
                              <Key className="h-3 w-3" />
                              <span>API configuration required</span>
                            </div>
                          )}
                          
                          <div className="text-xs text-blue-400">
                            {configuredTools.has(tool.id) 
                              ? 'Drag to canvas or click for details'
                              : 'Click to configure API settings'
                            }
                          </div>
                        </div>
                        
                        {/* Tooltip Arrow */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                          <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-600 rotate-45"></div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex items-center gap-3 h-full">
                        <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${tool.color}20` }}>
                          <IconComponent className="h-5 w-5" style={{ color: tool.color }} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">{tool.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-tight mt-1">
                            {tool.description}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              {tool.category}
                            </Badge>
                            {configuredTools.has(tool.id) ? (
                              <div className="flex items-center gap-1 text-xs text-green-400">
                                <CheckCircle className="h-3 w-3" />
                                <span>Ready</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-yellow-400">
                                <Key className="h-3 w-3" />
                                <span>API</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <Settings className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mcp-tools" className="space-y-3 mt-4">
            {mcpLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beam-blue mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading MCP tools...</p>
              </div>
            ) : mcpTools.length === 0 ? (
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No MCP tools available</p>
                <p className="text-gray-500 text-xs mt-1">Connect to MCP Gateway first</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-3">
                  Drag tools to workspace or agents to add capabilities
                </div>
                {mcpTools.map((tool) => {
                  const IconComponent = getCategoryIcon(tool.category);
                  return (
                    <Card 
                      key={`${tool.serverId}-${tool.id}`}
                      className="relative p-3 h-[100px] w-full bg-beam-dark border-gray-700 hover:border-beam-blue cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg group"
                      draggable
                      onDragStart={(e) => {
                        console.log('MCP Tool drag started:', tool);
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'mcp-tool',
                          tool: tool
                        }));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => {
                        console.log('MCP Tool clicked:', tool);
                        onSelectMCPTool?.(tool);
                      }}
                    >
                      {/* Hover Tooltip */}
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
                          {/* Header */}
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-700/50 text-blue-400">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                              <p className="text-xs text-gray-400">MCP Tool</p>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-300 mb-1">Description</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                          
                          {/* Tool Details */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">Category:</span>
                              <div className="text-white font-medium capitalize">{tool.category}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Complexity:</span>
                              <div className={`font-medium ${
                                tool.usageComplexity === 'simple' ? 'text-green-400' :
                                tool.usageComplexity === 'moderate' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {tool.usageComplexity}
                              </div>
                            </div>
                          </div>
                          
                          {/* Server Info */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-300 mb-1">Server</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">ID: {tool.serverId}</span>
                              {tool.verified && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Usage Hint */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-300 mb-1">Usage</h4>
                            <p className="text-xs text-gray-400">
                              {tool.category === 'aws' ? 'Integrates with AWS services for cloud operations' :
                               tool.category === 'git' ? 'Provides Git repository management capabilities' :
                               tool.category === 'filesystem' ? 'Enables file system operations and management' :
                               tool.category === 'api' ? 'Connects to external APIs and web services' :
                               tool.category === 'text' ? 'Processes and manipulates text content' :
                               'Provides specialized functionality for workflow enhancement'}
                            </p>
                          </div>
                          
                          {/* Action Hint */}
                          <div className="pt-2 border-t border-gray-700">
                            <p className="text-xs text-gray-500 text-center">
                              Drag to agent or workspace to add capability
                            </p>
                          </div>
                        </div>
                        
                        {/* Tooltip Arrow */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                          <div className="w-2 h-2 bg-gray-900 border-l border-t border-gray-600 rotate-45"></div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 h-full">
                        <div className="p-2 rounded-lg bg-gray-800 text-blue-400 flex-shrink-0">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-white truncate">{tool.name}</h3>
                              {tool.verified && (
                                <div className="w-3 h-3 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 mb-2">{tool.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 border-gray-600">
                                {tool.category}
                              </Badge>
                              <Badge variant="outline" className={`text-xs px-1.5 py-0.5 h-5 ${
                                tool.usageComplexity === 'simple' ? 'border-green-600 text-green-400' :
                                tool.usageComplexity === 'moderate' ? 'border-yellow-600 text-yellow-400' :
                                'border-red-600 text-red-400'
                              }`}>
                                {tool.usageComplexity}
                              </Badge>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              MCP Tool
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
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
            // Mark tool as configured and make it draggable
            if (toolConfigDialog?.tool) {
              setConfiguredTools(prev => new Set([...prev, toolConfigDialog.tool.id]));
            }
            setToolConfigDialog(null);
            // Optionally trigger a callback to notify parent component
            onSelectStrandsTool?.(toolConfigDialog.tool);
          }}
          tool={toolConfigDialog.tool}
          initialConfig={toolConfigDialog.config}
        />
      )}
    </div>
  );
};