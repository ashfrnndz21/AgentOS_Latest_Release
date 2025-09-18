import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { StrandsWorkflowFormValues, ReasoningPattern, StrandsModelOption } from '../types';
import { Brain, TreePine, RotateCcw, AlertTriangle, Layers, Lightbulb } from 'lucide-react';

interface StrandsReasoningPatternsProps {
  form: UseFormReturn<StrandsWorkflowFormValues>;
  handleReasoningPatternToggle: (pattern: string) => void;
  reasoningPatterns: ReasoningPattern[];
  selectedModel: StrandsModelOption | null;
}

const patternIcons = {
  chain_of_thought: Brain,
  tree_of_thought: TreePine,
  reflection: RotateCcw,
  self_critique: AlertTriangle,
  multi_step_reasoning: Layers,
  analogical_reasoning: Lightbulb
};

export const StrandsReasoningPatterns: React.FC<StrandsReasoningPatternsProps> = ({
  form,
  handleReasoningPatternToggle,
  reasoningPatterns,
  selectedModel
}) => {
  const { watch } = form;
  const selectedPatterns = watch('reasoning_patterns');

  const isPatternSupported = (patternId: string) => {
    return selectedModel?.reasoning_capabilities.includes(patternId) ?? false;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-600/20 rounded-full">
            <Brain size={32} className="text-purple-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">Reasoning Patterns</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Select the reasoning patterns your workflow will use for advanced problem-solving
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reasoningPatterns.map((pattern) => {
          const Icon = patternIcons[pattern.id as keyof typeof patternIcons] || Brain;
          const isSupported = isPatternSupported(pattern.id);
          const isSelected = selectedPatterns[pattern.id as keyof typeof selectedPatterns];

          return (
            <div
              key={pattern.id}
              className={`p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-900/20'
                  : isSupported
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  : 'border-gray-700 bg-gray-800/30 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={pattern.id}
                    checked={isSelected}
                    onCheckedChange={() => handleReasoningPatternToggle(pattern.id)}
                    disabled={!isSupported}
                    className="border-gray-500"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={isSelected ? 'text-purple-400' : 'text-gray-400'} />
                    <h4 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {pattern.name}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      pattern.complexity === 'basic' ? 'bg-green-900/30 text-green-300' :
                      pattern.complexity === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-red-900/30 text-red-300'
                    }`}>
                      {pattern.complexity}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{pattern.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {pattern.use_cases.slice(0, 2).map((useCase) => (
                      <span key={useCase} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {useCase}
                      </span>
                    ))}
                  </div>
                  {!isSupported && (
                    <p className="text-red-400 text-xs">
                      Not supported by selected model
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">💡 Reasoning Pattern Tips</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Start with Chain-of-Thought for basic step-by-step reasoning</li>
          <li>• Add Tree-of-Thought for complex planning and exploration</li>
          <li>• Enable Reflection for self-improvement and error correction</li>
          <li>• Use Self-Critique for quality assurance and validation</li>
        </ul>
      </div>
    </div>
  );
};