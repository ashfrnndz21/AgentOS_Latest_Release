import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Wrench, 
  Brain, 
  Shield, 
  Database, 
  Code, 
  Search, 
  Calculator, 
  Globe,
  FileText,
  MessageSquare
} from 'lucide-react';

interface Capabilities {
  tools: string[];
  memory: {
    shortTerm: boolean;
    longTerm: boolean;
    summary: boolean;
    entity: boolean;
  };
  guardrails: {
    global: boolean;
    local: boolean;
  };
}

interface AgentCapabilitiesProps {
  capabilities: Capabilities;
  databaseAccess: boolean;
  onUpdate: (capabilities: Capabilities, databaseAccess: boolean) => void;
}

const availableTools = [
  { id: 'http_request', name: 'HTTP Request', description: 'Make HTTP requests to web APIs', icon: Search },
  { id: 'code_execution', name: 'Code Execution', description: 'Execute Python code and scripts', icon: Code },
  { id: 'calculator', name: 'Calculator', description: 'Perform mathematical calculations', icon: Calculator },
  { id: 'file_read', name: 'File Read', description: 'Read files from the system', icon: FileText },
  { id: 'file_write', name: 'File Write', description: 'Write files to the system', icon: FileText },
  { id: 'api_calls', name: 'API Calls', description: 'Make HTTP requests to external APIs', icon: Globe },
  { id: 'data_analysis', name: 'Data Analysis', description: 'Analyze and visualize data', icon: Database },
  { id: 'text_processing', name: 'Text Processing', description: 'Advanced text manipulation', icon: MessageSquare }
];

export const AgentCapabilities: React.FC<AgentCapabilitiesProps> = ({
  capabilities,
  databaseAccess,
  onUpdate
}) => {
  const handleToolToggle = (toolId: string, enabled: boolean) => {
    const newTools = enabled
      ? [...capabilities.tools, toolId]
      : capabilities.tools.filter(id => id !== toolId);
    
    onUpdate({
      ...capabilities,
      tools: newTools
    }, databaseAccess);
  };

  const handleMemoryToggle = (memoryType: keyof Capabilities['memory'], enabled: boolean) => {
    onUpdate({
      ...capabilities,
      memory: {
        ...capabilities.memory,
        [memoryType]: enabled
      }
    }, databaseAccess);
  };

  const handleGuardrailToggle = (guardrailType: keyof Capabilities['guardrails'], enabled: boolean) => {
    onUpdate({
      ...capabilities,
      guardrails: {
        ...capabilities.guardrails,
        [guardrailType]: enabled
      }
    }, databaseAccess);
  };

  const handleDatabaseToggle = (enabled: boolean) => {
    onUpdate(capabilities, enabled);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Agent Capabilities</h3>
        <p className="text-sm text-gray-400">
          Configure the tools, memory, and security features for your agent.
        </p>
      </div>

      {/* Tools Configuration */}
      <Card className="bg-beam-dark-accent border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <Wrench className="h-4 w-4" />
            Available Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTools.map((tool) => {
              const IconComponent = tool.icon;
              const isEnabled = capabilities.tools.includes(tool.id);
              
              return (
                <div
                  key={tool.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isEnabled
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-white">{tool.name}</span>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToolToggle(tool.id, checked)}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{tool.description}</p>
                </div>
              );
            })}
          </div>
          
          {capabilities.tools.length > 0 && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Wrench className="h-4 w-4" />
                <span className="font-medium">Selected Tools</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {capabilities.tools.map((toolId) => {
                  const tool = availableTools.find(t => t.id === toolId);
                  return tool ? (
                    <Badge key={toolId} className="bg-green-600 text-white text-xs">
                      {tool.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Configuration */}
      <Card className="bg-beam-dark-accent border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <Brain className="h-4 w-4" />
            Memory Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Short-term Memory</Label>
                <p className="text-xs text-gray-400">Remember recent conversation context</p>
              </div>
              <Switch
                checked={capabilities.memory.shortTerm}
                onCheckedChange={(checked) => handleMemoryToggle('shortTerm', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Long-term Memory</Label>
                <p className="text-xs text-gray-400">Persistent memory across sessions</p>
              </div>
              <Switch
                checked={capabilities.memory.longTerm}
                onCheckedChange={(checked) => handleMemoryToggle('longTerm', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Summary Memory</Label>
                <p className="text-xs text-gray-400">Summarize long conversations</p>
              </div>
              <Switch
                checked={capabilities.memory.summary}
                onCheckedChange={(checked) => handleMemoryToggle('summary', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Entity Memory</Label>
                <p className="text-xs text-gray-400">Remember people, places, and things</p>
              </div>
              <Switch
                checked={capabilities.memory.entity}
                onCheckedChange={(checked) => handleMemoryToggle('entity', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Guardrails */}
      <Card className="bg-beam-dark-accent border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <Shield className="h-4 w-4" />
            Security & Guardrails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Global Guardrails</Label>
                <p className="text-xs text-gray-400">Apply system-wide safety measures</p>
              </div>
              <Switch
                checked={capabilities.guardrails.global}
                onCheckedChange={(checked) => handleGuardrailToggle('global', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Local Guardrails</Label>
                <p className="text-xs text-gray-400">Agent-specific safety rules</p>
              </div>
              <Switch
                checked={capabilities.guardrails.local}
                onCheckedChange={(checked) => handleGuardrailToggle('local', checked)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div>
              <Label className="text-white font-medium">Database Access</Label>
              <p className="text-xs text-gray-400">Allow agent to access database resources</p>
            </div>
            <Switch
              checked={databaseAccess}
              onCheckedChange={handleDatabaseToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-3">
            <Brain className="h-4 w-4" />
            <span className="font-medium">Capabilities Summary</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-300 font-medium">Tools:</span>
              <div className="mt-1">
                {capabilities.tools.length > 0 ? (
                  <span className="text-white">{capabilities.tools.length} selected</span>
                ) : (
                  <span className="text-gray-400">None selected</span>
                )}
              </div>
            </div>
            
            <div>
              <span className="text-blue-300 font-medium">Memory:</span>
              <div className="mt-1">
                {Object.values(capabilities.memory).some(Boolean) ? (
                  <span className="text-white">
                    {Object.values(capabilities.memory).filter(Boolean).length} types enabled
                  </span>
                ) : (
                  <span className="text-gray-400">Basic memory only</span>
                )}
              </div>
            </div>
            
            <div>
              <span className="text-blue-300 font-medium">Security:</span>
              <div className="mt-1">
                <span className="text-white">
                  {capabilities.guardrails.global ? 'Global' : ''}
                  {capabilities.guardrails.global && capabilities.guardrails.local ? ' + ' : ''}
                  {capabilities.guardrails.local ? 'Local' : ''}
                  {!capabilities.guardrails.global && !capabilities.guardrails.local ? 'Basic' : ''} guardrails
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};