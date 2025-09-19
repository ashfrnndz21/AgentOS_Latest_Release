import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Send, RefreshCw, Bot, Network, Brain, MessageSquare, 
  CheckCircle, XCircle, Clock, Users, ChevronDown, ChevronUp, 
  Zap, Cpu, MessageCircle, Search, Target, Settings, Play, 
  AlertCircle, TrendingUp, Database, Gauge, Timer
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOrchestrationWebSocket } from '@/hooks/useOrchestrationWebSocket';

interface OrchestrationStep {
  step_type: string;
  timestamp: string;
  elapsed_seconds: number;
  details: any;
  status?: 'pending' | 'processing' | 'completed' | 'error';
}

interface AgentConversation {
  agent_id: string;
  agent_name: string;
  question: string;
  llm_response: string;
  execution_time: number;
  tools_available: string[];
  timestamp: string;
}

export const AdvancedOrchestrationMonitor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogOpen, setIsLogOpen] = useState(true);
  const [isConversationsOpen, setIsConversationsOpen] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<string>('');
  const [stepProgress, setStepProgress] = useState<{[key: string]: 'pending' | 'processing' | 'completed' | 'error'}>({});

  const { 
    isConnected, 
    orchestrationSteps, 
    agentConversations, 
    orchestrationComplete,
    clearOrchestrationData,
    joinOrchestrationSession 
  } = useOrchestrationWebSocket('http://localhost:5009');

  const getStepIcon = (stepType: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'USER_QUERY_RECEIVED': <MessageSquare className="h-5 w-5 text-blue-400" />,
      'QUERY_ANALYSIS': <Brain className="h-5 w-5 text-purple-400" />,
      'AGENT_REGISTRY_SEARCH': <Search className="h-5 w-5 text-yellow-400" />,
      'AGENT_QUALIFICATION': <Target className="h-5 w-5 text-orange-400" />,
      'AGENT_SELECTION': <Users className="h-5 w-5 text-green-400" />,
      'EXECUTION_PLANNING': <Settings className="h-5 w-5 text-indigo-400" />,
      'AGENT_EXECUTION': <Zap className="h-5 w-5 text-indigo-400" />,
      'EXECUTION_COMPLETE': <CheckCircle className="h-5 w-5 text-green-500" />,
      'AGENT_EXECUTION_START': <Play className="h-5 w-5 text-emerald-400" />,
      'AGENT_PROCESSING': <Cpu className="h-5 w-5 text-cyan-400" />,
      'EXECUTION_RESULTS': <TrendingUp className="h-5 w-5 text-lime-400" />,
      'ORCHESTRATION_COMPLETE': <CheckCircle className="h-5 w-5 text-green-500" />,
    };
    return iconMap[stepType] || <Network className="h-5 w-5 text-gray-400" />;
  };

  const getStepStatusColor = (stepType: string) => {
    const colorMap: { [key: string]: string } = {
      'USER_QUERY_RECEIVED': 'text-blue-400',
      'QUERY_ANALYSIS': 'text-purple-400',
      'AGENT_REGISTRY_SEARCH': 'text-yellow-400',
      'AGENT_QUALIFICATION': 'text-orange-400',
      'AGENT_SELECTION': 'text-green-400',
      'EXECUTION_PLANNING': 'text-indigo-400',
      'AGENT_EXECUTION_START': 'text-emerald-400',
      'AGENT_PROCESSING': 'text-cyan-400',
      'EXECUTION_RESULTS': 'text-lime-400',
      'ORCHESTRATION_COMPLETE': 'text-green-500',
    };
    return colorMap[stepType] || 'text-gray-400';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatElapsedTime = (seconds: number) => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  const toggleStepExpansion = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  // Track step progress in real-time
  useEffect(() => {
    if (orchestrationSteps.length > 0) {
      const latestStep = orchestrationSteps[orchestrationSteps.length - 1];
      setCurrentStep(latestStep.step_type);
      
      // Update step progress
      setStepProgress(prev => {
        const newProgress = { ...prev };
        // Mark previous steps as completed
        orchestrationSteps.forEach((step, index) => {
          if (index < orchestrationSteps.length - 1) {
            newProgress[step.step_type] = 'completed';
          } else {
            newProgress[step.step_type] = 'processing';
          }
        });
        return newProgress;
      });
    }
  }, [orchestrationSteps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    clearOrchestrationData();
    setExpandedSteps(new Set());
    setCurrentStep('');
    setStepProgress({});

    try {
      const sessionId = `session_${Date.now()}`;
      
      // Join the orchestration session room for WebSocket events
      joinOrchestrationSession(sessionId);
      
      // Send orchestration request to the orchestration service
      const response = await fetch('http://localhost:5009/api/strands-orchestration/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question.trim(),
          session_id: sessionId,
          user_id: 'demo_user'
        })
      });

      if (!response.ok) {
        throw new Error(`Orchestration failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Orchestration started:', result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Orchestration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepDetails = (step: OrchestrationStep, index: number) => {
    const details = step.details || {};
    const isExpanded = expandedSteps.has(index);

    switch (step.step_type) {
      case 'USER_QUERY_RECEIVED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-300" />
              <span className="text-sm text-gray-300">Query Analysis</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Type</div>
                <div className="text-white">{details.query_type || 'General'}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Complexity</div>
                <div className="text-white">{details.complexity || 'Unknown'}</div>
              </div>
            </div>
            {details.required_capabilities && details.required_capabilities.length > 0 && (
              <div className="flex gap-1">
                {details.required_capabilities.map((cap: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'QUERY_ANALYSIS':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-300" />
              <span className="text-sm text-gray-300">{details.analysis_status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Classification</div>
                <div className="text-white">{details.query_classification}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Strategy</div>
                <div className="text-white">{details.execution_strategy}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-purple-300" />
              <span className="text-sm text-gray-300">Confidence: {details.confidence}%</span>
            </div>
          </div>
        );

      case 'AGENT_REGISTRY_SEARCH':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-yellow-300" />
              <span className="text-sm text-gray-300">{details.search_status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Total Agents</div>
                <div className="text-white">{details.total_agents_available}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Criteria</div>
                <div className="text-white">{details.search_criteria?.join(', ') || 'All'}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">{details.filtering_status}</div>
          </div>
        );

      case 'AGENT_QUALIFICATION':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-300" />
              <span className="text-sm text-gray-300">{details.qualification_status}</span>
            </div>
            <div className="space-y-1">
              {details.qualified_agents?.map((agent: any, i: number) => (
                <div key={i} className="bg-gray-700 p-2 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{agent.name}</span>
                    <span className="text-green-400">✓ Qualified</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-gray-400">Model: {agent.model}</span>
                    <span className="text-gray-400">Load: {agent.load}</span>
                    <span className="text-gray-400">Status: {agent.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-gray-400">Match</div>
                <div className="text-green-400">{details.qualification_criteria?.capability_match}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-gray-400">Performance</div>
                <div className="text-blue-400">{details.qualification_criteria?.performance_score}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-gray-400">Load</div>
                <div className="text-purple-400">{details.qualification_criteria?.load_balancing}</div>
              </div>
            </div>
          </div>
        );

      case 'AGENT_SELECTION':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-300" />
              <span className="text-sm text-gray-300">{details.selection_status}</span>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{details.selected_agent?.name}</span>
                <span className="text-green-400">Selected</span>
              </div>
              <div className="text-xs text-gray-300 mb-2">
                Reason: {details.selected_agent?.reason}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-600 p-2 rounded text-center">
                  <div className="text-gray-400">Match</div>
                  <div className="text-green-400">{details.selection_criteria?.capability_match}</div>
                </div>
                <div className="bg-gray-600 p-2 rounded text-center">
                  <div className="text-gray-400">Performance</div>
                  <div className="text-blue-400">{details.selection_criteria?.performance_score}</div>
                </div>
                <div className="bg-gray-600 p-2 rounded text-center">
                  <div className="text-gray-400">Load</div>
                  <div className="text-purple-400">{details.selection_criteria?.load_balancing}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'EXECUTION_PLANNING':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-300" />
              <span className="text-sm text-gray-300">{details.planning_status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Strategy</div>
                <div className="text-white">{details.execution_strategy}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Steps</div>
                <div className="text-white">{details.workflow_steps}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Est. Time</div>
                <div className="text-white">{details.estimated_time}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-gray-400">Monitoring</div>
                <div className="text-white">{details.monitoring}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Fallback: {details.fallback_plan}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-xs text-gray-400">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Intelligent Agent Orchestration</h2>
            <p className="text-sm text-gray-400">Advanced multi-agent coordination with real-time monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-900 text-green-300 border border-green-700' 
              : 'bg-red-900 text-red-300 border border-red-700'
          }`}>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Query Input */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything... (e.g., 'what is 25 * 47', 'analyze this data', 'help me with...')"
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Orchestrating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orchestration Steps Timeline */}
      {orchestrationSteps.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <Collapsible open={isLogOpen} onOpenChange={setIsLogOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-750 transition-colors">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-green-600 to-blue-600 rounded">
                      <Timer className="h-4 w-4 text-white" />
                    </div>
                    Orchestration Timeline ({orchestrationSteps.length})
                  </div>
                  {isLogOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {orchestrationSteps.map((step, index) => {
                    const stepStatus = stepProgress[step.step_type] || 'pending';
                    const isCurrentStep = step.step_type === currentStep;
                    const isCompleted = stepStatus === 'completed';
                    const isProcessing = stepStatus === 'processing';
                    
                    return (
                      <div 
                        key={index} 
                        className={`relative transition-all duration-500 ${
                          isCurrentStep ? 'animate-pulse' : ''
                        }`}
                      >
                        {/* Timeline line */}
                        {index < orchestrationSteps.length - 1 && (
                          <div className={`absolute left-6 top-12 w-0.5 h-16 transition-colors duration-500 ${
                            isCompleted ? 'bg-gradient-to-b from-green-600 to-green-700' : 'bg-gray-700'
                          }`} />
                        )}
                        
                        {/* Step card */}
                        <div className="relative flex gap-4">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full border-2 transition-all duration-500 ${
                              isCompleted 
                                ? 'bg-green-900 border-green-600' 
                                : isProcessing
                                ? 'bg-blue-900 border-blue-600 animate-pulse'
                                : 'bg-gray-700 border-gray-600'
                            }`}>
                              {getStepIcon(step.step_type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div 
                              className={`rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-green-900/20 border border-green-700 hover:bg-green-900/30' 
                                  : isProcessing
                                  ? 'bg-blue-900/20 border border-blue-700 hover:bg-blue-900/30'
                                  : 'bg-gray-700 hover:bg-gray-650'
                              }`}
                              onClick={() => toggleStepExpansion(index)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className={`font-medium transition-colors duration-300 ${
                                    isCompleted 
                                      ? 'text-green-400' 
                                      : isProcessing
                                      ? 'text-blue-400'
                                      : getStepStatusColor(step.step_type)
                                  }`}>
                                    {step.step_type.replace(/_/g, ' ')}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full transition-colors duration-300 ${
                                    isCompleted 
                                      ? 'bg-green-600 text-green-100' 
                                      : isProcessing
                                      ? 'bg-blue-600 text-blue-100'
                                      : 'bg-gray-600 text-gray-300'
                                  }`}>
                                    {isProcessing ? 'Processing...' : isCompleted ? 'Completed' : `Step ${index + 1}`}
                                  </span>
                                  {isProcessing && (
                                    <div className="flex space-x-1">
                                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <span>{formatTimestamp(step.timestamp)}</span>
                                  <span>•</span>
                                  <span>{formatElapsedTime(step.elapsed_seconds)}</span>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${
                                    expandedSteps.has(index) ? 'rotate-180' : ''
                                  }`} />
                                </div>
                              </div>
                              
                              {/* Show details only for completed or current step */}
                              {(isCompleted || isProcessing) && expandedSteps.has(index) && (
                                <div className="mt-3 pt-3 border-t border-gray-600 animate-in slide-in-from-top-2 duration-300">
                                  {renderStepDetails(step, index)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show next expected step if not all steps are complete */}
                  {currentStep && orchestrationSteps.length < 6 && (
                    <div className="relative opacity-50">
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-700" />
                      <div className="relative flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="p-2 rounded-full border-2 border-gray-600 bg-gray-800">
                            <div className="w-5 h-5 bg-gray-600 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-500">
                                  {orchestrationSteps.length === 1 ? 'AGENT EXECUTION START' :
                                   orchestrationSteps.length === 2 ? 'AGENT PROCESSING' :
                                   orchestrationSteps.length === 3 ? 'EXECUTION RESULTS' :
                                   orchestrationSteps.length === 4 ? 'ORCHESTRATION COMPLETE' :
                                   'Next Step'}
                                </span>
                                <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                                  Waiting...
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Agent Conversations */}
      {agentConversations.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <Collapsible open={isConversationsOpen} onOpenChange={setIsConversationsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-750 transition-colors">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    Agent Responses ({agentConversations.length})
                  </div>
                  {isConversationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {agentConversations.map((conversation, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-green-400" />
                        <span className="font-medium text-white">{conversation.agent_name}</span>
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(conversation.timestamp)}</span>
                        <span>•</span>
                        <span>{conversation.execution_time.toFixed(2)}s</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Question:</div>
                        <div className="bg-gray-600 p-3 rounded text-sm text-white">
                          {conversation.question}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Response:</div>
                        <div className="bg-gray-600 p-3 rounded text-sm text-white">
                          {conversation.llm_response}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {conversation.tools_available.map((tool, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-600 text-purple-100 text-xs rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Completion Banner */}
      {orchestrationComplete && (
        <Card className="bg-gradient-to-r from-green-900 to-emerald-900 border-green-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-700 rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Orchestration Complete!</h3>
                <p className="text-green-200">All agents have completed their tasks successfully.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
