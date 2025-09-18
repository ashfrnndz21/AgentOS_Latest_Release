import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap, Settings, Database, Code, Server, Globe, FileText, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MCPToolNodeData {
  label: string;
  description: string;
  category: string;
  serverId: string;
  usageComplexity: string;
  verified: boolean;
  status: 'idle' | 'active' | 'success' | 'error';
  tool: any; // Full MCP tool data
}

export const ModernMCPToolNode: React.FC<NodeProps<MCPToolNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const getStatusColor = () => {
    switch (data.status) {
      case 'active': return 'border-blue-400 shadow-blue-400/50';
      case 'success': return 'border-green-400 shadow-green-400/50';
      case 'error': return 'border-red-400 shadow-red-400/50';
      default: return 'border-gray-600';
    }
  };

  const getCategoryIcon = () => {
    switch (data.category) {
      case 'aws': return Database;
      case 'git': return Code;
      case 'filesystem': return Server;
      case 'api': return Globe;
      case 'text': return FileText;
      default: return Zap;
    }
  };

  const getComplexityColor = () => {
    switch (data.usageComplexity) {
      case 'simple': return 'text-green-400 border-green-600';
      case 'moderate': return 'text-yellow-400 border-yellow-600';
      case 'advanced': return 'text-red-400 border-red-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const IconComponent = getCategoryIcon();

  return (
    <Card className={`
      w-[200px] h-[120px] bg-beam-dark border-2 transition-all duration-200
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-beam-blue shadow-lg' : ''}
      ${data.status === 'active' ? 'animate-pulse' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-800 text-blue-400">
              <IconComponent className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-white truncate">{data.label}</h3>
              <p className="text-xs text-gray-400">MCP Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {data.verified && (
              <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-gray-400 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="h-2 w-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-beam-dark border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-blue-400" />
                    {data.label}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-3 text-white">
                  <div className="text-sm text-gray-300">{data.description}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-400">Category:</span> {data.category}</div>
                    <div><span className="text-gray-400">Server:</span> {data.serverId}</div>
                    <div><span className="text-gray-400">Complexity:</span> {data.usageComplexity}</div>
                    <div><span className="text-gray-400">Verified:</span> {data.verified ? 'Yes' : 'No'}</div>
                  </div>
                  
                  {data.tool && (
                    <div>
                      <div className="text-sm font-semibold text-gray-300 mb-1">Tool Configuration:</div>
                      <div className="bg-gray-800 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                        <pre>{JSON.stringify(data.tool, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 mb-2">
          <p className="text-xs text-gray-400 line-clamp-2">{data.description}</p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-gray-600">
              {data.category}
            </Badge>
            <Badge variant="outline" className={`text-xs px-1 py-0 h-4 ${getComplexityColor()}`}>
              {data.usageComplexity}
            </Badge>
          </div>
          
          <div className="text-xs text-gray-400">
            Status: <span className={`
              ${data.status === 'active' ? 'text-blue-400' : ''}
              ${data.status === 'success' ? 'text-green-400' : ''}
              ${data.status === 'error' ? 'text-red-400' : ''}
              ${data.status === 'idle' ? 'text-gray-400' : ''}
            `}>
              {data.status}
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </Card>
  );
};