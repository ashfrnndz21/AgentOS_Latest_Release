
import React, { memo, useCallback } from 'react';
import { Shield, Database } from 'lucide-react';
import { FormLabel } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ToolOption } from './types';
import { UseFormSetValue } from 'react-hook-form';
import { AgentFormValues } from './types';
import { toast } from '@/components/ui/use-toast';

interface ToolsGuardrailsProps {
  tools: ToolOption[];
  handleToolToggle: (toolId: string, checked: boolean) => void;
  setValue: UseFormSetValue<AgentFormValues>;
  formValues: AgentFormValues;
}

export const ToolsGuardrails: React.FC<ToolsGuardrailsProps> = memo(({
  tools,
  handleToolToggle,
  setValue,
  formValues,
}) => {
  // Ensure needed objects exist to prevent null references
  const guardrails = formValues.guardrails || { global: false, local: false };
  const toolsArray = formValues.tools || [];
  
  // Handler functions optimized to prevent re-renders
  const handleGlobalGuardrailChange = useCallback((checked: boolean) => {
    setValue('guardrails.global', checked);
    if (checked) {
      toast({
        title: "Global Guardrails Enabled",
        description: "All organization-wide guardrails will be applied to this agent"
      });
    }
  }, [setValue]);
  
  const handleLocalGuardrailChange = useCallback((checked: boolean) => {
    setValue('guardrails.local', checked);
    if (checked) {
      toast({
        title: "Local Guardrails Enabled",
        description: "Project-specific guardrails will be applied to this agent"
      });
    }
  }, [setValue]);
  
  const handleDatabaseAccessChange = useCallback((checked: boolean) => {
    setValue('databaseAccess', checked);
    if (checked) {
      toast({
        title: "Database Access Enabled",
        description: "This agent will be able to query and update database information"
      });
    }
  }, [setValue]);

  return (
    <div className="space-y-6" data-testid="tools-guardrails-step">
      <div>
        <FormLabel className="text-white block mb-3">Tools Access</FormLabel>
        <ScrollArea className="h-44 border border-gray-700 rounded-md p-2">
          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-start space-x-3 py-2">
                <Checkbox 
                  id={`tool-${tool.id}`} 
                  className="mt-1 border-gray-500"
                  checked={toolsArray.includes(tool.id)}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      handleToolToggle(tool.id, checked);
                    }
                  }}
                />
                <div className="space-y-1">
                  <label 
                    htmlFor={`tool-${tool.id}`} 
                    className="text-sm font-medium leading-none flex items-center cursor-pointer gap-2"
                  >
                    {tool.icon}
                    {tool.name}
                  </label>
                  <p className="text-xs text-gray-400">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator className="bg-gray-700" />

      <div>
        <FormLabel className="text-white block mb-3">Guardrails</FormLabel>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="global-guardrails" 
              className="border-gray-500"
              checked={guardrails.global || false}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  handleGlobalGuardrailChange(checked);
                }
              }}
            />
            <div className="space-y-1">
              <label 
                htmlFor="global-guardrails" 
                className="text-sm font-medium leading-none flex items-center cursor-pointer gap-2"
              >
                <Shield size={16} className="text-purple-400" />
                Apply Global Guardrails
              </label>
              <p className="text-xs text-gray-400">
                Apply organization-wide guardrails to this agent
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="local-guardrails"
              className="border-gray-500"
              checked={guardrails.local || false}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  handleLocalGuardrailChange(checked);
                }
              }}
            />
            <div className="space-y-1">
              <label 
                htmlFor="local-guardrails" 
                className="text-sm font-medium leading-none flex items-center cursor-pointer gap-2"
              >
                <Shield size={16} className="text-indigo-400" />
                Apply Local Guardrails
              </label>
              <p className="text-xs text-gray-400">
                Apply project-specific guardrails to this agent
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      <div>
        <FormLabel className="text-white block mb-3">Database Access</FormLabel>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="database-access" 
              className="border-gray-500"
              checked={formValues.databaseAccess || false}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  handleDatabaseAccessChange(checked);
                }
              }}
            />
            <div className="space-y-1">
              <label 
                htmlFor="database-access" 
                className="text-sm font-medium leading-none flex items-center cursor-pointer gap-2"
              >
                <Database size={16} className="text-blue-400" />
                Enable Database Access
              </label>
              <p className="text-xs text-gray-400">
                Allow this agent to query and update database information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ToolsGuardrails.displayName = 'ToolsGuardrails';
