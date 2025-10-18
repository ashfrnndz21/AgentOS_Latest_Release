import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Brain, Zap, Target, Clock, FileText, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrchestratorConfig {
  // Core Settings
  orchestrator_model: string;
  main_orchestrator_port: number;
  strands_sdk_url: string;
  a2a_service_url: string;
  ollama_base_url: string;
  
  // Model Parameters
  temperature_query_analysis: number;
  temperature_agent_analysis: number;
  temperature_reflection: number;
  temperature_instruction: number;
  temperature_deduction: number;
  temperature_synthesis: number;
  
  top_p_query_analysis: number;
  top_p_agent_analysis: number;
  top_p_reflection: number;
  top_p_instruction: number;
  top_p_deduction: number;
  top_p_synthesis: number;
  
  max_tokens_query_analysis: number;
  max_tokens_agent_analysis: number;
  max_tokens_reflection: number;
  max_tokens_instruction: number;
  max_tokens_deduction: number;
  max_tokens_synthesis: number;
  
  // Timeout Settings
  timeout_a2a_discovery: number;
  timeout_query_analysis: number;
  timeout_agent_analysis: number;
  timeout_reflection: number;
  timeout_instruction: number;
  timeout_deduction: number;
  timeout_synthesis: number;
  timeout_a2a_message: number;
  timeout_a2a_register: number;
  
  // Scoring & Thresholds
  minimum_relevance_threshold: number;
  default_confidence_score: number;
  technical_capability_weight: number;
  creative_capability_weight: number;
  general_capability_weight: number;
  code_execution_weight: number;
  file_read_weight: number;
  calculator_weight: number;
  domain_expertise_weight: number;
  
  // System Prompts
  query_analysis_prompt: string;
  agent_analysis_prompt: string;
  reflection_prompt: string;
  instruction_generation_prompt: string;
  output_deduction_prompt: string;
  synthesis_prompt: string;
  
  // Advanced Options
  enable_json_formatting: boolean;
  enable_markdown_formatting: boolean;
  enable_structured_content_formatting: boolean;
  enable_technical_artifact_removal: boolean;
  enable_reflection_engine: boolean;
  enable_quality_scoring: boolean;
  logging_level: string;
  
  // Available Models
  available_models: string[];
}

interface MainSystemOrchestratorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CONFIG: Partial<OrchestratorConfig> = {
  orchestrator_model: 'granite4:micro',
  main_orchestrator_port: 5031,
  strands_sdk_url: 'http://localhost:5006',
  a2a_service_url: 'http://localhost:5008',
  ollama_base_url: 'http://localhost:11434',
  
  // Default Model Parameters
  temperature_query_analysis: 0.3,
  temperature_agent_analysis: 0.2,
  temperature_reflection: 0.2,
  temperature_instruction: 0.3,
  temperature_deduction: 0.2,
  temperature_synthesis: 0.3,
  
  top_p_query_analysis: 0.9,
  top_p_agent_analysis: 0.8,
  top_p_reflection: 0.9,
  top_p_instruction: 0.9,
  top_p_deduction: 0.9,
  top_p_synthesis: 0.9,
  
  max_tokens_query_analysis: 1000,
  max_tokens_agent_analysis: 1200,
  max_tokens_reflection: 800,
  max_tokens_instruction: 600,
  max_tokens_deduction: 800,
  max_tokens_synthesis: 2000,
  
  // Default Timeout Settings
  timeout_a2a_discovery: 5,
  timeout_query_analysis: 30,
  timeout_agent_analysis: 45,
  timeout_reflection: 30,
  timeout_instruction: 30,
  timeout_deduction: 30,
  timeout_synthesis: 60,
  timeout_a2a_message: 120,
  timeout_a2a_register: 10,
  
  // Default Scoring & Thresholds
  minimum_relevance_threshold: 0.3,
  default_confidence_score: 0.7,
  technical_capability_weight: 0.4,
  creative_capability_weight: 0.4,
  general_capability_weight: 0.2,
  code_execution_weight: 0.4,
  file_read_weight: 0.3,
  calculator_weight: 0.3,
  domain_expertise_weight: 0.3,
  
  // Default Advanced Options
  enable_json_formatting: true,
  enable_markdown_formatting: true,
  enable_structured_content_formatting: true,
  enable_technical_artifact_removal: true,
  enable_reflection_engine: true,
  enable_quality_scoring: true,
  logging_level: 'INFO',
  
  available_models: ['granite4:micro', 'qwen3:1.7b', 'llama3.2', 'llama3.1', 'mistral', 'codellama']
};

const DEFAULT_PROMPTS = {
  query_analysis_prompt: `You are the Main System Orchestrator. Analyze this query intelligently to determine the optimal execution strategy.

Query: "{query}"

Available agents: {available_agents}

ANALYSIS APPROACH:
1. **Intent Recognition**: Identify the primary intent (creative, technical, analytical)
2. **Domain Classification**: Determine if query requires single or multiple domains
3. **Task Complexity**: Assess if query needs one agent or multiple agents
4. **Execution Strategy**: Determine optimal coordination approach

IMPORTANT GUIDELINES:
- **Creative queries** (poems, stories, art) are typically SINGLE-DOMAIN and SINGLE-AGENT
- **Technical queries** (code, math, analysis) are typically SINGLE-DOMAIN and SINGLE-AGENT  
- **Multi-domain** only when query explicitly requires different expertise areas
- **Multi-agent** only when query has multiple independent tasks or requires coordination

Provide analysis in JSON format:
{
    "query_type": "technical|creative|analytical|multi_domain",
    "task_nature": "direct|sequential|parallel",
    "agentic_workflow_pattern": "single_agent|multi_agent|varying_domain",
    "orchestration_strategy": "sequential|parallel|hybrid",
    "complexity_level": "simple|moderate|complex",
    "domain_analysis": {
        "primary_domain": "technical|creative|analytical",
        "secondary_domains": [],
        "is_multi_domain": false
    },
    "workflow_steps": ["step1", "step2", "step3"],
    "reasoning": "Clear explanation of why this classification was chosen"
}

DECISION CRITERIA:
- **single_agent**: Query has one clear intent that one agent can handle
- **multi_agent**: Query has multiple distinct tasks requiring different agents
- **varying_domain**: Query explicitly spans different expertise areas
- **is_multi_domain**: Only true if query explicitly requires multiple domains`,

  agent_analysis_prompt: `You are the Main System Orchestrator. Analyze each agent's relevance to this specific query using domain expertise scoring.

Query: "{query}"

Available Agents:
{agent_details}

SCORING CRITERIA:
1. Domain expertise match (0.0-1.0)
2. Capability alignment (0.0-1.0)  
3. Task suitability (0.0-1.0)
4. Overall relevance (0.0-1.0)

Provide analysis in JSON format:
{{
    "agent_analyses": [
        {{
            "agent_id": "agent_id",
            "agent_name": "AgentName",
            "relevance_score": 0.95,
            "domain_match": 0.9,
            "capability_match": 0.85,
            "task_suitability": 0.9,
            "reasoning": "Detailed explanation of why this agent is suitable",
            "handles_aspects": ["aspect1", "aspect2"],
            "confidence": 0.9
        }}
    ],
    "multi_agent_analysis": {{
        "requires_multiple_agents": true/false,
        "coordination_strategy": "sequential|parallel|hybrid",
        "reasoning": "Explanation of multi-agent coordination needs"
    }}
}}`,

  reflection_prompt: `You are the Main System Orchestrator's reflection engine. Analyze this user query and determine:

1. **Task Type**: What kind of task is this? (coding, analysis, creative, research, etc.)
2. **Complexity Level**: Simple, moderate, or complex?
3. **Required Skills**: What capabilities are needed?
4. **Success Criteria**: How will we know when it's complete?
5. **Potential Challenges**: What might be difficult?
6. **Resource Requirements**: What agents/tools are needed?

Provide structured analysis in JSON format.`,

  instruction_generation_prompt: `You are generating specific instructions for an agent. Based on the task analysis, create clear, actionable instructions.

TASK ANALYSIS:
{task_analysis}

AGENT INFO:
-- Name: {agent_name}
- Model: {agent_model}
-- Capabilities: {agent_capabilities}

Create specific, actionable instructions that the agent can follow to complete this task effectively.`,

  output_deduction_prompt: `You are analyzing an agent's output to determine its quality and extract necessary information.

AGENT OUTPUT:
{agent_output}

SUCCESS CRITERIA:
{success_criteria}

Provide analysis in JSON format:
{
    "quality_score": 0.0-1.0,
    "meets_criteria": true/false,
    "extracted_information": "key information from the output",
    "improvements_needed": ["suggestion1", "suggestion2"],
    "confidence": 0.0-1.0
}`,

  synthesis_prompt: `You are the Main System Orchestrator. Create a comprehensive, professional response that synthesizes all agent outputs into a cohesive answer to the user's query.

USER QUERY: "{query}"

AGENT OUTPUTS:
{agent_outputs}

SYNTHESIS REQUIREMENTS:
1. **Coherence**: Ensure the response flows logically
2. **Completeness**: Address all aspects of the query
3. **Clarity**: Make complex information accessible
4. **Professionalism**: Maintain high quality standards

Create a comprehensive response that effectively answers the user's query using all available information.`
};

export function MainSystemOrchestratorConfigModal({ 
  isOpen, 
  onClose 
}: MainSystemOrchestratorConfigModalProps) {
  const [config, setConfig] = useState<OrchestratorConfig>(DEFAULT_CONFIG as OrchestratorConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load configuration on modal open
  useEffect(() => {
    if (isOpen) {
      loadConfiguration();
    }
  }, [isOpen]);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5031/api/main-orchestrator/config');
      if (response.ok) {
        const data = await response.json();
        setConfig({ ...DEFAULT_CONFIG, ...DEFAULT_PROMPTS, ...data } as OrchestratorConfig);
      } else {
        // Use default config if API fails
        setConfig({ ...DEFAULT_CONFIG, ...DEFAULT_PROMPTS } as OrchestratorConfig);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      setConfig({ ...DEFAULT_CONFIG, ...DEFAULT_PROMPTS } as OrchestratorConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5031/api/main-orchestrator/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: "Configuration Saved",
          description: "Main System Orchestrator configuration has been updated successfully.",
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: keyof OrchestratorConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading configuration...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Main System Orchestrator Configuration
          </DialogTitle>
          <DialogDescription>
            Configure all parameters for the Main System Orchestrator including model settings, 
            prompts, scoring thresholds, and advanced options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="timeouts">Timeouts</TabsTrigger>
              <TabsTrigger value="scoring">Scoring</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Model Settings Tab */}
            <TabsContent value="model" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Model Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure the AI model and core system settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orchestrator_model">Orchestrator Model</Label>
                      <Select 
                        value={config.orchestrator_model} 
                        onValueChange={(value) => updateConfig('orchestrator_model', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {config.available_models?.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logging_level">Logging Level</Label>
                      <Select 
                        value={config.logging_level} 
                        onValueChange={(value) => updateConfig('logging_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEBUG">DEBUG</SelectItem>
                          <SelectItem value="INFO">INFO</SelectItem>
                          <SelectItem value="WARNING">WARNING</SelectItem>
                          <SelectItem value="ERROR">ERROR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="main_orchestrator_port">Main Orchestrator Port</Label>
                      <Input
                        id="main_orchestrator_port"
                        type="number"
                        value={config.main_orchestrator_port}
                        onChange={(e) => updateConfig('main_orchestrator_port', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="strands_sdk_url">Strands SDK URL</Label>
                      <Input
                        id="strands_sdk_url"
                        value={config.strands_sdk_url}
                        onChange={(e) => updateConfig('strands_sdk_url', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="a2a_service_url">A2A Service URL</Label>
                      <Input
                        id="a2a_service_url"
                        value={config.a2a_service_url}
                        onChange={(e) => updateConfig('a2a_service_url', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ollama_base_url">Ollama Base URL</Label>
                      <Input
                        id="ollama_base_url"
                        value={config.ollama_base_url}
                        onChange={(e) => updateConfig('ollama_base_url', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Model Parameters Tab */}
            <TabsContent value="parameters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Model Parameters
                  </CardTitle>
                  <CardDescription>
                    Configure temperature, top_p, and max_tokens for different operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Temperature Settings */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Temperature Settings</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Query Analysis</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={config.temperature_query_analysis}
                          onChange={(e) => updateConfig('temperature_query_analysis', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Agent Analysis</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={config.temperature_agent_analysis}
                          onChange={(e) => updateConfig('temperature_agent_analysis', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reflection</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={config.temperature_reflection}
                          onChange={(e) => updateConfig('temperature_reflection', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instruction</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={config.temperature_instruction}
                          onChange={(e) => updateConfig('temperature_instruction', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Deduction</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={config.temperature_deduction}
                          onChange={(e) => updateConfig('temperature_deduction', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Synthesis</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={config.temperature_synthesis}
                          onChange={(e) => updateConfig('temperature_synthesis', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Max Tokens Settings */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Max Tokens Settings</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Query Analysis</Label>
                        <Input
                          type="number"
                          min="100"
                          max="5000"
                          value={config.max_tokens_query_analysis}
                          onChange={(e) => updateConfig('max_tokens_query_analysis', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Agent Analysis</Label>
                        <Input
                          type="number"
                          min="100"
                          max="5000"
                          value={config.max_tokens_agent_analysis}
                          onChange={(e) => updateConfig('max_tokens_agent_analysis', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reflection</Label>
                        <Input
                          type="number"
                          min="100"
                          max="5000"
                          value={config.max_tokens_reflection}
                          onChange={(e) => updateConfig('max_tokens_reflection', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instruction</Label>
                        <Input
                          type="number"
                          min="100"
                          max="5000"
                          value={config.max_tokens_instruction}
                          onChange={(e) => updateConfig('max_tokens_instruction', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Deduction</Label>
                        <Input
                          type="number"
                          min="100"
                          max="5000"
                          value={config.max_tokens_deduction}
                          onChange={(e) => updateConfig('max_tokens_deduction', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Synthesis</Label>
                        <Input
                          type="number"
                          min="100"
                          max="5000"
                          value={config.max_tokens_synthesis}
                          onChange={(e) => updateConfig('max_tokens_synthesis', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeout Settings Tab */}
            <TabsContent value="timeouts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeout Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure timeout values for different operations (in seconds)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>A2A Discovery</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={config.timeout_a2a_discovery}
                        onChange={(e) => updateConfig('timeout_a2a_discovery', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Query Analysis</Label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={config.timeout_query_analysis}
                        onChange={(e) => updateConfig('timeout_query_analysis', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agent Analysis</Label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={config.timeout_agent_analysis}
                        onChange={(e) => updateConfig('timeout_agent_analysis', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reflection</Label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={config.timeout_reflection}
                        onChange={(e) => updateConfig('timeout_reflection', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instruction</Label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={config.timeout_instruction}
                        onChange={(e) => updateConfig('timeout_instruction', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deduction</Label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={config.timeout_deduction}
                        onChange={(e) => updateConfig('timeout_deduction', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Synthesis</Label>
                      <Input
                        type="number"
                        min="10"
                        max="300"
                        value={config.timeout_synthesis}
                        onChange={(e) => updateConfig('timeout_synthesis', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>A2A Message</Label>
                      <Input
                        type="number"
                        min="30"
                        max="300"
                        value={config.timeout_a2a_message}
                        onChange={(e) => updateConfig('timeout_a2a_message', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>A2A Register</Label>
                      <Input
                        type="number"
                        min="5"
                        max="60"
                        value={config.timeout_a2a_register}
                        onChange={(e) => updateConfig('timeout_a2a_register', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scoring & Thresholds Tab */}
            <TabsContent value="scoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Scoring & Thresholds
                  </CardTitle>
                  <CardDescription>
                    Configure scoring weights and thresholds for agent selection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Relevance Threshold</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={config.minimum_relevance_threshold}
                        onChange={(e) => updateConfig('minimum_relevance_threshold', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Confidence Score</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={config.default_confidence_score}
                        onChange={(e) => updateConfig('default_confidence_score', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Capability Weights</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Technical Capability</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={config.technical_capability_weight}
                          onChange={(e) => updateConfig('technical_capability_weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Creative Capability</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={config.creative_capability_weight}
                          onChange={(e) => updateConfig('creative_capability_weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>General Capability</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={config.general_capability_weight}
                          onChange={(e) => updateConfig('general_capability_weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Code Execution</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={config.code_execution_weight}
                          onChange={(e) => updateConfig('code_execution_weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>File Read</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={config.file_read_weight}
                          onChange={(e) => updateConfig('file_read_weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Calculator</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={config.calculator_weight}
                          onChange={(e) => updateConfig('calculator_weight', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Domain Expertise</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={config.domain_expertise_weight}
                          onChange={(e) => updateConfig('domain_expertise_weight', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Prompts Tab */}
            <TabsContent value="prompts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    System Prompts
                  </CardTitle>
                  <CardDescription>
                    Configure the system prompts used by the orchestrator
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Query Analysis Prompt</Label>
                      <Textarea
                        value={config.query_analysis_prompt}
                        onChange={(e) => updateConfig('query_analysis_prompt', e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Agent Analysis Prompt</Label>
                      <Textarea
                        value={config.agent_analysis_prompt}
                        onChange={(e) => updateConfig('agent_analysis_prompt', e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Reflection Prompt</Label>
                      <Textarea
                        value={config.reflection_prompt}
                        onChange={(e) => updateConfig('reflection_prompt', e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Instruction Generation Prompt</Label>
                      <Textarea
                        value={config.instruction_generation_prompt}
                        onChange={(e) => updateConfig('instruction_generation_prompt', e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Output Deduction Prompt</Label>
                      <Textarea
                        value={config.output_deduction_prompt}
                        onChange={(e) => updateConfig('output_deduction_prompt', e.target.value)}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Synthesis Prompt</Label>
                      <Textarea
                        value={config.synthesis_prompt}
                        onChange={(e) => updateConfig('synthesis_prompt', e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Options Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Advanced Options
                  </CardTitle>
                  <CardDescription>
                    Configure advanced features and formatting options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Formatting Options</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable JSON Formatting</Label>
                          <p className="text-xs text-gray-400">Parse and format JSON responses</p>
                        </div>
                        <Switch
                          checked={config.enable_json_formatting}
                          onCheckedChange={(checked) => updateConfig('enable_json_formatting', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Markdown Formatting</Label>
                          <p className="text-xs text-gray-400">Render markdown in responses</p>
                        </div>
                        <Switch
                          checked={config.enable_markdown_formatting}
                          onCheckedChange={(checked) => updateConfig('enable_markdown_formatting', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Structured Content Formatting</Label>
                          <p className="text-xs text-gray-400">Format poems and structured data</p>
                        </div>
                        <Switch
                          checked={config.enable_structured_content_formatting}
                          onCheckedChange={(checked) => updateConfig('enable_structured_content_formatting', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Technical Artifact Removal</Label>
                          <p className="text-xs text-gray-400">Clean up technical metadata</p>
                        </div>
                        <Switch
                          checked={config.enable_technical_artifact_removal}
                          onCheckedChange={(checked) => updateConfig('enable_technical_artifact_removal', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Engine Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Reflection Engine</Label>
                          <p className="text-xs text-gray-400">Use reflection for task analysis</p>
                        </div>
                        <Switch
                          checked={config.enable_reflection_engine}
                          onCheckedChange={(checked) => updateConfig('enable_reflection_engine', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Quality Scoring</Label>
                          <p className="text-xs text-gray-400">Score agent output quality</p>
                        </div>
                        <Switch
                          checked={config.enable_quality_scoring}
                          onCheckedChange={(checked) => updateConfig('enable_quality_scoring', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" onClick={loadConfiguration}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveConfiguration} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
