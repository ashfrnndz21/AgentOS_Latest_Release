import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ToolAvailabilityIndicatorProps {
  toolName: string;
  className?: string;
}

export const ToolAvailabilityIndicator: React.FC<ToolAvailabilityIndicatorProps> = ({
  toolName,
  className = ""
}) => {
  const [availability, setAvailability] = useState<'available' | 'unavailable' | 'loading'>('loading');

  useEffect(() => {
    checkToolAvailability();
  }, [toolName]);

  const checkToolAvailability = async () => {
    try {
      // Check if tool is available by calling the backend
      const response = await fetch(`http://localhost:5006/api/strands-sdk/tools/check/${toolName}`);
      const data = await response.json();
      
      if (data.success && data.available) {
        setAvailability('available');
      } else {
        setAvailability('unavailable');
      }
    } catch (error) {
      // If backend is not available, use static list of known working tools
      const workingTools = [
        'calculator', 'current_time', 'http_request', 'file_read', 'file_write',
        'http_request', 'python_repl', 'generate_image', 'slack', 'memory',
        'code_execution', 'database_query', 'file_read', 'file_write', 'weather_api'
      ];
      
      setAvailability(workingTools.includes(toolName) ? 'available' : 'unavailable');
    }
  };

  const getAvailabilityIcon = () => {
    switch (availability) {
      case 'available':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'unavailable':
        return <XCircle className="h-3 w-3 text-red-400" />;
      case 'loading':
        return <Clock className="h-3 w-3 text-yellow-400 animate-spin" />;
    }
  };

  const getAvailabilityText = () => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Not Implemented';
      case 'loading':
        return 'Checking...';
    }
  };

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available':
        return 'bg-green-900/20 text-green-400 border-green-600';
      case 'unavailable':
        return 'bg-red-900/20 text-red-400 border-red-600';
      case 'loading':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-600';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${getAvailabilityColor()} ${className}`}
    >
      {getAvailabilityIcon()}
      <span className="ml-1">{getAvailabilityText()}</span>
    </Badge>
  );
};

// Tool availability checker component for the tool selection dialog
export const ToolAvailabilityChecker: React.FC = () => {
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableTools();
  }, []);

  const loadAvailableTools = async () => {
    try {
      // Get list of available tools from backend
      const response = await fetch('http://localhost:5006/api/strands-sdk/tools/discover');
      const data = await response.json();
      
      if (data.success && data.catalog) {
        const tools = Object.keys(data.catalog.tools).filter(
          toolName => data.catalog.tools[toolName].available
        );
        setAvailableTools(tools);
      }
    } catch (error) {
      // Fallback to static list if backend is not available
      const workingTools = [
        'calculator', 'current_time', 'http_request', 'file_read', 'file_write',
        'http_request', 'python_repl', 'generate_image', 'slack', 'memory',
        'code_execution', 'database_query', 'file_read', 'file_write', 'weather_api'
      ];
      setAvailableTools(workingTools);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Clock className="h-4 w-4 animate-spin" />
        Checking tool availability...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <span className="text-green-400">{availableTools.length} tools available</span>
      </div>
      <div className="text-xs text-gray-400">
        Available tools: {availableTools.join(', ')}
      </div>
    </div>
  );
};


