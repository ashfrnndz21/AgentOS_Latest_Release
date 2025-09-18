export interface OverviewTabProps {
  totalAgents: number;
  toolNodes: any[];
  guardrailNodes: any[];
  databaseAccesses: number;
  deniedToolAccesses: number;
  deniedDatabaseAccesses: number;
  averageDecisionTime: string;
  totalTaskTime: string;
  onNodeClick: (nodeId: string) => void;
}

export interface AgentTraceabilityProps {
  decisionNodes: any[];
  lineageNodes: any[];
  lineageEdges: any[];
  decisionPathMetadata: any;
  dataLineageMetadata: any;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  projectName: string;
  agents: any[];
}

export interface ModelInfo {
  name: string;
  version: string;
  provider: string;
}

export interface GuardrailType {
  id: string;
  name: string;
  type: "pii" | "custom" | "sensitive" | "regex" | "llm";
  description: string;
  enabled: boolean;
  action: "log" | "warn" | "block" | "redact";
  scope: "local" | "global";
  severity: "low" | "medium" | "high";
  createdAt: string;
  pattern?: string;
  categories?: string[];
}
