import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Users, Zap, Settings, Database, GitBranch, 
  Shield, Monitor, MessageSquare, Brain, X, Plus 
} from 'lucide-react';

interface AgentPaletteProps {
  onAddNode: (type: string, config: any) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const EnhancedAgentPalette: React.FC<AgentPaletteProps> = ({
  onAddNode,
  isVisible,
  onToggle
}) => {
  const [selectedCategory, setSelectedCategory] = useState('agents');

  const categories = {
    agents: {
      title: 'AI Agents',
      icon: Bot,
      items: [
        { id: 'ollama-agent', name: 'Ollama Agent', icon: Bot, description: 'Local LLM agent' },
        { id: 'openai-agent', name: 'OpenAI Agent', icon: Brain, description: 'GPT-powered agent' },
        { id: 'custom-agent', name: 'Custom Agent', icon: Settings, description: 'Configurable agent' }
      ]
    },
    tools: {
      title: 'Tools & Utilities',
      icon: Zap,
      items: [
        { id: 'data-processor', name: 'Data Processor', icon: Database, description: 'Process data' },
        { id: 'decision-node', name: 'Decision Node', icon: GitBranch, description: 'Route based on conditions' },
        { id: 'validator', name: 'Validator', icon: Shield, description: 'Validate inputs/outputs' }
      ]
    },
    human: {
      title: 'Human Interaction',
      icon: Users,
      items: [
        { id: 'human-input', name: 'Human Input', icon: Users, description: 'Collect user input' },
        { id: 'approval-gate', name: 'Approval Gate', icon: Shield, description: 'Require human approval' },
        { id: 'chat-interface', name: 'Chat Interface', icon: MessageSquare, description: 'Interactive chat' }
      ]
    },
    monitoring: {
      title: 'Monitoring',
      icon: Monitor,
      items: [
        { id: 'performance-monitor', name: 'Performance Monitor', icon: Monitor, description: 'Track performance' },
        { id: 'error-handler', name: 'Error Handler', icon: Shield, description: 'Handle errors' },
        { id: 'logger', name: 'Logger', icon: Database, description: 'Log activities' }
      ]
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed top-4 left-4 z-20"
      >
        <Plus className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-slate-600/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Agent Palette</h3>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="p-4 border-b border-slate-600/30">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(categories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="justify-start"
              >
                <IconComponent className="w-4 h-4 mr-2" />
                <span className="text-xs">{category.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {categories[selectedCategory as keyof typeof categories].items.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:border-purple-400/50 transition-colors"
                onClick={() => onAddNode(item.id, { name: item.name, type: item.id })}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-700/50 rounded">
                      <IconComponent className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-600/30">
        <div className="text-xs text-slate-400 text-center">
          Drag items to canvas or click to add
        </div>
      </div>
    </div>
  );
};