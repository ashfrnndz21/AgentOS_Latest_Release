import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Users, Network, Eye, Activity } from 'lucide-react';
import { A2AConfiguration } from './types';

interface A2AConfigurationStepProps {
  a2aConfig: A2AConfiguration;
  onA2AToggle: (enabled: boolean) => void;
  onCollaborationModeChange: (mode: 'orchestrator' | 'participant' | 'both') => void;
  onProtocolChange: (protocol: 'websocket' | 'rest' | 'both') => void;
  onDiscoveryScopeChange: (scope: 'local' | 'global' | 'custom') => void;
  onCustomAgentsChange: (agents: string[]) => void;
  onSettingToggle: (setting: keyof A2AConfiguration, value: boolean) => void;
}

export const A2AConfigurationStep: React.FC<A2AConfigurationStepProps> = ({
  a2aConfig,
  onA2AToggle,
  onCollaborationModeChange,
  onProtocolChange,
  onDiscoveryScopeChange,
  onCustomAgentsChange,
  onSettingToggle,
}) => {
  const [newAgent, setNewAgent] = React.useState('');

  const handleAddCustomAgent = () => {
    if (newAgent.trim() && !a2aConfig.custom_agents.includes(newAgent.trim())) {
      onCustomAgentsChange([...a2aConfig.custom_agents, newAgent.trim()]);
      setNewAgent('');
    }
  };

  const handleRemoveCustomAgent = (agent: string) => {
    onCustomAgentsChange(a2aConfig.custom_agents.filter(a => a !== agent));
  };

  return (
    <div className="space-y-6">
      {/* A2A Enable/Disable */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-400" />
            Agent-to-Agent (A2A) Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="a2a-enabled" className="text-white font-medium">
                Enable A2A Collaboration
              </Label>
              <p className="text-sm text-gray-400">
                Allow this agent to collaborate with other agents in the network
              </p>
            </div>
            <Switch
              id="a2a-enabled"
              checked={a2aConfig.enabled}
              onCheckedChange={onA2AToggle}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {a2aConfig.enabled && (
        <>
          {/* Collaboration Mode */}
          <Card className="bg-beam-dark/70 border border-gray-700/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                Collaboration Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Agent Role</Label>
                <Select
                  value={a2aConfig.collaboration_mode}
                  onValueChange={onCollaborationModeChange}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="participant" className="text-white hover:bg-gray-700">
                      Participant - Responds to requests from other agents
                    </SelectItem>
                    <SelectItem value="orchestrator" className="text-white hover:bg-gray-700">
                      Orchestrator - Coordinates and manages other agents
                    </SelectItem>
                    <SelectItem value="both" className="text-white hover:bg-gray-700">
                      Both - Can both coordinate and participate
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Max Concurrent Agents</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={a2aConfig.max_concurrent_agents}
                  onChange={(e) => onSettingToggle('max_concurrent_agents', parseInt(e.target.value))}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Communication Protocol */}
          <Card className="bg-beam-dark/70 border border-gray-700/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-400" />
                Communication Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Protocol Type</Label>
                <Select
                  value={a2aConfig.communication_protocol}
                  onValueChange={onProtocolChange}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="websocket" className="text-white hover:bg-gray-700">
                      WebSocket - Real-time bidirectional communication
                    </SelectItem>
                    <SelectItem value="rest" className="text-white hover:bg-gray-700">
                      REST API - HTTP-based communication
                    </SelectItem>
                    <SelectItem value="both" className="text-white hover:bg-gray-700">
                      Both - WebSocket + REST for maximum compatibility
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Agent Discovery */}
          <Card className="bg-beam-dark/70 border border-gray-700/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-400" />
                Agent Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Discovery Scope</Label>
                <Select
                  value={a2aConfig.discovery_scope}
                  onValueChange={onDiscoveryScopeChange}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="local" className="text-white hover:bg-gray-700">
                      Local - Only discover agents in the same network
                    </SelectItem>
                    <SelectItem value="global" className="text-white hover:bg-gray-700">
                      Global - Discover all available agents
                    </SelectItem>
                    <SelectItem value="custom" className="text-white hover:bg-gray-700">
                      Custom - Only collaborate with specified agents
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {a2aConfig.discovery_scope === 'custom' && (
                <div className="space-y-3">
                  <Label className="text-white">Custom Agents</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter agent name or ID"
                      value={newAgent}
                      onChange={(e) => setNewAgent(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAgent()}
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                    <Button
                      onClick={handleAddCustomAgent}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a2aConfig.custom_agents.map((agent) => (
                      <Badge
                        key={agent}
                        variant="secondary"
                        className="bg-gray-700 text-white hover:bg-gray-600"
                      >
                        {agent}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomAgent(agent)}
                          className="h-4 w-4 p-0 ml-2 hover:bg-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-beam-dark/70 border border-gray-700/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-registration" className="text-white font-medium">
                    Auto Registration
                  </Label>
                  <p className="text-sm text-gray-400">
                    Automatically register with the A2A agent registry
                  </p>
                </div>
                <Switch
                  id="auto-registration"
                  checked={a2aConfig.auto_registration}
                  onCheckedChange={(checked) => onSettingToggle('auto_registration', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="conversation-tracing" className="text-white font-medium">
                    Conversation Tracing
                  </Label>
                  <p className="text-sm text-gray-400">
                    Track and visualize agent-to-agent conversations
                  </p>
                </div>
                <Switch
                  id="conversation-tracing"
                  checked={a2aConfig.conversation_tracing}
                  onCheckedChange={(checked) => onSettingToggle('conversation_tracing', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="real-time-monitoring" className="text-white font-medium">
                    Real-time Monitoring
                  </Label>
                  <p className="text-sm text-gray-400">
                    Enable live monitoring of agent interactions
                  </p>
                </div>
                <Switch
                  id="real-time-monitoring"
                  checked={a2aConfig.real_time_monitoring}
                  onCheckedChange={(checked) => onSettingToggle('real_time_monitoring', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};





