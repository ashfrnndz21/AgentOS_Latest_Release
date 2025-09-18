import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Zap,
  Target,
  Shield
} from 'lucide-react';
import { networkAgents } from '../data/networkTwinData';

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  onDeploy?: (agentId: string) => void;
  onStop?: (agentId: string) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  isOpen,
  onClose,
  agentId,
  onDeploy,
  onStop
}) => {
  const agent = networkAgents.find(a => a.id === agentId);

  if (!agent) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4 text-green-500" />;
      case 'busy': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'idle': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'busy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'idle': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const handleAction = () => {
    if (agent.status === 'active' || agent.status === 'busy') {
      onStop?.(agentId);
    } else {
      onDeploy?.(agentId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-beam-dark border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
            {getStatusIcon(agent.status)}
            {agent.name}
            <Badge className={`ml-2 ${getStatusColor(agent.status)}`}>
              {agent.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Agent Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Agent Overview</h3>
              <p className="text-gray-300 mb-4">{agent.description}</p>
              
              {agent.currentTask && (
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm font-medium text-white">Current Task</span>
                  </div>
                  <p className="text-sm text-gray-300">{agent.currentTask}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Queued Tasks</div>
                  <div className="text-xl font-bold text-white">{agent.queuedTasks}</div>
                </div>
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                  <div className="text-sm text-gray-400">Last Deployed</div>
                  <div className="text-sm text-white">
                    {new Date(agent.lastDeployed).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm text-white">Accuracy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.metrics.accuracy} className="w-24" />
                    <span className="text-sm text-white">{agent.metrics.accuracy}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm text-white">Reliability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.metrics.reliability} className="w-24" />
                    <span className="text-sm text-white">{agent.metrics.reliability}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm text-white">Speed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.metrics.speed} className="w-24" />
                    <span className="text-sm text-white">{agent.metrics.speed}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm text-white">Coverage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={agent.metrics.coverage} className="w-24" />
                    <span className="text-sm text-white">{agent.metrics.coverage}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Deployment History */}
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Deployments</h3>
              <div className="space-y-3">
                {agent.deploymentHistory.map((deployment, index) => (
                  <div key={index} className="bg-beam-dark-accent/30 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-white">
                          {new Date(deployment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {deployment.duration}min
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300">{deployment.impact}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Capabilities & Actions */}
          <div className="space-y-6">
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Capabilities</h3>
              <div className="space-y-2">
                {agent.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-300">{capability}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleAction}
                  className={`w-full ${
                    agent.status === 'active' || agent.status === 'busy' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-ptt-blue hover:bg-blue-700'
                  }`}
                >
                  {agent.status === 'active' || agent.status === 'busy' ? 'Stop Agent' : 'Deploy Agent'}
                </Button>
                
                <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                  Configure Settings
                </Button>
                
                <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                  View Logs
                </Button>
                
                <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                  Download Report
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Deployments</span>
                  <span className="text-sm font-medium text-white">{agent.deploymentHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Success Rate</span>
                  <span className="text-sm font-medium text-white">
                    {Math.round((agent.deploymentHistory.filter(d => d.result === 'Success').length / agent.deploymentHistory.length) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Avg Duration</span>
                  <span className="text-sm font-medium text-white">
                    {Math.round(agent.deploymentHistory.reduce((acc, d) => acc + d.duration, 0) / agent.deploymentHistory.length)}min
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};