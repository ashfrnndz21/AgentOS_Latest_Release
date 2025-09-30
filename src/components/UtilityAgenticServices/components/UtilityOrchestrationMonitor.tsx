import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Workflow, Play, Clock, CheckCircle, AlertCircle, Loader2, Database, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  step_number: number;
  step_type: string;
  success: boolean;
  message?: string;
  error?: string;
  result?: any;
}

interface WorkflowExecution {
  workflow_id: string;
  original_request: string;
  workflow: {
    steps: Array<{
      type: string;
      priority: string;
      parameters: any;
    }>;
    complexity: string;
    estimated_duration: number;
  };
  results: WorkflowStep[];
  status: string;
  timestamp: string;
}

interface ServiceStatus {
  [key: string]: {
    name: string;
    url: string;
    status: string;
    response_time?: number;
    last_check: string;
  };
}

export const UtilityOrchestrationMonitor: React.FC = () => {
  const [userRequest, setUserRequest] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<WorkflowExecution | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowExecution[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflowHistory();
    loadServiceStatus();
    
    // Refresh service status every 30 seconds
    const interval = setInterval(loadServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWorkflowHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('http://localhost:5044/api/utility/workflow/history?limit=10');
      if (response.ok) {
        const data = await response.json();
        setWorkflowHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load workflow history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:5044/api/utility/services/status');
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.services || {});
      }
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  };

  const executeWorkflow = async () => {
    if (!userRequest.trim()) {
      toast({
        title: "Missing Request",
        description: "Please enter a request to execute",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    try {
      const response = await fetch('http://localhost:5044/api/utility/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: userRequest })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setExecutionResult(result.result);
        toast({
          title: "Workflow Executed",
          description: "Utility workflow completed successfully!",
        });
        
        // Refresh history to show the new execution
        setTimeout(() => {
          loadWorkflowHistory();
        }, 1000);
      } else {
        toast({
          title: "Workflow Failed",
          description: result.error || "Failed to execute workflow",
          variant: "destructive"
        });
        setExecutionResult(result.result || { error: result.error });
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'create_database':
        return <Database className="h-4 w-4" />;
      case 'generate_data':
        return <FileText className="h-4 w-4" />;
      default:
        return <Workflow className="h-4 w-4" />;
    }
  };

  const getStepColor = (success: boolean) => {
    return success ? 'text-green-400' : 'text-red-400';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'complex':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Workflow Execution */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="text-blue-400" />
            Execute Utility Workflow
          </CardTitle>
          <CardDescription>
            Describe what you want to accomplish and the orchestration engine will coordinate the utility agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workflow-request">Request</Label>
            <Textarea
              id="workflow-request"
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              placeholder="Describe what you want to accomplish. For example: 'Create a customer database with customer information and orders, then populate it with 100 sample records' or 'Make a product inventory database and generate realistic product data'"
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={executeWorkflow}
            disabled={isExecuting || !userRequest.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executing Workflow...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Execution Result */}
      {executionResult && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="text-blue-400" />
              Execution Result
              <Badge variant="outline" className={getComplexityColor(executionResult.workflow?.complexity || 'simple')}>
                {executionResult.workflow?.complexity || 'simple'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Workflow ID: {executionResult.workflow_id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Original Request:</h4>
              <p className="text-sm text-gray-400 bg-gray-700/50 p-3 rounded">
                {executionResult.original_request}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Workflow Steps:</h4>
              <div className="space-y-2">
                {executionResult.workflow?.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-700/30 rounded">
                    <span className="text-sm font-medium text-gray-300">Step {index + 1}:</span>
                    <span className="text-sm text-gray-400">{step.type.replace('_', ' ')}</span>
                    <Badge variant="outline" className="text-xs">
                      {step.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Execution Results:</h4>
              <div className="space-y-2">
                {executionResult.results.map((step) => (
                  <div key={step.step_number} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded">
                    <div className={`flex-shrink-0 ${getStepColor(step.success)}`}>
                      {getStepIcon(step.step_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          Step {step.step_number}: {step.step_type.replace('_', ' ')}
                        </span>
                        <Badge variant={step.success ? "default" : "destructive"}>
                          {step.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      {step.message && (
                        <p className="text-sm text-gray-300">{step.message}</p>
                      )}
                      {step.error && (
                        <p className="text-sm text-red-400">{step.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-600">
              <span className="text-sm text-gray-400">
                Executed: {formatDate(executionResult.timestamp)}
              </span>
              <Badge variant={executionResult.status === 'completed' ? "default" : "destructive"}>
                {executionResult.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-400" />
            Service Status
            <Button
              variant="ghost"
              size="sm"
              onClick={loadServiceStatus}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(serviceStatus).map(([serviceName, service]) => (
              <div key={serviceName} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded">
                {service.status === 'healthy' ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs text-gray-400">
                    {service.status}
                    {service.response_time && ` (${(service.response_time * 1000).toFixed(0)}ms)`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow History */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="text-blue-400" />
            Workflow History
            <Button
              variant="ghost"
              size="sm"
              onClick={loadWorkflowHistory}
              disabled={isLoadingHistory}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            Recent workflow executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflowHistory.length === 0 ? (
            <div className="text-center py-8">
              <Workflow size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-400">No workflow executions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflowHistory.map((workflow) => (
                <div key={workflow.workflow_id} className="bg-gray-700/50 p-3 rounded border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {workflow.workflow_id}
                      </span>
                      <Badge variant="outline" className={getComplexityColor(workflow.workflow?.complexity || 'simple')}>
                        {workflow.workflow?.complexity || 'simple'}
                      </Badge>
                    </div>
                    <Badge variant={workflow.status === 'completed' ? "default" : "destructive"}>
                      {workflow.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {workflow.original_request}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {workflow.results.length} steps • {workflow.workflow?.estimated_duration || 0}s estimated
                    </span>
                    <span>{formatDate(workflow.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
