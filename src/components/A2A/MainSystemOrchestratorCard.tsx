import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MainSystemOrchestratorConfigModal } from './MainSystemOrchestratorConfigModal';
import { 
  Brain, 
  MessageSquare, 
  BarChart3,
  Clock,
  Zap,
  Cpu,
  Settings,
  Sparkles,
  Info,
  Network,
  CheckCircle,
  Search,
  Workflow,
  RefreshCw,
  X,
  Settings as Gear,
  Target,
  Activity,
  Database,
  Server,
  Code,
  Shield,
  Users,
  Layers,
  ArrowRight,
  Bot,
  Globe,
  Play,
  BarChart,
  Lightbulb,
  Palette
} from 'lucide-react';

export const MainSystemOrchestratorCard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [queryOpen, setQueryOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<any>(null);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const BASE_URL = 'http://localhost:5031';

  // Helper function to format agent output text (same logic as final response)
  const formatAgentOutput = (text: string) => {
    if (!text) return '';
    
    // First, try to detect and format JSON content
    let processedText = text;
    
    // Check for JSON patterns (similar to backend logic)
    const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const jsonMatches = text.match(jsonPattern);
    
    if (jsonMatches) {
      // Try to parse and format each JSON block
      for (const jsonMatch of jsonMatches) {
        try {
          const parsedJson = JSON.parse(jsonMatch);
          
          // Check if this looks like structured content (poems, data, etc.)
          if (isStructuredContent(parsedJson)) {
            const formattedContent = formatStructuredContent(parsedJson);
            processedText = processedText.replace(jsonMatch, formattedContent);
          } else {
            // For other JSON, remove it to clean up the output
            processedText = processedText.replace(jsonMatch, '');
          }
        } catch (error) {
          // If it's not valid JSON, remove it
          processedText = processedText.replace(jsonMatch, '');
        }
      }
    }
    
    // Clean up any remaining technical artifacts
    processedText = removeTechnicalArtifacts(processedText);
    
    // Check if response contains formatted content (poems, structured data)
    if (processedText.includes('**') && processedText.includes('*')) {
      // Parse markdown-like formatting for better display
      const formattedResponse = processedText
        .split('\n')
        .map((line, index) => {
          // Handle bold text
          if (line.includes('**')) {
            const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
            return <div key={index} dangerouslySetInnerHTML={{ __html: boldText }} />;
          }
          // Handle italic text
          else if (line.includes('*') && !line.includes('**')) {
            const italicText = line.replace(/\*(.*?)\*/g, '<em class="text-gray-400 italic">$1</em>');
            return <div key={index} dangerouslySetInnerHTML={{ __html: italicText }} />;
          }
          // Handle bullet points
          else if (line.trim().startsWith('•')) {
            return <div key={index} className="ml-4 text-gray-300">{line}</div>;
          }
          // Handle regular lines
          else if (line.trim()) {
            return <div key={index} className="text-gray-300">{line}</div>;
          }
          // Handle empty lines
          else {
            return <div key={index} className="h-2" />;
          }
        });
      
      return (
        <div className="space-y-1">
          {formattedResponse}
        </div>
      );
    }
    
    // Default formatting for plain text
    return (
      <div className="whitespace-pre-wrap text-gray-300">
        {processedText}
      </div>
    );
  };

  // Helper function to check if JSON contains structured content
  const isStructuredContent = (parsedJson: any) => {
    if (typeof parsedJson !== 'object') return false;
    const structuredKeys = ['title', 'author', 'poem', 'lines', 'content', 'data', 'result', 'output'];
    return structuredKeys.some(key => key in parsedJson);
  };

  // Helper function to format structured JSON content (similar to backend)
  const formatStructuredContent = (parsedJson: any) => {
    try {
      // Handle poem-like content
      if ('poem' in parsedJson && parsedJson.poem && 'lines' in parsedJson.poem) {
        const poemData = parsedJson.poem;
        const lines = poemData.lines || [];
        
        let formatted = "";
        if ('title' in parsedJson) {
          formatted += `**${parsedJson.title}**\n\n`;
        }
        if ('author' in parsedJson) {
          formatted += `*by ${parsedJson.author}*\n\n`;
        }
        
        // Format poem lines
        for (const line of lines) {
          formatted += `${line}\n`;
        }
        
        // Add metadata if available
        if ('metadata' in parsedJson) {
          const metadata = parsedJson.metadata;
          formatted += "\n";
          for (const [key, value] of Object.entries(metadata)) {
            formatted += `*${key.replace('_', ' ')}: ${value}*\n`;
          }
        }
        
        return formatted.trim();
      }
      
      // Handle general structured content
      else if ('content' in parsedJson || 'result' in parsedJson || 'output' in parsedJson) {
        const content = parsedJson.content || parsedJson.result || parsedJson.output;
        if (typeof content === 'string') {
          return content;
        } else if (Array.isArray(content)) {
          return content.join('\n');
        } else if (typeof content === 'object') {
          let formatted = "";
          for (const [key, value] of Object.entries(content)) {
            formatted += `**${key.replace('_', ' ')}**: ${value}\n`;
          }
          return formatted.trim();
        }
      }
      
      // Handle data arrays
      else if ('data' in parsedJson && Array.isArray(parsedJson.data)) {
        let formatted = "";
        for (const item of parsedJson.data) {
          if (typeof item === 'object') {
            for (const [key, value] of Object.entries(item)) {
              formatted += `**${key.replace('_', ' ')}**: ${value}\n`;
            }
            formatted += "\n";
          } else {
            formatted += `${item}\n`;
          }
        }
        return formatted.trim();
      }
      
      // Default formatting for other structured content
      else {
        let formatted = "";
        for (const [key, value] of Object.entries(parsedJson)) {
          if (typeof value === 'object') {
            formatted += `**${key.replace('_', ' ')}**:\n`;
            for (const [subKey, subValue] of Object.entries(value)) {
              formatted += `  • ${subKey.replace('_', ' ')}: ${subValue}\n`;
            }
          } else if (Array.isArray(value)) {
            formatted += `**${key.replace('_', ' ')}**:\n`;
            for (const item of value) {
              formatted += `  • ${item}\n`;
            }
          } else {
            formatted += `**${key.replace('_', ' ')}**: ${value}\n`;
          }
        }
        return formatted.trim();
      }
    } catch (error) {
      console.error('Error formatting structured content:', error);
      return JSON.stringify(parsedJson, null, 2);
    }
  };

  // Helper function to remove technical artifacts
  const removeTechnicalArtifacts = (text: string) => {
    let cleaned = text;
    
    // Remove technical wrapper patterns
    cleaned = cleaned.replace(/HTTP \d+:/g, '');
    cleaned = cleaned.replace(/execution_time.*?seconds?/g, '');
    cleaned = cleaned.replace(/model.*?qwen3:1\.7b/g, '');
    cleaned = cleaned.replace(/from_agent.*?Main System Orchestrator/g, '');
    cleaned = cleaned.replace(/to_agent.*?/g, '');
    cleaned = cleaned.replace(/timestamp.*?/g, '');
    
    // Remove escaped characters and clean up
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\t/g, '\t');
    
    // Remove excessive whitespace and clean up formatting
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Multiple newlines to double
    cleaned = cleaned.replace(/^\s+/gm, ''); // Leading whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // Load health status and agents
  useEffect(() => {
    loadHealthStatus();
    loadAvailableAgents();
    loadSessions();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadHealthStatus();
      loadAvailableAgents();
      loadSessions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadHealthStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const loadAvailableAgents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/main-orchestrator/discover-agents`);
      if (response.ok) {
        const data = await response.json();
        setAvailableAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to load available agents:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/main-orchestrator/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.session_history || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleOrchestrate = async () => {
    if (!query.trim()) {
      setOrchestrationError('Please enter a query');
      return;
    }

    setIsOrchestrating(true);
    setOrchestrationError(null);
    setOrchestrationResult(null);

    try {
      const response = await fetch(`${BASE_URL}/api/main-orchestrator/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        // Include analysis and agent selection in the orchestration result
        setOrchestrationResult({
          ...data.orchestration_result,
          analysis: data.analysis,
          agent_selection: data.agent_selection
        });
        loadSessions(); // Refresh sessions
      } else {
        const errorData = await response.json();
        setOrchestrationError(errorData.error || 'Orchestration failed');
      }
    } catch (error) {
      setOrchestrationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsOrchestrating(false);
    }
  };

  // Main System Orchestrator configuration
  const orchestratorConfig = {
    name: "Main System Orchestrator",
    description: "Independent backend orchestrator using Granite4:micro with A2A Strands SDK integration",
    model: "granite4:micro",
    status: healthStatus?.status || "unknown",
    connections: availableAgents.length,
    parameters: {
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.9,
      timeout: 60,
    },
    capabilities: [
      "Multi-agent orchestration",
      "A2A communication",
      "Query analysis",
      "Response synthesis",
      "Session management"
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white flex items-center">
                  {orchestratorConfig.name}
                  <Badge variant="outline" className="ml-2 text-purple-400 border-purple-400">
                    <Bot className="w-3 h-3 mr-1" />
                    {orchestratorConfig.model}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  {orchestratorConfig.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                <Network className="w-3 h-3 mr-1" />
                A2A Enabled
              </Badge>
              <div className={`flex items-center space-x-1 ${getStatusColor(orchestratorConfig.status)}`}>
                {getStatusIcon(orchestratorConfig.status)}
                <span className="text-sm font-medium capitalize">{orchestratorConfig.status}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* A2A Communication Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">A2A Communication</span>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 mb-3">
              Independent Backend • Coordinates A2A handovers between orchestration-enabled agents
            </div>

            {/* Configuration Parameters */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Temperature:</span>
                  <span className="text-white">{orchestratorConfig.parameters.temperature}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Max Tokens:</span>
                  <span className="text-white">{orchestratorConfig.parameters.max_tokens}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-white">{orchestratorConfig.model}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Timeout:</span>
                  <span className="text-white">{orchestratorConfig.parameters.timeout}s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Queries:</span>
                  <span className="text-white">∞</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Success:</span>
                  <span className="text-green-400">100%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setQueryOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2"
              >
                <Play className="w-4 h-4 mr-2" />
                Query
              </Button>
              <Button
                onClick={() => setAnalyticsOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <BarChart className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setConfigModalOpen(true)}
              >
                <Gear className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Agent Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Agents:</span>
                <span className="text-white font-medium">{availableAgents.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Sessions:</span>
                <span className="text-white font-medium">{sessions.length}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Port: 5030
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Dialog */}
      <Dialog open={queryOpen} onOpenChange={setQueryOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              Main System Orchestrator Query
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Input Section - Fixed */}
            <div className="flex-shrink-0 space-y-4">
              <div>
                <Textarea
                  placeholder="Enter your query for multi-agent orchestration..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleOrchestrate}
                  disabled={isOrchestrating || !query.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isOrchestrating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Orchestrating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Orchestrate
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setQueryOpen(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>

              {orchestrationError && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-red-400">Error: {orchestrationError}</p>
                </div>
              )}
            </div>

            {/* Results Section - Scrollable */}
            {orchestrationResult && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {/* Phase 1: Orchestration Status */}
                <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Phase 1: Orchestration Status
                  </h4>
                  <div className="text-sm text-gray-300">
                    <p>Session: {orchestrationResult.session_id?.slice(0, 8)}...</p>
                    <p>Agents: {orchestrationResult.agents_involved?.join(', ')}</p>
                    <p>Execution Time: {orchestrationResult.total_execution_time?.toFixed(2)}s</p>
                  </div>
                </div>

                {/* Phase 2: Query Analysis */}
                {orchestrationResult.analysis && (
                  <div className="p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
                    <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                      <Search className="w-4 h-4 mr-2" />
                      Phase 2: Query Analysis
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Query Type:</span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {orchestrationResult.analysis.query_type}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Task Nature:</span>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            {orchestrationResult.analysis.task_nature || 'direct'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Complexity:</span>
                          <Badge variant="outline" className="text-orange-400 border-orange-400">
                            {orchestrationResult.analysis.complexity_level || 'moderate'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Workflow Pattern:</span>
                          <Badge variant="outline" className="text-purple-400 border-purple-400">
                            {orchestrationResult.analysis.agentic_workflow_pattern}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Strategy:</span>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {orchestrationResult.analysis.orchestration_strategy}
                          </Badge>
                        </div>
                        {orchestrationResult.analysis.domain_analysis && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Multi-Domain:</span>
                            <Badge variant="outline" className={orchestrationResult.analysis.domain_analysis.is_multi_domain ? 'text-red-400 border-red-400' : 'text-gray-400 border-gray-400'}>
                              {orchestrationResult.analysis.domain_analysis.is_multi_domain ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-gray-400 mb-2">Workflow Steps:</div>
                        <div className="space-y-1">
                          {orchestrationResult.analysis.workflow_steps?.map((step: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2 text-xs">
                              <span className="text-blue-400 font-bold flex-shrink-0">{index + 1}.</span>
                              <span className="text-gray-300">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {orchestrationResult.analysis.domain_analysis && (
                      <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                        <div className="text-xs text-gray-400 mb-1">Domain Analysis:</div>
                        <div className="text-sm text-gray-300">
                          <span className="text-blue-400">Primary:</span> {orchestrationResult.analysis.domain_analysis.primary_domain}
                          {orchestrationResult.analysis.domain_analysis.secondary_domains?.length > 0 && (
                            <span className="ml-2">
                              <span className="text-purple-400">Secondary:</span> {orchestrationResult.analysis.domain_analysis.secondary_domains.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {orchestrationResult.analysis.reasoning && (
                      <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
                        <div className="text-xs text-gray-400 mb-1">Reasoning:</div>
                        <div className="text-sm text-gray-300">{orchestrationResult.analysis.reasoning}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Agent Selection & Scoring Section */}
                {orchestrationResult.agent_selection && (
                  <div className="p-4 bg-purple-900/20 border border-purple-500 rounded-lg">
                    <h4 className="text-purple-400 font-semibold mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Phase 3: Agent Selection & Scoring
                    </h4>
                    
                    {/* Selected Agents */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2">Selected Agents:</div>
                      <div className="space-y-2">
                        {orchestrationResult.agent_selection?.selected_agents?.map((agent: any, index: number) => (
                          <div key={index} className="p-3 bg-gray-800/50 rounded border border-gray-600">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium">{agent.name}</span>
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                Score: {agent.relevance_score?.toFixed(2) || 'N/A'}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400 space-y-1">
                              <div>Model: {agent.model}</div>
                              <div>Capabilities: {agent.capabilities?.join(', ')}</div>
                              {agent.reasoning && (
                                <div className="mt-2 p-2 bg-gray-700/50 rounded">
                                  <span className="text-gray-300">{agent.reasoning}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Multi-Agent Analysis */}
                    {orchestrationResult.agent_selection.multi_agent_analysis && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Multi-Agent Coordination:</div>
                        <div className="p-3 bg-gray-800/50 rounded border border-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-gray-400">Requires Multiple:</span>
                              <Badge variant="outline" className={`ml-2 ${orchestrationResult.agent_selection.multi_agent_analysis.requires_multiple_agents ? 'text-orange-400 border-orange-400' : 'text-gray-400 border-gray-400'}`}>
                                {orchestrationResult.agent_selection.multi_agent_analysis.requires_multiple_agents ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-400">Strategy:</span>
                              <Badge variant="outline" className="ml-2 text-blue-400 border-blue-400">
                                {orchestrationResult.agent_selection.multi_agent_analysis.coordination_strategy}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Task Decomposition */}
                          {orchestrationResult.agent_selection.multi_agent_analysis.task_decomposition && (
                            <div className="mt-3">
                              <div className="text-xs text-gray-400 mb-2">Task Decomposition:</div>
                              <div className="space-y-2">
                                {orchestrationResult.agent_selection.multi_agent_analysis.task_decomposition.map((task: any, index: number) => (
                                  <div key={index} className="p-2 bg-gray-700/30 rounded border border-gray-500">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-white text-xs font-medium">{task.agent_name}</span>
                                      <Badge variant="outline" className={`text-xs ${task.priority === 'high' ? 'text-red-400 border-red-400' : task.priority === 'medium' ? 'text-yellow-400 border-yellow-400' : 'text-gray-400 border-gray-400'}`}>
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-300">{task.task}</div>
                                    {task.dependencies && task.dependencies.length > 0 && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        Dependencies: {task.dependencies.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Overall Recommendation */}
                    {orchestrationResult.agent_selection.overall_recommendation && (
                      <div className="p-3 bg-gray-800/50 rounded border border-gray-600">
                        <div className="text-xs text-gray-400 mb-1">Selection Strategy:</div>
                        <div className="text-sm text-gray-300">{orchestrationResult.agent_selection.overall_recommendation}</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Phase 4: Task Execution Details */}
                {orchestrationResult.orchestration_results && (
                  <div className="p-4 bg-orange-900/20 border border-orange-500 rounded-lg">
                    <h4 className="text-orange-400 font-semibold mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Phase 4: Task Execution Details
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(orchestrationResult.orchestration_results)
                        .sort(([, a], [, b]) => {
                          // Sort by execution order if available, otherwise by name
                          const orderA = a.execution_order || a.iteration || 0;
                          const orderB = b.execution_order || b.iteration || 0;
                          return orderA - orderB;
                        })
                        .map(([agentName, result]: [string, any]) => (
                        <div key={agentName} className="p-3 bg-gray-800/50 rounded border border-gray-600">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium">{agentName}</span>
                            <div className="flex space-x-2">
                              <Badge variant="outline" className={result.status === 'success' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}>
                                {result.status}
                              </Badge>
                              <Badge variant="outline" className="text-blue-400 border-blue-400">
                                {result.execution_time?.toFixed(2)}s
                              </Badge>
                            </div>
                          </div>
                          {(result.response || result.result || result.output || result.content) && (
                            <div className="text-xs text-gray-300 bg-gray-700/30 p-2 rounded border border-gray-500">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-gray-400">Agent Output:</div>
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedAgents);
                                    if (newExpanded.has(agentName)) {
                                      newExpanded.delete(agentName);
                                    } else {
                                      newExpanded.add(agentName);
                                    }
                                    setExpandedAgents(newExpanded);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-xs underline"
                                >
                                  {expandedAgents.has(agentName) ? 'Show Less' : 'Show Full Output'}
                                </button>
                              </div>
                              <div className={`text-xs leading-relaxed ${expandedAgents.has(agentName) ? 'max-h-none' : 'max-h-32 overflow-y-auto'}`}>
                                {(() => {
                                  const output = result.response || result.result || result.output || result.content;
                                  if (!output) return <div className="text-gray-500 italic">No output content available</div>;
                                  
                                  if (expandedAgents.has(agentName)) {
                                    return formatAgentOutput(output);
                                  } else {
                                    const truncated = output.length > 300 ? `${output.substring(0, 300)}...` : output;
                                    return formatAgentOutput(truncated);
                                  }
                                })()}
                              </div>
                              {!expandedAgents.has(agentName) && (result.response || result.result || result.output || result.content) && (result.response || result.result || result.output || result.content).length > 300 && (
                                <div className="text-gray-500 mt-1 text-xs">
                                  Output truncated - {((result.response || result.result || result.output || result.content).length - 300)} more characters
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Show status and execution info when no output content */}
                          {!(result.response || result.result || result.output || result.content) && result.status === 'success' && (
                            <div className="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded border border-yellow-500">
                              <div className="text-yellow-400 mb-1">⚠️ Agent completed but no output content</div>
                              <div className="text-gray-300">
                                Status: {result.status} | Model: {result.model || 'Unknown'} | Time: {result.execution_time ? `${result.execution_time.toFixed(2)}s` : 'N/A'}
                              </div>
                            </div>
                          )}
                          
                          {result.error && (
                            <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded border border-red-500">
                              <div className="text-red-400 mb-1">Error:</div>
                              <div>{result.error}</div>
                            </div>
                          )}
                          
                          {/* Verification Section - Shows authenticity markers */}
                          {result.verification && (
                            <div className="text-xs text-green-300 bg-green-900/20 p-2 rounded border border-green-500 mt-2">
                              <div className="text-green-400 mb-1">🔍 Authentic Agent Output Verification:</div>
                              <div className="space-y-1">
                                <div>✅ Source: <span className="font-mono">{result.verification.source_agent}</span></div>
                                <div>✅ Agent ID: <span className="font-mono">{result.verification.source_agent_id}</span></div>
                                <div>✅ A2A Handoff: <span className="font-mono">{result.verification.a2a_handoff_id}</span></div>
                                <div>✅ Timestamp: <span className="font-mono">{new Date(result.verification.execution_timestamp * 1000).toLocaleTimeString()}</span></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase 5: Final Response */}
                {orchestrationResult.final_response && (
                  <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Phase 5: Final Response
                    </h4>
                    <div className="text-sm text-gray-300">
                      {(() => {
                        const response = orchestrationResult.final_response;
                        
                        // Check if response contains formatted content (poems, structured data)
                        if (response.includes('**') && response.includes('*')) {
                          // Parse markdown-like formatting for better display
                          const formattedResponse = response
                            .split('\n')
                            .map((line, index) => {
                              // Handle bold text
                              if (line.includes('**')) {
                                const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
                                return <div key={index} dangerouslySetInnerHTML={{ __html: boldText }} />;
                              }
                              // Handle italic text
                              else if (line.includes('*') && !line.includes('**')) {
                                const italicText = line.replace(/\*(.*?)\*/g, '<em class="text-gray-400 italic">$1</em>');
                                return <div key={index} dangerouslySetInnerHTML={{ __html: italicText }} />;
                              }
                              // Handle bullet points
                              else if (line.trim().startsWith('•')) {
                                return <div key={index} className="ml-4 text-gray-300">{line}</div>;
                              }
                              // Handle regular lines
                              else if (line.trim()) {
                                return <div key={index} className="text-gray-300">{line}</div>;
                              }
                              // Handle empty lines
                              else {
                                return <div key={index} className="h-2" />;
                              }
                            });
                          
                          return (
                            <div className="space-y-1">
                              {formattedResponse}
                            </div>
                          );
                        }
                        
                        // Default formatting for plain text
                        return (
                          <div className="whitespace-pre-wrap text-gray-300">
                            {response}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
              Main System Orchestrator Analytics
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Health Status */}
            {healthStatus && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{healthStatus.status}</div>
                  <div className="text-sm text-gray-400">Status</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{healthStatus.model}</div>
                  <div className="text-sm text-gray-400">Model</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{healthStatus.active_sessions}</div>
                  <div className="text-sm text-gray-400">Active Sessions</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{healthStatus.registered_agents}</div>
                  <div className="text-sm text-gray-400">Registered Agents</div>
                </div>
              </div>
            )}

            {/* Available Agents */}
            <div>
              <h3 className="text-white font-semibold mb-3">Available Agents ({availableAgents.length})</h3>
              {availableAgents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orchestration-enabled agents found</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {availableAgents.map((agent) => (
                    <div key={agent.agent_id} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{agent.name}</h4>
                          <p className="text-sm text-gray-400">ID: {agent.agent_id.slice(0, 8)}...</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={agent.status === 'active' ? 'text-green-400 border-green-400' : 'text-gray-400 border-gray-400'}
                          >
                            {agent.status}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={agent.a2a_enabled ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-gray-400'}
                          >
                            A2A
                          </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            <div>
              <h3 className="text-white font-semibold mb-3">Recent Sessions ({sessions.length})</h3>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orchestration sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {sessions.slice(0, 5).map((session, index) => (
                    <div key={index} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">
                          Session {session.session_id?.slice(0, 8)}...
                        </h4>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Query: {session.query}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{session.agents_involved?.length || 0} agents</span>
                        <span>{session.total_execution_time?.toFixed(2) || 0}s</span>
                        <span>{new Date(session.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configuration Modal */}
      <MainSystemOrchestratorConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </>
  );
};
