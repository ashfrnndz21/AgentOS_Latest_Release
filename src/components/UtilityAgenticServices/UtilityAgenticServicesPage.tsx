import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatabaseAgentInterface } from './components/DatabaseAgentInterface';
import { SyntheticDataInterface } from './components/SyntheticDataInterface';
import { UtilityOrchestrationMonitor } from './components/UtilityOrchestrationMonitor';
import { Database, FileText, Settings, Workflow, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthStatus {
  overall_status: string;
  services: {
    [key: string]: {
      name: string;
      url: string;
      status: string;
      response_time?: number;
      last_check: string;
    };
  };
  timestamp: string;
}

export const UtilityAgenticServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('database-agent');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthStatus();
    
    // Refresh health status every 30 seconds
    const interval = setInterval(loadHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHealthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5044/api/utility/health');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      } else {
        console.error('Failed to load health status:', response.status);
      }
    } catch (error) {
      console.error('Failed to load health status:', error);
      toast({
        title: "Health Check Failed",
        description: "Unable to connect to utility services",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'healthy' ? (
      <CheckCircle className="h-4 w-4 text-green-400" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-400" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'unhealthy':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="text-blue-400" />
              Utility Agentic Services
            </h1>
            <p className="text-gray-400 mt-2">
              Create and manage utility agents for database operations and data generation
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadHealthStatus}
            disabled={isLoading}
            className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        {/* Health Status */}
        {healthStatus && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="text-green-400" />
                System Status
                <span className={`text-sm font-normal ${getStatusColor(healthStatus.overall_status)}`}>
                  ({healthStatus.overall_status})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(healthStatus.services).map(([serviceName, service]) => (
                  <div key={serviceName} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {service.name}
                      </p>
                      <p className={`text-xs ${getStatusColor(service.status)}`}>
                        {service.status} {service.response_time && `(${(service.response_time * 1000).toFixed(0)}ms)`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {healthStatus.overall_status !== 'healthy' && (
                <Alert className="mt-4 border-yellow-500 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    Some utility services are not running properly. Please check the service status and restart if necessary.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="database-agent" className="data-[state=active]:bg-blue-600">
              <Database className="h-4 w-4 mr-2" />
              Database Agent
            </TabsTrigger>
            <TabsTrigger value="synthetic-data" className="data-[state=active]:bg-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              Synthetic Data Agent
            </TabsTrigger>
            <TabsTrigger value="orchestration" className="data-[state=active]:bg-blue-600">
              <Workflow className="h-4 w-4 mr-2" />
              Orchestration Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database-agent">
            <DatabaseAgentInterface />
          </TabsContent>

          <TabsContent value="synthetic-data">
            <SyntheticDataInterface />
          </TabsContent>

          <TabsContent value="orchestration">
            <UtilityOrchestrationMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
