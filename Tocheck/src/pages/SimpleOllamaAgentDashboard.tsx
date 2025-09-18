import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, MessageSquare, Play } from 'lucide-react';
import { ollamaAgentService, OllamaAgentConfig } from '@/lib/services/OllamaAgentService';
import { useToast } from '@/hooks/use-toast';

export const SimpleOllamaAgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<OllamaAgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = () => {
    try {
      const allAgents = ollamaAgentService.getAllAgents();
      setAgents(allAgents);
    } catch (error) {
      toast({
        title: "Failed to load agents",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (agent: OllamaAgentConfig) => {
    setChatLoading(agent.id);
    
    try {
      // First check if Ollama is running
      const healthStatus = await ollamaAgentService.healthCheck();
      
      if (healthStatus.ollamaStatus !== 'running') {
        throw new Error('Ollama is not running. Please start Ollama first.');
      }

      toast({
        title: "Starting Chat",
        description: `Initializing conversation with ${agent.name}...`,
      });

      // Create a conversation and execute the agent
      const conversationId = await ollamaAgentService.createConversation(agent.id);
      
      // Test with a simple message
      const execution = await ollamaAgentService.executeAgent(
        agent.id,
        "Hello! Please introduce yourself and tell me what you can help with.",
        conversationId
      );

      if (execution.success) {
        // Show the response in an alert for now
        alert(`${agent.name} says:\n\n${execution.output}`);
        
        toast({
          title: "Chat Successful!",
          description: `Response received in ${execution.duration}ms`,
        });
      } else {
        throw new Error(execution.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Chat failed:', error);
      toast({
        title: "Chat Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
      
      // Show error details
      alert(`Failed to chat with ${agent.name}:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChatLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="text-purple-400" />
              Simple Ollama Agent Dashboard v2.0
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your local AI agents powered by Ollama models
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAgents} variant="outline">
              Refresh
            </Button>
            <Button 
              onClick={() => alert('New code is loaded!')} 
              variant="outline"
            >
              Test New Code
            </Button>
          </div>
        </div>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <Bot size={64} className="mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Agents Created</h3>
              <p className="text-gray-400 mb-6">
                Create your first Ollama agent to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="text-purple-400" size={20} />
                    {agent.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{agent.model}</span>
                    <Badge variant="secondary">Local</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">System Prompt:</p>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {agent.systemPrompt || 'No system prompt set'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Temperature:</span>
                        <span className="ml-2 text-white">{agent.temperature}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Max Tokens:</span>
                        <span className="ml-2 text-white">{agent.maxTokens}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStartChat(agent)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                      disabled={chatLoading === agent.id}
                    >
                      {chatLoading === agent.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Chatting...
                        </>
                      ) : (
                        <>
                          <Play size={14} className="mr-2" />
                          Start Chat
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};