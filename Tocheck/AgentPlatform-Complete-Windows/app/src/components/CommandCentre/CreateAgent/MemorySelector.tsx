
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues } from './types';
import { Brain, Timer, Clock, FileText, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MemorySelectorProps {
  control: UseFormReturn<AgentFormValues>['control'];
  handleMemoryToggle: (memoryId: keyof AgentFormValues['memory'], checked: boolean) => void;
  formValues: AgentFormValues;
}

export const MemorySelector: React.FC<MemorySelectorProps> = ({
  handleMemoryToggle,
  formValues,
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
      icon: <Clock className="text-purple-400" size={24} />,
    },
    {
      id: 'summary',
      name: 'Summary Memory',
      description: 'Creates condensed versions of conversations for efficient recall.',
      icon: <FileText className="text-green-400" size={24} />,
    },
    {
      id: 'entity',
      name: 'Entity Memory',
      description: 'Tracks and remembers specific entities mentioned in conversations.',
      icon: <User className="text-amber-400" size={24} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-beam-blue" size={20} />
        <h3 className="text-lg font-medium text-white">Agent Recall</h3>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">
        Select the types of memory your agent will use to maintain context and state across interactions.
      </p>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        {memoryOptions.map((memory) => (
          <Card key={memory.id} className="bg-beam-dark-accent border-gray-700 text-white">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {memory.icon}
                <CardTitle className="text-md">{memory.name}</CardTitle>
              </div>
              <Switch
                checked={formValues.memory[memory.id as keyof AgentFormValues['memory']]}
                onCheckedChange={(checked) => 
                  handleMemoryToggle(memory.id as keyof AgentFormValues['memory'], checked)
                }
                className="data-[state=checked]:bg-beam-blue"
              />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription className="text-gray-400">
                {memory.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
