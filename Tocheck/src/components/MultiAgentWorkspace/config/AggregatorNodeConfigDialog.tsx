import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Combine, TrendingUp } from 'lucide-react';

interface AggregatorNodeConfig {
  id: string;
  name: string;
  aggregationMethod: 'consensus' | 'weighted_average' | 'majority_vote' | 'best_confidence';
  minimumInputs: number;
  timeout: number;
  requireAllInputs: boolean;
  confidenceThreshold: number;
  description?: string;
}

interface AggregatorNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AggregatorNodeConfig) => void;
  initialConfig?: AggregatorNodeConfig;
}

export const AggregatorNodeConfigDialog: React.FC<AggregatorNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<AggregatorNodeConfig>({
    id: initialConfig?.id || `aggregator-${Date.now()}`,
    name: initialConfig?.name || 'Response Aggregator',
    aggregationMethod: initialConfig?.aggregationMethod || 'consensus',
    minimumInputs: initialConfig?.minimumInputs || 2,
    timeout: initialConfig?.timeout || 30,
    requireAllInputs: initialConfig?.requireAllInputs || false,
    confidenceThreshold: initialConfig?.confidenceThreshold || 0.7,
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
            <Combine className="h-5 w-5 text-purple-400" />
            Configure Aggregator Node
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
                placeholder="Enter aggregator node name"
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
                placeholder="Describe how this aggregator combines responses"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Aggregation Method
              </label>
              <Select
                value={config.aggregationMethod}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, aggregationMethod: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consensus">Consensus</SelectItem>
                  <SelectItem value="weighted_average">Weighted Average</SelectItem>
                  <SelectItem value="majority_vote">Majority Vote</SelectItem>
                  <SelectItem value="best_confidence">Best Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Aggregation Configuration</h3>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Minimum Inputs: {config.minimumInputs}
              </label>
              <Slider
                value={[config.minimumInputs]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, minimumInputs: value }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Timeout: {config.timeout} seconds
              </label>
              <Slider
                value={[config.timeout]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, timeout: value }))}
                min={5}
                max={300}
                step={5}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Confidence Threshold: {(config.confidenceThreshold * 100).toFixed(0)}%
              </label>
              <Slider
                value={[config.confidenceThreshold]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, confidenceThreshold: value }))}
                min={0.1}
                max={1.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Require All Inputs</label>
              <Switch
                checked={config.requireAllInputs}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, requireAllInputs: checked }))}
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