import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, Settings, Maximize2, Minimize2, X, Bot, User, Link } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlexibleChatInterface } from '../FlexibleChatInterface';
import { ChatConfig } from '@/lib/services/FlexibleChatService';

interface ChatInterfaceNodeData {
  id: string;
  name: string;
  chatConfig: ChatConfig;
  isConfigured: boolean;
  // Optional additional properties for compatibility
  description?: string;
  status?: string;
  icon?: string;
  color?: string;
}

export const ChatInterfaceNode: React.FC<NodeProps<ChatInterfaceNodeData>> = ({ 
  data, 
  selected,
  id 
}) => {
  console.log('🎯 ChatInterfaceNode: Rendering with data:', data);
  
  const [chatOpen, setChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const getChatTypeIcon = () => {
    if (!data?.chatConfig?.type) {
      return <MessageSquare className="h-4 w-4" />;
    }
    
    switch (data.chatConfig.type) {
      case 'direct-llm':
        return <Bot className="h-4 w-4" />;
      case 'independent-agent':
        return <User className="h-4 w-4" />;
      case 'palette-agent':
        return <Link className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChatTypeColor = () => {
    if (!data?.chatConfig?.type) {
      return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
    
    switch (data.chatConfig.type) {
      case 'direct-llm':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'independent-agent':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'palette-agent':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  const getChatTypeName = () => {
    switch (data.chatConfig?.type) {
      case 'direct-llm':
        return 'Direct LLM';
      case 'independent-agent':
        return 'Independent Agent';
      case 'palette-agent':
        return 'Palette Agent';
      default:
        return 'Chat Interface';
    }
  };

  return (
    <>
      <Card className={`
        min-w-[200px] p-4 bg-gray-800/90 border-2 transition-all duration-200
        ${selected ? 'border-blue-400 shadow-lg shadow-blue-400/20' : 'border-gray-600/50'}
        hover:border-gray-500/70 hover:shadow-md
      `}>
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-600 border-2 border-gray-400"
        />

        {/* Node Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getChatTypeColor()}`}>
              {getChatTypeIcon()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate">
                {data.name || 'Chat Interface'}
              </h3>
              <p className="text-xs text-gray-400">
                {getChatTypeName()}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={() => {/* Open configuration */}}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Configuration Status */}
        <div className="space-y-2 mb-3">
          {data.isConfigured ? (
            <div className="space-y-1">
              {data.chatConfig?.model && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-white font-mono">
                    {data.chatConfig.model.replace(':latest', '')}
                  </span>
                </div>
              )}
              
              {data.chatConfig?.agentId && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Agent:</span>
                  <span className="text-white">Connected</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Position:</span>
                <span className="text-white capitalize">
                  {data.chatConfig?.position || 'overlay'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-gray-400">Not configured</p>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge 
            variant="outline" 
            className={`text-xs ${getChatTypeColor()}`}
          >
            {data.chatConfig?.type?.replace('-', ' ') || 'unconfigured'}
          </Badge>
          
          {data.chatConfig?.guardrails && (
            <Badge variant="outline" className="text-xs bg-green-500/20 border-green-500/30 text-green-300">
              Protected
            </Badge>
          )}
          
          {data.chatConfig?.contextSharing && (
            <Badge variant="outline" className="text-xs bg-yellow-500/20 border-yellow-500/30 text-yellow-300">
              Context Aware
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setChatOpen(true)}
            disabled={!data.isConfigured}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Open Chat
          </Button>
          
          {data.chatConfig?.minimizable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="px-2 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-600 border-2 border-gray-400"
        />
      </Card>

      {/* Chat Interface Modal/Overlay */}
      {chatOpen && data.isConfigured && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`
            relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl
            ${data.chatConfig.size === 'small' ? 'w-80 h-96' : 
              data.chatConfig.size === 'large' ? 'w-[600px] h-[800px]' : 
              'w-96 h-[600px]'}
          `}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${getChatTypeColor()}`}>
                  {getChatTypeIcon()}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{data.name}</h3>
                  <p className="text-xs text-gray-400">{getChatTypeName()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {data.chatConfig.minimizable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatOpen(false)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Interface */}
            {!isMinimized && (
              <div className="flex-1 h-full">
                <FlexibleChatInterface
                  config={data.chatConfig}
                  conversationId={`chat_${id}`}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimized Chat Indicator */}
      {isMinimized && chatOpen && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={() => setIsMinimized(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {data.name}
          </Button>
        </div>
      )}
    </>
  );
};