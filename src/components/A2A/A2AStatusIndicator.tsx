import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface A2AStatusIndicatorProps {
  isActive: boolean;
  agentsConnected: number;
  lastActivity?: string;
  status: 'idle' | 'processing' | 'success' | 'error';
}

export const A2AStatusIndicator: React.FC<A2AStatusIndicatorProps> = ({
  isActive,
  agentsConnected,
  lastActivity,
  status
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Activity className="h-4 w-4 animate-pulse text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        // Show green checkmark if connected, yellow clock if registered but not connected
        return agentsConnected > 0 ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-500 bg-blue-500/10';
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      default:
        // Show green if agents are connected, yellow if registered but not connected
        return agentsConnected > 0 ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 ${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="font-medium text-white">
                A2A System {isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-400">
                {agentsConnected > 0 ? `${agentsConnected} agents connected` : 'Agents registered but not connected'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Online' : 'Offline'}
            </Badge>
            {lastActivity && (
              <div className="text-xs text-gray-400">
                Last: {lastActivity}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};







