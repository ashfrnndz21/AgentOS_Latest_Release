
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  reasoning?: ReasoningOutput;
}

export interface ReasoningOutput {
  thought: string;
  reasoning: Array<{
    step: string;
    confidence?: number;
  } | string>;
  constraints: string[];
  verification: string;
  confidence: number;
  objective?: string;
  tools?: string[];
  databases?: string[];
  implementation?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  department: string;
  agents: Array<{
    name: string;
    role: string;
    description?: string;
  }>;
  tools: string[];
  databases: string[];
  workflow?: any[];
  created: string;
}
