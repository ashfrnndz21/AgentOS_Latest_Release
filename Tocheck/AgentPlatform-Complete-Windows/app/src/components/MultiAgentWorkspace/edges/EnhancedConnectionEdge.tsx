import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { 
  ArrowRight, 
  Database, 
  GitBranch, 
  Zap, 
  AlertTriangle,
  Settings,
  Play,
  Pause,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EnhancedConnectionEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: any;
  markerEnd?: any;
  data?: {
    type: 'data' | 'control' | 'event' | 'error';
    label?: string;
    condition?: string;
    status?: 'idle' | 'active' | 'success' | 'error';
    metrics?: {
      executionCount: number;
      avgDuration: number;
      successRate: number;
    };
  };
}

export const EnhancedConnectionEdge: React.FC<EnhancedConnectionEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: 2,
      ...style,
    };

    switch (data?.type) {
      case 'data':
        return {
          ...baseStyle,
          stroke: data?.status === 'active' ? '#10b981' : '#6b7280',
          strokeDasharray: data?.status === 'active' ? '5,5' : 'none',
        };
      case 'control':
        return {
          ...baseStyle,
          stroke: '#f59e0b',
          strokeDasharray: '10,5',
        };
      case 'event':
        return {
          ...baseStyle,
          stroke: '#8b5cf6',
          strokeDasharray: '2,3',
        };
      case 'error':
        return {
          ...baseStyle,
          stroke: '#ef4444',
          strokeDasharray: '8,3,2,3',
        };
      default:
        return {
          ...baseStyle,
          stroke: '#6b7280',
        };
    }
  };

  const getEdgeIcon = () => {
    switch (data?.type) {
      case 'data':
        return <Database className="h-3 w-3" />;
      case 'control':
        return <GitBranch className="h-3 w-3" />;
      case 'event':
        return <Zap className="h-3 w-3" />;
      case 'error':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <ArrowRight className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (data?.status) {
      case 'active':
        return 'bg-green-500/20 border-green-500 text-green-400';
      case 'success':
        return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'error':
        return 'bg-red-500/20 border-red-500 text-red-400';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getTypeLabel = () => {
    switch (data?.type) {
      case 'data':
        return 'Data Flow';
      case 'control':
        return 'Control Flow';
      case 'event':
        return 'Event Trigger';
      case 'error':
        return 'Error Handler';
      default:
        return 'Connection';
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={getEdgeStyle()}
        className={data?.status === 'active' ? 'animate-pulse' : ''}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Edge Label */}
          <div className={`
            ${getStatusColor()} 
            border rounded-full px-2 py-1 
            flex items-center gap-1 
            shadow-lg backdrop-blur-sm
            transition-all duration-200
            ${isHovered ? 'scale-110' : 'scale-100'}
            font-sans
          `}>
            {getEdgeIcon()}
            <span className="text-xs font-medium truncate max-w-[80px]">
              {data?.label || getTypeLabel()}
            </span>
            
            {data?.status === 'active' && (
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-white/20"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Settings className="h-2.5 w-2.5" />
            </Button>
          </div>

          {/* Condition Badge */}
          {data?.condition && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Badge 
                variant="outline" 
                className="text-xs bg-amber-500/20 border-amber-500 text-amber-400 font-mono"
              >
                {data.condition}
              </Badge>
            </div>
          )}

          {/* Detailed Info Panel */}
          {showDetails && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-beam-dark-accent border border-gray-600 rounded-lg p-3 shadow-xl min-w-[200px] font-sans">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-300">Connection Type</span>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-300">Status</span>
                    <div className="flex items-center gap-1">
                      {data?.status === 'active' && <Play className="h-3 w-3 text-green-400" />}
                      {data?.status === 'success' && <Clock className="h-3 w-3 text-blue-400" />}
                      {data?.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-400" />}
                      <span className="text-xs capitalize">{data?.status || 'idle'}</span>
                    </div>
                  </div>

                  {data?.metrics && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-300">Executions</span>
                        <span className="text-xs font-mono">{data.metrics.executionCount}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-300">Avg Duration</span>
                        <span className="text-xs font-mono">{data.metrics.avgDuration}ms</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-300">Success Rate</span>
                        <span className={`text-xs font-mono ${
                          data.metrics.successRate > 90 ? 'text-green-400' :
                          data.metrics.successRate > 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {data.metrics.successRate}%
                        </span>
                      </div>
                    </>
                  )}

                  {data?.condition && (
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <span className="text-xs font-medium text-gray-300">Condition</span>
                      <pre className="text-xs font-mono text-amber-400 bg-gray-800 p-1 rounded mt-1">
                        {data.condition}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};