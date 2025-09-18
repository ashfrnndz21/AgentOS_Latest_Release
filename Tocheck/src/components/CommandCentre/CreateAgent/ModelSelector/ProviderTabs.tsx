
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProviderTabsProps {
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
}

export const ProviderTabs: React.FC<ProviderTabsProps> = ({
  selectedProvider,
  handleProviderChange,
}) => {
  return (
    <Tabs 
      defaultValue={selectedProvider} 
      value={selectedProvider}
      onValueChange={handleProviderChange}
      className="w-full"
    >
      <TabsList className="bg-beam-dark w-full grid grid-cols-6 gap-1">
        <TabsTrigger 
          value="openai" 
          className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
        >
          OpenAI
        </TabsTrigger>
        <TabsTrigger 
          value="anthropic" 
          className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
        >
          Anthropic
        </TabsTrigger>
        <TabsTrigger 
          value="meta" 
          className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
        >
          Meta
        </TabsTrigger>
        <TabsTrigger 
          value="deepseek" 
          className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
        >
          DeepSeek
        </TabsTrigger>
        <TabsTrigger 
          value="amazon" 
          className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
        >
          Amazon
        </TabsTrigger>
        <TabsTrigger 
          value="ollama" 
          className="data-[state=active]:bg-green-500/30 data-[state=active]:text-green-400"
        >
          Ollama
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
