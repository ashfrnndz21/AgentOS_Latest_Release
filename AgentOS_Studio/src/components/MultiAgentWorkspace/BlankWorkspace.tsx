import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus } from 'lucide-react';

import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';
import { AgentPalette } from './AgentPalette';
import { ProcurementAgentPalette } from './ProcurementAgentPalette';
import { ForecastingAgentPalette } from './ForecastingAgentPalette';
import { RecruitmentAgentPalette } from './RecruitmentAgentPalette';
import { TelcoCvmPropertiesPanel } from './TelcoCvmPropertiesPanel';
import { BankingWorkflowToolbar } from './BankingWorkflowToolbar';
import { ModernAgentNode } from './nodes/ModernAgentNode';
import { ModernDecisionNode } from './nodes/ModernDecisionNode';
import { ModernMemoryNode } from './nodes/ModernMemoryNode';
import { ModernGuardrailNode } from './nodes/ModernGuardrailNode';
import { EnhancedConnectionEdge } from './edges/EnhancedConnectionEdge';
import { MCPTool } from '@/lib/services/MCPGatewayService';

const nodeTypes = {
  agent: ModernAgentNode,
  decision: ModernDecisionNode,
  memory: ModernMemoryNode,
  guardrail: ModernGuardrailNode,
};

const edgeTypes = {
  enhanced: EnhancedConnectionEdge,
};

// ORCHESTRATION AGENT PATTERN - Agentic Procurement & Supply Chain Optimization
const procurementNodes: Node[] = [
  // CENTRAL ORCHESTRATION AGENT
  {
    id: 'hydrogen-supply-orchestrator',
    type: 'decision',
    position: { x: 500, y: 250 },
    data: {
      label: 'Hydrogen Supply Orchestrator',
      agentType: 'Central Orchestration Agent',
      model: 'Claude 3.5 Sonnet + Strategic Planning',
      tools: ['Task Delegation', 'Goal Decomposition', 'Sub-Agent Coordination', 'Strategic Planning'],
      guardrails: ['Supply Continuity', 'Cost Optimization', 'Quality Assurance'],
      memory: true,
      reasoning: 'orchestration-strategic',
      status: 'orchestrating',
      description: 'Central agent that breaks down "optimize hydrogen supply" into manageable tasks and delegates to specialized sub-agents',
      config: {
        goal: 'Optimize Hydrogen Supply Chain',
        tasks: ['Supplier Research', 'RFP Generation', 'Contract Negotiation', 'Risk Management', 'Delivery Monitoring'],
        subAgents: 6
      },
      supplierNetwork: '80,000 suppliers',
      activeContracts: 234,
      supplyReliability: '99.7%'
    }
  },

  // SPECIALIZED SUB-AGENTS
  {
    id: 'supplier-research-specialist',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Supplier Research Specialist',
      agentType: 'supplier-research-specialist',
      model: 'Claude 3.5 Sonnet + Market Intelligence',
      description: 'Researches and vets suppliers from Air Liquide\'s 80,000-strong network for hydrogen supply. Analyzes supplier capabilities, financial stability, and geographic coverage.',
      status: 'active',
      tools: ['Supplier Network Analysis', 'Capability Assessment', 'Financial Vetting', 'Geographic Coverage'],
      guardrails: ['Supplier Quality Standards', 'Financial Stability Checks', 'Network Compliance'],
      memory: {
        type: 'supplier-intelligence',
        size: '5.2 GB',
        retention: '5 years'
      },
      metrics: {
        success: 94,
        responseTime: 2.3
      },
      prompt: 'You are a Supplier Research Specialist for hydrogen supply chain optimization. Research and vet suppliers from Air Liquide\'s network, assess capabilities, and ensure quality standards.',
      specialization: 'Hydrogen Suppliers',
      suppliersVetted: 2847,
      qualifiedSuppliers: 156,
      networkCoverage: '80,000 suppliers',
      dataSources: 'Air Liquide Network, Market Databases, Financial Reports',
      refreshInterval: 24
    }
  },
  {
    id: 'rfp-generation-specialist',
    type: 'agent',
    position: { x: 300, y: 100 },
    data: {
      label: 'RFP Generation Specialist',
      agentType: 'rfp-generation-specialist',
      model: 'Claude 3.5 Sonnet + Technical Writing',
      description: 'Generates tailored RFPs with technical specifications for hydrogen supply requirements. Creates compliance documentation and requirement analysis.',
      status: 'active',
      tools: ['Technical Specification Generation', 'RFP Templates', 'Compliance Documentation', 'Requirement Analysis'],
      guardrails: ['Technical Accuracy', 'Regulatory Compliance', 'Specification Standards'],
      memory: {
        type: 'rfp-templates',
        size: '2.1 GB',
        retention: '3 years'
      },
      metrics: {
        success: 98,
        responseTime: 1.8
      },
      prompt: 'You are an RFP Generation Specialist for hydrogen procurement. Create detailed RFPs with technical specifications, ensure regulatory compliance, and maintain documentation standards.',
      specialization: 'Hydrogen RFPs',
      rfpsGenerated: 89,
      technicalSpecs: 'H2 Purity 99.999%',
      complianceRate: '100%',
      dataSources: 'Technical Standards, Regulatory Requirements, Template Library',
      refreshInterval: 12
    }
  },
  {
    id: 'contract-negotiation-specialist',
    type: 'agent',
    position: { x: 700, y: 100 },
    data: {
      label: 'Contract Negotiation Specialist',
      agentType: 'contract-negotiation-specialist',
      model: 'Claude 3.5 Sonnet + Legal AI',
      description: 'Negotiates terms and contracts with hydrogen suppliers autonomously. Analyzes contract terms, optimizes pricing, and ensures legal compliance.',
      status: 'active',
      tools: ['Contract Analysis', 'Price Negotiation', 'Terms Optimization', 'Legal Review'],
      guardrails: ['Legal Compliance', 'Budget Constraints', 'Contract Standards'],
      memory: {
        type: 'contract-intelligence',
        size: '3.7 GB',
        retention: '7 years'
      },
      metrics: {
        success: 94,
        responseTime: 4.2
      },
      prompt: 'You are a Contract Negotiation Specialist for hydrogen supply contracts. Negotiate optimal terms, ensure legal compliance, and maximize cost savings while maintaining supply quality.',
      specialization: 'Hydrogen Contracts',
      contractsNegotiated: 67,
      avgSavings: '15.3%',
      successRate: '94.2%',
      dataSources: 'Legal Database, Market Pricing, Contract Templates',
      refreshInterval: 6
    }
  },
  {
    id: 'audit-monitoring-specialist',
    type: 'agent',
    position: { x: 900, y: 100 },
    data: {
      label: 'Audit & Monitoring Specialist',
      agentType: 'audit-monitoring-specialist',
      model: 'Claude 3.5 Sonnet + Analytics',
      description: 'Audits invoices and monitors delivery records for hydrogen supply chain. Tracks quality metrics and ensures delivery compliance.',
      status: 'active',
      tools: ['Invoice Auditing', 'Delivery Tracking', 'Quality Monitoring', 'Performance Analytics'],
      guardrails: ['Audit Standards', 'Quality Thresholds', 'Delivery Requirements'],
      memory: {
        type: 'audit-records',
        size: '8.9 GB',
        retention: '10 years'
      },
      metrics: {
        success: 99,
        responseTime: 1.2
      },
      prompt: 'You are an Audit & Monitoring Specialist for hydrogen supply chain. Audit invoices, track deliveries, monitor quality metrics, and ensure compliance with delivery standards.',
      specialization: 'Supply Chain Auditing',
      invoicesAudited: 1456,
      deliveriesTracked: 2341,
      auditAccuracy: '99.8%',
      dataSources: 'Invoice Systems, Delivery Tracking, Quality Sensors',
      refreshInterval: 1
    }
  },
  {
    id: 'risk-contingency-specialist',
    type: 'agent',
    position: { x: 100, y: 400 },
    data: {
      label: 'Risk & Contingency Specialist',
      agentType: 'Risk Management Sub-Agent',
      model: 'Claude 3.5 Sonnet + Risk Models',
      tools: ['External Data Monitoring', 'Risk Detection', 'Backup Sourcing', 'Contingency Planning'],
      guardrails: ['Risk Thresholds', 'Supply Continuity', 'Emergency Protocols'],
      memory: true,
      reasoning: 'risk-predictive',
      status: 'monitoring',
      description: 'Monitors external data for supplier issues and manages backup sourcing for hydrogen supply',
      specialization: 'Supply Chain Risk',
      riskAlertsDetected: 23,
      backupSuppliersActivated: 5,
      supplyDisruptions: 0
    }
  },
  {
    id: 'logistics-transition-specialist',
    type: 'agent',
    position: { x: 900, y: 400 },
    data: {
      label: 'Logistics & Transition Specialist',
      agentType: 'Operations Sub-Agent',
      model: 'Claude 3.5 Sonnet + Logistics AI',
      tools: ['Route Optimization', 'Delivery Rerouting', 'Transition Management', 'Logistics Coordination'],
      guardrails: ['Delivery Standards', 'Safety Protocols', 'Operational Efficiency'],
      memory: true,
      reasoning: 'operational-optimization',
      status: 'coordinating',
      description: 'Manages delivery rerouting and supplier transitions without human intervention',
      specialization: 'Hydrogen Logistics',
      routesOptimized: 234,
      transitionsManaged: 12,
      deliveryEfficiency: '98.5%'
    }
  },

  // SHARED INFRASTRUCTURE
  {
    id: 'hydrogen-supply-memory',
    type: 'memory',
    position: { x: 300, y: 550 },
    data: {
      label: 'Hydrogen Supply Memory Core',
      config: {
        type: 'supply-chain-intelligence',
        persistence: true,
        retention: '10 years'
      },
      status: 'active',
      size: '25.4 GB',
      entries: 8934567,
      description: 'Centralized memory storing all hydrogen supply chain data, supplier profiles, and historical performance'
    }
  },
  {
    id: 'supply-compliance-guard',
    type: 'guardrail',
    position: { x: 700, y: 550 },
    data: {
      label: 'Supply Chain Compliance Guard',
      config: {
        rules: ['ISO 14687 Hydrogen Quality', 'DOT Transportation', 'OSHA Safety Standards', 'Environmental Regulations'],
        enforcement: 'strict'
      },
      status: 'monitoring',
      violations: 0,
      lastCheck: new Date().toISOString(),
      description: 'Ensures all hydrogen supply chain operations comply with industry regulations and safety standards'
    }
  }
];

// ORCHESTRATION PATTERN EDGES - Central agent delegates to specialized sub-agents
const procurementEdges: Edge[] = [
  // ORCHESTRATOR TO SUB-AGENTS (Task Delegation)
  {
    id: 'orchestrator-to-research',
    source: 'hydrogen-supply-orchestrator',
    target: 'supplier-research-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Research Suppliers', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-rfp',
    source: 'hydrogen-supply-orchestrator',
    target: 'rfp-generation-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Generate RFPs', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-negotiation',
    source: 'hydrogen-supply-orchestrator',
    target: 'contract-negotiation-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Negotiate Contracts', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-audit',
    source: 'hydrogen-supply-orchestrator',
    target: 'audit-monitoring-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Monitor & Audit', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-risk',
    source: 'hydrogen-supply-orchestrator',
    target: 'risk-contingency-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Manage Risk', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-logistics',
    source: 'hydrogen-supply-orchestrator',
    target: 'logistics-transition-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Coordinate Logistics', status: 'delegating' }
  },

  // SUB-AGENTS REPORTING BACK (Results & Findings)
  {
    id: 'research-to-orchestrator',
    source: 'supplier-research-specialist',
    target: 'hydrogen-supply-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Supplier Intelligence', status: 'reporting' }
  },
  {
    id: 'rfp-to-orchestrator',
    source: 'rfp-generation-specialist',
    target: 'hydrogen-supply-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'RFP Documents', status: 'reporting' }
  },
  {
    id: 'negotiation-to-orchestrator',
    source: 'contract-negotiation-specialist',
    target: 'hydrogen-supply-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Contract Results', status: 'reporting' }
  },
  {
    id: 'audit-to-orchestrator',
    source: 'audit-monitoring-specialist',
    target: 'hydrogen-supply-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Audit Reports', status: 'reporting' }
  },
  {
    id: 'risk-to-orchestrator',
    source: 'risk-contingency-specialist',
    target: 'hydrogen-supply-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'event', label: 'Risk Alerts', status: 'reporting' }
  },

  // SUB-AGENT COLLABORATION (When needed)
  {
    id: 'research-to-rfp',
    source: 'supplier-research-specialist',
    target: 'rfp-generation-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Supplier Specs', status: 'collaborating' }
  },
  {
    id: 'rfp-to-negotiation',
    source: 'rfp-generation-specialist',
    target: 'contract-negotiation-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'RFP Requirements', status: 'collaborating' }
  },
  {
    id: 'risk-to-logistics',
    source: 'risk-contingency-specialist',
    target: 'logistics-transition-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'event', label: 'Backup Activation', status: 'emergency' }
  },

  // INFRASTRUCTURE CONNECTIONS
  {
    id: 'orchestrator-to-memory',
    source: 'hydrogen-supply-orchestrator',
    target: 'hydrogen-supply-memory',
    type: 'enhanced',
    data: { type: 'data', label: 'Strategic Intelligence', status: 'active' }
  },
  {
    id: 'orchestrator-to-compliance',
    source: 'hydrogen-supply-orchestrator',
    target: 'supply-compliance-guard',
    type: 'enhanced',
    data: { type: 'control', label: 'Compliance Oversight', status: 'monitoring' }
  },
  {
    id: 'audit-to-memory',
    source: 'audit-monitoring-specialist',
    target: 'hydrogen-supply-memory',
    type: 'enhanced',
    data: { type: 'data', label: 'Audit Data', status: 'active' }
  }
];

// FORECASTING & SCENARIO ANALYSIS PATTERN - Predictive Analytics & Market Intelligence
const forecastingNodes: Node[] = [
  // CENTRAL FORECASTING ORCHESTRATOR
  {
    id: 'forecasting-orchestrator',
    type: 'decision',
    position: { x: 500, y: 250 },
    data: {
      label: 'Forecasting Orchestrator',
      agentType: 'forecasting-orchestrator',
      model: 'Claude 3.5 Sonnet + Analytics',
      description: 'Central agent coordinating all forecasting and scenario analysis tasks',
      status: 'orchestrating',
      metrics: {
        success: 96.5,
        responseTime: 2.1
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.2,
        maxTokens: 4000
      },
      memory: {
        type: 'forecasting-intelligence',
        size: '8.2 GB',
        retention: '5 years'
      },
      tools: ['Workflow Coordination', 'Task Scheduling', 'Result Aggregation', 'Quality Control'],
      guardrails: ['Workflow Integrity', 'Quality Assurance', 'Result Consistency', 'Process Compliance'],
      prompt: 'You are a Forecasting Orchestrator coordinating all forecasting and scenario analysis tasks. Manage workflow between specialists and ensure comprehensive analysis coverage.',
      forecastingModels: 12,
      activeScenarios: 8,
      analysisAccuracy: '94.7%'
    }
  },

  // FORECASTING SPECIALISTS
  {
    id: 'demand-forecasting-specialist',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Demand Forecasting Specialist',
      agentType: 'demand-forecasting-specialist',
      model: 'Claude 3.5 Sonnet + ML Models',
      description: 'Predicts future demand using advanced ML models and market data analysis',
      status: 'active',
      metrics: {
        success: 94.8,
        responseTime: 1.9
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 3000
      },
      memory: {
        type: 'demand-patterns',
        size: '6.4 GB',
        retention: '3 years'
      },
      tools: ['ML Forecasting Models', 'Time Series Analysis', 'Seasonal Decomposition', 'Trend Analysis'],
      guardrails: ['Model Accuracy', 'Data Quality', 'Forecast Bounds', 'Bias Detection'],
      prompt: 'You are a Demand Forecasting Specialist using advanced ML models and market data to predict future demand patterns. Analyze historical trends, seasonal variations, and market indicators to generate accurate forecasts.',
      forecastAccuracy: '94.8%',
      modelsTrained: 156,
      predictionsGenerated: 2847
    }
  },
  {
    id: 'market-analysis-specialist',
    type: 'agent',
    position: { x: 300, y: 100 },
    data: {
      label: 'Market Analysis Specialist',
      agentType: 'market-analysis-specialist',
      model: 'Claude 3.5 Sonnet + Market Intelligence',
      description: 'Analyzes market trends, competitive landscape, and economic indicators',
      status: 'active',
      metrics: {
        success: 96.2,
        responseTime: 2.3
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 2800
      },
      memory: {
        type: 'market-intelligence',
        size: '4.7 GB',
        retention: '2 years'
      },
      tools: ['Market Research Tools', 'Competitive Intelligence', 'Economic Indicators', 'Industry Analysis'],
      guardrails: ['Source Reliability', 'Analysis Objectivity', 'Data Privacy', 'Competitive Ethics'],
      prompt: 'You are a Market Analysis Specialist focused on analyzing market trends, competitive landscape, and economic indicators. Provide insights on market dynamics, competitor strategies, and growth opportunities.',
      reportsGenerated: 234,
      dataSources: 47,
      marketCoverage: '85%'
    }
  },
  {
    id: 'scenario-modeling-specialist',
    type: 'agent',
    position: { x: 700, y: 100 },
    data: {
      label: 'Scenario Modeling Specialist',
      agentType: 'scenario-modeling-specialist',
      model: 'Claude 3.5 Sonnet + Simulation',
      description: 'Creates and evaluates multiple business scenarios using advanced modeling techniques',
      status: 'active',
      metrics: {
        success: 93.7,
        responseTime: 3.1
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.4,
        maxTokens: 3500
      },
      memory: {
        type: 'scenario-models',
        size: '5.9 GB',
        retention: '4 years'
      },
      tools: ['Monte Carlo Simulation', 'Decision Trees', 'Scenario Builder', 'What-If Analysis'],
      guardrails: ['Model Validation', 'Scenario Realism', 'Assumption Tracking', 'Outcome Bounds'],
      prompt: 'You are a Scenario Modeling Specialist creating and evaluating multiple business scenarios. Build comprehensive models to assess different strategic options and their potential outcomes.',
      scenariosCreated: 89,
      modelAccuracy: '93.7%',
      simulationsRun: 1456
    }
  },
  {
    id: 'risk-assessment-specialist',
    type: 'agent',
    position: { x: 900, y: 100 },
    data: {
      label: 'Risk Assessment Specialist',
      agentType: 'risk-assessment-specialist',
      model: 'Claude 3.5 Sonnet + Risk Models',
      description: 'Identifies and quantifies business risks across different scenarios',
      status: 'active',
      metrics: {
        success: 97.1,
        responseTime: 1.7
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.2,
        maxTokens: 2500
      },
      memory: {
        type: 'risk-database',
        size: '3.8 GB',
        retention: '5 years'
      },
      tools: ['Risk Modeling', 'Probability Analysis', 'Impact Assessment', 'Risk Quantification'],
      guardrails: ['Risk Calibration', 'Assessment Accuracy', 'Probability Bounds', 'Impact Validation'],
      prompt: 'You are a Risk Assessment Specialist identifying and quantifying business risks across different scenarios. Analyze probability distributions, impact assessments, and risk mitigation strategies.',
      risksAssessed: 567,
      riskAccuracy: '97.1%',
      mitigationStrategies: 234
    }
  },
  {
    id: 'optimization-specialist',
    type: 'agent',
    position: { x: 100, y: 400 },
    data: {
      label: 'Optimization Specialist',
      agentType: 'optimization-specialist',
      model: 'Claude 3.5 Sonnet + Optimization',
      description: 'Optimizes resource allocation and strategic decisions using mathematical models',
      status: 'active',
      metrics: {
        success: 95.4,
        responseTime: 2.8
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 3200
      },
      memory: {
        type: 'optimization-models',
        size: '4.2 GB',
        retention: '3 years'
      },
      tools: ['Linear Programming', 'Genetic Algorithms', 'Resource Optimizer', 'Constraint Solver'],
      guardrails: ['Solution Feasibility', 'Constraint Validation', 'Optimization Bounds', 'Resource Limits'],
      prompt: 'You are an Optimization Specialist focused on resource allocation and strategic optimization. Use mathematical models and algorithms to find optimal solutions for complex business problems.',
      optimizationsRun: 345,
      efficiencyGains: '23.4%',
      resourcesSaved: '$2.1M'
    }
  },
  {
    id: 'sensitivity-analysis-specialist',
    type: 'agent',
    position: { x: 900, y: 400 },
    data: {
      label: 'Sensitivity Analysis Specialist',
      agentType: 'sensitivity-analysis-specialist',
      model: 'Claude 3.5 Sonnet + Analytics',
      description: 'Analyzes parameter sensitivity and impact on forecasting models',
      status: 'active',
      metrics: {
        success: 92.8,
        responseTime: 2.4
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 2700
      },
      memory: {
        type: 'sensitivity-data',
        size: '3.1 GB',
        retention: '2 years'
      },
      tools: ['Parameter Analysis', 'Sensitivity Testing', 'Tornado Charts', 'Impact Modeling'],
      guardrails: ['Parameter Bounds', 'Analysis Scope', 'Result Validation', 'Impact Limits'],
      prompt: 'You are a Sensitivity Analysis Specialist analyzing parameter sensitivity and impact on forecasting models. Identify key variables and their influence on outcomes.',
      parametersAnalyzed: 1234,
      sensitivityTests: 456,
      impactModels: 78
    }
  },

  // SHARED INFRASTRUCTURE
  {
    id: 'forecasting-memory',
    type: 'memory',
    position: { x: 300, y: 550 },
    data: {
      label: 'Forecasting Memory Core',
      config: {
        type: 'forecasting-intelligence',
        persistence: true,
        retention: '5 years'
      },
      status: 'active',
      size: '32.7 GB',
      entries: 12456789,
      description: 'Centralized memory storing all forecasting data, models, and historical analysis results'
    }
  },
  {
    id: 'model-validation-guard',
    type: 'guardrail',
    position: { x: 700, y: 550 },
    data: {
      label: 'Model Validation Guard',
      config: {
        rules: ['Forecast Accuracy > 90%', 'Data Quality Standards', 'Model Bias Detection', 'Result Consistency'],
        enforcement: 'strict'
      },
      status: 'monitoring',
      violations: 0,
      lastCheck: new Date().toISOString(),
      description: 'Ensures all forecasting models meet accuracy standards and validation requirements'
    }
  }
];

// FORECASTING PATTERN EDGES - Orchestrated forecasting workflow
const forecastingEdges: Edge[] = [
  // ORCHESTRATOR TO SPECIALISTS (Task Delegation)
  {
    id: 'orchestrator-to-demand',
    source: 'forecasting-orchestrator',
    target: 'demand-forecasting-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Demand Forecasting', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-market',
    source: 'forecasting-orchestrator',
    target: 'market-analysis-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Market Analysis', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-scenario',
    source: 'forecasting-orchestrator',
    target: 'scenario-modeling-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Scenario Modeling', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-risk',
    source: 'forecasting-orchestrator',
    target: 'risk-assessment-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Risk Assessment', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-optimization',
    source: 'forecasting-orchestrator',
    target: 'optimization-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Optimization', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-sensitivity',
    source: 'forecasting-orchestrator',
    target: 'sensitivity-analysis-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Sensitivity Analysis', status: 'delegating' }
  },

  // SPECIALISTS REPORTING BACK
  {
    id: 'demand-to-orchestrator',
    source: 'demand-forecasting-specialist',
    target: 'forecasting-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Demand Forecasts', status: 'reporting' }
  },
  {
    id: 'market-to-orchestrator',
    source: 'market-analysis-specialist',
    target: 'forecasting-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Market Intelligence', status: 'reporting' }
  },
  {
    id: 'scenario-to-orchestrator',
    source: 'scenario-modeling-specialist',
    target: 'forecasting-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Scenario Models', status: 'reporting' }
  },
  {
    id: 'risk-to-orchestrator',
    source: 'risk-assessment-specialist',
    target: 'forecasting-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Risk Analysis', status: 'reporting' }
  },

  // SPECIALIST COLLABORATION
  {
    id: 'demand-to-scenario',
    source: 'demand-forecasting-specialist',
    target: 'scenario-modeling-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Demand Data', status: 'collaborating' }
  },
  {
    id: 'market-to-risk',
    source: 'market-analysis-specialist',
    target: 'risk-assessment-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Market Risks', status: 'collaborating' }
  },
  {
    id: 'scenario-to-optimization',
    source: 'scenario-modeling-specialist',
    target: 'optimization-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Scenario Parameters', status: 'collaborating' }
  },
  {
    id: 'optimization-to-sensitivity',
    source: 'optimization-specialist',
    target: 'sensitivity-analysis-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Optimization Results', status: 'collaborating' }
  },

  // INFRASTRUCTURE CONNECTIONS
  {
    id: 'orchestrator-to-memory',
    source: 'forecasting-orchestrator',
    target: 'forecasting-memory',
    type: 'enhanced',
    data: { type: 'data', label: 'Forecasting Intelligence', status: 'active' }
  },
  {
    id: 'orchestrator-to-validation',
    source: 'forecasting-orchestrator',
    target: 'model-validation-guard',
    type: 'enhanced',
    data: { type: 'control', label: 'Model Validation', status: 'monitoring' }
  },
  {
    id: 'demand-to-memory',
    source: 'demand-forecasting-specialist',
    target: 'forecasting-memory',
    type: 'enhanced',
    data: { type: 'data', label: 'Forecast Data', status: 'active' }
  }
];

// TALENT MANAGEMENT & RECRUITMENT PATTERN - End-to-End Talent Lifecycle
const recruitmentNodes: Node[] = [
  // CENTRAL TALENT ORCHESTRATOR
  {
    id: 'talent-orchestrator',
    type: 'decision',
    position: { x: 500, y: 250 },
    data: {
      label: 'Talent Management Orchestrator',
      agentType: 'talent-orchestrator',
      model: 'Claude 3.5 Sonnet + HR Intelligence',
      description: 'Central agent coordinating all talent management processes from recruitment to development',
      status: 'orchestrating',
      metrics: {
        success: 95.8,
        responseTime: 1.8
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.2,
        maxTokens: 3500
      },
      memory: {
        type: 'talent-intelligence',
        size: '7.3 GB',
        retention: '7 years'
      },
      tools: ['Workflow Orchestration', 'Process Automation', 'Stakeholder Management', 'Quality Control'],
      guardrails: ['Process Integrity', 'Workflow Compliance', 'Quality Assurance', 'Orchestration Ethics'],
      prompt: 'You are a Talent Management Orchestrator coordinating all talent management processes. Manage end-to-end recruitment workflows and ensure optimal talent acquisition and retention.',
      activeRecruitments: 45,
      employeesManaged: 1247,
      retentionRate: '94.2%'
    }
  },

  // TALENT MANAGEMENT SPECIALISTS
  {
    id: 'talent-sourcing-specialist',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Talent Sourcing Specialist',
      agentType: 'talent-sourcing-specialist',
      model: 'Claude 3.5 Sonnet + Sourcing Intelligence',
      description: 'Identifies and sources top talent from multiple channels using advanced search techniques',
      status: 'active',
      metrics: {
        success: 92.4,
        responseTime: 2.1
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 2800
      },
      memory: {
        type: 'talent-pool',
        size: '4.8 GB',
        retention: '3 years'
      },
      tools: ['LinkedIn Sourcing', 'Boolean Search', 'Social Media Mining', 'Talent Pool Analysis'],
      guardrails: ['Privacy Compliance', 'Sourcing Ethics', 'Data Protection', 'Candidate Consent'],
      prompt: 'You are a Talent Sourcing Specialist identifying and sourcing top talent from multiple channels. Use advanced search techniques, social media, and professional networks to find qualified candidates.',
      candidatesSourced: 1847,
      qualityScore: '92.4%',
      sourcingChannels: 12
    }
  },
  {
    id: 'ai-screening-specialist',
    type: 'agent',
    position: { x: 300, y: 100 },
    data: {
      label: 'AI Screening Specialist',
      agentType: 'ai-screening-specialist',
      model: 'Claude 3.5 Sonnet + Screening AI',
      description: 'Automated resume screening and candidate evaluation with bias-free assessment',
      status: 'active',
      metrics: {
        success: 96.7,
        responseTime: 1.3
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.2,
        maxTokens: 2500
      },
      memory: {
        type: 'screening-models',
        size: '3.2 GB',
        retention: '2 years'
      },
      tools: ['Resume Parser', 'Skills Assessment', 'Candidate Ranking', 'Qualification Matcher'],
      guardrails: ['Bias Prevention', 'Fair Assessment', 'Privacy Protection', 'Screening Standards'],
      prompt: 'You are an AI Screening Specialist performing automated resume screening and candidate evaluation. Analyze resumes, assess qualifications, and rank candidates based on job requirements.',
      resumesScreened: 3456,
      screeningAccuracy: '96.7%',
      biasScore: '2.1%'
    }
  },
  {
    id: 'interview-coordination-specialist',
    type: 'agent',
    position: { x: 700, y: 100 },
    data: {
      label: 'Interview Coordination Specialist',
      agentType: 'interview-coordination-specialist',
      model: 'Claude 3.5 Sonnet + Coordination AI',
      description: 'Manages interview scheduling and coordination with optimal candidate experience',
      status: 'active',
      metrics: {
        success: 94.1,
        responseTime: 1.9
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 2200
      },
      memory: {
        type: 'interview-data',
        size: '2.7 GB',
        retention: '1 year'
      },
      tools: ['Calendar Integration', 'Interview Scheduler', 'Stakeholder Coordination', 'Candidate Communication'],
      guardrails: ['Scheduling Ethics', 'Candidate Experience', 'Process Fairness', 'Communication Standards'],
      prompt: 'You are an Interview Coordination Specialist managing interview scheduling and coordination. Optimize interview processes, coordinate with stakeholders, and ensure smooth candidate experience.',
      interviewsScheduled: 567,
      satisfactionScore: '94.1%',
      averageSchedulingTime: '2.3 hours'
    }
  },
  {
    id: 'onboarding-specialist',
    type: 'agent',
    position: { x: 900, y: 100 },
    data: {
      label: 'Onboarding Specialist',
      agentType: 'onboarding-specialist',
      model: 'Claude 3.5 Sonnet + Onboarding AI',
      description: 'Streamlines new employee onboarding with personalized integration plans',
      status: 'active',
      metrics: {
        success: 97.3,
        responseTime: 1.6
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.3,
        maxTokens: 2600
      },
      memory: {
        type: 'onboarding-plans',
        size: '3.9 GB',
        retention: '5 years'
      },
      tools: ['Onboarding Workflows', 'Document Management', 'Progress Tracking', 'Integration Planning'],
      guardrails: ['Onboarding Standards', 'Privacy Protection', 'Process Compliance', 'Integration Ethics'],
      prompt: 'You are an Onboarding Specialist streamlining new employee onboarding processes. Create personalized onboarding plans, track progress, and ensure successful integration.',
      employeesOnboarded: 234,
      onboardingSuccess: '97.3%',
      averageOnboardingTime: '5.2 days'
    }
  },
  {
    id: 'career-development-specialist',
    type: 'agent',
    position: { x: 100, y: 400 },
    data: {
      label: 'Career Development Specialist',
      agentType: 'career-development-specialist',
      model: 'Claude 3.5 Sonnet + Development AI',
      description: 'Manages career paths and employee development with personalized growth plans',
      status: 'active',
      metrics: {
        success: 93.8,
        responseTime: 2.4
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.4,
        maxTokens: 3000
      },
      memory: {
        type: 'career-paths',
        size: '5.1 GB',
        retention: '10 years'
      },
      tools: ['Career Path Planner', 'Skills Gap Analysis', 'Development Programs', 'Growth Tracking'],
      guardrails: ['Development Fairness', 'Growth Equity', 'Performance Standards', 'Career Ethics'],
      prompt: 'You are a Career Development Specialist managing career paths and employee development. Design development programs, track career progression, and identify growth opportunities.',
      careerPlansCreated: 456,
      promotionRate: '23.7%',
      skillsGapsClosed: 189
    }
  },
  {
    id: 'performance-tracking-specialist',
    type: 'agent',
    position: { x: 900, y: 400 },
    data: {
      label: 'Performance Tracking Specialist',
      agentType: 'performance-tracking-specialist',
      model: 'Claude 3.5 Sonnet + Performance AI',
      description: 'Monitors and analyzes employee performance with comprehensive KPI tracking',
      status: 'active',
      metrics: {
        success: 95.6,
        responseTime: 1.7
      },
      config: {
        model: 'Claude 3.5 Sonnet',
        temperature: 0.2,
        maxTokens: 2400
      },
      memory: {
        type: 'performance-data',
        size: '6.8 GB',
        retention: '7 years'
      },
      tools: ['Performance Analytics', 'KPI Tracking', 'Trend Analysis', 'Report Generation'],
      guardrails: ['Performance Privacy', 'Tracking Ethics', 'Data Security', 'Assessment Fairness'],
      prompt: 'You are a Performance Tracking Specialist monitoring and analyzing employee performance metrics. Track KPIs, identify trends, and provide performance insights.',
      employeesTracked: 1247,
      performanceScore: '95.6%',
      kpisMonitored: 47
    }
  },

  // SHARED INFRASTRUCTURE
  {
    id: 'hr-memory-core',
    type: 'memory',
    position: { x: 300, y: 550 },
    data: {
      label: 'HR Memory Core',
      config: {
        type: 'talent-intelligence',
        persistence: true,
        retention: '7 years'
      },
      status: 'active',
      size: '18.9 GB',
      entries: 5678901,
      description: 'Centralized memory storing all talent data, employee records, and HR intelligence'
    }
  },
  {
    id: 'hr-compliance-guard',
    type: 'guardrail',
    position: { x: 700, y: 550 },
    data: {
      label: 'HR Compliance Guard',
      config: {
        rules: ['GDPR Privacy Protection', 'Equal Opportunity Compliance', 'Data Security Standards', 'HR Ethics Guidelines'],
        enforcement: 'strict'
      },
      status: 'monitoring',
      violations: 0,
      lastCheck: new Date().toISOString(),
      description: 'Ensures all HR processes comply with privacy regulations and ethical standards'
    }
  }
];

// RECRUITMENT PATTERN EDGES - Talent lifecycle workflow
const recruitmentEdges: Edge[] = [
  // ORCHESTRATOR TO SPECIALISTS (Task Delegation)
  {
    id: 'orchestrator-to-sourcing',
    source: 'talent-orchestrator',
    target: 'talent-sourcing-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Talent Sourcing', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-screening',
    source: 'talent-orchestrator',
    target: 'ai-screening-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: AI Screening', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-interview',
    source: 'talent-orchestrator',
    target: 'interview-coordination-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Interview Coordination', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-onboarding',
    source: 'talent-orchestrator',
    target: 'onboarding-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Onboarding', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-development',
    source: 'talent-orchestrator',
    target: 'career-development-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Career Development', status: 'delegating' }
  },
  {
    id: 'orchestrator-to-performance',
    source: 'talent-orchestrator',
    target: 'performance-tracking-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Task: Performance Tracking', status: 'delegating' }
  },

  // TALENT PIPELINE FLOW
  {
    id: 'sourcing-to-screening',
    source: 'talent-sourcing-specialist',
    target: 'ai-screening-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Candidate Profiles', status: 'flowing' }
  },
  {
    id: 'screening-to-interview',
    source: 'ai-screening-specialist',
    target: 'interview-coordination-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Qualified Candidates', status: 'flowing' }
  },
  {
    id: 'interview-to-onboarding',
    source: 'interview-coordination-specialist',
    target: 'onboarding-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Selected Candidates', status: 'flowing' }
  },
  {
    id: 'onboarding-to-development',
    source: 'onboarding-specialist',
    target: 'career-development-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'New Employees', status: 'flowing' }
  },
  {
    id: 'development-to-performance',
    source: 'career-development-specialist',
    target: 'performance-tracking-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Development Plans', status: 'flowing' }
  },

  // FEEDBACK LOOPS
  {
    id: 'performance-to-development',
    source: 'performance-tracking-specialist',
    target: 'career-development-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'feedback', label: 'Performance Insights', status: 'feedback' }
  },
  {
    id: 'performance-to-orchestrator',
    source: 'performance-tracking-specialist',
    target: 'talent-orchestrator',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Performance Reports', status: 'reporting' }
  },

  // INFRASTRUCTURE CONNECTIONS
  {
    id: 'orchestrator-to-memory',
    source: 'talent-orchestrator',
    target: 'hr-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Talent Intelligence', status: 'active' }
  },
  {
    id: 'orchestrator-to-compliance',
    source: 'talent-orchestrator',
    target: 'hr-compliance-guard',
    type: 'enhanced',
    data: { type: 'control', label: 'Compliance Monitoring', status: 'monitoring' }
  },
  {
    id: 'screening-to-memory',
    source: 'ai-screening-specialist',
    target: 'hr-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Screening Data', status: 'active' }
  }
];

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface BlankWorkspaceProps {
  mode?: 'default' | 'procurement' | 'forecasting' | 'recruitment';
}

export const BlankWorkspace = ({ mode = 'default' }: BlankWorkspaceProps) => {
  // Use specialized nodes based on mode
  const workflowNodes = mode === 'procurement' ? procurementNodes 
                      : mode === 'forecasting' ? forecastingNodes 
                      : mode === 'recruitment' ? recruitmentNodes
                      : initialNodes;
  const workflowEdges = mode === 'procurement' ? procurementEdges 
                      : mode === 'forecasting' ? forecastingEdges 
                      : mode === 'recruitment' ? recruitmentEdges
                      : initialEdges;
  
  const [nodes, setNodes, onNodesChange] = useNodesState(workflowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [, setSelectedMCPTool] = useState<MCPTool | null>(null);
  const [workflowMetrics] = useState({
    complianceScore: 100,
    riskLevel: 'Low',
    auditReadiness: 100,
    performanceScore: 100,
    validationErrors: [] as string[],
  });

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'enhanced',
        animated: true,
        data: {
          type: 'data',
          label: 'Data Flow',
          status: 'idle',
        }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const addAgent = useCallback((agentType: string) => {
    // Get detailed data for procurement agents
    const getProcurementAgentData = (type: string) => {
      const agentConfigs: Record<string, any> = {
        'supplier-research-specialist': {
          label: 'Supplier Research Specialist',
          description: 'Researches and vets suppliers from Air Liquide\'s 80,000-strong network for hydrogen supply. Analyzes supplier capabilities, financial stability, and geographic coverage.',
          agentType: 'supplier-research-specialist',
          status: 'active',
          metrics: { success: 94, responseTime: 2.3 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2000 },
          memory: { type: 'supplier-intelligence', size: '5.2 GB', retention: '5 years' },
          tools: ['Supplier Network Analysis', 'Capability Assessment', 'Financial Vetting', 'Geographic Coverage'],
          guardrails: ['Supplier Quality Standards', 'Financial Stability Checks', 'Network Compliance', 'Data Privacy'],
          prompt: 'You are a Supplier Research Specialist for hydrogen supply chain optimization. Research and vet suppliers from Air Liquide\'s network, assess capabilities, and ensure quality standards.',
          suppliersVetted: 2847,
          qualifiedSuppliers: 156,
          networkCoverage: '80,000 suppliers'
        },
        'rfp-generation-specialist': {
          label: 'RFP Generation Specialist',
          description: 'Generates tailored RFPs with technical specifications for hydrogen supply requirements. Creates compliance documentation and requirement analysis.',
          agentType: 'rfp-generation-specialist',
          status: 'active',
          metrics: { success: 98, responseTime: 1.8 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 3000 },
          memory: { type: 'rfp-templates', size: '2.1 GB', retention: '3 years' },
          tools: ['Technical Specification Generation', 'RFP Templates', 'Compliance Documentation', 'Requirement Analysis'],
          guardrails: ['Technical Accuracy', 'Regulatory Compliance', 'Specification Standards', 'Documentation Security'],
          prompt: 'You are an RFP Generation Specialist for hydrogen procurement. Create detailed RFPs with technical specifications, ensure regulatory compliance, and maintain documentation standards.',
          rfpsGenerated: 89,
          technicalSpecs: 'H2 Purity 99.999%',
          complianceRate: '100%'
        },
        'contract-negotiation-specialist': {
          label: 'Contract Negotiation Specialist',
          description: 'Negotiates terms and contracts with hydrogen suppliers autonomously. Analyzes contract terms, optimizes pricing, and ensures legal compliance.',
          agentType: 'contract-negotiation-specialist',
          status: 'active',
          metrics: { success: 94, responseTime: 4.2 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.4, maxTokens: 3000 },
          memory: { type: 'contract-intelligence', size: '3.7 GB', retention: '7 years' },
          tools: ['Contract Analysis', 'Price Negotiation', 'Terms Optimization', 'Legal Review'],
          guardrails: ['Legal Compliance', 'Budget Constraints', 'Contract Standards', 'Negotiation Ethics'],
          prompt: 'You are a Contract Negotiation Specialist for hydrogen supply contracts. Negotiate optimal terms, ensure legal compliance, and maximize cost savings while maintaining supply quality.',
          contractsNegotiated: 67,
          avgSavings: '15.3%',
          successRate: '94.2%'
        },
        'audit-monitoring-specialist': {
          label: 'Audit & Monitoring Specialist',
          description: 'Audits invoices and monitors delivery records for hydrogen supply chain. Tracks quality metrics and ensures delivery compliance.',
          agentType: 'audit-monitoring-specialist',
          status: 'active',
          metrics: { success: 99, responseTime: 1.2 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2000 },
          memory: { type: 'audit-records', size: '8.9 GB', retention: '10 years' },
          tools: ['Invoice Auditing', 'Delivery Tracking', 'Quality Monitoring', 'Performance Analytics'],
          guardrails: ['Audit Standards', 'Quality Thresholds', 'Delivery Requirements', 'Data Accuracy'],
          prompt: 'You are an Audit & Monitoring Specialist for hydrogen supply chain. Audit invoices, track deliveries, monitor quality metrics, and ensure compliance with delivery standards.',
          invoicesAudited: 1456,
          deliveriesTracked: 2341,
          auditAccuracy: '99.8%'
        },
        'risk-contingency-specialist': {
          label: 'Risk & Contingency Specialist',
          description: 'Monitors external data for supplier issues and manages backup sourcing for hydrogen supply',
          agentType: 'Risk Management Sub-Agent',
          status: 'monitoring',
          metrics: { success: 96, responseTime: 1.8 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.2, maxTokens: 2500 },
          memory: { type: 'risk-intelligence', size: '4.2 GB', retention: '5 years' },
          tools: ['External Data Monitoring', 'Risk Detection', 'Backup Sourcing', 'Contingency Planning'],
          guardrails: ['Risk Thresholds', 'Supply Continuity', 'Emergency Protocols', 'Data Security'],
          prompt: 'You are a Risk & Contingency Specialist monitoring external data for supplier issues and managing backup sourcing for hydrogen supply.',
          riskAlertsDetected: 23,
          backupSuppliersActivated: 5,
          supplyDisruptions: 0
        },
        'logistics-transition-specialist': {
          label: 'Logistics & Transition Specialist',
          description: 'Manages delivery rerouting and supplier transitions without human intervention',
          agentType: 'Operations Sub-Agent',
          status: 'coordinating',
          metrics: { success: 98, responseTime: 1.5 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2200 },
          memory: { type: 'logistics-intelligence', size: '3.1 GB', retention: '2 years' },
          tools: ['Route Optimization', 'Delivery Rerouting', 'Transition Management', 'Logistics Coordination'],
          guardrails: ['Delivery Standards', 'Safety Protocols', 'Operational Efficiency', 'Logistics Compliance'],
          prompt: 'You are a Logistics & Transition Specialist managing delivery rerouting and supplier transitions without human intervention.',
          routesOptimized: 234,
          transitionsManaged: 12,
          deliveryEfficiency: '98.5%'
        },
        'hydrogen-supply-orchestrator': {
          label: 'Hydrogen Supply Orchestrator',
          description: 'Central agent that breaks down "optimize hydrogen supply" into manageable tasks and delegates to specialized sub-agents',
          agentType: 'Central Orchestration Agent',
          status: 'orchestrating',
          metrics: { success: 97, responseTime: 2.8 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.2, maxTokens: 4000 },
          memory: { type: 'orchestration-intelligence', size: '6.8 GB', retention: '10 years' },
          tools: ['Task Delegation', 'Goal Decomposition', 'Sub-Agent Coordination', 'Strategic Planning'],
          guardrails: ['Supply Continuity', 'Cost Optimization', 'Quality Assurance', 'Strategic Oversight'],
          prompt: 'You are a Central Orchestration Agent that breaks down "optimize hydrogen supply" into manageable tasks and delegates to specialized sub-agents.',
          supplierNetwork: '80,000 suppliers',
          activeContracts: 234,
          supplyReliability: '99.7%'
        },
        // Forecasting agent configurations
        'demand-forecasting-specialist': {
          label: 'Demand Forecasting Specialist',
          description: 'Predicts future demand using advanced ML models and market data analysis',
          agentType: 'demand-forecasting-specialist',
          status: 'active',
          metrics: { success: 94.8, responseTime: 1.9 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 3000 },
          memory: { type: 'demand-patterns', size: '6.4 GB', retention: '3 years' },
          tools: ['ML Forecasting Models', 'Time Series Analysis', 'Seasonal Decomposition', 'Trend Analysis'],
          guardrails: ['Model Accuracy', 'Data Quality', 'Forecast Bounds', 'Bias Detection'],
          prompt: 'You are a Demand Forecasting Specialist using advanced ML models and market data to predict future demand patterns. Analyze historical trends, seasonal variations, and market indicators to generate accurate forecasts.',
          forecastAccuracy: '94.8%',
          modelsTrained: 156,
          predictionsGenerated: 2847
        },
        'market-analysis-specialist': {
          label: 'Market Analysis Specialist',
          description: 'Analyzes market trends, competitive landscape, and economic indicators',
          agentType: 'market-analysis-specialist',
          status: 'active',
          metrics: { success: 96.2, responseTime: 2.3 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2800 },
          memory: { type: 'market-intelligence', size: '4.7 GB', retention: '2 years' },
          tools: ['Market Research Tools', 'Competitive Intelligence', 'Economic Indicators', 'Industry Analysis'],
          guardrails: ['Source Reliability', 'Analysis Objectivity', 'Data Privacy', 'Competitive Ethics'],
          prompt: 'You are a Market Analysis Specialist focused on analyzing market trends, competitive landscape, and economic indicators. Provide insights on market dynamics, competitor strategies, and growth opportunities.',
          reportsGenerated: 234,
          dataSources: 47,
          marketCoverage: '85%'
        },
        'scenario-modeling-specialist': {
          label: 'Scenario Modeling Specialist',
          description: 'Creates and evaluates multiple business scenarios using advanced modeling techniques',
          agentType: 'scenario-modeling-specialist',
          status: 'active',
          metrics: { success: 93.7, responseTime: 3.1 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.4, maxTokens: 3500 },
          memory: { type: 'scenario-models', size: '5.9 GB', retention: '4 years' },
          tools: ['Monte Carlo Simulation', 'Decision Trees', 'Scenario Builder', 'What-If Analysis'],
          guardrails: ['Model Validation', 'Scenario Realism', 'Assumption Tracking', 'Outcome Bounds'],
          prompt: 'You are a Scenario Modeling Specialist creating and evaluating multiple business scenarios. Build comprehensive models to assess different strategic options and their potential outcomes.',
          scenariosCreated: 89,
          modelAccuracy: '93.7%',
          simulationsRun: 1456
        },
        'risk-assessment-specialist': {
          label: 'Risk Assessment Specialist',
          description: 'Identifies and quantifies business risks across different scenarios',
          agentType: 'risk-assessment-specialist',
          status: 'active',
          metrics: { success: 97.1, responseTime: 1.7 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.2, maxTokens: 2500 },
          memory: { type: 'risk-database', size: '3.8 GB', retention: '5 years' },
          tools: ['Risk Modeling', 'Probability Analysis', 'Impact Assessment', 'Risk Quantification'],
          guardrails: ['Risk Calibration', 'Assessment Accuracy', 'Probability Bounds', 'Impact Validation'],
          prompt: 'You are a Risk Assessment Specialist identifying and quantifying business risks across different scenarios. Analyze probability distributions, impact assessments, and risk mitigation strategies.',
          risksAssessed: 567,
          riskAccuracy: '97.1%',
          mitigationStrategies: 234
        },
        'optimization-specialist': {
          label: 'Optimization Specialist',
          description: 'Optimizes resource allocation and strategic decisions using mathematical models',
          agentType: 'optimization-specialist',
          status: 'active',
          metrics: { success: 95.4, responseTime: 2.8 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 3200 },
          memory: { type: 'optimization-models', size: '4.2 GB', retention: '3 years' },
          tools: ['Linear Programming', 'Genetic Algorithms', 'Resource Optimizer', 'Constraint Solver'],
          guardrails: ['Solution Feasibility', 'Constraint Validation', 'Optimization Bounds', 'Resource Limits'],
          prompt: 'You are an Optimization Specialist focused on resource allocation and strategic optimization. Use mathematical models and algorithms to find optimal solutions for complex business problems.',
          optimizationsRun: 345,
          efficiencyGains: '23.4%',
          resourcesSaved: '$2.1M'
        },
        'sensitivity-analysis-specialist': {
          label: 'Sensitivity Analysis Specialist',
          description: 'Analyzes parameter sensitivity and impact on forecasting models',
          agentType: 'sensitivity-analysis-specialist',
          status: 'active',
          metrics: { success: 92.8, responseTime: 2.4 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2700 },
          memory: { type: 'sensitivity-data', size: '3.1 GB', retention: '2 years' },
          tools: ['Parameter Analysis', 'Sensitivity Testing', 'Tornado Charts', 'Impact Modeling'],
          guardrails: ['Parameter Bounds', 'Analysis Scope', 'Result Validation', 'Impact Limits'],
          prompt: 'You are a Sensitivity Analysis Specialist analyzing parameter sensitivity and impact on forecasting models. Identify key variables and their influence on outcomes.',
          parametersAnalyzed: 1234,
          sensitivityTests: 456,
          impactModels: 78
        },
        'forecasting-orchestrator': {
          label: 'Forecasting Orchestrator',
          description: 'Central agent coordinating all forecasting and scenario analysis tasks',
          agentType: 'forecasting-orchestrator',
          status: 'orchestrating',
          metrics: { success: 96.5, responseTime: 2.1 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.2, maxTokens: 4000 },
          memory: { type: 'forecasting-intelligence', size: '8.2 GB', retention: '5 years' },
          tools: ['Workflow Coordination', 'Task Scheduling', 'Result Aggregation', 'Quality Control'],
          guardrails: ['Workflow Integrity', 'Quality Assurance', 'Result Consistency', 'Process Compliance'],
          prompt: 'You are a Forecasting Orchestrator coordinating all forecasting and scenario analysis tasks. Manage workflow between specialists and ensure comprehensive analysis coverage.',
          forecastingModels: 12,
          activeScenarios: 8,
          analysisAccuracy: '94.7%'
        },
        // Recruitment agent configurations
        'talent-sourcing-specialist': {
          label: 'Talent Sourcing Specialist',
          description: 'Identifies and sources top talent from multiple channels using advanced search techniques',
          agentType: 'talent-sourcing-specialist',
          status: 'active',
          metrics: { success: 92.4, responseTime: 2.1 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2800 },
          memory: { type: 'talent-pool', size: '4.8 GB', retention: '3 years' },
          tools: ['LinkedIn Sourcing', 'Boolean Search', 'Social Media Mining', 'Talent Pool Analysis'],
          guardrails: ['Privacy Compliance', 'Sourcing Ethics', 'Data Protection', 'Candidate Consent'],
          prompt: 'You are a Talent Sourcing Specialist identifying and sourcing top talent from multiple channels. Use advanced search techniques, social media, and professional networks to find qualified candidates.',
          candidatesSourced: 1847,
          qualityScore: '92.4%',
          sourcingChannels: 12
        },
        'ai-screening-specialist': {
          label: 'AI Screening Specialist',
          description: 'Automated resume screening and candidate evaluation with bias-free assessment',
          agentType: 'ai-screening-specialist',
          status: 'active',
          metrics: { success: 96.7, responseTime: 1.3 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.2, maxTokens: 2500 },
          memory: { type: 'screening-models', size: '3.2 GB', retention: '2 years' },
          tools: ['Resume Parser', 'Skills Assessment', 'Candidate Ranking', 'Qualification Matcher'],
          guardrails: ['Bias Prevention', 'Fair Assessment', 'Privacy Protection', 'Screening Standards'],
          prompt: 'You are an AI Screening Specialist performing automated resume screening and candidate evaluation. Analyze resumes, assess qualifications, and rank candidates based on job requirements.',
          resumesScreened: 3456,
          screeningAccuracy: '96.7%',
          biasScore: '2.1%'
        },
        'interview-coordination-specialist': {
          label: 'Interview Coordination Specialist',
          description: 'Manages interview scheduling and coordination with optimal candidate experience',
          agentType: 'interview-coordination-specialist',
          status: 'active',
          metrics: { success: 94.1, responseTime: 1.9 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2200 },
          memory: { type: 'interview-data', size: '2.7 GB', retention: '1 year' },
          tools: ['Calendar Integration', 'Interview Scheduler', 'Stakeholder Coordination', 'Candidate Communication'],
          guardrails: ['Scheduling Ethics', 'Candidate Experience', 'Process Fairness', 'Communication Standards'],
          prompt: 'You are an Interview Coordination Specialist managing interview scheduling and coordination. Optimize interview processes, coordinate with stakeholders, and ensure smooth candidate experience.',
          interviewsScheduled: 567,
          satisfactionScore: '94.1%',
          averageSchedulingTime: '2.3 hours'
        },
        'onboarding-specialist': {
          label: 'Onboarding Specialist',
          description: 'Streamlines new employee onboarding with personalized integration plans',
          agentType: 'onboarding-specialist',
          status: 'active',
          metrics: { success: 97.3, responseTime: 1.6 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.3, maxTokens: 2600 },
          memory: { type: 'onboarding-plans', size: '3.9 GB', retention: '5 years' },
          tools: ['Onboarding Workflows', 'Document Management', 'Progress Tracking', 'Integration Planning'],
          guardrails: ['Onboarding Standards', 'Privacy Protection', 'Process Compliance', 'Integration Ethics'],
          prompt: 'You are an Onboarding Specialist streamlining new employee onboarding processes. Create personalized onboarding plans, track progress, and ensure successful integration.',
          employeesOnboarded: 234,
          onboardingSuccess: '97.3%',
          averageOnboardingTime: '5.2 days'
        },
        'career-development-specialist': {
          label: 'Career Development Specialist',
          description: 'Manages career paths and employee development with personalized growth plans',
          agentType: 'career-development-specialist',
          status: 'active',
          metrics: { success: 93.8, responseTime: 2.4 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.4, maxTokens: 3000 },
          memory: { type: 'career-paths', size: '5.1 GB', retention: '10 years' },
          tools: ['Career Path Planner', 'Skills Gap Analysis', 'Development Programs', 'Growth Tracking'],
          guardrails: ['Development Fairness', 'Growth Equity', 'Performance Standards', 'Career Ethics'],
          prompt: 'You are a Career Development Specialist managing career paths and employee development. Design development programs, track career progression, and identify growth opportunities.',
          careerPlansCreated: 456,
          promotionRate: '23.7%',
          skillsGapsClosed: 189
        },
        'performance-tracking-specialist': {
          label: 'Performance Tracking Specialist',
          description: 'Monitors and analyzes employee performance with comprehensive KPI tracking',
          agentType: 'performance-tracking-specialist',
          status: 'active',
          metrics: { success: 95.6, responseTime: 1.7 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.2, maxTokens: 2400 },
          memory: { type: 'performance-data', size: '6.8 GB', retention: '7 years' },
          tools: ['Performance Analytics', 'KPI Tracking', 'Trend Analysis', 'Report Generation'],
          guardrails: ['Performance Privacy', 'Tracking Ethics', 'Data Security', 'Assessment Fairness'],
          prompt: 'You are a Performance Tracking Specialist monitoring and analyzing employee performance metrics. Track KPIs, identify trends, and provide performance insights.',
          employeesTracked: 1247,
          performanceScore: '95.6%',
          kpisMonitored: 47
        },
        'talent-orchestrator': {
          label: 'Talent Management Orchestrator',
          description: 'Central agent coordinating all talent management processes from recruitment to development',
          agentType: 'talent-orchestrator',
          status: 'orchestrating',
          metrics: { success: 95.8, responseTime: 1.8 },
          config: { model: 'Claude 3.5 Sonnet', temperature: 0.2, maxTokens: 3500 },
          memory: { type: 'talent-intelligence', size: '7.3 GB', retention: '7 years' },
          tools: ['Workflow Orchestration', 'Process Automation', 'Stakeholder Management', 'Quality Control'],
          guardrails: ['Process Integrity', 'Workflow Compliance', 'Quality Assurance', 'Orchestration Ethics'],
          prompt: 'You are a Talent Management Orchestrator coordinating all talent management processes. Manage end-to-end recruitment workflows and ensure optimal talent acquisition and retention.',
          activeRecruitments: 45,
          employeesManaged: 1247,
          retentionRate: '94.2%'
        }
      };
      return agentConfigs[type];
    };

    const agentData = (mode === 'procurement' || mode === 'forecasting' || mode === 'recruitment') && getProcurementAgentData(agentType) 
      ? getProcurementAgentData(agentType)
      : {
          label: agentType,
          agentType,
          model: 'gpt-4',
          tools: [],
          mcpTools: [],
          guardrails: [],
          memory: true,
          reasoning: 'chain-of-thought',
          status: 'idle'
        };

    const newNode: Node = {
      id: `${agentType.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      type: (agentType === 'hydrogen-supply-orchestrator' || agentType === 'forecasting-orchestrator' || agentType === 'talent-orchestrator') ? 'decision' : 'agent',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: agentData,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, mode]);

  const handleMCPToolSelect = useCallback((tool: MCPTool) => {
    setSelectedMCPTool(tool);
    // If there's a selected agent node, add the tool to it
    if (selectedNode && selectedNode.type === 'agent') {
      const currentMCPTools = (selectedNode.data.mcpTools as MCPTool[]) || [];
      const toolExists = currentMCPTools.some(t => t.id === tool.id && t.serverId === tool.serverId);
      
      if (!toolExists) {
        const updatedMCPTools = [...currentMCPTools, tool];
        updateNodeData(selectedNode.id, { mcpTools: updatedMCPTools });
      }
    }
  }, [selectedNode, updateNodeData]);

  const addUtilityNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        config: {},
        status: 'idle'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    
    // Simulate workflow execution
    setEdges(edges => edges.map(edge => ({
      ...edge,
      animated: true,
      data: { ...edge.data, status: 'active' }
    })));

    setTimeout(() => {
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'success' }
      })));
      setIsRunning(false);
    }, 3000);
  }, [setEdges]);

  return (
    <div className={`h-screen flex flex-col text-slate-100 overflow-hidden ${
      mode === 'procurement' 
        ? 'bg-gradient-to-br from-slate-900 via-orange-900 to-red-900'
        : mode === 'forecasting'
        ? 'bg-gradient-to-br from-slate-900 via-orange-900 to-yellow-900'
        : mode === 'recruitment'
        ? 'bg-gradient-to-br from-slate-900 via-orange-900 to-amber-900'
        : 'bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900'
    }`}>
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Agent Palette */}
        {mode === 'procurement' ? (
          <ProcurementAgentPalette 
            onAddAgent={addAgent}
            onAddUtility={addUtilityNode}
          />
        ) : mode === 'forecasting' ? (
          <ForecastingAgentPalette 
            onAddAgent={addAgent}
            onAddUtility={addUtilityNode}
          />
        ) : mode === 'recruitment' ? (
          <RecruitmentAgentPalette 
            onAddAgent={addAgent}
            onAddUtility={addUtilityNode}
          />
        ) : (
          <AgentPalette 
            onAddAgent={addAgent}
            onAddUtility={addUtilityNode}
            onSelectMCPTool={handleMCPToolSelect}
          />
        )}
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <BankingWorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={() => setIsRunning(false)}
            onExport={() => {}}
            nodeCount={nodes.length}
            connectionCount={edges.length}
            metrics={workflowMetrics}
            onShowCompliance={() => {}}
            onShowRiskAssessment={() => {}}
          />
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className={mode === 'procurement' 
              ? "bg-gradient-to-br from-slate-900/50 via-orange-900/30 to-red-900/50"
              : mode === 'forecasting'
              ? "bg-gradient-to-br from-slate-900/50 via-orange-900/30 to-yellow-900/50"
              : mode === 'recruitment'
              ? "bg-gradient-to-br from-slate-900/50 via-orange-900/30 to-amber-900/50"
              : "bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50"
            }
            style={{ backgroundColor: 'transparent' }}
            onDrop={(event) => {
              event.preventDefault();
              const data = event.dataTransfer.getData('application/json');
              if (data) {
                try {
                  const dropData = JSON.parse(data);
                  if (dropData.type === 'mcp-tool') {
                    // Find the node under the drop position
                    const rect = event.currentTarget.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    
                    // Check if we're dropping on an agent node
                    const targetNode = nodes.find(node => {
                      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
                      if (nodeElement) {
                        const nodeRect = nodeElement.getBoundingClientRect();
                        const relativeNodeRect = {
                          left: nodeRect.left - rect.left,
                          top: nodeRect.top - rect.top,
                          right: nodeRect.right - rect.left,
                          bottom: nodeRect.bottom - rect.top
                        };
                        return x >= relativeNodeRect.left && x <= relativeNodeRect.right &&
                               y >= relativeNodeRect.top && y <= relativeNodeRect.bottom;
                      }
                      return false;
                    });

                    if (targetNode && targetNode.type === 'agent') {
                      const currentMCPTools = (targetNode.data.mcpTools as MCPTool[]) || [];
                      const toolExists = currentMCPTools.some(t => 
                        t.id === dropData.tool.id && t.serverId === dropData.tool.serverId
                      );
                      
                      if (!toolExists) {
                        const updatedMCPTools = [...currentMCPTools, dropData.tool];
                        updateNodeData(targetNode.id, { mcpTools: updatedMCPTools });
                      }
                    }
                  }
                } catch (error) {
                  console.error('Failed to parse drop data:', error);
                }
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
            }}
          >
            <Background 
              color={mode === 'procurement' ? "rgba(249, 115, 22, 0.1)" 
                   : mode === 'forecasting' ? "rgba(245, 158, 11, 0.1)"
                   : mode === 'recruitment' ? "rgba(217, 119, 6, 0.1)"
                   : "rgba(100, 200, 255, 0.1)"} 
              gap={40}
              size={1}
              style={{ backgroundColor: 'transparent', opacity: 0.3 }}
            />
            <Controls 
              className={`bg-slate-800/40 backdrop-blur-lg shadow-lg rounded-xl ${
                mode === 'procurement' ? 'border border-orange-400/20' 
                : mode === 'forecasting' ? 'border border-yellow-400/20'
                : mode === 'recruitment' ? 'border border-amber-400/20'
                : 'border border-cyan-400/20'
              }`}
              style={{ 
                background: 'rgba(30, 41, 59, 0.8)', 
                border: mode === 'procurement' 
                  ? '1px solid rgba(249, 115, 22, 0.2)' 
                  : mode === 'forecasting'
                  ? '1px solid rgba(245, 158, 11, 0.2)'
                  : mode === 'recruitment'
                  ? '1px solid rgba(217, 119, 6, 0.2)'
                  : '1px solid rgba(34, 211, 238, 0.2)',
                zIndex: 1000
              }}
            />
            <MiniMap 
              className={`bg-slate-800/40 backdrop-blur-lg shadow-lg rounded-xl ${
                mode === 'procurement' ? 'border border-orange-400/20' 
                : mode === 'forecasting' ? 'border border-yellow-400/20'
                : mode === 'recruitment' ? 'border border-amber-400/20'
                : 'border border-cyan-400/20'
              }`}
              style={{ 
                background: 'rgba(30, 41, 59, 0.8)', 
                border: mode === 'procurement' 
                  ? '1px solid rgba(249, 115, 22, 0.2)' 
                  : mode === 'forecasting'
                  ? '1px solid rgba(245, 158, 11, 0.2)'
                  : mode === 'recruitment'
                  ? '1px solid rgba(217, 119, 6, 0.2)'
                  : '1px solid rgba(34, 211, 238, 0.2)',
                zIndex: 1000
              }}
              nodeColor={mode === 'procurement' ? "#f97316" 
                        : mode === 'forecasting' ? "#f59e0b"
                        : mode === 'recruitment' ? "#d97706"
                        : "#22d3ee"}
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
          
          {/* Empty State Message */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-800/40 rounded-full flex items-center justify-center border-2 border-dashed border-slate-600">
                  <Plus className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-300 mb-2">Start Building Your Workflow</h3>
                <p className="text-slate-500 max-w-md">
                  Drag agents from the palette to create your multi-agent orchestration. 
                  Connect them to define relationships and data flow.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Properties Panel - Using CVM Style */}
        {showProperties && selectedNode && (
          <TelcoCvmPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};