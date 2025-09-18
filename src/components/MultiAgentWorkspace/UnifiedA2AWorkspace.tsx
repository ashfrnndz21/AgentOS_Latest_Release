import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Settings, Monitor, MessageSquare, Bot, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { UnifiedAgentPalette } from './UnifiedAgentPalette';
import { ContextualSidebar } from './ContextualSidebar';
import { A2AWorkflowCanvasWrapper } from './A2AWorkflowCanvas';
import { UnifiedAgent } from './UnifiedAgentPalette';
import { WorkflowDefinition } from '@/lib/services/WorkflowDefinitionService';

export const UnifiedA2AWorkspace: React.FC = () => {
  // State management
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDefinition | null>(null);
  const [workflowState, setWorkflowState] = useState({
    isRunning: false,
    isPaused: false,
    nodes: 0,
    connections: 0,
    executionTime: 0,
    status: 'idle' as 'idle' | 'running' | 'paused' | 'completed' | 'error'
  });
  const [agentStatuses, setAgentStatuses] = useState<any[]>([]);
  const [executionResults, setExecutionResults] = useState<any>(null);

  // Handle adding agent to canvas
  const handleAddAgent = useCallback((agent: UnifiedAgent) => {
    console.log('Adding agent to canvas:', agent);
    // This will be handled by the canvas component
  }, []);

  // Handle testing agent connection
  const handleTestConnection = useCallback(async (agent: UnifiedAgent): Promise<boolean> => {
    try {
      // Test connection to agent
      if (agent.url) {
        const response = await fetch(`${agent.url}/health`, { timeout: 5000 });
        return response.ok;
      }
      return true; // For local agents
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }, []);

  // Handle creating new agent
  const handleCreateAgent = useCallback(() => {
    // Navigate to agent creation page or open dialog
    console.log('Creating new agent');
    // This would open the agent creation dialog or navigate to the agents page
  }, []);

  // Handle configuring agent
  const handleConfigureAgent = useCallback((agent: UnifiedAgent) => {
    console.log('Configuring agent:', agent);
    // This would open the agent configuration dialog
  }, []);

  // Handle workflow changes
  const handleWorkflowChange = useCallback((workflow: WorkflowDefinition) => {
    setCurrentWorkflow(workflow);
    setWorkflowState(prev => ({
      ...prev,
      nodes: workflow.nodes.length,
      connections: workflow.connections.length
    }));
  }, []);

  // Handle execution start
  const handleExecutionStart = useCallback(() => {
    setWorkflowState(prev => ({
      ...prev,
      isRunning: true,
      status: 'running',
      executionTime: 0
    }));

    // Start execution timer
    const interval = setInterval(() => {
      setWorkflowState(prev => ({
        ...prev,
        executionTime: prev.executionTime + 1
      }));
    }, 1000);

    // Store interval ID for cleanup
    (window as any).executionInterval = interval;
  }, []);

  // Handle execution complete
  const handleExecutionComplete = useCallback((results: any) => {
    setExecutionResults(results);
    setWorkflowState(prev => ({
      ...prev,
      isRunning: false,
      status: results.success ? 'completed' : 'error'
    }));

    // Clear execution timer
    if ((window as any).executionInterval) {
      clearInterval((window as any).executionInterval);
      (window as any).executionInterval = null;
    }

    // Update agent statuses based on results
    if (results.results) {
      setAgentStatuses(results.results.map((result: any) => ({
        id: result.agentId,
        name: result.agentId,
        status: result.status === 'success' ? 'active' : 'unreachable',
        lastMessage: result.response,
        responseTime: result.responseTime,
        messageCount: 1
      })));
    }
  }, []);

  // Handle workflow control actions
  const handleRunWorkflow = useCallback(() => {
    handleExecutionStart();
  }, [handleExecutionStart]);

  const handlePauseWorkflow = useCallback(() => {
    setWorkflowState(prev => ({
      ...prev,
      isPaused: true,
      status: 'paused'
    }));
  }, []);

  const handleStopWorkflow = useCallback(() => {
    setWorkflowState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      status: 'idle',
      executionTime: 0
    }));

    if ((window as any).executionInterval) {
      clearInterval((window as any).executionInterval);
      (window as any).executionInterval = null;
    }
  }, []);

  const handleResetWorkflow = useCallback(() => {
    setWorkflowState({
      isRunning: false,
      isPaused: false,
      nodes: 0,
      connections: 0,
      executionTime: 0,
      status: 'idle'
    });
    setAgentStatuses([]);
    setExecutionResults(null);
  }, []);

  const handleSaveWorkflow = useCallback(() => {
    if (currentWorkflow) {
      console.log('Saving workflow:', currentWorkflow);
      // Implement save functionality
    }
  }, [currentWorkflow]);

  const handleExportWorkflow = useCallback(() => {
    if (currentWorkflow) {
      const dataStr = JSON.stringify(currentWorkflow, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentWorkflow.name}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [currentWorkflow]);

  const handleClearCanvas = useCallback(() => {
    setWorkflowState({
      isRunning: false,
      isPaused: false,
      nodes: 0,
      connections: 0,
      executionTime: 0,
      status: 'idle'
    });
    setAgentStatuses([]);
    setExecutionResults(null);
  }, []);

  const handleConfigureAgentById = useCallback((agentId: string) => {
    console.log('Configuring agent by ID:', agentId);
    // Find agent and open configuration
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).executionInterval) {
        clearInterval((window as any).executionInterval);
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-600/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Network className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-semibold text-slate-100">A2A Workflow Studio</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Bot className="h-4 w-4" />
              <span>Multi-Agent Orchestration Platform</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateAgent}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Unified Agent Palette */}
        <UnifiedAgentPalette
          onAddAgent={handleAddAgent}
          onTestConnection={handleTestConnection}
          onCreateAgent={handleCreateAgent}
          onConfigureAgent={handleConfigureAgent}
        />

        {/* Center - A2A Workflow Canvas */}
        <div className="flex-1 relative">
          <A2AWorkflowCanvasWrapper
            onWorkflowChange={handleWorkflowChange}
            onExecutionStart={handleExecutionStart}
            onExecutionComplete={handleExecutionComplete}
          />
        </div>

        {/* Right Sidebar - Contextual Controls */}
        <ContextualSidebar
          workflowState={workflowState}
          agentStatuses={agentStatuses}
          onRunWorkflow={handleRunWorkflow}
          onPauseWorkflow={handlePauseWorkflow}
          onStopWorkflow={handleStopWorkflow}
          onResetWorkflow={handleResetWorkflow}
          onSaveWorkflow={handleSaveWorkflow}
          onExportWorkflow={handleExportWorkflow}
          onClearCanvas={handleClearCanvas}
          onConfigureAgent={handleConfigureAgentById}
        />
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-600/30 p-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Workflow: {currentWorkflow?.name || 'Untitled'}</span>
            <span>Status: {workflowState.status}</span>
            {workflowState.isRunning && (
              <span>Execution Time: {workflowState.executionTime}s</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Agents: {workflowState.nodes}</span>
            <span>Connections: {workflowState.connections}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



