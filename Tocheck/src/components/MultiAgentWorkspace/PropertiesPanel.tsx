import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { 
  X, Bot, Settings, Shield, Database, Brain, Gavel, TrendingUp, Search, 
  Server, Globe, Zap, Code, Trash2, GitBranch, Users, Eye, MessageSquare 
} from 'lucide-react';
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
import { useUtilityConfiguration } from '@/hooks/useUtilityConfiguration';

interface PropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: any) => void;
  onClose: () => void;
  onOpenConfiguration?: (nodeId: string, nodeType: string) => void;
}

export const EnhancedPropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  node, 
  onUpdateNode, 
  onClose, 
  onOpenConfiguration 
}) => {
  const [localData, setLocalData] = useState(node.data);
  
  // Use utility configuration hook for persistence
  const { saveNodeConfiguration, getNodeConfiguration, isNodeConfigured: isUtilityConfigured } = useUtilityConfiguration();
  
  // Load saved configuration on component mount
  React.useEffect(() => {
    const savedConfig = getNodeConfiguration(node.id);
    if (savedConfig && savedConfig.config) {
      console.log('📂 Loading saved configuration for node:', node.id, savedConfig.config);
      setLocalData({ ...localData, ...savedConfig.config, isConfigured: savedConfig.isConfigured });
    }
  }, [node.id, getNodeConfiguration]);

  const updateLocalData = (field: string, value: any) => {
    console.log('🚀 UPDATE LOCAL DATA CALLED:', { field, value, nodeId: node.id });
    
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    
    // Update the node in the workflow immediately
    console.log('🔄 Calling onUpdateNode from updateLocalData...');
    onUpdateNode(node.id, newData);
    
    // Also save to persistent storage for immediate persistence
    const baseType = node.type.replace('strands-', '');
    console.log('💾 Calling saveNodeConfiguration from updateLocalData...');
    saveNodeConfiguration(node.id, baseType, newData, node.position);
    
    console.log('✅ Updated node data:', { nodeId: node.id, field, value, newData });
  };

  const getNodeIcon = () => {
    const baseType = node.type.replace('strands-', '');
    
    switch (baseType) {
      case 'agent': return <Bot className="h-5 w-5 text-blue-400" />;
      case 'decision': return <GitBranch className="h-5 w-5 text-yellow-400" />;
      case 'handoff': return <Users className="h-5 w-5 text-blue-400" />;
      case 'aggregator': return <Database className="h-5 w-5 text-purple-400" />;
      case 'monitor': return <Eye className="h-5 w-5 text-green-400" />;
      case 'human': return <MessageSquare className="h-5 w-5 text-orange-400" />;
      case 'memory': return <Brain className="h-5 w-5 text-green-400" />;
      case 'guardrail': return <Shield className="h-5 w-5 text-amber-400" />;
      default: return <Settings className="h-5 w-5 text-gray-400" />;
    }
  };

  const getNodeTitle = () => {
    const baseType = node.type.replace('strands-', '');
    
    switch (baseType) {
      case 'agent': return 'Agent Properties';
      case 'decision': return 'Decision Node';
      case 'handoff': return 'Handoff Node';
      case 'aggregator': return 'Aggregator Node';
      case 'monitor': return 'Monitor Node';
      case 'human': return 'Human Input Node';
      case 'memory': return 'Memory Node';
      case 'guardrail': return 'Guardrail Node';
      default: return `${baseType.charAt(0).toUpperCase() + baseType.slice(1)} Node`;
    }
  };

  // Decision Node Properties - Strands-aligned
  const renderDecisionProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || 'Decision'}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder="Enter decision node name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Evaluation Mode</Label>
        <Select 
          value={(localData.evaluationMode as string) || 'first_match'} 
          onValueChange={(value) => updateLocalData('evaluationMode', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="first_match">First Match</SelectItem>
            <SelectItem value="highest_priority">Highest Priority</SelectItem>
            <SelectItem value="all_conditions">All Conditions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Default Action</Label>
        <Select 
          value={(localData.defaultAction?.action as string) || 'route_to_human'} 
          onValueChange={(value) => updateLocalData('defaultAction', { ...localData.defaultAction, action: value })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="route_to_agent">Route to Agent</SelectItem>
            <SelectItem value="route_to_human">Route to Human</SelectItem>
            <SelectItem value="end_workflow">End Workflow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Configuration Status</Label>
        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-600">
          <div className={`w-2 h-2 rounded-full ${(localData.isConfigured || isUtilityConfigured(node.id)) ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span className="text-xs text-gray-300">
            {(localData.isConfigured || isUtilityConfigured(node.id)) ? 'Configured' : 'Needs Configuration'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Decision Conditions</Label>
        <div className="bg-gray-800 border border-gray-600 rounded p-3">
          <p className="text-xs text-gray-400 mb-2">
            {localData.config?.conditions?.length || 0} conditions defined
          </p>
          {localData.config?.conditions?.length > 0 ? (
            <div className="space-y-1">
              {localData.config.conditions.slice(0, 2).map((condition: any, index: number) => (
                <div key={index} className="text-xs text-gray-300 bg-gray-700 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {condition.field}
                    </Badge>
                    <span>{condition.operator}</span>
                    <span className="font-medium">"{condition.value}"</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    → {condition.action}: {condition.target}
                  </div>
                </div>
              ))}
              {localData.config.conditions.length > 2 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{localData.config.conditions.length - 2} more conditions
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No conditions configured</p>
          )}
        </div>
      </div>

      <Button 
        onClick={() => {
          console.log('🚀 BUTTON CLICKED: Edit Decision Logic');
          console.log('📊 Button click data:', { 
            nodeId: node.id, 
            nodeType: node.type, 
            onOpenConfiguration: typeof onOpenConfiguration,
            localData: localData 
          });
          
          const baseType = node.type.replace('strands-', '');
          console.log('🔧 Opening Decision configuration from Properties Panel', { nodeId: node.id, nodeType: node.type, baseType });
          
          if (onOpenConfiguration) {
            console.log('✅ Calling onOpenConfiguration...');
            onOpenConfiguration(node.id, baseType);
          } else {
            console.error('❌ onOpenConfiguration is not available!');
          }
        }}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2"
      >
        {localData.isConfigured ? 'Edit Decision Logic' : 'Configure Decision Logic'}
      </Button>
    </div>
  );

  // Handoff Node Properties - Strands-aligned
  const renderHandoffProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || 'Handoff'}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder="Enter handoff node name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Handoff Strategy</Label>
        <Select 
          value={(localData.strategy as string) || 'expertise_based'} 
          onValueChange={(value) => updateLocalData('strategy', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="expertise_based">Expertise Based</SelectItem>
            <SelectItem value="load_balanced">Load Balanced</SelectItem>
            <SelectItem value="round_robin">Round Robin</SelectItem>
            <SelectItem value="conditional">Conditional</SelectItem>
            <SelectItem value="manual">Manual Selection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Context Handling</Label>
        <Select 
          value={(localData.contextHandling?.preservation as string) || 'full'} 
          onValueChange={(value) => updateLocalData('contextHandling', { ...localData.contextHandling, preservation: value })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="full">Full Context</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="key_points">Key Points</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Fallback Strategy</Label>
        <Select 
          value={(localData.fallbackStrategy?.action as string) || 'route_to_human'} 
          onValueChange={(value) => updateLocalData('fallbackStrategy', { ...localData.fallbackStrategy, action: value })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="route_to_human">Route to Human</SelectItem>
            <SelectItem value="route_to_default">Route to Default</SelectItem>
            <SelectItem value="end_workflow">End Workflow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Target Agents</Label>
        <div className="bg-gray-800 border border-gray-600 rounded p-3">
          <p className="text-xs text-gray-400 mb-2">
            {localData.config?.targetAgents?.length || 0} target agents configured
          </p>
          {localData.config?.targetAgents?.length > 0 ? (
            <div className="space-y-1">
              {localData.config.targetAgents.slice(0, 3).map((agent: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <span className="text-xs text-gray-300">{agent.agentName || agent.agentId}</span>
                  {agent.weight && (
                    <Badge variant="outline" className="text-xs">
                      Weight: {agent.weight}
                    </Badge>
                  )}
                </div>
              ))}
              {localData.config.targetAgents.length > 3 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{localData.config.targetAgents.length - 3} more agents
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No target agents configured</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Timeout (seconds)</Label>
        <Input
          type="number"
          value={(localData.timeout as number) || 30}
          onChange={(e) => updateLocalData('timeout', parseInt(e.target.value))}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          min="1"
          max="300"
        />
      </div>

      <Button 
        onClick={() => {
          const baseType = node.type.replace('strands-', '');
          console.log('🔧 Opening Handoff configuration from Properties Panel', { nodeId: node.id, nodeType: node.type, baseType });
          onOpenConfiguration?.(node.id, baseType);
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
      >
        {localData.isConfigured ? 'Edit Handoff Logic' : 'Configure Handoff Logic'}
      </Button>
    </div>
  );

  // Aggregator Node Properties - Strands-aligned
  const renderAggregatorProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || 'Aggregator'}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder="Enter aggregator name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Aggregation Method</Label>
        <Select 
          value={(localData.aggregationMethod as string) || 'consensus'} 
          onValueChange={(value) => updateLocalData('aggregationMethod', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="consensus">Consensus</SelectItem>
            <SelectItem value="weighted_average">Weighted Average</SelectItem>
            <SelectItem value="best_response">Best Response</SelectItem>
            <SelectItem value="majority_vote">Majority Vote</SelectItem>
            <SelectItem value="ai_judge">AI Judge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Conflict Resolution</Label>
        <Select 
          value={(localData.conflictResolution as string) || 'highest_confidence'} 
          onValueChange={(value) => updateLocalData('conflictResolution', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="highest_confidence">Highest Confidence</SelectItem>
            <SelectItem value="highest_weight">Highest Weight</SelectItem>
            <SelectItem value="human_review">Human Review</SelectItem>
            <SelectItem value="ai_arbitration">AI Arbitration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Output Format</Label>
        <Select 
          value={(localData.outputFormat as string) || 'combined'} 
          onValueChange={(value) => updateLocalData('outputFormat', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="combined">Combined</SelectItem>
            <SelectItem value="ranked">Ranked</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Timeout (sec)</Label>
          <Input
            type="number"
            value={(localData.timeout as number) || 60}
            onChange={(e) => updateLocalData('timeout', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white text-sm"
            min="1"
            max="600"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Min Responses</Label>
          <Input
            type="number"
            value={(localData.minimumResponses as number) || 2}
            onChange={(e) => updateLocalData('minimumResponses', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white text-sm"
            min="1"
            max="10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Input Agents</Label>
        <div className="bg-gray-800 border border-gray-600 rounded p-3">
          <p className="text-xs text-gray-400 mb-2">
            {localData.config?.inputAgents?.length || 0} input agents configured
          </p>
          {localData.config?.inputAgents?.length > 0 ? (
            <div className="space-y-1">
              {localData.config.inputAgents.slice(0, 3).map((agent: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <span className="text-xs text-gray-300">{agent.agentName || agent.agentId}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {agent.weight}
                    </Badge>
                    {agent.required && (
                      <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {localData.config.inputAgents.length > 3 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{localData.config.inputAgents.length - 3} more agents
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No input agents configured</p>
          )}
        </div>
      </div>

      <Button 
        onClick={() => {
          console.log('🔧 Opening Aggregator configuration from Properties Panel');
          onOpenConfiguration?.(node.id, 'aggregator');
        }}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2"
      >
        {localData.isConfigured ? 'Edit Aggregator Logic' : 'Configure Aggregator Logic'}
      </Button>
    </div>
  );

  // Monitor Node Properties - Strands-aligned
  const renderMonitorProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || 'Monitor'}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder="Enter monitor name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Alerting Enabled</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={(localData.alerting?.enabled as boolean) || false}
            onCheckedChange={(checked) => updateLocalData('alerting', { ...localData.alerting, enabled: checked })}
          />
          <span className="text-xs text-gray-300">
            {localData.alerting?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Reporting Interval</Label>
          <Input
            type="number"
            value={(localData.reportingInterval as number) || 60}
            onChange={(e) => updateLocalData('reportingInterval', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white text-sm"
            min="1"
            max="3600"
          />
          <p className="text-xs text-gray-400">seconds</p>
        </div>
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Retention Period</Label>
          <Input
            type="number"
            value={(localData.retentionPeriod as number) || 30}
            onChange={(e) => updateLocalData('retentionPeriod', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white text-sm"
            min="1"
            max="365"
          />
          <p className="text-xs text-gray-400">days</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Metrics</Label>
        <div className="bg-gray-800 border border-gray-600 rounded p-3">
          <p className="text-xs text-gray-400 mb-2">
            {localData.config?.metrics?.length || 0} metrics configured
          </p>
          {localData.config?.metrics?.length > 0 ? (
            <div className="space-y-1">
              {localData.config.metrics.slice(0, 3).map((metric: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <span className="text-xs text-gray-300">{metric.name}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {metric.type}
                    </Badge>
                    {metric.threshold && (
                      <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400">
                        Threshold
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {localData.config.metrics.length > 3 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{localData.config.metrics.length - 3} more metrics
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No metrics configured</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Alert Channels</Label>
        <div className="bg-gray-800 border border-gray-600 rounded p-3">
          <p className="text-xs text-gray-400 mb-2">
            {localData.config?.alerting?.channels?.length || 0} channels configured
          </p>
          {localData.config?.alerting?.channels?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {localData.config.alerting.channels.slice(0, 4).map((channel: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {channel.type}
                </Badge>
              ))}
              {localData.config.alerting.channels.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{localData.config.alerting.channels.length - 4} more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No alert channels configured</p>
          )}
        </div>
      </div>

      <Button 
        onClick={() => {
          console.log('🔧 Opening Monitor configuration from Properties Panel');
          onOpenConfiguration?.(node.id, 'monitor');
        }}
        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
      >
        {localData.isConfigured ? 'Edit Monitor Logic' : 'Configure Monitor Logic'}
      </Button>
    </div>
  );

  // Human Node Properties - Strands-aligned
  const renderHumanProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || 'Human Input'}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder="Enter human node name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Input Type</Label>
        <Select 
          value={(localData.inputType as string) || 'text'} 
          onValueChange={(value) => updateLocalData('inputType', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="text">Text Input</SelectItem>
            <SelectItem value="choice">Multiple Choice</SelectItem>
            <SelectItem value="approval">Approval</SelectItem>
            <SelectItem value="file_upload">File Upload</SelectItem>
            <SelectItem value="custom_form">Custom Form</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Timeout Action</Label>
        <Select 
          value={(localData.timeoutAction as string) || 'continue_workflow'} 
          onValueChange={(value) => updateLocalData('timeoutAction', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="continue_workflow">Continue Workflow</SelectItem>
            <SelectItem value="end_workflow">End Workflow</SelectItem>
            <SelectItem value="route_to_fallback">Route to Fallback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Timeout (sec)</Label>
          <Input
            type="number"
            value={(localData.timeout as number) || 300}
            onChange={(e) => updateLocalData('timeout', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white text-sm"
            min="1"
            max="3600"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Required</Label>
          <div className="flex items-center gap-2 mt-2">
            <Switch
              checked={(localData.required as boolean) || false}
              onCheckedChange={(checked) => updateLocalData('required', checked)}
            />
            <span className="text-xs text-gray-300">
              {localData.required ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">User Prompt</Label>
        <Textarea
          value={(localData.prompt as string) || ''}
          onChange={(e) => updateLocalData('prompt', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm min-h-[60px]"
          placeholder="Enter the prompt to show to the user..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Choices</Label>
        <div className="bg-gray-800 border border-gray-600 rounded p-3">
          <p className="text-xs text-gray-400 mb-2">
            {localData.config?.choices?.length || 0} choices configured
          </p>
          {localData.config?.choices?.length > 0 ? (
            <div className="space-y-1">
              {localData.config.choices.slice(0, 3).map((choice: any, index: number) => (
                <div key={index} className="bg-gray-700 p-2 rounded">
                  <span className="text-xs text-gray-300">{choice.label}</span>
                  {choice.description && (
                    <p className="text-xs text-gray-500 mt-1">{choice.description}</p>
                  )}
                </div>
              ))}
              {localData.config.choices.length > 3 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{localData.config.choices.length - 3} more choices
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No choices configured</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Validation</Label>
        <div className="bg-gray-800 border border-gray-600 rounded p-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Min Length:</span>
              <span className="text-gray-300 ml-1">{localData.validation?.minLength || 'None'}</span>
            </div>
            <div>
              <span className="text-gray-400">Max Length:</span>
              <span className="text-gray-300 ml-1">{localData.validation?.maxLength || 'None'}</span>
            </div>
          </div>
          {localData.validation?.pattern && (
            <div className="mt-1 text-xs">
              <span className="text-gray-400">Pattern:</span>
              <span className="text-gray-300 ml-1 font-mono">{localData.validation.pattern}</span>
            </div>
          )}
        </div>
      </div>

      <Button 
        onClick={() => {
          console.log('🔧 Opening Human configuration from Properties Panel');
          onOpenConfiguration?.(node.id, 'human');
        }}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2"
      >
        {localData.isConfigured ? 'Edit Human Input' : 'Configure Human Input'}
      </Button>
    </div>
  );

  // Memory Node Properties - Strands-aligned
  const renderMemoryProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || 'Memory'}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder="Enter memory node name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Memory Type</Label>
        <Select 
          value={(localData.memoryType as string) || 'conversation'} 
          onValueChange={(value) => updateLocalData('memoryType', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="conversation">Conversation Memory</SelectItem>
            <SelectItem value="entity">Entity Memory</SelectItem>
            <SelectItem value="summary">Summary Memory</SelectItem>
            <SelectItem value="vector">Vector Memory</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Configuration Status</Label>
        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-600">
          <div className={`w-2 h-2 rounded-full ${(localData.isConfigured || isUtilityConfigured(node.id)) ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span className="text-xs text-gray-300">
            {(localData.isConfigured || isUtilityConfigured(node.id)) ? 'Configured' : 'Needs Configuration'}
          </span>
        </div>
      </div>

      <Button 
        onClick={() => {
          console.log('🔧 Opening Memory configuration from Properties Panel');
          onOpenConfiguration?.(node.id, 'memory');
        }}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2"
      >
        {localData.isConfigured ? 'Edit Memory Config' : 'Configure Memory'}
      </Button>
    </div>
  );

  // Guardrail Node Properties - Strands-aligned
  const renderGuardrailProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || 'Guardrail'}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder="Enter guardrail node name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Guardrail Type</Label>
        <Select 
          value={(localData.guardrailType as string) || 'content_filter'} 
          onValueChange={(value) => updateLocalData('guardrailType', value)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="content_filter">Content Filter</SelectItem>
            <SelectItem value="safety_check">Safety Check</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="rate_limit">Rate Limit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Configuration Status</Label>
        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-gray-600">
          <div className={`w-2 h-2 rounded-full ${(localData.isConfigured || isUtilityConfigured(node.id)) ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span className="text-xs text-gray-300">
            {(localData.isConfigured || isUtilityConfigured(node.id)) ? 'Configured' : 'Needs Configuration'}
          </span>
        </div>
      </div>

      <Button 
        onClick={() => {
          console.log('🔧 Opening Guardrail configuration from Properties Panel');
          onOpenConfiguration?.(node.id, 'guardrail');
        }}
        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2"
      >
        {localData.isConfigured ? 'Edit Guardrail Config' : 'Configure Guardrail'}
      </Button>
    </div>
  );

  // Agent Properties (existing)
  const renderAgentProperties = () => (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800">
        <TabsTrigger value="general" className="text-gray-300 data-[state=active]:text-white text-xs">General</TabsTrigger>
        <TabsTrigger value="tools" className="text-gray-300 data-[state=active]:text-white text-xs">Tools</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Agent Name</Label>
          <Input
            value={(localData.label as string) || ''}
            onChange={(e) => updateLocalData('label', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white text-sm"
            placeholder="Enter agent name"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Model</Label>
          <Select value={(localData.model as string) || 'gpt-4'} onValueChange={(value) => updateLocalData('model', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">System Prompt</Label>
          <Textarea
            value={(localData.systemPrompt as string) || ''}
            onChange={(e) => updateLocalData('systemPrompt', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white text-sm min-h-[80px]"
            placeholder="Define the agent's role and behavior..."
          />
        </div>
      </TabsContent>

      <TabsContent value="tools" className="space-y-3 mt-4">
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">MCP Tools ({((localData.mcpTools as MCPTool[]) || []).length})</Label>
          <p className="text-xs text-gray-400">Manage agent tools and capabilities</p>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {((localData.mcpTools as MCPTool[]) || []).length === 0 ? (
            <div className="text-center py-6">
              <Server className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No tools configured</p>
            </div>
          ) : (
            ((localData.mcpTools as MCPTool[]) || []).map((tool, index) => (
              <Card key={`${tool.serverId}-${tool.id}-${index}`} className="p-2 bg-gray-800 border-gray-700">
                <div className="flex items-start gap-2">
                  <Server className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white truncate">{tool.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{tool.description}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );

  // Default properties for unsupported types
  const renderDefaultProperties = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Node Name</Label>
        <Input
          value={(localData.label as string) || node.type}
          onChange={(e) => updateLocalData('label', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white text-sm"
          placeholder={`Enter ${node.type} name`}
        />
      </div>
      <div className="text-center text-gray-400 py-6">
        <p className="text-sm">Configuration for {node.type} nodes</p>
        <p className="text-xs mt-1">Coming soon</p>
      </div>
    </div>
  );

  const renderProperties = () => {
    console.log('🔍 Properties Panel - Node type:', node.type, 'Node data:', node.data);
    
    // Handle both regular and strands-prefixed node types
    const baseType = node.type.replace('strands-', '');
    
    switch (baseType) {
      case 'agent': return renderAgentProperties();
      case 'decision': return renderDecisionProperties();
      case 'handoff': return renderHandoffProperties();
      case 'aggregator': return renderAggregatorProperties();
      case 'monitor': return renderMonitorProperties();
      case 'human': return renderHumanProperties();
      case 'memory': return renderMemoryProperties();
      case 'guardrail': return renderGuardrailProperties();
      default: 
        console.log('⚠️ Using default properties for node type:', node.type, 'base type:', baseType);
        return renderDefaultProperties();
    }
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getNodeIcon()}
            <div>
              <h2 className="text-sm font-semibold text-white">{getNodeTitle()}</h2>
              <p className="text-xs text-gray-400">Node ID: {node.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderProperties()}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              console.log('🚀 BUTTON CLICKED: Save Changes');
              console.log('📊 Save button data:', { 
                nodeId: node.id, 
                nodeType: node.type, 
                localData: localData,
                onUpdateNode: typeof onUpdateNode,
                saveNodeConfiguration: typeof saveNodeConfiguration
              });
              
              // Update node data in the workflow
              console.log('🔄 Calling onUpdateNode...');
              onUpdateNode(node.id, localData);
              
              // Save to persistent storage
              const baseType = node.type.replace('strands-', '');
              console.log('💾 Calling saveNodeConfiguration...');
              saveNodeConfiguration(node.id, baseType, localData, node.position);
              
              console.log('✅ Configuration saved to localStorage', { nodeId: node.id, nodeType: node.type, config: localData });
            }} 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
          >
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-gray-600 text-gray-300 hover:bg-gray-800 text-sm py-2"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PropertiesPanel = EnhancedPropertiesPanel;