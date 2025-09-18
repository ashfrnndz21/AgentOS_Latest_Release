import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Brain, Database } from 'lucide-react';

interface MemoryNodeConfig {
  id: string;
  name: string;
  memoryType: 'conversation' | 'entity' | 'summary' | 'vector';
  maxSize: number;
  retentionPeriod: number;
  compressionEnabled: boolean;
  description?: string;
}

interface MemoryNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MemoryNodeConfig) => void;
  initialConfig?: MemoryNodeConfig;
}

export const MemoryNodeConfigDialog: React.FC<MemoryNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<MemoryNodeConfig>({
    id: initialConfig?.id || `memory-${Date.now()}`,
    name: initialConfig?.name || 'Memory Store',
    memoryType: initialConfig?.memoryType || 'conversation',
    maxSize: initialConfig?.maxSize || 1000,
    retentionPeriod: initialConfig?.retentionPeriod || 30,
    compressionEnabled: initialConfig?.compressionEnabled || false,
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
            <Database className="h-5 w-5 text-purple-400" />
            Configure Memory Node
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
                placeholder="Enter memory node name"
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
                placeholder="Describe what this memory stores"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Memory Type
              </label>
              <Select
                value={config.memoryType}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, memoryType: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversation">Conversation Memory</SelectItem>
                  <SelectItem value="entity">Entity Memory</SelectItem>
                  <SelectItem value="summary">Summary Memory</SelectItem>
                  <SelectItem value="vector">Vector Memory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Memory Configuration</h3>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Max Size: {config.maxSize} items
              </label>
              <Slider
                value={[config.maxSize]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, maxSize: value }))}
                min={100}
                max={10000}
                step={100}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Retention Period: {config.retentionPeriod} days
              </label>
              <Slider
                value={[config.retentionPeriod]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, retentionPeriod: value }))}
                min={1}
                max={365}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Enable Compression</label>
              <Switch
                checked={config.compressionEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, compressionEnabled: checked }))}
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};