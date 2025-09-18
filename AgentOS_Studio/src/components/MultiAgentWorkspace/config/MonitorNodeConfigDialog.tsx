import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Monitor, Activity } from 'lucide-react';

interface MonitorNodeConfig {
  id: string;
  name: string;
  monitorType: 'performance' | 'health' | 'security' | 'compliance';
  checkInterval: number;
  alertThreshold: number;
  enableAlerts: boolean;
  logMetrics: boolean;
  retentionPeriod: number;
  description?: string;
}

interface MonitorNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MonitorNodeConfig) => void;
  initialConfig?: MonitorNodeConfig;
}

export const MonitorNodeConfigDialog: React.FC<MonitorNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<MonitorNodeConfig>({
    id: initialConfig?.id || `monitor-${Date.now()}`,
    name: initialConfig?.name || 'System Monitor',
    monitorType: initialConfig?.monitorType || 'performance',
    checkInterval: initialConfig?.checkInterval || 60,
    alertThreshold: initialConfig?.alertThreshold || 80,
    enableAlerts: initialConfig?.enableAlerts || true,
    logMetrics: initialConfig?.logMetrics || true,
    retentionPeriod: initialConfig?.retentionPeriod || 30,
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
            <Activity className="h-5 w-5 text-green-400" />
            Configure Monitor Node
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
                placeholder="Enter monitor node name"
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
                placeholder="Describe what this monitor tracks"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Monitor Type
              </label>
              <Select
                value={config.monitorType}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, monitorType: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="health">Health Check</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Monitor Configuration</h3>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Check Interval: {config.checkInterval} seconds
              </label>
              <Slider
                value={[config.checkInterval]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, checkInterval: value }))}
                min={10}
                max={3600}
                step={10}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Alert Threshold: {config.alertThreshold}%
              </label>
              <Slider
                value={[config.alertThreshold]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, alertThreshold: value }))}
                min={1}
                max={100}
                step={1}
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Enable Alerts</label>
                <Switch
                  checked={config.enableAlerts}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Log Metrics</label>
                <Switch
                  checked={config.logMetrics}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, logMetrics: checked }))}
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
              disabled={!config.name.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};