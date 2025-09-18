
// Sample data for agents
export const agents = [
  {
    id: 1,
    name: 'Product Development Agent',
    status: 'Active',
    model: 'GPT-4o',
    owner: 'Product Team',
    lastActive: '2 hours ago',
    tools: ['Database', 'Market Research', 'Roadmap Planning'],
    data: ['Product Metrics', 'User Feedback', 'Industry Reports'],
    guardrails: ['Content Filter: High', 'PII Redaction: On', 'Budget: $50/day'],
    performance: { satisfaction: 92, accuracy: 89, responseTime: 1.2 },
    modelMetadata: {
      provider: 'OpenAI',
      size: '1.76 trillion parameters',
      contextLength: '128K tokens',
      costPerToken: '$0.005/1K tokens',
      capabilities: ['Multimodal', 'Code Generation', 'Complex Reasoning']
    }
  },
  {
    id: 2,
    name: 'Customer Support Agent',
    status: 'Active',
    model: 'Claude 3',
    owner: 'Support Team',
    lastActive: '5 mins ago',
    tools: ['CRM', 'Knowledge Base', 'Ticket Management'],
    data: ['Customer Profiles', 'Support Tickets', 'Product Documentation'],
    guardrails: ['Content Filter: High', 'Authentication Required', 'Budget: $75/day'],
    performance: { satisfaction: 95, accuracy: 91, responseTime: 0.8 },
    modelMetadata: {
      provider: 'Anthropic',
      size: '1.5 trillion parameters',
      contextLength: '200K tokens',
      costPerToken: '$0.008/1K tokens',
      capabilities: ['Multimodal', 'Nuanced Instructions', 'Long Context']
    }
  },
  {
    id: 3,
    name: 'Marketing Analysis Agent',
    status: 'Idle',
    model: 'GPT-4.5-preview',
    owner: 'Marketing Team',
    lastActive: '1 day ago',
    tools: ['Analytics', 'Content Generator', 'Social Media API'],
    data: ['Campaign Metrics', 'Audience Data', 'Market Trends'],
    guardrails: ['Content Filter: Medium', 'Brand Voice Control', 'Budget: $40/day'],
    performance: { satisfaction: 88, accuracy: 85, responseTime: 1.7 },
    modelMetadata: {
      provider: 'OpenAI',
      size: '2.1 trillion parameters',
      contextLength: '256K tokens',
      costPerToken: '$0.01/1K tokens',
      capabilities: ['Advanced Reasoning', 'Creative Generation', 'Fine-grained Control']
    }
  }
];
