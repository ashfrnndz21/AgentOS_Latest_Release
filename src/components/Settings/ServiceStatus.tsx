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
      'enhanced_orchestration': 'Enhanced Orchestration',
      'a2a_observability': 'A2a Observability',
      'text_cleaning': 'Text Cleaning',
      'dynamic_context': 'Dynamic Context',
      'working_orchestration': 'Working Orchestration',
      'main_system_orchestrator': 'Main System Orchestrator',
      'utility_services': 'Utility Services'
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
      'strands_sdk': 'Strands SDK running (official-strands)',
      'a2a_service': 'A2A Service running (5 agents)',
      'agent_registry': 'Agent Registry is running',
      'enhanced_orchestration': 'Enhanced Orchestration running (Dynamic LLM Orchestration)',
      'a2a_observability': 'A2A Observability running (Traces)',
      'text_cleaning': 'Text Cleaning Service is not running',
      'dynamic_context': 'Dynamic Context Refinement is not running',
      'working_orchestration': 'Working Orchestration API is not running',
      'main_system_orchestrator': 'Main System Orchestrator running (Multi-agent orchestration)',
      'utility_services': 'Utility Services Gateway running (Database, Synthetic Data, Orchestration)'
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

  const groupServicesByCategory = () => {
    const categories = {
      'Core LLM Services': {
        services: ['ollama_core', 'ollama_api'],
        description: 'Core language model engine and API services'
      },
      'Agent Platform Services': {
        services: ['strands_sdk', 'strands_api', 'agent_registry'],
        description: 'Agent management and SDK services'
      },
      'Orchestration Services': {
        services: ['main_system_orchestrator', 'enhanced_orchestration', 'working_orchestration', 'chat_orchestrator'],
        description: 'Multi-agent orchestration and coordination'
      },
      'Communication Services': {
        services: ['a2a_service', 'a2a_observability'],
        description: 'Agent-to-agent communication and monitoring'
      },
      'Utility Services': {
        services: ['utility_services'],
        description: 'Database, synthetic data, and utility functions'
      },
      'Processing Services': {
        services: ['rag_api', 'text_cleaning', 'dynamic_context'],
        description: 'Text processing, RAG, and context refinement'
      }
    };

    return categories;
  };

  const overallStatus = getOverallStatus();
  const serviceCategories = groupServicesByCategory();

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

        {/* Individual Services - Grouped by Category */}
        <div className="space-y-6">
          {Object.entries(serviceCategories).map(([categoryName, categoryInfo]) => {
            const categoryServices = categoryInfo.services.filter(serviceKey => serviceStatus[serviceKey]);
            const runningInCategory = categoryServices.filter(serviceKey => serviceStatus[serviceKey]?.status === 'running').length;
            const totalInCategory = categoryServices.length;
            
            if (categoryServices.length === 0) return null;
            
            return (
              <div key={categoryName} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-800/40">
                  <div>
                    <h3 className="text-sm font-medium text-white">{categoryName}</h3>
                    <p className="text-xs text-gray-400">{categoryInfo.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      runningInCategory === totalInCategory 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : runningInCategory > 0
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {runningInCategory}/{totalInCategory} Running
                  </Badge>
                </div>
                
                {/* Services in Category */}
                <div className="space-y-2 ml-4">
                  {categoryServices.map((serviceKey) => {
                    const status = serviceStatus[serviceKey];
                    return (
                      <div key={serviceKey} className="p-3 rounded-lg border bg-gray-800/20">
                        <div className="flex items-start justify-between mb-2">
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
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Port:</span>
                            <span className="text-white font-mono">{status.port}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            <span className="text-gray-500">Status:</span> {status.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Information - Grouped by Category */}
        <div className="p-4 rounded-lg border bg-gray-800/20">
          <h4 className="text-sm font-medium text-white mb-3">Service Information by Category</h4>
          <div className="space-y-4">
            {Object.entries(serviceCategories).map(([categoryName, categoryInfo]) => {
              const categoryServices = categoryInfo.services.filter(serviceKey => serviceStatus[serviceKey]);
              if (categoryServices.length === 0) return null;
              
              return (
                <div key={categoryName} className="space-y-1">
                  <h5 className="text-xs font-medium text-blue-400">{categoryName}</h5>
                  <div className="space-y-1 text-xs text-gray-400 ml-2">
                    {categoryServices.map(serviceKey => {
                      const status = serviceStatus[serviceKey];
                      return (
                        <div key={serviceKey}>
                          • <strong>{getServiceDisplayName(serviceKey)}:</strong> {categoryInfo.description} (Port {status.port})
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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

