import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  Send, 
  Bot, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Activity,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface OrchestrationStep {
  step_type: string;
  timestamp: string;
  elapsed_seconds: number;
  details: any;
}

interface OrchestrationResult {
  question: string;
  user: string;
  timestamp: string;
  session_id: string;
  agents_contacted: number;
  successful_responses: number;
  coordination_strategy: string;
  final_response: string;
  total_agents_used: number;
  orchestration_successful: boolean;
  agent_responses: Array<{
    agent_id: string;
    agent_name: string;
    response_time: number;
    status: string;
    response: string;
  }>;
  orchestration_log?: {
    steps: OrchestrationStep[];
    summary: {
      agents_contacted: number;
      coordination_events: number;
      final_result: string;
      routing_decisions: number;
    };
    total_steps: number;
    total_time_seconds: number;
  };
}

export const A2AOrchestrationMonitor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleOrchestrate = async () => {
    if (!question.trim()) return;

    setIsOrchestrating(true);
    setError(null);
    setResult(null);
    setCurrentStep('Initializing orchestration...');

    try {
      const response = await fetch('http://localhost:8005/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          user: 'Frontend User'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setCurrentStep('Orchestration completed!');
      } else {
        setError('Failed to orchestrate agents');
        setCurrentStep('Orchestration failed');
      }
    } catch (err) {
      setError('Error connecting to orchestration service');
      setCurrentStep('Connection error');
      console.error('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'ORCHESTRATION_START':
        return <Zap className="h-4 w-4 text-blue-400" />;
      case 'AGENT_DISCOVERY':
        return <Users className="h-4 w-4 text-green-400" />;
      case 'ROUTING_DECISION':
        return <Activity className="h-4 w-4 text-purple-400" />;
      case 'AGENT_CONTACT':
        return <Send className="h-4 w-4 text-orange-400" />;
      case 'AGENT_RESPONSE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'AGENT_ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'COORDINATION':
        return <Users className="h-4 w-4 text-cyan-400" />;
      case 'ORCHESTRATION_COMPLETE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (stepType: string) => {
    switch (stepType) {
      case 'ORCHESTRATION_START':
        return 'border-blue-500 bg-blue-500/10';
      case 'AGENT_DISCOVERY':
        return 'border-green-500 bg-green-500/10';
      case 'ROUTING_DECISION':
        return 'border-purple-500 bg-purple-500/10';
      case 'AGENT_CONTACT':
        return 'border-orange-500 bg-orange-500/10';
      case 'AGENT_RESPONSE':
        return 'border-green-600 bg-green-600/10';
      case 'AGENT_ERROR':
        return 'border-red-500 bg-red-500/10';
      case 'COORDINATION':
        return 'border-cyan-500 bg-cyan-500/10';
      case 'ORCHESTRATION_COMPLETE':
        return 'border-green-700 bg-green-700/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const formatStepType = (stepType: string) => {
    return stepType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-purple-400" size={20} />
            Live A2A Orchestration Monitor
          </CardTitle>
          <CardDescription>
            Watch agents coordinate in real-time with detailed step-by-step processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Ask a question that requires multiple agents:
            </label>
            <textarea
              placeholder="e.g., What's the weather like today and can you help me calculate the temperature in Celsius?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleOrchestrate}
              disabled={isOrchestrating || !question.trim()}
              className="flex-1"
            >
              {isOrchestrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Start Live Orchestration
                </>
              )}
            </Button>
            
            {result && (
              <Button
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
                className="border-gray-600"
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-green-400" size={20} />
                Orchestration Summary
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  Session: {result.session_id}
                </div>
                <Badge variant={result.orchestration_successful ? "default" : "destructive"}>
                  {result.orchestration_successful ? "Success" : "Failed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Agents Used</div>
                  <div className="text-white font-semibold">{result.total_agents_used}</div>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Contacted</div>
                  <div className="text-white font-semibold">{result.agents_contacted}</div>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Successful</div>
                  <div className="text-white font-semibold">{result.successful_responses}</div>
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <div className="text-gray-400">Strategy</div>
                  <div className="text-white font-semibold text-xs">{result.coordination_strategy}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Processing Steps */}
          {showDetails && result.orchestration_log && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-blue-400" size={20} />
                  Live Processing Steps
                  <Badge variant="outline" className="ml-auto">
                    {result.orchestration_log.total_steps} steps in {result.orchestration_log.total_time_seconds.toFixed(2)}s
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {result.orchestration_log.steps.map((step, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${getStepColor(step.step_type)}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {getStepIcon(step.step_type)}
                          <div className="font-medium text-white">
                            {formatStepType(step.step_type)}
                          </div>
                          <div className="text-xs text-gray-400 ml-auto">
                            +{step.elapsed_seconds.toFixed(2)}s
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300 ml-7">
                          {step.step_type === 'ORCHESTRATION_START' && (
                            <div>
                              <div><strong>Task:</strong> {step.details.task}</div>
                              <div><strong>User:</strong> {step.details.user}</div>
                              <div><strong>Session:</strong> {step.details.session_id}</div>
                            </div>
                          )}
                          
                          {step.step_type === 'AGENT_DISCOVERY' && (
                            <div>
                              <div><strong>Registry URL:</strong> {step.details.registry_url}</div>
                              <div><strong>Discovering:</strong> {step.details.discovering_agents ? 'Yes' : 'No'}</div>
                              {step.details.agents_found && (
                                <div><strong>Agents Found:</strong> {step.details.agents_found}</div>
                              )}
                              {step.details.available_agents && (
                                <div><strong>Available:</strong> {step.details.available_agents.join(', ')}</div>
                              )}
                            </div>
                          )}
                          
                          {step.step_type === 'ROUTING_DECISION' && (
                            <div>
                              <div><strong>Question:</strong> {step.details.question}</div>
                              <div><strong>Selected Agents:</strong> {step.details.selected_agents?.join(', ')}</div>
                              <div><strong>Reasoning:</strong> {step.details.routing_reasoning}</div>
                            </div>
                          )}
                          
                          {step.step_type === 'AGENT_CONTACT' && (
                            <div>
                              <div><strong>Agent:</strong> {step.details.agent_name} ({step.details.agent_id})</div>
                              <div><strong>URL:</strong> {step.details.agent_url}</div>
                              <div><strong>Question:</strong> {step.details.question}</div>
                            </div>
                          )}
                          
                          {step.step_type === 'AGENT_RESPONSE' && (
                            <div>
                              <div><strong>Agent:</strong> {step.details.agent_name}</div>
                              <div><strong>Response Time:</strong> {step.details.response_time?.toFixed(2)}s</div>
                              <div><strong>Status:</strong> 
                                <Badge variant={step.details.status === 'success' ? 'default' : 'destructive'} className="ml-2">
                                  {step.details.status}
                                </Badge>
                              </div>
                              {step.details.response_preview && (
                                <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                                  <strong>Preview:</strong> {step.details.response_preview.substring(0, 200)}...
                                </div>
                              )}
                            </div>
                          )}
                          
                          {step.step_type === 'AGENT_ERROR' && (
                            <div>
                              <div><strong>Agent:</strong> {step.details.agent_id}</div>
                              <div><strong>Error:</strong> {step.details.error}</div>
                            </div>
                          )}
                          
                          {step.step_type === 'COORDINATION' && (
                            <div>
                              <div><strong>Agents Contacted:</strong> {step.details.agents_contacted}</div>
                              <div><strong>Successful Responses:</strong> {step.details.successful_responses}</div>
                              <div><strong>Strategy:</strong> {step.details.coordination_strategy}</div>
                            </div>
                          )}
                          
                          {step.step_type === 'ORCHESTRATION_COMPLETE' && (
                            <div>
                              <div><strong>Final Response Length:</strong> {step.details.final_response_length} characters</div>
                              <div><strong>Total Agents Used:</strong> {step.details.total_agents_used}</div>
                              <div><strong>Success:</strong> {step.details.orchestration_successful ? 'Yes' : 'No'}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Final Response */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-green-400" size={20} />
                Final Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-700 p-4 rounded text-sm text-gray-200 whitespace-pre-wrap">
                {result.final_response}
              </div>
            </CardContent>
          </Card>

          {/* Agent Responses */}
          {result.agent_responses && result.agent_responses.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-cyan-400" size={20} />
                  Individual Agent Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.agent_responses.map((response, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white">{response.agent_name}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{response.response_time.toFixed(2)}s</span>
                          <Badge variant={response.status === 'success' ? 'default' : 'destructive'}>
                            {response.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        {response.response.substring(0, 300)}
                        {response.response.length > 300 && '...'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};







