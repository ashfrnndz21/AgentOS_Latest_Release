
export interface ConversationMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'user' | 'agent' | 'system' | 'guardrail';
  guardrailType?: 'pii' | 'content' | 'security';
}

export interface ConversationHistoryProps {
  messages: ConversationMessage[];
  selectedNodeId: string | null;
  nodeName?: string;
  operations?: Array<{
    name: string;
    description: string;
    executionTime?: string;
    status?: 'success' | 'warning' | 'error';
  }>;
}
