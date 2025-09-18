import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Search, 
  Calculator, 
  Clock, 
  Plus, 
  Trash2,
  Info
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

interface StrandsToolConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: StrandsToolConfig) => void;
  initialConfig?: StrandsToolConfig;
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
  }
};

const StrandsToolConfigDialog: React.FC<StrandsToolConfigDialogProps> = ({
  open,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<StrandsToolConfig>(initialConfig || defaultConfig);
  const [newKeyword, setNewKeyword] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('web_search');

  // Update config when initialConfig changes
  React.useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSave = () => {
    onSave(config);
    onClose();
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
            Strands Tool Detection Configuration
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Official SDK
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-300">About Tool Detection</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Configure how the system detects when Strands agents use tools. This follows Strands SDK patterns 
                  where agents automatically invoke tools based on natural language, and we detect usage through 
                  keywords and response patterns.
                </p>
              </div>
            </div>
          </div>

          <Tabs value={selectedTool} onValueChange={setSelectedTool}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-600">
              {Object.keys(config || {}).map(toolName => (
                <TabsTrigger 
                  key={toolName} 
                  value={toolName} 
                  className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  {getToolIcon(toolName)}
                  {getToolDisplayName(toolName)}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(config || {}).map(([toolName, toolConfig]) => {
              if (!toolConfig) return null;
              
              return (
                <TabsContent key={toolName} value={toolName} className="space-y-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          {getToolIcon(toolName)}
                          {getToolDisplayName(toolName)} Configuration
                        </div>
                        <Switch
                          checked={toolConfig.enabled}
                          onCheckedChange={(enabled) => updateToolConfig(toolName, { enabled })}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`${toolName}-description`} className="text-gray-300">Description</Label>
                      <Textarea
                        id={`${toolName}-description`}
                        value={toolConfig.description}
                        onChange={(e) => updateToolConfig(toolName, { description: e.target.value })}
                        placeholder="Describe when this tool detection should trigger"
                        className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Input Keywords</Label>
                      <p className="text-sm text-gray-400 mb-2">
                        Keywords in user input that suggest this tool should be used
                      </p>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Add keyword..."
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword(toolName)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                        <Button onClick={() => addKeyword(toolName)} size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {toolConfig.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {keyword}
                            <button
                              onClick={() => removeKeyword(toolName, keyword)}
                              className="ml-1 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300">Response Patterns</Label>
                      <p className="text-sm text-gray-400 mb-2">
                        Patterns in agent responses that indicate this tool was used
                      </p>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newPattern}
                          onChange={(e) => setNewPattern(e.target.value)}
                          placeholder="Add response pattern..."
                          onKeyPress={(e) => e.key === 'Enter' && addPattern(toolName)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                        <Button onClick={() => addPattern(toolName)} size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {toolConfig.responsePatterns.map((pattern, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {pattern}
                            <button
                              onClick={() => removePattern(toolName, pattern)}
                              className="ml-1 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrandsToolConfigDialog;