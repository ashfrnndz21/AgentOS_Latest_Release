import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Cpu, HardDrive, Wifi, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { StrandsOverviewProps } from '../types';

export const StrandsPerformanceView: React.FC<StrandsOverviewProps> = ({
  executionTrace,
  analytics,
  onNodeClick
}) => {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Cpu size={16} />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300 mb-1">45%</div>
            <div className="text-xs text-gray-400">Average across nodes</div>
            <Progress value={45} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <HardDrive size={16} />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300 mb-1">160MB</div>
            <div className="text-xs text-gray-400">Peak memory usage</div>
            <Progress value={62} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Wifi size={16} />
              Network Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-300 mb-1">28ms</div>
            <div className="text-xs text-gray-400">Average latency</div>
            <Progress value={28} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Zap size={16} />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-300 mb-1">1.4K</div>
            <div className="text-xs text-gray-400">Requests/second</div>
            <Progress value={70} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Node Performance Breakdown */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">
            Node Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(executionTrace.nodeExecutions.entries()).map(([nodeId, execution]) => (
              <div 
                key={nodeId}
                className="p-4 bg-gray-800/40 rounded border border-gray-700/30 cursor-pointer hover:bg-gray-800/60 transition-colors"
                onClick={() => onNodeClick?.(nodeId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{execution.nodeName}</h4>
                    <p className="text-gray-400 text-sm">{execution.nodeType}</p>
                  </div>
                  <Badge 
                    className={`${
                      execution.performance.errorRate === 0
                        ? 'bg-green-900/30 text-green-300 border-green-700/30'
                        : 'bg-red-900/30 text-red-300 border-red-700/30'
                    }`}
                  >
                    {execution.performance.errorRate === 0 ? 'Healthy' : 'Issues'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">CPU</div>
                    <div className="flex items-center gap-2">
                      <Progress value={execution.performance.cpuUsage} className="flex-1 h-1.5" />
                      <span className="text-xs text-white">{execution.performance.cpuUsage}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Memory</div>
                    <div className="flex items-center gap-2">
                      <Progress value={(execution.performance.memoryUsage / 512) * 100} className="flex-1 h-1.5" />
                      <span className="text-xs text-white">{execution.performance.memoryUsage}MB</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Latency</div>
                    <div className="flex items-center gap-2">
                      <Progress value={execution.performance.networkLatency} className="flex-1 h-1.5" />
                      <span className="text-xs text-white">{execution.performance.networkLatency}ms</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Throughput</div>
                    <div className="flex items-center gap-2">
                      <Progress value={(execution.performance.throughput / 3000) * 100} className="flex-1 h-1.5" />
                      <span className="text-xs text-white">{execution.performance.throughput}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <AlertTriangle size={20} />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-blue-400" />
                <span className="text-blue-300 font-medium">Optimize Token Usage</span>
              </div>
              <p className="text-gray-300 text-sm">
                Consider implementing context compression to reduce token consumption by ~15%
              </p>
            </div>
            
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Cpu size={16} className="text-green-400" />
                <span className="text-green-300 font-medium">Parallel Processing</span>
              </div>
              <p className="text-gray-300 text-sm">
                Independent tool operations could be parallelized to reduce execution time
              </p>
            </div>
            
            <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive size={16} className="text-purple-400" />
                <span className="text-purple-300 font-medium">Memory Optimization</span>
              </div>
              <p className="text-gray-300 text-sm">
                Context caching could reduce memory usage and improve handoff efficiency
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};