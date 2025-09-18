import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Shield, AlertTriangle } from 'lucide-react';

interface GuardrailNodeConfig {
  id: string;
  name: string;
  guardrailType: 'content_filter' | 'safety_check' | 'compliance' | 'rate_limit';
  strictness: number;
  blockOnViolation: boolean;
  logViolations: boolean;
  customRules: string[];
  description?: string;
}

interface GuardrailNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: GuardrailNodeConfig) => void;
  initialConfig?: GuardrailNodeConfig;
}

export const GuardrailNodeConfigDialog: React.FC<GuardrailNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<GuardrailNodeConfig>({
    id: initialConfig?.id || `guardrail-${Date.now()}`,
    name: initialConfig?.name || 'Safety Guardrail',
    guardrailType: initialConfig?.guardrailType || 'content_filter',
    strictness: initialConfig?.strictness || 5,
    blockOnViolation: initialConfig?.blockOnViolation || true,
    logViolations: initialConfig?.logViolations || true,
    customRules: initialConfig?.customRules || [],
    description: initialConfig?.description || ''
  });

  const handleSave = () => {
    if (config.name.trim()) {
      onSave(config);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            Configure Guardrail Node
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
                placeholder="Enter guardrail node name"
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
                placeholder="Describe what this guardrail protects against"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Guardrail Type
              </label>
              <Select
                value={config.guardrailType}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, guardrailType: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content_filter">Content Filter</SelectItem>
                  <SelectItem value="safety_check">Safety Check</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="rate_limit">Rate Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Guardrail Configuration</h3>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Strictness Level: {config.strictness}/10
              </label>
              <Slider
                value={[config.strictness]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, strictness: value }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Permissive</span>
                <span>Strict</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Block on Violation</label>
                <Switch
                  checked={config.blockOnViolation}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, blockOnViolation: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Log Violations</label>
                <Switch
                  checked={config.logViolations}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, logViolations: checked }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Custom Rules (one per line)
              </label>
              <textarea
                value={config.customRules.join('\n')}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  customRules: e.target.value.split('\n').filter(rule => rule.trim()) 
                }))}
                placeholder="Enter custom rules..."
                className="w-full h-24 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!config.name.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};