/**
 * Workflow Execution Panel
 * Real-time workflow execution with agent handoffs and monitoring
 */

import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, Users, Clock, CheckCircle, AlertCircle, ArrowRight, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { useOllamaAgentsForPalette } from '@/hooks/useOllamaAgentsForPalette';

interface WorkflowExecutionPanelProps {
  workflowNodes: any[];
  workflowEdges: any[];
}

export const WorkflowExecutionPanel: React.FC<WorkflowExecutionPanelProps> = ({
  workflowNodes,
  workflowEdges
}) => {
  const [userInput, setUserInput] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [autoRegisterStatus, setAutoRegisterStatus] = useState<string>('');

  const {
    executionState,
    availableAgents,
    registerAgent,
    testAgent,
    quickExecute,
    stopExecution,
    clearResults,
    refreshAgents,
    autoRegisterOllamaAgents
  } = useWorkflowExecution();

  const { agents: ollamaAgents } = useOllamaAgentsForPalette();

  // Auto-register Ollama agents on component mount
  useEffect(() => {
    const autoRegister = async () => {
      if (ollamaAgents.length > 0 && Object.keys(availableAgents).length === 0) {
        try {
          setAutoRegisterStatus('Registering agents...');
          const result = await autoRegisterOllamaAgents(ollamaAgents);
          setAutoRegisterStatus(`Registered ${result.registered} agents`);
          
          if (result.errors.length > 0) {
            console.warn('Some agents failed to register:', result.errors);
          }
          
          setTimeout(() => setAutoRegisterStatus(''), 3000);
        } catch (error) {
          setAutoRegisterStatus('Failed to register agents');
          setTimeout(() => setAutoRegisterStatus(''), 3000);
        }
      }
    };

    autoRegister();
  }, [ollamaAgents, availableAgents, autoRegisterOllamaAgents]);

  const handleQuickExecute = async () => {
    if (!userInput.trim()) {
      alert('Please enter a task description');
      return;
    }

    if (selectedAgents.length === 0) {
      alert('Please select at least one agent');
      return;
    }

    await quickExecute(selectedAgents, userInput);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'cancelled': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-80 bg-beam-dark-accent border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Workflow Execution</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshAgents}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {autoRegisterStatus && (
          <p className="text-xs text-blue-400 mt-1">{autoRegisterStatus}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Task Input */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Task Description
          </label>
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe the task you want the agents to work on..."
            className="bg-beam-dark border-gray-600 text-white resize-none"
            rows={3}
          />
        </div>

        {/* Agent Selection */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Select Agents ({Object.keys(availableAgents).length} available)
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Object.entries(availableAgents).map(([agentId, agent]) => (
              <div
                key={agentId}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  selectedAgents.includes(agentId)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => {
                  setSelectedAgents(prev =>
                    prev.includes(agentId)
                      ? prev.filter(id => id !== agentId)
                      : [...prev, agentId]
                  );
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.role}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {agent.model}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Controls */}
        <div className="space-y-2">
          <Button
            onClick={handleQuickExecute}
            disabled={executionState.isExecuting || selectedAgents.length === 0 || !userInput.trim()}
            className="w-full"
          >
            {executionState.isExecuting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Workflow
              </>
            )}
          </Button>

          {executionState.isExecuting && (
            <Button
              onClick={stopExecution}
              variant="outline"
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Execution
            </Button>
          )}

          {(executionState.result || executionState.error) && (
            <Button
              onClick={clearResults}
              variant="ghost"
              className="w-full"
            >
              Clear Results
            </Button>
          )}
        </div>

        {/* Execution Status */}
        {executionState.status && (
          <Card className="p-3 bg-beam-dark border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(executionState.status)}
              <span className={`text-sm font-medium ${getStatusColor(executionState.status)}`}>
                {executionState.status.charAt(0).toUpperCase() + executionState.status.slice(1)}
              </span>
            </div>
            
            {executionState.currentNode && (
              <p className="text-xs text-gray-400 mb-1">
                Current: {executionState.currentNode}
              </p>
            )}
            
            <p className="text-xs text-gray-400">
              Steps completed: {executionState.stepsCompleted}
            </p>
          </Card>
        )}

        {/* Execution Path */}
        {executionState.executionPath.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Execution Path</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {executionState.executionPath.map((step, index) => (
                <Card key={step.step_id} className="p-2 bg-beam-dark border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white">{step.node_name}</p>
                      <p className="text-xs text-gray-400">{step.node_type}</p>
                    </div>
                    {step.agent_id && (
                      <Badge variant="outline" className="text-xs">
                        {availableAgents[step.agent_id]?.name || step.agent_id}
                      </Badge>
                    )}
                  </div>
                  
                  {step.output && (
                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs text-gray-300">
                      {typeof step.output === 'string' 
                        ? step.output.substring(0, 100) + (step.output.length > 100 ? '...' : '')
                        : JSON.stringify(step.output).substring(0, 100) + '...'
                      }
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Final Result */}
        {executionState.result && (
          <div>
            <h3 className="text-sm font-medium text-green-400 mb-2">Final Result</h3>
            <Card className="p-3 bg-green-500/10 border-green-500/30">
              <div className="text-sm text-white">
                {typeof executionState.result === 'string' 
                  ? executionState.result
                  : JSON.stringify(executionState.result, null, 2)
                }
              </div>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {executionState.error && (
          <div>
            <h3 className="text-sm font-medium text-red-400 mb-2">Error</h3>
            <Card className="p-3 bg-red-500/10 border-red-500/30">
              <div className="text-sm text-red-300">
                {executionState.error}
              </div>
            </Card>
          </div>
        )}

        {/* Available Agents Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Registered Agents ({Object.keys(availableAgents).length})
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(availableAgents).map(([agentId, agent]) => (
              <div key={agentId} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div>
                  <p className="text-xs text-white font-medium">{agent.name}</p>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-400">{agent.model}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};