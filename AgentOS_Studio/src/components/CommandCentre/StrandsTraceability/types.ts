/**
 * Strands-Enhanced Traceability Types
 * Aligned with Strands workflow patterns and Air Liquide industrial processes
 */

export interface StrandsExecutionTrace {
  workflowId: string;
  executionId: string;
  workflowName: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'error' | 'paused';
  executionPath: string[];
  nodeExecutions: Map<string, NodeExecutionTrace>;
  contextEvolution: ContextSnapshot[];
  handoffChain: HandoffTrace[];
  reasoningChain: ReasoningTrace[];
  toolUsagePattern: ToolUsageTrace[];
  metrics: StrandsExecutionMetrics;
}

export interface NodeExecutionTrace {
  nodeId: string;
  nodeName: string;
  nodeType: 'strands-agent' | 'strands-tool' | 'strands-decision' | 'strands-handoff' | 'strands-guardrail';
  startTime: Date;
  endTime?: Date;
  duration: number;
  inputContext: any;
  outputContext: any;
  reasoning: StrandsReasoning;
  toolsUsed: string[];
  tokensConsumed: number;
  confidence: number;
  errors?: string[];
  performance: PerformanceMetrics;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface StrandsReasoning {
  objective: string;
  approach: string;
  steps: ReasoningStep[];
  conclusion: string;
  confidence: number;
  alternatives?: string[];
  contextUsed: string[];
  toolsConsidered: string[];
}

export interface ReasoningStep {
  step: number;
  description: string;
  input: any;
  output: any;
  reasoning: string;
  confidence: number;
  duration: number;
}

export interface ContextSnapshot {
  timestamp: Date;
  nodeId: string;
  contextData: any;
  contextSize: number;
  compressionLevel: 'none' | 'summary' | 'key_points';
  preservedMemory: boolean;
}

export interface HandoffTrace {
  fromNodeId: string;
  toNodeId: string;
  timestamp: Date;
  contextTransferred: 'full' | 'compressed' | 'selective';
  contextSize: number;
  handoffReason: string;
  expertiseMatch: boolean;
  success: boolean;
}

export interface ReasoningTrace {
  nodeId: string;
  timestamp: Date;
  reasoningType: 'sequential' | 'parallel' | 'conditional' | 'adaptive';
  reasoningDepth: number;
  contextUtilization: number;
  toolSelectionLogic: string;
  confidenceEvolution: number[];
}

export interface ToolUsageTrace {
  nodeId: string;
  toolName: string;
  toolCategory: string;
  timestamp: Date;
  duration: number;
  inputSize: number;
  outputSize: number;
  success: boolean;
  error?: string;
  apiCalls?: number;
}

export interface StrandsExecutionMetrics {
  totalExecutionTime: number;
  nodeExecutionTimes: Record<string, number>;
  totalTokensUsed: number;
  averageConfidence: number;
  toolsUsed: string[];
  handoffCount: number;
  errorCount: number;
  successRate: number;
  contextEfficiency: number;
  reasoningQuality: number;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  throughput: number;
  errorRate: number;
}

// Air Liquide Industrial Process Traces
export interface IndustrialProcessTrace {
  processType: 'hydrogen-production' | 'financial-forecasting' | 'process-engineering';
  safetyChecks: SafetyCheckTrace[];
  qualityControls: QualityControlTrace[];
  complianceValidations: ComplianceTrace[];
  optimizationSteps: OptimizationTrace[];
}

export interface SafetyCheckTrace {
  checkId: string;
  checkType: string;
  timestamp: Date;
  result: 'pass' | 'fail' | 'warning';
  parameters: Record<string, any>;
  thresholds: Record<string, any>;
  recommendations?: string[];
}

export interface QualityControlTrace {
  controlId: string;
  qualityMetric: string;
  timestamp: Date;
  measuredValue: number;
  targetValue: number;
  tolerance: number;
  status: 'within_spec' | 'out_of_spec' | 'marginal';
}

export interface ComplianceTrace {
  regulationId: string;
  regulationType: string;
  timestamp: Date;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
  auditTrail: string[];
  documentation: string[];
}

export interface OptimizationTrace {
  optimizationId: string;
  optimizationType: string;
  timestamp: Date;
  beforeMetrics: Record<string, number>;
  afterMetrics: Record<string, number>;
  improvement: number;
  recommendations: string[];
}

// Strands Workflow Visualization Types
export interface StrandsWorkflowVisualization {
  executionFlow: ExecutionFlowGraph;
  reasoningBubbles: ReasoningVisualization[];
  contextFlow: ContextFlowVisualization;
  toolUsageIndicators: ToolUsageVisualization[];
  performanceHeatmap: PerformanceVisualization;
}

export interface ExecutionFlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
  currentNode?: string;
  executionPath: string[];
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    performance: number;
    confidence: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  style: Record<string, any>;
}

export interface ReasoningVisualization {
  nodeId: string;
  position: { x: number; y: number };
  reasoning: StrandsReasoning;
  expanded: boolean;
}

export interface ContextFlowVisualization {
  flows: ContextFlow[];
  currentContext: any;
  contextSize: number;
}

export interface ContextFlow {
  fromNode: string;
  toNode: string;
  contextData: any;
  compressionRatio: number;
  transferTime: number;
}

export interface ToolUsageVisualization {
  nodeId: string;
  tools: ToolUsage[];
  totalUsage: number;
}

export interface ToolUsage {
  toolName: string;
  usageCount: number;
  averageDuration: number;
  successRate: number;
}

export interface PerformanceVisualization {
  heatmapData: HeatmapPoint[];
  performanceMetrics: Record<string, number>;
  bottlenecks: string[];
}

export interface HeatmapPoint {
  nodeId: string;
  x: number;
  y: number;
  value: number;
  metric: string;
}

// Analytics Types
export interface StrandsAnalytics {
  workflowEfficiency: WorkflowEfficiencyAnalytics;
  reasoningQuality: ReasoningQualityAnalytics;
  collaborationPatterns: CollaborationAnalytics;
  industrialMetrics: IndustrialAnalytics;
}

export interface WorkflowEfficiencyAnalytics {
  executionTime: TimeAnalytics;
  tokenUsage: TokenAnalytics;
  toolUtilization: ToolAnalytics;
  agentPerformance: AgentAnalytics;
}

export interface ReasoningQualityAnalytics {
  confidenceDistribution: number[];
  reasoningDepth: number[];
  decisionAccuracy: number;
  contextUtilization: number;
}

export interface CollaborationAnalytics {
  handoffEfficiency: number;
  contextPreservation: number;
  agentSpecialization: Record<string, number>;
  loadDistribution: Record<string, number>;
}

export interface IndustrialAnalytics {
  safetyCompliance: number;
  qualityMetrics: Record<string, number>;
  processEfficiency: number;
  regulatoryCompliance: number;
}

export interface TimeAnalytics {
  average: number;
  median: number;
  min: number;
  max: number;
  trend: number[];
}

export interface TokenAnalytics {
  totalUsed: number;
  averagePerNode: number;
  efficiency: number;
  costEstimate: number;
}

export interface ToolAnalytics {
  mostUsed: string[];
  efficiency: Record<string, number>;
  errorRates: Record<string, number>;
}

export interface AgentAnalytics {
  performance: Record<string, number>;
  specialization: Record<string, string[]>;
  collaboration: Record<string, number>;
}

// Component Props
export interface StrandsTraceabilityProps {
  selectedProject: string;
  projectData: any;
  currentIndustry: any;
  onNodeClick?: (nodeId: string) => void;
}

export interface StrandsOverviewProps {
  executionTrace: StrandsExecutionTrace;
  analytics: StrandsAnalytics;
  onNodeClick?: (nodeId: string) => void;
}

export interface StrandsWorkflowViewProps {
  executionTrace: StrandsExecutionTrace;
  visualization: StrandsWorkflowVisualization;
  selectedNode?: string;
  onNodeClick?: (nodeId: string) => void;
}

export interface StrandsReasoningViewProps {
  executionTrace: StrandsExecutionTrace;
  selectedNode?: string;
  onNodeClick?: (nodeId: string) => void;
}

export interface StrandsAnalyticsViewProps {
  analytics: StrandsAnalytics;
  executionTrace: StrandsExecutionTrace;
}