import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StrandsWorkflowFormValues } from '../types';
import { Brain, Zap, Target } from 'lucide-react';

interface StrandsBasicInfoProps {
  form: UseFormReturn<StrandsWorkflowFormValues>;
}

export const StrandsBasicInfo: React.FC<StrandsBasicInfoProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-600/20 rounded-full">
            <Brain size={32} className="text-purple-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">Strands Agentic Workflow</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Create an advanced reasoning workflow with multi-step thinking, reflection, and memory consolidation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Zap size={16} className="text-yellow-400" />
          <span>Advanced Reasoning</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Target size={16} className="text-green-400" />
          <span>Multi-Step Planning</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Brain size={16} className="text-purple-400" />
          <span>Memory Consolidation</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Workflow Name *
          </Label>
          <Input
            id="name"
            {...register('name', { required: 'Workflow name is required' })}
            placeholder="e.g., Strategic Analysis Workflow"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          {errors.name && (
            <p className="text-red-400 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">
            Description
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe what this workflow will accomplish and its reasoning approach..."
            rows={4}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
          />
          <p className="text-gray-500 text-xs">
            Provide context about the workflow's purpose and expected reasoning patterns
          </p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">🧠 What makes Strands special?</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Chain-of-thought and tree-of-thought reasoning</li>
          <li>• Self-reflection and critique capabilities</li>
          <li>• Advanced memory systems with consolidation</li>
          <li>• Multi-step workflow orchestration</li>
          <li>• AWS Bedrock integration for enterprise-grade AI</li>
        </ul>
      </div>
    </div>
  );
};