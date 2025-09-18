
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from './EmptyState';
import { OperationsList } from './OperationsList';
import { MessagesList } from './MessagesList';
import type { ConversationHistoryProps } from './types';

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  selectedNodeId,
  nodeName = "Selected Node",
  operations = []
}) => {
  if (!selectedNodeId && messages.length === 0 && operations.length === 0) {
    return (
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-white">Node Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-beam-dark/70 border border-gray-700/30">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium text-white">
            <div className="flex items-center">
              <MessageSquare size={16} className="text-blue-400 mr-2" />
              {messages.length > 0 ? `Conversation History: ${nodeName}` : `Node Details: ${nodeName}`}
            </div>
          </CardTitle>
          
          {messages.length > 0 && (
            <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-700/30">
              {messages.length} messages
            </Badge>
          )}
          
          {operations.length > 0 && (
            <Badge variant="outline" className="bg-green-900/20 text-green-300 border-green-700/30">
              {operations.length} operations
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <OperationsList operations={operations} />
          <MessagesList messages={messages} showHeader={operations.length > 0} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
