import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search, 
  RefreshCw, 
  Bot, 
  Clock,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { StrandsSdkAgent } from '@/lib/services/StrandsSdkService';

interface A2AMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'error';
}

interface A2ACommunicationPanelProps {
  agents: StrandsSdkAgent[];
  onSendMessage?: (from: string, to: string, message: string) => Promise<void>;
  onDiscoverAgents?: () => Promise<void>;
}

export const A2ACommunicationPanel: React.FC<A2ACommunicationPanelProps> = ({
  agents,
  onSendMessage,
  onDiscoverAgents
}) => {
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [selectedFromAgent, setSelectedFromAgent] = useState<string>('');
  const [selectedToAgent, setSelectedToAgent] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [discoveredAgents, setDiscoveredAgents] = useState<StrandsSdkAgent[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [a2aAgents, setA2aAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // A2A Backend URLs
  const A2A_SERVICE_URL = 'http://localhost:5008';
  const STRANDS_SDK_URL = 'http://localhost:5006';

  // Load A2A agents and messages on component mount
  useEffect(() => {
    loadA2aAgents();
    loadMessageHistory();
  }, []);

  // Initialize with first agent if available
  useEffect(() => {
    if (agents.length > 0 && !selectedFromAgent) {
      setSelectedFromAgent(agents[0].id);
    }
  }, [agents, selectedFromAgent]);

  // Load A2A registered agents
  const loadA2aAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${A2A_SERVICE_URL}/api/a2a/agents`);
      if (response.ok) {
        const data = await response.json();
        setA2aAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error loading A2A agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load message history
  const loadMessageHistory = async () => {
    try {
      const response = await fetch(`${A2A_SERVICE_URL}/api/a2a/messages/history`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          from: msg.from_agent_name,
          to: msg.to_agent_name,
          content: msg.content,
          timestamp: msg.timestamp,
          status: msg.status === 'sent' ? 'sent' : 'delivered'
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading message history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedFromAgent || !selectedToAgent || !messageText.trim()) return;

    setIsSending(true);

    try {
      // Send message via A2A backend
      const response = await fetch(`${A2A_SERVICE_URL}/api/a2a/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_agent_id: selectedFromAgent,
          to_agent_id: selectedToAgent,
          content: messageText,
          type: 'message'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add message to local state
        const newMessage: A2AMessage = {
          id: data.message.id,
          from: data.message.from_agent_name,
          to: data.message.to_agent_name,
          content: data.message.content,
          timestamp: data.message.timestamp,
          status: data.message.status === 'sent' ? 'sent' : 'delivered'
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageText('');
        
        console.log('✅ A2A message sent successfully:', data.message);
      } else {
        console.error('❌ Failed to send A2A message:', response.statusText);
      }

      // Also call the parent's send message function if provided
      if (onSendMessage) {
        await onSendMessage(selectedFromAgent, selectedToAgent, messageText);
      }
    } catch (error) {
      console.error('Error sending A2A message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscoverAgents = async () => {
    setIsDiscovering(true);
    try {
      // Load A2A agents from backend
      await loadA2aAgents();
      
      // Also call the parent's discover function if provided
      if (onDiscoverAgents) {
        await onDiscoverAgents();
      }
    } catch (error) {
      console.error('Failed to discover agents:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-400" />;
    }
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : `Agent ${agentId}`;
  };

  return (
    <Card className="h-full bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-400" />
          A2A Communication
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Agent Discovery */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Available Agents</h4>
            <Button
              onClick={handleDiscoverAgents}
              disabled={isDiscovering}
              size="sm"
              variant="outline"
              className="h-7 px-2"
            >
              {isDiscovering ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Search className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {a2aAgents.map(agent => (
              <Badge
                key={agent.id}
                variant={agent.id === selectedFromAgent ? "default" : "outline"}
                className="text-xs cursor-pointer"
                onClick={() => setSelectedFromAgent(agent.id)}
              >
                <Bot className="h-3 w-3 mr-1" />
                {agent.name}
              </Badge>
            ))}
            {a2aAgents.length === 0 && (
              <div className="text-xs text-gray-500">
                {isLoading ? 'Loading agents...' : 'No A2A agents found. Click discover to load agents.'}
              </div>
            )}
          </div>
        </div>

        {/* Message Composition */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">From</label>
              <select
                value={selectedFromAgent}
                onChange={(e) => setSelectedFromAgent(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
              >
                {a2aAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">To</label>
              <select
                value={selectedToAgent}
                onChange={(e) => setSelectedToAgent(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">Select agent...</option>
                {a2aAgents.filter(a => a.id !== selectedFromAgent).map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Message</label>
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your A2A message..."
                className="text-xs bg-gray-700 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!selectedFromAgent || !selectedToAgent || !messageText.trim() || isSending}
                size="sm"
                className="px-3"
              >
                {isSending ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Message History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Message History</h4>
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
          
          <ScrollArea className="h-48 border border-gray-700 rounded p-2">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No A2A messages yet. Send a message to start communication.
                </p>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className="p-2 bg-gray-700/50 rounded border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-purple-400">
                          {getAgentName(message.from)}
                        </span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-xs font-medium text-blue-400">
                          {getAgentName(message.to)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* A2A Status - Removed confusing banner */}
      </CardContent>
    </Card>
  );
};
