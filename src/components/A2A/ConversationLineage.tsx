import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Clock, 
  MessageSquare, 
  Bot, 
  Brain, 
  CheckCircle, 
  X, 
  Activity,
  Code,
  Database,
  Zap
} from 'lucide-react';

interface HandoffRecord {
  handoff_id: string;
  from_agent: string;
  to_agent: string;
  timestamp: string;
  context: any;
  handoff_type: 'orchestration' | 'data_processing' | 'synthesis' | 'validation';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  instructions?: string;
  agent_response?: string;
  execution_time?: number;
  completion_time?: string;
}

interface ConversationLineageProps {
  lineage: HandoffRecord[];
  className?: string;
}

export const ConversationLineage: React.FC<ConversationLineageProps> = ({ 
  lineage, 
  className = "" 
}) => {
  if (!lineage || lineage.length === 0) {
    return null;
  }

  const getHandoffTypeIcon = (type: string) => {
    switch (type) {
      case 'orchestration': return <Brain className="w-4 h-4" />;
      case 'data_processing': return <Database className="w-4 h-4" />;
      case 'synthesis': return <Zap className="w-4 h-4" />;
      case 'validation': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getHandoffTypeColor = (type: string) => {
    switch (type) {
      case 'orchestration': return 'text-purple-400 border-purple-400';
      case 'data_processing': return 'text-blue-400 border-blue-400';
      case 'synthesis': return 'text-green-400 border-green-400';
      case 'validation': return 'text-orange-400 border-orange-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-400';
      case 'in_progress': return 'text-yellow-400 border-yellow-400';
      case 'failed': return 'text-red-400 border-red-400';
      case 'pending': return 'text-gray-400 border-gray-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
          Conversation Lineage
          <Badge variant="outline" className="ml-2 text-blue-400 border-blue-400">
            {lineage.length} handoffs
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {lineage.map((handoff, index) => (
            <div key={handoff.handoff_id} className="relative">
              {/* Connection Line */}
              {index < lineage.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-600"></div>
              )}
              
              {/* Handoff Card */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      {getHandoffTypeIcon(handoff.handoff_type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{handoff.from_agent}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{handoff.to_agent}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className={getHandoffTypeColor(handoff.handoff_type)}>
                          {handoff.handoff_type}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(handoff.status)}>
                          {handoff.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(handoff.timestamp)}</span>
                    </div>
                    {handoff.execution_time && (
                      <div className="mt-1">
                        {handoff.execution_time.toFixed(2)}s
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                {handoff.instructions && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Instructions:</div>
                    <div className="text-sm text-gray-300 bg-gray-700/30 p-2 rounded border border-gray-500">
                      {truncateText(handoff.instructions, 200)}
                    </div>
                  </div>
                )}

                {/* Context Data */}
                {handoff.context?.processed_data && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Context Data:</div>
                    <div className="text-sm text-gray-300 bg-gray-700/30 p-2 rounded border border-gray-500 max-h-20 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-xs">
                        {truncateText(handoff.context.processed_data, 150)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Agent Response */}
                {handoff.agent_response && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Agent Response:</div>
                    <div className="text-sm text-gray-300 bg-gray-700/30 p-2 rounded border border-gray-500 max-h-24 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-xs">
                        {truncateText(handoff.agent_response, 200)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Handoff ID */}
                <div className="mt-2 text-xs text-gray-500">
                  ID: {handoff.handoff_id}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded border border-gray-600">
          <div className="text-sm text-gray-400 mb-2">Lineage Summary:</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Total Handoffs:</span>
              <span className="text-white ml-2">{lineage.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Completed:</span>
              <span className="text-green-400 ml-2">
                {lineage.filter(h => h.status === 'completed').length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total Time:</span>
              <span className="text-white ml-2">
                {lineage.reduce((sum, h) => sum + (h.execution_time || 0), 0).toFixed(2)}s
              </span>
            </div>
            <div>
              <span className="text-gray-400">Agents Involved:</span>
              <span className="text-white ml-2">
                {new Set(lineage.flatMap(h => [h.from_agent, h.to_agent])).size}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
