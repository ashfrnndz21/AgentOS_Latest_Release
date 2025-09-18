import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Node } from '@xyflow/react';
import { 
  X, 
  Bot, 
  Settings, 
  Shield, 
  Database,
  Brain,
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Search,
  Code,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  Wrench,
  MessageSquare,
  Lock,
  UserCheck,
  GraduationCap,
  Award,
  Users
} from 'lucide-react';

interface TelcoCvmPropertiesPanelProps {
  node: Node;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: any) => void;
}

interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AgentMetrics {
  success?: number;
  responseTime?: number;
}

interface NodeData {
  label: string;
  description: string;
  agentType: string;
  status: string;
  size?: string;
  entries?: number;
  violations?: number;
  lastCheck?: string;
  metrics?: AgentMetrics;
  config?: AgentConfig;
  dataSources?: string;
  refreshInterval?: number;
  segmentTypes?: string;
  minSegmentSize?: number;
  channels?: string;
  budgetLimit?: number;
  riskThreshold?: number;
  predictionWindow?: number;
  prompt?: string;
  tools?: string[];
  memory?: {
    type?: string;
    size?: string;
    retention?: string;
  };
  guardrails?: string[];
}

const agentIcons: Record<string, any> = {
  'customer-data-agent': Database,
  'segmentation-agent': Target,
  'campaign-optimizer': TrendingUp,
  'churn-predictor': AlertTriangle,
  'revenue-optimizer': DollarSign,
  'performance-analyst': BarChart3,
  'cvm-memory': Brain,
  'compliance-guardrail': Shield,
  'insight-engine': Search,
  // Procurement agent types
  'supplier-research-specialist': Search,
  'rfp-generation-specialist': FileText,
  'contract-negotiation-specialist': MessageSquare,
  'audit-monitoring-specialist': BarChart3,
  'Risk Management Sub-Agent': AlertTriangle,
  'Operations Sub-Agent': Zap,
  'Central Orchestration Agent': Bot,
  // Forecasting agent types
  'demand-forecasting-specialist': TrendingUp,
  'market-analysis-specialist': BarChart3,
  'scenario-modeling-specialist': Target,
  'risk-assessment-specialist': AlertTriangle,
  'optimization-specialist': Zap,
  'sensitivity-analysis-specialist': Activity,
  'forecasting-orchestrator': Bot,
  'data-processor': Code,
  'visualization-engine': BarChart3,
  'external-data-connector': Search,
  // Recruitment agent types
  'talent-sourcing-specialist': Search,
  'ai-screening-specialist': UserCheck,
  'interview-coordination-specialist': MessageSquare,
  'onboarding-specialist': GraduationCap,
  'career-development-specialist': TrendingUp,
  'performance-tracking-specialist': Award,
  'talent-orchestrator': Bot,
  'candidate-database': Users,
  'skills-matcher': Target,
  'document-processor': FileText,
  'performance-analytics-specialist': BarChart3,
  'culture-fit-analyzer': Shield,
  'compensation-advisor': DollarSign,
  'default': Bot
};

export const TelcoCvmPropertiesPanel: React.FC<TelcoCvmPropertiesPanelProps> = ({
  node,
  onClose,
  onUpdateNode
}) => {
  const [localData, setLocalData] = useState<NodeData>(node.data as any);
  const IconComponent = agentIcons[localData.agentType] || agentIcons.default;

  const handleSave = () => {
    onUpdateNode(node.id, localData);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-400/30';
      case 'inactive': return 'text-red-400 bg-red-900/20 border-red-400/30';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  const getDefaultPrompt = (agentType: string) => {
    const prompts: Record<string, string> = {
      'customer-journey-mapper': 'You are a Customer Journey Mapping agent specialized in analyzing customer touchpoints and interactions. Map comprehensive customer journeys, identify pain points, and optimize experience flows.',
      'clv-prediction-engine': 'You are a Customer Lifetime Value prediction agent. Analyze customer data to predict CLV, identify high-value segments, and recommend retention strategies.',
      'next-best-action': 'You are a Next Best Action recommendation agent. Analyze customer context and behavior to suggest optimal actions that maximize engagement and revenue.',
      'churn-prevention': 'You are a Churn Prevention agent. Identify at-risk customers, analyze churn indicators, and recommend proactive retention strategies.',
      'revenue-optimization': 'You are a Revenue Optimization agent. Analyze pricing strategies, upselling opportunities, and revenue streams to maximize customer value.',
      'campaign-performance': 'You are a Campaign Performance analysis agent. Track campaign metrics, analyze effectiveness, and optimize marketing strategies.',
      'customer-sentiment': 'You are a Customer Sentiment analysis agent. Process customer feedback, social media, and interactions to gauge sentiment and satisfaction.',
      'data-enrichment': 'You are a Data Enrichment agent. Collect, validate, and enhance customer data from multiple sources to create comprehensive profiles.',
      // Procurement agent prompts
      'supplier-research-specialist': 'You are a Supplier Research Specialist for hydrogen supply chain optimization. Research and vet suppliers from Air Liquide\'s network, assess capabilities, and ensure quality standards.',
      'rfp-generation-specialist': 'You are an RFP Generation Specialist for hydrogen procurement. Create detailed RFPs with technical specifications, ensure regulatory compliance, and maintain documentation standards.',
      'contract-negotiation-specialist': 'You are a Contract Negotiation Specialist for hydrogen supply contracts. Negotiate optimal terms, ensure legal compliance, and maximize cost savings while maintaining supply quality.',
      'audit-monitoring-specialist': 'You are an Audit & Monitoring Specialist for hydrogen supply chain. Audit invoices, track deliveries, monitor quality metrics, and ensure compliance with delivery standards.',
      'Risk Management Sub-Agent': 'You are a Risk & Contingency Specialist monitoring external data for supplier issues and managing backup sourcing for hydrogen supply.',
      'Operations Sub-Agent': 'You are a Logistics & Transition Specialist managing delivery rerouting and supplier transitions without human intervention.',
      'Central Orchestration Agent': 'You are a Central Orchestration Agent that breaks down "optimize hydrogen supply" into manageable tasks and delegates to specialized sub-agents.',
      // Forecasting agent prompts
      'demand-forecasting-specialist': 'You are a Demand Forecasting Specialist using advanced ML models and market data to predict future demand patterns. Analyze historical trends, seasonal variations, and market indicators to generate accurate forecasts.',
      'market-analysis-specialist': 'You are a Market Analysis Specialist focused on analyzing market trends, competitive landscape, and economic indicators. Provide insights on market dynamics, competitor strategies, and growth opportunities.',
      'scenario-modeling-specialist': 'You are a Scenario Modeling Specialist creating and evaluating multiple business scenarios. Build comprehensive models to assess different strategic options and their potential outcomes.',
      'risk-assessment-specialist': 'You are a Risk Assessment Specialist identifying and quantifying business risks across different scenarios. Analyze probability distributions, impact assessments, and risk mitigation strategies.',
      'optimization-specialist': 'You are an Optimization Specialist focused on resource allocation and strategic optimization. Use mathematical models and algorithms to find optimal solutions for complex business problems.',
      'sensitivity-analysis-specialist': 'You are a Sensitivity Analysis Specialist analyzing parameter sensitivity and impact on forecasting models. Identify key variables and their influence on outcomes.',
      'forecasting-orchestrator': 'You are a Forecasting Orchestrator coordinating all forecasting and scenario analysis tasks. Manage workflow between specialists and ensure comprehensive analysis coverage.',
      'data-processor': 'You are a Data Processor specialized in cleaning, transforming, and preparing data for forecasting models. Ensure data quality and consistency across all analysis workflows.',
      'visualization-engine': 'You are a Visualization Engine creating compelling charts, dashboards, and visual reports for forecasting results. Transform complex data into clear, actionable insights.',
      'external-data-connector': 'You are an External Data Connector integrating market data, economic indicators, and external sources into forecasting workflows. Ensure real-time data availability and accuracy.',
      // Recruitment agent prompts
      'talent-sourcing-specialist': 'You are a Talent Sourcing Specialist identifying and sourcing top talent from multiple channels. Use advanced search techniques, social media, and professional networks to find qualified candidates.',
      'ai-screening-specialist': 'You are an AI Screening Specialist performing automated resume screening and candidate evaluation. Analyze resumes, assess qualifications, and rank candidates based on job requirements.',
      'interview-coordination-specialist': 'You are an Interview Coordination Specialist managing interview scheduling and coordination. Optimize interview processes, coordinate with stakeholders, and ensure smooth candidate experience.',
      'onboarding-specialist': 'You are an Onboarding Specialist streamlining new employee onboarding processes. Create personalized onboarding plans, track progress, and ensure successful integration.',
      'career-development-specialist': 'You are a Career Development Specialist managing career paths and employee development. Design development programs, track career progression, and identify growth opportunities.',
      'performance-tracking-specialist': 'You are a Performance Tracking Specialist monitoring and analyzing employee performance metrics. Track KPIs, identify trends, and provide performance insights.',
      'talent-orchestrator': 'You are a Talent Management Orchestrator coordinating all talent management processes. Manage end-to-end recruitment workflows and ensure optimal talent acquisition and retention.',
      'candidate-database': 'You are a Candidate Database managing candidate profiles and application data. Maintain comprehensive candidate records and enable efficient talent pool management.',
      'skills-matcher': 'You are a Skills Matching Engine matching candidate skills with job requirements. Use advanced algorithms to identify best-fit candidates for specific roles.',
      'document-processor': 'You are a Document Processor handling resumes, applications, and HR documents. Extract key information, standardize formats, and enable efficient document management.',
      'performance-analytics-specialist': 'You are a Performance Analytics Specialist analyzing employee performance and engagement. Track metrics, identify trends, and provide insights for talent management decisions.',
      'culture-fit-analyzer': 'You are a Culture Fit Analyzer evaluating cultural alignment and team fit. Assess personality traits, values, and work styles to ensure cultural compatibility.',
      'compensation-advisor': 'You are a Compensation Advisor providing market-based compensation recommendations. Analyze market data, internal equity, and performance metrics to suggest competitive compensation packages.'
    };
    return prompts[agentType] || 'You are an AI agent designed to assist with multi-agent workflow tasks.';
  };

  const getAvailableTools = (agentType: string) => {
    const tools: Record<string, string[]> = {
      'customer-journey-mapper': ['Journey Analyzer', 'Touchpoint Tracker', 'Experience Mapper', 'Pain Point Detector'],
      'clv-prediction-engine': ['ML Predictor', 'Cohort Analyzer', 'Value Calculator', 'Segment Profiler'],
      'next-best-action': ['Recommendation Engine', 'Context Analyzer', 'Action Optimizer', 'Engagement Tracker'],
      'churn-prevention': ['Risk Scorer', 'Pattern Detector', 'Retention Calculator', 'Alert System'],
      'revenue-optimization': ['Pricing Optimizer', 'Upsell Detector', 'Revenue Tracker', 'Opportunity Finder'],
      'campaign-performance': ['Metrics Tracker', 'A/B Tester', 'ROI Calculator', 'Performance Analyzer'],
      'customer-sentiment': ['Sentiment Analyzer', 'Text Processor', 'Social Monitor', 'Feedback Aggregator'],
      'data-enrichment': ['Data Validator', 'Source Integrator', 'Profile Builder', 'Quality Checker'],
      // Procurement agent tools
      'supplier-research-specialist': ['Supplier Network Analysis', 'Capability Assessment', 'Financial Vetting', 'Geographic Coverage'],
      'rfp-generation-specialist': ['Technical Specification Generation', 'RFP Templates', 'Compliance Documentation', 'Requirement Analysis'],
      'contract-negotiation-specialist': ['Contract Analysis', 'Price Negotiation', 'Terms Optimization', 'Legal Review'],
      'audit-monitoring-specialist': ['Invoice Auditing', 'Delivery Tracking', 'Quality Monitoring', 'Performance Analytics'],
      'Risk Management Sub-Agent': ['External Data Monitoring', 'Risk Detection', 'Backup Sourcing', 'Contingency Planning'],
      'Operations Sub-Agent': ['Route Optimization', 'Delivery Rerouting', 'Transition Management', 'Logistics Coordination'],
      'Central Orchestration Agent': ['Task Delegation', 'Goal Decomposition', 'Sub-Agent Coordination', 'Strategic Planning'],
      // Forecasting agent tools
      'demand-forecasting-specialist': ['ML Forecasting Models', 'Time Series Analysis', 'Seasonal Decomposition', 'Trend Analysis'],
      'market-analysis-specialist': ['Market Research Tools', 'Competitive Intelligence', 'Economic Indicators', 'Industry Analysis'],
      'scenario-modeling-specialist': ['Monte Carlo Simulation', 'Decision Trees', 'Scenario Builder', 'What-If Analysis'],
      'risk-assessment-specialist': ['Risk Modeling', 'Probability Analysis', 'Impact Assessment', 'Risk Quantification'],
      'optimization-specialist': ['Linear Programming', 'Genetic Algorithms', 'Resource Optimizer', 'Constraint Solver'],
      'sensitivity-analysis-specialist': ['Parameter Analysis', 'Sensitivity Testing', 'Tornado Charts', 'Impact Modeling'],
      'forecasting-orchestrator': ['Workflow Coordination', 'Task Scheduling', 'Result Aggregation', 'Quality Control'],
      'data-processor': ['Data Cleaning', 'ETL Pipeline', 'Data Validation', 'Format Conversion'],
      'visualization-engine': ['Chart Generator', 'Dashboard Builder', 'Report Creator', 'Interactive Plots'],
      'external-data-connector': ['API Integration', 'Data Feeds', 'Market Data', 'Real-time Sync'],
      // Recruitment agent tools
      'talent-sourcing-specialist': ['LinkedIn Sourcing', 'Boolean Search', 'Social Media Mining', 'Talent Pool Analysis'],
      'ai-screening-specialist': ['Resume Parser', 'Skills Assessment', 'Candidate Ranking', 'Qualification Matcher'],
      'interview-coordination-specialist': ['Calendar Integration', 'Interview Scheduler', 'Stakeholder Coordination', 'Candidate Communication'],
      'onboarding-specialist': ['Onboarding Workflows', 'Document Management', 'Progress Tracking', 'Integration Planning'],
      'career-development-specialist': ['Career Path Planner', 'Skills Gap Analysis', 'Development Programs', 'Growth Tracking'],
      'performance-tracking-specialist': ['Performance Analytics', 'KPI Tracking', 'Trend Analysis', 'Report Generation'],
      'talent-orchestrator': ['Workflow Orchestration', 'Process Automation', 'Stakeholder Management', 'Quality Control'],
      'candidate-database': ['Profile Management', 'Data Storage', 'Search & Filter', 'Record Maintenance'],
      'skills-matcher': ['Skills Analysis', 'Job Matching', 'Compatibility Scoring', 'Recommendation Engine'],
      'document-processor': ['Document Parser', 'Data Extraction', 'Format Standardization', 'Content Analysis'],
      'performance-analytics-specialist': ['Performance Metrics', 'Engagement Surveys', 'Analytics Dashboard', 'Trend Analysis'],
      'culture-fit-analyzer': ['Personality Assessment', 'Culture Mapping', 'Team Dynamics', 'Fit Scoring'],
      'compensation-advisor': ['Market Data', 'Salary Benchmarking', 'Equity Analysis', 'Compensation Modeling']
    };
    return tools[agentType] || localData.tools || ['Generic Tool', 'Data Processor', 'Analytics Engine', 'Report Generator'];
  };

  const getGuardrails = (agentType: string) => {
    const guardrails: Record<string, string[]> = {
      'customer-journey-mapper': ['PII Protection', 'Data Anonymization', 'Access Control', 'Journey Privacy'],
      'clv-prediction-engine': ['Bias Detection', 'Fair Modeling', 'Data Quality', 'Prediction Bounds'],
      'next-best-action': ['Ethical Recommendations', 'Customer Consent', 'Action Validation', 'Outcome Monitoring'],
      'churn-prevention': ['Privacy Compliance', 'Intervention Ethics', 'Data Retention', 'Customer Rights'],
      'revenue-optimization': ['Fair Pricing', 'Customer Value', 'Transparent Offers', 'Revenue Ethics'],
      'campaign-performance': ['Audience Protection', 'Content Moderation', 'Targeting Ethics', 'Performance Bounds'],
      'customer-sentiment': ['Sentiment Privacy', 'Content Security', 'Bias Monitoring', 'Response Ethics'],
      'data-enrichment': ['Source Validation', 'Data Accuracy', 'Privacy Shield', 'Quality Assurance'],
      // Procurement agent guardrails
      'supplier-research-specialist': ['Supplier Quality Standards', 'Financial Stability Checks', 'Network Compliance', 'Data Privacy'],
      'rfp-generation-specialist': ['Technical Accuracy', 'Regulatory Compliance', 'Specification Standards', 'Documentation Security'],
      'contract-negotiation-specialist': ['Legal Compliance', 'Budget Constraints', 'Contract Standards', 'Negotiation Ethics'],
      'audit-monitoring-specialist': ['Audit Standards', 'Quality Thresholds', 'Delivery Requirements', 'Data Accuracy'],
      'Risk Management Sub-Agent': ['Risk Thresholds', 'Supply Continuity', 'Emergency Protocols', 'Data Security'],
      'Operations Sub-Agent': ['Delivery Standards', 'Safety Protocols', 'Operational Efficiency', 'Logistics Compliance'],
      'Central Orchestration Agent': ['Supply Continuity', 'Cost Optimization', 'Quality Assurance', 'Strategic Oversight'],
      // Forecasting agent guardrails
      'demand-forecasting-specialist': ['Model Accuracy', 'Data Quality', 'Forecast Bounds', 'Bias Detection'],
      'market-analysis-specialist': ['Source Reliability', 'Analysis Objectivity', 'Data Privacy', 'Competitive Ethics'],
      'scenario-modeling-specialist': ['Model Validation', 'Scenario Realism', 'Assumption Tracking', 'Outcome Bounds'],
      'risk-assessment-specialist': ['Risk Calibration', 'Assessment Accuracy', 'Probability Bounds', 'Impact Validation'],
      'optimization-specialist': ['Solution Feasibility', 'Constraint Validation', 'Optimization Bounds', 'Resource Limits'],
      'sensitivity-analysis-specialist': ['Parameter Bounds', 'Analysis Scope', 'Result Validation', 'Impact Limits'],
      'forecasting-orchestrator': ['Workflow Integrity', 'Quality Assurance', 'Result Consistency', 'Process Compliance'],
      'data-processor': ['Data Quality', 'Processing Accuracy', 'Format Validation', 'Privacy Protection'],
      'visualization-engine': ['Visual Accuracy', 'Chart Standards', 'Color Accessibility', 'Data Integrity'],
      'external-data-connector': ['Data Validation', 'Source Verification', 'Update Frequency', 'Access Control'],
      // Recruitment agent guardrails
      'talent-sourcing-specialist': ['Privacy Compliance', 'Sourcing Ethics', 'Data Protection', 'Candidate Consent'],
      'ai-screening-specialist': ['Bias Prevention', 'Fair Assessment', 'Privacy Protection', 'Screening Standards'],
      'interview-coordination-specialist': ['Scheduling Ethics', 'Candidate Experience', 'Process Fairness', 'Communication Standards'],
      'onboarding-specialist': ['Onboarding Standards', 'Privacy Protection', 'Process Compliance', 'Integration Ethics'],
      'career-development-specialist': ['Development Fairness', 'Growth Equity', 'Performance Standards', 'Career Ethics'],
      'performance-tracking-specialist': ['Performance Privacy', 'Tracking Ethics', 'Data Security', 'Assessment Fairness'],
      'talent-orchestrator': ['Process Integrity', 'Workflow Compliance', 'Quality Assurance', 'Orchestration Ethics'],
      'candidate-database': ['Data Privacy', 'Information Security', 'Access Control', 'Record Integrity'],
      'skills-matcher': ['Matching Fairness', 'Algorithm Transparency', 'Bias Prevention', 'Scoring Ethics'],
      'document-processor': ['Document Privacy', 'Processing Security', 'Data Accuracy', 'Content Protection'],
      'performance-analytics-specialist': ['Performance Fairness', 'Metric Accuracy', 'Privacy Protection', 'Bias Monitoring'],
      'culture-fit-analyzer': ['Cultural Sensitivity', 'Bias Prevention', 'Diversity Inclusion', 'Fair Evaluation'],
      'compensation-advisor': ['Pay Equity', 'Market Fairness', 'Compensation Transparency', 'Legal Compliance']
    };
    return guardrails[agentType] || localData.guardrails || ['Data Protection', 'Privacy Compliance', 'Security Control', 'Ethics Monitor'];
  };

  const getPerformanceMetrics = () => {
    if (node.type === 'memory') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Storage Size</div>
            <div className="text-lg font-semibold text-white">{localData.size || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Entries</div>
            <div className="text-lg font-semibold text-white">{localData.entries?.toLocaleString() || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (node.type === 'guardrail') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Violations</div>
            <div className="text-lg font-semibold text-green-400">{localData.violations || 0}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Last Check</div>
            <div className="text-sm text-white">
              {localData.lastCheck ? new Date(localData.lastCheck).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>
      );
    }

    // Handle procurement-specific metrics
    if (localData.agentType === 'supplier-research-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Suppliers Vetted</div>
            <div className="text-lg font-semibold text-green-400">{localData.suppliersVetted?.toLocaleString() || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Qualified</div>
            <div className="text-lg font-semibold text-blue-400">{localData.qualifiedSuppliers || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'contract-negotiation-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Avg Savings</div>
            <div className="text-lg font-semibold text-green-400">{localData.avgSavings || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Success Rate</div>
            <div className="text-lg font-semibold text-blue-400">{localData.successRate || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'audit-monitoring-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Invoices Audited</div>
            <div className="text-lg font-semibold text-green-400">{localData.invoicesAudited?.toLocaleString() || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Audit Accuracy</div>
            <div className="text-lg font-semibold text-blue-400">{localData.auditAccuracy || 'N/A'}</div>
          </div>
        </div>
      );
    }

    // Handle forecasting-specific metrics
    if (localData.agentType === 'demand-forecasting-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Forecast Accuracy</div>
            <div className="text-lg font-semibold text-green-400">{localData.forecastAccuracy || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Models Trained</div>
            <div className="text-lg font-semibold text-blue-400">{localData.modelsTrained || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'scenario-modeling-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Scenarios Created</div>
            <div className="text-lg font-semibold text-green-400">{localData.scenariosCreated || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Model Accuracy</div>
            <div className="text-lg font-semibold text-blue-400">{localData.modelAccuracy || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'market-analysis-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Reports Generated</div>
            <div className="text-lg font-semibold text-green-400">{localData.reportsGenerated || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Data Sources</div>
            <div className="text-lg font-semibold text-blue-400">{localData.dataSources || 'N/A'}</div>
          </div>
        </div>
      );
    }

    // Handle recruitment-specific metrics
    if (localData.agentType === 'talent-sourcing-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Candidates Sourced</div>
            <div className="text-lg font-semibold text-green-400">{localData.candidatesSourced || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Quality Score</div>
            <div className="text-lg font-semibold text-blue-400">{localData.qualityScore || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'ai-screening-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Resumes Screened</div>
            <div className="text-lg font-semibold text-green-400">{localData.resumesScreened || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Screening Accuracy</div>
            <div className="text-lg font-semibold text-blue-400">{localData.screeningAccuracy || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'performance-tracking-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Employees Tracked</div>
            <div className="text-lg font-semibold text-green-400">{localData.employeesTracked || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Performance Score</div>
            <div className="text-lg font-semibold text-blue-400">{localData.performanceScore || 'N/A'}</div>
          </div>
        </div>
      );
    }

    // Handle recruitment-specific metrics
    if (localData.agentType === 'talent-sourcing-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Candidates Sourced</div>
            <div className="text-lg font-semibold text-green-400">{localData.candidatesSourced || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Quality Score</div>
            <div className="text-lg font-semibold text-blue-400">{localData.qualityScore || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'ai-screening-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Resumes Screened</div>
            <div className="text-lg font-semibold text-green-400">{localData.resumesScreened || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Match Accuracy</div>
            <div className="text-lg font-semibold text-blue-400">{localData.matchAccuracy || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (localData.agentType === 'performance-analytics-specialist') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Employees Tracked</div>
            <div className="text-lg font-semibold text-green-400">{localData.employeesTracked || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Engagement Score</div>
            <div className="text-lg font-semibold text-blue-400">{localData.engagementScore || 'N/A'}</div>
          </div>
        </div>
      );
    }

    // Default metrics for other agents
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/30 p-3 rounded-lg">
          <div className="text-sm text-slate-400">Success Rate</div>
          <div className="text-lg font-semibold text-green-400">{localData.metrics?.success || 0}%</div>
        </div>
        <div className="bg-slate-700/30 p-3 rounded-lg">
          <div className="text-sm text-slate-400">Avg Response</div>
          <div className="text-lg font-semibold text-blue-400">{localData.metrics?.responseTime || 0}ms</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-green-400/20 flex flex-col text-white overflow-y-auto">
      <div className="p-4 border-b border-green-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/30 rounded-lg">
              <IconComponent className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{localData.label}</h3>
              <Badge className={getStatusColor(localData.status)}>
                {localData.status}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-700/30">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="prompt" className="text-xs">Prompt</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">Memory</TabsTrigger>
            <TabsTrigger value="guardrails" className="text-xs">Guards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="label">Agent Name</Label>
              <Input
                id="label"
                value={localData.label}
                onChange={(e) => setLocalData({...localData, label: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description}
                onChange={(e) => setLocalData({...localData, description: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <Separator className="bg-slate-700" />

            <div>
              <Label className="text-sm font-medium text-slate-300">Performance Metrics</Label>
              <div className="mt-2">
                {getPerformanceMetrics()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-green-400" />
              <Label className="text-sm font-medium text-slate-300">System Prompt</Label>
            </div>
            <Textarea
              value={localData.prompt || getDefaultPrompt(localData.agentType)}
              onChange={(e) => setLocalData({...localData, prompt: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              placeholder="Enter the system prompt for this agent..."
            />
            <div className="text-xs text-slate-400">
              Define the agent's role, capabilities, and behavior patterns.
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4 text-blue-400" />
              <Label className="text-sm font-medium text-slate-300">Available Tools</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getAvailableTools(localData.agentType).map((tool, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded border border-slate-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">{tool}</span>
                </div>
              ))}
            </div>
            <Separator className="bg-slate-700" />
            <div>
              <Label htmlFor="model" className="text-sm">LLM Model</Label>
              <Input
                id="model"
                value={localData.config?.model || 'gpt-4'}
                onChange={(e) => setLocalData({
                  ...localData, 
                  config: {...(localData.config || {}), model: e.target.value}
                })}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="temperature" className="text-xs">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={localData.config?.temperature || 0.3}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    config: {...(localData.config || {}), temperature: parseFloat(e.target.value)}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxTokens" className="text-xs">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={localData.config?.maxTokens || 2000}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    config: {...(localData.config || {}), maxTokens: parseInt(e.target.value)}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-400" />
              <Label className="text-sm font-medium text-slate-300">Memory Configuration</Label>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="memoryType" className="text-sm">Memory Type</Label>
                <Input
                  id="memoryType"
                  value={localData.memory?.type || 'Vector Store'}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    memory: {...(localData.memory || {type: 'Vector Store', size: '512MB', retention: '30 days'}), type: e.target.value}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memorySize" className="text-sm">Size</Label>
                  <Input
                    id="memorySize"
                    value={localData.memory?.size || '512MB'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Vector Store', size: '512MB', retention: '30 days'}), size: e.target.value}
                    })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retention" className="text-sm">Retention</Label>
                  <Input
                    id="retention"
                    value={localData.memory?.retention || '30 days'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Vector Store', size: '512MB', retention: '30 days'}), retention: e.target.value}
                    })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Memory Usage</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-600 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
                <span className="text-sm text-slate-300">68%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guardrails" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-yellow-400" />
              <Label className="text-sm font-medium text-slate-300">Safety Guardrails</Label>
            </div>
            <div className="space-y-2">
              {getGuardrails(localData.agentType).map((guardrail, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-yellow-400" />
                    <span className="text-sm text-slate-300">{guardrail}</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              ))}
            </div>
            <Separator className="bg-slate-700" />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <Shield className="h-5 w-5 text-green-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Violations</div>
                <div className="text-lg font-bold text-green-400">{localData.violations || 0}</div>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <CheckCircle className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Compliance</div>
                <div className="text-lg font-bold text-blue-400">98.7%</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
            Save Changes
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 border-slate-600 text-slate-300">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};