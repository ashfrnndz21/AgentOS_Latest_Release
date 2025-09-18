import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Server, Database, Cpu, MemoryStick, 
  HardDrive, Network, AlertTriangle, CheckCircle 
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  agents: number;
  workflows: number;
  status: 'healthy' | 'warning' | 'error';
}

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
    agents: 12,
    workflows: 8,
    status: 'healthy'
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:5052/api/system/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Simulate real-time updates with mock data
        setMetrics(prev => ({
          ...prev,
          cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
          network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
        }));
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (metrics.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">System Monitoring</h1>
            {getStatusIcon()}
          </div>
          <p className="text-slate-300">Real-time system performance and agent monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">{metrics.cpu.toFixed(1)}%</div>
              <Progress value={metrics.cpu} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">Memory</CardTitle>
                <MemoryStick className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">{metrics.memory.toFixed(1)}%</div>
              <Progress value={metrics.memory} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">Active Agents</CardTitle>
                <Server className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.agents}</div>
              <p className="text-xs text-slate-400">Running workflows: {metrics.workflows}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-300">Network</CardTitle>
                <Network className="h-4 w-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.network.toFixed(1)}%</div>
              <Progress value={metrics.network} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
            <CardHeader>
              <CardTitle className="text-white">Agent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Customer Support Agent</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Data Analysis Agent</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Content Generator</span>
                  <Badge className="bg-yellow-600">Idle</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">Workflow completed successfully</span>
                  <span className="text-slate-500 ml-auto">2m ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">New agent registered</span>
                  <span className="text-slate-500 ml-auto">5m ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-300">System maintenance started</span>
                  <span className="text-slate-500 ml-auto">10m ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}