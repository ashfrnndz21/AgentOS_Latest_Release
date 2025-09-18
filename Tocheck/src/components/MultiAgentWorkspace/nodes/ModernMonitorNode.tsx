import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Eye, Settings, Activity, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MonitorNodeData {
  label: string;
  criteria: string[];
  description: string;
  color: string;
  status: 'idle' | 'active' | 'success' | 'error';
  config: {
    metricsCollection?: string[];
    alertThresholds?: Record<string, number>;
    reportingFrequency?: 'realtime' | 'minute' | 'hour' | 'day';
    retentionPeriod?: string;
  };
  metrics?: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeConnections: number;
  };
}

export const ModernMonitorNode: React.FC<NodeProps<MonitorNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState(data.metrics || {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    activeConnections: 0
  });

  // Simulate live metrics updates
  useEffect(() => {
    if (data.status === 'active') {
      const interval = setInterval(() => {
        setLiveMetrics(prev => ({
          responseTime: Math.max(0, prev.responseTime + (Math.random() - 0.5) * 20),
          throughput: Math.max(0, prev.throughput + (Math.random() - 0.5) * 5),
          errorRate: Math.max(0, Math.min(100, prev.errorRate + (Math.random() - 0.5) * 2)),
          activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 3))
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [data.status]);

  const getStatusColor = () => {
    switch (data.status) {
      case 'active': return 'border-cyan-400 shadow-cyan-400/50';
      case 'success': return 'border-green-400 shadow-green-400/50';
      case 'error': return 'border-red-400 shadow-red-400/50';
      default: return 'border-gray-600';
    }
  };

  const getMetricColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-400' : 'text-red-400';
  };

  return (
    <Card className={`
      w-[200px] h-[120px] bg-beam-dark border-2 transition-all duration-200
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-beam-blue shadow-lg' : ''}
      ${data.status === 'active' ? 'animate-pulse' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-cyan-400 border-2 border-white"
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg bg-gray-800 ${data.color} flex-shrink-0`}>
            <Eye className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{data.label}</h3>
            <p className="text-xs text-gray-400 truncate">Performance Monitor</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white flex-shrink-0"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Frequency & Alerts */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span className="text-xs text-gray-400">Frequency:</span>
          </div>
          <div className="px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-300 border border-cyan-500/30">
            {data.config?.reportingFrequency?.replace('realtime', 'live').replace('minute', 'min').replace('hour', 'hr') || 'live'}
          </div>
        </div>

        {/* Live Metrics (if active) */}
        {data.status === 'active' && (
          <div className="flex-1 mb-2">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="h-3 w-3 text-cyan-400" />
              <span className="text-xs text-gray-400">Live Metrics:</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">Response:</span>
                </div>
                <div className={`text-xs font-mono ${getMetricColor(liveMetrics.responseTime, 100, true)}`}>
                  {liveMetrics.responseTime.toFixed(0)}ms
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">Throughput:</span>
                </div>
                <div className={`text-xs font-mono ${getMetricColor(liveMetrics.throughput, 10)}`}>
                  {liveMetrics.throughput.toFixed(1)}/s
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${liveMetrics.errorRate > 5 ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <span className="text-xs text-gray-500">Errors:</span>
                </div>
                <div className={`text-xs font-mono ${liveMetrics.errorRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
                  {liveMetrics.errorRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Setup (if idle) */}
        {!data.status || data.status === 'idle' ? (
          <div className="flex-1 mb-2 overflow-hidden">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-400">Tracking:</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-300 border border-green-500/30">
                  Performance
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300 border border-orange-500/30">
                  Alerts
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Status with Health */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              data.status === 'active' ? 'bg-cyan-400 animate-pulse' :
              data.status === 'success' ? 'bg-green-400' :
              data.status === 'error' ? 'bg-red-400' :
              'bg-gray-500'
            }`} />
            <span className="text-xs text-gray-400">
              {data.status === 'active' ? 'Monitoring...' : 
               data.status === 'success' ? 'Healthy' :
               data.status === 'error' ? 'Alert' : 'Idle'}
            </span>
          </div>
          
          {data.status === 'active' && (
            <div className="flex items-center gap-1">
              {liveMetrics.errorRate > 5 && (
                <AlertCircle className="h-3 w-3 text-red-400 animate-pulse" />
              )}
              <span className="text-xs text-cyan-400 font-mono">
                {data.config?.retentionPeriod || '24h'}
              </span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-cyan-400 border-2 border-white"
      />
    </Card>
  );
};