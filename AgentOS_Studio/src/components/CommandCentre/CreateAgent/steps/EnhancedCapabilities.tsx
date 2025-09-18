import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Lightbulb, 
  Zap
} from 'lucide-react';

interface SimpleCapabilities {
  conversation: {
    enabled: boolean;
    level: 'basic' | 'intermediate' | 'advanced';
  };
  analysis: {
    enabled: boolean;
    level: 'basic' | 'intermediate' | 'advanced';
  };
  creativity: {
    enabled: boolean;
    level: 'basic' | 'intermediate' | 'advanced';
  };
  reasoning: {
    enabled: boolean;
    level: 'basic' | 'intermediate' | 'advanced';
  };
}

interface SimpleCapabilitiesProps {
  capabilities: SimpleCapabilities;
  onUpdate: (capabilities: SimpleCapabilities) => void;
}

export const EnhancedCapabilities: React.FC<SimpleCapabilitiesProps> = ({
  capabilities,
  onUpdate
}) => {
  const updateCapability = (
    capabilityName: keyof SimpleCapabilities,
    updates: Partial<SimpleCapabilities[keyof SimpleCapabilities]>
  ) => {
    onUpdate({
      ...capabilities,
      [capabilityName]: {
        ...capabilities[capabilityName],
        ...updates
      }
    });
  };

  const capabilityIcons = {
    conversation: MessageSquare,
    analysis: BarChart3,
    creativity: Lightbulb,
    reasoning: Brain
  };

  const capabilityDescriptions = {
    conversation: 'Natural language interaction and communication',
    analysis: 'Data processing and analytical capabilities',
    creativity: 'Creative content generation',
    reasoning: 'Logical thinking and problem-solving'
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Agent Capabilities</h3>
        <p className="text-sm text-gray-400">
          Enable specific capabilities for your agent and set their performance level.
        </p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Core Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(capabilities).map(([capName, capConfig]) => {
            const IconComponent = capabilityIcons[capName as keyof typeof capabilityIcons];
            
            return (
              <div key={capName} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-purple-400" />
                  <div>
                    <Label className="text-sm font-medium text-white capitalize">{capName}</Label>
                    <p className="text-xs text-gray-400">
                      {capabilityDescriptions[capName as keyof typeof capabilityDescriptions]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={capConfig.enabled ? capConfig.level : 'disabled'}
                    onValueChange={(value) => {
                      if (value === 'disabled') {
                        updateCapability(capName as keyof SimpleCapabilities, { enabled: false, level: 'basic' });
                      } else {
                        updateCapability(capName as keyof SimpleCapabilities, { 
                          enabled: true, 
                          level: value as 'basic' | 'intermediate' | 'advanced' 
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Capabilities Summary */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-3">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Active Capabilities</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(capabilities).map(([name, config]) => (
              <div key={name}>
                <span className="text-blue-300 font-medium capitalize">{name}:</span>
                <div className="mt-1">
                  {config.enabled ? (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {config.level}
                    </Badge>
                  ) : (
                    <span className="text-gray-400 text-xs">Disabled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};