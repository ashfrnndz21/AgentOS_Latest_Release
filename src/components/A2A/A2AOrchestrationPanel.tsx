import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, Users, Clock } from 'lucide-react';

interface OrchestrationResult {
  question: string;
  user: string;
  timestamp: string;
  session_id: string;
  agents_contacted: number;
  successful_responses: number;
  coordination_strategy: string;
  final_response: string;
  total_agents_used: number;
  orchestration_successful: boolean;
  agent_responses: Array<{
    agent_id: string;
    agent_name: string;
    response_time: number;
    status: string;
    response: string;
  }>;
}

export const A2AOrchestrationPanel: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOrchestrate = async () => {
    if (!question.trim()) return;

    setIsOrchestrating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8005/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          user: 'Frontend User'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Failed to orchestrate agents');
      }
    } catch (err) {
      setError('Error connecting to orchestration service');
      console.error('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-purple-400" size={20} />
            A2A Orchestration
          </CardTitle>
          <CardDescription>
            Coordinate multiple agents to work together on complex tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Ask a question that requires multiple agents:
            </label>
            <Textarea
              placeholder="e.g., What's the weather like today and can you help me calculate the temperature in Celsius?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>
          
          <Button
            onClick={handleOrchestrate}
            disabled={isOrchestrating || !question.trim()}
            className="w-full"
          >
            {isOrchestrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Orchestrating Agents...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Orchestrate Agents
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-green-400" size={20} />
              Orchestration Result
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                Session: {result.session_id}
              </div>
              <Badge variant={result.orchestration_successful ? "default" : "destructive"}>
                {result.orchestration_successful ? "Success" : "Failed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-400">Agents Used</div>
                <div className="text-white font-semibold">{result.total_agents_used}</div>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-400">Contacted</div>
                <div className="text-white font-semibold">{result.agents_contacted}</div>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-400">Successful</div>
                <div className="text-white font-semibold">{result.successful_responses}</div>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-400">Strategy</div>
                <div className="text-white font-semibold text-xs">{result.coordination_strategy}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-300">Final Response:</h4>
              <div className="bg-gray-700 p-4 rounded text-sm text-gray-200 whitespace-pre-wrap">
                {result.final_response}
              </div>
            </div>

            {result.agent_responses && result.agent_responses.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-300">Agent Responses:</h4>
                <div className="space-y-2">
                  {result.agent_responses.map((response, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white">{response.agent_name}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{response.response_time.toFixed(2)}s</span>
                          <Badge variant={response.status === 'success' ? 'default' : 'destructive'}>
                            {response.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        {response.response.substring(0, 200)}
                        {response.response.length > 200 && '...'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};







