
// Types for guardrails
export interface Guardrail {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  severity: 'high' | 'medium' | 'low';
  projectId?: string;
}

// Pre-defined guardrails for our examples
export const globalGuardrails: Guardrail[] = [
  {
    id: 'pii-protection',
    name: 'PII Protection', 
    description: 'Prevent extraction and generation of personally identifiable information',
    category: 'security',
    enabled: true,
    severity: 'high',
  },
  {
    id: 'content-filter',
    name: 'Content Filter',
    description: 'Filter harmful, offensive or inappropriate content',
    category: 'safety',
    enabled: true,
    severity: 'high',
  },
  {
    id: 'code-security',
    name: 'Code Security Analysis',
    description: 'Detect and prevent security vulnerabilities in generated code',
    category: 'security',
    enabled: true,
    severity: 'medium',
  },
  {
    id: 'data-access',
    name: 'Data Access Control',
    description: 'Control access to sensitive data sources and enforce usage boundaries',
    category: 'governance',
    enabled: true,
    severity: 'high',
  },
  {
    id: 'resource-limits',
    name: 'Resource Consumption Limits',
    description: 'Prevent excessive resource usage that could lead to outages',
    category: 'operational',
    enabled: false,
    severity: 'medium',
  }
];

export const localGuardrails: Guardrail[] = [
  {
    id: 'hydrogen-safety',
    name: 'Hydrogen Safety Protocols', 
    description: 'Enforce safety protocols for hydrogen production and handling',
    category: 'security',
    enabled: true,
    projectId: 'hydrogen-production',
    severity: 'high',
  },
  {
    id: 'industrial-data',
    name: 'Industrial Data Protection',
    description: 'Protect proprietary industrial process data and trade secrets',
    category: 'privacy',
    enabled: true,
    projectId: 'hydrogen-production',
    severity: 'high',
  },
  {
    id: 'financial-constraints',
    name: 'Financial Model Constraints',
    description: 'Enforce constraints on financial forecasting and scenario modeling',
    category: 'operational',
    enabled: false,
    projectId: 'industrial-forecasting',
    severity: 'medium',
  },
  {
    id: 'regulatory-compliance',
    name: 'Industrial Regulatory Compliance',
    description: 'Ensure all AI suggestions adhere to industrial gas regulations',
    category: 'compliance',
    enabled: true,
    projectId: 'process-engineering',
    severity: 'medium',
  }
];
