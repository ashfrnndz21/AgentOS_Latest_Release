/**
 * Strands Multi-Agent Workspace
 * Main component integrating all Strands functionality
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Square, RotateCcw, Settings, Brain, 
  Zap, Clock, CheckCircle, AlertCircle, Info
} from 'lucide-react';

import { StrandsAgentPalette } from './StrandsAgentPalette';
import { StrandsWorkflowCanvas } from './StrandsWorkflowCanvas';
import { StrandsWorkflowOrchestrator } from '@/lib/services/StrandsWorkflowOrchestrator';
import { StrandsOllamaAgent, StrandsWorkflow, WorkflowExecution } from '@/types/StrandsTypes';
import { useStrandsAgentPalette } from '@/hooks/useStrandsAgentPalette';
import { apiClient } from '@/lib/apiClient';

export const StrandsMultiAgentWorkspace: React.FC = () => {
  // State management
  const [orchestrator] = useState(() => new StrandsWorkflowOrchestrator());
  const [workflowId, setWorkflowId] = useState<string>('');
  const [currentWorkflow, setCurrentWorkflow] = useState<StrandsWorkflow | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showAgentPalette, setShowAgentPalette] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  // Hooks
  const { strandsAgents, loading: agentsLoading } = useStrandsAgentPalette();

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

  // Handle workflow execution
  const executeWorkflow = useCallback(async () => {
    if (!workflowId || !currentWorkflow) {
      console.error('No workflow to execute');
      return;
    }

    setIsExecuting(true);
    
    try {
      // Execute via backend API
      const response = await apiClient.executeStrandsWorkflow(workflowId, {
        message: 'Starting Strands workflow execution',
        timestamp: new Date().toISOString(),
        user: 'current_user'
      });

      console.log('Workflow execution result:', response);
      
      // For now, simulate local execution
      const localExecution = await orchestrator.executeWorkflow(workflowId, {
        message: 'Starting Strands workflow execution',
        timestamp: new Date().toISOString()
      });
      
      setExecution(localExecution);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [workflowId, currentWorkflow, orchestrator]);

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
  }, [orchestrator]);

  // Handle agent selection from palette
  const handleAgentSelect = useCallback((agent: StrandsOllamaAgent) => {
    console.log('Selected Strands agent:', agent);
    // Agent will be added to workflow via drag-and-drop in canvas
  }, []);

  // Handle workflow changes
  const handleWorkflowChange = useCallback((updatedWorkflow: StrandsWorkflow) => {
    setCurrentWorkflow(updatedWorkflow);
  }, []);

  // Get execution status
  const getExecutionStatus = () => {
    if (isExecuting) return { status: 'running', color: 'text-blue-400', icon: Clock };
    if (execution?.status === 'completed') return { status: 'completed', color: 'text-green-400', icon: CheckCircle };
    if (execution?.status === 'error') return { status: 'error', color: 'text-red-400', icon: AlertCircle };
    return { status: 'idle', color: 'text-slate-400', icon: Brain };
  };

  const executionStatus = getExecutionStatus();
  const StatusIcon = executionStatus.icon;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 flex">
      {/* Agent Palette */}
      <StrandsAgentPalette
        isVisible={showAgentPalette}
        onToggle={() => setShowAgentPalette(!showAgentPalette)}
        onAgentSelect={handleAgentSelect}
        onCreateAgent={() => console.log('Create new Strands agent')}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/40 backdrop-blur-lg border-b border-slate-600/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold text-white">
                  Strands Multi-Agent Workspace
                </h1>
              </div>
              
              {currentWorkflow && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-purple-400/50 text-purple-300">
                    {currentWorkflow.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <StatusIcon className={`w-4 h-4 ${executionStatus.color}`} />
                    <span className={executionStatus.color}>
                      {executionStatus.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Workflow Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={executeWorkflow}
                disabled={isExecuting || !currentWorkflow?.tasks.length}
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
              
              <Button
                variant="outline"
                size="sm"
                className="border-slate-400/50 text-slate-400 hover:bg-slate-400/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Workflow Stats */}
          {currentWorkflow && (
            <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>{currentWorkflow.tasks.length} tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>{currentWorkflow.agents.length} agents</span>
              </div>
              {execution && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>
                    {execution.metrics.successRate.toFixed(0)}% success rate
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Workflow Canvas */}
          <div className="flex-1">
            {workflowId ? (
              <StrandsWorkflowCanvas
                orchestrator={orchestrator}
                workflowId={workflowId}
                onNodeSelect={setSelectedNode}
                onWorkflowChange={handleWorkflowChange}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300 mb-2">
                    Initializing Strands Workspace
                  </h3>
                  <p className="text-slate-500">
                    Setting up intelligent multi-agent workflow system...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          {selectedNode && (
            <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-slate-600/30">
              <Tabs defaultValue="config" className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-600/30">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="config" className="h-full m-0 p-4">
                    <Card className="bg-slate-700/30 border-slate-600/30">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">
                          {selectedNode.data?.label || 'Node Configuration'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-400">Type</label>
                          <p className="text-sm text-white">{selectedNode.type}</p>
                        </div>
                        
                        {selectedNode.data?.agent && (
                          <div>
                            <label className="text-xs text-slate-400">Agent Model</label>
                            <p className="text-sm text-white">{selectedNode.data.agent.model}</p>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-xs text-slate-400">Status</label>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-slate-500/50 text-slate-300"
                          >
                            {selectedNode.data?.status || 'idle'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="results" className="h-full m-0 p-4">
                    <Card className="bg-slate-700/30 border-slate-600/30">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">
                          Execution Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {execution ? (
                          <div className="space-y-3 text-sm">
                            <div>
                              <label className="text-xs text-slate-400">Status</label>
                              <p className="text-white">{execution.status}</p>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Duration</label>
                              <p className="text-white">
                                {execution.metrics.totalExecutionTime}ms
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Success Rate</label>
                              <p className="text-white">
                                {execution.metrics.successRate.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">
                              No execution results yet
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800/40 backdrop-blur-lg border-t border-slate-600/30 p-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Strands Intelligence: Active</span>
              <span>Ollama Models: {strandsAgents.length} available</span>
              <span>Tools: Calculator, Time, Counter, Python, Search</span>
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