
export interface Agent {
  id: number;
  name: string;
  status: string;
  model: string;
  owner: string;
  lastActive: string;
  tools: string[];
  data: string[];
  guardrails: string[];
  performance: { satisfaction: number; accuracy: number; responseTime: number };
  modelMetadata?: {
    provider: string;
    size: string;
    contextLength: string;
    costPerToken?: string;
    capabilities?: string[];
  };
}
