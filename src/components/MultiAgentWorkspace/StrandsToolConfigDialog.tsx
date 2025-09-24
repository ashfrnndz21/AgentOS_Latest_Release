import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Search, 
  Calculator, 
  Clock, 
  Plus, 
  Trash2,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ToolDetectionConfig {
  enabled: boolean;
  keywords: string[];
  responsePatterns: string[];
  description: string;
}

interface StrandsToolConfig {
  web_search: ToolDetectionConfig;
  calculator: ToolDetectionConfig;
  current_time: ToolDetectionConfig;
  [key: string]: ToolDetectionConfig;
}

interface ToolConfigurationSchema {
  name: string;
  description: string;
  category: string;
  configurable: boolean;
  configuration: Record<string, {
    type: 'text' | 'number' | 'boolean' | 'select' | 'array';
    default: any;
    description: string;
    options?: string[];
  }>;
}

interface StrandsToolConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: StrandsToolConfig) => void;
  initialConfig?: StrandsToolConfig;
  toolName?: string;
}

const defaultConfig: StrandsToolConfig = {
  web_search: {
    enabled: true,
    keywords: ['search', 'find', 'look up', 'google', 'web', 'what is', 'who is', 'when', 'where', 'how', 'latest', 'current'],
    responsePatterns: ['found information', 'summary:', 'source:', 'according to', 'search results'],
    description: 'Detects when the agent uses web search functionality'
  },
  calculator: {
    enabled: true,
    keywords: ['calculate', 'compute', 'math', '+', '-', '*', '/', '=', 'result'],
    responsePatterns: ['calculated', 'calculation', 'result is', 'equals', 'answer is'],
    description: 'Detects when the agent performs mathematical calculations'
  },
  current_time: {
    enabled: true,
    keywords: ['time', 'date', 'today', 'now', 'current'],
    responsePatterns: ['current time', 'time is', 'date is', 'today is', 'now is'],
    description: 'Detects when the agent retrieves current time/date information'
  },
  think: {
    enabled: true,
    keywords: ['think', 'analyze', 'reason', 'consider', 'reflect', 'ponder', 'contemplate', 'deliberate'],
    responsePatterns: ['thinking cycle', 'analysis:', 'reasoning:', 'reflection:', 'conclusion:', 'insight:'],
    description: 'Detects when the agent uses deep thinking and reasoning capabilities'
  },
  a2a_send_message: {
    enabled: true,
    keywords: ['send message', 'communicate', 'contact agent', 'message agent', 'agent communication'],
    responsePatterns: ['message sent', 'agent response', 'communication established', 'agent contacted'],
    description: 'Detects when the agent communicates with other A2A agents'
  },
  coordinate_agents: {
    enabled: true,
    keywords: ['coordinate', 'orchestrate', 'manage agents', 'multi-agent', 'collaboration'],
    responsePatterns: ['coordination complete', 'agents coordinated', 'task distributed', 'collaboration result'],
    description: 'Detects when the agent coordinates multiple agents for complex tasks'
  },
  file_read: {
    enabled: true,
    keywords: ['read', 'file', 'open', 'load', 'get file', 'file contents', 'read file'],
    responsePatterns: ['file contents', 'read successfully', 'file content of', 'opened file'],
    description: 'Detects when the agent reads files'
  },
  file_write: {
    enabled: true,
    keywords: ['write', 'save', 'file', 'create file', 'write to', 'save to', 'file write'],
    responsePatterns: ['successfully wrote', 'file saved', 'content written', 'file created'],
    description: 'Detects when the agent writes to files'
  },
  memory_store: {
    enabled: true,
    keywords: ['remember', 'store', 'save', 'memory', 'memorize', 'keep in mind'],
    responsePatterns: ['stored memory', 'remembered', 'saved to memory', 'memory stored'],
    description: 'Detects when the agent stores information in memory'
  },
  memory_retrieve: {
    enabled: true,
    keywords: ['recall', 'remember', 'memory', 'retrieve', 'get from memory', 'recall from'],
    responsePatterns: ['memory retrieved', 'recalled from memory', 'memory found', 'from memory'],
    description: 'Detects when the agent retrieves information from memory'
  },
  http_request: {
    enabled: true,
    keywords: ['http', 'request', 'api', 'call', 'fetch', 'get data', 'web request'],
    responsePatterns: ['http request', 'api call', 'request sent', 'response received'],
    description: 'Detects when the agent makes HTTP requests'
  },
  python_repl: {
    enabled: true,
    keywords: ['python', 'code', 'execute', 'run code', 'programming', 'script'],
    responsePatterns: ['code executed', 'python code', 'execution result', 'script run'],
    description: 'Detects when the agent executes Python code'
  },
  generate_image: {
    enabled: true,
    keywords: ['image', 'picture', 'generate', 'create image', 'draw', 'visual'],
    responsePatterns: ['image generated', 'picture created', 'visual generated', 'image created'],
    description: 'Detects when the agent generates images'
  },
  slack: {
    enabled: true,
    keywords: ['slack', 'message', 'send message', 'notify', 'chat', 'team message'],
    responsePatterns: ['slack message', 'message sent', 'notification sent', 'team notified'],
    description: 'Detects when the agent sends Slack messages'
  }
};

const StrandsToolConfigDialog: React.FC<StrandsToolConfigDialogProps> = ({
  open,
  onClose,
  onSave,
  initialConfig,
  toolName
}) => {
  const [config, setConfig] = useState<StrandsToolConfig>(initialConfig || defaultConfig);
  const [newKeyword, setNewKeyword] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('web_search');
  const [toolSchema, setToolSchema] = useState<ToolConfigurationSchema | null>(null);
  const [toolConfigValues, setToolConfigValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update config when initialConfig changes
  React.useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // Fetch tool configuration schema when dialog opens
  useEffect(() => {
    if (open && toolName) {
      fetchToolConfiguration(toolName);
    }
  }, [open, toolName]);

  const fetchToolConfiguration = async (tool: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5006/api/strands-sdk/tools/configuration/${tool}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch configuration: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setToolSchema(data.configuration);
        // Initialize config values with defaults
        const initialValues: Record<string, any> = {};
        Object.entries(data.configuration.configuration || {}).forEach(([key, config]: [string, any]) => {
          initialValues[key] = config.default;
        });
        setToolConfigValues(initialValues);
      } else {
        setError(data.error || 'Failed to load configuration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const updateToolConfigValue = (key: string, value: any) => {
    setToolConfigValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderConfigField = (key: string, fieldConfig: any) => {
    const value = toolConfigValues[key] ?? fieldConfig.default;
    
    switch (fieldConfig.type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => updateToolConfigValue(key, checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => updateToolConfigValue(key, newValue)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {fieldConfig.options?.map((option: string) => (
                <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateToolConfigValue(key, parseFloat(e.target.value) || 0)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        );
      
      case 'array':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add item..."
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const newArray = [...(value || []), input.value];
                    updateToolConfigValue(key, newArray);
                    input.value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {(value || []).map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                  {item}
                  <button
                    onClick={() => {
                      const newArray = value.filter((_: any, i: number) => i !== index);
                      updateToolConfigValue(key, newArray);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        );
      
      default: // text
        return (
          <Input
            value={value}
            onChange={(e) => updateToolConfigValue(key, e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        );
    }
  };

  const updateToolConfig = (toolName: string, updates: Partial<ToolDetectionConfig>) => {
    setConfig(prev => {
      const currentConfig = prev || defaultConfig;
      return {
        ...currentConfig,
        [toolName]: {
          ...currentConfig[toolName],
          ...updates
        }
      };
    });
  };

  const addKeyword = (toolName: string) => {
    if (newKeyword.trim() && config && config[toolName]) {
      updateToolConfig(toolName, {
        keywords: [...config[toolName].keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (toolName: string, keyword: string) => {
    if (config && config[toolName]) {
      updateToolConfig(toolName, {
        keywords: config[toolName].keywords.filter(k => k !== keyword)
      });
    }
  };

  const addPattern = (toolName: string) => {
    if (newPattern.trim() && config && config[toolName]) {
      updateToolConfig(toolName, {
        responsePatterns: [...config[toolName].responsePatterns, newPattern.trim()]
      });
      setNewPattern('');
    }
  };

  const removePattern = (toolName: string, pattern: string) => {
    if (config && config[toolName]) {
      updateToolConfig(toolName, {
        responsePatterns: config[toolName].responsePatterns.filter(p => p !== pattern)
      });
    }
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'web_search': return <Search className="h-4 w-4" />;
      case 'calculator': return <Calculator className="h-4 w-4" />;
      case 'current_time': return <Clock className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getToolDisplayName = (toolName: string) => {
    return toolName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-purple-400" />
            Configure Tool: {toolName || 'Unknown'}
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Official SDK
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-300">Loading tool configuration...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-300">Configuration Error</h4>
                  <p className="text-sm text-gray-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {toolSchema && !loading && !error && (
            <>
              {/* Tool Info */}
              <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {getToolIcon(toolName || '')}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{toolSchema.name}</h3>
                    <p className="text-sm text-gray-300">{toolSchema.description}</p>
                    <Badge variant="outline" className="mt-1 text-purple-400 border-purple-400">
                      {toolSchema.category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Configuration Section */}
              {toolSchema.configurable && Object.keys(toolSchema.configuration).length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Settings className="h-5 w-5 text-purple-400" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(toolSchema.configuration).map(([key, fieldConfig]) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-gray-300 font-medium">
                          {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <p className="text-sm text-gray-400">{fieldConfig.description}</p>
                        {renderConfigField(key, fieldConfig)}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {!toolSchema.configurable && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">This tool doesn't require configuration</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Dialog Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrandsToolConfigDialog;