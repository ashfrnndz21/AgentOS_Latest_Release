// Define telco-specific project tiles configuration
import { ProjectInfo } from './ProjectTiles';

export const getTelcoProjects = (): ProjectInfo[] => {
  return [
    {
      id: 'network-operations',
      name: 'Network Operations Center',
      description: 'Automated network monitoring, fault detection, and performance optimization',
      agentCount: 8,
      tools: [
        'Network Monitoring API',
        'Performance Analytics Engine',
        'Fault Detection System',
        'Auto-Remediation Tools',
        'Capacity Planning Models',
        'Traffic Analysis Suite'
      ],
      databases: [
        'Network Topology DB',
        'Performance Metrics DB',
        'Fault Management DB',
        'Configuration DB',
        'Traffic Analytics DB'
      ],
      globalGuardrails: [
        'SLA Compliance Monitor',
        'Network Security Policy',
        'Performance Threshold Guards',
        'Emergency Response Protocol'
      ],
      localGuardrails: [
        'Automated Escalation Rules',
        'Change Management Controls',
        'Resource Allocation Limits'
      ],
      color: 'border-t-blue-500',
      department: 'Network'
    },
    {
      id: 'customer-experience',
      name: 'Customer Experience Center',
      description: 'AI-powered customer support, service quality monitoring, and issue resolution',
      agentCount: 6,
      tools: [
        'Customer Support Chat',
        'Service Diagnostics',
        'Quality Monitoring',
        'Issue Tracking System',
        'Knowledge Base API',
        'Sentiment Analysis'
      ],
      databases: [
        'Customer Profiles DB',
        'Service History DB',
        'Product Catalog DB',
        'Support Tickets DB',
        'Quality Metrics DB'
      ],
      globalGuardrails: [
        'Data Privacy Protection',
        'Customer Communication Standards',
        'Service Level Agreements',
        'Escalation Procedures'
      ],
      localGuardrails: [
        'Response Time Limits',
        'Quality Score Thresholds',
        'Customer Satisfaction Guards'
      ],
      color: 'border-t-green-500',
      department: 'CX'
    },
    {
      id: 'billing-revenue',
      name: 'Billing & Revenue Assurance',
      description: 'Automated billing, usage analytics, fraud detection, and revenue optimization',
      agentCount: 5,
      tools: [
        'Billing Engine',
        'Usage Analytics',
        'Fraud Detection AI',
        'Revenue Assurance Tools',
        'Payment Processing',
        'Pricing Optimization'
      ],
      databases: [
        'Billing Records DB',
        'Usage Data DB',
        'Customer Accounts DB',
        'Pricing Models DB',
        'Fraud Detection DB'
      ],
      globalGuardrails: [
        'Financial Compliance',
        'Audit Trail Requirements',
        'Revenue Protection Rules',
        'Customer Billing Rights'
      ],
      localGuardrails: [
        'Billing Accuracy Checks',
        'Fraud Score Thresholds',
        'Payment Processing Limits'
      ],
      color: 'border-t-purple-500',
      department: 'Sales & Service'
    },
    {
      id: 'network-planning',
      name: 'Network Planning & Optimization',
      description: 'Long-term network planning, capacity forecasting, and infrastructure optimization',
      agentCount: 4,
      tools: [
        'Capacity Planning Models',
        'Traffic Forecasting',
        'Network Simulation',
        'Coverage Analysis',
        'Technology Migration Tools'
      ],
      databases: [
        'Network Assets DB',
        'Traffic Patterns DB',
        'Capacity Models DB',
        'Geographic Data DB'
      ],
      globalGuardrails: [
        'Investment Approval Process',
        'Technology Standards',
        'Regulatory Compliance',
        'Environmental Impact'
      ],
      localGuardrails: [
        'Budget Allocation Limits',
        'Timeline Constraints',
        'Resource Availability'
      ],
      color: 'border-t-orange-500',
      department: 'Network'
    },
    {
      id: 'service-provisioning',
      name: 'Service Provisioning',
      description: 'Automated service activation, configuration, and customer onboarding',
      agentCount: 5,
      tools: [
        'Service Activation Engine',
        'Configuration Management',
        'Customer Onboarding Flow',
        'Service Testing Suite',
        'Inventory Management'
      ],
      databases: [
        'Service Catalog DB',
        'Customer Orders DB',
        'Network Inventory DB',
        'Configuration DB'
      ],
      globalGuardrails: [
        'Service Quality Standards',
        'Customer Data Protection',
        'Activation Time Limits',
        'Compliance Verification'
      ],
      localGuardrails: [
        'Configuration Validation',
        'Resource Availability Checks',
        'Service Testing Requirements'
      ],
      color: 'border-t-cyan-500',
      department: 'Consumer Business'
    },
    {
      id: 'marketing-analytics',
      name: 'Marketing & Sales Analytics',
      description: 'Customer segmentation, campaign optimization, and sales performance analytics',
      agentCount: 4,
      tools: [
        'Customer Segmentation',
        'Campaign Management',
        'Sales Analytics',
        'Churn Prediction',
        'Recommendation Engine'
      ],
      databases: [
        'Customer Behavior DB',
        'Campaign Data DB',
        'Sales Performance DB',
        'Market Research DB'
      ],
      globalGuardrails: [
        'Marketing Compliance',
        'Customer Consent Management',
        'Brand Guidelines',
        'Privacy Regulations'
      ],
      localGuardrails: [
        'Campaign Budget Limits',
        'Targeting Restrictions',
        'Performance Thresholds'
      ],
      color: 'border-t-pink-500',
      department: 'Sales & Service'
    }
  ];
};