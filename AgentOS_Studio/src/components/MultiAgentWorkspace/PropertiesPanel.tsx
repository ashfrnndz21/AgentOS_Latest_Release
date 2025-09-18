import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { X, Bot, Settings, Shield, Database, Brain, Gavel, TrendingUp, Search, Server, Globe, Zap, Code, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MCPTool } from '@/lib/services/MCPGatewayService';

interface PropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export const EnhancedPropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onUpdateNode, onClose }) => {
  const [localData, setLocalData] = useState(node.data);

  const handleSave = () => {
    onUpdateNode(node.id, localData);
  };

  const updateLocalData = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    // Update the node immediately for real-time feedback
    onUpdateNode(node.id, newData);
  };

  const getCategoryIcon = (category: MCPTool['category']) => {
    switch (category) {
      case 'aws': return Database;
      case 'git': return Code;
      case 'filesystem': return Server;
      case 'api': return Globe;
      case 'text': return Zap;
      default: return Settings;
    }
  };

  const removeMCPTool = (toolId: string, serverId: string) => {
    const currentMCPTools = (localData.mcpTools as MCPTool[]) || [];
    const updatedMCPTools = currentMCPTools.filter(t => !(t.id === toolId && t.serverId === serverId));
    updateLocalData('mcpTools', updatedMCPTools);
  };

  const renderAgentProperties = () => (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-beam-dark">
        <TabsTrigger value="general" className="text-gray-300 data-[state=active]:text-white text-xs">General</TabsTrigger>
        <TabsTrigger value="mcp-tools" className="text-gray-300 data-[state=active]:text-white text-xs">MCP Tools</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label className="text-white text-sm">Agent Name</Label>
          <Input
            value={(localData.label as string) || ''}
            onChange={(e) => updateLocalData('label', e.target.value)}
            className="bg-beam-dark border-gray-600 text-white text-sm"
            placeholder="Enter agent name"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white text-sm">Model</Label>
          <Select value={(localData.model as string) || 'gpt-4'} onValueChange={(value) => updateLocalData('model', value)}>
            <SelectTrigger className="bg-beam-dark border-gray-600 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-beam-dark border-gray-600">
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white text-sm">System Prompt</Label>
          <Textarea
            value={(localData.systemPrompt as string) || ''}
            onChange={(e) => updateLocalData('systemPrompt', e.target.value)}
            className="bg-beam-dark border-gray-600 text-white text-sm min-h-[80px]"
            placeholder="Define the agent's role and behavior..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white text-sm">Reasoning Strategy</Label>
          <Select value={(localData.reasoning as string) || 'chain-of-thought'} onValueChange={(value) => updateLocalData('reasoning', value)}>
            <SelectTrigger className="bg-beam-dark border-gray-600 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-beam-dark border-gray-600">
              <SelectItem value="chain-of-thought">Chain of Thought</SelectItem>
              <SelectItem value="tree-of-thought">Tree of Thought</SelectItem>
              <SelectItem value="reflection">Reflection</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-white text-sm">Enable Memory</Label>
          <Switch
            checked={(localData.memory as boolean) || false}
            onCheckedChange={(checked) => updateLocalData('memory', checked)}
          />
        </div>
      </TabsContent>

      <TabsContent value="mcp-tools" className="space-y-3 mt-4">
        <div className="space-y-2">
          <Label className="text-white text-sm">MCP Tools ({((localData.mcpTools as MCPTool[]) || []).length})</Label>
          <p className="text-xs text-gray-400">Drag tools from the palette or manage existing ones</p>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {((localData.mcpTools as MCPTool[]) || []).length === 0 ? (
            <div className="text-center py-6">
              <Server className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No MCP tools added</p>
              <p className="text-gray-500 text-xs mt-1">Drag tools from the MCP Tools tab</p>
            </div>
          ) : (
            ((localData.mcpTools as MCPTool[]) || []).map((tool, index) => {
              const IconComponent = getCategoryIcon(tool.category);
              return (
                <Card key={`${tool.serverId}-${tool.id}-${index}`} className="p-2 bg-beam-dark border-gray-700">
                  <div className="flex items-start gap-2">
                    <IconComponent className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <h4 className="text-xs font-medium text-white truncate">{tool.name}</h4>
                        {tool.verified && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-green-500/20 text-green-400 border-green-500/30">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{tool.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {tool.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {tool.serverName}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMCPTool(tool.id, tool.serverId)}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderMemoryProperties = () => (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-white text-sm">Memory Type</Label>
        <Select value={(localData.memoryType as string) || 'short-term'} onValueChange={(value) => updateLocalData('memoryType', value)}>
          <SelectTrigger className="bg-beam-dark border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-beam-dark border-gray-600">
            <SelectItem value="short-term">Short-term (Cache)</SelectItem>
            <SelectItem value="long-term">Long-term (Persistent)</SelectItem>
            <SelectItem value="episodic">Episodic (Events)</SelectItem>
            <SelectItem value="semantic">Semantic (Knowledge)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm">Memory Size (MB)</Label>
        <Input
          type="number"
          value={(localData.memorySize as number) || 100}
          onChange={(e) => updateLocalData('memorySize', parseInt(e.target.value))}
          className="bg-beam-dark border-gray-600 text-white text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm">Retention Period (Days)</Label>
        <Input
          type="number"
          value={(localData.retentionDays as number) || 30}
          onChange={(e) => updateLocalData('retentionDays', parseInt(e.target.value))}
          className="bg-beam-dark border-gray-600 text-white text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm">Agent Context</Label>
        <Input
          value={(localData.agentContext as string) || ''}
          onChange={(e) => updateLocalData('agentContext', e.target.value)}
          className="bg-beam-dark border-gray-600 text-white text-sm"
          placeholder="e.g., KYC, AML, Credit..."
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-white text-sm">Encryption</Label>
        <Switch
          checked={(localData.encryption as boolean) || true}
          onCheckedChange={(checked) => updateLocalData('encryption', checked)}
        />
      </div>
    </div>
  );

  const renderGuardrailProperties = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-white">Guardrail Type</Label>
        <Select value={(localData.guardrailType as string) || 'content-filter'} onValueChange={(value) => updateLocalData('guardrailType', value)}>
          <SelectTrigger className="bg-beam-dark border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-beam-dark border-gray-600">
            <SelectItem value="content-filter">Content Filter</SelectItem>
            <SelectItem value="pii-protection">PII Protection</SelectItem>
            <SelectItem value="bias-detection">Bias Detection</SelectItem>
            <SelectItem value="toxicity-check">Toxicity Check</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-white">Severity Level</Label>
        <Select value={(localData.severity as string) || 'medium'} onValueChange={(value) => updateLocalData('severity', value)}>
          <SelectTrigger className="bg-beam-dark border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-beam-dark border-gray-600">
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const getIcon = () => {
    switch (node.type) {
      case 'agent': return <Bot className="h-5 w-5 text-beam-blue" />;
      case 'memory': return <Database className="h-5 w-5 text-green-400" />;
      case 'guardrail': return <Shield className="h-5 w-5 text-amber-400" />;
      case 'compliance': return <Gavel className="h-5 w-5 text-amber-400" />;
      case 'risk': return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case 'audit': return <Search className="h-5 w-5 text-purple-400" />;
      default: return <Settings className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-60 bg-beam-dark-accent border-l border-gray-700 flex flex-col">
      <div className="p-2 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h2 className="text-sm font-semibold text-white">Properties</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Configure {node.type} settings</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {node.type === 'agent' && renderAgentProperties()}
        {node.type === 'memory' && renderMemoryProperties()}
        {node.type === 'guardrail' && renderGuardrailProperties()}
        {(node.type === 'compliance' || node.type === 'risk' || node.type === 'audit') && (
          <div className="text-center text-gray-400 py-6">
            <p className="text-sm">Banking-specific {node.type} configuration</p>
            <p className="text-xs mt-1">Advanced settings available in full version</p>
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-700">
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1 bg-beam-blue hover:bg-beam-blue/90 text-sm py-1">
            Save
          </Button>
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-beam-dark text-sm py-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PropertiesPanel = EnhancedPropertiesPanel;