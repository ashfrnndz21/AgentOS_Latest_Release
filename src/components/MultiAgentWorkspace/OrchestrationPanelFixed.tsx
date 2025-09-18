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

interface OrchestrationPanelFixedProps {
  onClose?: () => void;
}

export const OrchestrationPanelFixed: React.FC<OrchestrationPanelFixedProps> = ({ onClose }) => {
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
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
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

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Input Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Ask a Question</h3>
          
          {/* User Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <Input
              placeholder="Enter your name"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Question Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question
            </label>
            <Textarea
              placeholder="Ask a question that requires multiple agents to answer..."
              value={question}
              onChange={(e) => {
                console.log('Textarea onChange triggered:', e.target.value);
                setQuestion(e.target.value);
              }}
              className="w-full bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              rows={5}
              style={{ 
                resize: 'vertical',
                minHeight: '120px'
              }}
            />
            <div className="mt-2 text-xs text-gray-400">
              Characters: {question.length} | Try typing directly in the textarea above
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleOrchestrate} 
              disabled={!question.trim() || isRunning}
              className="flex-1"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Ask Question
                </>
              )}
            </Button>
            <Button 
              onClick={() => {
                console.log('Setting test question...');
                setQuestion('How does NVIDIA stock correlate with weather conditions and what are the investment implications?');
              }}
              variant="outline"
              size="lg"
            >
              Test
            </Button>
          </div>
        </div>

        {/* Available Agents */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Available Agents ({Object.keys(availableAgents).length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(availableAgents).map(([id, agent]) => (
              <div key={id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                {getAgentIcon(id)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{agent.name}</p>
                  <p className="text-sm text-gray-400">{agent.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.capabilities.slice(0, 3).map((capability, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>
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
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Orchestration Complete</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {result.orchestration_log.total_time_seconds.toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-400">Total Time</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {result.selected_agents.length}
                  </div>
                  <div className="text-sm text-gray-400">Agents Used</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {result.orchestration_log.total_steps}
                  </div>
                  <div className="text-sm text-gray-400">Steps</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">✓</div>
                  <div className="text-sm text-gray-400">Success</div>
                </div>
              </div>
            </div>

            {/* Agent Responses */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Agent Responses</span>
              </h3>
              <div className="space-y-4">
                {Object.entries(result.agent_responses).map(([agentId, response]) => (
                  <div key={agentId} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getAgentIcon(agentId)}
                        <span className="font-medium text-white">{response.agent_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{response.execution_time.toFixed(2)}s</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {response.response}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Response */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Final Coordinated Response</span>
              </h3>
              <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed p-4 bg-gray-700 rounded-lg">
                {result.final_response}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isHealthy && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-medium text-red-200">Service Unavailable</p>
                <p className="text-sm text-red-300">
                  Orchestration service is not available. Please check if the backend services are running.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




