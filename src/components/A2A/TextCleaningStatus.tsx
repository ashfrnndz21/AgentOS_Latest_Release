import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Settings,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { textCleaningService, CleaningStats } from '@/lib/services/textCleaningService';

interface TextCleaningStatusProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export const TextCleaningStatus: React.FC<TextCleaningStatusProps> = ({
  enabled = true,
  onToggle,
  className = ''
}) => {
  const [isHealthy, setIsHealthy] = useState<boolean>(false);
  const [stats, setStats] = useState<CleaningStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const healthy = await textCleaningService.isHealthy();
      setIsHealthy(healthy);
      
      if (healthy) {
        const cleaningStats = await textCleaningService.getCleaningStats();
        setStats(cleaningStats);
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!enabled) return 'bg-gray-500';
    if (!isHealthy) return 'bg-red-500';
    if (stats && stats.cleaning_success_rate < 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!enabled) return 'Disabled';
    if (!isHealthy) return 'Unhealthy';
    if (stats && stats.cleaning_success_rate < 90) return 'Degraded';
    return 'Healthy';
  };

  const getStatusIcon = () => {
    if (!enabled) return <Settings className="h-4 w-4" />;
    if (!isHealthy) return <XCircle className="h-4 w-4" />;
    if (stats && stats.cleaning_success_rate < 90) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Text Cleaning Service</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={!isHealthy}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={checkHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          LLM-powered contextual formatting for agent outputs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-medium">{getStatusText()}</span>
            {getStatusIcon()}
          </div>
          {lastChecked && (
            <span className="text-xs text-muted-foreground">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Statistics */}
        {stats && enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Success Rate</span>
              </div>
              <div className="text-lg font-semibold">
                {(stats.cleaning_success_rate * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Avg Time</span>
              </div>
              <div className="text-lg font-semibold">
                {stats.average_cleaning_time.toFixed(2)}s
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Total Cleanings</span>
              </div>
              <div className="text-lg font-semibold">
                {stats.total_cleanings.toLocaleString()}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-muted-foreground">Characters</span>
              </div>
              <div className="text-lg font-semibold">
                {(stats.total_characters_processed / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
        )}

        {/* Service Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Model: qwen3:1.7b</span>
            <span>Port: 5019</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
