import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Play,
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
  Zap,
  X
} from 'lucide-react';
import { orchestrationService, OrchestrationResult, OrchestrationStep, AvailableAgent } from '@/lib/services/OrchestrationService';

interface OrchestrationPanelSimpleProps {
  onClose?: () => void;
}

export const OrchestrationPanelSimple: React.FC<OrchestrationPanelSimpleProps> = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [user, setUser] = useState('User');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Record<string, AvailableAgent>>({});
  const [isHealthy, setIsHealthy] = useState(false);

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

    try {
      const result = await orchestrationService.orchestrateQuestion(question, user);
      setResult(result);
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

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-gray-900 text-white">
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
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-4">Ask a Question</h3>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter your name"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-32 bg-gray-700 border-gray-600 text-white"
            />
            <div className="flex-1 flex flex-col">
              <Textarea
                placeholder="Ask a question that requires multiple agents to answer..."
                value={question}
                onChange={(e) => {
                  console.log('Textarea onChange triggered:', e.target.value);
                  setQuestion(e.target.value);
                }}
                onClick={(e) => e.currentTarget.focus()}
                className="flex-1 bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                style={{ 
                  resize: 'vertical',
                  pointerEvents: 'auto',
                  userSelect: 'text',
                  cursor: 'text'
                }}
                disabled={false}
                readOnly={false}
                autoFocus={false}
              />
              <div className="text-xs text-gray-400 mt-1">
                Current question: "{question}" (Length: {question.length})
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                Try typing directly in the textarea above - you should see the text appear here
              </div>
            </div>
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
            <Button 
              onClick={() => {
                console.log('Current question state:', question);
                console.log('Setting test question...');
                setQuestion('Test question from button - this should appear in the textarea');
                console.log('Question set, new state should be:', 'Test question from button - this should appear in the textarea');
              }}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Test
            </Button>
          </div>
        </div>
      </div>

      {/* Available Agents */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-4 flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Available Agents ({Object.keys(availableAgents).length})</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(availableAgents).map(([id, agent]) => (
            <div key={id} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700">
              {getAgentIcon(id)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <p className="text-xs text-gray-400 truncate">{agent.description}</p>
              </div>
              <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {agent.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-4 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Orchestration Complete</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total Time</p>
                <p className="font-semibold">{result.orchestration_log.total_time_seconds.toFixed(2)}s</p>
              </div>
              <div>
                <p className="text-gray-400">Agents Used</p>
                <p className="font-semibold">{result.selected_agents.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Steps</p>
                <p className="font-semibold">{result.orchestration_log.total_steps}</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="font-semibold text-green-600">Success</p>
              </div>
            </div>
          </div>

          {/* Agent Responses */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-4 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Agent Responses</span>
            </h3>
            <div className="space-y-4">
              {Object.entries(result.agent_responses).map(([agentId, response]) => (
                <div key={agentId} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAgentIcon(agentId)}
                      <span className="font-medium">{response.agent_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{response.execution_time.toFixed(2)}s</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">
                    {response.response}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Response */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-4 flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Final Response</span>
            </h3>
            <div className="text-sm text-gray-300 whitespace-pre-wrap">
              {result.final_response}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isHealthy && (
        <div className="bg-red-900 border border-red-600 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-200">Orchestration service is not available. Please check if the backend services are running.</span>
          </div>
        </div>
      )}
    </div>
  );
};
