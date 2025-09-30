import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react';

interface SystemMetrics {
  memory: {
    total_gb: number;
    used_gb: number;
    available_gb: number;
    percent_used: number;
    swap_used_gb: number;
    swap_total_gb: number;
  };
  cpu: {
    percent_used: number;
    load_average: number[];
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    percent_used: number;
  };
  timestamp: string;
}

interface ServiceStatus {
  [key: string]: {
    status: 'running' | 'stopped' | 'error';
    port: number;
    message: string;
  };
}

export const ResourceMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [metricsRes, servicesRes] = await Promise.all([
        fetch('http://localhost:5011/api/resource-monitor/metrics'),
        fetch('http://localhost:5011/api/resource-monitor/service-status')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServiceStatus(servicesData);
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'error': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🟢';
      case 'stopped': return '🔴';
      case 'error': return '🟡';
      default: return '⚪';
    }
  };

  if (!metrics) {
    return (
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Resource Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading system metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group services into categories for clearer display
  const getServiceCategories = () => {
    return {
      'Core LLM Services': ['ollama_core', 'ollama_api'],
      'Agent Platform Services': ['strands_sdk', 'strands_api', 'agent_registry'],
      'Orchestration Services': ['main_system_orchestrator', 'enhanced_orchestration', 'working_orchestration', 'chat_orchestrator'],
      'Communication Services': ['a2a_service', 'a2a_observability'],
      'Processing Services': ['rag_api', 'text_cleaning', 'dynamic_context'],
      'Utility Services': ['utility_services']
    } as { [category: string]: string[] };
  };

  return (
    <Card className="bg-beam-dark/70 border border-gray-700/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Resource Monitoring
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Last updated: {lastUpdate}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              disabled={loading}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Memory Usage</span>
            </div>
            <span className="text-sm text-gray-400">
              {metrics.memory.used_gb.toFixed(1)}GB / {metrics.memory.total_gb.toFixed(1)}GB
            </span>
          </div>
          <Progress 
            value={metrics.memory.percent_used} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{metrics.memory.percent_used.toFixed(1)}% used</span>
            <span>Swap: {metrics.memory.swap_used_gb.toFixed(1)}GB</span>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">CPU Usage</span>
            </div>
            <span className="text-sm text-gray-400">
              {metrics.cpu.percent_used.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={metrics.cpu.percent_used} 
            className="h-2"
          />
        </div>

        {/* Disk Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Disk Usage</span>
            </div>
            <span className="text-sm text-gray-400">
              {metrics.disk.used_gb.toFixed(1)}GB / {metrics.disk.total_gb.toFixed(1)}GB
            </span>
          </div>
          <Progress 
            value={metrics.disk.percent_used} 
            className="h-2"
          />
          <div className="text-xs text-gray-400">
            {metrics.disk.percent_used.toFixed(1)}% used
          </div>
        </div>

        {/* Service Status - Grouped by Category */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Service Status</h4>
          {Object.entries(getServiceCategories()).map(([category, services]) => {
            const present = services.filter(s => !!serviceStatus[s]);
            if (present.length === 0) return null;
            const running = present.filter(s => serviceStatus[s].status === 'running').length;
            const total = present.length;
            const badgeColor = running === total ? 'bg-green-500' : running > 0 ? 'bg-yellow-500' : 'bg-red-500';
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-blue-400">{category}</div>
                  <Badge variant="outline" className={`text-[10px] ${badgeColor} text-white border-0`}>
                    {running}/{total} running
                  </Badge>
                </div>
                <div className="space-y-1">
                  {present.map((service) => {
                    const status = serviceStatus[service];
                    return (
                      <div key={service} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStatusIcon(status.status)}</span>
                          <span className="text-sm text-white capitalize">{service.replace('_', ' ')}</span>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(status.status)} text-white border-0`}>
                            {status.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Port {status.port}</div>
                          <div className="text-xs text-gray-500 max-w-48 truncate">{status.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

