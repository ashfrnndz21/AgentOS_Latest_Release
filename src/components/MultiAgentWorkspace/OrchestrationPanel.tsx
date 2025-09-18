import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Brain,
  Calculator,
  Cloud,
  TrendingUp,
  Search,
  Settings,
  Activity,
  Zap
} from 'lucide-react';
import { orchestrationService, OrchestrationResult, OrchestrationStep, AvailableAgent } from '@/lib/services/OrchestrationService';

interface OrchestrationPanelProps {
  onClose?: () => void;
}

export const OrchestrationPanel: React.FC<OrchestrationPanelProps> = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [user, setUser] = useState('User');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Record<string, AvailableAgent>>({});
  const [isHealthy, setIsHealthy] = useState(false);
  const [currentStep, setCurrentStep] = useState<OrchestrationStep | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);

  // Load available agents on mount
  useEffect(() => {
    loadAvailableAgents();
    checkHealth();
  }, []);

  const loadAvailableAgents = async () => {
    try {
      const agents = await orchestrationService.getAvailableAgents();
      setAvailableAgents(agents.available_agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const checkHealth = async () => {
    const healthy = await orchestrationService.checkHealth();
    setIsHealthy(healthy);
  };

  const handleOrchestrate = async () => {
    if (!question.trim()) return;

    setIsRunning(true);
    setResult(null);
    setCurrentStep(null);
    setExecutionProgress(0);

    try {
      const result = await orchestrationService.orchestrateQuestion(question, user);
      setResult(result);
      setExecutionProgress(100);
    } catch (error) {
      console.error('Orchestration failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'calculator': return <Calculator className="h-4 w-4" />;
      case 'research': return <Search className="h-4 w-4" />;
      case 'weather': return <Cloud className="h-4 w-4" />;
      case 'stock': return <TrendingUp className="h-4 w-4" />;
      case 'coordinator': return <Users className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'ORCHESTRATION_START': return <Play className="h-4 w-4 text-blue-500" />;
      case 'AGENT_DISCOVERY': return <Search className="h-4 w-4 text-green-500" />;
      case 'ROUTING_DECISION': return <Settings className="h-4 w-4 text-purple-500" />;
      case 'AGENT_CONTACT': return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'AGENT_RESPONSE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'COORDINATION': return <Users className="h-4 w-4 text-indigo-500" />;
      case 'ORCHESTRATION_COMPLETE': return <Zap className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatElapsedTime = (seconds: number) => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Multi-Agent Orchestration</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {isHealthy ? "Connected" : "Disconnected"}
          </Badge>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ask a Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter your name"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-32"
            />
            <Textarea
              placeholder="Ask a question that requires multiple agents to answer..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={handleOrchestrate} 
              disabled={!question.trim() || isRunning}
              className="px-6"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Available Agents ({Object.keys(availableAgents).length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(availableAgents).map(([id, agent]) => (
              <div key={id} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                {getAgentIcon(id)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                </div>
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Executing orchestration...</span>
                <span>{executionProgress}%</span>
              </div>
              <Progress value={executionProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Orchestration Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Time</p>
                  <p className="font-semibold">{formatElapsedTime(result.orchestration_log.total_time_seconds)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Agents Used</p>
                  <p className="font-semibold">{result.selected_agents.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Steps</p>
                  <p className="font-semibold">{result.orchestration_log.total_steps}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-semibold text-green-600">Success</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orchestration Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Execution Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {result.orchestration_log.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStepIcon(step.step_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{step.step_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500">{formatElapsedTime(step.elapsed_seconds)}</p>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {Object.entries(step.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Agent Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Agent Responses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result.agent_responses).map(([agentId, response]) => (
                  <div key={agentId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getAgentIcon(agentId)}
                        <span className="font-medium">{response.agent_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatElapsedTime(response.execution_time)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {response.response}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final Response */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Final Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {result.final_response}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};




