import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedPropertiesPanelProps {
  node: any;
  onUpdateNode: (nodeId: string, data: any) => void;
  onClose: () => void;
  onOpenConfiguration: (nodeId: string, nodeType: string) => void;
}

export const EnhancedPropertiesPanel: React.FC<EnhancedPropertiesPanelProps> = ({
  node,
  onClose,
  onOpenConfiguration
}) => {
  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-slate-600/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Properties</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {node && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Node Type</label>
            <p className="text-white">{node.type}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-300">Label</label>
            <p className="text-white">{node.data?.label || 'Unnamed'}</p>
          </div>
          
          <Button 
            onClick={() => onOpenConfiguration(node.id, node.type)}
            className="w-full"
          >
            Configure
          </Button>
        </div>
      )}
    </div>
  );
};