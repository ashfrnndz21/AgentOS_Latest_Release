import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ollamaAgentService } from '@/lib/services/OllamaAgentService';
import { useToast } from '@/hooks/use-toast';

export const DebugOllamaAgent: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = () => {
    try {
      const allAgents = ollamaAgentService.getAllAgents();
      setAgents(allAgents);
      
      let info = `Found ${allAgents.length} agents:\n`;
      allAgents.forEach((agent, index) => {
        info += `${index + 1}. ${agent.name} (${agent.model})\n`;
        info += `   ID: ${agent.id}\n`;
        info += `   System Prompt: ${agent.systemPrompt?.substring(0, 50)}...\n`;
      });
      
      setDebugInfo(info);
    } catch (error) {
      setDebugInfo(`Error loading agents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testChatWithAgent = async (agent: any) => {
    try {
      toast({
        title: "Testing Chat",
        description: `Attempting to chat with ${agent.name}...`,
      });

      // Test creating a conversation
      const conversationId = await ollamaAgentService.createConversation(agent.id);
      console.log('Created conversation:', conversationId);

      // Test executing the agent
      const execution = await ollamaAgentService.executeAgent(
        agent.id,
        "Hello, can you introduce yourself?",
        conversationId
      );

      console.log('Execution result:', execution);

      toast({
        title: "Chat Test Successful!",
        description: `Response: ${execution.output.substring(0, 100)}...`,
      });

    } catch (error) {
      console.error('Chat test failed:', error);
      toast({
        title: "Chat Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const testOllamaConnection = async () => {
    try {
      const healthStatus = await ollamaAgentService.healthCheck();
      console.log('Health status:', healthStatus);
      
      toast({
        title: "Health Check",
        description: `Status: ${healthStatus.status}, Ollama: ${healthStatus.ollamaStatus}`,
      });
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Debug Ollama Agents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={loadDebugInfo} variant="outline">
              Refresh Agents
            </Button>
            <Button onClick={testOllamaConnection} variant="outline">
              Test Ollama Connection
            </Button>
          </div>

          <Alert className="bg-gray-700 border-gray-600">
            <AlertDescription>
              <pre className="text-sm text-white whitespace-pre-wrap">{debugInfo}</pre>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">Test Chat with Agents:</h3>
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <p className="text-white font-medium">{agent.name}</p>
                  <p className="text-gray-400 text-sm">{agent.model}</p>
                </div>
                <Button 
                  onClick={() => testChatWithAgent(agent)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Test Chat
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};