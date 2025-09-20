import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Server, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ServiceStatus {
  [key: string]: {
    status: 'running' | 'stopped' | 'error';
    port: number;
    message: string;
  };
}

export const ServiceStatus: React.FC = () => {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchServiceStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5011/api/resource-monitor/service-status');
      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch service status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceStatus();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchServiceStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'stopped':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Server className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'stopped':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'error':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getServiceDisplayName = (serviceKey: string) => {
    const displayNames: { [key: string]: string } = {
      'ollama_core': 'Ollama Core',
      'ollama_api': 'Ollama API',
      'rag_api': 'Rag API',
      'strands_api': 'Strands Api',
      'chat_orchestrator': 'Chat Orchestrator',
      'strands_sdk': 'Strands Sdk',
      'a2a_service': 'A2a Service',
      'agent_registry': 'Agent Registry',
      'enhanced_orchestration': 'Enhanced Orchestration'
    };
    return displayNames[serviceKey] || serviceKey.replace('_', ' ').toUpperCase();
  };

  const getServiceDescription = (serviceKey: string) => {
    const descriptions: { [key: string]: string } = {
      'ollama_core': 'Ollama Core is running',
      'ollama_api': 'Ollama API is running',
      'rag_api': 'RAG API is running',
      'strands_api': 'Strands API is running',
      'chat_orchestrator': 'Chat Orchestrator is running',
      'strands_sdk': 'Strands SDK running (mock-strands)',
      'a2a_service': 'A2A Service running (2 agents)',
      'agent_registry': 'Agent Registry is running',
      'enhanced_orchestration': 'Enhanced Orchestration running (Dynamic LLM Orchestration)'
    };
    return descriptions[serviceKey] || 'Backend service';
  };

  const getOverallStatus = () => {
    const statuses = Object.values(serviceStatus).map(s => s.status);
    const runningCount = statuses.filter(s => s === 'running').length;
    const totalCount = statuses.length;
    
    if (runningCount === totalCount) return 'all_healthy';
    if (runningCount > 0) return 'partial';
    return 'all_down';
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="bg-beam-dark/70 border border-gray-700/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-400" />
            Service Status
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Updated: {lastUpdate}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServiceStatus}
              disabled={loading}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="p-4 rounded-lg border bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Overall Status</span>
            <Badge 
              variant="outline" 
              className={
                overallStatus === 'all_healthy' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : overallStatus === 'partial'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }
            >
              {overallStatus === 'all_healthy' ? 'All Services Running' :
               overallStatus === 'partial' ? 'Some Services Down' : 'All Services Down'}
            </Badge>
          </div>
          <div className="text-xs text-gray-400">
            {Object.values(serviceStatus).filter(s => s.status === 'running').length} of {Object.keys(serviceStatus).length} services running
          </div>
        </div>

        {/* Individual Services */}
        <div className="space-y-3">
          {Object.entries(serviceStatus).map(([serviceKey, status]) => (
            <div key={serviceKey} className="p-4 rounded-lg border bg-gray-800/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <div className="text-sm font-medium text-white">
                      {getServiceDisplayName(serviceKey)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getServiceDescription(serviceKey)}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(status.status)}
                >
                  {status.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Port:</span>
                  <span className="text-white font-mono">{status.port}</span>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="text-gray-500">Status:</span> {status.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Information */}
        <div className="p-4 rounded-lg border bg-gray-800/20">
          <h4 className="text-sm font-medium text-white mb-2">Service Information</h4>
          <div className="space-y-1 text-xs text-gray-400">
            <div>• <strong>Ollama Core:</strong> LLM Engine (Port 11434)</div>
            <div>• <strong>Ollama API:</strong> Terminal & Agents (Port 5002)</div>
            <div>• <strong>RAG API:</strong> Document Chat (Port 5003)</div>
            <div>• <strong>Strands API:</strong> Intelligence & Reasoning (Port 5004)</div>
            <div>• <strong>Chat Orchestrator:</strong> Multi-Agent Chat (Port 5005)</div>
            <div>• <strong>Strands SDK:</strong> Individual Agent Analytics (Port 5006)</div>
            <div>• <strong>A2A Service:</strong> Agent-to-Agent Communication (Port 5008)</div>
            <div>• <strong>Strands Orchestration:</strong> Workflow Management (Port 5009)</div>
            <div>• <strong>Agent Registry:</strong> Agent Management (Port 5010)</div>
          </div>
        </div>

        {/* Troubleshooting */}
        {overallStatus !== 'all_healthy' && (
          <div className="p-4 rounded-lg border bg-yellow-500/10 border-yellow-500/30">
            <h4 className="text-sm font-medium text-yellow-400 mb-2">Troubleshooting</h4>
            <div className="space-y-1 text-xs text-gray-300">
              <div>• Check if all required dependencies are installed</div>
              <div>• Ensure no port conflicts with other applications</div>
              <div>• Restart services from the terminal if needed</div>
              <div>• Check system logs for detailed error messages</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

