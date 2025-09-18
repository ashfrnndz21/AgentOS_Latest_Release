import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { StrandsWorkflowFormValues, StrandsTool } from '../types';
import { Shield, Zap, Database, MessageSquare, CheckCircle, Brain } from 'lucide-react';

interface StrandsToolsGuardrailsProps {
  form: UseFormReturn<StrandsWorkflowFormValues>;
  handleToolToggle: (toolId: string) => void;
  strandsTools: StrandsTool[];
}

const toolCategoryIcons = {
  reasoning: Brain,
  data: Database,
  communication: MessageSquare,
  validation: CheckCircle,
  memory: Database
};

const guardrailOptions = [
  {
    id: 'content_filter',
    name: 'Content Filter',
    description: 'Filter inappropriate or harmful content',
    icon: Shield
  },
  {
    id: 'reasoning_validator',
    name: 'Reasoning Validator',
    description: 'Validate logical consistency of reasoning',
    icon: CheckCircle
  },
  {
    id: 'output_sanitizer',
    name: 'Output Sanitizer',
    description: 'Clean and format output for safety',
    icon: Shield
  },
  {
    id: 'ethical_constraints',
    name: 'Ethical Constraints',
    description: 'Enforce ethical guidelines and constraints',
    icon: Shield
  }
];

export const StrandsToolsGuardrails: React.FC<StrandsToolsGuardrailsProps> = ({
  form,
  handleToolToggle,
  strandsTools
}) => {
  const { watch, setValue } = form;
  const selectedTools = watch('tools');
  const guardrails = watch('guardrails');

  const handleGuardrailToggle = (guardrailId: string) => {
    const newGuardrails = {
      ...guardrails,
      [guardrailId]: !guardrails[guardrailId as keyof typeof guardrails]
    };
    setValue('guardrails', newGuardrails);
  };

  const toolsByCategory = strandsTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, StrandsTool[]>);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-red-600/20 rounded-full">
            <Shield size={32} className="text-red-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">Tools & Guardrails</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Select specialized tools and configure safety guardrails for your workflow
        </p>
      </div>

      {/* Tools Section */}
      <div className="space-y-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Zap size={18} />
          Specialized Tools
        </h4>
        
        {Object.entries(toolsByCategory).map(([category, tools]) => {
          const CategoryIcon = toolCategoryIcons[category as keyof typeof toolCategoryIcons] || Zap;
          
          return (
            <div key={category} className="space-y-3">
              <h5 className="text-gray-300 font-medium flex items-center gap-2 capitalize">
                <CategoryIcon size={16} />
                {category.replace('_', ' ')} Tools
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tools.map((tool) => {
                  const isSelected = selectedTools.includes(tool.id);
                  
                  return (
                    <div
                      key={tool.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={tool.id}
                          checked={isSelected}
                          onCheckedChange={() => handleToolToggle(tool.id)}
                          className="border-gray-500 mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <h6 className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {tool.name}
                          </h6>
                          <p className="text-gray-400 text-xs">{tool.description}</p>
                          {tool.reasoning_integration && (
                            <div className="flex items-center gap-1 text-xs text-purple-400">
                              <Brain size={10} />
                              <span>Reasoning Integration</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guardrails Section */}
      <div className="space-y-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Shield size={18} />
          Safety Guardrails
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guardrailOptions.map((guardrail) => {
            const Icon = guardrail.icon;
            const isSelected = guardrails[guardrail.id as keyof typeof guardrails];
            
            return (
              <div
                key={guardrail.id}
                className={`p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={guardrail.id}
                    checked={isSelected}
                    onCheckedChange={() => handleGuardrailToggle(guardrail.id)}
                    className="border-gray-500"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={isSelected ? 'text-red-400' : 'text-gray-400'} />
                      <h6 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {guardrail.name}
                      </h6>
                    </div>
                    <p className="text-gray-400 text-sm">{guardrail.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
        <h4 className="text-red-300 font-medium mb-2">🛡️ Safety & Performance Tips</h4>
        <ul className="text-red-200 text-sm space-y-1">
          <li>• Enable all guardrails for production workflows</li>
          <li>• Reasoning Validator ensures logical consistency</li>
          <li>• Content Filter prevents harmful outputs</li>
          <li>• Specialized tools enhance reasoning capabilities</li>
          <li>• Memory tools improve context retention</li>
        </ul>
      </div>
    </div>
  );
};