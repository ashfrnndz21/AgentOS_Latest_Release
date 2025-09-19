import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, RefreshCw, Bot, Network, Brain, MessageSquare, CheckCircle, XCircle, Clock, Users, ChevronDown, ChevronUp, Zap, Cpu, MessageCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOrchestrationWebSocket } from '@/hooks/useOrchestrationWebSocket';

interface OrchestrationStep {
  step_type: string;
  timestamp: string;
  elapsed_seconds: number;
  details: any;
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

export const RealTimeLLMOrchestrationMonitor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogOpen, setIsLogOpen] = useState(true);
  const [isConversationsOpen, setIsConversationsOpen] = useState(true);

  // Use the real WebSocket hook - FIXED: Connect to orchestration service on port 5009
  const { 
    isConnected, 
    orchestrationSteps, 
    agentConversations, 
    orchestrationComplete,
    clearOrchestrationData,
    joinOrchestrationSession 
  } = useOrchestrationWebSocket('http://localhost:5009');

  const getIconForStepType = (stepType: string) => {
    switch (stepType) {
      case 'ORCHESTRATION_START': return <RefreshCw className="h-4 w-4 text-blue-400" />;
      case 'AGENT_DISCOVERY': return <Network className="h-4 w-4 text-purple-400" />;
      case 'ROUTING_DECISION': return <Brain className="h-4 w-4 text-yellow-400" />;
      case 'AGENT_CONTACT': return <Bot className="h-4 w-4 text-green-400" />;
      case 'AGENT_RESPONSE': return <MessageSquare className="h-4 w-4 text-cyan-400" />;
      case 'AGENT_ERROR': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'COORDINATION': return <Users className="h-4 w-4 text-indigo-400" />;
      case 'TOOL_DISCOVERY': return <Zap className="h-4 w-4 text-orange-400" />;
      case 'EXECUTION': return <Cpu className="h-4 w-4 text-pink-400" />;
      case 'ORCHESTRATION_COMPLETE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (stepType: string) => {
    switch (stepType) {
      case 'ORCHESTRATION_START': return 'text-blue-400';
      case 'AGENT_DISCOVERY': return 'text-purple-400';
      case 'ROUTING_DECISION': return 'text-yellow-400';
      case 'AGENT_CONTACT': return 'text-green-400';
      case 'AGENT_RESPONSE': return 'text-cyan-400';
      case 'AGENT_ERROR': return 'text-red-500';
      case 'COORDINATION': return 'text-indigo-400';
      case 'TOOL_DISCOVERY': return 'text-orange-400';
      case 'EXECUTION': return 'text-pink-400';
      case 'ORCHESTRATION_COMPLETE': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    clearOrchestrationData();

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
      console.error('Orchestration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start orchestration');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatElapsedTime = (seconds: number) => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Orchestration Input */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Real-Time LLM Orchestration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question for multiple agents (e.g., 'What's the weather like and can you calculate 2+2?')"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading || !question.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Orchestrating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Start Real-Time Orchestration
                  </>
                )}
              </Button>
              {orchestrationSteps.length > 0 && (
                <Button
                  type="button"
                  onClick={clearOrchestrationData}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="text-sm text-gray-400">
              WebSocket Status: {isConnected ? <span className="text-green-500">Connected</span> : <span className="text-red-500">Disconnected</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Real-Time Orchestration Steps */}
      {orchestrationSteps.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <Collapsible open={isLogOpen} onOpenChange={setIsLogOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-750 transition-colors">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Orchestration Steps ({orchestrationSteps.length})
                  </div>
                  {isLogOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {orchestrationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getIconForStepType(step.step_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${getStatusColor(step.step_type)}`}>
                          {step.step_type.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatTimestamp(step.timestamp)}</span>
                          <span>•</span>
                          <span>{formatElapsedTime(step.elapsed_seconds)}</span>
                        </div>
                      </div>
                      {step.details && (
                        <div className="text-sm text-gray-300">
                          <pre className="whitespace-pre-wrap text-xs">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                    <MessageCircle className="h-5 w-5 text-green-400" />
                    Agent Conversations ({agentConversations.length})
                  </div>
                  {isConversationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {agentConversations.map((conversation, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-white">{conversation.agent_name}</span>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(conversation.timestamp)} • {conversation.execution_time.toFixed(2)}s
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-300">Question:</span>
                        <p className="text-sm text-gray-200 mt-1">{conversation.question}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-300">Response:</span>
                        <p className="text-sm text-gray-200 mt-1">{conversation.llm_response}</p>
                      </div>
                      {conversation.tools_available.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-300">Tools Used:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {conversation.tools_available.map((tool, toolIndex) => (
                              <span key={toolIndex} className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Orchestration Complete */}
      {orchestrationComplete && (
        <Card className="bg-green-900 border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Orchestration Complete!</span>
            </div>
            <p className="text-green-300 text-sm mt-2">
              All agents have completed their tasks successfully.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};