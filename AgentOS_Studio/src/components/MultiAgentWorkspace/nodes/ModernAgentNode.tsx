import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Brain, Database, Shield, Settings, Activity, Briefcase, BarChart3, Headphones, Code, BookOpen, FileText, Target, Network, Lightbulb, Info, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const ModernAgentNode = ({ data, selected }: any) => {
  const getProfessionalAgentIcon = (agentType: string, role?: string) => {
    // For Ollama agents, use role-based professional icons
    if (agentType === 'ollama-agent' && role) {
      const roleLower = role.toLowerCase();
      
      if (roleLower.includes('cvm') || roleLower.includes('customer') || roleLower.includes('business')) 
        return { icon: Briefcase, color: 'text-blue-400' };
      if (roleLower.includes('analyst') || roleLower.includes('analysis') || roleLower.includes('data')) 
        return { icon: BarChart3, color: 'text-green-400' };
      if (roleLower.includes('chat') || roleLower.includes('conversation') || roleLower.includes('support')) 
        return { icon: Headphones, color: 'text-purple-400' };
      if (roleLower.includes('coder') || roleLower.includes('developer') || roleLower.includes('technical')) 
        return { icon: Code, color: 'text-orange-400' };
      if (roleLower.includes('researcher') || roleLower.includes('research') || roleLower.includes('knowledge')) 
        return { icon: BookOpen, color: 'text-indigo-400' };
      if (roleLower.includes('writer') || roleLower.includes('content') || roleLower.includes('creative')) 
        return { icon: FileText, color: 'text-pink-400' };
      if (roleLower.includes('coordinator') || roleLower.includes('manager') || roleLower.includes('orchestrat')) 
        return { icon: Target, color: 'text-red-400' };
      if (roleLower.includes('telecom') || roleLower.includes('telco') || roleLower.includes('network')) 
        return { icon: Network, color: 'text-cyan-400' };
      if (roleLower.includes('ai') || roleLower.includes('intelligent') || roleLower.includes('smart')) 
        return { icon: Brain, color: 'text-violet-400' };
      if (roleLower.includes('expert') || roleLower.includes('specialist')) 
        return { icon: Lightbulb, color: 'text-yellow-400' };
    }
    
    // Legacy agent type icons
    switch (agentType) {
      case 'KYC Agent': return { icon: Shield, color: 'text-cyan-400' };
      case 'AML Agent': return { icon: Shield, color: 'text-emerald-400' };
      case 'Credit Underwriting Agent': return { icon: BarChart3, color: 'text-purple-400' };
      case 'Fraud Detection Agent': return { icon: Activity, color: 'text-red-400' };
      case 'Regulatory Reporting Agent': return { icon: Settings, color: 'text-yellow-400' };
      case 'Customer Service Agent': return { icon: Headphones, color: 'text-pink-400' };
      default: return { icon: Bot, color: 'text-gray-400' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className={`
      w-[200px] h-[120px] bg-beam-dark border-2 transition-all duration-200 overflow-hidden
      ${selected ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-gray-600 hover:border-gray-500'}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-cyan-400 border-2 border-white"
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-gray-800 flex-shrink-0">
            {(() => {
              const { icon: IconComponent, color } = getProfessionalAgentIcon(data.agentType, data.role);
              return <IconComponent className={`h-4 w-4 ${color}`} />;
            })()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {data.label || 'Agent'}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {data.agentType === 'ollama-agent' ? (data.role || 'AI Agent') : data.agentType}
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Info className="h-3 w-3 text-gray-400 hover:text-white" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-beam-dark border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  {data.label} Configuration
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 text-white">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Type:</span> {data.agentType}</div>
                  <div><span className="text-gray-400">Model:</span> {data.model}</div>
                  <div><span className="text-gray-400">Status:</span> {data.status}</div>
                  <div><span className="text-gray-400">Role:</span> {data.role || 'N/A'}</div>
                </div>
                
                {data.capabilities && (
                  <div>
                    <div className="text-sm font-semibold text-gray-300 mb-1">Capabilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {data.capabilities.map((cap: string) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {data.mcpTools && data.mcpTools.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-300 mb-1">MCP Tools:</div>
                    <div className="space-y-1">
                      {data.mcpTools.map((tool: any, index: number) => (
                        <div key={index} className="text-xs bg-gray-800 p-2 rounded">
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-gray-400">{tool.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Model Info */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Model:</span>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-700">
            {(data.model || 'Unknown').split(':')[0]}
          </Badge>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            {data.guardrails && (
              <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center">
                <Shield className="h-3 w-3 text-green-400" />
              </div>
            )}
            {data.mcpTools?.length > 0 && (
              <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
                <Zap className="h-3 w-3 text-blue-400" />
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            {(data.tools?.length || 0) + (data.mcpTools?.length || 0)} tools
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-cyan-400 border-2 border-white"
      />
    </Card>
  );
};