/**
 * Improved Strands Multi-Agent Workspace
 * Based on the better UI patterns from Tocheck folder
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Square, RotateCcw, Settings, Brain, Zap, Clock, 
  CheckCircle, AlertCircle, Info, Bot, Search, Code, 
  FileText, Calculator, MessageSquare, X, Plus, Eye,
  Users, Database, Shield, Target, Network, Lightbulb
} from 'lucide-react';

// Temporarily removed Ollama integration to isolate white screen issue
// import { useOllamaAgentsForPaletteFixed as useOllamaAgentsForPalette, PaletteAgent } from '@/hooks/useOllamaAgentsForPalette.fixed';
import { StrandsWorkflowOrchestrator } from '@/lib/services/StrandsWorkflowOrchestrator';
import { StrandsWorkflow, WorkflowExecution } from '@/types/StrandsTypes';
import { apiClient } from '@/lib/apiClient';

// Professional agent icons mapping
const getProfessionalAgentIcon = (role: string): { icon: React.ComponentType<any>, color: string } => {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('research') || roleLower.includes('analyst')) 
    return { icon: Search, color: 'text-blue-500' };
  if (roleLower.includes('math') || roleLower.includes('calculat')) 
    return { icon: Calculator, color: 'text-green-500' };
  if (roleLower.includes('document') || roleLower.includes('writ')) 
    return { icon: FileText, color: 'text-purple-500' };
  if (roleLower.includes('code') || roleLower.includes('develop')) 
    return { icon: Code, color: 'text-orange-500' };
  if (roleLower.includes('chat') || roleLower.includes('conversation')) 
    return { icon: MessageSquare, color: 'text-pink-500' };
  
  return { icon: Bot, color: 'text-gray-500' };
};

export const ImprovedStrandsWorkspace: React.FC = () => {
  // State management
  const [orchestrator] = useState(() => new StrandsWorkflowOrchestrator());
  const [workflowId, setWorkflowId] = useState<string>('');
  const [currentWorkflow, setCurrentWorkflow] = useState<StrandsWorkflow | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showAgentPalette, setShowAgentPalette] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  
  // Temporarily disabled Ollama integration
  const ollamaAgents: any[] = [];
  const agentsLoading = false;

  // Initialize workflow on mount
  useEffect(() => {
    const initWorkflow = () => {
      const newWorkflowId = orchestrator.createWorkflow(
        'Strands Workflow',
        'Intelligent multi-agent workflow powered by Ollama and Strands patterns'
      );
      setWorkflowId(newWorkflowId);
      setCurrentWorkflow(orchestrator.getWorkflow(newWorkflowId) || null);
    };

    initWorkflow();
  }, [orchestrator]);

  // Handle agent addition to workflow
  const handleAddAgent = useCallback((agentType: string, agentData?: PaletteAgent) => {
    if (!agentData) return;
    
    const newNode = {
      id: `agent_${agentData.id}_${Date.now()}`,
      type: 'ollama-agent',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        agent: agentData,
        label: agentData.name,
        status: 'idle'
      }
    };
    
    setWorkflowNodes(prev => [...prev, newNode]);
    
    // Add to orchestrator
    if (currentWorkflow) {
      orchestrator.addAgentToWorkflow(workflowId, {
        id: agentData.id,
        name: agentData.name,
        model: agentData.model || 'llama3.2:latest',
        systemPrompt: agentData.systemPrompt || `You are ${agentData.name}, a helpful AI assistant.`,
        tools: [],
        reasoningPattern: 'sequential',
        contextManagement: {
          preserveMemory: true,
          maxContextLength: 4000,
          compressionLevel: 'summary'
        },
        ollamaConfig: {
          temperature: agentData.temperature || 0.7,
          maxTokens: agentData.maxTokens || 1000,
          keepAlive: '5m'
        },
        capabilities: agentData.capabilities || [],
        category: 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setCurrentWorkflow(orchestrator.getWorkflow(workflowId)!);
    }
  }, [workflowId, currentWorkflow, orchestrator]);

  // Handle workflow execution
  const executeWorkflow = useCallback(async () => {
    if (!workflowId || !currentWorkflow || workflowNodes.length === 0) {
      console.error('No workflow or agents to execute');
      return;
    }

    setIsExecuting(true);
    
    try {
      // Create a simple task for each agent
      const tasks = workflowNodes.map((node, index) => ({
        taskId: `task_${index + 1}`,
        description: `Execute ${node.data.agent.name} with intelligent processing`,
        agentId: node.data.agent.id,
        input: `Process this task using your specialized capabilities as ${node.data.agent.role}`
      }));

      // Execute via backend API
      const response = await apiClient.executeStrandsWorkflow(workflowId, {
        message: 'Starting Strands workflow execution',
        timestamp: new Date().toISOString(),
        tasks,
        agents: workflowNodes.map(node => ({
          id: node.data.agent.id,
          name: node.data.agent.name,
          model: node.data.agent.model
        }))
      });

      console.log('Workflow execution result:', response);
      
      // Update node statuses
      setWorkflowNodes(prev => prev.map(node => ({
        ...node,
        data: { ...node.data, status: 'completed' }
      })));
      
    } catch (error) {
      console.error('Workflow execution failed:', error);
      // Update node statuses to error
      setWorkflowNodes(prev => prev.map(node => ({
        ...node,
        data: { ...node.data, status: 'error' }
      })));
    } finally {
      setIsExecuting(false);
    }
  }, [workflowId, currentWorkflow, workflowNodes]);

  // Handle workflow reset
  const resetWorkflow = useCallback(() => {
    const newWorkflowId = orchestrator.createWorkflow(
      'New Strands Workflow',
      'Fresh intelligent multi-agent workflow'
    );
    setWorkflowId(newWorkflowId);
    setCurrentWorkflow(orchestrator.getWorkflow(newWorkflowId) || null);
    setExecution(null);
    setSelectedNode(null);
    setWorkflowNodes([]);
  }, [orchestrator]);

  // Get execution status
  const getExecutionStatus = () => {
    if (isExecuting) return { status: 'running', color: 'text-blue-400', icon: Clock };
    if (workflowNodes.some(n => n.data.status === 'completed')) return { status: 'completed', color: 'text-green-400', icon: CheckCircle };
    if (workflowNodes.some(n => n.data.status === 'error')) return { status: 'error', color: 'text-red-400', icon: AlertCircle };
    return { status: 'idle', color: 'text-slate-400', icon: Brain };
  };

  const executionStatus = getExecutionStatus();
  const StatusIcon = executionStatus.icon;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 flex">
      {/* Enhanced Agent Palette */}
      {showAgentPalette && (
        <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-slate-600/30 flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-600/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Strands Agents
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAgentPalette(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ollama-powered agents with Strands intelligence
            </p>
          </div>

          {/* Agent List */}
          <div className="flex-1 p-4 overflow-y-auto">
            {agentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            ) : ollamaAgents.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No Ollama agents found</p>
                <p className="text-slate-500 text-xs mt-1">Create agents in the Ollama Agents section</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ollamaAgents.map((agent) => {
                  const { icon: IconComponent, color } = getProfessionalAgentIcon(agent.role || '');
                  
                  return (
                    <Card
                      key={agent.id}
                      className="cursor-pointer hover:border-purple-400/50 transition-all duration-200 bg-slate-700/30 border-slate-600/30 group relative"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({
                          type: 'ollama-agent',
                          agent: agent
                        }));
                      }}
                      onClick={() => handleAddAgent('ollama-agent', agent)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 bg-slate-600/50 rounded-lg ${color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{agent.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{agent.role}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                                {agent.model}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                                Strands
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Hover Tooltip */}
                        <div className="absolute left-full top-0 ml-2 w-80 bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-lg shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-50">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-700">
                              <div className={`p-2 rounded-lg bg-slate-700/50 ${color}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                                <p className="text-xs text-slate-400">{agent.role}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-semibold text-slate-300 mb-1">Description</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {agent.description || `${agent.role} specialized for intelligent task processing with ${agent.model} model.`}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400">Model:</span>
                                <div className="text-white font-medium">{agent.model}</div>
                              </div>
                              <div>
                                <span className="text-slate-400">Temperature:</span>
                                <div className="text-white font-medium">{agent.temperature || 0.7}</div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-700">
                              <p className="text-xs text-purple-300">
                                ✨ Enhanced with Strands intelligence patterns
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-600/30">
            <div className="text-xs text-slate-400 text-center">
              Click or drag agents to add to workflow
            </div>
          </div>
        </div>
      )}

      {/* Show Palette Button when hidden */}
      {!showAgentPalette && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAgentPalette(true)}
          className="fixed top-4 left-4 z-20 border-purple-400/50 text-purple-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agents
        </Button>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/40 backdrop-blur-lg border-b border-slate-600/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold text-white">
                  Strands Intelligence Workspace
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-400/50 text-purple-300">
                  Enhanced UI
                </Badge>
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <StatusIcon className={`w-4 h-4 ${executionStatus.color}`} />
                  <span className={executionStatus.color}>
                    {executionStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Workflow Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={executeWorkflow}
                disabled={isExecuting || workflowNodes.length === 0}
                className="border-green-400/50 text-green-400 hover:bg-green-400/10"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Executing
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetWorkflow}
                className="border-slate-400/50 text-slate-400 hover:bg-slate-400/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Workflow Stats */}
          <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>{workflowNodes.length} agents</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>{ollamaAgents.length} available</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span>Strands Intelligence</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          {workflowNodes.length === 0 ? (
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-slate-800/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-300 mb-3">
                Build Your Strands Workflow
              </h3>
              <p className="text-slate-500 mb-6">
                Add Ollama agents from the palette to create intelligent multi-agent workflows. 
                Each agent is enhanced with Strands reasoning patterns.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Strands Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Ollama Models</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Smart Tools</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-800/20 rounded-lg border border-slate-600/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflowNodes.map((node) => {
                  const { icon: IconComponent, color } = getProfessionalAgentIcon(node.data.agent.role || '');
                  const statusColor = node.data.status === 'completed' ? 'border-green-400/50 bg-green-400/10' :
                                    node.data.status === 'error' ? 'border-red-400/50 bg-red-400/10' :
                                    node.data.status === 'running' ? 'border-blue-400/50 bg-blue-400/10' :
                                    'border-slate-600/30 bg-slate-700/30';
                  
                  return (
                    <Card key={node.id} className={`${statusColor} transition-all duration-200`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 bg-slate-600/50 rounded-lg ${color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">{node.data.agent.name}</h4>
                            <p className="text-xs text-slate-400">{node.data.agent.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs border-slate-500 text-slate-400">
                            {node.data.agent.model}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              node.data.status === 'completed' ? 'border-green-500 text-green-400' :
                              node.data.status === 'error' ? 'border-red-500 text-red-400' :
                              node.data.status === 'running' ? 'border-blue-500 text-blue-400' :
                              'border-slate-500 text-slate-400'
                            }`}
                          >
                            {node.data.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800/40 backdrop-blur-lg border-t border-slate-600/30 p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Strands Intelligence: Active</span>
              <span>Ollama Models: {ollamaAgents.length} available</span>
              <span>Enhanced UI: Seamless workflow creation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connected to Ollama</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};