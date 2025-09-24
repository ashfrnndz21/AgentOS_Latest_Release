/**
 * Enhanced Strands Agent Palette
 * Integrates with StrandsToolRegistry for advanced tool management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Brain, Shield, Database, GitBranch, MessageSquare, Search, Code, FileText, Calculator, Server, Globe, Zap, Settings, RefreshCw, AlertCircle, Eye, Info, Users, BarChart3, Briefcase, Headphones, Wrench, Network, Cpu, Target, BookOpen, Lightbulb, ArrowRight, X, Key, CheckCircle, Download, Plus, Link, TestTube, Workflow, Play, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { StrandsToolRegistry, StrandsTool, ToolComposition } from './StrandsToolRegistry';
import { StrandsToolConfigurationDialog } from './StrandsToolConfigurationDialog';
import { StrandsAgentAdaptationDialog } from './StrandsAgentAdaptationDialog';
import { strandsAgentService, DisplayableOllamaAgent, StrandsAgent } from '@/lib/services/StrandsAgentService';

interface EnhancedStrandsAgentPaletteProps {
  onAddAgent: (agentType: string, agentData?: any) => void;
  onAddUtility: (nodeType: string, utilityData?: any) => void;
  onSelectMCPTool?: (tool: any) => void;
  onSelectStrandsTool?: (tool: StrandsTool) => void;
  onComposeTools?: (tools: StrandsTool[]) => void;
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
    return { icon: Users, color: 'text-cyan-500' };

  // Security & Compliance
  if (roleLower.includes('security') || roleLower.includes('compliance') || roleLower.includes('audit'))
    return { icon: Shield, color: 'text-red-500' };

  // AI & Intelligence
  if (roleLower.includes('ai') || roleLower.includes('intelligence') || roleLower.includes('smart'))
    return { icon: Brain, color: 'text-violet-500' };

  // Network & Infrastructure
  if (roleLower.includes('network') || roleLower.includes('infrastructure') || roleLower.includes('system'))
    return { icon: Network, color: 'text-emerald-500' };

  // Performance & Optimization
  if (roleLower.includes('performance') || roleLower.includes('optimization') || roleLower.includes('efficiency'))
    return { icon: Zap, color: 'text-yellow-500' };

  // Strategy & Planning
  if (roleLower.includes('strategy') || roleLower.includes('planning') || roleLower.includes('strategy'))
    return { icon: Target, color: 'text-amber-500' };

  // Learning & Development
  if (roleLower.includes('learning') || roleLower.includes('training') || roleLower.includes('education'))
    return { icon: BookOpen, color: 'text-teal-500' };

  // Innovation & Creativity
  if (roleLower.includes('innovation') || roleLower.includes('creative') || roleLower.includes('invention'))
    return { icon: Lightbulb, color: 'text-lime-500' };

  return { icon: Bot, color: 'text-gray-500' };
};

export const EnhancedStrandsAgentPalette: React.FC<EnhancedStrandsAgentPaletteProps> = ({
  onAddAgent,
  onAddUtility,
  onSelectMCPTool,
  onSelectStrandsTool,
  onComposeTools
}) => {
  const [activeTab, setActiveTab] = useState('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTools, setSelectedTools] = useState<StrandsTool[]>([]);
  const [showToolRegistry, setShowToolRegistry] = useState(false);
  const [showToolComposer, setShowToolComposer] = useState(false);
  const [showToolConfiguration, setShowToolConfiguration] = useState(false);
  const [selectedToolForConfig, setSelectedToolForConfig] = useState<StrandsTool | null>(null);
  const [strandsAgents, setStrandsAgents] = useState<StrandsAgent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Strands agents
  useEffect(() => {
    loadStrandsAgents();
  }, []);

  const loadStrandsAgents = async () => {
    try {
      setLoading(true);
      const agents = await strandsAgentService.getStrandsAgents();
      setStrandsAgents(agents);
    } catch (error) {
      console.error('Error loading Strands agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tool selection
  const handleToolSelect = (tool: StrandsTool) => {
    if (selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools(prev => prev.filter(t => t.id !== tool.id));
    } else {
      setSelectedTools(prev => [...prev, tool]);
    }
  };

  // Handle tool composition
  const handleToolComposition = () => {
    if (selectedTools.length < 2) {
      alert('Please select at least 2 tools to compose');
      return;
    }
    onComposeTools?.(selectedTools);
    setShowToolComposer(true);
  };

  // Handle tool configuration
  const handleToolConfiguration = (tool: StrandsTool) => {
    setSelectedToolForConfig(tool);
    setShowToolConfiguration(true);
  };

  // Filter agents based on search
  const filteredAgents = strandsAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.capabilities?.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Strands Intelligence</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowToolRegistry(true)}
              className="text-purple-400 hover:text-purple-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowToolComposer(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              <Workflow className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 m-4">
            <TabsTrigger value="agents" className="text-gray-300 data-[state=active]:text-white">
              Agents
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-gray-300 data-[state=active]:text-white">
              Tools
            </TabsTrigger>
            <TabsTrigger value="compositions" className="text-gray-300 data-[state=active]:text-white">
              Compositions
            </TabsTrigger>
            <TabsTrigger value="utilities" className="text-gray-300 data-[state=active]:text-white">
              Utilities
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="agents" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
                      <span className="ml-2 text-gray-400">Loading agents...</span>
                    </div>
                  ) : filteredAgents.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <p>No agents found</p>
                      <p className="text-sm">Create your first Strands agent</p>
                    </div>
                  ) : (
                    filteredAgents.map((agent) => {
                      const { icon: Icon, color } = getProfessionalAgentIcon(agent.name, agent.capabilities || []);
                      return (
                        <Card
                          key={agent.id}
                          className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group"
                          onClick={() => onAddAgent('strands-agent', agent)}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className={`h-5 w-5 ${color}`} />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">{agent.name}</h3>
                                <p className="text-gray-400 text-sm truncate">{agent.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {agent.model_id}
                              </Badge>
                            </div>
                            
                            {agent.capabilities && agent.capabilities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {agent.capabilities.slice(0, 3).map((capability) => (
                                  <Badge key={capability} variant="secondary" className="text-xs">
                                    {capability}
                                  </Badge>
                                ))}
                                {agent.capabilities.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{agent.capabilities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{agent.tools?.length || 0} tools</span>
                                <span>•</span>
                                <span>{agent.executions || 0} runs</span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tools" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Available Tools</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowToolRegistry(true)}
                      className="text-purple-400 border-purple-400 hover:bg-purple-400/10"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>

                  {/* Tool Categories */}
                  <div className="space-y-2">
                    {[
                      { name: 'AI Tools', icon: Brain, color: 'text-purple-500', tools: ['think', 'memory', 'use_llm'] },
                      { name: 'Utility', icon: Calculator, color: 'text-blue-500', tools: ['calculator', 'current_time', 'environment'] },
                      { name: 'Web & Data', icon: Globe, color: 'text-orange-500', tools: ['http_request', 'rss'] },
                      { name: 'Code', icon: Code, color: 'text-red-500', tools: ['code_execution', 'python_repl', 'shell'] },
                      { name: 'Collaboration', icon: Users, color: 'text-green-500', tools: ['a2a_send_message', 'coordinate_agents', 'agent_handoff'] },
                      { name: 'Files', icon: FileText, color: 'text-pink-500', tools: ['file_read', 'file_write', 'editor', 'image_reader'] }
                    ].map((category) => (
                      <Card key={category.name} className="bg-gray-800 border-gray-700">
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <category.icon className={`h-4 w-4 ${category.color}`} />
                            <span className="text-white text-sm font-medium">{category.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {category.tools.map((tool) => (
                              <Badge
                                key={tool}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-purple-500/20 hover:border-purple-500"
                                onClick={() => onSelectStrandsTool?.({ id: tool, name: tool } as StrandsTool)}
                              >
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Selected Tools */}
                  {selectedTools.length > 0 && (
                    <Card className="bg-gray-800 border-purple-500">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">Selected Tools ({selectedTools.length})</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleToolComposition}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Link className="h-4 w-4 mr-1" />
                              Compose
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedTools([])}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedTools.map((tool) => (
                            <Badge
                              key={tool.id}
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-red-500/20"
                              onClick={() => handleToolSelect(tool)}
                            >
                              {tool.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="compositions" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-4">
                  <div className="text-center py-8 text-gray-400">
                    <Workflow className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p>Tool Compositions</p>
                    <p className="text-sm">Create complex tool workflows</p>
                    <Button
                      className="mt-4"
                      onClick={() => setShowToolComposer(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Composition
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="utilities" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-4">
                  {[
                    { name: 'Decision Node', icon: GitBranch, description: 'Conditional logic', type: 'strands-decision' },
                    { name: 'Handoff Node', icon: ArrowRight, description: 'Agent handoff', type: 'strands-handoff' },
                    { name: 'Output Node', icon: Target, description: 'Workflow output', type: 'strands-output' },
                    { name: 'Memory Node', icon: Database, description: 'Persistent memory', type: 'strands-memory' },
                    { name: 'Guardrail Node', icon: Shield, description: 'Safety checks', type: 'strands-guardrail' },
                    { name: 'Monitor Node', icon: Eye, description: 'Performance monitoring', type: 'strands-monitor' },
                    { name: 'Aggregator Node', icon: BarChart3, description: 'Data aggregation', type: 'strands-aggregator' },
                    { name: 'Human Node', icon: Users, description: 'Human interaction', type: 'strands-human' }
                  ].map((utility) => (
                    <Card
                      key={utility.name}
                      className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group"
                      onClick={() => onAddUtility(utility.type, utility)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <utility.icon className="h-5 w-5 text-purple-500" />
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{utility.name}</h3>
                            <p className="text-gray-400 text-sm">{utility.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Tool Registry Dialog */}
      <Dialog open={showToolRegistry} onOpenChange={setShowToolRegistry}>
        <DialogContent className="max-w-6xl h-[80vh] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Strands Tool Registry</DialogTitle>
          </DialogHeader>
          <StrandsToolRegistry />
        </DialogContent>
      </Dialog>

      {/* Tool Configuration Dialog */}
      {selectedToolForConfig && (
        <StrandsToolConfigurationDialog
          open={showToolConfiguration}
          onOpenChange={setShowToolConfiguration}
          toolName={selectedToolForConfig.name}
          onConfigurationSave={(toolName, config) => {
            console.log('Tool configuration saved:', toolName, config);
            setShowToolConfiguration(false);
          }}
        />
      )}
    </div>
  );
};


