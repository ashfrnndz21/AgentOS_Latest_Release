
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
    id: 'network-data',
    name: 'Network Data Access', 
    description: 'Control access to network infrastructure data by role',
    category: 'security',
    enabled: true,
    projectId: 'network-capex',
    severity: 'high',
  },
  {
    id: 'customer-data',
    name: 'Customer Data Protection',
    description: 'Restrict and anonymize customer data in project-specific contexts',
    category: 'privacy',
    enabled: true,
    projectId: 'network-capex',
    severity: 'high',
  },
  {
    id: 'project-constraints',
    name: 'Project Budget Constraints',
    description: 'Enforce budget limitations on AI agent recommendations',
    category: 'operational',
    enabled: false,
    projectId: 'network-capex',
    severity: 'medium',
  },
  {
    id: 'technical-compliance',
    name: 'Technical Standards Compliance',
    description: 'Ensure all AI suggestions adhere to telecom technical standards',
    category: 'compliance',
    enabled: true,
    projectId: 'network-capex',
    severity: 'medium',
  }
];
