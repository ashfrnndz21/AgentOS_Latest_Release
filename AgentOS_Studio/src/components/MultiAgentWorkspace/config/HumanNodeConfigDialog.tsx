import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { User, MessageSquare } from 'lucide-react';

interface HumanNodeConfig {
  id: string;
  name: string;
  inputType: 'text' | 'choice' | 'file' | 'approval';
  prompt: string;
  timeout: number;
  required: boolean;
  allowSkip: boolean;
  choices?: string[];
  description?: string;
}

interface HumanNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: HumanNodeConfig) => void;
  initialConfig?: HumanNodeConfig;
}

export const HumanNodeConfigDialog: React.FC<HumanNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<HumanNodeConfig>({
    id: initialConfig?.id || `human-${Date.now()}`,
    name: initialConfig?.name || 'Human Input',
    inputType: initialConfig?.inputType || 'text',
    prompt: initialConfig?.prompt || 'Please provide your input:',
    timeout: initialConfig?.timeout || 300,
    required: initialConfig?.required || true,
    allowSkip: initialConfig?.allowSkip || false,
    choices: initialConfig?.choices || [],
    description: initialConfig?.description || ''
  });

  const handleSave = () => {
    if (config.name.trim() && config.prompt.trim()) {
      onSave(config);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-400" />
            Configure Human Input Node
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Node Name
              </label>
              <Input
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter human input node name"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Description (Optional)
              </label>
              <Input
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what input is needed"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Input Type
              </label>
              <Select
                value={config.inputType}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, inputType: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="choice">Multiple Choice</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                  <SelectItem value="approval">Approval/Rejection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Prompt Message
              </label>
              <Textarea
                value={config.prompt}
                onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter the prompt to show to the user..."
                className="bg-gray-800 border-gray-600 min-h-[80px]"
              />
            </div>
          </div>

          {/* Choices Configuration */}
          {config.inputType === 'choice' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Choice Options</h3>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Choices (one per line)
                </label>
                <Textarea
                  value={config.choices?.join('\n') || ''}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    choices: e.target.value.split('\n').filter(choice => choice.trim()) 
                  }))}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="bg-gray-800 border-gray-600 min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Input Configuration</h3>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Timeout: {config.timeout} seconds
              </label>
              <Slider
                value={[config.timeout]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, timeout: value }))}
                min={30}
                max={3600}
                step={30}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Required Input</label>
                <Switch
                  checked={config.required}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, required: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Allow Skip</label>
                <Switch
                  checked={config.allowSkip}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, allowSkip: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!config.name.trim() || !config.prompt.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};