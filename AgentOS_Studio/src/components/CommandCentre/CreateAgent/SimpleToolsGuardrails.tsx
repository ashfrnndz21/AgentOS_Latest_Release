import React from 'react';
import { Shield, Database } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ToolOption } from './types';

interface SimpleToolsGuardrailsProps {
  tools: ToolOption[];
  handleToolToggle: (toolId: string, checked: boolean) => void;
  selectedTools: string[];
  guardrails: {
    global: boolean;
    local: boolean;
  };
  onGuardrailToggle: (type: 'global' | 'local', checked: boolean) => void;
  databaseAccess: boolean;
  onDatabaseAccessToggle: (checked: boolean) => void;
}

export const SimpleToolsGuardrails: React.FC<SimpleToolsGuardrailsProps> = ({
  tools,
  handleToolToggle,
  selectedTools,
  guardrails,
  onGuardrailToggle,
  databaseAccess,
  onDatabaseAccessToggle,
}) => {
  return (
    <div className="space-y-6">
      {/* Tools Section */}
      <div>
        <Label className="text-white text-lg mb-4 block">Available Tools</Label>
        <ScrollArea className="h-[200px] w-full rounded-md border border-gray-700 bg-beam-dark p-4">
          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-start space-x-3">
                <Checkbox
                  id={tool.id}
                  checked={selectedTools.includes(tool.id)}
                  onCheckedChange={(checked) => handleToolToggle(tool.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={tool.id}
                    className="text-white font-medium cursor-pointer"
                  >
                    {tool.name}
                  </label>
                  <p className="text-gray-400 text-sm mt-1">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator className="bg-gray-700" />

      {/* Guardrails Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-yellow-400" size={20} />
          <Label className="text-white text-lg">Safety Guardrails</Label>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="global-guardrails"
              checked={guardrails.global}
              onCheckedChange={(checked) => onGuardrailToggle('global', checked as boolean)}
            />
            <div>
              <label htmlFor="global-guardrails" className="text-white font-medium cursor-pointer">
                Global Guardrails
              </label>
              <p className="text-gray-400 text-sm">Apply system-wide safety measures and content filtering</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="local-guardrails"
              checked={guardrails.local}
              onCheckedChange={(checked) => onGuardrailToggle('local', checked as boolean)}
            />
            <div>
              <label htmlFor="local-guardrails" className="text-white font-medium cursor-pointer">
                Local Guardrails
              </label>
              <p className="text-gray-400 text-sm">Apply context-specific safety rules for this agent</p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Database Access Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-blue-400" size={20} />
          <Label className="text-white text-lg">Database Access</Label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="database-access"
            checked={databaseAccess}
            onCheckedChange={(checked) => onDatabaseAccessToggle(checked as boolean)}
          />
          <div>
            <label htmlFor="database-access" className="text-white font-medium cursor-pointer">
              Enable Database Access
            </label>
            <p className="text-gray-400 text-sm">Allow agent to query and interact with connected databases</p>
          </div>
        </div>
      </div>
    </div>
  );
};