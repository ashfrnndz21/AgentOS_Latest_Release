/**
 * Strands Orchestration Panel
 * Implements proper Strands SDK orchestration patterns with testing and rollback
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Play, 
  TestTube, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Workflow,
  Bot,
  Wrench,
  BarChart3,
  RefreshCw,
  Save,
  History,
  Shield,
  Zap,
  Users,
  MessageSquare,
  GitBranch,
  Target
} from 'lucide-react';
import { 
  strandsOrchestrationService, 
  FeatureFlags, 
  RollbackPoint,
  StrandsAgent,
  StrandsTool,
  TestResult,
  ValidationResult
} from '@/lib/services/StrandsOrchestrationService';

interface StrandsOrchestrationPanelProps {
  onAgentCreated?: (agent: StrandsAgent) => void;
  onToolCreated?: (tool: StrandsTool) => void;
  onWorkflowExecuted?: (result: any) => void;
}

export const StrandsOrchestrationPanel: React.FC<StrandsOrchestrationPanelProps> = ({
  onAgentCreated,
  onToolCreated,
  onWorkflowExecuted
}) => {
  const [activeTab, setActiveTab] = useState('orchestration');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(strandsOrchestrationService.getFeatureFlags());
  const [rollbackPoints, setRollbackPoints] = useState<RollbackPoint[]>([]);
  const [testing, setTesting] = useState<{
    agentId?: string;
    toolId?: string;
    testResults: TestResult[];
    isRunning: boolean;
  }>({
    testResults: [],
    isRunning: false
  });
  const [validation, setValidation] = useState<{
    agentId?: string;
    toolId?: string;
    results: ValidationResult[];
    isRunning: boolean;
  }>({
    results: [],
    isRunning: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load rollback points on mount
  useEffect(() => {
    setRollbackPoints(strandsOrchestrationService.getRollbackPoints());
  }, []);

  // Handle feature flag changes
  const handleFeatureFlagChange = useCallback((flag: keyof FeatureFlags, value: boolean) => {
    const newFlags = { ...featureFlags, [flag]: value };
    setFeatureFlags(newFlags);
    strandsOrchestrationService.updateFeatureFlags(newFlags);
    
    setSuccess(`Feature flag ${flag} ${value ? 'enabled' : 'disabled'}`);
    setTimeout(() => setSuccess(null), 3000);
  }, [featureFlags]);

  // Create rollback point
  const handleCreateRollbackPoint = useCallback(async () => {
    try {
      const name = prompt('Enter rollback point name:');
      const description = prompt('Enter rollback point description:');
      
      if (!name || !description) return;

      const rollbackPoint = strandsOrchestrationService.createRollbackPoint(name, description);
      setRollbackPoints(prev => [...prev, rollbackPoint]);
      
      setSuccess(`Rollback point "${name}" created successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(`Failed to create rollback point: ${error}`);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Execute rollback
  const handleRollback = useCallback(async (rollbackPointId: string) => {
    try {
      const success = await strandsOrchestrationService.rollbackToPoint(rollbackPointId);
      
      if (success) {
        setSuccess('Rollback executed successfully');
        setRollbackPoints(strandsOrchestrationService.getRollbackPoints());
      } else {
        setError('Rollback failed');
      }
      
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    } catch (error) {
      setError(`Rollback failed: ${error}`);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Test agent
  const handleTestAgent = useCallback(async (agentId: string) => {
    try {
      setTesting(prev => ({ ...prev, agentId, isRunning: true }));
      
      const testCases = [
        {
          id: 'test_1',
          name: 'Basic functionality test',
          description: 'Test basic agent functionality',
          input: { message: 'Hello, how are you?' },
          expected_output: { success: true },
          timeout: 30
        },
        {
          id: 'test_2',
          name: 'Tool usage test',
          description: 'Test agent tool usage',
          input: { message: 'Calculate 2 + 2' },
          expected_output: { success: true, result: '4' },
          timeout: 30
        }
      ];

      const results = await strandsOrchestrationService.testAgent(agentId, testCases);
      setTesting(prev => ({ ...prev, testResults: results, isRunning: false }));
      
      setSuccess(`Agent testing completed. ${results.filter(r => r.success).length}/${results.length} tests passed`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(`Agent testing failed: ${error}`);
      setTesting(prev => ({ ...prev, isRunning: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Test tool
  const handleTestTool = useCallback(async (toolId: string) => {
    try {
      setTesting(prev => ({ ...prev, toolId, isRunning: true }));
      
      const testCases = [
        {
          id: 'test_1',
          name: 'Basic functionality test',
          description: 'Test basic tool functionality',
          input: { test: 'input' },
          expected_output: { success: true },
          timeout: 30
        }
      ];

      const results = await strandsOrchestrationService.testTool(toolId, testCases);
      setTesting(prev => ({ ...prev, testResults: results, isRunning: false }));
      
      setSuccess(`Tool testing completed. ${results.filter(r => r.success).length}/${results.length} tests passed`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(`Tool testing failed: ${error}`);
      setTesting(prev => ({ ...prev, isRunning: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Validate agent
  const handleValidateAgent = useCallback(async (agentId: string) => {
    try {
      setValidation(prev => ({ ...prev, agentId, isRunning: true }));
      
      const result = await strandsOrchestrationService.validateAgent(agentId);
      setValidation(prev => ({ ...prev, results: [result], isRunning: false }));
      
      if (result.is_valid) {
        setSuccess('Agent validation passed');
      } else {
        setError(`Agent validation failed: ${result.errors.map(e => e.message).join(', ')}`);
      }
      
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    } catch (error) {
      setError(`Agent validation failed: ${error}`);
      setValidation(prev => ({ ...prev, isRunning: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Validate tool
  const handleValidateTool = useCallback(async (toolId: string) => {
    try {
      setValidation(prev => ({ ...prev, toolId, isRunning: true }));
      
      const result = await strandsOrchestrationService.validateTool(toolId);
      setValidation(prev => ({ ...prev, results: [result], isRunning: false }));
      
      if (result.is_valid) {
        setSuccess('Tool validation passed');
      } else {
        setError(`Tool validation failed: ${result.errors.map(e => e.message).join(', ')}`);
      }
      
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    } catch (error) {
      setError(`Tool validation failed: ${error}`);
      setValidation(prev => ({ ...prev, isRunning: false }));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  return (
    <div className="w-full h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Workflow className="h-5 w-5 text-purple-500" />
            Strands Orchestration
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {featureFlags.enable_rollback_mechanism ? 'Safe Mode' : 'Direct Mode'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateRollbackPoint}
              className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
            >
              <Save className="h-4 w-4 mr-1" />
              Create Rollback Point
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="m-4 bg-red-900/20 border-red-600">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="m-4 bg-green-900/20 border-green-600">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 m-4">
            <TabsTrigger value="orchestration" className="text-gray-300 data-[state=active]:text-white">
              Orchestration
            </TabsTrigger>
            <TabsTrigger value="features" className="text-gray-300 data-[state=active]:text-white">
              Features
            </TabsTrigger>
            <TabsTrigger value="testing" className="text-gray-300 data-[state=active]:text-white">
              Testing
            </TabsTrigger>
            <TabsTrigger value="rollback" className="text-gray-300 data-[state=active]:text-white">
              Rollback
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-300 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="orchestration" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-4 py-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-500" />
                        Agent Orchestration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Execution Strategy</Label>
                            <select className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                              <option value="sequential">Sequential</option>
                              <option value="parallel">Parallel</option>
                              <option value="hierarchical">Hierarchical</option>
                              <option value="adaptive">Adaptive</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300">Coordination Pattern</Label>
                            <select className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                              <option value="a2a">Agent-to-Agent</option>
                              <option value="hierarchical">Hierarchical Delegation</option>
                              <option value="workflow">Workflow Orchestration</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => {/* Handle agent creation */}}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Bot className="h-4 w-4 mr-2" />
                            Create Agent
                          </Button>
                          <Button
                            onClick={() => {/* Handle workflow creation */}}
                            variant="outline"
                            className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                          >
                            <Workflow className="h-4 w-4 mr-2" />
                            Create Workflow
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-blue-500" />
                        Tool Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Tool Discovery</Label>
                            <select className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                              <option value="static">Static Registry</option>
                              <option value="dynamic">Dynamic Discovery</option>
                              <option value="mcp">MCP Integration</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300">Composition Strategy</Label>
                            <select className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                              <option value="sequential">Sequential</option>
                              <option value="parallel">Parallel</option>
                              <option value="conditional">Conditional</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => {/* Handle tool creation */}}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Wrench className="h-4 w-4 mr-2" />
                            Create Tool
                          </Button>
                          <Button
                            onClick={() => {/* Handle tool composition */}}
                            variant="outline"
                            className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
                          >
                            <GitBranch className="h-4 w-4 mr-2" />
                            Compose Tools
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="features" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-4 py-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="h-5 w-5 text-purple-500" />
                        Feature Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(featureFlags).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <Label className="text-white font-medium">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Label>
                              <p className="text-gray-400 text-sm">
                                {getFeatureDescription(key as keyof FeatureFlags)}
                              </p>
                            </div>
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) => handleFeatureFlagChange(key as keyof FeatureFlags, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="testing" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-4 py-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-green-500" />
                        Testing Framework
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Agent ID</Label>
                            <Input
                              placeholder="Enter agent ID to test"
                              value={testing.agentId || ''}
                              onChange={(e) => setTesting(prev => ({ ...prev, agentId: e.target.value }))}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Tool ID</Label>
                            <Input
                              placeholder="Enter tool ID to test"
                              value={testing.toolId || ''}
                              onChange={(e) => setTesting(prev => ({ ...prev, toolId: e.target.value }))}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => testing.agentId && handleTestAgent(testing.agentId)}
                            disabled={!testing.agentId || testing.isRunning}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {testing.isRunning ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4 mr-2" />
                            )}
                            Test Agent
                          </Button>
                          <Button
                            onClick={() => testing.toolId && handleTestTool(testing.toolId)}
                            disabled={!testing.toolId || testing.isRunning}
                            variant="outline"
                            className="border-green-400 text-green-400 hover:bg-green-400/10"
                          >
                            <TestTube className="h-4 w-4 mr-2" />
                            Test Tool
                          </Button>
                        </div>

                        {testing.testResults.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-white font-medium">Test Results</h4>
                            {testing.testResults.map((result, index) => (
                              <div key={index} className="p-3 bg-gray-700 rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="text-white">{result.test_case.name}</span>
                                  <Badge variant={result.success ? "default" : "destructive"}>
                                    {result.success ? "Passed" : "Failed"}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  Execution time: {result.execution_time}ms
                                </p>
                                {result.error && (
                                  <p className="text-red-400 text-sm mt-1">{result.error}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rollback" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-4 py-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <History className="h-5 w-5 text-orange-500" />
                        Rollback Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {rollbackPoints.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <History className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                            <p>No rollback points created</p>
                            <p className="text-sm">Create a rollback point to enable safe testing</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {rollbackPoints.map((point) => (
                              <div key={point.id} className="p-3 bg-gray-700 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-white font-medium">{point.name}</h4>
                                    <p className="text-gray-400 text-sm">{point.description}</p>
                                    <p className="text-gray-500 text-xs">
                                      Created: {new Date(point.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {point.status}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRollback(point.id)}
                                      className="text-orange-400 border-orange-400 hover:bg-orange-400/10"
                                    >
                                      <RotateCcw className="h-4 w-4 mr-1" />
                                      Rollback
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="h-full mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-4 py-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        Analytics & Monitoring
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-400">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                        <p>Analytics will be available here</p>
                        <p className="text-sm">Enable advanced analytics feature flag to access</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// Helper function to get feature descriptions
function getFeatureDescription(flag: keyof FeatureFlags): string {
  const descriptions: Record<keyof FeatureFlags, string> = {
    enable_enhanced_tool_registry: 'Enable enhanced tool registry with dynamic discovery',
    enable_agent_delegation: 'Enable hierarchical agent delegation patterns',
    enable_a2a_communication: 'Enable Agent-to-Agent communication protocols',
    enable_hierarchical_orchestration: 'Enable hierarchical workflow orchestration',
    enable_tool_composition: 'Enable tool composition and chaining',
    enable_hot_reloading: 'Enable hot reloading for development',
    enable_advanced_analytics: 'Enable advanced analytics and monitoring',
    enable_rollback_mechanism: 'Enable rollback mechanism for safe testing'
  };
  
  return descriptions[flag] || 'No description available';
}


