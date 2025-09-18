/**
 * Enhanced Strands Decision Node
 * Shows real-time decision evaluation and routing logic
 */

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  Target,
  TrendingUp,
  Eye,
  ArrowRight
} from 'lucide-react';

interface DecisionNodeData {
  id: string;
  name: string;
  decision_type: 'rule_based' | 'agent_based' | 'ml_based' | 'hybrid';
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
    weight: number;
  }>;
  confidence_threshold: number;
  fallback_path: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  execution?: {
    progress: number;
    currentCondition?: string;
    evaluatedConditions: number;
    totalConditions: number;
  };
  lastResult?: {
    success: boolean;
    decision: boolean;
    confidence: number;
    reasoning: string;
    nextPath: string;
    conditionsEvaluated: Array<{
      condition: string;
      result: boolean;
      value: any;
    }>;
  };
  onConfigure?: () => void;
}

export const EnhancedStrandsDecisionNode: React.FC<NodeProps<DecisionNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'paused':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <GitBranch className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-yellow-400 bg-yellow-400/10';
      case 'completed':
        return 'border-green-400 bg-green-400/10';
      case 'error':
        return 'border-red-400 bg-red-400/10';
      case 'paused':
        return 'border-yellow-400 bg-yellow-400/10';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getNodeBorderColor = () => {
    if (selected) return 'border-blue-400 shadow-lg shadow-blue-400/20';
    return getStatusColor();
  };

  const getDecisionTypeIcon = () => {
    switch (data.decision_type) {
      case 'agent_based':
        return <Brain className="h-3 w-3 text-blue-400" />;
      case 'ml_based':
        return <TrendingUp className="h-3 w-3 text-purple-400" />;
      case 'hybrid':
        return <Target className="h-3 w-3 text-cyan-400" />;
      default:
        return <GitBranch className="h-3 w-3 text-yellow-400" />;
    }
  };

  const getDecisionTypeColor = () => {
    switch (data.decision_type) {
      case 'agent_based':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'ml_based':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'hybrid':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <Card className={`w-80 ${getNodeBorderColor()} transition-all duration-200`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <h3 className="font-semibold text-white text-sm">{data.name}</h3>
                <p className="text-xs text-gray-400">Decision Logic</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {getDecisionTypeIcon()}
              <Badge className={`text-xs ${getDecisionTypeColor()}`}>
                {data.decision_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="bg-gray-700/30 rounded p-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Conditions:</span>
              <span className="text-gray-300">{data.conditions.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Threshold:</span>
              <span className="text-gray-300">{(data.confidence_threshold * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Fallback:</span>
              <span className="text-gray-300 truncate max-w-24">{data.fallback_path}</span>
            </div>
          </div>

          {/* Conditions Preview */}
          {data.conditions.length > 0 && (
            <div className="bg-gray-700/30 rounded p-2">
              <div className="text-xs text-gray-400 mb-1">Conditions:</div>
              <div className="space-y-1">
                {data.conditions.slice(0, 2).map((condition, index) => (
                  <div key={index} className="text-xs text-gray-300 flex items-center gap-1">
                    <span className="text-yellow-400">•</span>
                    <span className="truncate">
                      {condition.field} {condition.operator} {condition.value}
                    </span>
                  </div>
                ))}
                {data.conditions.length > 2 && (
                  <div className="text-xs text-gray-400">
                    +{data.conditions.length - 2} more conditions
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Execution Status */}
          {data.status === 'running' && data.execution && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-300">Evaluating...</span>
                <span className="text-yellow-300">
                  {data.execution.evaluatedConditions}/{data.execution.totalConditions}
                </span>
              </div>
              <Progress 
                value={(data.execution.evaluatedConditions / data.execution.totalConditions) * 100} 
                className="h-1" 
              />
              {data.execution.currentCondition && (
                <div className="text-xs text-yellow-300">
                  Current: {data.execution.currentCondition}
                </div>
              )}
            </div>
          )}

          {/* Last Result */}
          {data.status === 'completed' && data.lastResult && (
            <div className="bg-green-900/20 border border-green-500/30 rounded p-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-300">Decision Made</span>
                <div className="flex items-center gap-2">
                  <Badge className={data.lastResult.decision ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {data.lastResult.decision ? 'TRUE' : 'FALSE'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Confidence:</span>
                <span className="text-green-300">
                  {(data.lastResult.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Next Path:</span>
                <div className="flex items-center gap-1">
                  <span className="text-green-300 truncate max-w-20">
                    {data.lastResult.nextPath}
                  </span>
                  <ArrowRight className="h-3 w-3 text-green-400" />
                </div>
              </div>

              {showDetails && (
                <div className="space-y-2 mt-2">
                  <div className="text-xs text-gray-300 bg-gray-800/50 rounded p-2">
                    <div className="font-medium mb-1">Reasoning:</div>
                    <div className="text-gray-400">{data.lastResult.reasoning}</div>
                  </div>
                  
                  {data.lastResult.conditionsEvaluated.length > 0 && (
                    <div className="text-xs bg-gray-800/50 rounded p-2">
                      <div className="font-medium text-gray-300 mb-1">Conditions Evaluated:</div>
                      <div className="space-y-1">
                        {data.lastResult.conditionsEvaluated.map((cond, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-400 truncate">{cond.condition}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-300">{String(cond.value)}</span>
                              {cond.result ? (
                                <CheckCircle className="h-3 w-3 text-green-400" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {data.status === 'error' && (
            <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
              <div className="flex items-center gap-2 text-xs text-red-300">
                <XCircle className="h-3 w-3" />
                <span>Decision evaluation failed</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={data.onConfigure}
              className="flex-1 text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>

            {data.lastResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Multiple output handles for different paths */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true"
        className="w-3 h-3"
        style={{ top: '40%' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="false"
        className="w-3 h-3"
        style={{ top: '60%' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="fallback"
        className="w-3 h-3"
      />
    </>
  );
};