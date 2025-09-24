import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OptimizedOrchestrationCard } from '@/components/A2A/OptimizedOrchestrationCard';
import { Play, RefreshCw } from 'lucide-react';

export const OptimizedOrchestrationTest: React.FC = () => {
  const [query, setQuery] = useState('solve me 2x2x5x100 and then write a poem from the output');
  const [orchestrationResult, setOrchestrationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeOrchestration = async (testQuery?: string) => {
    const queryToExecute = testQuery || query;
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5015/api/optimized-orchestration/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryToExecute,
          orchestration_type: 'strands_a2a_handover'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOrchestrationResult(result);
      } else {
        console.error('Orchestration failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error executing orchestration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testQueries = [
    'solve me 2x2x5x100 and then write a poem from the output',
    'calculate 10 + 20 and create a story about the result',
    'what is 5 * 6 and write a haiku about it',
    'help me understand quantum computing basics'
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-400" />
              Optimized Orchestration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query for optimized orchestration..."
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
              <Button
                onClick={() => executeOrchestration()}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Execute
              </Button>
            </div>
            
            <div>
              <h3 className="text-white mb-2">Quick Test Queries:</h3>
              <div className="flex flex-wrap gap-2">
                {testQueries.map((testQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(testQuery);
                      executeOrchestration(testQuery);
                    }}
                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {testQuery}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {orchestrationResult && (
          <OptimizedOrchestrationCard
            orchestrationResult={orchestrationResult}
            onExecuteOrchestration={executeOrchestration}
          />
        )}
      </div>
    </div>
  );
};
