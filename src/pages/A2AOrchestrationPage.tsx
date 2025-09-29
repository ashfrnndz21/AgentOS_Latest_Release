import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Play, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Brain, 
  Zap, 
  MessageSquare,
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';

interface OrchestrationResult {
  success: boolean;
  session_id: string;
  error?: string;
  final_response?: string;
  execution_metadata: {
    agents_coordinated: number;
    total_execution_time: number;
    success: boolean;
  };
  "1. Query Analysis": any;
  "2. Sequence Definition": any;
  "3. Orchestrator Reasoning": any;
  "4. Agent Registry Analysis": any;
  "5. Agent Selection & Sequencing": any;
  "6. A2A Sequential Handover Execution": any;
  "7. A2A Message Flow": any;
  "8. Orchestrator Final Synthesis": any;
}

export const A2AOrchestrationPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);

  // Function to clean response for display
  const cleanResponse = (response: string): string => {
    if (!response) return '';
    
    // Remove <think> tags and their content
    let cleaned = response.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // Remove markdown formatting artifacts
    cleaned = cleaned.replace(/\*\*Final Polished Response:\*\*/g, '');
    cleaned = cleaned.replace(/\*\*Notes on the Poem:\*\*/g, '\n\n**Notes:**');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  const executeOrchestration = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5015/api/modern-orchestration/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: '1. Query Analysis', title: 'Query Analysis', icon: Brain, color: 'bg-blue-500' },
    { id: '2. Sequence Definition', title: 'Sequence Definition', icon: Zap, color: 'bg-green-500' },
    { id: '3. Orchestrator Reasoning', title: 'Orchestrator Reasoning', icon: Bot, color: 'bg-purple-500' },
    { id: '4. Agent Registry Analysis', title: 'Agent Registry Analysis', icon: BarChart3, color: 'bg-orange-500' },
    { id: '5. Agent Selection & Sequencing', title: 'Agent Selection & Sequencing', icon: CheckCircle, color: 'bg-teal-500' },
    { id: '6. A2A Sequential Handover Execution', title: 'A2A Sequential Handover Execution', icon: Play, color: 'bg-red-500' },
    { id: '7. A2A Message Flow', title: 'A2A Message Flow', icon: MessageSquare, color: 'bg-indigo-500' },
    { id: '8. Orchestrator Final Synthesis', title: 'Orchestrator Final Synthesis', icon: CheckCircle2, color: 'bg-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <Brain className="inline-block mr-3 text-purple-400" />
            A2A Multi-Agent Orchestration
          </h1>
          <p className="text-gray-400 text-lg">Advanced AI orchestration with structured workflow analysis</p>
        </div>

        {/* Query Input */}
        <Card className="mb-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="mr-2 text-blue-400" />
              Enter your query for multi-agent orchestration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you want to accomplish with multiple AI agents..."
                className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
              <Button 
                onClick={executeOrchestration}
                disabled={isLoading || !query.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Executing Orchestration...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute A2A Orchestration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-400">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span className="font-medium">Error:</span>
                <span className="ml-2">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status Summary */}
            <Card className="bg-green-900/20 border-green-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  A2A Orchestration Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{result.execution_metadata?.agents_coordinated || 0}</div>
                    <div className="text-gray-400 text-sm">Agents Coordinated</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">
                      {result.execution_metadata?.total_execution_time && result.execution_metadata.total_execution_time > 0 
                        ? result.execution_metadata.total_execution_time.toFixed(2) + 's'
                        : '0.00s'
                      }
                    </div>
                    <div className="text-gray-400 text-sm">Total Execution Time</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{result.final_response?.length || 0}</div>
                    <div className="text-gray-400 text-sm">Response Length</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{result.success ? 'Success' : 'Failed'}</div>
                    <div className="text-gray-400 text-sm">Status</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Session ID: {result.session_id}
                </div>
              </CardContent>
            </Card>

            {/* Section Navigation */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Workflow Analysis Sections</CardTitle>
                <CardDescription className="text-gray-400">Click on any section to view detailed analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "default" : "outline"}
                        onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                        className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                          activeSection === section.id 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${section.color.replace('bg-', 'text-')}`} />
                        <span className="text-xs text-center">{section.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Section Content */}
            {activeSection && result && result[activeSection as keyof OrchestrationResult] && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{sections.find(s => s.id === activeSection)?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-900/50 p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(result[activeSection as keyof OrchestrationResult], null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Final Response */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Final Orchestrated Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {showRawResponse 
                      ? (result.final_response || result["8. Orchestrator Final Synthesis"]?.final_response_summary || 'No response available')
                      : cleanResponse(result.final_response || result["8. Orchestrator Final Synthesis"]?.final_response_summary || 'No response available')
                    }
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-300 border-gray-600"
                    onClick={() => setShowRawResponse(!showRawResponse)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showRawResponse ? 'Show Clean' : 'Show Raw'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default A2AOrchestrationPage;
