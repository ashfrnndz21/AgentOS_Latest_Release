import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Database, 
  Globe, 
  FileText, 
  Code, 
  Settings, 
  Zap,
  CheckCircle, 
  AlertCircle, 
  Clock,
  Plug
} from 'lucide-react';
import { StrandsWorkflowNode } from '@/lib/services/StrandsWorkflowOrchestrator';

interface StrandsToolNodeData {
  id: string;
  name: string;
  description?: string;
  tool?: any;
  toolConfig?: any;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastExecution?: any;
  icon?: string;
  color?: string;
}

const StrandsToolNode: React.FC<NodeProps<StrandsToolNodeData>> = ({ data, selected }) => {
  const getToolIcon = () => {
    if (data.icon) {
      return <span className="text-lg">{data.icon}</span>;
    }

    // Default icons based on tool category
    const category = data.tool?.category?.toLowerCase() || '';
    
    if (category.includes('database')) return <Database className="h-5 w-5" />;
    if (category.includes('web') || category.includes('api')) return <Globe className="h-5 w-5" />;
    if (category.includes('file')) return <FileText className="h-5 w-5" />;
    if (category.includes('code')) return <Code className="h-5 w-5" />;
    
    return <Settings className="h-5 w-5" />;
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Plug className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-blue-400 shadow-blue-400/50';
      case 'completed':
        return 'border-green-400 shadow-green-400/50';
      case 'error':
        return 'border-red-400 shadow-red-400/50';
      default:
        return 'border-gray-600';
    }
  };

  const getCategoryColor = () => {
    const category = data.tool?.category?.toLowerCase() || '';
    
    if (category.includes('database')) return '#059669';
    if (category.includes('web') || category.includes('api')) return '#2563eb';
    if (category.includes('file')) return '#7c3aed';
    if (category.includes('code')) return '#ea580c';
    
    return data.color || '#6b7280';
  };

  const categoryColor = getCategoryColor();

  return (
    <div className="strands-tool-node relative">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400 hover:bg-gray-500"
        style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
      />

      {/* Main Node Container */}
      <div
        className={`
          relative bg-gray-800/90 backdrop-blur-sm border-2 rounded-xl p-4 min-w-[180px] max-w-[250px]
          transition-all duration-200 hover:shadow-lg
          ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
          ${getStatusColor()}
        `}
        style={{
          boxShadow: data.status === 'running' ? `0 0 20px ${categoryColor}40` : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <div style={{ color: categoryColor }}>
                {getToolIcon()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {data.name}
              </h3>
              <p className="text-xs text-gray-400 capitalize">
                {data.tool?.category || 'Tool'}
              </p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-300 mb-3 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Tool Details */}
        <div className="space-y-2 mb-3">
          {/* Provider Info */}
          {data.tool?.provider && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Provider:</span>
              <span className="text-gray-300">{data.tool.provider}</span>
            </div>
          )}

          {/* Tool Schema/Methods */}
          {data.tool?.schema?.methods && (
            <div className="flex flex-wrap gap-1">
              {Object.keys(data.tool.schema.methods).slice(0, 3).map((method: string) => (
                <span
                  key={method}
                  className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded border border-gray-600"
                >
                  {method}
                </span>
              ))}
              {Object.keys(data.tool.schema.methods).length > 3 && (
                <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded border border-gray-600">
                  +{Object.keys(data.tool.schema.methods).length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Strands Integration */}
        <div className="flex items-center justify-between mb-3 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center space-x-2">
            <Zap className="h-3 w-3 text-orange-400" />
            <span className="text-xs text-orange-300 font-medium">Smart Tool</span>
          </div>
          {data.toolConfig?.errorHandling?.retryCount && (
            <span className="text-xs text-orange-400">
              Retry: {data.toolConfig.errorHandling.retryCount}x
            </span>
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              data.status === 'error' ? 'bg-red-400' : 
              data.status === 'completed' ? 'bg-green-400' : 
              data.status === 'running' ? 'bg-blue-400 animate-pulse' : 
              'bg-gray-400'
            }`} />
            <span className="text-xs text-gray-400 capitalize">
              {data.status === 'idle' ? 'Ready' : data.status}
            </span>
          </div>
          
          {/* Execution Stats */}
          {data.lastExecution && (
            <div className="text-xs text-gray-400">
              {data.lastExecution.executionTime}ms
            </div>
          )}
        </div>

        {/* Execution Progress */}
        {data.status === 'running' && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent animate-pulse opacity-20"
              style={{ color: categoryColor }}
            />
          </div>
        )}

        {/* Error Indicator */}
        {data.status === 'error' && data.lastExecution?.error && (
          <div className="absolute -bottom-2 left-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded truncate">
            {data.lastExecution.error}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400 hover:bg-gray-500"
        style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
      />

      {/* Data Flow Indicator */}
      {data.status === 'running' && (
        <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full animate-bounce">
          Processing...
        </div>
      )}
    </div>
  );
};

export default memo(StrandsToolNode);