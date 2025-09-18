import React from 'react';
import { Brain, Timer, Clock, FileText, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SimpleMemorySelectorProps {
  handleMemoryToggle: (memoryId: string, checked: boolean) => void;
  memory: {
    shortTerm: boolean;
    longTerm: boolean;
    summary: boolean;
    entity: boolean;
  };
}

export const SimpleMemorySelector: React.FC<SimpleMemorySelectorProps> = ({
  handleMemoryToggle,
  memory,
}) => {
  const memoryOptions = [
    {
      id: 'shortTerm',
      name: 'Short-Term Memory',
      description: 'Stores recent interactions for immediate context within a conversation.',
      icon: <Timer className="text-blue-400" size={24} />,
    },
    {
      id: 'longTerm',
      name: 'Long-Term Memory',
      description: 'Preserves information across multiple sessions for persistent knowledge.',
      icon: <Clock className="text-green-400" size={24} />,
    },
    {
      id: 'summary',
      name: 'Summary Memory',
      description: 'Creates condensed summaries of conversations for efficient storage.',
      icon: <FileText className="text-yellow-400" size={24} />,
    },
    {
      id: 'entity',
      name: 'Entity Memory',
      description: 'Tracks and remembers specific entities, people, and relationships.',
      icon: <User className="text-purple-400" size={24} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-beam-blue" size={24} />
        <h3 className="text-white text-lg font-medium">Memory Configuration</h3>
      </div>
      
      <div className="grid gap-4">
        {memoryOptions.map((option) => (
          <Card key={option.id} className="bg-beam-dark border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {option.icon}
                  <div>
                    <CardTitle className="text-white text-base">{option.name}</CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={option.id}
                    checked={memory[option.id as keyof typeof memory]}
                    onCheckedChange={(checked) => handleMemoryToggle(option.id, checked)}
                  />
                  <Label htmlFor={option.id} className="sr-only">
                    {option.name}
                  </Label>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};