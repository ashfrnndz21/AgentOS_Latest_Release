
import { ReactNode } from 'react';

export interface AgentFormValues {
  name: string;
  model: string;
  provider: string;
  role: string;
  description: string;
  memory: {
    shortTerm: boolean;
    longTerm: boolean;
    summary: boolean;
    entity: boolean;
  };
  tools: string[];
  mcpTools: { toolId: string; serverId: string; }[];
  mcpServers: string[];
  guardrails: {
    global: boolean;
    local: boolean;
  };
  databaseAccess?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  provider: string;
  capabilities: {
    reasoning: number;
    multimodal: boolean;
    speed: number;
    knowledge: number;
  };
  cost: number;
  badge?: string;
}

export interface ToolOption {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}

export interface RoleOption {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}

export interface MemoryOption {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}
