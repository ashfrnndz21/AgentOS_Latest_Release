import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { StrandsWorkflowFormValues, MemoryType } from '../types';
import { Database, Clock, BookOpen, Archive, Settings } from 'lucide-react';

interface StrandsMemoryConfigProps {
  form: UseFormReturn<StrandsWorkflowFormValues>;
  handleMemoryToggle: (memoryType: string) => void;
  memoryTypes: MemoryType[];
}

const memoryIcons = {
  working_memory: Clock,
  episodic_memory: BookOpen,
  semantic_memory: Database,
  memory_consolidation: Archive,
  context_window_management: Settings
};

export const StrandsMemoryConfig: React.FC<StrandsMemoryConfigProps> = ({
  form,
  handleMemoryToggle,
  memoryTypes
}) => {
  const { watch } = form;
  const selectedMemory = watch('memory');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-green-600/20 rounded-full">
            <Database size={32} className="text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">Memory Configuration</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Configure memory systems for context retention and knowledge consolidation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {memoryTypes.map((memory) => {
          const Icon = memoryIcons[memory.id as keyof typeof memoryIcons] || Database;
          const isSelected = selectedMemory[memory.id as keyof typeof selectedMemory];

          return (
            <div
              key={memory.id}
              className={`p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={memory.id}
                    checked={isSelected}
                    onCheckedChange={() => handleMemoryToggle(memory.id)}
                    className="border-gray-500"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={isSelected ? 'text-green-400' : 'text-gray-400'} />
                    <h4 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {memory.name}
                    </h4>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        memory.capacity === 'limited' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-green-900/30 text-green-300'
                      }`}>
                        {memory.capacity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        memory.persistence === 'session' ? 'bg-blue-900/30 text-blue-300' : 'bg-purple-900/30 text-purple-300'
                      }`}>
                        {memory.persistence}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{memory.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {memory.retrieval_methods.map((method) => (
                      <span key={method} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {method}
                      </span>
                    ))}
                  </div>
                  {memory.consolidation_support && (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <Archive size={12} />
                      <span>Supports consolidation</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
        <h4 className="text-green-300 font-medium mb-2">🧠 Memory System Recommendations</h4>
        <ul className="text-green-200 text-sm space-y-1">
          <li>• Working Memory: Essential for maintaining context during reasoning</li>
          <li>• Episodic Memory: Stores specific experiences and learning events</li>
          <li>• Semantic Memory: Builds long-term knowledge base</li>
          <li>• Memory Consolidation: Strengthens important memories over time</li>
          <li>• Context Window Management: Optimizes token usage for better performance</li>
        </ul>
      </div>
    </div>
  );
};