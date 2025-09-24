import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Search, 
  Clock, 
  FileText, 
  Database, 
  Code, 
  Image, 
  MessageSquare,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Target,
  BarChart3,
  MessageSquare as MessageIcon,
  TrendingUp,
  Activity,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
// Define the tool trace interface locally since it's not exported from the service
interface StrandsSdkToolTrace {
  execution_id: string;
  execution_time: number;
  input_text: string;
  output_text: string;
  success: boolean;
  timestamp: string;
  tool_info: {
    tools_used: string[];
    operations_log: Array<{
      step: string;
      details: string;
      timestamp: string;
      tool_name?: string;
      tool_input?: string;
      tool_output?: string;
    } | string>;
  };
}

interface StrandsToolTraceTooltipProps {
  agentId: string;
  agentName: string;
  isVisible: boolean;
  onClose: () => void;
}

const getToolIcon = (toolName: string) => {
  switch (toolName) {
    case 'calculator': return <Calculator className="h-4 w-4" />;
    case 'web_search': return <Search className="h-4 w-4" />;
    case 'current_time': return <Clock className="h-4 w-4" />;
    case 'file_read': return <FileText className="h-4 w-4" />;
    case 'file_write': return <FileText className="h-4 w-4" />;
    case 'memory': return <Database className="h-4 w-4" />;
    case 'memory_store': return <Database className="h-4 w-4" />;
    case 'memory_retrieve': return <Database className="h-4 w-4" />;
    case 'python_repl': return <Code className="h-4 w-4" />;
    case 'generate_image': return <Image className="h-4 w-4" />;
    case 'slack': return <MessageSquare className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
  }
};

const getToolColor = (toolName: string) => {
  switch (toolName) {
    case 'calculator': return 'text-blue-400';
    case 'web_search': return 'text-green-400';
    case 'current_time': return 'text-purple-400';
    case 'file_read': return 'text-orange-400';
    case 'file_write': return 'text-orange-400';
    case 'memory': return 'text-pink-400';
    case 'memory_store': return 'text-pink-400';
    case 'memory_retrieve': return 'text-pink-400';
    case 'python_repl': return 'text-yellow-400';
    case 'generate_image': return 'text-indigo-400';
    case 'slack': return 'text-cyan-400';
    default: return 'text-gray-400';
  }
};

export const StrandsToolTraceTooltip: React.FC<StrandsToolTraceTooltipProps> = ({
  agentId,
  agentName,
  isVisible,
  onClose
}) => {
  console.log('[Tool Trace] ===== COMPONENT RENDERED =====');
  console.log('[Tool Trace] isVisible:', isVisible);
  console.log('[Tool Trace] agentId:', agentId);
  console.log('[Tool Trace] agentName:', agentName);
  
  const [traces, setTraces] = useState<StrandsSdkToolTrace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<StrandsSdkToolTrace | null>(null);
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set());

  const fetchToolTraces = async () => {
    console.log('[Tool Trace] ===== FETCHING TOOL TRACES =====');
    console.log('[Tool Trace] Agent ID:', agentId);
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5006/api/strands-sdk/agents/${agentId}/tool-traces`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tool traces: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('[Tool Trace] Raw API response:', data);
      console.log('[Tool Trace] Number of traces:', data.tool_traces?.length);
      console.log('[Tool Trace] First trace tools_used:', data.tool_traces?.[0]?.tool_info?.tools_used);
      console.log('[Tool Trace] First trace operations_log:', data.tool_traces?.[0]?.tool_info?.operations_log);
      
      if (data.success) {
        setTraces(data.tool_traces);
        if (data.tool_traces.length > 0 && !selectedTrace) {
          setSelectedTrace(data.tool_traces[0]);
        }
      } else {
        setError(data.error || 'Failed to fetch tool traces');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tool traces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchToolTraces();
    }
  }, [isVisible, agentId]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatExecutionTime = (time: number) => {
    return `${time.toFixed(2)}s`;
  };

  const toggleTraceExpansion = (traceId: string) => {
    const newExpanded = new Set(expandedTraces);
    if (newExpanded.has(traceId)) {
      newExpanded.delete(traceId);
    } else {
      newExpanded.add(traceId);
    }
    setExpandedTraces(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Calculate metrics
  const totalExecutions = traces.length;
  const successRate = traces.length > 0 ? (traces.filter(t => t.success).length / traces.length * 100).toFixed(0) : 0;
  const avgResponseTime = traces.length > 0 ? traces.reduce((acc, trace) => acc + trace.execution_time, 0) / traces.length : 0;
  const totalToolsUsed = traces.reduce((acc, trace) => acc + trace.tool_info.tools_used.length, 0);

  // Get unique tools used
  const uniqueTools = Array.from(new Set(traces.flatMap(t => t.tool_info.tools_used)));

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[95%] max-w-6xl h-[90%] bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Analytics: {agentName}</h2>
                <p className="text-sm text-gray-400">Tool execution analytics and traces</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchToolTraces}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-600 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-600">
                <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="traces" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Traces
                </TabsTrigger>
                <TabsTrigger value="tools" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Tools
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Performance
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 flex flex-col p-6 space-y-6">
              {/* Agent Information */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Agent Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-400">Name:</span>
                      <p className="text-sm text-white font-medium">{agentName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Created:</span>
                      <p className="text-sm text-white">{new Date().toLocaleDateString()}, {new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-400">Description:</span>
                      <p className="text-sm text-white">Expert in creative writing, storytelling, and innovative content creation.</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Model:</span>
                      <p className="text-sm text-white">http://localhost:11434</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Tools:</span>
                      <p className="text-sm text-white">{uniqueTools.length > 0 ? `${uniqueTools.length} tools` : 'No tools'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageIcon className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Total Executions</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalExecutions}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="text-sm font-medium text-gray-300">Success Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{successRate}%</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Avg Response Time</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{avgResponseTime.toFixed(2)}s</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-orange-400" />
                      <span className="text-sm font-medium text-gray-300">Total Tools Used</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalToolsUsed}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Traces Tab - Detailed Tool Execution Traces */}
            <TabsContent value="traces" className="flex-1 flex flex-col p-6">
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Detailed Tool Execution Traces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4 pr-4">
                      {traces.length > 0 ? (
                        traces.map((trace, index) => {
                          const isExpanded = expandedTraces.has(trace.execution_id);
                          return (
                            <div
                              key={trace.execution_id}
                              className="border border-gray-600 rounded-lg bg-gray-700"
                            >
                              {/* Trace Header */}
                              <div
                                className="p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                                onClick={() => toggleTraceExpansion(trace.execution_id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm font-medium text-white">Execution #{index + 1}</span>
                                    {trace.success ? (
                                      <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-red-400" />
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {formatExecutionTime(trace.execution_time)}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {formatTimestamp(trace.timestamp)}
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-300">
                                  <strong>Input:</strong> {trace.input_text.length > 100 
                                    ? trace.input_text.substring(0, 100) + '...' 
                                    : trace.input_text
                                  }
                                </div>
                                {trace.tool_info.tools_used.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {trace.tool_info.tools_used.map((tool, toolIndex) => (
                                      <Badge key={toolIndex} variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                                        <div className="flex items-center gap-1">
                                          {getToolIcon(tool)}
                                          {tool}
                                        </div>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Expanded Content */}
                              {isExpanded && (
                                <div className="border-t border-gray-600 p-4 space-y-4">
                                  {/* Input Details */}
                                  <div>
                                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4" />
                                      Input Details
                                    </h4>
                                    <div className="bg-gray-800 p-3 rounded border">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-400">Full Input Text</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(trace.input_text)}
                                          className="text-gray-400 hover:text-white h-6 px-2"
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{trace.input_text}</p>
                                    </div>
                                  </div>

                                  {/* Output Details */}
                                  <div>
                                    <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                      <ExternalLink className="h-4 w-4" />
                                      Output Details
                                    </h4>
                                    <div className="bg-gray-800 p-3 rounded border">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-400">Agent Response</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(trace.output_text)}
                                          className="text-gray-400 hover:text-white h-6 px-2"
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{trace.output_text}</p>
                                    </div>
                                  </div>

                                  {/* Tool Execution Details */}
                                  {trace.tool_info.tools_used.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Tool Execution Details
                                      </h4>
                                      <div className="space-y-3">
                                        {trace.tool_info.tools_used.map((tool, toolIndex) => {
                                          // Debug: Log the operations log to see what we're working with
                                          console.log(`[Tool Trace Debug] ===== TOOL EXTRACTION DEBUG =====`);
                                          console.log(`[Tool Trace Debug] Tool from tools_used: "${tool}"`);
                                          console.log(`[Tool Trace Debug] Tool type: ${typeof tool}`);
                                          console.log(`[Tool Trace Debug] Tools used array:`, trace.tool_info.tools_used);
                                          console.log(`[Tool Trace Debug] Operations log:`, trace.tool_info.operations_log);
                                          console.log(`[Tool Trace Debug] Available operations:`, trace.tool_info.operations_log?.map(op => ({ 
                                            step: typeof op === 'object' ? op.step : 'string',
                                            tool_name: typeof op === 'object' ? op.tool_name : 'none', 
                                            has_tool_input: typeof op === 'object' ? !!op.tool_input : false,
                                            has_tool_output: typeof op === 'object' ? !!op.tool_output : false
                                          })));
                                          
                                          // Extract tool-specific information from operations log
                                          const toolOperations = trace.tool_info.operations_log?.filter(op => {
                                            if (typeof op === 'object' && op.tool_name === tool) {
                                              return true;
                                            }
                                            if (typeof op === 'string') {
                                              return op.toLowerCase().includes(tool.toLowerCase());
                                            }
                                            return false;
                                          }) || [];
                                          
                                          // Extract tool input and output from operations log
                                          let toolInput = '';
                                          let toolOutput = '';
                                          let toolStatus = '';
                                          
                                          // Look for tool execution in operations log
                                          console.log(`[Tool Trace Debug] Searching for tool: "${tool}"`);
                                          console.log(`[Tool Trace Debug] Operations log:`, trace.tool_info.operations_log);
                                          
                                          const toolOp = trace.tool_info.operations_log?.find(op => {
                                            console.log(`[Tool Trace Debug] Checking operation:`, op);
                                            if (typeof op === 'object') {
                                              console.log(`[Tool Trace Debug] op.tool_name: "${op.tool_name}", looking for: "${tool}"`);
                                              return op.tool_name === tool;
                                            }
                                            return false;
                                          });
                                          
                                          if (toolOp && typeof toolOp === 'object') {
                                            toolInput = toolOp.tool_input || '';
                                            toolOutput = toolOp.tool_output || '';
                                            toolStatus = toolOp.details || '';
                                            console.log(`[Tool Trace Debug] Found tool operation:`, toolOp);
                                            console.log(`[Tool Trace Debug] Extracted - Input: "${toolInput}", Output: "${toolOutput}"`);
                                          } else {
                                            // Fallback: look for tool-specific operations
                                            const toolOps = trace.tool_info.operations_log?.filter(op => 
                                              typeof op === 'object' && 
                                              (op.step?.toLowerCase().includes(tool.toLowerCase()) || 
                                               op.details?.toLowerCase().includes(tool.toLowerCase()))
                                            ) || [];
                                            
                                            if (toolOps.length > 0) {
                                              const mainOp = toolOps[0];
                                              if (typeof mainOp === 'object') {
                                                toolStatus = mainOp.details || '';
                                              
                                                // Try to extract input/output from details
                                                if (mainOp.details) {
                                                  const details = mainOp.details;
                                                  const inputMatch = details.match(/Input:\s*([^|]+)/);
                                                  const outputMatch = details.match(/Output:\s*([^|]+)/);
                                                  
                                                  if (inputMatch) toolInput = inputMatch[1].trim();
                                                  if (outputMatch) toolOutput = outputMatch[1].trim();
                                                }
                                              }
                                            }
                                          }
                                          
                                          return (
                                            <div key={toolIndex} className="bg-gray-800 p-3 rounded border">
                                              <div className="flex items-center gap-2 mb-2">
                                                <div className={`${getToolColor(tool)}`}>
                                                  {getToolIcon(tool)}
                                                </div>
                                                <span className="text-sm font-medium text-white">{tool}</span>
                                                <Badge variant="outline" className="text-xs">
                                                  Tool #{toolIndex + 1}
                                                </Badge>
                                              </div>
                                              <div className="text-xs text-gray-400 mb-2">
                                                Status: <span className="text-green-400">Executed Successfully</span>
                                              </div>
                                              
                                              {/* Tool Input */}
                                              <div className="mt-2 p-2 bg-gray-700 rounded border-l-2 border-blue-500">
                                                <div className="text-xs text-gray-400 mb-1">Tool Input:</div>
                                                <div className="text-sm text-white font-mono">{toolInput || 'No input data found'}</div>
                                              </div>
                                              
                                              {/* Tool Output */}
                                              <div className="mt-2 p-2 bg-gray-700 rounded border-l-2 border-green-500">
                                                <div className="text-xs text-gray-400 mb-1">Tool Output:</div>
                                                <div className="text-sm text-white font-mono">{toolOutput || 'No output data found'}</div>
                                              </div>
                                              
                                              {/* Tool Status */}
                                              {toolStatus && (
                                                <div className="mt-2 p-2 bg-gray-700 rounded border-l-2 border-yellow-500">
                                                  <div className="text-xs text-gray-400 mb-1">Execution Details:</div>
                                                  <div className="text-sm text-white">{toolStatus}</div>
                                                </div>
                                              )}
                                              
                                              {/* Tool operations */}
                                              {toolOperations.length > 0 && (
                                                <div className="mt-2">
                                                  <div className="text-xs text-gray-400 mb-1">Operations:</div>
                                                  <div className="space-y-1">
                                                    {toolOperations.map((operation, opIndex) => (
                                                      <div key={opIndex} className="text-xs text-gray-300 bg-gray-700 p-2 rounded">
                                                        {typeof operation === 'string' ? operation : 
                                                         typeof operation === 'object' ? 
                                                           `${operation.step || 'Operation'}: ${operation.details || 'No details'}` : 
                                                           'Unknown operation'}
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Operations Log */}
                                  {trace.tool_info.operations_log && trace.tool_info.operations_log.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Operations Log
                                      </h4>
                                      <div className="bg-gray-800 p-3 rounded border">
                                        <ScrollArea className="h-40">
                                          <div className="space-y-2 pr-2">
                                            {trace.tool_info.operations_log.map((operation, opIndex) => {
                                              // Handle both string and object operations
                                              if (typeof operation === 'object' && operation !== null) {
                                                const isCalculatorOp = operation.tool_name === 'calculator';
                                                return (
                                                  <div key={opIndex} className={`text-xs border-l-2 pl-2 ${
                                                    isCalculatorOp ? 'border-purple-500 bg-purple-900/20' : 'border-blue-500 bg-blue-900/20'
                                                  }`}>
                                                    <div className={`font-medium ${
                                                      isCalculatorOp ? 'text-purple-300' : 'text-blue-300'
                                                    }`}>
                                                      {operation.step || 'Tool Execution'}
                                                    </div>
                                                    <div className="text-gray-300 text-xs mt-1">
                                                      {operation.details}
                                                    </div>
                                                    {operation.tool_input && (
                                                      <div className="text-gray-400 text-xs mt-1">
                                                        Input: <span className="font-mono">{operation.tool_input}</span>
                                                      </div>
                                                    )}
                                                    {operation.tool_output && (
                                                      <div className="text-green-400 text-xs mt-1">
                                                        Output: <span className="font-mono">{operation.tool_output}</span>
                                                      </div>
                                                    )}
                                                    <div className="text-gray-500 text-xs mt-1">
                                                      {new Date(operation.timestamp).toLocaleTimeString()}
                                                    </div>
                                                  </div>
                                                );
                                              } else if (typeof operation === 'string') {
                                                // Handle string operations (legacy format)
                                                const isCalculatorOp = operation.toLowerCase().includes('calculator');
                                                const isResultOp = operation.includes('=') || operation.includes('result');
                                                
                                                return (
                                                  <div key={opIndex} className={`text-xs border-l-2 pl-2 ${
                                                    isCalculatorOp ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600'
                                                  }`}>
                                                    <div className={`font-medium ${
                                                      isCalculatorOp ? 'text-purple-300' : 'text-gray-300'
                                                    }`}>
                                                      {operation}
                                                    </div>
                                                    {isResultOp && (
                                                      <div className="text-green-400 text-xs mt-1">
                                                        ✓ Calculation completed
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              }
                                            })}
                                          </div>
                                        </ScrollArea>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No tool execution traces available</p>
                          <p className="text-sm mt-2">Execute the agent with tools to see detailed traces here</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools" className="flex-1 flex flex-col p-6">
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Tool Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full">
                    <div className="space-y-3 pr-4">
                      {uniqueTools.length > 0 ? (
                        uniqueTools.map(tool => {
                          const count = traces.reduce((acc, trace) => acc + trace.tool_info.tools_used.filter(t => t === tool).length, 0);
                          const avgTime = traces
                            .filter(trace => trace.tool_info.tools_used.includes(tool))
                            .reduce((acc, trace) => acc + trace.execution_time, 0) / 
                            traces.filter(trace => trace.tool_info.tools_used.includes(tool)).length || 0;
                          
                          return (
                            <div key={tool} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`${getToolColor(tool)}`}>
                                  {getToolIcon(tool)}
                                </div>
                                <div>
                                  <span className="text-white font-medium">{tool}</span>
                                  <div className="text-xs text-gray-400">
                                    Avg time: {avgTime.toFixed(2)}s
                                  </div>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                {count} uses
                              </Badge>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No tools have been used yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="flex-1 flex flex-col p-6">
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pr-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Response Time Distribution</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Fast (&lt;5s)</span>
                              <span className="text-green-400">{traces.filter(t => t.execution_time < 5).length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Medium (5-15s)</span>
                              <span className="text-yellow-400">{traces.filter(t => t.execution_time >= 5 && t.execution_time < 15).length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Slow (&gt;15s)</span>
                              <span className="text-red-400">{traces.filter(t => t.execution_time >= 15).length}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Success Rate Trend</h4>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{successRate}%</div>
                            <div className="text-sm text-gray-400">Overall Success Rate</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StrandsToolTraceTooltip;