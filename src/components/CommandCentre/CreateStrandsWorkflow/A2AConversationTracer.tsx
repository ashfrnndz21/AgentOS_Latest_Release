import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Brain,
  Wrench,
  Database,
  Eye
} from 'lucide-react';
import { A2AConversationTrace, ConversationStep, A2AConversationUIProps } from './types';

interface A2AConversationTracerProps extends A2AConversationUIProps {
  onStartConversation: (query: string) => void;
  onStopConversation: () => void;
  isRunning: boolean;
}

export const A2AConversationTracer: React.FC<A2AConversationTracerProps> = ({
  conversationTrace,
  isLive,
  onAgentClick,
  onStepClick,
  selectedStep,
  selectedAgent,
  onStartConversation,
  onStopConversation,
  isRunning
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartConversation = () => {
    if (query.trim()) {
      onStartConversation(query.trim());
      setQuery('');
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'reasoning':
        return <Brain className="h-4 w-4 text-blue-400" />;
      case 'tool_use':
        return <Wrench className="h-4 w-4 text-green-400" />;
      case 'memory_retrieval':
        return <Database className="h-4 w-4 text-purple-400" />;
      case 'agent_communication':
        return <MessageSquare className="h-4 w-4 text-orange-400" />;
      case 'validation':
        return <CheckCircle className="h-4 w-4 text-cyan-400" />;
      case 'output_generation':
        return <Eye className="h-4 w-4 text-pink-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatus = (step: ConversationStep) => {
    if (step.duration_ms > 0) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
    return <Clock className="h-4 w-4 text-yellow-400" />;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      {/* Conversation Input */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            A2A Conversation Tracer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question to test A2A collaboration..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartConversation()}
              className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            />
            <Button
              onClick={handleStartConversation}
              disabled={!query.trim() || isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {isRunning && (
              <Button
                onClick={onStopConversation}
                variant="destructive"
                size="sm"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Trace */}
      {conversationTrace && (
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                Conversation Trace
                {isLive && (
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Live
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trace Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {conversationTrace.agents_involved.length}
                </div>
                <div className="text-sm text-gray-400">Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {conversationTrace.conversation_flow.length}
                </div>
                <div className="text-sm text-gray-400">Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {formatDuration(conversationTrace.duration_ms)}
                </div>
                <div className="text-sm text-gray-400">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {conversationTrace.success ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-400">Status</div>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Conversation Flow</h4>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {conversationTrace.conversation_flow.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStep === step.id
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                      }`}
                      onClick={() => onStepClick(step.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStepIcon(step.step_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">
                              {step.agent_name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {step.step_type.replace('_', ' ')}
                            </Badge>
                            {getStepStatus(step)}
                          </div>
                          <p className="text-sm text-gray-300 mb-2">
                            {step.input}
                          </p>
                          {step.output && (
                            <div className="text-sm text-gray-400 bg-gray-700/30 p-2 rounded">
                              {step.output}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{formatTimestamp(step.timestamp)}</span>
                            <span>{formatDuration(step.duration_ms)}</span>
                            {step.tools_used.length > 0 && (
                              <span>{step.tools_used.length} tools</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Final Output */}
            {conversationTrace.final_output && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Final Output</h4>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <p className="text-white">{conversationTrace.final_output}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Status */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-md font-medium text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversationTrace?.agents_involved.map((agentId) => (
              <div
                key={agentId}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAgent === agentId
                    ? 'bg-purple-600/20 border-purple-500'
                    : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                }`}
                onClick={() => onAgentClick(agentId)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-white">{agentId}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


